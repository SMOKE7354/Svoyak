/** Редактор — локальное сохранение через GameData (localStorage) */

let rounds = [];
let activeRoundId = 1;
let activeCategoryIndex = -1;
let dirty = false;

const roundTabs = document.getElementById('round-tabs');
const categoryList = document.getElementById('category-list');
const emptyState = document.getElementById('empty-state');
const categoryEditor = document.getElementById('category-editor');
const catNameInput = document.getElementById('cat-name-input');
const roundTitleInput = document.getElementById('round-title-input');
const roundSubtitleInput = document.getElementById('round-subtitle-input');
const roundSettingsNum = document.getElementById('round-settings-num');
const questionsList = document.getElementById('questions-list');
const editorStatus = document.getElementById('editor-status');
const toast = document.getElementById('toast');

function reloadFromStorage() {
    GameData.reload();
    rounds = deepClone(GameData.getRounds());
    dirty = false;
    updateStatusLine();
    renderRoundTabs();
    renderCategoryList();
    const round = getActiveRound();
    if (round && activeCategoryIndex >= 0 && round.categories[activeCategoryIndex]) {
        renderCategoryEditor();
    } else {
        showEditorEmpty();
    }
}

function init() {
    rounds = deepClone(GameData.getRounds());
    updateStatusLine();
    renderRoundTabs();
    renderCategoryList();
    bindGlobalActions();
    selectRound(1);

    window.addEventListener('svoyak-game-updated', reloadFromStorage);
    window.addEventListener('storage', (e) => {
        if (e.key === GameData.storageKey || e.key === 'svoyak_game_data_version') {
            reloadFromStorage();
        }
    });
}

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function updateStatusLine() {
    const custom = GameData.isCustom();
    editorStatus.textContent = custom
        ? 'Используется ваша игра (сохранена локально)'
        : 'Стандартная игра — изменения сохранятся локально';
}

function getActiveRound() {
    return rounds.find(r => r.id === activeRoundId);
}

function getActiveCategory() {
    const round = getActiveRound();
    if (!round || activeCategoryIndex < 0) return null;
    return round.categories[activeCategoryIndex] || null;
}

function markDirty() {
    dirty = true;
    editorStatus.textContent = 'Есть несохранённые изменения';
}

function showToast(msg, isError = false) {
    toast.textContent = msg;
    toast.classList.toggle('error', isError);
    toast.classList.remove('hidden');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.add('hidden'), 2800);
}

function bindGlobalActions() {
    document.getElementById('btn-save').addEventListener('click', saveToGame);
    document.getElementById('btn-reset').addEventListener('click', resetToDefault);
    document.getElementById('btn-export').addEventListener('click', exportJson);
    document.getElementById('import-file').addEventListener('change', importJson);
    document.getElementById('btn-add-category').addEventListener('click', addCategory);
    document.getElementById('btn-delete-category').addEventListener('click', deleteCategory);
    document.getElementById('btn-add-round').addEventListener('click', addRound);
    document.getElementById('btn-delete-round').addEventListener('click', deleteRound);

    catNameInput.addEventListener('input', () => {
        const cat = getActiveCategory();
        if (cat) {
            cat.name = catNameInput.value;
            markDirty();
            renderCategoryList();
        }
    });

    roundTitleInput.addEventListener('input', () => {
        const round = getActiveRound();
        if (round) {
            round.title = roundTitleInput.value;
            markDirty();
            renderRoundTabs();
        }
    });

    roundSubtitleInput.addEventListener('input', () => {
        const round = getActiveRound();
        if (round) {
            round.subtitle = roundSubtitleInput.value;
            markDirty();
        }
    });

    document.querySelectorAll('.ed-link').forEach(link => {
        link.addEventListener('click', (e) => {
            if (!dirty) return;
            if (!confirm('Есть несохранённые изменения. Уйти без сохранения?')) {
                e.preventDefault();
            } else {
                dirty = false;
            }
        });
    });
}

function saveToGame() {
    syncFormToData();
    try {
        validateRounds(rounds);
        GameData.save(rounds);
        dirty = false;
        updateStatusLine();
        showToast('Сохранено! Обновите панель ведущего (F5)');
    } catch (err) {
        showToast(err.message, true);
    }
}

