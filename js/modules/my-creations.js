/* ================================
   文件名：my-creations.js
   功能：创意作品管理页面
   依赖：Storage, Router
   
   主要功能：
   - 统一展示所有创作（拼贴诗/调酒/调香）
   - 筛选、排序功能
   - 删除、导出功能
   - 详情查看
   
   最后更新：2026-04-20
   ================================ */

// ========== 区块A：我的创作模块 开始 ==========
const MyCreations = (function() {
    'use strict';

    // ========== 区块A1：模块状态 开始 ==========
    let state = {
        poems: [],
        cocktails: [],
        perfumes: [],
        
        // 筛选和排序
        currentFilter: 'all', // all, poetry, cocktail, perfume
        currentSort: 'date-desc', // date-desc, date-asc, name-asc, name-desc
        
        // 搜索
        searchQuery: ''
    };
    // ========== 区块A1：模块状态 结束 ==========

    // ========== 区块A2：初始化 开始 ==========
    function init() {
        console.log('[MyCreations] 初始化我的创作页面...');
        loadAllCreations();
    }
    // ========== 区块A2：初始化 结束 ==========

    // ========== 区块A3：加载所有创作 开始 ==========
    function loadAllCreations() {
        state.poems = Storage.get('savedPoems') || [];
        state.cocktails = Storage.get('savedCocktails') || [];
        state.perfumes = Storage.get('savedPerfumes') || [];
        
        console.log('[MyCreations] 加载完成', {
            poems: state.poems.length,
            cocktails: state.cocktails.length,
            perfumes: state.perfumes.length
        });
    }
    // ========== 区块A3：加载所有创作 结束 ==========

    // ========== 区块A4：渲染主页面 开始 ==========
    function render(container) {
        loadAllCreations();
        
        const totalCount = state.poems.length + state.cocktails.length + state.perfumes.length;
        
        container.innerHTML = `
            <div class="my-creations-page">
                <!-- 页面头部 -->
                <div class="creations-header">
                    <h1 class="page-title">✨ 我的创作</h1>
                    <p class="page-subtitle">共 ${totalCount} 件作品</p>
                </div>

                <!-- 统计卡片 -->
                <div class="stats-cards">
                    <div class="stat-card" data-type="poetry">
                        <div class="stat-icon">📝</div>
                        <div class="stat-info">
                            <div class="stat-number">${state.poems.length}</div>
                            <div class="stat-label">拼贴诗</div>
                        </div>
                    </div>
                    <div class="stat-card" data-type="cocktail">
                        <div class="stat-icon">🍸</div>
                        <div class="stat-info">
                            <div class="stat-number">${state.cocktails.length}</div>
                            <div class="stat-label">调酒</div>
                        </div>
                    </div>
                    <div class="stat-card" data-type="perfume">
                        <div class="stat-icon">🌸</div>
                        <div class="stat-info">
                            <div class="stat-number">${state.perfumes.length}</div>
                            <div class="stat-label">调香</div>
                        </div>
                    </div>
                </div>

                <!-- 工具栏 -->
                <div class="creations-toolbar">
                    <!-- 筛选 -->
                    <div class="filter-group">
                        <button class="filter-btn ${state.currentFilter === 'all' ? 'active' : ''}" 
                                onclick="MyCreations.setFilter('all')">
                            全部
                        </button>
                        <button class="filter-btn ${state.currentFilter === 'poetry' ? 'active' : ''}" 
                                onclick="MyCreations.setFilter('poetry')">
                            📝 拼贴诗
                        </button>
                        <button class="filter-btn ${state.currentFilter === 'cocktail' ? 'active' : ''}" 
                                onclick="MyCreations.setFilter('cocktail')">
                            🍸 调酒
                        </button>
                        <button class="filter-btn ${state.currentFilter === 'perfume' ? 'active' : ''}" 
                                onclick="MyCreations.setFilter('perfume')">
                            🌸 调香
                        </button>
                    </div>

                    <!-- 排序和操作 -->
                    <div class="action-group">
                        <select class="sort-select" onchange="MyCreations.setSort(this.value)">
                            <option value="date-desc" ${state.currentSort === 'date-desc' ? 'selected' : ''}>最新创作</option>
                            <option value="date-asc" ${state.currentSort === 'date-asc' ? 'selected' : ''}>最早创作</option>
                            <option value="name-asc" ${state.currentSort === 'name-asc' ? 'selected' : ''}>名称 A-Z</option>
                            <option value="name-desc" ${state.currentSort === 'name-desc' ? 'selected' : ''}>名称 Z-A</option>
                        </select>
                        <button class="action-btn" onclick="MyCreations.exportAll()" title="导出全部">
                            📥 导出
                        </button>
                        ${totalCount > 0 ? `
                            <button class="action-btn danger" onclick="MyCreations.clearAll()" title="清空全部">
                                🗑️ 清空
                            </button>
                        ` : ''}
                    </div>
                </div>

                <!-- 搜索框 -->
                <div class="search-box">
                    <input type="text" 
                           class="search-input" 
                           placeholder="搜索作品名称..." 
                           value="${state.searchQuery}"
                           oninput="MyCreations.search(this.value)">
                </div>

                <!-- 作品列表 -->
                <div class="creations-list">
                    ${renderCreationsList()}
                </div>
            </div>
        `;

        injectStyles();
    }
    // ========== 区块A4：渲染主页面 结束 ==========

    // ========== 区块A5：渲染作品列表 开始 ==========
    function renderCreationsList() {
        const allCreations = getAllCreations();
        
        if (allCreations.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">📭</div>
                    <h3 class="empty-title">还没有创作</h3>
                    <p class="empty-desc">去创意工坊创作你的第一件作品吧！</p>
                    <button class="primary-btn" onclick="Router.navigate('creative')">
                        前往创意工坊
                    </button>
                </div>
            `;
        }
        
        return `
            <div class="creations-grid">
                ${allCreations.map(creation => renderCreationCard(creation)).join('')}
            </div>
        `;
    }

    function getAllCreations() {
        let allCreations = [];
        
        // 添加拼贴诗
        if (state.currentFilter === 'all' || state.currentFilter === 'poetry') {
            allCreations = allCreations.concat(
                state.poems.map(poem => ({
                    type: 'poetry',
                    data: poem,
                    name: poem.title || '无题',
                    date: poem.date || '',
                    preview: poem.lines ? poem.lines.slice(0, 2).join(' / ') : ''
                }))
            );
        }
        
        // 添加调酒
        if (state.currentFilter === 'all' || state.currentFilter === 'cocktail') {
            allCreations = allCreations.concat(
                state.cocktails.map(cocktail => ({
                    type: 'cocktail',
                    data: cocktail,
                    name: cocktail.name || '无名之酒',
                    date: cocktail.date || '',
                    preview: `${cocktail.baseSpirit || ''} · ${cocktail.mood || ''}`
                }))
            );
        }
        
        // 添加调香
        if (state.currentFilter === 'all' || state.currentFilter === 'perfume') {
            allCreations = allCreations.concat(
                state.perfumes.map(perfume => ({
                    type: 'perfume',
                    data: perfume,
                    name: perfume.name || '无名香水',
                    date: perfume.date || '',
                    preview: perfume.families ? perfume.families.join(' · ') : ''
                }))
            );
        }
        
        // 搜索过滤
        if (state.searchQuery) {
            const query = state.searchQuery.toLowerCase();
            allCreations = allCreations.filter(c => 
                c.name.toLowerCase().includes(query) || 
                c.preview.toLowerCase().includes(query)
            );
        }
        
        // 排序
        allCreations.sort((a, b) => {
            switch(state.currentSort) {
                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);
                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);
                case 'name-asc':
                    return a.name.localeCompare(b.name, 'zh-CN');
                case 'name-desc':
                    return b.name.localeCompare(a.name, 'zh-CN');
                default:
                    return 0;
            }
        });
        
        return allCreations;
    }

    function renderCreationCard(creation) {
        const typeConfig = {
            poetry: { icon: '📝', label: '拼贴诗', color: '#9c27b0' },
            cocktail: { icon: '🍸', label: '调酒', color: '#ff6b9d' },
            perfume: { icon: '🌸', label: '调香', color: '#c06c84' }
        };
        
        const config = typeConfig[creation.type];
        
        return `
            <div class="creation-card" data-type="${creation.type}">
                <div class="card-header">
                    <span class="card-type" style="background: ${config.color}">
                        ${config.icon} ${config.label}
                    </span>
                    <button class="card-delete" 
                            onclick="MyCreations.deleteCreation('${creation.type}', '${creation.date}')"
                            title="删除">
                        ×
                    </button>
                </div>
                
                <div class="card-body" onclick="MyCreations.viewDetail('${creation.type}', '${creation.date}')">
                    <h3 class="card-title">${creation.name}</h3>
                    <p class="card-preview">${creation.preview}</p>
                    <div class="card-date">${creation.date}</div>
                </div>
                
                <div class="card-footer">
                    <button class="card-action-btn" 
                            onclick="MyCreations.viewDetail('${creation.type}', '${creation.date}')">
                        查看详情
                    </button>
                    <button class="card-action-btn" 
                            onclick="MyCreations.exportSingle('${creation.type}', '${creation.date}')">
                        导出
                    </button>
                </div>
            </div>
        `;
    }
    // ========== 区块A5：渲染作品列表 结束 ==========

    // ========== 区块A6：交互方法 开始 ==========
    function setFilter(filter) {
        state.currentFilter = filter;
        render(document.getElementById('app'));
    }

    function setSort(sort) {
        state.currentSort = sort;
        render(document.getElementById('app'));
    }

    function search(query) {
        state.searchQuery = query;
        render(document.getElementById('app'));
    }

    function deleteCreation(type, date) {
        if (!confirm('确定要删除这件作品吗？')) return;
        
        let storageKey;
        switch(type) {
            case 'poetry': storageKey = 'savedPoems'; break;
            case 'cocktail': storageKey = 'savedCocktails'; break;
            case 'perfume': storageKey = 'savedPerfumes'; break;
        }
        
        const items = Storage.get(storageKey) || [];
        const filtered = items.filter(item => item.date !== date);
        Storage.set(storageKey, filtered);
        
        render(document.getElementById('app'));
    }

    function clearAll() {
        if (!confirm('确定要清空所有创作吗？此操作不可恢复！')) return;
        
        Storage.set('savedPoems', []);
        Storage.set('savedCocktails', []);
        Storage.set('savedPerfumes', []);
        
        render(document.getElementById('app'));
    }

    function viewDetail(type, date) {
        let item;
        switch(type) {
            case 'poetry':
                item = state.poems.find(p => p.date === date);
                showPoetryDetail(item);
                break;
            case 'cocktail':
                item = state.cocktails.find(c => c.date === date);
                showCocktailDetail(item);
                break;
            case 'perfume':
                item = state.perfumes.find(p => p.date === date);
                showPerfumeDetail(item);
                break;
        }
    }

    function showPoetryDetail(poem) {
        const modal = document.createElement('div');
        modal.className = 'detail-modal';
        modal.innerHTML = `
            <div class="detail-modal-content">
                <button class="detail-close" onclick="this.closest('.detail-modal').remove()">×</button>
                <h2 class="detail-title">📝 ${poem.title || '无题'}</h2>
                <div class="detail-body">
                    <div class="poem-lines">
                        ${poem.lines.map(line => `<p class="poem-line">${line}</p>`).join('')}
                    </div>
                    <div class="detail-meta">
                        <span>创作时间：${poem.date}</span>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    function showCocktailDetail(cocktail) {
        const modal = document.createElement('div');
        modal.className = 'detail-modal';
        modal.innerHTML = `
            <div class="detail-modal-content">
                <button class="detail-close" onclick="this.closest('.detail-modal').remove()">×</button>
                <h2 class="detail-title">🍸 ${cocktail.name}</h2>
                <div class="detail-body">
                    <p class="detail-desc">${cocktail.description || ''}</p>
                    <div class="detail-section">
                        <h3>配方</h3>
                        <p><strong>基酒：</strong>${cocktail.baseSpirit}</p>
                        <p><strong>辅料：</strong>${cocktail.mixers ? cocktail.mixers.join('、') : ''}</p>
                        <p><strong>手法：</strong>${cocktail.technique}</p>
                        <p><strong>装饰：</strong>${cocktail.garnishes ? cocktail.garnishes.join('、') : ''}</p>
                    </div>
                    <div class="detail-meta">
                        <span>心情：${cocktail.mood}</span>
                        <span>创作时间：${cocktail.date}</span>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    function showPerfumeDetail(perfume) {
        const modal = document.createElement('div');
        modal.className = 'detail-modal';
        modal.innerHTML = `
            <div class="detail-modal-content">
                <button class="detail-close" onclick="this.closest('.detail-modal').remove()">×</button>
                <h2 class="detail-title">🌸 ${perfume.name}</h2>
                <p class="detail-subtitle">${perfume.nameEn || ''}</p>
                <div class="detail-body">
                    <p class="detail-desc">${perfume.description || ''}</p>
                    <div class="detail-section">
                        <h3>香调</h3>
                        <p>${perfume.families ? perfume.families.join(' · ') : ''}</p>
                    </div>
                    <div class="detail-section">
                        <h3>香料组成</h3>
                        <p><strong>🍋 前调 (${perfume.ratios.top}%)：</strong>${perfume.topNotes.map(n => n.name).join('、')}</p>
                        <p><strong>🌹 中调 (${perfume.ratios.heart}%)：</strong>${perfume.heartNotes.map(n => n.name).join('、')}</p>
                        <p><strong>🌲 后调 (${perfume.ratios.base}%)：</strong>${perfume.baseNotes.map(n => n.name).join('、')}</p>
                    </div>
                    <div class="detail-meta">
                        <span>留香：${perfume.longevity}</span>
                        <span>场景：${perfume.occasions ? perfume.occasions.join('、') : ''}</span>
                        <span>创作时间：${perfume.date}</span>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    function exportSingle(type, date) {
        let item;
        let filename;
        
        switch(type) {
            case 'poetry':
                item = state.poems.find(p => p.date === date);
                filename = `拼贴诗_${item.title || '无题'}_${date}.json`;
                break;
            case 'cocktail':
                item = state.cocktails.find(c => c.date === date);
                filename = `调酒_${item.name}_${date}.json`;
                break;
            case 'perfume':
                item = state.perfumes.find(p => p.date === date);
                filename = `调香_${item.name}_${date}.json`;
                break;
        }
        
        downloadJSON(item, filename);
    }

    function exportAll() {
        const allData = {
            poems: state.poems,
            cocktails: state.cocktails,
            perfumes: state.perfumes,
            exportDate: new Date().toISOString()
        };
        
        downloadJSON(allData, `我的创作_${new Date().toLocaleDateString('zh-CN')}.json`);
    }

    function downloadJSON(data, filename) {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(url);
    }
    // ========== 区块A6：交互方法 结束 ==========

    // ========== 区块A7：样式注入 开始 ==========
    function injectStyles() {
        const styleId = 'my-creations-styles';
        if (document.getElementById(styleId)) return;

        const link = document.createElement('link');
        link.id = styleId;
        link.rel = 'stylesheet';
        link.href = 'css/my-creations.css';
        document.head.appendChild(link);
    }
    // ========== 区块A7：样式注入 结束 ==========

    // ========== 区块A8：公共API 开始 ==========
    return {
        init,
        render,
        setFilter,
        setSort,
        search,
        deleteCreation,
        clearAll,
        viewDetail,
        exportSingle,
        exportAll
    };
    // ========== 区块A8：公共API 结束 ==========

})();

// 挂载到全局
window.MyCreations = MyCreations;
