# ImagesCard 组件完整文档

## 1. 概述

ImagesCard 组件是产品库中的图片展示和管理组件，支持图片的展示、选择、添加和删除功能。组件采用卡片式布局，提供直观的图片管理体验，支持单选、多选、框选等多种选择模式。

## 2. 核心功能

### 2.1 图片展示
- **图片信息显示**：序号、标题、尺寸信息
- **响应式布局**：自适应不同屏幕尺寸
- **懒加载**：优化大量图片的加载性能
- **错误处理**：图片加载失败时的友好提示

### 2.2 选择功能
- **单选模式**：直接点击图片进行选择
- **多选模式**：按住Shift键进行多选
- **框选模式**：在非图片区域拖动进行框选
- **连续选择**：Shift+点击实现连续范围选择

### 2.3 管理功能
- **添加图片**：支持批量上传
- **删除图片**：悬停显示删除按钮
- **键盘导航**：支持Tab、方向键等键盘操作

## 3. 组件尺寸和布局

### 3.1 图片卡片尺寸
- **图片比例**：3:4宽高比，为信息区域留出空间
- **卡片间距**：卡片之间保持12px间距
- **响应式布局**：支持不同屏幕尺寸的自适应显示
- **最小宽度**：确保图片卡片有最小显示宽度（150px）

### 3.2 布局规范
- **网格布局**：采用响应式网格布局
- **信息区域**：图片下方显示序号、标题、尺寸信息
- **最大宽度**：限制图片卡片的最大宽度，避免过大

## 4. 图片信息显示

### 4.1 信息内容
- **序号**：显示在图片下方，带有蓝色背景的圆形标签
- **标题**：图片的标题或名称，支持长文本省略
- **尺寸**：图片的宽度×高度信息，使用等宽字体
- **内存占用**：显示图片在内存中的占用大小（基于RGBA格式计算）

### 4.2 显示样式
```css
.image-info {
    padding: 8px;
    background: var(--color-background);
    border-top: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-height: 60px;
}

.image-number {
    font-size: 12px;
    font-weight: bold;
    color: var(--color-primary);
    background: var(--color-primary-light);
    padding: 2px 6px;
    border-radius: 10px;
    display: inline-block;
    width: fit-content;
    margin: 0 auto;
}

.image-title {
    font-size: 11px;
    color: var(--color-text);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 2px 0;
}

.image-size {
    font-size: 10px;
    color: var(--color-text-secondary);
    text-align: center;
    font-family: monospace;
    line-height: 1.2;
}
```

## 5. 选择功能详解

### 5.1 单选模式（默认）
- **点击选择**：只能点击图片本身进行单选，点击文字区域无效
- **状态切换**：再次点击已选中的图片可取消选择
- **空白取消**：点击空白区域取消所有选择
- **视觉反馈**：选中状态有明显的视觉指示
- **文字区域**：图片下方的文字区域不可点击，仅用于显示信息

### 5.2 多选模式（按住Shift）
- **激活方式**：按住Shift键激活多选模式
- **添加选择**：按住Shift+点击图片添加到选择列表
- **移除选择**：按住Shift+点击已选中的图片从选择列表移除
- **模式提示**：按住Shift时显示"按住Shift键进行多选"提示
- **点击限制**：只能点击图片本身，文字区域不可点击

### 5.3 框选模式
- **框选操作**：在卡片非图片区域按住拖动进行框选
- **选择范围**：框选范围内的图片被选中
- **Shift框选**：按住Shift进行框选时，已选中的图片被取消选择，其他图片被选中

### 5.4 连续选择模式
- **Shift连续选择**：选择一张图片后，按住Shift再点击另一张图片
- **选择范围**：将中间连续的图片全部选中（例如：选中图片2，再按住Shift选中图片6，则图片2-6全部被选中）
- **范围计算**：基于图片的索引位置计算连续范围
- **智能处理**：自动处理起始和结束位置的顺序，无论点击顺序如何

### 5.5 取消选择
- **空白区域点击**：点击空白区域取消所有图片的选中状态
- **ESC键**：按ESC键取消所有选择

## 6. 图片状态样式

### 6.1 默认状态
- **边框**：无边框
- **背景**：透明背景
- **悬停效果**：轻微的背景色变化和缩放效果

### 6.2 选中状态
- **边框**：显示外边框，使用主题色
- **背景**：信息区域背景变为主题色浅色
- **序号样式**：序号标签变为主题色背景，白色文字
- **文字样式**：标题和尺寸文字变为主题色
- **图标隐藏**：选中时不显示中间的勾选图标
- **视觉反馈**：通过边框和信息区域颜色变化指示选中状态

