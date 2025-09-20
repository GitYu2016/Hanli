# SettingsPage 组件

系统设置页面组件，采用左侧菜单导航的布局方式，提供完整的系统设置功能。

## 功能特性

### 左侧菜单导航
- **通用设置**: 外观设置、背景色设置
- **功能设置**: 数据存储路径、清除缓存、自动刷新产品数据、显示采集时间
- **快捷键**: 查看和管理应用快捷键

### 响应式设计
- 支持桌面端和移动端
- 自适应布局，在小屏幕上自动调整

### 主题支持
- 完全支持项目的主题系统
- 自动适配浅色/深色主题
- 支持背景色切换

## 使用方法

### 基本使用

```javascript
// 创建设置页面实例
const settingsPage = new SettingsPage();

// 设置回调函数
settingsPage.setCallbacks({
    onSave: (settings) => {
        console.log('设置已保存:', settings);
    },
    onCancel: () => {
        console.log('设置已取消');
    },
    onThemeChange: (theme) => {
        console.log('主题已更改:', theme);
    },
    onBackgroundColorChange: (bgColor) => {
        console.log('背景色已更改:', bgColor);
    },
    onLanguageChange: (language) => {
        console.log('语言已更改:', language);
    }
});

// 渲染页面
const container = document.getElementById('settings-container');
container.innerHTML = settingsPage.render();

// 绑定事件
settingsPage.bindEvents();

// 加载当前设置
settingsPage.loadCurrentSettings();
```

### 设置管理

```javascript
// 获取当前设置
const currentSettings = settingsPage.getSettings();

// 设置配置
settingsPage.setSettings({
    theme: 'dark',
    language: 'zh-CN',
    autoRefresh: true,
    showCollectTime: true,
    backgroundColor: 'blue'
});

// 保存设置
settingsPage.save();

// 取消更改
settingsPage.cancel();
```

### 区域切换

```javascript
// 切换到指定区域
settingsPage.switchSection('general');    // 通用设置
settingsPage.switchSection('function');   // 功能设置
settingsPage.switchSection('shortcuts');  // 快捷键
```

## 设置项说明

### 通用设置 (general)

| 设置项 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| theme | string | 主题设置 (light/dark/auto) | auto |
| backgroundColor | string | 背景色设置 | default |

### 功能设置 (function)

| 设置项 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| autoRefresh | boolean | 自动刷新产品数据 | true |
| showCollectTime | boolean | 显示采集时间 | true |
| dataPath | string | 数据存储路径 | - |

### 快捷键 (shortcuts)

| 快捷键 | 功能 |
|--------|------|
| ⌘/Ctrl + F | 打开搜索框 |
| ⌘/Ctrl + W | 关闭当前Tab或窗口 |
| ⌘/Ctrl + , | 打开系统设置 |
| ⌘/Ctrl + R | 刷新当前页面 |
| ⌘/Ctrl + N | 新建Tab |

## 依赖组件

- `ThemeManager`: 主题管理
- `ThemeSelector`: 主题选择器
- `BackgroundColorSelector`: 背景色选择器
- `Switch`: 开关组件

## 样式定制

组件使用CSS变量进行样式定制，支持以下变量：

```css
/* 主要颜色 */
--color-primary: 主要文字颜色
--color-secondary: 次要文字颜色
--color-focused: 选中/悬浮状态颜色

/* 背景色 */
--color-background-normal: 默认背景色
--color-background-focused: 选中/悬浮背景色

/* 边框色 */
--color-border-normal: 默认边框色
--color-border-focused: 选中/悬浮边框色

/* 状态色 */
--color-success: 成功状态色
--color-error: 错误状态色
--color-warning: 警告状态色
--color-info: 信息状态色
```

## 事件回调

### onSave
设置保存时的回调函数
```javascript
onSave: (settings) => {
    // settings: 当前所有设置
}
```

### onCancel
设置取消时的回调函数
```javascript
onCancel: () => {
    // 用户取消设置更改
}
```

### onThemeChange
主题更改时的回调函数
```javascript
onThemeChange: (theme) => {
    // theme: 新主题 (light/dark/auto)
}
```

### onBackgroundColorChange
背景色更改时的回调函数
```javascript
onBackgroundColorChange: (bgColor) => {
    // bgColor: 新背景色
}
```


## 数据存储

组件使用 `localStorage` 存储设置：

- `app-theme`: 主题设置
- `app-auto-refresh`: 自动刷新设置
- `app-show-collect-time`: 显示采集时间设置
- `app-background-color`: 背景色设置

## 测试

运行测试页面：
```bash
# 在浏览器中打开
open test/components/test-settings-page.html
```

测试页面提供：
- 完整的设置页面展示
- 主题切换功能
- 设置保存/重置功能
- 实时预览效果

## 注意事项

1. 确保在渲染前已初始化所有依赖组件
2. 组件会自动绑定事件，无需手动绑定
3. 销毁组件时记得调用 `destroy()` 方法清理资源
4. 移动端会自动调整布局，无需额外处理
