// State
let state = {
    screen: 'lobby', // 'lobby', 'board', 'question'
    players: [],
    playedQuestions: [],
    currentQuestion: null
};

// Elements
const screens = {
    lobby: document.getElementById('lobby-screen'),
    board: document.getElementById('board-screen'),
    question: document.getElementById('question-screen')
};

// Lobby elements
const playerInput = document.getElementById('player-input');
const addPlayerBtn = document.getElementById('add-player-btn');
const playersList = document.getElementById('players-list');
const startGameBtn = document.getElementById('start-game-btn');

// Board elements
const grid = document.getElementById('grid');
const playersScores = document.getElementById('players-scores');
const playersScoresQuestion = document.getElementById('players-scores-question');

// Question elements
const questionPrice = document.getElementById('question-price');
const questionText = document.getElementById('question-text');
const questionImage = document.getElementById('question-image');
const questionAnswerDisplay = document.getElementById('question-answer-display');
const timerDisplay = document.getElementById('timer-display');
const effectsOverlay = document.getElementById('effects-overlay');

let lastEffectTimestamp = 0;

// Init
function init() {
    loadState();
    setupEventListeners();
    renderScreen();
}

function loadState() {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
        state = JSON.parse(savedState);
    } else {
        saveState();
    }
}

function saveState() {
    localStorage.setItem('gameState', JSON.stringify(state));
}

function setupEventListeners() {
    addPlayerBtn.addEventListener('click', addPlayer);
    playerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addPlayer();
    });
    startGameBtn.addEventListener('click', startGame);

    window.addEventListener('storage', (e) => {
        if (e.key === 'gameState') {
            const newState = JSON.parse(e.newValue);
            if (newState) {
                state = newState;
                renderScreen();
                
                // Update timer
                if (state.timerValue !== undefined && state.timerValue !== null) {
                    timerDisplay.textContent = state.timerValue;
                    timerDisplay.classList.remove('hidden');
                    if (state.timerValue <= 5) {
                        timerDisplay.classList.add('danger-pulse');
                    } else {
                        timerDisplay.classList.remove('danger-pulse');
                    }
                } else {
                    timerDisplay.classList.add('hidden');
                }

                // Handle Effects
                if (state.effect && state.effectTimestamp && state.effectTimestamp !== lastEffectTimestamp) {
                    lastEffectTimestamp = state.effectTimestamp;
                    playEffect(state.effect);
                }
            }
        }
    });
}

function playEffect(effectName) {
    if (!effectsOverlay) return;
    
    effectsOverlay.className = `effects-overlay ${effectName}`;
    
    // Auto hide after animation
    setTimeout(() => {
        effectsOverlay.className = 'effects-overlay hidden';
    }, 1500);
}

function addPlayer() {
    const name = playerInput.value.trim();
    if (name) {
        state.players.push({ id: Date.now().toString(), name, score: 0 });
        playerInput.value = '';
        saveState();
        renderPlayersList();
    }
}

function removePlayer(id) {
    state.players = state.players.filter(p => p.id !== id);
    saveState();
    renderPlayersList();
}

function startGame() {
    state.screen = 'board';
    saveState();
    renderScreen();
}

// Rendering
function renderScreen() {
    // Hide all
    Object.values(screens).forEach(s => {
        if(s) {
            s.classList.remove('active');
            s.classList.add('hidden');
        }
    });

    // Show current
    if (screens[state.screen]) {
        screens[state.screen].classList.remove('hidden');
        screens[state.screen].classList.add('active');
    }

    if (state.screen === 'lobby') {
        renderPlayersList();
    } else if (state.screen === 'board') {
        renderBoard();
        renderScores();
    } else if (state.screen === 'question') {
        renderQuestion();
        renderScores();
    }
}

function renderPlayersList() {
    if(!playersList) return;
    playersList.innerHTML = '';
    state.players.forEach(p => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${p.name}</span> <button onclick="removePlayer('${p.id}')">✕</button>`;
        playersList.appendChild(li);
    });
    if(startGameBtn) {
        startGameBtn.disabled = state.players.length === 0;
    }
}

function renderBoard() {
    if(!grid) return;
    grid.innerHTML = '';
    
    // Set grid columns based on number of categories
    grid.style.gridTemplateColumns = `repeat(${gameData.length}, 1fr)`;
    grid.style.gridTemplateRows = `auto repeat(5, 1fr)`;

    // Headers
    gameData.forEach(cat => {
        const cell = document.createElement('div');
        cell.className = 'cell category-name';
        cell.textContent = cat.name;
        grid.appendChild(cell);
    });

    // Questions (row by row)
    for (let i = 0; i < 5; i++) {
        gameData.forEach(cat => {
            const q = cat.questions[i];
            if(!q) return;
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
    const renderScoresTo = (container) => {
        if(!container) return;
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

    if (state.screen === 'board') renderScoresTo(playersScores);
    if (state.screen === 'question') renderScoresTo(playersScoresQuestion);
}

function renderQuestion() {
    if (state.currentQuestion && questionPrice && questionText) {
        questionPrice.textContent = state.currentQuestion.price;
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
    }
}

// Ensure functions are available globally for inline onclick handlers
window.removePlayer = removePlayer;

init();