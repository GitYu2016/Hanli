/**
 * MSecondaryButton 组件
 * 中等尺寸的次要按钮，支持深色和浅色主题适配
 * 深色主题：背景色为白色半透明，文字为黑色半透明
 * 浅色主题：背景色为黑色半透明，文字为白色半透明
 */
class MSecondaryButton {
    constructor() {
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

        // 定义MSecondaryButton样式
        const buttonStyles = {
            // 基础按钮样式
            '.m-secondary-btn': {
                'display': 'inline-flex',
                'align-items': 'center',
                'justify-content': 'center',
                'gap': '8px',
                'padding': '8px 16px',
                'font-size': '14px',
                'min-height': '36px',
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
                'white-space': 'nowrap'
            },

            // 深色主题样式
            '.theme-dark .m-secondary-btn': {
                'background-color': 'rgba(255, 255, 255, 0.15)',
                'color': 'rgba(0, 0, 0, 0.8)'
            },
            '.theme-dark .m-secondary-btn:hover': {
                'background-color': 'rgba(255, 255, 255, 0.25)',
                'color': 'rgba(0, 0, 0, 0.9)'
            },
            '.theme-dark .m-secondary-btn:active': {
                'background-color': 'rgba(255, 255, 255, 0.35)',
                'transform': 'translateY(1px)'
            },

            // 浅色主题样式
            '.theme-light .m-secondary-btn': {
                'background-color': 'rgba(0, 0, 0, 0.15)',
                'color': 'rgba(255, 255, 255, 0.8)'
            },
            '.theme-light .m-secondary-btn:hover': {
                'background-color': 'rgba(0, 0, 0, 0.25)',
                'color': 'rgba(255, 255, 255, 0.9)'
            },
            '.theme-light .m-secondary-btn:active': {
                'background-color': 'rgba(0, 0, 0, 0.35)',
                'transform': 'translateY(1px)'
            },

            // 禁用状态样式
            '.m-secondary-btn:disabled': {
                'opacity': '0.5',
                'cursor': 'not-allowed',
                'pointer-events': 'none'
            },

            // 加载状态样式
            '.m-secondary-btn.loading': {
                'cursor': 'wait',
                'pointer-events': 'none'
            },

            // 按钮内部元素样式
            '.m-secondary-btn .btn-icon': {
                'font-size': '1em',
                'opacity': '0.8'
            },

            '.m-secondary-btn .btn-loading-icon': {
                'font-size': '1em',
                'opacity': '0.8',
                'animation': 'spin 1s linear infinite'
            },

            '.m-secondary-btn .btn-text': {
                'white-space': 'nowrap',
                'overflow': 'hidden',
                'text-overflow': 'ellipsis'
            },

            // 加载动画
            '@keyframes spin': {
                '0%': { 'transform': 'rotate(0deg)' },
                '100%': { 'transform': 'rotate(360deg)' }
            }
        };

        // 注册样式到StyleManager
        window.styleManager.defineStyles('MSecondaryButton', buttonStyles);
    }

    /**
     * 创建MSecondaryButton元素
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
        const button = window.styleManager.createStyledElement('button', 'MSecondaryButton', '.m-secondary-btn', {
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
            content += `<div class="svg-icon btn-icon" data-icon="${icon.replace('ph-', '')}" data-filled="false"></div>`;
        }
        
        // 添加加载状态图标
        if (loading) {
            content += `<div class="btn-loading-icon" data-icon="spinner" data-filled="false"></div>`;
        }
        
        // 添加文本
        content += `<span class="btn-text">${text}</span>`;
        
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
        const baseClasses = ['m-secondary-btn'];
        
        if (className) {
            baseClasses.push(className);
        }
        if (disabled) {
            baseClasses.push('disabled');
        }
        if (loading) {
            baseClasses.push('loading');
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
            const textElement = button.querySelector('.btn-text');
            if (textElement) {
                textElement.textContent = text;
            }
        }
        
        if (disabled !== undefined) {
            button.disabled = disabled;
            if (disabled) {
                button.classList.add('disabled');
            } else {
                button.classList.remove('disabled');
            }
        }
        
        if (loading !== undefined) {
            if (loading) {
                button.classList.add('loading');
                // 添加加载图标
                if (!button.querySelector('.btn-loading-icon')) {
                    const loadingIcon = document.createElement('div');
                    loadingIcon.className = 'btn-loading-icon svg-icon';
                    loadingIcon.setAttribute('data-icon', 'spinner');
                    loadingIcon.setAttribute('data-filled', 'false');
                    button.insertBefore(loadingIcon, button.querySelector('.btn-text'));
                }
            } else {
                button.classList.remove('loading');
                // 移除加载图标
                const loadingIcon = button.querySelector('.btn-loading-icon');
                if (loadingIcon) {
                    loadingIcon.remove();
                }
            }
        }
        
        if (icon !== undefined) {
            const iconElement = button.querySelector('.btn-icon');
            if (icon) {
                if (iconElement) {
                    iconElement.setAttribute('data-icon', icon.replace('ph-', ''));
                } else {
                    const newIcon = document.createElement('div');
                    newIcon.className = 'btn-icon svg-icon';
                    newIcon.setAttribute('data-icon', icon.replace('ph-', ''));
                    newIcon.setAttribute('data-filled', 'false');
                    button.insertBefore(newIcon, button.querySelector('.btn-text'));
                }
            } else if (iconElement) {
                iconElement.remove();
            }
        }
    }

    /**
     * 销毁按钮组件
     */
    destroy() {
        // 清理工作
    }
}

// 创建全局实例
const mSecondaryButtonInstance = new MSecondaryButton();

// 确保实例暴露到全局作用域
window.mSecondaryButtonInstance = mSecondaryButtonInstance;

// 组件已初始化
