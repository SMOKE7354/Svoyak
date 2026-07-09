/** Редактор — автосохранение через GameData (localStorage) */

let rounds = [];
let activeRoundId = 1;
let activeCategoryIndex = -1;
let dirty = false;
let saveInProgress = false;
let autoSaveTimer = null;
let firebaseSyncTimer = null;
const AUTO_SAVE_MS = 350;
const FIREBASE_SYNC_MS = 1200;

const roundTabs = document.getElementById('round-tabs');
const categoryList = document.getElementById('category-list');
const emptyState = document.getElementById('empty-state');
const categoryEditor = document.getElementById('category-editor');
const catNameInput = document.getElementById('cat-name-input');
const roundTitleInput = document.getElementById('round-title-input');
const roundSubtitleInput = document.getElementById('round-subtitle-input');
const roundSettingsNum = document.getElementById('round-settings-num');
const questionsList = document.getElementById('questions-list');
const editorStatus = document.getElementById('editor-status');
const toast = document.getElementById('toast');

async function init() {
    const hasLocal = await GameData.reloadAsync();

    if (!hasLocal && typeof gameSync !== 'undefined' && gameSync.pullGameData) {
        await gameSync.pullGameData();
    }

    rounds = deepClone(GameData.getRounds());
    updateStatusLine();
    renderRoundTabs();
    renderCategoryList();
    bindGlobalActions();
    selectRound(1);
}

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function updateStatusLine(mode) {
    const custom = GameData.isCustom();
    const embedded = countEmbeddedImages(rounds);

    editorStatus.classList.remove('status-warn', 'status-saving', 'status-saved');

    if (mode === 'saving') {
        editorStatus.textContent = 'Сохранение…';
        editorStatus.classList.add('status-saving');
        return;
    }
    if (mode === 'saved') {
        editorStatus.textContent = custom ? 'Сохранено — ваша игра' : 'Сохранено';
        editorStatus.classList.add('status-saved');
        if (embedded > 0) {
            editorStatus.textContent += ` · ⚠ ${embedded} встроенных картинок`;
            editorStatus.classList.add('status-warn');
        }
        return;
    }
    if (embedded > 0) {
        editorStatus.textContent = `⚠ ${embedded} встроенных картинок — «Сохранить» или «В Firebase»`;
        editorStatus.classList.add('status-warn');
        return;
    }
    editorStatus.textContent = custom
        ? 'Ваша игра — изменения сохраняются автоматически'
        : 'Стандартная игра — изменения сохраняются автоматически';
}

function getActiveRound() {
    return rounds.find(r => r.id === activeRoundId);
}

function getActiveCategory() {
    const round = getActiveRound();
    if (!round || activeCategoryIndex < 0) return null;
    return round.categories[activeCategoryIndex] || null;
}

function markDirty() {
    dirty = true;
    scheduleAutoSave();
}

function scheduleAutoSave() {
    updateStatusLine('saving');
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
        autoSaveTimer = null;
        autoSave();
    }, AUTO_SAVE_MS);
}

function scheduleFirebaseSync() {
    clearTimeout(firebaseSyncTimer);
    firebaseSyncTimer = setTimeout(() => {
        firebaseSyncTimer = null;
        if (typeof gameSync !== 'undefined' && gameSync.pushGameData) {
            gameSync.pushGameData(GameData.getRounds());
        }
    }, FIREBASE_SYNC_MS);
}

async function autoSave() {
    if (saveInProgress) {
        scheduleAutoSave();
        return;
    }

    syncFormToData();
    saveInProgress = true;
    try {
        await GameData.saveDraft(rounds);
        dirty = false;
        updateStatusLine('saved');
        scheduleFirebaseSync();
    } catch (err) {
        dirty = true;
        editorStatus.textContent = 'Ошибка сохранения: ' + err.message;
        editorStatus.classList.add('status-warn');
    } finally {
        saveInProgress = false;
    }
}

