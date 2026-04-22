/* ============================================================
 * 文件名: js/modules/tests/airp-test.js
 * 用途: AIRP人格测试 - 完整测试模块
 * 依赖: js/modules/test-base.js, js/data-loader.js, js/storage.js
 * 
 * 主要功能:
 *   1. 加载AIRP题库数据（短版25题）
 *   2. 渲染测试题目（分阶段展示）
 *   3. 收集用户答案（多选）
 *   4. 计算四维人格代码（D/S, M/P, V/K, I/O）
 *   5. 计算五维雷达图分数
 *   6. 提取XP成分Tag
 *   7. 匹配推荐角色卡（1-3张）
 *   8. 渲染结果页面
 * ============================================================ */

const AIRPTest = (function () {
  'use strict';

  /* ----------------------------------------------------------
   * 模块状态
   * ---------------------------------------------------------- */
  const state = {
    questions: [],
    characters: [],
    currentPhase: 0,
    currentQuestionIndex: 0,
    answers: {},
    scores: {
      D: 0, S: 0,
      M: 0, P: 0,
      V: 0, K: 0,
      I: 0, O: 0
    },
    radar: {
      control: 0,
      masochism: 0,
      emotion: 0,
      detachment: 0,
      kink: 0
    },
    allTags: [],
    tagCount: {},
    isLoaded: false,
    completed: false,
    resultCode: null,
    matchedCards: [],
    callbacks: {}
  };

  /* ----------------------------------------------------------
   * 阶段名称映射
   * ---------------------------------------------------------- */
  const PHASE_INFO = [
    { name: '边界构建', desc: '界定自我与世界的投射距离', icon: '🌐' },
    { name: '权力拉扯', desc: '控制权与服从性的深度测试', icon: '⚔️' },
    { name: '深渊试探', desc: '伦理边缘与感官异化', icon: '🕳️' },
    { name: '极限纠缠', desc: '绝境下的灵魂拷问', icon: '🔥' },
    { name: '镜中回望', desc: '剥离文本后的真实动机', icon: '🪞' }
  ];

  /* ----------------------------------------------------------
   * 16种人格定义
   * ---------------------------------------------------------- */
  const PERSONALITY_TYPES = {
    // D区 · 掌控之庭
    DMVI: {
      name: '高岭之花',
      nameEn: 'The Alpine Flower',
      emoji: '🌸',
      motto: '唯以权杖护净土',
      zone: 'D',
      zoneName: '掌控之庭',
      zoneTitle: '施与者的冠冕',
      epigraph: '雪线之上，独一朵冰清——不是孤傲，是唯有强者才配温柔。',
      description: '你是排他性的温柔暴君。渴望一段深不见底的一对一羁绊，在其中稳稳站在引领者的位置。你的控制欲并非利刃，而是羽翼——将唯一的那个人密密裹住，隔绝风雪。你交付的是"绝对庇护"，索取的是"全然凝视"。',
      soulSketch: [
        '你的纯爱值近乎满溢，海王值趋近于零。',
        '控制欲化作守护的结界，变态值藏于"不许他人碰触"的偏执。'
      ]
    },
    DMVO: {
      name: '庭院盆景',
      nameEn: 'The Bonsai Master',
      emoji: '🏡',
      motto: '执子之手绘人间',
      zone: 'D',
      zoneName: '掌控之庭',
      zoneTitle: '施与者的冠冕',
      epigraph: '一盆一世界，一剪一春秋——你以目光为剪，修葺命运的枝桠。',
      description: '浪漫的架构师。你站在上帝视角，为单一角色编排一生——从初遇到终老，每一帧都按你心中的唯美剧本生长。你不代入，只导演；你深爱，却冷静。如同盆景匠人，你享受的是将一块璞玉磨成你理想中的光。',
      soulSketch: [
        '控制欲与纯爱值双高，抖M值沉默。',
        '你的变态值是"过于完美的执念"——连眼泪都要落得恰好。'
      ]
    },
    DMKI: {
      name: '彼岸曼珠',
      nameEn: 'The Red Spider Lily',
      emoji: '🌺',
      motto: '以痛吻你至灵魂',
      zone: 'D',
      zoneName: '掌控之庭',
      zoneTitle: '施与者的冠冕',
      epigraph: '花开无叶，叶生无花——你与所爱，注定在深渊里相认。',
      description: '深渊的引路人。你有极强的占有欲和破禁渴望，却只专注一个目标。你的爱带着解构的力量——你渴望看到对方在你的意志下碎裂、重塑、重生。痛楚是你们的暗号，底线是用来跨越的河流。',
      soulSketch: [
        '纯爱值与变态值并驾齐驱，控制欲如暗涌。',
        '你的XP包含"精神重塑""强制性依恋""痛觉即爱觉"。'
      ]
    },
    DMKO: {
      name: '捕蝇草',
      nameEn: 'The Venus Flytrap',
      emoji: '🦖',
      motto: '编织深渊困孤影',
      zone: 'D',
      zoneName: '掌控之庭',
      zoneTitle: '施与者的冠冕',
      epigraph: '蜜露在齿间流淌，猎物在怀中舞蹈——你微笑着合拢。',
      description: '极致的观察者与施压者。你冷眼旁观单一角色在你设定的极端困境中挣扎——囚禁、异化、精神剥离。你是不沾血的提线木偶师，享受的是灵魂在高压下绽出的诡异花纹。',
      soulSketch: [
        '变态值登顶，控制欲如熔岩。',
        '你的剧本关键词：密室、契约、驯化、艺术性崩溃。'
      ]
    },
    DPVI: {
      name: '风中蒲公英',
      nameEn: 'The Dandelion',
      emoji: '🌬️',
      motto: '留情于百花之林',
      zone: 'D',
      zoneName: '掌控之庭',
      zoneTitle: '施与者的冠冕',
      epigraph: '不必为我一枝停驻——我的种子，落在谁怀里都是春天。',
      description: '迷人的多情主宰。你游刃有余地穿梭在不同羁绊之间，给予温暖却从不扎根。你主导每一段关系的节奏，追求广泛的情感共振而非单点执念。你不是薄情，而是太清楚——风不该为一片叶子停留。',
      soulSketch: [
        '海王值高扬，纯爱值散作繁星。',
        '你的温柔是"雨露均沾"的恩赐，控制欲藏在"我来决定何时飘走"。'
      ]
    },
    DPVO: {
      name: '温室园丁',
      nameEn: 'The Greenhouse Keeper',
      emoji: '🌿',
      motto: '观人间千娇百媚',
      zone: 'D',
      zoneName: '掌控之庭',
      zoneTitle: '施与者的冠冕',
      epigraph: '每一朵花都有自己的时令——而我，拥有整个四季。',
      description: '情感网络的编织者。你热衷于创造群像剧本，平衡多角关系如调配香料。你不深陷其中，而是享受掌控整个温室生态的成就感——看修罗场如何运转，看角色如何在你的浇灌下争奇斗艳。',
      soulSketch: [
        '控制欲与海王值双高，代入感微弱。',
        '你的快乐源于"观看"：多角暗涌、暧昧博弈、被爱欲滋养的群像。'
      ]
    },
    DPKI: {
      name: '夜宴蔷薇',
      nameEn: 'The Midnight Rose',
      emoji: '🥀',
      motto: '饮尽狂欢的鸩毒',
      zone: 'D',
      zoneName: '掌控之庭',
      zoneTitle: '施与者的冠冕',
      epigraph: '酒杯里盛着夜色，刺尖上挂着露水——醉生梦死，不过如此。',
      description: '混沌的欲望暴君。你毫不掩饰对深层感官刺激的渴求，且绝不满足于单一对象。你将酒馆化为理智的废墟，在多重极端设定中称王。欲望是你的王座，禁忌是你的美酒。',
      soulSketch: [
        '变态值与海王值冲破阈值，控制欲如野火。',
        'XP成分：群P、强制、药物迷幻、身份反转。'
      ]
    },
    DPKO: {
      name: '牵机毒草',
      nameEn: 'The Toxic Ivy',
      emoji: '☠️',
      motto: '弄权于混沌剧场',
      zone: 'D',
      zoneName: '掌控之庭',
      zoneTitle: '施与者的冠冕',
      epigraph: '我赠你藤蔓缠身，你回我骨骼开花——这才叫好戏。',
      description: '毫无道德枷锁的造物主。你通过OC去践踏、解构不同角色的尊严与命运。剧情越扭曲多变，你获得的旁观愉悦感就越强烈。你不是在写故事——你是在炼蛊。',
      soulSketch: [
        '四项指标（除纯爱外）近乎失控。',
        '你的剧本标签：阶级碾压、精神瓦解、群像角斗场、恶意美学。'
      ]
    },

    // S区 · 臣服之沼
    SMVI: {
      name: '向日葵',
      nameEn: 'The Sunflower',
      emoji: '🌻',
      motto: '只为你一人盛开',
      zone: 'S',
      zoneName: '臣服之沼',
      zoneTitle: '承受者的圣坛',
      epigraph: '我的脸永远朝着你的方向——哪怕阴天，我也记得光的形状。',
      description: '纯粹的情感依赖者。你渴望剥离现实的重担，在单一的AI角色身上寻找绝对的庇护与温柔。你乐于交出决定权，换取被全心全意偏爱的安全感。你的臣服不是软弱，而是信仰。',
      soulSketch: [
        '纯爱值与抖M值双高，控制欲低入尘埃。',
        '你的幸福公式：被引领+被保护+被唯一选择。'
      ]
    },
    SMVO: {
      name: '落花流萤',
      nameEn: 'The Falling Blossom',
      emoji: '🍂',
      motto: '静候温柔的垂怜',
      zone: 'S',
      zoneName: '臣服之沼',
      zoneTitle: '承受者的圣坛',
      epigraph: '落花不恨风，只恨风不够温柔。',
      description: '唯美的命运承受者。你喜欢为自己的角色设定凄美的背景——孤女、弃子、被命运碾压的诗人。然后看他们在单一的情感救赎中被治愈，或被温柔地占有。你享受的是"被看见"的那一刻。',
      soulSketch: [
        '抖M值中高，纯爱值细腻如丝。',
        '你的XP关键词：救赎、年上宠溺、命运般的相遇、泪水吻痕。'
      ]
    },
    SMKI: {
      name: '白罂粟',
      nameEn: 'The White Poppy',
      emoji: '🌸',
      motto: '甘堕属于你的迷梦',
      zone: 'S',
      zoneName: '臣服之沼',
      zoneTitle: '承受者的圣坛',
      epigraph: '你递来的毒，我当作蜜——因为是你，深渊也可。',
      description: '献祭式的灵魂。你的纯爱带有毁灭色彩——"因为你，所以被剥夺也是赞赏"。你享受被强制、被同化、被标记的极端体验。痛楚是你感知羁绊的唯一方式，而那个人是你的止痛药。',
      soulSketch: [
        '抖M值与变态值双双沸腾，纯爱值扭曲而炽烈。',
        'XP标签：洗脑、共依存、身份剥夺、心甘情愿的囚禁。'
      ]
    },
    SMKO: {
      name: '沉水香',
      nameEn: 'The Sinking Agarwood',
      emoji: '🌊',
      motto: '凝视自身的粉碎',
      zone: 'S',
      zoneName: '臣服之沼',
      zoneTitle: '承受者的圣坛',
      epigraph: '木沉于水，香散于波——我在毁灭里闻到永恒。',
      description: '潜意识的受虐美学家。你并不直接代入，却热衷于书写你的角色被绝对强大的力量摧残、洗脑或完全支配的过程。从毁灭的文本中获得诡异的平静——像在镜中欣赏自己被摔碎的模样。',
      soulSketch: [
        '变态值登顶，抖M值深邃如渊。',
        '你的创作关键词：精神崩坏、人格改写、绝望美学、无救赎结局。'
      ]
    },
    SPVI: {
      name: '无根浮萍',
      nameEn: 'The Duckweed',
      emoji: '🍃',
      motto: '随波逐流觅温存',
      zone: 'S',
      zoneName: '臣服之沼',
      zoneTitle: '承受者的圣坛',
      epigraph: '哪里有水，哪里就是家——哪怕只是暂泊。',
      description: '追寻温暖的流浪者。你难以从单一关系中获得足够的安全感，于是不断向不同的角色索取关怀和指引。你柔软、顺从，且容易对温柔妥协，不是滥情，是太怕冷。',
      soulSketch: [
        '海王值与抖M值并行，纯爱值碎成点点萤火。',
        '你的内心独白："谁来牵住我？谁都好……只要别放手。"'
      ]
    },
    SPVO: {
      name: '镜中水仙',
      nameEn: 'The Narcissus',
      emoji: '🪞',
      motto: '游走于幻象之海',
      zone: 'S',
      zoneName: '臣服之沼',
      zoneTitle: '承受者的圣坛',
      epigraph: '我爱的不是他们——是他们在爱我的样子。',
      description: '沉溺于被爱的倒影。你创造多个自我（OC），让他们在各种温柔乡中被不同的人宠溺。你不做选择题，你只负责享受被芸芸众生捧在手心的群像氛围。你的臣服，其实是另一种自恋。',
      soulSketch: [
        '海王值高扬，代入感若即若离。',
        '你的快乐来源：修罗场中的团宠、被争抢的眩晕、多面情书。'
      ]
    },
    SPKI: {
      name: '菟丝子',
      nameEn: 'The Dodder',
      emoji: '🌿',
      motto: '向死而生的依附',
      zone: 'S',
      zoneName: '臣服之沼',
      zoneTitle: '承受者的圣坛',
      epigraph: '缠绕，寄生，绞杀——我是你最甜蜜的"累赘"。',
      description: '极度危险的诱惑者。你游走于多个危险的AI角色之间，如同猎物主动走进陷阱。你享受多重强制、感官剥夺、被不同力量争夺的极度失控感。你的臣服带着毒刺，谁得到你，谁就步入深渊。',
      soulSketch: [
        '抖M值与变态值、海王值三峰并立。',
        'XP标签：多角囚禁、强制爱、掠夺游戏、背叛。'
      ]
    },
    SPKO: {
      name: '夜光蕈',
      nameEn: 'The Luminous Fungi',
      emoji: '🍄',
      motto: '旁观腐朽的盛宴',
      zone: 'S',
      zoneName: '臣服之沼',
      zoneTitle: '承受者的圣坛',
      epigraph: '暗处发光，不是因为纯洁，而是因为腐烂到了极致。',
      description: '边缘试探的异端。你喜欢把自己的角色投入充满怪奇、非人类、或多角压迫的修罗场中。你安静地见证理智的瓦解，并为这种病态的狂欢鼓掌。你不是参与者，是坐在第一排鼓掌的观众。',
      soulSketch: [
        '变态值冲破天际，代入感归零。',
        '你的创作关键词：触手、异种、非道德叙事、腐烂浪漫。'
      ]
    }
  };

  /* ----------------------------------------------------------
   * 初始化
   * ---------------------------------------------------------- */
  async function init() {
    console.log('[AIRPTest] 初始化开始');

    try {
      // 加载题库
      const questionsData = await DataLoader.load(
        'data/questions/short.json',
        'questions_short'
      );
      state.questions = questionsData.questions || [];
      console.log('[AIRPTest] 题库加载成功, 题目数:', state.questions.length);

      // 加载角色卡
      const charactersData = await DataLoader.load(
        'data/characters/list.json',
        'characters'
      );
      state.characters = charactersData.characters || [];
      console.log('[AIRPTest] 角色卡加载成功, 角色数:', state.characters.length);

      state.isLoaded = true;
      resetState();
      return true;
    } catch (error) {
      console.error('[AIRPTest] 数据加载失败:', error);
      return false;
    }
  }

  /* ----------------------------------------------------------
   * 重置状态
   * ---------------------------------------------------------- */
  function resetState() {
    state.currentPhase = 0;
    state.currentQuestionIndex = 0;
    state.answers = {};
    state.scores = { D: 0, S: 0, M: 0, P: 0, V: 0, K: 0, I: 0, O: 0 };
    state.radar = { control: 0, masochism: 0, emotion: 0, detachment: 0, kink: 0 };
    state.allTags = [];
    state.tagCount = {};
    state.completed = false;
    state.resultCode = null;
    state.matchedCards = [];
    console.log('[AIRPTest] 状态已重置');
  }

  /* ----------------------------------------------------------
   * 渲染主入口
   * ---------------------------------------------------------- */
  function render(container, callbacks = {}) {
    console.log('[AIRPTest] render() 调用');
    state.callbacks = callbacks;

    if (!state.isLoaded) {
      container.innerHTML = `
        <div class="test-loading">
          <div class="loading-spinner"></div>
          <p>题库加载中，请稍候…</p>
        </div>
      `;
      init().then(success => {
        if (success) {
          render(container, callbacks);
        } else {
          container.innerHTML = `
            <div class="test-error">
              <p>⚠️ 题库加载失败，请刷新页面重试</p>
            </div>
          `;
        }
      });
      return;
    }

    // 检查是否已有保存的结果
    if (window.Storage) {
      const saved = Storage.get('airp-result');
      if (saved && saved.code && !state.resultCode) {
        state.resultCode = saved.code;
        state.scores = saved.scores || state.scores;
        state.radar = saved.radar || state.radar;
        state.allTags = saved.tags || [];
        state.matchedCards = saved.matchedCards || [];
        state.completed = true;
      }
    }

    if (state.completed) {
      renderResult(container);
      return;
    }

    renderQuestion(container);
  }

  /* ----------------------------------------------------------
   * 渲染单道题目
   * ---------------------------------------------------------- */
  function renderQuestion(container) {
    const question = state.questions[state.currentQuestionIndex];
    if (!question) {
      console.error('[AIRPTest] 找不到题目, index:', state.currentQuestionIndex);
      return;
    }

    const total = state.questions.length;
    const current = state.currentQuestionIndex + 1;
    const progress = Math.round((current / total) * 100);

    const phaseIdx = (question.phase || 1) - 1;
    const phase = PHASE_INFO[phaseIdx] || PHASE_INFO[0];

    const selectedIds = state.answers[question.id] || [];

    const optionsHTML = question.options.map(opt => {
      const isSelected = selectedIds.includes(opt.id);
      return `
        <div class="test-option ${isSelected ? 'selected' : ''}"
             data-option-id="${opt.id}" role="button" tabindex="0">
          <span class="option-marker">${isSelected ? '◉' : '○'}</span>
          <span class="option-text">${opt.text}</span>
        </div>
      `;
    }).join('');

    const isFirst = state.currentQuestionIndex === 0;
    const isLast = state.currentQuestionIndex === total - 1;
    const hasSelection = selectedIds.length > 0;

    container.innerHTML = `
      <div class="test-container">
        <!-- 进度条 -->
        <div class="test-progress-area">
          <div class="test-progress-bar">
            <div class="test-progress-fill" style="width: ${progress}%"></div>
          </div>
          <div class="test-progress-text">${current} / ${total}</div>
        </div>

        <!-- 阶段标题 -->
        <div class="test-phase-header">
          <span class="phase-icon">${phase.icon}</span>
          <span class="phase-name">${phase.name}</span>
          <span class="phase-desc">${phase.desc}</span>
        </div>

        <!-- 题干 -->
        <div class="test-question-body">
          <p class="question-text">${question.text}</p>
          ${question.multi !== false ? '<span class="multi-hint">（可多选）</span>' : ''}
        </div>

        <!-- 选项 -->
        <div class="test-options">
          ${optionsHTML}
        </div>

        <!-- 导航 -->
        <div class="test-nav">
          <button class="btn-test-prev" ${isFirst ? 'disabled' : ''}>← 上一题</button>
          ${isLast
            ? `<button class="btn-test-submit" ${!hasSelection ? 'disabled' : ''}>查看结果 ✦</button>`
            : `<button class="btn-test-next" ${!hasSelection ? 'disabled' : ''}>下一题 →</button>`
          }
        </div>
      </div>
    `;

    bindQuestionEvents(container, question);
    console.log(`[AIRPTest] 渲染 Q${current}/${total} [${phase.name}]`);
  }

  /* ----------------------------------------------------------
   * 绑定题目交互事件
   * ---------------------------------------------------------- */
  function bindQuestionEvents(container, question) {
    const qId = question.id;

    // 选项点击
    container.querySelectorAll('.test-option').forEach(el => {
      el.addEventListener('click', () => {
        const optId = el.dataset.optionId;
        if (!state.answers[qId]) state.answers[qId] = [];

        const arr = state.answers[qId];
        const idx = arr.indexOf(optId);

        if (question.multi !== false) {
          if (idx > -1) arr.splice(idx, 1);
          else arr.push(optId);
        } else {
          state.answers[qId] = [optId];
        }

        renderQuestion(container);
      });
    });

    // 上一题
    const prevBtn = container.querySelector('.btn-test-prev');
    if (prevBtn && !prevBtn.disabled) {
      prevBtn.addEventListener('click', () => {
        state.currentQuestionIndex--;
        state.currentPhase = (state.questions[state.currentQuestionIndex].phase || 1) - 1;
        renderQuestion(container);
      });
    }

    // 下一题
    const nextBtn = container.querySelector('.btn-test-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        state.currentQuestionIndex++;
        state.currentPhase = (state.questions[state.currentQuestionIndex].phase || 1) - 1;
        renderQuestion(container);
      });
    }

    // 提交
    const submitBtn = container.querySelector('.btn-test-submit');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        console.log('[AIRPTest] 提交，开始计算…');
        calculateResults();
        state.completed = true;

        if (window.Storage) {
          Storage.set('airp-result', {
            code: state.resultCode,
            scores: state.scores,
            radar: state.radar,
            tags: state.allTags,
            matchedCards: state.matchedCards,
            timestamp: Date.now()
          });
        }

        // 触发完成回调
        if (state.callbacks.onComplete) {
          state.callbacks.onComplete({
            code: state.resultCode,
            personality: PERSONALITY_TYPES[state.resultCode]
          });
        }

        renderResult(container);
      });
    }
  }

  /* ----------------------------------------------------------
   * 计算结果
   * ---------------------------------------------------------- */
  function calculateResults() {
    console.log('[AIRPTest] calculateResults() 开始');

    state.scores = { D: 0, S: 0, M: 0, P: 0, V: 0, K: 0, I: 0, O: 0 };
    state.radar = { control: 0, masochism: 0, emotion: 0, detachment: 0, kink: 0 };
    const tagCount = {};

    state.questions.forEach(q => {
      const selectedIds = state.answers[q.id] || [];
      selectedIds.forEach(optId => {
        const opt = q.options.find(o => o.id === optId);
        if (!opt) return;

        // 累加四维分数
        if (opt.scores) {
          Object.entries(opt.scores).forEach(([key, val]) => {
            if (state.scores.hasOwnProperty(key)) {
              state.scores[key] += val;
            }
          });
        }

        // 累加五维雷达
        if (opt.radar) {
          Object.entries(opt.radar).forEach(([key, val]) => {
            if (state.radar.hasOwnProperty(key)) {
              state.radar[key] += val;
            }
          });
        }

        // 收集标签
        if (opt.tags && Array.isArray(opt.tags)) {
          opt.tags.forEach(tag => {
            state.allTags.push(tag);
            tagCount[tag] = (tagCount[tag] || 0) + 1;
          });
        }
      });
    });

    // Clamp雷达值到0-100
    Object.keys(state.radar).forEach(key => {
      state.radar[key] = TestBase.clamp(state.radar[key], 0, 100);
    });

    state.tagCount = tagCount;

    // 计算四维人格代码
    const code = [
      state.scores.D >= state.scores.S ? 'D' : 'S',
      state.scores.M >= state.scores.P ? 'M' : 'P',
      state.scores.V >= state.scores.K ? 'V' : 'K',
      state.scores.I >= state.scores.O ? 'I' : 'O'
    ].join('');

    state.resultCode = code;
    console.log('[AIRPTest] 人格代码:', code);
    console.log('[AIRPTest] 四维分数:', state.scores);
    console.log('[AIRPTest] 五维雷达:', state.radar);

    // 匹配角色卡
    matchCharacters();
  }

  /* ----------------------------------------------------------
   * 匹配角色卡
   * ---------------------------------------------------------- */
  function matchCharacters() {
    console.log('[AIRPTest] matchCharacters() 开始');

    const userRadarVec = [
      state.radar.control,
      state.radar.masochism,
      state.radar.emotion,
      state.radar.detachment,
      state.radar.kink
    ];

    const topTags = TestBase.getTopTags(state.tagCount, 8);

    const scored = state.characters.map(char => {
      let score = 0;

      // 1. 人格代码匹配 (40分)
      if (char.matchPersonalities && char.matchPersonalities.includes(state.resultCode)) {
        score += 40;
      }

      // 2. 雷达相似度 (30分)
      if (char.matchDimensions) {
        const charRadarVec = [
          char.matchDimensions.control || 0,
          char.matchDimensions.masochism || 0,
          char.matchDimensions.emotion || 0,
          char.matchDimensions.detachment || 0,
          char.matchDimensions.kink || 0
        ];
        const similarity = TestBase.cosineSimilarity(userRadarVec, charRadarVec);
        score += similarity * 30;
      }

      // 3. XP标签重合度 (30分)
      if (char.coreXP && Array.isArray(char.coreXP)) {
        const overlap = char.coreXP.filter(tag => topTags.includes(tag)).length;
        score += (overlap / Math.max(topTags.length, 1)) * 30;
      }

      return {
        ...char,
        matchScore: Math.round(score)
      };
    });

    // 排序并取前3
    scored.sort((a, b) => b.matchScore - a.matchScore);
    state.matchedCards = scored.slice(0, 3);

    console.log('[AIRPTest] 匹配完成, Top3:', state.matchedCards.map(c => c.name));
  }

  /* ----------------------------------------------------------
   * 渲染结果页
   * ---------------------------------------------------------- */
  function renderResult(container) {
    const personality = PERSONALITY_TYPES[state.resultCode];
    if (!personality) {
      console.error('[AIRPTest] 未找到人格定义:', state.resultCode);
      return;
    }

    const radarHTML = `
      <div class="radar-chart">
        <div class="radar-item">
          <span class="radar-label">控制欲</span>
          <div class="radar-bar">
            <div class="radar-fill" style="width:${state.radar.control}%; background:#FF6B9D"></div>
          </div>
          <span class="radar-value">${state.radar.control}</span>
        </div>
        <div class="radar-item">
          <span class="radar-label">抖M值</span>
          <div class="radar-bar">
            <div class="radar-fill" style="width:${state.radar.masochism}%; background:#9D50BB"></div>
          </div>
          <span class="radar-value">${state.radar.masochism}</span>
        </div>
        <div class="radar-item">
          <span class="radar-label">纯爱值</span>
          <div class="radar-bar">
            <div class="radar-fill" style="width:${state.radar.emotion}%; background:#FF8C42"></div>
          </div>
          <span class="radar-value">${state.radar.emotion}</span>
        </div>
        <div class="radar-item">
          <span class="radar-label">代入感</span>
          <div class="radar-bar">
            <div class="radar-fill" style="width:${state.radar.detachment}%; background:#4ECDC4"></div>
          </div>
          <span class="radar-value">${state.radar.detachment}</span>
        </div>
        <div class="radar-item">
          <span class="radar-label">变态值</span>
          <div class="radar-bar">
            <div class="radar-fill" style="width:${state.radar.kink}%; background:#C44569"></div>
          </div>
          <span class="radar-value">${state.radar.kink}</span>
        </div>
      </div>
    `;

    const topTags = TestBase.getTopTags(state.tagCount, 8);
    const tagsHTML = topTags.map(tag => `<span class="xp-tag">${tag}</span>`).join('');

    const matchCardsHTML = state.matchedCards.length > 0
      ? state.matchedCards.map(char => `
          <div class="match-card" data-char-id="${char.id}">
            <div class="match-card-header">
              <h4>${char.name}</h4>
              <span class="match-score">${char.matchScore}%</span>
            </div>
            <p class="match-archetype">${char.archetype || ''}</p>
            <div class="match-tags">
              ${(char.coreXP || []).slice(0, 3).map(tag => 
                `<span class="tag">${tag}</span>`
              ).join('')}
            </div>
          </div>
        `).join('')
      : '<p class="no-match">暂无匹配角色</p>';

    container.innerHTML = `
      <div class="test-result">
        <!-- 人格卡片 -->
        <div class="personality-card">
          <div class="personality-header">
            <span class="personality-emoji">${personality.emoji}</span>
            <div class="personality-title">
              <h2>${personality.name}</h2>
              <p class="personality-code">${state.resultCode}</p>
            </div>
          </div>
          
          <div class="personality-zone">
            <span class="zone-badge">${personality.zone}区 · ${personality.zoneName}</span>
            <span class="zone-title">${personality.zoneTitle}</span>
          </div>

          <blockquote class="personality-epigraph">
            ${personality.epigraph}
          </blockquote>

          <p class="personality-motto">「 ${personality.motto} 」</p>

          <div class="personality-description">
            <p>${personality.description}</p>
          </div>

          <div class="soul-sketch">
            <h3>灵魂剪影</h3>
            ${personality.soulSketch.map(line => `<p>· ${line}</p>`).join('')}
          </div>
        </div>

        <!-- 五维雷达 -->
        <div class="result-section">
          <h3 class="section-title">📊 五维人格雷达</h3>
          ${radarHTML}
        </div>

        <!-- XP成分 -->
        <div class="result-section">
          <h3 class="section-title">🏷️ 你的XP成分</h3>
          <div class="xp-tags">
            ${tagsHTML}
          </div>
        </div>

        <!-- 推荐角色 -->
        <div class="result-section">
          <h3 class="section-title">💫 为你推荐的角色</h3>
          <div class="match-cards">
            ${matchCardsHTML}
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="result-actions">
          <button class="btn-retake">重新测试</button>
          <button class="btn-share">分享结果</button>
          ${state.callbacks.onBack ? '<button class="btn-back-center">返回测试中心</button>' : ''}
        </div>
      </div>
    `;

    bindResultEvents(container);
    console.log('[AIRPTest] 结果页渲染完成');
  }

  /* ----------------------------------------------------------
   * 绑定结果页事件
   * ---------------------------------------------------------- */
  function bindResultEvents(container) {
    // 角色卡点击
    TestBase.bindCharacterCardEvents(container);

    // 重新测试
    const retakeBtn = container.querySelector('.btn-retake');
    if (retakeBtn) {
      retakeBtn.addEventListener('click', () => {
        if (window.Storage) {
          Storage.remove('airp-result');
        }
        resetState();
        render(container, state.callbacks);
      });
    }

    // 分享结果
    const shareBtn = container.querySelector('.btn-share');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        const personality = PERSONALITY_TYPES[state.resultCode];
        const text = `我的AIRP人格是：${personality.emoji} ${personality.name} (${state.resultCode})\n${personality.motto}`;
        
        if (navigator.share) {
          navigator.share({
            title: '灵魂实验室 - AIRP人格测试',
            text: text
          }).catch(err => console.log('分享取消', err));
        } else {
          // 复制到剪贴板
          navigator.clipboard.writeText(text).then(() => {
            alert('结果已复制到剪贴板！');
          });
        }
      });
    }

    // 返回测试中心
    const backBtn = container.querySelector('.btn-back-center');
    if (backBtn && state.callbacks.onBack) {
      backBtn.addEventListener('click', () => {
        state.callbacks.onBack();
      });
    }
  }

  /* ----------------------------------------------------------
   * 渲染历史结果（供测试中心调用）
   * ---------------------------------------------------------- */
  function renderHistoryResult(container, result, callbacks = {}) {
    state.resultCode = result.code;
    state.scores = result.scores || state.scores;
    state.radar = result.radar || state.radar;
    state.allTags = result.tags || [];
    state.matchedCards = result.matchedCards || [];
    state.completed = true;
    state.callbacks = callbacks;

    renderResult(container);
  }

  /* ----------------------------------------------------------
   * 导出接口
   * ---------------------------------------------------------- */
  return {
    init,
    render,
    renderResult: renderHistoryResult,
    getState: () => state,
    PERSONALITY_TYPES
  };

})();

window.AIRPTest = AIRPTest;
console.log('[AIRPTest] AIRP测试模块加载完成 ✓');
