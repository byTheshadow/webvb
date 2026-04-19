/* ============================================================
 * 文件名: js/modules/fortune-draw.js
 * 用途: 雷诺曼卡抽卡系统 - 核心逻辑模块
 * 依赖: js/data-loader.js, js/storage.js
 * 
 * 主要功能:
 *   1. 加载雷诺曼卡数据
 *   2. 实现抽卡逻辑（单张/三张/十字）
 *   3. 解读卡牌组合
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

  /* ----------------------------------------------------------
   * 区块D: 卡牌解读
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
    return {
      title: '今日运势',
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
    return {
      title: '三卡展开',
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
          content: generateCombinedReading(cards)
        }
      ]
    };
  }

  function interpretCross(cards) {
    return {
      title: '十字展开',
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

  function generateCombinedReading(cards) {
    const themes = cards.flatMap(c => c.keywords).slice(0, 5);
    return `这三张卡牌共同编织出一个关于 ${themes.join('、')} 的故事。从${cards[0].name}的影响，到${cards[1].name}的当下，再到${cards[2].name}的未来，你正经历一段重要的转变。`;
  }

  /* ----------------------------------------------------------
   * 区块E: 角色推荐算法
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
   * 区块F: 历史记录
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
   * 区块G: UI渲染 - 选择抽卡方式
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
            <p class="method-desc">深度解析核心议题与行动建议</p>
            <button class="method-btn primary-btn">开始抽卡</button>
          </div>
        </div>

        <div class="fortune-history-section">
          <h3 class="history-title">抽卡历史</h3>
          <div class="history-list" id="history-list">
            ${renderHistoryList()}
          </div>
        </div>
      </div>
    `;

    // 绑定事件
    container.querySelectorAll('.method-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const method = e.target.closest('.method-card').dataset.method;
        startDraw(method, container);
      });
    });
  }

  function renderHistoryList() {
    const history = getDrawHistory();
    
    if (history.length === 0) {
      return '<p class="history-empty">暂无抽卡记录</p>';
    }
    
    return history.slice(0, 5).map(record => `
      <div class="history-item">
        <div class="history-date">${record.date}</div>
        <div class="history-cards">
          ${record.cards.map(c => `<span class="history-card-emoji">${c.emoji}</span>`).join('')}
        </div>
        <div class="history-method">${getMethodName(record.method)}</div>
      </div>
    `).join('');
  }

  function getMethodName(method) {
    const names = {
      single: '单张',
      triple: '三张',
      cross: '十字'
    };
    return names[method] || method;
  }

  /* ----------------------------------------------------------
   * 区块H: UI渲染 - 抽卡动画
   * 用途: 渲染抽卡过程的动画效果
   * ---------------------------------------------------------- */
  function startDraw(method, container) {
    state.drawMethod = method;
    state.currentView = 'drawing';
    
    const cardCount = method === 'single' ? 1 : method === 'triple' ? 3 : 5;
    
    container.innerHTML = `
      <div class="fortune-page">
        <div class="drawing-container">
          <h2 class="drawing-title">正在为你抽取卡牌...</h2>
          <div class="card-deck">
            ${Array(cardCount).fill(0).map((_, i) => `
              <div class="card-back card-flip-in" style="animation-delay: ${i * 0.2}s">
                <div class="card-back-pattern">🔮</div>
              </div>
            `).join('')}
          </div>
          <p class="drawing-hint">请静心冥想你的问题</p>
        </div>
      </div>
    `;

    // 2秒后显示结果
    setTimeout(() => {
      const cards = drawCards(cardCount);
      showResult(cards, container);
    }, 2000 + cardCount * 200);
  }

  /* ----------------------------------------------------------
   * 区块I: UI渲染 - 结果展示
   * 用途: 渲染抽卡结果、解读和角色推荐
   * ---------------------------------------------------------- */
  function showResult(cards, container) {
    state.currentView = 'result';
    
    const interpretation = interpretCards(cards, state.drawMethod);
    const recommendations = recommendCharacters(cards);
    
    // 保存历史
    saveDrawHistory(cards, interpretation, recommendations);
    
    container.innerHTML = `
      <div class="fortune-page">
        <div class="result-container">
          <!-- 卡牌展示 -->
          <div class="result-cards">
            <h2 class="result-title">${interpretation.title}</h2>
            <div class="cards-display ${state.drawMethod}-layout">
              ${cards.map((card, index) => `
                <div class="card-item card-reveal" style="animation-delay: ${index * 0.15}s">
                  <div class="card-emoji">${card.emoji}</div>
                  <div class="card-name">${card.name}</div>
                  <div class="card-name-en">${card.nameEn}</div>
                  <div class="card-keywords">
                    ${card.keywords.map(k => `<span class="keyword-tag">${k}</span>`).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 解读内容 -->
          <div class="interpretation-section">
            <h3 class="section-title">卡牌解读</h3>
            ${interpretation.sections.map(section => `
              <div class="interpretation-item">
                <h4 class="interpretation-label">${section.label}</h4>
                <p class="interpretation-content">${section.content}</p>
              </div>
            `).join('')}
          </div>

          <!-- 角色推荐 -->
          <div class="recommendation-section">
            <h3 class="section-title">命运推荐的角色卡</h3>
            <p class="recommendation-intro">根据你的抽卡结果，这些角色与你有特殊的缘分</p>
            <div class="character-recommendations">
              ${recommendations.map((rec, index) => `
                <div class="character-card card-appear" style="animation-delay: ${index * 0.1}s">
                  <div class="character-rank">#${index + 1}</div>
                  <div class="character-info">
                    <h4 class="character-name">${rec.character.name}</h4>
                    <p class="character-creator">by ${rec.character.creator}</p>
                    <p class="character-oneliner">${rec.character.oneLiner || '探索这个角色的故事'}</p>
                    <div class="character-tags">
                      ${(rec.character.soulTags || []).slice(0, 3).map(tag => 
                        `<span class="soul-tag">${tag}</span>`
                      ).join('')}
                    </div>
                    <div class="match-reasons">
                      ${rec.matchReasons.map(reason => 
                        `<p class="match-reason">✨ ${reason}</p>`
                      ).join('')}
                    </div>
                    <div class="match-score">
                      <span class="score-label">匹配度</span>
                      <div class="score-bar">
                        <div class="score-fill" style="width: ${rec.score}%"></div>
                      </div>
                      <span class="score-value">${Math.round(rec.score)}%</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="result-actions">
            <button class="secondary-btn" id="draw-again-btn">再抽一次</button>
            <button class="primary-btn" id="save-result-btn">保存结果</button>
          </div>
        </div>
      </div>
    `;

    // 绑定事件
    container.querySelector('#draw-again-btn').addEventListener('click', () => {
      render(container);
    });

    container.querySelector('#save-result-btn').addEventListener('click', () => {
      alert('结果已保存到历史记录！');
    });
  }

  /* ----------------------------------------------------------
   * 区块J: 主渲染函数
   * 用途: 模块入口，初始化并渲染界面
   * ---------------------------------------------------------- */
  async function render(container) {
    console.log('[FortuneDraw] 开始渲染');
    
    // 显示加载状态
    container.innerHTML = `
      <div class="fortune-page">
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p class="loading-text">正在准备卡牌...</p>
        </div>
      </div>
    `;

    // 加载数据
    if (!state.isLoaded) {
      const success = await loadData();
      if (!success) {
        container.innerHTML = `
          <div class="fortune-page">
            <div class="error-container">
              <h2>⚠️ 加载失败</h2>
              <p>无法加载雷诺曼卡数据，请刷新页面重试</p>
              <button class="primary-btn" onclick="location.reload()">刷新页面</button>
            </div>
          </div>
        `;
        return;
      }
    }

    // 渲染选择界面
    renderSelectView(container);
  }

  /* ----------------------------------------------------------
   * 区块K: 公共API
   * 用途: 暴露给外部使用的接口
   * ---------------------------------------------------------- */
  return {
    render,
    getDrawHistory,
    drawCards,
    recommendCharacters
  };

})();

// 将模块挂载到全局
window.FortuneDraw = FortuneDraw;