function flushAutoSaveSync() {
    if (!dirty && !autoSaveTimer) return;
    clearTimeout(autoSaveTimer);
    autoSaveTimer = null;
    syncFormToData();
    GameData.saveDraftSync(rounds);
    dirty = false;
    if (typeof gameSync !== 'undefined' && gameSync.pushGameData) {
        gameSync.pushGameData(GameData.getRounds());
    }
}

function showToast(msg, isError = false) {
    toast.textContent = msg;
    toast.classList.toggle('error', isError);
    toast.classList.remove('hidden');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.add('hidden'), 2800);
}

function bindGlobalActions() {
    document.getElementById('btn-save').addEventListener('click', saveToGame);
    document.getElementById('btn-reset').addEventListener('click', resetToDefault);
    document.getElementById('btn-export-images').addEventListener('click', exportEmbeddedImagesToFolder);
    document.getElementById('btn-export').addEventListener('click', exportJson);
    document.getElementById('import-file').addEventListener('change', importJson);
    document.getElementById('btn-add-category').addEventListener('click', addCategory);
    document.getElementById('btn-delete-category').addEventListener('click', deleteCategory);
    document.getElementById('btn-add-round').addEventListener('click', addRound);
    document.getElementById('btn-delete-round').addEventListener('click', deleteRound);

    catNameInput.addEventListener('input', () => {
        const cat = getActiveCategory();
        if (cat) {
            cat.name = catNameInput.value;
            markDirty();
            renderCategoryList();
        }
    });

    roundTitleInput.addEventListener('input', () => {
        const round = getActiveRound();
        if (round) {
            round.title = roundTitleInput.value;
            markDirty();
            renderRoundTabs();
        }
    });

    roundSubtitleInput.addEventListener('input', () => {
        const round = getActiveRound();
        if (round) {
            round.subtitle = roundSubtitleInput.value;
            markDirty();
        }
    });

    window.addEventListener('beforeunload', () => {
        flushAutoSaveSync();
    });

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') flushAutoSaveSync();
    });
}

function saveToGame() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = null;
    syncFormToData();
    const saveBtn = document.getElementById('btn-save');
    try {
        validateRounds(rounds);
        saveBtn.disabled = true;
        editorStatus.textContent = 'Сохранение в Firebase…';

        GameData.save(rounds, (msg) => {
            editorStatus.textContent = msg;
        }).then(() => {
            dirty = false;
            updateStatusLine('saved');
            showToast('Сохранено! Вопросы и картинки отправлены в Firebase');
        }).catch((err) => {
            showToast(err.message, true);
            updateStatusLine();
        }).finally(() => {
            saveBtn.disabled = false;
        });
    } catch (err) {
        showToast(err.message, true);
        saveBtn.disabled = false;
    }
}

function resetToDefault() {
    if (!confirm('Вернуть стандартные вопросы? Ваша версия будет удалена.')) return;
    GameData.resetToDefault();
    rounds = deepClone(GameData.getRounds());
    dirty = false;
    activeCategoryIndex = -1;
    updateStatusLine();
    renderRoundTabs();
    renderCategoryList();
    showEditorEmpty();
    showToast('Восстановлена стандартная игра');
}

