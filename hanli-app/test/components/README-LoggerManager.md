# 日志管理器测试说明

## 概述

本文档介绍日志管理器 (LoggerManager) 的测试方法和使用示例。

## 测试文件

### 1. test-logger-manager.html
**功能测试页面** - 测试日志管理器的核心功能

**测试内容：**
- 日志级别控制 (debug, info, warn, error)
- 日志过滤和搜索
- 日志存储和持久化
- 日志统计和分析
- 日志导出功能

**使用方法：**
1. 在浏览器中打开 `test-logger-manager.html`
2. 调整日志级别和组件名称
3. 点击各种按钮测试不同功能
4. 使用搜索框过滤日志
5. 查看统计信息

### 2. test-logger-integration.html
**集成测试页面** - 测试日志管理器与组件的集成

**测试内容：**
- 直接使用 LoggerManager
- 通过 BaseComponent 使用日志功能
- 错误处理和异常记录
- 日志过滤和搜索功能

**使用方法：**
1. 在浏览器中打开 `test-logger-integration.html`
2. 点击各个测试按钮
3. 观察日志输出和组件行为
4. 测试搜索和过滤功能

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

### 3. 配置日志

```javascript
// 设置日志级别
window.logger.setLevel('info');

// 启用/禁用日志
window.logger.setEnabled(true);

// 获取日志统计
const stats = window.logger.getStats();
console.log('日志统计:', stats);
```

## 测试场景

### 场景1：日志级别测试
1. 设置日志级别为 'debug'
2. 记录不同级别的日志
3. 观察控制台输出
4. 切换到 'info' 级别
5. 验证只有 info、warn、error 级别日志显示

### 场景2：组件集成测试
1. 创建继承 BaseComponent 的测试组件
2. 调用各种日志方法
3. 验证日志正确记录
4. 测试错误处理功能

### 场景3：日志过滤测试
1. 记录大量不同组件和级别的日志
2. 使用搜索功能过滤日志
3. 按级别过滤日志
4. 按组件过滤日志
5. 验证过滤结果正确

### 场景4：持久化测试
1. 记录一些日志
2. 刷新页面
3. 验证日志是否保存
4. 清空日志
5. 验证日志被清空

## 预期结果

### 功能测试
- ✅ 所有日志级别正常工作
- ✅ 日志过滤和搜索功能正常
- ✅ 日志统计信息准确
- ✅ 日志导出功能正常
- ✅ 日志持久化存储正常

### 集成测试
- ✅ BaseComponent 集成正常
- ✅ 错误处理功能正常
- ✅ 日志监听器正常工作
- ✅ 组件生命周期管理正常

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

// 获取最近的日志
const recentLogs = window.logger.getLogs({ limit: 10 });
console.log('Recent logs:', recentLogs);
```

## 相关文档

- [LoggerManager 完整文档](../../../Docs/一、通用/LoggerManager.md)
- [项目结构文档](../../../Docs/一、通用/项目结构.md)
- [代码规范文档](../../../Docs/一、通用/代码规范.md)
