/* ================================
   文件名：theme-manager.js
   功能：主题切换管理器
   依赖：storage.js
   
   主要功能：
   - 三主题切换（rain/spring/wasteland）
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
            name: '落雨日',
            icon: '🌧️',
            description: '冷灰蓝、水汽蒙蒙、淡淡的忧郁与宁静'
        },
        spring: {
            id: 'spring',
            name: '春日序曲',
            icon: '🌸',
            description: '柔和、治愈、带着一点清晨冷空气的微暖'
        },
        wasteland: {
            id: 'wasteland',
            name: '无人之境',
            icon: '🌑',
            description: '深邃、克制、神秘、极简主义的孤独'
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

        // 设置 data-theme 属性
        document.documentElement.setAttribute('data-theme', themeName);
        document.body.setAttribute('data-theme', themeName);

        // 更新当前主题
        this.currentTheme = themeName;

        // 更新按钮高亮状态
        this.updateButtonStates(themeName);

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

        // 2秒后移除
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
