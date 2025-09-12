# 韩立客户端 - 重构后的代码结构

## 文件结构

```
renderer/
├── components/           # 组件目录
│   ├── FolderManager.js  # 文件夹管理组件
│   ├── DataManager.js    # 数据管理组件
│   ├── DetailManager.js  # 详情管理组件
│   └── UIManager.js      # UI管理组件
├── app.js               # 原始应用文件（已弃用）
├── app-refactored.js    # 重构后的主应用文件
├── index.html           # HTML模板
└── styles.css           # 样式文件
```

## 组件说明

### 1. FolderManager.js - 文件夹管理组件
负责所有与文件夹相关的功能：
- 最近文件夹列表管理
- 文件夹选择对话框
- 文件夹切换浮窗
- 文件夹数据持久化

**主要方法：**
- `loadRecentFolders()` - 加载最近文件夹列表
- `addToRecentFolders()` - 添加文件夹到最近列表
- `selectFolder()` - 选择新文件夹
- `confirmFolderSelection()` - 确认文件夹选择

### 2. DataManager.js - 数据管理组件
负责所有与数据加载和列表相关的功能：
- 商品/店铺数据加载
- 列表渲染和过滤
- 菜单类型切换
- 数据刷新

**主要方法：**
- `loadData()` - 加载所有数据
- `loadGoodsData()` - 加载商品数据
- `loadStoresData()` - 加载店铺数据
- `loadCurrentList()` - 加载当前类型列表
- `switchMenuType()` - 切换菜单类型

### 3. DetailManager.js - 详情管理组件
负责项目详情页面的所有功能：
- 项目详情加载和显示
- 文件列表渲染
- 图片预览
- 详情页面交互

**主要方法：**
- `selectItem()` - 选择项目
- `loadItemDetail()` - 加载项目详情
- `renderDetailContent()` - 渲染详情内容
- `previewImage()` - 预览图片

### 4. UIManager.js - UI管理组件
负责所有UI相关的功能：
- 页面切换和显示
- 侧边栏控制
- 搜索功能
- 浮窗管理
- 键盘快捷键

**主要方法：**
- `showFolderSelection()` - 显示文件夹选择页面
- `showMainApp()` - 显示主应用页面
- `toggleSidebar()` - 切换侧边栏
- `handleSearch()` - 处理搜索
- `toggleFolderPopup()` - 切换文件夹浮窗

## 重构优势

### 1. 代码组织
- **模块化**：每个组件负责特定的功能领域
- **单一职责**：每个组件只处理相关的功能
- **易于维护**：代码结构清晰，便于定位和修改

### 2. 可维护性
- **低耦合**：组件之间通过主应用类进行通信
- **高内聚**：相关功能集中在同一个组件中
- **易于测试**：每个组件可以独立测试

### 3. 可扩展性
- **新功能**：可以轻松添加新的组件
- **功能修改**：修改某个功能只需要修改对应组件
- **代码复用**：组件可以在其他地方复用

### 4. 开发效率
- **并行开发**：不同开发者可以同时开发不同组件
- **调试方便**：问题定位更加精确
- **代码阅读**：新开发者更容易理解代码结构

## 使用方式

1. **启动应用**：应用会自动加载重构后的代码
2. **功能不变**：所有原有功能保持不变
3. **性能提升**：代码结构更清晰，运行效率更高

## 迁移说明

- 原始 `app.js` 文件保留作为备份
- 新代码使用 `app-refactored.js`
- HTML 文件已更新为使用新的模块化代码
- 所有功能保持完全兼容

## 未来扩展

可以继续添加更多组件：
- `SettingsManager.js` - 设置管理
- `ThemeManager.js` - 主题管理
- `NotificationManager.js` - 通知管理
- `ExportManager.js` - 导出管理
