# 简化版 SidebarItem 组件

## 概述

简化版 `SidebarItem` 组件是一个轻量级的侧边栏项目组件，只包含图标和文字两个核心元素。支持 Phosphor 图标和本地 SVG 图标两种类型。

## 特性

- ✅ 图标 + 文字的基本布局
- ✅ 支持 Phosphor 图标（如 `ph-gear`）
- ✅ 支持本地 SVG 图标文件
- ✅ 激活/禁用状态管理
- ✅ 点击和悬浮事件
- ✅ 响应式设计
- ✅ 自动样式注入

## 配置选项

### 基础配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `id` | string | 自动生成 | 组件唯一标识符 |
| `label` | string | `''` | 显示的文字标签 |
| `icon` | string | `''` | 图标（Phosphor 类名或 SVG 路径） |
| `isActive` | boolean | `false` | 是否为激活状态 |
| `isDisabled` | boolean | `false` | 是否为禁用状态 |

### 交互配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `onClick` | function | `() => {}` | 点击回调函数 `(id, label) => {}` |
| `onHover` | function | `() => {}` | 悬浮回调函数 `(id, label, eventType) => {}` |

## 使用方法

### 1. 基础用法

```javascript
// 创建简单的侧边栏项目
const item = new SidebarItem({
    label: '首页',
    icon: 'ph-house',
    isActive: true
});

// 渲染到容器
const container = document.getElementById('sidebar');
container.innerHTML += item.render();
item.bindEvents(container);
```

### 2. Phosphor 图标

```javascript
const item = new SidebarItem({
    label: '设置',
    icon: 'ph-gear', // Phosphor 图标类名
    onClick: (id, label) => {
        console.log(`点击了: ${label}`);
    }
});
```

### 3. 本地 SVG 图标

```javascript
const item = new SidebarItem({
    label: '用户管理',
    icon: '/assets/svgs/regular/user.svg', // 本地 SVG 文件路径
    onClick: (id, label) => {
        console.log(`点击了: ${label}`);
    }
});
```

### 4. 完整配置示例

```javascript
const item = new SidebarItem({
    id: 'custom-settings',
    label: '高级设置',
    icon: 'ph-gear-six',
    isActive: false,
    isDisabled: false,
    onClick: (id, label) => {
        console.log(`点击了项目: ${label} (ID: ${id})`);
        // 处理点击事件
    },
    onHover: (id, label, eventType) => {
        console.log(`鼠标${eventType === 'enter' ? '进入' : '离开'}: ${label}`);
    }
});
```

## 动态方法

### 状态管理

```javascript
// 设置为激活状态
item.setActive();

// 设置为非激活状态
item.setInactive();

// 设置禁用状态
item.setDisabled(true);

// 获取当前状态
const state = item.getState();
console.log(state);
```

### 组件管理

```javascript
// 销毁组件
item.destroy();
```

## 图标类型判断

组件会自动判断图标类型：

- **Phosphor 图标**: 不包含 `.svg` 扩展名且不包含 `/assets/svgs/` 路径
- **本地 SVG**: 以 `.svg` 结尾或包含 `/assets/svgs/` 路径

```javascript
// Phosphor 图标
icon: 'ph-house'           // ✅ Phosphor
icon: 'ph-gear'            // ✅ Phosphor

// 本地 SVG
icon: 'icon.svg'           // ✅ SVG
icon: '/path/icon.svg'     // ✅ SVG
icon: '/assets/svgs/regular/user.svg'  // ✅ SVG
```

## 样式定制

组件使用 CSS 变量，可以通过主题系统进行定制：

```css
.sidebar-item {
    /* 使用主题颜色变量 */
    background: var(--color-background-focused);
    color: var(--color-primary);
}

.sidebar-item-icon {
    color: var(--color-secondary);
}

.sidebar-item.active .sidebar-item-icon {
    color: var(--color-primary);
}
```

## 事件处理

### 点击事件

```javascript
const item = new SidebarItem({
    label: '产品库',
    icon: 'ph-package',
    onClick: (id, label) => {
        // 处理点击逻辑
        console.log(`用户点击了: ${label}`);
        
        // 可以在这里切换激活状态
        item.setActive();
    }
});
```

### 悬浮事件

```javascript
const item = new SidebarItem({
    label: '帮助',
    icon: 'ph-question',
    onHover: (id, label, eventType) => {
        if (eventType === 'enter') {
            // 鼠标进入
            console.log(`鼠标进入: ${label}`);
        } else {
            // 鼠标离开
            console.log(`鼠标离开: ${label}`);
        }
    }
});
```

## 完整示例

```javascript
// 创建侧边栏项目列表
const sidebarItems = [
    { label: '首页', icon: 'ph-house', isActive: true },
    { label: '产品库', icon: 'ph-package', isActive: false },
    { label: '设置', icon: 'ph-gear', isActive: false },
    { label: '用户', icon: '/assets/svgs/regular/user.svg', isActive: false }
];

// 渲染所有项目
const container = document.getElementById('sidebar');
sidebarItems.forEach((config, index) => {
    const item = new SidebarItem({
        id: `sidebar-item-${index}`,
        label: config.label,
        icon: config.icon,
        isActive: config.isActive,
        onClick: (id, label) => {
            // 重置所有项目的激活状态
            sidebarItems.forEach((_, i) => {
                const element = document.getElementById(`sidebar-item-${i}`);
                if (element) element.classList.remove('active');
            });
            
            // 激活当前项目
            document.getElementById(id).classList.add('active');
            
            console.log(`切换到: ${label}`);
        }
    });
    
    container.innerHTML += item.render();
    item.bindEvents(container);
});
```

## 注意事项

1. **SVG 图标加载**: 本地 SVG 图标会异步加载，确保路径正确
2. **事件绑定**: 调用 `render()` 后必须调用 `bindEvents()` 才能正常交互
3. **样式注入**: 组件会自动注入样式，无需手动引入 CSS
4. **响应式**: 组件支持响应式设计，在移动端会自动调整
5. **主题兼容**: 使用 CSS 变量，与项目的主题系统完全兼容

## 测试

运行测试页面查看完整示例：

```bash
# 在项目根目录下
open hanli-app/test/components/test-simplified-sidebar-item.html
```

测试页面包含：
- Phosphor 图标示例
- 本地 SVG 图标示例
- 动态创建组件功能
- 事件日志显示
