let state = createInitialState();
let timerInterval = null;
let lastBoardKey = '';
let lastScreen = null;

const hostLobbyScreen = document.getElementById('host-lobby-screen');
const hostGameScreen = document.getElementById('host-game-screen');
const hostBoardScreen = document.getElementById('host-board-screen');
const hostQuestionScreen = document.getElementById('host-question-screen');
const hostGrid = document.getElementById('host-grid');
const hostRoundIndicator = document.getElementById('host-round-indicator');
const hostProgress = document.getElementById('host-progress');
const sidebarPlayersList = document.getElementById('sidebar-players-list');
const quickScorePanel = document.getElementById('quick-score-panel');
const hostTimerBadge = document.getElementById('host-timer-badge');
const hostTimerVal = document.getElementById('host-timer-val');
const hostToBoardBtn = document.getElementById('host-to-board-btn');
const hostStatus = document.getElementById('host-status');
const firebaseBanner = document.getElementById('firebase-setup-banner');

const playerInput = document.getElementById('player-input');
const addPlayerBtn = document.getElementById('add-player-btn');
const playersList = document.getElementById('players-list');
const roundHint = document.getElementById('round-hint');

const hostQCategory = document.getElementById('host-q-category');
const hostQPrice = document.getElementById('host-q-price');
const hostQText = document.getElementById('host-q-text');
const hostQAnswer = document.getElementById('host-q-answer');

function init() {
    state = gameSync.load();
    setupEventListeners();

    if (gameSync.needsFirebaseSetup() && firebaseBanner) {
        firebaseBanner.classList.remove('hidden');
        firebaseBanner.textContent = 'Настройте Firebase в js/firebase-config.js для двух ноутбуков';
    }

    gameSync.initHost({
        onReady: (_code, mode) => {
            updateHostConnectionStatus(false);
            if (firebaseBanner && mode === 'cloud') firebaseBanner.classList.add('hidden');
        },
        onDisplayConnected: () => updateHostConnectionStatus(true),
        onDisplayDisconnected: () => updateHostConnectionStatus(false)
    }).catch((err) => {
        if (firebaseBanner) {
            firebaseBanner.classList.remove('hidden');
            firebaseBanner.textContent = `Firebase: ${err.message}`;
        }
    });

    renderAll();
}

function updateHostConnectionStatus(ok) {
    if (!hostStatus) return;
    hostStatus.textContent = ok ? 'TV online' : 'TV offline';
    hostStatus.className = `host-status ${ok ? 'connected' : 'disconnected'}`;
}

function saveState(full = true) {
    gameSync.save(state);
    if (full) renderAll();
    else refreshScores();
}

function refreshScores() {
    renderSidebar();
    if (state.screen === 'question') renderQuickScore();
}

function setupEventListeners() {
    addPlayerBtn.addEventListener('click', addPlayer);
    playerInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addPlayer(); });

    document.querySelectorAll('.round-btn').forEach(btn => {
        btn.addEventListener('click', () => startRound(parseInt(btn.dataset.round)));
    });

    document.getElementById('reset-game-btn').addEventListener('click', resetGame);
    document.getElementById('end-round-btn').addEventListener('click', endRound);
    document.getElementById('close-question-btn').addEventListener('click', goToBoard);
    hostToBoardBtn?.addEventListener('click', goToBoard);
    document.getElementById('nobody-answered-btn').addEventListener('click', nobodyAnswered);
    document.getElementById('show-answer-btn').addEventListener('click', () => {
        state.showAnswer = true;
        stopTimer();
        saveState(false);
        gameSync.save(state);
    });
    document.getElementById('start-timer-btn').addEventListener('click', startTimer);
    document.getElementById('stop-timer-btn')?.addEventListener('click', stopTimer);

    document.addEventListener('keydown', (e) => {
        if (state.screen !== 'question' || !state.currentQuestion) return;
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
        if (e.code === 'Space') { e.preventDefault(); startTimer(); }
        if (e.code === 'KeyA') { state.showAnswer = true; stopTimer(); gameSync.save(state); }
        if (e.code === 'Escape') goToBoard();
        if (e.code === 'KeyN') nobodyAnswered();
    });
}

function addPlayer() {
    const name = playerInput.value.trim();
    if (!name) return;
    state.players.push({ id: Date.now().toString(), name, score: 0 });
    playerInput.value = '';
    saveState();
}

function removePlayer(id) {
    state.players = state.players.filter(p => p.id !== id);
    saveState();
}

