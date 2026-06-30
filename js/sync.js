const STORAGE_KEY = 'gameState';
const PEER_PREFIX = 'svoyak-';

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
    roomCode: null,
    peer: null,
    connection: null,
    _listeners: [],
    _channel: typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('svoyak-game') : null,
    displayConnected: false,

    generateRoomCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        return code;
    },

    normalizeCode(code) {
        return (code || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
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

        if (this.mode === 'host' && this.connection?.open) {
            this.connection.send({ type: 'state', state });
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
            if (e.key === STORAGE_KEY && e.newValue && this.mode !== 'display') {
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

    initHost(callbacks = {}) {
        this.mode = 'host';
        this.roomCode = this.generateRoomCode();
        sessionStorage.setItem('svoyak_room', this.roomCode);

        return new Promise((resolve, reject) => {
            if (typeof Peer === 'undefined') {
                reject(new Error('PeerJS не загружен'));
                return;
            }

            this.peer = new Peer(`${PEER_PREFIX}${this.roomCode}`);

            this.peer.on('open', () => {
                callbacks.onReady?.(this.roomCode);
                resolve(this.roomCode);
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

                conn.on('error', () => {
                    this.displayConnected = false;
                    callbacks.onDisplayDisconnected?.();
                });
            });

            this.peer.on('error', (err) => {
                if (err.type === 'unavailable-id') {
                    this.roomCode = this.generateRoomCode();
                    sessionStorage.setItem('svoyak_room', this.roomCode);
                    this.peer.destroy();
                    this.initHost(callbacks).then(resolve).catch(reject);
                    return;
                }
                callbacks.onError?.(err);
                reject(err);
            });
        });
    },

    initDisplay(roomCode, callbacks = {}) {
        this.mode = 'display';
        this.roomCode = this.normalizeCode(roomCode);

        if (!this.roomCode || this.roomCode.length < 4) {
            return Promise.reject(new Error('Неверный код комнаты'));
        }

        sessionStorage.setItem('svoyak_room', this.roomCode);

        let settled = false;

        return new Promise((resolve, reject) => {
            if (typeof Peer === 'undefined') {
                reject(new Error('PeerJS не загружен'));
                return;
            }

            this.peer = new Peer();

            this.peer.on('open', () => {
                const conn = this.peer.connect(`${PEER_PREFIX}${this.roomCode}`, { reliable: true });
                this.connection = conn;

                conn.on('open', () => {
                    if (settled) return;
                    settled = true;
                    callbacks.onConnected?.(this.roomCode);
                    resolve(this.roomCode);
                });

                conn.on('data', (data) => {
                    if (data?.type === 'state' && data.state) {
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.state));
                        callbacks.onState?.(data.state);
                        this._listeners.forEach(fn => fn(data.state));
                    }
                });

                conn.on('close', () => {
                    callbacks.onDisconnected?.();
                });

                conn.on('error', (err) => {
                    if (!settled) {
                        settled = true;
                        callbacks.onError?.(err);
                        reject(err);
                    }
                });
            });

            this.peer.on('error', (err) => {
                if (!settled) {
                    settled = true;
                    callbacks.onError?.(err);
                    reject(err);
                }
            });

            setTimeout(() => {
                if (!settled && !this.connection?.open) {
                    settled = true;
                    reject(new Error('Не удалось подключиться. Проверьте код и что ведущий уже открыл панель.'));
                }
            }, 12000);
        });
    },

    getDisplayUrl() {
        if (!this.roomCode) return 'index.html';
        const url = new URL('index.html', window.location.href);
        url.searchParams.set('room', this.roomCode);
        return url.href;
    }
};
