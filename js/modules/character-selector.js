/* ================================
   文件名：character-selector.js
   功能：角色选择器（支持数据库角色+自定义角色）
   依赖：DataLoader, Storage
   
   主要功能：
   - 从数据库选择角色
   - 自定义输入角色
   - CP组合推荐
   
   最后更新：2026-04-21
   ================================ */

const CharacterSelector = (function() {
    'use strict';

    let characters = [];
    let callback = null;

    // 初始化
    async function init() {
        try {
            // ✅ 修复：使用正确的数据路径
            const data = await DataLoader.loadJSON('data/characters/list.json');
            characters = data.characters || [];
            console.log('[CharacterSelector] 角色数据加载完成', characters.length);
        } catch (error) {
            console.error('[CharacterSelector] 角色数据加载失败', error);
            characters = [];
        }
    }

    // 打开选择器
    function open(onSelect, options = {}) {
        callback = onSelect;
        const {
            title = '选择角色',
            allowCustom = true,
            allowMultiple = false,
            maxSelection = 2
        } = options;

        const modal = createModal(title, allowCustom, allowMultiple, maxSelection);
        document.body.appendChild(modal);
        
        // 绑定事件
        bindEvents(modal, allowMultiple, maxSelection);
    }

    // 创建模态框
    function createModal(title, allowCustom, allowMultiple, maxSelection) {
        const modal = document.createElement('div');
        modal.className = 'character-selector-modal';
        modal.innerHTML = `
            <div class="selector-overlay"></div>
            <div class="selector-content">
                <div class="selector-header">
                    <h2 class="selector-title">${title}</h2>
                    <button class="selector-close" data-action="close">×</button>
                </div>

                <div class="selector-body">
                    <!-- 搜索框 -->
                    <div class="selector-search">
                        <input type="text" 
                               class="search-input" 
                               placeholder="搜索角色名称..."
                               id="character-search">
                    </div>

                    <!-- 标签页 -->
                    <div class="selector-tabs">
                        <button class="selector-tab active" data-tab="database">
                            数据库角色 (${characters.length})
                        </button>
                        ${allowCustom ? `
                            <button class="selector-tab" data-tab="custom">
                                自定义角色
                            </button>
                        ` : ''}
                    </div>

                    <!-- 数据库角色列表 -->
                    <div class="selector-tab-content active" data-content="database">
                        <div class="character-grid" id="character-grid">
                            ${renderCharacterGrid()}
                        </div>
                    </div>

                    <!-- 自定义角色输入 -->
                    ${allowCustom ? `
                        <div class="selector-tab-content" data-content="custom">
                            <div class="custom-input-section">
                                <label class="input-label">角色名称</label>
                                <input type="text" 
                                       class="custom-input" 
                                       id="custom-character-name"
                                       placeholder="输入角色名称...">
                                
                                <label class="input-label">角色描述（可选）</label>
                                <textarea class="custom-textarea" 
                                          id="custom-character-desc"
                                          placeholder="简单描述角色性格、特点..."
                                          rows="3"></textarea>
                                
                                <button class="primary-btn" data-action="add-custom">
                                    ✨ 添加自定义角色
                                </button>
                            </div>
                        </div>
                    ` : ''}

                    <!-- 已选择的角色 -->
                    ${allowMultiple ? `
                        <div class="selected-characters" id="selected-characters">
                            <div class="selected-label">已选择 (<span id="selected-count">0</span>/${maxSelection})</div>
                            <div class="selected-list" id="selected-list"></div>
                        </div>
                    ` : ''}
                </div>

                <div class="selector-footer">
                    <button class="secondary-btn" data-action="close">取消</button>
                    ${allowMultiple ? `
                        <button class="primary-btn" data-action="confirm" disabled>
                            确认选择
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        return modal;
    }

    // 渲染角色网格
    function renderCharacterGrid(searchQuery = '') {
        let filteredCharacters = characters;
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filteredCharacters = characters.filter(char => {
                // 搜索名称
                if (char.name && char.name.toLowerCase().includes(query)) return true;
                
                // ✅ 修复：适配新的数据结构，搜索各种标签
                if (char.occupation && char.occupation.toLowerCase().includes(query)) return true;
                if (char.archetype && char.archetype.toLowerCase().includes(query)) return true;
                
                // 搜索标签数组
                const tagArrays = [
                    char.soulTags,
                    char.themeTags,
                    char.emotionTags,
                    char.coreXP
                ];
                
                for (const tags of tagArrays) {
                    if (Array.isArray(tags) && tags.some(tag => 
                        tag.toLowerCase().includes(query)
                    )) {
                        return true;
                    }
                }
                
                return false;
            });
        }

        if (filteredCharacters.length === 0) {
            return '<div class="empty-state">未找到匹配的角色</div>';
        }

        return filteredCharacters.map(char => {
            // ✅ 为角色卡片准备显示用的标签（优先显示 soulTags）
            const displayTags = char.soulTags || char.themeTags || [];
            
            return `
                <div class="character-card" data-character='${JSON.stringify({
                    id: char.id,
                    name: char.name,
                    occupation: char.occupation,
                    archetype: char.archetype,
                    soulTags: char.soulTags
                })}'>
                    <div class="character-avatar">
                        ${char.avatar || char.emoji || '👤'}
                    </div>
                    <div class="character-info">
                        <div class="character-name">${char.name}</div>
                        ${char.occupation ? `<div class="character-name-en">${char.occupation}</div>` : ''}
                    </div>
                    ${displayTags.length > 0 ? `
                        <div class="character-tags">
                            ${displayTags.slice(0, 2).map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    // 绑定事件
    function bindEvents(modal, allowMultiple, maxSelection) {
        const selectedCharacters = [];

        // 关闭按钮
        modal.querySelectorAll('[data-action="close"]').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.remove();
            });
        });

        // 点击遮罩关闭
        modal.querySelector('.selector-overlay').addEventListener('click', () => {
            modal.remove();
        });

        // 标签页切换
        modal.querySelectorAll('.selector-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                
                // 切换标签页激活状态
                modal.querySelectorAll('.selector-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // 切换内容
                modal.querySelectorAll('.selector-tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                modal.querySelector(`[data-content="${tabName}"]`).classList.add('active');
            });
        });

        // 搜索功能
        const searchInput = modal.querySelector('#character-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const grid = modal.querySelector('#character-grid');
                grid.innerHTML = renderCharacterGrid(e.target.value);
                bindCharacterCardEvents(modal, allowMultiple, maxSelection, selectedCharacters);
            });
        }

        // 角色卡片点击
        bindCharacterCardEvents(modal, allowMultiple, maxSelection, selectedCharacters);

        // 添加自定义角色
        const addCustomBtn = modal.querySelector('[data-action="add-custom"]');
        if (addCustomBtn) {
            addCustomBtn.addEventListener('click', () => {
                const nameInput = modal.querySelector('#custom-character-name');
                const descInput = modal.querySelector('#custom-character-desc');
                
                const name = nameInput.value.trim();
                if (!name) {
                    alert('请输入角色名称');
                    return;
                }

                const customCharacter = {
                    id: `custom_${Date.now()}`,
                    name: name,
                    description: descInput.value.trim(),
                    isCustom: true
                };

                if (allowMultiple) {
                    if (selectedCharacters.length >= maxSelection) {
                        alert(`最多只能选择 ${maxSelection} 个角色`);
                        return;
                    }
                    selectedCharacters.push(customCharacter);
                    updateSelectedList(modal, selectedCharacters, maxSelection);
                } else {
                    callback(customCharacter);
                    modal.remove();
                }
            });
        }

        // 确认选择（多选模式）
        const confirmBtn = modal.querySelector('[data-action="confirm"]');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                if (selectedCharacters.length > 0) {
                    callback(selectedCharacters);
                    modal.remove();
                }
            });
        }
    }

    // 绑定角色卡片事件
    function bindCharacterCardEvents(modal, allowMultiple, maxSelection, selectedCharacters) {
        modal.querySelectorAll('.character-card').forEach(card => {
            card.addEventListener('click', () => {
                const character = JSON.parse(card.dataset.character);

                if (allowMultiple) {
                    // 多选模式
                    const index = selectedCharacters.findIndex(c => c.id === character.id);
                    
                    if (index > -1) {
                        // 取消选择
                        selectedCharacters.splice(index, 1);
                        card.classList.remove('selected');
                    } else {
                        // 添加选择
                        if (selectedCharacters.length >= maxSelection) {
                            alert(`最多只能选择 ${maxSelection} 个角色`);
                            return;
                        }
                        selectedCharacters.push(character);
                        card.classList.add('selected');
                    }

                    updateSelectedList(modal, selectedCharacters, maxSelection);
                } else {
                    // 单选模式，直接回调
                    callback(character);
                    modal.remove();
                }
            });
        });
    }

    // 更新已选择列表
    function updateSelectedList(modal, selectedCharacters, maxSelection) {
        const countEl = modal.querySelector('#selected-count');
        const listEl = modal.querySelector('#selected-list');
        const confirmBtn = modal.querySelector('[data-action="confirm"]');

        if (countEl) countEl.textContent = selectedCharacters.length;
        
        if (listEl) {
            listEl.innerHTML = selectedCharacters.map((char, index) => `
                <div class="selected-item">
                    <span class="selected-name">${char.name}</span>
                    <button class="remove-btn" data-index="${index}">×</button>
                </div>
            `).join('');

            // 绑定移除按钮
            listEl.querySelectorAll('.remove-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const index = parseInt(btn.dataset.index);
                    const removed = selectedCharacters.splice(index, 1)[0];
                    
                    // 更新卡片状态
                    const card = modal.querySelector(`[data-character*='"id":"${removed.id}"']`);
                    if (card) card.classList.remove('selected');
                    
                    updateSelectedList(modal, selectedCharacters, maxSelection);
                });
            });
        }

        // 更新确认按钮状态
        if (confirmBtn) {
            confirmBtn.disabled = selectedCharacters.length === 0;
        }
    }

    // 公开API
    return {
        init,
        open
    };
})();

// 挂载到全局
window.CharacterSelector = CharacterSelector;

