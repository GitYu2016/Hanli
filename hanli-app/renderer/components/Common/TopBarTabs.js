/**
 * TopBarTabs 组件
 * 负责顶部导航栏标签页的渲染和交互逻辑
 * 包含标签页的创建、切换、关闭等完整功能
 * 样式定义在JavaScript中，通过StyleManager管理
 */
class TopBarTabs {
    constructor(options = {}) {
        this.tabManager = null;
        this.tabSwitchCallback = null;
        this.tabCloseCallback = null;
        this.tabAddCallback = null;
        this.containerId = options.containerId || 'top-bar-tabs';
        this.customStyles = options.customStyles || {};
        this.initStyles();
        this.init();
    }

    /**
     * 初始化TopBarTabs样式
     */
    initStyles() {
        // 确保StyleManager已加载
        if (typeof window.styleManager === 'undefined') {
            console.error('StyleManager未加载，请确保已引入StyleManager.js');
            return;
        }

        // 定义TopBarTabs样式
        const topBarTabsStyles = {
            // TopBar标签页容器
            '.top-bar-tabs': {
                'display': 'flex',
                'align-items': 'center',
                'gap': '8px',
                'max-width': '600px',
                'overflow-x': 'auto',
                'scrollbar-width': 'none',
                '-ms-overflow-style': 'none',
                'height': '100%'
            },

            '.top-bar-tabs::-webkit-scrollbar': {
                'display': 'none'
            },

            // 标签页
            '.top-bar-tab': {
                'display': 'flex',
                'align-items': 'center',
                'gap': '2px',
                'padding': '8px 8px 8px 12px',
                'background-color': 'var(--color-background-normal)',
                'color': 'var(--color-primary)',
                'border-radius': 'var(--radius-large)',
                'cursor': 'pointer',
                'transition': 'all 0.2s ease',
                'white-space': 'nowrap',
                'position': 'relative',
                'min-width': '80px',
                'max-width': '200px'
            },

            '.top-bar-tab:hover': {
                'background-color': 'var(--color-background-focused)',
                'color': 'var(--color-focused)',
                'transform': 'translateY(-1px)',
                'box-shadow': '0 2px 8px var(--color-shadow)'
            },

            '.top-bar-tab.active': {
                'background-color': 'var(--color-background-focused)',
                'color': 'var(--color-primary)',
                'box-shadow': '0 2px 8px var(--color-shadow)'
            },

            '.top-bar-tab.active:hover': {
                'background-color': 'var(--color-background-focused)',
                'transform': 'translateY(-1px)'
            },

            // 标签页内容
            '.top-bar-tab-content': {
                'display': 'flex',
                'align-items': 'center',
                'gap': '8px',
                'flex': '1',
                'min-width': '0'
            },

            '.top-bar-tab-icon': {
                'display': 'flex',
                'align-items': 'center'
            },

            '.top-bar-tab-title': {
                'font-size': '14px',
                'font-weight': '500',
                'overflow': 'hidden',
                'text-overflow': 'ellipsis',
                'white-space': 'nowrap',
                'flex': '1'
            },

            '.top-bar-tab-close': {
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                'width': '20px',
                'height': '20px',
                'border-radius': 'var(--radius-small)',
                'background-color': 'transparent',
                'color': 'inherit',
                'cursor': 'pointer',
                'transition': 'all 0.2s ease',
                'border': 'none',
                'flex-shrink': '0'
            },

            '.top-bar-tab-close:hover': {
                'background-color': 'var(--color-background-focused)',
                'transform': 'scale(1.1)'
            },

            '.top-bar-tab-close i': {
                'font-size': '12px'
            },

            // 关闭按钮默认透明度
            '.top-bar-tab .top-bar-tab-close': {
                'opacity': '0',
                'transition': 'opacity 0.2s ease'
            },

            '.top-bar-tab:hover .top-bar-tab-close': {
                'opacity': '1'
            },

            // 单个Tab样式
            '.top-bar-tab.single-tab .top-bar-tab-close': {
                'display': 'none'
            },

            // 不可关闭的Tab样式
            '.top-bar-tab.not-closable .top-bar-tab-close': {
                'display': 'none'
            },

            // 动画效果
            '.top-bar-tab.closing': {
                'transform': 'scale(0.8)',
                'opacity': '0',
                'transition': 'all 0.2s ease'
            },

            // 响应式设计
            '@media (max-width: 768px)': {
                '.top-bar-tabs': {
                    'max-width': '300px'
                },
                '.top-bar-tab': {
                    'min-width': '100px',
                    'max-width': '150px',
                    'padding': '6px 12px'
                },
                '.top-bar-tab-title': {
                    'font-size': '12px'
                }
            }
        };

        // 合并自定义样式
        const mergedStyles = this.mergeCustomStyles(topBarTabsStyles, this.customStyles);

        // 注册样式到StyleManager
        window.styleManager.defineStyles('TopBarTabs', mergedStyles);
    }

