/**
 * TopBar 组件
 * 负责顶部导航栏的渲染和交互逻辑
 */
class TopBar {
    constructor() {
        this.tabManager = null;
        this.settingsCallback = null;
        this.tabSwitchCallback = null;
        this.init();
    }

    /**
     * 初始化TopBar组件
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
     * 设置设置按钮回调
     * @param {Function} callback - 设置按钮点击回调
     */
    setSettingsCallback(callback) {
        this.settingsCallback = callback;
    }

    /**
     * 设置Tab切换回调
     * @param {Function} callback - Tab切换回调
     */
    setTabSwitchCallback(callback) {
        this.tabSwitchCallback = callback;
    }

    /**
     * 渲染TopBar HTML结构
     */
    render() {
        const topBarHTML = `
            <div id="top-bar" class="top-bar">
                <div class="top-bar-left">
                    <div class="logo">Hanli</div>
                </div>
                <div class="top-bar-center">
                    <div id="top-bar-tabs" class="top-bar-tabs">
                        <!-- Tabs will be dynamically rendered here -->
                    </div>
                </div>
                <div class="top-bar-right">
                    <div class="settings-icon" id="settings-btn">
                        <i class="ph ph-sliders"></i>
                    </div>
                </div>
            </div>
        `;

        // 查找现有的top-bar元素并替换
        const existingTopBar = document.getElementById('top-bar');
        if (existingTopBar) {
            existingTopBar.outerHTML = topBarHTML;
        } else {
            // 如果不存在，插入到body开始处
            document.body.insertAdjacentHTML('afterbegin', topBarHTML);
        }
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 设置按钮点击事件
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                if (this.settingsCallback) {
                    this.settingsCallback();
                }
            });
        }

        // 检测运行环境
        this.detectEnvironment();
    }

    /**
     * 检测运行环境并调整样式
     */
    detectEnvironment() {
        const topBar = document.getElementById('top-bar');
        
        // 检测是否为浏览器环境
        if (window.navigator.userAgent.includes('Electron')) {
            // Electron环境，保持默认padding
            topBar.classList.remove('browser-mode');
        } else {
            // 浏览器环境，调整padding
            topBar.classList.add('browser-mode');
        }
    }

    /**
     * 渲染Tabs
     */
    renderTabs() {
        if (!this.tabManager) {
            console.warn('TabManager not set for TopBar');
            return;
        }

        const tabsContainer = document.getElementById('top-bar-tabs');
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
        tabDiv.className = `tab ${tab.isActive ? 'active' : ''} ${this.tabManager.tabs.length === 1 ? 'single-tab' : ''}`;
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
            // 检查是否点击了关闭按钮或其子元素
            if (e.target.closest('.tab-close')) {
                e.stopPropagation();
                this.closeTab(tab.id);
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
            home: `<i class="ph ph-house"></i>`,
            productDetail: `<i class="ph ph-image"></i>`,
            goodsList: `<i class="ph ph-package"></i>`
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
        } else {
            // 如果找不到元素，直接执行关闭逻辑
            this.tabManager.closeTab(tabId);
            this.renderTabs();
            
            // 如果关闭的是活动Tab，需要触发页面切换
            if (isActiveTab && this.tabManager.tabs.length > 0) {
                const newActiveTab = this.tabManager.tabs[Math.max(0, tabIndex - 1)];
                this.tabManager.onTabSwitch(newActiveTab);
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
        return tabId;
    }

    /**
     * 销毁组件
     */
    destroy() {
        // 清理事件监听器
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.replaceWith(settingsBtn.cloneNode(true));
        }

        // 清理Tab事件监听器
        const tabElements = document.querySelectorAll('.tab');
        tabElements.forEach(tab => {
            tab.replaceWith(tab.cloneNode(true));
        });
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TopBar;
} else {
    window.TopBar = TopBar;
}
