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
            isActive: false,
            closable: pageData.closable !== false // 默认为true，除非明确设置为false
        };
        
        this.tabs.push(tab);
        this.setActiveTab(tabId);
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

        return isActiveTab;
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

    // 根据页面类型和特定参数查找Tab（用于产品详情等需要区分不同实例的页面）
    findTabByPageTypeAndParam(pageType, paramKey, paramValue) {
        return this.tabs.find(tab => 
            tab.pageType === pageType && 
            tab.pageData && 
            tab.pageData[paramKey] === paramValue
        );
    }
}

// 首页应用逻辑
class HomePage {
    constructor() {
        this.currentTheme = 'light';
        this.activePage = 'home';
        this.isResizing = false;
        this.tabManager = new TabManager();
        this.topBar = null; // TopBar组件实例
        this.sideBar = null; // SideBar组件实例
        this.pageContainer = null; // PageContainer组件实例
        this.settingsModal = null; // SettingsModal组件实例
        this.productCountRefreshTimer = null; // 产品总数刷新定时器
        this.productLibraryRefreshTimer = null; // 产品库刷新定时器
        this.currentSortField = 'collectTime';
        this.currentSortOrder = 'desc';
        this.currentPage = 1;
        this.itemsPerPage = 100;
        this.init();
    }

    async init() {
        this.loadTheme();
        this.detectEnvironment();
        await this.initComponents();
        this.bindEvents();
        this.renderTabs();
        this.applyStoredSettings();
        this.setupIPCListeners();
        
        // 延迟设置关于菜单监听器，确保DOM完全加载
        setTimeout(() => {
            this.setupAboutMenuListener();
        }, 100);
        
        // 设置全局引用，供TabManager使用
        window.homePageInstance = this;
    }

    // 加载主题
    loadTheme() {
        const savedTheme = localStorage.getItem('app-theme') || 'auto';
        this.setTheme(savedTheme);
        
        // 应用存储的背景色
        const savedBgColor = localStorage.getItem('app-background-color') || 'default';
        this.setBackgroundColor(savedBgColor);
    }

    // 设置主题
    setTheme(theme) {
        this.currentTheme = theme;
        const themeColors = document.getElementById('theme-colors');
        const root = document.documentElement;
        
        // 移除现有主题类
        root.classList.remove('theme-light', 'theme-dark', 'theme-auto');
        
        if (theme === 'auto') {
            // 跟随系统主题
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const actualTheme = prefersDark ? 'dark' : 'light';
            themeColors.href = `theme/${actualTheme}/colors.css`;
            root.classList.add(`theme-${actualTheme}`);
            
            // 监听系统主题变化
            this.setupSystemThemeListener();
        } else {
            // 使用指定主题
            themeColors.href = `theme/${theme}/colors.css`;
            root.classList.add(`theme-${theme}`);
        }
        
        // 重新应用背景色，确保主题切换后背景色仍然有效
        const savedBgColor = localStorage.getItem('app-background-color') || 'default';
        this.setBackgroundColor(savedBgColor);
        
        localStorage.setItem('app-theme', theme);
    }

    // 设置背景色
    setBackgroundColor(bgColor) {
        const root = document.documentElement;
        
        // 移除现有背景色类
        root.classList.remove('bg-default', 'bg-blue', 'bg-green', 'bg-purple', 'bg-orange', 'bg-pink', 'bg-gray', 'bg-indigo');
        
        // 添加新背景色类
        root.classList.add(`bg-${bgColor}`);
        
        // 保存到localStorage
        localStorage.setItem('app-background-color', bgColor);
        
        console.log('背景色已切换为:', bgColor);
    }

    // 设置系统主题监听器
    setupSystemThemeListener() {
        if (this.systemThemeListener) {
            this.systemThemeListener.removeEventListener('change', this.handleSystemThemeChange);
        }
        
        this.systemThemeListener = window.matchMedia('(prefers-color-scheme: dark)');
        this.handleSystemThemeChange = () => {
            if (this.currentTheme === 'auto') {
                const prefersDark = this.systemThemeListener.matches;
                const actualTheme = prefersDark ? 'dark' : 'light';
                const themeColors = document.getElementById('theme-colors');
                const root = document.documentElement;
                
                root.classList.remove('theme-light', 'theme-dark');
                root.classList.add(`theme-${actualTheme}`);
                themeColors.href = `theme/${actualTheme}/colors.css`;
                
                // 重新应用背景色，确保系统主题切换后背景色仍然有效
                const savedBgColor = localStorage.getItem('app-background-color') || 'default';
                this.setBackgroundColor(savedBgColor);
            }
        };
        
        this.systemThemeListener.addEventListener('change', this.handleSystemThemeChange);
    }


    // 初始化所有组件
    async initComponents() {
        this.initTopBar();
        this.initSideBar();
        await this.initPageContainer();
        this.initSettingsModal();
    }

    // 初始化TopBar组件
    initTopBar() {
        // 创建TopBar组件实例
        this.topBar = new TopBar();
        
        // 设置Tab管理器
        this.topBar.setTabManager(this.tabManager);
        
        // 设置设置按钮回调
        this.topBar.setSettingsCallback(() => {
            this.openSettingsModal();
        });
        
        // 设置Tab切换回调
        this.topBar.setTabSwitchCallback((tab) => {
            this.handleTabSwitch(tab);
        });
    }

    // 初始化SideBar组件
    initSideBar() {
        // 创建SideBar组件实例
        this.sideBar = new SideBar();
        
        // 设置导航回调
        this.sideBar.setNavigationCallback((page) => {
            this.navigateToPage(page);
        });
    }

    // 初始化PageContainer组件
    async initPageContainer() {
        // 创建PageContainer组件实例
        this.pageContainer = new PageContainer();
        
        // 只渲染PageContainer的HTML结构，不渲染具体页面内容
        this.pageContainer.render();
    }

    // 初始化SettingsModal组件
    initSettingsModal() {
        // 创建SettingsModal组件实例
        this.settingsModal = new SettingsModal();
        
        // 设置回调
        this.settingsModal.setCallbacks({
            onSave: (settings) => {
                this.handleSettingsSave(settings);
            },
            onCancel: () => {
                console.log('设置已取消');
            },
            onThemeChange: (theme) => {
                this.setTheme(theme);
            }
        });
    }

    // 检测运行环境
    detectEnvironment() {
        // 环境检测现在由TopBar组件处理
    }

