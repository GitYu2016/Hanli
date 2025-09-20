/**
 * 背景色选择器组件
 * 提供多种背景色选择功能
 */
class BackgroundColorSelector {
    constructor(options = {}) {
        this.currentBackgroundColor = options.currentBackgroundColor || 'default';
        this.onBackgroundColorChange = options.onBackgroundColorChange || (() => {});
        this.backgroundColors = [
            {
                value: 'default',
                label: '默认',
                previewClass: 'bg-default'
            },
            {
                value: 'blue',
                label: '蓝色',
                previewClass: 'bg-blue'
            },
            {
                value: 'green',
                label: '绿色',
                previewClass: 'bg-green'
            },
            {
                value: 'purple',
                label: '紫色',
                previewClass: 'bg-purple'
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
        if (document.getElementById('background-color-selector-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'background-color-selector-styles';
        style.textContent = `
            /* 背景色选择器样式 */
            .background-color-selector {
                display: flex;
                gap: 16px;
                flex-wrap: wrap;
                align-items: center;
            }

            .background-color-option {
                position: relative;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .background-color-option:hover {
                transform: scale(1.05);
            }

            .background-color-option.active {
                transform: scale(1.05);
            }

            .background-color-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                padding: 8px;
            }

            .background-color-label {
                font-size: 12px;
                color: var(--color-secondary);
                text-align: center;
                transition: color 0.2s ease;
            }

            .background-color-option.active .background-color-label {
                color: var(--color-primary);
                font-weight: 500;
            }

            .background-color-option input[type="radio"] {
                display: none;
            }

            .background-color-preview {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                border: 2px solid var(--color-border-normal);
                position: relative;
                background: var(--color-body-bg-default);
                transition: all 0.2s ease;
            }

            .background-color-option:hover .background-color-preview {
                border-color: var(--color-border-focused);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            }

            .background-color-option.active .background-color-preview {
                border-color: var(--color-border-focused);
                border-width: 3px;
                box-shadow: 0 0 0 2px var(--color-background-focused), 0 2px 8px rgba(0, 0, 0, 0.15);
            }

            /* 背景色预览样式 */
            .bg-default .background-color-preview {
                background: var(--color-body-bg-default);
            }

            .bg-blue .background-color-preview {
                background: var(--color-body-bg-blue);
            }

            .bg-green .background-color-preview {
                background: var(--color-body-bg-green);
            }

            .bg-purple .background-color-preview {
                background: var(--color-body-bg-purple);
            }

            /* 响应式设计 */
            @media (max-width: 768px) {
                .background-color-selector {
                    gap: 12px;
                }
                
                .background-color-preview {
                    width: 28px;
                    height: 28px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * 渲染背景色选择器HTML
     * @returns {string} HTML字符串
     */
    render() {
        return `
            <div class="background-color-selector">
                ${this.backgroundColors.map(bgColor => `
                    <label class="background-color-option ${bgColor.previewClass} ${this.currentBackgroundColor === bgColor.value ? 'active' : ''}" data-bg-color="${bgColor.value}">
                        <input type="radio" name="background-color" value="${bgColor.value}" ${this.currentBackgroundColor === bgColor.value ? 'checked' : ''}>
                        <div class="background-color-item">
                            <span class="background-color-preview"></span>
                            <span class="background-color-label">${bgColor.label}</span>
                        </div>
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
        const bgColorOptions = container.querySelectorAll('.background-color-option');
        
        bgColorOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const bgColorValue = option.dataset.bgColor;
                this.selectBackgroundColor(bgColorValue);
            });
        });
    }

    /**
     * 选择背景色
     * @param {string} bgColorValue - 背景色值
     */
    selectBackgroundColor(bgColorValue) {
        // 更新当前背景色
        this.currentBackgroundColor = bgColorValue;
        
        // 更新UI状态
        const container = document.querySelector('.background-color-selector');
        if (container) {
            const bgColorOptions = container.querySelectorAll('.background-color-option');
            bgColorOptions.forEach(option => {
                option.classList.remove('active');
                const radio = option.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = false;
                }
            });
            
            const selectedOption = container.querySelector(`[data-bg-color="${bgColorValue}"]`);
            if (selectedOption) {
                selectedOption.classList.add('active');
                const radio = selectedOption.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                }
            }
        }
        
        // 预览背景色效果
        this.previewBackgroundColor(bgColorValue);
        
        // 触发回调
        this.onBackgroundColorChange(bgColorValue);
    }

    /**
     * 预览背景色效果
     * @param {string} bgColor - 背景色名称
     */
    previewBackgroundColor(bgColor) {
        const root = document.documentElement;
        const body = document.body;
        
        // 移除现有背景色类
        const bgClasses = ['bg-body-default', 'bg-body-blue', 'bg-body-green', 'bg-body-purple'];
        bgClasses.forEach(cls => {
            root.classList.remove(cls);
            body.classList.remove(cls);
        });
        
        // 添加新背景色类
        root.classList.add(`bg-body-${bgColor}`);
        body.classList.add(`bg-body-${bgColor}`);
    }

    /**
     * 设置当前背景色
     * @param {string} bgColor - 背景色值
     */
    setBackgroundColor(bgColor) {
        this.currentBackgroundColor = bgColor;
        
        // 更新UI状态
        const container = document.querySelector('.background-color-selector');
        if (container) {
            const bgColorOptions = container.querySelectorAll('.background-color-option');
            bgColorOptions.forEach(option => {
                option.classList.remove('active');
                const radio = option.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = false;
                }
            });
            
            const selectedOption = container.querySelector(`[data-bg-color="${bgColor}"]`);
            if (selectedOption) {
                selectedOption.classList.add('active');
                const radio = selectedOption.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                }
            }
        }
        
        // 应用背景色到页面
        this.previewBackgroundColor(bgColor);
    }

    /**
     * 获取当前背景色
     * @returns {string} 当前背景色值
     */
    getBackgroundColor() {
        return this.currentBackgroundColor;
    }

    /**
     * 销毁组件
     */
    destroy() {
        // 移除样式
        const styleElement = document.getElementById('background-color-selector-styles');
        if (styleElement) {
            styleElement.remove();
        }
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BackgroundColorSelector;
} else if (typeof window !== 'undefined') {
    window.BackgroundColorSelector = BackgroundColorSelector;
}