function resetToDefault() {
    if (!confirm('Вернуть стандартные вопросы? Ваша версия будет удалена.')) return;
    GameData.resetToDefault();
    rounds = deepClone(GameData.getRounds());
    dirty = false;
    activeCategoryIndex = -1;
    updateStatusLine();
    renderRoundTabs();
    renderCategoryList();
    showEditorEmpty();
    showToast('Восстановлена стандартная игра');
}

function exportJson() {
    syncFormToData();
    const blob = new Blob([JSON.stringify(rounds, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'svoyak-game.json';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Файл скачан');
}

function importJson(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const parsed = JSON.parse(reader.result);
            validateRounds(parsed);
            rounds = parsed;
            dirty = true;
            activeCategoryIndex = -1;
            renderRoundTabs();
            renderCategoryList();
            selectRound(rounds[0]?.id || 1);
            showToast('Импорт OK — нажмите «Сохранить в игру»');
        } catch (err) {
            showToast(err.message, true);
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}

function validateRounds(data) {
    if (!Array.isArray(data) || !data.length) throw new Error('Нужен массив раундов');
    data.forEach((r, i) => {
        if (!r.id) r.id = i + 1;
        if (!r.title) r.title = `Раунд ${r.id}`;
        if (!r.subtitle) r.subtitle = '';
        if (!r.categories?.length) throw new Error(`Раунд ${i + 1}: нужна хотя бы одна категория`);
        r.categories.forEach((cat, ci) => {
            if (!cat.name?.trim()) throw new Error(`Раунд ${r.id}, кат. ${ci + 1}: укажите название`);
            if (!cat.questions?.length) throw new Error(`«${cat.name}»: добавьте вопросы`);
            cat.questions.forEach((q, qi) => {
                if (!q.text?.trim()) throw new Error(`«${cat.name}», вопрос ${qi + 1}: пустой текст`);
                if (!q.answer?.trim()) throw new Error(`«${cat.name}», вопрос ${qi + 1}: пустой ответ`);
                if (!q.price) q.price = r.prices?.[qi] || 100;
                if (!q.id) q.id = `custom_r${r.id}_c${ci}_q${qi}_${q.price}`;
            });
        });
    });
}

function syncRoundMetaInputs() {
    const round = getActiveRound();
    if (!round) return;
    if (roundTitleInput) roundTitleInput.value = round.title || '';
    if (roundSubtitleInput) roundSubtitleInput.value = round.subtitle || '';
    if (roundSettingsNum) roundSettingsNum.textContent = round.id;
}

function renumberRounds() {
    rounds.forEach((r, i) => {
        r.id = i + 1;
    });
}

function defaultPricesForRound(index) {
    const presets = [
        [100, 200, 300, 400, 500],
        [200, 400, 600, 800, 1000],
        [500, 1000, 1500, 2000, 2500]
    ];
    return presets[index] || presets[0].map(p => p * (index + 1));
}

function addRound() {
    syncFormToData();
    if (rounds.length >= 10) {
        showToast('Максимум 10 раундов', true);
        return;
    }
    const newIndex = rounds.length;
    const prices = defaultPricesForRound(newIndex);
    const newId = newIndex + 1;
    rounds.push({
        id: newId,
        title: `Раунд ${newId}`,
        subtitle: `Вопросы за ${prices[0]}–${prices[prices.length - 1]}`,
        prices,
        categories: [{
            name: 'Категория 1',
            questions: prices.map((price, i) => ({
                id: `custom_r${newId}_c0_q${i}_${price}`,
                price,
                text: '',
                answer: ''
            }))
        }]
    });
    activeCategoryIndex = -1;
    markDirty();
    selectRound(newId);
    showToast('Раунд добавлен');
}

function deleteRound() {
    if (rounds.length <= 1) {
        showToast('Нужен хотя бы один раунд', true);
        return;
    }
    const round = getActiveRound();
    if (!round) return;
    if (!confirm(`Удалить «${round.title}» и все его категории?`)) return;

    syncFormToData();
    rounds = rounds.filter(r => r.id !== activeRoundId);
    renumberRounds();
    activeCategoryIndex = -1;
    activeRoundId = rounds[0]?.id || 1;
    markDirty();
    renderRoundTabs();
    renderCategoryList();
    selectRound(activeRoundId);
    showToast('Раунд удалён');
}

function syncFormToData() {
    const round = getActiveRound();
    if (round) {
        round.title = roundTitleInput?.value?.trim() || round.title;
        round.subtitle = roundSubtitleInput?.value?.trim() || round.subtitle;
    }

    const cat = getActiveCategory();
    if (!cat) return;
    cat.name = catNameInput.value.trim() || cat.name;

    questionsList.querySelectorAll('.question-card').forEach((card, i) => {
        const q = cat.questions[i];
        if (!q) return;
        q.price = parseInt(card.querySelector('[data-field="price"]')?.value, 10) || q.price;
        q.text = card.querySelector('[data-field="text"]')?.value || '';
        q.answer = card.querySelector('[data-field="answer"]')?.value || '';
        const img = card.querySelector('[data-field="image"]')?.value?.trim();
        if (img) q.image = img;
        else delete q.image;
        const answerImg = card.querySelector('[data-field="answerImage"]')?.value?.trim();
        if (answerImg) q.answerImage = answerImg;
        else delete q.answerImage;
    });
}

function renderRoundTabs() {
    roundTabs.innerHTML = rounds.map(r => `
        <button type="button" class="round-tab ${r.id === activeRoundId ? 'active' : ''}" data-round="${r.id}">
            <span class="round-tab-num">${r.id}</span>
            <span>${escapeHtml(r.title)}</span>
        </button>
    `).join('');

    roundTabs.querySelectorAll('.round-tab').forEach(btn => {
        btn.addEventListener('click', () => selectRound(parseInt(btn.dataset.round, 10)));
    });
}

function selectRound(id) {
    syncFormToData();
    activeRoundId = id;
    activeCategoryIndex = -1;
    renderRoundTabs();
    renderCategoryList();
    showEditorEmpty();
    syncRoundMetaInputs();
}

function renderCategoryList() {
    const round = getActiveRound();
    if (!round) {
        categoryList.innerHTML = '';
        return;
    }

    categoryList.innerHTML = round.categories.map((cat, i) => `
        <li>
            <button type="button" class="${i === activeCategoryIndex ? 'active' : ''}" data-idx="${i}">
                ${escapeHtml(cat.name || 'Без названия')}
            </button>
        </li>
    `).join('');

    categoryList.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => selectCategory(parseInt(btn.dataset.idx, 10)));
    });
}

