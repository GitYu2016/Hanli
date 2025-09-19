# 键盘快捷键管理器使用文档

## 概述

`KeyboardShortcutManager` 是一个统一的键盘快捷键管理系统，用于管理应用中的所有键盘快捷键功能。

## 特性

- **统一管理**: 所有快捷键都在一个地方管理
- **上下文支持**: 支持不同上下文下的快捷键
- **自动清理**: 支持快捷键的注册和注销
- **多选模式**: 内置Shift键多选模式支持
- **事件系统**: 支持自定义事件通知

## 基本使用

### 1. 注册快捷键

```javascript
// 注册全局快捷键
window.keyboardShortcutManager.register('ctrl+s', (e) => {
    console.log('保存文件');
}, 'global', '保存文件');

// 注册上下文相关快捷键
window.keyboardShortcutManager.register('escape', (e) => {
    this.closeModal();
}, 'modal', '关闭弹窗');
```

### 2. 设置上下文

```javascript
// 设置当前上下文
window.keyboardShortcutManager.setContext('modal');

// 在特定上下文中注册快捷键
window.keyboardShortcutManager.register('enter', (e) => {
    this.confirm();
}, 'modal', '确认操作');
```

### 3. 注销快捷键

```javascript
// 注销特定快捷键
window.keyboardShortcutManager.unregister('ctrl+s', 'global');

// 注销整个上下文的所有快捷键
window.keyboardShortcutManager.unregisterContext('modal');
```

## 快捷键格式

快捷键使用以下格式：

- **修饰键**: `ctrl`, `alt`, `shift`, `meta`
- **特殊键**: `tab`, `enter`, `escape`, `space`
- **字母数字**: `a`, `1`, `f1` 等

### 示例

```javascript
'ctrl+s'           // ⌘/Ctrl+S
'ctrl+shift+s'     // ⌘/Ctrl+Shift+S
'escape'           // ESC键
'enter'            // 回车键
'ctrl+tab'         // ⌘/Ctrl+Tab
'ctrl+shift+tab'   // ⌘/Ctrl+Shift+Tab
```

## 多选模式

管理器内置了Shift键多选模式支持：

```javascript
// 监听多选模式变化
document.addEventListener('multiSelectModeChange', (e) => {
    const isMultiSelect = e.detail.isMultiSelect;
    if (isMultiSelect) {
        console.log('进入多选模式');
    } else {
        console.log('退出多选模式');
    }
});

// 检查当前是否处于多选模式
const isMultiSelect = window.keyboardShortcutManager.isMultiSelectActive();
```

## 组件集成

### 在组件中使用

```javascript
class MyComponent {
    constructor() {
        this.context = 'my-component';
        this.registerShortcuts();
    }

    registerShortcuts() {
        // 注册组件专用快捷键
        window.keyboardShortcutManager.register('escape', (e) => {
            this.close();
        }, this.context, '关闭组件');

        window.keyboardShortcutManager.register('enter', (e) => {
            this.submit();
        }, this.context, '提交表单');
    }

    destroy() {
        // 清理快捷键
        window.keyboardShortcutManager.unregisterContext(this.context);
    }
}
```

### 弹窗组件

```javascript
class Modal {
    open() {
        // 注册弹窗快捷键
        this.registerShortcuts();
    }

    close() {
        // 注销弹窗快捷键
        this.unregisterShortcuts();
    }

    registerShortcuts() {
        window.keyboardShortcutManager.register('escape', (e) => {
            this.close();
        }, 'modal', '关闭弹窗');
    }

    unregisterShortcuts() {
        window.keyboardShortcutManager.unregisterContext('modal');
    }
}
```

## 应用级快捷键

应用级快捷键在 `app.js` 中统一管理：

```javascript
// 在 HomePage 类中
setupKeyboardShortcuts() {
    // Tab管理快捷键
    window.keyboardShortcutManager.register('ctrl+w', (e) => {
        const activeTab = this.tabManager.getActiveTab();
        if (activeTab && this.tabManager.tabs.length > 1) {
            this.tabManager.closeTab(activeTab.id);
        }
    }, 'global', '关闭当前Tab');

    window.keyboardShortcutManager.register('ctrl+tab', (e) => {
        this.switchToNextTab();
    }, 'global', '切换到下一个Tab');

    window.keyboardShortcutManager.register('ctrl+shift+tab', (e) => {
        this.switchToPreviousTab();
    }, 'global', '切换到上一个Tab');
}
```

## 弹窗ESC键处理

为了方便弹窗的ESC键处理，提供了辅助方法：

```javascript
// 注册弹窗ESC键
this.registerModalEscKey('my-modal', () => {
    this.closeModal();
    this.unregisterModalEscKey('my-modal');
});

// 注销弹窗ESC键
this.unregisterModalEscKey('my-modal');
```

## 获取快捷键列表

```javascript
// 获取所有快捷键
const allShortcuts = window.keyboardShortcutManager.getShortcuts();

// 获取特定上下文的快捷键
const modalShortcuts = window.keyboardShortcutManager.getShortcuts('modal');
```

## 注意事项

1. **上下文管理**: 确保在组件销毁时注销相关快捷键
2. **事件冲突**: 避免在不同上下文中注册相同的快捷键
3. **性能考虑**: 快捷键注册/注销是轻量级操作，但应避免频繁操作
4. **浏览器兼容性**: 支持现代浏览器的键盘事件

## 调试

快捷键管理器会在控制台输出注册和注销信息，便于调试：

```
注册快捷键: ctrl+s (global) - 保存文件
注销快捷键: ctrl+s (global)
注销上下文: modal
```

## 完整示例

```javascript
// 创建一个简单的编辑器组件
class Editor {
    constructor() {
        this.context = 'editor';
        this.isDirty = false;
        this.registerShortcuts();
    }

    registerShortcuts() {
        // 保存快捷键
        window.keyboardShortcutManager.register('ctrl+s', (e) => {
            this.save();
        }, this.context, '保存文件');

        // 新建快捷键
        window.keyboardShortcutManager.register('ctrl+n', (e) => {
            this.newFile();
        }, this.context, '新建文件');

        // 查找快捷键
        window.keyboardShortcutManager.register('ctrl+f', (e) => {
            this.openFindDialog();
        }, this.context, '查找');

        // ESC键取消操作
        window.keyboardShortcutManager.register('escape', (e) => {
            this.cancelOperation();
        }, this.context, '取消操作');
    }

    save() {
        console.log('保存文件');
        this.isDirty = false;
    }

    newFile() {
        if (this.isDirty) {
            if (confirm('文件已修改，是否保存？')) {
                this.save();
            }
        }
        console.log('新建文件');
    }

    openFindDialog() {
        console.log('打开查找对话框');
    }

    cancelOperation() {
        console.log('取消当前操作');
    }

    destroy() {
        // 清理快捷键
        window.keyboardShortcutManager.unregisterContext(this.context);
    }
}
```

这个快捷键管理器为应用提供了统一、灵活的键盘快捷键管理能力，让开发者可以轻松地为不同组件和功能添加快捷键支持。
