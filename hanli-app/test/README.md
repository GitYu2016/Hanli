# 测试文件说明

## 文件夹结构

### components/ - 组件测试
包含各个组件的独立测试文件：

- `test-attachment-card.html` - AttachmentCard组件测试
- `test-button-component.html` - Button组件测试
- `test-chart-display.html` - 图表显示测试
- `test-chart-theme.html` - 图表主题测试
- `test-color-system.html` - 颜色系统测试
- `test-css-to-js.html` - CSS到JS样式系统演示
- `test-icons-showcase.html` - 图标展示测试
- `test-json-preview.html` - JSON预览弹窗测试
- `test-media-card.html` - MediaCard组件测试
- `test-pagination-component.html` - 分页组件测试
- `test-pagination-functionality.html` - 翻页功能完整测试
- `test-pagination-filtered-display.html` - 分页组件筛选显示测试
- `test-product-more-menu.html` - ProductMoreMenu组件测试
- `test-search-modal.html` - SearchModal组件测试
- `test-topbar-tabs.html` - TopBarTabs组件测试

### system/ - 系统功能测试
包含系统级功能的测试文件：

- `test-activity-system.html` - 活动系统测试
- `test-collection-system.html` - 采集系统测试
- `test-trash-functionality.html` - 垃圾箱功能测试
- `test-window-size.html` - 窗口大小测试

### features/ - 功能特性测试
包含特定功能特性的测试文件：

- 暂无文件

## 使用说明

1. 所有测试文件都是独立的HTML文件，可以直接在浏览器中打开
2. 测试文件会引用renderer目录下的组件和样式文件
3. 建议在开发新功能时创建对应的测试文件
4. 测试文件应该包含完整的测试用例和说明

## 清理说明

已清理的重复和过时测试文件：
- 删除了所有debug、fix、simple类型的测试文件
- 删除了重复的分页测试文件
- 删除了过时的产品相关测试文件
- 删除了重复的监控和采集测试文件
- 删除了过时的窗口控制测试文件

从原来的110+个测试文件减少到17个核心测试文件。