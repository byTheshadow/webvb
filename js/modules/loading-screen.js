/* ================================
   文件名：loading-screen.js
   功能：开屏加载动画控制
   
   主要功能：
   - 翻页动效
   - 自动播放
   - 跳过功能
   
   最后更新：2026-04-20
   ================================ */

const LoadingScreen = (function() {
    'use strict';

    let currentPage = 0;
    let totalPages = 3;
    let autoPlayTimer = null;
    let isSkipped = false;

    // 初始化
    function init() {
        console.log('[LoadingScreen] 初始化加载页面...');
        
        // 创建加载页面
        createLoadingScreen();
        
        // 开始自动播放
        startAutoPlay();
        
        // 绑定跳过按钮
        bindSkipButton();
    }

    // 创建加载页面HTML
    function createLoadingScreen() {
        const loadingHTML = `
            <div class="loading-screen" id="loading-screen">
                <!-- 背景星星效果 -->
                <div class="loading-bg-effects">
                    ${generateStars(50)}
                </div>

                <!-- 翻页书本 -->
                <div class="loading-book">
                    <!-- 第一页：欢迎 -->
                    <div class="book-page page-welcome" data-page="0">
                        <div class="page-content">
                            <div class="welcome-logo">🌙</div>
                            <h1 class="welcome-title">深渊之影</h1>
                            <p class="welcome-subtitle">Shh. The algorithm is listening...</p>
                            <div class="loading-dots">
                                <div class="dot"></div>
                                <div class="dot"></div>
                                <div class="dot"></div>
                            </div>
                        </div>
                    </div>

                    <!-- 第二页：功能介绍 -->
                    <div class="book-page page-features" data-page="1">
                        <div class="page-content">
                            <h2 class="features-title">✨ 新功能上线</h2>
                            <div class="features-list">
                                <div class="feature-item">
                                    <div class="feature-icon">🔮</div>
                                    <div class="feature-text">锦鲤TI - 智能角色卡推荐</div>
                                </div>
                                <div class="feature-item">
                                    <div class="feature-icon">🌸</div>
                                    <div class="feature-text">调香系统 - 创造专属香水</div>
                                </div>
                                <div class="feature-item">
                                    <div class="feature-icon">🍸</div>
                                    <div class="feature-text">调酒系统 - 调制心情鸡尾酒</div>
                                </div>
                                <div class="feature-item">
                                    <div class="feature-icon">📝</div>
                                    <div class="feature-text">拼贴诗 - 文字艺术创作</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 第三页：免责声明 -->
                    <div class="book-page page-disclaimer" data-page="2">
                        <div class="page-content">
                            <h2 class="disclaimer-title">⚠️ 免责声明</h2>
                            <div class="disclaimer-content">
                                <div class="disclaimer-section">
                                    <div class="disclaimer-label">内容说明</div>
                                    <div class="disclaimer-text">
                                        本站为爱发电，不保证内容完全符合老师们的预期（包括tag部分）。
                                        内容会持续更新优化，感谢理解与支持！
                                    </div>
                                </div>
                                
                                <div class="disclaimer-section">
                                    <div class="disclaimer-label">角色卡来源</div>
                                    <div class="disclaimer-text">
                                        大部分角色卡来自 <span class="credit-highlight">锦鲤欧皇食堂</span>
                                        <br>XHS: @一条小锦鲤
                                        <br>来这里加入食堂
                                    </div>
                                </div>

                                <div class="disclaimer-credits">
                                    <div class="credit-item">
                                        Made with 💜 by <span class="credit-highlight">Shadow</span>
                                    </div>
                                    <div class="credit-item">
                                        XHS: <span class="credit-highlight">@shadowmfn</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 进度指示器 -->
                <div class="loading-progress">
                    <div class="progress-dot active" data-index="0"></div>
                    <div class="progress-dot" data-index="1"></div>
                    <div class="progress-dot" data-index="2"></div>
                </div>

                <!-- 跳过按钮 -->
                <button class="skip-button" id="skip-loading">
                    跳过 →
                </button>
            </div>
        `;

        // 插入到body开头
        document.body.insertAdjacentHTML('afterbegin', loadingHTML);
    }

    // 生成星星
    function generateStars(count) {
        let stars = '';
        for (let i = 0; i < count; i++) {
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const delay = Math.random() * 3;
            const duration = 2 + Math.random() * 2;
            
            stars += `<div class="star" style="
                left: ${x}%;
                top: ${y}%;
                animation-delay: ${delay}s;
                animation-duration: ${duration}s;
            "></div>`;
        }
        return stars;
    }

  // 开始自动播放
function startAutoPlay() {
    // 第一页停留3秒（欢迎页）
    autoPlayTimer = setTimeout(() => {
        if (!isSkipped) {
            nextPage();
            
            // 第二页停留5秒（功能介绍）
            autoPlayTimer = setTimeout(() => {
                if (!isSkipped) {
                    nextPage();
                    
                    // 第三页停留8秒后自动关闭（免责声明）
                    autoPlayTimer = setTimeout(() => {
                        if (!isSkipped) {
                            closeLoadingScreen();
                        }
                    }, 8000); // 改为8秒
                }
            }, 5000); // 改为5秒
        }
    }, 3000);
}


    // 翻到下一页
    function nextPage() {
        if (currentPage >= totalPages - 1) return;

        const currentPageEl = document.querySelector(`.book-page[data-page="${currentPage}"]`);
        if (currentPageEl) {
            currentPageEl.classList.add('flipping');
        }

        currentPage++;
        updateProgress();
    }

    // 更新进度指示器
    function updateProgress() {
        const dots = document.querySelectorAll('.progress-dot');
        dots.forEach((dot, index) => {
            if (index === currentPage) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // 绑定跳过按钮
    function bindSkipButton() {
        const skipBtn = document.getElementById('skip-loading');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                isSkipped = true;
                clearTimeout(autoPlayTimer);
                closeLoadingScreen();
            });
        }
    }

    // 关闭加载页面
    function closeLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            
            setTimeout(() => {
                loadingScreen.remove();
                console.log('[LoadingScreen] 加载页面已关闭');
            }, 800);
        }
    }

    // 公开API
    return {
        init
    };
})();

// 页面加载完成后自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        LoadingScreen.init();
    });
} else {
    LoadingScreen.init();
}
