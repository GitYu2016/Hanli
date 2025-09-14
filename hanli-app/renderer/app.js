// 页面图标定义
const PAGE_ICONS = {
    home: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    goodsDetail: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 16V8C21 7.46957 20.7893 6.96086 20.4142 6.58579C20.0391 6.21071 19.5304 6 19 6H5C4.46957 6 3.96086 6.21071 3.58579 6.58579C3.21071 6.96086 3 7.46957 3 8V16C3 16.5304 3.21071 17.0391 3.58579 17.4142C3.96086 17.7893 4.46957 18 5 18H19C19.5304 18 20.0391 17.7893 20.4142 17.4142C20.7893 17.0391 21 16.5304 21 16Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M7 10H17M7 14H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    goodsList: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
};

// Tab管理类
class TabManager {
    constructor() {
        this.tabs = [];
        this.activeTabId = null;
        this.tabIdCounter = 0;
    }

    // 生成唯一Tab ID
    generateTabId() {
        return `tab_${++this.tabIdCounter}`;
    }

    // 新增Tab
    addTab(pageData) {
        const tabId = this.generateTabId();
        const tab = {
            id: tabId,
            pageType: pageData.type,
            title: pageData.title,
            pageData: pageData,
            isActive: false
        };
        
        this.tabs.push(tab);
        this.setActiveTab(tabId);
        this.renderTabs();
        return tabId;
    }

    // 设置活动Tab
    setActiveTab(tabId) {
        // 取消所有Tab的激活状态
        this.tabs.forEach(tab => tab.isActive = false);
        
        // 激活指定Tab
        const targetTab = this.tabs.find(tab => tab.id === tabId);
        if (targetTab) {
            targetTab.isActive = true;
            this.activeTabId = tabId;
        }
    }

    // 关闭Tab
    closeTab(tabId) {
        const tabIndex = this.tabs.findIndex(tab => tab.id === tabId);
        if (tabIndex === -1) return;

        const isActiveTab = this.tabs[tabIndex].isActive;
        
        // 添加关闭动画
        const tabElement = document.querySelector(`[data-tab-id="${tabId}"]`);
        if (tabElement) {
            tabElement.style.transform = 'scale(0.8)';
            tabElement.style.opacity = '0';
            
            setTimeout(() => {
                this.tabs.splice(tabIndex, 1);

                // 如果关闭的是活动Tab，需要选择新的活动Tab
                if (isActiveTab && this.tabs.length > 0) {
                    // 优先选择左边的Tab，如果左边没有则选择右边的Tab
                    let newActiveIndex = tabIndex - 1;
                    if (newActiveIndex < 0) {
                        newActiveIndex = 0;
                    }
                    this.setActiveTab(this.tabs[newActiveIndex].id);
                } else if (this.tabs.length === 0) {
                    this.activeTabId = null;
                }

                this.renderTabs();
            }, 200);
        } else {
            // 如果找不到元素，直接执行关闭逻辑
            this.tabs.splice(tabIndex, 1);

            if (isActiveTab && this.tabs.length > 0) {
                let newActiveIndex = tabIndex - 1;
                if (newActiveIndex < 0) {
                    newActiveIndex = 0;
                }
                this.setActiveTab(this.tabs[newActiveIndex].id);
            } else if (this.tabs.length === 0) {
                this.activeTabId = null;
            }

            this.renderTabs();
        }
    }

    // 渲染Tabs
    renderTabs() {
        const tabsContainer = document.getElementById('top-bar-tabs');
        if (!tabsContainer) return;

        tabsContainer.innerHTML = '';

        this.tabs.forEach(tab => {
            const tabElement = this.createTabElement(tab);
            tabsContainer.appendChild(tabElement);
        });
    }

