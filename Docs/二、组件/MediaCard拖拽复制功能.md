# MediaCard 拖拽复制功能

## 功能概述

为MediaCard组件添加了多选媒体文件拖动复制功能，用户可以选择多个媒体文件并拖拽到文件夹进行复制操作。

## 功能特性

### 1. 多选拖拽支持
- 支持选择多个媒体文件（图片和视频）
- 拖拽时自动选中当前项（如果未选中）
- 拖拽所有选中的媒体文件

### 2. 拖拽视觉反馈
- 拖拽时显示半透明效果
- 选中的文件高亮显示
- 鼠标指针变化（grab/grabbing）
- 拖拽提示信息

### 3. 文件复制功能
- 支持复制到桌面文件夹
- 支持复制到指定文件夹
- 自动处理文件名冲突（添加序号）
- 批量复制多个文件

### 4. 用户提示
- 拖拽开始时的提示信息
- 复制成功/失败的反馈
- 自动隐藏的提示框

## 技术实现

### 1. 拖拽事件处理
```javascript
// 拖拽开始事件
handleDragStart(event, mediaCard) {
    // 选中当前项
    // 设置拖拽数据
    // 添加视觉反馈
    // 显示提示信息
}

// 拖拽结束事件
handleDragEnd(event, mediaCard) {
    // 移除视觉反馈
    // 隐藏提示信息
}
```

### 2. 文件复制API
```javascript
// 主进程API
ipcMain.handle('copy-files-to-folder', async (event, items, targetPath) => {
    // 批量复制文件
    // 处理文件名冲突
    // 返回复制结果
});

// 渲染进程API
window.electronAPI.fileAPI.copyFilesToFolder(items, targetPath)
```

### 3. 拖拽目标检测
```javascript
// 检测拖拽目标
async getDropTargetPath(event) {
    // 检查是否拖拽到应用外部
    // 获取桌面路径
    // 检查特定拖拽区域
}
```

## 使用方法

### 1. 基本使用
```javascript
const mediaCard = new MediaCard();
mediaCard.init(container, mediaItems, {
    goodsId: 'product123',
    onSelectionChange: (selectedItems) => {
        console.log('选择变化:', selectedItems);
    }
});
```

### 2. 拖拽操作
1. 选择多个媒体文件（点击选择，按住Shift键多选）
2. 拖拽选中的媒体文件
3. 拖拽到文件夹或桌面
4. 文件自动复制到目标位置

### 3. 自定义拖拽区域
```html
<div class="drop-zone" data-target-path="/path/to/folder">
    拖拽区域
</div>
```

## CSS样式

### 1. 拖拽状态样式
```css
.media-card-item.dragging {
    opacity: 0.6;
    transform: scale(0.95);
    transition: all 0.2s ease;
}

.media-card-item.drag-selected {
    border: 3px solid var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-primary-light);
    transform: scale(1.02);
    opacity: 0.8;
}
```

### 2. 拖拽提示样式
```css
.drag-hint {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--color-primary);
    color: white;
    padding: 12px 24px;
    border-radius: var(--radius-medium);
    z-index: 10000;
}
```

## 配置选项

### MediaCard初始化选项
```javascript
const options = {
    goodsId: 'string',              // 商品ID
    onSelectionChange: function,     // 选择变化回调
    onImageClick: function,          // 图片点击回调
    onVideoContextMenu: function,    // 视频右键菜单回调
    isMultiSelectMode: boolean       // 多选模式
};
```

## 文件结构

```
hanli-app/
├── renderer/
│   ├── components/Detail/
│   │   ├── MediaCard.js           # 媒体卡片组件（含拖拽功能）
│   │   └── MediaSelection.js      # 媒体选择组件
│   └── styles.css                 # 样式文件（含拖拽样式）
├── main.js                        # 主进程（含文件复制API）
├── preload.js                     # 预加载脚本（含API暴露）
└── test/
    └── test-multi-drag.html       # 测试页面
```

## 测试

使用测试页面验证功能：
1. 打开 `hanli-app/test/test-multi-drag.html`
2. 选择多个媒体文件
3. 拖拽到拖拽区域
4. 观察复制结果和用户反馈

## 注意事项

1. 拖拽功能需要现代浏览器支持
2. 文件复制需要主进程权限
3. 拖拽到系统文件管理器需要用户交互
4. 大文件复制可能需要较长时间
5. 文件名冲突会自动添加序号

## 更新日志

- 2024-01-XX: 添加多选媒体文件拖拽复制功能
- 支持拖拽到桌面和指定文件夹
- 添加拖拽视觉反馈和用户提示
- 实现批量文件复制API
