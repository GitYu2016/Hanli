# Tab功能实现文档

## 1. 概述

Tab功能是Hanli应用的核心导航机制，允许用户在不同页面之间快速切换，支持多页面同时打开、动态创建和关闭Tab。

## 2. 架构设计

### 2.1 组件关系
```
HomePage (主应用)
├── TabManager (Tab状态管理)
├── TopBar (Tab UI渲染)
├── SideBar (导航触发)
└── PageContainer (页面内容渲染)
```

### 2.2 数据流
```
用户操作 → 组件事件 → TabManager → 自定义事件 → 主应用处理 → 页面渲染
```

## 3. 核心类和方法

### 3.1 TabManager类

#### 主要属性
- `tabs`: Tab数组，存储所有Tab信息
- `activeTabId`: 当前活动Tab的ID

#### 核心方法
```javascript
// 添加Tab
addTab(pageData) {
    const tab = {
        id: this.generateTabId(),
        pageType: pageData.type,
        title: pageData.title,
        pageData: pageData,
        isActive: false
    };
    this.tabs.push(tab);
    return tab.id;
}

// 设置活动Tab
setActiveTab(tabId) {
    this.tabs.forEach(tab => {
        tab.isActive = tab.id === tabId;
    });
    this.activeTabId = tabId;
}

// 关闭Tab
closeTab(tabId) {
    const index = this.tabs.findIndex(tab => tab.id === tabId);
    if (index !== -1) {
        this.tabs.splice(index, 1);
    }
}

// 触发Tab切换事件
onTabSwitch(tab) {
    const event = new CustomEvent('tabSwitch', {
        detail: { tab }
    });
    document.dispatchEvent(event);
}
```

### 3.2 TopBar组件

#### 主要方法
```javascript
// 切换Tab
switchTab(tabId) {
    if (!this.tabManager) return;
    
    this.tabManager.setActiveTab(tabId);
    this.renderTabs();
    
    // 触发Tab切换事件
    const tab = this.tabManager.tabs.find(t => t.id === tabId);
    if (tab) {
        this.tabManager.onTabSwitch(tab);
    }
}

// 关闭Tab
closeTab(tabId) {
    if (!this.tabManager) return;
    
    const tabIndex = this.tabManager.tabs.findIndex(tab => tab.id === tabId);
    if (tabIndex === -1) return;
    
    const isActiveTab = this.tabManager.tabs[tabIndex].isActive;
    
    // 添加关闭动画
    const tabElement = document.querySelector(`[data-tab-id="${tabId}"]`);
    if (tabElement) {
        tabElement.style.transform = 'scale(0.8)';
        tabElement.style.opacity = '0';
        
        setTimeout(() => {
            this.tabManager.closeTab(tabId);
            this.renderTabs();
            
            // 如果关闭的是活动Tab，需要触发页面切换
            if (isActiveTab && this.tabManager.tabs.length > 0) {
                const newActiveTab = this.tabManager.tabs[Math.max(0, tabIndex - 1)];
                this.tabManager.onTabSwitch(newActiveTab);
            }
        }, 200);
    }
}

// 创建Tab元素
createTabElement(tab) {
    const tabDiv = document.createElement('div');
    tabDiv.className = `tab ${tab.isActive ? 'active' : ''}`;
    tabDiv.dataset.tabId = tab.id;
    tabDiv.dataset.pageType = tab.pageType;
    
    const icon = this.getPageIcon(tab.pageType);
    
    tabDiv.innerHTML = `
        <div class="tab-icon">${icon}</div>
        <div class="tab-text">${tab.title}</div>
        <div class="tab-close">
            <i class="ph ph-x"></i>
        </div>
    `;
    
    // 添加点击事件
    tabDiv.addEventListener('click', (e) => {
        if (e.target.closest('.tab-close')) {
            e.stopPropagation();
            this.closeTab(tab.id);
        } else {
            this.switchTab(tab.id);
        }
    });
    
    return tabDiv;
}
```

### 3.3 HomePage主应用

#### Tab切换处理
```javascript
// 处理Tab切换
handleTabSwitch(tab) {
    console.log('处理Tab切换:', tab);
    
    // 根据页面类型更新侧边栏状态
    if (this.sideBar) {
        this.sideBar.updateSidebarForTab(tab);
    }
    
    // 根据Tab类型渲染对应的页面内容
    this.renderPageContent(tab.pageData.type, tab.pageData);
    
    // 根据Tab类型管理产品总数刷新
    if (tab.pageType === 'home') {
        this.startProductCountRefresh();
    } else {
        this.stopProductCountRefresh();
    }
}

// 绑定Tab切换事件
bindTabSwitchEvents() {
    document.addEventListener('tabSwitch', (event) => {
        const { tab } = event.detail;
        console.log('Tab切换到:', tab.pageType);
        this.handleTabSwitch(tab);
    });
}
```

## 4. 事件系统

### 4.1 自定义事件
- **事件名称**: `tabSwitch`
- **事件数据**: `{ tab: Tab对象 }`
- **触发时机**: Tab切换时