### 6.3 多选状态
- **增强效果**：选中效果更加明显
- **模式指示**：显示多选模式提示
- **无编号显示**：不显示选择顺序编号，保持界面简洁

## 7. 交互功能

### 7.1 图片管理功能

#### 添加图片
- **添加按钮**：添加图片的卡片放在图片卡片的最后面
- **点击触发**：点击添加卡片触发图片选择对话框
- **文件支持**：支持常见图片格式（JPG、PNG、GIF、WebP等）
- **批量上传**：支持一次选择多张图片

#### 删除图片
- **悬停显示**：鼠标悬浮到图片上时，右上角显示"×"图标
- **删除确认**：点击删除图标时显示确认对话框
- **文件处理**：确认删除后，图片从本地文件夹移动到废纸篓
- **状态更新**：删除后立即更新界面显示

### 7.2 键盘导航
- **Tab键**：支持Tab键在图片间导航
- **方向键**：支持方向键选择图片
- **Enter键**：支持Enter键选择/取消选择
- **Space键**：支持Space键选择/取消选择
- **Shift键**：按住Shift键激活多选模式

### 7.3 右键菜单功能
- **右键菜单**：为每张图片添加右键菜单功能
- **菜单项**：提供"在 Finder 中显示"（Mac）或"在文件夹中显示"（Windows）选项
- **文件定位**：快速定位图片文件在系统中的位置
- **平台适配**：根据操作系统显示相应的菜单文字

## 8. 样式规范

### 8.1 颜色使用
- **主题色**：使用Radix颜色令牌
- **选中状态**：使用主题色作为边框颜色
- **悬停效果**：使用半透明背景色
- **文本颜色**：遵循主题文本颜色规范

### 8.2 圆角和阴影
- **卡片圆角**：使用8px圆角
- **图片圆角**：使用4px圆角
- **阴影效果**：选中状态添加轻微阴影
- **过渡动画**：状态变化使用0.2s ease过渡

### 8.3 间距规范
- **卡片间距**：卡片之间保持12px间距
- **内边距**：卡片内边距为8px
- **信息间距**：序号、标题和尺寸信息之间保持适当间距

## 9. 响应式设计

### 9.1 断点设置
- **移动端**：< 768px，单列布局
- **平板端**：768px - 1024px，双列布局
- **桌面端**：> 1024px，多列布局

### 9.2 自适应调整
- **列数调整**：根据容器宽度自动调整列数
- **图片尺寸**：保持图片宽高比，自适应容器
- **间距调整**：不同屏幕尺寸下调整合适的间距

## 10. 数据格式

### 10.1 图片数据结构
```javascript
{
    id: "图片唯一ID",
    title: "图片标题",           // 优先使用
    name: "图片名称",            // 备选
    url: "图片URL",
    thumbnail: "缩略图URL",
    width: 300,                 // 图片宽度
    height: 200,                // 图片高度
    size: "300×200",            // 尺寸字符串（备选）
    fileSize: 1024000,          // 文件大小（字节）
    memorySize: 240000,         // 内存占用（字节，基于RGBA计算）
    aspectRatio: 1.5,           // 宽高比
    isTargetSize: true,         // 是否为目标尺寸
    uploadTime: "2024-01-01T00:00:00Z",
    isSelected: false
}
```

### 10.2 选择状态管理
```javascript
{
    selectedImageIndexes: Set,  // 选中的图片索引Set
    isMultiSelectMode: false,   // 多选模式标志
    lastSelectedIndex: 0        // 最后选中的图片索引（用于连续选择）
}
```

## 11. 内存占用计算

### 11.1 计算原理
- **基础公式**：内存占用 = 宽度 × 高度 × 颜色通道数
- **默认通道**：使用RGBA格式，每个像素占用4个字节
- **计算示例**：800×800像素的图片 = 800 × 800 × 4 = 2,560,000字节 ≈ 2.4MB

### 11.2 显示格式
- **格式**：`宽度×高度 (内存大小)`
- **示例**：`800×800 (2.4 MB)`
- **单位**：自动选择合适的单位（B, KB, MB, GB）

### 11.3 技术实现
```javascript
calculateImageMemory(width, height, channels = 4) {
    const pixelCount = width * height;
    const bytesPerPixel = channels;
    const totalBytes = pixelCount * bytesPerPixel;
    return totalBytes;
}
```

## 12. 右键菜单技术实现

### 12.1 后端 API 实现
- **文件**: `hanli-app/main.js`
- **功能**: 添加了 `show-file-in-finder` IPC 处理函数
- **实现**: 使用 Electron 的 `shell.showItemInFolder()` API
- **平台支持**: macOS、Windows、Linux

