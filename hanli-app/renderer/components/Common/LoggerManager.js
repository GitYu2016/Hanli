/**
 * 日志管理器
 * 提供统一的日志记录、存储、过滤和管理功能
 */
class LoggerManager {
    constructor() {
        this.logs = [];
        this.maxLogs = window.APP_CONFIG?.LOG?.MAX_LOGS || 1000; // 最大日志条数
        this.currentLevel = window.APP_CONFIG?.LOG?.LEVEL || 'debug'; // 当前日志级别
        this.isEnabled = window.APP_CONFIG?.LOG?.ENABLED !== false; // 是否启用日志
        this.storageKey = window.APP_CONFIG?.LOG?.STORAGE_KEY || 'hanli_logs'; // 本地存储键名
        this.listeners = []; // 日志监听器
        
        // 日志级别定义
        this.levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        };
        
        // 初始化
        this.init();
    }

    /**
     * 初始化日志管理器
     */
    init() {
        // 从本地存储加载历史日志
        this.loadLogsFromStorage();
        
        // 监听页面卸载，保存日志
        window.addEventListener('beforeunload', () => {
            this.saveLogsToStorage();
        });
        
        // 定期保存日志
        const autoSaveInterval = window.APP_CONFIG?.LOG?.AUTO_SAVE_INTERVAL || 30000;
        setInterval(() => {
            this.saveLogsToStorage();
        }, autoSaveInterval);
        
        this.info('LoggerManager 初始化完成');
    }

    /**
     * 设置日志级别
     * @param {string} level - 日志级别 (debug, info, warn, error)
     */
    setLevel(level) {
        if (this.levels.hasOwnProperty(level)) {
            this.currentLevel = level;
            this.info(`日志级别设置为: ${level}`);
        } else {
            this.warn(`无效的日志级别: ${level}`);
        }
    }

    /**
     * 启用或禁用日志
     * @param {boolean} enabled - 是否启用
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        this.info(`日志系统${enabled ? '启用' : '禁用'}`);
    }

    /**
     * 检查是否应该记录指定级别的日志
     * @param {string} level - 日志级别
     * @returns {boolean} 是否应该记录
     */
    shouldLog(level) {
        if (!this.isEnabled) return false;
        return this.levels[level] >= this.levels[this.currentLevel];
    }

    /**
     * 记录日志
     * @param {string} level - 日志级别
     * @param {string} message - 日志消息
     * @param {Object} data - 附加数据
     * @param {string} component - 组件名称
     */
    log(level, message, data = null, component = 'System') {
        if (!this.shouldLog(level)) return;

        const timestamp = new Date();
        const logEntry = {
            id: this.generateLogId(),
            timestamp: timestamp,
            level: level,
            message: message,
            data: data,
            component: component,
            formattedTime: timestamp.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            })
        };

        // 添加到日志数组
        this.logs.push(logEntry);

        // 限制日志数量
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }

        // 输出到控制台
        this.outputToConsole(logEntry);

        // 通知监听器
        this.notifyListeners(logEntry);
    }

    /**
     * 输出到控制台
     * @param {Object} logEntry - 日志条目
     */
    outputToConsole(logEntry) {
        const { level, message, data, component, formattedTime } = logEntry;
        const prefix = `[${formattedTime}] [${component}]`;
        
        const consoleMethod = console[level] || console.log;
        
        if (data) {
            consoleMethod(`${prefix} ${message}`, data);
        } else {
            consoleMethod(`${prefix} ${message}`);
        }
    }

    /**
     * 生成日志ID
     * @returns {string} 日志ID
     */
    generateLogId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 记录调试日志
     * @param {string} message - 消息
     * @param {Object} data - 数据
     * @param {string} component - 组件名
     */
    debug(message, data = null, component = 'System') {
        this.log('debug', message, data, component);
    }

    /**
     * 记录信息日志
     * @param {string} message - 消息
     * @param {Object} data - 数据
     * @param {string} component - 组件名
     */
    info(message, data = null, component = 'System') {
        this.log('info', message, data, component);
    }

    /**
     * 记录警告日志
     * @param {string} message - 消息
     * @param {Object} data - 数据
     * @param {string} component - 组件名
     */
    warn(message, data = null, component = 'System') {
        this.log('warn', message, data, component);
    }

    /**
     * 记录错误日志
     * @param {string} message - 消息
     * @param {Object} data - 数据
     * @param {string} component - 组件名
     */
    error(message, data = null, component = 'System') {
        this.log('error', message, data, component);
    }

    /**
     * 添加日志监听器
     * @param {Function} callback - 回调函数
     * @returns {Function} 取消监听的函数
     */
    addListener(callback) {
        this.listeners.push(callback);
        
        // 返回取消监听的函数
        return () => {
            const index = this.listeners.indexOf(callback);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    /**
     * 通知所有监听器
     * @param {Object} logEntry - 日志条目
     */
    notifyListeners(logEntry) {
        this.listeners.forEach(callback => {
            try {
                callback(logEntry);
            } catch (error) {
                console.error('日志监听器执行失败:', error);
            }
        });
    }

    /**
     * 获取日志
     * @param {Object} options - 过滤选项
     * @returns {Array} 日志数组
     */
    getLogs(options = {}) {
        let filteredLogs = [...this.logs];

        // 按级别过滤
        if (options.level) {
            filteredLogs = filteredLogs.filter(log => log.level === options.level);
        }

        // 按组件过滤
        if (options.component) {
            filteredLogs = filteredLogs.filter(log => log.component === options.component);
        }

        // 按时间范围过滤
        if (options.startTime) {
            filteredLogs = filteredLogs.filter(log => log.timestamp >= options.startTime);
        }
        if (options.endTime) {
            filteredLogs = filteredLogs.filter(log => log.timestamp <= options.endTime);
        }

        // 按关键词搜索
        if (options.search) {
            const searchTerm = options.search.toLowerCase();
            filteredLogs = filteredLogs.filter(log => 
                log.message.toLowerCase().includes(searchTerm) ||
                log.component.toLowerCase().includes(searchTerm)
            );
        }

        // 排序
        if (options.sortBy === 'time') {
            filteredLogs.sort((a, b) => b.timestamp - a.timestamp);
        }

        // 限制数量
        if (options.limit) {
            filteredLogs = filteredLogs.slice(0, options.limit);
        }

        return filteredLogs;
    }

    /**
     * 清空日志
     */
    clearLogs() {
        this.logs = [];
        this.info('日志已清空');
    }

    /**
     * 导出日志
     * @param {Object} options - 导出选项
     * @returns {string} JSON格式的日志
     */
    exportLogs(options = {}) {
        const logs = this.getLogs(options);
        return JSON.stringify(logs, null, 2);
    }

    /**
     * 保存日志到本地存储
     */
    saveLogsToStorage() {
        try {
            const logsToSave = this.logs.slice(-100); // 只保存最近100条
            localStorage.setItem(this.storageKey, JSON.stringify(logsToSave));
        } catch (error) {
            console.error('保存日志到本地存储失败:', error);
        }
    }

    /**
     * 从本地存储加载日志
     */
    loadLogsFromStorage() {
        try {
            const savedLogs = localStorage.getItem(this.storageKey);
            if (savedLogs) {
                const parsedLogs = JSON.parse(savedLogs);
                this.logs = parsedLogs.map(log => ({
                    ...log,
                    timestamp: new Date(log.timestamp)
                }));
                this.info(`从本地存储加载了 ${this.logs.length} 条日志`);
            }
        } catch (error) {
            console.error('从本地存储加载日志失败:', error);
        }
    }

    /**
     * 获取日志统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        const stats = {
            total: this.logs.length,
            byLevel: {},
            byComponent: {},
            recent: 0
        };

        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        this.logs.forEach(log => {
            // 按级别统计
            stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
            
            // 按组件统计
            stats.byComponent[log.component] = (stats.byComponent[log.component] || 0) + 1;
            
            // 最近1小时的日志
            if (log.timestamp > oneHourAgo) {
                stats.recent++;
            }
        });

        return stats;
    }

    /**
     * 销毁日志管理器
     */
    destroy() {
        this.saveLogsToStorage();
        this.listeners = [];
        this.logs = [];
        this.info('LoggerManager 已销毁');
    }
}

// 创建全局日志管理器实例
const loggerManager = new LoggerManager();

// 导出到全局作用域
if (typeof window !== 'undefined') {
    window.LoggerManager = LoggerManager;
    window.logger = loggerManager;
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoggerManager;
}
