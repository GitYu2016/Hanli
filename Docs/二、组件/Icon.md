# Icon 组件

统一的图标组件，使用Phosphor Icons本地化方案，支持多种图标样式和主题适配。

## 功能特性

- **本地化方案**: 使用Phosphor Icons本地SVG文件，无需网络请求
- **多种样式**: 支持regular、bold、fill三种图标样式
- **主题适配**: 自动适配浅色/深色主题
- **颜色控制**: 通过CSS变量控制图标颜色
- **状态支持**: 支持hover、active、disabled等状态
- **尺寸变体**: 支持small、large、xlarge等尺寸
- **动画效果**: 支持旋转、脉冲等动画效果

## 使用方法

### 基本用法

```javascript
// 渲染基础图标
Icon.render('house', { className: 'svg-icon', style: 'bold' })

// 渲染带状态的图标
Icon.render('gear', { 
    className: 'svg-icon', 
    style: 'regular',
    state: 'hover'
})

// 渲染不同尺寸的图标
Icon.render('package', { 
    className: 'svg-icon large', 
    style: 'fill'
})
```

### 在HTML中使用

```html
<!-- 基础图标 -->
<i class="ph ph-house"></i>

<!-- 带样式的图标 -->
<i class="ph ph-package svg-icon bold"></i>

<!-- 带状态的图标 -->
<i class="ph ph-gear svg-icon hover"></i>
```

## API 方法

### Icon.render(iconName, options)

渲染图标元素

**参数:**
- `iconName` (String): 图标名称，如 'house', 'package', 'gear'
- `options` (Object): 配置选项
  - `className` (String): CSS类名，默认为 'svg-icon'
  - `style` (String): 图标样式，可选 'regular', 'bold', 'fill'，默认为 'regular'
  - `state` (String): 图标状态，可选 'hover', 'active', 'disabled'
  - `size` (String): 图标尺寸，可选 'small', 'large', 'xlarge'

**返回值:** String - 图标的HTML字符串

### Icon.initStyles()

初始化图标样式，将样式注入到页面中

## 图标映射

组件内置了常用图标的映射表：

```javascript
static iconMap = {
    // 基础图标
    'home': 'house',
    'package': 'package',
    'settings': 'gear',
    'search': 'magnifying-glass',
    'download': 'download',
    'copy': 'copy',
    'eye': 'eye',
    'warning': 'warning',
    'check-circle': 'check-circle',
    'x': 'x',
    'minus': 'minus',
    'arrows-out': 'arrows-out',
    'arrow-clockwise': 'arrow-clockwise',
    'dots-three-vertical': 'dots-three-vertical',
    'image': 'image',
    'info': 'info',
    'spinner': 'spinner',
    'warning-circle': 'warning-circle',
    'caret-left': 'caret-left',
    'caret-right': 'caret-right',
    'help': 'question',
    'success': 'check-circle',
    'error': 'warning-circle',
    'loading': 'spinner',
    'sun': 'sun',
    'moon': 'moon',
    
    // 活动相关图标
    'folder-plus': 'folder-plus',
    'folder-minus': 'folder-minus',
    'chart-line': 'chart-line',
    'chart-bar': 'chart-bar',
    'clock': 'clock',
    'calendar': 'calendar',
    'activity': 'pulse',
    'pulse': 'pulse',
    'trending-up': 'chart-line-up',
    'database': 'database',
    'cloud-download': 'download',
    'refresh': 'arrow-clockwise',
    'sync': 'arrows-clockwise',
    'update': 'arrows-clockwise'
};
```

## CSS 类名

### 基础类名
- `.svg-icon` - 基础SVG图标
- `.svg-icon-fill` - 填充样式图标
- `.icon` - 基础图标类

### 状态类名
- `.hover` - 悬停状态
- `.active` - 激活状态
- `.disabled` - 禁用状态
- `.secondary` - 次要图标

### 尺寸类名
- `.small` - 小尺寸 (0.75em)
- `.large` - 大尺寸 (1.25em)
- `.xlarge` - 超大尺寸 (1.5em)

### 动画类名
- `.rotate` - 旋转动画
- `.pulse` - 脉冲动画

## 颜色变量

组件使用以下CSS变量控制图标颜色：

```css
:root {
    --color-primary: rgba(0, 0, 0, 0.8);     /* 主要图标 */
    --color-secondary: rgba(0, 0, 0, 0.5);   /* 次要图标 */
    --color-focused: rgba(0, 0, 0, 1.0);     /* 悬停/激活图标 */
    --color-disabled: rgba(0, 0, 0, 0.3);    /* 禁用图标 */
}

.theme-dark {
    --color-primary: rgba(255, 255, 255, 0.8);     /* 主要图标 */
    --color-secondary: rgba(255, 255, 255, 0.5);   /* 次要图标 */
    --color-focused: rgba(255, 255, 255, 1.0);     /* 悬停/激活图标 */
    --color-disabled: rgba(255, 255, 255, 0.3);    /* 禁用图标 */
}
```

## 样式特性

### 透明度标准
- 统一使用 `opacity: 0.8` (80%) 透明度
- 悬停和激活状态使用 `opacity: 1` (100%) 透明度
- 禁用状态使用 `opacity: 0.5` (50%) 透明度

### 过渡动画
- 颜色变化使用 `transition: color 0.2s ease, opacity 0.2s ease`
- 支持旋转和脉冲动画效果

### 主题适配
- 自动适配浅色/深色主题
- 使用CSS变量实现主题切换
- 支持系统主题跟随

## 文件结构

```
renderer/
├── components/Common/Icon.js          # 图标组件主文件
└── assets/svgs/                       # SVG图标资源
    ├── bold/                          # 粗体图标 (1512个文件)
    ├── fill/                          # 填充图标 (1512个文件)
    └── regular/                       # 常规图标 (1512个文件)
```

## 使用示例

### 在组件中使用

```javascript
// 在组件中渲染图标
render() {
    return `
        <div class="header">
            <button class="btn">
                ${Icon.render('home', { className: 'svg-icon', style: 'bold' })}
                首页
            </button>
            <button class="btn">
                ${Icon.render('package', { className: 'svg-icon', style: 'regular' })}
                产品库
            </button>
        </div>
    `;
}
```

### 在弹窗中使用

```javascript
// 在弹窗中渲染图标
renderModal() {
    return `
        <div class="modal-header">
            <h3>设置</h3>
            <button class="modal-close">
                ${Icon.render('x', { className: 'svg-icon', style: 'bold' })}
            </button>
        </div>
    `;
}
```

## 注意事项

1. **文件依赖**: 确保SVG文件存在于 `renderer/assets/svgs/` 目录下
2. **样式初始化**: 首次使用前需要调用 `Icon.initStyles()` 初始化样式
3. **图标映射**: 新增图标时需要在 `iconMap` 中添加映射关系
4. **主题适配**: 确保在主题切换时图标颜色正确更新
5. **性能优化**: 图标样式只初始化一次，避免重复注入

## 新增图标

当需要新增图标时，请遵循以下步骤：

1. 将SVG文件放入对应的样式目录（bold/fill/regular）
2. 在 `Icon.js` 的 `iconMap` 中添加映射关系
3. 确保SVG文件命名与映射关系一致
4. 测试图标在不同主题下的显示效果

## 示例

查看 `test-icons.html` 文件获取完整的使用示例和图标展示。
