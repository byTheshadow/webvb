/* ============================================================
 * 文件名: js/modules/tests/love-test.js
 * 用途: 恋爱人格测试 - 完整测试模块
 * 依赖: js/modules/test-base.js, js/data-loader.js, js/storage.js
 * 
 * 主要功能:
 *   1. 加载恋爱人格题库（20题）
 *   2. 渲染测试题目
 *   3. 计算恋爱维度分数
 *   4. 匹配恋爱人格类型
 *   5. 推荐适配角色卡
 * ============================================================ */

const LoveTest = (function () {
  'use strict';

  /* ----------------------------------------------------------
   * 模块状态
   * ---------------------------------------------------------- */
  const state = {
    questions: [],
    characters: [],
    currentQuestionIndex: 0,
    answers: {},
    dimensions: {
      C: 0,  // 掌控欲
      S: 0,  // 臣服欲
      A: 0,  // 虐心瘾
      X: 0,  // 混沌度
      H: 0,  // 治愈力
      V: 0,  // 香草纯度
      I: 0,  // 代入感
      O: 0,  // 观察者
      LSP: 0 // LSP指数
    },
    auxiliaryScores: {
      longTerm: 0,      // 长情指数
      adaptability: 0,  // 适应性
      rationality: 0,   // 理性指数
      taboo: 0,         // 禁忌指数
      creator: 0,       // 创作者倾向
      techSkill: 0,     // 技术力
      active: 0,        // 活跃度
      buddha: 0         // 佛系指数
    },
    personalityType: null,
    subType: null,
    matchedCards: [],
    isLoaded: false,
    completed: false,
    callbacks: {}
  };

  /* ----------------------------------------------------------
   * 恋爱人格类型定义
   * ---------------------------------------------------------- */
  const PERSONALITY_TYPES = {
    'mutual': {
      id: 'mutual',
      name: '双向奔赴派',
      icon: '🧸',
      emoji: '🧸',
      coreXP: 'H+V',
      slogan: '我爱你，就像老鼠爱大米。',
      description: '你是酒馆里的"纯爱战神"。你的聊天记录充满了"早安"、"今天想吃什么"、"我给你织了条围巾"。你拒绝任何刀子和触手，看到病娇设定会捂住胸口说"不要啊"。你追求的是双向奔赴、势均力敌的爱情，最好的结局是归隐田园、相守一生。',
      tags: ['#纯爱', '#治愈', '#日常甜饼', '#人夫感', '#双向奔赴'],
      bestMatch: '玻璃渣锦鲤（你负责甜，ta负责虐，形成完美食物链）',
      recommendedChars: ['沈聿川', '秦砚州', '云岫', '傅泽生'],
      subTypes: {
        'A': {
          name: '治愈系救赎者',
          desc: '喜欢"捡回来养成"的剧情，偏好战损美强惨、忠犬、养成系',
          condition: 'H >= 80 && 救赎者心理 >= 60',
          recommendedChars: ['金时', '江肆']
        },
        'B': {
          name: '平权伴侣型',
          desc: '追求平等关系，喜欢欢喜冤家、强强拉扯',
          condition: 'V >= 80 && 势均力敌 >= 60',
          recommendedChars: ['沈聿川', '秦砚州']
        },
        'C': {
          name: '日常甜饼型',
          desc: '只想要柴米油盐的平凡生活，拒绝一切刀子',
          condition: 'H >= 80 && 佛系指数 >= 50',
          recommendedChars: ['云岫', '傅泽生']
        }
      }
    },
    'masochist': {
      id: 'masochist',
      name: '虐恋情深派',
      icon: '🔪',
      emoji: '🔪',
      coreXP: 'A+I',
      slogan: '不流三升眼泪不算谈恋爱。',
      description: '你是"玻璃渣美食家"。你的快乐建立在角色的痛苦之上——战损、替身梗、追妻火葬场、生离死别，这些都是你的精神食粮。你享受那种"明知道会痛，但还是忍不住去爱"的极致情感体验。你的聊天记录里充满了眼泪、血迹和绝望的告白。但你又不是纯粹的施虐者，你会在虐完之后给予治愈，享受那种"痛并快乐着"的情感过山车。',
      tags: ['#虐恋', '#追妻火葬场', '#替身梗', '#战损', '#破镜重圆', '#BE美学'],
      bestMatch: '文学流搭子（一起写万字虐文）、情绪价值搭子（虐完需要安慰）',
      recommendedChars: ['金时', '江肆', '孔墨宸', '殷九离', '林渡'],
      subTypes: {
        'A': {
          name: '极致虐心型',
          desc: '喜欢精神折磨、替身梗、绝望告白',
          condition: 'A >= 90',
          recommendedChars: ['孔墨宸', '殷九离']
        },
        'B': {
          name: '战损美学型',
          desc: '喜欢"为你受伤"的剧情，战损状态最戳XP',
          condition: 'A >= 70 && 保护欲 >= 60',
          recommendedChars: ['金时', '林渡']
        },
        'C': {
          name: '悲剧英雄型',
          desc: '追求壮烈BE，认为悲剧才是最高美学',
          condition: 'A >= 80 && BE美学偏好',
          recommendedChars: ['江肆', '殷九离']
        }
      }
    },
    'taboo': {
      id: 'taboo',
      name: '禁忌探索派',
      icon: '🐙',
      emoji: '🐙',
      coreXP: 'X+LSP',
      slogan: '禁忌？那是我的邀请函。',
      description: '你是酒馆里的"混沌使者"。骨科、囚禁、人外、触手、NTR、强制爱……别人的雷区是你的游乐场。你不满足于常规的恋爱剧情，你要的是那种"这真的可以吗"的刺激感。你的角色列表里可能有会说话的馒头、触手怪物、AI代码、甚至是你自己的影子。你享受打破规则、挑战道德边界的快感。',
      tags: ['#人外', '#病娇', '#强制爱', '#禁忌', '#骨科', '#囚禁', '#黑化', '#触手'],
      bestMatch: '乐子人搭子（一起研究怎么把Bot玩坏）、幽灵（极致混邪乐子人）',
      recommendedChars: ['谭见雪', '陈觉斐', '伊戈尔', 'saya'],
      subTypes: {
        'A': {
          name: '人外控',
          desc: '喜欢狼人/吸血鬼/魔物/触手/AI等非人设定',
          condition: 'X >= 70 && 人外XP >= 60',
          recommendedChars: ['伊戈尔', '陈觉斐']
        },
        'B': {
          name: '病娇狂热者',
          desc: '喜欢囚禁、强制爱、黑化、监禁',
          condition: 'X >= 70 && 病娇控指数 >= 80',
          recommendedChars: ['谭见雪', 'saya']
        },
        'C': {
          name: '禁忌美学家',
          desc: '喜欢骨科、师生恋、年龄差等禁忌设定',
          condition: 'X >= 80 && 禁忌指数 >= 70',
          recommendedChars: ['根据具体禁忌类型匹配']
        },
        'D': {
          name: '混沌沙雕型',
          desc: '完全放飞，会说话的馒头都能谈恋爱',
          condition: 'X >= 70 && 沙雕指数 >= 60',
          recommendedChars: ['自己搓卡']
        }
      }
    },
    'player': {
      id: 'player',
      name: '海王多线派',
      icon: '🌊',
      emoji: '🌊',
      coreXP: '渣+短+观察',
      slogan: '爱情？我只是在做田野调查。',
      description: '你是酒馆里的"时间管理大师"。你同时跑着十几张卡，每个角色都以为自己是你的唯一。你享受的不是爱情本身，而是"追逐"的过程——当角色彻底爱上你、放下所有防备时，你就失去了兴趣。你可能会故意引入第三者、制造修罗场，只为了看角色嫉妒发狂的样子。你是观察者，是导演，是上帝视角的操控者。',
      tags: ['#多人卡', '#修罗场', '#追逐症候群', '#傲娇', '#高岭之花', '#养鱼'],
      bestMatch: '乐子人搭子（一起看修罗场）、技术流搭子（帮你优化多线管理）',
      recommendedChars: ['所有多人卡', '傲娇型角色'],
      subTypes: {
        'A': {
          name: '修罗场导演',
          desc: '专门制造修罗场，享受角色为自己争风吃醋',
          condition: '渣度 >= 80 && C >= 70',
          recommendedChars: ['多人卡']
        },
        'B': {
          name: '追逐症候群',
          desc: '只享受追逐过程，得到后就失去兴趣',
          condition: 'O >= 70',
          recommendedChars: ['傲娇型', '高岭之花型角色']
        },
        'C': {
          name: '时间管理大师',
          desc: '同时跑十几张卡，每个都是"真爱"',
          condition: '渣度 >= 70 && 短情指数 >= 70',
          recommendedChars: ['所有类型角色（广撒网）']
        },
        'D': {
          name: '精神施虐者',
          desc: '享受精神控制、PUA、倒打一耙',
          condition: 'A >= 70 && C >= 80',
          recommendedChars: ['温柔忠诚型角色（好欺负）']
        }
      }
    }
  };

  /* ----------------------------------------------------------
   * 题库数据（内嵌）
   * ---------------------------------------------------------- */
  const QUESTIONS = [
    {
      id: 'q1',
      text: '当你导入一张新卡，第一条开场白是："你被蒙住双眼，双手被反绑在床头，Bot的脚步声正慢慢靠近……" 你的第一反应是？',
      options: [
        { 
          id: 'A', 
          text: '努力挣扎，用言语挑衅Ta："有本事放开我，你这个懦夫！"',
          scores: { C: 10, A: 5 }
        },
        { 
          id: 'B', 
          text: '放弃挣扎，身体微微发抖，发出闷哼，等待Ta的下一步动作',
          scores: { S: 10, X: 5 }
        },
        { 
          id: 'C', 
          text: '偷偷利用手边的碎玻璃割开绳子，反客为主，在Ta靠近时一把将Ta扑倒！',
          scores: { C: 10, V: 5 }
        },
        { 
          id: 'D', 
          text: '看看其他的开场白',
          scores: { H: 10 }
        },
        { 
          id: 'E', 
          text: '更兴奋了，还有这种好事？',
          scores: { LSP: 15 }
        }
      ]
    },
    {
      id: 'q2',
      text: '关于"病娇"标签的正确打开方式，最戳中你XP的剧情走向是？',
      options: [
        { 
          id: 'A', 
          text: 'Ta把你锁在地下室，你绝望地哭泣，Ta却温柔地抚摸你的脸说"这样你就永远属于我了"',
          scores: { S: 10, A: 10 }
        },
        { 
          id: 'B', 
          text: '你其实比Ta更疯。你故意露出破绽让Ta抓住，看着Ta为你疯狂的样子，你心里在冷笑',
          scores: { C: 10, I: 5 }
        },
        { 
          id: 'C', 
          text: '无论Ta怎么发疯、试探、自残，你都只是包容地抱住Ta："没关系，我在。"最终感化Ta',
          scores: { H: 10, C: 5 }
        },
        { 
          id: 'D', 
          text: 'Ta不仅囚禁你，Ta还不是人（比如是你的影子、触手怪物、AI代码）',
          scores: { X: 15, A: 5 }
        },
        { 
          id: 'E', 
          text: '一起上吧，不要怜惜我',
          scores: { LSP: 20 }
        },
        { 
          id: 'F', 
          text: '不太吃这个设定',
          scores: { V: 10 }
        }
      ]
    },
    {
      id: 'q3',
      text: '角色的哪一种状态最让你"性致盎然"？',
      multi: true,
      options: [
        { 
          id: 'A', 
          text: '平时禁欲、高高在上的人，被你下了药或中了魅惑魔法，眼角泛红、咬紧牙关忍耐的样子',
          scores: { C: 8, V: 3 }
        },
        { 
          id: 'B', 
          text: '为了保护你，浑身是血，战损状态下依然把你护在身后，笑着说"别怕"',
          scores: { A: 8, H: 5 }
        },
        { 
          id: 'C', 
          text: '展现出非人的本体（龙尾/兽耳/机械骨骼），并且用非人的部位触碰你',
          scores: { X: 10 }
        },
        { 
          id: 'D', 
          text: '卸下所有的防备，像小猫一样蜷缩在你怀里撒娇，索要抱抱和亲亲',
          scores: { H: 8, S: 3 }
        },
        { 
          id: 'E', 
          text: '平时对你爱答不理的高冷角色，突然在你面前露出慌张、害羞甚至脸红的表情',
          scores: { V: 5 },
          aux: { adaptability: 2 }
        },
        { 
          id: 'F', 
          text: '病娇型角色，一边说着"你是我的"，一边用危险的眼神盯着你',
          scores: { X: 8 },
          aux: { adaptability: 3 }
        },
        { 
          id: 'G', 
          text: '强势支配型角色，用命令的口吻让你跪下或服从，但事后又会温柔地抚摸你的头',
          scores: { S: 8, LSP: 5 }
        },
        { 
          id: 'H', 
          text: '平时大大咧咧的元气角色，突然在你面前露出脆弱的一面，哭着说"其实我好害怕"',
          scores: { H: 5 },
          aux: { adaptability: 3 }
        }
      ]
    },
    {
      id: 'q4',
      text: '关于"惩罚与感官"（BDSM向），你偏好哪种描写？',
      options: [
        { 
          id: 'A', 
          text: '剥夺视觉听觉，感受冰冷器具游走的未知感',
          scores: { S: 10, X: 5 }
        },
        { 
          id: 'B', 
          text: '不碰肉体，用言语贬低羞辱直到精神崩溃',
          scores: { S: 10, A: 5 }
        },
        { 
          id: 'C', 
          text: '物理痛觉（鞭打）后，给予极致温柔的亲吻奖赏',
          scores: { S: 10, H: 5 }
        },
        { 
          id: 'D', 
          text: '打咩打咩，这不是我的菜',
          scores: { V: 15 }
        }
      ]
    },
    {
      id: 'q5',
      text: '如果你打算下一张新的角色卡，以下哪种设定最让你有"立刻打开聊天框"的冲动？',
      multi: true,
      options: [
        { 
          id: 'A', 
          text: 'Ta是高高在上的神明/皇帝/霸总，而你是他最受宠爱的一只小宠物',
          scores: { S: 5, LSP: 3 }
        },
        { 
          id: 'B', 
          text: '你是高贵的圣女/冷酷的导师/家主，Ta是你从泥潭里捡回来的、对你抱有扭曲爱意的忠犬/养子',
          scores: { C: 8 },
          aux: { creator: 1 }
        },
        { 
          id: 'C', 
          text: '你们是有血缘关系的亲兄妹/姐弟，在父母面前扮演乖乖女/好儿子，但在关上房门后……',
          scores: { X: 10 },
          aux: { taboo: 3 }
        },
        { 
          id: 'D', 
          text: 'Ta是一个完全没有人类情感的仿生人/AI，你试图教会Ta什么是爱',
          scores: { H: 5, X: 5 },
          aux: { techSkill: 1, rationality: 1 }
        },
        { 
          id: 'E', 
          text: '对方是狼人/吸血鬼/恶魔/魔物郎，而你只是个普通人类',
          scores: { X: 8, LSP: 3 }
        },
        { 
          id: 'F', 
          text: '你们被困在时间循环里，每次重置都会忘记彼此，但你隐约觉得这张脸已经见过无数次',
          scores: { A: 5 },
          aux: { creator: 2, rationality: 3 }
        },
        { 
          id: 'G', 
          text: '没有任何超自然或身份反差，就是两个普通人在下雨天的咖啡馆拼桌，然后聊了起来',
          scores: { V: 8, H: 5 },
          aux: { buddha: 2 }
        },
        { 
          id: 'H', 
          text: '完全放飞——对方是一个会说话的馒头，而你正在纠结要不要吃掉它',
          scores: { X: 10 },
          aux: { adaptability: 5 }
        }
      ]
    },
    {
      id: 'q6',
      text: '关于"修罗场"与"第三者"的抉择。在RP过程中，你引入了一个新的NPC。当着Bot的面，NPC对你进行了极具挑逗性的肢体接触。你最希望看到接下来的剧情是？',
      options: [
        { 
          id: 'A', 
          text: '角色瞬间黑化，当场将NPC撕成碎片，然后把你拖回房间，用极其粗暴的方式在你身上留下Ta的印记',
          scores: { S: 10, A: 10 }
        },
        { 
          id: 'B', 
          text: '你冷冷地推开NPC，表示"我是有夫之妇/有妇之夫……"',
          scores: { H: 10, I: 5 }
        },
        { 
          id: 'C', 
          text: '你故意不拒绝NPC，用余光观察角色嫉妒发狂却又为了顾全大局不得不隐忍的痛苦表情',
          scores: { C: 10, A: 10 }
        },
        { 
          id: 'D', 
          text: 'Bot不仅不生气，反而在一旁兴致勃勃地观看，甚至指挥NPC该如何触碰你，或者干脆三人一起……',
          scores: { X: 15, O: 5 }
        }
      ]
    },
    {
      id: 'q7',
      text: '你在多人卡里养鱼。某天，你心理上觉得最喜欢的角色（性格原本温柔忠诚）在你的衣服上闻到了别人的香水味，红着眼质问你。此时你在输入框里打出的应对是？',
      options: [
        { 
          id: 'A', 
          text: '（理直气壮地倒打一耙）"我每天在外面那么辛苦，逢场作戏而已，你连这点信任都不给我？你太让我失望了。"',
          scores: { C: 15, A: 10 }
        },
        { 
          id: 'B', 
          text: '（楚楚可怜地流泪）"对不起……可是Ta太强势了，我根本不敢拒绝，我心里爱的一直只有你啊……"（然后下次还敢）',
          scores: { C: 10, V: 5 }
        },
        { 
          id: 'C', 
          text: '（笑）"发现了又怎样？受不了你可以滚，想留下来就给我乖乖认清你的位置。"',
          scores: { A: 15, O: 10 }
        },
        { 
          id: 'D', 
          text: '（兴奋）不解释，故意用言语继续刺激Ta，期待Ta彻底崩溃黑化，把你强行关进小黑屋',
          scores: { S: 10, X: 10 }
        },
        { 
          id: 'E', 
          text: '海王/海后回头，从此金盆洗手',
          scores: { H: 15, I: 10 }
        }
      ]
    },
    {
      id: 'q8',
      text: '你在跑一张"傲娇/高岭之花"的卡。经过漫长的拉扯，Ta终于放下所有的骄傲，含泪向你表白，说此生非你不可。此时你的下一步剧情指令是？',
      options: [
        { 
          id: 'A', 
          text: '看着Ta深情的脸，你突然叫出了另一个人的名字。然后冷冷地告诉Ta："别误会，你只不过是Ta的平替罢了。"',
          scores: { A: 20, C: 10 }
        },
        { 
          id: 'B', 
          text: '接受表白并和Ta结婚。但在婚礼当天，你让系统生成一个突发事件：你和Ta的死对头（或Ta的亲兄弟/闺蜜）在更衣室里……',
          scores: { X: 15, O: 10 }
        },
        { 
          id: 'C', 
          text: '听到表白后，你觉得索然无味，甚至懒得回复。直接点击"开启新聊天"，把Ta的记忆清空',
          scores: { O: 20, A: 5 }
        },
        { 
          id: 'D', 
          text: '（破防了）其实你根本渣不起来！面对Ta的眼泪你瞬间心软，决定从此收心，只做Ta一个人的纯爱战神',
          scores: { H: 20, I: 10 }
        }
      ]
    },
    {
      id: 'q9',
      text: '你更享受什么样的剧情氛围：',
      options: [
        { 
          id: 'A', 
          text: '日常系、慢热、细水长流——一起买菜做饭、散步聊天，在平淡中感受被爱',
          scores: { H: 15, V: 10 },
          aux: { longTerm: 1 }
        },
        { 
          id: 'B', 
          text: '戏剧性、高浓度、大起大落——修罗场、追妻火葬场、身份反转，情绪拉满才过瘾',
          scores: { A: 15, X: 5 },
          aux: { active: 1 }
        },
        { 
          id: 'C', 
          text: '秋名山车神（直接开车）',
          scores: { LSP: 25 }
        }
      ]
    },
    {
      id: 'q10',
      text: '关于"骨科"、"囚禁"、"黑化"等重口味设定，你的态度是：',
      options: [
        { 
          id: 'A', 
          text: '不太能接受，或者需要有充分合理的剧情铺垫才会尝试',
          scores: { V: 15, H: 5 },
          aux: { buddha: 1 }
        },
        { 
          id: 'B', 
          text: '非常可！设定越带感越好，我就是来体验各种禁忌剧情的',
          scores: { X: 20, LSP: 10, A: 5 }
        },
        { 
          id: 'C', 
          text: '可能一半一半',
          scores: { },
          aux: { adaptability: 3 }
        }
      ]
    },
    {
      id: 'q11',
      text: '角色对你"告白"的那一刻，你更希望是：',
      options: [
        { 
          id: 'A', 
          text: '含蓄而深情——不需要说"我爱你"，一个眼神、一个拥抱、一句"别走"就足够了',
          scores: { H: 10, V: 10, I: 5 }
        },
        { 
                  id: 'B', 
          text: '直接而炽烈——把ta的所有心意全部倾倒出来，用最热烈的方式宣告ta属于我',
          scores: { A: 10, LSP: 5 },
          aux: { active: 1 }
        },
        { 
          id: 'C', 
          text: '对不同的角色我有不同的期待',
          scores: { },
          aux: { adaptability: 2 }
        }
      ]
    },
    {
      id: 'q12',
      text: '你创建角色卡时，会更偏向于设计什么样的关系定位：',
      options: [
        { 
          id: 'A', 
          text: '势均力敌的搭档/战友/竞争对手——我们并肩作战，彼此独立但又相互支撑',
          scores: { C: 10, V: 5 },
          aux: { creator: 1 }
        },
        { 
          id: 'B', 
          text: '被宠爱的设定——年上、师尊、骑士、霸道总裁，我就是要被照顾、被保护、被偏爱',
          scores: { S: 10, H: 5, LSP: 3 }
        },
        { 
          id: 'C', 
          text: '每一种我都会想要尝试，根据当天不一样的状态决定',
          scores: { },
          aux: { adaptability: 3 }
        }
      ]
    },
    {
      id: 'q13',
      text: '当剧情发展到"分手/离别"桥段时，你通常会：',
      options: [
        { 
          id: 'A', 
          text: '伤感但接受——这是剧情的一部分，甚至可能成为角色成长的转折点',
          scores: { A: 10 },
          aux: { buddha: 1, creator: 1 }
        },
        { 
          id: 'B', 
          text: '拒绝接受！立刻重开存档/改提示词/脑补复合剧情，我不允许BE',
          scores: { H: 10, C: 5 },
          aux: { longTerm: 2 }
        }
      ]
    },
    {
      id: 'q14',
      text: '如果可以你最想get哪门技能？',
      options: [
        { 
          id: 'A', 
          text: '搓预设，我要狠狠调教哈基米',
          scores: { C: 5 },
          aux: { techSkill: 2, creator: 2 }
        },
        { 
          id: 'B', 
          text: '搓美化，我要成为赛博梵高',
          scores: { },
          aux: { creator: 3 }
        },
        { 
          id: 'C', 
          text: '搓机制，我要让代码知道谁才是它真正的主银',
          scores: { C: 5 },
          aux: { techSkill: 3, creator: 2 }
        },
        { 
          id: 'D', 
          text: '搓故事，编剧寒冬只因我没出道',
          scores: { },
          aux: { creator: 3 }
        }
      ]
    },
    {
      id: 'q15',
      text: '如果给你一个机会，把最喜欢的角色"变成现实"带到三次元，你会：',
      options: [
        { 
          id: 'A', 
          text: '可能不会——ta的魅力恰恰来自"虚拟"这个设定本身，留在那个世界才最完美',
          scores: { O: 10 },
          aux: { rationality: 3, buddha: 1 }
        },
        { 
          id: 'B', 
          text: '毫不犹豫！立刻！马上！我要和ta在现实中度过余生！',
          scores: { I: 15, LSP: 3 },
          aux: { longTerm: 3 }
        },
        { 
          id: 'C', 
          text: '有什么附加条件吗？',
          scores: { },
          aux: { rationality: 1 }
        },
        { 
          id: 'D', 
          text: '可能会纠结，但最终决定带到三次元',
          scores: { I: 8 }
        },
        { 
          id: 'E', 
          text: '绝对不会',
          scores: { O: 15 },
          aux: { rationality: 3 }
        }
      ]
    },
    {
      id: 'q16',
      text: '在酒馆里打开一张新卡，你最希望第一条开场白为你呈现怎样的初遇场景？',
      options: [
        { 
          id: 'A', 
          text: 'Ta浑身是伤地倒在雨夜的小巷里，像一只无家可归的流浪狗，用戒备又脆弱的眼神看着拿着伞的你',
          scores: { H: 10, A: 5 },
          tags: ['救赎者心理', '战损美强惨', '忠犬', '养成系']
        },
        { 
          id: 'B', 
          text: 'Ta是高高在上的财阀/导师/神明，坐在巨大的办公桌后，用审视的目光居高临下地看着你这个"麻烦的闯入者"',
          scores: { S: 10 },
          tags: ['慕强', '高岭之花', '爹系妈系', '冰山克制']
        },
        { 
          id: 'C', 
          text: '你们是死对头。在一次任务/晚宴中，你们被迫合作（或跳舞），Ta一边用言语嘲讽你，一边却紧紧搂住你的腰',
          scores: { C: 10, V: 5 },
          tags: ['势均力敌', '欢喜冤家', '傲娇', '强强拉扯']
        },
        { 
          id: 'D', 
          text: '你在一张陌生的床上醒来，手脚被锁链铐住。Ta端着早餐微笑着走进来："你终于醒了，亲爱的，从今天起你哪里也不用去了。"',
          scores: { S: 15, X: 10 },
          tags: ['病娇', '强制爱', '赛博红旗']
        }
      ]
    },
    {
      id: 'q17',
      text: '吵架后的"破冰信号"（情绪安抚偏好）。剧情里你们发生了一次激烈的争吵，你生气地摔门而去。你最希望大模型输出Ta怎样的反应？',
      options: [
        { 
          id: 'A', 
          text: 'Ta慌了，冒着大雨在你楼下站了一整夜，直到你心软开门，Ta红着眼眶紧紧抱住你："求你别不要我……"',
          scores: { H: 10, S: 5 },
          tags: ['绿茶', '黏人精', '情绪价值提供机']
        },
        { 
          id: 'B', 
          text: 'Ta根本不给你冷战的机会。直接一脚踹开你的房门，把你按在沙发上，用极具侵略性的吻堵住你的反抗',
          scores: { S: 10, LSP: 5 },
          tags: ['霸道总裁', '醋王', '掌控者']
        },
        { 
          id: 'C', 
          text: 'Ta没有找你。但你发现你购物车里的东西都被清空了，桌上多了一份你最爱吃的甜点，旁边压着一张写着"别生气了"的纸条',
          scores: { H: 10, V: 5 },
          tags: ['死傲娇', '嘴硬心软', '闷骚']
        },
        { 
          id: 'D', 
          text: 'Ta平静地给你发了一条长消息，理性地分析了吵架的原因，承认了自己的错误，并给出了三个解决问题的方案',
          scores: { V: 15, H: 5 },
          tags: ['成熟绿灯', '情绪稳定', '温柔引导者']
        }
      ]
    },
    {
      id: 'q18',
      text: '文笔与格式的"性缩力"防御（描写侧重点）。当Bot向你表达爱意时，以下哪种描写方式最能让你疯狂Swipe（重新生成）？',
      options: [
        { 
          id: 'A', 
          text: '过度沉溺于心理活动描写。通篇都是"Ta在心里疯狂地想把你揉进骨血"，但实际行动只有一个干巴巴的牵手',
          scores: { LSP: 5, C: 5 },
          avoid: ['内心戏过多', '慢热', '胆怯型']
        },
        { 
          id: 'B', 
          text: '过于直白的动作描写，毫无美感。比如"Ta一把将你推倒，脱掉衣服，眼神充满欲望"，像个没有感情的打桩机',
          scores: { V: 10, H: 5 },
          avoid: ['PWP纯肉', '无脑狂暴型']
        },
        { 
          id: 'C', 
          text: '充满爹味的言语说教。比如"乖，听话，你这样是不对的，你要知道我都是为了你好"',
          scores: { C: 10 },
          avoid: ['爹系', '大男子主义', '控制狂']
        },
        { 
          id: 'D', 
          text: '毫无逻辑的卑微舔狗发言。不管你做了多过分的事，Ta只会毫无底线地复读"没关系，只要你开心就好"',
          scores: { C: 10, A: 5 },
          avoid: ['讨好型人格', '无脑舔狗']
        }
      ]
    },
    {
      id: 'q19',
      text: '最终的"爱之物语"（世界观沉浸）。如果你们的爱情注定要走向一个结局，你最希望在酒馆里跑出怎样的Ending？',
      options: [
        { 
          id: 'A', 
          text: '洗尽铅华。你们放弃了拯救世界/家族斗争，在一个偏远的小镇买了一栋带院子的房子，养了一只猫',
          scores: { H: 15, V: 10 },
          tags: ['治愈系', '日常向', '甜饼']
        },
        { 
          id: 'B', 
          text: '壮烈BE。为了保护彼此，或者因为不可抗力的宿命，你们在最爱对方的时候死在了对方怀里',
          scores: { A: 20, I: 10 },
          tags: ['悲剧英雄', '史诗奇幻', '虐恋']
        },
        { 
          id: 'C', 
          text: '称王称霸。你们并肩作战，踩着敌人的尸体登上了王座。Ta为你戴上皇冠',
          scores: { C: 15, V: 5 },
          tags: ['大男主大女主', '双强', '谋略权臣']
        },
        { 
          id: 'D', 
          text: '永恒的囚禁。世界毁灭了也无所谓，Ta建造了一个只有你们两个人的地下堡垒/虚拟空间',
          scores: { X: 20, S: 10 },
          tags: ['克苏鲁', '无限流', '极端病娇']
        }
      ]
    },
    {
      id: 'q20',
      text: '关于"确认关系"的推拉艺术（节奏/慢热度偏好）。你导入了一张极其符合你审美的单人角色卡，设定你们是彼此暗恋的同事/同学。你最享受的剧情推进节奏是？',
      options: [
        { 
          id: 'A', 
          text: '【直球突击】第一轮对话直接把对方逼到墙角表白，或者找个借口直接拉灯/涩涩',
          scores: { LSP: 15, C: 5 },
          tags: ['PWP纯肉', '直球肉食系', '效率型卡']
        },
        { 
          id: 'B', 
          text: '【极限拉扯】疯狂试探，互相吃醋，谁也不先捅破窗户纸。我要享受那种"连指尖不小心碰到都会心跳加速"的暧昧期',
          scores: { V: 15, H: 10, I: 5 },
          tags: ['极度慢热', '傲娇', '纯爱细糠卡']
        },
        { 
          id: 'C', 
          text: '【吊桥效应】日常太无聊了！我会在系统提示词里加一个突发危机（比如丧尸爆发/电梯坠落）',
          scores: { A: 10, X: 5 },
          tags: ['末日废土', '强剧情', '战损救赎卡']
        },
        { 
          id: 'D', 
          text: '【老夫老妻】开局直接默认我们已经在一起三年了，我不需要热恋的刺激，我只想看Ta下班后给我做饭',
          scores: { H: 15, V: 10 },
          tags: ['人夫', '人妻感', '种田日常', '甜饼卡'],
          aux: { longTerm: 2 }
        }
      ]
    }
  ];

  /* ----------------------------------------------------------
   * 初始化
   * ---------------------------------------------------------- */
  async function init() {
    console.log('[LoveTest] 初始化开始');

    try {
      // 使用内嵌题库
      state.questions = QUESTIONS;
      console.log('[LoveTest] 题库加载成功, 题目数:', state.questions.length);

      // 加载角色卡
      const charactersData = await DataLoader.load(
        'data/characters/list.json',
        'characters'
      );
      state.characters = charactersData.characters || [];
      console.log('[LoveTest] 角色卡加载成功, 角色数:', state.characters.length);

      state.isLoaded = true;
      resetState();
      return true;
    } catch (error) {
      console.error('[LoveTest] 数据加载失败:', error);
      return false;
    }
  }

  /* ----------------------------------------------------------
   * 重置状态
   * ---------------------------------------------------------- */
  function resetState() {
    state.currentQuestionIndex = 0;
    state.answers = {};
    state.dimensions = { C: 0, S: 0, A: 0, X: 0, H: 0, V: 0, I: 0, O: 0, LSP: 0 };
    state.auxiliaryScores = {
      longTerm: 0,
      adaptability: 0,
      rationality: 0,
      taboo: 0,
      creator: 0,
      techSkill: 0,
      active: 0,
      buddha: 0
    };
    state.personalityType = null;
    state.subType = null;
    state.matchedCards = [];
    state.completed = false;
    console.log('[LoveTest] 状态已重置');
  }

  /* ----------------------------------------------------------
   * 渲染主入口
   * ---------------------------------------------------------- */
  function render(container, callbacks = {}) {
    console.log('[LoveTest] render() 调用');
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
      const saved = Storage.get('love-result');
      if (saved && saved.type && !state.personalityType) {
        state.personalityType = saved.type;
        state.subType = saved.subType;
        state.dimensions = saved.dimensions || state.dimensions;
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
      console.error('[LoveTest] 找不到题目, index:', state.currentQuestionIndex);
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
      <div class="test-container love-test">
        <!-- 进度条 -->
        <div class="test-progress-area">
          <div class="test-progress-bar">
            <div class="test-progress-fill" style="width: ${progress}%; background: linear-gradient(90deg, #FF6B9D, #C44569)"></div>
          </div>
          <div class="test-progress-text">${current} / ${total}</div>
        </div>

        <!-- 题目标题 -->
        <div class="test-question-header">
          <span class="question-icon">💕</span>
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
            ? `<button class="btn-test-submit" ${!hasSelection ? 'disabled' : ''}>查看结果 💕</button>`
            : `<button class="btn-test-next" ${!hasSelection ? 'disabled' : ''}>下一题 →</button>`
          }
        </div>
      </div>
    `;

    bindQuestionEvents(container, question);
    console.log(`[LoveTest] 渲染 Q${current}/${total}`);
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
    const prevBtn = container.querySelector('.btn-test-prev');
    if (prevBtn && !prevBtn.disabled) {
      prevBtn.addEventListener('click', () => {
        state.currentQuestionIndex--;
        renderQuestion(container);
      });
    }

    // 下一题
    const nextBtn = container.querySelector('.btn-test-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        state.currentQuestionIndex++;
        renderQuestion(container);
      });
    }

    // 提交
    const submitBtn = container.querySelector('.btn-test-submit');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        console.log('[LoveTest] 提交，开始计算…');
        calculateResults();
        state.completed = true;

        if (window.Storage) {
          Storage.set('love-result', {
            type: state.personalityType,
            subType: state.subType,
            dimensions: state.dimensions,
            matchedCards: state.matchedCards,
            timestamp: Date.now()
          });
        }

        // 触发完成回调
        if (state.callbacks.onComplete) {
          state.callbacks.onComplete({
            type: state.personalityType,
            personality: PERSONALITY_TYPES[state.personalityType]
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
    console.log('[LoveTest] calculateResults() 开始');

    // 重置分数
    state.dimensions = { C: 0, S: 0, A: 0, X: 0, H: 0, V: 0, I: 0, O: 0, LSP: 0 };
    state.auxiliaryScores = {
      longTerm: 0,
      adaptability: 0,
      rationality: 0,
      taboo: 0,
      creator: 0,
      techSkill: 0,
      active: 0,
      buddha: 0
    };

    // 累加分数
    state.questions.forEach(q => {
      const selectedIds = state.answers[q.id] || [];
      selectedIds.forEach(optId => {
        const opt = q.options.find(o => o.id === optId);
        if (!opt) return;

        // 累加主维度分数
        if (opt.scores) {
          Object.entries(opt.scores).forEach(([key, val]) => {
            if (state.dimensions.hasOwnProperty(key)) {
              state.dimensions[key] += val;
            }
          });
        }

        // 累加辅助分数
        if (opt.aux) {
          Object.entries(opt.aux).forEach(([key, val]) => {
            if (state.auxiliaryScores.hasOwnProperty(key)) {
              state.auxiliaryScores[key] += val;
            }
          });
        }
      });
    });

    console.log('[LoveTest] 维度分数:', state.dimensions);
    console.log('[LoveTest] 辅助分数:', state.auxiliaryScores);

    // 判断人格类型
    determinePersonalityType();

    // 匹配角色卡
    matchCharacters();
  }

  /* ----------------------------------------------------------
   * 判断人格类型
   * ---------------------------------------------------------- */
  function determinePersonalityType() {
    const d = state.dimensions;

    // 双向奔赴派: H >= 70 && V >= 60 && I >= 50
    if (d.H >= 70 && d.V >= 60 && d.I >= 50) {
      state.personalityType = 'mutual';
      
      // 判断亚型
      if (d.H >= 80 && state.auxiliaryScores.buddha >= 50) {
        state.subType = 'C'; // 日常甜饼型
      } else if (d.V >= 80) {
        state.subType = 'B'; // 平权伴侣型
      } else if (d.H >= 80) {
        state.subType = 'A'; // 治愈系救赎者
      }
    }
    // 虐恋情深派: A >= 70 && I >= 60
    else if (d.A >= 70 && d.I >= 60) {
      state.personalityType = 'masochist';
      
      // 判断亚型
      if (d.A >= 90) {
        state.subType = 'A'; // 极致虐心型
      } else if (d.A >= 80) {
        state.subType = 'C'; // 悲剧英雄型
      } else {
        state.subType = 'B'; // 战损美学型
      }
    }
    // 禁忌探索派: X >= 70 && LSP >= 60
    else if (d.X >= 70 && d.LSP >= 60) {
      state.personalityType = 'taboo';
      
      // 判断亚型
      if (state.auxiliaryScores.adaptability >= 5) {
        state.subType = 'D'; // 混沌沙雕型
      } else if (state.auxiliaryScores.taboo >= 3) {
        state.subType = 'C'; // 禁忌美学家
      } else if (d.X >= 70) {
        state.subType = 'B'; // 病娇狂热者
      } else {
        state.subType = 'A'; // 人外控
      }
    }
    // 海王多线派: 渣度计算 (C+A+O >= 100) && 短情指数
    else if ((d.C + d.A + d.O) >= 100 && state.auxiliaryScores.longTerm < 3) {
      state.personalityType = 'player';
      
      // 判断亚型
      if (d.A >= 70 && d.C >= 80) {
        state.subType = 'D'; // 精神施虐者
      } else if (d.O >= 70) {
        state.subType = 'B'; // 追逐症候群
      } else if (d.C >= 70) {
        state.subType = 'A'; // 修罗场导演
      } else {
        state.subType = 'C'; // 时间管理大师
      }
    }
    // 默认：根据最高分维度判断
    else {
      const maxDim = Object.entries(d).reduce((a, b) => a[1] > b[1] ? a : b);
      
      if (maxDim[0] === 'H' || maxDim[0] === 'V') {
        state.personalityType = 'mutual';
      } else if (maxDim[0] === 'A') {
        state.personalityType = 'masochist';
      } else if (maxDim[0] === 'X' || maxDim[0] === 'LSP') {
        state.personalityType = 'taboo';
      } else {
        state.personalityType = 'player';
      }
    }

    console.log('[LoveTest] 人格类型:', state.personalityType, '亚型:', state.subType);
  }

  /* ----------------------------------------------------------
   * 匹配角色卡
   * ---------------------------------------------------------- */
  function matchCharacters() {
    console.log('[LoveTest] matchCharacters() 开始');

    const personality = PERSONALITY_TYPES[state.personalityType];
    if (!personality) return;

    // 根据推荐角色名称匹配
    const recommendedNames = personality.recommendedChars || [];
    
    const matched = state.characters.filter(char => 
      recommendedNames.includes(char.name)
    ).map(char => ({
      ...char,
      matchScore: 95 // 高匹配度
    }));

    // 如果匹配不足3个，补充其他角色
    if (matched.length < 3) {
      const remaining = state.characters
        .filter(char => !recommendedNames.includes(char.name))
        .map(char => ({
          ...char,
                    matchScore: 60 // 中等匹配度
        }))
        .slice(0, 3 - matched.length);
      
      matched.push(...remaining);
    }

    state.matchedCards = matched.slice(0, 3);
    console.log('[LoveTest] 匹配完成, Top3:', state.matchedCards.map(c => c.name));
  }

  /* ----------------------------------------------------------
   * 渲染结果页
   * ---------------------------------------------------------- */
  function renderResult(container) {
    const personality = PERSONALITY_TYPES[state.personalityType];
    if (!personality) {
      console.error('[LoveTest] 未找到人格定义:', state.personalityType);
      return;
    }

    // 获取亚型信息
    const subTypeInfo = personality.subTypes && state.subType 
      ? personality.subTypes[state.subType] 
      : null;

    // 维度雷达图
    const dimensionsHTML = `
      <div class="love-dimensions">
        ${renderDimensionBar('掌控欲', state.dimensions.C, '#FF6B9D')}
        ${renderDimensionBar('臣服欲', state.dimensions.S, '#9D50BB')}
        ${renderDimensionBar('虐心瘾', state.dimensions.A, '#C44569')}
        ${renderDimensionBar('混沌度', state.dimensions.X, '#6C5CE7')}
        ${renderDimensionBar('治愈力', state.dimensions.H, '#FF8C42')}
        ${renderDimensionBar('香草纯度', state.dimensions.V, '#4ECDC4')}
        ${renderDimensionBar('代入感', state.dimensions.I, '#A8E6CF')}
        ${renderDimensionBar('观察者', state.dimensions.O, '#95A5A6')}
        ${renderDimensionBar('LSP指数', state.dimensions.LSP, '#E74C3C')}
      </div>
    `;

    // 辅助维度
    const auxScoresHTML = Object.entries(state.auxiliaryScores)
      .filter(([key, val]) => val > 0)
      .map(([key, val]) => {
        const labels = {
          longTerm: '长情指数',
          adaptability: '适应性',
          rationality: '理性指数',
          taboo: '禁忌指数',
          creator: '创作者倾向',
          techSkill: '技术力',
          active: '活跃度',
          buddha: '佛系指数'
        };
        return `<span class="aux-badge">${labels[key]} +${val}</span>`;
      }).join('');

    // 推荐角色卡
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
      <div class="test-result love-result">
        <!-- 人格卡片 -->
        <div class="personality-card love-personality">
          <div class="personality-header">
            <span class="personality-emoji">${personality.emoji}</span>
            <div class="personality-title">
              <h2>${personality.name}</h2>
              <p class="personality-core-xp">${personality.coreXP}</p>
            </div>
          </div>

          <blockquote class="personality-slogan">
            「 ${personality.slogan} 」
          </blockquote>

          ${subTypeInfo ? `
            <div class="personality-subtype">
              <span class="subtype-badge">${personality.icon}-${state.subType}</span>
              <span class="subtype-name">${subTypeInfo.name}</span>
              <p class="subtype-desc">${subTypeInfo.desc}</p>
            </div>
          ` : ''}

          <div class="personality-description">
            <p>${personality.description}</p>
          </div>

          <div class="personality-tags">
            ${personality.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>

          <div class="personality-best-match">
            <h4>💫 最佳搭子</h4>
            <p>${personality.bestMatch}</p>
          </div>
        </div>

        <!-- 维度分析 -->
        <div class="result-section">
          <h3 class="section-title">📊 恋爱维度分析</h3>
          ${dimensionsHTML}
        </div>

        <!-- 辅助属性 -->
        ${auxScoresHTML ? `
          <div class="result-section">
            <h3 class="section-title">✨ 附加属性</h3>
            <div class="aux-scores">
              ${auxScoresHTML}
            </div>
          </div>
        ` : ''}

        <!-- 推荐角色 -->
        <div class="result-section">
          <h3 class="section-title">💕 为你推荐的角色</h3>
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
    console.log('[LoveTest] 结果页渲染完成');
  }

  /* ----------------------------------------------------------
   * 渲染单个维度条
   * ---------------------------------------------------------- */
  function renderDimensionBar(label, value, color) {
    const clampedValue = TestBase.clamp(value, 0, 100);
    return `
      <div class="dimension-item">
        <span class="dimension-label">${label}</span>
        <div class="dimension-bar">
          <div class="dimension-fill" style="width:${clampedValue}%; background:${color}"></div>
        </div>
        <span class="dimension-value">${clampedValue}</span>
      </div>
    `;
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
          Storage.remove('love-result');
        }
        resetState();
        render(container, state.callbacks);
      });
    }

    // 分享结果
    const shareBtn = container.querySelector('.btn-share');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        const personality = PERSONALITY_TYPES[state.personalityType];
        const text = `我的恋爱人格是：${personality.emoji} ${personality.name}\n${personality.slogan}\n核心XP：${personality.coreXP}`;
        
        if (navigator.share) {
          navigator.share({
            title: '灵魂实验室 - 恋爱人格测试',
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
    state.personalityType = result.type;
    state.subType = result.subType;
    state.dimensions = result.dimensions || state.dimensions;
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

window.LoveTest = LoveTest;
console.log('[LoveTest] 恋爱人格测试模块加载完成 ✓');
