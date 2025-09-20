/**
 * 基础组件类
 * 提供所有组件的通用功能和样式管理
 */
class BaseComponent {
    constructor(componentName) {
        this.componentName = componentName;
        this.element = null;
        this.eventListeners = [];
        this.isDestroyed = false;
    }

    /**
     * 初始化组件样式
     * @param {Object} styles - 样式对象
     */
    initStyles(styles) {
        // 确保StyleManager已加载
        if (typeof window.styleManager === 'undefined') {
            console.error(`❌ ${this.componentName}: StyleManager未加载，请确保已引入StyleManager.js`);
            return false;
        }

        try {
            // 注册样式到StyleManager
            window.styleManager.defineStyles(this.componentName, styles);
            return true;
        } catch (error) {
            console.error(`❌ ${this.componentName}: 样式注册失败:`, error);
            return false;
        }
    }

    /**
     * 创建样式化元素
     * @param {string} tagName - 标签名
     * @param {string} className - CSS类名
     * @param {string} innerHTML - 内部HTML
     * @param {Object} attributes - 其他属性
     * @returns {HTMLElement} 创建的元素
     */
    createStyledElement(tagName, className = '', innerHTML = '', attributes = {}) {
        if (typeof window.styleManager === 'undefined') {
            // 备用方案：直接创建元素
            const element = document.createElement(tagName);
            if (className) element.className = className;
            if (innerHTML) element.innerHTML = innerHTML;
            Object.assign(element, attributes);
            return element;
        }

        try {
            return window.styleManager.createStyledElement(
                tagName, 
                this.componentName, 
                className, 
                { innerHTML, ...attributes }
            );
        } catch (error) {
            console.error(`❌ ${this.componentName}: 创建样式化元素失败:`, error);
            // 备用方案
            const element = document.createElement(tagName);
            if (className) element.className = className;
            if (innerHTML) element.innerHTML = innerHTML;
            Object.assign(element, attributes);
            return element;
        }
    }

    /**
     * 统一的事件绑定方法
     * @param {HTMLElement|string} target - 目标元素或选择器
     * @param {string} event - 事件类型
     * @param {Function} handler - 事件处理函数
     * @param {Object} options - 事件选项
     */
    addEventListener(target, event, handler, options = {}) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (!element) {
            console.warn(`⚠️ ${this.componentName}: 找不到目标元素:`, target);
            return;
        }

        element.addEventListener(event, handler, options);
        this.eventListeners.push({ element, event, handler, options });
    }

    /**
     * 统一的DOM查询方法
     * @param {string} selector - 选择器
     * @param {HTMLElement} context - 上下文元素
     * @returns {HTMLElement|null} 找到的元素
     */
    querySelector(selector, context = document) {
        return context.querySelector(selector);
    }

    /**
     * 统一的多元素查询方法
     * @param {string} selector - 选择器
     * @param {HTMLElement} context - 上下文元素
     * @returns {NodeList} 找到的元素列表
     */
    querySelectorAll(selector, context = document) {
        return context.querySelectorAll(selector);
    }

    /**
     * 创建元素
     * @param {string} tagName - 标签名
     * @param {string} className - CSS类名
     * @param {string} innerHTML - 内部HTML
     * @returns {HTMLElement} 创建的元素
     */
    createElement(tagName, className = '', innerHTML = '') {
        const element = document.createElement(tagName);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    }

    /**
     * 统一的日志输出方法
     * @param {string} message - 日志消息
     * @param {string} level - 日志级别 (debug, info, warn, error)
     * @param {Object} data - 附加数据
     */
    log(message, level = 'info', data = null) {
        // 使用全局日志管理器
        if (window.logger) {
            window.logger.log(level, message, data, this.componentName);
        } else {
            // 备用方案：直接输出到控制台
            const prefix = `[${this.componentName}]`;
            console[level] || console.log(`${prefix} ${message}`, data || '');
        }
    }

    /**
     * 统一的错误处理方法
     * @param {Error|string} error - 错误对象或消息
     * @param {string} context - 错误上下文
     */
    handleError(error, context = '') {
        const message = typeof error === 'string' ? error : error.message;
        const fullMessage = context ? `${context}: ${message}` : message;
        
        this.log(fullMessage, 'error', { error, context });
        
        // 显示用户友好的错误提示
        if (window.toastInstance) {
            window.toastInstance.error(fullMessage);
        }
    }

    /**
     * 统一的成功提示方法
     * @param {string} message - 成功消息
     */
    showSuccess(message) {
        this.log(message, 'info');
        if (window.toastInstance) {
            window.toastInstance.success(message);
        }
    }

    /**
     * 统一的警告提示方法
     * @param {string} message - 警告消息
     */
    showWarning(message) {
        this.log(message, 'warn');
        if (window.toastInstance) {
            window.toastInstance.warning(message);
        }
    }

    /**
     * 检查组件是否已销毁
     * @returns {boolean} 是否已销毁
     */
    isComponentDestroyed() {
        return this.isDestroyed;
    }

    /**
     * 销毁组件 - 清理所有事件监听器和引用
     */
    destroy() {
        if (this.isDestroyed) {
            this.log('组件已经销毁，跳过重复销毁', 'warn');
            return;
        }

        this.log('开始销毁组件', 'log');

        // 清理所有事件监听器
        this.eventListeners.forEach(({ element, event, handler, options }) => {
            try {
                element.removeEventListener(event, handler, options);
            } catch (error) {
                console.warn(`⚠️ ${this.componentName}: 移除事件监听器失败:`, error);
            }
        });
        this.eventListeners = [];

        // 清理元素引用
        this.element = null;
        this.isDestroyed = true;

        this.log('组件销毁完成', 'log');
    }

    /**
     * 抽象方法：子类必须实现
     */
    init() {
        throw new Error(`${this.componentName}: 子类必须实现 init() 方法`);
    }

    /**
     * 抽象方法：子类必须实现
     */
    render() {
        throw new Error(`${this.componentName}: 子类必须实现 render() 方法`);
    }
}

// 导出BaseComponent类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaseComponent;
} else if (typeof window !== 'undefined') {
    window.BaseComponent = BaseComponent;
}
