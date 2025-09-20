/**
 * IconButton 组件
 * 通用的单图标按钮组件
 */
class IconButton {
    constructor() {
        this.stylesInitialized = false;
    }

    /**
     * 初始化样式
     */
    initStyles() {
        if (this.stylesInitialized) return;

        const styleId = 'icon-button-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .icon-button {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 36px;
                height: 36px;
                border-radius: var(--radius-large);
                background-color: transparent;
                color: var(--color-secondary);
                cursor: pointer;
                transition: all 0.2s ease;
                border: none;
                padding: 0;
            }

            .icon-button:hover {
                background-color: var(--color-background-normal);
                color: var(--color-primary);
                transform: scale(1.05);
            }

            .icon-button:active {
                background-color: var(--color-background-normal);
                color: var(--color-primary);
                transform: scale(0.95);
            }

            .icon-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                transform: none;
            }

            .icon-button:disabled:hover {
                background-color: transparent;
                color: var(--color-secondary);
                transform: none;
            }

            .icon-button .svg-icon {
                width: 18px;
                height: 18px;
            }

            /* 尺寸变体 */
            .icon-button.small {
                width: 32px;
                height: 32px;
            }

            .icon-button.small .svg-icon {
                width: 14px;
                height: 14px;
            }

            .icon-button.large {
                width: 48px;
                height: 48px;
            }

            .icon-button.large .svg-icon {
                width: 22px;
                height: 22px;
            }

            /* 样式变体 */
            .icon-button.ghost {
                background-color: transparent;
            }

            .icon-button.ghost:hover {
                background-color: var(--color-background-normal);
            }

            .icon-button.primary {
                background-color: var(--color-primary);
                color: white;
            }

            .icon-button.primary:hover {
                background-color: var(--color-primary-hover);
                color: white;
            }

            .icon-button.secondary {
                background-color: var(--color-secondary);
                color: white;
            }

            .icon-button.secondary:hover {
                background-color: var(--color-secondary-hover);
                color: white;
            }
        `;

        document.head.appendChild(style);
        this.stylesInitialized = true;
    }

    /**
     * 创建图标按钮
     * @param {string} iconName - 图标名称
     * @param {Object} options - 选项
     * @returns {HTMLElement} 按钮元素
     */
    create(iconName, options = {}) {
        this.initStyles();

        const {
            size = 'normal',
            variant = 'normal',
            disabled = false,
            className = '',
            onClick = null,
            title = ''
        } = options;

        const button = document.createElement('button');
        button.className = `icon-button ${size !== 'normal' ? size : ''} ${variant !== 'normal' ? variant : ''} ${className}`.trim();
        button.disabled = disabled;
        button.title = title;

        // 添加图标
        const iconHTML = Icon.render(iconName, { className: 'svg-icon', style: 'bold' });
        button.innerHTML = iconHTML;

        // 添加点击事件
        if (onClick && typeof onClick === 'function') {
            button.addEventListener('click', onClick);
        }

        return button;
    }

    /**
     * 渲染图标按钮HTML
     * @param {string} iconName - 图标名称
     * @param {Object} options - 选项
     * @returns {string} 按钮HTML字符串
     */
    render(iconName, options = {}) {
        this.initStyles();

        const {
            size = 'normal',
            variant = 'normal',
            disabled = false,
            className = '',
            title = ''
        } = options;

        const classes = [
            'icon-button',
            size !== 'normal' ? size : '',
            variant !== 'normal' ? variant : '',
            className
        ].filter(Boolean).join(' ');

        const iconHTML = Icon.render(iconName, { className: 'svg-icon', style: 'bold' });

        return `
            <button class="${classes}" ${disabled ? 'disabled' : ''} title="${title}">
                ${iconHTML}
            </button>
        `;
    }
}

// 创建全局实例
window.iconButtonInstance = new IconButton();
