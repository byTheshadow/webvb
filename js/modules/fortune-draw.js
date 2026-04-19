/* ============================================================
 * 文件名: js/modules/fortune-draw.js
 * 用途: 雷诺曼卡抽卡系统 - 核心逻辑模块
 * 依赖: js/data-loader.js, js/storage.js
 * 
 * 主要功能:
 *   1. 加载雷诺曼卡数据
 *   2. 实现抽卡逻辑（单张/三张/十字）
 *   3. 解读卡牌组合（✨ 新增智能文案生成）
 *   4. 基于抽卡结果推荐角色卡
 *   5. 保存抽卡历史
 *   6. 渲染抽卡界面
 * 
 * 推荐算法:
 *   - 提取卡牌的 characterTags
 *   - 计算卡牌的 matchDimensions 平均值
 *   - 与角色卡的 tags 和 matchDimensions 进行匹配
 *   - 结合 lenormandAffinities 权重
 * ============================================================ */

const FortuneDraw = (function () {
  'use strict';

  /* ----------------------------------------------------------
   * 区块A: 模块状态
   * 用途: 存储抽卡过程中的所有运行时数据
   * ---------------------------------------------------------- */
  const state = {
    cards: [],              // 雷诺曼卡数据
    characters: [],         // 角色卡数据
    drawnCards: [],         // 已抽取的卡牌
    drawMethod: 'single',   // 抽卡方式
    isLoaded: false,        // 数据是否已加载
    currentView: 'select'   // 当前视图: select | drawing | result
  };

  /* ----------------------------------------------------------
   * 区块B: 数据加载
   * 用途: 加载雷诺曼卡和角色卡数据
   * ---------------------------------------------------------- */
  async function loadData() {
    console.log('[FortuneDraw] 开始加载数据...');
    
    try {
      // 加载雷诺曼卡数据
      const lenormandData = await DataLoader.loadJSON('data/fortunes/lenormand.json');
      state.cards = lenormandData.cards;
      
      // 加载角色卡数据
      const charactersData = await DataLoader.loadJSON('data/characters/list.json');
      state.characters = charactersData.characters;
      
      state.isLoaded = true;
      console.log('[FortuneDraw] 数据加载完成', {
        cards: state.cards.length,
        characters: state.characters.length
      });
      
      return true;
    } catch (error) {
      console.error('[FortuneDraw] 数据加载失败:', error);
      return false;
    }
  }

  /* ----------------------------------------------------------
   * 区块C: 抽卡逻辑
   * 用途: 实现随机抽卡，确保不重复
   * ---------------------------------------------------------- */
  function drawCards(count) {
    console.log('[FortuneDraw] 开始抽卡，数量:', count);
    
    // 创建卡牌池（1-36）
    const cardPool = [...Array(36)].map((_, i) => i + 1);
    
    // 洗牌（Fisher-Yates算法）
    for (let i = cardPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardPool[i], cardPool[j]] = [cardPool[j], cardPool[i]];
    }
    
    // 抽取指定数量的卡牌
    const drawnIds = cardPool.slice(0, count);
    state.drawnCards = drawnIds.map(id => 
      state.cards.find(card => card.id === id)
    );
    
    console.log('[FortuneDraw] 抽卡完成:', state.drawnCards.map(c => c.name));
    
    return state.drawnCards;
  }

  /* ========== 区块D: 智能文案生成系统 开始 ========== */
  /* 用途: 基于雷诺曼组合语言逻辑生成个性化启示文案 */

  // 文案模板库
  const narrativeTemplates = {
    // 开场白模板（根据整体基调）
    openings: {
      positive: [
        '卡牌为你展开了一幅充满希望的画卷。',
        '命运的轮盘正朝着有利的方向转动。',
        '这是一个值得期待的时刻。',
        '星辰的排列预示着积极的转变。'
      ],
      negative: [
        '卡牌揭示了一些需要你正视的挑战。',
        '此刻，你正站在一个需要谨慎的十字路口。',
        '命运提醒你，有些事情需要被重新审视。',
        '这是一个需要勇气和智慧的时刻。'
      ],
      neutral: [
        '卡牌为你展开了一个复杂而真实的故事。',
        '命运的信息既不全然明朗，也非完全晦暗。',
        '此刻，你正处于一个转折的节点。',
        '让我们一起解读这些符号的深意。'
      ]
    },
    
    // 位置连接词
    transitions: {
      past: ['从过去的影响来看', '回溯你的来路', '曾经的经历告诉我们', '根源在于'],
      present: ['而在当下', '此时此刻', '你正面对着', '现在的状况是'],
      future: ['展望未来', '接下来', '命运指向', '趋势显示'],
      challenge: ['然而', '但需要注意', '挑战在于', '阻碍来自'],
      advice: ['因此', '建议你', '智慧的选择是', '行动的方向是']
    },
    
    // 结尾模板
    closings: {
      positive: [
        '相信自己的直觉，好运与你同在。',
        '保持开放的心态，美好正在路上。',
        '这是一个值得把握的机会。',
        '你已经走在正确的道路上。'
      ],
      negative: [
        '记住，挑战也是成长的契机。',
        '保持警觉，但不要失去信心。',
        '有时候，停下来重新思考也是一种前进。',
        '困难是暂时的，智慧是永恒的。'
      ],
      neutral: [
        '倾听内心的声音，答案就在你心中。',
        '保持平衡，顺应自然的节奏。',
        '每一步都是你人生故事的一部分。',
        '接纳当下，准备好迎接变化。'
      ]
    }
  };

  // 特殊组合规则库（基于传统雷诺曼解读）
  const specialCombinations = {
    // 格式: "卡牌1ID-卡牌2ID": { meaning: "组合含义", tone: "positive/negative/neutral" }
    "1-27": { meaning: "好消息即将以书面形式到来", tone: "positive" },
    "1-11": { meaning: "关于争吵或冲突的消息", tone: "negative" },
    "2-34": { meaning: "财运亨通，小确幸带来意外之财", tone: "positive" },
    "3-24": { meaning: "一段远距离的恋情或情感的旅程", tone: "neutral" },
    "4-5": { meaning: "家族健康与根基稳固", tone: "positive" },
    "6-7": { meaning: "复杂而混乱的局面，需要理清头绪", tone: "negative" },
    "7-24": { meaning: "复杂的情感纠葛，需要智慧处理", tone: "negative" },
    "8-17": { meaning: "旧的结束带来新的转变", tone: "neutral" },
    "9-24": { meaning: "美好的爱情，受到赞美的关系", tone: "positive" },
    "10-11": { meaning: "突然的冲突或果断的决裂", tone: "negative" },
    "12-27": { meaning: "重要的对话或书面沟通", tone: "neutral" },
    "13-24": { meaning: "纯真的爱，新恋情的开始", tone: "positive" },
    "14-34": { meaning: "工作带来的财富，商业智慧", tone: "positive" },
    "15-34": { meaning: "强大的财富力量，金融成功", tone: "positive" },
    "16-31": { meaning: "希望与成功的完美结合", tone: "positive" },
    "18-24": { meaning: "忠诚的爱情，真挚的友谊之爱", tone: "positive" },
    "21-22": { meaning: "障碍中的选择，困难的决策", tone: "negative" },
    "23-34": { meaning: "财务损耗，金钱流失", tone: "negative" },
    "24-25": { meaning: "爱情承诺，订婚或婚姻", tone: "positive" },
    "26-27": { meaning: "秘密的信息即将揭晓", tone: "neutral" },
    "28-29": { meaning: "重要的人际关系，伴侣或合作", tone: "neutral" },
    "31-34": { meaning: "巨大的成功与财富", tone: "positive" },
    "33-35": { meaning: "工作上的关键突破，确定的成功", tone: "positive" },
    "35-36": { meaning: "长期的责任与承诺", tone: "neutral" }
  };

  // 分析卡牌整体基调
  function analyzeOverallTone(cards) {
    let positiveScore = 0;
    let negativeScore = 0;
    
    // 定义正面卡牌（ID）
    const positiveCards = [1, 2, 9, 13, 16, 17, 18, 24, 25, 30, 31, 33, 34];
    // 定义负面卡牌（ID）
    const negativeCards = [6, 7, 8, 10, 11, 19, 21, 23, 36];
    
    cards.forEach(card => {
      if (positiveCards.includes(card.id)) positiveScore++;
      if (negativeCards.includes(card.id)) negativeScore++;
    });
    
    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
  }

  // 检测特殊组合
  function detectSpecialCombinations(cards) {
    const combinations = [];
    
    for (let i = 0; i < cards.length - 1; i++) {
      const key1 = `${cards[i].id}-${cards[i + 1].id}`;
      const key2 = `${cards[i + 1].id}-${cards[i].id}`; // 反向也检查
      
      if (specialCombinations[key1]) {
        combinations.push({
          cards: [cards[i], cards[i + 1]],
          ...specialCombinations[key1]
        });
      } else if (specialCombinations[key2]) {
        combinations.push({
          cards: [cards[i], cards[i + 1]],
          ...specialCombinations[key2]
        });
      }
    }
    
    return combinations;
  }

  // 根据位置解读卡牌（雷诺曼位置语义）
  function interpretCardByPosition(card, position, adjacentCards = []) {
    const positionMeanings = {
      past: {
        prefix: '过去',
        focus: 'coreEssence', // 关注本质
        template: (card) => `${card.name}揭示了过去的影响：${card.coreEssence}。`
      },
      present: {
        prefix: '当下',
        focus: 'positiveReading',
        template: (card) => `${card.name}描绘着当前的状态：${card.positiveReading}。`
      },
      future: {
        prefix: '未来',
        focus: 'modernMetaphor',
        template: (card) => `${card.name}指向未来的可能：${card.modernMetaphor}。`
      },
      challenge: {
        prefix: '挑战',
        focus: 'negativeReading',
        template: (card) => `${card.name}揭示了需要面对的挑战：${card.negativeReading}。`
      },
      advice: {
        prefix: '建议',
        focus: 'positiveReading',
        template: (card) => `${card.name}给出的行动建议是：${card.positiveReading}。`
      },
      core: {
        prefix: '核心',
        focus: 'coreEssence',
        template: (card) => `${card.name}作为核心议题：${card.coreEssence}。`
      }
    };
    
    const meaning = positionMeanings[position] || positionMeanings.present;
    return meaning.template(card);
  }

  // 生成组合叙事（雷诺曼组合语言）
  function generateCombinationNarrative(cards) {
    if (cards.length < 2) return '';
    
    // 检测特殊组合
    const specialCombs = detectSpecialCombinations(cards);
    if (specialCombs.length > 0) {
      const comb = specialCombs[0];
      return `${comb.cards[0].name}与${comb.cards[1].name}的组合揭示：${comb.meaning}。`;
    }
    
    // 通用组合解读（中心牌为主题，左右为修饰）
    if (cards.length === 3) {
      const [left, center, right] = cards;
      const leftKeyword = left.keywords[0];
      const centerKeyword = center.keywords[0];
      const rightKeyword = right.keywords[0];
      
      return `从"${leftKeyword}"的${left.name}，到"${centerKeyword}"的${center.name}，再到"${rightKeyword}"的${right.name}，这是一个关于${centerKeyword}的故事，它被${leftKeyword}所影响，并朝着${rightKeyword}的方向发展。`;
    }
    
    // 多张卡牌的流动叙事
    const keywords = cards.map(c => c.keywords[0]);
    return `这些卡牌编织出一个关于${keywords.join('、')}的复杂图景。`;
  }

  // 主文案生成函数
  function generateEnhancedInterpretation(cards, method) {
    console.log('[FortuneDraw] 生成智能文案');
    
    const tone = analyzeOverallTone(cards);
    const opening = narrativeTemplates.openings[tone][
      Math.floor(Math.random() * narrativeTemplates.openings[tone].length)
    ];
    const closing = narrativeTemplates.closings[tone][
      Math.floor(Math.random() * narrativeTemplates.closings[tone].length)
    ];
    
    let narrative = opening + '\n\n';
    
    // 根据抽卡方式生成不同结构的文案
    if (method === 'single') {
      const card = cards[0];
      narrative += `${card.name}（${card.nameEn}）为你带来的启示：\n\n`;
      narrative += `【核心本质】${card.coreEssence}\n\n`;
      narrative += `【现代启示】${card.modernMetaphor}\n\n`;
      narrative += `【正向解读】${card.positiveReading}\n\n`;
      
      if (tone === 'negative' || tone === 'neutral') {
        narrative += `【需要注意】${card.negativeReading}\n\n`;
      }
    } else if (method === 'triple') {
      // 三张牌：过去-现在-未来
      narrative += interpretCardByPosition(cards[0], 'past') + '\n\n';
      narrative += interpretCardByPosition(cards[1], 'present') + '\n\n';
      narrative += interpretCardByPosition(cards[2], 'future') + '\n\n';
      
      // 添加组合解读
      const combination = generateCombinationNarrative(cards);
      if (combination) {
        narrative += `【综合解读】${combination}\n\n`;
      }
    } else if (method === 'cross') {
      // 十字展开：核心-挑战-过去-未来-建议
      narrative += interpretCardByPosition(cards[0], 'core') + '\n\n';
      narrative += interpretCardByPosition(cards[1], 'challenge') + '\n\n';
      narrative += interpretCardByPosition(cards[2], 'past') + '\n\n';
      narrative += interpretCardByPosition(cards[3], 'future') + '\n\n';
      narrative += interpretCardByPosition(cards[4], 'advice') + '\n\n';
    }
    
    narrative += closing;
    
    return narrative;
  }

  /* ========== 区块D: 智能文案生成系统 结束 ========== */

  /* ----------------------------------------------------------
   * 区块E: 卡牌解读（更新版）
   * 用途: 根据抽卡方式生成解读文本
   * ---------------------------------------------------------- */
  function interpretCards(cards, method) {
    console.log('[FortuneDraw] 开始解读卡牌');
    
    const interpretations = {
      single: interpretSingle,
      triple: interpretTriple,
      cross: interpretCross
    };
    
    return interpretations[method](cards);
  }

  function interpretSingle(cards) {
    const card = cards[0];
    const enhancedNarrative = generateEnhancedInterpretation(cards, 'single');
    
    return {
      title: '今日运势',
      narrative: enhancedNarrative, // ✨ 新增：完整叙事文案
      sections: [
        {
          label: '核心指引',
          content: card.positiveReading
        },
        {
          label: '深层含义',
          content: card.coreEssence
        },
        {
          label: '现代启示',
          content: card.modernMetaphor
        }
      ]
    };
  }

  function interpretTriple(cards) {
    const enhancedNarrative = generateEnhancedInterpretation(cards, 'triple');
    
    return {
      title: '三卡展开',
      narrative: enhancedNarrative, // ✨ 新增：完整叙事文案
      sections: [
        {
          label: '过去影响',
          card: cards[0],
          content: `${cards[0].name}代表过去的影响：${cards[0].coreEssence}`
        },
        {
          label: '当前状态',
          card: cards[1],
          content: `${cards[1].name}揭示当前：${cards[1].positiveReading}`
        },
        {
          label: '未来趋势',
          card: cards[2],
          content: `${cards[2].name}指向未来：${cards[2].modernMetaphor}`
        },
        {
          label: '综合解读',
          content: generateCombinationNarrative(cards)
        }
      ]
    };
  }

  function interpretCross(cards) {
    const enhancedNarrative = generateEnhancedInterpretation(cards, 'cross');
    
    return {
      title: '十字展开',
      narrative: enhancedNarrative, // ✨ 新增：完整叙事文案
      sections: [
        {
          label: '核心议题',
          card: cards[0],
          content: `${cards[0].name}：${cards[0].coreEssence}`
        },
        {
          label: '面临挑战',
          card: cards[1],
          content: `${cards[1].name}：${cards[1].negativeReading}`
        },
        {
          label: '过去根源',
          card: cards[2],
          content: `${cards[2].name}：${cards[2].coreEssence}`
        },
        {
          label: '未来发展',
          card: cards[3],
          content: `${cards[3].name}：${cards[3].positiveReading}`
        },
        {
          label: '行动建议',
          card: cards[4],
          content: `${cards[4].name}：${cards[4].modernMetaphor}`
        }
      ]
    };
  }

  /* ----------------------------------------------------------
   * 区块F: 角色推荐算法
   * 用途: 基于抽卡结果推荐匹配的角色卡
   * ---------------------------------------------------------- */
  function recommendCharacters(cards) {
    console.log('[FortuneDraw] 开始推荐角色卡');
    
    // 提取所有卡牌的标签
    const allTags = cards.flatMap(card => card.characterTags);
    
    // 计算平均维度值
    const avgDimensions = calculateAverageDimensions(cards);
    
    // 为每个角色计算匹配分数
    const scoredCharacters = state.characters.map(character => {
      let score = 0;
      
      // 1. 标签匹配（40%权重）
      const tagScore = calculateTagMatch(allTags, character);
      score += tagScore * 0.4;
      
      // 2. 维度匹配（30%权重）
      const dimensionScore = calculateDimensionMatch(avgDimensions, character.matchDimensions);
      score += dimensionScore * 0.3;
      
      // 3. 雷诺曼卡亲和度（30%权重）
      const affinityScore = calculateAffinityMatch(cards, character);
      score += affinityScore * 0.3;
      
      return {
        character,
        score,
        matchReasons: generateMatchReasons(cards, character, tagScore, dimensionScore, affinityScore)
      };
    });
    
    // 排序并返回前3名
    scoredCharacters.sort((a, b) => b.score - a.score);
    const topMatches = scoredCharacters.slice(0, 3);
    
    console.log('[FortuneDraw] 推荐角色:', topMatches.map(m => m.character.name));
    
    return topMatches;
  }

  function calculateAverageDimensions(cards) {
    const dimensions = { control: 0, emotion: 0, kink: 0 };
    const count = cards.length;
    
    cards.forEach(card => {
      dimensions.control += card.matchDimensions.control || 0;
      dimensions.emotion += card.matchDimensions.emotion || 0;
      dimensions.kink += card.matchDimensions.kink || 0;
    });
    
    return {
      control: Math.round(dimensions.control / count),
      emotion: Math.round(dimensions.emotion / count),
      kink: Math.round(dimensions.kink / count)
    };
  }

  function calculateTagMatch(cardTags, character) {
    // 检查角色的各种标签字段
    const characterTags = [
      ...(character.soulTags || []),
      ...(character.coreXP || []),
      ...(character.themeTags || []),
      ...(character.emotionTags || [])
    ].map(tag => tag.toLowerCase());
    
    // 计算匹配的标签数量
    let matches = 0;
    cardTags.forEach(tag => {
      if (characterTags.some(ct => ct.includes(tag.toLowerCase()) || tag.toLowerCase().includes(ct))) {
        matches++;
      }
    });
    
    // 归一化到0-100
    return Math.min(100, (matches / cardTags.length) * 100);
  }

  function calculateDimensionMatch(cardDimensions, charDimensions) {
    if (!charDimensions) return 50; // 默认中等匹配
    
    // 计算欧几里得距离的倒数
    const distance = Math.sqrt(
      Math.pow((cardDimensions.control - charDimensions.control), 2) +
      Math.pow((cardDimensions.emotion - charDimensions.emotion), 2) +
      Math.pow((cardDimensions.kink - charDimensions.kink), 2)
    );
    
    // 最大距离约为173（100*sqrt(3)），归一化到0-100
    const maxDistance = 173;
    return Math.max(0, 100 - (distance / maxDistance) * 100);
  }

  function calculateAffinityMatch(cards, character) {
    if (!character.lenormandAffinities || character.lenormandAffinities.length === 0) {
      return 50; // 默认中等匹配
    }
    
    let totalWeight = 0;
    cards.forEach(card => {
      const affinity = character.lenormandAffinities.find(a => a.cardId === card.id);
      if (affinity) {
        totalWeight += affinity.weight;
      }
    });
    
    // 归一化（假设最高权重为100）
    return Math.min(100, totalWeight / cards.length);
  }

  function generateMatchReasons(cards, character, tagScore, dimensionScore, affinityScore) {
    const reasons = [];
    
    if (tagScore > 60) {
      reasons.push(`与你抽到的"${cards[0].name}"等卡牌气质高度契合`);
    }
    
    if (dimensionScore > 70) {
      reasons.push(`情感维度与你的运势走向完美匹配`);
    }
    
    if (affinityScore > 70) {
      reasons.push(`此角色与雷诺曼卡有特殊的命运联结`);
    }
    
    if (reasons.length === 0) {
      reasons.push(`综合来看，这是一个值得探索的缘分`);
    }
    
    return reasons;
  }

  /* ----------------------------------------------------------
   * 区块G: 历史记录
   * 用途: 保存和读取抽卡历史
   * ---------------------------------------------------------- */
  function saveDrawHistory(cards, interpretation, recommendations) {
    const history = Storage.get('fortuneHistory') || [];
    
    const record = {
      timestamp: Date.now(),
      date: new Date().toLocaleDateString('zh-CN'),
      method: state.drawMethod,
      cards: cards.map(c => ({ id: c.id, name: c.name, emoji: c.emoji })),
      interpretation: interpretation.title,
      narrative: interpretation.narrative, // ✨ 保存完整文案
      recommendations: recommendations.map(r => r.character.name)
    };
    
    history.unshift(record);
    
    // 只保留最近20条记录
    if (history.length > 20) {
      history.length = 20;
    }
    
    Storage.set('fortuneHistory', history);
    console.log('[FortuneDraw] 历史记录已保存');
  }

  function getDrawHistory() {
    return Storage.get('fortuneHistory') || [];
  }

  /* ----------------------------------------------------------
   * 区块H: UI渲染 - 选择抽卡方式
   * 用途: 渲染抽卡方式选择界面
   * ---------------------------------------------------------- */
  function renderSelectView(container) {
    container.innerHTML = `
      <div class="fortune-page">
        <div class="fortune-header">
          <h2 class="fortune-title">雷诺曼占卜</h2>
          <p class="fortune-subtitle">让古老的卡牌为你指引方向</p>
        </div>

        <div class="draw-methods">
          <div class="method-card" data-method="single">
            <div class="method-icon">🔮</div>
            <h3 class="method-name">单张抽卡</h3>
            <p class="method-desc">抽取一张卡牌，获得今日运势指引</p>
            <button class="method-btn primary-btn">开始抽卡</button>
          </div>

          <div class="method-card" data-method="triple">
            <div class="method-icon">🌟</div>
            <h3 class="method-name">三张展开</h3>
            <p class="method-desc">过去-现在-未来的时间线解读</p>
            <button class="method-btn primary-btn">开始抽卡</button>
          </div>

          <div class="method-card" data-method="cross">
            <div class="method-icon">✨</div>
                        <h3 class="method-name">十字展开</h3>
            <p class="method-desc">核心-挑战-过去-未来-建议的全面解读</p>
            <button class="method-btn primary-btn">开始抽卡</button>
          </div>
        </div>

        <div class="fortune-history">
          <h3 class="history-title">历史记录</h3>
          <div class="history-list" id="history-list">
            <!-- 历史记录动态加载 -->
          </div>
        </div>
      </div>
    `;

    // 绑定事件
    const methodBtns = container.querySelectorAll('.method-btn');
    methodBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const method = e.target.closest('.method-card').dataset.method;
        startDraw(method);
      });
    });

    // 渲染历史记录
    renderHistory(container.querySelector('#history-list'));
  }

  /* ----------------------------------------------------------
   * 区块I: UI渲染 - 抽卡动画
   * 用途: 渲染抽卡过程的动画效果
   * ---------------------------------------------------------- */
  function renderDrawingView(container, method) {
    const cardCount = method === 'single' ? 1 : method === 'triple' ? 3 : 5;
    
    container.innerHTML = `
      <div class="fortune-page drawing-page">
        <div class="drawing-animation">
          <div class="card-deck">
            <div class="card-back"></div>
            <div class="card-back"></div>
            <div class="card-back"></div>
          </div>
          <p class="drawing-text">正在为你抽取 ${cardCount} 张卡牌...</p>
        </div>
      </div>
    `;

    // 模拟抽卡延迟
    setTimeout(() => {
      const cards = drawCards(cardCount);
      const interpretation = interpretCards(cards, method);
      const recommendations = recommendCharacters(cards);
      
      // 保存历史
      saveDrawHistory(cards, interpretation, recommendations);
      
      // 显示结果
      renderResultView(container, cards, interpretation, recommendations, method);
    }, 2000);
  }

  /* ----------------------------------------------------------
   * 区块J: UI渲染 - 结果展示
   * 用途: 渲染抽卡结果和解读
   * ---------------------------------------------------------- */
  function renderResultView(container, cards, interpretation, recommendations, method) {
    // 构建卡牌展示HTML
    const cardsHTML = cards.map((card, index) => {
      let positionLabel = '';
      if (method === 'triple') {
        positionLabel = ['过去', '现在', '未来'][index];
      } else if (method === 'cross') {
        positionLabel = ['核心', '挑战', '过去', '未来', '建议'][index];
      }
      
      return `
        <div class="drawn-card" data-card-id="${card.id}">
          <div class="card-emoji">${card.emoji}</div>
          <div class="card-name">${card.name}</div>
          <div class="card-name-en">${card.nameEn}</div>
          ${positionLabel ? `<div class="card-position">${positionLabel}</div>` : ''}
          <div class="card-keywords">
            ${card.keywords.map(kw => `<span class="keyword-tag">${kw}</span>`).join('')}
          </div>
        </div>
      `;
    }).join('');

    // 构建解读章节HTML
    const sectionsHTML = interpretation.sections.map(section => `
      <div class="interpretation-section">
        <h4 class="section-label">${section.label}</h4>
        <p class="section-content">${section.content}</p>
      </div>
    `).join('');

    // 构建推荐角色HTML
    const recommendationsHTML = recommendations.map(rec => `
      <div class="recommended-character">
        <div class="character-avatar">
          ${rec.character.avatar || '👤'}
        </div>
        <div class="character-info">
          <h4 class="character-name">${rec.character.name}</h4>
          <p class="character-source">${rec.character.source || '未知来源'}</p>
          <div class="match-score">
            <div class="score-bar">
              <div class="score-fill" style="width: ${rec.score}%"></div>
            </div>
            <span class="score-text">${Math.round(rec.score)}% 匹配</span>
          </div>
          <div class="match-reasons">
            ${rec.matchReasons.map(reason => `<p class="reason-item">• ${reason}</p>`).join('')}
          </div>
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="fortune-page result-page">
        <div class="result-header">
          <h2 class="result-title">${interpretation.title}</h2>
          <button class="back-btn secondary-btn" id="back-to-select">返回</button>
        </div>

        <!-- ✨ 新增：完整叙事文案展示 -->
        <div class="narrative-section">
          <h3 class="narrative-title">✨ 启示文案</h3>
          <div class="narrative-content">
            ${interpretation.narrative.split('\n\n').map(para => 
              para.trim() ? `<p>${para}</p>` : ''
            ).join('')}
          </div>
        </div>

        <div class="drawn-cards-container">
          <h3 class="section-title">抽取的卡牌</h3>
          <div class="drawn-cards">
            ${cardsHTML}
          </div>
        </div>

        <div class="interpretation-container">
          <h3 class="section-title">详细解读</h3>
          <div class="interpretation-sections">
            ${sectionsHTML}
          </div>
        </div>

        <div class="recommendations-container">
          <h3 class="section-title">为你推荐的角色卡</h3>
          <div class="recommended-characters">
            ${recommendationsHTML}
          </div>
        </div>

        <div class="result-actions">
          <button class="action-btn primary-btn" id="draw-again">再抽一次</button>
          <button class="action-btn secondary-btn" id="save-result">保存结果</button>
          <button class="action-btn secondary-btn" id="share-result">分享</button>
        </div>
      </div>
    `;

    // 绑定事件
    container.querySelector('#back-to-select').addEventListener('click', () => {
      state.currentView = 'select';
      renderSelectView(container);
    });

    container.querySelector('#draw-again').addEventListener('click', () => {
      startDraw(method);
    });

    container.querySelector('#save-result').addEventListener('click', () => {
      alert('结果已保存到历史记录！');
    });

    container.querySelector('#share-result').addEventListener('click', () => {
      shareResult(cards, interpretation);
    });

    // 为角色卡添加点击事件
    container.querySelectorAll('.recommended-character').forEach((el, index) => {
      el.addEventListener('click', () => {
        const character = recommendations[index].character;
        showCharacterDetail(character);
      });
    });
  }

  /* ----------------------------------------------------------
   * 区块K: UI渲染 - 历史记录
   * 用途: 渲染抽卡历史列表
   * ---------------------------------------------------------- */
  function renderHistory(container) {
    const history = getDrawHistory();
    
    if (history.length === 0) {
      container.innerHTML = '<p class="empty-history">暂无历史记录</p>';
      return;
    }

    container.innerHTML = history.slice(0, 5).map(record => `
      <div class="history-item">
        <div class="history-date">${record.date}</div>
        <div class="history-cards">
          ${record.cards.map(c => `<span class="history-card-emoji">${c.emoji}</span>`).join('')}
        </div>
        <div class="history-title">${record.interpretation}</div>
      </div>
    `).join('');
  }

  /* ----------------------------------------------------------
   * 区块L: 辅助功能
   * 用途: 分享、角色详情等辅助功能
   * ---------------------------------------------------------- */
  function shareResult(cards, interpretation) {
    const text = `我在 webvb 抽到了：${cards.map(c => c.emoji + c.name).join('、')}\n\n${interpretation.narrative.substring(0, 100)}...`;
    
    if (navigator.share) {
      navigator.share({
        title: 'webvb 雷诺曼占卜结果',
        text: text
      }).catch(err => console.log('分享失败', err));
    } else {
      // 复制到剪贴板
      navigator.clipboard.writeText(text).then(() => {
        alert('结果已复制到剪贴板！');
      });
    }
  }

  function showCharacterDetail(character) {
    // TODO: 跳转到角色详情页
    console.log('[FortuneDraw] 显示角色详情:', character.name);
    // 可以触发路由跳转或显示模态框
    if (window.Router) {
      Router.navigateTo(`/character/${character.id}`);
    }
  }

  /* ----------------------------------------------------------
   * 区块M: 主流程控制
   * 用途: 控制抽卡流程
   * ---------------------------------------------------------- */
  function startDraw(method) {
    state.drawMethod = method;
    state.currentView = 'drawing';
    
    const container = document.getElementById('main-content');
    renderDrawingView(container, method);
  }

   /* ----------------------------------------------------------
   * 区块N: 公共API
   * 用途: 暴露给外部使用的接口
   * ---------------------------------------------------------- */
  async function init(container) {
    console.log('[FortuneDraw] 初始化雷诺曼抽卡系统');
    
    // 加载数据
    const success = await loadData();
    if (!success) {
      container.innerHTML = '<div class="error-message">数据加载失败，请刷新页面重试</div>';
      return;
    }

    // 渲染选择界面
    renderSelectView(container);
  }

  // 暴露公共接口
  return {
    init,
    render: init, // ✨ 修复：router.js 调用 render 方法
    drawCards,
    interpretCards,
    recommendCharacters,
    getDrawHistory,
    generateEnhancedInterpretation
  };

})();

// 挂载到全局
window.FortuneDraw = FortuneDraw;
