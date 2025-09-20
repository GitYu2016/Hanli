# UI规范设计文档

## 整体布局结构

### 布局原则
应用采用**上、下左、下右**的三区域布局结构，确保良好的用户体验和功能分区。

## 倒角标准规范

### 倒角变量定义
在 `hanli-app/renderer/theme/light/colors.css` 和 `hanli-app/renderer/theme/dark/colors.css` 中定义了以下CSS变量：

```css
/* 倒角标准 */
--radius-small: 6px;    /* 小元素：按钮、输入框、标签等 */
--radius-medium: 8px;   /* 中等元素：卡片、容器、弹窗等 */
--radius-large: 12px;   /* 大元素：页面容器、侧边栏等 */
```

**注意**: 当前项目中倒角变量已统一使用，但具体的CSS变量定义位置在组件的StyleManager中管理，而不是在主题颜色文件中。

### 使用规范

#### 小元素 (6px)
适用于：
- 按钮
- 输入框
- 标签
- 小图标容器
- 进度条
- 开关按钮

```css
.button {
    border-radius: var(--radius-small);
}
```

#### 中等元素 (8px)
适用于：
- 卡片
- 容器
- 弹窗
- 模态框
- 表单组
- 导航项

```css
.card {
    border-radius: var(--radius-medium);
}
```

#### 大元素 (12px)
适用于：
- 页面容器
- 侧边栏
- 主内容区域
- 大型组件容器

```css
.page-container {
    border-radius: var(--radius-large);
}
```

### 实施情况

#### 已统一的文件
- ✅ `hanli-app/renderer/globals.css` - 主样式文件
- ✅ `hanli-plugin/content.js` - 插件内容脚本
- ✅ `hanli-plugin/components/CollectionProgressDialog.js` - 采集进度对话框
- ✅ `hanli-plugin/collectionManager.js` - 采集管理器
- ✅ `hanli-plugin/main.js` - 插件主文件
- ✅ `hanli-plugin/popup.html` - 插件弹窗
- ✅ `hanli-plugin/mediaManager.js` - 媒体管理器

#### 替换规则
- 2px, 3px, 4px → `var(--radius-small)` (6px)
- 6px → `var(--radius-small)` (6px)
- 8px → `var(--radius-medium)` (8px)
- 12px, 16px, 24px → `var(--radius-large)` (12px)

### 倒角标准优势

1. **一致性**：所有元素使用统一的倒角标准
2. **可维护性**：通过CSS变量轻松调整全局倒角
3. **响应式**：可以根据不同主题调整倒角值
4. **可读性**：代码更清晰，意图更明确

### 注意事项

1. 新增元素时请使用CSS变量而不是硬编码值
2. 特殊情况下需要自定义倒角时，请添加注释说明原因
3. 保持与设计系统的其他规范（颜色、间距等）的一致性

### 示例

```css
/* ✅ 正确用法 */
.my-button {
    border-radius: var(--radius-small);
}

.my-card {
    border-radius: var(--radius-medium);
}

.my-container {
    border-radius: var(--radius-large);
}

/* ❌ 避免硬编码 */
.my-button {
    border-radius: 6px; /* 不推荐 */
}
```

### 布局结构图
```
┌─────────────────────────────────────┐
│              TopBar                 │  ← 上区域
├─────────────┬───────────────────────┤
│   SideBar   │    PageContainer      │  ← 下左 + 下右区域
│             │                       │
│             │                       │
└─────────────┴───────────────────────┘
```

### 区域说明

#### 1. 上区域 - TopBar
- **高度**: 56px
- **功能**: 应用标题、标签页管理、设置入口
- **布局**: 左(LOGO) + 中(TopBarTabs) + 右(设置图标)
- **特点**: 
  - 无背景色、阴影、分割线
  - 支持Electron/浏览器环境不同padding
  - 使用相对定位，参与正常文档流

#### 2. 下左区域 - SideBar
- **宽度**: 默认220px，可调整200px-320px
- **功能**: 导航菜单、页面分组
- **特点**:
  - 支持拖拽调整宽度
  - 响应式设计（窄屏幕时自动收起）
  - 支持滚动
  - 使用相对定位，参与正常文档流

#### 3. 下右区域 - PageContainer
- **功能**: 页面内容显示区域
- **特点**:
  - 大倒角设计
  - 主题适配背景色
  - 填充剩余空间
  - 支持内容滚动

## CSS布局实现

### 主容器样式
```css
.home-page {
  display: flex;
  flex-direction: column; /* 垂直布局：TopBar在上，main-layout在下 */
  height: 100vh;
}
```

### 主内容区域样式
```css
.main-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
  flex-direction: row; /* 水平布局：下左(SideBar) + 下右(PageContainer) */
}
```

### 组件定位规范
- **TopBar**: `position: relative` + `flex-shrink: 0`
- **SideBar**: `position: relative` + `flex-shrink: 0`
- **PageContainer**: `flex: 1` + `overflow: hidden`

