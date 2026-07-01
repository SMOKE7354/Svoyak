let state = createInitialState();
let lastEffectTimestamp = 0;
let roundAnnouncementTimer = null;
let connected = false;
let subscribed = false;

const connectScreen = document.getElementById('connect-screen');
const connectBtn = document.getElementById('connect-btn');
const connectStatus = document.getElementById('connect-status');

const screens = {
    lobby: document.getElementById('lobby-screen'),
    round: document.getElementById('round-screen'),
    board: document.getElementById('board-screen'),
    question: document.getElementById('question-screen'),
    finale: document.getElementById('finale-screen')
};

const grid = document.getElementById('grid');
const playersScores = document.getElementById('players-scores');
const playersScoresQuestion = document.getElementById('players-scores-question');
const questionPrice = document.getElementById('question-price');
const questionCategory = document.getElementById('question-category');
const questionText = document.getElementById('question-text');
const questionImage = document.getElementById('question-image');
const questionAnswerDisplay = document.getElementById('question-answer-display');
const timerDisplay = document.getElementById('timer-display');
const effectsOverlay = document.getElementById('effects-overlay');
const displayStatus = document.getElementById('display-status');
const displayPlayersPreview = document.getElementById('display-players-preview');
const boardRoundBadge = document.getElementById('board-round-badge');
const roundNumber = document.getElementById('round-number');
const roundTitle = document.getElementById('round-title');
const roundSubtitle = document.getElementById('round-subtitle');
const roundCurtain = document.getElementById('round-curtain');
const finaleWinners = document.getElementById('finale-winners');
let showingRoundSplash = false;

function init() {
    setupConnectUI();
    connectToGame();
}

function setupConnectUI() {
    connectBtn.addEventListener('click', connectToGame);
}

function connectToGame() {
    connectBtn.disabled = true;
    connectStatus.textContent = 'Подключение к Firebase…';
    connectStatus.className = 'connect-status';

    if (!gameSync.isFirebaseReady()) {
        connectBtn.disabled = false;
        connectStatus.textContent = 'Firebase не настроен на сайте. Залейте firebase-config.js на GitHub.';
        connectStatus.className = 'connect-status error';
        return;
    }

    gameSync.initDisplay(gameSync.getRoomCode(), {
        onState: (newState) => {
            if (!connected) {
                connected = true;
                hideConnectScreen('cloud');
            }
            onStateUpdate(newState);
        },
        onConnected: (_code, mode) => {
            connected = true;
            hideConnectScreen(mode);
        },
        onDisconnected: () => {
            connected = false;
            showConnectScreen('Связь с Firebase потеряна. Обновите страницу.');
        }
    }).then((result) => {
        if (!connected) {
            connected = true;
            hideConnectScreen(result?.mode || 'cloud');
        }
        connectStatus.textContent = '';
    }).catch((err) => {
        connectBtn.disabled = false;
        connectStatus.textContent = err.message || 'Ошибка подключения к Firebase';
        connectStatus.className = 'connect-status error';
    });
}

function hideConnectScreen(mode) {
    connectScreen.classList.remove('active');
    connectScreen.classList.add('hidden');
    if (!subscribed) {
        gameSync.subscribe(onStateUpdate);
        subscribed = true;
    }
    state = gameSync.load();
    renderScreen();

    if (mode === 'local' && gameSync.needsFirebaseSetup() && state.players.length === 0) {
        displayStatus.innerHTML = '<div class="pulse-dot connected"></div><span>Подключено (один компьютер). Для 2 ноутбуков — настройте Firebase</span>';
    }
}

function showConnectScreen(message) {
    connectScreen.classList.remove('hidden');
    connectScreen.classList.add('active');
    Object.values(screens).forEach(s => {
        if (s) { s.classList.remove('active'); s.classList.add('hidden'); }
    });
    connectBtn.disabled = false;
    if (message) {
        connectStatus.textContent = message;
        connectStatus.className = 'connect-status error';
    }
}

function onStateUpdate(newState) {
    const prevAnnouncement = state.roundAnnouncement;
    state = normalizeState(newState);
    renderScreen();

    if (state.roundAnnouncement && state.roundAnnouncement !== prevAnnouncement) {
        showRoundAnnouncement();
    }

    if (state.timerValue !== undefined && state.timerValue !== null) {
        timerDisplay.textContent = state.timerValue;
        timerDisplay.classList.remove('hidden');
        timerDisplay.classList.toggle('danger-pulse', state.timerValue <= 5);
    } else if (state.screen !== 'question') {
        timerDisplay.classList.add('hidden');
    }

    if (state.effect && state.effectTimestamp && state.effectTimestamp !== lastEffectTimestamp) {
        lastEffectTimestamp = state.effectTimestamp;
        playEffect(state.effect);
    }
}

function showRoundAnnouncement() {
    const round = getRoundData(state.currentRound);
    if (!round) return;

    roundNumber.textContent = round.id;
    roundTitle.textContent = round.title;
    roundSubtitle.textContent = round.subtitle;

    showingRoundSplash = true;
    if (roundCurtain) roundCurtain.classList.remove('exit');

    Object.values(screens).forEach(s => {
        if (s) { s.classList.remove('active'); s.classList.add('hidden'); }
    });
    screens.round.classList.remove('hidden');
    screens.round.classList.add('active');

    clearTimeout(roundAnnouncementTimer);
    roundAnnouncementTimer = setTimeout(() => {
        if (roundCurtain) roundCurtain.classList.add('exit');
        setTimeout(() => {
            showingRoundSplash = false;
            if (state.screen === 'board') renderScreen();
        }, 850);
    }, 2200);
}

