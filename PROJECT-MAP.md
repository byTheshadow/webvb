# webvb 项目地图

> 最后更新：2026-04-18
> 当前版本：v0.1.0 - 基础框架完成

## 📋 项目概述

**项目名称：** webvb (Vibe Coding)  
**技术栈：** HTML5 + CSS3 + JavaScript (纯前端)  
**部署方式：** GitHub Pages  
**数据存储：** JSON 文件 + localStorage

---

## 📁 文件结构

webvb/
├── index.html ✅ 主页面
├── README.md ⬜ 项目说明
├── PROJECT-MAP.md ✅ 本文件
│
├── css/
│ ├── main.css ✅ 主样式表
│ ├── themes.css ✅ 三种主题样式
│ ├── animations.css ✅ 动画效果
│ └── responsive.css ⬜ 响应式样式（可选）
│
├── js/
│ ├── app.js ✅ 应用主入口
│ ├── router.js ✅ 路由管理
│ ├── data-loader.js ✅ 数据加载器
│ ├── storage.js ✅ 本地存储管理
│ │
│ ├── modules/
│ │ ├── personality-test.js ⬜ 人格测试
│ │ ├── lenormand.js ⬜ 雷诺曼占卜
│ │ ├── cocktail.js ⬜ 调酒系统
│ │ ├── perfume.js ⬜ 配香水
│ │ ├── poem.js ⬜ 拼贴诗
│ │ ├── cp-analysis.js ⬜ CP分析
│ │ ├── theme-manager.js ⬜ 主题管理
│ │ └── audio-player.js ⬜ 音频播放
│ │
│ └── utils/
│ ├── share.js ⬜ 分享功能
│ └── helpers.js ⬜ 辅助函数
│
├── data/
│ ├── questions/
│ │ ├── full.json ⬜ 完整题库
│ │ ├── short.json ⬜ 简短题库
│ │ └── past.json ⬜ 过去题库
│ │
│ ├── characters/
│ │ └── list.json ⬜ 角色卡数据
│ │
│ ├── lenormand/
│ │ └── cards.json ⬜ 36张卡牌数据
│ │
│ ├── drinks/
│ │ ├── base.json ⬜ 基酒库
│ │ └── mixers.json ⬜ 配料库
│ │
│ ├── perfumes/
│ │ └── notes.json ⬜ 香调库
│ │
│ ├── poems/
│ │ ├── words.json ⬜ 词库
│ │ └── templates.json ⬜ 诗歌模板
│ │
│ └── cp-templates/
│ └── templates.json ⬜ CP表格模板
│
└── assets/
├── images/
│ ├── characters/ ⬜ 角色卡图片
│ ├── lenormand/ ⬜ 雷诺曼卡牌图片
│ └── icons/ ⬜ 图标
│
└── audio/
├── rain.mp3 ⬜ 雨声
├── cafe.mp3 ⬜ 咖啡厅
├── forest.mp3 ⬜ 森林
├── ocean.mp3 ⬜ 海浪
└── typing.mp3 ⬜ 打字声

**图例：**
- ✅ 已完成
- ⬜ 待开发
- 🔧 开发中

---

## 🗂️ 核心文件说明

### HTML文件

| 文件 | 功能 | 状态 | 依赖 |
|------|------|------|------|
| index.html | 主页面，包含所有HTML结构 | ✅ | 所有CSS和JS |

### CSS文件

| 文件 | 功能 | 行数 | 状态 | 依赖 |
|------|------|------|------|------|
| main.css | 全局样式、布局、组件 | ~400 | ✅ | 无 |
| themes.css | 三种主题的颜色和背景 | ~150 | ✅ | main.css |
| animations.css | 所有动画效果定义 | ~250 | ✅ | 无 |

### JavaScript核心文件

| 文件 | 功能 | 行数 | 状态 | 依赖 |
|------|------|------|------|------|
| app.js | 应用主入口，初始化所有模块 | ~200 | ✅ | router.js, storage.js |
| router.js | 路由管理，页面切换 | ~350 | ✅ | 无 |
| data-loader.js | 数据加载，缓存管理 | ~150 | ✅ | 无 |
| storage.js | 本地存储，数据持久化 | ~250 | ✅ | 无 |

