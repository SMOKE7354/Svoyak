let state = createInitialState();
let timerInterval = null;
let lastBoardKey = '';
let awardPanelBuilt = false;

const hostLobbyScreen = document.getElementById('host-lobby-screen');
const hostGameScreen = document.getElementById('host-game-screen');
const hostBoardScreen = document.getElementById('host-board-screen');
const hostQuestionScreen = document.getElementById('host-question-screen');
const hostGrid = document.getElementById('host-grid');
const hostRoundIndicator = document.getElementById('host-round-indicator');
const hostProgress = document.getElementById('host-progress');
const hostProgressWrap = document.getElementById('host-progress-wrap');
const hostProgressFill = document.getElementById('host-progress-fill');
const sidebarPlayersList = document.getElementById('sidebar-players-list');
const customAwardList = document.getElementById('custom-award-list');
const customPointsVal = document.getElementById('custom-points-val');
const awardPanel = document.getElementById('award-panel');
const hostTimerBadge = document.getElementById('host-timer-badge');
const hostTimerVal = document.getElementById('host-timer-val');
const hostToBoardBtn = document.getElementById('host-to-board-btn');
const hostToLobbyBtn = document.getElementById('host-to-lobby-btn');
const hostFinaleBanner = document.getElementById('host-finale-banner');
const roundCardsContainer = document.getElementById('round-cards');
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
const hostQImage = document.getElementById('host-q-image');
const hostQAnswerImage = document.getElementById('host-q-answer-image');
const hostQAnswerImageHint = document.getElementById('host-q-answer-image-hint');
const showAnswerImageBtn = document.getElementById('show-answer-image-btn');

function onGameDataUpdated() {
    GameData.reload();
    lastBoardKey = '';
    renderAll();
}

function getActiveQuestion() {
    return resolveQuestionMedia(state.currentQuestion);
}

function init() {
    state = gameSync.load();
    setupEventListeners();

    window.addEventListener('svoyak-game-updated', onGameDataUpdated);
    window.addEventListener('storage', (e) => {
        if (e.key === GameData.storageKey || e.key === 'svoyak_game_data_version') {
            onGameDataUpdated();
        }
    });

    if (gameSync.needsFirebaseSetup() && firebaseBanner) {
        firebaseBanner.classList.remove('hidden');
        firebaseBanner.textContent = 'Настройте Firebase в js/firebase-config.js — иначе два ноутбука не синхронизируются';
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
    hostStatus.textContent = ok ? 'Табло online' : 'Табло offline';
    hostStatus.className = `host-status ${ok ? 'connected' : 'disconnected'}`;
}

function saveState(full = true) {
    gameSync.save(state);
    if (full) renderAll();
    else refreshScores();
}

function refreshScores() {
    updateScoreValues();
    if (state.screen === 'question') updateAwardScores();
}

function setupEventListeners() {
    addPlayerBtn.addEventListener('click', addPlayer);
    playerInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addPlayer(); });

    roundCardsContainer?.addEventListener('click', (e) => {
        const btn = e.target.closest('.round-btn');
        if (btn && !btn.disabled) startRound(parseInt(btn.dataset.round, 10));
    });

    document.getElementById('reset-game-btn').addEventListener('click', resetGame);
    document.getElementById('end-round-btn').addEventListener('click', endRound);
    hostToLobbyBtn?.addEventListener('click', goToLobby);
    document.getElementById('finale-to-lobby-btn')?.addEventListener('click', goToLobby);
    document.getElementById('finale-new-game-btn')?.addEventListener('click', resetGame);
    document.getElementById('close-question-btn').addEventListener('click', goToBoard);
    hostToBoardBtn?.addEventListener('click', goToBoard);
    document.getElementById('nobody-answered-btn').addEventListener('click', nobodyAnswered);
    document.getElementById('show-answer-btn').addEventListener('click', showAnswer);
    showAnswerImageBtn?.addEventListener('click', showAnswerImage);
    document.getElementById('start-timer-btn').addEventListener('click', startTimer);
    document.getElementById('stop-timer-btn')?.addEventListener('click', stopTimer);

    document.querySelectorAll('.btn-quick-pts').forEach(btn => {
        btn.addEventListener('click', () => {
            if (customPointsVal) customPointsVal.value = btn.dataset.delta;
            if (customAwardList) {
                customAwardList.dataset.count = '';
                renderCustomAwardList();
            }
        });
    });

    customPointsVal?.addEventListener('input', () => {
        if (customAwardList) {
            customAwardList.dataset.count = '';
            renderCustomAwardList();
        }
    });

    document.addEventListener('keydown', handleHotkey);
}

