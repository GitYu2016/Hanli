/**
 * Button 组件
 * 提供L、M、S三种尺寸的按钮，支持主题适配
 */
class Button {
    constructor() {
        this.container = null;
    }

    /**
     * 创建按钮元素
     * @param {Object} options - 按钮配置选项
     * @param {string} options.text - 按钮文本
     * @param {string} options.size - 按钮尺寸 (L, M, S)
     * @param {string} options.type - 按钮类型 (primary, secondary, success, warning, error)
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
            size = 'M',
            type = 'primary',
            icon = null,
            onClick = null,
            disabled = false,
            loading = false,
            className = '',
            id = null
        } = options;

        // 创建按钮元素
        const button = document.createElement('button');
        
        // 设置基础类名
        const baseClasses = ['btn', `btn-${size.toLowerCase()}`, `btn-${type}`];
        if (className) {
            baseClasses.push(className);
        }
        if (disabled) {
            baseClasses.push('btn-disabled');
        }
        if (loading) {
            baseClasses.push('btn-loading');
        }
        
        button.className = baseClasses.join(' ');
        
        // 设置ID
        if (id) {
            button.id = id;
        }
        
        // 设置禁用状态
        if (disabled) {
            button.disabled = true;
        }
        
        // 构建按钮内容
        let content = '';
        
        // 添加图标
        if (icon) {
            content += `<i class="ph ${icon} btn-icon"></i>`;
        }
        
        // 添加加载状态
        if (loading) {
            content += `<i class="ph ph-spinner btn-loading-icon"></i>`;
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
     * 创建主要按钮
     * @param {Object} options - 按钮配置选项
     * @returns {HTMLElement} 按钮元素
     */
    primary(options = {}) {
        return this.create({ ...options, type: 'primary' });
    }

    /**
     * 创建次要按钮
     * @param {Object} options - 按钮配置选项
     * @returns {HTMLElement} 按钮元素
     */
    secondary(options = {}) {
        return this.create({ ...options, type: 'secondary' });
    }

    /**
     * 创建成功按钮
     * @param {Object} options - 按钮配置选项
     * @returns {HTMLElement} 按钮元素
     */
    success(options = {}) {
        return this.create({ ...options, type: 'success' });
    }

    /**
     * 创建警告按钮
     * @param {Object} options - 按钮配置选项
     * @returns {HTMLElement} 按钮元素
     */
    warning(options = {}) {
        return this.create({ ...options, type: 'warning' });
    }

    /**
     * 创建错误按钮
     * @param {Object} options - 按钮配置选项
     * @returns {HTMLElement} 按钮元素
     */
    error(options = {}) {
        return this.create({ ...options, type: 'error' });
    }

    /**
     * 创建大尺寸按钮
     * @param {Object} options - 按钮配置选项
     * @returns {HTMLElement} 按钮元素
     */
    large(options = {}) {
        return this.create({ ...options, size: 'L' });
    }

    /**
     * 创建中尺寸按钮
     * @param {Object} options - 按钮配置选项
     * @returns {HTMLElement} 按钮元素
     */
    medium(options = {}) {
        return this.create({ ...options, size: 'M' });
    }

    /**
     * 创建小尺寸按钮
     * @param {Object} options - 按钮配置选项
     * @returns {HTMLElement} 按钮元素
     */
    small(options = {}) {
        return this.create({ ...options, size: 'S' });
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
                button.classList.add('btn-disabled');
            } else {
                button.classList.remove('btn-disabled');
            }
        }
        
        if (loading !== undefined) {
            if (loading) {
                button.classList.add('btn-loading');
                // 添加加载图标
                if (!button.querySelector('.btn-loading-icon')) {
                    const loadingIcon = document.createElement('i');
                    loadingIcon.className = 'ph ph-spinner btn-loading-icon';
                    button.insertBefore(loadingIcon, button.querySelector('.btn-text'));
                }
            } else {
                button.classList.remove('btn-loading');
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
                    iconElement.className = `ph ${icon} btn-icon`;
                } else {
                    const newIcon = document.createElement('i');
                    newIcon.className = `ph ${icon} btn-icon`;
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
        this.container = null;
    }
}

// 创建全局实例
const buttonInstance = new Button();

// 确保实例暴露到全局作用域
window.buttonInstance = buttonInstance;

// 调试信息
console.log('Button组件已创建:', buttonInstance);