function selectCategory(index) {
    syncFormToData();
    activeCategoryIndex = index;
    renderCategoryList();
    renderCategoryEditor();
}

function showEditorEmpty() {
    emptyState.classList.remove('hidden');
    categoryEditor.classList.add('hidden');
}

function renderCategoryEditor() {
    const cat = getActiveCategory();
    const round = getActiveRound();
    if (!cat || !round) {
        showEditorEmpty();
        return;
    }

    emptyState.classList.add('hidden');
    categoryEditor.classList.remove('hidden');

    catNameInput.value = cat.name || '';
    syncRoundMetaInputs();

    ensureQuestionCount(cat, round);

    questionsList.innerHTML = cat.questions.map((q, i) => renderQuestionCard(q, i, round)).join('');
    bindQuestionCards(cat);
}

function ensureQuestionCount(cat, round) {
    const target = 5;
    const prices = round.prices || [100, 200, 300, 400, 500];
    while (cat.questions.length < target) {
        const i = cat.questions.length;
        cat.questions.push({
            id: `custom_r${round.id}_c${activeCategoryIndex}_q${i}_${prices[i] || 100}`,
            price: prices[i] || 100 * (i + 1),
            text: '',
            answer: ''
        });
    }
    if (cat.questions.length > target) cat.questions.length = target;
}

function renderQuestionCard(q, index, round) {
    const price = q.price ?? round.prices?.[index] ?? 100;

    return `
        <div class="question-card" data-qindex="${index}">
            <div class="q-card-head">
                <span class="q-price-badge">Вопрос ${index + 1}</span>
                <input type="number" class="ed-input q-price-input" data-field="price" value="${price}" min="1" step="50">
            </div>
            <div class="q-fields">
                <div>
                    <label class="field-label">Текст вопроса</label>
                    <textarea class="ed-textarea" data-field="text" rows="3" placeholder="Вопрос для игроков">${escapeHtml(q.text || '')}</textarea>
                </div>
                <div>
                    <label class="field-label">Ответ</label>
                    <textarea class="ed-textarea" data-field="answer" rows="3" placeholder="Правильный ответ">${escapeHtml(q.answer || '')}</textarea>
                </div>
                ${renderImageField('image', 'Картинка к вопросу (на табло с вопросом)', q.image, index)}
                ${renderImageField('answerImage', 'Картинка к ответу (на табло при «Показать ответ»)', q.answerImage, index, true)}
            </div>
        </div>
    `;
}