    // 创建Tab元素
    createTabElement(tab) {
        const tabDiv = document.createElement('div');
        tabDiv.className = `tab ${tab.isActive ? 'active' : ''} ${this.tabs.length === 1 ? 'single-tab' : ''}`;
        tabDiv.dataset.tabId = tab.id;
        tabDiv.dataset.pageType = tab.pageType;

        const icon = PAGE_ICONS[tab.pageType] || PAGE_ICONS.home;
        
        tabDiv.innerHTML = `
            <div class="tab-icon">${icon}</div>
            <div class="tab-text">${tab.title}</div>
            <div class="tab-close">×</div>
        `;

        // 添加点击事件
        tabDiv.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-close')) {
                e.stopPropagation();
                this.closeTab(tab.id);
            } else {
                this.setActiveTab(tab.id);
                this.renderTabs();
                // 触发页面切换事件
                this.onTabSwitch(tab);
            }
        });

        return tabDiv;
    }

    // Tab切换回调
    onTabSwitch(tab) {
        // 触发自定义事件，让其他组件监听
        const event = new CustomEvent('tabSwitch', {
            detail: { tab }
        });
        document.dispatchEvent(event);
    }

    // 获取当前活动Tab
    getActiveTab() {
        return this.tabs.find(tab => tab.isActive);
    }

    // 根据页面类型查找Tab
    findTabByPageType(pageType) {
        return this.tabs.find(tab => tab.pageType === pageType);
    }
}

// 首页应用逻辑
class HomePage {
    constructor() {
        this.currentTheme = 'light';
        this.activePage = 'home';
        this.isResizing = false;
        this.tabManager = new TabManager();
        this.init();
    }

    init() {
        this.loadTheme();
        this.detectEnvironment();
        this.bindEvents();
        this.renderTabs();
        this.loadDashboardData();
        this.setupIPCListeners();
    }

