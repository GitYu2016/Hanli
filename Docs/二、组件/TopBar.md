# TopBar 需求文档

## 1. 尺寸和布局
- 高度为56px
- 当Electron打开时，左Padding为80px，右Padding为12px
- 当浏览器打开时，左右Padding为12px
- 没有背景色
- 没有阴影、分割线

## 2. 区域划分
TopBar分为左、中、右三个区域。

## 3. 左区域
- LOGO
- 产品库标题

## 4. 中间区域
- TopBarTabs（Tab标签页）

## 5. 右区域
- 设置图标 (ph-sliders)

## 6. 图标系统

### 设置图标
- **图标类型**：`ph-sliders`（滑块图标）
- **图标大小**：20px
- **图标颜色**：跟随主题自动切换
- **悬停效果**：背景色变化 + 轻微缩放
- **点击功能**：打开设置弹窗

### 图标更新
- **旧图标**：`ph-gear`（齿轮图标）- 已移除
- **新图标**：`ph-sliders`（滑块图标）- 更现代直观

## 7. 移除功能
- **更多菜单**：移除了右上角的三个点菜单
- **菜单功能**：移除了新建产品、导入、导出等功能入口
- **界面简化**：只保留设置图标，界面更加简洁

## 8. Tab功能实现

### 8.1 Tab功能流程
```
Tab点击 → TopBar.switchTab() → TabManager.onTabSwitch() → 触发tabSwitch事件 → HomePage.handleTabSwitch() → 渲染页面内容
```

### 8.2 核心方法

#### TopBar组件方法
- **`switchTab(tabId)`**: 切换指定Tab
  - 调用`TabManager.setActiveTab(tabId)`
  - 重新渲染Tab列表
  - 触发`TabManager.onTabSwitch(tab)`

- **`closeTab(tabId)`**: 关闭指定Tab
  - 添加关闭动画效果
  - 调用`TabManager.closeTab(tabId)`
  - 如果关闭的是活动Tab，自动切换到其他Tab

- **`createTabElement(tab)`**: 创建Tab DOM元素
  - 绑定点击事件（切换Tab）
  - 绑定关闭按钮事件
  - 设置Tab样式和图标

#### TabManager类方法
- **`onTabSwitch(tab)`**: 触发Tab切换事件
  - 发送`tabSwitch`自定义事件
  - 供其他组件监听和处理

- **`setActiveTab(tabId)`**: 设置活动Tab
  - 更新Tab状态
  - 管理Tab激活状态

### 8.3 事件处理

#### Tab点击事件
```javascript
tabDiv.addEventListener('click', (e) => {
    if (e.target.closest('.tab-close')) {
        // 点击关闭按钮
        this.closeTab(tab.id);
    } else {
        // 点击Tab内容
        this.switchTab(tab.id);
    }
});
```

#### Tab切换事件监听
```javascript
document.addEventListener('tabSwitch', (event) => {
    const { tab } = event.detail;
    this.handleTabSwitch(tab);
});
```

### 8.4 页面内容渲染

当Tab切换时，`handleTabSwitch`方法会：
1. 更新侧边栏状态
2. 调用`renderPageContent`渲染对应页面
3. 管理产品总数刷新定时器

### 8.5 键盘快捷键支持

- **Ctrl+W**: 关闭当前Tab
- **Ctrl+Tab**: 切换到下一个Tab
- **Ctrl+Shift+Tab**: 切换到上一个Tab

### 8.6 Tab类型和图标

| Tab类型 | 图标 | 说明 |
|---------|------|------|
| home | `ph-house` | 首页 |
| goodsList | `ph-package` | 产品库 |
| productDetail | `ph-info` | 产品详情 |

## 备注
- Tab功能已完全实现并集成到组件化架构中
- 支持动态创建、切换、关闭Tab
- 具备完整的键盘快捷键支持
- 与侧边栏导航和页面内容渲染完全集成
