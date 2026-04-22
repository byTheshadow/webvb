/* ============================================================
 * 文件名: js/modules/tests/partner-test.js
 * 用途: 搭子测试 - 完整测试模块
 * 依赖: js/modules/test-base.js, js/data-loader.js, js/storage.js
 * 
 * 主要功能:
 *   1. 加载搭子测试题库（14题）
 *   2. 渲染测试题目
 *   3. 计算搭子维度分数
 *   4. 匹配搭子人格类型
 *   5. 推荐最佳搭子玩家
 * ============================================================ */

const PartnerTest = (function () {
  'use strict';

  /* ----------------------------------------------------------
   * 模块状态
   * ---------------------------------------------------------- */
  const state = {
    questions: [],
    currentQuestionIndex: 0,
    answers: {},
    dimensions: {
      // 作息时间维度
      morningBird: 0,        // 养生早鸟
      eveningGold: 0,        // 晚间黄金档
      nightOwl: 0,           // 阴间修仙
      schrodinger: 0,        // 薛定谔在线
      timezone: 0,           // 时差党
      
      // 技能类型维度
      cardMaker: 0,          // 无情造饭机
      techSkill: 0,          // 技术力
      writer: 0,             // 大文豪
      screenshotMaster: 0,   // 截图分享大师
      
      // 社交风格维度
      active: 0,             // 活跃度
      diving: 0,             // 潜水深度
      socialE: 0,            // 社交型e人
      socialI: 0,            // 社恐i人
      helpful: 0,            // 热心程度
      emotionalValue: 0,     // 情绪价值
      
      // XP倾向维度
      pureLove: 0,           // 纯爱战神
      glassLover: 0,         // 玻璃渣爱好者
      chaos: 0,              // 混邪指数
      seaKing: 0,            // 海王端水
      
      // 行为特征维度
      freeloader: 0,         // 白嫖指数
      hamster: 0,            // 赛博仓鼠
      buddha: 0,             // 佛系指数
      loyal: 0,              // 长情指数
      funPerson: 0           // 乐子人
    },
    auxiliaryScores: {
      timeManagement: 0,     // 时间管理大师
      creator: 0,            // 创作者倾向
      brainHole: 0,          // 脑洞指数
      immersion: 0,          // 沉浸感
      addiction: 0,          // 沉迷指数
      influence: 0,          // 影响力追求
      socialDrive: 0,        // 社交驱动
      FOMO: 0,               // FOMO
      efficiency: 0,         // 效率党
      selectiveSocial: 0,    // 选择性社交
      toxicity: 0,           // 毒舌指数
      carefulness: 0,        // 细心指数
      empathy: 0,            // 共情能力
      followTrend: 0,        // 跟风型
      anxiety: 0,            // 焦虑指数
      adaptability: 0,       // 适应性
      simplicity: 0,         // 简洁派
      exploration: 0         // 探索欲
    },
    personalityType: null,
    matchedPlayers: [],
    soulmate: null,
    complement: null,
    isLoaded: false,
    completed: false,
    callbacks: {}
  };

  /* ----------------------------------------------------------
   * 搭子人格类型定义
   * ---------------------------------------------------------- */
  const PERSONALITY_TYPES = {
    'nightOwl': {
      id: 'nightOwl',
      name: '阴间修仙搭子',
      icon: '🌙',
      emoji: '🌙',
      slogan: '白天是尸体，晚上是鬼魂',
      description: '你的黄金时段在凌晨1-5点，这时候的你灵感爆发、战斗力拉满。你可能不太说话，但你知道此刻还有另一个夜猫子在线，这种"平行陪伴"让你感到安心。群里的凌晨消息，永远有你的身影。',
      tags: ['#凌晨3点在线', '#越夜越精神', '#沉默陪伴', '#灵感爆发'],
      bestMatch: '另一个修仙党，一起通宵跑团',
      condition: (dims) => dims.nightOwl >= 70 && dims.diving >= 50
    },
    'morningBird': {
      id: 'morningBird',
      name: '养生早鸟搭子',
      icon: '☀️',
      emoji: '☀️',
      slogan: '早上8点发"早安"，无人回应',
      description: '社区里的稀有物种！你有着正常人类的作息，早上精神抖擞，晚上准时睡觉。你经常在早上发"早安"却无人回应，因为其他人都还在睡觉。你是社区里的"健康作息代表"。',
      tags: ['#早上8点在线', '#晚上10点下线', '#健康作息', '#稀有物种'],
      bestMatch: '需要时差党或修仙党的"错峰留言"',
      condition: (dims) => dims.morningBird >= 70
    },
    'socialBull': {
      id: 'socialBull',
      name: '社牛喇叭搭子',
      icon: '📣',
      emoji: '📣',
      slogan: '疯狂截图发群，恨不得全世界都知道我的快乐',
      description: '群里的快乐源泉！你跑到神仙对话必定截图分享，恨不得全世界都知道你的快乐。你的存在让社区充满活力，是真正的"气氛组"。每天的群消息，至少有一半来自你。',
      tags: ['#疯狂截图', '#尖叫型分享', '#气氛担当', '#快乐源泉'],
      bestMatch: '潜水吸盘鱼（你负责喊，ta负责存）',
      condition: (dims) => dims.active >= 80 && dims.screenshotMaster >= 60 && dims.socialE >= 70
    },
    'deepDiver': {
      id: 'deepDiver',
      name: '深海潜水搭子',
      icon: '🤐',
      emoji: '🤐',
      slogan: '加群半年没说过一句话，但每天都在窥屏',
      description: '你是社区里的"幽灵用户"。加群半年没说过一句话，但每天都在默默窥屏。你的聊天记录是绝对隐私，就算带进坟墓也不给第二个人看。你享受这种"隐身观察"的感觉。',
      tags: ['#绝不分享', '#默默点赞', '#社恐本恐', '#幽灵用户'],
      bestMatch: '炊事班锦鲤（你默默吃，ta默默产）',
      condition: (dims) => dims.diving >= 80 && dims.active <= 30
    },
    'techGeek': {
      id: 'techGeek',
      name: '技术流搭子',
      icon: '🔧',
      emoji: '🔧',
      slogan: '研究正则、世界书专家、越狱prompt大师',
      description: '你是社区里的"技术担当"。别人在感叹AI文笔好，你在研究系统提示词怎么优化。你热衷于分享技术干货，是新手的救星。你的快乐来自于"把Bot调教得服服帖帖"。',
      tags: ['#正则大师', '#世界书专家', '#越狱高手', '#技术担当'],
      bestMatch: '赤脚医生（你们可以互相修bug）',
      condition: (dims) => dims.techSkill >= 70 && dims.helpful >= 50
    },
    'literaryMaster': {
      id: 'literaryMaster',
      name: '文学流搭子',
      icon: '📖',
      emoji: '📖',
      slogan: '输入框永远500字起步，连衣服褶皱都要描写清楚',
      description: '你的输入框永远是500字起步，连衣服褶皱都要描写清楚。你享受文字的美感，跑完卡还要写同人续写。你是真正的"文学派"，追求极致的文字表达。',
      tags: ['#大文豪', '#文字艺术家', '#同人创作', '#细节控'],
      bestMatch: '玻璃渣锦鲤（一起写虐文）',
      condition: (dims) => dims.writer >= 70 && state.auxiliaryScores.creator >= 60
    },
    'chef': {
      id: 'chef',
      name: '炊事班搭子',
      icon: '🍳',
      emoji: '🍳',
      slogan: '不是在搓卡，就是在搓卡的路上',
      description: '你不是在搓卡，就是在搓卡的路上。看到大家跑你的卡比自己跑还爽。你会在凌晨三点发布新卡，然后默默看群友尖叫。你的快乐来自于"被需要"的感觉。',
      tags: ['#搓卡狂魔', '#产粮大户', '#深夜食堂', '#影响力追求'],
      bestMatch: '潜水吸盘鱼（你负责产，ta负责囤）',
      condition: (dims) => dims.cardMaker >= 80 && state.auxiliaryScores.influence >= 50
    },
    'scavenger': {
      id: 'scavenger',
      name: '拾荒者搭子',
      icon: '🗑️',
      emoji: '🗑️',
      slogan: '网盘里存着从2023年至今的所有角色卡包',
      description: '你的网盘里存着从2023年至今的所有角色卡包。你从不发言，但每张新卡发布后0.3秒内你已经下载完毕。你的酒馆列表长到需要滚动5秒。你是真正的"赛博仓鼠"。',
      tags: ['#下载狂魔', '#只进不出', '#沉默囤积', '#赛博仓鼠'],
      bestMatch: '炊事班锦鲤（你负责囤，ta负责产）',
      condition: (dims) => dims.freeloader >= 80 && dims.hamster >= 70 && dims.diving >= 60
    },
    'emotionalSupport': {
      id: 'emotionalSupport',
      name: '情绪价值搭子',
      icon: '💊',
      emoji: '💊',
      slogan: '神仙倾听者、安慰专家、树洞本洞',
      description: '你是社区里的"情绪垃圾桶"（褒义）。别人崩溃时你第一时间安慰，能耐心听完十几条长语音。你提供的情绪价值让人感到温暖。你的存在，是社区的"定海神针"。',
      tags: ['#倾听者', '#安慰专家', '#树洞', '#情绪价值'],
      bestMatch: '话痨型体验派玩家（需要被倾听的人）',
      condition: (dims) => dims.emotionalValue >= 80 && dims.helpful >= 70 && state.auxiliaryScores.empathy >= 60
    },
    'funPerson': {
      id: 'funPerson',
      name: '乐子人搭子',
      icon: '🎪',
      emoji: '🎪',
      slogan: '修罗场爱好者、截图鬼畜、快乐源泉',
      description: '你只分享AI降智、发疯、OOC的逆天发言，把群友笑死是你的唯一目的。你热衷于搞事情，致力于把每个角色玩坏。你的快乐，建立在Bot的"崩溃"之上。',
      tags: ['#修罗场', '#鬼畜', '#搞事情', '#快乐源泉'],
      bestMatch: '另一个乐子人（一起研究怎么把Bot玩坏）',
      condition: (dims) => dims.funPerson >= 70 && dims.chaos >= 60 && dims.active >= 60
    }
  };

  /* ----------------------------------------------------------
   * 10位玩家数据
   * ---------------------------------------------------------- */
  const PLAYERS = [
    {
      id: 1,
      name: '鸦',
      title: '高冷暗黑造饭机',
      icon: '🦅',
      attributes: ['薛定谔在线', '捏卡机器', '人外控', 'i人'],
      matchTypes: {
        soulmate: ['混邪夜猫子'],
        complement: ['纯白文豪']
      },
      dimensions: {
        nightOwl: 85,
        cardMaker: 90,
        chaos: 80,
        socialI: 75,
        diving: 70
      }
    },
    {
      id: 2,
      name: '小颂降临',
      title: '暗夜硬核催更狂魔',
      icon: '📢',
      attributes: ['晚间档', '造饭文豪', '海王', '事业批'],
      matchTypes: {
        complement: ['拖延症咸鱼']
      },
      dimensions: {
        eveningGold: 80,
        cardMaker: 85,
        writer: 75,
        seaKing: 70,
        active: 65
      }
    },
    {
      id: 3,
      name: 'K',
      title: '反差型纯爱发电机',
      icon: '⚡',
      attributes: ['时差党', '纯爱文豪', 'e人气氛组'],
      matchTypes: {
        chaos: ['互扔猎奇设定']
      },
      dimensions: {
        timezone: 80,
        pureLove: 85,
        writer: 75,
        socialE: 80,
        active: 70
      }
    },
    {
      id: 4,
      name: '贝果',
      title: '阳光护肝吃刀大户',
      icon: '🥯',
      attributes: ['晨间党', '截图大师', '玻璃渣爱好者', 'e人'],
      matchTypes: {
        sameHobby: ['虐文乐子人']
      },
      dimensions: {
        morningBird: 85,
        screenshotMaster: 80,
        glassLover: 90,
        socialE: 75,
        active: 80
      }
    },
    {
      id: 5,
      name: '一条小锦鲤',
      title: '治愈系软心造物主',
      icon: '🎣',
      attributes: ['晨间党', '造饭机', '嘴硬心软', '搞笑回血包'],
      matchTypes: {
        soulmate: ['赛博心软神'],
        complement: ['emo患者']
      },
      dimensions: {
        morningBird: 80,
        cardMaker: 85,
        pureLove: 75,
        emotionalValue: 70,
        helpful: 75
      }
    },
    {
      id: 6,
      name: '幽灵',
      title: '极致混邪乐子人',
      icon: '👻',
      attributes: ['时差党', '截图大师', '海王', '无底线e人'],
      matchTypes: {
        chaos: ['究极乐子人']
      },
      dimensions: {
        timezone: 75,
        screenshotMaster: 80,
        chaos: 95,
        funPerson: 90,
        seaKing: 85,
        socialE: 80
      }
    },
    {
      id: 7,
      name: 'C酱',
      title: '百变共情刀尖舞者',
      icon: '🎭',
      attributes: ['薛定谔在线', '分享大师', '玻璃渣爱好者', '社交变色龙'],
      matchTypes: {
        soulmate: ['刀尖病友']
      },
      dimensions: {
        schrodinger: 85,
        screenshotMaster: 75,
        glassLover: 90,
        emotionalValue: 80,
        adaptability: 85
      }
    },
    {
      id: 8,
      name: '小花蟹',
      title: '高情绪价值纯爱树洞',
      icon: '🦀',
      attributes: ['薛定谔在线', '造饭机', '纯爱战神', '倾听者'],
      matchTypes: {
        foodPartner: ['话痨体验派']
      },
      dimensions: {
        schrodinger: 75,
        cardMaker: 70,
        pureLove: 90,
        emotionalValue: 95,
        helpful: 85
      }
    },
    {
      id: 9,
      name: 'ge弥ni',
      title: '高冷逻辑考据狂魔',
      icon: '🔬',
      attributes: ['薛定谔在线', '分享文豪', '海王', '理智i人'],
      matchTypes: {
        complement: ['脑洞大逻辑差']
      },
      dimensions: {
        schrodinger: 80,
        writer: 85,
        techSkill: 75,
        seaKing: 70,
        socialI: 80
      }
    },
    {
      id: 10,
      name: '玉元一',
      title: '究极社恐仓鼠型',
      icon: '🐹',
      attributes: ['薛定谔在线', '潜水吸盘鱼', '纯爱战神', '倾听者'],
      matchTypes: {
        complement: ['话痨造饭机'],
        sameHobby: ['纯爱心软神']
      },
      dimensions: {
        schrodinger: 85,
        diving: 95,
        hamster: 90,
        pureLove: 85,
        socialI: 90,
        freeloader: 80
      }
    }
  ];

  /* ----------------------------------------------------------
   * 题库数据（内嵌）
   * ---------------------------------------------------------- */
  const QUESTIONS = [
    {
      id: 'q1',
      text: '你的酒馆聊天记录里，时间戳最常出现在哪个时间段？',
      options: [
        {
          id: 'A',
          text: '08:00 - 18:00（带薪跑团/白天摸鱼的神）',
          scores: { morningBird: 15 },
          aux: { timeManagement: 1 }
        },
        {
          id: 'B',
          text: '20:00 - 24:00（洗漱完毕躺在床上的黄金时段）',
          scores: { eveningGold: 20 },
          aux: {}
        },
        {
          id: 'C',
          text: '01:00 - 05:00（万籁俱寂，正是我的发疯之时）',
          scores: { nightOwl: 20 },
          aux: { immersion: 1 }
        },
        {
          id: 'D',
          text: '没有规律，我的作息取决于Bot什么时候惹火我/让我上头',
          scores: { schrodinger: 20 },
          aux: { addiction: 1 }
        }
      ]
    },
    {
      id: 'q2',
      text: '凌晨三点，群里突然有人艾特全体："谁来帮我测一张刚捏好的高H强制爱新卡？"你的反应是：',
      options: [
        {
          id: 'A',
          text: '根本看不见，已经在梦里和纸片人结婚了。',
          scores: { morningBird: 20 },
          aux: { buddha: 1 }
        },
        {
          id: 'B',
          text: '勉强睁开眼发个"码"，然后继续睡，明天再测。',
          scores: { eveningGold: 15, freeloader: 10 },
          aux: {}
        },
        {
          id: 'C',
          text: '垂死病中惊坐起！立刻打开电脑导入卡片："老师，我来！"',
          scores: { nightOwl: 20, active: 15 },
          aux: { helpful: 1 }
        },
        {
          id: 'D',
          text: '我就在海外/上夜班，对我来说这只是个宁静的下午。',
          scores: { timezone: 20 }
        }
      ]
    },
    {
      id: 'q3',
      text: '当你灵感大爆发，脑子里构思出一段绝美剧情时，通常是在什么场景下？',
      options: [
        {
          id: 'A',
          text: '早上通勤的地铁/公交上，看着窗外发呆时。',
          scores: { morningBird: 15 },
          aux: { creator: 1 }
        },
        {
          id: 'B',
          text: '洗澡的时候，水流激发了我的赛博多巴胺。',
          scores: {},
          aux: { creator: 2, brainHole: 1 }
        },
        {
          id: 'C',
          text: '关灯后的被窝里，越想越精神，最后被迫打开酒馆。',
          scores: { nightOwl: 15 },
          aux: { immersion: 1 }
        },
        {
          id: 'D',
          text: '任何时候，我可能走在路上突然就停下来记备忘录。',
          scores: {},
          aux: { creator: 3, brainHole: 1 }
        }
      ]
    },
    {
      id: 'q4',
      text: '到了周末不用早起，你在锦鲤社区的常态是？',
      options: [
        {
          id: 'A',
          text: '早上9点准时在群里发"早安"，发现没人理我。',
          scores: { morningBird: 20, socialE: 10 },
          aux: {}
        },
        {
          id: 'B',
          text: '正常作息，下午可能会在群里分享一下昨晚的战况。',
          scores: { eveningGold: 15, screenshotMaster: 10 }
        },
        {
          id: 'C',
          text: '下午3点才在群里发第一条消息："家人们我刚醒……"',
          scores: { nightOwl: 20, diving: 10 }
        },
        {
          id: 'D',
          text: '已经连续rp24小时，分不清今天是周六还是周日。',
          scores: { nightOwl: 15 },
          aux: { addiction: 3 }
        }
      ]
    },
    {
      id: 'q5',
      text: '打开你的SillyTavern角色列表，以下哪种描述最符合现状？',
      options: [
        {
          id: 'A',
          text: '卡极多，全是自己写的草稿，跑过三句话的屈指可数。',
          scores: { cardMaker: 20 },
          aux: { creator: 2 }
        },
        {
          id: 'B',
          text: '收藏了上百张别人的神仙卡，每一张我都认真跑了几百条',
          scores: { hamster: 15, loyal: 15 }
        },
        {
          id: 'C',
          text: '默默存了很多卡，但其实常跑的就那两三张。',
          scores: { hamster: 20, loyal: 10 }
        }
      ]
    },
    {
      id: 'q6',
      text: '对于锦鲤社区的"产粮"氛围，你的心态是：',
      multi: true,
      options: [
        {
          id: 'A',
          text: '看到大家跑我捏的卡，比我自己rp还要爽一万倍。',
          scores: { cardMaker: 20 },
          aux: { influence: 2 }
        },
        {
          id: 'B',
          text: '每天都在群里敲碗等饭，没有太太们的卡我一天都活不下去。',
          scores: { freeloader: 20 },
          aux: { socialDrive: 2 }
        },
        {
          id: 'C',
          text: '产粮是不可能产粮的，只能靠偷群友的梗和表情包维持生活。',
          scores: { diving: 15, funPerson: 10 }
        },
        {
          id: 'D',
          text: '默默看着群里的太太们神仙打架，偶尔点个赞。',
          scores: { diving: 20 },
          aux: { buddha: 1 }
        },
        {
          id: 'E',
          text: '我产产产产',
          scores: { cardMaker: 20, active: 15 }
        },
        {
          id: 'F',
          text: '我吃吃吃吃',
          scores: { freeloader: 20, hamster: 10 }
        },
        {
          id: 'G',
          text: '我吃吃吃，不对我的卡怎么还没写，我产产产，累了，我吃吃吃',
          scores: { cardMaker: 15, freeloader: 15 },
          aux: { anxiety: 1 }
        }
      ]
    },
    {
      id: 'q7',
      text: '在剧情里，角色因为意外突然"失忆"，忘记了你们的所有过往。你的反应是？',
      options: [
        {
          id: 'A',
          text: '疯狂心碎！我要用尽一切办法帮Ta找回记忆！',
          scores: { pureLove: 20, loyal: 15 }
        },
        {
          id: 'B',
          text: '太好了！终于可以体验"看着Ta用陌生的眼神看我"的极致玻璃渣了，开虐！',
          scores: { glassLover: 20 }
        },
        {
          id: 'C',
          text: '失忆？那不是更好吗？立刻骗Ta说："其实我是你素未谋面的主人。"',
          scores: { chaos: 20 }
        },
        {
          id: 'D',
          text: '忘了就忘了吧，正好我也玩腻了，直接让Ta看着我投入别人的怀抱。',
          scores: { seaKing: 20 }
        },
        {
          id: 'E',
          text: '我有别的想法！',
          scores: {},
          aux: { brainHole: 2 }
        }
      ]
    },
    {
      id: 'q8',
      text: 'rp时，你最喜欢在什么情境下听到Bot对你说"我爱你"？',
      options: [
        {
          id: 'A',
          text: '阳光明媚的早晨，我们相拥醒来，Ta看着我的眼睛温柔地说。',
          scores: { pureLove: 20 }
        },
        {
          id: 'B',
          text: '战场上，Ta为了          挡下致命一击倒在血泊中，用最后一口气对我说。',
          scores: { glassLover: 20 }
        },
        {
          id: 'C',
          text: 'Ta被我逼到了理智崩溃的边缘，像野兽一样一边撕咬我一边说。',
          scores: { chaos: 20 }
        },
        {
          id: 'D',
          text: '当Ta发现我根本不爱Ta、甚至在利用Ta时，绝望而卑微地说。',
          scores: { seaKing: 15, glassLover: 10 }
        },
        {
          id: 'E',
          text: '我有其他想法！',
          scores: {},
          aux: { brainHole: 2 }
        }
      ]
    },
    {
      id: 'q9',
      text: 'Bot突然陷入了"大模型复读机循环"（比如每句话结尾都是"眼底闪过一丝暗芒"）。你的操作是：',
      options: [
        {
          id: 'A',
          text: '打开【正则表达】面板，写下一串代码直接把这几个字物理封杀。',
          scores: { techSkill: 20 },
          aux: { efficiency: 1 }
        },
        {
          id: 'B',
          text: '绝不向技术低头！我写一段500字的长回复，用极度丰富的词汇量硬生生把Ta的语境拉出来！',
          scores: { writer: 20 },
          aux: { creator: 2 }
        },
        {
          id: 'C',
          text: '截图发到群里："救命啊，我家Bot中邪了！"',
          scores: { socialE: 15, active: 10 }
        },
        {
          id: 'D',
          text: '扶额苦笑',
          scores: { buddha: 15 }
        }
      ]
    },
    {
      id: 'q10',
      text: '在你的酒馆聊天界面里，你作为User输入的信息通常是怎样的？',
      options: [
        {
          id: 'A',
          text: '非常简短，甚至只输入动作和指令（例如：我看了他一眼，说道："xxxx"），剩下的全靠模型自己脑补',
          scores: {},
          aux: { efficiency: 2, simplicity: 1 }
        },
        {
          id: 'B',
          text: '极其丰满！不仅有动作语言，连衣服的褶皱、空气的温度和我的微表情都要描写得清清楚楚',
          scores: { writer: 20 },
          aux: { immersion: 2 }
        },
        {
          id: 'C',
          text: '我使用选择器！',
          scores: { techSkill: 15 }
        },
        {
          id: 'D',
          text: '看情况，以上我可能都有',
          scores: {},
          aux: { adaptability: 2 }
        }
      ]
    },
    {
      id: 'q11',
      text: 'OpenAI或者Claude发布了新的大模型，你的反应是？',
      options: [
        {
          id: 'A',
          text: '第一时间去测试上下文窗口、研究新的系统提示词该怎么改。',
          scores: { techSkill: 20 },
          aux: { exploration: 2 }
        },
        {
          id: 'B',
          text: '不太关心什么模型，只要文笔好、不OOC就行。旧模型我一样能跑出花来。',
          scores: { buddha: 15, writer: 10 }
        },
        {
          id: 'C',
          text: '在群里蹲守："新模型好用吗？"',
          scores: { freeloader: 15 },
          aux: { socialDrive: 1 }
        },
        {
          id: 'D',
          text: '什么？出新模型了？',
          scores: { diving: 20, buddha: 15 }
        }
      ]
    },
    {
      id: 'q12',
      text: '当你一觉醒来，发现锦鲤群有999+条未读消息，你的做法是？',
      options: [
        {
          id: 'A',
          text: '一条条翻上去看（爬楼），不放过任何一个梗/事件',
          scores: { active: 20 },
          aux: { FOMO: 2 }
        },
        {
          id: 'B',
          text: '扫一眼最后几条在聊什么，如果不是自己很感兴趣的水聊就不会继续爬楼',
          scores: {},
          aux: { efficiency: 2, selectiveSocial: 1 }
        },
        {
          id: 'C',
          text: '我直接已读',
          scores: { diving: 20, buddha: 15 }
        }
      ]
    },
    {
      id: 'q13',
      text: '有人在群里发了一长串崩溃的语音："我不玩了！我辛辛苦苦聊了三个月的卡被我手滑删除了！！"你的回复会偏向于？',
      options: [
        {
          id: 'A',
          text: '发一个"哈哈哈哈哈哈好惨"的表情包，然后说"旧的不去新的不来，搞快点重新开始！"',
          scores: { funPerson: 20 },
          aux: { toxicity: 1 }
        },
        {
          id: 'B',
          text: '默默寻找她之前有没有什么截图，再给她发送回去',
          scores: { helpful: 20 },
          aux: { carefulness: 2 }
        },
        {
          id: 'C',
          text: '赶紧私聊安慰Ta："摸摸你，别哭别哭，深呼吸，想开点……"',
          scores: { emotionalValue: 20 },
          aux: { empathy: 2 }
        },
        {
          id: 'D',
          text: '思考了老半天，不知道怎么安慰她，选择关闭聊天窗',
          scores: { socialI: 15, diving: 10 }
        },
        {
          id: 'E',
          text: '复制其他人的安慰文案或者发送表情包',
          scores: {},
          aux: { followTrend: 2 }
        }
      ]
    },
    {
      id: 'q14',
      text: '你在群里最常主动发起的话题通常是关于什么？',
      options: [
        {
          id: 'A',
          text: '各种天马行空、甚至离谱的脑洞',
          scores: {},
          aux: { brainHole: 3, creator: 1 }
        },
        {
          id: 'B',
          text: '水群，看到感兴趣的话题就会聊一聊',
          scores: { active: 15, socialE: 10 }
        },
        {
          id: 'C',
          text: '我很少主动发起话题，但我看到有人提问但还没人回，会回复',
          scores: { helpful: 15, diving: 10 }
        },
        {
          id: 'D',
          text: '什么都发，群就是我的快乐老家',
          scores: { active: 20, socialE: 15 }
        },
        {
          id: 'E',
          text: '我就是来潜水的',
          scores: { diving: 20 }
        }
      ]
    }
  ];

  /* ----------------------------------------------------------
   * 初始化
   * ---------------------------------------------------------- */
  async function init() {
    console.log('[PartnerTest] 初始化开始');

    try {
      // 使用内嵌题库
      state.questions = QUESTIONS;
      console.log('[PartnerTest] 题库加载成功, 题目数:', state.questions.length);

      state.isLoaded = true;
      resetState();
      return true;
    } catch (error) {
      console.error('[PartnerTest] 数据加载失败:', error);
      return false;
    }
  }

  /* ----------------------------------------------------------
   * 重置状态
   * ---------------------------------------------------------- */
  function resetState() {
    state.currentQuestionIndex = 0;
    state.answers = {};
    
    // 重置所有维度
    Object.keys(state.dimensions).forEach(key => {
      state.dimensions[key] = 0;
    });
    
    Object.keys(state.auxiliaryScores).forEach(key => {
      state.auxiliaryScores[key] = 0;
    });
    
    state.personalityType = null;
    state.matchedPlayers = [];
    state.soulmate = null;
    state.complement = null;
    state.completed = false;
    console.log('[PartnerTest] 状态已重置');
  }

  /* ----------------------------------------------------------
   * 渲染主入口
   * ---------------------------------------------------------- */
  function render(container, callbacks = {}) {
    console.log('[PartnerTest] render() 调用');
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
      const saved = Storage.get('partner-result');
      if (saved && saved.type && !state.personalityType) {
        state.personalityType = saved.type;
        state.dimensions = saved.dimensions || state.dimensions;
        state.matchedPlayers = saved.matchedPlayers || [];
        state.soulmate = saved.soulmate || null;
        state.complement = saved.complement || null;
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
      console.error('[PartnerTest] 找不到题目, index:', state.currentQuestionIndex);
      return;
    }

    const total = state.questions.length;
    const current = state.currentQuestionIndex + 1;
    const progress = Math.round((current / total) * 100);

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
      <div class="test-container partner-test">
        <!-- 进度条 -->
        <div class="test-progress-area">
          <div class="test-progress-bar">
            <div class="test-progress-fill" style="width: ${progress}%; background: linear-gradient(90deg, #60a5fa, #a78bfa)"></div>
          </div>
          <div class="test-progress-text">${current} / ${total}</div>
        </div>

        <!-- 题目标题 -->
        <div class="test-question-header">
          <span class="question-icon">🤝</span>
          <span class="question-number">Q${current}</span>
        </div>

        <!-- 题干 -->
        <div class="test-question-body">
          <p class="question-text">${question.text}</p>
          ${question.multi ? '<span class="multi-hint">（可多选）</span>' : ''}
        </div>

        <!-- 选项 -->
        <div class="test-options">
          ${optionsHTML}
        </div>

        <!-- 导航 -->
        <div class="test-nav">
          <button class="btn-test-prev" ${isFirst ? 'disabled' : ''}>← 上一题</button>
          ${isLast
            ? `<button class="btn-test-submit" ${!hasSelection ? 'disabled' : ''}>查看结果 🤝</button>`
            : `<button class="btn-test-next" ${!hasSelection ? 'disabled' : ''}>下一题 →</button>`
          }
        </div>
      </div>
    `;

    bindQuestionEvents(container, question);
    console.log(`[PartnerTest] 渲染 Q${current}/${total}`);
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

        if (question.multi) {
          if (idx > -1) arr.splice(idx, 1);
          else arr.push(optId);
        } else {
          state.answers[qId] = [optId];
        }

        renderQuestion(container);
      });
    });

    // 上一题
    const btnPrev = container.querySelector('.btn-test-prev');
    if (btnPrev && !btnPrev.disabled) {
      btnPrev.addEventListener('click', () => {
        state.currentQuestionIndex--;
        renderQuestion(container);
      });
    }

    // 下一题
    const btnNext = container.querySelector('.btn-test-next');
    if (btnNext && !btnNext.disabled) {
      btnNext.addEventListener('click', () => {
        state.currentQuestionIndex++;
        renderQuestion(container);
      });
    }

    // 提交
    const btnSubmit = container.querySelector('.btn-test-submit');
    if (btnSubmit && !btnSubmit.disabled) {
      btnSubmit.addEventListener('click', () => {
        calculateResult();
        renderResult(container);
      });
    }
  }

  /* ----------------------------------------------------------
   * 计算结果
   * ---------------------------------------------------------- */
  function calculateResult() {
    console.log('[PartnerTest] 开始计算结果');

    // 遍历所有答案，累加分数
    Object.keys(state.answers).forEach(qId => {
      const question = state.questions.find(q => q.id === qId);
      if (!question) return;

      const selectedIds = state.answers[qId];
      selectedIds.forEach(optId => {
        const option = question.options.find(o => o.id === optId);
        if (!option) return;

        // 累加主维度分数
        if (option.scores) {
          Object.keys(option.scores).forEach(dim => {
            if (state.dimensions[dim] !== undefined) {
              state.dimensions[dim] += option.scores[dim];
            }
          });
        }

        // 累加辅助分数
        if (option.aux) {
          Object.keys(option.aux).forEach(aux => {
            if (state.auxiliaryScores[aux] !== undefined) {
              state.auxiliaryScores[aux] += option.aux[aux];
            }
          });
        }
      });
    });

    // 归一化到0-100
    const maxScore = Math.max(...Object.values(state.dimensions));
    if (maxScore > 0) {
      Object.keys(state.dimensions).forEach(key => {
        state.dimensions[key] = Math.round((state.dimensions[key] / maxScore) * 100);
      });
    }

    console.log('[PartnerTest] 维度分数:', state.dimensions);
    console.log('[PartnerTest] 辅助分数:', state.auxiliaryScores);

    // 匹配人格类型
    matchPersonalityType();

    // 匹配玩家
    matchPlayers();

    // 保存结果
    state.completed = true;
    if (window.Storage) {
      Storage.set('partner-result', {
        type: state.personalityType,
        dimensions: state.dimensions,
        matchedPlayers: state.matchedPlayers,
        soulmate: state.soulmate,
        complement: state.complement,
        timestamp: Date.now()
      });
    }

    // 触发回调
    if (state.callbacks.onComplete) {
      state.callbacks.onComplete({
        type: state.personalityType,
        matchedPlayers: state.matchedPlayers
      });
    }

    console.log('[PartnerTest] 结果计算完成');
  }

  /* ----------------------------------------------------------
   * 匹配人格类型
   * ---------------------------------------------------------- */
  function matchPersonalityType() {
    let bestMatch = null;
    let bestScore = -1;

    Object.values(PERSONALITY_TYPES).forEach(type => {
      if (type.condition && type.condition(state.dimensions)) {
        // 计算匹配度
        const score = calculateTypeScore(type);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = type;
        }
      }
    });

    // 如果没有匹配到，选择得分最高的维度对应的类型
    if (!bestMatch) {
      const topDim = Object.keys(state.dimensions).reduce((a, b) => 
        state.dimensions[a] > state.dimensions[b] ? a : b
      );
      
      // 根据最高维度选择类型
      const dimToType = {
        nightOwl: 'nightOwl',
        morningBird: 'morningBird',
        active: 'socialBull',
        diving: 'deepDiver',
        techSkill: 'techGeek',
        writer: 'literaryMaster',
        cardMaker: 'chef',
        freeloader: 'scavenger',
        emotionalValue: 'emotionalSupport',
        funPerson: 'funPerson'
      };
      
      const typeId = dimToType[topDim] || 'deepDiver';
      bestMatch = PERSONALITY_TYPES[typeId];
    }

    state.personalityType = bestMatch;
    console.log('[PartnerTest] 匹配人格类型:', bestMatch.name);
  }

  /* ----------------------------------------------------------
   * 计算类型匹配分数
   * ---------------------------------------------------------- */
  function calculateTypeScore(type) {
    // 简单实现：计算所有维度的总分
    return Object.values(state.dimensions).reduce((sum, val) => sum + val, 0);
  }

  /* ----------------------------------------------------------
   * 匹配玩家
   * ---------------------------------------------------------- */
  function matchPlayers() {
    const matches = [];

    PLAYERS.forEach(player => {
      // 计算相似度（余弦相似度）
      const similarity = calculateSimilarity(state.dimensions, player.dimensions);
      
      matches.push({
        player: player,
        similarity: similarity,
        type: similarity >= 0.8 ? 'soulmate' : similarity <= 0.3 ? 'complement' : 'normal'
      });
    });

    // 排序
    matches.sort((a, b) => b.similarity - a.similarity);

    // 取前3名
    state.matchedPlayers = matches.slice(0, 3);

    // 找灵魂伴侣（相似度最高）
    const soulmateMatch = matches.find(m => m.type === 'soulmate');
    if (soulmateMatch) {
      state.soulmate = soulmateMatch.player;
    } else {
      state.soulmate = matches[0].player; // 最相似的
    }

    // 找互补搭子（相似度最低但不是最后一名）
    const complementMatch = matches.find(m => m.type === 'complement');
    if (complementMatch) {
      state.complement = complementMatch.player;
    } else {
      state.complement = matches[matches.length - 1].player; // 最不相似的
    }

    console.log('[PartnerTest] 匹配玩家完成');
  }

  /* ----------------------------------------------------------
   * 计算相似度（余弦相似度）
   * ---------------------------------------------------------- */
  function calculateSimilarity(dims1, dims2) {
    const keys = Object.keys(dims1);
    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;

    keys.forEach(key => {
      const val1 = dims1[key] || 0;
      const val2 = dims2[key] || 0;
      dotProduct += val1 * val2;
      mag1 += val1 * val1;
      mag2 += val2 * val2;
    });

    mag1 = Math.sqrt(mag1);
    mag2 = Math.sqrt(mag2);

    if (mag1 === 0 || mag2 === 0) return 0;
    return dotProduct / (mag1 * mag2);
  }

  /* ----------------------------------------------------------
   * 渲染结果页
   * ---------------------------------------------------------- */
  function renderResult(container) {
    const type = state.personalityType;
    if (!type) {
      console.error('[PartnerTest] 没有人格类型数据');
      return;
    }

    const topDimensions = getTopDimensions(3);

    container.innerHTML = `
      <div class="test-result partner-result">
        <!-- 返回按钮 -->
        <button class="btn-back-to-tests">← 返回测试中心</button>

        <!-- 主卡片 -->
        <div class="result-card">
          <div class="result-header">
            <span class="result-icon">${type.icon}</span>
            <h2 class="result-title">${type.name}</h2>
          </div>
          
          <div class="result-slogan">${type.slogan}</div>
          
          <div class="result-description">
            <p>${type.description}</p>
          </div>

          <div class="result-tags">
            ${type.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </div>

        <!-- 核心特征 -->
        <div class="result-section">
          <h3 class="section-title">🎯 你的核心特征</h3>
          <div class="dimension-bars">
            ${topDimensions.map(dim => `
              <div class="dimension-bar">
                <span class="dimension-label">${getDimensionLabel(dim.key)}</span>
                <div class="dimension-track">
                  <div class="dimension-fill" style="width: ${dim.value}%; background: linear-gradient(90deg, #60a5fa, #a78bfa)"></div>
                </div>
                <span class="dimension-value">${dim.value}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 最佳搭子匹配 -->
        <div class="result-section">
          <h3 class="section-title">🤝 最佳搭子匹配</h3>
          <div class="partner-matches">
            ${renderPartnerMatches()}
          </div>
        </div>

        <!-- 灵魂伴侣 & 互补搭子 -->
        <div class="result-section">
          <h3 class="section-title">💫 特殊搭子推荐</h3>
          <div class="special-partners">
            ${renderSpecialPartners()}
          </div>
        </div>

        <!-- 搭子宣言 -->
        <div class="result-section">
          <h3 class="section-title">📢 搭子宣言</h3>
          <div class="partner-manifesto">
            <p><strong>最佳匹配类型：</strong>${type.bestMatch}</p>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="result-actions">
          <button class="btn-restart">重新测试</button>
          <button class="btn-share">分享结果</button>
        </div>
      </div>
    `;

    bindResultEvents(container);
    console.log('[PartnerTest] 结果页渲染完成');
  }

  /* ----------------------------------------------------------
   * 获取Top维度
   * ---------------------------------------------------------- */
  function getTopDimensions(count = 3) {
    const entries = Object.entries(state.dimensions);
    entries.sort((a, b) => b[1] - a[1]);
    return entries.slice(0, count).map(([key, value]) => ({ key, value }));
  }

  /* ----------------------------------------------------------
   * 获取维度标签
   * ---------------------------------------------------------- */
  function getDimensionLabel(key) {
    const labels = {
      morningBird: '养生早鸟',
      eveningGold: '晚间黄金档',
      nightOwl: '阴间修仙',
      schrodinger: '薛定谔在线',
      timezone: '时差党',
      cardMaker: '无情造饭机',
      techSkill: '技术力',
      writer: '大文豪',
      screenshotMaster: '截图大师',
      active: '活跃度',
      diving: '潜水深度',
      socialE: '社交e人',
      socialI: '社恐i人',
      helpful: '热心程度',
      emotionalValue: '情绪价值',
      pureLove: '纯爱战神',
      glassLover: '玻璃渣爱好者',
      chaos: '混邪指数',
      seaKing: '海王端水',
      freeloader: '白嫖指数',
      hamster: '赛博仓鼠',
      buddha: '佛系指数',
      loyal: '长情指数',
      funPerson: '乐子人'
    };
    return labels[key] || key;
  }

  /* ----------------------------------------------------------
   * 渲染搭子匹配
   * ---------------------------------------------------------- */
  function renderPartnerMatches() {
    if (!state.matchedPlayers || state.matchedPlayers.length === 0) {
      return '<p class="no-match">暂无匹配搭子</p>';
    }

    return state.matchedPlayers.map((match, index) => {
      const player = match.player;
      const similarity = Math.round(match.similarity * 100);
      
      return `
        <div class="partner-card">
          <div class="partner-rank">#${index + 1}</div>
          <div class="partner-info">
            <div class="partner-header">
              <span class="partner-icon">${player.icon}</span>
              <div class="partner-name-group">
                <h4 class="partner-name">${player.name}</h4>
                <p class="partner-title">${player.title}</p>
              </div>
            </div>
            <div class="partner-attributes">
              ${player.attributes.map(attr => `<span class="attr-tag">${attr}</span>`).join('')}
            </div>
            <div class="partner-similarity">
              <span class="similarity-label">匹配度</span>
              <div class="similarity-bar">
                <div class="similarity-fill" style="width: ${similarity}%"></div>
              </div>
              <span class="similarity-value">${similarity}%</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /* ----------------------------------------------------------
   * 渲染特殊搭子
   * ---------------------------------------------------------- */
  function renderSpecialPartners() {
    let html = '';

    // 灵魂伴侣
    if (state.soulmate) {
      const player = state.soulmate;
      html += `
        <div class="special-partner soulmate">
          <div class="special-badge">💫 灵魂伴侣</div>
          <div class="special-content">
            <span class="special-icon">${player.icon}</span>
            <div class="special-info">
              <h4>${player.name}</h4>
              <p>${player.title}</p>
              <div class="special-desc">
                你们的维度高度相似，能够深刻理解彼此的想法和行为模式。
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // 互补搭子
    if (state.complement) {
      const player = state.complement;
      html += `
        <div class="special-partner complement">
          <div class="special-badge">🔄 互补搭子</div>
          <div class="special-content">
            <span class="special-icon">${player.icon}</span>
            <div class="special-info">
              <h4>${player.name}</h4>
              <p>${player.title}</p>
              <div class="special-desc">
                你们的特质形成互补，能够弥补彼此的不足，创造完美平衡。
              </div>
            </div>
          </div>
        </div>
      `;
    }

    return html || '<p class="no-match">暂无特殊搭子推荐</p>';
  }

  /* ----------------------------------------------------------
   * 绑定结果页事件
   * ---------------------------------------------------------- */
  function bindResultEvents(container) {
    // 返回测试中心
    const btnBack = container.querySelector('.btn-back-to-tests');
    if (btnBack) {
      btnBack.addEventListener('click', () => {
        if (state.callbacks.onBack) {
          state.callbacks.onBack();
        }
      });
    }

    // 重新测试
    const btnRestart = container.querySelector('.btn-restart');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => {
        if (window.Storage) {
          Storage.remove('partner-result');
        }
        resetState();
        render(container, state.callbacks);
      });
    }

    // 分享结果
    const btnShare = container.querySelector('.btn-share');
    if (btnShare) {
      btnShare.addEventListener('click', () => {
        shareResult();
      });
    }
  }

  /* ----------------------------------------------------------
   * 分享结果
   * ---------------------------------------------------------- */
  function shareResult() {
    const type = state.personalityType;
    if (!type) return;

    const text = `我在锦鲤TI测试中是【${type.name}】${type.icon}\n${type.slogan}\n\n来测测你的搭子吧！`;

    if (navigator.share) {
      navigator.share({
        title: '搭子测试结果',
        text: text
      }).catch(err => console.log('分享失败:', err));
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        alert('结果已复制到剪贴板！');
      }).catch(err => {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制');
      });
    } else {
      alert('您的浏览器不支持分享功能');
    }
  }

  /* ----------------------------------------------------------
   * 渲染结果（供外部调用）
   * ---------------------------------------------------------- */
  function renderResultExternal(container, result, callbacks = {}) {
    state.callbacks = callbacks;
    state.personalityType = PERSONALITY_TYPES[result.type] || result.type;
    state.dimensions = result.dimensions || state.dimensions;
    state.matchedPlayers = result.matchedPlayers || [];
    state.soulmate = result.soulmate || null;
    state.complement = result.complement || null;
    state.completed = true;
    
    renderResult(container);
  }

  /* ----------------------------------------------------------
   * 导出接口
   * ---------------------------------------------------------- */
  return {
    init,
    render,
    renderResult: renderResultExternal,
    getState: () => state,
    PERSONALITY_TYPES,
    PLAYERS
  };

})();

window.PartnerTest = PartnerTest;
console.log('[PartnerTest] 搭子测试模块加载完成 ✓');
