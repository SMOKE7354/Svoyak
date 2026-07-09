const STORAGE_KEY = 'gameState';
const ROOM_CODE = 'SVOYAK';

function createInitialState() {
    return {
        screen: 'lobby',
        players: [],
        currentRound: 0,
        playedQuestions: [],
        currentQuestion: null,
        showAnswer: false,
        showAnswerImage: false,
        timerValue: null,
        timerActive: false,
        effect: null,
        effectTimestamp: null,
        roundAnnouncement: null
    };
}

function normalizeState(raw) {
    const base = createInitialState();
    if (!raw || typeof raw !== 'object') return base;
    return {
        ...base,
        ...raw,
        players: Array.isArray(raw.players) ? raw.players : [],
        playedQuestions: Array.isArray(raw.playedQuestions) ? raw.playedQuestions : []
    };
}

function isFirebaseReady() {
    return typeof firebase !== 'undefined'
        && window.firebaseConfig?.databaseURL
        && window.firebaseConfig?.apiKey;
}

function firebaseErrorMessage(err) {
    const msg = err?.message || String(err);
    if (msg.includes('PERMISSION_DENIED') || msg.includes('permission_denied')) {
        return 'Firebase: нет доступа. Откройте Realtime Database → Rules и опубликуйте: .read: true, .write: true';
    }
    return 'Firebase: ' + msg;
}

