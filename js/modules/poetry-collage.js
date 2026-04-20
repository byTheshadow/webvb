/* ================================
   文件名：poetry-collage.js
   功能：拼贴诗生成系统
   依赖：storage.js, data-loader.js
   
   主要功能：
   - 快速生成诗句
   - 选择模板和情绪
   - 点击词语替换
   - DIY 自由创作
   - 保存和分享作品
   
   最后更新：2026-04-19
   ================================ */

const PoetryCollage = (function() {
    'use strict';
    
    // ========== 区块A：模块状态 开始 ==========
    const state = {
        words: null,           // 词库数据
        templates: null,       // 模板数据
        currentTemplate: null, // 当前选择的模板
        currentMood: 'all',    // 当前情绪
        currentPoem: [],       // 当前诗句（词语数组）
        isLoaded: false,       // 数据是否已加载
        mode: 'quick'          // 模式：quick(快速) | custom(自定义) | diy(DIY)
    };
    
    // ========== 区块A：模块状态 结束 ==========
    
    // ========== 区块B：数据加载 开始 ==========
    
    /**
     * 加载诗歌数据
     */
    async function loadData() {
        console.log('[PoetryCollage] 开始加载数据...');
        
        try {
            // 加载词库
            const wordsData = await DataLoader.loadJSON('data/poetry/words.json');
            state.words = wordsData.categories;
            
            // 加载模板
            const templatesData = await DataLoader.loadJSON('data/poetry/templates.json');
            state.templates = templatesData.templates;
            
            state.isLoaded = true;
            console.log('[PoetryCollage] 数据加载完成', {
                categories: Object.keys(state.words).length,
                templates: state.templates.length
            });
            
            return true;
        } catch (error) {
            console.error('[PoetryCollage] 数据加载失败:', error);
            return false;
        }
    }
    
    // ========== 区块B：数据加载 结束 ==========
    
    // ========== 区块C：诗句生成算法 开始 ==========
    
    /**
     * 随机选择一个模板
     */
    function selectRandomTemplate(mood = null) {
        let candidates = state.templates;
        
        // 如果指定了情绪，过滤模板
        if (mood && mood !== 'all') {
            candidates = state.templates.filter(t => 
                t.mood && t.mood.includes(mood)
            );
        }
        
        if (candidates.length === 0) {
            candidates = state.templates;
        }
        
        return candidates[Math.floor(Math.random() * candidates.length)];
    }
    
    /**
     * 从指定类别选择词语
     */
    function selectWord(category, mood = null, usedWords = []) {
        const categoryData = state.words[category];
        if (!categoryData) {
            console.warn('[PoetryCollage] 类别不存在:', category);
            return { text: '...', mood: [], weight: 1, synonyms: [] };
        }
        
        // 过滤候选词
        let candidates = categoryData.words.filter(w => 
            !usedWords.includes(w.text)
        );
        
        // 如果指定了情绪，优先选择匹配的词
        if (mood && mood !== 'all') {
            const moodMatched = candidates.filter(w => 
                w.mood && w.mood.includes(mood)
            );
            if (moodMatched.length > 0) {
                candidates = moodMatched;
            }
        }
        
        if (candidates.length === 0) {
            candidates = categoryData.words;
        }
        
        // 根据权重随机选择
        const totalWeight = candidates.reduce((sum, w) => sum + (w.weight || 1), 0);
        let random = Math.random() * totalWeight;
        
        for (const word of candidates) {
            random -= (word.weight || 1);
            if (random <= 0) {
                return word;
            }
        }
        
        return candidates[0];
    }
    
    /**
     * 生成诗句
     */
    function generatePoem(template = null, mood = null) {
        // 如果没有指定模板，随机选择
        if (!template) {
            template = selectRandomTemplate(mood);
        }
        
        state.currentTemplate = template;
        state.currentMood = mood || 'all';
        state.currentPoem = [];
        
        const usedWords = [];
        
        // 根据模板结构生成诗句
        template.structure.forEach((slot, index) => {
            if (slot.slot === 'linebreak') {
                state.currentPoem.push({
                    type: 'linebreak',
                    text: '\n',
                    index: index
                });
            } else {
                const word = selectWord(slot.slot, mood, usedWords);
                usedWords.push(word.text);
                
                state.currentPoem.push({
                    type: 'word',
                    category: slot.slot,
                    label: slot.label,
                    word: word,
                    text: word.text,
                    index: index
                });
            }
        });
        
        console.log('[PoetryCollage] 生成诗句:', getPoemText());
        return state.currentPoem;
    }
    
    /**
     * 获取诗句文本
     */
    function getPoemText() {
        return state.currentPoem
            .map(item => item.text)
            .join(state.currentTemplate.separator || '');
    }
    
    /**
     * 替换指定位置的词语
     */
    function replaceWord(index, newWord) {
        if (index < 0 || index >= state.currentPoem.length) {
            return false;
        }
        
        const item = state.currentPoem[index];
        if (item.type !== 'word') {
            return false;
        }
        
        // 如果是字符串，从同类别中查找
        if (typeof newWord === 'string') {
            const categoryData = state.words[item.category];
            const wordObj = categoryData.words.find(w => w.text === newWord);
            if (wordObj) {
                item.word = wordObj;
                item.text = wordObj.text;
            }
        } else {
            item.word = newWord;
            item.text = newWord.text;
        }
        
        console.log('[PoetryCollage] 替换词语:', item.text);
        return true;
    }
    
    // ========== 区块C：诗句生成算法 结束 ==========
    
    // ========== 区块D：UI渲染 开始 ==========
    
    /**
     * 渲染主界面
     */
    function render(container) {
        if (!state.isLoaded) {
            container.innerHTML = `
                <div class="poetry-page loading">
                    <div class="loading-spinner"></div>
                    <p>加载诗歌数据中...</p>
                </div>
            `;
            
            loadData().then(() => {
                render(container);
            });
            return;
        }
        
        container.innerHTML = `
            <div class="poetry-page">
                <!-- 头部 -->
                <div class="poetry-header">
                    <h1 class="poetry-title">📝 拼贴诗工坊</h1>
                    <p class="poetry-subtitle">"在词语的碎片中，拼凑你的灵魂"</p>
                </div>
                
                <!-- 模式选择 -->
                <div class="mode-selector">
                    <button class="mode-btn active" data-mode="quick">
                        <span class="mode-icon">⚡</span>
                        <span class="mode-name">快速生成</span>
                    </button>
                    <button class="mode-btn" data-mode="custom">
                        <span class="mode-icon">🎨</span>
                        <span class="mode-name">自定义创作</span>
                    </button>
                    <button class="mode-btn" data-mode="diy">
                        <span class="mode-icon">✨</span>
                        <span class="mode-name">DIY模式</span>
                    </button>
                </div>
                
                <!-- 内容区域 -->
                <div id="poetry-content" class="poetry-content">
                    ${renderQuickMode()}
                </div>
            </div>
        `;
        
        bindEvents(container);
    }
    
    /**
     * 渲染快速生成模式
     */
    function renderQuickMode() {
        // 如果还没有生成诗句，先生成一首
        if (state.currentPoem.length === 0) {
            generatePoem();
        }
        
        return `
            <div class="quick-mode">
                <!-- 诗句展示区 -->
                <div class="poem-display">
                    <div class="poem-canvas">
                        ${renderPoemCanvas()}
                    </div>
                </div>
                
                <!-- 操作按钮 -->
                <div class="poem-actions">
                    <button class="action-btn regenerate-btn" id="regenerate-btn">
                        <span class="btn-icon">🔄</span>
                        <span class="btn-text">重新生成</span>
                    </button>
                    <button class="action-btn save-btn" id="save-poem-btn">
                        <span class="btn-icon">💾</span>
                        <span class="btn-text">保存</span>
                    </button>
                    <button class="action-btn share-btn" id="share-poem-btn">
                        <span class="btn-icon">📤</span>
                        <span class="btn-text">分享</span>
                    </button>
                </div>
                
                <!-- 提示文字 -->
                <p class="poem-hint">💡 点击任意词语可以替换</p>
            </div>
        `;
    }
    
    /**
     * 渲染自定义创作模式
     */
    function renderCustomMode() {
        return `
            <div class="custom-mode">
                <!-- 模板选择 -->
                <div class="template-selector">
                    <h3 class="selector-title">选择诗歌模板</h3>
                    <div class="template-grid">
                        ${state.templates.map(t => `
                            <button class="template-card ${state.currentTemplate?.id === t.id ? 'active' : ''}" 
                                    data-template-id="${t.id}">
                                <h4 class="template-name">${t.name}</h4>
                                <p class="template-example">${t.example}</p>
                            </button>
                        `).join('')}
                    </div>
                </div>
                
                <!-- 情绪选择 -->
                <div class="mood-selector">
                    <h3 class="selector-title">选择情绪基调</h3>
                    <div class="mood-grid">
                        ${renderMoodButtons()}
                    </div>
                </div>
                
                <!-- 生成按钮 -->
                <button class="primary-btn generate-btn" id="generate-custom-btn">
                    生成诗句
                </button>
                
                <!-- 诗句展示（如果已生成） -->
                ${state.currentPoem.length > 0 ? `
                    <div class="poem-display">
                        <div class="poem-canvas">
                            ${renderPoemCanvas()}
                        </div>
                    </div>
                    
                    <div class="poem-actions">
                        <button class="action-btn save-btn" id="save-poem-btn">
                            <span class="btn-icon">💾</span>
                            <span class="btn-text">保存</span>
                        </button>
                        <button class="action-btn share-btn" id="share-poem-btn">
                            <span class="btn-icon">📤</span>
                            <span class="btn-text">分享</span>
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    /**
     * 渲染DIY模式
     */
    function renderDIYMode() {
        return `
            <div class="diy-mode">
                <div class="diy-workspace">
                    <!-- 词库面板 -->
                    <div class="word-library">
                        <h3 class="library-title">词库</h3>
                        ${Object.keys(state.words).map(category => `
                            <div class="word-category">
                                <h4 class="category-title">
                                    ${state.words[category].emoji} ${state.words[category].name}
                                </h4>
                                <div class="word-list">
                                    ${state.words[category].words.slice(0, 20).map(word => `
                                        <span class="word-chip draggable" draggable="true" 
                                              data-word="${word.text}" 
                                              data-category="${category}">
                                            ${word.text}
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <!-- 创作画布 -->
                    <div class="diy-canvas" id="diy-canvas">
                        <p class="canvas-placeholder">拖拽词语到这里开始创作...</p>
                    </div>
                </div>
                
                <!-- 操作按钮 -->
                <div class="poem-actions">
                    <button class="action-btn clear-btn" id="clear-canvas-btn">
                        <span class="btn-icon">🗑️</span>
                        <span class="btn-text">清空</span>
                    </button>
                    <button class="action-btn save-btn" id="save-poem-btn">
                        <span class="btn-icon">💾</span>
                        <span class="btn-text">保存</span>
                    </button>
                    <button class="action-btn share-btn" id="share-poem-btn">
                        <span class="btn-icon">📤</span>
                        <span class="btn-text">分享</span>
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * 渲染诗句画布
     */
    function renderPoemCanvas() {
        return state.currentPoem.map((item, index) => {
            if (item.type === 'linebreak') {
                return '<br>';
            } else {
                return `<span class="poem-word" data-index="${index}" title="点击替换">${item.text}</span>`;
            }
        }).join(state.currentTemplate.separator || '');
    }
    
    /**
     * 渲染情绪按钮
     */
    function renderMoodButtons() {
        const moods = [
            { id: 'all', name: '全部', emoji: '🌈' },
            { id: '忧郁', name: '忧郁', emoji: '🌧️' },
            { id: '浪漫', name: '浪漫', emoji: '💕' },
            { id: '神秘', name: '神秘', emoji: '🌙' },
            { id: '欢快', name: '欢快', emoji: '☀️' },
            { id: '孤独', name: '孤独', emoji: '🏔️' },
            { id: '苍凉', name: '苍凉', emoji: '🍂' }
        ];
        
        return moods.map(mood => `
            <button class="mood-btn ${state.currentMood === mood.id ? 'active' : ''}" 
                    data-mood="${mood.id}">
                <span class="mood-emoji">${mood.emoji}</span>
                <span class="mood-name">${mood.name}</span>
            </button>
        `).join('');
    }
    
    // ========== 区块D：UI渲染 结束 ==========
    
    // ========== 区块E：事件绑定 开始 ==========
    
    /**
     * 绑定事件
     */
    function bindEvents(container) {
        // 模式切换
        const modeBtns = container.querySelectorAll('.mode-btn');
        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                switchMode(mode, container);
            });
        });
        
        // 重新生成按钮
        const regenerateBtn = container.querySelector('#regenerate-btn');
        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', () => {
                generatePoem();
                updatePoemDisplay(container);
            });
        }
        
        // 保存按钮
        const saveBtns = container.querySelectorAll('#save-poem-btn');
        saveBtns.forEach(btn => {
            btn.addEventListener('click', () => savePoem());
        });
        
        // 分享按钮
        const shareBtns = container.querySelectorAll('#share-poem-btn');
        shareBtns.forEach(btn => {
            btn.addEventListener('click', () => sharePoem());
        });
        
        // 词语点击替换
        const poemWords = container.querySelectorAll('.poem-word');
        poemWords.forEach(word => {
            word.addEventListener('click', (e) => {
                showWordReplacer(e.target, container);
            });
        });
        
        // 自定义模式：模板选择
        const templateCards = container.querySelectorAll('.template-card');
        templateCards.forEach(card => {
            card.addEventListener('click', () => {
                const templateId = card.dataset.templateId;
                selectTemplate(templateId, container);
            });
        });
        
        // 自定义模式：情绪选择
        const moodBtns = container.querySelectorAll('.mood-btn');
        moodBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mood = btn.dataset.mood;
                state.currentMood = mood;
                
                // 更新按钮状态
                moodBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        // 自定义模式：生成按钮
        const generateCustomBtn = container.querySelector('#generate-custom-btn');
        if (generateCustomBtn) {
            generateCustomBtn.addEventListener('click', () => {
                if (!state.currentTemplate) {
                    alert('请先选择一个诗歌模板');
                    return;
                }
                generatePoem(state.currentTemplate, state.currentMood);
                switchMode('custom', container);
            });
        }
        
        // DIY模式：拖拽事件
        bindDragEvents(container);
        
        // DIY模式：清空按钮
        const clearBtn = container.querySelector('#clear-canvas-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                const canvas = container.querySelector('#diy-canvas');
                canvas.innerHTML = '<p class="canvas-placeholder">拖拽词语到这里开始创作...</p>';
            });
        }
    }
    
    /**
     * 切换模式
     */
    function switchMode(mode, container) {
        state.mode = mode;
        
        // 更新按钮状态
        const modeBtns = container.querySelectorAll('.mode-btn');
        modeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        // 更新内容区域
        const contentArea = container.querySelector('#poetry-content');
        if (mode === 'quick') {
            contentArea.innerHTML = renderQuickMode();
        } else if (mode === 'custom') {
            contentArea.innerHTML = renderCustomMode();
        } else if (mode === 'diy') {
            contentArea.innerHTML = renderDIYMode();
        }
        
        bindEvents(container);
    }
    
    /**
     * 更新诗句显示
     */
    function updatePoemDisplay(container) {
        const poemCanvas = container.querySelector('.poem-canvas');
        if (poemCanvas) {
            poemCanvas.innerHTML = renderPoemCanvas();
            
            // 重新绑定点击事件
            const poemWords = poemCanvas.querySelectorAll('.poem-word');
            poemWords.forEach(word => {
                word.addEventListener('click', (e) => {
                    showWordReplacer(e.target, container);
                });
            });
        }
    }
    
    /**
     * 显示词语替换器
     */
    function showWordReplacer(wordElement, container) {
        const index = parseInt(wordElement.dataset.index);
        const item = state.currentPoem[index];
        
        if (!item || item.type !== 'word') return;
        
        // 获取同义词
        const synonyms = item.word.synonyms || [];
        const category = item.category;
        const categoryData = state.words[category];
        
        // 获取同类别的其他词（最多10个）
        const alternatives = categoryData.words
            .filter(w => w.text !== item.text)
            .slice(0, 10);
        
        // 创建替换面板
        const replacerHTML = `
            <div class="word-replacer-modal" id="word-replacer">
                <div class="replacer-backdrop"></div>
                <div class="replacer-content">
                    <div class="replacer-header">
                        <h3>替换词语</h3>
                        <button class="close-btn" id="close-replacer">&times;</button>
                    </div>
                    <div class="replacer-body">
                        <p class="current-word">当前：<strong>${item.text}</strong></p>
                        
                        ${synonyms.length > 0 ? `
                            <div class="word-group">
                                <h4>同义词</h4>
                                <div class="word-options">
                                    ${synonyms.map(syn => `
                                        <button class="word-option" data-word="${syn}">${syn}</button>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        <div class="word-group">
                            <h4>同类词</h4>
                            <div class="word-options">
                                ${alternatives.map(alt => `
                                    <button class="word-option" data-word="${alt.text}">${alt.text}</button>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 移除旧的替换器
        const oldReplacer = document.getElementById('word-replacer');
        if (oldReplacer) oldReplacer.remove();
        
        // 插入新的替换器
        document.body.insertAdjacentHTML('beforeend', replacerHTML);
        
        // 绑定事件
        const replacer = document.getElementById('word-replacer');
        
        // 关闭按钮
        replacer.querySelector('#close-replacer').addEventListener('click', () => {
            replacer.remove();
        });
        
        // 点击背景关闭
        replacer.querySelector('.replacer-backdrop').addEventListener('click', () => {
            replacer.remove();
        });
        
        // 词语选项点击
        const wordOptions = replacer.querySelectorAll('.word-option');
        wordOptions.forEach(option => {
            option.addEventListener('click', () => {
                const newWord = option.dataset.word;
                replaceWord(index, newWord);
                updatePoemDisplay(container);
                replacer.remove();
            });
        });
        
        // 显示动画
        setTimeout(() => {
            replacer.classList.add('active');
        }, 10);
    }
    
    /**
     * 选择模板
     */
    function selectTemplate(templateId, container) {
        const template = state.templates.find(t => t.id === templateId);
        if (template) {
            state.currentTemplate = template;
            
            // 更新按钮状态
            const templateCards = container.querySelectorAll('.template-card');
            templateCards.forEach(card => {
                card.classList.toggle('active', card.dataset.templateId === templateId);
            });
        }
    }
    
    /**
     * 绑定拖拽事件（DIY模式）
     */
    function bindDragEvents(container) {
        const draggables = container.querySelectorAll('.draggable');
        const canvas = container.querySelector('#diy-canvas');
        
        if (!canvas) return;
        
        draggables.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.dataset.word);
                e.dataTransfer.effectAllowed = 'copy';
            });
        });
        
        canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            canvas.classList.add('drag-over');
        });
        
        canvas.addEventListener('dragleave', () => {
            canvas.classList.remove('drag-over');
        });
        
        canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            canvas.classList.remove('drag-over');
            
            const word = e.dataTransfer.getData('text/plain');
            
            // 移除占位符
            const placeholder = canvas.querySelector('.canvas-placeholder');
            if (placeholder) placeholder.remove();
            
            // 添加词语
            const wordSpan = document.createElement('span');
            wordSpan.className = 'diy-word';
            wordSpan.textContent = word;
            wordSpan.contentEditable = false;
            
            // 添加删除按钮
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-word-btn';
            deleteBtn.textContent = '×';
            deleteBtn.addEventListener('click', () => {
                wordSpan.remove();
                
                // 如果画布为空，显示占位符
                if (canvas.children.length === 0) {
                    canvas.innerHTML = '<p class="canvas-placeholder">拖拽词语到这里开始创作...</p>';
                }
            });
            
            wordSpan.appendChild(deleteBtn);
            canvas.appendChild(wordSpan);
        });
    }
    
    // ========== 区块E：事件绑定 结束 ==========
    
    // ========== 区块F：保存和分享 开始 ==========
    
    /**
     * 保存诗句
     */
    function savePoem() {
        let poemText;
        
        if (state.mode === 'diy') {
            const canvas = document.querySelector('#diy-canvas');
            const words = canvas.querySelectorAll('.diy-word');
            poemText = Array.from(words).map(w => w.textContent.replace('×', '')).join(' ');
        } else {
            poemText = getPoemText();
        }
        
        if (!poemText || poemText.trim() === '') {
            alert('请先创作一首诗');
            return;
        }
        
        const poem = {
            id: 'poem_' + Date.now(),
            text: poemText,
            template: state.currentTemplate?.name || 'DIY',
            mood: state.currentMood,
            timestamp: Date.now(),
            date: new Date().toLocaleString('zh-CN')
        };
        
        // 保存到 localStorage
        const poems = Storage.get('poems') || [];
        poems.unshift(poem);
        
        // 只保留最近50首
        if (poems.length > 50) {
            poems.length = 50;
        }
        
        Storage.set('poems', poems);
        
        console.log('[PoetryCollage] 诗句已保存:', poem);
        alert('✅ 诗句已保存！');
    }
    
    /**
     * 分享诗句
     */
    function sharePoem() {
        let poemText;
        
        if (state.mode === 'diy') {
            const canvas = document.querySelector('#diy-canvas');
            const words = canvas.querySelectorAll('.diy-word');
            poemText = Array.from(words).map(w => w.textContent.replace('×', '')).join(' ');
        } else {
            poemText = getPoemText();
        }
        
        if (!poemText || poemText.trim() === '') {
            alert('请先创作一首诗');
            return;
        }
        
        const shareText = `我在深渊之影创作了一首拼贴诗：\n\n${poemText}\n\n—— 来自灵魂实验室`;
        
        if (navigator.share) {
            navigator.share({
                title: '我的拼贴诗',
                text: shareText
            }).catch(err => console.log('分享失败', err));
        } else {
            // 复制到剪贴板
            navigator.clipboard.writeText(shareText).then(() => {
                alert('✅ 诗句已复制到剪贴板！');
            }).catch(() => {
                // 降级方案
                const textarea = document.createElement('textarea');
                textarea.value = shareText;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                alert('✅ 诗句已复制到剪贴板！');
            });
        }
    }
    
    // ========== 区块F：保存和分享 结束 ==========
    
        // ========== 区块G：公共API 开始 ==========
    
    return {
        init: loadData,
        render: render,
        generate: generatePoem,
        getPoem: getPoemText,
        getSavedPoems: function() {
            return Storage.get('poems') || [];
        }
    };
    
    // ========== 区块G：公共API 结束 ==========
    
})();

// ========== 导出到全局 ==========
window.PoetryCollage = PoetryCollage;

