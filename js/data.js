const DEFAULT_GAME_ROUNDS = [
    {
        id: 1,
        title: "Раунд 1",
        subtitle: "Разогрев — вопросы за 100–500",
        prices: [100, 200, 300, 400, 500],
        categories: [
            {
                name: "Логика под градусом",
                questions: [
                    { id: "r1_c1_100", price: 100, text: "Что становится абсолютно логичным после трех бокалов?", answer: "Позвонить бывшему/бывшей" },
                    { id: "r1_c1_200", price: 200, text: "Если 'А' равно 'Б', то почему счет в баре всегда больше, чем вы планировали?", answer: "Потому что кто-то заказал шоты" },
                    { id: "r1_c1_300", price: 300, text: "Что общего у парашюта и презерватива?", answer: "Если порвется, ты в пролете (или залете)" },
                    { id: "r1_c1_400", price: 400, text: "Какой философский вопрос возникает в 3 часа ночи возле холодильника?", answer: "А не съесть ли мне колбасу с вареньем?" },
                    { id: "r1_c1_500", price: 500, text: "Главный закон физики на корпоративе?", answer: "Угол падения лицом в салат равен градусу выпитого" }
                ]
            },
            {
                name: "Бытовые парадоксы",
                questions: [
                    { id: "r1_c2_100", price: 100, text: "Что исчезает в стиральной машине, нарушая законы физики?", answer: "Один носок из пары" },
                    { id: "r1_c2_200", price: 200, text: "Почему нельзя просто взять и выбросить коробку от смартфона?", answer: "А вдруг пригодится при продаже (через 5 лет)" },
                    { id: "r1_c2_300", price: 300, text: "Какая фраза жены означает, что вечер перестает быть томным?", answer: "Нам надо поговорить" },
                    { id: "r1_c2_400", price: 400, text: "Что растет быстрее: зарплата или цены на коммуналку?", answer: "Живот после 30" },
                    { id: "r1_c2_500", price: 500, text: "Главный закон ремонта в квартире?", answer: "Он не заканчивается, его можно только приостановить" }
                ]
            },
            {
                name: "Возрастные изменения",
                questions: [
                    { id: "r1_c3_100", price: 100, text: "В каком возрасте начинаешь радоваться новым губкам для посуды?", answer: "После 25-30 лет" },
                    { id: "r1_c3_200", price: 200, text: "Что означает 'погулять на всю катушку' в 35 лет?", answer: "Лечь спать в 22:00" },
                    { id: "r1_c3_300", price: 300, text: "Какой звук издает человек старше 30, когда садится на диван?", answer: "Кряхтение или 'Ох-хо-хо'" },
                    { id: "r1_c3_400", price: 400, text: "Что становится страшнее фильмов ужасов?", answer: "Анализы и цены на стоматологию" },
                    { id: "r1_c3_500", price: 500, text: "В чем главное отличие похмелья в 20 и в 30 лет?", answer: "В 20 оно проходит к обеду, в 30 — к среде" }
                ]
            },
            {
                name: "Офисные джунгли",
                questions: [
                    { id: "r1_c4_100", price: 100, text: "Что значит 'я вас услышал' на офисном языке?", answer: "Мне плевать, отвали" },
                    { id: "r1_c4_200", price: 200, text: "Какое слово в письме означает, что автор в бешенстве?", answer: "Заранее спасибо!" },
                    { id: "r1_c4_300", price: 300, text: "Самый длинный час в жизни взрослого человека?", answer: "С 17:00 до 18:00 в пятницу" },
                    { id: "r1_c4_400", price: 400, text: "Зачем нужен 'колл' на 5 минут?", answer: "Чтобы потратить на него полтора часа" },
                    { id: "r1_c4_500", price: 500, text: "Что является главной валютой на работе, кроме денег?", answer: "Сплетни у кулера и отгулы" }
                ]
            },
            {
                name: "Мужское и женское",
                questions: [
                    { id: "r1_c5_100", price: 100, text: "Что означает женское 'Я ничего не трогала, оно само'?", answer: "Она трогала, и оно сломалось" },
                    { id: "r1_c5_200", price: 200, text: "Как называется болезнь, при которой мужчина не может найти вещь в холодильнике?", answer: "Мужская слепота" },
                    { id: "r1_c5_300", price: 300, text: "Что женщина выбирает дольше: фильм на вечер или платье?", answer: "Фильм (выбор длится дольше самого фильма)" },
                    { id: "r1_c5_400", price: 400, text: "Какая мужская фраза доводит женщину до истерики быстрее всего?", answer: "Успокойся" },
                    { id: "r1_c5_500", price: 500, text: "Что мужчина считает романтическим поступком после 10 лет брака?", answer: "Помыть за собой посуду" }
                ]
            }
        ]
    },
    {
        id: 2,
        title: "Раунд 2",
        subtitle: "Тяжелая артиллерия — вопросы за 100–500",
        prices: [100, 200, 300, 400, 500],
        categories: [
            {
                name: "Алкогольная дедукция",
                questions: [
                    { id: "r2_c1_100", price: 100, text: "Как по чеку из бара понять, кто платил?", answer: "Никак, платили картой того, кто уснул первым" },
                    { id: "r2_c1_200", price: 200, text: "Что логично сделать, если 'вертолеты' начались?", answer: "Опустить одну ногу на пол" },
                    { id: "r2_c1_300", price: 300, text: "Если друг сказал 'я только одну кружечку', когда вы вернетесь домой?", answer: "Утром следующего дня" },
                    { id: "r2_c1_400", price: 400, text: "Какая стадия опьянения следует за 'я тебя уважаю'?", answer: "Политика или звонок бывшим" },
                    { id: "r2_c1_500", price: 500, text: "Что является лучшим доказательством того, что вечер удался?", answer: "Удаленные сторис на утро" }
                ]
            },
            {
                name: "Финансовые провалы",
                questions: [
                    { id: "r2_c2_100", price: 100, text: "Куда исчезают деньги после получения зарплаты?", answer: "Их съедают долги, кредиты и 'я же заслужил'" },
                    { id: "r2_c2_200", price: 200, text: "Что означает 'жить по средствам'?", answer: "Ждать скидок в Пятерочке" },
                    { id: "r2_c2_300", price: 300, text: "Самая частая ложь самому себе при покупке дорогой вещи?", answer: "Это инвестиция в себя" },
                    { id: "r2_c2_400", price: 400, text: "Какое уведомление вызывает наибольший стресс?", answer: "Списание за подписку, которую забыл отменить" },
                    { id: "r2_c2_500", price: 500, text: "В чем парадокс 'бесплатной' доставки от 2000 рублей?", answer: "Ты покупаешь ненужной фигни на 1500, чтобы сэкономить 200 рублей" }
                ]
            },
            {
                name: "Интернет и кринж",
                questions: [
                    { id: "r2_c3_100", price: 100, text: "Что страшнее, чем уронить телефон в воду?", answer: "Случайно лайкнуть фото трехлетней давности" },
                    { id: "r2_c3_200", price: 200, text: "Как называется отправка сообщения в рабочий чат вместо личного?", answer: "Увольнение по собственному желанию" },
                    { id: "r2_c3_300", price: 300, text: "Что скрывают родители в истории браузера?", answer: "Как засолить огурцы и 'почему болит спина'" },
                    { id: "r2_c3_400", price: 400, text: "Какой пароль самый популярный у тех, кто 'заботится о безопасности'?", answer: "12345678 или Дата рождения" },
                    { id: "r2_c3_500", price: 500, text: "Главное правило видеозвонков на удаленке?", answer: "Сверху рубашка, снизу трусы" }
                ]
            },
            {
                name: "Родительский контроль",
                questions: [
                    { id: "r2_c4_100", price: 100, text: "Какая фраза матери работает лучше любого детектора лжи?", answer: "Смотри мне в глаза" },
                    { id: "r2_c4_200", price: 200, text: "Что значит 'когда будут внуки?' в переводе с родительского?", answer: "Нам скучно, сделай что-нибудь" },
                    { id: "r2_c4_300", price: 300, text: "Самый страшный вопрос от ребенка?", answer: "А откуда я взялся?" },
                    { id: "r2_c4_400", price: 400, text: "Что родители называют 'современными технологиями'?", answer: "Вайбер с открытками на каждый праздник" },
                    { id: "r2_c4_500", price: 500, text: "Главный родительский парадокс?", answer: "Сначала учат ходить и говорить, потом сидеть и молчать" }
                ]
            },
            {
                name: "Философия после 30",
                questions: [
                    { id: "r2_c5_100", price: 100, text: "Что значит 'бурная молодость' после 30?", answer: "Посидеть в кафе до полуночи без изжоги" },
                    { id: "r2_c5_200", price: 200, text: "В чем смысл жизни, по мнению маркетологов?", answer: "Взять ипотеку под 15%" },
                    { id: "r2_c5_300", price: 300, text: "Какое занятие заменяет взрослым медитацию?", answer: "Мытье посуды или уборка в одиночестве" },
                    { id: "r2_c5_400", price: 400, text: "Что становится лучшим подарком на день рождения?", answer: "Деньги в конверте или 'ничего не дари, просто приходи'" },
                    { id: "r2_c5_500", price: 500, text: "Главный секрет успешной взрослой жизни?", answer: "Делать вид, что ты понимаешь, что происходит" }
                ]
            }
        ]
    }
];