### 12.2 前端 API 接口
- **文件**: `hanli-app/preload.js`
- **功能**: 在 `fileAPI` 中添加了 `showInFinder` 方法
- **调用方式**: `window.electronAPI.fileAPI.showInFinder(filePath)`

### 12.3 右键菜单组件实现
- **文件**: `hanli-app/renderer/components/Detail/ImageSelection.js`
- **方法**:
  - `showContextMenu()`: 显示右键菜单
  - `hideContextMenu()`: 隐藏右键菜单
  - `showInFinder()`: 调用 API 显示文件

### 12.4 样式实现
- **文件**: `hanli-app/renderer/globals.css`
- **样式类**: `.context-menu` 和 `.context-menu-item`
- **特性**: 支持主题切换、毛玻璃效果、悬停动画

## 13. API 接口

### 13.1 初始化
```javascript
const imageSelection = new ImageSelection();
imageSelection.init(
    container, 
    images, 
    (selectedImage, selectedIndex, selectedImages) => {
        // 处理选择变化
        console.log('单选结果:', selectedImage, selectedIndex);
        console.log('多选结果:', selectedImages);
    }
);
```

### 13.2 回调函数参数
- `selectedImage`: 单选模式下的选中图片对象（向后兼容）
- `selectedIndex`: 单选模式下的选中图片索引（向后兼容）
- `selectedImages`: 所有选中图片的数组，包含 `{image, index}` 对象

### 13.3 主要方法
```javascript
// 获取当前选中的图片（单选模式兼容）
const selectedImage = imageSelection.getSelectedImage();

// 获取当前选中的图片索引（单选模式兼容）
const selectedIndex = imageSelection.getSelectedIndex();

// 获取所有选中的图片
const selectedImages = imageSelection.getSelectedImages();

// 获取选中的图片数量
const count = imageSelection.getSelectedCount();

// 设置选择状态（单选模式兼容）
imageSelection.setSelection(index);

// 设置多选状态
imageSelection.setMultiSelection([0, 2, 4]);

// 清除所有选择
imageSelection.clearSelection();

// 销毁组件
imageSelection.destroy();
```

## 14. 事件系统

### 14.1 自定义事件
- **imageSelect**：图片选择事件
- **imageDeselect**：图片取消选择事件
- **imageDelete**：图片删除事件
- **imageAdd**：图片添加事件
- **selectionChange**：选择状态变化事件

### 14.2 事件数据格式
```javascript
// 图片选择事件
{
    type: 'imageSelect',
    detail: {
        imageId: '图片ID',
        image: 图片对象,
        selectedImages: [所有选中的图片对象],
        selectionMode: 'single|multiple'
    }
}
```

## 15. 性能优化

### 15.1 图片加载
- **懒加载**：图片进入可视区域时才开始加载
- **占位符**：加载过程中显示占位符
- **错误处理**：图片加载失败时显示错误占位符
- **自动尺寸检测**：图片加载完成后自动更新尺寸信息

### 15.2 渲染优化
- **事件委托**：使用事件委托减少监听器数量
- **防抖处理**：搜索和筛选操作使用防抖
- **批量更新**：批量操作时减少DOM更新次数
- **内存管理**：及时清理不需要的图片资源

## 16. 无障碍支持

### 16.1 键盘导航
- **Tab键**：支持Tab键在图片间导航
- **方向键**：支持方向键选择图片
- **Enter键**：支持Enter键选择/取消选择
- **Space键**：支持Space键选择/取消选择
- **Shift键**：按住Shift键激活多选模式

### 16.2 屏幕阅读器
- **alt属性**：为每张图片提供有意义的alt属性
- **aria-label**：为交互元素提供aria-label
- **role属性**：为组件设置合适的role属性
- **状态提示**：选择状态变化时提供语音提示

## 17. 错误处理

### 17.1 图片加载错误
- **错误占位符**：显示图片加载失败的占位符
- **重试机制**：提供重试加载的选项
- **错误提示**：显示友好的错误提示信息

### 17.2 操作错误
- **删除确认**：删除操作需要用户确认
- **权限检查**：检查文件操作权限
- **错误反馈**：操作失败时提供明确的错误反馈

## 18. 最佳实践

### 18.1 组件设计
- **单一职责**：组件专注于图片展示和选择功能
- **可复用性**：设计为可复用的通用组件
- **可配置性**：支持通过props配置不同行为
- **向后兼容**：保持API的向后兼容性

### 17.2 性能考虑
- **图片优化**：使用适当的图片格式和尺寸
- **内存管理**：及时清理不需要的图片资源
- **事件处理**：合理使用事件委托减少监听器数量
- **渲染优化**：避免不必要的DOM操作