## 响应式设计

### 桌面端 (≥769px)
- 标准三区域布局
- SideBar可调整宽度
- 所有功能完全可用

### 平板端 (481px-768px)
- 保持三区域布局
- SideBar宽度适当调整
- 优化触摸交互

### 移动端 (≤480px)
- 布局调整为：上(TopBar) + 中(SideBar) + 下(PageContainer)
- SideBar自动收起
- 优化移动端交互

## 主题适配

### 颜色变量
```css
/* 浅色主题 */
--color-background: #ffffff;
--color-foreground: #000000;
--color-sidebar-background: #f8f9fa;
--color-page-container-background: rgba(255, 255, 255, 0.8);

/* 深色主题 */
--color-background: #000000;
--color-foreground: #ffffff;
--color-sidebar-background: #1a1a1a;
--color-page-container-background: rgba(0, 0, 0, 0.8);
```

### 主题切换
- 支持系统主题跟随
- 支持手动切换浅色/深色主题
- 所有颜色使用CSS变量，确保主题一致性

## 测试页面布局

### 测试页面结构
所有测试页面都遵循相同的布局规范：

1. **HomePage测试** (`/test/homepage`)
   - 使用完整的HomePage组件
   - 展示真实的三区域布局

2. **SideBar测试** (`/test/sidebar`)
   - 上：模拟TopBar区域
   - 下左：真实SideBar组件
   - 下右：测试说明和状态

3. **TopBar测试** (`/test/topbar`)
   - 上：真实TopBar组件
   - 下左：模拟SideBar区域
   - 下右：测试说明和交互控件

### 测试页面特点
- 所有测试页面使用内联样式，避免复杂导入
- 支持主题适配和响应式设计
- 提供完整的功能测试和说明

## 开发规范

### 组件开发
1. 所有组件使用相对定位，参与正常文档流
2. 避免使用 `position: fixed` 或 `position: absolute`
3. 使用 `flex-shrink: 0` 防止组件被压缩
4. 所有颜色使用CSS变量，支持主题切换

### 样式管理
1. 全局样式定义在 `styles/global.css`
2. 颜色定义在 `styles/colors.css`
3. 组件样式使用独立的CSS文件
4. 避免CSS-in-JS，优先使用CSS文件

### 测试规范
1. 每个组件都有对应的测试页面
2. 测试页面使用内联样式，避免导入问题
3. 测试页面包含功能说明和状态显示
4. 所有测试页面遵循统一的布局规范

## 组件样式规范

### 通用样式规范

#### Padding规范
- **组件容器**: 根据组件功能确定合适的padding值
- **内容区域**: 避免过度使用padding，保持内容紧凑
- **交互元素**: 确保足够的点击区域，建议最小44px

#### 背景色规范
- **正常状态**: 透明度为0的背景色（完全透明）
- **悬浮状态**: 透明度很浅的背景色 `rgba(0, 0, 0, 0.05)`
- **选中状态**: 透明度较浅的背景色 `rgba(0, 0, 0, 0.1)`
- **深色主题**: 使用白色透明度替代黑色透明度

#### 圆角设计
- **小圆角**: 4px - 用于按钮、输入框等小元素
- **中圆角**: 6px - 用于卡片、列表项等中等元素
- **大圆角**: 12px - 用于Tab、主要容器等大元素
- **超大圆角**: 16px - 用于页面容器等特殊元素

#### 过渡动画
- **快速过渡**: 0.15s ease - 用于hover、focus等快速交互
- **标准过渡**: 0.2s ease - 用于一般状态变化
- **慢速过渡**: 0.3s ease - 用于主题切换、布局变化等

### 组件特定规范

#### SideBar组件
- **容器padding**: 左右10px
- **项目padding**: 左右12px
- **内容区域**: 无padding，使用背景色区分状态
- **圆角**: 6px
- **背景色**: 使用透明度递增的黑色/白色

#### TopBarTabs组件
- **容器**: 无max-width限制，使用全部可用宽度
- **Tab间距**: 6px
- **圆角**: 12px
- **过渡**: 2s ease-in-out（宽度变化）

#### PageContainer组件
- **圆角**: 16px
- **背景色**: 使用colors.css中定义的主题色
- **无margin/padding**: 完全填充父容器

### 颜色系统规范

#### 颜色系统架构
基于Radix颜色令牌设计，采用层次化颜色架构：

1. **基础颜色令牌** (Base Color Tokens)
   - 中性色系：从纯白到纯黑的11个层级
   - 透明度级别：0-100%的11个透明度级别
   - 为所有颜色提供基础支撑

2. **语义化颜色** (Semantic Colors)
   - 表面颜色：背景层次系统
   - 文本颜色：层次化文本系统
   - 边框颜色：层次化边框系统
   - 交互颜色：状态反馈系统

3. **功能颜色** (Functional Colors)
   - 品牌色：主色调和次要色调
   - 状态色：成功、警告、错误、信息色