const BLANK_GAME_ROUNDS = [
    {
        id: 1,
        title: "Раунд 1",
        subtitle: "",
        prices: [100, 200, 300, 400, 500],
        categories: [
            {
                name: "Категория 1",
                questions: [100, 200, 300, 400, 500].map((price, i) => ({
                    id: `blank_r1_c0_q${i}_${price}`,
                    price,
                    text: "",
                    answer: ""
                }))
            }
        ]
    }
];

const CUSTOM_GAME_STORAGE_KEY = 'svoyak_custom_game';
const GAME_DATA_VERSION_KEY = 'svoyak_game_data_version';
const GAME_DATA_VERSION = 'blank-v3-2026';
const IMAGES_FOLDER = 'image';
const GAME_DATA_IDB_NAME = 'svoyak-game-db';
const GAME_DATA_IDB_STORE = 'rounds';

function cloneRounds(rounds) {
    return JSON.parse(JSON.stringify(rounds));
}

function isDataUrl(value) {
    return typeof value === 'string' && value.startsWith('data:');
}

function getImageExtension(filename) {
    const ext = (String(filename).match(/\.(\w+)$/)?.[1] || 'jpg').toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext) ? ext : 'jpg';
}

function buildImagePath(roundId, catIndex, qIndex, field, originalFilename) {
    const ext = getImageExtension(originalFilename);
    const suffix = field === 'answerImage' ? 'answer' : 'question';
    return `${IMAGES_FOLDER}/r${roundId}-c${catIndex + 1}-q${qIndex + 1}-${suffix}.${ext}`;
}