function handleHotkey(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;

    if (state.screen === 'question' && state.currentQuestion) {
        if (e.code === 'Space') { e.preventDefault(); startTimer(); return; }
        if (e.code === 'KeyA') { showAnswer(); return; }
        if (e.code === 'KeyI') { showAnswerImage(); return; }
        if (e.code === 'Escape') { goToBoard(); return; }
        if (e.code === 'KeyN') { nobodyAnswered(); return; }

        const digit = parseInt(e.key, 10);
        if (digit >= 1 && digit <= 9 && state.players[digit - 1]) {
            const player = state.players[digit - 1];
            const price = state.currentQuestion.price;
            changeScore(player.id, e.shiftKey ? -price : price);
        }
    }
}

function addPlayer() {
    const name = playerInput.value.trim();
    if (!name) return;
    if (state.players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        playerInput.focus();
        return;
    }
    state.players.push({ id: Date.now().toString(), name, score: 0 });
    playerInput.value = '';
    saveState();
}

function removePlayer(id) {
    if (state.screen === 'board' || state.screen === 'question') return;
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
    state.showAnswerImage = false;
    state.roundAnnouncement = Date.now();
    if (!Array.isArray(state.playedQuestions)) state.playedQuestions = [];
    lastBoardKey = '';
    awardPanelBuilt = false;
    stopTimer(true);
    saveState();
}

function endRound() {
    const progress = getRoundProgress(state.currentRound, state.playedQuestions);
    if (progress.played < progress.total) {
        if (!confirm(`Сыграно ${progress.played} из ${progress.total}. Завершить раунд?`)) return;
    }
    if (isLastRound(state.currentRound)) {
        state.screen = 'finale';
        state.currentQuestion = null;
        stopTimer(true);
        saveState();
        return;
    }
    state.screen = 'lobby';
    state.currentQuestion = null;
    lastBoardKey = '';
    awardPanelBuilt = false;
    stopTimer(true);
    saveState();
}

function goToLobby() {
    state.screen = 'lobby';
    state.currentQuestion = null;
    state.showAnswer = false;
    state.showAnswerImage = false;
    lastBoardKey = '';
    awardPanelBuilt = false;
    stopTimer(true);
    saveState();
}

function resetGame() {
    if (!confirm('Начать новую игру? Все очки будут сброшены.')) return;
    stopTimer(true);
    lastBoardKey = '';
    awardPanelBuilt = false;
    state = gameSync.reset();
    renderAll();
}

function openQuestion(categoryName, q) {
    state.currentQuestion = {
        categoryName,
        id: q.id,
        price: q.price,
        text: q.text,
        answer: q.answer
    };
    state.screen = 'question';
    state.showAnswer = false;
    state.showAnswerImage = false;
    awardPanelBuilt = false;
    stopTimer(true);
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
    state.showAnswerImage = false;
    awardPanelBuilt = false;
    stopTimer(true);
    saveState();
}

function nobodyAnswered() {
    if (!state.currentQuestion) return;
    triggerEffect('wrong');
    setTimeout(goToBoard, 500);
}

function showAnswer() {
    state.showAnswer = true;
    if (getActiveQuestion()?.answerImage) {
        state.showAnswerImage = true;
    }
    stopTimer(true);
    saveState(false);
    renderQuestion();
}

