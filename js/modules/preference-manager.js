/* ================================
   文件名：preference-manager.js
   功能：用户偏好管理（性向、负面tag过滤）
   依赖：storage.js
   
   主要功能：
   - 性向偏好设置（BL/BG/GL/GB/其他）
   - 负面tag过滤
   - 首次访问检测
   - 角色过滤逻辑
   
   最后更新：2026-04-19
   ================================ */

// ========== 区块A：偏好管理器对象 开始 ==========
const PreferenceManager = {
    // 默认配置
    defaultPreferences: {
        orientations: [], // 空数组表示接受所有
        excludeTags: [],
        isFirstVisit: true,
        skipSetup: false // 是否跳过设置
    },

    // 可选的性向列表
    availableOrientations: [
        { id: 'BL', label: 'BL (Boy\'s Love)', icon: '💙' },
        { id: 'BG', label: 'BG (Boy & Girl)', icon: '💗' },
        { id: 'GL', label: 'GL (Girl\'s Love)', icon: '💜' },
        { id: 'GB', label: 'GB (Girl & Boy)', icon: '💖' },
        { id: '其他', label: '其他/不限', icon: '🌈' }
    ],

    // 可选的负面tag列表
    availableExcludeTags: [
        'NTR',
        '悲剧结局',
        'BE（悲剧结局）',
        '强制',
        '年下',
        '年上',
        '三角恋',
        '虐心',
        '虐文/刀文',
        '死亡',
        '背叛',
        '血腥暴力',
        '非人',
        '渣男',
        '渣女',
        '渣男/渣女（情感欺骗）',
        '替身',
        '替身文学',
        '物化',
        '羞辱',
        '性虐待',
        '骨科',
        '黑暗深沉（全员恶人）',
        '无希望',
        '克苏鲁',
        '不可名状',
        '末日绝望',
        '搞笑/无厘头',
        '开放式结局'
    ],


    // ========== 区块A1：初始化 开始 ==========
    init() {
        console.log('[PreferenceManager] 初始化偏好管理器...');
        
        // 检查是否首次访问
        if (this.isFirstVisit()) {
            console.log('[PreferenceManager] 检测到首次访问');
            // 延迟显示，等待页面加载完成
            setTimeout(() => {
                this.showPreferenceModal();
            }, 800);
        }
        
        console.log('[PreferenceManager] 偏好管理器初始化完成');
    },
    // ========== 区块A1：初始化 结束 ==========

    // ========== 区块A2：存储操作 开始 ==========
    // 加载偏好设置
    loadPreferences() {
        const saved = Storage.get('userPreferences');
        if (saved) {
            return { ...this.defaultPreferences, ...saved };
        }
        return { ...this.defaultPreferences };
    },

    // 保存偏好设置
    savePreferences(preferences) {
        Storage.set('userPreferences', preferences);
        console.log('[PreferenceManager] 偏好已保存:', preferences);
    },

    // 检查是否首次访问
    isFirstVisit() {
        const prefs = this.loadPreferences();
        return prefs.isFirstVisit;
    },

    // 标记已访问
    markAsVisited() {
        const prefs = this.loadPreferences();
        prefs.isFirstVisit = false;
        this.savePreferences(prefs);
    },
    // ========== 区块A2：存储操作 结束 ==========

    // ========== 区块A3：模态框显示 开始 ==========
    showPreferenceModal() {
        console.log('[PreferenceManager] 显示偏好设置模态框');
        
        // 创建模态框HTML
        const modalHTML = this.createModalHTML();
        
        // 插入到body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 绑定事件
        this.bindModalEvents();
        
        // 显示动画
        setTimeout(() => {
            const modal = document.getElementById('preference-modal');
            if (modal) {
                modal.classList.add('active');
            }
        }, 100);
    },

    // 关闭模态框
    closePreferenceModal() {
        const modal = document.getElementById('preference-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    },
    // ========== 区块A3：模态框显示 结束 ==========

    // ========== 区块A4：HTML生成 开始 ==========
    createModalHTML() {
        const currentPrefs = this.loadPreferences();
        
        return `
            <div id="preference-modal" class="preference-modal">
                <div class="preference-modal-overlay"></div>
                <div class="preference-modal-content">
                    <div class="preference-header">
                        <h2 class="preference-title">个性化设置</h2>
                        <p class="preference-subtitle">让我们为您推荐更合适的角色卡</p>
                    </div>

                    <div class="preference-body">
                        <!-- 性向偏好 -->
                        <div class="preference-section">
                            <h3 class="section-title">
                                <span class="section-icon">💕</span>
                                性向偏好
                            </h3>
                            <p class="section-desc">选择您感兴趣的类型（可多选，不选则显示全部）</p>
                            <div class="orientation-grid">
                                ${this.availableOrientations.map(ori => `
                                    <label class="orientation-item">
                                        <input 
                                            type="checkbox" 
                                            name="orientation" 
                                            value="${ori.id}"
                                            ${currentPrefs.orientations.includes(ori.id) ? 'checked' : ''}
                                        >
                                        <span class="orientation-label">
                                            <span class="orientation-icon">${ori.icon}</span>
                                            <span class="orientation-text">${ori.label}</span>
                                        </span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>

                        <!-- 内容过滤 -->
                        <div class="preference-section">
                            <h3 class="section-title">
                                <span class="section-icon">🛡️</span>
                                内容过滤
                            </h3>
                            <p class="section-desc">选择您不希望看到的内容标签</p>
                            <div class="exclude-tags-grid">
                                ${this.availableExcludeTags.map(tag => `
                                    <label class="exclude-tag-item">
                                        <input 
                                            type="checkbox" 
                                            name="excludeTag" 
                                            value="${tag}"
                                            ${currentPrefs.excludeTags.includes(tag) ? 'checked' : ''}
                                        >
                                        <span class="tag-label">${tag}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>

                        <!-- 免责声明 -->
                        <div class="preference-disclaimer">
                            <p class="disclaimer-text">
                                <strong>📌 关于内容过滤：</strong><br>
                                "负面tag"仅作为用户个人偏好筛选，不代表作者创作质量或网站立场。
                                过滤功能仅对当前用户生效，不影响其他用户体验。
                                由于无法获取卡片全部信息，过滤可能不完全准确，请注意甄别。
                                我们尊重所有创作者和用户的选择，设置此功能仅为提供更个性化的体验。
                            </p>
                        </div>
                    </div>

                    <div class="preference-footer">
                        <button class="btn-secondary" id="skip-preference-btn">
                            跳过设置（显示全部）
                        </button>
                        <button class="btn-primary" id="save-preference-btn">
                            保存设置
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    // ========== 区块A4：HTML生成 结束 ==========

    // ========== 区块A5：事件绑定 开始 ==========
    bindModalEvents() {
        // 保存按钮
        const saveBtn = document.getElementById('save-preference-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.handleSave();
            });
        }

        // 跳过按钮
        const skipBtn = document.getElementById('skip-preference-btn');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                this.handleSkip();
            });
        }

        // 点击遮罩层不关闭（强制设置）
        // 如果不是首次访问，可以点击遮罩关闭
        if (!this.isFirstVisit()) {
            const overlay = document.querySelector('.preference-modal-overlay');
            if (overlay) {
                overlay.addEventListener('click', () => {
                    this.closePreferenceModal();
                });
            }
        }
    },

    // 处理保存
    handleSave() {
        // 收集选中的性向
        const orientationCheckboxes = document.querySelectorAll('input[name="orientation"]:checked');
        const orientations = Array.from(orientationCheckboxes).map(cb => cb.value);

        // 收集选中的排除标签
        const excludeTagCheckboxes = document.querySelectorAll('input[name="excludeTag"]:checked');
        const excludeTags = Array.from(excludeTagCheckboxes).map(cb => cb.value);

        // 保存偏好
        const preferences = {
            orientations,
            excludeTags,
            isFirstVisit: false,
            skipSetup: false
        };

        this.savePreferences(preferences);
        
        // 显示成功提示
        this.showToast('设置已保存！');
        
        // 关闭模态框
        this.closePreferenceModal();

        // 如果在角色列表页，刷新列表
        if (window.location.hash.includes('characters')) {
            // 触发刷新事件
            window.dispatchEvent(new CustomEvent('preferencesUpdated'));
        }
    },

    // 处理跳过
    handleSkip() {
        const preferences = {
            orientations: [],
            excludeTags: [],
            isFirstVisit: false,
            skipSetup: true
        };

        this.savePreferences(preferences);
        this.showToast('已跳过设置，将显示所有角色');
        this.closePreferenceModal();
    },
    // ========== 区块A5：事件绑定 结束 ==========

    // ========== 区块A6：角色过滤逻辑 开始 ==========
    /**
     * 根据用户偏好过滤角色列表
     * @param {Array} characters - 角色数组
     * @returns {Array} - 过滤后的角色数组
     */
    filterCharacters(characters) {
        const prefs = this.loadPreferences();
        
        // 如果跳过设置或没有任何过滤条件，返回全部
        if (prefs.skipSetup || (prefs.orientations.length === 0 && prefs.excludeTags.length === 0)) {
            return characters;
        }

        return characters.filter(char => {
            // 1. 性向过滤
            if (prefs.orientations.length > 0) {
                // 检查角色的性向是否匹配用户偏好
                const hasMatchingOrientation = char.orientation.some(ori => {
                    // "不限" 或 "其他" 匹配所有偏好
                    if (ori === '不限' || ori === '其他') {
                        return true;
                    }
                    // 用户选择了"其他"，则接受所有
                    if (prefs.orientations.includes('其他')) {
                        return true;
                    }
                    return prefs.orientations.includes(ori);
                });

                if (!hasMatchingOrientation) {
                    return false;
                }
            }

            // 2. 负面tag过滤
            if (prefs.excludeTags.length > 0) {
                // 检查角色的warnings是否包含用户排除的标签
                const hasExcludedTag = char.warnings.some(warning => {
                    return prefs.excludeTags.some(excludeTag => {
                        // 模糊匹配（包含关系）
                        return warning.includes(excludeTag) || excludeTag.includes(warning);
                    });
                });

                if (hasExcludedTag) {
                    return false;
                }

                // 也检查其他可能包含负面内容的字段
                const allTags = [
                    ...(char.soulTags || []),
                    ...(char.coreXP || []),
                    ...(char.themeTags || []),
                    ...(char.emotionTags || []),
                    ...(char.kinkTags || [])
                ].join(' ');

                const hasExcludedInTags = prefs.excludeTags.some(excludeTag => {
                    return allTags.includes(excludeTag);
                });

                if (hasExcludedInTags) {
                    return false;
                }
            }

            return true;
        });
    },
    // ========== 区块A6：角色过滤逻辑 结束 ==========

    // ========== 区块A7：工具方法 开始 ==========
    // 显示Toast提示
    showToast(message) {
        // 创建toast元素
        const toast = document.createElement('div');
        toast.className = 'preference-toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        // 显示动画
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // 3秒后移除
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    },

    // 打开设置（从设置按钮调用）
    openSettings() {
        this.showPreferenceModal();
    },

    // 获取当前偏好摘要（用于显示）
    getPreferencesSummary() {
        const prefs = this.loadPreferences();
        
        if (prefs.skipSetup) {
            return '显示全部内容';
        }

        const parts = [];
        
        if (prefs.orientations.length > 0) {
            parts.push(`性向: ${prefs.orientations.join(', ')}`);
        } else {
            parts.push('性向: 全部');
        }

        if (prefs.excludeTags.length > 0) {
            parts.push(`过滤: ${prefs.excludeTags.length}个标签`);
        }

        return parts.join(' | ');
    }
    // ========== 区块A7：工具方法 结束 ==========
};
// ========== 区块A：偏好管理器对象 结束 ==========

// ========== 区块B：导出到全局 开始 ==========
window.PreferenceManager = PreferenceManager;
// ========== 区块B：导出到全局 结束 ==========
