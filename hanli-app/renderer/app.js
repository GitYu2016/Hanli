// Tab管理类已移动到 components/Common/TabManager.js

// 主应用逻辑
class MainApp {
    constructor() {
        this.activePage = 'home';
        this.isResizing = false;
        this.tabManager = new TabManager();
        this.themeManager = new ThemeManager();
        this.productDataManager = new ProductDataManager();
        this.topBar = null; // TopBar组件实例
        this.sideBar = null; // SideBar组件实例
        this.pageContainer = null; // PageContainer组件实例
        this.settingsPage = null; // SettingsPage组件实例
        this.init();
    }

    async init() {
        // 初始化图标系统（最早初始化）
        Icon.init();
        
        // 立即加载窗口控制按钮图标（HTML中已存在）
        this.loadWindowControlIcons();
        
        this.themeManager.init();
        this.productDataManager.init();
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
        window.mainAppInstance = this;
        
        // 设置全局引用，供其他组件使用
        window.productDataManager = this.productDataManager;
    }

    // 主题管理相关方法已移动到 ThemeManager 组件

    /**
     * 加载窗口控制按钮图标
     */
    loadWindowControlIcons() {
        try {
            // 加载关闭按钮图标
            const closeIcon = document.getElementById('close-icon');
            if (closeIcon) {
                const closeIconHTML = Icon.render('x', { className: 'svg-icon', style: 'bold' });
                closeIcon.outerHTML = closeIconHTML;
            }

            // 加载最小化按钮图标
            const minimizeIcon = document.getElementById('minimize-icon');
            if (minimizeIcon) {
                const minimizeIconHTML = Icon.render('minus', { className: 'svg-icon', style: 'bold' });
                minimizeIcon.outerHTML = minimizeIconHTML;
            }

            // 加载全屏按钮图标
            const fullscreenIcon = document.getElementById('fullscreen-icon');
            if (fullscreenIcon) {
                const fullscreenIconHTML = Icon.render('arrows-out', { className: 'svg-icon', style: 'bold' });
                fullscreenIcon.outerHTML = fullscreenIconHTML;
            }
        } catch (error) {
            console.error('加载窗口控制按钮图标失败:', error);
        }
    }

    // 初始化所有组件
    async initComponents() {
        this.initTopBar();
        this.initSideBar();
        await this.initPageContainer();
        this.initSettingsPage();
        this.initSettingsModal();
        
        // 样式现在通过主题切换机制自动重新应用
    }

