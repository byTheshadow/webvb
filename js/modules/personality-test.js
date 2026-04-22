/* ============================================================
 * 文件名: js/modules/personality-test.js
 * 用途: 人格测试中心 - 测试选择器与路由器
 * 依赖: js/data-loader.js, js/storage.js, js/router.js
 * 
 * 主要功能:
 *   1. 展示测试入口列表
 *   2. 路由到具体测试模块
 *   3. 管理测试历史记录
 * ============================================================ */

const PersonalityTest = (function () {
  'use strict';

  /* ----------------------------------------------------------
   * 测试注册表
   * 用途: 所有可用测试的元数据
   * ---------------------------------------------------------- */
  const TEST_REGISTRY = {
    airp: {
      id: 'airp',
      name: 'AIRP人格测试',
      nameShort: 'AIRP测试',
      icon: '🧠',
      desc: '探索你的深层人格代码',
      questionCount: 25,
      duration: '8-10分钟',
      tags: ['人格分析', '深度测试', '角色推荐'],
      module: null, // 延迟加载
      status: 'active'
    },
    love: {
      id: 'love',
      name: '恋爱人格测试',
      nameShort: '恋爱测试',
      icon: '💕',
      desc: '发现你的恋爱模式与情感风格',
      questionCount: 15,
      duration: '5-8分钟',
      tags: ['恋爱', '情感', '关系'],
      module: null,
      status: 'active'
    },
    koi: {
  id: 'koi',
  name: '锦鲤TI测试',
  nameShort: '锦鲤测试',
  icon: '🎣',
  desc: '测测你的社区人格与聊天习惯',
  questionCount: 32,
  duration: '8-10分钟',
  tags: ['社区', '习惯', '趣味'],
  module: null,
  status: 'active' // ✅ 改为 active
},
    partner: {
      id: 'partner',
      name: '测测你的搭子',
      nameShort: '搭子测试',
      icon: '🤝',
      desc: '找到最适合你的灵魂搭档类型',
      questionCount: 10,
      duration: '3-5分钟',
      tags: ['社交', '友谊', '匹配'],
      module: null,
      status: 'coming-soon'
    },
    music: {
      id: 'music',
      name: '音乐人格测试',
      nameShort: '音乐测试',
      icon: '🎵',
      desc: '通过音乐偏好解读你的内心',
      questionCount: 12,
      duration: '5-7分钟',
      tags: ['音乐', '艺术', '品味'],
      module: null,
      status: 'coming-soon'
    }
  };

  /* ----------------------------------------------------------
   * 模块状态
   * ---------------------------------------------------------- */
  const state = {
    currentTest: null,      // 当前运行的测试ID
    testHistory: [],        // 测试历史
    isLoaded: false
  };

  /* ----------------------------------------------------------
   * 初始化
   * ---------------------------------------------------------- */
  function init() {
    console.log('[PersonalityTest] 测试中心初始化');
    loadHistory();
    state.isLoaded = true;
  }

  /* ----------------------------------------------------------
   * 加载测试历史
   * ---------------------------------------------------------- */
  function loadHistory() {
    if (window.Storage) {
      state.testHistory = Storage.get('test-history') || [];
    }
  }

  /* ----------------------------------------------------------
   * 保存测试历史
   * ---------------------------------------------------------- */
  function saveHistory(testId, result) {
    const record = {
      testId,
      timestamp: Date.now(),
      result: result
    };
    
    state.testHistory.unshift(record);
    state.testHistory = state.testHistory.slice(0, 10); // 只保留最近10条
    
    if (window.Storage) {
      Storage.set('test-history', state.testHistory);
    }
  }

  /* ----------------------------------------------------------
   * 渲染测试中心主页
   * ---------------------------------------------------------- */
  function render(container) {
    if (!state.isLoaded) {
      init();
    }

    const testsHTML = Object.values(TEST_REGISTRY).map(test => {
      const isComingSoon = test.status === 'coming-soon';
      const hasHistory = state.testHistory.some(h => h.testId === test.id);
      
      return `
        <div class="test-card ${isComingSoon ? 'coming-soon' : ''}" 
             data-test-id="${test.id}"
             ${!isComingSoon ? 'role="button" tabindex="0"' : ''}>
          <div class="test-card-header">
            <span class="test-icon">${test.icon}</span>
            ${isComingSoon ? '<span class="coming-soon-badge">敬请期待</span>' : ''}
            ${hasHistory ? '<span class="history-badge">✓</span>' : ''}
          </div>
          <h3 class="test-name">${test.name}</h3>
          <p class="test-desc">${test.desc}</p>
          <div class="test-meta">
            <span class="test-count">📝 ${test.questionCount}题</span>
            <span class="test-duration">⏱ ${test.duration}</span>
          </div>
          <div class="test-tags">
            ${test.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
          ${!isComingSoon ? '<div class="test-card-action">开始测试 →</div>' : ''}
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="test-center">
        <div class="test-center-header">
          <h1 class="page-title">📋 人格测试中心</h1>
          <p class="page-subtitle">探索内心世界，发现真实自我</p>
        </div>

        <div class="test-grid">
          ${testsHTML}
        </div>

        ${state.testHistory.length > 0 ? `
          <div class="test-history-section">
            <h2 class="section-title">📜 测试记录</h2>
            <div class="history-list">
              ${renderHistory()}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    bindEvents(container);
  }

  /* ----------------------------------------------------------
   * 渲染测试历史
   * ---------------------------------------------------------- */
  function renderHistory() {
    return state.testHistory.slice(0, 5).map(record => {
      const test = TEST_REGISTRY[record.testId];
      if (!test) return '';
      
      const date = new Date(record.timestamp);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
      
      return `
        <div class="history-item" data-test-id="${record.testId}">
          <span class="history-icon">${test.icon}</span>
          <div class="history-content">
            <span class="history-name">${test.nameShort}</span>
            <span class="history-date">${dateStr}</span>
          </div>
          <button class="history-view-btn">查看结果</button>
        </div>
      `;
    }).join('');
  }

  /* ----------------------------------------------------------
   * 绑定事件
   * ---------------------------------------------------------- */
  function bindEvents(container) {
    // 测试卡片点击
    container.querySelectorAll('.test-card:not(.coming-soon)').forEach(card => {
      card.addEventListener('click', () => {
        const testId = card.dataset.testId;
        startTest(testId, container);
      });
    });

    // 历史记录查看
    container.querySelectorAll('.history-view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const testId = btn.closest('.history-item').dataset.testId;
        viewResult(testId, container);
      });
    });
  }

  /* ----------------------------------------------------------
   * 启动测试
   * ---------------------------------------------------------- */
  async function startTest(testId, container) {
    console.log(`[PersonalityTest] 启动测试: ${testId}`);
    
    const testConfig = TEST_REGISTRY[testId];
    if (!testConfig) {
      console.error('[PersonalityTest] 未知测试ID:', testId);
      return;
    }

    state.currentTest = testId;

    // 显示加载状态
    container.innerHTML = `
      <div class="test-loading">
        <div class="loading-spinner"></div>
        <p>加载 ${testConfig.name} 中...</p>
      </div>
    `;

    try {
      // 动态加载测试模块
      const module = await loadTestModule(testId);
      
      if (!module) {
        throw new Error('模块加载失败');
      }

      // 初始化并渲染测试
      await module.init();
      module.render(container, {
        onComplete: (result) => {
          saveHistory(testId, result);
          console.log('[PersonalityTest] 测试完成:', result);
        },
        onBack: () => {
          state.currentTest = null;
          render(container);
        }
      });

    } catch (error) {
      console.error('[PersonalityTest] 测试加载失败:', error);
      container.innerHTML = `
        <div class="test-error">
          <p>⚠️ 测试加载失败，请刷新页面重试</p>
          <button class="btn-back">返回测试中心</button>
        </div>
      `;
      
      container.querySelector('.btn-back').addEventListener('click', () => {
        render(container);
      });
    }
  }

  /* ----------------------------------------------------------
   * 动态加载测试模块
   * ---------------------------------------------------------- */
  async function loadTestModule(testId) {
    // 如果已加载，直接返回
    if (TEST_REGISTRY[testId].module) {
      return TEST_REGISTRY[testId].module;
    }

    // 根据testId返回对应的全局模块
    const moduleMap = {
      'airp': window.AIRPTest,
      'love': window.LoveTest,
      'koi': window.KoiTest,
      'partner': window.PartnerTest,
      'music': window.MusicTest
    };

    const module = moduleMap[testId];
    
    if (module) {
      TEST_REGISTRY[testId].module = module;
      return module;
    }

    throw new Error(`测试模块 ${testId} 未找到`);
  }

  /* ----------------------------------------------------------
   * 查看历史结果
   * ---------------------------------------------------------- */
  function viewResult(testId, container) {
    console.log('[PersonalityTest] 查看历史结果:', testId);
    
    const record = state.testHistory.find(h => h.testId === testId);
    if (!record) return;

    // 加载模块并显示结果
    loadTestModule(testId).then(module => {
      if (module && module.renderResult) {
        module.renderResult(container, record.result, {
          onBack: () => render(container)
        });
      }
    });
  }

  /* ----------------------------------------------------------
   * 导出接口
   * ---------------------------------------------------------- */
  return {
    init,
    render,
    startTest,
    getState: () => state,
    TEST_REGISTRY
  };

})();

window.PersonalityTest = PersonalityTest;
console.log('[PersonalityTest] 测试中心加载完成 ✓');



