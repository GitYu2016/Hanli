/**
 * Select 选择器组件
 * 提供下拉选择功能
 */
class Select {
    constructor(options = {}) {
        // 核心属性
        this.options = options.options || [];
        this.value = options.value || null;
        this.defaultValue = options.defaultValue || null;
        this.placeholder = options.placeholder || '请选择';
        this.className = options.className || '';
        
        // 事件回调
        this.onChange = options.onChange || (() => {});
        this.onFocus = options.onFocus || (() => {});
        this.onBlur = options.onBlur || (() => {});
        
        // 内部状态
        this.isOpen = false;
        this.highlightedIndex = -1;
        
        // 初始化
        this.init();
    }

    /**
     * 初始化组件
     */
    init() {
        this.injectStyles();
        this.setupKeyboardNavigation();
    }

    /**
     * 注入组件样式
     */
    injectStyles() {
        // 检查是否已经注入过样式
        if (document.getElementById('select-component-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'select-component-styles';
        style.textContent = `
            /* Select 组件样式 */
            .select-container {
                position: relative;
                display: inline-block;
                width: 100%;
                max-width: 300px;
            }

            .select-trigger {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 12px;
                border: 1px solid var(--color-border-normal);
                border-radius: 6px;
                background-color: var(--color-background-normal);
                color: var(--color-primary);
                cursor: pointer;
                transition: all 0.2s ease;
                min-height: 36px;
                position: relative;
            }

            .select-trigger:hover {
                border-color: var(--color-border-focused);
                background-color: var(--color-background-focused);
            }

            .select-trigger:focus {
                outline: none;
                border-color: var(--color-border-focused);
                box-shadow: 0 0 0 2px var(--color-background-focused);
            }

            .select-value {
                flex: 1;
                overflow: hidden;
            }

            .select-value-text {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .select-placeholder {
                color: var(--color-secondary);
            }

            .select-arrow {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 16px;
                height: 16px;
                color: var(--color-secondary);
                transition: transform 0.2s ease, color 0.2s ease;
                margin-left: 8px;
            }

            .select-trigger.open .select-arrow {
                transform: rotate(180deg);
                color: var(--color-primary);
            }

            .select-dropdown {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                z-index: 1000;
                background-color: var(--color-modal-background);
                border: 1px solid var(--color-border-normal);
                border-radius: 6px;
                box-shadow: 0 4px 12px var(--color-shadow);
                max-height: 300px;
                overflow: hidden;
                display: none;
                margin-top: 4px;
            }

            .select-dropdown.open {
                display: block;
                animation: selectDropdownFadeIn 0.2s ease;
            }

            @keyframes selectDropdownFadeIn {
                from {
                    opacity: 0;
                    transform: translateY(-8px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .select-options {
                max-height: 300px;
                overflow-y: auto;
            }

            .select-option {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                cursor: pointer;
                transition: background-color 0.2s ease;
                border-bottom: 1px solid var(--color-border-normal);
            }

            .select-option:last-child {
                border-bottom: none;
            }

            .select-option:hover {
                background-color: var(--color-background-focused);
            }

            .select-option.selected {
                background-color: var(--color-background-focused);
                color: var(--color-primary);
                font-weight: 500;
            }

            .select-option.highlighted {
                background-color: var(--color-background-focused);
            }

            .select-option-icon {
                width: 16px;
                height: 16px;
                color: var(--color-secondary);
                flex-shrink: 0;
            }

            .select-option-text {
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .select-empty {
                padding: 20px 12px;
                text-align: center;
                color: var(--color-secondary);
                font-size: 14px;
            }

            /* 响应式设计 */
            @media (max-width: 768px) {
                .select-container {
                    max-width: 100%;
                }
                
                .select-dropdown {
                    max-height: 250px;
                }
                
                .select-options {
                    max-height: 200px;
                }
            }

            /* 滚动条样式 */
            .select-options::-webkit-scrollbar {
                width: 6px;
            }

            .select-options::-webkit-scrollbar-track {
                background: var(--color-background-normal);
            }

            .select-options::-webkit-scrollbar-thumb {
                background: var(--color-border-normal);
                border-radius: 3px;
            }

            .select-options::-webkit-scrollbar-thumb:hover {
                background: var(--color-border-focused);
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * 设置键盘导航
     */
    setupKeyboardNavigation() {
        this.keyboardHandlers = {
            ArrowDown: (e) => {
                e.preventDefault();
                this.navigateOptions(1);
            },
            ArrowUp: (e) => {
                e.preventDefault();
                this.navigateOptions(-1);
            },
            Enter: (e) => {
                e.preventDefault();
                this.selectHighlightedOption();
            },
            Escape: (e) => {
                e.preventDefault();
                this.close();
            },
            Space: (e) => {
                e.preventDefault();
                if (!this.isOpen) {
                    this.open();
                }
            }
        };
    }

    /**
     * 渲染组件HTML
     * @returns {string} HTML字符串
     */
    render() {
        const hasValue = this.value !== null;
        const displayValue = this.getDisplayValue();
        
        return `
            <div class="select-container ${this.className}">
                <div class="select-trigger ${this.isOpen ? 'open' : ''}" 
                     tabindex="0"
                     role="combobox"
                     aria-expanded="${this.isOpen}"
                     aria-haspopup="listbox">
                    <div class="select-value">
                        ${this.renderValue(displayValue, hasValue)}
                    </div>
                    <div class="select-actions">
                        ${this.renderActions()}
                    </div>
                </div>
                <div class="select-dropdown ${this.isOpen ? 'open' : ''}" role="listbox">
                    ${this.renderDropdown()}
                </div>
            </div>
        `;
    }

    /**
     * 渲染值显示区域
     * @param {*} displayValue - 显示值
     * @param {boolean} hasValue - 是否有值
     * @returns {string} HTML字符串
     */
    renderValue(displayValue, hasValue) {
        if (!hasValue) {
            return `<span class="select-placeholder">${this.placeholder}</span>`;
        }

        return `<span class="select-value-text">${displayValue}</span>`;
    }

    /**
     * 渲染操作按钮
     * @returns {string} HTML字符串
     */
    renderActions() {
        return `<span class="select-arrow">▼</span>`;
    }

    /**
     * 渲染下拉菜单
     * @returns {string} HTML字符串
     */
    renderDropdown() {
        return this.renderOptions();
    }


    /**
     * 渲染选项列表
     * @returns {string} HTML字符串
     */
    renderOptions() {
        if (this.options.length === 0) {
            return `<div class="select-empty">暂无选项</div>`;
        }

        return `
            <div class="select-options">
                ${this.options.map((option, index) => this.renderOption(option, index)).join('')}
            </div>
        `;
    }

    /**
     * 渲染单个选项
     * @param {Object} option - 选项对象
     * @param {number} index - 选项索引
     * @returns {string} HTML字符串
     */
    renderOption(option, index) {
        const isSelected = this.isOptionSelected(option);
        const isHighlighted = index === this.highlightedIndex;
        
        const classes = [
            'select-option',
            isSelected ? 'selected' : '',
            isHighlighted ? 'highlighted' : ''
        ].filter(Boolean).join(' ');

        return `
            <div class="${classes}" 
                 data-value="${option.value}"
                 data-index="${index}"
                 role="option"
                 aria-selected="${isSelected}">
                ${this.renderOptionContent(option)}
            </div>
        `;
    }

    /**
     * 渲染选项内容
     * @param {Object} option - 选项对象
     * @returns {string} HTML字符串
     */
    renderOptionContent(option) {
        const content = [];
        
        if (option.icon) {
            content.push(`<div class="select-option-icon">${option.icon}</div>`);
        }
        
        content.push(`<div class="select-option-text">${option.label}</div>`);
        
        return content.join('');
    }

    /**
     * 绑定事件监听器
     * @param {HTMLElement} container - 容器元素
     */
    bindEvents(container) {
        // 如果已经绑定过事件，先解绑
        this.unbindEvents(container);
        
        const trigger = container.querySelector('.select-trigger');
        const dropdown = container.querySelector('.select-dropdown');
        
        if (!trigger || !dropdown) {
            console.warn('Select组件：无法找到必要的DOM元素');
            return;
        }
        
        // 存储事件处理器引用，用于解绑
        this.eventHandlers = {
            triggerClick: (e) => {
                e.stopPropagation();
                this.toggle();
            },
            triggerKeydown: (e) => {
                const handler = this.keyboardHandlers[e.key];
                if (handler) {
                    handler(e);
                }
            },
            triggerFocus: () => {
                this.onFocus();
            },
            triggerBlur: (e) => {
                // 延迟执行，允许点击选项
                setTimeout(() => {
                    if (!container.contains(document.activeElement)) {
                        this.close();
                        this.onBlur();
                    }
                }, 100);
            },
            dropdownClick: (e) => {
                const option = e.target.closest('.select-option');
                if (option) {
                    const value = option.dataset.value;
                    this.selectOption(value);
                }
            },
            documentClick: (e) => {
                if (!container.contains(e.target)) {
                    this.close();
                }
            }
        };
        
        // 绑定事件
        trigger.addEventListener('click', this.eventHandlers.triggerClick);
        trigger.addEventListener('keydown', this.eventHandlers.triggerKeydown);
        trigger.addEventListener('focus', this.eventHandlers.triggerFocus);
        trigger.addEventListener('blur', this.eventHandlers.triggerBlur);
        dropdown.addEventListener('click', this.eventHandlers.dropdownClick);
        document.addEventListener('click', this.eventHandlers.documentClick);
    }

    /**
     * 解绑事件监听器
     * @param {HTMLElement} container - 容器元素
     */
    unbindEvents(container) {
        if (!this.eventHandlers || !container) return;
        
        const trigger = container.querySelector('.select-trigger');
        const dropdown = container.querySelector('.select-dropdown');
        
        if (trigger) {
            trigger.removeEventListener('click', this.eventHandlers.triggerClick);
            trigger.removeEventListener('keydown', this.eventHandlers.triggerKeydown);
            trigger.removeEventListener('focus', this.eventHandlers.triggerFocus);
            trigger.removeEventListener('blur', this.eventHandlers.triggerBlur);
        }
        
        if (dropdown) {
            dropdown.removeEventListener('click', this.eventHandlers.dropdownClick);
        }
        
        document.removeEventListener('click', this.eventHandlers.documentClick);
    }

    /**
     * 切换下拉菜单状态
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * 打开下拉菜单
     */
    open() {
        this.isOpen = true;
        this.highlightedIndex = -1;
        this.updateUI();
    }

    /**
     * 关闭下拉菜单
     */
    close() {
        this.isOpen = false;
        this.highlightedIndex = -1;
        this.updateUI();
    }


    /**
     * 导航选项
     * @param {number} direction - 方向（1向下，-1向上）
     */
    navigateOptions(direction) {
        if (!this.isOpen) {
            this.open();
            return;
        }

        const availableOptions = this.options.filter(opt => !opt.disabled);
        if (availableOptions.length === 0) return;

        this.highlightedIndex += direction;

        if (this.highlightedIndex < 0) {
            this.highlightedIndex = availableOptions.length - 1;
        } else if (this.highlightedIndex >= availableOptions.length) {
            this.highlightedIndex = 0;
        }

        // 找到实际索引
        let actualIndex = -1;
        for (let i = 0; i < this.options.length; i++) {
            if (!this.options[i].disabled) {
                actualIndex++;
                if (actualIndex === this.highlightedIndex) {
                    this.highlightedIndex = i;
                    break;
                }
            }
        }

        this.updateUI();
        this.scrollToHighlighted();
    }

    /**
     * 选择高亮选项
     */
    selectHighlightedOption() {
        if (this.highlightedIndex >= 0 && this.highlightedIndex < this.options.length) {
            const option = this.options[this.highlightedIndex];
            if (!option.disabled) {
                this.selectOption(option.value);
            }
        }
    }

    /**
     * 选择选项
     * @param {*} value - 选项值
     */
    selectOption(value) {
        this.value = value;
        this.close();
        this.updateUI();
        this.onChange(this.value);
    }


    /**
     * 滚动到高亮选项
     */
    scrollToHighlighted() {
        const options = document.querySelector('.select-options');
        const highlighted = document.querySelector('.select-option.highlighted');
        
        if (options && highlighted) {
            const optionsRect = options.getBoundingClientRect();
            const highlightedRect = highlighted.getBoundingClientRect();
            
            if (highlightedRect.top < optionsRect.top) {
                highlighted.scrollIntoView({ block: 'start' });
            } else if (highlightedRect.bottom > optionsRect.bottom) {
                highlighted.scrollIntoView({ block: 'end' });
            }
        }
    }

    /**
     * 更新UI
     */
    updateUI() {
        const container = document.querySelector('.select-container');
        if (!container) return;

        // 更新触发器状态
        const trigger = container.querySelector('.select-trigger');
        trigger.classList.toggle('open', this.isOpen);

        // 更新下拉菜单
        const dropdown = container.querySelector('.select-dropdown');
        dropdown.classList.toggle('open', this.isOpen);

        // 重新渲染值显示
        const valueContainer = container.querySelector('.select-value');
        const hasValue = this.hasValue();
        valueContainer.innerHTML = this.renderValue(this.getDisplayValue(), hasValue);

        // 重新渲染操作按钮
        const actionsContainer = container.querySelector('.select-actions');
        actionsContainer.innerHTML = this.renderActions();

        // 重新渲染下拉菜单内容
        dropdown.innerHTML = this.renderDropdown();

        // 更新选项状态
        this.updateOptionStates();
    }

    /**
     * 更新选项状态
     */
    updateOptionStates() {
        const options = document.querySelectorAll('.select-option');
        options.forEach((option, index) => {
            const optionObj = this.options[index];
            
            option.classList.toggle('selected', this.isOptionSelected(optionObj));
            option.classList.toggle('highlighted', index === this.highlightedIndex);
        });
    }

    /**
     * 检查选项是否被选中
     * @param {Object} option - 选项对象
     * @returns {boolean} 是否选中
     */
    isOptionSelected(option) {
        if (!option) return false;
        return this.value === option.value;
    }

    /**
     * 检查是否有值
     * @returns {boolean} 是否有值
     */
    hasValue() {
        return this.value !== null;
    }

    /**
     * 获取显示值
     * @returns {string} 显示值
     */
    getDisplayValue() {
        const option = this.options.find(opt => opt.value === this.value);
        return option ? option.label : this.value;
    }

    /**
     * 设置值
     * @param {*} value - 新值
     */
    setValue(value) {
        this.value = value;
        this.updateUI();
    }

    /**
     * 获取值
     * @returns {*} 当前值
     */
    getValue() {
        return this.value;
    }

    /**
     * 设置选项
     * @param {Array} options - 新选项数组
     */
    setOptions(options) {
        this.options = options;
        this.updateUI();
    }


    /**
     * 销毁组件
     */
    destroy() {
        // 解绑事件
        const container = document.querySelector('.select-container');
        if (container) {
            this.unbindEvents(container);
        }
        
        // 移除样式
        const styleElement = document.getElementById('select-component-styles');
        if (styleElement) {
            styleElement.remove();
        }
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Select;
} else if (typeof window !== 'undefined') {
    window.Select = Select;
}
