/**
 * 键盘快捷键管理器
 * 统一管理应用中的所有键盘快捷键功能
 */
class KeyboardShortcutManager {
    constructor() {
        this.shortcuts = new Map();
        this.contexts = new Map();
        this.currentContext = 'global';
        this.isMultiSelectMode = false;
        this.boundHandlers = new Map();
        
        this.init();
    }

    /**
     * 初始化快捷键管理器
     */
    init() {
        this.bindGlobalShortcuts();
    }

    /**
     * 绑定全局快捷键
     */
    bindGlobalShortcuts() {
        // 全局键盘事件监听器
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });

        document.addEventListener('keyup', (e) => {
            this.handleKeyUp(e);
        });
    }

    /**
     * 处理键盘按下事件
     * @param {KeyboardEvent} e - 键盘事件
     */
    handleKeyDown(e) {
        const key = this.getKeyIdentifier(e);
        const context = this.getCurrentContext();
        
        // 处理Shift键多选模式
        if (e.key === 'Shift') {
            this.isMultiSelectMode = true;
            this.notifyMultiSelectChange(true);
            return;
        }

        // 查找匹配的快捷键
        const shortcut = this.findShortcut(key, context);
        if (shortcut) {
            e.preventDefault();
            shortcut.handler(e);
        }
    }

    /**
     * 处理键盘松开事件
     * @param {KeyboardEvent} e - 键盘事件
     */
    handleKeyUp(e) {
        // 处理Shift键多选模式
        if (e.key === 'Shift') {
            this.isMultiSelectMode = false;
            this.notifyMultiSelectChange(false);
        }
    }

    /**
     * 获取按键标识符
     * @param {KeyboardEvent} e - 键盘事件
     * @returns {string} 按键标识符
     */
    getKeyIdentifier(e) {
        const parts = [];
        
        // 在macOS上，Cmd键对应metaKey，在Windows/Linux上对应ctrlKey
        // 为了统一处理，我们将metaKey也映射为ctrl
        if (e.ctrlKey || e.metaKey) parts.push('ctrl');
        if (e.altKey) parts.push('alt');
        if (e.shiftKey) parts.push('shift');
        
        // 特殊键处理
        if (e.key === 'Tab') {
            parts.push('tab');
        } else if (e.key === 'Enter') {
            parts.push('enter');
        } else if (e.key === 'Escape') {
            parts.push('escape');
        } else if (e.key === ' ') {
            parts.push('space');
        } else if (e.key.length === 1) {
            parts.push(e.key.toLowerCase());
        } else {
            parts.push(e.key.toLowerCase());
        }
        
        return parts.join('+');
    }

    /**
     * 获取当前上下文
     * @returns {string} 当前上下文
     */
    getCurrentContext() {
        return this.currentContext;
    }

    /**
     * 设置当前上下文
     * @param {string} context - 上下文名称
     */
    setContext(context) {
        this.currentContext = context;
    }

    /**
     * 查找匹配的快捷键
     * @param {string} key - 按键标识符
     * @param {string} context - 上下文
     * @returns {Object|null} 匹配的快捷键配置
     */
    findShortcut(key, context) {
        // 首先在当前上下文中查找
        const contextShortcuts = this.contexts.get(context);
        if (contextShortcuts && contextShortcuts.has(key)) {
            return contextShortcuts.get(key);
        }

        // 然后在全局上下文中查找
        const globalShortcuts = this.contexts.get('global');
        if (globalShortcuts && globalShortcuts.has(key)) {
            return globalShortcuts.get(key);
        }

        return null;
    }

    /**
     * 注册快捷键
     * @param {string} key - 按键标识符 (如: 'ctrl+w', 'escape', 'enter')
     * @param {Function} handler - 处理函数
     * @param {string} context - 上下文 (默认为 'global')
     * @param {string} description - 快捷键描述
     */
    register(key, handler, context = 'global', description = '') {
        if (!this.contexts.has(context)) {
            this.contexts.set(context, new Map());
        }

        const contextShortcuts = this.contexts.get(context);
        contextShortcuts.set(key, {
            handler,
            description,
            context
        });

    }

    /**
     * 注销快捷键
     * @param {string} key - 按键标识符
     * @param {string} context - 上下文
     */
    unregister(key, context = 'global') {
        const contextShortcuts = this.contexts.get(context);
        if (contextShortcuts && contextShortcuts.has(key)) {
            contextShortcuts.delete(key);
        }
    }

    /**
     * 注销上下文中的所有快捷键
     * @param {string} context - 上下文
     */
    unregisterContext(context) {
        this.contexts.delete(context);
    }

    /**
     * 获取所有快捷键列表
     * @param {string} context - 上下文 (可选)
     * @returns {Array} 快捷键列表
     */
    getShortcuts(context = null) {
        const shortcuts = [];
        
        for (const [ctx, contextShortcuts] of this.contexts) {
            if (context && ctx !== context) continue;
            
            for (const [key, config] of contextShortcuts) {
                shortcuts.push({
                    key,
                    context: ctx,
                    description: config.description
                });
            }
        }
        
        return shortcuts;
    }

    /**
     * 通知多选模式变化
     * @param {boolean} isMultiSelect - 是否多选模式
     */
    notifyMultiSelectChange(isMultiSelect) {
        // 触发自定义事件
        const event = new CustomEvent('multiSelectModeChange', {
            detail: { isMultiSelect }
        });
        document.dispatchEvent(event);
    }

    /**
     * 检查是否处于多选模式
     * @returns {boolean} 是否多选模式
     */
    isMultiSelectActive() {
        return this.isMultiSelectMode;
    }

    /**
     * 创建上下文相关的快捷键绑定
     * @param {string} context - 上下文名称
     * @param {Object} shortcuts - 快捷键配置对象
     */
    createContextShortcuts(context, shortcuts) {
        for (const [key, config] of Object.entries(shortcuts)) {
            this.register(key, config.handler, context, config.description);
        }
    }

    /**
     * 销毁快捷键管理器
     */
    destroy() {
        // 清理所有上下文
        this.contexts.clear();
        this.shortcuts.clear();
        this.boundHandlers.clear();
    }
}

// 创建全局快捷键管理器实例
window.keyboardShortcutManager = new KeyboardShortcutManager();

// 导出快捷键管理器类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KeyboardShortcutManager;
}
