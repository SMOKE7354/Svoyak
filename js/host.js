let state = createInitialState();
let timerInterval = null;

const hostLobbyScreen = document.getElementById('host-lobby-screen');
const hostGameScreen = document.getElementById('host-game-screen');
const hostBoardScreen = document.getElementById('host-board-screen');
const hostQuestionScreen = document.getElementById('host-question-screen');
const hostGrid = document.getElementById('host-grid');
const hostRoundIndicator = document.getElementById('host-round-indicator');
const hostProgress = document.getElementById('host-progress');
const hostBoardTitle = document.getElementById('host-board-title');
const hostBoardProgress = document.getElementById('host-board-progress');
const sidebarPlayersList = document.getElementById('sidebar-players-list');
const quickScorePanel = document.getElementById('quick-score-panel');
const quickScoreButtons = document.getElementById('quick-score-buttons');
const hostTimerBadge = document.getElementById('host-timer-badge');
const hostTimerVal = document.getElementById('host-timer-val');

const playerInput = document.getElementById('player-input');
const addPlayerBtn = document.getElementById('add-player-btn');
const playersList = document.getElementById('players-list');
const roundHint = document.getElementById('round-hint');

const hostQCategory = document.getElementById('host-q-category');
const hostQPrice = document.getElementById('host-q-price');
const hostQText = document.getElementById('host-q-text');
const hostQAnswer = document.getElementById('host-q-answer');

const manualPlayerSelect = document.getElementById('manual-player-select');
const manualScoreInput = document.getElementById('manual-score-input');
const hostStatus = document.getElementById('host-status');
const hostRoomCode = document.getElementById('host-room-code');
const hostSyncHint = document.getElementById('host-sync-hint');
const firebaseBanner = document.getElementById('firebase-setup-banner');
const hostToBoardBtn = document.getElementById('host-to-board-btn');
const hostSidebarBoardBtn = document.getElementById('host-sidebar-board-btn');

function init() {
    state = gameSync.load();
    setupEventListeners();

    if (hostRoomCode) hostRoomCode.textContent = gameSync.getRoomCode();

    if (gameSync.needsFirebaseSetup() && firebaseBanner) {
        firebaseBanner.classList.remove('hidden');
    }

    gameSync.initHost({
        onReady: (_code, mode) => {
            updateHostConnectionStatus(false);
            if (hostSyncHint) {
                hostSyncHint.textContent = gameSync.getSyncHint(mode);
            }
            if (firebaseBanner && mode === 'cloud') {
                firebaseBanner.classList.add('hidden');
            }
        },
        onDisplayConnected: () => updateHostConnectionStatus(true),
        onDisplayDisconnected: () => updateHostConnectionStatus(false)
    }).catch((err) => {
        if (hostSyncHint) {
            hostSyncHint.textContent = err.message || 'Ошибка Firebase';
        }
        if (firebaseBanner) {
            firebaseBanner.classList.remove('hidden');
            firebaseBanner.innerHTML = `<strong>Ошибка Firebase:</strong> ${err.message || 'проверьте Rules'}`;
        }
    });

    renderAll();
}

function updateHostConnectionStatus(isConnected) {
    if (!hostStatus) return;
    hostStatus.textContent = isConnected ? 'Табло подключено' : 'Табло не подключено';
    hostStatus.className = `host-status ${isConnected ? 'connected' : 'disconnected'}`;
}

function saveState() {
    gameSync.save(state);
    renderAll();
}

