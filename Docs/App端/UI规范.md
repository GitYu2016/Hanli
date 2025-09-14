# UI规范设计文档

## 整体布局结构

### 布局原则
应用采用**上、下左、下右**的三区域布局结构，确保良好的用户体验和功能分区。

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

#### 颜色定义位置
- 所有颜色定义统一在 `src/styles/colors.css` 中
- 组件CSS文件不定义颜色，只使用CSS变量
- 支持浅色、深色、系统主题三种模式

#### 颜色命名规范
- `--color-{component}-{property}`: 组件特定颜色
- `--color-{state}`: 通用状态颜色
- 使用语义化命名，便于理解和维护

### Vite + Tailwind CSS 集成

#### 样式处理方式
- 使用Tailwind CSS作为主要样式框架
- 全局样式定义在 `src/styles/global.css`
- 颜色系统定义在 `src/styles/colors.css`
- 组件样式使用Tailwind类名和CSS-in-JS (styled-jsx)

#### 开发环境
- Vite Dev Server提供热更新
- Tailwind CSS JIT模式，按需生成样式
- 支持CSS变量和主题切换

#### 构建优化
- Vite自动优化CSS和JS
- Tailwind CSS PurgeCSS自动移除未使用的样式
- 生产环境输出优化的静态资源

## 注意事项

1. **布局一致性**: 所有页面都必须遵循三区域布局规范
2. **响应式设计**: 确保在不同屏幕尺寸下都能正确显示
3. **主题适配**: 所有组件都必须支持主题切换
4. **性能优化**: 避免不必要的重排和重绘
5. **可维护性**: 保持代码结构清晰，便于后续维护
6. **样式一致性**: 所有组件都遵循统一的样式规范