function exportJson() {
    syncFormToData();
    const blob = new Blob([JSON.stringify(rounds, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'svoyak-game.json';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Файл скачан');
}

function importJson(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const parsed = JSON.parse(reader.result);
            validateRounds(parsed);
            rounds = parsed;
            dirty = true;
            activeCategoryIndex = -1;
            renderRoundTabs();
            renderCategoryList();
            selectRound(rounds[0]?.id || 1);
            scheduleAutoSave();
            showToast('Импорт OK — сохраняется автоматически');
        } catch (err) {
            showToast(err.message, true);
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}

function validateRounds(data) {
    if (!Array.isArray(data) || !data.length) throw new Error('Нужен массив раундов');
    data.forEach((r, i) => {
        if (!r.id) r.id = i + 1;
        if (!r.title) r.title = `Раунд ${r.id}`;
        if (!r.subtitle) r.subtitle = '';
        if (!r.categories?.length) throw new Error(`Раунд ${i + 1}: нужна хотя бы одна категория`);
        r.categories.forEach((cat, ci) => {
            if (!cat.name?.trim()) throw new Error(`Раунд ${r.id}, кат. ${ci + 1}: укажите название`);
            if (!cat.questions?.length) throw new Error(`«${cat.name}»: добавьте вопросы`);
            cat.questions.forEach((q, qi) => {
                if (!q.text?.trim()) throw new Error(`«${cat.name}», вопрос ${qi + 1}: пустой текст`);
                if (!q.answer?.trim()) throw new Error(`«${cat.name}», вопрос ${qi + 1}: пустой ответ`);
                if (!q.price) q.price = r.prices?.[qi] || 100;
                if (!q.id) q.id = `custom_r${r.id}_c${ci}_q${qi}_${q.price}`;
            });
        });
    });
}

function syncRoundMetaInputs() {
    const round = getActiveRound();
    if (!round) return;
    if (roundTitleInput) roundTitleInput.value = round.title || '';
    if (roundSubtitleInput) roundSubtitleInput.value = round.subtitle || '';
    if (roundSettingsNum) roundSettingsNum.textContent = round.id;
}

function renumberRounds() {
    rounds.forEach((r, i) => {
        r.id = i + 1;
    });
}

function defaultPricesForRound(index) {
    const presets = [
        [100, 200, 300, 400, 500],
        [200, 400, 600, 800, 1000],
        [500, 1000, 1500, 2000, 2500]
    ];
    return presets[index] || presets[0].map(p => p * (index + 1));
}

function addRound() {
    syncFormToData();
    if (rounds.length >= 10) {
        showToast('Максимум 10 раундов', true);
        return;
    }
    const newIndex = rounds.length;
    const prices = defaultPricesForRound(newIndex);
    const newId = newIndex + 1;
    rounds.push({
        id: newId,
        title: `Раунд ${newId}`,
        subtitle: `Вопросы за ${prices[0]}–${prices[prices.length - 1]}`,
        prices,
        categories: [{
            name: 'Категория 1',
            questions: prices.map((price, i) => ({
                id: `custom_r${newId}_c0_q${i}_${price}`,
                price,
                text: '',
                answer: ''
            }))
        }]
    });
    activeCategoryIndex = -1;
    markDirty();
    selectRound(newId);
    showToast('Раунд добавлен');
}

function deleteRound() {
    if (rounds.length <= 1) {
        showToast('Нужен хотя бы один раунд', true);
        return;
    }
    const round = getActiveRound();
    if (!round) return;
    if (!confirm(`Удалить «${round.title}» и все его категории?`)) return;

    syncFormToData();
    rounds = rounds.filter(r => r.id !== activeRoundId);
    renumberRounds();
    activeCategoryIndex = -1;
    activeRoundId = rounds[0]?.id || 1;
    markDirty();
    renderRoundTabs();
    renderCategoryList();
    selectRound(activeRoundId);
    showToast('Раунд удалён');
}

function syncFormToData() {
    const round = getActiveRound();
    if (round) {
        round.title = roundTitleInput?.value?.trim() || round.title;
        round.subtitle = roundSubtitleInput?.value?.trim() || round.subtitle;
    }

    const cat = getActiveCategory();
    if (!cat) return;
    cat.name = catNameInput.value.trim() || cat.name;

    questionsList.querySelectorAll('.question-card').forEach((card, i) => {
        const q = cat.questions[i];
        if (!q) return;
        q.price = parseInt(card.querySelector('[data-field="price"]')?.value, 10) || q.price;
        q.text = card.querySelector('[data-field="text"]')?.value || '';
        q.answer = card.querySelector('[data-field="answer"]')?.value || '';
        const imgInput = card.querySelector('[data-field="image"]')?.value?.trim();
        if (imgInput) q.image = isDataUrl(imgInput) ? imgInput : normalizeImagePath(imgInput);
        else if (!isDataUrl(q.image)) delete q.image;
        const answerImgInput = card.querySelector('[data-field="answerImage"]')?.value?.trim();
        if (answerImgInput) q.answerImage = isDataUrl(answerImgInput) ? answerImgInput : normalizeImagePath(answerImgInput);
        else if (!isDataUrl(q.answerImage)) delete q.answerImage;
    });
}

function renderRoundTabs() {
    roundTabs.innerHTML = rounds.map(r => `
        <button type="button" class="round-tab ${r.id === activeRoundId ? 'active' : ''}" data-round="${r.id}">
            <span class="round-tab-num">${r.id}</span>
            <span>${escapeHtml(r.title)}</span>
        </button>
    `).join('');

    roundTabs.querySelectorAll('.round-tab').forEach(btn => {
        btn.addEventListener('click', () => selectRound(parseInt(btn.dataset.round, 10)));
    });
}

function selectRound(id) {
    flushAutoSaveSync();
    activeRoundId = id;
    activeCategoryIndex = -1;
    renderRoundTabs();
    renderCategoryList();
    showEditorEmpty();
    syncRoundMetaInputs();
}

function renderCategoryList() {
    const round = getActiveRound();
    if (!round) {
        categoryList.innerHTML = '';
        return;
    }

    categoryList.innerHTML = round.categories.map((cat, i) => `
        <li>
            <button type="button" class="${i === activeCategoryIndex ? 'active' : ''}" data-idx="${i}">
                ${escapeHtml(cat.name || 'Без названия')}
            </button>
        </li>
    `).join('');

    categoryList.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => selectCategory(parseInt(btn.dataset.idx, 10)));
    });
}

