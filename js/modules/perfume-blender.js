/* ================================
   文件名：perfume-blender.js
   功能：调香系统核心
   依赖：DataLoader, Storage
   
   主要功能：
   - 选择心情/前调/中调/后调
   - 调整香料比例
   - 生成香水卡片
   - 预设配方推荐
   - 保存到 localStorage
   
   最后更新：2026-04-20
   ================================ */

// ========== 区块A：调香模块 开始 ==========
const PerfumeBlender = (function() {
    'use strict';

    // ========== 区块A1：模块状态 开始 ==========
    let state = {
        // 数据
        topNotes: [],
        heartNotes: [],
        baseNotes: [],
        presets: [],
        
        // 当前选择
        currentMood: null,
        selectedTopNotes: [],
        selectedHeartNotes: [],
        selectedBaseNotes: [],
        
        // 比例设置 (总和应为100)
        ratios: {
            top: 25,    // 前调 20-30%
            heart: 45,  // 中调 40-50%
            base: 30    // 后调 20-30%
        },
        
        // UI状态
        currentStep: 'mood', // mood, top, heart, base, ratio, result
        viewMode: 'create' // create, presets
    };
    // ========== 区块A1：模块状态 结束 ==========

    // ========== 区块A2：初始化 开始 ==========
    async function init() {
        console.log('[PerfumeBlender] 初始化调香系统...');
        await loadData();
    }
    // ========== 区块A2：初始化 结束 ==========

    // ========== 区块A3：加载数据 开始 ==========
    async function loadData() {
        try {
            const [topData, heartData, baseData, presetsData] = await Promise.all([
                DataLoader.loadJSON('data/perfumes/top-notes.json'),
                DataLoader.loadJSON('data/perfumes/heart-notes.json'),
                DataLoader.loadJSON('data/perfumes/base-notes.json'),
                DataLoader.loadJSON('data/perfumes/presets.json')
            ]);

            state.topNotes = topData.notes || [];
            state.heartNotes = heartData.notes || [];
            state.baseNotes = baseData.notes || [];
            state.presets = presetsData.presets || [];

            console.log('[PerfumeBlender] 数据加载完成', {
                topNotes: state.topNotes.length,
                heartNotes: state.heartNotes.length,
                baseNotes: state.baseNotes.length,
                presets: state.presets.length
            });
        } catch (error) {
            console.error('[PerfumeBlender] 数据加载失败', error);
        }
    }
    // ========== 区块A3：加载数据 结束 ==========

    // ========== 区块A4：渲染主页面 开始 ==========
    function render(container) {
        container.innerHTML = `
            <div class="perfume-blender-page">
                <!-- 顶部导航 -->
                <div class="blender-header">
                    <h1 class="blender-title">🌸 调香工坊</h1>
                    <div class="blender-tabs">
                        <button class="blender-tab ${state.viewMode === 'create' ? 'active' : ''}" 
                                onclick="PerfumeBlender.switchView('create')">
                            自由调制
                        </button>
                        <button class="blender-tab ${state.viewMode === 'presets' ? 'active' : ''}" 
                                onclick="PerfumeBlender.switchView('presets')">
                            预设配方
                        </button>
                    </div>
                </div>

                <!-- 主内容区 -->
                <div class="blender-content">
                    ${state.viewMode === 'create' ? renderCreateMode() : renderPresetsMode()}
                </div>

                <!-- 我的香水库 -->
                <div class="my-perfumes-section">
                    <h3 class="section-title">我的香水库</h3>
                    ${renderSavedPerfumes()}
                </div>
            </div>
        `;

        injectStyles();
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
            { id: 'top', label: '前调', icon: '🍋' },
            { id: 'heart', label: '中调', icon: '🌹' },
            { id: 'base', label: '后调', icon: '🌲' },
            { id: 'ratio', label: '比例', icon: '📊' },
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
        const stepOrder = ['mood', 'top', 'heart', 'base', 'ratio', 'result'];
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
            case 'top':
                return renderTopNotesStep();
            case 'heart':
                return renderHeartNotesStep();
            case 'base':
                return renderBaseNotesStep();
            case 'ratio':
                return renderRatioStep();
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
            { id: 'fresh', name: '清新', emoji: '🌿', desc: '如晨露般清爽' },
            { id: 'elegant', name: '优雅', emoji: '👗', desc: '精致而迷人' },
            { id: 'sensual', name: '性感', emoji: '💋', desc: '诱惑与神秘' },
            { id: 'calm', name: '平静', emoji: '🌙', desc: '宁静安详' },
            { id: 'energetic', name: '活力', emoji: '☀️', desc: '充满生机' },
            { id: 'mysterious', name: '神秘', emoji: '🌑', desc: '深邃莫测' }
        ];

        return `
            <div class="mood-selection">
                <h2 class="step-title">想要什么样的香气？</h2>
                <p class="step-subtitle">选择一个最符合你期待的氛围</p>
                <div class="mood-grid">
                    ${moods.map(mood => `
                        <div class="mood-card ${state.currentMood === mood.id ? 'selected' : ''}" 
                             onclick="PerfumeBlender.selectMood('${mood.id}')">
                            <div class="mood-emoji">${mood.emoji}</div>
                            <h3 class="mood-name">${mood.name}</h3>
                            <p class="mood-desc">${mood.desc}</p>
                        </div>
                    `).join('')}
                </div>
                ${state.currentMood ? `
                    <button class="next-step-btn primary-btn" onclick="PerfumeBlender.nextStep()">
                        下一步：选择前调
                    </button>
                ` : ''}
            </div>
        `;
    }
    // ========== 区块A8：心情选择步骤 结束 ==========

    // ========== 区块A9：前调选择步骤 开始 ==========
    function renderTopNotesStep() {
        const recommendedNotes = getRecommendedNotes('top');

        return `
            <div class="notes-selection">
                <h2 class="step-title">选择前调</h2>
                <p class="step-subtitle">第一印象，持续15-30分钟（可选1-3个）</p>
                
                ${recommendedNotes.length > 0 ? `
                    <div class="recommended-section">
                        <h3 class="section-label">💡 为你推荐</h3>
                        <div class="notes-grid">
                            ${recommendedNotes.map(note => renderNoteCard(note, 'top', true)).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="all-notes-section">
                    <h3 class="section-label">所有前调香料</h3>
                    <div class="notes-grid">
                        ${state.topNotes.map(note => renderNoteCard(note, 'top', false)).join('')}
                    </div>
                </div>
                
                <div class="step-actions">
                    <button class="secondary-btn" onclick="PerfumeBlender.prevStep()">上一步</button>
                    ${state.selectedTopNotes.length > 0 ? `
                        <button class="primary-btn" onclick="PerfumeBlender.nextStep()">下一步</button>
                    ` : ''}
                </div>
            </div>
        `;
    }
    // ========== 区块A9：前调选择步骤 结束 ==========

    // ========== 区块A10：中调选择步骤 开始 ==========
    function renderHeartNotesStep() {
        const recommendedNotes = getRecommendedNotes('heart');

        return `
            <div class="notes-selection">
                <h2 class="step-title">选择中调</h2>
                <p class="step-subtitle">香水的灵魂，持续2-4小时（可选1-3个）</p>
                
                ${recommendedNotes.length > 0 ? `
                    <div class="recommended-section">
                        <h3 class="section-label">💡 为你推荐</h3>
                        <div class="notes-grid">
                            ${recommendedNotes.map(note => renderNoteCard(note, 'heart', true)).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="all-notes-section">
                    <h3 class="section-label">所有中调香料</h3>
                    <div class="notes-grid">
                        ${state.heartNotes.map(note => renderNoteCard(note, 'heart', false)).join('')}
                    </div>
                </div>
                
                <div class="step-actions">
                    <button class="secondary-btn" onclick="PerfumeBlender.prevStep()">上一步</button>
                    ${state.selectedHeartNotes.length > 0 ? `
                        <button class="primary-btn" onclick="PerfumeBlender.nextStep()">下一步</button>
                    ` : ''}
                </div>
            </div>
        `;
    }
    // ========== 区块A10：中调选择步骤 结束 ==========

    // ========== 区块A11：后调选择步骤 开始 ==========
    function renderBaseNotesStep() {
        const recommendedNotes = getRecommendedNotes('base');

        return `
            <div class="notes-selection">
                <h2 class="step-title">选择后调</h2>
                <p class="step-subtitle">持久留香，持续4-8小时（可选1-3个）</p>
                
                ${recommendedNotes.length > 0 ? `
                    <div class="recommended-section">
                        <h3 class="section-label">💡 为你推荐</h3>
                        <div class="notes-grid">
                            ${recommendedNotes.map(note => renderNoteCard(note, 'base', true)).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="all-notes-section">
                    <h3 class="section-label">所有后调香料</h3>
                    <div class="notes-grid">
                        ${state.baseNotes.map(note => renderNoteCard(note, 'base', false)).join('')}
                    </div>
                </div>
                
                <div class="step-actions">
                    <button class="secondary-btn" onclick="PerfumeBlender.prevStep()">上一步</button>
                    ${state.selectedBaseNotes.length > 0 ? `
                        <button class="primary-btn" onclick="PerfumeBlender.nextStep()">下一步</button>
                    ` : ''}
                </div>
            </div>
        `;
    }
    // ========== 区块A11：后调选择步骤 结束 ==========

    // ========== 区块A12：渲染香料卡片 开始 ==========
    function renderNoteCard(note, type, isRecommended) {
        let selectedArray;
        switch(type) {
            case 'top': selectedArray = state.selectedTopNotes; break;
            case 'heart': selectedArray = state.selectedHeartNotes; break;
            case 'base': selectedArray = state.selectedBaseNotes; break;
        }
        
        const isSelected = selectedArray.some(n => n.id === note.id);
        
        return `
            <div class="note-card ${isSelected ? 'selected' : ''} ${isRecommended ? 'recommended' : ''}" 
                 onclick="PerfumeBlender.toggleNote('${type}', '${note.id}')">
                <div class="note-emoji">${note.emoji}</div>
                <h3 class="note-name">${note.name}</h3>
                <p class="note-name-en">${note.nameEn}</p>
                <p class="note-desc">${note.description}</p>
                <div class="note-tags">
                    ${note.personality.slice(0, 2).map(tag => `<span class="note-tag">${tag}</span>`).join('')}
                </div>
                ${isRecommended ? '<div class="recommended-badge">推荐</div>' : ''}
                ${isSelected ? '<div class="selected-badge">✓</div>' : ''}
            </div>
        `;
    }

    function getRecommendedNotes(type) {
        if (!state.currentMood) return [];
        
        // 心情-香料匹配逻辑
        const moodNotesMap = {
            'fresh': {
                top: ['lemon', 'bergamot', 'mint'],
                heart: ['lavender', 'jasmine', 'green-tea'],
                base: ['cedar', 'white-musk', 'vetiver']
            },
            'elegant': {
                top: ['neroli', 'mandarin', 'pink-pepper'],
                heart: ['rose', 'iris', 'peony'],
                base: ['sandalwood', 'amber', 'patchouli']
            },
            'sensual': {
                top: ['black-currant', 'plum', 'saffron'],
                heart: ['ylang-ylang', 'tuberose', 'jasmine'],
                base: ['vanilla', 'musk', 'oud']
            },
            'calm': {
                top: ['lavender', 'chamomile', 'bergamot'],
                heart: ['violet', 'iris', 'freesia'],
                base: ['sandalwood', 'tonka-bean', 'white-musk']
            },
            'energetic': {
                top: ['grapefruit', 'orange', 'ginger'],
                heart: ['neroli', 'cardamom', 'coriander'],
                base: ['cedar', 'vetiver', 'amber']
            },
            'mysterious': {
                top: ['incense', 'black-pepper', 'elemi'],
                heart: ['oud', 'leather', 'tobacco'],
                base: ['patchouli', 'amber', 'musk']
            }
        };

        const recommendedIds = moodNotesMap[state.currentMood]?.[type] || [];
        
        let notesArray;
        switch(type) {
            case 'top': notesArray = state.topNotes; break;
            case 'heart': notesArray = state.heartNotes; break;
            case 'base': notesArray = state.baseNotes; break;
        }
        
        return notesArray.filter(n => recommendedIds.includes(n.id));
    }
    // ========== 区块A12：渲染香料卡片 结束 ==========

    // ========== 区块A13：比例调整步骤 开始 ==========
    function renderRatioStep() {
        return `
            <div class="ratio-adjustment">
                <h2 class="step-title">调整香料比例</h2>
                <p class="step-subtitle">拖动滑块调整各层香调的比例</p>
                
                <div class="ratio-controls">
                    <!-- 前调 -->
                    <div class="ratio-control">
                        <div class="ratio-header">
                            <span class="ratio-label">🍋 前调</span>
                            <span class="ratio-value">${state.ratios.top}%</span>
                        </div>
                        <input type="range" 
                               class="ratio-slider" 
                               min="15" 
                               max="35" 
                               value="${state.ratios.top}"
                               oninput="PerfumeBlender.updateRatio('top', this.value)">
                        <div class="ratio-range">建议范围: 20-30%</div>
                    </div>
                    
                    <!-- 中调 -->
                    <div class="ratio-control">
                        <div class="ratio-header">
                            <span class="ratio-label">🌹 中调</span>
                            <span class="ratio-value">${state.ratios.heart}%</span>
                        </div>
                        <input type="range" 
                               class="ratio-slider" 
                               min="35" 
                               max="55" 
                               value="${state.ratios.heart}"
                               oninput="PerfumeBlender.updateRatio('heart', this.value)">
                        <div class="ratio-range">建议范围: 40-50%</div>
                    </div>
                    
                    <!-- 后调 -->
                    <div class="ratio-control">
                        <div class="ratio-header">
                            <span class="ratio-label">🌲 后调</span>
                            <span class="ratio-value">${state.ratios.base}%</span>
                        </div>
                        <input type="range" 
                               class="ratio-slider" 
                               min="15" 
                               max="35" 
                               value="${state.ratios.base}"
                               oninput="PerfumeBlender.updateRatio('base', this.value)">
                        <div class="ratio-range">建议范围: 20-30%</div>
                    </div>
                </div>
                
                <!-- 香气金字塔可视化 -->
                <div class="fragrance-pyramid">
                    <h3 class="pyramid-title">香气金字塔</h3>
                    <div class="pyramid-visual">
                        <div class="pyramid-layer top-layer" style="height: ${state.ratios.top}%">
                            <span class="layer-label">前调 ${state.ratios.top}%</span>
                        </div>
                        <div class="pyramid-layer heart-layer" style="height: ${state.ratios.heart}%">
                            <span class="layer-label">中调 ${state.ratios.heart}%</span>
                        </div>
                        <div class="pyramid-layer base-layer" style="height: ${state.ratios.base}%">
                            <span class="layer-label">后调 ${state.ratios.base}%</span>
                        </div>
                    </div>
                </div>
                
                <div class="step-actions">
                    <button class="secondary-btn" onclick="PerfumeBlender.prevStep()">上一步</button>
                    <button class="primary-btn" onclick="PerfumeBlender.nextStep()">生成香水</button>
                </div>
            </div>
        `;
    }
    // ========== 区块A13：比例调整步骤 结束 ==========

    // ========== 区块A14：结果展示步骤 开始 ==========
    function renderResultStep() {
        const perfume = generatePerfume();
        
        return `
            <div class="result-display">
                <h2 class="step-title">你的专属香水</h2>
                
                <!-- 香水卡片 -->
                <div class="perfume-card-large">
                    <div class="perfume-bottle">🧴</div>
                    <h3 class="perfume-name">${perfume.name}</h3>
                    <p class="perfume-name-en">${perfume.nameEn}</p>
                    
                    <div class="perfume-classification">
                        ${perfume.families.map(f => `<span class="family-tag">${f}</span>`).join('')}
                    </div>
                    
                    <div class="perfume-notes-display">
                        <div class="notes-layer">
                            <h4 class="layer-title">🍋 前调 (${state.ratios.top}%)</h4>
                            <p class="layer-notes">${state.selectedTopNotes.map(n => n.name).join(' · ')}</p>
                        </div>
                        <div class="notes-layer">
                            <h4 class="layer-title">🌹 中调 (${state.ratios.heart}%)</h4>
                            <p class="layer-notes">${state.selectedHeartNotes.map(n => n.name).join(' · ')}</p>
                        </div>
                        <div class="notes-layer">
                            <h4 class="layer-title">🌲 后调 (${state.ratios.base}%)</h4>
                            <p class="layer-notes">${state.selectedBaseNotes.map(n => n.name).join(' · ')}</p>
                        </div>
                    </div>
                    
                    <div class="perfume-info">
                        <div class="info-item">
                            <span class="info-label">留香时间</span>
                            <span class="info-value">${perfume.longevity}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">适合场景</span>
                            <span class="info-value">${perfume.occasions.join(' · ')}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">适合季节</span>
                            <span class="info-value">${perfume.seasons.join(' · ')}</span>
                        </div>
                    </div>
                    
                    <p class="perfume-description">${perfume.description}</p>
                </div>
                
                <!-- 操作按钮 -->
                <div class="result-actions">
                    <button class="secondary-btn" onclick="PerfumeBlender.reset()">重新调制</button>
                    <button class="primary-btn" onclick="PerfumeBlender.savePerfume()">保存香水</button>
                    <button class="secondary-btn" onclick="PerfumeBlender.sharePerfume()">分享</button>
                </div>
            </div>
        `;
    }
    // ========== 区块A14：结果展示步骤 结束 ==========

    // ========== 区块A15：生成香水 开始 ==========
    function generatePerfume() {
        // 生成香水名称
        const name = generatePerfumeName();
        const nameEn = generatePerfumeNameEn();
        
        // 确定香调分类
        const families = determineFamilies();
        
        // 计算留香时间
        const longevity = calculateLongevity();
        
        // 确定适合场景和季节
        const occasions = determineOccasions();
        const seasons = determineSeasons();
        
        // 生成描述
        const description = generateDescription();
        
        return {
            name,
            nameEn,
            families,
            longevity,
            occasions,
            seasons,
            description,
            mood: state.currentMood,
            topNotes: state.selectedTopNotes,
            heartNotes: state.selectedHeartNotes,
            baseNotes: state.selectedBaseNotes,
            ratios: { ...state.ratios },
            date: new Date().toLocaleDateString('zh-CN')
        };
    }

    function generatePerfumeName() {
        const prefixes = ['午夜', '晨曦', '暮色', '星辰', '月光', '花园', '森林', '海洋', '梦境', '秘密'];
        const suffixes = ['之舞', '之诗', '之梦', '之歌', '之语', '花园', '幻想', '传说', '回忆', '印记'];
        
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        
        return `${prefix}${suffix}`;
    }

    function generatePerfumeNameEn() {
        const adjectives = ['Midnight', 'Dawn', 'Twilight', 'Stellar', 'Lunar', 'Secret', 'Mystic', 'Eternal', 'Divine', 'Enchanted'];
        const nouns = ['Garden', 'Dream', 'Whisper', 'Memory', 'Fantasy', 'Legend', 'Essence', 'Reverie', 'Sonata', 'Elixir'];
        
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        
        return `${adj} ${noun}`;
    }

    function determineFamilies() {
        const families = new Set();
        
        // 根据选择的香料确定香调分类
        const allNotes = [...state.selectedTopNotes, ...state.selectedHeartNotes, ...state.selectedBaseNotes];
        
        allNotes.forEach(note => {
            if (note.category === '柑橘' || note.category === '果香') families.add('果香调');
            if (note.category === '花香') families.add('花香调');
            if (note.category === '木质') families.add('木质调');
            if (note.category === '东方') families.add('东方调');
            if (note.category === '清新') families.add('清新调');
        });
        
        return Array.from(families).slice(0, 2);
    }

    function calculateLongevity() {
        // 根据后调香料的持久度计算
        const avgLongevity = state.selectedBaseNotes.reduce((sum, note) => sum + (note.longevity || 6), 0) / state.selectedBaseNotes.length;
        return `${Math.round(avgLongevity)}-${Math.round(avgLongevity + 2)}小时`;
    }

    function determineOccasions() {
        const moodOccasionMap = {
            'fresh': ['日常', '办公', '运动'],
            'elegant': ['约会', '晚宴', '社交'],
            'sensual': ['约会', '夜晚', '派对'],
            'calm': ['居家', '睡前', '冥想'],
            'energetic': ['日常', '运动', '旅行'],
            'mysterious': ['夜晚', '派对', '特殊场合']
        };
        
        return moodOccasionMap[state.currentMood] || ['日常', '休闲'];
    }

    function determineSeasons() {
        // 根据香料的强度和类型确定季节
        const topIntensity = state.selectedTopNotes.reduce((sum, n) => sum + (n.intensity || 5), 0) / state.selectedTopNotes.length;
        const heartIntensity = state.selectedHeartNotes.reduce((sum, n) => sum + (n.intensity || 5), 0) / state.selectedHeartNotes.length;
        
        const avgIntensity = (topIntensity + heartIntensity) / 2;
        
        if (avgIntensity < 4) return ['春季', '夏季'];
        if (avgIntensity > 7) return ['秋季', '冬季'];
        return ['春季', '秋季', '四季'];
    }

    function generateDescription() {
        const moodDescMap = {
            'fresh': '如清晨的第一缕阳光，带来清新自然的气息',
            'elegant': '优雅而精致，散发着迷人的魅力',
            'sensual': '神秘而诱惑，充满性感的气息',
            'calm': '宁静安详，带来内心的平和',
            'energetic': '充满活力，激发无限能量',
            'mysterious': '深邃神秘，令人着迷'
        };
        
        const topNote = state.selectedTopNotes[0]?.name || '香料';
        const heartNote = state.selectedHeartNotes[0]?.name || '花香';
        const baseNote = state.selectedBaseNotes[0]?.name || '木质';
        
        return `${moodDescMap[state.currentMood]}。前调的${topNote}带来第一印象，中调的${heartNote}展现香水的灵魂，后调的${baseNote}留下持久的记忆。`;
    }
    // ========== 区块A15：生成香水 结束 ==========

    // ========== 区块A16：预设配方模式 开始 ==========
    function renderPresetsMode() {
        return `
            <div class="presets-mode">
                <h2 class="presets-title">经典香水配方</h2>
                <p class="presets-subtitle">一键套用大师级配方</p>
                
                <div class="presets-grid">
                    ${state.presets.map(preset => renderPresetCard(preset)).join('')}
                </div>
            </div>
        `;
    }

    function renderPresetCard(preset) {
        return `
            <div class="preset-card" onclick="PerfumeBlender.applyPreset('${preset.id}')">
                <div class="preset-icon">${preset.emoji}</div>
                <h3 class="preset-name">${preset.name}</h3>
                <p class="preset-name-en">${preset.nameEn}</p>
                <p class="preset-desc">${preset.description}</p>
                
                <div class="preset-notes">
                    <div class="preset-note-line">
                        <span class="note-type">前调:</span>
                        <span class="note-list">${preset.topNotes.join(' · ')}</span>
                    </div>
                    <div class="preset-note-line">
                        <span class="note-type">中调:</span>
                        <span class="note-list">${preset.heartNotes.join(' · ')}</span>
                    </div>
                    <div class="preset-note-line">
                        <span class="note-type">后调:</span>
                        <span class="note-list">${preset.baseNotes.join(' · ')}</span>
                    </div>
                </div>
                
                <div class="preset-tags">
                    ${preset.families.map(f => `<span class="family-tag">${f}</span>`).join('')}
                </div>
                
                <button class="preset-apply-btn primary-btn">使用此配方</button>
            </div>
        `;
    }
    // ========== 区块A16：预设配方模式 结束 ==========

    // ========== 区块A17：已保存香水 开始 ==========
    function renderSavedPerfumes() {
        const saved = Storage.get('savedPerfumes') || [];
        
        if (saved.length === 0) {
            return '<p class="empty-message">还没有保存的香水，快去创作吧！</p>';
        }
        
        return `
            <div class="saved-perfumes-grid">
                ${saved.slice(0, 6).map(perfume => renderSavedPerfumeCard(perfume)).join('')}
            </div>
        `;
    }

    function renderSavedPerfumeCard(perfume) {
        return `
            <div class="saved-perfume-card">
                <div class="saved-perfume-icon">🧴</div>
                <h4 class="saved-perfume-name">${perfume.name}</h4>
                <p class="saved-perfume-date">${perfume.date}</p>
                <div class="saved-perfume-notes">
                    ${perfume.topNotes.slice(0, 2).map(n => n.name).join(' · ')}
                </div>
                <button class="delete-btn" onclick="PerfumeBlender.deletePerfume('${perfume.date}')">删除</button>
            </div>
        `;
    }
    // ========== 区块A17：已保存香水 结束 ==========

    // ========== 区块A18：选择预览 开始 ==========
    function renderSelectionPreview() {
        if (state.currentStep === 'mood' || state.currentStep === 'result') {
            return '';
        }
        
        return `
            <div class="selection-preview">
                <h3 class="preview-title">当前选择</h3>
                <div class="preview-content">
                    ${state.selectedTopNotes.length > 0 ? `
                        <div class="preview-section">
                            <span class="preview-label">🍋 前调:</span>
                            <span class="preview-items">${state.selectedTopNotes.map(n => n.name).join(', ')}</span>
                        </div>
                    ` : ''}
                    ${state.selectedHeartNotes.length > 0 ? `
                        <div class="preview-section">
                            <span class="preview-label">🌹 中调:</span>
                            <span class="preview-items">${state.selectedHeartNotes.map(n => n.name).join(', ')}</span>
                        </div>
                    ` : ''}
                    ${state.selectedBaseNotes.length > 0 ? `
                        <div class="preview-section">
                            <span class="preview-label">🌲 后调:</span>
                            <span class="preview-items">${state.selectedBaseNotes.map(n => n.name).join(', ')}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    // ========== 区块A18：选择预览 结束 ==========

    // ========== 区块A19：交互方法 开始 ==========
    function selectMood(moodId) {
        state.currentMood = moodId;
        render(document.getElementById('app'));
    }

    function toggleNote(type, noteId) {
        let selectedArray, notesArray, maxSelection = 3;
        
        switch(type) {
            case 'top':
                selectedArray = state.selectedTopNotes;
                notesArray = state.topNotes;
                break;
            case 'heart':
                selectedArray = state.selectedHeartNotes;
                notesArray = state.heartNotes;
                break;
            case 'base':
                selectedArray = state.selectedBaseNotes;
                notesArray = state.baseNotes;
                break;
        }
        
        const note = notesArray.find(n => n.id === noteId);
        if (!note) return;
        
        const index = selectedArray.findIndex(n => n.id === noteId);
        
        if (index > -1) {
            // 取消选择
            selectedArray.splice(index, 1);
        } else {
            // 添加选择
            if (selectedArray.length >= maxSelection) {
                alert(`最多只能选择${maxSelection}个香料`);
                return;
            }
            selectedArray.push(note);
        }
        
        render(document.getElementById('app'));
    }

    function updateRatio(type, value) {
        value = parseInt(value);
        const oldValue = state.ratios[type];
        const diff = value - oldValue;
        
        state.ratios[type] = value;
        
        // 自动调整其他比例以保持总和为100
        if (type === 'top') {
            const remaining = 100 - value;
            const heartRatio = state.ratios.heart / (state.ratios.heart + state.ratios.base);
            state.ratios.heart = Math.round(remaining * heartRatio);
            state.ratios.base = remaining - state.ratios.heart;
        } else if (type === 'heart') {
            const remaining = 100 - value;
            const topRatio = state.ratios.top / (state.ratios.top + state.ratios.base);
            state.ratios.top = Math.round(remaining * topRatio);
            state.ratios.base = remaining - state.ratios.top;
        } else if (type === 'base') {
            const remaining = 100 - value;
            const topRatio = state.ratios.top / (state.ratios.top + state.ratios.heart);
            state.ratios.top = Math.round(remaining * topRatio);
            state.ratios.heart = remaining - state.ratios.top;
        }
        
        render(document.getElementById('app'));
    }

    function nextStep() {
        const stepOrder = ['mood', 'top', 'heart', 'base', 'ratio', 'result'];
        const currentIndex = stepOrder.indexOf(state.currentStep);
        
        if (currentIndex < stepOrder.length - 1) {
            state.currentStep = stepOrder[currentIndex + 1];
            render(document.getElementById('app'));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function prevStep() {
        const stepOrder = ['mood', 'top', 'heart', 'base', 'ratio', 'result'];
        const currentIndex = stepOrder.indexOf(state.currentStep);
        
        if (currentIndex > 0) {
            state.currentStep = stepOrder[currentIndex - 1];
            render(document.getElementById('app'));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function switchView(mode) {
        state.viewMode = mode;
        render(document.getElementById('app'));
    }

    function reset() {
        state.currentMood = null;
        state.selectedTopNotes = [];
        state.selectedHeartNotes = [];
        state.selectedBaseNotes = [];
        state.ratios = { top: 25, heart: 45, base: 30 };
        state.currentStep = 'mood';
        render(document.getElementById('app'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function savePerfume() {
        const perfume = generatePerfume();
        const saved = Storage.get('savedPerfumes') || [];
        
        // 添加到开头，保持最新的在前面
        saved.unshift(perfume);
        
        // 最多保存50个
        if (saved.length > 50) {
            saved.pop();
        }
        
        Storage.set('savedPerfumes', saved);
        
        alert('香水已保存！');
        render(document.getElementById('app'));
    }

    function deletePerfume(date) {
        if (!confirm('确定要删除这个香水吗？')) return;
        
        const saved = Storage.get('savedPerfumes') || [];
        const filtered = saved.filter(p => p.date !== date);
        Storage.set('savedPerfumes', filtered);
        
        render(document.getElementById('app'));
    }

    function sharePerfume() {
        const perfume = generatePerfume();
        const text = `我在「深渊之影」调制了一款香水：${perfume.name}\n前调：${state.selectedTopNotes.map(n => n.name).join('、')}\n中调：${state.selectedHeartNotes.map(n => n.name).join('、')}\n后调：${state.selectedBaseNotes.map(n => n.name).join('、')}`;
        
        if (navigator.share) {
            navigator.share({
                title: perfume.name,
                text: text
            }).catch(err => console.log('分享失败', err));
        } else {
            // 复制到剪贴板
            navigator.clipboard.writeText(text).then(() => {
                alert('已复制到剪贴板！');
            }).catch(() => {
                alert('分享失败，请手动复制');
            });
        }
    }

    function applyPreset(presetId) {
        const preset = state.presets.find(p => p.id === presetId);
        if (!preset) return;
        
        // 根据预设配方设置选择
        state.currentMood = preset.mood || 'elegant';
        
        // 匹配香料
        state.selectedTopNotes = preset.topNoteIds.map(id => 
            state.topNotes.find(n => n.id === id)
        ).filter(Boolean);
        
        state.selectedHeartNotes = preset.heartNoteIds.map(id => 
            state.heartNotes.find(n => n.id === id)
        ).filter(Boolean);
        
        state.selectedBaseNotes = preset.baseNoteIds.map(id => 
            state.baseNotes.find(n => n.id === id)
        ).filter(Boolean);
        
        state.ratios = preset.ratios || { top: 25, heart: 45, base: 30 };
        
        // 跳转到结果页
        state.currentStep = 'result';
        state.viewMode = 'create';
        render(document.getElementById('app'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // ========== 区块A19：交互方法 结束 ==========

    // ========== 区块A20：样式注入 开始 ==========
    function injectStyles() {
        const styleId = 'perfume-blender-styles';
        if (document.getElementById(styleId)) return;

        const link = document.createElement('link');
        link.id = styleId;
        link.rel = 'stylesheet';
        link.href = 'css/perfume.css';
        document.head.appendChild(link);
    }
    // ========== 区块A20：样式注入 结束 ==========

    // ========== 区块A21：公共API 开始 ==========
    return {
        init,
        render,
        selectMood,
        toggleNote,
        updateRatio,
        nextStep,
        prevStep,
        switchView,
        reset,
        savePerfume,
        deletePerfume,
        sharePerfume,
        applyPreset
    };
    // ========== 区块A21：公共API 结束 ==========

})();

// 挂载到全局
window.PerfumeBlender = PerfumeBlender;
