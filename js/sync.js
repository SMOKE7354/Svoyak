const STORAGE_KEY = 'gameState';

/** Один код на все игры — запомнить легко */
const ROOM_CODE = 'SVOYAK';

function createInitialState() {
    return {
        screen: 'lobby',
        players: [],
        currentRound: 0,
        playedQuestions: [],
        currentQuestion: null,
        showAnswer: false,
        timerValue: null,
        timerActive: false,
        effect: null,
        effectTimestamp: null,
        roundAnnouncement: null
    };
}

const gameSync = {
    mode: null,
    roomCode: ROOM_CODE,
    syncMode: 'local',
    peer: null,
    connection: null,
    _listeners: [],
    _pollTimer: null,
    _channel: typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('svoyak-game') : null,
    displayConnected: false,

    getRoomCode() {
        return ROOM_CODE;
    },

    normalizeCode(code) {
        return (code || ROOM_CODE).trim().toUpperCase().replace(/[^A-Z0-9]/g, '') || ROOM_CODE;
    },

    isLocalFile() {
        return window.location.protocol === 'file:';
    },

    load() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return createInitialState();
            }
        }
        return createInitialState();
    },

    save(state, notifyLocal = true) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

        if (this.syncMode === 'peer' && this.mode === 'host' && this.connection?.open) {
            this.connection.send({ type: 'state', state });
        }

        if (this.syncMode === 'cloud' && this.mode === 'host' && this._cloudRef) {
            this._cloudRef.set(state).catch(() => {});
        }

        if (this._channel) {
            this._channel.postMessage({ type: 'state', state });
        }

        if (notifyLocal) {
            this._listeners.forEach(fn => fn(state));
        }
    },

    subscribe(fn) {
        this._listeners.push(fn);
        if (this._channel) {
            this._channel.onmessage = (e) => {
                if (e.data?.type === 'state' && e.data.state) {
                    fn(e.data.state);
                }
            };
        }
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

    _initLocalHost(callbacks) {
        this.syncMode = 'local';
        callbacks.onReady?.(ROOM_CODE, 'local');
        return Promise.resolve({ code: ROOM_CODE, mode: 'local' });
    },

    _initLocalDisplay(callbacks) {
        this.syncMode = 'local';
        this.subscribe((state) => callbacks.onState?.(state));
        callbacks.onConnected?.(ROOM_CODE, 'local');
        callbacks.onState?.(this.load());
        return Promise.resolve({ code: ROOM_CODE, mode: 'local' });
    },

    _initCloudHost(callbacks) {
        if (typeof firebase === 'undefined' || !window.firebaseConfig?.databaseURL) {
            return null;
        }

        if (!firebase.apps.length) {
            firebase.initializeApp(window.firebaseConfig);
        }

        const db = firebase.database();
        this._cloudRef = db.ref(`rooms/${ROOM_CODE}/state`);
        this.syncMode = 'cloud';
        this.mode = 'host';

        db.ref(`rooms/${ROOM_CODE}/displayOnline`).on('value', (snap) => {
            const online = !!snap.val();
            this.displayConnected = online;
            if (online) callbacks.onDisplayConnected?.();
            else callbacks.onDisplayDisconnected?.();
        });

        callbacks.onReady?.(ROOM_CODE, 'cloud');
        return Promise.resolve({ code: ROOM_CODE, mode: 'cloud' });
    },

    _initCloudDisplay(callbacks) {
        if (typeof firebase === 'undefined' || !window.firebaseConfig?.databaseURL) {
            return null;
        }

        if (!firebase.apps.length) {
            firebase.initializeApp(window.firebaseConfig);
        }

        const db = firebase.database();
        this.syncMode = 'cloud';
        this.mode = 'display';

        db.ref(`rooms/${ROOM_CODE}/displayOnline`).set(true);
        db.ref(`rooms/${ROOM_CODE}/displayOnline`).onDisconnect().set(false);

        const stateRef = db.ref(`rooms/${ROOM_CODE}/state`);
        stateRef.on('value', (snap) => {
            const val = snap.val();
            if (val && typeof val === 'object' && val.screen !== undefined) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
                callbacks.onState?.(val);
                this._listeners.forEach(fn => fn(val));
            }
        });

        callbacks.onConnected?.(ROOM_CODE, 'cloud');
        return Promise.resolve({ code: ROOM_CODE, mode: 'cloud' });
    },

    _initPeerHost(callbacks) {
        if (typeof Peer === 'undefined') return null;

        this.mode = 'host';
        this.syncMode = 'peer';
        const peerId = `svoyak-${ROOM_CODE}`;

        return new Promise((resolve, reject) => {
            let settled = false;

            this.peer = new Peer(peerId, {
                debug: 1,
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:global.stun.twilio.com:3478?transport=udp' }
                    ]
                }
            });

            this.peer.on('open', () => {
                if (settled) return;
                settled = true;
                callbacks.onReady?.(ROOM_CODE, 'peer');
                resolve({ code: ROOM_CODE, mode: 'peer' });
            });

            this.peer.on('connection', (conn) => {
                this.connection = conn;
                conn.on('open', () => {
                    this.displayConnected = true;
                    callbacks.onDisplayConnected?.();
                    conn.send({ type: 'state', state: this.load() });
                });
                conn.on('close', () => {
                    this.displayConnected = false;
                    this.connection = null;
                    callbacks.onDisplayDisconnected?.();
                });
            });

            this.peer.on('error', (err) => {
                if (settled) return;
                if (err.type === 'unavailable-id') {
                    settled = true;
                    this.peer?.destroy();
                    this._initPeerHost(callbacks).then(resolve).catch(reject);
                    return;
                }
                settled = true;
                reject(err);
            });

            setTimeout(() => {
                if (!settled) {
                    settled = true;
                    this.peer?.destroy();
                    reject(new Error('Peer timeout'));
                }
            }, 8000);
        });
    },

    _initPeerDisplay(callbacks) {
        if (typeof Peer === 'undefined') return null;

        this.mode = 'display';
        this.syncMode = 'peer';

        let settled = false;

        return new Promise((resolve, reject) => {
            this.peer = new Peer();

            this.peer.on('open', () => {
                const conn = this.peer.connect(`svoyak-${ROOM_CODE}`, { reliable: true });
                this.connection = conn;

                conn.on('open', () => {
                    if (settled) return;
                    settled = true;
                    callbacks.onConnected?.(ROOM_CODE, 'peer');
                    resolve({ code: ROOM_CODE, mode: 'peer' });
                });

                conn.on('data', (data) => {
                    if (data?.type === 'state' && data.state) {
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.state));
                        callbacks.onState?.(data.state);
                        this._listeners.forEach(fn => fn(data.state));
                    }
                });

                conn.on('close', () => callbacks.onDisconnected?.());

                conn.on('error', () => {
                    if (!settled) {
                        settled = true;
                        reject(new Error('Connection failed'));
                    }
                });
            });

            this.peer.on('error', () => {
                if (!settled) {
                    settled = true;
                    reject(new Error('Peer error'));
                }
            });

            setTimeout(() => {
                if (!settled && !this.connection?.open) {
                    settled = true;
                    reject(new Error('Peer timeout'));
                }
            }, 10000);
        });
    },

    async initHost(callbacks = {}) {
        this.mode = 'host';

        if (window.firebaseConfig?.databaseURL) {
            const cloud = this._initCloudHost(callbacks);
            if (cloud) return cloud;
        }

        try {
            return await this._initPeerHost(callbacks);
        } catch {
            return this._initLocalHost(callbacks);
        }
    },

    async initDisplay(_roomCode, callbacks = {}) {
        if (window.firebaseConfig?.databaseURL) {
            const cloud = this._initCloudDisplay(callbacks);
            if (cloud) return cloud;
        }

        try {
            return await this._initPeerDisplay(callbacks);
        } catch {
            if (this.isLocalFile()) {
                return this._initLocalDisplay(callbacks);
            }
            throw new Error('Не удалось подключиться. Сначала откройте host.html. Для двух ноутбуков — через GitHub Pages (https).');
        }
    },

    getSyncHint(mode) {
        if (mode === 'local') {
            return 'Режим одного компьютера — для двух ноутбуков залейте на GitHub Pages';
        }
        if (mode === 'peer') {
            return 'Связь через интернет (код SVOYAK)';
        }
        return 'Связь через облако (код SVOYAK)';
    },

    getDisplayUrl() {
        const url = new URL('index.html', window.location.href);
        return url.href;
    }
};
