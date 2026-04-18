/* ============================================================
 * 文件名: js/modules/personality-test.js
 * 用途: 人格测试系统 - 核心逻辑模块
 * 依赖: js/data-loader.js, js/storage.js, js/router.js
 * 
 * 主要功能:
 *   1. 加载题库数据（短版25题）
 *   2. 渲染测试题目（分阶段展示）
 *   3. 收集用户答案（多选）
 *   4. 计算四维人格代码（D/S, M/P, V/K, I/O）
 *   5. 计算五维雷达图分数
 *   6. 提取XP成分Tag
 *   7. 匹配推荐角色卡（1-3张）
 *   8. 渲染结果页面
 *
 * 核心算法:
 *   - 四维对冲: D vs S, M vs P, V vs K, I vs O
 *     取每对中得分高的字母，组成4字母人格代码（如 DMVI）
 *   - 五维雷达: control/masochism/emotion/detachment/kink
 *     累加所有选项的 radar 分数，最后 clamp 到 0-100
 *   - 角色匹配: 人格代码匹配 + 雷达向量余弦相似度
 * ============================================================ */

const PersonalityTest = (function () {
  'use strict';

  /* ----------------------------------------------------------
   * 区块: 模块状态
   * 用途: 存储测试过程中的所有运行时数据
   * ---------------------------------------------------------- */
  const state = {
    questions: [],          // 题库数据
    characters: [],         // 角色卡数据
    currentPhase: 0,        // 当前阶段索引 (0-4)
    currentQuestionIndex: 0,// 当前题目在全局中的索引
    answers: {},            // 用户答案 { q1: ["A","C"], q2: ["B"], ... }
    scores: {               // 四维对冲池
      D: 0, S: 0,
      M: 0, P: 0,
      V: 0, K: 0,
      I: 0, O: 0
    },
    radar: {                // 五维雷达图
      control: 0,
      masochism: 0,
      emotion: 0,
      detachment: 0,
      kink: 0
    },
    allTags: [],            // 所有收集到的XP成分Tag
    isLoaded: false,        // 数据是否已加载
    testType: 'short'       // 题库类型
  };

  /* ----------------------------------------------------------
   * 区块: 阶段名称映射
   * 用途: 展示每个阶段的标题和描述
   * ---------------------------------------------------------- */
  const PHASE_INFO = [
    { name: '边界构建', desc: '界定自我与世界的投射距离', icon: '🌐' },
    { name: '权力拉扯', desc: '控制权与服从性的深度测试', icon: '⚔️' },
    { name: '深渊试探', desc: '伦理边缘与感官异化', icon: '🕳️' },
    { name: '极限纠缠', desc: '绝境下的灵魂拷问', icon: '🔥' },
    { name: '镜中回望', desc: '剥离文本后的真实动机', icon: '🪞' }
  ];

  /* ----------------------------------------------------------
   * 区块: 16种人格定义（含心象题记与灵魂剪影）
   * 用途: 根据四维代码查找对应的人格名称、描述与展示文案
   * ---------------------------------------------------------- */
  const PERSONALITY_TYPES = {
    // ========== D区 · 掌控之庭 · 施与者的冠冕 ==========
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

    // ========== S区 · 臣服之沼 · 承受者的圣坛 ==========
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
   * 区块: 初始化 - 加载数据
   * 用途: 从JSON文件加载题库和角色卡数据
   * ---------------------------------------------------------- */
  async function init(testType = 'short') {
    console.log('[PersonalityTest] 初始化开始, 题库类型:', testType);
    state.testType = testType;

    try {
      // 加载题库
      const questionsData = await DataLoader.load(
        `data/questions/${testType}.json`,
        `questions_${testType}`
      );
      state.questions = questionsData.questions || [];
      console.log('[PersonalityTest] 题库加载成功, 题目数:', state.questions.length);

      // 加载角色卡
      const charactersData = await DataLoader.load(
        'data/characters/list.json',
        'characters'
      );
      state.characters = charactersData.characters || [];
      console.log('[PersonalityTest] 角色卡加载成功, 角色数:', state.characters.length);

      state.isLoaded = true;
      resetState();
      return true;
    } catch (error) {
      console.error('[PersonalityTest] 数据加载失败:', error);
      return false;
    }
  }

  /* ----------------------------------------------------------
   * 区块: 重置状态
   * 用途: 开始新测试前清空所有运算数据
   * ---------------------------------------------------------- */
  function resetState() {
    state.currentPhase = 0;
    state.currentQuestionIndex = 0;
    state.answers = {};
    state.scores = { D: 0, S: 0, M: 0, P: 0, V: 0, K: 0, I: 0, O: 0 };
    state.radar = { control: 0, masochism: 0, emotion: 0, detachment: 0, kink: 0 };
    state.allTags = [];
    console.log('[PersonalityTest] 状态已重置');
  }

  /* ----------------------------------------------------------
   * 区块: 渲染主入口
   * 用途: 根据当前状态决定渲染测试题 or 结果页
   * ---------------------------------------------------------- */
  function render(container) {
    console.log('[PersonalityTest] render() 调用');

    // 数据未加载 → 先加载
    if (!state.isLoaded) {
      container.innerHTML = `
        <div class="test-loading">
          <div class="loading-spinner"></div>
          <p>题库加载中，请稍候…</p>
        </div>
      `;
      init(state.testType).then(success => {
        if (success) {
          render(container);
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
    if (window.StorageManager) {
      const saved = StorageManager.get('personality-result');
      if (saved && saved.code && !state.resultCode) {
        state.resultCode = saved.code;
        state.scores = saved.scores || state.scores;
        state.radar = saved.radar || state.radar;
        state.allTags = saved.tags || [];
        state.matchedCards = saved.matchedCards || [];
        state.completed = true;
      }
    }

    // 已有结果 → 展示结果页
    if (state.completed) {
      renderResult(container);
      return;
    }

    // 否则渲染当前题目
    renderQuestion(container);
  }

  /* ----------------------------------------------------------
   * 区块: 渲染单道题目
   * 用途: 进度条 + 阶段标题 + 题干 + 选项列表 + 导航按钮
   * ---------------------------------------------------------- */
  function renderQuestion(container) {
    const question = state.questions[state.currentQuestionIndex];
    if (!question) {
      console.error('[PersonalityTest] 找不到题目, index:', state.currentQuestionIndex);
      return;
    }

    const total = state.questions.length;
    const current = state.currentQuestionIndex + 1;
    const progress = Math.round((current / total) * 100);

    // 阶段信息（phase字段为1-5，数组索引0-4）
    const phaseIdx = (question.phase || 1) - 1;
    const phase = PHASE_INFO[phaseIdx] || PHASE_INFO[0];

    // 当前题已选答案
    const selectedIds = state.answers[question.id] || [];

    // 构建选项HTML
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

    // 导航按钮状态
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

    // 绑定事件
    bindQuestionEvents(container, question);
    console.log(`[PersonalityTest] 渲染 Q${current}/${total} [${phase.name}]`);
  }

  /* ----------------------------------------------------------
   * 区块: 绑定题目交互事件
   * 用途: 选项点击(多选/单选)、上一题、下一题、提交
   * ---------------------------------------------------------- */
  function bindQuestionEvents(container, question) {
    const qId = question.id;

    // --- 选项点击 ---
    container.querySelectorAll('.test-option').forEach(el => {
      el.addEventListener('click', () => {
        const optId = el.dataset.optionId;
        if (!state.answers[qId]) state.answers[qId] = [];

        const arr = state.answers[qId];
        const idx = arr.indexOf(optId);

        if (question.multi !== false) {
          // 多选模式：toggle
          if (idx > -1) arr.splice(idx, 1);
          else arr.push(optId);
        } else {
          // 单选模式：替换
          state.answers[qId] = [optId];
        }

        // 重新渲染刷新选中态
        renderQuestion(container);
      });
    });

    // --- 上一题 ---
    const prevBtn = container.querySelector('.btn-test-prev');
    if (prevBtn && !prevBtn.disabled) {
      prevBtn.addEventListener('click', () => {
        state.currentQuestionIndex--;
        state.currentPhase = (state.questions[state.currentQuestionIndex].phase || 1) - 1;
        renderQuestion(container);
      });
    }

    // --- 下一题 ---
    const nextBtn = container.querySelector('.btn-test-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        state.currentQuestionIndex++;
        state.currentPhase = (state.questions[state.currentQuestionIndex].phase || 1) - 1;
        renderQuestion(container);
      });
    }

    // --- 提交查看结果 ---
    const submitBtn = container.querySelector('.btn-test-submit');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        console.log('[PersonalityTest] 提交，开始计算…');
        calculateResults();
        state.completed = true;

        // 持久化到 localStorage
        if (window.StorageManager) {
          StorageManager.save('personality-result', {
            code: state.resultCode,
            scores: state.scores,
            radar: state.radar,
            tags: state.allTags,
            matchedCards: state.matchedCards,
            timestamp: Date.now()
          });
        }

        renderResult(container);
      });
    }
  }

  /* ----------------------------------------------------------
   * 区块: 计算结果
   * 用途: 遍历所有答案，累加 scores / radar / tags
   * ---------------------------------------------------------- */
  function calculateResults() {
    console.log('[PersonalityTest] calculateResults() 开始');

    // 重置计算字段
    state.scores = { D: 0, S: 0, M: 0, P: 0, V: 0, K: 0, I: 0, O: 0 };
    state.radar = { control: 0, masochism: 0, emotion: 0, detachment: 0, kink: 0 };
    const tagCount = {};

    // 遍历每道题
    state.questions.forEach(question => {
      const selectedIds = state.answers[question.id] || [];

      selectedIds.forEach(optId => {
        const option = question.options.find(o => o.id === optId);
        if (!option) return;

        // 累加 scores（八维）
        if (option.scores) {
          Object.keys(option.scores).forEach(key => {
            if (state.scores.hasOwnProperty(key)) {
              state.scores[key] += option.scores[key];
            }
          });
        }

        // 累加 radar（五维）
        if (option.radar) {
          Object.keys(option.radar).forEach(key => {
            if (state.radar.hasOwnProperty(key)) {
              state.radar[key] += option.radar[key];
            }
          });
        }

        // 统计 tags
        if (option.tags && Array.isArray(option.tags)) {
          option.tags.forEach(tag => {
            tagCount[tag] = (tagCount[tag] || 0) + 1;
          });
        }
      });
    });

    // Clamp 雷达值到 0-100
    Object.keys(state.radar).forEach(key => {
      state.radar[key] = Math.max(0, Math.min(100, Math.round(state.radar[key])));
    });

    // 计算人格代码
    state.resultCode = getPersonalityCode();

    // 提取 Top 标签 → 存入 state.allTags
    state.tagCount = tagCount;
    state.allTags = getTopTags(8);

    // 角色匹配
    state.matchedCards = matchCharacters();

    console.log('[PersonalityTest] 计算完成:', {
      code: state.resultCode,
      scores: state.scores,
      radar: state.radar,
      topTags: state.allTags,
      matched: state.matchedCards.map(c => `${c.name}(${c.matchScore})`)
    });
  }

  /* ----------------------------------------------------------
   * 区块: 四维对冲 → 人格代码
   * 用途: D vs S, M vs P, V vs K, I vs O → 4字母代码
   * ---------------------------------------------------------- */
  function getPersonalityCode() {
    const s = state.scores;
    const code =
      (s.D >= s.S ? 'D' : 'S') +
      (s.M >= s.P ? 'M' : 'P') +
      (s.V >= s.K ? 'V' : 'K') +
      (s.I >= s.O ? 'I' : 'O');

    console.log(`[PersonalityTest] 人格代码: ${code}  D${s.D}/S${s.S}  M${s.M}/P${s.P}  V${s.V}/K${s.K}  I${s.I}/O${s.O}`);
    return code;
  }

  /* ----------------------------------------------------------
   * 区块: 提取高频Tag
   * 用途: 按频率降序，返回前 count 个标签名
   * ---------------------------------------------------------- */
  function getTopTags(count) {
    const entries = Object.entries(state.tagCount || {});
    entries.sort((a, b) => b[1] - a[1]);
    return entries.slice(0, count).map(e => e[0]);
  }

  /* ----------------------------------------------------------
   * 区块: 角色卡匹配
   * 用途: 人格代码匹配+50分，雷达余弦相似度×50分，返回前3
   * ---------------------------------------------------------- */
  function matchCharacters() {
    if (!state.characters || state.characters.length === 0) {
      console.warn('[PersonalityTest] 角色卡数据为空，跳过匹配');
      return [];
    }

    const userVec = [
      state.radar.control,
      state.radar.masochism,
      state.radar.emotion,
      state.radar.detachment,
      state.radar.kink
    ];

    const scored = state.characters.map(char => {
      let score = 0;

      // 1) 人格代码在 matchPersonalities 中 → +50
      if (char.matchPersonalities && Array.isArray(char.matchPersonalities)) {
        if (char.matchPersonalities.includes(state.resultCode)) {
          score += 50;
        }
      }

      // 2) 雷达余弦相似度 × 50
      if (char.matchDimensions) {
        const charVec = [
          char.matchDimensions.control || 0,
          char.matchDimensions.masochism || 0,
          char.matchDimensions.emotion || 0,
          char.matchDimensions.detachment || 0,
          char.matchDimensions.kink || 0
        ];
        score += cosineSimilarity(userVec, charVec) * 50;
      }

      return { ...char, matchScore: Math.round(score * 10) / 10 };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);
    const top3 = scored.slice(0, 3);

    console.log('[PersonalityTest] 匹配Top3:', top3.map(c => `${c.name}(${c.matchScore})`));
    return top3;
  }

  /* ----------------------------------------------------------
   * 区块: 余弦相似度
   * 用途: 两个等长向量的余弦相似度，值域 [0, 1]（分量非负）
   * ---------------------------------------------------------- */
  function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot  += vecA[i] * vecB[i];
      magA += vecA[i] * vecA[i];
      magB += vecB[i] * vecB[i];
    }
    magA = Math.sqrt(magA);
    magB = Math.sqrt(magB);

    if (magA === 0 || magB === 0) return 0;
    return dot / (magA * magB);
  }

  /* ----------------------------------------------------------
   * 区块: 渲染结果页
   * 用途: 完整展示人格类型 + 数据可视化 + 推荐角色卡
   * 字段: emoji, zoneName, zoneTitle, epigraph, soulSketch,
   *       四维对冲条, 五维雷达柱状图, XP标签, 角色卡
   * ---------------------------------------------------------- */
  function renderResult(container) {
    const code = state.resultCode;
    const p = PERSONALITY_TYPES[code];

    if (!p) {
      container.innerHTML = `
        <div class="test-error">
          <p>⚠️ 未知人格代码 [${code}]，请联系开发者</p>
          <button class="btn-retest">重新测试</button>
        </div>
      `;
      const btn = container.querySelector('.btn-retest');
      if (btn) btn.addEventListener('click', () => { resetState(); state.completed = false; render(container); });
      return;
    }

    const s = state.scores;

    // ---- 四维对冲条 ----
    const duelPairs = [
      { L: 'D', R: 'S', lv: s.D, rv: s.S, ll: '支配', rl: '臣服' },
      { L: 'M', R: 'P', lv: s.M, rv: s.P, ll: '施虐', rl: '受虐' },
      { L: 'V', R: 'K', lv: s.V, rv: s.K, ll: '窥视', rl: '裸露' },
      { L: 'I', R: 'O', lv: s.I, rv: s.O, ll: '内聚', rl: '外散' }
    ];

    const duelHTML = duelPairs.map(d => {
      const sum = d.lv + d.rv || 1;
      const lPct = Math.round((d.lv / sum) * 100);
      const rPct = 100 - lPct;
      const winner = d.lv >= d.rv ? 'left' : 'right';
      return `
        <div class="duel-row">
          <span class="duel-label left ${winner === 'left' ? 'winner' : ''}">${d.ll}(${d.L}) ${d.lv}</span>
          <div class="duel-track">
            <div class="duel-fill-l" style="width:${lPct}%"></div>
            <div class="duel-fill-r" style="width:${rPct}%"></div>
            <div class="duel-pointer" style="left:${lPct}%"></div>
          </div>
          <span class="duel-label right ${winner === 'right' ? 'winner' : ''}">${d.rv} ${d.rl}(${d.R})</span>
        </div>
      `;
    }).join('');

    // ---- 五维雷达柱状图 ----
    const radarDims = [
      { key: 'control',    label: '控制欲', color: '#e74c3c' },
      { key: 'masochism',  label: '抖M值', color: '#9b59b6' },
      { key: 'emotion',    label: '纯爱值', color: '#e91e8b' },
      { key: 'detachment', label: '海王值', color: '#3498db' },
      { key: 'kink',       label: '变态值', color: '#2ecc71' }
    ];

    const radarHTML = radarDims.map(r => {
      const val = state.radar[r.key] || 0;
      return `
        <div class="radar-row">
          <span class="radar-label">${r.label}</span>
          <div class="radar-track">
            <div class="radar-fill" style="width:${val}%; background:${r.color}">
              <span class="radar-val">${val}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // ---- XP 标签云 ----
    const tagsHTML = (state.allTags || []).map(tag =>
      `<span class="xp-tag">${tag}</span>`
    ).join('');

    // ---- 灵魂剪影 ----
    const sketchHTML = (p.soulSketch || []).map(line =>
      `<li>${line}</li>`
    ).join('');

    // ---- 推荐角色卡 ----
    const medals = ['🥇', '🥈', '🥉'];
    const cardsHTML = (state.matchedCards || []).map((card, i) => {
      const xpTags = (card.coreXP || []).map(x => `<span class="card-xp">${x}</span>`).join('');
      const warns  = (card.warnings || []).map(w => `<span class="card-warn">⚠ ${w}</span>`).join('');
      const soulTags = (card.soulTags || []).map(t => `<span class="card-soul-tag">${t}</span>`).join('');

      return `
        <div class="match-card rank-${i + 1}">
          <div class="match-card-head">
            <span class="match-medal">${medals[i] || '✦'}</span>
            <h3>${card.name}</h3>
            <span class="match-score">${card.matchScore} 分</span>
          </div>
          <div class="match-card-creator">by ${card.creator || '未知'}</div>
          <div class="match-card-orient">${card.orientation || ''}</div>
          <p class="match-card-liner">${card.oneLiner || ''}</p>
          ${card.iconicLine ? `<blockquote class="match-card-quote">"${card.iconicLine}"</blockquote>` : ''}
          <div class="match-card-soul-tags">${soulTags}</div>
          <div class="match-card-xp">${xpTags}</div>
          ${warns ? `<div class="match-card-warns">${warns}</div>` : ''}
          <div class="match-card-meta">
            <span>💬 ${card.toneStyle || '-'}</span>
            <span>💞 ${card.relationStyle || '-'}</span>
            <span>⏱ ${card.pacing || '-'}</span>
          </div>
          ${card.openings && card.openings.length > 0 ? `
            <details class="match-card-openings">
              <summary>可用开场白 (${card.openings.length})</summary>
              <ul>${card.openings.map(o => `<li>${o}</li>`).join('')}</ul>
            </details>
          ` : ''}
        </div>
      `;
    }).join('');

    // ---- 组装完整结果页 ----
    container.innerHTML = `
      <div class="test-result">

        <!-- 人格主卡片 -->
        <div class="result-hero">
          <div class="result-emoji">${p.emoji || '✦'}</div>
          <div class="result-zone">
            <span class="zone-name">${p.zoneName || ''}</span>
            <span class="zone-sep">·</span>
            <span class="zone-title">${p.zoneTitle || ''}</span>
          </div>
          <h1 class="result-name">${p.name}</h1>
          <div class="result-name-en">${p.nameEn || ''}</div>
          <div class="result-code-badge">${code}</div>
          <div class="result-motto">${p.motto || ''}</div>
        </div>

        <!-- 心象题记 -->
        ${p.epigraph ? `
          <div class="result-epigraph">
            <p>"${p.epigraph}"</p>
          </div>
        ` : ''}

        <!-- 人格描述 -->
        <div class="result-desc">
          <p>${p.description || ''}</p>
        </div>

        <!-- 灵魂剪影 -->
        ${sketchHTML ? `
          <div class="result-section result-sketch">
            <h2>✿ 灵魂剪影</h2>
            <ul class="sketch-list">${sketchHTML}</ul>
          </div>
        ` : ''}

        <!-- 四维对冲 -->
        <div class="result-section">
          <h2>⚖ 四维对冲图谱</h2>
          <div class="duel-chart">${duelHTML}</div>
        </div>

        <!-- 五维雷达 -->
        <div class="result-section">
          <h2>📡 五维探测雷达</h2>
          <div class="radar-chart">${radarHTML}</div>
        </div>

        <!-- XP成分 -->
        ${tagsHTML ? `
          <div class="result-section">
            <h2>🧪 XP成分表</h2>
            <div class="xp-cloud">${tagsHTML}</div>
          </div>
        ` : ''}

        <!-- 推荐角色卡 -->
        <div class="result-section">
          <h2>🃏 为你推荐的角色</h2>
          <div class="match-cards-grid">
            ${cardsHTML || '<p class="no-match">暂无匹配角色，快去邀请创作者上传角色卡吧！</p>'}
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="result-actions">
          <button class="btn-retest">↺ 重新测试</button>
          <button class="btn-share">✦ 分享结果</button>
          <button class="btn-back-home">🏠 返回首页</button>
        </div>

      </div>
    `;

    // 绑定结果页事件
    bindResultEvents(container);
    console.log(`[PersonalityTest] 结果页渲染完成: ${p.name} (${code})`);
  }

  /* ----------------------------------------------------------
   * 区块: 结果页事件绑定
   * 用途: 重新测试、分享（Phase 7）、返回首页
   * ---------------------------------------------------------- */
  function bindResultEvents(container) {
    // 重新测试
    const retestBtn = container.querySelector('.btn-retest');
    if (retestBtn) {
      retestBtn.addEventListener('click', () => {
        // 清除保存的结果
        if (window.StorageManager) {
          StorageManager.remove('personality-result');
        }
        resetState();
        state.completed = false;
        state.resultCode = null;
        state.matchedCards = [];
        render(container);
      });
    }

    // 分享（Phase 7 实现）
    const shareBtn = container.querySelector('.btn-share');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        console.log('[PersonalityTest] 分享按钮点击 - Phase 7 实现');
        // 临时提示
        const p = PERSONALITY_TYPES[state.resultCode];
        const text = `我在 webvb 测出了「${p ? p.name : state.resultCode}」人格！快来测测你是什么花 ✦`;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(() => {
            alert('结果已复制到剪贴板，快去分享吧！');
          }).catch(() => {
            prompt('复制以下内容分享：', text);
          });
        } else {
          prompt('复制以下内容分享：', text);
        }
      });
    }

    // 返回首页
    const homeBtn = container.querySelector('.btn-back-home');
    if (homeBtn) {
      homeBtn.addEventListener('click', () => {
        if (window.Router) {
          Router.navigate('home');
        }
      });
    }
  }

  /* ----------------------------------------------------------
   * 区块: 模块导出
   * 用途: IIFE 返回公开接口，挂载到全局
   * ---------------------------------------------------------- */
  return {
    init,
    render,
    resetState,
    calculateResults,
    getPersonalityCode,
    matchCharacters,
    getState: () => state,
    PERSONALITY_TYPES
  };

})(); // ← PersonalityTest IIFE 结束

// 挂载到全局命名空间
window.PersonalityTest = PersonalityTest;
console.log('[PersonalityTest] 模块加载完成 ✓');