function startRound(roundId) {
    if (state.players.length === 0) return;
    if (roundId > 1 && state.currentRound < roundId - 1) {
        alert(`Сначала завершите раунд ${roundId - 1}`);
        return;
    }
    state.currentRound = roundId;
    state.screen = 'board';
    state.currentQuestion = null;
    state.showAnswer = false;
    state.roundAnnouncement = Date.now();
    if (!Array.isArray(state.playedQuestions)) state.playedQuestions = [];
    lastBoardKey = '';
    stopTimer();
    saveState();
}

function endRound() {
    const progress = getRoundProgress(state.currentRound, state.playedQuestions);
    if (progress.played < progress.total) {
        if (!confirm(`Сыграно ${progress.played}/${progress.total}. Завершить?`)) return;
    }
    if (state.currentRound >= 3) {
        state.screen = 'finale';
        state.currentQuestion = null;
        stopTimer();
        saveState();
        return;
    }
    state.screen = 'lobby';
    state.currentQuestion = null;
    lastBoardKey = '';
    stopTimer();
    saveState();
}

function resetGame() {
    if (!confirm('Новая игра?')) return;
    stopTimer();
    lastBoardKey = '';
    state = gameSync.reset();
    renderAll();
}

function openQuestion(categoryName, q) {
    state.currentQuestion = { categoryName, id: q.id, price: q.price, text: q.text, answer: q.answer, image: q.image };
    state.screen = 'question';
    state.showAnswer = false;
    stopTimer();
    saveState();
}

function goToBoard() {
    if (state.screen === 'question' && state.currentQuestion) {
        if (!state.playedQuestions.includes(state.currentQuestion.id)) {
            state.playedQuestions.push(state.currentQuestion.id);
        }
        lastBoardKey = '';
    }
    state.currentQuestion = null;
    state.screen = 'board';
    state.showAnswer = false;
    stopTimer();
    saveState();
}

function nobodyAnswered() {
    if (!state.currentQuestion) return;
    triggerEffect('wrong');
    setTimeout(goToBoard, 600);
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    const duration = parseInt(document.getElementById('timer-val').value) || 30;
    state.timerValue = duration;
    state.timerActive = true;
    gameSync.save(state);
    updateTimerUI();

    timerInterval = setInterval(() => {
        state.timerValue -= 1;
        updateTimerUI();
        if (state.timerValue <= 0) {
            state.timerValue = 0;
            state.timerActive = false;
            clearInterval(timerInterval);
            timerInterval = null;
            triggerEffect('wrong');
        }
        gameSync.save(state);
    }, 1000);
}

function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    state.timerValue = null;
    state.timerActive = false;
    updateTimerUI();
}

function updateTimerUI() {
    if (state.timerValue != null) {
        hostTimerBadge.classList.remove('hidden');
        hostTimerVal.textContent = state.timerValue;
        hostTimerBadge.classList.toggle('urgent', state.timerValue <= 5);
    } else {
        hostTimerBadge.classList.add('hidden');
    }
}

function changeScore(playerId, amount) {
    const player = state.players.find(p => p.id === playerId);
    if (!player) return;
    player.score += amount;
    if (amount > 0) triggerEffect('correct');
    else if (amount < 0) triggerEffect('wrong');
    else gameSync.save(state);
    refreshScores();
}

function triggerEffect(effectName) {
    state.effect = effectName;
    state.effectTimestamp = Date.now();
    gameSync.save(state);
}

function renderAll() {
    const inGame = state.screen === 'board' || state.screen === 'question';

    hostLobbyScreen.classList.toggle('active', !inGame);
    hostLobbyScreen.classList.toggle('hidden', inGame);
    hostGameScreen.classList.toggle('active', inGame);
    hostGameScreen.classList.toggle('hidden', !inGame);

    if (inGame) renderGame();
    else renderLobby();
}

function renderLobby() {
    playersList.innerHTML = state.players.map(p =>
        `<li><span>${p.name}</span><button type="button" onclick="removePlayer('${p.id}')">✕</button></li>`
    ).join('');

    const has = state.players.length > 0;
    const between = state.screen === 'lobby' || state.screen === 'finale';
    document.querySelectorAll('.round-btn').forEach(btn => {
        const id = parseInt(btn.dataset.round);
        btn.disabled = !has || (id > 1 && state.currentRound < id - 1) || (between && id <= state.currentRound && state.currentRound > 0);
        btn.classList.toggle('completed', state.currentRound > id);
    });

    if (!has) roundHint.textContent = 'Добавьте игроков';
    else if (state.screen === 'finale') roundHint.textContent = 'Игра окончена!';
    else if (!state.currentRound) roundHint.textContent = 'Запустите раунд 1';
    else if (state.currentRound < 3) roundHint.textContent = `Раунд ${state.currentRound} done → раунд ${state.currentRound + 1}`;
    else roundHint.textContent = 'Завершите раунд 3';
}

