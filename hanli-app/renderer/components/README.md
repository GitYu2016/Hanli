# 组件分类说明

本目录按照功能将组件分为以下几个类别：

## 📁 Common（通用组件）
存放通用的、可复用的组件
- `DataManager.js` - 数据管理器
- `FileTypeUtils.js` - 文件类型工具类
- `FolderManager.js` - 文件夹管理器
- `SidebarResizer.js` - 侧边栏调整器
- `TopBar.js` - 顶部栏组件
- `UIManager.js` - UI管理器

## 🖼️ Image（图片相关组件）
存放所有与图片处理相关的组件
- `ImageCardManager.js` - 图片卡片管理器
- `ImageController.js` - 图片控制器
- `ImageDeleteManager.js` - 图片删除管理器
- `ImageGallery.js` - 图片画廊组件
- `ImageManager.js` - 图片管理器
- `ImageSelectionManager.js` - 图片选择管理器
- `ImageSortManager.js` - 图片排序管理器
- `ImageUploadManager.js` - 图片上传管理器

## 📋 Detail（详情相关组件）
存放商品详情和数据展示相关组件
- `DetailManager.js` - 详情管理器
- `GoodsBasicInfo.js` - 商品基本信息组件

## 🪟 Modal（弹窗组件）
存放所有弹窗和模态框组件
- `DebugPopupModal.js` - 调试弹窗
- `GoodsPreviewModal.js` - 商品预览弹窗
- `LogModal.js` - 日志弹窗
- `MonitoringChartsModal.js` - 监控图表弹窗
- `RequirementsModal.js` - 需求文档弹窗
- `SettingsModal.js` - 设置弹窗

## ⚙️ System（系统组件）
存放系统级别的组件（当前为空，预留给未来使用）

## 使用说明

在HTML文件中引用组件时，请使用完整的相对路径：

```html
<!-- Common组件 -->
<script src="components/Common/TopBar.js"></script>

<!-- Image组件 -->
<script src="components/Image/ImageGallery.js"></script>

<!-- Detail组件 -->
<script src="components/Detail/GoodsBasicInfo.js"></script>

<!-- Modal组件 -->
<script src="components/Modal/GoodsPreviewModal.js"></script>
```

## 组件命名规范

- 组件文件名使用PascalCase（大驼峰命名法）
- 组件类名与文件名保持一致
- 每个组件都应该有清晰的职责和功能说明
