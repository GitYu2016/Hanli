/**
 * 主题管理器
 * 负责动态加载和切换主题
 */
class ThemeManager {
    constructor() {
        this.currentTheme = 'light'; // 默认主题
        this.themeLink = null;
        this.init();
    }

    /**
     * 初始化主题管理器
     */
    init() {
        // 从localStorage读取保存的主题设置
        const savedTheme = localStorage.getItem('hanli-theme');
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
            this.currentTheme = savedTheme;
        }

        // 创建主题CSS链接元素
        this.createThemeLink();
        
        // 应用初始主题
        this.applyTheme(this.currentTheme);
        
        // 监听系统主题变化
        this.watchSystemTheme();
    }

    /**
     * 创建主题CSS链接元素
     */
    createThemeLink() {
        this.themeLink = document.createElement('link');
        this.themeLink.rel = 'stylesheet';
        this.themeLink.type = 'text/css';
        document.head.appendChild(this.themeLink);
    }

    /**
     * 应用主题
     * @param {string} theme - 主题名称 ('light', 'dark', 'system')
     */
    applyTheme(theme) {
        this.currentTheme = theme;
        
        // 保存到localStorage
        localStorage.setItem('hanli-theme', theme);
        
        // 设置data-theme属性
        document.documentElement.setAttribute('data-theme', theme);
        
        // 加载对应的主题CSS
        this.loadThemeCSS(theme);
        
        // 触发主题变化事件
        this.dispatchThemeChangeEvent();
    }

    /**
     * 加载主题CSS文件
     * @param {string} theme - 主题名称
     */
    loadThemeCSS(theme) {
        let themePath;
        
        if (theme === 'system') {
            // 系统主题：根据系统偏好选择
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            themePath = `./theme/${isDark ? 'dark' : 'light'}/colors.css`;
        } else {
            // 指定主题
            themePath = `./theme/${theme}/colors.css`;
        }
        
        if (this.themeLink) {
            this.themeLink.href = themePath;
        }
    }

    /**
     * 监听系统主题变化
     */
    watchSystemTheme() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleSystemThemeChange = (e) => {
            if (this.currentTheme === 'system') {
                this.loadThemeCSS('system');
                this.dispatchThemeChangeEvent();
            }
        };
        
        // 监听系统主题变化
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleSystemThemeChange);
        } else {
            // 兼容旧版浏览器
            mediaQuery.addListener(handleSystemThemeChange);
        }
    }

    /**
     * 获取当前主题
     * @returns {string} 当前主题名称
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * 获取实际应用的主题（考虑系统主题）
     * @returns {string} 实际应用的主题名称
     */
    getAppliedTheme() {
        if (this.currentTheme === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return this.currentTheme;
    }

    /**
     * 切换主题
     * @param {string} theme - 目标主题
     */
    switchTheme(theme) {
        if (['light', 'dark', 'system'].includes(theme)) {
            this.applyTheme(theme);
        } else {
            console.warn('无效的主题名称:', theme);
        }
    }

    /**
     * 触发主题变化事件
     */
    dispatchThemeChangeEvent() {
        const event = new CustomEvent('themeChanged', {
            detail: {
                theme: this.currentTheme,
                appliedTheme: this.getAppliedTheme()
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * 获取主题列表
     * @returns {Array} 主题列表
     */
    getThemeList() {
        return [
            { id: 'light', name: '浅色主题', description: '明亮清爽的界面' },
            { id: 'dark', name: '深色主题', description: '护眼舒适的深色界面' },
            { id: 'system', name: '跟随系统', description: '自动跟随系统主题设置' }
        ];
    }

    /**
     * 检查主题是否可用
     * @param {string} theme - 主题名称
     * @returns {boolean} 主题是否可用
     */
    isThemeAvailable(theme) {
        return ['light', 'dark', 'system'].includes(theme);
    }
}

// 创建全局主题管理器实例
window.themeManager = new ThemeManager();

// 导出主题管理器类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
