/**
 * Switch 组件
 * 提供美观的开关切换功能，支持多种状态和配置选项
 */
class Switch {
    constructor(options = {}) {
        this.id = options.id || this.generateId();
        this.checked = options.checked || false;
        this.disabled = options.disabled || false;
        this.loading = options.loading || false;
        this.size = options.size || 'medium'; // small, medium, large
        this.variant = options.variant || 'default'; // default, success, warning, error
        this.onChange = options.onChange || (() => {});
        this.label = options.label || '';
        this.description = options.description || '';
        this.className = options.className || '';
        
        // 生成唯一ID
        this.inputId = `${this.id}-input`;
        this.sliderId = `${this.id}-slider`;
        
        this.init();
    }

    /**
     * 生成唯一ID
     */
    generateId() {
        return 'switch-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 初始化组件
     */
    init() {
        this.injectStyles();
    }

    /**
     * 注入样式
     */
    injectStyles() {
        if (document.getElementById('switch-styles')) return;

        const style = document.createElement('style');
        style.id = 'switch-styles';
        style.textContent = `
            /* Switch 组件样式 */
            .switch-container {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                font-family: inherit;
            }

            .switch-wrapper {
                position: relative;
                display: inline-block;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .switch-wrapper.disabled {
                cursor: not-allowed;
                opacity: 0.6;
            }

            .switch-wrapper.loading {
                cursor: wait;
            }

            .switch-input {
                opacity: 0;
                width: 0;
                height: 0;
                position: absolute;
                pointer-events: none;
            }

            .switch-slider {
                position: relative;
                display: block;
                background-color: var(--color-border-normal);
                transition: all 0.2s ease;
                border-radius: 6px;
                box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
            }

            .switch-slider::before {
                content: '';
                position: absolute;
                background-color: white;
                transition: all 0.2s ease;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }

            /* 尺寸变体 */
            .switch-slider.size-small {
                width: 32px;
                height: 18px;
            }

            .switch-slider.size-small::before {
                width: 14px;
                height: 14px;
                left: 2px;
                top: 2px;
            }

            .switch-slider.size-medium {
                width: 44px;
                height: 24px;
            }

            .switch-slider.size-medium::before {
                width: 18px;
                height: 18px;
                left: 3px;
                top: 3px;
            }

            .switch-slider.size-large {
                width: 56px;
                height: 32px;
            }

            .switch-slider.size-large::before {
                width: 24px;
                height: 24px;
                left: 4px;
                top: 4px;
            }

            /* 选中状态 */
            .switch-input:checked + .switch-slider {
                background-color: var(--color-primary);
            }

            .switch-input:checked + .switch-slider.size-small::before {
                transform: translateX(14px);
            }

            .switch-input:checked + .switch-slider.size-medium::before {
                transform: translateX(20px);
            }

            .switch-input:checked + .switch-slider.size-large::before {
                transform: translateX(24px);
            }

            /* 变体颜色 */
            .switch-slider.variant-success:checked {
                background-color: var(--color-success);
            }

            .switch-slider.variant-warning:checked {
                background-color: var(--color-warning);
            }

            .switch-slider.variant-error:checked {
                background-color: var(--color-error);
            }

            .switch-slider.variant-info:checked {
                background-color: var(--color-info);
            }

            /* 悬浮状态 */
            .switch-wrapper:not(.disabled):not(.loading):hover .switch-slider {
                background-color: var(--color-border-focused);
                transform: scale(1.02);
            }

            .switch-input:checked + .switch-slider:hover {
                background-color: var(--color-focused);
            }

            /* 聚焦状态 */
            .switch-input:focus + .switch-slider {
                box-shadow: 0 0 0 2px var(--color-primary);
            }

            /* 禁用状态 */
            .switch-wrapper.disabled .switch-slider {
                background-color: var(--color-disabled);
                cursor: not-allowed;
            }

            .switch-wrapper.disabled .switch-input:checked + .switch-slider {
                background-color: var(--color-disabled);
            }

            /* 加载状态 */
            .switch-wrapper.loading .switch-slider::after {
                content: '';
                position: absolute;
                width: 8px;
                height: 8px;
                border: 2px solid transparent;
                border-top: 2px solid currentColor;
                border-radius: 50%;
                animation: switch-loading 1s linear infinite;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: var(--color-text-primary);
            }

            @keyframes switch-loading {
                0% { transform: translate(-50%, -50%) rotate(0deg); }
                100% { transform: translate(-50%, -50%) rotate(360deg); }
            }

            /* 标签样式 */
            .switch-label {
                font-weight: 500;
                color: var(--color-text-primary);
                cursor: pointer;
                user-select: none;
                transition: color 0.2s ease;
            }

            .switch-wrapper.disabled + .switch-label {
                color: var(--color-disabled);
                cursor: not-allowed;
            }

            /* 描述文本 */
            .switch-description {
                font-size: 13px;
                color: var(--color-text-secondary);
                margin-top: 4px;
                line-height: 1.4;
            }

            /* 垂直布局 */
            .switch-container.vertical {
                flex-direction: column;
                align-items: flex-start;
                gap: 4px;
            }

            .switch-container.vertical .switch-label {
                margin-bottom: 2px;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 渲染组件HTML
     */
    render() {
        const containerClass = `switch-container ${this.className}`.trim();
        const wrapperClass = `switch-wrapper ${this.disabled ? 'disabled' : ''} ${this.loading ? 'loading' : ''}`.trim();
        const sliderClass = `switch-slider size-${this.size} variant-${this.variant}`.trim();

        return `
            <div class="${containerClass}" data-switch-id="${this.id}">
                <label class="${wrapperClass}" for="${this.inputId}">
                    <input 
                        type="checkbox" 
                        id="${this.inputId}"
                        class="switch-input"
                        ${this.checked ? 'checked' : ''}
                        ${this.disabled ? 'disabled' : ''}
                        data-switch-input="${this.id}"
                    >
                    <span class="${sliderClass}" id="${this.sliderId}"></span>
                </label>
                ${this.label ? `<span class="switch-label">${this.label}</span>` : ''}
                ${this.description ? `<div class="switch-description">${this.description}</div>` : ''}
            </div>
        `;
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        const input = document.getElementById(this.inputId);
        if (!input) return;

        input.addEventListener('change', (e) => {
            if (this.disabled || this.loading) {
                e.preventDefault();
                return;
            }
            
            this.checked = e.target.checked;
            this.onChange(this.checked, this);
        });

        // 键盘支持
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!this.disabled && !this.loading) {
                    this.toggle();
                }
            }
        });
    }

    /**
     * 设置选中状态
     * @param {boolean} checked - 是否选中
     */
    setChecked(checked) {
        this.checked = checked;
        const input = document.getElementById(this.inputId);
        if (input) {
            input.checked = checked;
        }
    }

    /**
     * 切换状态
     */
    toggle() {
        if (this.disabled || this.loading) return;
        this.setChecked(!this.checked);
        this.onChange(this.checked, this);
    }

    /**
     * 设置禁用状态
     * @param {boolean} disabled - 是否禁用
     */
    setDisabled(disabled) {
        this.disabled = disabled;
        const input = document.getElementById(this.inputId);
        const wrapper = document.querySelector(`[data-switch-id="${this.id}"] .switch-wrapper`);
        
        if (input) {
            input.disabled = disabled;
        }
        
        if (wrapper) {
            wrapper.classList.toggle('disabled', disabled);
        }
    }

    /**
     * 设置加载状态
     * @param {boolean} loading - 是否加载中
     */
    setLoading(loading) {
        this.loading = loading;
        const wrapper = document.querySelector(`[data-switch-id="${this.id}"] .switch-wrapper`);
        
        if (wrapper) {
            wrapper.classList.toggle('loading', loading);
        }
        
        // 加载时禁用输入
        if (loading) {
            this.setDisabled(true);
        }
    }

    /**
     * 获取当前状态
     */
    getChecked() {
        return this.checked;
    }

    /**
     * 销毁组件
     */
    destroy() {
        const container = document.querySelector(`[data-switch-id="${this.id}"]`);
        if (container) {
            container.remove();
        }
    }

    /**
     * 更新组件配置
     * @param {Object} options - 新的配置选项
     */
    update(options) {
        if (options.checked !== undefined) {
            this.setChecked(options.checked);
        }
        if (options.disabled !== undefined) {
            this.setDisabled(options.disabled);
        }
        if (options.loading !== undefined) {
            this.setLoading(options.loading);
        }
        if (options.onChange) {
            this.onChange = options.onChange;
        }
    }
}

// 导出组件类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Switch;
} else if (typeof window !== 'undefined') {
    window.Switch = Switch;
}
