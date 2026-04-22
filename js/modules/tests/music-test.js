/* ============================================================
 * 文件名: js/modules/tests/music-test.js
 * 用途: 音乐人格测试 - 完整测试模块
 * 依赖: js/modules/test-base.js, js/data-loader.js, js/storage.js
 * 
 * 主要功能:
 *   1. 加载音乐人格题库（25题）
 *   2. 渲染测试题目
 *   3. 计算四维度分数（R/S/E/T）
 *   4. 匹配16种音乐人格类型
 *   5. 不推荐角色卡（仅展示人格结果）
 * ============================================================ */

const MusicTest = (function () {
  'use strict';

  /* ----------------------------------------------------------
   * 模块状态
   * ---------------------------------------------------------- */
  const state = {
    questions: [],
    currentQuestionIndex: 0,
    answers: {},
    dimensions: {
      R1: 0,  // 律动-规律型
      R2: 0,  // 律动-自由型
      S1: 0,  // 声景-丰满型
      S2: 0,  // 声景-极简型
      E1: 0,  // 情绪-外放型
      E2: 0,  // 情绪-内敛型
      T1: 0,  // 社交-独奏型
      T2: 0   // 社交-共鸣型
    },
    personalityType: null,
    isLoaded: false,
    completed: false,
    callbacks: {}
  };

  /* ----------------------------------------------------------
   * 16种音乐人格类型定义
   * ---------------------------------------------------------- */
  const PERSONALITY_TYPES = {
    // 第一象限：规律 · 丰满
    'rhythm_priest': {
      id: 'rhythm_priest',
      name: '节拍祭司',
      icon: '🎺',
      quadrant: '规律·丰满·外放·共鸣',
      slogan: '你是交响金属世界的首席指挥',
      description: '你的身体里住着一座钟楼,每一拍都精确如机械,但你又渴望用层层叠叠的弦乐与合唱填满每一寸声场。你会在音乐节前排举起金属礼,让成千上万人跟随你的节奏甩头。对你而言,音乐不是背景,是命令——让灵魂整齐划一的命令。',
      anthem: 'Nightwish《Ghost Love Score》，Metallica S&M现场版',
      skill: '能在嘈杂环境中准确听出贝斯线',
      advice: '偶尔试试去掉一层配器,你会发现留白的力量',
      condition: { R: 'R1', S: 'S1', E: 'E1', T: 'T2' }
    },
    'campfire_bard': {
      id: 'campfire_bard',
      name: '篝火行吟者',
      icon: '🎸',
      quadrant: '规律·丰满·外放·独奏',
      slogan: '你是民谣酒馆里最后关灯的那个人',
      description: '你需要稳定的扫弦和清晰的段落结构,但你也需要和声与故事。你会把一首翻唱改到只剩原版的影子,然后在副歌处突然加入所有人都会唱的段落。你推荐歌时会写两百字小作文,并精确标注"第1分23秒的转音必听"。',
      anthem: 'Joni Mitchell《A Case of You》，Suzanne Vega《Luka》',
      skill: '能记住上百首歌的歌词,且从不唱错',
      advice: '允许自己即兴一次,哪怕弹错一个和弦',
      condition: { R: 'R1', S: 'S1', E: 'E1', T: 'T1' }
    },
    'orchestra_ghost': {
      id: 'orchestra_ghost',
      name: '管弦幽灵',
      icon: '🎻',
      quadrant: '规律·丰满·内敛·共鸣',
      slogan: '你是空无一人的音乐厅里仍在演奏的乐团',
      description: '你热爱赋格、复调、层层交织的旋律线,但你从不站上舞台。你更愿意坐在最后一排的阴影里,看着指挥的汗水滴落。你会在古典音乐评论区写下千字分析,却从不参与任何音乐群聊。当有人问你喜欢什么时,你只说"什么都听"。',
      anthem: '巴赫《赋格的艺术》，Radiohead《How to Disappear Completely》弦乐版',
      skill: '能分辨不同指挥家对同一部作品的细微差异',
      advice: '试着把耳机的一边递给另一个人,就一次',
      condition: { R: 'R1', S: 'S1', E: 'E2', T: 'T2' }
    },
    'mechanical_drafter': {
      id: 'mechanical_drafter',
      name: '机械制图师',
      icon: '⚙️',
      quadrant: '规律·丰满·内敛·独奏',
      slogan: '你是DAW（数字音频工作站）里的精密工程师',
      description: '你对音轨的摆位、压缩器的阈值、混响的衰减时间有偏执的讲究。你制作的音乐无人听过,因为你觉得"还没准备好"。你听歌时会分析频谱图,而不是感受情绪。你的播放列表按BPM精确排序,像一个严谨的数据库。',
      anthem: 'Autechre《Gantz Graf》，Aphex Twin《Vordhosbn》',
      skill: '能听出一首歌是否在母带阶段被过度压限',
      advice: '关掉频谱分析仪,只用耳朵——允许一次不完美的聆听',
      condition: { R: 'R1', S: 'S1', E: 'E2', T: 'T1' }
    },

    // 第二象限：规律 · 极简
    'minimal_speaker': {
      id: 'minimal_speaker',
      name: '极简演说家',
      icon: '🎹',
      quadrant: '规律·极简·外放·共鸣',
      slogan: '你是爵士三重奏里的钢琴手',
      description: '你相信"少即是多",但你不沉默。你用一个稳定的律动和两三个音符就能撑起一首歌,并且能让全场跟着你点头。你在演讲中善于使用重复的短句制造节奏,让人记住你的每一个停顿。',
      anthem: 'Thelonious Monk《Round Midnight》，Billie Eilish《when the party\'s over》',
      skill: '能用口哨吹出任何旋律,且音准极佳',
      advice: '偶尔允许自己加一个装饰音,不算背叛极简',
      condition: { R: 'R1', S: 'S2', E: 'E1', T: 'T2' }
    },
    'beat_craftsman': {
      id: 'beat_craftsman',
      name: '节拍匠人',
      icon: '🥁',
      quadrant: '规律·极简·外放·独奏',
      slogan: '你是街头鼓手,坐在倒扣的水桶上',
      description: '你不需要旋律,不需要和声,只需要一个干净的鼓点就能让自己快乐。你在厨房切菜时按节奏下刀,走路时步伐踩在反拍上。你不会向别人解释你为什么喜欢一首只有鼓和贝斯的歌——他们不懂也没关系。',
      anthem: 'James Brown《Funky Drummer》鼓break，Daft Punk《Robot Rock》',
      skill: '任何日常噪音（雨刷、键盘、脚步声）在你耳中都会变成节奏',
      advice: '试着加一段人声,哪怕只是哼唱',
      condition: { R: 'R1', S: 'S2', E: 'E1', T: 'T1' }
    },
    'pulse_observer': {
      id: 'pulse_observer',
      name: '脉搏观察者',
      icon: '💓',
      quadrant: '规律·极简·内敛·共鸣',
      slogan: '你是医院ICU里盯着心电图的护士',
      description: '你喜欢稳定的脉搏声、秒针走动、呼吸机的节奏。你会和另一个人并排坐着,谁也不说话,但共享同一段环境音。你们不需要歌单,只需要彼此的呼吸和窗外的车流。',
      anthem: 'Steve Reich《Clapping Music》，John Cage《4\'33\'\'》',
      skill: '能察觉他人情绪变化时呼吸节奏的细微改变',
      advice: '偶尔放一首带歌词的歌,把它当作另一种心跳',
      condition: { R: 'R1', S: 'S2', E: 'E2', T: 'T2' }
    },
    'beat_island': {
      id: 'beat_island',
      name: '节拍孤岛',
      icon: '🏝️',
      quadrant: '规律·极简·内敛·独奏',
      slogan: '你是节拍器,但藏在抽屉最深处',
      description: '你对节奏的依赖近乎病态,但你从不与他人同步。你听歌只用一只耳机,另一只耳朵留给寂静。你的播放列表只有三首歌:一首无伴奏大提琴、一首极简电子、一首雨声录音。你循环了两年。',
      anthem: 'Max Richter《On the Nature of Daylight》，Brian Eno《Ambient 1: Music for Airports》',
      skill: '能连续听同一首歌8小时而不觉厌倦',
      advice: '换一首新歌。不,不是明天,是现在。',
      condition: { R: 'R1', S: 'S2', E: 'E2', T: 'T1' }
    },

    // 第三象限：自由 · 丰满
    'carnival_diviner': {
      id: 'carnival_diviner',
      name: '狂欢占卜师',
      icon: '🎪',
      quadrant: '自由·丰满·外放·共鸣',
      slogan: '你是音乐节上那个举着旗子跳舞的人',
      description: '你无法忍受重复的副歌,你需要每一秒都有新的声音跳出来。你会在EDM的drop处尖叫,也会在民谣的变调处突然流泪。你拉着陌生人转圈,把啤酒洒在半空。第二天醒来,你发现手机里多了几十个新朋友的联系方式。',
      anthem: 'LCD Soundsystem《Dance Yrself Clean》，Beyoncé《FORMATION》',
      skill: '能在三秒内判断一首歌是否适合派对',
      advice: '狂欢之后,给自己一晚完全的安静——你会听到自己的声音',
      condition: { R: 'R2', S: 'S1', E: 'E1', T: 'T2' }
    },
    'chaos_poet': {
      id: 'chaos_poet',
      name: '混乱诗人',
      icon: '🎨',
      quadrant: '自由·丰满·外放·独奏',
      slogan: '你是在深夜把歌词写在墙上的涂鸦者',
      description: '你的创作毫无章法:前奏是朋克,主歌是说唱,桥段突然变成华尔兹。你不在乎结构,只在乎那一刻的情绪是否饱满。你会在浴缸里录歌,用洗碗手套当弱音器。别人说你的音乐"太乱",你说"这就是我脑内的样子"。',
      anthem: 'Sonic Youth《Teen Age Riot》，Björk《It\'s Oh So Quiet》',
      skill: '能用家用物品（钥匙、水杯、塑料袋）制造出像样的打击乐',
      advice: '找一个你信任的人,请他听完你的整首歌——不要解释',
      condition: { R: 'R2', S: 'S1', E: 'E1', T: 'T1' }
    },
    'neon_floater': {
      id: 'neon_floater',
      name: '霓虹浮游体',
      icon: '🌃',
      quadrant: '自由·丰满·内敛·共鸣',
      slogan: '你是赛博朋克雨夜里的环境音采样师',
      description: '你可以在电子乐的不断变奏中漂浮一小时,也享受人声被切片成云团般的合唱。你很少外放情绪,但你会悄悄给每个朋友定制歌单。你在音乐软件上标记了上千首"无人问津但完美"的歌,并暗自希望有人能顺着你的链接游过来。',
      anthem: 'Burial《Untrue》整张专辑，Oneohtrix Point Never《Sticky Drama》',
      skill: '能从任何噪音中听出潜在的旋律线',
      advice: '把你最爱的冷门歌直接发给一个朋友,不要加任何说明',
      condition: { R: 'R2', S: 'S1', E: 'E2', T: 'T2' }
    },
    'whisper_collector': {
      id: 'whisper_collector',
      name: '密语收藏家',
      icon: '📼',
      quadrant: '自由·丰满·内敛·独奏',
      slogan: '你是图书馆角落里那盘落灰的卡带',
      description: '你收集各种奇怪的声音:保加利亚女子合唱团、图瓦喉歌、非洲拇指琴、20世纪具体音乐。你的播放列表像一座声音博物馆,但从未对任何人开放。你觉得解释这些音乐太累,不如继续独自探险。',
      anthem: 'Cocteau Twins《Heaven or Las Vegas》，Joanna Newsom《Ys》',
      skill: '能分辨出至少五种不同语言的发音美感,即使不懂意思',
      advice: '开一个匿名账号,每天分享一首冷门歌——会有人感谢你的',
      condition: { R: 'R2', S: 'S1', E: 'E2', T: 'T1' }
    },

    // 第四象限：自由 · 极简
    'improv_preacher': {
      id: 'improv_preacher',
      name: '即兴传教士',
      icon: '🎼',
      quadrant: '自由·极简·外放·共鸣',
      slogan: '你是街头用一只木吉他即兴Loop的流浪艺人',
      description: '你没有谱子,没有计划,只有当下。你今天弹的旋律和昨天完全不同,但路过的狗还是会在同一个地方摇尾巴。你相信音乐是空气的偶然排列,而你只是恰好接住了它。你邀请路人敲你的琴箱,你说"你来决定下一个音"。',
      anthem: 'Keith Jarrett《The Köln Concert》，John Coltrane《A Love Supreme》',
      skill: '能根据陌生人的步伐节奏即兴创作一段旋律',
      advice: '录下自己的一次即兴,哪怕你觉得"不够好"',
      condition: { R: 'R2', S: 'S2', E: 'E1', T: 'T2' }
    },
    'punctuation_maniac': {
      id: 'punctuation_maniac',
      name: '断句狂徒',
      icon: '⚡',
      quadrant: '自由·极简·外放·独奏',
      slogan: '你是诗歌朗诵会上突然把麦克风摔在地上的人',
      description: '你讨厌铺垫和过渡,只留下最锋利的碎片。你的音乐可能只有三个音符加一声呼吸,然后在最不该停止的地方戛然而止。观众愣住,你转身离开。你觉得留白不是沉默,是观众自己填补的回声。',
      anthem: 'The Velvet Underground《The Black Angel\'s Death Song》，Yves Tumor《Licking an Orchid》',
      skill: '能用一句话把热烈的对话彻底冷场（这是天赋）',
      advice: '偶尔允许自己写一个完整的结尾,这不是投降',
      condition: { R: 'R2', S: 'S2', E: 'E1', T: 'T1' }
    },
    'blank_believer': {
      id: 'blank_believer',
      name: '空白信徒',
      icon: '🕊️',
      quadrant: '自由·极简·内敛·共鸣',
      slogan: '你是山顶上听风的人',
      description: '你相信最好的音乐是尚未被演奏的。你参加冥想音乐会,坐在最后一排闭眼。你不需要旋律,只需要共鸣——低音钵的震动穿过骨骼时,你觉得比任何情歌都更懂你。你和旁边的人从未说话,但你们在同一段寂静里交换了眼神。',
      anthem: 'Sarah Davachi《Gave in Rest》，Eliane Radigue《Trilogie de la Mort》',
      skill: '能在最微弱的音量变化中感受到情绪的翻涌',
      advice: '下次听完音乐会,主动对旁边的人说一句"你也是吗？"',
      condition: { R: 'R2', S: 'S2', E: 'E2', T: 'T2' }
    },
    'midnight_phonograph': {
      id: 'midnight_phonograph',
      name: '午夜留声机',
      icon: '🌙',
      quadrant: '自由·极简·内敛·独奏',
      slogan: '你是黑胶唱片沟槽里的孤独叙事者',
      description: '你偏爱一首歌里只有一把吉他和一声叹息。切分音和不协和音是你与世界的暗号。你不会在派对上主动放歌,但若有人深夜走进你的房间,会发现你戴着耳机,对着窗外的雨声,用脚轻轻打着没人听懂的拍子。',
      anthem: 'Nick Drake《Pink Moon》，Elliott Smith《Between the Bars》',
      skill: '能从一首歌的前5秒判断它是否适合凌晨两点听',
      advice: '你不需要改变。但如果你愿意——把耳机分出去一只,哪怕只有30秒。',
      condition: { R: 'R2', S: 'S2', E: 'E2', T: 'T1' }
    }
  };

  /* ----------------------------------------------------------
   * 题目数据（25题）
   * ---------------------------------------------------------- */
  const QUESTIONS = [
    {
      id: 1,
      text: '你更享受哪种节奏带来的身体感受？',
      options: [
        { id: 'A', text: '稳定如心跳的鼓点，让我感到安全', scores: { R1: 1 } },
        { id: 'B', text: '切分音和意外停顿，让我兴奋又紧张', scores: { R2: 1 } },
        { id: 'C', text: '长线条的缓慢律动，像潮汐一样呼吸', scores: { R2: 1 } },
        { id: 'D', text: '没有明显节拍，漂浮在声音之中', scores: { R2: 1 } }
      ],
      multiple: false
    },
    {
      id: 2,
      text: '清晨醒来，你希望听到的第一种声音是？',
      options: [
        { id: 'A', text: '钢琴或吉他的单音旋律', scores: { S2: 1 } },
        { id: 'B', text: '层层叠叠的人声合唱', scores: { S1: 1 } },
        { id: 'C', text: '电子合成器的空间嗡鸣', scores: { S2: 1 } },
        { id: 'D', text: '窗外的环境音：鸟鸣、雨声、车流', scores: { S2: 1 } }
      ],
      multiple: false
    },
    {
      id: 3,
      text: '当你难过时，音乐会扮演什么角色？',
      options: [
        { id: 'A', text: '一面镜子——让我彻底沉浸于悲伤的旋律', scores: { E1: 1 } },
        { id: 'B', text: '一个朋友——用温暖的和声包裹我', scores: { E1: 1 } },
        { id: 'C', text: '一剂解药——给我节奏和力量，带我离开低谷', scores: { E2: 1 } },
        { id: 'D', text: '一片空白——我倾向于安静', scores: { E2: 1 } }
      ],
      multiple: false
    },
    {
      id: 4,
      text: '在派对上，你更可能？',
      options: [
        { id: 'A', text: '跟着熟悉的歌大声唱，带动气氛', scores: { T2: 1 } },
        { id: 'B', text: '躲在角落，但耳朵捕捉每一个好听的细节', scores: { T1: 1 } },
        { id: 'C', text: '随着音乐自由舞动，不管动作是否好看', scores: { T2: 1 } },
        { id: 'D', text: '我不参加派对', scores: { T2: 1 } },
        { id: 'E', text: '可能会跟着哼歌', scores: {} }
      ],
      multiple: false
    },
    {
      id: 5,
      text: '你如何描述"好听的人声"？',
      options: [
        { id: 'A', text: '有颗粒感的烟嗓，像在讲故事', scores: { S2: 1 } },
        { id: 'B', text: '清澈透亮的高音，像玻璃或溪水', scores: { S2: 1 } },
        { id: 'C', text: '低沉的耳语，像在对我一个人说话', scores: { S1: 1 } },
        { id: 'D', text: '多人多声部交织，像一场对话', scores: { S1: 1 } }
      ],
      multiple: false
    },
    {
      id: 6,
      text: '你最无法忍受的音乐特质是？',
      options: [
        { id: 'A', text: '过于重复、毫无变化的loop', scores: { R2: 1 } },
        { id: 'B', text: '人声过度修音，失去真实气息', scores: { S2: 1 } },
        { id: 'C', text: '所有乐器挤在同一个频率，没有空间感', scores: { S2: 1 } },
        { id: 'D', text: '歌词空洞，像AI写的', scores: { T1: 1 } }
      ],
      multiple: false
    },
    {
      id: 7,
      text: '如果你是一台乐器，你会是？',
      options: [
        { id: 'A', text: '架子鼓——负责时间与冲击', scores: { R1: 1 } },
        { id: 'B', text: '大提琴——负责情感与低鸣', scores: { S2: 1 } },
        { id: 'C', text: '电吉他——负责失真与叛逆', scores: { R2: 1 } },
        { id: 'D', text: '采样器——负责重组一切声音', scores: { R2: 1 } }
      ],
      multiple: false
    },
    {
      id: 8,
      text: '你喜欢在什么场景下听从未听过的新歌？',
      options: [
        { id: 'A', text: '通勤路上，用耳机隔绝外界', scores: { E2: 1, T1: 1 } },
        { id: 'B', text: '健身房，用BPM驱动身体', scores: { E1: 1 } },
        { id: 'C', text: '深夜独处，音量调低，像秘密', scores: { E2: 1, T1: 1 } },
        { id: 'D', text: '朋友推荐给我', scores: { T2: 1 } }
      ],
      multiple: false
    },
    {
      id: 9,
      text: '一段旋律让你记住的核心原因是？',
      options: [
        { id: 'A', text: '它的hook会在我脑中自动循环三天', scores: { R1: 1 } },
        { id: 'B', text: '它让我联想到某个具体的人或场景', scores: { E2: 1 } },
        { id: 'C', text: '它使用了奇怪的音阶或不和谐音', scores: { R2: 1 } },
        { id: 'D', text: '它的节奏型我从未听过', scores: { R2: 1 } }
      ],
      multiple: false
    },
    {
      id: 10,
      text: '对于"噪音"，你的态度是？',
      options: [
        { id: 'A', text: '不太感冒', scores: { S1: 1 } },
        { id: 'B', text: '如果是有组织的噪音（如工业音乐），可以接受', scores: { R2: 1 } },
        { id: 'C', text: '噪音是另一种信息，我能从中听到', scores: { R2: 1 } },
        { id: 'D', text: '完全拒绝', scores: { S2: 1 } }
      ],
      multiple: false
    },
  {
  id: 11,
  text: '你更愿意生活在一个什么样的音乐世界里？',
  options: [
    { id: 'A', text: '只有古典和爵士，一切优雅有序', scores: { R1: 1, S1: 1 } },
    { id: 'B', text: '只有摇滚和金属，一切狂放真实', scores: { R2: 1, E1: 1 } },
    { id: 'C', text: '只有电子和环境，一切流动无形', scores: { R2: 1, S2: 1 } },
    { id: 'D', text: '所有风格共存，每天随机切换', scores: { R2: 1, S1: 1, T2: 1 } }
  ],
  multiple: false
},
    {
      id: 12,
      text: '听歌时，你对歌词的依赖程度是？',
      options: [
        { id: 'A', text: '非常重要——歌词就是诗，不对味的词直接弃歌', scores: { T1: 1 } },
        { id: 'B', text: '中等重要——好词加分，但旋律优先', scores: {} },
        { id: 'C', text: '不重要——我常把人声当乐器听，不关心意思', scores: { E2: 1 } },
        { id: 'D', text: '取决于语种——听不懂的语言更有趣', scores: {} }
      ],
      multiple: false
    },
    {
      id: 13,
      text: '你更倾向于哪种音乐结构？',
      options: [
        { id: 'A', text: '主歌-副歌-主歌-副歌-桥段-副歌（标准流行结构）', scores: { R1: 1 } },
        { id: 'B', text: '不断变奏、永不重复的古典回旋曲', scores: { R2: 1 } },
        { id: 'C', text: '长达十分钟以上的渐强与渐弱，像一场旅程', scores: { R2: 1, E2: 1 } },
        { id: 'D', text: '碎片式的、突然切换的段落拼接', scores: { R2: 1, T1: 1 } }
      ],
      multiple: false
    },
    {
      id: 14,
      text: '哪种"静默"最让你舒适？',
      options: [
        { id: 'A', text: '一首歌结束后的3秒空白', scores: { T1: 1 } },
        { id: 'B', text: '乐曲中一个休止符拉长的瞬间', scores: { R2: 1 } },
        { id: 'C', text: '完全无声的房间', scores: { S2: 1, T1: 1 } },
        { id: 'D', text: '雨声覆盖了一切杂音的那种静', scores: { S2: 1 } }
      ],
      multiple: false
    },
    {
      id: 15,
      text: '当一首歌里出现"不和谐音"或"意外转调"时，你的反应是？',
      options: [
        { id: 'A', text: '皱眉，觉得破坏了美感，希望它回到顺耳的和声', scores: { S1: 1 } },
        { id: 'B', text: '兴奋，这是创作者在挑战我的听觉习惯', scores: { E1: 1 } },
        { id: 'C', text: '好奇，会反复听这一段，试图理解它的意图', scores: { R2: 1 } },
        { id: 'D', text: '无所谓，我通常注意不到理论上的"不和谐"', scores: { T1: 1 } }
      ],
      multiple: false
    },
    {
      id: 16,
      text: '如果音乐有颜色，你内心最多的颜色是？',
      options: [
        { id: 'A', text: '深蓝与黑——午夜氛围', scores: { E2: 1 } },
        { id: 'B', text: '橙与黄——日出的温暖', scores: { E1: 1 } },
        { id: 'C', text: '霓虹紫与绿——赛博空间', scores: { R2: 1, S1: 1 } },
        { id: 'D', text: '灰与白——极简主义', scores: { S2: 1 } }
      ],
      multiple: false
    },
    {
      id: 17,
      text: '你更害怕以下哪种场景？',
      options: [
        { id: 'A', text: '耳机突然坏掉一只，声音只剩单声道', scores: { T1: 1 } },
        { id: 'B', text: '现场演出时，主唱严重跑调', scores: { T2: 1 } },
        { id: 'C', text: '背景音乐音量刚好卡在"听不清但关不掉"的程度', scores: { S2: 1 } },
        { id: 'D', text: '所有人都喜欢的歌，唯独我毫无感觉', scores: { T2: 1 } }
      ],
      multiple: false
    },
    {
      id: 18,
      text: '你如何对待"被过度播放的热单"？',
      options: [
        { id: 'A', text: '主动回避，越火我越不想听', scores: { T1: 1 } },
        { id: 'B', text: '照听不误，好歌不怕听一千遍', scores: { E1: 1 } },
        { id: 'C', text: '隔一段时间再听，等热度过去后重新判断', scores: { R2: 1 } },
        { id: 'D', text: '我会去搜它的各种remix或现场版，找新鲜感', scores: { S1: 1 } }
      ],
      multiple: false
    },
    {
      id: 19,
      text: '你更愿意自己的音乐品味被形容为？',
      options: [
        { id: 'A', text: '经典而挑剔', scores: { R1: 1, T1: 1 } },
        { id: 'B', text: '混乱而诚实', scores: { R2: 1, E1: 1 } },
        { id: 'C', text: '冷静而疏离', scores: { S2: 1, E2: 1, T1: 1 } },
        { id: 'D', text: '热情而分享欲强', scores: { T2: 1 } }
      ],
      multiple: false
    },
    {
      id: 20,
      text: '如果让你创作一首歌，你会最先确定什么？',
      options: [
        { id: 'A', text: '一段riff或旋律动机', scores: { R1: 1 } },
        { id: 'B', text: '一组鼓点和贝斯的groove', scores: { R1: 1 } },
        { id: 'C', text: '一个和弦进行的情感底色', scores: { E1: 1 } },
        { id: 'D', text: '一段采样或环境录音', scores: { R2: 1 } }
      ],
      multiple: false
    },
    {
      id: 21,
      text: '你更容易被哪种演奏吸引？',
      options: [
        { id: 'A', text: '技术完美、零失误的演奏', scores: { R1: 1 } },
        { id: 'B', text: '充满即兴和错误，但情绪饱满的演奏', scores: { R2: 1, E1: 1 } },
        { id: 'C', text: '极简到只有几个音符，却让人屏息', scores: { S2: 1, E2: 1 } },
        { id: 'D', text: '使用非传统乐器（如玻璃杯、打字机）的演奏', scores: { R2: 1 } }
      ],
      multiple: false
    },
    {
      id: 22,
      text: '如果让你选择一种"非人类"的演唱方式，你会选？',
      options: [
        { id: 'A', text: '自动调音拉到满的机器人声（如Vocaloid）', scores: { S1: 1 } },
        { id: 'B', text: '完全无歌词的拟声吟唱（如即兴"啦""哒"）', scores: { E2: 1 } },
        { id: 'C', text: '采样自自然界的声音（鸟鸣、溪流、风声）拼成人声节奏', scores: { R2: 1 } },
        { id: 'D', text: '多轨叠录的自己，唱不同的声部形成合唱', scores: { T2: 1 } }
      ],
      multiple: false
    },
    {
      id: 23,
      text: '你通常如何向别人推荐一首歌？',
      options: [
        { id: 'A', text: '直接甩链接，附上一句"你听"', scores: { T2: 1 } },
        { id: 'B', text: '写一段小作文，描述我听时的感受', scores: { T2: 1 } },
        { id: 'C', text: '只在对方主动问时才推荐', scores: { T1: 1 } },
        { id: 'D', text: '我会专门做一个歌单，按情绪排序再分享', scores: { T2: 1 } }
      ],
      multiple: false
    },
    {
      id: 24,
      text: '你在音乐流媒体上最常做的操作是？',
      options: [
        { id: 'A', text: '反复听同一个歌单，很少换', scores: { R1: 1, T1: 1 } },
        { id: 'B', text: '每首歌听完必须点"喜欢"或"不喜欢"', scores: {} },
        { id: 'C', text: '疯狂跳歌，平均每首听不到30秒', scores: { R2: 1 } },
        { id: 'D', text: '点开一首歌后，任由算法自动播放下一首', scores: { R2: 1 } }
      ],
      multiple: false
    },
    {
      id: 25,
      text: '最后一题，请选择一句最接近你内心独白的句子：',
      options: [
        { id: 'A', text: '我害怕安静，所以音乐是填满房间的家具', scores: { E2: 1 } },
        { id: 'B', text: '我害怕吵闹，所以音乐是隔开世界的玻璃', scores: { R2: 1 } },
        { id: 'C', text: '我害怕遗忘，所以音乐是钉在时间里的钉子', scores: { S1: 1 } },
        { id: 'D', text: '我害怕孤独，所以音乐是永远不会挂断的电话', scores: { T2: 1 } }
      ],
      multiple: false
    }
  ];

  /* ----------------------------------------------------------
   * 初始化
   * ---------------------------------------------------------- */
  function init(callbacks = {}) {
    state.callbacks = callbacks;
    state.questions = QUESTIONS;
    state.isLoaded = true;
    console.log('[MusicTest] 音乐人格测试初始化完成 ✓');
    return Promise.resolve();
  }

  /* ----------------------------------------------------------
   * 开始测试
   * ---------------------------------------------------------- */
  function start() {
    if (!state.isLoaded) {
      console.error('[MusicTest] 测试未初始化');
      return;
    }

    // 重置状态
    state.currentQuestionIndex = 0;
    state.answers = {};
    state.dimensions = { R1: 0, R2: 0, S1: 0, S2: 0, E1: 0, E2: 0, T1: 0, T2: 0 };
    state.personalityType = null;
    state.completed = false;

    renderQuestion();
  }

  /* ----------------------------------------------------------
   * 渲染题目
   * ---------------------------------------------------------- */
  function renderQuestion() {
    const container = document.getElementById('test-container');
    if (!container) return;

    const question = state.questions[state.currentQuestionIndex];
    const progress = TestBase.renderProgress(
      state.currentQuestionIndex + 1,
      state.questions.length
    );

    container.innerHTML = `
      <div class="test-content">
        ${progress}
        
        <div class="test-stage">
          <h3 class="stage-title">音乐人格测试</h3>
          <p class="stage-subtitle">探索你的声音灵魂</p>
        </div>

        <div class="question-card">
          <h4 class="question-text">Q${question.id}. ${question.text}</h4>
          <div class="options-list">
            ${TestBase.renderOptions(question, state.answers)}
          </div>
        </div>

        <div class="test-nav">
          ${state.currentQuestionIndex > 0 ? 
            '<button class="btn-secondary" id="btn-prev">上一题</button>' : 
            '<div></div>'
          }
          <button class="btn-primary" id="btn-next">
            ${state.currentQuestionIndex === state.questions.length - 1 ? '查看结果' : '下一题'}
          </button>
        </div>
      </div>
    `;

    bindQuestionEvents();
  }

  /* ----------------------------------------------------------
   * 绑定题目事件
   * ---------------------------------------------------------- */
  function bindQuestionEvents() {
    const question = state.questions[state.currentQuestionIndex];
    const container = document.getElementById('test-container');

    // 选项选择
    const inputs = container.querySelectorAll('input[type="radio"], input[type="checkbox"]');
    inputs.forEach(input => {
      input.addEventListener('change', () => {
        if (question.multiple) {
          // 多选
          const selected = Array.from(container.querySelectorAll('input:checked'))
            .map(inp => inp.value);
          state.answers[question.id] = selected;
        } else {
          // 单选
          state.answers[question.id] = [input.value];
        }
      });
    });

    // 上一题
    const btnPrev = document.getElementById('btn-prev');
    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        if (state.currentQuestionIndex > 0) {
          state.currentQuestionIndex--;
          renderQuestion();
        }
      });
    }

    // 下一题/查看结果
    const btnNext = document.getElementById('btn-next');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        if (!state.answers[question.id] || state.answers[question.id].length === 0) {
          alert('请选择一个选项');
          return;
        }

        if (state.currentQuestionIndex === state.questions.length - 1) {
          // 完成测试
          calculateResult();
          renderResult();
        } else {
          // 下一题
          state.currentQuestionIndex++;
          renderQuestion();
        }
      });
    }
  }

  /* ----------------------------------------------------------
   * 计算结果
   * ---------------------------------------------------------- */
  function calculateResult() {
    // 重置维度分数
    state.dimensions = { R1: 0, R2: 0, S1: 0, S2: 0, E1: 0, E2: 0, T1: 0, T2: 0 };

    // 遍历所有答案，累加分数
    Object.keys(state.answers).forEach(qId => {
      const question = state.questions.find(q => q.id === parseInt(qId));
      const selectedOptions = state.answers[qId];

      selectedOptions.forEach(optId => {
        const option = question.options.find(opt => opt.id === optId);
        if (option && option.scores) {
          Object.keys(option.scores).forEach(dim => {
            state.dimensions[dim] += option.scores[dim];
          });
        }
      });
    });

    // 判断每个维度的倾向
    const R = state.dimensions.R1 >= state.dimensions.R2 ? 'R1' : 'R2';
    const S = state.dimensions.S1 >= state.dimensions.S2 ? 'S1' : 'S2';
    const E = state.dimensions.E1 >= state.dimensions.E2 ? 'E1' : 'E2';
    const T = state.dimensions.T1 >= state.dimensions.T2 ? 'T1' : 'T2';

    // 匹配人格类型
    const typeKey = Object.keys(PERSONALITY_TYPES).find(key => {
      const type = PERSONALITY_TYPES[key];
      return type.condition.R === R && 
             type.condition.S === S && 
             type.condition.E === E && 
             type.condition.T === T;
    });

    state.personalityType = PERSONALITY_TYPES[typeKey] || PERSONALITY_TYPES['midnight_phonograph'];
    state.completed = true;

    console.log('[MusicTest] 测试完成', {
      dimensions: state.dimensions,
      tendency: { R, S, E, T },
      type: state.personalityType.name
    });
  }

  /* ----------------------------------------------------------
   * 渲染结果页
   * ---------------------------------------------------------- */
  function renderResult() {
    const container = document.getElementById('test-container');
    if (!container) return;

    const type = state.personalityType;
    const dims = state.dimensions;

    // 计算百分比（用于雷达图）
    const maxScore = 15; // 大致估算每个维度的最大可能分数
    const radarData = [
      { 
        label: dims.R1 >= dims.R2 ? '规律型' : '自由型', 
        value: Math.round((Math.max(dims.R1, dims.R2) / maxScore) * 100),
        color: '#60a5fa'
      },
      { 
        label: dims.S1 >= dims.S2 ? '丰满型' : '极简型', 
        value: Math.round((Math.max(dims.S1, dims.S2) / maxScore) * 100),
        color: '#a78bfa'
      },
      { 
        label: dims.E1 >= dims.E2 ? '外放型' : '内敛型', 
        value: Math.round((Math.max(dims.E1, dims.E2) / maxScore) * 100),
        color: '#f472b6'
      },
      { 
        label: dims.T1 >= dims.T2 ? '独奏型' : '共鸣型', 
        value: Math.round((Math.max(dims.T1, dims.T2) / maxScore) * 100),
        color: '#34d399'
      }
    ];

    container.innerHTML = `
      <div class="test-result">
        <!-- 主卡片 -->
        <div class="result-card">
          <div class="result-icon">${type.icon}</div>
          <h2 class="result-title">${type.name}</h2>
          <p class="result-quadrant">${type.quadrant}</p>
          <p class="result-slogan">${type.slogan}</p>
        </div>

        <!-- 人格描述 -->
        <div class="result-section">
          <h3 class="section-title">你的音乐灵魂</h3>
          <p class="result-description">${type.description}</p>
        </div>

        <!-- 圣歌 -->
        <div class="result-section">
          <h3 class="section-title">🎵 你的圣歌</h3>
          <p class="result-anthem">${type.anthem}</p>
        </div>

        <!-- 隐藏技能 -->
        <div class="result-section">
          <h3 class="section-title">✨ 隐藏技能</h3>
          <p class="result-skill">${type.skill}</p>
        </div>

        <!-- 给你的建议 -->
        <div class="result-section">
          <h3 class="section-title">💡 给你的建议</h3>
          <p class="result-advice">${type.advice}</p>
        </div>

        <!-- 四维雷达图 -->
        <div class="result-section">
          <h3 class="section-title">四维音乐人格</h3>
          <div class="radar-chart">
            ${TestBase.renderRadarChart(
              {
                [radarData[0].label]: radarData[0].value,
                [radarData[1].label]: radarData[1].value,
                [radarData[2].label]: radarData[2].value,
                [radarData[3].label]: radarData[3].value
              },
              radarData
            )}
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="result-actions">
          <button class="btn-primary" id="btn-save">保存结果</button>
          <button class="btn-secondary" id="btn-retake">重新测试</button>
          <button class="btn-secondary" id="btn-back">返回测试中心</button>
        </div>
      </div>
    `;

    bindResultEvents();
  }

  /* ----------------------------------------------------------
   * 绑定结果页事件
   * ---------------------------------------------------------- */
  function bindResultEvents() {
    // 保存结果
    const btnSave = document.getElementById('btn-save');
    if (btnSave) {
      btnSave.addEventListener('click', () => {
        if (window.Storage) {
          const result = {
            testType: 'music',
            personalityType: state.personalityType.id,
            dimensions: state.dimensions,
            timestamp: Date.now()
          };
          window.Storage.saveTestResult('music', result);
          alert('结果已保存！');
        }
      });
    }

    // 重新测试
    const btnRetake = document.getElementById('btn-retake');
    if (btnRetake) {
      btnRetake.addEventListener('click', () => {
        start();
      });
    }

    // 返回测试中心
    const btnBack = document.getElementById('btn-back');
    if (btnBack) {
      btnBack.addEventListener('click', () => {
        if (state.callbacks.onBack) {
          state.callbacks.onBack();
        }
      });
    }
  }

  /* ----------------------------------------------------------
   * 获取状态
   * ---------------------------------------------------------- */
  function getState() {
    return { ...state };
  }
  /* ----------------------------------------------------------
   * 导出
   * ---------------------------------------------------------- */
  return {
    init,
    render: start,        // ✅ 添加 render 方法（personality-test.js 需要）
    start,                // 保留原有的 start 方法
    renderResult,         // ✅ 添加结果渲染方法
    getState
  };

})();

window.MusicTest = MusicTest;
console.log('[MusicTest] 音乐人格测试模块加载完成 ✓');