const gameSync = {
    mode: null,
    roomCode: ROOM_CODE,
    syncMode: 'local',
    _listeners: [],
    _gameDataListeners: [],
    _channelHandlers: [],
    _channelBound: false,
    _channel: typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('svoyak-game') : null,
    displayConnected: false,
    _db: null,
    _stateRef: null,
    _gameDataRef: null,
    _localHostCallbacks: null,

    getRoomCode() {
        return ROOM_CODE;
    },

    isFirebaseReady,

    _bindChannel() {
        if (!this._channel || this._channelBound) return;
        this._channelBound = true;
        this._channel.onmessage = (e) => {
            const data = e.data;
            if (!data?.type) return;

            if (data.type === 'state' && data.state) {
                this._listeners.forEach(fn => fn(data.state));
            }
            if (data.type === 'gameData' && Array.isArray(data.rounds)) {
                this._gameDataListeners.forEach(fn => fn(data.rounds));
            }
            if (data.type === 'display-online') {
                this.displayConnected = true;
                this._localHostCallbacks?.onDisplayConnected?.();
                this._channel.postMessage({ type: 'state', state: this.load() });
                if (typeof GameData !== 'undefined') {
                    this._channel.postMessage({ type: 'gameData', rounds: GameData.getRounds() });
                }
            }
            if (data.type === 'display-offline') {
                this.displayConnected = false;
                this._localHostCallbacks?.onDisplayDisconnected?.();
            }
        };
    },

    load() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return normalizeState(JSON.parse(saved));
            } catch {
                return createInitialState();
            }
        }
        return createInitialState();
    },

    save(state, notifyLocal = true) {
        state = normalizeState(state);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (err) {
            console.error('localStorage save error:', err);
        }

        if (this.syncMode === 'cloud' && this.mode === 'host' && this._stateRef) {
            this._stateRef.set(state).catch((err) => {
                console.error('Firebase save error:', err);
            });
        }

        if (this._channel) {
            this._channel.postMessage({ type: 'state', state });
        }

        if (notifyLocal) {
            this._listeners.forEach(fn => fn(state));
        }
    },

    pushGameData(rounds) {
        if (!Array.isArray(rounds)) return;
        try {
            localStorage.setItem('svoyak_game_data_version', 'blank-v3-2026');
        } catch { /* ignore */ }

        const db = this._getDb();
        if (db && isFirebaseReady()) {
            db.ref(`rooms/${ROOM_CODE}/gameData`).set(rounds).catch((err) => {
                console.error('Firebase gameData save error:', err);
            });
        }

        if (this._channel) {
            this._channel.postMessage({ type: 'gameData', rounds });
        }
    },

    pullGameData() {
        const db = this._getDb();
        if (!db || !isFirebaseReady()) return Promise.resolve(null);

        return db.ref(`rooms/${ROOM_CODE}/gameData`).once('value').then((snap) => {
            const rounds = snap.val();
            if (Array.isArray(rounds) && rounds.length && typeof GameData !== 'undefined') {
                if (!GameData.isCustom()) {
                    GameData.applyRemoteRounds(rounds);
                }
            }
            return rounds;
        }).catch((err) => {
            console.error('Firebase gameData load error:', err);
            return null;
        });
    },

    subscribeGameData(fn) {
        this._gameDataListeners.push(fn);
        this._bindChannel();
    },

    subscribe(fn) {
        this._listeners.push(fn);
        this._bindChannel();

        window.addEventListener('storage', (e) => {
            if (e.key === STORAGE_KEY && e.newValue) {
                try {
                    fn(JSON.parse(e.newValue));
                } catch { /* ignore */ }
            }
        });
    },

    reset() {
        const state = createInitialState();
        this.save(state);
        return state;
    },

    _getDb() {
        if (this._db) return this._db;
        if (!isFirebaseReady()) return null;
        try {
            if (!firebase.apps.length) {
                firebase.initializeApp(window.firebaseConfig);
            }
            this._db = firebase.database();
            return this._db;
        } catch (err) {
            console.error('Firebase init error:', err);
            return null;
        }
    },

    _initCloudHost(callbacks) {
        const db = this._getDb();
        if (!db) return null;

        this.mode = 'host';
        this.syncMode = 'cloud';
        this._stateRef = db.ref(`rooms/${ROOM_CODE}/state`);
        this._gameDataRef = db.ref(`rooms/${ROOM_CODE}/gameData`);

        const initialState = this.load();
        const gameData = typeof GameData !== 'undefined' ? GameData.getRounds() : null;

        const pushes = [this._stateRef.set(initialState)];
        if (gameData) pushes.push(this._gameDataRef.set(gameData));

        return Promise.all(pushes)
            .then(() => {
                this._gameDataRef.on('value', (snap) => {
                    const rounds = snap.val();
                    if (Array.isArray(rounds) && rounds.length && typeof GameData !== 'undefined') {
                        GameData.applyRemoteRounds(rounds);
                    }
                });

                db.ref(`rooms/${ROOM_CODE}/displayOnline`).on('value', (snap) => {
                    const online = !!snap.val();
                    this.displayConnected = online;
                    if (online) callbacks.onDisplayConnected?.();
                    else callbacks.onDisplayDisconnected?.();
                });
                callbacks.onReady?.(ROOM_CODE, 'cloud');
                return { code: ROOM_CODE, mode: 'cloud' };
            })
            .catch((err) => {
                this.syncMode = 'local';
                throw new Error(firebaseErrorMessage(err));
            });
    },

    _initCloudDisplay(callbacks) {
        const db = this._getDb();
        if (!db) return null;

        this.mode = 'display';
        this.syncMode = 'cloud';

        const onlineRef = db.ref(`rooms/${ROOM_CODE}/displayOnline`);
        const stateRef = db.ref(`rooms/${ROOM_CODE}/state`);
        const gameDataRef = db.ref(`rooms/${ROOM_CODE}/gameData`);

        return onlineRef.set(true)
            .then(() => {
                onlineRef.onDisconnect().set(false);

                gameDataRef.on('value', (snap) => {
                    const rounds = snap.val();
                    if (Array.isArray(rounds) && rounds.length && typeof GameData !== 'undefined') {
                        GameData.applyRemoteRounds(rounds);
                    }
                });

                stateRef.on('value', (snap) => {
                    const val = snap.val();
                    if (val && typeof val === 'object' && val.screen !== undefined) {
                        const normalized = normalizeState(val);
                        try {
                            localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
                        } catch { /* ignore */ }
                        callbacks.onState?.(normalized);
                        this._listeners.forEach(fn => fn(normalized));
                    }
                });

                callbacks.onConnected?.(ROOM_CODE, 'cloud');
                return { code: ROOM_CODE, mode: 'cloud' };
            })
            .catch((err) => {
                throw new Error(firebaseErrorMessage(err));
            });
    },

    _initLocalHost(callbacks) {
        this.mode = 'host';
        this.syncMode = 'local';
        this._localHostCallbacks = callbacks;
        this._bindChannel();

        callbacks.onReady?.(ROOM_CODE, 'local');
        return Promise.resolve({ code: ROOM_CODE, mode: 'local' });
    },

    _initLocalDisplay(callbacks) {
        this.mode = 'display';
        this.syncMode = 'local';

        this.subscribe((s) => callbacks.onState?.(s));
        this.subscribeGameData((rounds) => {
            if (typeof GameData !== 'undefined') GameData.applyRemoteRounds(rounds);
        });

        if (this._channel) {
            this._channel.postMessage({ type: 'display-online' });
            window.addEventListener('beforeunload', () => {
                this._channel.postMessage({ type: 'display-offline' });
            });
        }

        callbacks.onConnected?.(ROOM_CODE, 'local');
        callbacks.onState?.(this.load());
        return Promise.resolve({ code: ROOM_CODE, mode: 'local' });
    },

    initHost(callbacks = {}) {
        if (isFirebaseReady()) {
            const cloud = this._initCloudHost(callbacks);
            if (cloud) return cloud;
        }
        return this._initLocalHost(callbacks);
    },

    initDisplay(_roomCode, callbacks = {}, forceLocal = false) {
        if (!forceLocal && isFirebaseReady()) {
            const cloud = this._initCloudDisplay(callbacks);
            if (cloud) return cloud;
        }
        return this._initLocalDisplay(callbacks);
    },

    getSyncHint(mode) {
        if (mode === 'cloud') return 'Firebase — два ноутбука';
        return 'Локально — только 2 вкладки на одном ПК';
    },

    needsFirebaseSetup() {
        return !isFirebaseReady();
    }
};
