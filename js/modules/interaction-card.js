/* ================================
   文件名：interaction-card.js
   功能：角色互动卡片生成器
   依赖：无
   
   主要功能：
   - 生成共饮卡片（调酒）
   - 生成品香卡片（调香）
   - 丰富的文案模板
   - 场景描述生成
   
   最后更新：2026-04-21
   ================================ */

const InteractionCard = (function() {
    'use strict';

    // ========== 文案模板库 开始 ==========
    
    // 共饮场景模板
    const drinkingScenes = {
        romantic: [
            '在月光洒满的露台上',
            '在烛光摇曳的酒吧角落',
            '在星空下的屋顶花园',
            '在温暖的壁炉旁',
            '在飘雪的冬夜里',
            '在海边的日落时分'
        ],
        casual: [
            '在喧闹的酒吧里',
            '在深夜的便利店前',
            '在热闹的派对上',
            '在安静的咖啡厅',
            '在公寓的阳台上',
            '在城市的天台'
        ],
        melancholy: [
            '在空无一人的酒吧',
            '在雨夜的街角',
            '在昏暗的房间里',
            '在寂静的深夜',
            '在孤独的旅途中',
            '在回忆的尽头'
        ],
        adventurous: [
            '在未知的旅途中',
            '在异国的街头',
            '在冒险的间隙',
            '在探索的路上',
            '在刺激的夜晚',
            '在疯狂的时刻'
        ]
    };

    // 共饮动作描述
    const drinkingActions = [
        '举起酒杯，轻轻碰触',
        '相视一笑，一饮而尽',
        '交换酒杯，品尝彼此的选择',
        '并肩而坐，慢慢啜饮',
        '隔着吧台，遥遥举杯',
        '在音乐中，随节奏摇晃酒杯'
    ];

    // 共饮情感描述
    const drinkingEmotions = {
        romantic: [
            '琥珀色的液体映照着彼此的眼眸',
            '酒香中弥漫着暧昧的气息',
            '微醺中，距离悄然拉近',
            '杯中的冰块融化，如同心防',
            '每一口都是无声的告白',
            '酒精让勇气慢慢升腾'
        ],
        friendship: [
            '笑声在酒杯碰撞中回荡',
            '往事随着酒香浮现',
            '默契在沉默中流淌',
            '友谊在酒精中升华',
            '回忆在杯底沉淀',
            '信任在推杯换盏间加深'
        ],
        bittersweet: [
            '苦涩与甜蜜交织在舌尖',
            '说不出的话藏在酒里',
            '眼神在酒雾中游移',
            '复杂的情绪随酒液滑落',
            '想说的话最终化作沉默',
            '离别的预感在空气中弥漫'
        ]
    };

    // 品香场景模板
    const perfumeScenes = {
        intimate: [
            '在私密的调香室里',
            '在温柔的午后阳光中',
            '在安静的书房一角',
            '在花园的长椅上',
            '在飘着薄纱的房间',
            '在月光流淌的夜晚'
        ],
        elegant: [
            '在优雅的沙龙里',
            '在古典的音乐厅',
            '在艺术画廊的一隅',
            '在精致的下午茶时光',
            '在香氛弥漫的空间',
            '在诗意的氛围中'
        ],
        mysterious: [
            '在神秘的实验室',
            '在幽暗的密室',
            '在迷雾笼罩的清晨',
            '在秘密的花园深处',
            '在时间静止的瞬间',
            '在梦境与现实的边界'
        ]
    };

    // 品香动作描述
    const perfumeActions = [
        '轻轻喷洒在手腕',
        '闭上眼睛，深深嗅闻',
        '让香气在空气中晕开',
        '将香水瓶递给对方',
        '在颈间留下一抹香痕',
        '让香气在指尖流转'
    ];

    // 品香情感描述
    const perfumeEmotions = {
        romantic: [
            '前调的清新如初见的心动',
            '中调的温柔是渐生的情愫',
            '后调的深沉藏着不言的爱意',
            '香气缠绕，如同无声的拥抱',
            '每一层香调都是一次告白',
            '留香在肌肤，如同记忆在心间'
        ],
        nostalgic: [
            '前调唤起遥远的记忆',
            '中调勾起往日的时光',
            '后调沉淀着岁月的痕迹',
            '香气中藏着说不出的怀念',
            '每一次呼吸都是一次回忆',
            '熟悉的气息让人恍惚'
        ],
        mysterious: [
            '前调如谜题的开端',
            '中调是秘密的展开',
            '后调藏着未解的答案',
            '香气变幻莫测，如同心思',
            '每一层都是新的发现',
            '神秘在空气中流动'
        ]
    };

    // 卡片标题模板
    const cardTitles = {
        cocktail: {
            romantic: [
                '月下共饮',
                '微醺时刻',
                '深夜对酌',
                '星光下的约定',
                '琥珀色的告白',
                '醉意中的真心'
            ],
            friendship: [
                '知己对饮',
                '推杯换盏',
                '不醉不归',
                '往事随风',
                '干杯，朋友',
                '深夜食堂'
            ],
            melancholy: [
                '独酌',
                '借酒消愁',
                '雨夜独饮',
                '往事如烟',
                '苦酒入喉',
                '无人问津'
            ]
        },
        perfume: {
            romantic: [
                '为你调香',
                '专属香气',
                '爱的气息',
                '香氛告白',
                '留香',
                '心动的味道'
            ],
            elegant: [
                '优雅时刻',
                '香氛艺术',
                '调香师的秘密',
                '气质之选',
                '品味人生',
                '香气美学'
            ],
            mysterious: [
                '神秘配方',
                '禁忌之香',
                '秘密花园',
                '暗夜之香',
                '未解之谜',
                '灵魂气息'
            ]
        }
    };

    // 结尾诗句
    const endingPoems = {
        romantic: [
            '愿这杯酒，能让你读懂我的心意',
            '在微醺中，我们靠得更近',
            '这一刻，时间为我们停留',
            '杯中有酒，心中有你',
            '醉不是因为酒，而是因为你',
            '这香气，是我对你的全部心意'
        ],
        bittersweet: [
            '有些话，只能藏在酒里',
            '离别总是在不经意间',
            '这一杯，敬过往，敬未来',
            '说再见太难，不如就此别过',
            '香气会散，但记忆永存',
            '愿你记得这一刻的温柔'
        ],
        hopeful: [
            '干杯，为了更好的明天',
            '这只是开始，不是结束',
            '愿我们的故事，未完待续',
            '下次见面，我们再干一杯',
            '这香气，会陪你走过漫长岁月',
            '愿你的人生，如这香气般美好'
        ]
    };

    // ========== 文案模板库 结束 ==========

    // ========== 卡片生成函数 开始 ==========

    // 生成共饮卡片
    function generateDrinkingCard(cocktail, characters) {
        const isSingle = characters.length === 1;
        const mood = determineMood(cocktail.mood);
        
        // 选择场景
        const scene = randomChoice(drinkingScenes[mood] || drinkingScenes.casual);
        
        // 选择动作
        const action = randomChoice(drinkingActions);
        
        // 选择情感描述
        const emotionType = mood === 'romantic' ? 'romantic' : 
                           mood === 'melancholy' ? 'bittersweet' : 'friendship';
        const emotion = randomChoice(drinkingEmotions[emotionType]);
        
        // 选择标题
        const titleType = mood === 'romantic' ? 'romantic' : 
                         mood === 'melancholy' ? 'melancholy' : 'friendship';
        const title = randomChoice(cardTitles.cocktail[titleType]);
        
        // 选择结尾
        const endingType = mood === 'romantic' ? 'romantic' : 
                          mood === 'melancholy' ? 'bittersweet' : 'hopeful';
        const ending = randomChoice(endingPoems[endingType]);
        
        // 生成主文案
        let mainText;
        if (isSingle) {
            mainText = `${scene}，${characters[0].name}${action.replace('相视一笑', '独自').replace('并肩而坐', '独坐').replace('举起酒杯，轻轻碰触', '举起酒杯')}。`;
        } else {
            mainText = `${scene}，${characters[0].name}与${characters[1].name}${action}。`;
        }
        
        // 构建完整文案
        const story = `${mainText}\n\n${emotion}\n\n${ending}`;
        
        return {
            type: 'cocktail',
            title: title,
            cocktailName: cocktail.name,
            characters: characters,
            scene: scene,
            story: story,
            cocktail: cocktail,
            mood: mood,
            timestamp: Date.now()
        };
    }

    // 生成品香卡片
    function generatePerfumeCard(perfume, characters) {
        const isSingle = characters.length === 1;
        const mood = determinePerfumeMood(perfume);
        
        // 选择场景
        const sceneType = mood === 'romantic' ? 'intimate' : 
                         mood === 'mysterious' ? 'mysterious' : 'elegant';
        const scene = randomChoice(perfumeScenes[sceneType]);
        
        // 选择动作
        const action = randomChoice(perfumeActions);
        
        // 选择情感描述
        const emotionType = mood === 'romantic' ? 'romantic' : 
                           mood === 'mysterious' ? 'mysterious' : 'nostalgic';
        const emotions = perfumeEmotions[emotionType];
        
        // 选择标题
        const titleType = mood === 'romantic' ? 'romantic' : 
                         mood === 'mysterious' ? 'mysterious' : 'elegant';
        const title = randomChoice(cardTitles.perfume[titleType]);
        
        // 选择结尾
        const endingType = mood === 'romantic' ? 'romantic' : 'hopeful';
        const ending = randomChoice(endingPoems[endingType]);
        
        // 生成主文案
        let mainText;
        if (isSingle) {
            mainText = `${scene}，${characters[0].name}${action}。`;
        } else {
            mainText = `${scene}，${characters[0].name}为${characters[1].name}${action}。`;
        }
        
        // 香气描述
        const topNote = perfume.selectedTopNotes?.[0]?.name || '清新';
        const heartNote = perfume.selectedHeartNotes?.[0]?.name || '温柔';
        const baseNote = perfume.selectedBaseNotes?.[0]?.name || '深沉';
        
        const fragranceDesc = `前调的${topNote}${emotions[0].substring(2)}，` +
                             `中调的${heartNote}${emotions[1].substring(2)}，` +
                             `后调的${baseNote}${emotions[2].substring(2)}。`;
        
        // 构建完整文案
        const story = `${mainText}\n\n${fragranceDesc}\n\n${randomChoice(emotions.slice(3))}\n\n${ending}`;
        
        return {
            type: 'perfume',
            title: title,
            perfumeName: perfume.name,
            characters: characters,
            scene: scene,
            story: story,
            perfume: perfume,
            mood: mood,
            timestamp: Date.now()
        };
    }

    // 判断调酒的情绪
    function determineMood(moodId) {
        const moodMap = {
            'calm': 'casual',
            'energetic': 'casual',
            'romantic': 'romantic',
            'melancholy': 'melancholy',
            'adventurous': 'adventurous',
            'nostalgic': 'melancholy'
        };
        return moodMap[moodId] || 'casual';
    }

    // 判断调香的情绪
    function determinePerfumeMood(perfume) {
        // 根据香料类型判断情绪
        const topNotes = perfume.selectedTopNotes || [];
        const heartNotes = perfume.selectedHeartNotes || [];
        
        // 简单的情绪判断逻辑
        const hasFloral = heartNotes.some(n => 
            n.name.includes('玫瑰') || n.name.includes('茉莉') || n.name.includes('花')
        );
        const hasDark = topNotes.some(n => 
            n.name.includes('烟') || n.name.includes('皮革') || n.name.includes('木')
        );
        
        if (hasFloral) return 'romantic';
        if (hasDark) return 'mysterious';
        return 'elegant';
    }

    // 随机选择
    function randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    // ========== 卡片生成函数 结束 ==========

    // ========== 卡片渲染函数 开始 ==========

    // 渲染共饮卡片
    function renderDrinkingCard(cardData) {
        const { title, cocktailName, characters, story, cocktail } = cardData;
        const isSingle = characters.length === 1;
        
        return `
            <div class="interaction-card drinking-card">
                <div class="card-background" style="background: linear-gradient(135deg, ${cocktail.color}, ${cocktail.secondaryColor});">
                    <div class="card-overlay"></div>
                </div>
                
                <div class="card-content">
                    <!-- 卡片头部 -->
                    <div class="card-header">
                        <h2 class="card-title">${title}</h2>
                        <div class="card-subtitle">🍸 ${cocktailName}</div>
                    </div>
                    
                    <!-- 角色展示 -->
                    <div class="card-characters ${isSingle ? 'single' : 'double'}">
                        ${characters.map((char, index) => `
                            <div class="character-avatar-large">
                                <div class="avatar-circle">
                                    ${char.avatar || char.emoji || '👤'}
                                </div>
                                <div class="character-name-large">${char.name}</div>
                            </div>
                            ${!isSingle && index === 0 ? '<div class="character-connector">🍸</div>' : ''}
                        `).join('')}
                    </div>
                    
                    <!-- 故事文案 -->
                    <div class="card-story">
                        ${story.split('\n\n').map(para => `<p>${para}</p>`).join('')}
                    </div>
                    
                    <!-- 酒卡信息 -->
                    <div class="card-recipe">
                        <div class="recipe-title">配方</div>
                        <div class="recipe-items">
                            <div class="recipe-item">
                                <span class="recipe-icon">${cocktail.spirit?.emoji || '🥃'}</span>
                                <span class="recipe-name">${cocktail.spirit?.name || '基酒'}</span>
                            </div>
                            ${cocktail.mixers?.slice(0, 2).map(mixer => `
                                <div class="recipe-item">
                                    <span class="recipe-icon">${mixer.emoji || '🧃'}</span>
                                    <span class="recipe-name">${mixer.name}</span>
                                </div>
                            `).join('') || ''}
                        </div>
                    </div>
                    
                    <!-- 卡片底部 -->
                    <div class="card-footer">
                        <div class="card-date">${new Date().toLocaleDateString('zh-CN')}</div>
                        <div class="card-watermark">深渊之影 · 灵魂实验室</div>
                    </div>
                </div>
            </div>
        `;
    }

    // 渲染品香卡片
    function renderPerfumeCard(cardData) {
        const { title, perfumeName, characters, story, perfume } = cardData;
        const isSingle = characters.length === 1;
        
        return `
            <div class="interaction-card perfume-card">
                <div class="card-background perfume-bg">
                    <div class="card-overlay"></div>
                </div>
                
                <div class="card-content">
                    <!-- 卡片头部 -->
                    <div class="card-header">
                        <h2 class="card-title">${title}</h2>
                        <div class="card-subtitle">🌸 ${perfumeName}</div>
                    </div>
                    
                    <!-- 角色展示 -->
                    <div class="card-characters ${isSingle ? 'single' : 'double'}">
                        ${characters.map((char, index) => `
                            <div class="character-avatar-large">
                                <div class="avatar-circle">
                                    ${char.avatar || char.emoji || '👤'}
                                </div>
                                <div class="character-name-large">${char.name}</div>
                            </div>
                            ${!isSingle && index === 0 ? '<div class="character-connector">🌸</div>' : ''}
                        `).join('')}
                    </div>
                    
                    <!-- 故事文案 -->
                    <div class="card-story">
                        ${story.split('\n\n').map(para => `<p>${para}</p>`).join('')}
                    </div>
                    
                    <!-- 香气金字塔 -->
                    <div class="card-pyramid">
                        <div class="pyramid-title">香气金字塔</div>
                        <div class="pyramid-layers">
                            ${perfume.selectedTopNotes?.length ? `
                                <div class="pyramid-layer top">
                                    <span class="layer-label">前调</span>
                                    <span class="layer-notes">${perfume.selectedTopNotes.map(n => n.name).join('、')}</span>
                                </div>
                            ` : ''}
                            ${perfume.selectedHeartNotes?.length ? `
                                <div class="pyramid-layer heart">
                                    <span class="layer-label">中调</span>
                                    <span class="layer-notes">${perfume.selectedHeartNotes.map(n => n.name).join('、')}</span>
                                </div>
                            ` : ''}
                            ${perfume.selectedBaseNotes?.length ? `
                                <div class="pyramid-layer base">
                                    <span class="layer-label">后调</span>
                                    <span class="layer-notes">${perfume.selectedBaseNotes.map(n => n.name).join('、')}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <!-- 卡片底部 -->
                    <div class="card-footer">
                        <div class="card-date">${new Date().toLocaleDateString('zh-CN')}</div>
                        <div class="card-watermark">深渊之影 · 灵魂实验室</div>
                    </div>
                </div>
            </div>
        `;
    }

    // ========== 卡片渲染函数 结束 ==========

    // ========== 卡片展示函数 开始 ==========

    // 显示卡片模态框
    function showCard(cardData) {
        const modal = document.createElement('div');
        modal.className = 'interaction-card-modal';
        
        const cardHTML = cardData.type === 'cocktail' ? 
            renderDrinkingCard(cardData) : 
            renderPerfumeCard(cardData);
        
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-container">
                ${cardHTML}
                <div class="modal-actions">
                    <button class="action-btn secondary" onclick="InteractionCard.closeModal()">
                        关闭
                    </button>
                    <button class="action-btn primary" onclick="InteractionCard.saveCard()">
                        💾 保存卡片
                    </button>
                    <button class="action-btn secondary" onclick="InteractionCard.shareCard()">
                        📤 分享
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 保存当前卡片数据
        window._currentCard = cardData;
        
        // 绑定关闭事件
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
        
        // 添加动画
        setTimeout(() => modal.classList.add('show'), 10);
    }

    // 关闭模态框
    function closeModal() {
        const modal = document.querySelector('.interaction-card-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    }

    // 保存卡片
    function saveCard() {
        const cardData = window._currentCard;
        if (!cardData) return;
        
        const savedCards = Storage.get('savedInteractionCards') || [];
        savedCards.unshift(cardData);
        
        if (savedCards.length > 50) {
            savedCards.length = 50;
        }
        
        Storage.set('savedInteractionCards', savedCards);
        alert('✨ 卡片已保存！');
    }

    // 分享卡片
    function shareCard() {
        const cardData = window._currentCard;
        if (!cardData) return;
        
        const text = `${cardData.title}\n\n${cardData.story}\n\n来自 深渊之影 | 灵魂实验室`;
        
        if (navigator.share) {
            navigator.share({
                title: cardData.title,
                text: text
            }).catch(err => console.log('分享失败', err));
        } else {
            navigator.clipboard.writeText(text).then(() => {
                alert('📋 已复制到剪贴板！');
            }).catch(err => {
                console.error('复制失败', err);
                alert('分享失败，请手动复制');
            });
        }
    }

    // ========== 卡片展示函数 结束 ==========

    // 公开API
    return {
        generateDrinkingCard,
        generatePerfumeCard,
        showCard,
        closeModal,
        saveCard,
        shareCard
    };
})();

// 挂载到全局
window.InteractionCard = InteractionCard;
