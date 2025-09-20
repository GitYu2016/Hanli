# 日志管理器 (LoggerManager)

## 概述

LoggerManager 是 Hanli 项目的统一日志管理系统，提供完整的日志记录、存储、过滤和管理功能。所有组件都可以通过 LoggerManager 进行统一的日志管理。

## 功能特性

- ✅ **多级别日志**：支持 debug、info、warn、error 四个级别
- ✅ **智能过滤**：可配置的日志级别控制
- ✅ **持久化存储**：自动保存到本地存储，支持历史日志查看
- ✅ **实时监听**：支持添加日志监听器，实现实时日志显示
- ✅ **高级搜索**：支持按级别、组件、时间范围、关键词搜索
- ✅ **统计分析**：提供详细的日志统计和分析功能
- ✅ **导出功能**：支持将日志导出为 JSON 格式
- ✅ **组件集成**：与 BaseComponent 无缝集成

## 快速开始

### 1. 基本使用

```javascript
// 直接使用全局日志管理器
window.logger.debug('调试信息', { data: 'value' }, 'ComponentName');
window.logger.info('信息日志');
window.logger.warn('警告信息');
window.logger.error('错误信息', { error: errorObject });
```

### 2. 在组件中使用

```javascript
class MyComponent extends BaseComponent {
    constructor() {
        super('MyComponent');
    }
    
    someMethod() {
        // 使用继承的日志方法
        this.log('操作完成', 'info', { result: 'success' });
        this.handleError(error, '操作失败');
        this.showSuccess('操作成功');
        this.showWarning('注意警告');
    }
}
```

## API 参考

### LoggerManager 类

#### 构造函数

```javascript
const logger = new LoggerManager();
```

#### 日志记录方法

##### `debug(message, data, component)`
记录调试级别日志

**参数：**
- `message` (string): 日志消息
- `data` (Object, 可选): 附加数据
- `component` (string, 可选): 组件名称，默认为 'System'

**示例：**
```javascript
logger.debug('开始处理数据', { userId: 123 }, 'DataProcessor');
```

##### `info(message, data, component)`
记录信息级别日志

**参数：**
- `message` (string): 日志消息
- `data` (Object, 可选): 附加数据
- `component` (string, 可选): 组件名称，默认为 'System'

**示例：**
```javascript
logger.info('用户登录成功', { username: 'admin' }, 'AuthManager');
```

##### `warn(message, data, component)`
记录警告级别日志

**参数：**
- `message` (string): 日志消息
- `data` (Object, 可选): 附加数据
- `component` (string, 可选): 组件名称，默认为 'System'

**示例：**
```javascript
logger.warn('内存使用率过高', { usage: '85%' }, 'SystemMonitor');
```

##### `error(message, data, component)`
记录错误级别日志

**参数：**
- `message` (string): 日志消息
- `data` (Object, 可选): 附加数据
- `component` (string, 可选): 组件名称，默认为 'System'

**示例：**
```javascript
logger.error('数据库连接失败', { error: errorObject }, 'DatabaseManager');
```

#### 配置方法

##### `setLevel(level)`
设置日志级别

**参数：**
- `level` (string): 日志级别 ('debug', 'info', 'warn', 'error')

**示例：**
```javascript
logger.setLevel('info'); // 只显示 info、warn、error 级别日志
```

##### `setEnabled(enabled)`
启用或禁用日志

**参数：**
- `enabled` (boolean): 是否启用日志

**示例：**
```javascript
logger.setEnabled(false); // 禁用所有日志输出
```

#### 查询方法

##### `getLogs(options)`
获取日志列表

**参数：**
- `options` (Object, 可选): 查询选项
  - `level` (string): 按级别过滤
  - `component` (string): 按组件过滤
  - `startTime` (Date): 开始时间
  - `endTime` (Date): 结束时间
  - `search` (string): 关键词搜索
  - `sortBy` (string): 排序方式 ('time')
  - `limit` (number): 限制数量

**示例：**
```javascript
// 获取最近100条错误日志
const errorLogs = logger.getLogs({
    level: 'error',
    sortBy: 'time',
    limit: 100
});

// 搜索包含特定关键词的日志
const searchResults = logger.getLogs({
    search: '用户登录',
    sortBy: 'time'
});
```

##### `getStats()`
获取日志统计信息

**返回值：**
```javascript
{
    total: 1500,           // 总日志数
    byLevel: {             // 按级别统计
        debug: 800,
        info: 500,
        warn: 150,
        error: 50
    },
    byComponent: {         // 按组件统计
        'AuthManager': 200,
        'DataProcessor': 300,
        'System': 1000
    },
    recent: 50             // 最近1小时的日志数
}
```

#### 管理方法

##### `clearLogs()`
清空所有日志

```javascript
logger.clearLogs();
```

##### `exportLogs(options)`
导出日志为 JSON 格式

