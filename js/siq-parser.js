/**
 * Парсер пакетов SIGame (.siq) → формат раундов Свояк.
 * .siq — ZIP-архив с content.xml и медиа (Images/, Audio/, Video/).
 */
const SiqParser = (() => {
    const IMAGE_EXT = /\.(jpe?g|png|gif|webp|svg|avif)$/i;
    const MEDIA_FOLDERS = ['Images', 'Audio', 'Video', 'Html', 'images', 'audio', 'video'];

    function localName(el) {
        if (!el) return '';
        return (el.localName || String(el.tagName || '').replace(/^[^:]+:/, '')).toLowerCase();
    }

    function attr(el, name) {
        return el?.getAttribute?.(name) || '';
    }

    function isTrue(val) {
        return /^true$/i.test(String(val || ''));
    }

    function stripBom(text) {
        return text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
    }

    function childElements(parent, name) {
        if (!parent) return [];
        const want = name.toLowerCase();
        return Array.from(parent.children || []).filter(el => localName(el) === want);
    }

    function firstChild(parent, name) {
        return childElements(parent, name)[0] || null;
    }

    function decodeXmlText(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.innerHTML = text
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&');
        return (div.textContent || text).replace(/\r\n?/g, '\n').trim();
    }

    function escapeUriString(str) {
        return encodeURI(str)
            .replace(/#/g, '%23')
            .replace(/\?/g, '%3F');
    }

    function blobToDataUrl(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Не удалось прочитать медиафайл'));
            reader.readAsDataURL(blob);
        });
    }

    function zipEntryBaseName(path) {
        const parts = path.split('/');
        return parts[parts.length - 1] || path;
    }

    function registerMediaKey(map, key, dataUrl) {
        if (!key) return;
        map.set(key, dataUrl);
        map.set(key.replace(/\\/g, '/'), dataUrl);
        try {
            map.set(decodeURIComponent(key), dataUrl);
        } catch { /* ignore */ }
    }

    async function buildMediaMap(zip, onProgress) {
        const map = new Map();
        const entries = Object.values(zip.files).filter(f => !f.dir);
        let done = 0;

        for (const entry of entries) {
            const path = entry.name.replace(/\\/g, '/');
            if (!IMAGE_EXT.test(path)) {
                done++;
                continue;
            }
            const blob = await entry.async('blob');
            const dataUrl = await blobToDataUrl(blob);
            registerMediaKey(map, path, dataUrl);
            registerMediaKey(map, zipEntryBaseName(path), dataUrl);

            const folder = path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : '';
            const fileName = zipEntryBaseName(path);
            registerMediaKey(map, `${folder}/${escapeUriString(fileName)}`, dataUrl);
            registerMediaKey(map, `Images/${fileName}`, dataUrl);
            registerMediaKey(map, `Images/${escapeUriString(fileName)}`, dataUrl);

            done++;
            if (onProgress && done % 3 === 0) {
                onProgress(`Медиа: ${done}/${entries.length}`);
            }
        }

        return map;
    }

    function resolveMediaRef(mediaMap, ref) {
        if (!ref) return '';
        const clean = ref.replace(/^@+/, '').trim();
        const candidates = [
            clean,
            `Images/${clean}`,
            `images/${clean}`,
            escapeUriString(clean),
            `Images/${escapeUriString(clean)}`
        ];

        for (const folder of MEDIA_FOLDERS) {
            candidates.push(`${folder}/${clean}`);
            candidates.push(`${folder}/${escapeUriString(clean)}`);
        }

        for (const key of candidates) {
            if (mediaMap.has(key)) return mediaMap.get(key);
        }

        for (const [key, value] of mediaMap) {
            if (key.endsWith(`/${clean}`) || key.endsWith(clean)) return value;
        }

        return '';
    }

    function parseContentItems(container, mediaMap) {
        const result = { textParts: [], images: [], notes: [] };
        if (!container) return result;

        const items = localName(container) === 'item'
            ? [container]
            : childElements(container, 'item');

        items.forEach(item => {
            const type = attr(item, 'type') || 'text';
            const isRef = isTrue(attr(item, 'isRef'));
            let value = decodeXmlText(item.textContent || '');

            if (isRef && value.startsWith('@')) {
                value = value.slice(1);
            }

            if (type === 'text' || type === 'html') {
                if (value) result.textParts.push(value);
            } else if (type === 'image') {
                if (isRef) {
                    const src = resolveMediaRef(mediaMap, value);
                    if (src) result.images.push(src);
                    else if (value) result.notes.push(`[картинка: ${value}]`);
                } else if (value) {
                    result.textParts.push(value);
                }
            } else if (isRef && value) {
                result.notes.push(`[${type}: ${value}]`);
            } else if (value) {
                result.textParts.push(value);
            }
        });

        return result;
    }

    function parseSimpleParam(paramEl) {
        return decodeXmlText(paramEl.textContent || '');
    }

    function parseParam(paramEl, mediaMap) {
        const type = attr(paramEl, 'type') || 'simple';
        const name = attr(paramEl, 'name');

        if (type === 'content') {
            const content = parseContentItems(paramEl, mediaMap);
            return { name, type, ...content };
        }

        if (type === 'group') {
            const nested = childElements(paramEl, 'param').map(p => parseParam(p, mediaMap));
            return { name, type, nested };
        }

        const value = parseSimpleParam(paramEl);
        const isRef = isTrue(attr(paramEl, 'isRef'));
        return { name, type, value, isRef };
    }

    function contentToFields(parsed, mediaMap) {
        const textParts = [...(parsed.textParts || [])];
        const images = [...(parsed.images || [])];
        const notes = [...(parsed.notes || [])];

        if (parsed.nested) {
            parsed.nested.forEach(n => {
                const sub = contentToFields(n, mediaMap);
                textParts.push(...sub.textParts);
                images.push(...sub.images);
                notes.push(...sub.notes);
            });
        }

        if (parsed.type === 'simple' && parsed.value) {
            if (parsed.isRef && IMAGE_EXT.test(parsed.value)) {
                const src = resolveMediaRef(mediaMap, parsed.value);
                if (src) images.push(src);
                else notes.push(`[медиа: ${parsed.value}]`);
            } else {
                textParts.push(parsed.value);
            }
        }

        return {
            textParts,
            images,
            notes
        };
    }

    function fieldsToQuestionAnswer(fields, role) {
        const text = [...fields.textParts, ...fields.notes].filter(Boolean).join('\n').trim();
        if (role === 'answer') {
            return { text, image: '', answerImage: fields.images[0] || '' };
        }
        return { text, image: fields.images[0] || '', answerImage: '' };
    }

    function parseScenario(scenarioEl, mediaMap) {
        const question = { textParts: [], images: [], notes: [] };
        const answer = { textParts: [], images: [], notes: [] };
        let part = 'question';

        childElements(scenarioEl, 'atom').forEach(atom => {
            const type = attr(atom, 'type') || 'say';
            if (type === 'marker') {
                part = 'answer';
                return;
            }

            let value = decodeXmlText(atom.textContent || '');
            const isRef = value.startsWith('@');
            if (isRef) value = value.slice(1);

            const bucket = part === 'question' ? question : answer;

            if (type === 'image' || (isRef && IMAGE_EXT.test(value))) {
                const src = isRef ? resolveMediaRef(mediaMap, value) : value;
                if (src) bucket.images.push(src);
                else if (value) bucket.notes.push(`[картинка: ${value}]`);
            } else if (type === 'audio' || type === 'video' || type === 'voice') {
                if (value) bucket.notes.push(`[${type}: ${value}]`);
            } else if (value) {
                bucket.textParts.push(value);
            }
        });

        return { question, answer };
    }

    function getRightAnswers(questionEl) {
        const rightEl = firstChild(questionEl, 'right');
        if (!rightEl) return [];
        return childElements(rightEl, 'answer')
            .map(a => decodeXmlText(a.textContent || ''))
            .filter(Boolean);
    }

    function parseQuestionParams(questionEl, mediaMap) {
        const paramsEl = firstChild(questionEl, 'params');
        let questionFields = { textParts: [], images: [], notes: [] };
        let answerFields = { textParts: [], images: [], notes: [] };

        if (paramsEl) {
            childElements(paramsEl, 'param').forEach(param => {
                const parsed = parseParam(param, mediaMap);
                const name = (parsed.name || '').toLowerCase();
                const fields = contentToFields(parsed, mediaMap);

                if (name === 'question') {
                    questionFields = mergeFields(questionFields, fields);
                } else if (name === 'answer') {
                    answerFields = mergeFields(answerFields, fields);
                }
            });
        }

        const scenarioEl = firstChild(questionEl, 'scenario');
        if (scenarioEl) {
            const legacy = parseScenario(scenarioEl, mediaMap);
            questionFields = mergeFields(questionFields, legacy.question);
            answerFields = mergeFields(answerFields, legacy.answer);
        }

        const rightAnswers = getRightAnswers(questionEl);
        if (!answerFields.textParts.length && rightAnswers.length) {
            answerFields.textParts.push(rightAnswers.join(' / '));
        }

        const q = fieldsToQuestionAnswer(questionFields, 'question');
        const a = fieldsToQuestionAnswer(answerFields, 'answer');

        let answerText = a.text;
        if (!answerText && rightAnswers.length) {
            answerText = rightAnswers.join(' / ');
        }

        return {
            text: q.text,
            answer: answerText,
            image: q.image,
            answerImage: a.answerImage
        };
    }

    function mergeFields(a, b) {
        return {
            textParts: [...a.textParts, ...b.textParts],
            images: [...a.images, ...b.images],
            notes: [...a.notes, ...b.notes]
        };
    }

    function normalizeQuestions(questions, roundId, catIndex, roundPrices) {
        const valid = questions
            .filter(q => q.price > 0 && (q.text || q.answer || q.image))
            .sort((a, b) => a.price - b.price);

        const prices = valid.length
            ? [...new Set(valid.map(q => q.price))].sort((a, b) => a - b)
            : roundPrices;

        while (valid.length < 5) {
            const price = prices[valid.length] || (prices[prices.length - 1] || 100) + 100 * valid.length;
            valid.push({
                id: `siq_r${roundId}_c${catIndex}_q${valid.length}_${price}`,
                price,
                text: '',
                answer: ''
            });
        }

        if (valid.length > 5) valid.length = 5;

        valid.forEach((q, qi) => {
            if (!q.id) q.id = `siq_r${roundId}_c${catIndex}_q${qi}_${q.price}`;
        });

        return { questions: valid, prices: prices.slice(0, 5) };
    }

    function convertDocument(doc, mediaMap, meta) {
        const packageEl = doc.documentElement;
        const packageName = attr(packageEl, 'name') || 'Импорт из SIGame';
        const roundsEl = firstChild(packageEl, 'rounds');
        const roundEls = roundsEl ? childElements(roundsEl, 'round') : [];

        if (!roundEls.length) {
            throw new Error('В пакете нет раундов');
        }

        const rounds = [];
        let roundNum = 0;

        roundEls.forEach(roundEl => {
            const roundType = attr(roundEl, 'type') || 'standart';
            const roundName = attr(roundEl, 'name') || `Раунд ${roundNum + 1}`;
            const themesEl = firstChild(roundEl, 'themes');
            const themeEls = themesEl ? childElements(themesEl, 'theme') : [];

            if (!themeEls.length) return;

            roundNum++;
            const categories = [];
            let roundPrices = [100, 200, 300, 400, 500];

            themeEls.forEach((themeEl, catIndex) => {
                const themeName = attr(themeEl, 'name') || `Тема ${catIndex + 1}`;
                const questionsEl = firstChild(themeEl, 'questions');
                const questionEls = questionsEl ? childElements(questionsEl, 'question') : [];

                const questions = questionEls.map((qEl, qi) => {
                    const price = parseInt(attr(qEl, 'price'), 10);
                    if (price === -1) return null;

                    const parsed = parseQuestionParams(qEl, mediaMap);
                    return {
                        id: `siq_r${roundNum}_c${catIndex}_q${qi}_${price || 0}`,
                        price: Number.isFinite(price) ? price : 100 * (qi + 1),
                        text: parsed.text,
                        answer: parsed.answer,
                        ...(parsed.image ? { image: parsed.image } : {}),
                        ...(parsed.answerImage ? { answerImage: parsed.answerImage } : {})
                    };
                }).filter(Boolean);

                const normalized = normalizeQuestions(questions, roundNum, catIndex, roundPrices);
                if (catIndex === 0) roundPrices = normalized.prices;
                categories.push({ name: themeName, questions: normalized.questions });
            });

            if (!categories.length) return;

            if (categories.length > 8) {
                meta.truncatedCategories = (meta.truncatedCategories || 0) + (categories.length - 8);
                categories.length = 8;
            }

            const allPrices = categories.flatMap(c => c.questions.map(q => q.price));
            const minP = Math.min(...allPrices);
            const maxP = Math.max(...allPrices);

            rounds.push({
                id: roundNum,
                title: roundName,
                subtitle: roundType === 'final'
                    ? 'Финальный раунд'
                    : (roundNum === 1 && packageName !== roundName ? packageName : `Вопросы за ${minP}–${maxP}`),
                prices: [...new Set(allPrices)].sort((a, b) => a - b).slice(0, 5),
                categories
            });
        });

        if (!rounds.length) {
            throw new Error('Не удалось извлечь темы и вопросы из пакета');
        }

        if (rounds.length > 10) {
            meta.truncatedRounds = rounds.length - 10;
            rounds.length = 10;
        }

        meta.packageName = packageName;
        meta.rounds = rounds.length;
        meta.themes = rounds.reduce((n, r) => n + r.categories.length, 0);
        meta.questions = rounds.reduce((n, r) =>
            n + r.categories.reduce((m, c) => m + c.questions.filter(q => q.text || q.answer).length, 0), 0);
        meta.images = countImagesInRounds(rounds);

        return rounds;
    }

    function countImagesInRounds(rounds) {
        let count = 0;
        rounds.forEach(r => r.categories.forEach(c => c.questions.forEach(q => {
            if (q.image) count++;
            if (q.answerImage) count++;
        })));
        return count;
    }

    function parseXml(xmlText) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(stripBom(xmlText), 'application/xml');
        const err = doc.querySelector('parsererror');
        if (err) {
            throw new Error('Ошибка разбора content.xml: ' + (err.textContent || '').slice(0, 120));
        }
        return doc;
    }

    async function parseSiqArrayBuffer(arrayBuffer, onProgress) {
        if (typeof JSZip === 'undefined') {
            throw new Error('JSZip не загружен — обновите страницу');
        }

        onProgress?.('Открываем архив…');
        const zip = await JSZip.loadAsync(arrayBuffer);

        let contentFile = zip.file('content.xml');
        if (!contentFile) {
            const match = Object.keys(zip.files).find(n => /content\.xml$/i.test(n));
            if (match) contentFile = zip.file(match);
        }
        if (!contentFile) {
            throw new Error('Файл .siq должен содержать content.xml');
        }

        onProgress?.('Читаем вопросы…');
        const xmlText = await contentFile.async('string');
        const mediaMap = await buildMediaMap(zip, onProgress);
        const meta = {};
        const doc = parseXml(xmlText);
        const rounds = convertDocument(doc, mediaMap, meta);

        onProgress?.('Готово');
        return { rounds, meta };
    }

    async function parseSiqFile(file, onProgress) {
        if (!file) throw new Error('Файл не выбран');
        if (!/\.siq$/i.test(file.name) && file.type !== 'application/zip' && file.type !== 'application/x-zip-compressed') {
            throw new Error('Нужен файл с расширением .siq');
        }
        const buffer = await file.arrayBuffer();
        return parseSiqArrayBuffer(buffer, onProgress);
    }

    return {
        parseSiqFile,
        parseSiqArrayBuffer
    };
})();