function renderImageField(field, label, value, index, isAnswer = false) {
    const imgPreview = value
        ? `<div class="image-preview-wrap"><img class="image-preview" src="${escapeAttr(value)}" alt=""></div>`
        : '';

    return `
        <div class="image-row ${isAnswer ? 'image-row-answer' : ''}">
            <div class="image-field">
                <label class="field-label">${label}</label>
                <input type="text" class="ed-input" data-field="${field}" value="${escapeAttr(value || '')}" placeholder="https://… или загрузите файл">
                ${imgPreview}
            </div>
            <label class="image-upload-label">
                📷 Загрузить
                <input type="file" accept="image/*" data-upload-index="${index}" data-upload-field="${field}" hidden>
            </label>
        </div>
    `;
}

function bindQuestionCards(cat) {
    questionsList.querySelectorAll('[data-field]').forEach(el => {
        el.addEventListener('input', () => {
            markDirty();
            if (el.dataset.field === 'image' || el.dataset.field === 'answerImage') {
                updateImagePreview(el);
            }
        });
    });

    questionsList.querySelectorAll('input[data-upload-field]').forEach(input => {
        input.addEventListener('change', (e) => handleImageUpload(e, cat));
    });
}

function updateImagePreview(input) {
    const card = input.closest('.question-card');
    if (!card) return;
    const container = input.closest('.image-field');
    if (!container) return;
    let wrap = container.querySelector('.image-preview-wrap');
    const url = input.value.trim();
    if (!url) {
        wrap?.remove();
        return;
    }
    if (!wrap) {
        wrap = document.createElement('div');
        wrap.className = 'image-preview-wrap';
        container.appendChild(wrap);
    }
    wrap.innerHTML = `<img class="image-preview" src="${escapeAttr(url)}" alt="">`;
}

function handleImageUpload(e, cat) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 800000) {
        showToast('Картинка слишком большая (макс. ~800 КБ)', true);
        return;
    }
    const index = parseInt(e.target.dataset.uploadIndex, 10);
    const field = e.target.dataset.uploadField || 'image';
    const reader = new FileReader();
    reader.onload = () => {
        cat.questions[index][field] = reader.result;
        markDirty();
        renderCategoryEditor();
        showToast(field === 'answerImage' ? 'Картинка к ответу добавлена' : 'Картинка добавлена');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
}

function addCategory() {
    const round = getActiveRound();
    if (!round) return;
    if (round.categories.length >= 8) {
        showToast('Максимум 8 категорий в раунде', true);
        return;
    }

    syncFormToData();
    const prices = round.prices || [100, 200, 300, 400, 500];
    const idx = round.categories.length;
    round.categories.push({
        name: `Категория ${idx + 1}`,
        questions: prices.map((price, i) => ({
            id: `custom_r${round.id}_c${idx}_q${i}_${price}`,
            price,
            text: '',
            answer: ''
        }))
    });
    activeCategoryIndex = round.categories.length - 1;
    markDirty();
    renderCategoryList();
    renderCategoryEditor();
}

function deleteCategory() {
    const round = getActiveRound();
    if (!round || activeCategoryIndex < 0) return;
    if (round.categories.length <= 1) {
        showToast('Нужна хотя бы одна категория', true);
        return;
    }
    if (!confirm(`Удалить «${round.categories[activeCategoryIndex].name}»?`)) return;

    round.categories.splice(activeCategoryIndex, 1);
    activeCategoryIndex = Math.min(activeCategoryIndex, round.categories.length - 1);
    markDirty();
    renderCategoryList();
    if (activeCategoryIndex >= 0) renderCategoryEditor();
    else showEditorEmpty();
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
    return escapeHtml(str).replace(/'/g, '&#39;');
}

init();