function setupEventListeners() {
    addPlayerBtn.addEventListener('click', addPlayer);
    playerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addPlayer();
    });

    document.querySelectorAll('.round-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const roundId = parseInt(btn.dataset.round);
            startRound(roundId);
        });
    });

    document.getElementById('reset-game-btn').addEventListener('click', resetGame);
    document.getElementById('end-round-btn').addEventListener('click', endRound);
    document.getElementById('close-question-btn').addEventListener('click', goToBoard);
    hostToBoardBtn?.addEventListener('click', goToBoard);
    hostSidebarBoardBtn?.addEventListener('click', goToBoard);
    document.getElementById('nobody-answered-btn').addEventListener('click', nobodyAnswered);
    document.getElementById('show-answer-btn').addEventListener('click', () => {
        state.showAnswer = true;
        stopTimer();
        saveState();
    });
    document.getElementById('start-timer-btn').addEventListener('click', startTimer);
    document.getElementById('stop-timer-btn').addEventListener('click', stopTimer);
    document.getElementById('manual-plus-btn').addEventListener('click', () => adjustManualScore(1));
    document.getElementById('manual-minus-btn').addEventListener('click', () => adjustManualScore(-1));

    document.addEventListener('keydown', (e) => {
        if (state.screen !== 'question' || !state.currentQuestion) return;
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

        if (e.code === 'Space') { e.preventDefault(); startTimer(); }
        if (e.code === 'KeyA') { state.showAnswer = true; stopTimer(); saveState(); }
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
    stopTimer();
    saveState();
}

function endRound() {
    const round = getRoundData(state.currentRound);
    const progress = getRoundProgress(state.currentRound, state.playedQuestions);

    if (progress.played < progress.total) {
        if (!confirm(`Сыграно ${progress.played} из ${progress.total} вопросов. Завершить раунд досрочно?`)) return;
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
    stopTimer();
    saveState();
}

function resetGame() {
    if (!confirm('Начать новую игру? Все очки и прогресс будут сброшены.')) return;
    stopTimer();
    state = gameSync.reset();
    renderAll();
}

function openQuestion(categoryName, q) {
    state.currentQuestion = {
        categoryName,
        id: q.id,
        price: q.price,
        text: q.text,
        answer: q.answer,
        image: q.image
    };
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
    }
    state.currentQuestion = null;
    state.screen = 'board';
    state.showAnswer = false;
    stopTimer();
    saveState();
}

function closeQuestion() {
    goToBoard();
}

function nobodyAnswered() {
    if (!state.currentQuestion) return;
    triggerEffect('wrong');
    setTimeout(closeQuestion, 800);
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
    if (state.timerValue !== null && state.timerValue !== undefined) {
        hostTimerBadge.classList.remove('hidden');
        hostTimerVal.textContent = state.timerValue;
        hostTimerBadge.classList.toggle('urgent', state.timerValue <= 5);
    } else {
        hostTimerBadge.classList.add('hidden');
    }
}

function adjustManualScore(multiplier) {
    const playerId = manualPlayerSelect.value;
    const scoreVal = parseInt(manualScoreInput.value);
    if (playerId && !isNaN(scoreVal)) {
        changeScore(playerId, scoreVal * multiplier);
    }
}

function changeScore(playerId, amount) {
    const player = state.players.find(p => p.id === playerId);
    if (!player) return;
    player.score += amount;
    if (amount > 0) triggerEffect('correct');
    else if (amount < 0) triggerEffect('wrong');
    saveState();
}

function triggerEffect(effectName) {
    state.effect = effectName;
    state.effectTimestamp = Date.now();
    gameSync.save(state);
    renderSidebar();
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
    playersList.innerHTML = '';
    state.players.forEach(p => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${p.name}</span><button type="button" onclick="removePlayer('${p.id}')">✕</button>`;
        playersList.appendChild(li);
    });

    const hasPlayers = state.players.length > 0;
    const betweenRounds = state.screen === 'lobby' || state.screen === 'finale';
    document.querySelectorAll('.round-btn').forEach(btn => {
        const roundId = parseInt(btn.dataset.round);
        btn.disabled = !hasPlayers
            || (roundId > 1 && state.currentRound < roundId - 1)
            || (betweenRounds && roundId <= state.currentRound && state.currentRound > 0);
        btn.classList.toggle('completed', state.currentRound > roundId);
        btn.classList.toggle('current', state.currentRound === roundId && inGameScreen());
    });

    if (!hasPlayers) {
        roundHint.textContent = 'Добавьте хотя бы одного игрока';
    } else if (state.screen === 'finale') {
        roundHint.textContent = 'Игра окончена! Результаты на большом экране. Нажмите «Новая игра» для рестарта.';
    } else if (state.currentRound === 0) {
        roundHint.textContent = 'Нажмите «Раунд 1» для начала игры';
    } else if (state.currentRound < 3) {
        roundHint.textContent = `Раунд ${state.currentRound} завершён — можно запустить раунд ${state.currentRound + 1}`;
    } else {
        roundHint.textContent = 'Завершите раунд 3 — на экране появится финальная таблица';
    }
}

function inGameScreen() {
    return state.screen === 'board' || state.screen === 'question';
}

function renderGame() {
    const round = getRoundData(state.currentRound);
    if (round) {
        hostRoundIndicator.textContent = round.title;
        hostBoardTitle.textContent = round.title;
    }

    const progress = getRoundProgress(state.currentRound, state.playedQuestions);
    hostProgress.textContent = `${progress.played}/${progress.total}`;
    hostProgress.classList.remove('hidden');
    hostBoardProgress.textContent = `Сыграно: ${progress.played} / ${progress.total}`;

    if (state.screen === 'board') {
        hostBoardScreen.classList.add('active');
        hostBoardScreen.classList.remove('hidden');
        hostQuestionScreen.classList.remove('active');
        hostQuestionScreen.classList.add('hidden');
        hostToBoardBtn?.classList.add('hidden');
        hostSidebarBoardBtn?.classList.add('hidden');
        renderBoard();
    } else if (state.screen === 'question') {
        hostBoardScreen.classList.remove('active');
        hostBoardScreen.classList.add('hidden');
        hostQuestionScreen.classList.add('active');
        hostQuestionScreen.classList.remove('hidden');
        hostToBoardBtn?.classList.remove('hidden');
        hostSidebarBoardBtn?.classList.remove('hidden');
        renderQuestion();
    }

    renderSidebar();
}

function renderBoard() {
    if (!hostGrid) return;
    const round = getRoundData(state.currentRound);
    if (!round) return;

    hostGrid.innerHTML = '';
    const cols = round.categories.length;
    hostGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    hostGrid.style.gridTemplateRows = `auto repeat(5, minmax(50px, 1fr))`;

    const played = state.playedQuestions || [];

    round.categories.forEach(cat => {
        const cell = document.createElement('div');
        cell.className = 'cell category-name';
        cell.textContent = cat.name;
        hostGrid.appendChild(cell);
    });

    for (let i = 0; i < 5; i++) {
        round.categories.forEach(cat => {
            const q = cat.questions[i];
            if (!q) return;
            const cell = document.createElement('div');
            cell.className = 'cell question-cell host-question-cell';
            const playedCell = played.includes(q.id);
            if (playedCell) {
                cell.classList.add('played');
                cell.textContent = '—';
            } else {
                cell.textContent = q.price;
                cell.onclick = () => openQuestion(cat.name, q);
            }
            hostGrid.appendChild(cell);
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
    if (!state.currentQuestion || state.players.length === 0) {
        quickScorePanel.classList.add('hidden');
        return;
    }
    quickScorePanel.classList.remove('hidden');
    const price = state.currentQuestion.price;
    quickScoreButtons.innerHTML = state.players.map(p => `
        <div class="quick-score-row">
            <span class="qs-name">${p.name}</span>
            <button class="btn danger qs-btn" onclick="changeScore('${p.id}', -${price})">−${price}</button>
            <button class="btn success qs-btn" onclick="changeScore('${p.id}', ${price})">+${price}</button>
        </div>
    `).join('');
}

function renderSidebar() {
    if (!sidebarPlayersList) return;

    const selectedBefore = manualPlayerSelect.value;
    sidebarPlayersList.innerHTML = '';
    manualPlayerSelect.innerHTML = '';

    state.players.forEach(p => {
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = p.name;
        manualPlayerSelect.appendChild(option);

        const row = document.createElement('div');
        row.className = 'player-row';
        row.innerHTML = `
            <span class="p-name">${p.name}</span>
            <span class="p-score">${p.score}</span>
        `;
        sidebarPlayersList.appendChild(row);
    });

    if (selectedBefore && state.players.find(p => p.id === selectedBefore)) {
        manualPlayerSelect.value = selectedBefore;
    }
}

window.removePlayer = removePlayer;
window.changeScore = changeScore;
window.triggerEffect = triggerEffect;

init();