### 4.2 事件监听
```javascript
// 主应用监听Tab切换事件
document.addEventListener('tabSwitch', (event) => {
    const { tab } = event.detail;
    this.handleTabSwitch(tab);
});
```

## 5. 页面类型支持

### 5.1 支持的页面类型
| 类型 | 说明 | 图标 | 数据来源 |
|------|------|------|----------|
| home | 首页 | `ph-house` | 静态数据 |
| goodsList | 产品库 | `ph-package` | API数据 |
| productDetail | 产品详情 | `ph-info` | API数据 |

### 5.2 页面数据格式
```javascript
// 首页Tab数据
{
    type: 'home',
    title: '首页',
    pageData: { type: 'home', title: '首页' }
}

// 产品库Tab数据
{
    type: 'goodsList',
    title: '产品库',
    pageData: { type: 'goodsList', title: '产品库' }
}

// 产品详情Tab数据
{
    type: 'productDetail',
    title: '产品详情 - 商品名称',
    productId: '商品ID',
    pageData: { type: 'productDetail', title: '产品详情', productId: '商品ID' }
}
```

## 6. 键盘快捷键

### 6.1 支持的快捷键
- **Ctrl+W**: 关闭当前Tab
- **Ctrl+Tab**: 切换到下一个Tab
- **Ctrl+Shift+Tab**: 切换到上一个Tab

### 6.2 快捷键实现
```javascript
// 绑定键盘快捷键
bindKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+W 关闭当前Tab
        if (e.ctrlKey && e.key === 'w') {
            e.preventDefault();
            const activeTab = this.tabManager.getActiveTab();
            if (activeTab && this.tabManager.tabs.length > 1) {
                this.tabManager.closeTab(activeTab.id);
            }
        }
        
        // Ctrl+Tab 切换到下一个Tab
        if (e.ctrlKey && e.key === 'Tab' && !e.shiftKey) {
            e.preventDefault();
            this.switchToNextTab();
        }
        
        // Ctrl+Shift+Tab 切换到上一个Tab
        if (e.ctrlKey && e.key === 'Tab' && e.shiftKey) {
            e.preventDefault();
            this.switchToPreviousTab();
        }
    });
}
```

## 7. 动画效果

### 7.1 Tab关闭动画
```javascript
// 关闭动画实现
closeTab(tabId) {
    const tabElement = document.querySelector(`[data-tab-id="${tabId}"]`);
    if (tabElement) {
        tabElement.style.transform = 'scale(0.8)';
        tabElement.style.opacity = '0';
        
        setTimeout(() => {
            // 执行实际关闭逻辑
        }, 200);
    }
}
```

### 7.2 CSS过渡效果
```css
.tab {
    transition: all 0.2s ease;
}

.tab:hover {
    background-color: var(--color-hover);
}

.tab.active {
    background-color: var(--color-active);
}
```

## 8. 错误处理

### 8.1 Tab不存在处理
```javascript
switchTab(tabId) {
    if (!this.tabManager) return;
    
    const tab = this.tabManager.tabs.find(t => t.id === tabId);
    if (!tab) {
        console.warn('Tab不存在:', tabId);
        return;
    }
    
    // 执行切换逻辑
}
```

### 8.2 关闭最后一个Tab处理
```javascript
closeTab(tabId) {
    if (this.tabManager.tabs.length <= 1) {
        console.warn('不能关闭最后一个Tab');
        return;
    }
    
    // 执行关闭逻辑
}
```

## 9. 性能优化

### 9.1 事件委托
- 使用事件委托减少事件监听器数量
- 避免为每个Tab单独绑定事件

### 9.2 DOM操作优化
- 批量更新DOM，减少重排重绘
- 使用DocumentFragment进行批量插入

### 9.3 内存管理
- 及时清理事件监听器
- 避免内存泄漏

## 10. 测试建议

### 10.1 功能测试
- [ ] Tab创建和删除
- [ ] Tab切换功能
- [ ] 键盘快捷键
- [ ] 页面内容渲染
- [ ] 侧边栏状态同步

### 10.2 边界测试
- [ ] 关闭最后一个Tab
- [ ] 快速连续切换Tab
- [ ] 大量Tab时的性能
- [ ] 异常数据处理

### 10.3 用户体验测试
- [ ] 动画流畅性
- [ ] 响应速度
- [ ] 视觉反馈
- [ ] 键盘操作体验

## 11. 扩展性

### 11.1 新增页面类型
1. 在`PAGE_ICONS`中添加图标
2. 在`renderPageContent`中添加渲染逻辑
3. 在`updateSidebarForTab`中添加侧边栏处理

### 11.2 自定义Tab样式
- 支持不同页面类型的Tab样式
- 支持Tab状态指示器
- 支持Tab拖拽排序

## 12. 总结

Tab功能通过组件化架构实现了：
- **模块化设计**: 各组件职责清晰，易于维护
- **事件驱动**: 使用自定义事件实现组件间通信
- **用户体验**: 支持键盘快捷键和动画效果
- **扩展性**: 易于添加新的页面类型和功能
- **性能优化**: 合理的DOM操作和事件处理

Tab功能是Hanli应用的核心交互机制，为用户提供了高效的多页面管理体验。