    /**
     * 合并自定义样式
     * @param {Object} defaultStyles - 默认样式
     * @param {Object} customStyles - 自定义样式
     * @returns {Object} 合并后的样式
     */
    mergeCustomStyles(defaultStyles, customStyles) {
        const merged = { ...defaultStyles };
        
        for (const selector in customStyles) {
            if (merged[selector]) {
                merged[selector] = { ...merged[selector], ...customStyles[selector] };
            } else {
                merged[selector] = customStyles[selector];
            }
        }
        
        return merged;
    }

    /**
     * 初始化TopBarTabs组件
     */
    init() {
        this.render();
        this.bindEvents();
    }

    /**
     * 设置Tab管理器
     * @param {TabManager} tabManager - Tab管理器实例
     */
    setTabManager(tabManager) {
        this.tabManager = tabManager;
    }

    /**
     * 设置Tab切换回调
     * @param {Function} callback - Tab切换回调
     */
    setTabSwitchCallback(callback) {
        this.tabSwitchCallback = callback;
    }

    /**
     * 设置Tab关闭回调
     * @param {Function} callback - Tab关闭回调
     */
    setTabCloseCallback(callback) {
        this.tabCloseCallback = callback;
    }

    /**
     * 设置Tab添加回调
     * @param {Function} callback - Tab添加回调
     */
    setTabAddCallback(callback) {
        this.tabAddCallback = callback;
    }

    /**
     * 更新自定义样式
     * @param {Object} customStyles - 新的自定义样式
     */
    updateCustomStyles(customStyles) {
        this.customStyles = { ...this.customStyles, ...customStyles };
        this.initStyles();
    }

    /**
     * 渲染TopBarTabs HTML结构
     */
    render() {
        const tabsContainer = document.getElementById(this.containerId);
        if (!tabsContainer) {
            console.error(`TopBarTabs容器未找到: ${this.containerId}`);
            return;
        }

        tabsContainer.className = 'top-bar-tabs';
        tabsContainer.innerHTML = '';
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 监听TabManager的tabSwitch事件
        document.addEventListener('tabSwitch', (event) => {
            this.renderTabs();
        });
    }

    /**
     * 渲染Tabs
     */
    renderTabs() {
        if (!this.tabManager) {
            console.warn('TabManager not set for TopBarTabs');
            return;
        }

        const tabsContainer = document.getElementById(this.containerId);
        if (!tabsContainer) return;

        tabsContainer.innerHTML = '';

        this.tabManager.tabs.forEach(tab => {
            const tabElement = this.createTabElement(tab);
            tabsContainer.appendChild(tabElement);
        });
    }

    /**
     * 创建Tab元素
     * @param {Object} tab - Tab数据对象
     * @returns {HTMLElement} Tab元素
     */
    createTabElement(tab) {
        const tabDiv = document.createElement('div');
        const isSingleTab = this.tabManager.tabs.length === 1;
        const isNotClosable = !tab.closable;
        const closableClass = isNotClosable ? 'not-closable' : '';
        
        tabDiv.className = `top-bar-tab ${tab.isActive ? 'active' : ''} ${isSingleTab ? 'single-tab' : ''} ${closableClass}`;
        tabDiv.dataset.tabId = tab.id;
        tabDiv.dataset.pageType = tab.pageType;

        const icon = this.getPageIcon(tab.pageType);
        
        tabDiv.innerHTML = `
            <div class="top-bar-tab-content">
                <div class="top-bar-tab-icon">${icon}</div>
                <div class="top-bar-tab-title">${tab.title}</div>
            </div>
            <div class="top-bar-tab-close">
                ${Icon.render('x', { className: 'svg-icon', style: 'bold' })}
            </div>
        `;

        // 添加点击事件
        tabDiv.addEventListener('click', (e) => {
            // 检查是否点击了关闭按钮或其子元素
            if (e.target.closest('.top-bar-tab-close')) {
                e.stopPropagation();
                // 只有可关闭的Tab才能被关闭
                if (tab.closable) {
                    this.closeTab(tab.id);
                }
            } else {
                this.switchTab(tab.id);
            }
        });

        return tabDiv;
    }