**参数：**
- `options` (Object, 可选): 导出选项，同 getLogs

**示例：**
```javascript
const logsJson = logger.exportLogs({
    level: 'error',
    sortBy: 'time'
});
```

##### `addListener(callback)`
添加日志监听器

**参数：**
- `callback` (Function): 回调函数，接收日志条目作为参数

**返回值：**
- `Function`: 取消监听的函数

**示例：**
```javascript
const unsubscribe = logger.addListener((logEntry) => {
    console.log('新日志:', logEntry);
});

// 取消监听
unsubscribe();
```

##### `destroy()`
销毁日志管理器

```javascript
logger.destroy();
```

## 配置

### 配置文件 (config.js)

```javascript
const APP_CONFIG = {
    // 日志配置
    LOG: {
        ENABLED: true,                    // 是否启用日志
        LEVEL: 'debug',                   // 默认日志级别
        MAX_LOGS: 1000,                   // 最大日志条数
        STORAGE_KEY: 'hanli_logs',        // 本地存储键名
        AUTO_SAVE_INTERVAL: 30000         // 自动保存间隔（毫秒）
    }
};
```

### 配置说明

- **ENABLED**: 控制是否启用日志系统
- **LEVEL**: 设置默认日志级别，低于此级别的日志将被过滤
- **MAX_LOGS**: 限制内存中保存的最大日志条数，超出时自动删除旧日志
- **STORAGE_KEY**: 本地存储中保存日志的键名
- **AUTO_SAVE_INTERVAL**: 自动保存到本地存储的时间间隔

## BaseComponent 集成

所有继承自 BaseComponent 的组件都自动获得日志功能：

### 日志方法

```javascript
class MyComponent extends BaseComponent {
    constructor() {
        super('MyComponent');
    }
    
    someMethod() {
        // 记录日志
        this.log('操作完成', 'info', { result: 'success' });
        
        // 错误处理
        this.handleError(error, '操作失败');
        
        // 成功提示
        this.showSuccess('操作成功');
        
        // 警告提示
        this.showWarning('注意警告');
    }
}
```

### 方法说明

- `log(message, level, data)`: 记录日志
- `handleError(error, context)`: 处理错误并记录日志
- `showSuccess(message)`: 显示成功提示并记录日志
- `showWarning(message)`: 显示警告提示并记录日志

## 最佳实践

### 1. 日志级别使用指南

- **debug**: 详细的调试信息，仅在开发时使用
- **info**: 一般信息，记录重要的业务流程
- **warn**: 警告信息，表示潜在问题但不影响功能
- **error**: 错误信息，表示功能异常或失败

### 2. 日志消息规范

```javascript
// ✅ 好的日志消息
logger.info('用户登录成功', { userId: 123, username: 'admin' });
logger.error('数据库连接失败', { error: errorObject, retryCount: 3 });

// ❌ 避免的日志消息
logger.info('ok'); // 太简单，没有上下文
logger.error('error'); // 没有具体错误信息
```

### 3. 性能考虑

- 避免在循环中记录大量日志
- 使用适当的日志级别，避免在生产环境记录过多 debug 日志
- 定期清理旧日志，避免内存占用过多

### 4. 错误处理

```javascript
try {
    // 可能出错的操作
    riskyOperation();
    logger.info('操作成功完成');
} catch (error) {
    logger.error('操作失败', { 
        error: error.message, 
        stack: error.stack,
        context: 'riskyOperation'
    });
    // 处理错误...
}
```

## 测试

### 运行测试

1. 打开 `test/components/test-logger-manager.html` 进行功能测试
2. 打开 `test/components/test-logger-integration.html` 进行集成测试

### 测试内容

- 日志级别控制
- 日志过滤和搜索
- 日志存储和持久化
- 组件集成测试
- 错误处理测试

## 故障排除

### 常见问题

1. **日志不显示**
   - 检查 `APP_CONFIG.LOG.ENABLED` 是否为 true
   - 检查日志级别设置是否过高

2. **日志丢失**
   - 检查本地存储是否被清理
   - 检查 `MAX_LOGS` 设置是否过小

3. **性能问题**
   - 减少 debug 级别日志
   - 增加 `AUTO_SAVE_INTERVAL` 间隔
   - 减少 `MAX_LOGS` 数量

### 调试技巧

```javascript
// 检查日志管理器状态
console.log('Logger enabled:', window.logger.isEnabled);
console.log('Current level:', window.logger.currentLevel);
console.log('Log count:', window.logger.logs.length);

// 获取统计信息
console.log('Stats:', window.logger.getStats());
```

## 更新日志

### v1.0.0 (2024-01-XX)
- 初始版本发布
- 支持基本的日志记录功能
- 集成 BaseComponent
- 添加持久化存储
- 实现日志过滤和搜索
- 添加测试页面