function showAnswerImage() {
    if (!getActiveQuestion()?.answerImage) return;
    state.showAnswerImage = true;
    stopTimer(true);
    saveState(false);
    renderQuestion();
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    const duration = parseInt(document.getElementById('timer-val').value, 10) || 30;
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

function stopTimer(silent = false) {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    state.timerValue = null;
    state.timerActive = false;
    updateTimerUI();
    if (!silent) gameSync.save(state);
}

function updateTimerUI() {
    if (!hostTimerBadge) return;
    if (state.timerValue != null) {
        hostTimerBadge.classList.remove('hidden');
        hostTimerVal.textContent = state.timerValue;
        hostTimerBadge.classList.toggle('urgent', state.timerValue <= 5);
    } else {
        hostTimerBadge.classList.add('hidden');
    }
}

function getCustomPoints() {
    const v = parseInt(customPointsVal?.value, 10);
    return Number.isFinite(v) && v > 0 ? v : 100;
}

function awardCustom(playerId, sign) {
    changeScore(playerId, sign * getCustomPoints());
}

function changeScore(playerId, amount) {
    const player = state.players.find(p => p.id === playerId);
    if (!player || !amount) return;
    player.score += amount;

    if (amount > 0) triggerEffect('correct');
    else triggerEffect('wrong');

    flashScore(playerId, amount > 0 ? 'up' : 'down');
    refreshScores();
}

function flashScore(playerId, direction) {
    const el = document.querySelector(`.s-val[data-id="${playerId}"]`);
    if (!el) return;
    el.classList.remove('flash-up', 'flash-down');
    void el.offsetWidth;
    el.classList.add(direction === 'up' ? 'flash-up' : 'flash-down');
    setTimeout(() => el.classList.remove('flash-up', 'flash-down'), 400);
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

    hostProgressWrap?.classList.toggle('hidden', !inGame);

    if (inGame) renderGame();
    else renderLobby();
}

function renderLobby() {
    hostRoundIndicator.textContent = state.screen === 'finale' ? 'Финал' : 'Лобби';
    hostToLobbyBtn?.classList.toggle('hidden', state.screen !== 'finale');
    hostFinaleBanner?.classList.toggle('hidden', state.screen !== 'finale');
    roundCardsContainer?.classList.toggle('hidden', state.screen === 'finale');

    playersList.innerHTML = state.players.length
        ? state.players.map(p =>
            `<li><span>${escapeHtml(p.name)}</span><span class="player-chip-score">${p.score}</span><button type="button" onclick="removePlayer('${p.id}')" aria-label="Удалить">×</button></li>`
        ).join('')
        : '<li class="empty-chip">Пока никого нет</li>';

    renderRoundCards();

    const has = state.players.length > 0;
    const lastId = getLastRoundId();

    if (!has) roundHint.textContent = 'Добавьте хотя бы одного игрока';
    else if (state.screen === 'finale') roundHint.textContent = 'Нажмите «Вернуться в лобби» — табло покажет перерыв. Или начните новую игру.';
    else if (!state.currentRound) roundHint.textContent = 'Все готово — запускайте раунд 1';
    else if (state.currentRound < lastId) roundHint.textContent = `Раунд ${state.currentRound} завершён — можно начать раунд ${state.currentRound + 1}`;
    else roundHint.textContent = `После раунда ${lastId} нажмите «Завершить раунд» в игре`;
}

function renderRoundCards() {
    if (!roundCardsContainer) return;

    const has = state.players.length > 0;
    const between = state.screen === 'lobby' || state.screen === 'finale';

    roundCardsContainer.innerHTML = gameRounds.map(r => {
        const prices = r.prices || r.categories[0]?.questions?.map(q => q.price) || [100];
        const minP = Math.min(...prices);
        const maxP = Math.max(...prices);
        const locked = r.id > 1 && state.currentRound < r.id - 1;
        const done = between && r.id <= state.currentRound && state.currentRound > 0;
        const disabled = !has || locked || done || state.screen === 'finale';
        const completed = state.currentRound > r.id;
        const subtitle = r.subtitle ? r.subtitle.split('—').pop()?.trim() || `${minP} – ${maxP}` : `${minP} – ${maxP}`;

        return `
            <button type="button" class="round-card round-btn ${completed ? 'completed' : ''}" data-round="${r.id}" ${disabled ? 'disabled' : ''}>
                <span class="round-card-num">${r.id}</span>
                <span class="round-card-info">
                    <strong>${escapeHtml(r.title || `Раунд ${r.id}`)}</strong>
                    <small>${escapeHtml(subtitle)}</small>
                </span>
            </button>
        `;
    }).join('');
}

function renderGame() {
    const round = getRoundData(state.currentRound);
    if (round) hostRoundIndicator.textContent = round.title;

    const prog = getRoundProgress(state.currentRound, state.playedQuestions);
    if (hostProgress) hostProgress.textContent = `${prog.played} / ${prog.total}`;
    if (hostProgressFill && prog.total > 0) {
        hostProgressFill.style.width = `${Math.round((prog.played / prog.total) * 100)}%`;
    }

    const onQuestion = state.screen === 'question';
    hostBoardScreen.classList.toggle('active', !onQuestion);
    hostBoardScreen.classList.toggle('hidden', onQuestion);
    hostQuestionScreen.classList.toggle('active', onQuestion);
    hostQuestionScreen.classList.toggle('hidden', !onQuestion);
    hostToBoardBtn?.classList.toggle('hidden', !onQuestion);

    if (!onQuestion) renderBoardIfNeeded();
    else renderQuestion();

    renderSidebar();
    renderCustomAwardList();
}

function renderCustomAwardList() {
    if (!customAwardList) return;
    const pts = getCustomPoints();

    const same = customAwardList.dataset.count === String(state.players.length);
    if (same && customAwardList.children.length) return;

    customAwardList.dataset.count = String(state.players.length);
    customAwardList.innerHTML = state.players.map(p => `
        <div class="custom-award-row">
            <span class="ca-name">${escapeHtml(p.name)}</span>
            <button type="button" class="host-btn host-btn-success host-btn-xs" onclick="awardCustom('${p.id}', 1)">+${pts}</button>
            <button type="button" class="host-btn host-btn-danger-outline host-btn-xs" onclick="awardCustom('${p.id}', -1)">−</button>
        </div>
    `).join('');
}

function renderBoardIfNeeded() {
    const key = `${state.currentRound}:${(state.playedQuestions || []).join(',')}`;
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
    hostGrid.style.gridTemplateRows = `auto repeat(5, minmax(46px, 1fr))`;

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
            cell.className = 'cell question-cell';
            if (played.includes(q.id)) {
                cell.classList.add('played');
            } else {
                cell.textContent = q.price;
                cell.onclick = () => openQuestion(cat.name, q);
            }
            hostGrid.appendChild(cell);
        });
    }
}