### 17.3 用户体验
- **加载反馈**：提供清晰的加载状态反馈
- **操作反馈**：操作后提供明确的视觉反馈
- **错误处理**：友好的错误提示和恢复机制
- **键盘支持**：完整的键盘导航支持

## 18. 测试建议

### 18.1 功能测试
- [ ] 图片显示和布局
- [ ] 单选和多选功能
- [ ] 框选和连续选择
- [ ] 添加和删除图片
- [ ] 键盘导航支持
- [ ] 图片信息显示
- [ ] 选择状态管理

### 18.2 性能测试
- [ ] 大量图片的渲染性能
- [ ] 图片加载性能
- [ ] 内存使用情况
- [ ] 滚动性能
- [ ] 选择操作的响应速度

### 18.3 兼容性测试
- [ ] 不同浏览器兼容性
- [ ] 不同屏幕尺寸适配
- [ ] 不同图片格式支持
- [ ] 无障碍功能测试

## 19. 扩展开发

### 19.1 功能扩展
- **图片编辑**：添加图片编辑功能
- **图片排序**：支持拖拽排序
- **图片分类**：支持图片分类管理
- **图片搜索**：添加图片搜索功能
- **批量操作**：支持批量编辑、移动等操作

### 19.2 样式定制
- **主题支持**：支持多种主题样式
- **布局定制**：支持不同的布局模式
- **动画效果**：添加更多动画效果
- **自定义样式**：支持自定义CSS变量

## 20. 使用示例

### 20.1 基本使用
```javascript
// 初始化图片选择组件
const imageSelection = new ImageSelection();
imageSelection.init(container, images, (selectedImage, selectedIndex, selectedImages) => {
    if (selectedImages.length > 1) {
        console.log(`选择了 ${selectedImages.length} 张图片`);
        selectedImages.forEach((item, index) => {
            console.log(`第 ${index + 1} 张:`, item.image.title, `(${item.image.width}×${item.image.height})`);
        });
    } else if (selectedImage) {
        console.log(`选择了单张图片: ${selectedImage.title}`);
    } else {
        console.log('没有选择任何图片');
    }
});
```

### 20.2 高级使用
```javascript
// 监听选择变化
imageSelection.init(container, images, (singleImage, singleIndex, allSelected) => {
    // 更新UI状态
    updateSelectionUI(allSelected);
    
    // 处理选择逻辑
    if (allSelected.length > 0) {
        enableBatchOperations();
    } else {
        disableBatchOperations();
    }
});

// 程序化选择
imageSelection.setMultiSelection([0, 2, 4]); // 选择索引为 0, 2, 4 的图片

// 获取选择状态
const selectedCount = imageSelection.getSelectedCount();
const selectedImages = imageSelection.getSelectedImages();
```

### 20.3 连续选择使用示例
```javascript
// 连续选择功能演示
// 1. 先选择图片2（索引1）
imageSelection.setSelection(1);

// 2. 按住Shift选择图片6（索引5）
// 组件会自动选中图片2-6（索引1-5）的所有图片

// 3. 再次按住Shift选择图片8（索引7）
// 组件会选中图片6-8（索引5-7）的所有图片

// 连续选择的特点：
// - 自动计算起始和结束位置
// - 无论点击顺序如何，都会选中正确的范围
// - 支持多次连续选择操作
```

## 22. 右键菜单使用方法

### 22.1 基本使用
1. 在产品详情页面的图片选择区域
2. 右键点击任意图片
3. 选择"在 Finder 中显示"（Mac）或"在文件夹中显示"（Windows）

### 22.2 平台适配
- **macOS**: 显示"在 Finder 中显示"
- **Windows**: 显示"在文件夹中显示"
- **Linux**: 显示"在文件夹中显示"

### 22.3 注意事项
1. 文件路径需要正确传递，如果路径为空或无效，会显示错误信息
2. 右键菜单会在点击其他地方时自动隐藏
3. 菜单样式会根据当前主题自动适配
4. 所有组件都支持键盘和鼠标操作

## 23. 总结

ImagesCard 组件是产品库中重要的图片管理组件，通过合理的交互设计和性能优化，为用户提供了直观、高效的图片管理体验。组件支持多种选择模式，具备丰富的图片信息显示，遵循了项目的设计规范，具备良好的可扩展性和可维护性。

主要特性包括：
- 完整的图片信息显示（序号、标题、尺寸）
- 多种选择模式（单选、多选、框选、连续选择）
- 右键菜单功能（快速定位文件）
- 响应式布局和自适应设计
- 完整的键盘导航支持
- 优秀的性能优化
- 良好的无障碍支持
- 向后兼容的API设计