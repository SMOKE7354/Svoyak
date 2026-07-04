/** Загрузка картинок в Firebase Storage — работает на всех устройствах и с Render */

const FirebaseMedia = {
    _storage: null,

    isReady() {
        return typeof firebase !== 'undefined'
            && typeof isFirebaseReady === 'function'
            && isFirebaseReady()
            && window.firebaseConfig?.storageBucket;
    },

    _getStorage() {
        if (this._storage) return this._storage;
        if (!this.isReady()) return null;
        try {
            if (!firebase.apps.length) {
                firebase.initializeApp(window.firebaseConfig);
            }
            this._storage = firebase.storage();
            return this._storage;
        } catch (err) {
            console.error('Firebase Storage init error:', err);
            return null;
        }
    },

    storagePathFor(roundId, catIndex, qIndex, field, filename) {
        const ext = getImageExtension(filename);
        const suffix = field === 'answerImage' ? 'answer' : 'question';
        const room = typeof gameSync !== 'undefined' ? gameSync.getRoomCode() : 'SVOYAK';
        return `games/${room}/r${roundId}-c${catIndex + 1}-q${qIndex + 1}-${suffix}.${ext}`;
    },

    async uploadFile(file, storagePath) {
        const storage = this._getStorage();
        if (!storage) {
            throw new Error('Firebase Storage недоступен. Проверьте firebase-config.js и правила Storage.');
        }
        const ref = storage.ref(storagePath);
        const snap = await ref.put(file, { contentType: file.type || 'image/jpeg' });
        return snap.ref.getDownloadURL();
    },

    async uploadDataUrl(dataUrl, storagePath) {
        const [header, data] = dataUrl.split(',');
        const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
        const binary = atob(data);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: mime });
        return this.uploadFile(blob, storagePath);
    },

    async uploadEmbeddedImagesInRounds(rounds, onProgress) {
        if (!this.isReady()) return { rounds, uploaded: 0 };

        const copy = cloneRounds(rounds);
        let uploaded = 0;

        for (const r of copy) {
            for (let ci = 0; ci < (r.categories?.length || 0); ci++) {
                const cat = r.categories[ci];
                for (let qi = 0; qi < (cat.questions?.length || 0); qi++) {
                    const q = cat.questions[qi];
                    for (const field of ['image', 'answerImage']) {
                        if (!isDataUrl(q[field])) continue;
                        const path = this.storagePathFor(r.id, ci, qi, field, `${field}.jpg`);
                        onProgress?.(`Загрузка ${path}…`);
                        q[field] = await this.uploadDataUrl(q[field], path);
                        uploaded++;
                    }
                }
            }
        }

        return { rounds: copy, uploaded };
    }
};
