# MediaCard 组件

统一的媒体卡片组件，支持图片和视频的加载、显示、选择等功能。

## 功能特性

- **统一接口**: 同时支持图片和视频的显示和交互
- **加载状态**: 自动处理媒体文件的加载状态和错误处理
- **选择功能**: 支持单选和多选模式
- **交互操作**: 支持点击、右键菜单等交互
- **响应式设计**: 适配不同屏幕尺寸
- **文件信息**: 显示文件名、尺寸、大小等元数据

## 使用方法

### 基本用法

```javascript
// 创建媒体卡片组件实例
const mediaCard = new MediaCard();

// 准备媒体数据
const mediaItems = [
    {
        type: 'image',
        url: 'path/to/image.jpg',
        name: '图片1.jpg',
        width: 800,
        height: 600,
        fileSize: 1024000
    },
    {
        type: 'video',
        url: 'path/to/video.mp4',
        name: '视频1.mp4',
        fileSize: 10485760
    }
];

// 初始化组件
mediaCard.init(container, mediaItems, {
    goodsId: 'product123',
    onSelectionChange: (selectedItems) => {
        console.log('选择变化:', selectedItems);
    },
    onImageClick: (image, index) => {
        console.log('图片点击:', image);
    },
    onVideoContextMenu: (event, index, fileName, filePath) => {
        console.log('视频右键菜单:', fileName);
    }
});
```

### 配置选项

```javascript
const options = {
    goodsId: 'string',              // 商品ID，用于构建文件路径
    onSelectionChange: function,     // 选择变化回调函数
    onImageClick: function,          // 图片点击回调函数
    onVideoContextMenu: function,    // 视频右键菜单回调函数
    isMultiSelectMode: boolean       // 是否启用多选模式
};
```

### 媒体数据格式

#### 图片数据
```javascript
{
    type: 'image',
    url: 'string',           // 图片URL
    name: 'string',          // 文件名
    width: number,           // 图片宽度（可选）
    height: number,          // 图片高度（可选）
    fileSize: number,        // 文件大小（字节）
    path: 'string'           // 文件路径（可选）
}
```

#### 视频数据
```javascript
{
    type: 'video',
    url: 'string',           // 视频URL
    name: 'string',          // 文件名
    fileSize: number,        // 文件大小（字节）
    path: 'string'           // 文件路径（可选）
}
```

## API 方法

### init(container, mediaItems, options)
初始化媒体卡片组件

**参数:**
- `container` (HTMLElement): 容器元素
- `mediaItems` (Array): 媒体项数组
- `options` (Object): 配置选项

### getSelectedItems()
获取当前选中的媒体项

**返回值:** Array - 选中的媒体项数组

### getSelectedCount()
获取选中的媒体项数量

**返回值:** Number - 选中的媒体项数量

### setSelection(indexes)
设置选择状态

**参数:**
- `indexes` (Array): 要选择的索引数组

### clearSelection()
清除所有选择

### destroy()
销毁组件，清理资源

## 事件回调

### onSelectionChange(selectedItems)
选择状态变化时触发

**参数:**
- `selectedItems` (Array): 选中的媒体项数组，每个项包含 `{item, index}`

### onImageClick(image, index)
图片点击时触发

**参数:**
- `image` (Object): 图片对象
- `index` (Number): 图片索引

### onVideoContextMenu(event, index, fileName, filePath)
视频右键菜单时触发

**参数:**
- `event` (Event): 右键事件
- `index` (Number): 视频索引
- `fileName` (String): 文件名
- `filePath` (String): 文件路径

## CSS 类名

### 主要容器
- `.media-card-grid` - 媒体卡片网格容器
- `.media-card-item` - 单个媒体卡片项
- `.media-card-wrapper` - 媒体卡片包装器
- `.media-card-content` - 媒体内容区域
- `.media-card-info` - 媒体信息区域

### 状态类
- `.selected` - 选中状态
- `.image-card` - 图片卡片
- `.video-card` - 视频卡片
- `.multi-select-mode` - 多选模式

### 加载状态
- `.media-card-loading` - 加载中状态
- `.media-card-error` - 错误状态

## 样式定制

组件使用CSS变量进行主题定制，主要变量包括：

```css
:root {
    --color-primary: rgba(0, 0, 0, 0.8);
    --color-secondary: rgba(0, 0, 0, 0.5);
    --color-focused: rgba(0, 0, 0, 1.0);
    --color-disabled: rgba(0, 0, 0, 0.3);
    --color-background-normal: rgba(0, 0, 0, 0.1);
    --color-background-focused: rgba(0, 0, 0, 0.2);
    --color-border-normal: rgba(0, 0, 0, 0.1);
    --color-border-focused: rgba(0, 0, 0, 0.3);
    --color-success: rgba(34, 197, 94, 1.0);
    --color-warning: rgba(245, 158, 11, 1.0);
    --color-error: rgba(239, 68, 68, 1.0);
    --color-info: rgba(59, 130, 246, 1.0);
    --radius-small: 6px;
    --radius-medium: 8px;
    --radius-large: 12px;
}
```

**注意**: 组件使用半透明色规范，所有颜色都使用RGBA格式，支持主题切换。

## 示例

查看 `test-media-card.html` 文件获取完整的使用示例。

## 注意事项

1. 确保在HTML中引入了组件的CSS和JS文件
2. 媒体URL必须是可访问的
3. 组件会自动处理图片的加载状态和错误
4. 多选模式需要按住Shift键进行选择
5. 组件销毁时会自动清理事件监听器
