/**
 * 主题选择器组件
 * 提供浅色、深色、跟随系统三种主题选择
 */
class ThemeSelector {
    constructor(options = {}) {
        this.currentTheme = options.currentTheme || 'light';
        this.onThemeChange = options.onThemeChange || (() => {});
        this.themes = [
            {
                value: 'light',
                name: '浅色主题',
                previewClass: 'light-theme'
            },
            {
                value: 'dark', 
                name: '深色主题',
                previewClass: 'dark-theme'
            },
            {
                value: 'auto',
                name: '跟随系统',
                previewClass: 'auto-theme'
            }
        ];
        
        this.init();
    }

    /**
     * 初始化组件
     */
    init() {
        this.injectStyles();
    }

    /**
     * 注入组件样式
     */
    injectStyles() {
        // 检查是否已经注入过样式
        if (document.getElementById('theme-selector-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'theme-selector-styles';
        style.textContent = `
            /* 主题选择器样式 */
            .theme-selector {
                display: flex;
                gap: 16px;
                flex-wrap: wrap;
            }

            .theme-option {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                padding: 12px;
                border: 2px solid var(--color-border);
                border-radius: var(--radius-medium);
                cursor: pointer;
                transition: all 0.2s ease;
                background: var(--color-background-normal);
                min-width: 120px;
            }

            .theme-option:hover {
                border-color: var(--color-border-focused);
            }

            .theme-option.active {
                border-color: var(--color-border-focused);
            }

            .theme-option input[type="radio"] {
                display: none;
            }

            .theme-preview {
                width: 60px;
                height: 40px;
                border-radius: var(--radius-small);
                overflow: hidden;
                border: 1px solid var(--color-border);
                position: relative;
            }

            .theme-preview .preview-header {
                height: 12px;
                background: var(--color-muted);
            }

            .theme-preview .preview-content {
                height: 28px;
                background: var(--color-background-normal);
            }

            .light-theme .preview-header {
                background: var(--color-modal-background);
            }

            .light-theme .preview-content {
                background: var(--color-body-bg-default);
            }

            .dark-theme .preview-header {
                background: var(--color-modal-background);
            }

            .dark-theme .preview-content {
                background: var(--color-body-bg-default);
            }

            .auto-theme .preview-header {
                background: linear-gradient(90deg, var(--color-modal-background) 50%, var(--color-modal-background) 50%);
            }

            .auto-theme .preview-content {
                background: linear-gradient(90deg, var(--color-body-bg-default) 50%, var(--color-body-bg-default) 50%);
            }

            .theme-name {
                font-size: 12px;
                color: var(--color-text-secondary);
                text-align: center;
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * 渲染主题选择器HTML
     * @returns {string} HTML字符串
     */
    render() {
        return `
            <div class="theme-selector">
                ${this.themes.map(theme => `
                    <label class="theme-option ${this.currentTheme === theme.value ? 'active' : ''}" data-theme="${theme.value}">
                        <input type="radio" name="theme" value="${theme.value}" ${this.currentTheme === theme.value ? 'checked' : ''}>
                        <span class="theme-preview ${theme.previewClass}">
                            <div class="preview-header"></div>
                            <div class="preview-content"></div>
                        </span>
                        <span class="theme-name">${theme.name}</span>
                    </label>
                `).join('')}
            </div>
        `;
    }

    /**
     * 绑定事件监听器
     * @param {HTMLElement} container - 容器元素
     */
    bindEvents(container) {
        const themeOptions = container.querySelectorAll('.theme-option');
        
        themeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const themeValue = option.dataset.theme;
                this.selectTheme(themeValue);
            });
        });
    }

    /**
     * 选择主题
     * @param {string} themeValue - 主题值
     */
    selectTheme(themeValue) {
        // 更新当前主题
        this.currentTheme = themeValue;
        
        // 更新UI状态
        const container = document.querySelector('.theme-selector');
        if (container) {
            const themeOptions = container.querySelectorAll('.theme-option');
            themeOptions.forEach(option => {
                option.classList.remove('active');
                const radio = option.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = false;
                }
            });
            
            const selectedOption = container.querySelector(`[data-theme="${themeValue}"]`);
            if (selectedOption) {
                selectedOption.classList.add('active');
                const radio = selectedOption.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                }
            }
        }
        
        // 预览主题效果
        this.previewTheme(themeValue);
        
        // 触发回调
        this.onThemeChange(themeValue);
    }


    /**
     * 预览主题效果
     * @param {string} theme - 主题名称
     */
    previewTheme(theme) {
        const root = document.documentElement;
        const themeColors = document.getElementById('theme-colors');
        
        // 移除现有主题类
        root.classList.remove('theme-light', 'theme-dark', 'theme-auto');
        
        // 添加新主题类
        if (theme === 'auto') {
            // 跟随系统主题
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const actualTheme = prefersDark ? 'dark' : 'light';
            root.classList.add(`theme-${actualTheme}`);
            themeColors.href = `theme/${actualTheme}/colors.css`;
        } else {
            root.classList.add(`theme-${theme}`);
            themeColors.href = `theme/${theme}/colors.css`;
        }
    }

    /**
     * 设置当前主题
     * @param {string} theme - 主题值
     */
    setTheme(theme) {
        this.currentTheme = theme;
    }

    /**
     * 获取当前主题
     * @returns {string} 当前主题值
     */
    getTheme() {
        return this.currentTheme;
    }


    /**
     * 销毁组件
     */
    destroy() {
        // 移除样式
        const styleElement = document.getElementById('theme-selector-styles');
        if (styleElement) {
            styleElement.remove();
        }
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeSelector;
} else if (typeof window !== 'undefined') {
    window.ThemeSelector = ThemeSelector;
}