function normalizeImagePath(value) {
    if (!value || typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (!trimmed || isDataUrl(trimmed) || /^https?:\/\//i.test(trimmed)) return trimmed;
    const clean = trimmed.replace(/^\/+/, '');
    if (clean.startsWith(`${IMAGES_FOLDER}/`)) return clean;
    return `${IMAGES_FOLDER}/${clean}`;
}

function resolveImageSrc(value) {
    if (!value || typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (!trimmed) return '';
    if (isDataUrl(trimmed) || /^https?:\/\//i.test(trimmed)) return trimmed;
    return normalizeImagePath(trimmed);
}

function countEmbeddedImages(rounds) {
    let count = 0;
    rounds.forEach(r => {
        r.categories?.forEach(cat => {
            cat.questions?.forEach(q => {
                if (isDataUrl(q.image)) count++;
                if (isDataUrl(q.answerImage)) count++;
            });
        });
    });
    return count;
}

function sanitizeRoundsForStorage(rounds) {
    const clean = cloneRounds(rounds);
    clean.forEach(r => {
        r.categories?.forEach(cat => {
            cat.questions?.forEach(q => {
                if (q.image) {
                    if (!isDataUrl(q.image)) q.image = normalizeImagePath(q.image);
                }
                if (q.answerImage) {
                    if (!isDataUrl(q.answerImage)) q.answerImage = normalizeImagePath(q.answerImage);
                }
            });
        });
    });
    return clean;
}

function validateNoEmbeddedImages(rounds) {
    const count = countEmbeddedImages(rounds);
    if (count > 0) {
        throw new Error(
            `В игре ${count} встроенных картинок (base64) — из‑за них перестают открываться вопросы. ` +
            'Нажмите «Вынести в папку image» в редакторе или загрузите фото заново.'
        );
    }
}

function openGameDataDb() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(GAME_DATA_IDB_NAME, 1);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(GAME_DATA_IDB_STORE)) {
                db.createObjectStore(GAME_DATA_IDB_STORE);
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

function idbSaveRounds(rounds) {
    return openGameDataDb().then(db => new Promise((resolve, reject) => {
        const tx = db.transaction(GAME_DATA_IDB_STORE, 'readwrite');
        tx.objectStore(GAME_DATA_IDB_STORE).put(rounds, CUSTOM_GAME_STORAGE_KEY);
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => { db.close(); reject(tx.error); };
    }));
}

function idbLoadRounds() {
    return openGameDataDb().then(db => new Promise((resolve, reject) => {
        const tx = db.transaction(GAME_DATA_IDB_STORE, 'readonly');
        const req = tx.objectStore(GAME_DATA_IDB_STORE).get(CUSTOM_GAME_STORAGE_KEY);
        req.onsuccess = () => { db.close(); resolve(req.result || null); };
        req.onerror = () => { db.close(); reject(req.error); };
    })).catch(() => null);
}

function persistRounds(rounds) {
    localStorage.setItem(GAME_DATA_VERSION_KEY, GAME_DATA_VERSION);
    const json = JSON.stringify(rounds);
    try {
        localStorage.setItem(CUSTOM_GAME_STORAGE_KEY, json);
        return { ok: true, storage: 'local' };
    } catch (err) {
        if (err?.name === 'QuotaExceededError' || err?.code === 22) {
            return idbSaveRounds(rounds)
                .then(() => {
                    try { localStorage.removeItem(CUSTOM_GAME_STORAGE_KEY); } catch { /* ignore */ }
                    return { ok: true, storage: 'indexeddb' };
                })
                .catch(() => {
                    throw new Error('Недостаточно места для картинок. Уменьшите размер изображений или используйте ссылки (URL).');
                });
        }
        throw err;
    }
}

function loadGameRoundsFromLocal() {
    const storedVersion = localStorage.getItem(GAME_DATA_VERSION_KEY);

    if (storedVersion !== GAME_DATA_VERSION) {
        return null;
    }

    try {
        const saved = localStorage.getItem(CUSTOM_GAME_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch { /* try IndexedDB */ }

    return null;
}

async function loadGameRoundsAsync() {
    const storedVersion = localStorage.getItem(GAME_DATA_VERSION_KEY);
    if (storedVersion !== GAME_DATA_VERSION) {
        return null;
    }

    const fromLocal = loadGameRoundsFromLocal();
    if (fromLocal) return fromLocal;

    const fromIdb = await idbLoadRounds();
    if (Array.isArray(fromIdb) && fromIdb.length > 0) {
        return fromIdb;
    }

    return null;
}

function loadGameRounds() {
    const storedVersion = localStorage.getItem(GAME_DATA_VERSION_KEY);

    if (storedVersion !== GAME_DATA_VERSION) {
        const fresh = cloneRounds(BLANK_GAME_ROUNDS);
        try {
            persistRounds(fresh);
            idbSaveRounds(fresh).catch(() => {});
        } catch { /* ignore on init */ }
        return fresh;
    }

    const fromLocal = loadGameRoundsFromLocal();
    if (fromLocal) return fromLocal;

    const fresh = cloneRounds(BLANK_GAME_ROUNDS);
    try { persistRounds(fresh); } catch { /* ignore on init */ }
    return fresh;
}

let gameRounds = loadGameRounds();

const GameData = {
    storageKey: CUSTOM_GAME_STORAGE_KEY,

    getRounds() {
        return gameRounds;
    },

    async save(rounds, onProgress) {
        let cleaned = cloneRounds(rounds);
        let firebaseFailed = false;
        if (countEmbeddedImages(cleaned) > 0) {
            if (typeof FirebaseMedia !== 'undefined' && FirebaseMedia.isReady()) {
                try {
                    const result = await FirebaseMedia.uploadEmbeddedImagesInRounds(cleaned, onProgress);
                    cleaned = result.rounds;
                } catch (err) {
                    console.warn('Firebase bulk upload failed, saving locally:', err);
                    firebaseFailed = true;
                }
            }
        }
        cleaned = sanitizeRoundsForStorage(cleaned);
        const result = await Promise.resolve(persistRounds(cleaned));
        if (firebaseFailed) result.firebaseFailed = true;
        gameRounds = cleaned;
        window.dispatchEvent(new CustomEvent('svoyak-game-updated', { detail: result }));
        if (typeof gameSync !== 'undefined' && gameSync.pushGameData) {
            gameSync.pushGameData(cleaned);
        }
        return result;
    },

    saveDraft(rounds) {
        const draft = cloneRounds(rounds);
        return Promise.resolve(persistRounds(draft)).then((result) => {
            gameRounds = draft;
            return result;
        });
    },

    saveDraftSync(rounds) {
        const draft = cloneRounds(rounds);
        try {
            localStorage.setItem(GAME_DATA_VERSION_KEY, GAME_DATA_VERSION);
            localStorage.setItem(CUSTOM_GAME_STORAGE_KEY, JSON.stringify(draft));
        } catch (err) {
            if (err?.name === 'QuotaExceededError' || err?.code === 22) {
                try { localStorage.removeItem(CUSTOM_GAME_STORAGE_KEY); } catch { /* ignore */ }
                idbSaveRounds(draft).catch(() => {});
            }
        }
        gameRounds = draft;
    },

    saveSync(rounds) {
        const json = JSON.stringify(rounds);
        localStorage.setItem(GAME_DATA_VERSION_KEY, GAME_DATA_VERSION);
        try {
            localStorage.setItem(CUSTOM_GAME_STORAGE_KEY, json);
        } catch (err) {
            if (err?.name === 'QuotaExceededError' || err?.code === 22) {
                try { localStorage.removeItem(CUSTOM_GAME_STORAGE_KEY); } catch { /* ignore */ }
                idbSaveRounds(rounds).catch(() => {});
            }
        }
        gameRounds = rounds;
        window.dispatchEvent(new CustomEvent('svoyak-game-updated'));
        if (typeof gameSync !== 'undefined' && gameSync.pushGameData) {
            gameSync.pushGameData(rounds);
        }
    },

    resetToDefault() {
        const fresh = cloneRounds(DEFAULT_GAME_ROUNDS);
        try {
            localStorage.setItem(GAME_DATA_VERSION_KEY, GAME_DATA_VERSION);
            localStorage.setItem(CUSTOM_GAME_STORAGE_KEY, JSON.stringify(fresh));
        } catch { 
            try { localStorage.removeItem(CUSTOM_GAME_STORAGE_KEY); } catch { /* ignore */ }
        }
        idbSaveRounds(fresh).catch(() => {});
        gameRounds = fresh;
        window.dispatchEvent(new CustomEvent('svoyak-game-updated'));
        if (typeof gameSync !== 'undefined' && gameSync.pushGameData) {
            gameSync.pushGameData(fresh);
        }
    },

    resetToBlank() {
        const fresh = cloneRounds(BLANK_GAME_ROUNDS);
        try {
            localStorage.setItem(GAME_DATA_VERSION_KEY, GAME_DATA_VERSION);
            localStorage.setItem(CUSTOM_GAME_STORAGE_KEY, JSON.stringify(fresh));
        } catch { 
            try { localStorage.removeItem(CUSTOM_GAME_STORAGE_KEY); } catch { /* ignore */ }
        }
        idbSaveRounds(fresh).catch(() => {});
        gameRounds = fresh;
        window.dispatchEvent(new CustomEvent('svoyak-game-updated'));
        if (typeof gameSync !== 'undefined' && gameSync.pushGameData) {
            gameSync.pushGameData(fresh);
        }
    },

    reload() {
        gameRounds = loadGameRounds();
    },

    async reloadAsync() {
        const loaded = await loadGameRoundsAsync();
        if (loaded) {
            gameRounds = loaded;
            return true;
        }
        gameRounds = loadGameRounds();
        return false;
    },

    applyRemoteRounds(rounds) {
        if (!Array.isArray(rounds) || !rounds.length) return false;
        gameRounds = rounds;
        try {
            localStorage.setItem(GAME_DATA_VERSION_KEY, GAME_DATA_VERSION);
            localStorage.setItem(CUSTOM_GAME_STORAGE_KEY, JSON.stringify(rounds));
        } catch {
            try { localStorage.removeItem(CUSTOM_GAME_STORAGE_KEY); } catch { /* ignore */ }
            idbSaveRounds(rounds).catch(() => {});
        }
        window.dispatchEvent(new CustomEvent('svoyak-game-updated'));
        return true;
    },

    exportJson() {
        return JSON.stringify(gameRounds, null, 2);
    },

    importJson(json) {
        const parsed = JSON.parse(json);
        if (!Array.isArray(parsed) || !parsed.length) {
            throw new Error('Нужен массив раундов');
        }
        this.save(parsed);
    },

    isCustom() {
        return !!localStorage.getItem(CUSTOM_GAME_STORAGE_KEY);
    }
};

function getRoundData(roundId) {
    return gameRounds.find(r => r.id === roundId) || gameRounds[0];
}

function resolveQuestionMedia(roundId, questionRef) {
    if (!questionRef) return null;
    const fromBoard = getAllQuestionsForRound(roundId).find(q => q.id === questionRef.id);
    return {
        ...questionRef,
        categoryName: questionRef.categoryName ?? fromBoard?.categoryName ?? '',
        text: questionRef.text ?? fromBoard?.text ?? '',
        answer: questionRef.answer ?? fromBoard?.answer ?? '',
        image: resolveImageSrc(questionRef.image) || resolveImageSrc(fromBoard?.image),
        answerImage: resolveImageSrc(questionRef.answerImage) || resolveImageSrc(fromBoard?.answerImage)
    };
}

function getAllQuestionsForRound(roundId) {
    const round = getRoundData(roundId);
    if (!round) return [];
    return round.categories.flatMap(cat =>
        cat.questions.map(q => ({ ...q, categoryName: cat.name }))
    );
}

function getRoundProgress(roundId, playedQuestions) {
    const all = getAllQuestionsForRound(roundId);
    const played = all.filter(q => playedQuestions.includes(q.id)).length;
    return { played, total: all.length };
}

function getRoundCount() {
    return gameRounds.length;
}

function getLastRoundId() {
    if (!gameRounds.length) return 0;
    return gameRounds[gameRounds.length - 1].id;
}

function isLastRound(roundId) {
    return roundId >= getLastRoundId();
}
