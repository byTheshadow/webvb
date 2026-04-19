/* ================================
   文件名：character-detail.js
   功能：角色卡详情页（模态框形式）
   依赖：storage.js, data-loader.js
   
   主要功能：
   - 显示角色完整信息
   - 绘制维度雷达图（Canvas）
   - 标签云展示
   - 相关角色推荐
   - 支持左右滑动切换角色（移动端）
   
   最后更新：2026-04-19
   ================================ */

// ========== 区块A：模块状态 开始 ==========
const CharacterDetail = (function() {
    'use strict';
    
    // 模块状态
    const state = {
        currentCharacter: null,
        allCharacters: [],
        relatedCharacters: [],
        modalElement: null,
        canvasContext: null,
        isOpen: false
    };
    
    // ========== 区块A：模块状态 结束 ==========
    
    // ========== 区块B：数据加载 开始 ==========
    
    /**
     * 加载所有角色数据
     */
    async function loadCharacters() {
        try {
            const data = await DataLoader.loadCharacters();
            // loadCharacters 返回的是完整的 JSON 对象，需要提取 characters 数组
            state.allCharacters = data.characters || [];
            console.log('[CharacterDetail] 角色数据加载完成:', state.allCharacters.length);
            return state.allCharacters;
        } catch (error) {
            console.error('[CharacterDetail] 角色数据加载失败:', error);
            return [];
        }
    }
    
    /**
     * 根据ID获取角色
     */
    function getCharacterById(characterId) {
        return state.allCharacters.find(char => char.id === characterId);
    }
    
    // ========== 区块B：数据加载 结束 ==========
    
    // ========== 区块C：相关角色推荐算法 开始 ==========
    
    /**
     * 计算相关角色（基于标签、性向、维度相似度）
     */
    function calculateRelatedCharacters(character, limit = 3) {
        if (!character) return [];
        
        const scored = state.allCharacters
            .filter(char => char.id !== character.id && char.status === 'active')
            .map(char => {
                let score = 0;
                
                // 1. 性向匹配（30分）
                const orientationMatch = character.orientation.some(o => 
                    char.orientation.includes(o)
                );
                if (orientationMatch) score += 30;
                
                // 2. 标签匹配（40分）
                const allTags = [
                    ...(character.soulTags || []),
                    ...(character.themeTags || []),
                    ...(character.emotionTags || [])
                ];
                const charTags = [
                    ...(char.soulTags || []),
                    ...(char.themeTags || []),
                    ...(char.emotionTags || [])
                ];
                const tagMatches = allTags.filter(tag => charTags.includes(tag)).length;
                score += Math.min(tagMatches * 8, 40);
                
                // 3. 维度相似度（30分）
                if (character.matchDimensions && char.matchDimensions) {
                    const dimensions = Object.keys(character.matchDimensions);
                    let dimScore = 0;
                    dimensions.forEach(dim => {
                        const diff = Math.abs(
                            character.matchDimensions[dim] - char.matchDimensions[dim]
                        );
                        dimScore += (100 - diff) / 100;
                    });
                    score += (dimScore / dimensions.length) * 30;
                }
                
                return { character: char, score };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
        
        return scored.map(item => item.character);
    }
    
    // ========== 区块C：相关角色推荐算法 结束 ==========
    
    // ========== 区块D：雷达图绘制 开始 ==========
    
    /**
     * 绘制维度雷达图
     */
    function drawRadarChart(canvasId, dimensions) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 40;
        
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 获取维度数据
        const dimensionKeys = Object.keys(dimensions);
        const dimensionCount = dimensionKeys.length;
        const angleStep = (Math.PI * 2) / dimensionCount;
        
        // 获取主题颜色
        const primaryColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--primary-color').trim();
        const primaryLight = getComputedStyle(document.documentElement)
            .getPropertyValue('--primary-light').trim();
        
        // 绘制背景网格（5层）
        ctx.strokeStyle = 'rgba(128, 128, 128, 0.1)';
        ctx.lineWidth = 1;
        for (let level = 1; level <= 5; level++) {
            ctx.beginPath();
            const levelRadius = (radius / 5) * level;
            for (let i = 0; i <= dimensionCount; i++) {
                const angle = angleStep * i - Math.PI / 2;
                const x = centerX + Math.cos(angle) * levelRadius;
                const y = centerY + Math.sin(angle) * levelRadius;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.stroke();
        }
        
        // 绘制轴线
        ctx.strokeStyle = 'rgba(128, 128, 128, 0.2)';
        ctx.lineWidth = 1;
        dimensionKeys.forEach((key, index) => {
            const angle = angleStep * index - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();
        });
        
        // 绘制数据区域
        ctx.fillStyle = primaryColor + '30'; // 30% 透明度
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        dimensionKeys.forEach((key, index) => {
            const value = dimensions[key] || 0;
            const angle = angleStep * index - Math.PI / 2;
            const distance = (value / 100) * radius;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // 绘制数据点
        ctx.fillStyle = primaryColor;
        dimensionKeys.forEach((key, index) => {
            const value = dimensions[key] || 0;
            const angle = angleStep * index - Math.PI / 2;
            const distance = (value / 100) * radius;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // 绘制维度标签
        ctx.fillStyle = getComputedStyle(document.documentElement)
            .getPropertyValue('--text-primary').trim();
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const labelMap = {
            control: '控制',
            masochism: '受虐',
            emotion: '情感',
            detachment: '疏离',
            kink: '癖好',
            intensity: '强度',
            possessiveness: '占有',
            vulnerability: '脆弱'
        };
        
        dimensionKeys.forEach((key, index) => {
            const angle = angleStep * index - Math.PI / 2;
            const labelDistance = radius + 25;
            const x = centerX + Math.cos(angle) * labelDistance;
            const y = centerY + Math.sin(angle) * labelDistance;
            
            const label = labelMap[key] || key;
            ctx.fillText(label, x, y);
        });
    }
    
    // ========== 区块D：雷达图绘制 结束 ==========
    
    // ========== 区块E：UI渲染 开始 ==========
    
    /**
     * 创建模态框HTML
     */
    function createModalHTML(character) {
        if (!character) return '';
        
        // 性向标签
        const orientationBadges = character.orientation
            .map(o => `<span class="orientation-badge">${o}</span>`)
            .join('');
        
        // 标签云
        const allTags = [
            ...(character.soulTags || []),
            ...(character.coreXP || []),
            ...(character.themeTags || []),
            ...(character.emotionTags || []),
            ...(character.kinkTags || [])
        ];
        const uniqueTags = [...new Set(allTags)];
        const tagCloud = uniqueTags
            .map(tag => `<span class="tag-item">#${tag}</span>`)
            .join('');
        
        // 相关角色卡片
        const relatedCards = state.relatedCharacters
            .map(char => `
                <div class="related-card" data-character-id="${char.id}">
                    <div class="related-avatar">
                        ${char.avatarFile ? 
                            `<img src="data/characters/avatars/${char.avatarFile}" alt="${char.name}">` :
                            `<div class="avatar-placeholder">${char.name[0]}</div>`
                        }
                    </div>
                    <div class="related-name">${char.name}</div>
                    <div class="related-archetype">${char.archetype || ''}</div>
                </div>
            `)
            .join('');
        
        return `
            <div class="character-detail-modal" id="character-detail-modal">
                <div class="modal-backdrop"></div>
                <div class="modal-container">
                    <div class="modal-header">
                        <button class="back-btn" id="detail-back-btn">
                            <span>←</span> 返回
                        </button>
                        <button class="close-btn" id="detail-close-btn">&times;</button>
                    </div>
                    
                    <div class="modal-body">
                        <!-- 角色基本信息 -->
                        <div class="character-header">
                            <div class="character-avatar">
                                ${character.imageFile ? 
                                    `<img src="data/characters/images/${character.imageFile}" alt="${character.name}">` :
                                    `<div class="avatar-placeholder-large">${character.name[0]}</div>`
                                }
                            </div>
                            <div class="character-info">
                                <h2 class="character-name">${character.name}</h2>
                                <div class="character-meta">
                                    ${orientationBadges}
                                    <span class="archetype-badge">${character.archetype || ''}</span>
                                </div>
                                <p class="character-oneliner">${character.oneLiner || ''}</p>
                            </div>
                        </div>
                        
                        <!-- 完整描述 -->
                        ${character.description ? `
                        <div class="character-section">
                            <h3 class="section-title">角色描述</h3>
                            <p class="character-description">${character.description}</p>
                        </div>
                        ` : ''}
                        
                        <!-- 维度雷达图 -->
                        ${character.matchDimensions ? `
                        <div class="character-section">
                            <h3 class="section-title">维度分析</h3>
                            <div class="radar-container">
                                <canvas id="character-radar-chart" width="300" height="300"></canvas>
                            </div>
                        </div>
                        ` : ''}
                        
                        <!-- 标签云 -->
                        ${uniqueTags.length > 0 ? `
                        <div class="character-section">
                            <h3 class="section-title">标签云</h3>
                            <div class="tag-cloud">
                                ${tagCloud}
                            </div>
                        </div>
                        ` : ''}
                        
                        <!-- 相关推荐 -->
                        ${state.relatedCharacters.length > 0 ? `
                        <div class="character-section">
                            <h3 class="section-title">相关角色</h3>
                            <div class="related-characters">
                                ${relatedCards}
                            </div>
                        </div>
                        ` : ''}
                        
                        <!-- 收藏按钮 -->
                        <div class="character-actions">
                            <button class="favorite-btn" id="favorite-btn" data-character-id="${character.id}">
                                ${Storage.isFavoriteCharacter(character.id) ? '★ 已收藏' : '☆ 收藏'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * 显示角色详情
     */
    async function showCharacterDetail(characterId) {
        console.log('[CharacterDetail] 显示角色详情:', characterId);
        
        // 确保数据已加载
        if (state.allCharacters.length === 0) {
            await loadCharacters();
        }
        
        // 获取角色数据
        const character = getCharacterById(characterId);
        if (!character) {
            console.error('[CharacterDetail] 角色不存在:', characterId);
            return;
        }
        
        state.currentCharacter = character;
        
        // 计算相关角色
        state.relatedCharacters = calculateRelatedCharacters(character);
        
        // 创建模态框
        const modalHTML = createModalHTML(character);
        
        // 移除旧模态框
        const oldModal = document.getElementById('character-detail-modal');
        if (oldModal) {
            oldModal.remove();
        }
        
        // 插入新模态框
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        state.modalElement = document.getElementById('character-detail-modal');
        
        // 绑定事件
        bindModalEvents();
        
        // 显示模态框（添加动画）
        setTimeout(() => {
            state.modalElement.classList.add('active');
            state.isOpen = true;
            document.body.style.overflow = 'hidden';
        }, 10);
        
        // 绘制雷达图
        if (character.matchDimensions) {
            setTimeout(() => {
                drawRadarChart('character-radar-chart', character.matchDimensions);
            }, 100);
        }
    }
    
    /**
     * 关闭详情页
     */
    function closeDetail() {
        if (!state.modalElement) return;
        
        state.modalElement.classList.remove('active');
        document.body.style.overflow = '';
        
        setTimeout(() => {
            if (state.modalElement) {
                state.modalElement.remove();
                state.modalElement = null;
            }
            state.isOpen = false;
        }, 300);
    }
    
    // ========== 区块E：UI渲染 结束 ==========
    
    // ========== 区块F：事件绑定 开始 ==========
    
    /**
     * 绑定模态框事件
     */
    function bindModalEvents() {
        if (!state.modalElement) return;
        
        // 关闭按钮
        const closeBtn = state.modalElement.querySelector('#detail-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeDetail);
        }
        
        // 返回按钮
        const backBtn = state.modalElement.querySelector('#detail-back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', closeDetail);
        }
        
        // 点击背景关闭
        const backdrop = state.modalElement.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', closeDetail);
        }
        
        // 收藏按钮
        const favoriteBtn = state.modalElement.querySelector('#favorite-btn');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', toggleFavorite);
        }
        
        // 相关角色卡片点击
        const relatedCards = state.modalElement.querySelectorAll('.related-card');
        relatedCards.forEach(card => {
            card.addEventListener('click', () => {
                const characterId = card.dataset.characterId;
                if (characterId) {
                    // 关闭当前详情，打开新详情
                    closeDetail();
                    setTimeout(() => {
                        showCharacterDetail(characterId);
                    }, 350);
                }
            });
        });
        
        // ESC键关闭
        const escHandler = (e) => {
            if (e.key === 'Escape' && state.isOpen) {
                closeDetail();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }
    
    /**
     * 切换收藏状态
     */
    function toggleFavorite(e) {
        const btn = e.currentTarget;
        const characterId = btn.dataset.characterId;
        
        if (Storage.isFavoriteCharacter(characterId)) {
            Storage.removeFavoriteCharacter(characterId);
            btn.textContent = '☆ 收藏';
        } else {
            Storage.saveFavoriteCharacter(characterId);
            btn.textContent = '★ 已收藏';
        }
    }
    
    // ========== 区块F：事件绑定 结束 ==========
    
    // ========== 区块G：公共API 开始 ==========
    
    return {
        init: loadCharacters,
        show: showCharacterDetail,
        close: closeDetail,
        getCharacter: getCharacterById
    };
    
    // ========== 区块G：公共API 结束 ==========
    
})();

// ========== 导出到全局 ==========
window.CharacterDetail = CharacterDetail;

