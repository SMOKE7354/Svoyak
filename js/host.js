// State
let state = {
    screen: 'lobby',
    players: [],
    playedQuestions: [],
    currentQuestion: null,
    showAnswer: false,
    timerValue: null,
    timerActive: false
};

// Elements
const statusIndicator = document.getElementById('host-status');
const hostBoardScreen = document.getElementById('host-board-screen');
const hostQuestionScreen = document.getElementById('host-question-screen');
const hostGrid = document.getElementById('host-grid');
const sidebarPlayersList = document.getElementById('sidebar-players-list');
const resetGameBtn = document.getElementById('reset-game-btn');
const closeQuestionBtn = document.getElementById('close-question-btn');
const showAnswerBtn = document.getElementById('show-answer-btn');
const startTimerBtn = document.getElementById('start-timer-btn');
const stopTimerBtn = document.getElementById('stop-timer-btn');
const timerValSelect = document.getElementById('timer-val');
const nobodyAnsweredBtn = document.getElementById('nobody-answered-btn');

const manualPlayerSelect = document.getElementById('manual-player-select');
const manualScoreInput = document.getElementById('manual-score-input');
const manualMinusBtn = document.getElementById('manual-minus-btn');
const manualPlusBtn = document.getElementById('manual-plus-btn');

let timerInterval = null;

// Question details
const hostQCategory = document.getElementById('host-q-category');
const hostQPrice = document.getElementById('host-q-price');
const hostQText = document.getElementById('host-q-text');
const hostQAnswer = document.getElementById('host-q-answer');

function init() {
    loadState();
    setupEventListeners();
    renderScreen();
}

function loadState() {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
        state = JSON.parse(savedState);
        statusIndicator.className = 'host-status connected';
        statusIndicator.textContent = 'Подключено';
    } else {
        statusIndicator.className = 'host-status disconnected';
        statusIndicator.textContent = 'Ожидание игроков...';
    }
}

function saveState() {
    localStorage.setItem('gameState', JSON.stringify(state));
}

function setupEventListeners() {
    window.addEventListener('storage', (e) => {
        if (e.key === 'gameState') {
            const newState = JSON.parse(e.newValue);
            if (newState) {
                state = newState;
                statusIndicator.className = 'host-status connected';
                statusIndicator.textContent = 'Подключено';
                renderScreen();
            } else {
                statusIndicator.className = 'host-status disconnected';
                statusIndicator.textContent = 'Ожидание игроков...';
            }
        }
    });

    resetGameBtn.addEventListener('click', () => {
        if(confirm('Вы уверены, что хотите завершить игру? Все очки и прогресс будут потеряны, и игроки вернутся в лобби.')) {
            state = {
                screen: 'lobby',
                players: [],
                playedQuestions: [],
                currentQuestion: null,
                showAnswer: false,
                timerValue: null,
                timerActive: false
            };
            stopTimer();
            saveState();
            renderScreen();
        }
    });

    closeQuestionBtn.addEventListener('click', () => {
        if (state.currentQuestion) {
            if (!state.playedQuestions.includes(state.currentQuestion.id)) {
                state.playedQuestions.push(state.currentQuestion.id);
            }
            state.currentQuestion = null;
            state.screen = 'board';
            state.showAnswer = false;
            stopTimer();
            saveState();
            renderScreen();
        }
    });

    nobodyAnsweredBtn.addEventListener('click', () => {
        if (state.currentQuestion) {
            triggerEffect('wrong'); // Little visual feedback that nobody got it
            setTimeout(() => {
                if (!state.playedQuestions.includes(state.currentQuestion.id)) {
                    state.playedQuestions.push(state.currentQuestion.id);
                }
                state.currentQuestion = null;
                state.screen = 'board';
                state.showAnswer = false;
                stopTimer();
                saveState();
                renderScreen();
            }, 1000);
        }
    });

    showAnswerBtn.addEventListener('click', () => {
        state.showAnswer = true;
        stopTimer();
        saveState();
    });

    startTimerBtn.addEventListener('click', () => {
        startTimer();
    });

    stopTimerBtn.addEventListener('click', () => {
        stopTimer();
    });

    manualPlusBtn.addEventListener('click', () => {
        adjustManualScore(1);
    });

    manualMinusBtn.addEventListener('click', () => {
        adjustManualScore(-1);
    });
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    const duration = parseInt(timerValSelect.value) || 30;
    state.timerValue = duration;
    state.timerActive = true;
    saveState();
    
    timerInterval = setInterval(() => {
        state.timerValue -= 1;
        if (state.timerValue <= 0) {
            state.timerValue = 0;
            state.timerActive = false;
            clearInterval(timerInterval);
            triggerEffect('wrong'); // Time's up effect
        }
        saveState();
    }, 1000);
}

