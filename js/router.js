/* ================================
   文件名：router.js
   功能：路由管理，处理页面切换
   依赖：无
   
   主要功能：
   - 监听URL变化
   - 渲染对应页面
   - 管理页面历史
   
   路由规则：
   #/home - 首页
   #/test - 人格测试
   #/lenormand - 雷诺曼占卜
   #/creative - 创意功能（调酒、配香水、拼贴诗）
   #/cp - CP分析
   #/more - 更多功能
   
   最后更新：2026-04-18
   ================================ */

// ========== 区块A：路由对象 开始 ==========
// 用途：管理所有路由逻辑
const Router = {
    // 当前路由
    currentRoute: '',
    
    // ========== 区块A1：路由配置 开始 ==========
    // 用途：定义所有路由和对应的渲染函数
    routes: {
        'home': {
            title: '首页',
            render: () => Router.renderHome()
        },
        'test': {
            title: '人格测试',
            render: () => Router.renderTest()
        },
        'lenormand': {
            title: '雷诺曼占卜',
            render: () => Router.renderLenormand()
        },
        'creative': {
            title: '创意功能',
            render: () => Router.renderCreative()
        },
        'cp': {
            title: 'CP分析',
            render: () => Router.renderCP()
        },
        'more': {
            title: '更多',
            render: () => Router.renderMore()
        }
    },
    // ========== 区块A1：路由配置 结束 ==========

    // ========== 区块A2：初始化路由 开始 ==========
    // 用途：启动路由监听
    init() {
        console.log('[Router] 初始化路由系统...');
        
        // 监听hash变化
        window.addEventListener('hashchange', () => {
            this.handleRoute();
        });
        
        // 处理初始路由
        this.handleRoute();
        
        console.log('[Router] 路由系统初始化完成');
    },
    // ========== 区块A2：初始化路由 结束 ==========

    // ========== 区块A3：处理路由 开始 ==========
    // 用途：解析URL并渲染对应页面
    handleRoute() {
        // 获取hash，去掉#/
        let hash = window.location.hash.slice(2) || 'home';
        
        console.log('[Router] 路由变化:', hash);
        
        // 检查路由是否存在
        if (!this.routes[hash]) {
            console.warn('[Router] 路由不存在，跳转到首页');
            hash = 'home';
            window.location.hash = '#/home';
        }
        
        // 保存当前路由
        this.currentRoute = hash;
        
        // 更新App状态
        if (window.App) {
            window.App.setCurrentPage(hash);
        }
        
        // 渲染页面
        this.renderPage(hash);
    },
    // ========== 区块A3：处理路由 结束 ==========

    // ========== 区块A4：渲染页面 开始 ==========
    // 用途：执行页面渲染函数
    renderPage(routeName) {
        const route = this.routes[routeName];
        const mainContent = document.getElementById('main-content');
        
        if (!mainContent) {
            console.error('[Router] 找不到main-content元素');
            return;
        }
        
        // 添加退出动画
        mainContent.classList.add('page-exit');
        
        // 等待动画完成后渲染新页面
        setTimeout(() => {
            // 清空内容
            mainContent.innerHTML = '';
            
            // 渲染新页面
            route.render();
            
            // 添加进入动画
            mainContent.classList.remove('page-exit');
            mainContent.classList.add('page-enter');
            
            // 移除动画类
            setTimeout(() => {
                mainContent.classList.remove('page-enter');
            }, 400);
            
            // 滚动到顶部
            window.scrollTo(0, 0);
            
        }, 300);
    },
    // ========== 区块A4：渲染页面 结束 ==========

    // ========== 区块A5：页面渲染函数 开始 ==========
    // 用途：各个页面的HTML生成
    
    // 首页
    renderHome() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="home-page">
                <div class="welcome-section">
                    <h2 class="welcome-title">欢迎来到 webvb</h2>
                    <p class="welcome-subtitle">探索你的内心世界，发现专属角色卡</p>
                </div>
                
                <div class="feature-grid">
                    <a href="#/test" class="feature-card card-appear">
                        <div class="feature-icon">📝</div>
                        <h3>人格测试</h3>
                        <p>通过测试了解自己，获得角色卡推荐</p>
                    </a>
                    
                    <a href="#/lenormand" class="feature-card card-appear" style="animation-delay: 0.1s">
                        <div class="feature-icon">🔮</div>
                        <h3>雷诺曼占卜</h3>
                        <p>抽取卡牌，探索今日运势</p>
                    </a>
                    
                    <a href="#/creative" class="feature-card card-appear" style="animation-delay: 0.2s">
                        <div class="feature-icon">✨</div>
                        <h3>创意功能</h3>
                        <p>调酒、配香水、拼贴诗</p>
                    </a>
                    
                    <a href="#/cp" class="feature-card card-appear" style="animation-delay: 0.3s">
                        <div class="feature-icon">💕</div>
                        <h3>CP分析</h3>
                        <p>分析你与角色的契合度</p>
                    </a>
                </div>
            </div>
        `;
        
        // 添加首页样式
        this.injectHomeStyles();
    },

    // 人格测试页面
    renderTest() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="test-page">
                <h2>人格测试</h2>
                <p>功能开发中...</p>
                <p>这里将显示人格测试的内容</p>
            </div>
        `;
    },

    // 雷诺曼占卜页面
    renderLenormand() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="lenormand-page">
                <h2>雷诺曼占卜</h2>
                <p>功能开发中...</p>
                <p>这里将显示雷诺曼占卜的内容</p>
            </div>
        `;
    },

    // 创意功能页面
    renderCreative() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="creative-page">
                <h2>创意功能</h2>
                <div class="creative-options">
                    <div class="creative-card card">
                        <h3>🍸 调酒</h3>
                        <p>为自己和角色调制专属酒液</p>
                        <button class="primary-btn">开始调酒</button>
                    </div>
                    <div class="creative-card card">
                        <h3>🌸 配香水</h3>
                        <p>创造独特的香水配方
                        <button class="primary-btn">开始配香</button>
                    </div>
                    <div class="creative-card card">
                        <h3>📝 拼贴诗</h3>
                        <p>用词语拼凑出你的诗歌</p>
                        <button class="primary-btn">开始创作</button>
                    </div>
                </div>
            </div>
        `;
        
        this.injectCreativeStyles();
    },

    // CP分析页面
    renderCP() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="cp-page">
                <h2>CP分析</h2>
                <p>功能开发中...</p>
                <p>这里将显示CP分析的内容</p>
            </div>
        `;
    },

    // 更多功能页面
    renderMore() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="more-page">
                <h2>更多功能</h2>
                <div class="more-list">
                    <div class="more-item card">
                        <span class="more-icon">📚</span>
                        <div class="more-info">
                            <h3>角色卡图鉴</h3>
                            <p>浏览所有角色卡</p>
                        </div>
                    </div>
                    <div class="more-item card">
                        <span class="more-icon">⭐</span>
                        <div class="more-info">
                            <h3>我的收藏</h3>
                            <p>查看收藏的角色卡和结果</p>
                        </div>
                    </div>
                    <div class="more-item card">
                        <span class="more-icon">📊</span>
                        <div class="more-info">
                            <h3>测试历史</h3>
                            <p>查看过往的测试记录</p>
                        </div>
                    </div>
                    <div class="more-item card">
                        <span class="more-icon">ℹ️</span>
                        <div class="more-info">
                            <h3>关于</h3>
                            <p>了解 webvb 项目</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.injectMoreStyles();
    },
    // ========== 区块A5：页面渲染函数 结束 ==========

    // ========== 区块A6：动态样式注入 开始 ==========
    // 用途：为特定页面注入专属样式
    
    injectHomeStyles() {
        const styleId = 'home-page-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .home-page {
                max-width: 800px;
                margin: 0 auto;
            }
            
            .welcome-section {
                text-align: center;
                margin-bottom: var(--spacing-xl);
                padding: var(--spacing-xl) 0;
            }
            
            .welcome-title {
                font-size: 32px;
                font-weight: 700;
                margin-bottom: var(--spacing-md);
                background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .welcome-subtitle {
                font-size: 16px;
                color: var(--text-secondary);
            }
            
            .feature-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: var(--spacing-lg);
            }
            
            .feature-card {
                background: var(--surface-color);
                border-radius: var(--border-radius);
                padding: var(--spacing-xl);
                text-align: center;
                transition: all var(--transition-fast);
                border: 2px solid transparent;
                cursor: pointer;
            }
            
            .feature-card:hover {
                transform: translateY(-5px);
                border-color: var(--primary-color);
                box-shadow: var(--shadow-lg);
            }
            
            .feature-icon {
                font-size: 48px;
                margin-bottom: var(--spacing-md);
            }
            
            .feature-card h3 {
                font-size: 20px;
                font-weight: 600;
                margin-bottom: var(--spacing-sm);
                color: var(--text-primary);
            }
            
            .feature-card p {
                font-size: 14px;
                color: var(--text-secondary);
                line-height: 1.5;
            }
            
            @media (max-width: 768px) {
                .welcome-title {
                    font-size: 24px;
                }
                
                .feature-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(style);
    },
    
    injectCreativeStyles() {
        const styleId = 'creative-page-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .creative-page {
                max-width: 900px;
                margin: 0 auto;
            }
            
            .creative-page h2 {
                font-size: 28px;
                margin-bottom: var(--spacing-xl);
                text-align: center;
            }
            
            .creative-options {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: var(--spacing-lg);
            }
            
            .creative-card {
                text-align: center;
                padding: var(--spacing-xl);
            }
            
            .creative-card h3 {
                font-size: 24px;
                margin-bottom: var(--spacing-md);
            }
            
            .creative-card p {
                color: var(--text-secondary);
                margin-bottom: var(--spacing-lg);
            }
            
            .creative-card .primary-btn {
                width: 100%;
            }
        `;
        document.head.appendChild(style);
    },
    
    injectMoreStyles() {
        const styleId = 'more-page-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .more-page {
                max-width: 600px;
                margin: 0 auto;
            }
            
            .more-page h2 {
                font-size: 28px;
                margin-bottom: var(--spacing-xl);
                text-align: center;
            }
            
            .more-list {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-md);
            }
            
            .more-item {
                display: flex;
                align-items: center;
                gap: var(--spacing-lg);
                padding: var(--spacing-lg);
                cursor: pointer;
                transition: all var(--transition-fast);
            }
            
            .more-item:hover {
                transform: translateX(5px);
                border-left: 3px solid var(--primary-color);
            }
            
            .more-icon {
                font-size: 32px;
                flex-shrink: 0;
            }
            
            .more-info h3 {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 4px;
            }
            
            .more-info p {
                font-size: 14px;
                color: var(--text-secondary);
            }
        `;
        document.head.appendChild(style);
    }
    // ========== 区块A6：动态样式注入 结束 ==========
};
// ========== 区块A：路由对象 结束 ==========

// ========== 区块B：导出到全局 开始 ==========
// 用途：让其他模块可以访问Router对象
window.Router = Router;
// ========== 区块B：导出到全局 结束 ==========
