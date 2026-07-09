const DEFAULT_GAME_ROUNDS = [
    {
        id: 1,
        title: "Раунд 1",
        subtitle: "Разогрев — вопросы за 100–500",
        prices: [100, 200, 300, 400, 500],
        categories: [
            {
                name: "Тиндер и реальность",
                questions: [
                    { id: "r1_c1_100", price: 100, text: "Что пишут в био, когда на самом деле сидят «просто посмотреть»?", answer: "«Ищу серьёзные отношения»" },
                    { id: "r1_c1_200", price: 200, text: "Главный красный флаг в переписке?", answer: "«Привет, как дела?» без продолжения три дня" },
                    { id: "r1_c1_300", price: 300, text: "Что значит «у меня сложный график» на сайте знакомств?", answer: "Есть жена/муж (или ещё три чата)" },
                    { id: "r1_c1_400", price: 400, text: "Зачем на первом свидании берут наушники?", answer: "Чтоб сбежать, если пойдёт хрень" },
                    { id: "r1_c1_500", price: 500, text: "Самый честный лайк в приложении?", answer: "На фото с собакой — потому что собака реально милая" }
                ]
            },
            {
                name: "Пьяная правда",
                questions: [
                    { id: "r1_c2_100", price: 100, text: "Что обещают друзьям на третьей рюмке?", answer: "«Завтра на связи, братан»" },
                    { id: "r1_c2_200", price: 200, text: "Какой тост звучит как приговор?", answer: "«За тех, кого больше нет с нами» (а они в туалете)" },
                    { id: "r1_c2_300", price: 300, text: "Что пишут бывшему/бывшей в 2:47 ночи?", answer: "«Ты спишь?» (и сразу удаляют)" },
                    { id: "r1_c2_400", price: 400, text: "Главная причина «я вообще не пьяный»?", answer: "Потому что уже пьяный" },
                    { id: "r1_c2_500", price: 500, text: "Что находят в кармане наутро, кроме чека из такси?", answer: "Незнакомый номер и чувство стыда" }
                ]
            },
            {
                name: "Соседи слышат всё",
                questions: [
                    { id: "r1_c3_100", price: 100, text: "Что соседи узнают о вас раньше, чем вы сами?", answer: "Расписание ссор" },
                    { id: "r1_c3_200", price: 200, text: "Звук, после которого в подъезде завтра все будут смотреть в пол?", answer: "Стук каблуков в 3 ночи" },
                    { id: "r1_c3_300", price: 300, text: "Что кричат сквозь стену, когда уже поздно?", answer: "«Можно потише?!» (и сами громче)" },
                    { id: "r1_c3_400", price: 400, text: "Какой запах из квартиры соседа — лучший сериал?", answer: "Жареная рыба в воскресенье" },
                    { id: "r1_c3_500", price: 500, text: "Что соседка «случайно» расскажет на лестнице?", answer: "Что слышала вчера (все подробности)" }
                ]
            },
            {
                name: "Утро после",
                questions: [
                    { id: "r1_c4_100", price: 100, text: "Первое, что проверяют, открыв глаза?", answer: "Телефон (и кто писал)" },
                    { id: "r1_c4_200", price: 200, text: "Что ищут в квартире с паникой?", answer: "Трусы (свои или чужие — оба варианта плохие)" },
                    { id: "r1_c4_300", price: 300, text: "Главный завтрак героя?", answer: "Вода, аспирин и молчание" },
                    { id: "r1_c4_400", price: 400, text: "Фраза, которой оправдывают вчерашнее?", answer: "«Это был отличный вечер» (память отключена)" },
                    { id: "r1_c4_500", price: 500, text: "Что хуже похмелья?", answer: "Переписка, которую ты сам же и написал" }
                ]
            },
            {
                name: "Работа без цензуры",
                questions: [
                    { id: "r1_c5_100", price: 100, text: "Что делают в офисе, когда босс в отпуске?", answer: "Работают (шутка — обсуждают босса)" },
                    { id: "r1_c5_200", price: 200, text: "Сколько длится «созвон на 5 минут»?", answer: "Час, блять, минимум" },
                    { id: "r1_c5_300", price: 300, text: "Что пишут в статусе Teams, когда на самом деле в душе?", answer: "«В процессе»" },
                    { id: "r1_c5_400", price: 400, text: "Главная мотивация идти на работу в понедельник?", answer: "Кофе (и сплетни у кулера)" },
                    { id: "r1_c5_500", price: 500, text: "Что значит «я на связи» в рабочем чате?", answer: "Вижу сообщения, но мне пофиг до пятницы" }
                ]
            },
            {
                name: "Взрослые приколы",
                questions: [
                    { id: "r1_c6_100", price: 100, text: "Что покупают в аптеке, стараясь не смотреть в глаза?", answer: "Тест (или то, что надо)" },
                    { id: "r1_c6_200", price: 200, text: "На каком возрасте «вечеринка» превращается в «посиделки»?", answer: "Когда домой хочется в 23:00" },
                    { id: "r1_c6_300", price: 300, text: "Что говорят, когда забыли имя человека?", answer: "«Эй, красавчик!» (универсально)" },
                    { id: "r1_c6_400", price: 400, text: "Главный признак, что вы уже не студент?", answer: "Радость от нового полотенца" },
                    { id: "r1_c6_500", price: 500, text: "Что современный взрослый считает роскошью?", answer: "Выспаться и тишина" }
                ]
            }
        ]
    },
    {
        id: 2,
        title: "Раунд 2",
        subtitle: "Разгоняемся — вопросы за 200–1000",
        prices: [200, 400, 600, 800, 1000],
        categories: [
            {
                name: "Отношения без фильтра",
                questions: [
                    { id: "r2_c1_200", price: 200, text: "Что значит «нам надо поговорить»?", answer: "Ты в жопе, готовься" },
                    { id: "r2_c1_400", price: 400, text: "Главная ложь в паре?", answer: "«Я не злюсь»" },
                    { id: "r2_c1_600", price: 600, text: "Зачем партнёр спрашивает «ты меня любишь?» в 11 вечера?", answer: "Потому что сегодня накосячил(а)" },
                    { id: "r2_c1_800", price: 800, text: "Что опаснее, чем бывший в ленте?", answer: "«Случайный» лайк на его/её фото" },
                    { id: "r2_c1_1000", price: 1000, text: "Самый честный ответ на «где ты?»?", answer: "«Там, где и должен быть» (и это неправда)" }
                ]
            },
            {
                name: "Корпоративный ад",
                questions: [
                    { id: "r2_c2_200", price: 200, text: "Кто первый танцует на корпоративе?", answer: "Тот, кому завтра всё равно" },
                    { id: "r2_c2_400", price: 400, text: "Что HR называет «тимбилдингом»?", answer: "Принудительное веселье за свой счёт" },
                    { id: "r2_c2_600", price: 600, text: "Главный герой корпоратива к утру?", answer: "Тот, кто «ничего не помнит» (все помнят)" },
                    { id: "r2_c2_800", price: 800, text: "Что обсуждают в понедельник после корпоратива?", answer: "Кто с кем ушёл (и кто кому что писал)" },
                    { id: "r2_c2_1000", price: 1000, text: "Самый страшный подарок от коллег?", answer: "Общее фото с корпоратива в чат" }
                ]
            },
            {
                name: "Соцсети и стыд",
                questions: [
                    { id: "r2_c3_200", price: 200, text: "Что удаляют первым делом утром?", answer: "Сторис (или пост с цитатой)" },
                    { id: "r2_c3_400", price: 400, text: "Зачем ставят лайк фото трёхлетней давности?", answer: "Сталкинг, но «случайно»" },
                    { id: "r2_c3_600", price: 600, text: "Что пишут в комментах, когда нечего сказать?", answer: "🔥🔥🔥" },
                    { id: "r2_c3_800", price: 800, text: "Главный кринж взрослого человека?", answer: "Подписка на бывшего(ую) и лайки" },
                    { id: "r2_c3_1000", price: 1000, text: "Что хуже скриншота переписки?", answer: "Скриншот, который отправили не тому" }
                ]
            },
            {
                name: "Свидания: провал",
                questions: [
                    { id: "r2_c4_200", price: 200, text: "Фраза, после которой свидание можно закрывать?", answer: "«У меня ещё одно через час»" },
                    { id: "r2_c4_400", price: 400, text: "Что заказывают, когда хотят уйти побыстрее?", answer: "Только счёт" },
                    { id: "r2_c4_600", price: 600, text: "Главная причина «у меня срочные дела»?", answer: "Свидание — полный отстой" },
                    { id: "r2_c4_800", price: 800, text: "Что страшнее молчания на свидании?", answer: "Когда он/она рассказывает про экс два часа" },
                    { id: "r2_c4_1000", price: 1000, text: "Самый честный повод не перезвонить?", answer: "«Забыл(а)» = «Не хочу»" }
                ]
            },
            {
                name: "Друзья и вечеринки",
                questions: [
                    { id: "r2_c5_200", price: 200, text: "Кто на вечеринке орёт «Я домой!» и остаётся?", answer: "Каждый второй через час" },
                    { id: "r2_c5_400", price: 400, text: "Что друг расскажет всем, даже если ты просил молчать?", answer: "Всё. Абсолютно всё." },
                    { id: "r2_c5_600", price: 600, text: "Главный тест на настоящую дружбу?", answer: "Удалить фото до того, как выложат" },
                    { id: "r2_c5_800", price: 800, text: "Что значит «я за рулём» в 4 утра на вечеринке?", answer: "Такси, но гордость не позволяет признать" },
                    { id: "r2_c5_1000", price: 1000, text: "Когда вечеринка считается удавшейся?", answer: "Когда есть что вспоминать и что скрывать" }
                ]
            },
            {
                name: "Алкогольная мудрость",
                questions: [
                    { id: "r2_c6_200", price: 200, text: "Что говорят перед тем, как «в последний раз»?", answer: "«Ну один коктейль»" },
                    { id: "r2_c6_400", price: 400, text: "Главный враг трезвого утра?", answer: "«Продолжим вчерашний разговор»" },
                    { id: "r2_c6_600", price: 600, text: "Что покупают в «Пятёрочке» в 1:30 ночи?", answer: "Вода, снеки и раскаяние" },
                    { id: "r2_c6_800", price: 800, text: "Самый опасный тост?", answer: "«За любовь!» (когда любовь не та)" },
                    { id: "r2_c6_1000", price: 1000, text: "Что взрослый человек называет «лёгким вечером»?", answer: "Три бокала и половина бутылки" }
                ]
            }
        ]
    },
    {
        id: 3,
        title: "Раунд 3",
        subtitle: "Финал — вопросы за 500–2500",
        prices: [500, 1000, 1500, 2000, 2500],
        categories: [
            {
                name: "Брак и быт",
                questions: [
                    { id: "r3_c1_500", price: 500, text: "Что супруги называют «компромиссом»?", answer: "Когда проиграл(а) оба" },
                    { id: "r3_c1_1000", price: 1000, text: "Главный повод для ссоры в 23:00?", answer: "Кто последний помыл посуду (никто)" },
                    { id: "r3_c1_1500", price: 1500, text: "Что значит «давай обсудим спокойно» в браке?", answer: "Война, но с паузами" },
                    { id: "r3_c1_2000", price: 2000, text: "Самая страшная фраза с дивана?", answer: "«Ты опять на телефоне?»" },
                    { id: "r3_c1_2500", price: 2500, text: "Когда брак крепче всего?", answer: "Когда оба молчат и делают вид, что всё ок" }
                ]
            },
            {
                name: "Деньги и привычки",
                questions: [
                    { id: "r3_c2_500", price: 500, text: "Куда уходят деньги «на мелочь»?", answer: "На доставку еды в 2 ночи" },
                    { id: "r3_c2_1000", price: 1000, text: "Что покупают, когда говорят «экономлю»?", answer: "Подписку, которой не пользуются" },
                    { id: "r3_c2_1500", price: 1500, text: "Главная ложь в банковском приложении?", answer: "«Остаток до зарплаты»" },
                    { id: "r3_c2_2000", price: 2000, text: "Что дороже, чем кажется?", answer: "«Бесплатная» доставка от 1500" },
                    { id: "r3_c2_2500", price: 2500, text: "Самый честный финансовый план взрослого?", answer: "Дожить до зарплаты и не чекать счёт пьяным" }
                ]
            },
            {
                name: "Секс, ложь и переписка",
                questions: [
                    { id: "r3_c3_500", price: 500, text: "Что пишут вместо «я хочу тебя»?", answer: "«Ты спишь?»" },
                    { id: "r3_c3_1000", price: 1000, text: "Главный звук тонких стен?", answer: "«Тише!» (и сразу громче)" },
                    { id: "r3_c3_1500", price: 1500, text: "Что опаснее секса без защиты?", answer: "Секс без защиты переписки (скриншоты)" },
                    { id: "r3_c3_2000", price: 2000, text: "Фраза, после которой точно будет «продолжение»?", answer: "«У меня свободная квартира»" },
                    { id: "r3_c3_2500", price: 2500, text: "Самый честный отказ?", answer: "«Не сегодня, голова болит» (голова в порядке)" }
                ]
            },
            {
                name: "Родители узнают",
                questions: [
                    { id: "r3_c4_500", price: 500, text: "Что мама «чувствует» за километр?", answer: "Когда ты врёшь" },
                    { id: "r3_c4_1000", price: 1000, text: "Главный вопрос на семейном ужине?", answer: "«Ну когда уже дети?»" },
                    { id: "r3_c4_1500", price: 1500, text: "Что нельзя говорить родителям, но все говорят?", answer: "«Всё нормально»" },
                    { id: "r3_c4_2000", price: 2000, text: "Самый неловкий момент с родителями?", answer: "Когда они заходят без стука (и не вовремя)" },
                    { id: "r3_c4_2500", price: 2500, text: "Когда взрослый ребёнок чувствует себя подростком?", answer: "Когда мама спрашивает «ты ел?» в 35 лет" }
                ]
            },
            {
                name: "Философия взрослого",
                questions: [
                    { id: "r3_c5_500", price: 500, text: "Что значит «я взрослый» в 2025?", answer: "Плачу за всё сам(а) и ненавижу это" },
                    { id: "r3_c5_1000", price: 1000, text: "Главное открытие после 25?", answer: "Никто не знает, что делает" },
                    { id: "r3_c5_1500", price: 1500, text: "Что заменяет мечты в реальности?", answer: "Рассрочка" },
                    { id: "r3_c5_2000", price: 2000, text: "Самый честный жизненный совет?", answer: "«Хрен его знает, но как-нибудь проживём»" },
                    { id: "r3_c5_2500", price: 2500, text: "Когда человек становится по-настоящему взрослым?", answer: "Когда радуется новому пылесосу" }
                ]
            },
            {
                name: "Своя игра 18+",
                questions: [
                    { id: "r3_c6_500", price: 500, text: "Как называют игру, в которую вы сейчас играете?", answer: "Своя игра (Свояк)" },
                    { id: "r3_c6_1000", price: 1000, text: "Кто в этой игре принимает спорные ответы?", answer: "Ведущий (диктатор с бокалом)" },
                    { id: "r3_c6_1500", price: 1500, text: "Что кричит проигравший, улыбаясь?", answer: "«Да это нечестно!» (и просит реванш)" },
                    { id: "r3_c6_2000", price: 2000, text: "Главный приз победителя?", answer: "Право выбирать следующую бутылку" },
                    { id: "r3_c6_2500", price: 2500, text: "Когда вечер считается удалённым?", answer: "Когда кто-то орёт «ЕЩЁ РАУНД!»" }
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
const IMAGES_FOLDER = 'images';
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
                    if (isDataUrl(q.image)) delete q.image;
                    else q.image = normalizeImagePath(q.image);
                }
                if (q.answerImage) {
                    if (isDataUrl(q.answerImage)) delete q.answerImage;
                    else q.answerImage = normalizeImagePath(q.answerImage);
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
            'Нажмите «Вынести в папку images» в редакторе или загрузите фото заново.'
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
        if (countEmbeddedImages(cleaned) > 0) {
            if (typeof FirebaseMedia !== 'undefined' && FirebaseMedia.isReady()) {
                const result = await FirebaseMedia.uploadEmbeddedImagesInRounds(cleaned, onProgress);
                cleaned = result.rounds;
            } else {
                validateNoEmbeddedImages(cleaned);
            }
        }
        cleaned = sanitizeRoundsForStorage(cleaned);
        const result = await Promise.resolve(persistRounds(cleaned));
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
                idbSaveRounds(draft).catch(() => {});
            }
        }
        gameRounds = draft;
    },

    saveSync(rounds) {
        const json = JSON.stringify(rounds);
        localStorage.setItem(GAME_DATA_VERSION_KEY, GAME_DATA_VERSION);
        localStorage.setItem(CUSTOM_GAME_STORAGE_KEY, json);
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
        } catch { /* ignore */ }
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
        } catch { /* ignore */ }
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
