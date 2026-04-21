/* ================================
   文件名：cocktail-mixer.js
   功能：调酒系统核心
   依赖：DataLoader, Storage
   
   主要功能：
   - 选择心情/基酒/辅料/手法/装饰
   - 生成酒卡
   - 预设配方推荐
   - 保存到 localStorage
   
   最后更新：2026-04-20
   ================================ */

// ========== 区块A：调酒模块 开始 ==========
const CocktailMixer = (function() {
    'use strict';

    // ========== 区块A1：模块状态 开始 ==========
    let state = {
        // 数据
        spirits: [],
        mixers: [],
        garnishes: [],
        techniques: [],
        presets: [],
        
        // 当前选择
        currentMood: null,
        selectedSpirit: null,
        selectedMixers: [],
        selectedTechnique: null,
        selectedGarnishes: [],
        
        // UI状态
        currentStep: 'mood', // mood, spirit, mixer, technique, garnish, result
        viewMode: 'create' // create, presets
    };
    // ========== 区块A1：模块状态 结束 ==========

    // ========== 区块A2：初始化 开始 ==========
    async function init() {
        console.log('[CocktailMixer] 初始化调酒系统...');
        await loadData();
    }
    // ========== 区块A2：初始化 结束 ==========

    // ========== 区块A3：加载数据 开始 ==========
    async function loadData() {
        try {
            const [spiritsData, mixersData, garnishesData, techniquesData, presetsData] = await Promise.all([
                DataLoader.loadJSON('data/cocktails/base-spirits.json'),
                DataLoader.loadJSON('data/cocktails/mixers.json'),
                DataLoader.loadJSON('data/cocktails/garnishes.json'),
                DataLoader.loadJSON('data/cocktails/techniques.json'),
                DataLoader.loadJSON('data/cocktails/presets.json')
            ]);

            state.spirits = spiritsData.spirits || [];
            state.mixers = mixersData.mixers || [];
            state.garnishes = garnishesData.garnishes || [];
            state.techniques = techniquesData.techniques || [];
            state.presets = presetsData.presets || [];

            console.log('[CocktailMixer] 数据加载完成', {
                spirits: state.spirits.length,
                mixers: state.mixers.length,
                garnishes: state.garnishes.length,
                techniques: state.techniques.length,
                presets: state.presets.length
            });
        } catch (error) {
            console.error('[CocktailMixer] 数据加载失败', error);
        }
    }
    // ========== 区块A3：加载数据 结束 ==========

    // ========== 区块A4：渲染主页面 开始 ==========
    function render(container) {
        container.innerHTML = `
            <div class="cocktail-mixer-page">
                <!-- 顶部导航 -->
                <div class="mixer-header">
                    <h1 class="mixer-title">🍸 调酒工坊</h1>
                    <div class="mixer-tabs">
                        <button class="mixer-tab ${state.viewMode === 'create' ? 'active' : ''}" 
                                onclick="CocktailMixer.switchView('create')">
                            自由调制
                        </button>
                        <button class="mixer-tab ${state.viewMode === 'presets' ? 'active' : ''}" 
                                onclick="CocktailMixer.switchView('presets')">
                            预设配方
                        </button>
                    </div>
                </div>

                <!-- 主内容区 -->
                <div class="mixer-content">
                    ${state.viewMode === 'create' ? renderCreateMode() : renderPresetsMode()}
                </div>
            </div>
        `;
    }
    // ========== 区块A4：渲染主页面 结束 ==========

    // ========== 区块A5：渲染创作模式 开始 ==========
    function renderCreateMode() {
        return `
            <div class="create-mode">
                <!-- 步骤指示器 -->
                ${renderStepIndicator()}
                
                <!-- 当前步骤内容 -->
                <div class="step-content">
                    ${renderCurrentStep()}
                </div>
                
                <!-- 当前选择预览 -->
                ${renderSelectionPreview()}
            </div>
        `;
    }
    // ========== 区块A5：渲染创作模式 结束 ==========

    // ========== 区块A6：渲染步骤指示器 开始 ==========
    function renderStepIndicator() {
    const steps = [
        { id: 'mood', label: '心情', icon: '💭' },
        { id: 'character', label: '角色', icon: '👥' }, // ✨ 新增
        { id: 'spirit', label: '基酒', icon: '🥃' },
        { id: 'mixer', label: '辅料', icon: '🧃' },
        { id: 'technique', label: '手法', icon: '🧊' },
        { id: 'garnish', label: '装饰', icon: '🌿' },
        { id: 'result', label: '完成', icon: '✨' }
    ];

    return `
        <div class="step-indicator">
            ${steps.map((step, index) => `
                <div class="step-item ${state.currentStep === step.id ? 'active' : ''} ${isStepCompleted(step.id) ? 'completed' : ''}">
                    <div class="step-icon">${step.icon}</div>
                    <div class="step-label">${step.label}</div>
                </div>
            `).join('')}
        </div>
    `;
}

function isStepCompleted(stepId) {
    const stepOrder = ['mood', 'character', 'spirit', 'mixer', 'technique', 'garnish', 'result']; // ✨ 更新
    const currentIndex = stepOrder.indexOf(state.currentStep);
    const stepIndex = stepOrder.indexOf(stepId);
    return stepIndex < currentIndex;
}

    function isStepCompleted(stepId) {
        const stepOrder = ['mood', 'spirit', 'mixer', 'technique', 'garnish', 'result'];
        const currentIndex = stepOrder.indexOf(state.currentStep);
        const stepIndex = stepOrder.indexOf(stepId);
        return stepIndex < currentIndex;
    }
    // ========== 区块A6：渲染步骤指示器 结束 ==========

    // ========== 区块A7：渲染当前步骤 开始 ==========
    function renderCurrentStep() {
        switch (state.currentStep) {
            case 'mood':
                return renderMoodStep();
            case 'spirit':
                return renderSpiritStep();
            case 'mixer':
                return renderMixerStep();
            case 'technique':
                return renderTechniqueStep();
            case 'garnish':
                return renderGarnishStep();
            case 'result':
                return renderResultStep();
            default:
                return '';
        }
    }
    // ========== 区块A7：渲染当前步骤 结束 ==========

    // ========== 区块A8：心情选择步骤 开始 ==========
    function renderMoodStep() {
        const moods = [
            { id: 'calm', name: '平静', emoji: '🌙', desc: '需要一些宁静' },
            { id: 'energetic', name: '活力', emoji: '⚡', desc: '充满能量' },
            { id: 'romantic', name: '浪漫', emoji: '💕', desc: '温柔的时刻' },
            { id: 'melancholy', name: '忧郁', emoji: '🌧️', desc: '沉浸在情绪中' },
            { id: 'adventurous', name: '冒险', emoji: '🔥', desc: '想要尝试新事物' },
            { id: 'nostalgic', name: '怀旧', emoji: '📼', desc: '回忆过去' }
        ];

        return `
            <div class="mood-selection">
                <h2 class="step-title">此刻的心情是？</h2>
                <p class="step-subtitle">选择一个最贴近你现在感受的词</p>
                <div class="mood-grid">
                    ${moods.map(mood => `
                        <div class="mood-card ${state.currentMood === mood.id ? 'selected' : ''}" 
                             onclick="CocktailMixer.selectMood('${mood.id}')">
                            <div class="mood-emoji">${mood.emoji}</div>
                            <h3 class="mood-name">${mood.name}</h3>
                            <p class="mood-desc">${mood.desc}</p>
                        </div>
                    `).join('')}
                </div>
                ${state.currentMood ? `
                    <button class="next-step-btn primary-btn" onclick="CocktailMixer.nextStep()">
                        下一步：选择基酒
                    </button>
                ` : ''}
            </div>
        `;
    }
    // ========== 区块A8：心情选择步骤 结束 ==========

    // ========== 区块A9：基酒选择步骤 开始 ==========
    function renderSpiritStep() {
        // 根据心情推荐基酒
        const recommendedSpirits = getRecommendedSpirits();

        return `
            <div class="spirit-selection">
                <h2 class="step-title">选择基酒</h2>
                <p class="step-subtitle">酒的灵魂所在</p>
                
                ${recommendedSpirits.length > 0 ? `
                    <div class="recommended-section">
                        <h3 class="section-label">💡 为你推荐</h3>
                        <div class="spirit-grid">
                            ${recommendedSpirits.map(spirit => renderSpiritCard(spirit, true)).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="all-spirits-section">
                    <h3 class="section-label">所有基酒</h3>
                    <div class="spirit-grid">
                        ${state.spirits.map(spirit => renderSpiritCard(spirit, false)).join('')}
                    </div>
                </div>
                
                <div class="step-actions">
                    <button class="secondary-btn" onclick="CocktailMixer.prevStep()">上一步</button>
                    ${state.selectedSpirit ? `
                        <button class="primary-btn" onclick="CocktailMixer.nextStep()">下一步</button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    function renderSpiritCard(spirit, isRecommended) {
        const isSelected = state.selectedSpirit?.id === spirit.id;
        return `
            <div class="spirit-card ${isSelected ? 'selected' : ''} ${isRecommended ? 'recommended' : ''}" 
                 onclick="CocktailMixer.selectSpirit('${spirit.id}')">
                <div class="spirit-emoji">${spirit.emoji}</div>
                <h3 class="spirit-name">${spirit.name}</h3>
                <p class="spirit-name-en">${spirit.nameEn}</p>
                <p class="spirit-desc">${spirit.description}</p>
                <div class="spirit-abv">${spirit.abv}% ABV</div>
                ${isRecommended ? '<div class="recommended-badge">推荐</div>' : ''}
            </div>
        `;
    }

    function getRecommendedSpirits() {
        if (!state.currentMood) return [];
        
        // 简单的心情-基酒匹配逻辑
        const moodSpiritMap = {
            'calm': ['sake', 'gin', 'vodka'],
            'energetic': ['tequila', 'rum', 'gin'],
            'romantic': ['champagne', 'baileys', 'cointreau'],
            'melancholy': ['whisky', 'brandy', 'rum'],
            'adventurous': ['absinthe', 'tequila', 'pisco'],
            'nostalgic': ['whisky', 'brandy', 'umeshu']
        };

        const recommendedIds = moodSpiritMap[state.currentMood] || [];
        return state.spirits.filter(s => recommendedIds.includes(s.id));
    }
    // ========== 区块A9：基酒选择步骤 结束 ==========

    // ========== 区块A10：辅料选择步骤 开始 ==========
    function renderMixerStep() {
        const categories = ['果汁', '糖浆', '苦精', '碳酸', '乳制品', '其他'];
        
        return `
            <div class="mixer-selection">
                <h2 class="step-title">添加辅料</h2>
                <p class="step-subtitle">可以选择多个，也可以跳过</p>
                
                ${categories.map(category => {
                    const mixersInCategory = state.mixers.filter(m => m.category === category);
                    if (mixersInCategory.length === 0) return '';
                    
                    return `
                        <div class="mixer-category">
                            <h3 class="category-title">${category}</h3>
                            <div class="mixer-grid">
                                ${mixersInCategory.map(mixer => renderMixerCard(mixer)).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
                
                <div class="step-actions">
                    <button class="secondary-btn" onclick="CocktailMixer.prevStep()">上一步</button>
                    <button class="primary-btn" onclick="CocktailMixer.nextStep()">
                        ${state.selectedMixers.length > 0 ? '下一步' : '跳过'}
                    </button>
                </div>
            </div>
        `;
    }

    function renderMixerCard(mixer) {
        const isSelected = state.selectedMixers.some(m => m.id === mixer.id);
        return `
            <div class="mixer-card ${isSelected ? 'selected' : ''}" 
                 onclick="CocktailMixer.toggleMixer('${mixer.id}')">
                <div class="mixer-emoji">${mixer.emoji}</div>
                <h4 class="mixer-name">${mixer.name}</h4>
                <p class="mixer-desc">${mixer.description}</p>
            </div>
        `;
    }
    // ========== 区块A10：辅料选择步骤 结束 ==========

    // ========== 区块A11：手法选择步骤 开始 ==========
    function renderTechniqueStep() {
        return `
            <div class="technique-selection">
                <h2 class="step-title">选择调制手法</h2>
                <p class="step-subtitle">不同的手法带来不同的口感</p>
                
                <div class="technique-grid">
                    ${state.techniques.map(tech => renderTechniqueCard(tech)).join('')}
                </div>
                
                <div class="step-actions">
                    <button class="secondary-btn" onclick="CocktailMixer.prevStep()">上一步</button>
                    ${state.selectedTechnique ? `
                        <button class="primary-btn" onclick="CocktailMixer.nextStep()">下一步</button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    function renderTechniqueCard(tech) {
        const isSelected = state.selectedTechnique?.id === tech.id;
        return `
            <div class="technique-card ${isSelected ? 'selected' : ''}" 
                 onclick="CocktailMixer.selectTechnique('${tech.id}')">
                <div class="technique-emoji">${tech.emoji}</div>
                <h3 class="technique-name">${tech.name}</h3>
                <p class="technique-name-en">${tech.nameEn}</p>
                                <p class="technique-desc">${tech.description}</p>
                <div class="technique-meta">
                    <span class="technique-duration">⏱️ ${tech.duration}</span>
                    <span class="technique-difficulty">📊 ${tech.difficulty}</span>
                </div>
            </div>
        `;
    }
    // ========== 区块A11：手法选择步骤 结束 ==========

    // ========== 区块A12：装饰选择步骤 开始 ==========
    function renderGarnishStep() {
        return `
            <div class="garnish-selection">
                <h2 class="step-title">添加装饰</h2>
                <p class="step-subtitle">最后的点睛之笔，可以选择多个或跳过</p>
                
                <div class="garnish-grid">
                    ${state.garnishes.map(garnish => renderGarnishCard(garnish)).join('')}
                </div>
                
                <div class="step-actions">
                    <button class="secondary-btn" onclick="CocktailMixer.prevStep()">上一步</button>
                    <button class="primary-btn" onclick="CocktailMixer.generateCocktail()">
                        🍸 生成酒卡
                    </button>
                </div>
            </div>
        `;
    }

    function renderGarnishCard(garnish) {
        const isSelected = state.selectedGarnishes.some(g => g.id === garnish.id);
        return `
            <div class="garnish-card ${isSelected ? 'selected' : ''}" 
                 onclick="CocktailMixer.toggleGarnish('${garnish.id}')">
                <div class="garnish-emoji">${garnish.emoji}</div>
                <h4 class="garnish-name">${garnish.name}</h4>
                <p class="garnish-desc">${garnish.description}</p>
                <span class="garnish-placement">${garnish.placement}</span>
            </div>
        `;
    }
    // ========== 区块A12：装饰选择步骤 结束 ==========

   // ========== 区块A13：结果展示步骤 开始 ==========
function renderResultStep() {
    const cocktail = state.generatedCocktail;
    if (!cocktail) return '<p>生成失败，请重试</p>';

    // ✅ 增加容错检查
    if (!cocktail.spirit) {
        console.error('[CocktailMixer] 酒卡数据错误：缺少基酒');
        return '<p class="error-message">酒卡数据错误，请重新调制</p>';
    }

    if (!cocktail.technique) {
        console.error('[CocktailMixer] 酒卡数据错误：缺少手法');
        return '<p class="error-message">酒卡数据错误，请重新调制</p>';
    }

    return `
        <div class="cocktail-result">
            <div class="result-card">
                <!-- 酒卡头部 -->
                <div class="result-header" style="background: linear-gradient(135deg, ${cocktail.color}, ${cocktail.secondaryColor});">
                    <h2 class="cocktail-name">${cocktail.name}</h2>
                    ${cocktail.nameEn ? `<p class="cocktail-name-en">${cocktail.nameEn}</p>` : ''}
                </div>

                <!-- 酒卡主体 -->
                <div class="result-body">
                    <!-- 配方信息 -->
                    <div class="recipe-section">
                        <h3 class="section-title">🥃 配方</h3>
                        <div class="recipe-list">
                            <div class="recipe-item">
                                <span class="ingredient-icon">${cocktail.spirit.emoji || '🥃'}</span>
                                <span class="ingredient-name">${cocktail.spirit.name}</span>
                                <span class="ingredient-amount">50ml</span>
                            </div>
                            ${cocktail.mixers && cocktail.mixers.length > 0 ? cocktail.mixers.map(mixer => `
                                <div class="recipe-item">
                                    <span class="ingredient-icon">${mixer.emoji || '🧃'}</span>
                                    <span class="ingredient-name">${mixer.name}</span>
                                    <span class="ingredient-amount">适量</span>
                                </div>
                            `).join('') : ''}
                        </div>
                    </div>

                    <!-- 调制方法 -->
                    <div class="method-section">
                        <h3 class="section-title">🧊 手法</h3>
                        <div class="method-card">
                            <span class="method-emoji">${cocktail.technique.emoji || '🧊'}</span>
                            <span class="method-name">${cocktail.technique.name}</span>
                        </div>
                        <p class="method-desc">${cocktail.technique.effect || cocktail.technique.description || ''}</p>
                    </div>

                    <!-- 装饰 -->
                    ${cocktail.garnishes && cocktail.garnishes.length > 0 ? `
                        <div class="garnish-section">
                            <h3 class="section-title">🌿 装饰</h3>
                            <div class="garnish-list">
                                ${cocktail.garnishes.map(g => `
                                    <span class="garnish-tag">${g.emoji || '🌿'} ${g.name}</span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <!-- 描述 -->
                    <div class="description-section">
                        <h3 class="section-title">✨ 品鉴</h3>
                        <p class="cocktail-description">${cocktail.description || '一杯独特的调制'}</p>
                    </div>

                    <!-- 心情标签 -->
                    ${cocktail.mood ? `
                        <div class="mood-tag-section">
                            <span class="mood-tag">💭 ${getMoodName(cocktail.mood)}</span>
                        </div>
                    ` : ''}
                </div>

                <!-- 操作按钮 -->
                <div class="result-actions">
                    <button class="secondary-btn" onclick="CocktailMixer.reset()">
                        🔄 重新调制
                    </button>
                    <button class="primary-btn" onclick="CocktailMixer.saveCocktail()">
                        💾 保存酒卡
                    </button>
                    <button class="secondary-btn" onclick="CocktailMixer.shareCocktail()">
                        📤 分享
                    </button>
                </div>
            </div>
        </div>
    `;
}

function getMoodName(moodId) {
    const moodMap = {
        'calm': '平静',
        'energetic': '活力',
        'romantic': '浪漫',
        'melancholy': '忧郁',
        'adventurous': '冒险',
        'nostalgic': '怀旧'
    };
    return moodMap[moodId] || moodId;
}
// ========== 区块A13：结果展示步骤 结束 ==========


    // ========== 区块A14：预设配方模式 开始 ==========
    function renderPresetsMode() {
        return `
            <div class="presets-mode">
                <h2 class="presets-title">经典配方</h2>
                <p class="presets-subtitle">从经典鸡尾酒中获取灵感</p>
                
                <div class="presets-grid">
                    ${state.presets.map(preset => renderPresetCard(preset)).join('')}
                </div>
            </div>
        `;
    }

    function renderPresetCard(preset) {
        return `
            <div class="preset-card" onclick="CocktailMixer.usePreset('${preset.id}')">
                <div class="preset-header" style="background: linear-gradient(135deg, ${preset.colorScheme.primary}, ${preset.colorScheme.secondary});">
                    <h3 class="preset-name">${preset.name}</h3>
                    <p class="preset-name-en">${preset.nameEn}</p>
                </div>
                <div class="preset-body">
                    <p class="preset-description">${preset.description}</p>
                    <div class="preset-meta">
                        <span class="preset-category">${preset.category}</span>
                        <span class="preset-difficulty">难度: ${preset.difficulty}</span>
                    </div>
                    <div class="preset-moods">
                        ${preset.mood.map(m => `<span class="mood-badge">${m}</span>`).join('')}
                    </div>
                </div>
                <button class="preset-btn primary-btn">
                    使用此配方
                </button>
            </div>
        `;
    }
    // ========== 区块A14：预设配方模式 结束 ==========

    // ========== 区块A15：选择预览 开始 ==========
    function renderSelectionPreview() {
        if (state.currentStep === 'mood' || state.currentStep === 'result') {
            return '';
        }

        return `
            <div class="selection-preview">
                <h3 class="preview-title">当前选择</h3>
                <div class="preview-items">
                    ${state.currentMood ? `
                        <div class="preview-item">
                            <span class="preview-label">心情</span>
                            <span class="preview-value">💭 ${getMoodName(state.currentMood)}</span>
                        </div>
                    ` : ''}
                    ${state.selectedSpirit ? `
                        <div class="preview-item">
                            <span class="preview-label">基酒</span>
                            <span class="preview-value">${state.selectedSpirit.emoji} ${state.selectedSpirit.name}</span>
                        </div>
                    ` : ''}
                    ${state.selectedMixers.length > 0 ? `
                        <div class="preview-item">
                            <span class="preview-label">辅料</span>
                            <span class="preview-value">
                                ${state.selectedMixers.map(m => `${m.emoji} ${m.name}`).join(', ')}
                            </span>
                        </div>
                    ` : ''}
                    ${state.selectedTechnique ? `
                        <div class="preview-item">
                            <span class="preview-label">手法</span>
                            <span class="preview-value">${state.selectedTechnique.emoji} ${state.selectedTechnique.name}</span>
                        </div>
                    ` : ''}
                    ${state.selectedGarnishes.length > 0 ? `
                        <div class="preview-item">
                            <span class="preview-label">装饰</span>
                            <span class="preview-value">
                                ${state.selectedGarnishes.map(g => `${g.emoji} ${g.name}`).join(', ')}
                            </span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    // ========== 区块A15：选择预览 结束 ==========

    // ========== 区块A16：交互逻辑 开始 ==========
    function selectMood(moodId) {
        state.currentMood = moodId;
        render(document.getElementById('main-content'));
    }

    function selectSpirit(spiritId) {
        state.selectedSpirit = state.spirits.find(s => s.id === spiritId);
        render(document.getElementById('main-content'));
    }

    function toggleMixer(mixerId) {
        const mixer = state.mixers.find(m => m.id === mixerId);
        const index = state.selectedMixers.findIndex(m => m.id === mixerId);
        
        if (index > -1) {
            state.selectedMixers.splice(index, 1);
        } else {
            state.selectedMixers.push(mixer);
        }
        
        render(document.getElementById('main-content'));
    }

    function selectTechnique(techId) {
        state.selectedTechnique = state.techniques.find(t => t.id === techId);
        render(document.getElementById('main-content'));
    }

    function toggleGarnish(garnishId) {
        const garnish = state.garnishes.find(g => g.id === garnishId);
        const index = state.selectedGarnishes.findIndex(g => g.id === garnishId);
        
        if (index > -1) {
            state.selectedGarnishes.splice(index, 1);
        } else {
            state.selectedGarnishes.push(garnish);
        }
        
        render(document.getElementById('main-content'));
    }

    function nextStep() {
        const stepOrder = ['mood', 'spirit', 'mixer', 'technique', 'garnish', 'result'];
        const currentIndex = stepOrder.indexOf(state.currentStep);
        if (currentIndex < stepOrder.length - 1) {
            state.currentStep = stepOrder[currentIndex + 1];
            render(document.getElementById('main-content'));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function prevStep() {
        const stepOrder = ['mood', 'spirit', 'mixer', 'technique', 'garnish', 'result'];
        const currentIndex = stepOrder.indexOf(state.currentStep);
        if (currentIndex > 0) {
            state.currentStep = stepOrder[currentIndex - 1];
            render(document.getElementById('main-content'));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function switchView(mode) {
        state.viewMode = mode;
        render(document.getElementById('main-content'));
    }
    // ========== 区块A16：交互逻辑 结束 ==========

    // ========== 区块A17：生成酒卡 开始 ==========
    function generateCocktail() {
        // 生成酒名
        const name = generateCocktailName();
        
        // 生成描述
        const description = generateDescription();
        
        // 确定颜色
        const color = state.selectedSpirit.color;
        const secondaryColor = adjustColor(color, 20);
        
        // 构建酒卡对象
        state.generatedCocktail = {
            id: `cocktail_${Date.now()}`,
            name: name,
            nameEn: '',
            mood: state.currentMood,
            spirit: state.selectedSpirit,
            mixers: state.selectedMixers,
            technique: state.selectedTechnique,
            garnishes: state.selectedGarnishes,
            description: description,
            color: color,
            secondaryColor: secondaryColor,
            date: new Date().toLocaleDateString('zh-CN')
        };
        
        state.currentStep = 'result';
        render(document.getElementById('main-content'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function generateCocktailName() {
        // 简单的酒名生成算法
        const prefixes = ['午夜', '深渊', '灵魂', '迷雾', '星辰', '月光', '暗影', '幻梦'];
        const suffixes = ['之吻', '低语', '幻影', '回响', '碎片', '挽歌', '序曲', '余韵'];
        
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        
        return `${prefix}${suffix}`;
    }

    function generateDescription() {
        const spiritDesc = state.selectedSpirit.description;
        const techniqueEffect = state.selectedTechnique.effect;
        
        let desc = `${spiritDesc}，`;
        
        if (state.selectedMixers.length > 0) {
            const mixerNames = state.selectedMixers.map(m => m.name).join('与');
            desc += `融合${mixerNames}的韵味，`;
        }
        
        desc += `经${state.selectedTechnique.name}调制。${techniqueEffect}`;
        
        return desc;
    }

    function adjustColor(hex, percent) {
        // 简单的颜色调整函数
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255))
            .toString(16).slice(1);
    }
    // ========== 区块A17：生成酒卡 结束 ==========

    // ========== 区块A18：使用预设配方 开始 ==========
    function usePreset(presetId) {
        const preset = state.presets.find(p => p.id === presetId);
        if (!preset) return;
        
        // 根据预设填充选择
        state.currentMood = preset.mood[0] || 'calm';
        state.selectedSpirit = state.spirits.find(s => s.id === preset.baseSpirit);
        
        // 填充辅料
        state.selectedMixers = [];
        preset.mixers.forEach(mixerRef => {
            const mixer = state.mixers.find(m => m.id === mixerRef.id);
            if (mixer) {
                state.selectedMixers.push(mixer);
            }
        });
        
        // 填充手法
        state.selectedTechnique = state.techniques.find(t => t.id === preset.technique);
        
        // 填充装饰
        state.selectedGarnishes = [];
        preset.garnish.forEach(garnishId => {
            const garnish = state.garnishes.find(g => g.id === garnishId);
            if (garnish) {
                state.selectedGarnishes.push(garnish);
            }
        });
        
        // 直接生成酒卡
        state.generatedCocktail = {
            id: `cocktail_${Date.now()}`,
            name: preset.name,
            nameEn: preset.nameEn,
            mood: state.currentMood,
            spirit: state.selectedSpirit,
            mixers: state.selectedMixers,
            technique: state.selectedTechnique,
            garnishes: state.selectedGarnishes,
            description: preset.description,
            color: preset.colorScheme.primary,
            secondaryColor: preset.colorScheme.secondary,
            date: new Date().toLocaleDateString('zh-CN'),
            isPreset: true
        };
        
        state.currentStep = 'result';
        state.viewMode = 'create';
        render(document.getElementById('main-content'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // ========== 区块A18：使用预设配方 结束 ==========

    // ========== 区块A19：保存和分享 开始 ==========
    function saveCocktail() {
        const savedCocktails = Storage.get('savedCocktails') || [];
        savedCocktails.unshift(state.generatedCocktail);
        
        // 只保留最近50个
        if (savedCocktails.length > 50) {
            savedCocktails.length = 50;
        }
        
        Storage.set('savedCocktails', savedCocktails);
        
        alert('🍸 酒卡已保存！');
    }

    function shareCocktail() {
        const cocktail = state.generatedCocktail;
        const text = `🍸 ${cocktail.name}\n\n${cocktail.description}\n\n来自 深渊之影 | 灵魂实验室`;
        
        if (navigator.share) {
            navigator.share({
                title: cocktail.name,
                text: text
            }).catch(err => console.log('分享失败', err));
        } else {
            // 复制到剪贴板
            navigator.clipboard.writeText(text).then(() => {
                alert('📋 已复制到剪贴板！');
            }).catch(err => {
                console.error('复制失败', err);
                alert('分享失败，请手动复制');
            });
        }
    }

    function reset() {
        state.currentMood = null;
        state.selectedSpirit = null;
        state.selectedMixers = [];
        state.selectedTechnique = null;
        state.selectedGarnishes = [];
        state.generatedCocktail = null;
        state.currentStep = 'mood';
        
        render(document.getElementById('main-content'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // ========== 区块A19：保存和分享 结束 ==========

    // ========== 区块A20：公共API 开始 ==========
    return {
        init,
        render,
        selectMood,
        selectSpirit,
        toggleMixer,
        selectTechnique,
        toggleGarnish,
        nextStep,
        prevStep,
        switchView,
        generateCocktail,
        usePreset,
        saveCocktail,
        shareCocktail,
        reset
    };
    // ========== 区块A20：公共API 结束 ==========

})();

// 挂载到全局
window.CocktailMixer = CocktailMixer;
