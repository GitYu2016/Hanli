// 页面图标定义 - 使用 Phosphor Icons
const PAGE_ICONS = {
    home: `<i class="ph ph-house"></i>`,
    goodsDetail: `<i class="ph ph-image"></i>`,
    goodsList: `<i class="ph ph-package"></i>`
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
                        <div class="tab-close">
                            <i class="ph ph-x"></i>
                        </div>
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
                // 通知HomePage实例进行页面切换
                if (window.homePageInstance) {
                    window.homePageInstance.handleTabSwitch(tab);
                }
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
        this.productCountRefreshTimer = null; // 产品总数刷新定时器
        this.productLibraryRefreshTimer = null; // 产品库刷新定时器
        this.currentSortField = 'collectTime';
        this.currentSortOrder = 'desc';
        this.currentPage = 1;
        this.itemsPerPage = 100;
        this.init();
    }

    init() {
        this.loadTheme();
        this.detectEnvironment();
        this.bindEvents();
        this.renderTabs();
        // 使用HTML中的静态首页，不需要调用renderHomePage()
        this.loadDashboardData();
        this.applyStoredSettings();
        this.setupIPCListeners();
        
        // 设置全局引用，供TabManager使用
        window.homePageInstance = this;
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
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.openSettingsModal();
            });
        }

        // 3个点菜单点击事件
        const menuDots = document.getElementById('menu-dots');
        if (menuDots) {
            menuDots.addEventListener('click', () => {
                this.openMenuDots();
            });
        }


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
        
        // 根据Tab类型管理产品总数刷新
        if (tab.pageType === 'home') {
            // 切换到首页，启动定时刷新
            this.startProductCountRefresh();
        } else {
            // 离开首页，停止定时刷新
            this.stopProductCountRefresh();
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
            // 手动触发页面内容渲染
            this.renderPageContent(pageData.type);
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
        
        // 如果是产品库页面，加载产品数据
        if (page === 'product-library') {
            this.loadProductLibrary();
        }
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

    // 处理Tab切换
    handleTabSwitch(tab) {
        console.log('处理Tab切换:', tab);
        
        // 根据Tab类型渲染对应的页面内容
        this.renderPageContent(tab.pageData.type);
        
        // 更新侧边栏状态
        this.updateSidebarForTab(tab);
    }

    // 渲染页面内容
    renderPageContent(pageType) {
        console.log('渲染页面内容:', pageType);
        
        switch (pageType) {
            case 'home':
                // 首页使用HTML中的静态内容，恢复原始HTML
                this.restoreHomePage();
                // 确保数据加载正确
                this.loadDashboardData();
                break;
            case 'goodsList':
                this.loadProductLibrary();
                break;
            case 'productDetail':
                // 产品详情页已经在Tab切换时处理了数据加载
                if (this.currentProductDetail) {
                    this.renderProductDetailPage(this.currentProductDetail);
                }
                break;
            default:
                console.warn('未知的页面类型:', pageType);
        }
    }
    
    // 恢复首页HTML内容
    restoreHomePage() {
        const pageContainer = document.getElementById('page-container');
        pageContainer.innerHTML = `
            <div class="page-content">
                <div class="welcome-section">
                    <h1 class="welcome-title">欢迎使用Hanli</h1>
                    <p class="welcome-desc">高效管理您的产品信息、图片资源和数据分析</p>
                </div>
                
                <div class="dashboard-grid">
                    <div class="dashboard-card">
                        <div class="card-icon">
                            <i class="ph ph-package"></i>
                        </div>
                        <div class="card-title">产品总数</div>
                        <div class="card-value" id="product-count">0</div>
                    </div>
                </div>
            </div>
        `;
    }

    // 渲染首页
    renderHomePage() {
        const pageContainer = document.getElementById('page-container');
        pageContainer.innerHTML = `
            <div class="page-content">
                <div class="welcome-section">
                    <h1 class="welcome-title">欢迎使用Hanli</h1>
                    <p class="welcome-subtitle">产品管理系统</p>
                </div>
                
                <div class="dashboard-stats">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="ph ph-package"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-number" id="product-count">-</div>
                            <div class="stat-label">产品总数</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-content">
                            <div class="stat-number">-</div>
                            <div class="stat-label">今日采集</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-content">
                            <div class="stat-number">-</div>
                            <div class="stat-label">平均评分</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 加载首页数据
        this.loadDashboardData();
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
        this.startProductCountRefresh();
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

    // 开始产品总数定时刷新
    startProductCountRefresh() {
        // 清除现有定时器
        this.stopProductCountRefresh();
        
        // 设置5秒定时刷新
        this.productCountRefreshTimer = setInterval(() => {
            // 只有在首页且没有其他活动Tab时才刷新
            if (this.isOnHomePage()) {
                console.log('定时刷新产品总数...');
                this.loadProductCount();
            }
        }, 5000);
        
        console.log('产品总数定时刷新已启动，间隔5秒');
    }

    // 停止产品总数定时刷新
    stopProductCountRefresh() {
        if (this.productCountRefreshTimer) {
            clearInterval(this.productCountRefreshTimer);
            this.productCountRefreshTimer = null;
            console.log('产品总数定时刷新已停止');
        }
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
                    
                    this.renderProductLibrary(paginatedProducts, data.products.length);
                    console.log('产品库数据加载成功:', data.products.length, '个产品');
                    
                    // 只有在产品库页面时才启动自动刷新
                    if (this.isOnProductLibraryPage()) {
                        this.startProductLibraryRefresh();
                    }
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
        }
    }

    // 渲染产品库表格
    renderProductLibrary(products, totalCount = 0) {
        const pageContainer = document.getElementById('page-container');
        
        // 创建产品库页面内容
        const productLibraryHTML = `
            <div class="product-library-page">
                <div class="page-header">
                    <h1 class="page-title">产品库</h1>
                    <div class="page-actions">
                        <button class="btn btn-primary" onclick="homePageInstance.refreshProductLibrary()">
                            <i class="ph ph-arrow-clockwise"></i> 刷新
                        </button>
                    </div>
                </div>
                
                <div class="product-table-container">
                    <table class="product-table">
                        <thead>
                            <tr>
                                <th class="sortable" data-sort="goodsCat3">产品标题</th>
                                <th class="sortable" data-sort="yesterdaySales">昨日销量</th>
                                <th class="sortable" data-sort="priceGrowthPercent">价格增长</th>
                                <th class="sortable" data-sort="collectTime">采集日期</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody id="product-table-body">
                            ${this.generateProductTableRows(products)}
                        </tbody>
                    </table>
                </div>
                
                <div class="product-summary">
                    <div class="summary-item">
                        <span class="summary-label">总产品数:</span>
                        <span class="summary-value">${totalCount}</span>
                    </div>
                    <div class="pagination-info">
                        <span>第 <strong>${this.currentPage}</strong> 页，共 <strong>${Math.ceil(totalCount / this.itemsPerPage)}</strong> 页</span>
                    </div>
                </div>
            </div>
        `;
        
        pageContainer.innerHTML = productLibraryHTML;
        
        // 绑定排序事件
        this.bindSortEvents();
    }

    // 生成产品表格行
    generateProductTableRows(products) {
        return products.map(product => {
            const goodsCat3 = product.goodsCat3 || product.goodsTitleEn || '未知商品';
            const yesterdaySales = this.getYesterdaySales(product);
            const priceGrowthPercent = this.getPriceGrowthPercent(product);
            const collectTime = this.formatCollectTime(product.collectTime);
            
            return `
                <tr class="product-row" data-goods-id="${product.goodsId}">
                    <td class="product-name" title="${goodsCat3}">
                        <div class="name-content">${this.truncateText(goodsCat3, 50)}</div>
                    </td>
                    <td class="product-sales">${yesterdaySales}</td>
                    <td class="product-price-growth ${priceGrowthPercent.startsWith('+') ? 'positive' : priceGrowthPercent.startsWith('-') ? 'negative' : ''}">${priceGrowthPercent}</td>
                    <td class="product-time">${collectTime}</td>
                    <td class="product-actions">
                        <button class="btn btn-sm btn-primary" onclick="homePageInstance.viewProductDetail('${product.goodsId}')">
                            查看详情
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
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
            return product.yesterdaySales.toLocaleString() + '件';
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

    // 刷新产品库
    async refreshProductLibrary() {
        console.log('刷新产品库...');
        await this.loadProductLibrary();
        this.showToast('产品库已刷新');
    }

    // 查看产品详情
    async viewProductDetail(goodsId) {
        console.log('查看产品详情:', goodsId);
        
        try {
            // 获取产品详情数据
            const response = await fetch(`http://localhost:3001/api/products/${goodsId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // 创建产品详情Tab
                    this.openProductDetailTab(data.product);
                } else {
                    this.showToast('获取产品详情失败: ' + data.error);
                }
            } else {
                this.showToast('获取产品详情失败: ' + response.status);
            }
        } catch (error) {
            console.error('获取产品详情失败:', error);
            this.showToast('获取产品详情失败: ' + error.message);
        }
    }

    // 打开产品详情Tab
    openProductDetailTab(product) {
        // 检查是否已存在该产品的详情Tab
        const existingTab = this.tabManager.findTabByPageType('productDetail');
        if (existingTab) {
            // 如果存在，切换到该Tab并更新数据
            this.tabManager.setActiveTab(existingTab.id);
            this.tabManager.renderTabs();
            this.loadProductDetailData(product);
        } else {
            // 如果不存在，创建新Tab
            const pageData = {
                type: 'productDetail',
                title: `产品详情 - ${product.goodsCat3 || product.goodsTitleEn || product.goodsId}`,
                productId: product.goodsId
            };
            this.tabManager.addTab(pageData);
            this.loadProductDetailData(product);
        }
    }

    // 加载产品详情数据
    loadProductDetailData(product) {
        this.currentProductDetail = product;
        this.renderProductDetailPage(product);
    }

    // 渲染产品详情页面
    renderProductDetailPage(product) {
        const pageContainer = document.getElementById('page-container');
        
        const productDetailHTML = `
            <div class="product-detail-page">
                <div class="page-header">
                    <h1 class="page-title">产品详情</h1>
                </div>
                
                <div class="product-detail-content">
                    <!-- 第一个卡片：图表 -->
                    <div class="detail-section">
                        <h3 class="section-title">数据趋势</h3>
                        
                        <!-- 销量图表 -->
                        <div class="detail-card chart-card">
                            <div class="card-header">
                                <h4 class="chart-title">销量趋势</h4>
                            </div>
                            <div class="card-content">
                                <div class="chart-container">
                                    <canvas id="sales-chart" width="800" height="200"></canvas>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 价格图表 -->
                        <div class="detail-card chart-card">
                            <div class="card-header">
                                <h4 class="chart-title">价格趋势</h4>
                            </div>
                            <div class="card-content">
                                <div class="chart-container">
                                    <canvas id="price-chart" width="800" height="200"></canvas>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 评分图表 -->
                        <div class="detail-card chart-card">
                            <div class="card-header">
                                <h4 class="chart-title">评分趋势</h4>
                            </div>
                            <div class="card-content">
                                <div class="chart-container">
                                    <canvas id="rating-chart" width="800" height="200"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 第二个卡片：采集信息 -->
                    <div class="detail-section">
                        <h3 class="section-title">采集信息</h3>
                        <div class="detail-card">
                            <div class="card-content">
                                <div class="url-section">
                                    <div class="url-label">采集链接：</div>
                                    <div class="url-container">
                                        <a href="${product.goodsInfo?.collectUrl || '#'}" 
                                           class="url-link" 
                                           target="_blank" 
                                           rel="noopener noreferrer"
                                           id="collect-url-link">
                                            ${product.goodsInfo?.collectUrl || '暂无采集链接'}
                                        </a>
                                        <button class="copy-btn" id="copy-url-btn" title="复制链接">
                                            <i class="ph ph-copy"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="collect-time">
                                    <span class="time-label">采集时间：</span>
                                    <span class="time-value">${product.goodsInfo?.collectTime || product.monitoring?.collectTime || '未知'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 第三个卡片：媒体 -->
                    <div class="detail-section">
                        <h3 class="section-title">媒体资源</h3>
                        <div class="detail-card media-card">
                            <div class="card-content">
                                ${this.renderMediaContent(product)}
                            </div>
                        </div>
                    </div>
                    
                    <!-- 第三个卡片：产品信息 -->
                    <div class="detail-section">
                        <h3 class="section-title">产品信息</h3>
                        <div class="detail-card info-card">
                            <div class="card-content">
                                ${this.renderProductInfo(product)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        pageContainer.innerHTML = productDetailHTML;
        
        // 渲染图表
        this.renderProductChart(product);
        
        // 初始化URL功能
        this.initUrlFeatures();
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

    // 渲染媒体内容
    renderMediaContent(product) {
        let mediaHTML = '<div class="media-grid">';
        
        // 视频
        if (product.videos && product.videos.length > 0) {
            mediaHTML += '<div class="media-section">';
            mediaHTML += '<h4>视频</h4>';
            mediaHTML += '<div class="video-list">';
            product.videos.forEach((video, index) => {
                mediaHTML += `
                    <div class="video-item">
                        <video controls>
                            <source src="${video.url}" type="video/mp4">
                            您的浏览器不支持视频播放
                        </video>
                        <p class="video-title">视频 ${index + 1}</p>
                    </div>
                `;
            });
            mediaHTML += '</div></div>';
        }
        
        // 图片
        if (product.images && product.images.length > 0) {
            mediaHTML += '<div class="media-section">';
            mediaHTML += '<h4>图片</h4>';
            mediaHTML += '<div class="image-grid">';
            product.images.forEach((image, index) => {
                mediaHTML += `
                    <div class="image-item">
                        <img src="${image.url}" alt="产品图片 ${index + 1}" onclick="homePageInstance.openImageModal('${image.url}')">
                    </div>
                `;
            });
            mediaHTML += '</div></div>';
        }
        
        // 如果没有媒体文件
        if ((!product.videos || product.videos.length === 0) && (!product.images || product.images.length === 0)) {
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
        infoHTML += '<h4>基本信息</h4>';
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
            infoHTML += '<h4>价格信息</h4>';
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
        infoHTML += '<h4>销量信息</h4>';
        infoHTML += '<div class="info-list">';
        infoHTML += `<div class="info-item"><span class="label">销量:</span><span class="value">${(product.goodsSold || 0).toLocaleString()}</span></div>`;
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
                infoHTML += `<div class="info-item"><span class="label">店铺销量:</span><span class="value">${product.storeData.storeSold.toLocaleString()}</span></div>`;
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
        
        const isSinglePoint = chartData.labels.length === 1;
        const chartType = isSinglePoint ? 'bar' : 'line';
        
        this.salesChart = new Chart(ctx, {
            type: chartType,
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: '销量',
                    data: chartData.sales,
                    borderColor: '#e74c3c',
                    backgroundColor: isSinglePoint ? 'rgba(231, 76, 60, 0.8)' : 'rgba(231, 76, 60, 0.1)',
                    tension: 0.4,
                    pointRadius: isSinglePoint ? 8 : 4,
                    pointHoverRadius: isSinglePoint ? 10 : 6
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
                            text: isSinglePoint ? '当前数据' : '日期',
                            font: {
                                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif'
                            }
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: '销量',
                            font: {
                                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif'
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
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
        
        const isSinglePoint = chartData.labels.length === 1;
        const chartType = isSinglePoint ? 'bar' : 'line';
        
        this.priceChart = new Chart(ctx, {
            type: chartType,
            data: {
                labels: chartData.labels,
                datasets: [
                    {
                        label: '促销价',
                        data: chartData.promoPrice,
                        borderColor: '#3498db',
                        backgroundColor: isSinglePoint ? 'rgba(52, 152, 219, 0.8)' : 'rgba(52, 152, 219, 0.1)',
                        tension: 0.4,
                        pointRadius: isSinglePoint ? 8 : 4,
                        pointHoverRadius: isSinglePoint ? 10 : 6
                    },
                    {
                        label: '原价',
                        data: chartData.normalPrice,
                        borderColor: '#2ecc71',
                        backgroundColor: isSinglePoint ? 'rgba(46, 204, 113, 0.8)' : 'rgba(46, 204, 113, 0.1)',
                        tension: 0.4,
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
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: isSinglePoint ? '当前数据' : '日期',
                            font: {
                                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif'
                            }
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: '价格 (元)',
                            font: {
                                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif'
                            }
                        }
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
        
        const isSinglePoint = chartData.labels.length === 1;
        const chartType = isSinglePoint ? 'bar' : 'line';
        
        this.ratingChart = new Chart(ctx, {
            type: chartType,
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: '评分',
                    data: chartData.rating,
                    borderColor: '#f39c12',
                    backgroundColor: isSinglePoint ? 'rgba(243, 156, 18, 0.8)' : 'rgba(243, 156, 18, 0.1)',
                    tension: 0.4,
                    pointRadius: isSinglePoint ? 8 : 4,
                    pointHoverRadius: isSinglePoint ? 10 : 6
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
                            text: isSinglePoint ? '当前数据' : '日期',
                            font: {
                                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif'
                            }
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
                                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif'
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    // 创建图表的通用方法
    createChart(ctx, chartData, title) {
        // 检查数据点数量，决定图表类型
        const isSinglePoint = chartData.labels.length === 1;
        const chartType = isSinglePoint ? 'bar' : 'line';
        
        this.productChart = new Chart(ctx, {
            type: chartType,
            data: {
                labels: chartData.labels,
                datasets: [
                    {
                        label: '销量',
                        data: chartData.sales,
                        borderColor: '#e74c3c',
                        backgroundColor: isSinglePoint ? 'rgba(231, 76, 60, 0.8)' : 'rgba(231, 76, 60, 0.1)',
                        tension: 0.4,
                        yAxisID: 'y',
                        pointRadius: isSinglePoint ? 8 : 4,
                        pointHoverRadius: isSinglePoint ? 10 : 6
                    },
                    {
                        label: '促销价',
                        data: chartData.promoPrice,
                        borderColor: '#3498db',
                        backgroundColor: isSinglePoint ? 'rgba(52, 152, 219, 0.8)' : 'rgba(52, 152, 219, 0.1)',
                        tension: 0.4,
                        yAxisID: 'y1',
                        pointRadius: isSinglePoint ? 8 : 4,
                        pointHoverRadius: isSinglePoint ? 10 : 6
                    },
                    {
                        label: '原价',
                        data: chartData.normalPrice,
                        borderColor: '#2ecc71',
                        backgroundColor: isSinglePoint ? 'rgba(46, 204, 113, 0.8)' : 'rgba(46, 204, 113, 0.1)',
                        tension: 0.4,
                        yAxisID: 'y1',
                        pointRadius: isSinglePoint ? 8 : 4,
                        pointHoverRadius: isSinglePoint ? 10 : 6
                    },
                    {
                        label: '评分',
                        data: chartData.rating,
                        borderColor: '#f39c12',
                        backgroundColor: isSinglePoint ? 'rgba(243, 156, 18, 0.8)' : 'rgba(243, 156, 18, 0.1)',
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
                            text: isSinglePoint ? '当前数据' : '日期',
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
        const realSales = product.goodsSold || 0;
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

    // 渲染简单图表（暂时替代Chart.js）
    renderSimpleChart(canvas, data) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        
        // 清空画布
        ctx.clearRect(0, 0, width, height);
        
        // 绘制背景
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, width, height);
        
        // 绘制标题
        ctx.fillStyle = '#333';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('产品数据趋势图', width / 2, 25);
        
        // 绘制图例
        const legendY = height - 20;
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(10, legendY - 10, 15, 10);
        ctx.fillText('销量', 30, legendY);
        
        ctx.fillStyle = '#3498db';
        ctx.fillRect(80, legendY - 10, 15, 10);
        ctx.fillText('促销价', 100, legendY);
        
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(150, legendY - 10, 15, 10);
        ctx.fillText('原价', 170, legendY);
        
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(200, legendY - 10, 15, 10);
        ctx.fillText('评分', 220, legendY);
        
        // 绘制提示信息
        ctx.fillStyle = '#666';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('（模拟数据 - 需要集成Chart.js实现完整图表功能）', width / 2, height - 5);
    }

    // 打开图片模态框
    openImageModal(imageUrl) {
        // 创建图片查看模态框
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <img src="${imageUrl}" alt="产品图片">
                    <button class="modal-close" onclick="this.closest('.image-modal').remove()">
                        <i class="ph ph-x"></i>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
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

    // 清理资源
    cleanup() {
        this.stopProductCountRefresh();
    }

    // 打开3个点菜单
    openMenuDots() {
        console.log('打开3个点菜单');
        this.showMenuDots();
    }

    // 显示3个点菜单
    showMenuDots() {
        // 检查是否已经存在菜单
        const existingMenu = document.querySelector('.menu-dots-dropdown');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }

        // 创建菜单
        const menu = document.createElement('div');
        menu.className = 'menu-dots-dropdown';
        menu.innerHTML = this.generateMenuDotsHTML();
        document.body.appendChild(menu);

        // 绑定事件
        this.bindMenuDotsEvents(menu);

        // 定位菜单
        this.positionMenuDots(menu);
    }

    // 生成3个点菜单HTML
    generateMenuDotsHTML() {
        return `
            <div class="menu-dots-overlay" onclick="homePageInstance.closeMenuDots()">
                <div class="menu-dots-content" onclick="event.stopPropagation()">
                    <div class="menu-dots-item" onclick="homePageInstance.menuAction('new-product')">
                        <div class="menu-dots-icon">
                            <i class="ph ph-package"></i>
                        </div>
                        <div class="menu-dots-text">新建产品</div>
                    </div>
                    <div class="menu-dots-item" onclick="homePageInstance.menuAction('import-data')">
                        <div class="menu-dots-icon">
                            <i class="ph ph-download"></i>
                        </div>
                        <div class="menu-dots-text">导入数据</div>
                    </div>
                    <div class="menu-dots-item" onclick="homePageInstance.menuAction('export-data')">
                        <div class="menu-dots-icon">
                            <i class="ph ph-upload"></i>
                        </div>
                        <div class="menu-dots-text">导出数据</div>
                    </div>
                    <div class="menu-dots-divider"></div>
                    <div class="menu-dots-item" onclick="homePageInstance.menuAction('about')">
                        <div class="menu-dots-icon">
                            <i class="ph ph-info"></i>
                        </div>
                        <div class="menu-dots-text">关于</div>
                    </div>
                </div>
            </div>
        `;
    }

    // 绑定3个点菜单事件
    bindMenuDotsEvents(menu) {
        // ESC键关闭
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                this.closeMenuDots();
                document.removeEventListener('keydown', handleKeyDown);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
    }

    // 定位3个点菜单
    positionMenuDots(menu) {
        const menuDots = document.getElementById('menu-dots');
        const rect = menuDots.getBoundingClientRect();
        const menuContent = menu.querySelector('.menu-dots-content');
        
        // 计算位置
        const top = rect.bottom + 8;
        const right = window.innerWidth - rect.right;
        
        menuContent.style.top = `${top}px`;
        menuContent.style.right = `${right}px`;
    }

    // 关闭3个点菜单
    closeMenuDots() {
        const menu = document.querySelector('.menu-dots-dropdown');
        if (menu) {
            menu.remove();
        }
    }

    // 菜单项点击处理
    menuAction(action) {
        console.log('菜单项点击:', action);
        
        switch (action) {
            case 'new-product':
                this.showToast('新建产品功能');
                break;
            case 'import-data':
                this.showToast('导入数据功能');
                break;
            case 'export-data':
                this.showToast('导出数据功能');
                break;
            case 'about':
                this.showToast('关于Hanli');
                break;
        }
        
        this.closeMenuDots();
    }

    // 打开系统设置弹窗
    openSettingsModal() {
        // 检查是否已经存在设置弹窗
        const existingModal = document.querySelector('.settings-modal');
        if (existingModal) {
            console.log('设置弹窗已存在，不重复打开');
            return;
        }

        console.log('打开系统设置弹窗');
        this.showSettingsModal();
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

        // ESC键关闭
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                this.closeSettingsModal();
                document.removeEventListener('keydown', handleKeyDown);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
    }

    // 预览主题效果
    previewTheme(theme) {
        const body = document.body;
        
        // 移除现有主题类
        body.classList.remove('theme-light', 'theme-dark', 'theme-auto');
        
        // 添加新主题类
        if (theme === 'auto') {
            // 跟随系统主题
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            body.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
        } else {
            body.classList.add(`theme-${theme}`);
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
        const body = document.body;
        
        // 移除现有主题类
        body.classList.remove('theme-light', 'theme-dark', 'theme-auto');
        
        if (theme === 'auto') {
            // 跟随系统主题
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            body.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
        } else {
            body.classList.add(`theme-${theme}`);
        }
    }

    // 应用存储的设置
    applyStoredSettings() {
        // 应用自动刷新设置
        const autoRefresh = localStorage.getItem('app-auto-refresh') === 'true';
        if (autoRefresh && this.isOnHomePage()) {
            this.startProductCountRefresh();
        } else {
            this.stopProductCountRefresh();
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
let homePageInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    homePageInstance = new HomePage();
});

// 页面卸载时清理资源
window.addEventListener('beforeunload', () => {
    if (homePageInstance) {
        homePageInstance.cleanup();
    }
});
