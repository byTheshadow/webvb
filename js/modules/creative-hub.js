/* ================================
   文件名：creative-hub.js
   功能：创意中心入口页
   依赖：Storage, Router
   
   主要功能：
   - 展示三个创意模块入口（拼贴诗/调酒/调香）
   - 显示最近创作记录
   - 提供快速入口
   
   最后更新：2026-04-20
   ================================ */

// ========== 区块A：创意中心模块 开始 ==========
const CreativeHub = (function() {
    'use strict';

    // ========== 区块A1：模块状态 开始 ==========
    let state = {
        recentPoems: [],
        recentCocktails: [],
        recentPerfumes: []
    };
    // ========== 区块A1：模块状态 结束 ==========

    // ========== 区块A2：初始化 开始 ==========
    function init() {
        console.log('[CreativeHub] 初始化创意中心...');
        loadRecentCreations();
    }
    // ========== 区块A2：初始化 结束 ==========

    // ========== 区块A3：加载最近创作 开始 ==========
    function loadRecentCreations() {
        state.recentPoems = Storage.get('savedPoems') || [];
        state.recentCocktails = Storage.get('savedCocktails') || [];
        state.recentPerfumes = Storage.get('savedPerfumes') || [];
    }
    // ========== 区块A3：加载最近创作 结束 ==========

    // ========== 区块A4：渲染主页面 开始 ==========
    function render(container) {
        loadRecentCreations();

        container.innerHTML = `
            <div class="creative-hub-page">
                <!-- 标题区域 -->
                <div class="hub-header">
                    <h1 class="hub-title">✨ 创意工坊</h1>
                    <p class="hub-subtitle">"在这里，你的情绪可以被调制"</p>
                </div>

                <!-- 功能卡片网格 -->
                <div class="hub-grid">
                    <!-- 拼贴诗 -->
                    <div class="hub-card" data-module="poetry">
                        <div class="hub-card-icon">📝</div>
                        <h3 class="hub-card-title">拼贴诗</h3>
                        <p class="hub-card-desc">用词语拼凑出你的诗歌</p>
                        <div class="hub-card-stats">
                            <span class="stat-item">
                                <span class="stat-icon">📄</span>
                                <span class="stat-value">${state.recentPoems.length}</span>
                            </span>
                        </div>
                        <button class="hub-card-btn primary-btn" onclick="Router.navigate('creative/poetry')">
                            开始创作
                        </button>
                    </div>

                    <!-- 调酒 -->
                    <div class="hub-card" data-module="cocktail">
                        <div class="hub-card-icon">🍸</div>
                        <h3 class="hub-card-title">调酒</h3>
                        <p class="hub-card-desc">为自己调制专属酒液</p>
                        <div class="hub-card-stats">
                            <span class="stat-item">
                                <span class="stat-icon">🍹</span>
                                <span class="stat-value">${state.recentCocktails.length}</span>
                            </span>
                        </div>
                        <button class="hub-card-btn primary-btn" onclick="Router.navigate('creative/cocktail')">
                            开始调酒
                        </button>
                    </div>

                    <!-- 调香 -->
                    <div class="hub-card" data-module="perfume">
                        <div class="hub-card-icon">🌸</div>
                        <h3 class="hub-card-title">调香</h3>
                        <p class="hub-card-desc">创造独特的香水配方</p>
                        <div class="hub-card-stats">
                            <span class="stat-item">
                                <span class="stat-icon">🧴</span>
                                <span class="stat-value">${state.recentPerfumes.length}</span>
                            </span>
                        </div>
                        <button class="hub-card-btn secondary-btn" disabled>
                            即将开放
                        </button>
                    </div>
                </div>

                <!-- 最近创作 -->
                ${renderRecentSection()}
            </div>
        `;

        injectStyles();
    }
    // ========== 区块A4：渲染主页面 结束 ==========

    // ========== 区块A5：渲染最近创作区域 开始 ==========
    function renderRecentSection() {
        const hasAnyCreations = state.recentPoems.length > 0 || 
                                state.recentCocktails.length > 0 || 
                                state.recentPerfumes.length > 0;

        if (!hasAnyCreations) {
            return '';
        }

        return `
            <div class="hub-recent">
                <h3 class="section-title">最近创作</h3>
                <div class="recent-grid">
                    ${renderRecentPoems()}
                    ${renderRecentCocktails()}
                </div>
            </div>
        `;
    }

    function renderRecentPoems() {
        if (state.recentPoems.length === 0) return '';
        
        const recent = state.recentPoems.slice(0, 3);
        return recent.map(poem => `
            <div class="recent-item" onclick="Router.navigate('creative/poetry')">
                <div class="recent-icon">📝</div>
                <div class="recent-content">
                    <h4 class="recent-title">${poem.title || '无题'}</h4>
                    <p class="recent-preview">${poem.lines ? poem.lines.slice(0, 2).join(' / ') : ''}</p>
                    <span class="recent-date">${poem.date || ''}</span>
                </div>
            </div>
        `).join('');
    }

    function renderRecentCocktails() {
        if (state.recentCocktails.length === 0) return '';
        
        const recent = state.recentCocktails.slice(0, 3);
        return recent.map(cocktail => `
            <div class="recent-item" onclick="Router.navigate('creative/cocktail')">
                <div class="recent-icon">🍸</div>
                <div class="recent-content">
                    <h4 class="recent-title">${cocktail.name || '无名之酒'}</h4>
                    <p class="recent-preview">${cocktail.baseSpirit || ''} · ${cocktail.mood || ''}</p>
                    <span class="recent-date">${cocktail.date || ''}</span>
                </div>
            </div>
        `).join('');
    }
    // ========== 区块A5：渲染最近创作区域 结束 ==========

    // ========== 区块A6：样式注入 开始 ==========
    function injectStyles() {
        const styleId = 'creative-hub-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .creative-hub-page {
                max-width: 1000px;
                margin: 0 auto;
                padding: var(--spacing-lg);
            }

            .hub-header {
                text-align: center;
                margin-bottom: var(--spacing-xl);
            }

            .hub-title {
                font-size: 32px;
                font-weight: 600;
                margin-bottom: var(--spacing-sm);
                background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .hub-subtitle {
                font-size: 16px;
                color: var(--text-secondary);
                font-style: italic;
            }

            .hub-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: var(--spacing-lg);
                margin-bottom: var(--spacing-xl);
            }

            .hub-card {
                background: var(--surface-color);
                border-radius: var(--border-radius);
                padding: var(--spacing-xl);
                text-align: center;
                transition: all var(--transition-fast);
                border: 2px solid transparent;
                cursor: pointer;
            }

            .hub-card:hover {
                transform: translateY(-5px);
                border-color: var(--primary-color);
                box-shadow: var(--shadow-lg);
            }

            .hub-card-icon {
                font-size: 48px;
                margin-bottom: var(--spacing-md);
            }

            .hub-card-title {
                font-size: 22px;
                font-weight: 600;
                margin-bottom: var(--spacing-sm);
                color: var(--text-primary);
            }

            .hub-card-desc {
                font-size: 14px;
                color: var(--text-secondary);
                margin-bottom: var(--spacing-md);
                line-height: 1.5;
            }

            .hub-card-stats {
                display: flex;
                justify-content: center;
                gap: var(--spacing-md);
                margin-bottom: var(--spacing-md);
            }

            .stat-item {
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);
                font-size: 14px;
                color: var(--text-secondary);
            }

            .stat-icon {
                font-size: 16px;
            }

            .hub-card-btn {
                width: 100%;
            }

            .hub-recent {
                margin-top: var(--spacing-xl);
            }

            .section-title {
                font-size: 20px;
                font-weight: 600;
                margin-bottom: var(--spacing-md);
                color: var(--text-primary);
            }

            .recent-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: var(--spacing-md);
            }

            .recent-item {
                background: var(--surface-color);
                border-radius: var(--border-radius);
                padding: var(--spacing-md);
                display: flex;
                gap: var(--spacing-md);
                cursor: pointer;
                transition: all var(--transition-fast);
                border: 1px solid var(--border-color);
            }

            .recent-item:hover {
                transform: translateX(5px);
                border-color: var(--primary-color);
            }

            .recent-icon {
                font-size: 24px;
                flex-shrink: 0;
            }

            .recent-content {
                flex: 1;
                min-width: 0;
            }

            .recent-title {
                font-size: 14px;
                font-weight: 600;
                margin-bottom: var(--spacing-xs);
                color: var(--text-primary);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .recent-preview {
                font-size: 12px;
                color: var(--text-secondary);
                margin-bottom: var(--spacing-xs);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .recent-date {
                font-size: 11px;
                color: var(--text-tertiary);
            }

            @media (max-width: 768px) {
                .hub-grid {
                    grid-template-columns: 1fr;
                }

                .recent-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(style);
    }
    // ========== 区块A6：样式注入 结束 ==========

    // ========== 区块A7：公共API 开始 ==========
    return {
        init,
        render
    };
    // ========== 区块A7：公共API 结束 ==========

})();

// 挂载到全局
window.CreativeHub = CreativeHub;
