/**
 * LPrimaryButton 组件
 * 主要按钮组件，支持主题适配
 * 深色主题：白色背景，黑色半透明文字
 * 浅色主题：黑色背景，白色半透明文字
 */
class LPrimaryButton {
    constructor() {
        this.container = null;
        this.initStyles();
    }

    /**
     * 初始化按钮样式
     */
    initStyles() {
        // 确保StyleManager已加载
        if (typeof window.styleManager === 'undefined') {
            console.error('StyleManager未加载，请确保已引入StyleManager.js');
            return;
        }

        // 定义 LPrimaryButton 样式
        const lPrimaryButtonStyles = {
            // 基础按钮样式
            '.l-primary-btn': {
                'display': 'inline-flex',
                'align-items': 'center',
                'justify-content': 'center',
                'gap': '8px',
                'border': 'none',
                'border-radius': '6px',
                'font-family': 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                'font-weight': '500',
                'cursor': 'pointer',
                'transition': 'all 0.2s ease',
                'outline': 'none',
                'position': 'relative',
                'overflow': 'hidden',
                'user-select': 'none',
                'min-height': '48px',
                'padding': '12px 24px',
                'font-size': '16px',
                'box-shadow': '0 1px 3px rgba(0, 0, 0, 0.1)'
            },

            // 深色主题样式
            '.theme-dark .l-primary-btn': {
                'background-color': 'rgba(255, 255, 255, 1.0)',
                'color': 'rgba(0, 0, 0, 0.8)'
            },
            '.theme-dark .l-primary-btn:hover': {
                'background-color': 'rgba(255, 255, 255, 0.9)',
                'box-shadow': '0 2px 6px rgba(0, 0, 0, 0.15)'
            },
            '.theme-dark .l-primary-btn:active': {
                'background-color': 'rgba(255, 255, 255, 0.8)',
                'transform': 'translateY(1px)'
            },

            // 浅色主题样式
            '.theme-light .l-primary-btn': {
                'background-color': 'rgba(0, 0, 0, 1.0)',
                'color': 'rgba(255, 255, 255, 0.8)'
            },
            '.theme-light .l-primary-btn:hover': {
                'background-color': 'rgba(0, 0, 0, 0.9)',
                'box-shadow': '0 2px 6px rgba(0, 0, 0, 0.2)'
            },
            '.theme-light .l-primary-btn:active': {
                'background-color': 'rgba(0, 0, 0, 0.8)',
                'transform': 'translateY(1px)'
            },

            // 禁用状态
            '.l-primary-btn-disabled': {
                'opacity': '0.5',
                'cursor': 'not-allowed',
                'pointer-events': 'none'
            },

            // 加载状态
            '.l-primary-btn-loading': {
                'cursor': 'wait',
                'pointer-events': 'none'
            },

            // 按钮内部元素样式
            '.l-primary-btn-icon': {
                'font-size': '1em',
                'opacity': '0.8'
            },

            '.l-primary-btn-loading-icon': {
                'font-size': '1em',
                'opacity': '0.8',
                'animation': 'l-primary-btn-spin 1s linear infinite'
            },

            '.l-primary-btn-text': {
                'white-space': 'nowrap',
                'overflow': 'hidden',
                'text-overflow': 'ellipsis'
            },

            // 加载动画
            '@keyframes l-primary-btn-spin': {
                '0%': { 'transform': 'rotate(0deg)' },
                '100%': { 'transform': 'rotate(360deg)' }
            },

            // 按钮组样式
            '.l-primary-btn-group': {
                'display': 'inline-flex',
                'gap': '8px'
            },

            '.l-primary-btn-group .l-primary-btn': {
                'border-radius': '0'
            },

            '.l-primary-btn-group .l-primary-btn:first-child': {
                'border-top-left-radius': '6px',
                'border-bottom-left-radius': '6px'
            },

            '.l-primary-btn-group .l-primary-btn:last-child': {
                'border-top-right-radius': '6px',
                'border-bottom-right-radius': '6px'
            }
        };

        // 注册样式到StyleManager
        window.styleManager.defineStyles('LPrimaryButton', lPrimaryButtonStyles);
    }