    /**
     * 获取页面图标
     * @param {string} pageType - 页面类型
     * @returns {string} 图标HTML
     */
    getPageIcon(pageType) {
        const PAGE_ICONS = {
            home: Icon.render('home', { className: 'svg-icon', style: 'bold' }),
            productDetail: Icon.render('image', { className: 'svg-icon', style: 'bold' }),
            goodsList: Icon.render('package', { className: 'svg-icon', style: 'bold' })
        };
        
        return PAGE_ICONS[pageType] || PAGE_ICONS.home;
    }

    /**
     * 切换Tab
     * @param {string} tabId - Tab ID
     */
    switchTab(tabId) {
        if (!this.tabManager) return;

        this.tabManager.setActiveTab(tabId);
        this.renderTabs();
        
        // 触发TabManager的onTabSwitch方法，这会触发tabSwitch事件
        const tab = this.tabManager.tabs.find(t => t.id === tabId);
        if (tab) {
            this.tabManager.onTabSwitch(tab);
            
            // 触发自定义回调
            if (this.tabSwitchCallback) {
                this.tabSwitchCallback(tab);
            }
        }
    }

    /**
     * 关闭Tab
     * @param {string} tabId - Tab ID
     */
    closeTab(tabId) {
        if (!this.tabManager) return;

        const tabIndex = this.tabManager.tabs.findIndex(tab => tab.id === tabId);
        if (tabIndex === -1) return;

        const isActiveTab = this.tabManager.tabs[tabIndex].isActive;
        
        // 添加关闭动画
        const tabElement = document.querySelector(`[data-tab-id="${tabId}"]`);
        if (tabElement) {
            // 使用CSS类而不是内联样式
            tabElement.classList.add('closing');
            
            setTimeout(() => {
                this.tabManager.closeTab(tabId);
                this.renderTabs();
                
                // 如果关闭的是活动Tab，需要触发页面切换
                if (isActiveTab && this.tabManager.tabs.length > 0) {
                    const newActiveTab = this.tabManager.tabs[Math.max(0, tabIndex - 1)];
                    this.tabManager.onTabSwitch(newActiveTab);
                }

                // 触发自定义回调
                if (this.tabCloseCallback) {
                    this.tabCloseCallback(tabId, isActiveTab);
                }
            }, 200);
        } else {
            // 如果找不到元素，直接执行关闭逻辑
            this.tabManager.closeTab(tabId);
            this.renderTabs();
            
            // 如果关闭的是活动Tab，需要触发页面切换
            if (isActiveTab && this.tabManager.tabs.length > 0) {
                const newActiveTab = this.tabManager.tabs[Math.max(0, tabIndex - 1)];
                this.tabManager.onTabSwitch(newActiveTab);
            }

            // 触发自定义回调
            if (this.tabCloseCallback) {
                this.tabCloseCallback(tabId, isActiveTab);
            }
        }
    }

    /**
     * 更新Tab状态
     * @param {string} tabId - Tab ID
     * @param {boolean} isActive - 是否激活
     */
    updateTabState(tabId, isActive) {
        const tabElement = document.querySelector(`[data-tab-id="${tabId}"]`);
        if (tabElement) {
            if (isActive) {
                tabElement.classList.add('active');
            } else {
                tabElement.classList.remove('active');
            }
        }
    }

    /**
     * 添加新Tab
     * @param {Object} tabData - Tab数据
     */
    addTab(tabData) {
        if (!this.tabManager) return;

        const tabId = this.tabManager.addTab(tabData);
        this.renderTabs();
        
        // 触发自定义回调
        if (this.tabAddCallback) {
            const newTab = this.tabManager.tabs.find(tab => tab.id === tabId);
            this.tabAddCallback(newTab);
        }
        
        return tabId;
    }

    /**
     * 刷新Tabs显示
     */
    refresh() {
        this.renderTabs();
    }

    /**
     * 销毁组件
     */
    destroy() {
        // 清理Tab事件监听器
        const tabElements = document.querySelectorAll('.top-bar-tab');
        tabElements.forEach(tab => {
            tab.replaceWith(tab.cloneNode(true));
        });

        // 清理事件监听器
        document.removeEventListener('tabSwitch', this.renderTabs);
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TopBarTabs;
} else {
    window.TopBarTabs = TopBarTabs;
}