function selectCategory(index) {
    flushAutoSaveSync();
    activeCategoryIndex = index;
    renderCategoryList();
    renderCategoryEditor();
}

function showEditorEmpty() {
    emptyState.classList.remove('hidden');
    categoryEditor.classList.add('hidden');
}

function renderCategoryEditor() {
    const cat = getActiveCategory();
    const round = getActiveRound();
    if (!cat || !round) {
        showEditorEmpty();
        return;
    }

    emptyState.classList.add('hidden');
    categoryEditor.classList.remove('hidden');

    catNameInput.value = cat.name || '';
    syncRoundMetaInputs();

    ensureQuestionCount(cat, round);

    questionsList.innerHTML = cat.questions.map((q, i) => renderQuestionCard(q, i, round)).join('');
    bindQuestionCards(cat);
}

function ensureQuestionCount(cat, round) {
    const target = 5;
    const prices = round.prices || [100, 200, 300, 400, 500];
    while (cat.questions.length < target) {
        const i = cat.questions.length;
        cat.questions.push({
            id: `custom_r${round.id}_c${activeCategoryIndex}_q${i}_${prices[i] || 100}`,
            price: prices[i] || 100 * (i + 1),
            text: '',
            answer: ''
        });
    }
    if (cat.questions.length > target) cat.questions.length = target;
}

function renderQuestionCard(q, index, round) {
    const price = q.price ?? round.prices?.[index] ?? 100;

    return `
        <div class="question-card" data-qindex="${index}">
            <div class="q-card-head">
                <span class="q-price-badge">Вопрос ${index + 1}</span>
                <input type="number" class="ed-input q-price-input" data-field="price" value="${price}" min="1" step="50">
            </div>
            <div class="q-fields">
                <div>
                    <label class="field-label">Текст вопроса</label>
                    <textarea class="ed-textarea" data-field="text" rows="3" placeholder="Вопрос для игроков">${escapeHtml(q.text || '')}</textarea>
                </div>
                <div>
                    <label class="field-label">Ответ</label>
                    <textarea class="ed-textarea" data-field="answer" rows="3" placeholder="Правильный ответ">${escapeHtml(q.answer || '')}</textarea>
                </div>
                ${renderImageField('image', 'Картинка к вопросу (на табло с вопросом)', q.image, index)}
                ${renderImageField('answerImage', 'Картинка к ответу (на табло при «Показать ответ»)', q.answerImage, index, true)}
            </div>
        </div>
    `;
}

