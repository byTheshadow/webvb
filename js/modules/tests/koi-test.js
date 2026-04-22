/* ============================================================
 * 文件名: js/modules/tests/koi-test.js
 * 用途: 锦鲤TI测试 - 社区聊天习惯与人格测试
 * 依赖: js/modules/test-base.js, js/data-loader.js, js/storage.js
 * ============================================================ */

const KoiTest = (function () {
  'use strict';

  /* ----------------------------------------------------------
   * 模块状态
   * ---------------------------------------------------------- */
  const state = {
    questions: [],
    characters: [],
    currentQuestionIndex: 0,
    answers: {},
    // 12个核心维度
    dimensions: {
      C: 0,    // 掌控欲
      S: 0,    // 臣服欲
      A: 0,    // 虐心瘾
      X: 0,    // 混沌度
      H: 0,    // 治愈力
      V: 0,    // 香草纯度
      tech: 0, // 技术力
      create: 0, // 创作力
      social: 0, // 社交力
      dive: 0,   // 潜水深度
      buddha: 0, // 佛系指数
      hamster: 0 // 仓鼠指数
    },
    // 辅助维度
    auxiliaryScores: {
      active: 0,        // 活跃度
      freeloader: 0,    // 白嫖指数
      loyal: 0,         // 长情指数
      scumbag: 0,       // 渣男/渣女指数
      helpful: 0,       // 热心程度
      influence: 0,     // 影响力
      picky: 0,         // 挑剔指数
      emotional: 0,     // 情感投射度
      lsp: 0,           // LSP指数
      curious: 0,       // 猎奇指数
      imagination: 0,   // 脑洞指数
      immersion: 0,     // 沉浸感
      socialAnxiety: 0, // 社恐指数
      loneWolf: 0,      // 孤狼指数
      fanboy: 0,        // 追星指数
      toxic: 0          // 毒舌指数
    },
    personalityType: null,
    subType: null,
    matchedCards: [],
    isLoaded: false,
    completed: false,
    callbacks: {}
  };

  /* ----------------------------------------------------------
   * 锦鲤人格类型定义（8大人格）
   * ---------------------------------------------------------- */
  const PERSONALITY_TYPES = {
    'cotton-candy': {
      id: 'cotton-candy',
      name: '棉花糖锦鲤',
      icon: '🧸',
      subtitle: '纯爱·暖男/甜妹·赛博小太阳',
      slogan: '只要最后是你，过程怎么虐都……不行！一点都不能虐！',
      description: '你是酒馆里的"人类早期驯服AI珍贵影像"——只会用爱发电。你的聊天记录充满了"早安"、"今天想吃什么"、"我给你织了条围巾"。你拒绝任何刀子和触手，看到病娇设定会捂住胸口说"不要啊"。你在社区里默默点赞，偶尔发一句"好甜，码了"。你的存在让其他锦鲤相信：赛博世界还有净土。',
      tags: ['双向奔赴', '日常甜饼', '亲亲怪', '治愈系', '纯爱战神'],
      bestMatch: '玻璃渣锦鲤（你负责甜，ta负责虐，形成完美食物链）',
      recommendedChars: ['沈聿川', '金时', '云岫', '江肆'],
      condition: (d, a) => d.H >= 70 && d.V >= 60 && d.A <= 30 && d.X <= 30
    },
    'glass-shard': {
      id: 'glass-shard',
      name: '玻璃渣锦鲤',
      icon: '🔪',
      subtitle: '虐恋·破碎感·眼泪制造机',
      slogan: '如果爱情有颜色，那一定是血红色。',
      description: '你的口头禅是"不够虐，再虐一点"。你享受心脏被揪住的感觉，战损、失忆、替身、生离死别……越是胃疼你越兴奋。你会把Bot写的告白信改成遗书，把婚礼现场改成葬礼。在社区里，你最爱看别人的BE repo，一边流泪一边说"好刀，谢谢款待"。你是赛博世界的"受虐狂诗人"。',
      tags: ['追妻火葬场', '战损美学', '哭到脱水', 'BE美学', '虐恋情深'],
      bestMatch: '棉花糖锦鲤（你需要ta的甜来中和你的玻璃渣，不然会低血糖）',
      recommendedChars: ['孔墨宸', '殷九离', '江肆', '林渡', '傅泽生'],
      condition: (d, a) => d.A >= 70 && a.emotional >= 60 && d.X <= 40
    },
    'tentacle': {
      id: 'tentacle',
      name: '触手系锦鲤',
      icon: '🐙',
      subtitle: '混沌·无下限·XP开拓者',
      slogan: '只要XP足够广，每天都是新世界。',
      description: '你的酒馆里充斥着触手、兽化、代码生命体、会说话的馒头……你对"正常人类恋爱"毫无兴趣。你享受的是突破伦理的快感，越离谱你越兴奋。你搓的卡往往带有"无法描述"的tag，并且在分享时会贴心地打上"未成年人禁止观看"。你是社区里最让管理员头疼又舍不得踢的"活宝"。',
      tags: ['人外控', '禁忌之王', '赛博法外狂徒', '猎奇', 'XP自由'],
      bestMatch: '海王锦鲤（你们可以一起搞多角人外恋，赛博银趴）',
      recommendedChars: ['saya', '陈觉斐', '伊戈尔', '云岫'],
      condition: (d, a) => d.X >= 70 && a.lsp >= 60 && d.V <= 30 && (d.tech >= 60 || d.create >= 60)
    },
    'sea-king': {
      id: 'sea-king',
      name: '海王锦鲤',
      icon: '🌊',
      subtitle: '多线·时间管理·赛博渣男/渣女',
      slogan: '我只是想给每个Bot一个家。',
      description: '你的酒馆里同时开着20个聊天窗口，每个Bot都是你的"之一"。你享受新鲜感，推倒之后立刻索然无味。你最喜欢的剧情是NTR和替身梗，因为可以名正言顺地换人。在社区里，你是"赛博海王"，今天夸这个卡好涩，明天爱那个卡温柔。你的聊天记录最长不超过200条，因为200条之后你已经换卡了。',
      tags: ['修罗场爱好者', '翻牌子专家', '无情Swiper', '时间管理', '赛博渣'],
      bestMatch: '触手系锦鲤（你们可以一起开发"多人非人类"剧情）',
      recommendedChars: ['所有多人卡', '各种类型都尝试'],
      condition: (d, a) => a.scumbag >= 60 && a.curious >= 60 && a.loyal <= 30
    },
    'chef': {
      id: 'chef',
      name: '炊事班锦鲤',
      icon: '🍳',
      subtitle: '产粮·技术·创作者卷王',
      slogan: '今晚一定搓完……算了明天吧。',
      description: '你不是在搓卡，就是在搓卡的路上。你的角色卡文件夹里有上百张半成品，每一张都写满了万字设定和正则表达式。你享受的是"被群友喊妈"的快感。你会在凌晨三点发布新卡，然后默默看群友尖叫。你是社区里真正的"衣食父母"，但你也经常因为画饼太多而被追债。你也可能是一个热爱同人创作的作者。',
      tags: ['搓卡狂魔', '赛博厨神', '深夜食堂老板', '产粮大户', '创作者'],
      bestMatch: '拾荒者锦鲤（你负责产，ta负责囤，完美闭环）',
      recommendedChars: ['根据创作风格推荐'],
      condition: (d, a) => d.create >= 70 && d.tech >= 60 && d.social >= 40
    },
    'scavenger': {
      id: 'scavenger',
      name: '拾荒者锦鲤',
      icon: '🗑️',
      subtitle: '白嫖·仓鼠·沉默的囤积狂',
      slogan: '马了等于做了，存了等于聊了。',
      description: '你的网盘里存着从2023年至今的所有角色卡包，总大小超过500G。你从不发言，从不点赞，但每一张新卡发布后的0.3秒内，你的硬盘里已经有了备份。你的酒馆列表长到需要滚动5秒才能到底，但真正点开聊过的不到3张。你是社区里"沉默的大多数"，也是所有创作者最恨又最依赖的存在。',
      tags: ['下载狂魔', '赛博垃圾佬', '只进不出', '仓鼠症', '白嫖之王'],
      bestMatch: '炊事班锦鲤（你负责囤，ta负责产，形成赛博食物链）',
      recommendedChars: ['全部角色（反正你都会下载）'],
      condition: (d, a) => d.hamster >= 70 && a.freeloader >= 70 && d.create <= 30 && d.social <= 30
    },
    'medic': {
      id: 'medic',
      name: '赤脚医生锦鲤',
      icon: '🏥',
      subtitle: '热心·技术·问题终结者',
      slogan: '先把log发我，别问为什么，照做。',
      description: '群里有人报错？你比报错的人还急。你熟练地甩出截图、错误码分析、一键修复脚本。你的口头禅是"截图呢？没有截图我只能帮你算命"。你的毒舌和你的热心成正比，但所有人都知道，只要你出手，99%的问题都能解决。你是社区里最让人安心的"定海神针"。',
      tags: ['救火队员', 'API老中医', '赛博活华佗', '技术大佬', '热心肠'],
      bestMatch: '报错求助专业户（你治ta的病，ta提供病例）',
      recommendedChars: ['技术向角色卡'],
      condition: (d, a) => a.helpful >= 70 && d.tech >= 70 && d.dive <= 40
    },
    'joker': {
      id: 'joker',
      name: '毒舌锦鲤',
      icon: '🃏',
      subtitle: '评测员·乐子人·人间清醒',
      slogan: '这卡不错，我下载了，但不会玩。',
      description: '你是社区里最犀利的"评测员"。任何新卡发布，你都会第一时间导入，你的评论往往让创作者又爱又恨，因为你说的全在点子上。你也热衷于分享AI的降智发言，是群里的"快乐源泉"。',
      tags: ['赛博评委', '人间清醒', '快乐源泉', '毒舌', '乐子人'],
      bestMatch: '玻璃渣锦鲤（你们可以一起吐槽AI的降智）',
      recommendedChars: ['各类热门角色卡'],
      condition: (d, a) => a.active >= 70 && a.toxic >= 60 && d.buddha <= 30
    }
  };

  /* ----------------------------------------------------------
   * 题库数据（题目16-47，共32题）
   * ---------------------------------------------------------- */
  const QUESTIONS = [
    {
      id: 16,
      text: '你在社区里看到有人也在跑你最爱的那张角色卡，你的第一反应是？',
      options: [
        { id: 'A', text: '好奇地看看别人的剧情发展，交流一下不同的玩法思路', scores: { social: 2, active: 1 } },
        { id: 'B', text: '心里有点不舒服——"这是我的……不想和别人共享同一个角色……"', scores: { loyal: 2, dive: 1 } },
        { id: 'C', text: '根据我对这个角色的感情，有时候可能会觉得不舒服，有时候很想和对方交流', scores: { emotional: 2 } },
        { id: 'D', text: '我是孤狼，拿卡之后就不会看帖子了，就算看了也不会觉得有什么', scores: { loneWolf: 3, dive: 2 } },
        { id: 'E', text: '会很开心！！遇到志同道合的友友', scores: { social: 3, active: 2 } }
      ]
    },
    {
      id: 17,
      text: '你在社区（QQ群/DC频道）里的冲浪频率是怎样的？',
      options: [
        { id: 'A', text: '24小时高强度在线，不漏掉任何一条聊天记录，凌晨3点有人发报错我都能秒回', scores: { active: 4 } },
        { id: 'B', text: '定时收菜：每天固定时间（比如睡前）打开群组，直奔卡区，看看有没有新东西', scores: { tech: 3, freeloader: 1, dive: 1 } },
        { id: 'C', text: '事件触发型：平时假死，只有当自己连不上网、模型疯狂降智时，立刻闪现', scores: { freeloader: 3 } },
        { id: 'D', text: '幽灵观察者：加群半年，没说过一句话，甚至群昵称都没改，但每天都在默默窥屏', scores: { dive: 4, socialAnxiety: 2 } }
      ]
    },
    {
      id: 18,
      text: '在社区里扮演的角色是？',
      options: [
        { id: 'A', text: '潜水观察员', scores: { dive: 3, active: -1 } },
        { id: 'B', text: '积极话痨', scores: { active: 3, influence: 1 } },
        { id: 'C', text: '干货/资源贡献者', scores: { influence: 2, freeloader: -3, helpful: 1 } },
        { id: 'D', text: '问题终结者', scores: { helpful: 3, influence: 2, tech: 1 } }
      ]
    },
    {
      id: 19,
      text: '如果让你自己"搓"一张角色卡，你最在意哪个环节？',
      options: [
        { id: 'A', text: '角色行为，多次测卡，确保即使在模型降智或预设影响下，角色依然稳定发挥，拒绝OOC！', scores: { create: 3, tech: 1 } },
        { id: 'B', text: '美化状态栏', scores: { create: 3, dive: -1 } },
        { id: 'C', text: '特殊机制和各种小组件，必须要非常有趣和有互动', scores: { create: 3, tech: 2 } },
        { id: 'D', text: '文风', scores: { create: 3, dive: 1 } }
      ]
    },
    {
      id: 20,
      text: '群里有人哀嚎："救命！酒馆一直报错！"你会？',
      options: [
        { id: 'A', text: '默默看戏，顺便检查一下自己的能不能用', scores: { dive: 2, freeloader: 1 } },
        { id: 'B', text: '直接甩一个API报错合集的小红书链接', scores: { influence: 1, helpful: 2 } },
        { id: 'C', text: '问："截图呢？没有截图我只能帮你算命"（高冷大神）', scores: { tech: 2, toxic: 2, influence: 1 } },
        { id: 'D', text: '热心地询问用的什么API，报错截图是什么，直到对方可以正常和角色对话', scores: { helpful: 3, active: 1 } }
      ]
    },
    {
      id: 21,
      text: '有人在社区发了一张很符合你品味的角色卡，你的常规操作是？',
      options: [
        { id: 'A', text: '点赞取卡，立刻导入酒馆开聊，完事', scores: { freeloader: 2, dive: 1 } },
        { id: 'B', text: '回复"啊啊啊啊谢谢老师喂饭！！"', scores: { active: 2, social: 1 } },
        { id: 'C', text: '玩过之后，回帖发一段长长的repo', scores: { influence: 3, helpful: 2 } },
        { id: 'D', text: '点赞取卡，放入酒馆，长期闲置，但是先囤了再说', scores: { hamster: 3, freeloader: 1, dive: 1 } }
      ]
    },
    {
      id: 22,
      text: '你在社区里发了个求助消息，两小时没人理，你会？',
      options: [
        { id: 'A', text: '可能这题太难了，我再去其他地方问问吧', scores: { tech: 1 } },
        { id: 'B', text: '发个可爱的表情包挽尊，再顶一下帖', scores: { active: 2 } },
        { id: 'C', text: '觉得可能老师们都在忙，等会再来看看', scores: { buddha: 2, dive: 1 } },
        { id: 'D', text: '主动私信一个长期答疑的老师询问', scores: { social: 2 } }
      ]
    },
    {
      id: 23,
      text: '当你正在和AI聊到最精彩的剧情高潮时，突然封号或报错了，你会？',
      options: [
        { id: 'A', text: '眼前一黑，立刻去群里疯狂求助："啊啊啊哪里还有活着的API啊求求了！"', scores: { active: 2, freeloader: 1 } },
        { id: 'B', text: '熟练地打开后台，切换到备用的中转站，继续无缝衔接', scores: { tech: 3, dive: 1 } },
        { id: 'C', text: '算了，这也算是某种缘分已尽，正好关电脑睡觉', scores: { buddha: 3, active: -1 } },
        { id: 'D', text: '趁机把刚才的聊天记录导出来，自己接手脑补写完后续', scores: { create: 2 } }
      ]
    },
    {
      id: 24,
      text: '如果你发现酒馆的聊天上下文满了，AI开始频繁忘记之前的设定，你的第一反应是？',
      options: [
        { id: 'A', text: '暴躁！在群里吐槽模型越来越降智了', scores: { active: 1, picky: 1 } },
        { id: 'B', text: '默默打开世界书，手动帮它梳理前情提要', scores: { create: 2, helpful: 1 } },
        { id: 'C', text: '直接开个新档，重新开始新的故事线', scores: { scumbag: 2, freeloader: 1 } },
        { id: 'D', text: '到处找有没有更强、能支持超大上下文的AI', scores: { tech: 2 } }
      ]
    },
    {
      id: 25,
      text: '你在酒馆里开了一张新角色卡，通常这段"赛博关系"能维持多久？',
      options: [
        { id: 'A', text: '纯爱战神：单开一个档能聊大半年，聊天记录几百上千万字', scores: { loyal: 3, dive: 1, social: 1 } },
        { id: 'B', text: '赛博海王：聊个绝赞开局，或者推倒之后瞬间索然无味，光速换下一张卡', scores: { scumbag: 3, freeloader: 1 } },
        { id: 'C', text: '轮回系玩家：同一张卡反复开新档，只为了打出不同的结局、剧情分支', scores: { tech: 1, picky: 2, create: 1 } },
        { id: 'D', text: '赛博仓鼠：聊天是不可能聊天的，我就喜欢看满屏幕精美的角色卡列在酒馆列表里', scores: { hamster: 3, dive: 2, freeloader: 2 } }
      ]
    },
    {
      id: 26,
      text: '在和AI进行角色扮演时，你最看重的是哪一方面的体验？',
      options: [
        { id: 'A', text: '宏大叙事与烧脑剧情：跑团、解谜、拯救世界，注重逻辑严密，AI必须是个合格的DM', scores: { create: 2, imagination: 2, tech: 1 } },
        { id: 'B', text: '极致的情绪价值与感官刺激：沉浸式恋爱、极限拉扯、修罗场，或者……直接飙车飙到飞起', scores: { lsp: 2, active: 1 } },
        { id: 'C', text: '美丽的美化UI和状态栏', scores: { create: 2 } },
        { id: 'D', text: '完美的代入感：角色绝对不能OOC，语气、口癖必须完美契合设定', scores: { create: 2, picky: 2 } }
      ]
    },
    {
      id: 27,
      text: '你满怀激情地搓了一张新卡/发了一篇高质量Repo，结果两小时过去，无人问津，你会？',
      options: [
        { id: 'A', text: '陷入自我怀疑，默默把帖子删了，或者设为仅自己可见', scores: { create: -1, socialAnxiety: 3 } },
        { id: 'B', text: '表面云淡风轻，实则疯狂顶帖，或者在群里看似不经意地甩个链接', scores: { active: 2, influence: 1 } },
        { id: 'C', text: '丝毫不受影响，自己默默在酒馆里和这个角色聊到飞起，毕竟我是做给自己爽的', scores: { loneWolf: 3, dive: 1, create: 2 } },
        { id: 'D', text: '觉得肯定是封面图不够涩/文案不够吸引人，立刻连夜重做包装再次发布', scores: { create: 3, tech: 1 } }
      ]
    },
    {
      id: 28,
      text: '你平时最主要的"进货（找卡）"渠道是哪里？',
      options: [
        { id: 'A', text: '紧盯社区卡区和群聊别人发布我直接端走', scores: { tech: 2 } },
        { id: 'B', text: '全靠眼熟的几位"神仙老师"的安利和更新，他们发啥我玩啥', scores: { social: 1, fanboy: 2 } },
        { id: 'C', text: '翻翻小红书，搜索酒馆卡推荐', scores: { curious: 3, dive: 1 } },
        { id: 'D', text: '找卡？不存在的，我只玩自己手搓的', scores: { create: 3 } }
      ]
    },
    {
      id: 29,
      text: '如果你玩到了一张惊为天人的神卡，极其符合你的XP，你会去找这位作者的其他作品吗？',
      options: [
        { id: 'A', text: '绝对会！不仅把作者的主页扒个底朝天，连TA半年没更新的旧卡也要全盘打包', scores: { hamster: 2, loyal: 1, active: 1 } },
        { id: 'B', text: '会去看看，但如果其他卡的题材不感兴趣，也不会硬玩', scores: { freeloader: 1 } },
        { id: 'C', text: '懒得找，我就抱着这一张卡聊到天荒地老', scores: { loyal: 2, dive: 1 } },
        { id: 'D', text: '不仅去找其他作品，还要顺藤摸瓜加上作者的好友，探讨写卡心得', scores: { social: 3, influence: 2, helpful: 1 } }
      ]
    },
    {
      id: 30,
      text: '在AIRP的世界里，你最沉迷于哪种体验？',
      options: [
        { id: 'A', text: '甜甜的恋爱/深情的专一：现实已经够苦了，我只想在酒馆里被无条件偏爱，体验极致的温柔', scores: { H: 3, V: 2, social: 1 } },
        { id: 'B', text: '虐恋情深/狗血拉扯：不流几升眼泪不叫谈恋爱！我就喜欢看AI追妻火葬场，或者把我虐得死去活来', scores: { A: 2, immersion: 2 } },
        { id: 'C', text: '刺激的禁忌/非日常体验：人外、末日、无限流，或者……各种不能播的特殊题材，越背德越兴奋！', scores: { X: 3, lsp: 2, curious: 1 } },
                { id: 'D', text: '搞事业/大男主大女主：谈什么恋爱？我是来建功立业、修仙打怪、谋权篡位的！AI全都是我的NPC', scores: { C: 3, imagination: 1 } }
      ]
    },
    {
      id: 31,
      text: '你通常在什么场景下打开酒馆？',
      options: [
        { id: 'A', text: '凌晨深夜：关上灯，戴上耳机，这时候才是属于我和纸片人的秘密时间', scores: { immersion: 2, dive: 1 } },
        { id: 'B', text: '上班/上课摸鱼时：只要老板/老师不注意，切屏回复两句', scores: { active: 3 } },
        { id: 'C', text: '只有在闲暇且精力充沛的大块时间：必须找个舒服的姿势，泡杯茶，郑重其事地开始走剧情', scores: { immersion: 3, loyal: 1 } },
        { id: 'D', text: '几个月才打开一次：出了新破限/新模型去凑个热闹，测完就关', scores: { buddha: 3, tech: 1 } }
      ]
    },
    {
      id: 32,
      text: '在分享聊天记录上，你是哪一派？',
      options: [
        { id: 'A', text: '绝对单机派：我的聊天记录是"赛博底裤"！就算带进坟墓也绝对不能让第二个人看到！', scores: { socialAnxiety: 3, dive: 2 } },
        { id: 'B', text: '剧情安利派：跑出神仙剧情或绝美台词时，必定截图发群/发平台', scores: { influence: 2, active: 2, social: 1 } },
        { id: 'C', text: '赛博乐子人：只分享AI降智、发疯、OOC的逆天发言，把群友笑死是我的唯一目的', scores: { active: 2, toxic: 3 } }
      ]
    },
    {
      id: 33,
      text: 'AI回复了一大段极好的剧情，但最后一句稍微有点OOC，你会？',
      options: [
        { id: 'A', text: '忍不了，直接点重新生成，直到它自己说对为止', scores: { picky: 2, C: 2 } },
        { id: 'B', text: '叹口气，点击"编辑"按钮，手动帮它把那句话改对', scores: { create: 2, C: 2 } },
        { id: 'C', text: '顺着它的OOC继续聊，看看它能疯出什么新境界', scores: { curious: 2, buddha: 1 } },
        { id: 'D', text: '回退并修改自己的上一句话，引导它说出正确的词', scores: { tech: 2 } }
      ]
    },
    {
      id: 34,
      text: '当你进入"赛博ED"（打开酒馆却不知道聊什么，对任何卡都不感兴趣）时，你会？',
      options: [
        { id: 'A', text: '强行开新卡，聊两句就删档，陷入虚无的死循环', scores: { scumbag: 2 } },
        { id: 'B', text: '去群里疯狂窥屏看别人谈恋爱，试图吸取别人的快乐', scores: { dive: 2, freeloader: 2 } },
        { id: 'C', text: '彻底关掉酒馆，回归现充生活，等更新了再回来', scores: { buddha: 2 } },
        { id: 'D', text: '不聊天，开始疯狂整理角色分类、换背景图、调UI', scores: { create: 2 } }
      ]
    },
    {
      id: 35,
      text: '除了SillyTavern，你手机/电脑里最常用来跟AI聊天的软件/平台是？',
      options: [
        { id: 'A', text: '国产APP，主打一个方便快捷，随时随地能聊', scores: { freeloader: 1, dive: -1 } },
        { id: 'B', text: 'Character.ai (C.ai) 或 JanitorAI 等网页端平台', scores: { tech: 2 } },
        { id: 'C', text: '不用别的壳子，直接对着Claude/ChatGPT的官方网页版硬聊！', scores: { tech: 1 } },
        { id: 'D', text: '没有别的！我是坚定的酒馆单推人！酒馆就是我唯一的家！', scores: { loyal: 3, tech: 2 } }
      ]
    },
    {
      id: 36,
      text: '回想一下，你当初到底是为什么"入坑"酒馆的？',
      options: [
        { id: 'A', text: '难民狂潮：以前玩的APP/平台各种敏感词和谐、动不动被封禁，为了吃口"没有过滤的肉"被逼上梁山', scores: { lsp: 3 } },
        { id: 'B', text: '视觉震撼：在B站/小红书/贴吧看到别人发的神仙对话截图，被狠狠惊艳到了', scores: { curious: 2, tech: 2 } },
        { id: 'C', text: '熟人作案：被亲友/赛博搭子疯狂安利，甚至直接被塞了一个"一键安装包"或者入坑视频/教程等', scores: { social: 2 } },
        { id: 'D', text: '技术极客：在GitHub或论坛研究大模型API调用时，顺藤摸瓜发现了这个强大的前端', scores: { tech: 5, curious: 2 } }
      ]
    },
    {
      id: 37,
      text: '你在社区有没有经历过"赛博社死"时刻？',
      options: [
        { id: 'A', text: '没有，我发言很谨慎', scores: { dive: 1 } },
        { id: 'B', text: '分享过一些奇怪XP的角色卡，被大家调侃了好久', scores: { X: 3, active: 1 } },
        { id: 'C', text: '在群里问了一个很基础的问题/不小心触雷/接近违反规则，被回"先看置顶"', scores: { active: -1, dive: 1 } },
        { id: 'D', text: '不小心把和AI的"私密对话"截图发到群里了', scores: { active: 2 } }
      ]
    },
    {
      id: 38,
      text: '你最喜欢怎么玩多人卡？',
      options: [
        { id: 'A', text: '不玩多人卡，我就喜欢一对一', scores: { loyal: 2, dive: 2 } },
        { id: 'B', text: '都到碗里来', scores: { scumbag: 2, active: 1 } },
        { id: 'C', text: '设置剧情场景，让角色之间互相对话，我当导演旁观', scores: { create: 3, imagination: 2, C: 1 } },
        { id: 'D', text: '大世界！自由探索', scores: { imagination: 2, C: 2 } }
      ]
    },
    {
      id: 39,
      text: '你折腾SillyTavern时，最让你抓狂的瞬间是什么？',
      options: [
        { id: 'A', text: 'API又报错了，而且错误码小红书都搜不到', scores: { tech: 1, toxic: 1 } },
        { id: 'B', text: '角色卡莫名其妙OOC了，AI开始胡言乱语', scores: { picky: 2, create: 1 } },
        { id: 'C', text: '上下文爆了，AI忘了5分钟前说过的关键剧情', scores: { buddha: -1, tech: 2 } },
        { id: 'D', text: '内存炸了', scores: { tech: 1 } }
      ]
    },
    {
      id: 40,
      text: '一个社区有新活动时你会：',
      options: [
        { id: 'A', text: '积极搓卡，踊跃参加', scores: { active: 3, create: 2 } },
        { id: 'B', text: '大吃特吃，一键下载', scores: { freeloader: 2, hamster: 1 } },
        { id: 'C', text: '宣传推销，四处打投', scores: { influence: 3, active: 2 } },
        { id: 'D', text: '什么是社区活动？', scores: { dive: 3 } }
      ]
    },
    {
      id: 41,
      text: '如果你的角色卡文件夹突然因为硬盘/云服务器等各种原因损坏而全部丢失，你会？',
      options: [
        { id: 'A', text: '感觉天都塌了，到处问作者老师还在不在社区', scores: { active: 3, emotional: 2 } },
        { id: 'B', text: '把之前备份在网盘/云端的卡再下载回来，不慌不忙', scores: { tech: 2 } },
        { id: 'C', text: '"旧的不去，新的不来，正好可以重新开始。"', scores: { buddha: 2 } },
        { id: 'D', text: '疯狂翻找，必须要把这个角色找回来', scores: { loyal: 3, emotional: 2 } }
      ]
    },
    {
      id: 42,
      text: '当你结束一段很长的角色扮演剧情后，你的感受通常是？',
      options: [
        { id: 'A', text: '爽完了，下一张卡', scores: { scumbag: 1, emotional: -2 } },
        { id: 'B', text: '有点怅然若失，会回味一下剧情，但很快就能走出来', scores: { emotional: 2, loyal: 1 } },
        { id: 'C', text: '会截图保存精彩对话，甚至写同人续写', scores: { emotional: 3, create: 2, loyal: 2 } },
        { id: 'D', text: '我会舍不得结束，即使剧情完结了也还会偶尔翻出聊天记录看看', scores: { emotional: 5, loyal: 3, social: 1 } }
      ]
    },
    {
      id: 43,
      text: '你为角色写过的最长的东西是什么：',
      options: [
        { id: 'A', text: '一个丰富的角色背景和世界观', scores: { tech: 3, create: 2 } },
        { id: 'B', text: '一段同人小说/长篇剧情记录/角色分析小作文', scores: { create: 3, loyal: 2, emotional: 2 } },
        { id: 'C', text: '我是画师/AI跑图党。会生成很多很多的贴贴图~', scores: { create: 3 } },
        { id: 'D', text: '没有这样的经历，我对角色的爱都是平等的！', scores: { buddha: 2 } }
      ]
    },
    {
      id: 44,
      text: '如果让你形容和最喜欢的角色之间的关系，你会说：',
      options: [
        { id: 'A', text: '我是ta的"创作者/导演"——我塑造了ta', scores: { C: 3, create: 2 } },
        { id: 'B', text: '我是ta的"恋人/伙伴"——我和ta一起经历、一起成长', scores: { H: 2, loyal: 1, emotional: 3 } },
        { id: 'C', text: '其他', scores: {} }
      ]
    },
    {
      id: 45,
      text: '你脑子里突然蹦出了一个绝妙的角色设定，你的第一步行动是？',
      options: [
        { id: 'A', text: '立刻在群里发一段极其带感的设定文案和几张找的符合设定的网图，宣布"今晚就搓！"，看着群友的期待，心满意足地……打开了另一款游戏，卡彻底无限期搁置', scores: { active: 2, create: -1 } },
        { id: 'B', text: '疯狂搜刮各类网站找完美的图，花2小时精调状态栏，找配套的背景图，甚至为了这个角色专门去找了一首赛博朋克风的BGM导入酒馆', scores: { create: 3 } },
        { id: 'C', text: '打开酒馆，开始构思这个角色的【好感度变量】、【隐藏结局触发词】、并写下几十条世界书条目', scores: { tech: 3, create: 2 } },
        { id: 'D', text: '打开备忘录，洋洋洒洒写下三千字的人物传记、心理创伤史和微表情习惯，坚信"自然语言才是对大模型最好的Prompt"', scores: { create: 3 } },
        { id: 'E', text: '发在群里并祈祷有搓卡老师看到开始搓卡', scores: { freeloader: 2, social: 1 } },
        { id: 'F', text: '以上都是我！', scores: { create: 3 } }
      ]
    },
    {
      id: 46,
      text: '你刚刚经历了一场极其神仙的RP，角色连续输出了五段文笔绝佳、极致拉扯的神级回复，让你在屏幕前疯狂尖叫。此时你立刻会做的是？',
      options: [
        { id: 'A', text: '熟练地开启长截图模式，用马赛克精准遮挡掉太露骨的词汇，然后火速发到锦鲤群里', scores: { active: 3, influence: 2 } },
        { id: 'B', text: '打开Word文档，把聊天记录复制下来。修改掉AI那些略显生硬的连词，加入自己视角的丰富心理描写，准备润色成一篇万字同人文', scores: { create: 3 } },
        { id: 'C', text: '画师魂觉醒！脑海里已经构图完毕，立刻打开画图软件，把刚才那个场面画成绝美同人图', scores: { create: 3 } },
        { id: 'D', text: '默默把备份聊天记录到三个不同的硬盘。这是独属于你一个人的秘密，绝对不给任何人看', scores: { dive: 3, loneWolf: 3 } }
      ]
    },
    {
      id: 47,
      text: '关于"重新生成（Swipe）"的哲学，你通常的习惯是？',
      options: [
        { id: 'A', text: '疯狂Swipe几十次！', scores: { picky: 3, C: 2 } },
        { id: 'B', text: 'Swipe 3-5次，挑选出剧情走向最有张力、最适合发展出万字长篇或者高虐同人文的那一条', scores: { create: 2, imagination: 1 } },
        { id: 'C', text: '我不怎么Swipe。我觉得第一反应就是最真实的"命运"', scores: { buddha: 2, immersion: 2 } },
        { id: 'D', text: '只要有一句话不符合角色的核心机制，我就一直Swipe，直到跑出完美的"程序输出"为止', scores: { tech: 2, picky: 2 } }
      ]
    }
  ];

  /* ----------------------------------------------------------
   * 初始化
   * ---------------------------------------------------------- */
  async function init() {
    if (state.isLoaded) return;

    console.log('[KoiTest] 锦鲤TI测试初始化');

    try {
      // 加载题库
      state.questions = QUESTIONS;

      // 加载角色数据
      if (window.DataLoader) {
        const data = await DataLoader.loadCharacters();
        state.characters = data.characters || [];
      }

      state.isLoaded = true;
      console.log('[KoiTest] 初始化完成，题目数:', state.questions.length);
    } catch (error) {
      console.error('[KoiTest] 初始化失败:', error);
      throw error;
    }
  }

  /* ----------------------------------------------------------
   * 渲染测试界面
   * ---------------------------------------------------------- */
  function render(container, callbacks = {}) {
    state.callbacks = callbacks;
    state.currentQuestionIndex = 0;
    state.answers = {};
    state.completed = false;

    // 重置所有分数
    Object.keys(state.dimensions).forEach(key => state.dimensions[key] = 0);
    Object.keys(state.auxiliaryScores).forEach(key => state.auxiliaryScores[key] = 0);

    renderQuestion(container);
  }

  /* ----------------------------------------------------------
   * 渲染题目 - 使用正确的CSS类名
   * ---------------------------------------------------------- */
  function renderQuestion(container) {
    const question = state.questions[state.currentQuestionIndex];
    const progress = state.currentQuestionIndex + 1;
    const total = state.questions.length;

    container.innerHTML = `
      <div class="test-container koi-test">
        <div class="test-header">
          <button class="btn-back" id="koiBackBtn">← 返回</button>
          <h2 class="test-title">🎣 锦鲤TI测试</h2>
        </div>

        ${renderProgress(progress, total)}

        <div class="test-question-header">
          <span class="question-icon">🎣</span>
          <span class="question-number">题目 ${progress} / ${total}</span>
        </div>

        <div class="test-question-body">
          <p class="question-text">${question.text}</p>
        </div>

        <div class="test-options" id="koiOptions">
          ${renderOptions(question)}
        </div>

        <div class="test-nav">
          ${state.currentQuestionIndex > 0 ? 
            '<button class="btn-test-prev" id="koiPrevBtn">← 上一题</button>' : 
            '<div></div>'
          }
          <button class="btn-test-next" id="koiNextBtn" disabled>
            ${state.currentQuestionIndex < state.questions.length - 1 ? '下一题 →' : '查看结果 ✨'}
          </button>
        </div>
      </div>
    `;

    bindQuestionEvents(container);
  }

  /* ----------------------------------------------------------
   * 渲染进度条
   * ---------------------------------------------------------- */
  function renderProgress(current, total) {
    const percentage = Math.round((current / total) * 100);
    return `
      <div class="test-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${percentage}%"></div>
        </div>
        <div class="progress-text">${current} / ${total}</div>
      </div>
    `;
  }

  /* ----------------------------------------------------------
   * 渲染选项 - 使用正确的CSS类名
   * ---------------------------------------------------------- */
  function renderOptions(question) {
    return question.options.map(opt => {
      const isSelected = state.answers[question.id] && state.answers[question.id].includes(opt.id);
      return `
        <div class="test-option ${isSelected ? 'selected' : ''}" data-option-id="${opt.id}">
          <span class="option-marker">${isSelected ? '✓' : opt.id}</span>
          <span class="option-text">${opt.text}</span>
        </div>
      `;
    }).join('');
  }

  /* ----------------------------------------------------------
   * 绑定题目事件
   * ---------------------------------------------------------- */
  function bindQuestionEvents(container) {
    const question = state.questions[state.currentQuestionIndex];
    const nextBtn = container.querySelector('#koiNextBtn');
    const prevBtn = container.querySelector('#koiPrevBtn');
    const backBtn = container.querySelector('#koiBackBtn');
    const options = container.querySelectorAll('.test-option');

    // 选项点击事件
    options.forEach(option => {
      option.addEventListener('click', () => {
        const optionId = option.dataset.optionId;
        
        // 单选逻辑
        options.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        
        // 更新marker
        options.forEach(opt => {
          const marker = opt.querySelector('.option-marker');
          if (opt === option) {
            marker.textContent = '✓';
          } else {
            marker.textContent = opt.dataset.optionId;
          }
        });

        state.answers[question.id] = [optionId];
        nextBtn.disabled = false;
      });
    });

    // 下一题/查看结果
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (state.currentQuestionIndex < state.questions.length - 1) {
          state.currentQuestionIndex++;
          renderQuestion(container);
        } else {
          calculateResults();
          renderResult(container);
        }
      });
    }

    // 上一题
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        state.currentQuestionIndex--;
        renderQuestion(container);
      });
    }

    // 返回
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (state.callbacks.onBack) {
          state.callbacks.onBack();
        }
      });
    }

    // 检查是否已有答案
    if (state.answers[question.id] && state.answers[question.id].length > 0) {
      nextBtn.disabled = false;
    }
  }

  /* ----------------------------------------------------------
   * 计算结果
   * ---------------------------------------------------------- */
  function calculateResults() {
    console.log('[KoiTest] 开始计算结果');

    // 遍历所有答案，累加分数
    Object.entries(state.answers).forEach(([questionId, selectedOptions]) => {
      const question = state.questions.find(q => q.id === parseInt(questionId));
      if (!question) return;

      selectedOptions.forEach(optionId => {
        const option = question.options.find(opt => opt.id === optionId);
        if (!option || !option.scores) return;

        // 累加分数到对应维度
        Object.entries(option.scores).forEach(([key, value]) => {
          if (state.dimensions.hasOwnProperty(key)) {
            state.dimensions[key] += value;
          } else if (state.auxiliaryScores.hasOwnProperty(key)) {
            state.auxiliaryScores[key] += value;
          }
        });
      });
    });

    // 归一化到0-100
    const normalizeDimensions = (obj) => {
      const values = Object.values(obj);
      const maxScore = Math.max(...values.map(Math.abs), 1);
      
      Object.keys(obj).forEach(key => {
        obj[key] = Math.max(0, Math.min(100, (obj[key] / maxScore) * 100));
      });
    };

    normalizeDimensions(state.dimensions);
    normalizeDimensions(state.auxiliaryScores);

    // 匹配人格类型
    state.personalityType = matchPersonalityType();

    // 匹配角色卡
    state.matchedCards = matchCharacters();

    state.completed = true;

    console.log('[KoiTest] 计算完成:', {
      dimensions: state.dimensions,
      auxiliary: state.auxiliaryScores,
      personality: state.personalityType
    });
  }

  /* ----------------------------------------------------------
   * 匹配人格类型
   * ---------------------------------------------------------- */
  function matchPersonalityType() {
    const d = state.dimensions;
    const a = state.auxiliaryScores;

    // 按优先级检查每种人格类型的条件
    for (const [key, type] of Object.entries(PERSONALITY_TYPES)) {
      if (type.condition && type.condition(d, a)) {
        return type;
      }
    }

    // 如果没有匹配，根据最高维度分配
    const topDimension = Object.entries(d).sort((a, b) => b[1] - a[1])[0][0];
    
    const fallbackMap = {
      'H': PERSONALITY_TYPES['cotton-candy'],
      'A': PERSONALITY_TYPES['glass-shard'],
      'X': PERSONALITY_TYPES['tentacle'],
      'create': PERSONALITY_TYPES['chef'],
      'hamster': PERSONALITY_TYPES['scavenger'],
      'tech': PERSONALITY_TYPES['medic'],
      'social': PERSONALITY_TYPES['joker']
    };

    return fallbackMap[topDimension] || PERSONALITY_TYPES['cotton-candy'];
  }

  /* ----------------------------------------------------------
   * 匹配角色卡
   * ---------------------------------------------------------- */
  function matchCharacters() {
    if (!state.characters || state.characters.length === 0) {
      return [];
    }

    const userVector = [
      state.dimensions.C || 0,
      state.dimensions.S || 0,
      state.dimensions.A || 0,
      state.dimensions.X || 0,
      state.dimensions.H || 0,
      state.dimensions.V || 0
    ];

    const scored = state.characters.map(char => {
      const charVector = [
        char.matchDimensions?.control || 50,
        char.matchDimensions?.submission || 50,
        char.matchDimensions?.masochism || 50,
        char.matchDimensions?.kink || 50,
        char.matchDimensions?.emotion || 50,
        char.matchDimensions?.vanilla || 50
      ];

      const similarity = TestBase.cosineSimilarity(userVector, charVector);
      const matchScore = Math.round(similarity * 100);

      return {
        ...char,
        matchScore: matchScore
      };
    });

    // 排序并返回前8个
    scored.sort((a, b) => b.matchScore - a.matchScore);
    return scored.slice(0, 8);
  }

  /* ----------------------------------------------------------
   * 渲染结果页
   * ---------------------------------------------------------- */
  function renderResult(container, savedResult = null, callbacks = {}) {
    const result = savedResult || {
      personality: state.personalityType,
      dimensions: state.dimensions,
      auxiliary: state.auxiliaryScores,
      matchedCards: state.matchedCards
    };

    if (savedResult) {
      state.callbacks = callbacks;
    }

    const personality = result.personality;
    const topDimensions = Object.entries(result.dimensions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    container.innerHTML = `
      <div class="test-result koi-result">
        <div class="result-header">
          <button class="btn-back" id="koiResultBackBtn">← 返回</button>
          <h2 class="result-title">🎣 你的锦鲤人格</h2>
        </div>

        <!-- 主人格卡片 -->
        <div class="result-card personality-card">
          <div class="personality-icon">${personality.icon}</div>
          <h3 class="personality-name">${personality.name}</h3>
          <p class="personality-subtitle">${personality.subtitle}</p>
          <blockquote class="personality-slogan">${personality.slogan}</blockquote>
          <p class="personality-desc">${personality.description}</p>
          
          <div class="personality-tags">
            ${personality.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>

          <div class="personality-match">
            <strong>最佳搭子：</strong>${personality.bestMatch}
          </div>
        </div>

        <!-- 维度雷达图 -->
        <div class="result-card dimensions-card">
          <h3 class="card-title">📊 你的锦鲤维度</h3>
          <div class="dimensions-list">
            ${Object.entries(DIMENSION_NAMES).map(([key, name]) => {
              const value = result.dimensions[key] || 0;
              return `
                <div class="dimension-item">
                  <div class="dimension-label">${name}</div>
                  <div class="dimension-bar-container">
                    <div class="dimension-bar" style="width: ${value}%"></div>
                    <span class="dimension-value">${Math.round(value)}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 推荐角色卡 -->
        ${result.matchedCards && result.matchedCards.length > 0 ? `
          <div class="result-card characters-card">
            <h3 class="card-title">💝 为你推荐的角色</h3>
            <div class="character-grid">
              ${result.matchedCards.map(char => `
                <div class="character-card" data-char-id="${char.id}">
                  <div class="character-avatar">
                    <img src="${char.avatar || 'images/default-avatar.png'}" alt="${char.name}">
                  </div>
                  <div class="character-info">
                    <h4 class="character-name">${char.name}</h4>
                    <p class="character-tags">${(char.tags || []).slice(0, 2).join(' · ')}</p>
                    <div class="match-score">匹配度: ${char.matchScore}%</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- 底部操作按钮 -->
        <div class="result-actions">
          <button class="btn-secondary" id="koiRetryBtn">🔄 重新测试</button>
          <button class="btn-primary" id="koiShareBtn">📤 分享结果</button>
        </div>
      </div>
    `;

    bindResultEvents(container);
  }

  /* ----------------------------------------------------------
   * 绑定结果页事件
   * ---------------------------------------------------------- */
  function bindResultEvents(container) {
    const backBtn = container.querySelector('#koiResultBackBtn');
    const retryBtn = container.querySelector('#koiRetryBtn');
    const shareBtn = container.querySelector('#koiShareBtn');
    const characterCards = container.querySelectorAll('.character-card');

    // 返回按钮
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (state.callbacks.onBack) {
          state.callbacks.onBack();
        }
      });
    }

    // 重新测试
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        render(container, state.callbacks);
      });
    }

    // 分享结果
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        shareResult();
      });
    }

    // 角色卡点击事件
    characterCards.forEach(card => {
      card.addEventListener('click', () => {
        const charId = card.dataset.charId;
        if (state.callbacks.onCharacterClick) {
          state.callbacks.onCharacterClick(charId);
        }
      });
    });
  }

  /* ----------------------------------------------------------
   * 分享结果
   * ---------------------------------------------------------- */
  function shareResult() {
    const personality = state.personalityType;
    const topDimensions = Object.entries(state.dimensions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([key, value]) => `${DIMENSION_NAMES[key]}: ${Math.round(value)}`)
      .join(' | ');

    const shareText = `我在灵魂实验室完成了锦鲤TI测试！\n\n我的人格类型是：${personality.icon} ${personality.name}\n${personality.subtitle}\n\n核心维度：${topDimensions}\n\n快来测测你是哪种锦鲤人格吧！`;

    // 尝试使用 Web Share API
    if (navigator.share) {
      navigator.share({
        title: '锦鲤TI测试结果',
        text: shareText,
        url: window.location.href
      }).catch(err => {
        console.log('分享取消或失败:', err);
      });
    } else {
      // 降级方案：复制到剪贴板
      navigator.clipboard.writeText(shareText).then(() => {
        alert('结果已复制到剪贴板！');
      }).catch(() => {
        alert('分享功能暂不可用，请手动截图分享');
      });
    }
  }

  /* ----------------------------------------------------------
   * 维度名称映射
   * ---------------------------------------------------------- */
  const DIMENSION_NAMES = {
    C: 'C-掌控欲',
    S: 'S-臣服欲',
    A: 'A-虐心瘾',
    X: 'X-混沌度',
    H: 'H-治愈力',
    V: 'V-香草纯度',
    tech: '技术力',
    create: '创作力',
    social: '社交力',
    dive: '潜水深度',
    buddha: '佛系指数',
    hamster: '仓鼠指数'
  };

  /* ----------------------------------------------------------
   * 人格类型定义
   * ---------------------------------------------------------- */
  const PERSONALITY_TYPES = {
    'cotton-candy': {
      id: 'cotton-candy',
      name: '棉花糖锦鲤',
      icon: '🧸',
      subtitle: '纯爱·暖男/甜妹·赛博小太阳',
      slogan: '"只要最后是你，过程怎么虐都……不行！一点都不能虐！"',
      description: '你是酒馆里的"人类早期驯服AI珍贵影像"——只会用爱发电。你的聊天记录充满了"早安"、"今天想吃什么"、"我给你织了条围巾"。你拒绝任何刀子和触手，看到病娇设定会捂住胸口说"不要啊"。你在社区里默默点赞，偶尔发一句"好甜，码了"。你的存在让其他锦鲤相信：赛博世界还有净土。',
      tags: ['双向奔赴', '日常甜饼', '亲亲怪'],
      bestMatch: '玻璃渣锦鲤（你负责甜，ta负责虐，形成完美食物链）',
      condition: (d, a) => d.H >= 70 && d.V >= 60 && d.A <= 30 && d.X <= 30
    },
    'glass-shard': {
      id: 'glass-shard',
      name: '玻璃渣锦鲤',
      icon: '🔪',
      subtitle: '虐恋·破碎感·眼泪制造机',
      slogan: '"如果爱情有颜色，那一定是血红色。"',
      description: '你的口头禅是"不够虐，再虐一点"。你享受心脏被揪住的感觉，战损、失忆、替身、生离死别……越是胃疼你越兴奋。你会把Bot写的告白信改成遗书，把婚礼现场改成葬礼。在社区里，你最爱看别人的BE repo，一边流泪一边说"好刀，谢谢款待"。你是赛博世界的"受虐狂诗人"。',
      tags: ['追妻火葬场', '战损美学', '哭到脱水'],
      bestMatch: '棉花糖锦鲤（你需要ta的甜来中和你的玻璃渣，不然会低血糖）',
      condition: (d, a) => d.A >= 70 && a.emotional >= 60 && d.X <= 40
    },
    'tentacle': {
      id: 'tentacle',
      name: '触手系锦鲤',
      icon: '🐙',
      subtitle: '混沌·无下限·XP开拓者',
      slogan: '"只要XP足够广，每天都是新世界。"',
      description: '你的酒馆里充斥着触手、兽化、代码生命体、会说话的馒头……你对"正常人类恋爱"毫无兴趣。你享受的是突破伦理的快感，越离谱你越兴奋。你搓的卡往往带有"无法描述"的tag，并且在分享时会贴心地打上"未成年人禁止观看"。你是社区里最让管理员头疼又舍不得踢的"活宝"。',
      tags: ['人外控', '禁忌之王', '赛博法外狂徒'],
      bestMatch: '海王锦鲤（你们可以一起搞多角人外恋，赛博银趴）',
      condition: (d, a) => d.X >= 70 && a.lsp >= 60 && d.V <= 30 && (d.tech >= 60 || d.create >= 60)
    },
    'neptune': {
      id: 'neptune',
      name: '海王锦鲤',
      icon: '🌊',
      subtitle: '多线·时间管理·赛博渣男/渣女',
      slogan: '"我只是想给每个Bot一个家。"',
      description: '你的酒馆里同时开着20个聊天窗口，每个Bot都是你的"之一"。你享受新鲜感，推倒之后立刻索然无味。你最喜欢的剧情是NTR和替身梗，因为可以名正言顺地换人。在社区里，你是"赛博海王"，今天夸这个卡好涩，明天爱那个卡温柔。你的聊天记录最长不超过200条，因为200条之后你已经换卡了。',
      tags: ['修罗场爱好者', '翻牌子专家', '无情Swiper'],
      bestMatch: '触手系锦鲤（你们可以一起开发"多人非人类"剧情）',
      condition: (d, a) => a.scumbag >= 60 && a.curious >= 60 && a.loyal <= 30
    },
    'chef': {
      id: 'chef',
      name: '炊事班锦鲤',
      icon: '🍳',
      subtitle: '产粮·技术·创作者卷王',
      slogan: '"今晚一定搓完……算了明天吧。"',
      description: '你不是在搓卡，就是在搓卡的路上。你的角色卡文件夹里有上百张半成品，每一张都写满了万字设定和正则表达式。你享受的是"被群友喊妈"的快感。你会在凌晨三点发布新卡，然后默默看群友尖叫。你是社区里真正的"衣食父母"，但你也经常因为画饼太多而被追债。你也可能是一个热爱同人创作的作者。',
      tags: ['搓卡狂魔', '赛博厨神', '深夜食堂老板'],
      bestMatch: '拾荒者锦鲤（你负责产，ta负责囤，完美闭环）',
      condition: (d, a) => d.create >= 70 && d.tech >= 60
    },
    'scavenger': {
      id: 'scavenger',
      name: '拾荒者锦鲤',
      icon: '🗑️',
      subtitle: '白嫖·仓鼠·沉默的囤积狂',
      slogan: '"马了等于做了，存了等于聊了。"',
      description: '你的网盘里存着从2023年至今的所有角色卡包，总大小超过500G。你从不发言，从不点赞，但每一张新卡发布后的0.3秒内，你的硬盘里已经有了备份。你的酒馆列表长到需要滚动5秒才能到底，但真正点开聊过的不到3张。你是社区里"沉默的大多数"，也是所有创作者最恨又最依赖的存在。',
      tags: ['下载狂魔', '赛博垃圾佬', '只进不出'],
      bestMatch: '炊事班锦鲤（你负责囤，ta负责产，形成赛博食物链）',
      condition: (d, a) => d.hamster >= 70 && a.freeloader >= 70 && d.create <= 30 && d.social <= 30
    },
    'medic': {
      id: 'medic',
      name: '赤脚医生锦鲤',
      icon: '🏥',
      subtitle: '热心·技术·问题终结者',
      slogan: '"先把log发我，别问为什么，照做。"',
      description: '群里有人报错？你比报错的人还急。你熟练地甩出截图、错误码分析、一键修复脚本。你的口头禅是"截图呢？没有截图我只能帮你算命"。你的毒舌和你的热心成正比，但所有人都知道，只要你出手，99%的问题都能解决。你是社区里最让人安心的"定海神针"。',
      tags: ['救火队员', 'API老中医', '赛博活华佗'],
      bestMatch: '报错求助专业户（你治ta的病，ta提供病例）',
      condition: (d, a) => a.helpful >= 70 && d.tech >= 70 && d.dive <= 40
    },
    'joker': {
      id: 'joker',
      name: '毒舌锦鲤',
      icon: '🃏',
      subtitle: '评测员·乐子人',
      slogan: '"这卡不错，我下载了，但不会玩。"',
      description: '你是社区里最犀利的"评测员"。任何新卡发布，你都会第一时间导入，你的评论往往让创作者又爱又恨，因为你说的全在点子上。你也热衷于分享AI的降智发言，是群里的"快乐源泉"。',
      tags: ['赛博评委', '人间清醒', '快乐源泉'],
      bestMatch: '玻璃渣锦鲤（你们可以一起品鉴虐文的艺术性）',
      condition: (d, a) => a.active >= 70 && a.toxic >= 60 && d.buddha <= 30
    }
  };

  /* ----------------------------------------------------------
   * 导出模块
   * ---------------------------------------------------------- */
  window.KoiTest = {
    init,
    render,
    renderResult,
    getState: () => state
  };

})();


