/* ================================
   文件名：theme-manager.js
   功能：主题切换管理器
   依赖：storage.js
   
   主要功能：
   - 三主题切换（雨幕/春日花园/无人之地）
   - 保存主题到 localStorage
   - 平滑过渡动画
   - 当前主题高亮显示
   
   最后更新：2026-04-19
   ================================ */

// ========== 区块A：主题管理器对象 开始 ==========
const ThemeManager = {
    // 当前主题
    currentTheme: 'rain',
    
    // 可用主题配置
    themes: {
        rain: {
            id: 'rain',
            name: '雨幕',
            icon: '🌧️',
            description: '冷色调，忧郁而宁静',
            colors: {
                // 背景色
                '--background-color': '#e8eef5',
                '--surface-color': 'rgba(255, 255, 255, 0.7)',
                
                // 文字色
                '--text-primary': '#2c3e50',
                '--text-secondary': '#5a6c7d',
                '--text-inverse': '#ffffff',
                
                // 主题色
                '--primary-color': '#5b8fb9',
                '--secondary-color': '#7ba7cc',
                '--accent-color': '#4a7ba7',
                
                // 边框和阴影
                '--border-color': 'rgba(91, 143, 185, 0.2)',
                '--shadow-sm': '0 2px 8px rgba(91, 143, 185, 0.1)',
                '--shadow-md': '0 4px 16px rgba(91, 143, 185, 0.15)',
                '--shadow-lg': '0 8px 32px rgba(91, 143, 185, 0.2)',
                
                // 背景图案
                '--bg-pattern': 'linear-gradient(135deg, rgba(91, 143, 185, 0.05) 0%, rgba(123, 167, 204, 0.05) 100%)',
                '--bg-overlay': 'radial-gradient(circle at 20% 50%, rgba(91, 143, 185, 0.1) 0%, transparent 50%)'
            }
        },
        
        spring: {
            id: 'spring',
            name: '春日花园',
            icon: '🌸',
            description: '温暖粉色，浪漫而柔和',
            colors: {
                '--background-color': '#fef5f8',
                '--surface-color': 'rgba(255, 255, 255, 0.8)',
                
                '--text-primary': '#4a3842',
                '--text-secondary': '#8b7a85',
                '--text-inverse': '#ffffff',
                
                '--primary-color': '#e89fb5',
                '--secondary-color': '#f5b8cc',
                '--accent-color': '#d88ca3',
                
                '--border-color': 'rgba(232, 159, 181, 0.2)',
                '--shadow-sm': '0 2px 8px rgba(232, 159, 181, 0.1)',
                '--shadow-md': '0 4px 16px rgba(232, 159, 181, 0.15)',
                '--shadow-lg': '0 8px 32px rgba(232, 159, 181, 0.2)',
                
                '--bg-pattern': 'linear-gradient(135deg, rgba(232, 159, 181, 0.05) 0%, rgba(245, 184, 204, 0.05) 100%)',
                '--bg-overlay': 'radial-gradient(circle at 80% 20%, rgba(232, 159, 181, 0.1) 0%, transparent 50%)'
            }
        },
        
        wasteland: {
            id: 'wasteland',
            name: '无人之地',
            icon: '🌑',
            description: '深色模式，神秘而深邃',
            colors: {
                '--background-color': '#1a1d2e',
                '--surface-color': 'rgba(42, 47, 69, 0.8)',
                
                '--text-primary': '#e8e9f0',
                '--text-secondary': '#a8aab8',
                '--text-inverse': '#1a1d2e',
                
                '--primary-color': '#6b7fa8',
                '--secondary-color': '#8a9dc4',
                '--accent-color': '#5a6d94',
                
                '--border-color': 'rgba(107, 127, 168, 0.2)',
                '--shadow-sm': '0 2px 8px rgba(0, 0, 0, 0.3)',
                '--shadow-md': '0 4px 16px rgba(0, 0, 0, 0.4)',
                '--shadow-lg': '0 8px 32px rgba(0, 0, 0, 0.5)',
                
                '--bg-pattern': 'linear-gradient(135deg, rgba(107, 127, 168, 0.05) 0%, rgba(138, 157, 196, 0.05) 100%)',
                '--bg-overlay': 'radial-gradient(circle at 50% 50%, rgba(107, 127, 168, 0.1) 0%, transparent 50%)'
            }
        }
    },

    // ========== 区块A1：初始化 开始 ==========
    init() {
        console.log('[ThemeManager] 初始化主题管理器...');
        
        // 加载保存的主题
        const savedTheme = this.loadTheme();
        this.applyTheme(savedTheme);
        
        // 绑定主题切换按钮事件
        this.bindThemeButtons();
        
        console.log('[ThemeManager] 主题管理器初始化完成，当前主题:', savedTheme);
    },
    // ========== 区块A1：初始化 结束 ==========

    // ========== 区块A2：主题加载和保存 开始 ==========
    // 从 localStorage 加载主题
    loadTheme() {
        const saved = Storage.get('currentTheme');
        if (saved && this.themes[saved]) {
            return saved;
        }
        return 'rain'; // 默认主题
    },

    // 保存主题到 localStorage
    saveTheme(themeName) {
        Storage.set('currentTheme', themeName);
        console.log('[ThemeManager] 主题已保存:', themeName);
    },
    // ========== 区块A2：主题加载和保存 结束 ==========

    // ========== 区块A3：主题应用 开始 ==========
    /**
     * 应用主题
     * @param {string} themeName - 主题名称
     */
    applyTheme(themeName) {
        if (!this.themes[themeName]) {
            console.warn('[ThemeManager] 主题不存在:', themeName);
            return;
        }

        const theme = this.themes[themeName];
        const root = document.documentElement;

        // 添加过渡效果
        root.style.transition = 'all 0.3s ease';

        // 应用 CSS 变量
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });

        // 设置 data-theme 属性
        document.documentElement.setAttribute('data-theme', themeName);
        document.body.setAttribute('data-theme', themeName);

        // 更新当前主题
        this.currentTheme = themeName;

        // 更新按钮高亮状态
        this.updateButtonStates(themeName);

        // 移除过渡效果（避免影响其他动画）
        setTimeout(() => {
            root.style.transition = '';
        }, 300);

        console.log('[ThemeManager] 主题已应用:', themeName);
    },
    // ========== 区块A3：主题应用 结束 ==========

    // ========== 区块A4：主题切换 开始 ==========
    /**
     * 切换到指定主题
     * @param {string} themeName - 主题名称
     */
    setTheme(themeName) {
        if (!this.themes[themeName]) {
            console.warn('[ThemeManager] 主题不存在:', themeName);
            return;
        }

        // 应用主题
        this.applyTheme(themeName);

        // 保存到 localStorage
        this.saveTheme(themeName);

        // 显示切换成功提示
        this.showThemeToast(this.themes[themeName].name);
    },
    // ========== 区块A4：主题切换 结束 ==========

    // ========== 区块A5：按钮事件绑定 开始 ==========
    bindThemeButtons() {
        // 使用事件委托，监听所有主题按钮
        document.addEventListener('click', (e) => {
            const themeBtn = e.target.closest('[data-theme]');
            if (themeBtn && themeBtn.classList.contains('theme-option')) {
                const themeName = themeBtn.getAttribute('data-theme');
                this.setTheme(themeName);
            }
        });
    },

    // 更新按钮高亮状态
    updateButtonStates(activeTheme) {
        const buttons = document.querySelectorAll('.theme-option');
        buttons.forEach(btn => {
            const themeName = btn.getAttribute('data-theme');
            if (themeName === activeTheme) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    },
    // ========== 区块A5：按钮事件绑定 结束 ==========

    // ========== 区块A6：工具方法 开始 ==========
    // 显示主题切换提示
    showThemeToast(themeName) {
        // 创建 toast 元素
        const toast = document.createElement('div');
        toast.className = 'theme-toast';
        toast.textContent = `已切换到「${themeName}」主题`;
        document.body.appendChild(toast);

        // 显示动画
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // 3秒后移除
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 2000);
    },

    // 获取当前主题信息
    getCurrentTheme() {
        return this.themes[this.currentTheme];
    },

    // 获取所有主题列表
    getAllThemes() {
        return Object.values(this.themes);
    }
    // ========== 区块A6：工具方法 结束 ==========
};
// ========== 区块A：主题管理器对象 结束 ==========

// ========== 区块B：全局函数（供 HTML onclick 调用）开始 ==========
/**
 * 切换主题（供 HTML 调用）
 * @param {string} themeName - 主题名称
 */
function changeTheme(themeName) {
    if (window.ThemeManager) {
        ThemeManager.setTheme(themeName);
    }
}
// ========== 区块B：全局函数 结束 ==========

// ========== 区块C：导出到全局 开始 ==========
window.ThemeManager = ThemeManager;
window.changeTheme = changeTheme;
// ========== 区块C：导出到全局 结束 ==========