function renderImageField(field, label, value, index, isAnswer = false) {
    const previewSrc = value ? (isDataUrl(value) ? value : resolveImageSrc(value)) : '';
    const imgPreview = previewSrc
        ? `<div class="image-preview-wrap"><img class="image-preview" src="${escapeAttr(previewSrc)}" alt=""></div>`
        : (isDataUrl(value) ? '<p class="image-embed-warn">⚠ Картинка встроена в браузер — нажмите «Вынести в images»</p>' : '');

    return `
        <div class="image-row ${isAnswer ? 'image-row-answer' : ''}">
            <div class="image-field">
                <label class="field-label">${label}</label>
                <input type="text" class="ed-input" data-field="${field}" value="${escapeAttr(isDataUrl(value) ? '' : (value || ''))}" placeholder="загрузите файл или images/photo.jpg">
                ${imgPreview}
                <p class="image-path-hint">При Firebase — загрузка в облако автоматически. Или положите файл в <code>images/</code> на Render.</p>
            </div>
            <label class="image-upload-label">
                📷 Загрузить
                <input type="file" accept="image/*" data-upload-index="${index}" data-upload-field="${field}" hidden>
            </label>
        </div>
    `;
}

function bindQuestionCards(cat) {
    questionsList.querySelectorAll('[data-field]').forEach(el => {
        el.addEventListener('input', () => {
            markDirty();
            if (el.dataset.field === 'image' || el.dataset.field === 'answerImage') {
                updateImagePreview(el);
            }
        });
    });

    questionsList.querySelectorAll('input[data-upload-field]').forEach(input => {
        input.addEventListener('change', (e) => handleImageUpload(e, cat));
    });
}

function updateImagePreview(input) {
    const card = input.closest('.question-card');
    if (!card) return;
    const container = input.closest('.image-field');
    if (!container) return;
    let wrap = container.querySelector('.image-preview-wrap');
    const url = input.value.trim();
    container.querySelector('.image-embed-warn')?.remove();
    if (!url || isDataUrl(url)) {
        wrap?.remove();
        return;
    }
    const src = resolveImageSrc(url);
    if (!wrap) {
        wrap = document.createElement('div');
        wrap.className = 'image-preview-wrap';
        container.insertBefore(wrap, container.querySelector('.image-path-hint'));
    }
    wrap.innerHTML = `<img class="image-preview" src="${escapeAttr(src)}" alt="">`;
}

