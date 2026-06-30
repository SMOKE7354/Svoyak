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
const finaleWinners = document.getElementById('finale-winners');

function init() {
    setupConnectUI();
    connectToGame();
}

function setupConnectUI() {
    connectBtn.addEventListener('click', connectToGame);
}

function connectToGame() {
    connectBtn.disabled = true;
    connectStatus.textContent = 'Подключение…';
    connectStatus.className = 'connect-status';

    gameSync.initDisplay(gameSync.getRoomCode(), {
        onState: (newState) => {
            if (!connected) {
                connected = true;
                hideConnectScreen();
            }
            onStateUpdate(newState);
        },
        onConnected: (_code, mode) => {
            connected = true;
            hideConnectScreen(mode);
        },
        onDisconnected: () => {
            connected = false;
            showConnectScreen('Связь потеряна. Обновите страницу.');
        }
    }).then((result) => {
        if (!connected) {
            connected = true;
            hideConnectScreen(result?.mode || 'local');
        }
    }).catch((err) => {
        connectBtn.disabled = false;
        connectStatus.textContent = err.message || 'Ошибка подключения';
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
    state = newState;
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

    Object.values(screens).forEach(s => {
        if (s) { s.classList.remove('active'); s.classList.add('hidden'); }
    });
    screens.round.classList.remove('hidden');
    screens.round.classList.add('active');

    clearTimeout(roundAnnouncementTimer);
    roundAnnouncementTimer = setTimeout(() => {
        if (state.screen === 'board') renderScreen();
    }, 3500);
}

function playEffect(effectName) {
    if (!effectsOverlay) return;
    effectsOverlay.className = `effects-overlay ${effectName}`;
    setTimeout(() => {
        effectsOverlay.className = 'effects-overlay hidden';
    }, 1500);
}

function renderScreen() {
    if (state.roundAnnouncement && Date.now() - state.roundAnnouncement < 3500) {
        return;
    }

    Object.values(screens).forEach(s => {
        if (s) { s.classList.remove('active'); s.classList.add('hidden'); }
    });

    const screen = screens[state.screen];
    if (screen) {
        screen.classList.remove('hidden');
        screen.classList.add('active');
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

    boardRoundBadge.textContent = round.title;

    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${round.categories.length}, 1fr)`;
    grid.style.gridTemplateRows = `auto repeat(5, 1fr)`;

    round.categories.forEach(cat => {
        const cell = document.createElement('div');
        cell.className = 'cell category-name';
        cell.textContent = cat.name;
        grid.appendChild(cell);
    });

    for (let i = 0; i < 5; i++) {
        round.categories.forEach(cat => {
            const q = cat.questions[i];
            if (!q) return;
            const cell = document.createElement('div');
            cell.className = 'cell question-cell';
            if (state.playedQuestions.includes(q.id)) {
                cell.classList.add('played');
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
        state.players.forEach(p => {
            const card = document.createElement('div');
            card.className = 'player-score-card';
            card.innerHTML = `
                <div class="p-name">${p.name}</div>
                <div class="p-score">${p.score}</div>
            `;
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
