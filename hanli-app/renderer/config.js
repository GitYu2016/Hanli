/**
 * 应用配置
 */
const APP_CONFIG = {
    // API服务器配置
    API_BASE_URL: 'http://localhost:3001',
    
    // 日志配置
    LOG: {
        ENABLED: true,
        LEVEL: 'debug', // debug, info, warn, error
        MAX_LOGS: 1000,
        STORAGE_KEY: 'hanli_logs',
        AUTO_SAVE_INTERVAL: 30000 // 30秒
    },
    
    // 其他配置
    DEBUG: true
};

// 导出到全局作用域
window.APP_CONFIG = APP_CONFIG;