    // 加载主题
    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'system';
        this.setTheme(savedTheme);
    }

    // 设置主题
    setTheme(theme) {
        this.currentTheme = theme;
        const themeColors = document.getElementById('theme-colors');
        
        if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            themeColors.href = prefersDark ? 'theme/dark/colors.css' : 'theme/light/colors.css';
        } else {
            themeColors.href = `theme/${theme}/colors.css`;
        }
        
        localStorage.setItem('theme', theme);
    }

    // 检测运行环境
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

    // 绑定事件
    bindEvents() {
        // 侧边栏点击事件
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                this.navigateToPage(page);
            });
        });

        // 侧边栏拖拽调整宽度
        this.bindSidebarResizer();

        // Tab切换事件监听
        this.bindTabSwitchEvents();
        
        // 键盘快捷键
        this.bindKeyboardShortcuts();

        // 设置按钮点击事件
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.showSettingsModal();
        });


        // 弹窗关闭事件
        document.getElementById('settings-close').addEventListener('click', () => {
            this.hideSettingsModal();
        });

        document.getElementById('settings-save').addEventListener('click', () => {
            this.saveSettings();
        });

        // 主题选择事件
        document.getElementById('theme-select').addEventListener('change', (e) => {
            this.setTheme(e.target.value);
        });

        // 监听系统主题变化
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (this.currentTheme === 'system') {
                this.setTheme('system');
            }
        });
    }

    // 绑定侧边栏拖拽调整器
    bindSidebarResizer() {
        const resizer = document.getElementById('sidebar-resizer');
        const sidebar = document.getElementById('sidebar');
        
        resizer.addEventListener('mousedown', (e) => {
            this.isResizing = true;
            document.addEventListener('mousemove', this.handleResize);
            document.addEventListener('mouseup', this.stopResize);
            e.preventDefault();
        });
    }

    // 处理侧边栏拖拽调整
    handleResize = (e) => {
        if (!this.isResizing) return;
        
        const sidebar = document.getElementById('sidebar');
        const newWidth = e.clientX;
        const minWidth = 200;
        const maxWidth = 320;
        
        if (newWidth >= minWidth && newWidth <= maxWidth) {
            sidebar.style.width = newWidth + 'px';
        }
    }

    // 停止侧边栏拖拽调整
    stopResize = () => {
        this.isResizing = false;
        document.removeEventListener('mousemove', this.handleResize);
        document.removeEventListener('mouseup', this.stopResize);
    }

    // 绑定Tab事件
    bindTabSwitchEvents() {
        // 监听Tab切换事件
        document.addEventListener('tabSwitch', (event) => {
            const { tab } = event.detail;
            console.log('Tab切换到:', tab.pageType);
            
            // 根据Tab类型更新页面内容
            this.handleTabSwitch(tab);
        });
    }
    
    // 处理Tab切换
    handleTabSwitch(tab) {
        // 根据页面类型更新侧边栏状态
        const pageMap = {
            'home': 'home',
            'goodsList': 'product-library', // 暂时映射到产品库
            'goodsDetail': 'product-library'
        };
        
        const pageId = pageMap[tab.pageType];
        if (pageId) {
            this.activePage = pageId;
            this.updateSidebarActiveState();
        }
    }
    
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
            if (e.ctrlKey && e.key === 'Tab') {
                e.preventDefault();
                this.switchToNextTab();
            }
            
            // Ctrl+Shift+Tab 切换到上一个Tab
            if (e.ctrlKey && e.shiftKey && e.key === 'Tab') {
                e.preventDefault();
                this.switchToPreviousTab();
            }
        });
    }
    
    // 切换到下一个Tab
    switchToNextTab() {
        const activeTab = this.tabManager.getActiveTab();
        if (!activeTab) return;
        
        const currentIndex = this.tabManager.tabs.findIndex(tab => tab.id === activeTab.id);
        const nextIndex = (currentIndex + 1) % this.tabManager.tabs.length;
        
        this.tabManager.setActiveTab(this.tabManager.tabs[nextIndex].id);
        this.tabManager.renderTabs();
        this.tabManager.onTabSwitch(this.tabManager.tabs[nextIndex]);
    }
    
    // 切换到上一个Tab
    switchToPreviousTab() {
        const activeTab = this.tabManager.getActiveTab();
        if (!activeTab) return;
        
        const currentIndex = this.tabManager.tabs.findIndex(tab => tab.id === activeTab.id);
        const prevIndex = currentIndex === 0 ? this.tabManager.tabs.length - 1 : currentIndex - 1;
        
        this.tabManager.setActiveTab(this.tabManager.tabs[prevIndex].id);
        this.tabManager.renderTabs();
        this.tabManager.onTabSwitch(this.tabManager.tabs[prevIndex]);
    }


    // 导航到页面
    navigateToPage(page) {
        console.log('导航到页面:', page);
        
        // 定义页面数据
        const pageDataMap = {
            'home': { type: 'home', title: '首页' },
            'product-library': { type: 'goodsList', title: '产品库' }
        };
        
        const pageData = pageDataMap[page];
        if (!pageData) {
            console.warn('未知的页面类型:', page);
            return;
        }
        
        // 检查是否已存在该页面类型的Tab
        let existingTab = this.tabManager.findTabByPageType(pageData.type);
        
        if (existingTab) {
            // 如果存在，切换到该Tab
            this.tabManager.setActiveTab(existingTab.id);
            this.tabManager.renderTabs();
        } else {
            // 如果不存在，创建新Tab
            this.tabManager.addTab(pageData);
        }
        
        // 更新侧边栏选中状态
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // 更新当前页面
        this.activePage = page;
        this.updateSidebarActiveState();
    }


    // 渲染Tabs（使用TabManager）
    renderTabs() {
        // 初始化首页Tab
        if (this.tabManager.tabs.length === 0) {
            this.tabManager.addTab({
                type: 'home',
                title: '首页',
                pageData: { type: 'home', title: '首页' }
            });
        } else {
            this.tabManager.renderTabs();
        }
    }

    // 更新侧边栏激活状态
    updateSidebarActiveState() {
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-page="${this.activePage}"]`)?.classList.add('active');
    }


    // 显示设置弹窗
    showSettingsModal() {
        const modal = document.getElementById('settings-modal');
        modal.classList.add('active');
        document.getElementById('theme-select').value = this.currentTheme;
    }

    // 隐藏设置弹窗
    hideSettingsModal() {
        const modal = document.getElementById('settings-modal');
        modal.classList.remove('active');
    }

    // 保存设置
    saveSettings() {
        const theme = document.getElementById('theme-select').value;
        this.setTheme(theme);
        this.hideSettingsModal();
        this.showToast('设置已保存');
    }

    // 加载仪表板数据
    loadDashboardData() {
        this.loadProductCount();
    }

    // 加载产品总数
    async loadProductCount() {
        try {
            // 通过API获取产品总数
            const response = await fetch('http://localhost:3001/api/products/count');
            if (response.ok) {
                const data = await response.json();
                document.getElementById('product-count').textContent = data.count || 0;
            } else {
                console.error('获取产品总数失败:', response.status);
                document.getElementById('product-count').textContent = '0';
            }
        } catch (error) {
            console.error('获取产品总数失败:', error);
            document.getElementById('product-count').textContent = '0';
        }
    }

    // 设置IPC监听器
    setupIPCListeners() {
        // 监听来自主进程的商品详情页打开请求
        if (window.electronAPI) {
            // 监听商品详情页打开请求
            window.addEventListener('navigate-to-product', (event) => {
                console.log('收到商品详情页打开请求:', event.detail);
                this.showProductDetailModal(event.detail);
            });
            
            console.log('IPC监听器已设置');
        }
    }

    // 显示商品详情弹窗
    showProductDetailModal(data) {
        // 创建弹窗遮罩
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'product-detail-modal';
        modalOverlay.className = 'modal-overlay active';
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        // 创建弹窗内容
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: var(--color-modal-background);
            border-radius: 16px;
            padding: 32px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            color: var(--color-text-primary);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            position: relative;
        `;

        // 图标区域
        const iconContainer = document.createElement('div');
        iconContainer.style.cssText = `
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 24px;
        `;

        const successIcon = document.createElement('div');
        successIcon.style.cssText = `
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 32px;
            font-weight: bold;
        `;
        successIcon.textContent = '✓';

        iconContainer.appendChild(successIcon);

        // 标题
        const title = document.createElement('h2');
        title.style.cssText = `
            margin: 0 0 16px 0;
            font-size: 24px;
            font-weight: bold;
            color: var(--color-text-primary);
        `;
        title.textContent = '商品数据采集成功';

        // 内容
        const content = document.createElement('div');
        content.style.cssText = `
            margin-bottom: 24px;
            line-height: 1.5;
            color: var(--color-text-secondary);
        `;

        const line1 = document.createElement('div');
        line1.style.cssText = 'margin-bottom: 8px;';
        line1.textContent = `商品ID: ${data.goodsId || '未知'}`;

        const line2 = document.createElement('div');
        line2.style.cssText = 'margin-bottom: 8px;';
        line2.textContent = '数据已成功保存到本地数据库';

        const line3 = document.createElement('div');
        line3.textContent = '您可以在产品库中查看和管理这些数据';

        content.appendChild(line1);
        content.appendChild(line2);
        content.appendChild(line3);

        // 按钮区域
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 12px;
            justify-content: center;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.style.cssText = `
            padding: 12px 24px;
            background: transparent;
            border: 1px solid var(--color-border);
            border-radius: 8px;
            color: var(--color-text-primary);
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s ease;
        `;
        closeBtn.textContent = '关闭';
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'var(--color-hover)';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'transparent';
        });
        closeBtn.addEventListener('click', () => {
            modalOverlay.remove();
        });

        const viewBtn = document.createElement('button');
        viewBtn.style.cssText = `
            padding: 12px 24px;
            background: var(--color-primary);
            border: none;
            border-radius: 8px;
            color: var(--color-primary-foreground);
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s ease;
        `;
        viewBtn.textContent = '查看产品库';
        viewBtn.addEventListener('mouseenter', () => {
            viewBtn.style.background = 'var(--color-primary-hover)';
        });
        viewBtn.addEventListener('mouseleave', () => {
            viewBtn.style.background = 'var(--color-primary)';
        });
        viewBtn.addEventListener('click', () => {
            // 切换到产品库页面
            this.switchToPage('product-library');
            modalOverlay.remove();
        });

        buttonContainer.appendChild(closeBtn);
        buttonContainer.appendChild(viewBtn);

        modalContent.appendChild(iconContainer);
        modalContent.appendChild(title);
        modalContent.appendChild(content);
        modalContent.appendChild(buttonContainer);

        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);

        // 点击背景关闭弹窗
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.remove();
            }
        });

        // ESC键关闭弹窗
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                modalOverlay.remove();
                document.removeEventListener('keydown', handleKeyDown);
            }
        };
        document.addEventListener('keydown', handleKeyDown);

        // 显示Toast通知
        this.showToast('商品数据采集成功！');
    }

    // 显示Toast通知
    showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: var(--color-card-background);
            color: var(--color-text-primary);
            padding: 12px 16px;
            border-radius: 6px;
            box-shadow: var(--shadow-hover);
            z-index: 1001;
            font-size: 14px;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new HomePage();
});