4. **组件专用颜色** (Component Colors)
   - 卡片、模态框、输入框、标签页等组件专用颜色

#### 颜色定义位置
- **浅色主题**：`hanli-app/renderer/theme/light/colors.css`
- **深色主题**：`hanli-app/renderer/theme/dark/colors.css`
- **图标系统**：`hanli-app/renderer/icons-fixed.css`
- **组件样式**：通过StyleManager在JavaScript中管理，使用CSS-in-JS方式
- 组件CSS文件不定义颜色，只使用CSS变量
- 支持浅色、深色、系统主题三种模式

#### 颜色命名规范
- **基础色**：`--color-neutral-{level}` (0-1000)
- **透明度**：`--opacity-{level}` (0-100)
- **表面色**：`--color-surface-{type}` (primary, secondary, tertiary, elevated, overlay)
- **文本色**：`--color-text-{type}` (primary, secondary, tertiary, disabled, inverse)
- **边框色**：`--color-border-{type}` (primary, secondary, subtle, strong)
- **交互色**：`--color-interactive-{state}` (hover, active, focus, selected, disabled)
- **品牌色**：`--color-brand-{type}` (primary, secondary, 及其变体)
- **状态色**：`--color-status-{type}` (success, warning, error, info, 及其变体)
- **组件色**：`--color-{component}-{property}` (card-background, modal-overlay等)
- **图标色**：`--color-icon-{type}` (primary, secondary, hover, active, disabled, background)

#### 图标颜色规范
- **实现方式**：使用本地SVG文件，通过CSS类名控制颜色
- **颜色变量**：使用`--color-primary`、`--color-secondary`等语义化变量
- **透明度标准**：统一使用`opacity: 0.8` (80%) 透明度
- **状态变化**：支持hover、active、disabled等状态
- **主题适配**：自动适配浅色/深色主题
- **图标库**：使用Phosphor Icons本地化方案
- **文件位置**：`hanli-app/renderer/components/Common/Icon.js`

#### 半透明色规范（核心规范）
- **强制使用半透明色**：所有颜色必须使用半透明色（RGBA格式）
- **禁止纯色**：禁止使用纯色（如 `#ffffff`、`#000000`）
- **透明度标准**：
  - 浅色主题：使用黑色半透明 `rgba(0, 0, 0, var(--opacity-{level}))`
  - 深色主题：使用白色半透明 `rgba(255, 255, 255, var(--opacity-{level}))`
  - 彩色背景：使用8%-12%透明度
- **背景色规范**：
  - 浅色主题背景色：`rgba(颜色, 0.08)`
  - 深色主题背景色：`rgba(颜色, 0.12)`
  - 页面容器背景：比主背景色透明度高4%

#### 背景色主题变体
支持多种背景色主题变体：
- **默认背景**：`.bg-default`
- **海洋蓝背景**：`.bg-blue`
- **森林绿背景**：`.bg-green`
- **紫罗兰背景**：`.bg-purple`
- **夕阳橙背景**：`.bg-orange`
- **樱花粉背景**：`.bg-pink`
- **石墨灰背景**：`.bg-gray`
- **靛青背景**：`.bg-indigo`

#### 阴影系统
- **基础阴影**：`--shadow-{size}` (xs, sm, md, lg, xl, 2xl)
- **特殊阴影**：`--shadow-hover`、`--shadow-modal`、`--shadow-focus`
- **主题适配**：浅色主题使用黑色半透明，深色主题使用黑色半透明

#### 圆角系统
- **基础圆角**：`--radius-{size}` (none, xs, sm, md, lg, xl, 2xl, full)
- **语义化圆角**：`--radius-{component}` (button, input, card, modal)
- **兼容性变量**：`--radius-small`、`--radius-medium`、`--radius-large`

### 样式管理系统

#### 样式处理方式
- 使用原生CSS + CSS-in-JS混合方案
- 全局样式定义在 `renderer/globals.css`
- 颜色系统定义在 `renderer/theme/light/colors.css` 和 `renderer/theme/dark/colors.css`
- 组件样式通过StyleManager在JavaScript中管理
- 图标样式定义在 `renderer/components/Common/Icon.js`

#### 开发环境
- Electron内置开发模式
- 支持热重载和实时预览
- 支持CSS变量和主题切换
- 使用ES6模块系统

#### 构建优化
- Electron Builder自动优化资源
- 组件样式按需加载
- 生产环境输出优化的静态资源

## 注意事项

1. **布局一致性**: 所有页面都必须遵循三区域布局规范
2. **响应式设计**: 确保在不同屏幕尺寸下都能正确显示
3. **主题适配**: 所有组件都必须支持主题切换
4. **性能优化**: 避免不必要的重排和重绘
5. **可维护性**: 保持代码结构清晰，便于后续维护
6. **样式一致性**: 所有组件都遵循统一的样式规范