function downloadBlobAsFile(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

function dataUrlToBlob(dataUrl) {
    const [header, data] = dataUrl.split(',');
    const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
    const binary = atob(data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function exportEmbeddedImagesToFolder() {
    syncFormToData();
    const embedded = countEmbeddedImages(rounds);
    if (!embedded) {
        showToast('Встроенных картинок нет — всё уже в Firebase или images/');
        return;
    }

    if (FirebaseMedia.isReady()) {
        if (!confirm(`Загрузить ${embedded} встроенных картинок в Firebase Storage?`)) return;
        editorStatus.textContent = 'Загрузка в Firebase…';
        try {
            const result = await FirebaseMedia.uploadEmbeddedImagesInRounds(rounds, (msg) => {
                editorStatus.textContent = msg;
            });
            rounds = result.rounds;
            markDirty();
            updateStatusLine();
            renderCategoryEditor();
            scheduleAutoSave();
            showToast(`Загружено ${result.uploaded} картинок — сохраняется автоматически`);
        } catch (err) {
            showToast(err.message, true);
            updateStatusLine();
        }
        return;
    }

    if (!confirm(`Скачать ${embedded} файлов и заменить встроенные картинки путями images/…?`)) return;

    let exported = 0;
    for (const r of rounds) {
        for (let ci = 0; ci < r.categories.length; ci++) {
            const cat = r.categories[ci];
            for (let qi = 0; qi < cat.questions.length; qi++) {
                const q = cat.questions[qi];
                for (const field of ['image', 'answerImage']) {
                    if (!isDataUrl(q[field])) continue;
                    const path = buildImagePath(r.id, ci, qi, field, `${field}.jpg`);
                    const filename = path.replace(`${IMAGES_FOLDER}/`, '');
                    downloadBlobAsFile(dataUrlToBlob(q[field]), filename);
                    q[field] = path;
                    exported++;
                    await delay(350);
                }
            }
        }
    }

    markDirty();
    updateStatusLine();
    renderCategoryEditor();
    scheduleAutoSave();
    showToast(`Скачано ${exported} файлов — положите их в папку images/`);
}

function handleImageUpload(e, cat) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
        showToast('Картинка слишком большая (макс. 5 МБ)', true);
        return;
    }

    const index = parseInt(e.target.dataset.uploadIndex, 10);
    const field = e.target.dataset.uploadField || 'image';
    const round = getActiveRound();
    if (!round || activeCategoryIndex < 0) return;

    const path = buildImagePath(round.id, activeCategoryIndex, index, field, file.name);
    const storagePath = FirebaseMedia.storagePathFor(round.id, activeCategoryIndex, index, field, file.name);

    e.target.value = '';

    if (FirebaseMedia.isReady()) {
        editorStatus.textContent = 'Загрузка картинки в Firebase…';
        FirebaseMedia.uploadFile(file, storagePath)
            .then((url) => {
                cat.questions[index][field] = url;
                markDirty();
                renderCategoryEditor();
                updateStatusLine();
                showToast('Картинка загружена в Firebase');
            })
            .catch((err) => {
                showToast(err.message, true);
                updateStatusLine();
            });
        return;
    }

    const filename = path.replace(`${IMAGES_FOLDER}/`, '');
    downloadBlobAsFile(file, filename);
    cat.questions[index][field] = path;
    markDirty();
    renderCategoryEditor();
    showToast(`Firebase недоступен — сохраните файл в папку images/${filename}`);
}

function addCategory() {
    const round = getActiveRound();
    if (!round) return;
    if (round.categories.length >= 8) {
        showToast('Максимум 8 категорий в раунде', true);
        return;
    }

    syncFormToData();
    const prices = round.prices || [100, 200, 300, 400, 500];
    const idx = round.categories.length;
    round.categories.push({
        name: `Категория ${idx + 1}`,
        questions: prices.map((price, i) => ({
            id: `custom_r${round.id}_c${idx}_q${i}_${price}`,
            price,
            text: '',
            answer: ''
        }))
    });
    activeCategoryIndex = round.categories.length - 1;
    markDirty();
    renderCategoryList();
    renderCategoryEditor();
}

function deleteCategory() {
    const round = getActiveRound();
    if (!round || activeCategoryIndex < 0) return;
    if (round.categories.length <= 1) {
        showToast('Нужна хотя бы одна категория', true);
        return;
    }
    if (!confirm(`Удалить «${round.categories[activeCategoryIndex].name}»?`)) return;

    round.categories.splice(activeCategoryIndex, 1);
    activeCategoryIndex = Math.min(activeCategoryIndex, round.categories.length - 1);
    markDirty();
    renderCategoryList();
    if (activeCategoryIndex >= 0) renderCategoryEditor();
    else showEditorEmpty();
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
    return escapeHtml(str).replace(/'/g, '&#39;');
}

init();
