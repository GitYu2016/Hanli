# 采集进度对话框功能说明

## 功能概述

采集进度对话框是一个新的UI组件，用于在商品采集过程中显示实时进度信息。当用户点击采集按钮时，会弹出一个对话框显示采集进度，包括JSON文件、图片和视频的处理状态。

## 主要特性

### 1. 进度显示
- **总体进度**：显示当前已处理的文件数量（如：正在采集中 5/12）
- **进度条**：可视化显示采集进度百分比
- **文件类型进度**：分别显示JSON、图片、视频的处理进度

### 2. 交互功能
- **取消按钮**：允许用户取消正在进行的采集
- **打开App按钮**：采集完成后可以打开Hanli客户端查看商品详情
- **自动关闭**：采集完成后可以点击遮罩或按ESC键关闭对话框

### 3. 状态管理
- **采集中**：显示进度条和文件处理状态
- **采集完成**：显示完成信息，启用"打开App"按钮
- **采集失败**：自动隐藏对话框并显示错误提示

## 技术实现

### 组件结构
```
CollectionProgressDialog.js
├── show() - 显示对话框
├── hide() - 隐藏对话框
├── updateProgress() - 更新总体进度
├── updateFileTypeProgress() - 更新文件类型进度
├── showComplete() - 显示完成状态
└── openApp() - 打开Hanli客户端
```

### 集成方式
1. **content.js**：修改采集按钮点击事件，调用进度对话框
2. **collectionManager.js**：添加带进度跟踪的采集方法
3. **manifest.json**：注册新的组件文件

### 事件流程
1. 用户点击采集按钮
2. 显示进度对话框
3. 开始采集流程（JSON → 图片 → 视频）
4. 实时更新进度信息
5. 采集完成后显示"打开App"按钮
6. 用户可选择打开App或关闭对话框

## 使用方法

### 基本使用
```javascript
// 显示进度对话框
window.collectionProgressDialog.show('goods-id-123', 10);

// 更新进度
window.collectionProgressDialog.updateProgress(5, 10);

// 更新文件类型进度
window.collectionProgressDialog.updateFileTypeProgress('images', 3, 8);

// 显示完成状态
window.collectionProgressDialog.showComplete();

// 隐藏对话框
window.collectionProgressDialog.hide();
```

### 事件监听
```javascript
// 监听取消采集事件
document.addEventListener('hanliCollectionCancelled', () => {
    console.log('采集已取消');
});

// 监听采集完成事件
document.addEventListener('hanliCollectionCompleted', () => {
    console.log('采集已完成');
});
```

## 测试

使用 `test-collection-progress.html` 文件可以测试所有功能：

1. 打开测试页面
2. 点击各种测试按钮
3. 观察对话框的显示和交互效果
4. 验证进度更新和完成状态

## 注意事项

1. **依赖关系**：需要CollectionManager和MediaManager正常工作
2. **错误处理**：采集失败时会自动隐藏对话框并显示错误信息
3. **性能考虑**：进度更新使用防抖机制，避免频繁的DOM操作
4. **兼容性**：支持现代浏览器的ES6+语法

## 未来改进

1. 添加更详细的错误信息显示
2. 支持暂停和恢复采集功能
3. 添加采集历史记录
4. 优化移动端显示效果
