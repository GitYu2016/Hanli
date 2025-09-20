/**
 * 主题管理类
 * 负责管理应用的主题切换、背景色设置等功能
 */
class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.systemThemeListener = null;
        this.handleSystemThemeChange = null;
        
        // 定义有效的背景色列表
        this.validBackgroundColors = ['default', 'blue', 'green', 'purple', 'orange', 'pink', 'gray', 'indigo'];
        
        // 定义有效的主题列表
        this.validThemes = ['light', 'dark', 'auto'];
    }

    /**
     * 初始化主题管理器
     */
    init() {
        this.loadTheme();
        this.setupSystemThemeListener();
    }

    /**
     * 加载主题
     */
    loadTheme() {
        const savedTheme = localStorage.getItem('app-theme') || 'auto';
        this.setTheme(savedTheme);
        
        // 应用存储的背景色
        this._applyStoredBackgroundColor();
    }

    /**
     * 设置主题
     * @param {string} theme - 主题名称 ('light', 'dark', 'auto')
     */
    setTheme(theme) {
        if (!theme || typeof theme !== 'string') {
            console.error('❌ 主题参数无效:', theme);
            return;
        }

        this.currentTheme = theme;
        const themeColors = document.getElementById('theme-colors');
        const root = document.documentElement;
        
        if (!themeColors) {
            console.error('❌ 找不到主题样式链接元素');
            return;
        }
        
        // 移除现有主题类
        root.classList.remove('theme-light', 'theme-dark', 'theme-auto');
        
        if (theme === 'auto') {
            // 跟随系统主题
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const actualTheme = prefersDark ? 'dark' : 'light';
            themeColors.href = `theme/${actualTheme}/colors.css`;
            root.classList.add(`theme-${actualTheme}`);
            
            // 监听系统主题变化
            this.setupSystemThemeListener();
        } else {
            // 使用指定主题
            themeColors.href = `theme/${theme}/colors.css`;
            root.classList.add(`theme-${theme}`);
        }
        
        // 重新应用背景色，确保主题切换后背景色仍然有效
        this._applyStoredBackgroundColor();
        
        localStorage.setItem('app-theme', theme);
        
        // 触发主题变化事件
        const themeChangedEvent = new CustomEvent('themeChanged', {
            detail: { theme: theme }
        });
        document.dispatchEvent(themeChangedEvent);
    }

    /**
     * 设置背景色
     * @param {string} bgColor - 背景色名称
     * @param {boolean} silent - 是否静默设置（不输出日志）
     */
    setBackgroundColor(bgColor, silent = false) {
        if (!bgColor || typeof bgColor !== 'string') {
            console.error('❌ 背景色参数无效:', bgColor);
            return;
        }

        // 验证背景色是否在允许的列表中
        if (!this.validBackgroundColors.includes(bgColor)) {
            console.error('❌ 无效的背景色:', bgColor);
            return;
        }

        const root = document.documentElement;
        const body = document.body;
        
        // 移除现有背景色类
        this.validBackgroundColors.forEach(color => {
            root.classList.remove(`bg-body-${color}`);
            body.classList.remove(`bg-body-${color}`);
        });
        
        // 添加新背景色类到html和body元素
        root.classList.add(`bg-body-${bgColor}`);
        body.classList.add(`bg-body-${bgColor}`);
        
        // 保存到localStorage
        localStorage.setItem('app-background-color', bgColor);
        
        // 背景色切换完成
    }

    /**
     * 设置系统主题监听器
     */
    setupSystemThemeListener() {
        if (this.systemThemeListener) {
            this.systemThemeListener.removeEventListener('change', this.handleSystemThemeChange);
        }
        
        this.systemThemeListener = window.matchMedia('(prefers-color-scheme: dark)');
        this.handleSystemThemeChange = () => {
            if (this.currentTheme === 'auto') {
                const prefersDark = this.systemThemeListener.matches;
                const actualTheme = prefersDark ? 'dark' : 'light';
                const themeColors = document.getElementById('theme-colors');
                const root = document.documentElement;
                
                if (!themeColors) {
                    console.error('❌ 系统主题切换时找不到主题样式链接元素');
                    return;
                }
                
                root.classList.remove('theme-light', 'theme-dark');
                root.classList.add(`theme-${actualTheme}`);
                themeColors.href = `theme/${actualTheme}/colors.css`;
                
                // 重新应用背景色，确保系统主题切换后背景色仍然有效
                this._applyStoredBackgroundColor();
                
                // 触发主题变化事件
                const themeChangedEvent = new CustomEvent('themeChanged', {
                    detail: { theme: 'auto', actualTheme: actualTheme }
                });
                document.dispatchEvent(themeChangedEvent);
            }
        };
        
        this.systemThemeListener.addEventListener('change', this.handleSystemThemeChange);
    }

    /**
     * 获取当前主题
     * @returns {string} 当前主题
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * 预览主题效果（用于设置弹窗）
     * @param {string} theme - 主题名称
     */
    previewTheme(theme) {
        if (!theme || typeof theme !== 'string') {
            console.error('❌ 预览主题参数无效:', theme);
            return;
        }

        if (!this.validThemes.includes(theme)) {
            console.error('❌ 无效的预览主题:', theme);
            return;
        }

        const root = document.documentElement;
        
        // 移除现有主题类
        root.classList.remove('theme-light', 'theme-dark', 'theme-auto');
        
        // 添加新主题类
        if (theme === 'auto') {
            // 跟随系统主题
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
        } else {
            root.classList.add(`theme-${theme}`);
        }
    }

    /**
     * 应用存储的主题
     */
    applyStoredTheme() {
        const theme = this.getCurrentTheme();
        this.setTheme(theme);
    }

    /**
     * 获取可用的主题列表
     * @returns {Array} 主题列表
     */
    getAvailableThemes() {
        return [
            { value: 'light', label: '浅色主题', description: '适合日间使用' },
            { value: 'dark', label: '深色主题', description: '适合夜间使用' },
            { value: 'auto', label: '跟随系统', description: '自动切换主题' }
        ];
    }

    /**
     * 获取可用的背景色列表
     * @returns {Array} 背景色列表
     */
    getAvailableBackgroundColors() {
        const backgroundColors = [
            { value: 'default', label: '默认', cssVariable: '--color-body-bg-default' },
            { value: 'blue', label: '海洋蓝', cssVariable: '--color-body-bg-blue' },
            { value: 'green', label: '森林绿', cssVariable: '--color-body-bg-green' },
            { value: 'purple', label: '紫罗兰', cssVariable: '--color-body-bg-purple' },
            { value: 'orange', label: '夕阳橙', cssVariable: '--color-body-bg-orange' },
            { value: 'pink', label: '樱花粉', cssVariable: '--color-body-bg-pink' },
            { value: 'gray', label: '石墨灰', cssVariable: '--color-body-bg-gray' },
            { value: 'indigo', label: '靛青', cssVariable: '--color-body-bg-indigo' }
        ];

        // 直接从CSS变量获取颜色值，避免DOM操作
        return backgroundColors.map(bg => {
            const root = document.documentElement;
            const colorValue = getComputedStyle(root).getPropertyValue(bg.cssVariable).trim();
            
            return {
                value: bg.value,
                label: bg.label,
                color: this.rgbaToHex(colorValue || 'var(--color-body-bg-default)')
            };
        });
    }

    /**
     * 将 rgba 颜色值转换为十六进制
     * @param {string} rgba - rgba 颜色值
     * @returns {string} 十六进制颜色值
     */
    rgbaToHex(rgba) {
        // 如果是十六进制格式，直接返回
        if (rgba.startsWith('#')) {
            return rgba;
        }

        // 解析 rgba 值
        const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
        if (match) {
            const r = parseInt(match[1]);
            const g = parseInt(match[2]);
            const b = parseInt(match[3]);
            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        }

        // 如果解析失败，返回默认值
        return 'var(--color-body-bg-default)';
    }

    /**
     * 私有方法：应用存储的背景色
     * @private
     */
    _applyStoredBackgroundColor() {
        const savedBgColor = localStorage.getItem('app-background-color') || 'default';
        this.setBackgroundColor(savedBgColor, true); // 静默设置，避免重复日志
    }

    /**
     * 销毁主题管理器
     */
    destroy() {
        if (this.systemThemeListener && this.handleSystemThemeChange) {
            this.systemThemeListener.removeEventListener('change', this.handleSystemThemeChange);
        }
        this.systemThemeListener = null;
        this.handleSystemThemeChange = null;
    }
}

// 导出ThemeManager类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
} else if (typeof window !== 'undefined') {
    window.ThemeManager = ThemeManager;
}