function renderGame() {
    const round = getRoundData(state.currentRound);
    if (round) hostRoundIndicator.textContent = round.title;

    const prog = getRoundProgress(state.currentRound, state.playedQuestions);
    hostProgress.textContent = `${prog.played}/${prog.total}`;
    hostProgress.classList.remove('hidden');

    const onQuestion = state.screen === 'question';
    hostBoardScreen.classList.toggle('active', !onQuestion);
    hostQuestionScreen.classList.toggle('active', onQuestion);
    hostToBoardBtn?.classList.toggle('hidden', !onQuestion);

    if (!onQuestion) renderBoardIfNeeded();
    else renderQuestion();

    renderSidebar();
    lastScreen = state.screen;
}

function renderBoardIfNeeded() {
    const key = `${state.currentRound}:${state.playedQuestions.join(',')}`;
    if (key === lastBoardKey && hostGrid.children.length) return;
    lastBoardKey = key;
    renderBoard();
}

function renderBoard() {
    const round = getRoundData(state.currentRound);
    if (!round || !hostGrid) return;

    const played = state.playedQuestions || [];
    const cols = round.categories.length;

    hostGrid.innerHTML = '';
    hostGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    hostGrid.style.gridTemplateRows = `auto repeat(5, minmax(44px, 1fr))`;

    round.categories.forEach(cat => {
        const cell = document.createElement('div');
        cell.className = 'cell category-name';
        cell.textContent = cat.name;
        hostGrid.appendChild(cell);
    });

    let idx = 0;
    for (let i = 0; i < 5; i++) {
        round.categories.forEach(cat => {
            const q = cat.questions[i];
            if (!q) return;
            const cell = document.createElement('div');
            cell.className = 'cell question-cell host-question-cell';
            if (played.includes(q.id)) {
                cell.classList.add('played');
                cell.textContent = '—';
            } else {
                cell.textContent = q.price;
                cell.onclick = () => openQuestion(cat.name, q);
            }
            hostGrid.appendChild(cell);
            idx++;
        });
    }
}

function renderQuestion() {
    if (!state.currentQuestion) return;
    hostQCategory.textContent = state.currentQuestion.categoryName;
    hostQPrice.textContent = state.currentQuestion.price;
    hostQText.textContent = state.currentQuestion.text;
    hostQAnswer.textContent = state.currentQuestion.answer;
    updateTimerUI();
    renderQuickScore();
}

function renderQuickScore() {
    if (!state.currentQuestion || !quickScorePanel) return;
    const price = state.currentQuestion.price;
    quickScorePanel.innerHTML = state.players.map(p => `
        <div class="quick-score-row">
            <span class="qs-name">${p.name}</span>
            <button class="btn-sm danger" onclick="changeScore('${p.id}', -${price})">−${price}</button>
            <button class="btn-sm success" onclick="changeScore('${p.id}', ${price})">+${price}</button>
        </div>
    `).join('');
}

function renderSidebar() {
    if (!sidebarPlayersList) return;
    const onQ = state.screen === 'question' && state.currentQuestion;
    const price = onQ ? state.currentQuestion.price : 0;

    sidebarPlayersList.innerHTML = state.players.map(p => {
        if (onQ) {
            return `<div class="player-row compact">
                <span class="p-name">${p.name}</span>
                <span class="p-score" data-id="${p.id}">${p.score}</span>
                <div class="p-btns">
                    <button class="btn-sm danger" onclick="changeScore('${p.id}', -${price})">−</button>
                    <button class="btn-sm success" onclick="changeScore('${p.id}', ${price})">+</button>
                </div>
            </div>`;
        }
        return `<div class="player-row compact">
            <span class="p-name">${p.name}</span>
            <span class="p-score" data-id="${p.id}">${p.score}</span>
        </div>`;
    }).join('');
}

window.removePlayer = removePlayer;
window.changeScore = changeScore;
window.triggerEffect = triggerEffect;

init();
