/* ================================
   文件名：app.js
   功能：应用主入口，初始化所有模块
   依赖：router.js, storage.js, data-loader.js, 所有模块
   
   主要功能：
   - 初始化应用
   - 协调各模块
   - 处理全局事件
   - 管理应用状态
   
   最后更新：2026-04-18
   ================================ */

// ========== 区块A：应用主对象 开始 ==========
// 用途：管理整个应用的生命周期
const App = {
    // 应用状态
    state: {
        initialized: false,
        currentPage: 'home',
        user: null
    },

    // ========== 区块A1：初始化方法 开始 ==========
// 用途：应用启动时执行
async init() {
    console.log('[App] 开始初始化...');
    
    try {
        // 1. 加载用户设置
        this.loadUserSettings();
        
        // 2. 初始化路由
        Router.init();
        
        // 找到偏好管理器初始化
if (typeof PreferenceManager !== 'undefined') {
    // ❌ 删除或注释掉立即初始化
    // PreferenceManager.init();
    
    // ✅ 监听加载完成事件
    window.addEventListener('loadingComplete', () => {
        console.log('[App] 加载页面完成，初始化偏好管理器');
        PreferenceManager.init();
    });
}

        
        // 4. 初始化主题管理器
        if (typeof ThemeManager !== 'undefined') {
            ThemeManager.init();
        }
        
        // 5. 初始化音频播放器
        if (typeof AudioPlayer !== 'undefined') {
            AudioPlayer.init();
        }
        
        // 6. 初始化角色详情页
        if (typeof CharacterDetail !== 'undefined') {
            CharacterDetail.init();
        }
        
        // 6.5. 初始化拼贴诗系统
        if (typeof PoetryCollage !== 'undefined') {
            PoetryCollage.init();
        }
        // 初始化角色选择器
      if (typeof CharacterSelector !== 'undefined') {
      CharacterSelector.init();
      }

        // ✨ 新增：6.6. 初始化创意中心
        if (typeof CreativeHub !== 'undefined') {
            CreativeHub.init();
        }
        
        // ✨ 新增：6.7. 初始化调酒系统
        if (typeof CocktailMixer !== 'undefined') {
            await CocktailMixer.init(); // 注意这里是 await，因为需要加载数据
        }

        // ✨ 新增：6.8. 初始化调香系统
       if (typeof PerfumeBlender !== 'undefined') {
       await PerfumeBlender.init();
       }



        // 7. 绑定全局事件
        this.bindEvents();
        
        // 8. 隐藏加载动画
        this.hideLoadingScreen();
        
        // 9. 标记为已初始化
        this.state.initialized = true;
        
        console.log('[App] 初始化完成');
    } catch (error) {
        console.error('[App] 初始化失败:', error);
        this.showError('应用初始化失败，请刷新页面重试');
    }
},


    // ========== 区块A1：初始化方法 结束 ==========

    // ========== 区块A2：加载用户设置 开始 ==========
    // 用途：从本地存储恢复用户的偏好设置
// ========== 区块A2：加载用户设置 开始 ==========
loadUserSettings() {
    console.log('[App] 加载用户设置...');
    
    // 加载主题设置
    const savedTheme = Storage.get('theme') || 'rain';
    document.body.setAttribute('data-theme', savedTheme);
    
    // 加载自定义背景
    const customBg = Storage.get('customBackground');
    if (customBg) {
        this.applyCustomBackground(customBg);
    }
    
    // 加载音频设置
    const audioSettings = Storage.get('audioSettings');
    if (audioSettings) {
        console.log('[App] 音频设置已加载');
    }
    
    console.log('[App] 用户设置加载完成');
},

    // ========== 区块A2：加载用户设置 结束 ==========

    // ========== 区块A3：绑定全局事件 开始 ==========
  
// ========== 区块A3：绑定全局事件 开始 ==========
bindEvents() {
    console.log('[App] 绑定全局事件...');
    
    // 设置按钮点击
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            this.openSettings();
        });
    }
    
    // 关闭设置按钮 - 使用事件委托
    document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'close-settings') {
            this.closeSettings();
        }
    });
    
    // 点击模态框背景关闭
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) {
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                this.closeSettings();
            }
        });
    }
    
    // 底部导航点击
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // 移除所有active类
            navItems.forEach(nav => nav.classList.remove('active'));
            // 添加active到当前项
            item.classList.add('active');
        });
    });
    
    // ✨ 新增：背景上传功能
    this.bindBackgroundUpload();
    
    console.log('[App] 全局事件绑定完成');
},

    // ========== 区块A3：绑定全局事件 结束 ==========

    // ========== 区块A4：设置面板控制 开始 ==========
   // ========== 区块A4：设置面板控制 开始 ==========
// 用途：打开和关闭设置面板
openSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // 防止背景滚动
        
        // 更新偏好摘要显示
        if (typeof PreferenceManager !== 'undefined') {
            const summary = PreferenceManager.getPreferencesSummary();
            const summaryEl = document.getElementById('preference-summary');
            if (summaryEl) {
                summaryEl.textContent = summary;
            }
        }
    }
},

closeSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // 恢复滚动
    }
},
    // ========== 区块A4：设置面板控制 结束 ==========

    // ========== 区块A5：加载动画控制 开始 ==========
    // 用途：显示和隐藏全屏加载动画
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                // 动画结束后移除元素
                setTimeout(() => {
                    loadingScreen.remove();
                }, 300);
            }, 500); // 至少显示500ms，避免闪烁
        }
    },

    showLoadingScreen() {
        // 如果需要在某些操作时显示加载动画
        const loadingHTML = `
            <div id="loading-screen" class="loading-screen">
                <div class="loading-spinner"></div>
                <p class="loading-text">加载中...</p>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', loadingHTML);
    },
    // ========== 区块A5：加载动画控制 结束 ==========

    // ========== 区块A6：错误处理 开始 ==========
// ========== 区块A6：错误处理 开始 ==========
showError(message) {
    this.showToast(message, 'error');
    console.error('[App] 错误:', message);
},

showSuccess(message) {
    this.showToast(message, 'success');
    console.log('[App] 成功:', message);
},

showToast(message, type = 'info') {
    // 创建 toast 元素
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // 添加样式
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 1rem 2rem;
        background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#00C851' : '#33b5e5'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        font-size: 0.95rem;
        animation: toastSlideIn 0.3s ease;
    `;
    
    // 添加动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes toastSlideIn {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
        @keyframes toastSlideOut {
            from {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            to {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
        }
    `;
    
    if (!document.getElementById('toast-styles')) {
        style.id = 'toast-styles';
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    // 3秒后移除
    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s ease';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
},
// ========== 区块A6：错误处理 结束 ==========

    // ========== 区块A7：工具方法 开始 ==========
    // 用途：一些通用的辅助方法
    
    // 切换页面
    navigateTo(page) {
        window.location.hash = `#/${page}`;
    },

    // 获取当前页面
    getCurrentPage() {
        return this.state.currentPage;
    },

    // 更新页面状态
    setCurrentPage(page) {
        this.state.currentPage = page;
        console.log('[App] 当前页面:', page);
    }
    // ========== 区块A7：工具方法 结束 ==========
};
// ========== 区块A8：背景上传功能 开始 ==========
// 用途：处理自定义背景图上传

bindBackgroundUpload() {
    // 上传按钮点击
    const uploadBtn = document.getElementById('upload-bg-btn');
    const fileInput = document.getElementById('custom-bg-input');
    
    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', () => {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', (e) => {
            this.handleBackgroundUpload(e);
        });
    }
    
    // 恢复默认按钮
    const resetBtn = document.getElementById('reset-bg-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            this.resetBackground();
        });
    }
},

handleBackgroundUpload(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件');
        return;
    }
    
    // 检查文件大小（限制5MB）
    if (file.size > 5 * 1024 * 1024) {
        alert('图片文件不能超过 5MB');
        return;
    }
    
    // 读取文件
    const reader = new FileReader();
    
    reader.onload = (e) => {
        const imageData = e.target.result;
        
        // 压缩图片
        this.compressImage(imageData, (compressedData) => {
            // 应用背景
            this.applyCustomBackground(compressedData);
            
            // 保存到 localStorage
            Storage.set('customBackground', compressedData);
            
            // 显示成功提示
            this.showSuccess('背景已更新');
        });
    };
    
    reader.onerror = () => {
        alert('图片读取失败，请重试');
    };
    
    reader.readAsDataURL(file);
},

compressImage(dataUrl, callback) {
    const img = new Image();
    
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 计算压缩后的尺寸（最大宽度1920px）
        let width = img.width;
        let height = img.height;
        const maxWidth = 1920;
        
        if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // 绘制图片
        ctx.drawImage(img, 0, 0, width, height);
        
        // 转换为 base64（质量0.8）
        const compressedData = canvas.toDataURL('image/jpeg', 0.8);
        
        callback(compressedData);
    };
    
    img.onerror = () => {
        alert('图片处理失败');
    };
    
    img.src = dataUrl;
},

applyCustomBackground(imageData) {
    document.body.style.backgroundImage = `url(${imageData})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.setAttribute('data-custom-bg', 'true');
},

resetBackground() {
    // 移除自定义背景
    document.body.style.backgroundImage = '';
    document.body.removeAttribute('data-custom-bg');
    
    // 从 localStorage 删除
    Storage.remove('customBackground');
    
    // 显示成功提示
    this.showSuccess('已恢复默认背景');
},
// ========== 区块A8：背景上传功能 结束 ==========

// ========== 区块A：应用主对象 结束 ==========

// ========== 区块B：全局错误处理 开始 ==========
// 用途：捕获未处理的错误
window.addEventListener('error', (event) => {
    console.error('[全局错误]', event.error);
    // 可以在这里上报错误到服务器
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('[未处理的Promise拒绝]', event.reason);
});
// ========== 区块B：全局错误处理 结束 ==========

// ========== 区块C：应用启动 开始 ==========
// 用途：DOM加载完成后启动应用
document.addEventListener('DOMContentLoaded', () => {
    console.log('[App] DOM加载完成，启动应用...');
    App.init();
});
// ========== 区块C：应用启动 结束 ==========

// ========== 区块D：导出到全局 开始 ==========
// 用途：让其他模块可以访问App对象
window.App = App;
// ========== 区块D：导出到全局 结束 ==========