    // 绑定事件
    bindEvents() {
        // Tab切换事件监听
        this.bindTabSwitchEvents();
        
        // 设置键盘快捷键
        this.setupKeyboardShortcuts();

        // 窗口控制按钮事件
        this.setupWindowControls();

        // 产品标题点击事件委托
        document.addEventListener('click', (e) => {
            const productName = e.target.closest('.product-name.clickable');
            if (productName) {
                const goodsId = productName.dataset.goodsId;
                if (goodsId) {
                    console.log('打开产品详情:', goodsId);
                    this.viewProductDetail(goodsId);
                }
            }
        });

        // 监听系统主题变化
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (this.currentTheme === 'system') {
                this.setTheme('system');
            }
        });
    }


    // 绑定Tab事件
    bindTabSwitchEvents() {
        // 监听Tab切换事件
        document.addEventListener('tabSwitch', (event) => {
            const { tab } = event.detail;
            
            // 根据Tab类型更新页面内容
            this.handleTabSwitch(tab);
        });
    }
    
    // 处理Tab切换
    handleTabSwitch(tab) {
        // 避免重复处理相同Tab
        if (this.lastHandledTabId === tab.id) {
            return;
        }
        
        this.lastHandledTabId = tab.id;
        
        // 根据页面类型更新侧边栏状态
        if (this.sideBar) {
            this.sideBar.updateSidebarForTab(tab);
        }
        
        // 根据Tab类型渲染对应的页面内容
        this.renderPageContent(tab.pageData.type, tab.pageData);
        
        // 根据Tab类型管理产品总数刷新
        if (tab.pageType === 'home') {
            // 切换到首页，按需刷新产品总数
            this.refreshProductCountIfNeeded();
        } else if (tab.pageType === 'product-library') {
            // 切换到产品库，触发一次刷新
            this.loadProductLibrary();
        }
    }
    
    // 设置键盘快捷键
    setupKeyboardShortcuts() {
        // 注册Tab管理快捷键
        window.keyboardShortcutManager.register('ctrl+w', (e) => {
            this.handleCloseShortcut();
        }, 'global', '关闭当前Tab或窗口');

        window.keyboardShortcutManager.register('ctrl+tab', (e) => {
            this.switchToNextTab();
        }, 'global', '切换到下一个Tab');

        window.keyboardShortcutManager.register('ctrl+shift+tab', (e) => {
            this.switchToPreviousTab();
        }, 'global', '切换到上一个Tab');
    }

    /**
     * 处理关闭快捷键 (⌘/Ctrl+W)
     * 如果有可关闭的Tab，则关闭当前Tab
     * 如果没有可关闭的Tab，则关闭窗口
     */
    handleCloseShortcut() {
        // 查找可关闭的Tab
        const closableTabs = this.tabManager.tabs.filter(tab => tab.closable);
        
        if (closableTabs.length > 0) {
            // 有可关闭的Tab，关闭当前活动Tab（如果它是可关闭的）
            const activeTab = this.tabManager.getActiveTab();
            if (activeTab && activeTab.closable) {
                this.tabManager.closeTab(activeTab.id);
                this.renderTabs();
                // 触发Tab切换事件
                const newActiveTab = this.tabManager.getActiveTab();
                if (newActiveTab) {
                    this.tabManager.onTabSwitch(newActiveTab);
                }
            }
        } else {
            // 没有可关闭的Tab，关闭窗口
            if (window.electronAPI && window.electronAPI.windowAPI) {
                window.electronAPI.windowAPI.close();
            }
        }
    }

    /**
     * 为弹窗注册ESC键关闭功能
     * @param {string} context - 上下文名称
     * @param {Function} closeHandler - 关闭处理函数
     */
    registerModalEscKey(context, closeHandler) {
        window.keyboardShortcutManager.register('escape', closeHandler, context, '关闭弹窗');
    }

    /**
     * 注销弹窗ESC键关闭功能
     * @param {string} context - 上下文名称
     */
    unregisterModalEscKey(context) {
        window.keyboardShortcutManager.unregisterContext(context);
    }
    
    // 切换到下一个Tab
    switchToNextTab() {
        const activeTab = this.tabManager.getActiveTab();
        if (!activeTab) return;
        
        const currentIndex = this.tabManager.tabs.findIndex(tab => tab.id === activeTab.id);
        const nextIndex = (currentIndex + 1) % this.tabManager.tabs.length;
        
        this.tabManager.setActiveTab(this.tabManager.tabs[nextIndex].id);
        this.renderTabs();
        this.tabManager.onTabSwitch(this.tabManager.tabs[nextIndex]);
    }
    
    // 切换到上一个Tab
    switchToPreviousTab() {
        const activeTab = this.tabManager.getActiveTab();
        if (!activeTab) return;
        
        const currentIndex = this.tabManager.tabs.findIndex(tab => tab.id === activeTab.id);
        const prevIndex = currentIndex === 0 ? this.tabManager.tabs.length - 1 : currentIndex - 1;
        
        this.tabManager.setActiveTab(this.tabManager.tabs[prevIndex].id);
        this.renderTabs();
        this.tabManager.onTabSwitch(this.tabManager.tabs[prevIndex]);
    }


    // 导航到页面
    navigateToPage(page) {
        // 定义页面数据
        const pageDataMap = {
            'home': { type: 'home', title: '首页', closable: false }, // 首页不支持关闭
            'product-library': { type: 'goodsList', title: '产品库', closable: true } // 产品库支持关闭
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
            this.renderTabs();
            // 触发Tab切换事件
            this.tabManager.onTabSwitch(existingTab);
            // 如果是产品库页面，触发一次刷新
            if (page === 'product-library') {
                this.loadProductLibrary();
            }
        } else {
            // 如果不存在，创建新Tab
            const newTabId = this.tabManager.addTab(pageData);
            this.renderTabs();
            // 触发新Tab的切换事件
            const newTab = this.tabManager.tabs.find(t => t.id === newTabId);
            if (newTab) {
                this.tabManager.onTabSwitch(newTab);
                // 如果是产品库页面，触发一次刷新
                if (page === 'product-library') {
                    this.loadProductLibrary();
                }
            }
        }
        
        // 更新侧边栏选中状态
        if (this.sideBar) {
            this.sideBar.updateActiveState(page);
        }

        // 更新当前页面
        this.activePage = page;
        
        // 如果是产品库页面，加载产品数据
        if (page === 'product-library') {
            this.loadProductLibrary();
        }
    }


    // 渲染Tabs（使用TopBar组件）
    renderTabs() {
        // 初始化首页Tab
        if (this.tabManager.tabs.length === 0) {
            const homeTab = this.tabManager.addTab({
                type: 'home',
                title: '首页',
                closable: false, // 首页不支持关闭
                pageData: { type: 'home', title: '首页' }
            });
            
            // 触发首页Tab的切换事件
            const tab = this.tabManager.tabs.find(t => t.id === homeTab);
            if (tab) {
                this.tabManager.onTabSwitch(tab);
            }
        }
        
        // 使用TopBar组件渲染Tabs
        if (this.topBar) {
            this.topBar.renderTabs();
        }
    }

    // 更新侧边栏激活状态
    updateSidebarActiveState() {
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-page="${this.activePage}"]`)?.classList.add('active');
    }

    // 更新侧边栏状态（辅助方法）
    updateSidebarForTab(tab) {
        // 更新侧边栏状态
        if (this.sideBar) {
            this.sideBar.updateSidebarForTab(tab);
        }
    }

    // 渲染页面内容
    async renderPageContent(pageType, pageData = null) {
        // 避免重复渲染相同内容
        const renderKey = `${pageType}_${pageData?.productId || 'default'}`;
        if (this.lastRenderKey === renderKey) {
            return;
        }
        
        this.lastRenderKey = renderKey;
        
        if (!this.pageContainer) {
            console.error('PageContainer组件未初始化');
            return;
        }
        
        switch (pageType) {
            case 'home':
                console.log('渲染首页');
                await this.pageContainer.renderHomePage();
                break;
            case 'goodsList':
                this.loadProductLibrary();
                break;
            case 'productDetail':
                console.log('渲染产品详情页');
                // 产品详情页需要根据productId重新加载数据
                if (pageData && pageData.productId) {
                    console.log('根据productId加载产品详情:', pageData.productId);
                    this.loadProductDetailByGoodsId(pageData.productId);
                } else if (this.currentProductDetail) {
                    console.log('使用当前产品详情数据');
                    await this.pageContainer.renderProductDetail(this.currentProductDetail);
                } else {
                    console.warn('没有产品详情数据');
                }
                break;
            default:
                console.warn('未知的页面类型:', pageType);
        }
    }
    


    // 根据Tab更新侧边栏状态
    updateSidebarForTab(tab) {
        // 清除所有侧边栏项的激活状态
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // 根据Tab类型设置对应的侧边栏项为激活状态
        let targetPage = null;
        switch (tab.pageData.type) {
            case 'home':
                targetPage = 'home';
                break;
            case 'goodsList':
                targetPage = 'product-library';
                break;
            case 'productDetail':
                // 产品详情页不更新侧边栏状态，保持当前状态
                return;
        }
        
        if (targetPage) {
            const sidebarItem = document.querySelector(`[data-page="${targetPage}"]`);
            if (sidebarItem) {
                sidebarItem.classList.add('active');
                this.activePage = targetPage;
            }
        }
    }




    // 加载仪表板数据
    loadDashboardData() {
        this.loadProductCount();
        // 初始化页面可见性监听（用于App前后台切换时刷新）
        this.initVisibilityListener();
    }

    // 加载产品总数
    async loadProductCount() {
        try {
            // 通过API获取产品总数
            const response = await fetch('http://localhost:3001/api/products/count');
            if (response.ok) {
                const data = await response.json();
                document.getElementById('product-count').textContent = data.count || 0;
                console.log('产品总数已更新:', data.count);
            } else {
                console.error('获取产品总数失败:', response.status);
                document.getElementById('product-count').textContent = '0';
            }
        } catch (error) {
            console.error('获取产品总数失败:', error);
            document.getElementById('product-count').textContent = '0';
        }
    }

    // 按需刷新产品总数（已移除定时刷新）
    refreshProductCountIfNeeded() {
        // 只有在首页时才刷新
        if (this.isOnHomePage()) {
            console.log('按需刷新产品总数...');
            this.loadProductCount();
        }
    }

    // 初始化页面可见性监听
    initVisibilityListener() {
        // 如果已经初始化过，直接返回
        if (this.visibilityListenerInitialized) {
            return;
        }

        // 绑定事件处理函数，以便后续可以正确移除
        this.handleVisibilityChange = () => {
            if (!document.hidden && this.isOnHomePage()) {
                console.log('App从后台切换到前台，刷新产品总数');
                this.loadProductCount();
            }
        };

        this.handleWindowFocus = () => {
            if (this.isOnHomePage()) {
                console.log('窗口获得焦点，刷新产品总数');
                this.loadProductCount();
            }
        };

        // 监听页面可见性变化（App从后台到前台）
        document.addEventListener('visibilitychange', this.handleVisibilityChange);

        // 监听窗口焦点变化（作为备用）
        window.addEventListener('focus', this.handleWindowFocus);

        // 标记为已初始化
        this.visibilityListenerInitialized = true;
        console.log('页面可见性监听器已初始化');
    }

    // 检查是否在首页
    isOnHomePage() {
        const activeTab = this.tabManager.getActiveTab();
        return activeTab && activeTab.pageType === 'home';
    }

    // 检查是否在产品库页面
    isOnProductLibraryPage() {
        const activeTab = this.tabManager.getActiveTab();
        return activeTab && activeTab.pageData && activeTab.pageData.type === 'goodsList';
    }

    // 加载产品库数据
    async loadProductLibrary() {
        // 避免重复加载
        if (this.isLoadingProductLibrary) {
            return;
        }
        
        this.isLoadingProductLibrary = true;
        
        try {
            console.log('开始加载产品库数据...');
            
            // 通过API获取产品列表
            const response = await fetch('http://localhost:3001/api/products');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // 对产品进行排序
                    const sortedProducts = this.sortProducts(data.products);
                    
                    // 分页处理
                    const paginatedProducts = this.paginateProducts(sortedProducts);
                    
                    await this.renderProductLibrary(paginatedProducts, data.products.length);
                    console.log('产品库数据加载成功:', data.products.length, '个产品');
                    
                } else {
                    console.error('获取产品列表失败:', data.error);
                    this.showProductLibraryError('获取产品列表失败');
                }
            } else {
                console.error('获取产品列表失败:', response.status);
                this.showProductLibraryError('网络请求失败');
            }
        } catch (error) {
            console.error('加载产品库数据失败:', error);
            this.showProductLibraryError('加载数据失败');
        } finally {
            this.isLoadingProductLibrary = false;
        }
    }

    // 渲染产品库表格
    async renderProductLibrary(products, totalCount = 0) {
        if (this.pageContainer) {
            await this.pageContainer.renderProductLibrary(products, totalCount);
        }
    }


    // 获取产品价格
    getProductPrice(product) {
        if (product.skuList && product.skuList.length > 0) {
            const sku = product.skuList[0];
            return sku.goodsPromoPrice || sku.goodsNormalPrice || '价格未知';
        }
        return '价格未知';
    }

    // 获取昨日销量
    getYesterdaySales(product) {
        if (product.yesterdaySales !== undefined) {
            return Math.round(product.yesterdaySales).toLocaleString() + '件';
        }
        return '-';
    }

    // 获取价格增长百分比
    getPriceGrowthPercent(product) {
        if (product.priceGrowthPercent !== undefined) {
            const percent = product.priceGrowthPercent;
            const sign = percent >= 0 ? '+' : '';
            return `${sign}${percent.toFixed(1)}%`;
        }
        return '-';
    }

    // 截断文本
    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // 排序产品
    sortProducts(products) {
        return products.sort((a, b) => {
            let aValue, bValue;
            
            switch (this.currentSortField) {
                case 'goodsCat3':
                    aValue = (a.goodsCat3 || '').toLowerCase();
                    bValue = (b.goodsCat3 || '').toLowerCase();
                    break;
                case 'yesterdaySales':
                    aValue = a.yesterdaySales || 0;
                    bValue = b.yesterdaySales || 0;
                    break;
                case 'priceGrowthPercent':
                    aValue = a.priceGrowthPercent || 0;
                    bValue = b.priceGrowthPercent || 0;
                    break;
                case 'collectTime':
                default:
                    aValue = new Date(a.collectTime || 0);
                    bValue = new Date(b.collectTime || 0);
                    break;
            }
            
            if (aValue < bValue) return this.currentSortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return this.currentSortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // 分页产品
    paginateProducts(products) {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return products.slice(startIndex, endIndex);
    }

    // 启动产品库自动刷新
    startProductLibraryRefresh() {
        // 清除现有定时器
        this.stopProductLibraryRefresh();
        
        // 设置新的定时器，每5秒刷新一次
        this.productLibraryRefreshTimer = setInterval(() => {
            // 只有在产品库页面时才执行刷新
            if (this.isOnProductLibraryPage()) {
                console.log('自动刷新产品库数据...');
                this.loadProductLibrary();
            }
        }, 5000);
    }

    // 停止产品库自动刷新
    stopProductLibraryRefresh() {
        if (this.productLibraryRefreshTimer) {
            clearInterval(this.productLibraryRefreshTimer);
            this.productLibraryRefreshTimer = null;
        }
    }

    // 绑定排序事件
    bindSortEvents() {
        const sortableHeaders = document.querySelectorAll('.product-table th.sortable');
        sortableHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const sortField = header.dataset.sort;
                this.handleSort(sortField);
            });
        });
    }

    // 处理排序
    handleSort(field) {
        if (this.currentSortField === field) {
            // 切换排序顺序
            this.currentSortOrder = this.currentSortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            // 设置新的排序字段，默认为降序
            this.currentSortField = field;
            this.currentSortOrder = 'desc';
        }
        
        // 更新表头样式
        this.updateSortHeaders();
        
        // 重新加载数据
        this.loadProductLibrary();
    }

    // 更新排序表头样式
    updateSortHeaders() {
        const sortableHeaders = document.querySelectorAll('.product-table th.sortable');
        sortableHeaders.forEach(header => {
            header.classList.remove('sort-asc', 'sort-desc');
            if (header.dataset.sort === this.currentSortField) {
                header.classList.add(`sort-${this.currentSortOrder}`);
            }
        });
    }

    // 格式化采集时间
    formatCollectTime(collectTime) {
        if (!collectTime) return '未知时间';
        
        try {
            const date = new Date(collectTime);
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return collectTime;
        }
    }

    // 刷新产品库功能已移除

    // 查看产品详情
    async viewProductDetail(goodsId) {
        // 避免重复加载相同产品
        if (this.isLoadingProductDetail && this.loadingProductId === goodsId) {
            return;
        }
        
        this.isLoadingProductDetail = true;
        this.loadingProductId = goodsId;
        
        console.log('查看产品详情:', goodsId);
        
        try {
            // 获取产品详情数据
            const response = await fetch(`http://localhost:3001/api/products/${goodsId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // 创建产品详情Tab
                    await this.openProductDetailTab(data.product);
                } else {
                    this.showToast('获取产品详情失败: ' + data.error);
                }
            } else if (response.status === 404) {
                this.showToast(`商品ID ${goodsId} 不存在，请先采集该商品数据`, 'warning');
            } else {
                this.showToast('获取产品详情失败: ' + response.status);
            }
        } catch (error) {
            console.error('获取产品详情失败:', error);
            this.showToast('获取产品详情失败: ' + error.message);
        } finally {
            this.isLoadingProductDetail = false;
            this.loadingProductId = null;
        }
    }

    // 打开产品详情Tab
    async openProductDetailTab(product) {
        // 检查是否已存在该产品的详情Tab（根据商品ID查找）
        const existingTab = this.tabManager.findTabByPageTypeAndParam('productDetail', 'productId', product.goodsId);
        if (existingTab) {
            // 如果存在，切换到该Tab并更新数据
            this.tabManager.setActiveTab(existingTab.id);
            this.renderTabs();
            this.tabManager.onTabSwitch(existingTab);
            await this.loadProductDetailData(product);
        } else {
            // 如果不存在，创建新Tab
            const pageData = {
                type: 'productDetail',
                title: `产品详情 - ${product.goodsCat3 || product.goodsTitleEn || product.goodsId}`,
                closable: true, // 产品详情支持关闭
                productId: product.goodsId
            };
            const newTabId = this.tabManager.addTab(pageData);
            this.renderTabs();
            // 触发新Tab的切换事件
            const newTab = this.tabManager.tabs.find(t => t.id === newTabId);
            if (newTab) {
                this.tabManager.onTabSwitch(newTab);
            }
            await this.loadProductDetailData(product);
        }
    }

    // 加载产品详情数据
    async loadProductDetailData(product) {
        this.currentProductDetail = product;
        // 使用PageContainer组件渲染产品详情
        if (this.pageContainer) {
            await this.pageContainer.renderProductDetail(product);
        }
    }

    // 根据商品ID加载产品详情
    async loadProductDetailByGoodsId(goodsId) {
        // 避免重复加载相同产品
        if (this.isLoadingProductDetailByGoodsId && this.loadingProductIdByGoodsId === goodsId) {
            return;
        }
        
        this.isLoadingProductDetailByGoodsId = true;
        this.loadingProductIdByGoodsId = goodsId;
        
        console.log('根据商品ID加载产品详情:', goodsId);
        
        try {
            const response = await fetch(`http://localhost:3001/api/products/${goodsId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    await this.loadProductDetailData(data.product);
                } else {
                    this.showToast('获取产品详情失败: ' + data.error);
                }
            } else {
                this.showToast('获取产品详情失败: ' + response.status);
            }
        } catch (error) {
            console.error('获取产品详情失败:', error);
            this.showToast('获取产品详情失败: ' + error.message);
        } finally {
            this.isLoadingProductDetailByGoodsId = false;
            this.loadingProductIdByGoodsId = null;
        }
    }

    // 导航到产品详情（供其他组件调用）
    async navigateToProductDetail(goodsId) {
        await this.loadProductDetailByGoodsId(goodsId);
    }

    
    // 初始化附件卡片组件
    async initAttachmentCard(goodsId) {
        const attachmentsList = document.getElementById('attachments-list');
        if (!attachmentsList) return;
        
        // 等待AttachmentCard组件加载
        if (typeof attachmentCardInstance !== 'undefined') {
            await attachmentCardInstance.init(goodsId, attachmentsList);
        } else {
            console.error('AttachmentCard组件未加载');
            attachmentsList.innerHTML = '<div class="error-attachments">组件加载失败</div>';
        }
    }
    
    // 格式化日期
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    
    // 初始化URL相关功能
    initUrlFeatures() {
        const copyBtn = document.getElementById('copy-url-btn');
        const urlLink = document.getElementById('collect-url-link');
        
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                this.copyUrlToClipboard();
            });
        }
        
        if (urlLink) {
            urlLink.addEventListener('click', (e) => {
                // 如果链接是占位符，阻止默认行为
                if (urlLink.href === '#' || urlLink.textContent === '暂无采集链接') {
                    e.preventDefault();
                    this.showToast('暂无有效的采集链接', 'warning');
                }
            });
        }
    }
    
    // 复制URL到剪贴板
    async copyUrlToClipboard() {
        const urlLink = document.getElementById('collect-url-link');
        if (!urlLink) return;
        
        const url = urlLink.href;
        if (url === '#' || urlLink.textContent === '暂无采集链接') {
            this.showToast('暂无有效的采集链接', 'warning');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(url);
            this.showToast('链接已复制到剪贴板', 'success');
            
            // 更新按钮状态
            const copyBtn = document.getElementById('copy-url-btn');
            if (copyBtn) {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = '✅';
                copyBtn.style.backgroundColor = '#28a745';
                
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.style.backgroundColor = '';
                }, 2000);
            }
        } catch (error) {
            console.error('复制失败:', error);
            this.showToast('复制失败，请手动复制', 'error');
        }
    }
    
    // 显示Toast通知
    showToast(message, type = 'info') {
        // 创建toast元素
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // 添加样式
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '6px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '10000',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });
        
        // 根据类型设置背景色
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        toast.style.backgroundColor = colors[type] || colors.info;
        
        // 添加到页面
        document.body.appendChild(toast);
        
        // 显示动画
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // 自动隐藏
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    /**
     * 显示视频右键菜单
     * @param {Event} event - 右键事件
     * @param {number} index - 视频索引
     * @param {string} videoName - 视频名称
     * @param {string} videoPath - 视频路径
     */
    showVideoContextMenu(event, index, videoName, videoPath) {
        event.preventDefault();
        
        // 移除现有的右键菜单
        this.hideVideoContextMenu();
        
        // 创建右键菜单
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.id = 'home-video-context-menu';
        
        // 根据平台显示不同的文本
        const platform = navigator.platform.toLowerCase();
        const showInFinderText = platform.includes('mac') ? '在 Finder 中显示' : '在文件夹中显示';
        
        contextMenu.innerHTML = `
            <div class="context-menu-item" onclick="homePageInstance.showVideoInFinder(${index}, '${videoName}', '${videoPath}')">
                <span>${showInFinderText}</span>
            </div>
            <div class="context-menu-item" onclick="homePageInstance.saveVideoAs(${index}, '${videoName}', '${videoPath}')">
                <span>另存为</span>
            </div>
            <div class="context-menu-item context-menu-item-danger" onclick="homePageInstance.moveVideoToTrash(${index}, '${videoName}', '${videoPath}')">
                <span>移到废纸篓</span>
            </div>
        `;
        
        // 设置菜单位置
        contextMenu.style.position = 'fixed';
        contextMenu.style.left = event.clientX + 'px';
        contextMenu.style.top = event.clientY + 'px';
        contextMenu.style.zIndex = '10000';
        
        // 添加到页面
        document.body.appendChild(contextMenu);
        
        // 点击其他地方隐藏菜单
        setTimeout(() => {
            document.addEventListener('click', this.hideVideoContextMenu.bind(this), { once: true });
        }, 0);
    }

    /**
     * 隐藏视频右键菜单
     */
    hideVideoContextMenu() {
        const contextMenu = document.getElementById('home-video-context-menu');
        if (contextMenu) {
            contextMenu.remove();
        }
    }

    /**
     * 在 Finder/文件夹中显示视频文件
     * @param {number} index - 视频索引
     * @param {string} videoName - 视频名称
     * @param {string} videoPath - 视频路径
     */
    async showVideoInFinder(index, videoName, videoPath) {
        try {
            // 如果没有文件路径，尝试构建路径
            let fullPath = videoPath;
            if (!fullPath) {
                console.error('无法确定视频文件路径');
                return;
            }
            
            // 调用 Electron API
            const result = await window.electronAPI.fileAPI.showInFinder(fullPath);
            
            if (result.success) {
                console.log('视频文件已在 Finder/文件夹中显示');
            } else {
                console.error('显示视频文件失败:', result.error);
            }
        } catch (error) {
            console.error('显示视频文件在 Finder 中失败:', error);
        } finally {
            // 隐藏右键菜单
            this.hideVideoContextMenu();
        }
    }

    /**
     * 另存为视频文件
     * @param {number} index - 视频索引
     * @param {string} videoName - 视频名称
     * @param {string} videoPath - 视频路径
     */
    async saveVideoAs(index, videoName, videoPath) {
        try {
            // 如果没有文件路径，尝试构建路径
            let fullPath = videoPath;
            if (!fullPath) {
                console.error('无法确定视频文件路径');
                return;
            }
            
            // 调用 Electron API 另存为
            const result = await window.electronAPI.fileAPI.saveAs(fullPath, videoName);
            
            if (result.success) {
                console.log('视频文件另存为成功');
            } else {
                console.error('另存为失败:', result.error);
            }
        } catch (error) {
            console.error('另存为失败:', error);
        } finally {
            // 隐藏右键菜单
            this.hideVideoContextMenu();
        }
    }

    /**
     * 移动视频文件到废纸篓
     * @param {number} index - 视频索引
     * @param {string} videoName - 视频名称
     * @param {string} videoPath - 视频路径
     */
    async moveVideoToTrash(index, videoName, videoPath) {
        try {
            // 确认删除操作
            const confirmed = confirm(`确定要将视频文件 "${videoName}" 移到废纸篓吗？\n\n此操作不可撤销。`);
            if (!confirmed) {
                this.hideVideoContextMenu();
                return;
            }

            // 如果没有文件路径，尝试构建路径
            let fullPath = videoPath;
            if (!fullPath) {
                console.error('无法确定视频文件路径');
                alert('无法确定视频文件路径，请检查文件是否存在');
                return;
            }
            
            console.log('准备删除视频文件到废纸篓:', fullPath);
            
            // 调用 Electron API 删除文件到废纸篓
            const result = await window.electronAPI.fileAPI.moveToTrash(fullPath);
            
            if (result.success) {
                console.log('视频文件已移动到废纸篓');
                
                // 显示成功提示
                if (window.showToast) {
                    window.showToast('视频文件已移动到废纸篓', 'success');
                } else {
                    alert('视频文件已移动到废纸篓');
                }
            } else {
                console.error('删除视频文件失败:', result.error);
                alert('删除视频文件失败: ' + result.error);
            }
        } catch (error) {
            console.error('删除视频文件失败:', error);
            alert('删除视频文件失败: ' + error.message);
        } finally {
            // 隐藏右键菜单
            this.hideVideoContextMenu();
        }
    }

    // 渲染媒体内容
    renderMediaContent(product) {
        let mediaHTML = '<div class="media-grid">';
        
        // 合并图片和视频数据
        const mediaItems = [];
        
        // 添加视频
        if (product.videos && product.videos.length > 0) {
            product.videos.forEach(video => {
                mediaItems.push({
                    ...video,
                    type: 'video'
                });
            });
        }
        
        // 添加图片
        if (product.images && product.images.length > 0) {
            product.images.forEach(image => {
                mediaItems.push({
                    ...image,
                    type: 'image'
                });
            });
        }
        
        if (mediaItems.length > 0) {
            mediaHTML += '<div class="media-section">';
            mediaHTML += '<h4 class="section-subtitle">媒体资源</h4>';
            mediaHTML += '<div id="home-media-card-container"></div>';
            mediaHTML += '</div>';
        } else {
            mediaHTML += '<div class="no-media">暂无媒体资源</div>';
        }
        
        mediaHTML += '</div>';
        return mediaHTML;
    }

    // 渲染产品信息
    renderProductInfo(product) {
        let infoHTML = '<div class="product-info-grid">';
        
        // 基本信息
        infoHTML += '<div class="info-section">';
        infoHTML += '<h4 class="section-subtitle">基本信息</h4>';
        infoHTML += '<div class="info-list">';
        infoHTML += `<div class="info-item"><span class="label">商品ID:</span><span class="value">${product.goodsId}</span></div>`;
        if (product.itemId) {
            infoHTML += `<div class="info-item"><span class="label">商品编号:</span><span class="value">${product.itemId}</span></div>`;
        }
        if (product.goodsCat1) {
            infoHTML += `<div class="info-item"><span class="label">分类1:</span><span class="value">${product.goodsCat1}</span></div>`;
        }
        if (product.goodsCat2) {
            infoHTML += `<div class="info-item"><span class="label">分类2:</span><span class="value">${product.goodsCat2}</span></div>`;
        }
        if (product.goodsCat3) {
            infoHTML += `<div class="info-item"><span class="label">商品名称:</span><span class="value">${product.goodsCat3}</span></div>`;
        }
        infoHTML += '</div></div>';
        
        // 价格信息
        if (product.skuList && product.skuList.length > 0) {
            infoHTML += '<div class="info-section">';
            infoHTML += '<h4 class="section-subtitle">价格信息</h4>';
            infoHTML += '<div class="info-list">';
            product.skuList.forEach((sku, index) => {
                infoHTML += `<div class="info-item"><span class="label">SKU ${index + 1}:</span><span class="value">${sku.skuName || '未知'}</span></div>`;
                if (sku.goodsPromoPrice) {
                    infoHTML += `<div class="info-item"><span class="label">促销价:</span><span class="value price">${sku.goodsPromoPrice}</span></div>`;
                }
                if (sku.goodsNormalPrice) {
                    infoHTML += `<div class="info-item"><span class="label">原价:</span><span class="value price">${sku.goodsNormalPrice}</span></div>`;
                }
            });
            infoHTML += '</div></div>';
        }
        
        // 销量信息
        infoHTML += '<div class="info-section">';
        infoHTML += '<h4 class="section-subtitle">销量信息</h4>';
        infoHTML += '<div class="info-list">';
        infoHTML += `<div class="info-item"><span class="label">销量:</span><span class="value">${Math.round(product.goodsSold || 0).toLocaleString()}</span></div>`;
        if (product.collectTime) {
            infoHTML += `<div class="info-item"><span class="label">采集时间:</span><span class="value">${this.formatCollectTime(product.collectTime)}</span></div>`;
        }
        infoHTML += '</div></div>';
        
        // 商品属性
        if (product.goodsPropertyInfo) {
            infoHTML += '<div class="info-section">';
            infoHTML += '<h4>商品属性</h4>';
            infoHTML += '<div class="info-list">';
            Object.entries(product.goodsPropertyInfo).forEach(([key, value]) => {
                infoHTML += `<div class="info-item"><span class="label">${key}:</span><span class="value">${value}</span></div>`;
            });
            infoHTML += '</div></div>';
        }
        
        // 店铺信息
        if (product.storeData) {
            infoHTML += '<div class="info-section">';
            infoHTML += '<h4>店铺信息</h4>';
            infoHTML += '<div class="info-list">';
            if (product.storeName) {
                infoHTML += `<div class="info-item"><span class="label">店铺名称:</span><span class="value">${product.storeName}</span></div>`;
            }
            if (product.storeData.storeRating) {
                infoHTML += `<div class="info-item"><span class="label">店铺评分:</span><span class="value">${product.storeData.storeRating}</span></div>`;
            }
            if (product.storeData.storeSold) {
                infoHTML += `<div class="info-item"><span class="label">店铺销量:</span><span class="value">${Math.round(product.storeData.storeSold).toLocaleString()}</span></div>`;
            }
            infoHTML += '</div></div>';
        }
        
        infoHTML += '</div>';
        return infoHTML;
    }

    // 渲染产品图表
    async renderProductChart(product) {
        // 检查Chart.js是否已加载
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js未加载，无法显示图表');
            return;
        }
        
        try {
            // 从API获取真实趋势数据
            const response = await fetch(`http://localhost:3001/api/products/${product.goodsId}/trend`);
            if (response.ok) {
                const result = await response.json();
                const chartData = result.trendData;
                
                // 渲染3个独立的图表
                this.renderSalesChart(chartData);
                this.renderPriceChart(chartData);
                this.renderRatingChart(chartData);
            } else {
                // 如果API调用失败，使用本地生成的数据
                console.warn('无法获取真实趋势数据，使用本地数据');
        const mockData = this.generateMockChartData(product);
                this.renderSalesChart(mockData);
                this.renderPriceChart(mockData);
                this.renderRatingChart(mockData);
            }
        } catch (error) {
            console.error('获取趋势数据失败:', error);
            // 如果API调用失败，使用本地生成的数据
            const mockData = this.generateMockChartData(product);
            this.renderSalesChart(mockData);
            this.renderPriceChart(mockData);
            this.renderRatingChart(mockData);
        }
    }
    
    // 渲染销量图表
    renderSalesChart(chartData) {
        const ctx = document.getElementById('sales-chart');
        if (!ctx) return;
        
        // 销毁现有图表
        if (this.salesChart) {
            this.salesChart.destroy();
        }
        
        // 统一使用折线图
        const chartType = 'line';
        
        this.salesChart = new Chart(ctx, {
            type: chartType,
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: '销量',
                    data: chartData.sales,
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: 'rgba(255, 255, 255, 0.8)',
                    pointBorderColor: 'rgba(255, 255, 255, 0.8)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                font: {
                    family: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: '日期',
                            font: {
                                family: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                            },
                            color: 'var(--color-text-secondary)'
                        },
                        ticks: {
                            color: 'var(--color-text-secondary)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: '销量',
                            font: {
                                family: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                            },
                            color: 'var(--color-text-secondary)'
                        },
                        ticks: {
                            color: 'var(--color-text-secondary)',
                            stepSize: 1,
                            callback: function(value) {
                                return Math.round(value);
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: {
                                family: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                            },
                            color: 'var(--color-text-secondary)',
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    }
                }
            }
        });
    }
    
    // 渲染价格图表
    renderPriceChart(chartData) {
        const ctx = document.getElementById('price-chart');
        if (!ctx) return;
        
        // 销毁现有图表
        if (this.priceChart) {
            this.priceChart.destroy();
        }
        
        // 统一使用折线图
        const chartType = 'line';
        
        this.priceChart = new Chart(ctx, {
            type: chartType,
            data: {
                labels: chartData.labels,
                datasets: [
                    {
                        label: '促销价',
                        data: chartData.promoPrice,
                        borderColor: 'rgba(255, 255, 255, 0.6)',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: 'rgba(255, 255, 255, 0.6)',
                        pointBorderColor: 'rgba(255, 255, 255, 0.6)',
                        borderWidth: 2
                    },
                    {
                        label: '原价',
                        data: chartData.normalPrice,
                        borderColor: 'rgba(255, 255, 255, 0.4)',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: 'rgba(255, 255, 255, 0.4)',
                        pointBorderColor: 'rgba(255, 255, 255, 0.4)',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                font: {
                    family: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: '日期',
                            font: {
                                family: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                            },
                            color: 'var(--color-text-secondary)'
                        },
                        ticks: {
                            color: 'var(--color-text-secondary)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: '价格 (元)',
                            font: {
                                family: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                            },
                            color: 'var(--color-text-secondary)'
                        },
                        ticks: {
                            color: 'var(--color-text-secondary)',
                            stepSize: 1,
                            callback: function(value) {
                                return Math.round(value);
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                family: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                            },
                            color: 'var(--color-text-secondary)'
                        }
                    }
                }
            }
        });
    }
    
    // 渲染评分图表
    renderRatingChart(chartData) {
        const ctx = document.getElementById('rating-chart');
        if (!ctx) return;
        
        // 销毁现有图表
        if (this.ratingChart) {
            this.ratingChart.destroy();
        }
        
        // 统一使用折线图
        const chartType = 'line';
        
        this.ratingChart = new Chart(ctx, {
            type: chartType,
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: '评分',
                    data: chartData.rating,
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: 'rgba(255, 255, 255, 0.5)',
                    pointBorderColor: 'rgba(255, 255, 255, 0.5)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                font: {
                    family: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: '日期',
                            font: {
                                family: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                            },
                            color: 'var(--color-text-secondary)'
                        },
                        ticks: {
                            color: 'var(--color-text-secondary)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        display: true,
                        min: 0,
                        max: 5,
                        title: {
                            display: true,
                            text: '评分',
                            font: {
                                family: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                            },
                            color: 'var(--color-text-secondary)'
                        },
                        ticks: {
                            color: 'var(--color-text-secondary)',
                            stepSize: 1,
                            callback: function(value) {
                                return Math.round(value);
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: {
                                family: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                            },
                            color: 'var(--color-text-secondary)',
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    }
                }
            }
        });
    }
    
    // 创建图表的通用方法
    createChart(ctx, chartData, title) {
        // 检查数据点数量，决定图表类型
        // 统一使用折线图
        const chartType = 'line';
        
        this.productChart = new Chart(ctx, {
            type: chartType,
            data: {
                labels: chartData.labels,
                datasets: [
                    {
                        label: '销量',
                        data: chartData.sales,
                        borderColor: 'rgba(255, 255, 255, 0.8)',
                        backgroundColor: isSinglePoint ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.1)',
                        tension: 0.4,
                        yAxisID: 'y',
                        pointRadius: isSinglePoint ? 8 : 4,
                        pointHoverRadius: isSinglePoint ? 10 : 6
                    },
                    {
                        label: '促销价',
                        data: chartData.promoPrice,
                        borderColor: 'rgba(255, 255, 255, 0.6)',
                        backgroundColor: isSinglePoint ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.05)',
                        tension: 0.4,
                        yAxisID: 'y1',
                        pointRadius: isSinglePoint ? 8 : 4,
                        pointHoverRadius: isSinglePoint ? 10 : 6
                    },
                    {
                        label: '原价',
                        data: chartData.normalPrice,
                        borderColor: 'rgba(255, 255, 255, 0.4)',
                        backgroundColor: isSinglePoint ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.02)',
                        tension: 0.4,
                        yAxisID: 'y1',
                        pointRadius: isSinglePoint ? 8 : 4,
                        pointHoverRadius: isSinglePoint ? 10 : 6
                    },
                    {
                        label: '评分',
                        data: chartData.rating,
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        backgroundColor: isSinglePoint ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.03)',
                        tension: 0.4,
                        yAxisID: 'y2',
                        pointRadius: isSinglePoint ? 8 : 4,
                        pointHoverRadius: isSinglePoint ? 10 : 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                font: {
                    family: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                },
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: '日期',
                            font: {
                                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif'
                            }
                        },
                        ticks: {
                            font: {
                                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif'
                            }
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: '销量',
                            font: {
                                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif'
                            }
                        },
                        ticks: {
                            font: {
                                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif'
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: '价格 (元)',
                            font: {
                                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif'
                            }
                        },
                        ticks: {
                            font: {
                                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif'
                            }
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    },
                    y2: {
                        type: 'linear',
                        display: false,
                        min: 0,
                        max: 5
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif'
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: title,
                        font: {
                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                if (isSinglePoint) {
                                    return '当前数据';
                                }
                                return context[0].label;
                            }
                        }
                    }
                }
            }
        });
    }

    // 生成基于真实数据的图表数据（备用方案）
    generateMockChartData(product) {
        const data = {
            labels: [],
            sales: [],
            promoPrice: [],
            normalPrice: [],
            rating: []
        };
        
        // 获取真实数据
        const realSales = Math.round(product.goodsSold || 0);
        const realPromoPrice = this.extractPrice(product.skuList?.[0]?.goodsPromoPrice);
        const realNormalPrice = this.extractPrice(product.skuList?.[0]?.goodsNormalPrice);
        const realRating = product.storeData?.storeRating || 0;
        
        // 获取采集时间
        const collectTime = product.collectTime;
        let displayDate;
        
        if (collectTime) {
            // 解析采集时间
            const collectDate = new Date(collectTime);
            displayDate = collectDate.toLocaleDateString('zh-CN', { 
                month: '2-digit', 
                day: '2-digit',
                year: '2-digit'
            });
        } else {
            // 如果没有采集时间，使用当前日期
            displayDate = new Date().toLocaleDateString('zh-CN', { 
                month: '2-digit', 
                day: '2-digit',
                year: '2-digit'
            });
        }
        
        // 只显示真实的数据点
        data.labels.push(displayDate);
        data.sales.push(realSales);
        data.promoPrice.push(realPromoPrice);
        data.normalPrice.push(realNormalPrice);
        data.rating.push(realRating);
        
        return data;
    }

    // 提取价格数值
    extractPrice(priceStr) {
        if (!priceStr) return 0;
        const match = priceStr.match(/[\d.]+/);
        return match ? parseFloat(match[0]) : 0;
    }

    // 渲染简化图表
    renderSimpleChart(canvas, data) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // 清空画布
        ctx.clearRect(0, 0, width, height);
        
        // 绘制背景（透明）
        ctx.fillStyle = 'transparent';
        ctx.fillRect(0, 0, width, height);
        
        // 绘制网格线
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        // 绘制纵线
        for (let i = 0; i <= 10; i++) {
            const x = (width / 10) * i;
            ctx.beginPath();
            ctx.moveTo(x, 20);
            ctx.lineTo(x, height - 20);
            ctx.stroke();
        }
        
        // 绘制横线
        for (let i = 0; i <= 5; i++) {
            const y = 20 + (height - 40) / 5 * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // 绘制图例
        const legendY = height - 10;
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(10, legendY - 2, 15, 2);
        ctx.fillText('销量', 30, legendY);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillRect(80, legendY - 2, 15, 2);
        ctx.fillText('促销价', 100, legendY);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(150, legendY - 2, 15, 2);
        ctx.fillText('原价', 170, legendY);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(200, legendY - 2, 15, 2);
        ctx.fillText('评分', 220, legendY);
    }


    // 返回产品库
    goBackToProductLibrary() {
        // 切换到产品库Tab
        const productLibraryTab = this.tabManager.findTabByPageType('goodsList');
        if (productLibraryTab) {
            this.tabManager.setActiveTab(productLibraryTab.id);
            this.tabManager.renderTabs();
        }
    }

    // 显示产品库错误
    showProductLibraryError(message) {
        const pageContainer = document.getElementById('page-container');
        pageContainer.innerHTML = `
            <div class="error-page">
                <div class="error-icon">
                    <i class="ph ph-warning"></i>
                </div>
                <div class="error-message">${message}</div>
                <button class="btn btn-primary" onclick="homePageInstance.loadProductLibrary()">
                    重试
                </button>
            </div>
        `;
    }

    // 设置关于菜单监听器
    setupAboutMenuListener() {
        console.log('设置关于菜单监听器');
        const handleAboutMenu = () => {
            console.log('收到关于菜单事件');
            this.showAboutDialog();
        };
        
        window.addEventListener('menu-about', handleAboutMenu);
        
        // 保存引用以便清理
        this.handleAboutMenu = handleAboutMenu;
    }

    // 显示关于弹窗
    showAboutDialog() {
        console.log('显示关于弹窗');
        // 创建弹窗遮罩
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'about-modal';
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
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        `;

        // 创建弹窗内容
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: var(--color-card-background, #ffffff);
            border-radius: 12px;
            padding: 32px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            border: 1px solid var(--color-border, #e5e7eb);
        `;

        modalContent.innerHTML = `
            <div style="margin-bottom: 24px;">
                <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
                <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 600; color: var(--color-text-primary, #1f2937);">关于 Hanli</h2>
                <p style="margin: 0; font-size: 16px; color: var(--color-text-secondary, #6b7280); line-height: 1.5;">这是一个产品管理App</p>
            </div>
            <button id="about-ok-btn" style="
                background: var(--color-primary, #3b82f6);
                color: white;
                border: none;
                border-radius: 8px;
                padding: 12px 24px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                min-width: 100px;
            " onmouseover="this.style.background='var(--color-primary-hover, #2563eb)'" onmouseout="this.style.background='var(--color-primary, #3b82f6)'">
                我知道了
            </button>
        `;

        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);

        // 绑定关闭事件
        const closeModal = () => {
            document.body.removeChild(modalOverlay);
        };

        // 点击遮罩关闭
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });

        // 点击按钮关闭
        const okBtn = modalContent.querySelector('#about-ok-btn');
        okBtn.addEventListener('click', closeModal);

        // 注册ESC键关闭
        this.registerModalEscKey('about-modal', () => {
            closeModal();
            this.unregisterModalEscKey('about-modal');
        });
    }

    // 清理资源
    cleanup() {
        // 移除事件监听器
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        window.removeEventListener('focus', this.handleWindowFocus);
        if (this.handleAboutMenu) {
            window.removeEventListener('menu-about', this.handleAboutMenu);
        }
        
        if (this.topBar) {
            this.topBar.destroy();
        }
        
        if (this.sideBar) {
            this.sideBar.destroy();
        }
        
        if (this.pageContainer) {
            this.pageContainer.destroy();
        }
        
        if (this.settingsModal) {
            this.settingsModal.destroy();
        }
    }

    // 设置窗口控制按钮
    setupWindowControls() {
        // 关闭按钮
        const closeBtn = document.getElementById('close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (window.electronAPI && window.electronAPI.windowAPI) {
                    window.electronAPI.windowAPI.close();
                }
            });
        }

        // 最小化按钮
        const minimizeBtn = document.getElementById('minimize-btn');
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => {
                if (window.electronAPI && window.electronAPI.windowAPI) {
                    window.electronAPI.windowAPI.minimize();
                }
            });
        }

        // 全屏按钮
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                if (window.electronAPI && window.electronAPI.windowAPI) {
                    window.electronAPI.windowAPI.toggleFullscreen();
                }
            });
        }
    }

    // 打开系统设置弹窗
    openSettingsModal() {
        if (this.settingsModal) {
            this.settingsModal.open();
        }
    }

    // 处理设置保存
    handleSettingsSave(settings) {
        console.log('设置已保存:', settings);
        
        // 应用主题设置
        if (settings.theme) {
            this.setTheme(settings.theme);
        }
        
        // 应用背景色设置
        if (settings.backgroundColor) {
            this.setBackgroundColor(settings.backgroundColor);
        }
        
        // 应用其他设置
        this.applyStoredSettings();
    }

    // 显示系统设置弹窗
    showSettingsModal() {
        try {
            // 创建模态框
            const modal = document.createElement('div');
            modal.className = 'settings-modal';
            modal.innerHTML = this.generateSettingsModalHTML();
            document.body.appendChild(modal);

            // 绑定事件
            this.bindSettingsModalEvents(modal);
            
            console.log('系统设置弹窗已打开');
        } catch (error) {
            console.error('打开系统设置弹窗失败:', error);
            this.showToast('打开设置失败，请重试');
        }
    }

    // 生成系统设置弹窗HTML
    generateSettingsModalHTML() {
        const currentTheme = this.getCurrentTheme();
        
        return `
            <div class="modal-overlay" onclick="homePageInstance.closeSettingsModal()">
                <div class="modal-content settings-modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h2 class="modal-title">系统设置</h2>
                        <button class="modal-close" onclick="homePageInstance.closeSettingsModal()">
                            <i class="ph ph-x"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="settings-section">
                            <h3 class="section-title">外观设置</h3>
                            
                            <div class="setting-item">
                                <label class="setting-label">主题模式</label>
                                <div class="setting-control">
                                    <div class="theme-selector">
                                        <label class="theme-option ${currentTheme === 'light' ? 'active' : ''}" data-theme="light">
                                            <input type="radio" name="theme" value="light" ${currentTheme === 'light' ? 'checked' : ''}>
                                            <span class="theme-preview light-theme">
                                                <div class="preview-header"></div>
                                                <div class="preview-content"></div>
                                            </span>
                                            <span class="theme-name">浅色主题</span>
                                        </label>
                                        
                                        <label class="theme-option ${currentTheme === 'dark' ? 'active' : ''}" data-theme="dark">
                                            <input type="radio" name="theme" value="dark" ${currentTheme === 'dark' ? 'checked' : ''}>
                                            <span class="theme-preview dark-theme">
                                                <div class="preview-header"></div>
                                                <div class="preview-content"></div>
                                            </span>
                                            <span class="theme-name">深色主题</span>
                                        </label>
                                        
                                        <label class="theme-option ${currentTheme === 'auto' ? 'active' : ''}" data-theme="auto">
                                            <input type="radio" name="theme" value="auto" ${currentTheme === 'auto' ? 'checked' : ''}>
                                            <span class="theme-preview auto-theme">
                                                <div class="preview-header"></div>
                                                <div class="preview-content"></div>
                                            </span>
                                            <span class="theme-name">跟随系统</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="setting-item">
                                <label class="setting-label">语言设置</label>
                                <div class="setting-control">
                                    <select class="setting-select" id="language-select">
                                        <option value="zh-CN">简体中文</option>
                                        <option value="en-US">English</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="settings-section">
                            <h3 class="section-title">功能设置</h3>
                            
                            <div class="setting-item">
                                <label class="setting-label">自动刷新产品数据</label>
                                <div class="setting-control">
                                    <label class="switch">
                                        <input type="checkbox" id="auto-refresh" checked>
                                        <span class="slider"></span>
                                    </label>
                                    <span class="setting-description">在首页时每5秒自动刷新产品总数</span>
                                </div>
                            </div>
                            
                            <div class="setting-item">
                                <label class="setting-label">显示采集时间</label>
                                <div class="setting-control">
                                    <label class="switch">
                                        <input type="checkbox" id="show-collect-time" checked>
                                        <span class="slider"></span>
                                    </label>
                                    <span class="setting-description">在产品列表中显示采集时间</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="settings-section">
                            <h3 class="section-title">数据设置</h3>
                            
                            <div class="setting-item">
                                <label class="setting-label">数据存储路径</label>
                                <div class="setting-control">
                                    <input type="text" class="setting-input" id="data-path" value="${this.getDataPath()}" readonly>
                                    <button class="btn btn-sm btn-secondary" onclick="homePageInstance.openDataFolder()">打开文件夹</button>
                                </div>
                            </div>
                            
                            <div class="setting-item">
                                <label class="setting-label">缓存管理</label>
                                <div class="setting-control">
                                    <button class="btn btn-sm btn-warning" onclick="homePageInstance.clearCache()">清理缓存</button>
                                    <span class="setting-description">清理临时文件和缓存数据</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="homePageInstance.closeSettingsModal()">取消</button>
                        <button class="btn btn-primary" onclick="homePageInstance.saveSettings()">保存设置</button>
                    </div>
                </div>
            </div>
        `;
    }

    // 绑定系统设置弹窗事件
    bindSettingsModalEvents(modal) {
        // 主题选择事件
        const themeOptions = modal.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // 移除其他选项的active类
                themeOptions.forEach(opt => opt.classList.remove('active'));
                // 添加当前选项的active类
                option.classList.add('active');
                // 选中对应的radio
                const radio = option.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                    // 预览主题效果
                    this.previewTheme(radio.value);
                }
            });
        });

        // 语言选择事件
        const languageSelect = modal.querySelector('#language-select');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                console.log('语言设置变更:', e.target.value);
            });
        }

        // 开关事件
        const switches = modal.querySelectorAll('.switch input[type="checkbox"]');
        switches.forEach(switchEl => {
            switchEl.addEventListener('change', (e) => {
                console.log('设置变更:', e.target.id, e.target.checked);
            });
        });

        // 按钮事件
        const cancelBtn = modal.querySelector('.btn-secondary');
        const saveBtn = modal.querySelector('.btn-primary');
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeSettingsModal();
            });
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.saveSettings();
            });
        }

        // 模态框关闭事件
        const modalOverlay = modal.querySelector('.modal-overlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    this.closeSettingsModal();
                }
            });
        }

        // 关闭按钮事件
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeSettingsModal();
            });
        }

        // 注册ESC键关闭
        this.registerModalEscKey('settings-modal', () => {
            this.closeSettingsModal();
            this.unregisterModalEscKey('settings-modal');
        });
    }

    // 预览主题效果
    previewTheme(theme) {
        const root = document.documentElement;
        
        // 移除现有主题类
        root.classList.remove('theme-light', 'theme-dark', 'theme-auto');
        
        // 添加新主题类
        if (theme === 'auto') {
            // 跟随系统主题
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
        } else {
            root.classList.add(`theme-${theme}`);
        }
    }

    // 获取当前主题
    getCurrentTheme() {
        return localStorage.getItem('app-theme') || 'auto';
    }

    // 获取数据存储路径
    getDataPath() {
        // 这里应该从主进程获取实际的数据路径
        return '/Users/chiuyu/Projects/hanli-master/hanli-app/data';
    }

    // 关闭系统设置弹窗
    closeSettingsModal() {
        const modal = document.querySelector('.settings-modal');
        if (modal) {
            // 清理事件监听器
            const modalOverlay = modal.querySelector('.modal-overlay');
            if (modalOverlay) {
                modalOverlay.replaceWith(modalOverlay.cloneNode(true));
            }
            
            // 移除模态框
            modal.remove();
        }
        
        // 恢复原始主题
        this.applyStoredTheme();
        
        console.log('系统设置弹窗已关闭');
    }

    // 保存设置
    saveSettings() {
        const modal = document.querySelector('.settings-modal');
        if (!modal) {
            console.warn('设置弹窗不存在，无法保存设置');
            return;
        }

        try {
            // 获取主题设置
            const selectedThemeRadio = modal.querySelector('input[name="theme"]:checked');
            if (selectedThemeRadio) {
                const selectedTheme = selectedThemeRadio.value;
                localStorage.setItem('app-theme', selectedTheme);
                console.log('主题设置已保存:', selectedTheme);
            }

            // 获取语言设置
            const languageSelect = modal.querySelector('#language-select');
            if (languageSelect) {
                const language = languageSelect.value;
                localStorage.setItem('app-language', language);
                console.log('语言设置已保存:', language);
            }

            // 获取功能设置
            const autoRefreshCheckbox = modal.querySelector('#auto-refresh');
            const showCollectTimeCheckbox = modal.querySelector('#show-collect-time');
            
            if (autoRefreshCheckbox) {
                const autoRefresh = autoRefreshCheckbox.checked;
                localStorage.setItem('app-auto-refresh', autoRefresh.toString());
                console.log('自动刷新设置已保存:', autoRefresh);
            }
            
            if (showCollectTimeCheckbox) {
                const showCollectTime = showCollectTimeCheckbox.checked;
                localStorage.setItem('app-show-collect-time', showCollectTime.toString());
                console.log('显示采集时间设置已保存:', showCollectTime);
            }

            // 应用设置
            this.applyStoredTheme();
            this.applyStoredSettings();

            // 显示保存成功提示
            this.showToast('设置已保存');

            // 关闭弹窗
            this.closeSettingsModal();
            
        } catch (error) {
            console.error('保存设置时发生错误:', error);
            this.showToast('保存设置失败，请重试');
        }
    }

    // 应用存储的主题
    applyStoredTheme() {
        const theme = this.getCurrentTheme();
        this.setTheme(theme);
    }

    // 应用存储的设置
    applyStoredSettings() {
        // 应用自动刷新设置（已改为按需刷新）
        const autoRefresh = localStorage.getItem('app-auto-refresh') === 'true';
        if (autoRefresh && this.isOnHomePage()) {
            // 按需刷新产品总数
            this.refreshProductCountIfNeeded();
        }
    }

    // 打开数据文件夹
    openDataFolder() {
        // 这里应该调用主进程API打开文件夹
        console.log('打开数据文件夹');
        this.showToast('正在打开数据文件夹...');
    }

    // 清理缓存
    clearCache() {
        if (confirm('确定要清理缓存吗？这将删除所有临时文件。')) {
            // 这里应该调用主进程API清理缓存
            console.log('清理缓存');
            this.showToast('缓存清理完成');
        }
    }

    // 设置IPC监听器
    setupIPCListeners() {
        // 如果已经初始化过，直接返回
        if (this.ipcListenersInitialized) {
            return;
        }

        console.log('开始设置IPC监听器...');
        
        // 监听来自主进程的商品详情页打开请求
        if (window.electronAPI) {
            console.log('electronAPI可用，设置监听器');
            
            // 监听商品详情页打开请求
            window.addEventListener('navigate-to-product', (event) => {
                console.log('收到商品详情页打开请求:', event.detail);
                this.showProductDetailModal(event.detail);
            });
            
            // 监听来自主进程的open-product-detail事件
            window.electronAPI.onOpenProductDetail((event, data) => {
                console.log('收到打开产品详情页请求:', data);
                if (data && data.goodsId) {
                    console.log('准备打开产品详情页，商品ID:', data.goodsId);
                    this.viewProductDetail(data.goodsId);
                } else {
                    console.warn('收到open-product-detail事件，但数据无效:', data);
                }
            });
            
            // 标记为已初始化
            this.ipcListenersInitialized = true;
            console.log('IPC监听器已设置完成');
        } else {
            console.error('electronAPI不可用，无法设置IPC监听器');
        }
    }

    // 初始化媒体卡片组件
    async initMediaCard() {
        try {
            const mediaContainer = document.getElementById('home-media-card-container');
            if (mediaContainer && this.currentProductDetail) {
                // 合并图片和视频数据
                const mediaItems = [];
                
                // 添加视频
                if (this.currentProductDetail.videos && this.currentProductDetail.videos.length > 0) {
                    this.currentProductDetail.videos.forEach(video => {
                        mediaItems.push({
                            ...video,
                            type: 'video'
                        });
                    });
                }
                
                // 添加图片
                if (this.currentProductDetail.images && this.currentProductDetail.images.length > 0) {
                    this.currentProductDetail.images.forEach(image => {
                        mediaItems.push({
                            ...image,
                            type: 'image'
                        });
                    });
                }
                
                if (mediaItems.length > 0) {
                    if (typeof MediaCard !== 'undefined') {
                        this.mediaCard = new MediaCard();
                        this.mediaCard.init(
                            mediaContainer, 
                            mediaItems, 
                            {
                                goodsId: this.currentProductDetail.goodsId,
                                onSelectionChange: (selectedItems) => {
                                    console.log('媒体选择变化:', selectedItems);
                                },
                                onVideoContextMenu: (event, index, fileName, filePath) => {
                                    this.showVideoContextMenu(event, index, fileName, filePath);
                                }
                            }
                        );
                    } else {
                        console.error('MediaCard组件未加载');
                        mediaContainer.innerHTML = '<div class="no-media">媒体卡片组件加载失败</div>';
                    }
                }
            }
        } catch (error) {
            console.error('初始化媒体卡片组件失败:', error);
            const mediaContainer = document.getElementById('home-media-card-container');
            if (mediaContainer) {
                mediaContainer.innerHTML = '<div class="no-media">媒体卡片组件初始化失败</div>';
            }
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
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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

        // 注册ESC键关闭
        this.registerModalEscKey('product-detail-modal', () => {
            modalOverlay.remove();
            this.unregisterModalEscKey('product-detail-modal');
        });

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
let homePageInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
    homePageInstance = new HomePage();
    await homePageInstance.init();
});

// 页面卸载时清理资源
window.addEventListener('beforeunload', () => {
    if (homePageInstance) {
        homePageInstance.cleanup();
    }
});