    // 初始化TopBar组件
    initTopBar() {
        // 创建TopBar组件实例
        this.topBar = new TopBar();
        
        // 设置Tab管理器
        this.topBar.setTabManager(this.tabManager);
        
        // 设置设置按钮回调
        this.topBar.setSettingsCallback(() => {
            this.openSettingsPage();
        });
        
        // 设置Tab切换回调
        this.topBar.setTabSwitchCallback((tab) => {
            this.handleTabSwitch(tab);
        });

        // 渲染TopBar
        this.topBar.render();
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

    // 初始化SettingsPage组件
    initSettingsPage() {
        // 创建SettingsPage组件实例
        this.settingsPage = new SettingsPage();
        
        // 设置回调
        this.settingsPage.setCallbacks({
            onSave: (settings) => {
                this.handleSettingsSave(settings);
            },
            onCancel: () => {
                // 设置已取消，无需输出日志
            },
            onThemeChange: (theme) => {
                this.themeManager.setTheme(theme);
            },
            onBackgroundColorChange: (bgColor) => {
                this.themeManager.setBackgroundColor(bgColor);
            }
        });
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
                // 设置已取消，无需输出日志
            },
            onThemeChange: (theme) => {
                this.themeManager.setTheme(theme);
            },
            onBackgroundColorChange: (bgColor) => {
                this.themeManager.setBackgroundColor(bgColor);
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
                    // 防止重复点击
                    if (this.isLoadingProductDetail && this.loadingProductId === goodsId) {
                        console.log('产品详情正在加载中，忽略重复点击:', goodsId);
                        return;
                    }
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
        
        // 根据Tab类型管理产品数据刷新
        if (tab.pageType === 'home') {
            // 切换到首页，按需刷新产品总数
            this.productDataManager.refreshProductCountIfNeeded(() => this.isOnHomePage());
        } else if (tab.pageType === 'product-library') {
            // 切换到产品库，触发一次刷新（会同时更新产品总数）
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

        // 注册搜索快捷键
        window.keyboardShortcutManager.register('ctrl+f', (e) => {
            this.openSearchModal();
        }, 'global', '打开搜索弹窗');
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
     * 打开搜索弹窗
     */
    openSearchModal() {
        if (this.topBar) {
            this.topBar.openSearchModal();
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
            // 产品库页面会在onTabSwitch中自动刷新，无需重复调用
        } else {
            // 如果不存在，创建新Tab
            const newTabId = this.tabManager.addTab(pageData);
            this.renderTabs();
            // 触发新Tab的切换事件
            const newTab = this.tabManager.tabs.find(t => t.id === newTabId);
            if (newTab) {
                this.tabManager.onTabSwitch(newTab);
                // 产品库页面会在onTabSwitch中自动刷新，无需重复调用
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
                await this.pageContainer.renderHomePage();
                break;
            case 'goodsList':
                this.loadProductLibrary();
                break;
            case 'productDetail':
                // 产品详情页需要根据productId重新加载数据
                if (pageData && pageData.productId) {
                    this.loadProductDetailByGoodsId(pageData.productId);
                } else if (this.currentProductDetail) {
                    await this.pageContainer.renderProductDetail(this.currentProductDetail);
                } else {
                    console.warn('⚠️ 没有产品详情数据');
                }
                break;
            case 'settings':
                await this.renderSettingsPage();
                break;
            default:
                console.warn('未知的页面类型:', pageType);
        }
    }
    
    // 渲染设置页面
    async renderSettingsPage() {
        if (!this.settingsPage) {
            console.error('SettingsPage组件未初始化');
            return;
        }
        
        // 渲染设置页面
        const container = document.getElementById('page-container');
        if (container) {
            container.innerHTML = this.settingsPage.render();
            
            // 绑定事件
            this.settingsPage.bindEvents();
            
            // 加载当前设置
            this.settingsPage.loadCurrentSettings();
            
            console.log('✅ 设置页面已渲染');
        } else {
            console.error('找不到页面容器');
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




    // 产品数据管理相关方法已移动到 ProductDataManager 组件

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
            const result = await this.productDataManager.loadProductLibrary(
                (products, totalCount) => this.renderProductLibrary(products, totalCount)
            );
            
            // 检查返回值是否有效
            if (result && typeof result === 'object') {
                if (!result.success) {
                    console.warn('产品库数据加载状态:', result.message || '未知状态');
                }
                // 成功状态由 ProductDataManager 统一处理，这里不再重复打印
            } else {
                console.warn('产品库数据加载返回无效结果');
            }
        } catch (error) {
            console.error('加载产品库数据失败:', error);
            this.showProductLibraryError('加载数据失败');
        }
    }

    // 渲染产品库表格
    async renderProductLibrary(products, totalCount = 0) {
        if (this.pageContainer) {
            await this.pageContainer.renderProductLibrary(products, totalCount);
        }
    }


    // 产品数据处理相关方法已移动到 ProductDataManager 组件

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
                copyBtn.style.backgroundColor = 'var(--color-success)';
                
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
    
    // 显示Toast通知 - 使用统一的Toast组件
    showToast(message, type = 'info') {
        if (typeof window.toastInstance !== 'undefined') {
            window.toastInstance.show(message, type);
        } else {
            console.warn('Toast组件未初始化，使用备用方案');
            // 备用方案：简单的alert
            alert(message);
        }
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
            <div class="context-menu-item" onclick="mainAppInstance.showVideoInFinder(${index}, '${videoName}', '${videoPath}')">
                <span>${showInFinderText}</span>
            </div>
            <div class="context-menu-item" onclick="mainAppInstance.saveVideoAs(${index}, '${videoName}', '${videoPath}')">
                <span>另存为</span>
            </div>
            <div class="context-menu-item context-menu-item-danger" onclick="mainAppInstance.moveVideoToTrash(${index}, '${videoName}', '${videoPath}')">
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
                this.showToast('视频文件已移动到废纸篓', 'success');
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
        // 使用ProductInfoCard组件
        const productInfoCard = new ProductInfoCard();
        return productInfoCard.render(product);
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
                    borderColor: 'var(--color-primary-reverse)',
                    backgroundColor: 'var(--color-background-normal)',
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: 'var(--color-primary-reverse)',
                    pointBorderColor: 'var(--color-primary-reverse)',
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
                            color: 'var(--color-secondary)'
                        },
                        ticks: {
                            color: 'var(--color-secondary)'
                        },
                        grid: {
                            color: 'var(--color-background-normal)'
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
                            color: 'var(--color-secondary)'
                        },
                        ticks: {
                            color: 'var(--color-secondary)',
                            stepSize: 1,
                            callback: function(value) {
                                return Math.round(value);
                            }
                        },
                        grid: {
                            color: 'var(--color-background-normal)'
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
                            color: 'var(--color-secondary)',
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
                        borderColor: 'var(--color-border-focused)',
                        backgroundColor: 'var(--color-background-normal)',
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: 'var(--color-border-focused)',
                        pointBorderColor: 'var(--color-border-focused)',
                        borderWidth: 2
                    },
                    {
                        label: '原价',
                        data: chartData.normalPrice,
                        borderColor: 'var(--color-border-normal)',
                        backgroundColor: 'var(--color-background-normal)',
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: 'var(--color-border-normal)',
                        pointBorderColor: 'var(--color-border-normal)',
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
                            color: 'var(--color-secondary)'
                        },
                        ticks: {
                            color: 'var(--color-secondary)'
                        },
                        grid: {
                            color: 'var(--color-background-normal)'
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
                            color: 'var(--color-secondary)'
                        },
                        ticks: {
                            color: 'var(--color-secondary)',
                            stepSize: 1,
                            callback: function(value) {
                                return Math.round(value);
                            }
                        },
                        grid: {
                            color: 'var(--color-background-normal)'
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
                            color: 'var(--color-secondary)'
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
                            color: 'var(--color-secondary)'
                        },
                        ticks: {
                            color: 'var(--color-secondary)'
                        },
                        grid: {
                            color: 'var(--color-background-normal)'
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
                            color: 'var(--color-secondary)'
                        },
                        ticks: {
                            color: 'var(--color-secondary)',
                            stepSize: 1,
                            callback: function(value) {
                                return Math.round(value);
                            }
                        },
                        grid: {
                            color: 'var(--color-background-normal)'
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
                            color: 'var(--color-secondary)',
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
                    <div class="svg-icon" data-icon="warning" data-filled="false"></div>
                </div>
                <div class="error-message">${message}</div>
                <button class="btn btn-primary" onclick="mainAppInstance.loadProductLibrary()">
                    重试
                </button>
            </div>
        `;
    }

    // 设置关于菜单监听器
    setupAboutMenuListener() {
        const handleAboutMenu = () => {
            this.showAboutDialog();
        };
        
        window.addEventListener('menu-about', handleAboutMenu);
        
        // 保存引用以便清理
        this.handleAboutMenu = handleAboutMenu;
    }

    // 显示关于弹窗
    showAboutDialog() {
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
            background-color: var(--color-overlay);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        `;

        // 创建弹窗内容
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: var(--color-background-normal);
            border-radius: var(--radius-large);
            padding: 32px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            border: 1px solid var(--color-border-normal);
        `;

        modalContent.innerHTML = `
            <div style="margin-bottom: 24px;">
                <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
                <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 600; color: var(--color-primary);">关于 Hanli</h2>
                <p style="margin: 0; font-size: 16px; color: var(--color-secondary); line-height: 1.5;">这是一个产品管理App</p>
            </div>
            <button id="about-ok-btn" style="
                background: var(--color-info);
                color: white;
                border: none;
                border-radius: var(--radius-large);
                padding: 12px 24px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                min-width: 100px;
            " onmouseover="this.style.background='var(--color-info)'" onmouseout="this.style.background='var(--color-info)'">
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
        if (this.handleAboutMenu) {
            window.removeEventListener('menu-about', this.handleAboutMenu);
        }
        
        // 销毁管理器
        if (this.themeManager) {
            this.themeManager.destroy();
        }
        
        if (this.productDataManager) {
            this.productDataManager.destroy();
        }
        
        // 销毁组件
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

    // 打开系统设置页面
    openSettingsPage() {
        // 使用SettingsModal组件显示设置弹窗
        if (this.settingsModal) {
            this.settingsModal.show();
        } else {
            console.error('SettingsModal 未初始化');
            this.showToast('设置组件未初始化，请重试', 'error');
        }
    }

    // 处理设置保存
    handleSettingsSave(settings) {
        console.log('✅ 设置已保存');
        
        // 应用主题设置
        if (settings.theme) {
            this.themeManager.setTheme(settings.theme);
        }
        
        // 应用背景色设置
        if (settings.backgroundColor) {
            this.themeManager.setBackgroundColor(settings.backgroundColor);
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
            <div class="modal-overlay" onclick="mainAppInstance.closeSettingsModal()">
                <div class="modal-content settings-modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h2 class="modal-title">系统设置</h2>
                        ${window.iconButtonInstance.render('x', {
                            variant: 'ghost',
                            size: 'small',
                            title: '关闭',
                            className: 'modal-close'
                        })}
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
                                    <button class="btn btn-sm btn-secondary" onclick="mainAppInstance.openDataFolder()">打开文件夹</button>
                                </div>
                            </div>
                            
                            <div class="setting-item">
                                <label class="setting-label">缓存管理</label>
                                <div class="setting-control">
                                    <button class="btn btn-sm btn-warning" onclick="mainAppInstance.clearCache()">清理缓存</button>
                                    <span class="setting-description">清理临时文件和缓存数据</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="mainAppInstance.closeSettingsModal()">取消</button>
                        <button class="btn btn-primary" onclick="mainAppInstance.saveSettings()">保存设置</button>
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
                // 语言设置变更，无需输出日志
            });
        }

        // 开关事件
        const switches = modal.querySelectorAll('.switch input[type="checkbox"]');
        switches.forEach(switchEl => {
            switchEl.addEventListener('change', (e) => {
                // 设置变更，无需输出日志
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
        return this.themeManager.getCurrentTheme();
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
            }

            // 获取语言设置
            const languageSelect = modal.querySelector('#language-select');
            if (languageSelect) {
                const language = languageSelect.value;
                localStorage.setItem('app-language', language);
            }

            // 获取功能设置
            const autoRefreshCheckbox = modal.querySelector('#auto-refresh');
            const showCollectTimeCheckbox = modal.querySelector('#show-collect-time');
            
            if (autoRefreshCheckbox) {
                const autoRefresh = autoRefreshCheckbox.checked;
                localStorage.setItem('app-auto-refresh', autoRefresh.toString());
            }
            
            if (showCollectTimeCheckbox) {
                const showCollectTime = showCollectTimeCheckbox.checked;
                localStorage.setItem('app-show-collect-time', showCollectTime.toString());
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
        this.themeManager.applyStoredTheme();
    }

    // 应用存储的设置
    applyStoredSettings() {
        // 应用自动刷新设置（已改为按需刷新）
        const autoRefresh = localStorage.getItem('app-auto-refresh') === 'true';
        if (autoRefresh && this.isOnHomePage()) {
            // 按需刷新产品总数
            this.productDataManager.refreshProductCountIfNeeded(() => this.isOnHomePage());
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

        // 监听来自主进程的商品详情页打开请求
        if (window.electronAPI) {
            
            // 监听商品详情页打开请求
            window.addEventListener('navigate-to-product', (event) => {
                console.log('收到商品详情页打开请求:', event.detail);
                this.showProductDetailModal(event.detail);
            });
            
            // 监听来自主进程的open-product-detail事件
            window.electronAPI.onOpenProductDetail((event, data) => {
                console.log('收到打开产品详情页请求:', data);
                if (data && data.goodsId) {
                    // 防止重复加载相同产品
                    if (this.isLoadingProductDetail && this.loadingProductId === data.goodsId) {
                        console.log('产品详情正在加载中，忽略主进程重复请求:', data.goodsId);
                        return;
                    }
                    console.log('准备打开产品详情页，商品ID:', data.goodsId);
                    this.viewProductDetail(data.goodsId);
                } else {
                    console.warn('收到open-product-detail事件，但数据无效:', data);
                }
            });
            
            // 标记为已初始化
            this.ipcListenersInitialized = true;
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
            background-color: var(--color-overlay);
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
            border-radius: var(--radius-large);
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
            background: linear-gradient(135deg, var(--color-success), var(--color-success));
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
            color: var(--color-secondary);
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
            border-radius: var(--radius-large);
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
            border-radius: var(--radius-large);
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

}

// 页面加载完成后初始化
let mainAppInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
    mainAppInstance = new MainApp();
    await mainAppInstance.init();
    
    // 确保所有图标都被正确处理
    if (window.Icon) {
        window.Icon.processDataIcons();
    }
});

// 页面卸载时清理资源
window.addEventListener('beforeunload', () => {
    if (mainAppInstance) {
        mainAppInstance.cleanup();
    }
});