function renderQuestion() {
    const q = getActiveQuestion();
    if (!q) return;
    hostQCategory.textContent = q.categoryName;
    hostQPrice.textContent = q.price;
    hostQText.textContent = q.text;
    hostQAnswer.textContent = q.answer;

    setHostThumb(hostQImage, q.image);
    setHostThumb(hostQAnswerImage, q.answerImage);

    if (hostQAnswerImageHint) {
        hostQAnswerImageHint.classList.toggle('hidden', !q.answerImage);
    }
    if (showAnswerImageBtn) {
        showAnswerImageBtn.classList.toggle('hidden', !q.answerImage);
        showAnswerImageBtn.disabled = !!state.showAnswerImage;
        showAnswerImageBtn.textContent = state.showAnswerImage ? '🖼 На табло' : '🖼 Картинка ответа';
    }

    updateTimerUI();
    renderAwardPanel();
}

function setHostThumb(imgEl, src) {
    if (!imgEl) return;
    if (src) {
        imgEl.src = src;
        imgEl.classList.remove('hidden');
    } else {
        imgEl.classList.add('hidden');
        imgEl.src = '';
    }
}

function renderSidebar() {
    if (!sidebarPlayersList) return;

    const samePlayers = sidebarPlayersList.dataset.count === String(state.players.length);
    if (samePlayers && sidebarPlayersList.children.length) {
        updateScoreValues();
        return;
    }

    sidebarPlayersList.dataset.count = String(state.players.length);
    sidebarPlayersList.innerHTML = state.players.map((p, i) => `
        <div class="score-row">
            <span class="s-name">${i + 1}. ${escapeHtml(p.name)}</span>
            <span class="s-val" data-id="${p.id}">${p.score}</span>
        </div>
    `).join('');
}

function updateScoreValues() {
    state.players.forEach(p => {
        const el = document.querySelector(`.s-val[data-id="${p.id}"]`);
        if (el) el.textContent = p.score;
    });
}

function renderAwardPanel() {
    if (!awardPanel || !state.currentQuestion) return;
    const price = state.currentQuestion.price;

    if (!awardPanelBuilt) {
        awardPanel.innerHTML = state.players.map((p, i) => `
            <div class="award-card" data-player-id="${p.id}">
                <span class="a-name">${i + 1}. ${escapeHtml(p.name)}</span>
                <span class="a-score">Сейчас: <span data-award-id="${p.id}">${p.score}</span></span>
                <div class="award-btns">
                    <button class="btn-minus" type="button" data-action="minus" data-id="${p.id}">−${price}</button>
                    <button class="btn-plus" type="button" data-action="plus" data-id="${p.id}">+${price}</button>
                </div>
            </div>
        `).join('');

        awardPanel.querySelectorAll('button[data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const delta = btn.dataset.action === 'plus' ? price : -price;
                changeScore(id, delta);
            });
        });

        awardPanelBuilt = true;
    } else {
        updateAwardScores();
    }
}

function updateAwardScores() {
    state.players.forEach(p => {
        const el = document.querySelector(`[data-award-id="${p.id}"]`);
        if (el) el.textContent = p.score;
    });
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

window.removePlayer = removePlayer;
window.changeScore = changeScore;
window.awardCustom = awardCustom;
window.triggerEffect = triggerEffect;

init();