    /**
     * 创建 LPrimaryButton 元素
     * @param {Object} options - 按钮配置选项
     * @param {string} options.text - 按钮文本
     * @param {string} options.icon - 图标类名（可选）
     * @param {Function} options.onClick - 点击事件处理函数
     * @param {boolean} options.disabled - 是否禁用
     * @param {boolean} options.loading - 是否显示加载状态
     * @param {string} options.className - 自定义CSS类名
     * @param {string} options.id - 按钮ID
     * @returns {HTMLElement} 按钮元素
     */
    create(options = {}) {
        const {
            text = '按钮',
            icon = null,
            onClick = null,
            disabled = false,
            loading = false,
            className = '',
            id = null
        } = options;

        // 使用StyleManager创建按钮元素
        const button = window.styleManager.createStyledElement('button', 'LPrimaryButton', '.l-primary-btn', {
            id: id || undefined,
            className: this.buildClassName(disabled, loading, className)
        });
        
        // 设置禁用状态
        if (disabled) {
            button.disabled = true;
        }
        
        // 构建按钮内容
        let content = '';
        
        // 添加图标
        if (icon) {
            content += `<div class="svg-icon l-primary-btn-icon" data-icon="${icon.replace('ph-', '')}" data-filled="false"></div>`;
        }
        
        // 添加加载状态
        if (loading) {
            content += `<div class="l-primary-btn-loading-icon">⏳</div>`;
        }
        
        // 添加文本
        content += `<span class="l-primary-btn-text">${text}</span>`;
        
        button.innerHTML = content;
        
        // 添加点击事件
        if (onClick && typeof onClick === 'function') {
            button.addEventListener('click', onClick);
        }
        
        return button;
    }

    /**
     * 构建按钮类名
     * @param {boolean} disabled - 是否禁用
     * @param {boolean} loading - 是否加载中
     * @param {string} className - 自定义类名
     * @returns {string} 完整的类名字符串
     */
    buildClassName(disabled, loading, className) {
        const baseClasses = ['l-primary-btn'];
        
        if (className) {
            baseClasses.push(className);
        }
        if (disabled) {
            baseClasses.push('l-primary-btn-disabled');
        }
        if (loading) {
            baseClasses.push('l-primary-btn-loading');
        }
        
        return baseClasses.join(' ');
    }

    /**
     * 更新按钮状态
     * @param {HTMLElement} button - 按钮元素
     * @param {Object} options - 更新选项
     */
    update(button, options = {}) {
        const { text, disabled, loading, icon } = options;
        
        if (text !== undefined) {
            const textElement = button.querySelector('.l-primary-btn-text');
            if (textElement) {
                textElement.textContent = text;
            }
        }
        
        if (disabled !== undefined) {
            button.disabled = disabled;
            if (disabled) {
                button.classList.add('l-primary-btn-disabled');
            } else {
                button.classList.remove('l-primary-btn-disabled');
            }
        }
        
        if (loading !== undefined) {
            if (loading) {
                button.classList.add('l-primary-btn-loading');
                // 添加加载图标
                if (!button.querySelector('.l-primary-btn-loading-icon')) {
                    const loadingIcon = document.createElement('div');
                    loadingIcon.className = 'l-primary-btn-loading-icon';
                    loadingIcon.textContent = '⏳';
                    button.insertBefore(loadingIcon, button.querySelector('.l-primary-btn-text'));
                }
            } else {
                button.classList.remove('l-primary-btn-loading');
                // 移除加载图标
                const loadingIcon = button.querySelector('.l-primary-btn-loading-icon');
                if (loadingIcon) {
                    loadingIcon.remove();
                }
            }
        }
        
        if (icon !== undefined) {
            const iconElement = button.querySelector('.l-primary-btn-icon');
            if (icon) {
                if (iconElement) {
                    iconElement.className = `svg-icon l-primary-btn-icon`;
                    iconElement.setAttribute('data-icon', icon.replace('ph-', ''));
                } else {
                    const newIcon = document.createElement('div');
                    newIcon.className = `svg-icon l-primary-btn-icon`;
                    newIcon.setAttribute('data-icon', icon.replace('ph-', ''));
                    newIcon.setAttribute('data-filled', 'false');
                    button.insertBefore(newIcon, button.querySelector('.l-primary-btn-text'));
                }
            } else if (iconElement) {
                iconElement.remove();
            }
        }
    }

    /**
     * 创建按钮组
     * @param {Array} buttons - 按钮数组
     * @returns {HTMLElement} 按钮组元素
     */
    createGroup(buttons = []) {
        const group = document.createElement('div');
        group.className = 'l-primary-btn-group';
        
        buttons.forEach(buttonOptions => {
            const button = this.create(buttonOptions);
            group.appendChild(button);
        });
        
        return group;
    }

    /**
     * 销毁组件
     */
    destroy() {
        this.container = null;
    }
}

// 创建全局实例
const lPrimaryButtonInstance = new LPrimaryButton();

// 确保实例暴露到全局作用域
window.lPrimaryButtonInstance = lPrimaryButtonInstance;
