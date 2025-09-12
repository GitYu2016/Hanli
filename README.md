# 韩立商品数据管理系统

一个基于 Electron 的桌面应用和 Chrome 浏览器插件，用于商品数据采集、管理和监控。

## 📋 项目概述

韩立商品数据管理系统是一个完整的商品数据解决方案，包含桌面客户端和浏览器插件两个部分：

- **hanli-app**: Electron 桌面应用，提供商品管理和数据监控功能
- **hanli-plugin**: Chrome 浏览器插件，用于采集 Temu 等电商平台的商品数据

## 🚀 功能特性

### 桌面应用 (hanli-app)
- 📦 **商品管理**: 商品信息录入、编辑、删除
- 🖼️ **图片管理**: 支持多种图片格式，拖拽上传，批量操作
- 📊 **数据监控**: 实时数据图表展示，趋势分析
- 🎨 **主题切换**: 支持明暗主题切换
- 📱 **响应式设计**: 适配不同屏幕尺寸

### 浏览器插件 (hanli-plugin)
- 🔍 **智能采集**: 自动识别商品页面元素
- 📸 **图片采集**: 批量下载商品图片
- 📝 **文本提取**: 提取商品标题、价格、描述等信息
- 🎯 **精准定位**: 支持 CSS 选择器和 XPath 定位
- 📊 **数据清洗**: 自动格式化采集的数据

## 🛠️ 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **桌面应用**: Electron
- **浏览器插件**: Chrome Extension Manifest V3
- **数据存储**: 本地 JSON 文件
- **UI 组件**: 自定义组件库
- **构建工具**: Electron Builder

## 📁 项目结构

```
hanli-master/
├── hanli-app/                 # Electron 桌面应用
│   ├── main.js               # 主进程入口
│   ├── preload.js            # 预加载脚本
│   ├── package.json          # 应用依赖配置
│   ├── renderer/             # 渲染进程
│   │   ├── index.html        # 主页面
│   │   ├── app.js           # 主应用逻辑
│   │   ├── styles.css       # 样式文件
│   │   └── components/       # UI 组件
│   │       ├── TopBar.js
│   │       ├── ImageGallery.js
│   │       ├── SettingsModal.js
│   │       └── ...
│   └── data/                 # 数据存储目录
├── hanli-plugin/             # Chrome 浏览器插件
│   ├── manifest.json         # 插件配置
│   ├── background.js         # 后台脚本
│   ├── content.js           # 内容脚本
│   ├── popup.html           # 插件弹窗
│   └── icons/               # 插件图标
├── project-docs/             # 项目文档
│   ├── 产品库模块/
│   ├── 采集模块/
│   └── 监控模块/
└── README.md                 # 项目说明
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0
- Chrome 浏览器 (用于插件)

### 安装依赖

```bash
# 安装桌面应用依赖
cd hanli-app
npm install

# 安装插件依赖 (如果有)
cd ../hanli-plugin
npm install
```

### 运行应用

```bash
# 启动桌面应用
cd hanli-app
npm start

# 开发模式
npm run dev
```

### 安装浏览器插件

1. 打开 Chrome 浏览器
2. 进入 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `hanli-plugin` 目录

## 📦 构建发布

### 构建桌面应用

```bash
cd hanli-app

# 构建所有平台
npm run build

# 构建特定平台
npm run build:mac    # macOS
npm run build:win    # Windows
npm run build:linux  # Linux
```

### 打包浏览器插件

```bash
cd hanli-plugin
# 将整个目录打包为 .zip 文件
```

## 📖 使用说明

### 桌面应用

1. **商品管理**: 在左侧菜单选择商品，右侧查看和编辑详情
2. **图片上传**: 拖拽图片到上传区域或点击选择文件
3. **数据监控**: 点击监控按钮查看数据图表
4. **设置配置**: 点击设置按钮调整应用配置

### 浏览器插件

1. **安装插件**: 按照上述步骤安装到 Chrome
2. **访问商品页面**: 打开 Temu 等电商网站的商品页面
3. **开始采集**: 点击插件图标，选择采集类型
4. **查看结果**: 采集完成后在桌面应用中查看数据

## 🔧 开发指南

### 代码规范

- 使用 ES6+ 语法
- 组件化开发，所有弹窗都做成独立组件
- 遵循项目 `.cursorrules` 中的规范
- 使用 Radix 颜色令牌
- 主要 div 元素添加 id 或 class 名称

### 组件开发

```javascript
// 组件模板
class MyComponent {
    constructor(app) {
        this.app = app;
        this.isVisible = false;
        this.element = null;
        this.init();
    }

    init() {
        this.createElement();
        this.bindEvents();
    }

    createElement() {
        // 创建 DOM 元素
    }

    bindEvents() {
        // 绑定事件
    }
}
```

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

- 项目维护者: Hanli Team
- 邮箱: [your-email@example.com]

## 🔄 更新日志

### v1.0.0 (2025-01-12)
- ✨ 初始版本发布
- 🎯 完成商品管理基础功能
- 📸 实现图片采集和管理
- 📊 添加数据监控功能
- 🎨 支持主题切换
- 🔧 完成组件化重构

---

**注意**: 本项目仅供学习和研究使用，请遵守相关网站的使用条款。
