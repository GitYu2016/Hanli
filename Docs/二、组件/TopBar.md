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
- 搜索图标
- TopBarTabs（Tab标签页）

## 5. 右区域
- 设置图标 (ph-sliders)

## 6. 图标系统

### 搜索图标
- **图标类型**：`ph-magnifying-glass`（放大镜图标）
- **图标大小**：16px
- **图标颜色**：使用 `--color-primary` 变量，自动适配主题
- **悬停效果**：背景色变化 + 轻微缩放 (scale 1.05)
- **点击效果**：按下时缩小 (scale 0.95)
- **点击功能**：打开搜索弹窗
- **位置**：位于Tab区域左侧
- **图标实现**：通过 `Icon.js` 组件渲染

### 设置图标
- **图标类型**：`ph-gear`（齿轮图标）
- **图标大小**：20px
- **图标颜色**：使用 `--color-primary` 变量，自动适配主题
- **悬停效果**：背景色变化 + 轻微缩放
- **点击功能**：打开设置弹窗
- **图标实现**：通过 `Icon.js` 组件渲染

## 7. 搜索功能

### 7.1 搜索弹窗
- **触发方式**：点击搜索图标
- **弹窗位置**：屏幕中央，带遮罩层
- **弹窗大小**：最大宽度600px，最大高度80vh
- **响应式设计**：支持移动端适配

### 7.2 搜索输入
- **输入框**：带搜索图标的输入框
- **占位符**：输入产品名称、ID或关键词...
- **实时搜索**：输入时实时显示搜索结果
- **键盘支持**：
  - 回车键：执行搜索
  - ESC键：关闭弹窗

### 7.3 搜索结果
- **搜索范围**：产品ID、产品名称、产品分类、英文标题
- **结果限制**：最多显示10个搜索结果
- **结果格式**：产品图片、标题、ID、价格
- **结果交互**：点击结果项可打开产品详情页

### 7.4 搜索结果导航逻辑
当用户点击搜索结果中的产品时：

1. **检查Tab状态**：检查当前是否已打开该产品的详情Tab
2. **Tab已存在**：
   - 切换到现有的产品详情Tab
   - 更新Tab状态和渲染
   - 触发Tab切换事件
3. **Tab不存在**：
   - 创建新的产品详情Tab
   - 加载产品详情数据
   - 切换到新创建的Tab

### 7.5 搜索数据源
- **主要数据源**：从API获取真实产品数据 (`http://localhost:3001/api/products`)
- **降级处理**：API失败时使用模拟数据
- **搜索字段**：
  - `goodsId`：产品ID
  - `goodsTitleEn`：英文标题
  - `goodsCat3`：产品分类
  - `goodsTitle`：中文标题

### 7.6 搜索组件架构
```
TopBar → SearchModal → 搜索结果 → 产品详情页
   ↓         ↓           ↓
搜索图标   搜索弹窗    点击导航
```

## 8. 移除功能
- **更多菜单**：移除了右上角的三个点菜单
- **菜单功能**：移除了新建产品、导入、导出等功能入口
- **界面简化**：只保留设置图标，界面更加简洁

## 9. Tab功能实现

### 9.1 Tab功能流程
```
Tab点击 → TopBar.switchTab() → TabManager.onTabSwitch() → 触发tabSwitch事件 → HomePage.handleTabSwitch() → 渲染页面内容
```

### 9.2 核心方法

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

### 9.3 事件处理

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

### 9.4 页面内容渲染

当Tab切换时，`handleTabSwitch`方法会：
1. 更新侧边栏状态
2. 调用`renderPageContent`渲染对应页面
3. 管理产品总数刷新定时器

### 9.5 键盘快捷键支持

- **Ctrl+W**: 关闭当前Tab
- **Ctrl+Tab**: 切换到下一个Tab
- **Ctrl+Shift+Tab**: 切换到上一个Tab

### 9.6 Tab类型和图标

| Tab类型 | 图标 | 说明 |
|---------|------|------|
| home | `ph-house` | 首页 |
| goodsList | `ph-package` | 产品库 |
| productDetail | `ph-image` | 产品详情 |

## 备注
- Tab功能已完全实现并集成到组件化架构中
- 支持动态创建、切换、关闭Tab
- 具备完整的键盘快捷键支持
- 与侧边栏导航和页面内容渲染完全集成