### JavaScript功能模块（待开发）

| 文件 | 功能 | 预计行数 | 状态 | 依赖 |
|------|------|----------|------|------|
| personality-test.js | 人格测试系统 | ~400 | ⬜ | data-loader.js |
| lenormand.js | 雷诺曼占卜 | ~350 | ⬜ | data-loader.js |
| cocktail.js | 调酒系统 | ~300 | ⬜ | data-loader.js |
| perfume.js | 配香水系统 | ~250 | ⬜ | data-loader.js |
| poem.js | 拼贴诗系统 | ~300 | ⬜ | data-loader.js |
| cp-analysis.js | CP分析 | ~250 | ⬜ | data-loader.js |
| theme-manager.js | 主题管理 | ~150 | ⬜ | storage.js |
| audio-player.js | 音频播放器 | ~200 | ⬜ | storage.js |

---

## 🎯 开发进度

### Phase 1: 基础框架 ✅ 已完成
- [x] 项目结构搭建
- [x] HTML主页面
- [x] 全局样式系统
- [x] 三种主题样式
- [x] 动画效果库
- [x] 路由系统
- [x] 数据加载器
- [x] 本地存储管理
- [x] 应用主入口

**完成时间：** 2026-04-18  
**文件数量：** 9个核心文件

### Phase 2: 人格测试系统 ⬜ 待开发
- [ ] 性向选择界面
- [ ] 题库选择（完整/简短/过去）
- [ ] 答题界面和进度条
- [ ] 结果计算算法
- [ ] 结果展示页面
- [ ] 角色卡推荐逻辑
- [ ] 测试数据准备

**预计文件：**
- `js/modules/personality-test.js`
- `data/questions/full.json`
- `data/questions/short.json`
- `data/questions/past.json`
- `data/characters/list.json`

### Phase 3: 雷诺曼占卜系统 ⬜ 待开发
- [ ] 占卜模式选择
- [ ] 问题输入界面
- [ ] 抽卡动画
- [ ] 卡牌展示和翻转
- [ ] 卡牌解读
- [ ] 角色卡推荐
- [ ] 36张卡牌数据准备

**预计文件：**
- `js/modules/lenormand.js`
- `data/lenormand/cards.json`
- `assets/images/lenormand/` (36张图片)

### Phase 4: 创意功能 ⬜ 待开发
- [ ] 调酒系统
- [ ] 配香水系统
- [ ] 拼贴诗系统

**预计文件：**
- `js/modules/cocktail.js`
- `js/modules/perfume.js`
- `js/modules/poem.js`
- 对应的数据文件

### Phase 5: CP分析 ⬜ 待开发
- [ ] 表单设计
- [ ] 分析算法
- [ ] 模板系统
- [ ] 结果可视化

**预计文件：**
- `js/modules/cp-analysis.js`
- `data/cp-templates/templates.json`

### Phase 6: 氛围增强 ⬜ 待开发
- [ ] 主题管理器
- [ ] 白噪音播放器
- [ ] 音频文件准备

**预计文件：**
- `js/modules/theme-manager.js`
- `js/modules/audio-player.js`
- `assets/audio/` (5个音频文件)

### Phase 7: 分享和优化 ⬜ 待开发
- [ ] 分享功能
- [ ] 结果卡片生成
- [ ] 性能优化
- [ ] 最终测试

**预计文件：**
- `js/utils/share.js`
- `js/utils/helpers.js`

---

## 🔧 常见修改场景

### 场景1：添加新角色卡
**需要修改的文件：**
1. `data/characters/list.json` - 添加角色数据
2. `assets/images/characters/` - 上传角色图片

**步骤：**
```json
// 在 list.json 中添加：
{
  "id": "char_new",
  "name": "角色名称",
  "image": "assets/images/characters/char_new.jpg",
  "tags": ["标签1", "标签2"],
  "personality": {
    "mbti": "INFJ",
    "dimensions": {
      "E_I": -3,
      "S_N": 2,
      "T_F": 1,
      "J_P": -2
    }
  },
  "description": "角色描述",
  "quote": "角色名言"
}