function playEffect(effectName) {
    if (!effectsOverlay) return;
    effectsOverlay.className = `effects-overlay ${effectName}`;
    setTimeout(() => {
        effectsOverlay.className = 'effects-overlay hidden';
    }, 1500);
}

function renderScreen() {
    if (showingRoundSplash) return;

    if (state.screen === 'board' || state.screen === 'question') {
        if (!state.currentRound || !getRoundData(state.currentRound)) {
            state.screen = 'lobby';
        }
    }

    Object.values(screens).forEach(s => {
        if (s) { s.classList.remove('active'); s.classList.add('hidden'); }
    });

    const screen = screens[state.screen];
    if (screen) {
        screen.classList.remove('hidden');
        screen.classList.add('active');
        screen.classList.add('screen-enter');
        setTimeout(() => screen.classList.remove('screen-enter'), 500);
    }

    switch (state.screen) {
        case 'lobby':
            renderLobby();
            break;
        case 'board':
            renderBoard();
            renderScores();
            break;
        case 'question':
            renderQuestion();
            renderScores();
            break;
        case 'finale':
            renderFinale();
            break;
    }
}

function renderLobby() {
    if (state.players.length > 0) {
        displayStatus.innerHTML = state.currentRound > 0
            ? '<div class="pulse-dot connected"></div><span>Перерыв между раундами</span>'
            : '<div class="pulse-dot connected"></div><span>Игроки готовы — ждём старт от ведущего</span>';
        displayPlayersPreview.classList.remove('hidden');
        if (state.currentRound > 0) {
            const sorted = [...state.players].sort((a, b) => b.score - a.score);
            displayPlayersPreview.innerHTML = sorted
                .map(p => `<span class="player-chip">${p.name}: <strong>${p.score}</strong></span>`)
                .join('');
        } else {
            displayPlayersPreview.innerHTML = state.players
                .map(p => `<span class="player-chip">${p.name}</span>`)
                .join('');
        }
    } else {
        displayStatus.innerHTML = '<div class="pulse-dot"></div><span>Ожидание ведущего…</span>';
        displayPlayersPreview.classList.add('hidden');
    }
}

function renderBoard() {
    if (!grid) return;
    const round = getRoundData(state.currentRound);
    if (!round) return;

    const played = state.playedQuestions || [];

    boardRoundBadge.textContent = round.title;

    grid.innerHTML = '';
    const cols = round.categories.length;
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    grid.style.gridTemplateRows = `auto repeat(5, minmax(70px, 1fr))`;

    let cellIndex = 0;
    round.categories.forEach(cat => {
        const cell = document.createElement('div');
        cell.className = 'cell category-name cell-pop';
        cell.style.animationDelay = `${cellIndex * 0.04}s`;
        cell.textContent = cat.name;
        grid.appendChild(cell);
        cellIndex++;
    });

    for (let i = 0; i < 5; i++) {
        round.categories.forEach(cat => {
            const q = cat.questions[i];
            if (!q) return;
            const cell = document.createElement('div');
            cell.className = 'cell question-cell cell-pop';
            cell.style.animationDelay = `${cellIndex * 0.04}s`;
            cellIndex++;
            if (played.includes(q.id)) {
                cell.classList.add('played');
                cell.textContent = '';
            } else {
                cell.textContent = q.price;
            }
            grid.appendChild(cell);
        });
    }
}

function renderScores() {
    const renderTo = (container) => {
        if (!container) return;
        container.innerHTML = '';
        state.players.forEach((p, i) => {
            const card = document.createElement('div');
            card.className = 'player-score-card cell-pop';
            card.style.animationDelay = `${i * 0.08}s`;
            card.innerHTML = `<div class="p-name">${p.name}</div><div class="p-score">${p.score}</div>`;
            container.appendChild(card);
        });
    };
    if (state.screen === 'board') renderTo(playersScores);
    if (state.screen === 'question') renderTo(playersScoresQuestion);
}

function renderQuestion() {
    if (!state.currentQuestion) return;

    questionPrice.textContent = state.currentQuestion.price;
    questionCategory.textContent = state.currentQuestion.categoryName || '';
    questionText.textContent = state.currentQuestion.text;

    if (state.currentQuestion.image) {
        questionImage.src = state.currentQuestion.image;
        questionImage.classList.remove('hidden');
    } else {
        questionImage.classList.add('hidden');
        questionImage.src = '';
    }

    if (state.showAnswer) {
        questionAnswerDisplay.innerHTML = `<strong>Ответ:</strong> ${state.currentQuestion.answer}`;
        questionAnswerDisplay.classList.remove('hidden');
    } else {
        questionAnswerDisplay.classList.add('hidden');
    }

    if (state.timerValue !== undefined && state.timerValue !== null) {
        timerDisplay.textContent = state.timerValue;
        timerDisplay.classList.remove('hidden');
        timerDisplay.classList.toggle('danger-pulse', state.timerValue <= 5);
    }
}

function renderFinale() {
    if (!finaleWinners) return;
    const sorted = [...state.players].sort((a, b) => b.score - a.score);
    const maxScore = sorted[0]?.score ?? 0;
    const winners = sorted.filter(p => p.score === maxScore);

    finaleWinners.innerHTML = sorted.map((p, i) => {
        const isWinner = winners.includes(p);
        return `
            <div class="finale-row ${isWinner ? 'winner' : ''}">
                <span class="finale-place">${i + 1}</span>
                <span class="finale-name">${p.name}</span>
                <span class="finale-score">${p.score}</span>
            </div>
        `;
    }).join('');
}

init();