function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
    state.timerValue = null;
    state.timerActive = false;
    saveState();
}

function adjustManualScore(multiplier) {
    const playerId = manualPlayerSelect.value;
    const scoreVal = parseInt(manualScoreInput.value);
    if (playerId && !isNaN(scoreVal)) {
        changeScore(playerId, scoreVal * multiplier);
    }
}

function renderScreen() {
    if (state.screen === 'lobby') {
        hostBoardScreen.classList.remove('active');
        hostBoardScreen.classList.add('hidden');
        hostQuestionScreen.classList.remove('active');
        hostQuestionScreen.classList.add('hidden');
    } else if (state.screen === 'board') {
        hostBoardScreen.classList.remove('hidden');
        hostBoardScreen.classList.add('active');
        hostQuestionScreen.classList.remove('active');
        hostQuestionScreen.classList.add('hidden');
        renderBoard();
    } else if (state.screen === 'question') {
        hostBoardScreen.classList.remove('active');
        hostBoardScreen.classList.add('hidden');
        hostQuestionScreen.classList.remove('hidden');
        hostQuestionScreen.classList.add('active');
        renderQuestion();
    }
    
    // Always render sidebar regardless of screen
    renderSidebar();
}

function renderBoard() {
    if(!hostGrid) return;
    hostGrid.innerHTML = '';
    
    hostGrid.style.gridTemplateColumns = `repeat(${gameData.length}, 1fr)`;
    hostGrid.style.gridTemplateRows = `auto repeat(5, 1fr)`;

    gameData.forEach(cat => {
        const cell = document.createElement('div');
        cell.className = 'cell category-name';
        cell.textContent = cat.name;
        hostGrid.appendChild(cell);
    });

    for (let i = 0; i < 5; i++) {
        gameData.forEach(cat => {
            const q = cat.questions[i];
            if(!q) return;
            const cell = document.createElement('div');
            cell.className = 'cell question-cell';
            
            if (state.playedQuestions.includes(q.id)) {
                cell.classList.add('played');
                cell.textContent = '—';
                cell.style.opacity = '0.5';
                cell.style.cursor = 'default';
                cell.style.pointerEvents = 'none';
            } else {
                cell.textContent = q.price;
                cell.onclick = () => openQuestion(cat.name, q);
            }
            hostGrid.appendChild(cell);
        });
    }
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
    saveState();
    renderScreen();
}

function renderSidebar() {
    if(!sidebarPlayersList) return;
    
    const selectedBefore = manualPlayerSelect.value;
    sidebarPlayersList.innerHTML = '';
    manualPlayerSelect.innerHTML = '';
    
    const isQuestionMode = state.screen === 'question' && state.currentQuestion;
    const currentPrice = isQuestionMode ? state.currentQuestion.price : 0;

    state.players.forEach(p => {
        // Manual adjust options
        const option = document.createElement('option');
        option.value = p.id;
        option.textContent = p.name;
        manualPlayerSelect.appendChild(option);

        // Sidebar row
        const row = document.createElement('div');
        row.className = 'player-row' + (isQuestionMode ? ' question-mode' : '');
        
        if (isQuestionMode) {
            row.innerHTML = `
                <div class="p-info">
                    <span class="p-name">${p.name}</span>
                    <span class="p-score">${p.score}</span>
                </div>
                <div class="btn-row">
                    <button class="btn danger full-width" onclick="changeScore('${p.id}', -${currentPrice})">-${currentPrice}</button>
                    <button class="btn success full-width" onclick="changeScore('${p.id}', ${currentPrice})">+${currentPrice}</button>
                </div>
            `;
        } else {
            row.innerHTML = `
                <span class="p-name">${p.name}</span>
                <span class="p-score">${p.score}</span>
            `;
        }
        
        sidebarPlayersList.appendChild(row);
    });
    
    if (selectedBefore && state.players.find(p => p.id === selectedBefore)) {
        manualPlayerSelect.value = selectedBefore;
    }
}

function renderQuestion() {
    if (state.currentQuestion) {
        hostQCategory.textContent = state.currentQuestion.categoryName;
        hostQPrice.textContent = state.currentQuestion.price;
        hostQText.textContent = state.currentQuestion.text;
        hostQAnswer.textContent = state.currentQuestion.answer;
    }
}

function changeScore(playerId, amount) {
    const player = state.players.find(p => p.id === playerId);
    if (player) {
        player.score += amount;
        if (amount > 0) triggerEffect('correct');
        else triggerEffect('wrong');
        saveState();
        renderSidebar(); // re-render just sidebar for smooth update
    }
}

function triggerEffect(effectName) {
    state.effect = effectName;
    state.effectTimestamp = Date.now();
    saveState();
}

window.changeScore = changeScore;
window.triggerEffect = triggerEffect;

init();