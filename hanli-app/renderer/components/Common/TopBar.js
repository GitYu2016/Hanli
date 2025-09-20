/**
 * TopBar 组件
 * 负责顶部导航栏的渲染和交互逻辑
 * 样式定义在JavaScript中，通过StyleManager管理
 */
class TopBar {
    constructor() {
        this.tabManager = null;
        this.topBarTabs = null;
        this.settingsCallback = null;
        this.tabSwitchCallback = null;
        this.searchModal = null;
        this.searchCallback = null;
        this.initStyles();
        this.init();
    }

    /**
     * 初始化TopBar样式
     */
    initStyles() {
        // 确保StyleManager已加载
        if (typeof window.styleManager === 'undefined') {
            console.error('StyleManager未加载，请确保已引入StyleManager.js');
            return;
        }

        // 定义TopBar样式
        const topBarStyles = {
            // TopBar容器
            '.top-bar': {
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'space-between',
                'height': '56px',
                'border-bottom': '1px solid var(--color-border-normal)',
                'padding': '0 20px 0 68px',
                'position': 'relative',
                'z-index': '1000',
                'user-select': 'none'
            },

            // TopBar左侧
            '.top-bar-left': {
                'display': 'flex',
                'align-items': 'center',
                'flex-shrink': '0'
            },

            // Logo
            '.top-bar .logo': {
                'font-size': '20px',
                'font-weight': '700',
                'color': 'var(--color-primary)',
                'letter-spacing': '-0.5px'
            },

            // TopBar中间
            '.top-bar-center': {
                'display': 'flex',
                'align-items': 'center',
                'flex': '1',
                'justify-content': 'center',
                'gap': '8px',
                'height': '100%'
            },



            // TopBar右侧
            '.top-bar-right': {
                'display': 'flex',
                'align-items': 'center',
                'gap': '12px',
                'flex-shrink': '0'
            },



            // 响应式设计
            '@media (max-width: 768px)': {
                '.top-bar': {
                    'padding': '0 16px'
                },
                '.top-bar-center': {
                    'gap': '8px'
                },
            }
        };

        // 注册样式到StyleManager
        window.styleManager.defineStyles('TopBar', topBarStyles);
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
        
        // 初始化TopBarTabs组件
        if (typeof TopBarTabs !== 'undefined') {
            this.topBarTabs = new TopBarTabs({
                containerId: 'top-bar-tabs'
            });
            this.topBarTabs.setTabManager(tabManager);
            this.topBarTabs.setTabSwitchCallback((tab) => {
                if (this.tabSwitchCallback) {
                    this.tabSwitchCallback(tab);
                }
            });
        } else {
            console.error('TopBarTabs component not found');
        }
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
     * 设置搜索回调
     * @param {Function} callback - 搜索回调函数
     */
    setSearchCallback(callback) {
        this.searchCallback = callback;
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
                    <div id="search-btn">
                        ${window.iconButtonInstance.render('search', { title: '搜索' })}
                    </div>
                    <div id="top-bar-tabs" class="top-bar-tabs">
                        <!-- Tabs will be dynamically rendered here -->
                    </div>
                </div>
                <div class="top-bar-right">
                    <div id="settings-btn">
                        ${window.iconButtonInstance.render('settings', { title: '设置' })}
                    </div>
                </div>
            </div>
        `;

        // 查找现有的top-bar元素并替换
        const existingTopBar = document.getElementById('top-bar');
        if (existingTopBar) {
            // 直接替换整个元素
            existingTopBar.outerHTML = topBarHTML;
        } else {
            // 如果不存在，插入到body开始处
            document.body.insertAdjacentHTML('afterbegin', topBarHTML);
        }
        
        // 绑定事件监听器 - 使用setTimeout确保DOM更新完成
        setTimeout(() => {
            this.bindEvents();
        }, 0);
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 设置按钮点击事件
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            const button = settingsBtn.querySelector('.icon-button');
            if (button) {
                button.addEventListener('click', () => {
                    if (this.settingsCallback) {
                        this.settingsCallback();
                    }
                });
            }
        }

        // 搜索按钮点击事件
        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) {
            const button = searchBtn.querySelector('.icon-button');
            if (button) {
                button.addEventListener('click', () => {
                    this.openSearchModal();
                });
            }
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
     * 渲染Tabs - 委托给TopBarTabs组件
     */
    renderTabs() {
        if (this.topBarTabs) {
            this.topBarTabs.renderTabs();
        }
    }

    /**
     * 切换Tab - 委托给TopBarTabs组件
     * @param {string} tabId - Tab ID
     */
    switchTab(tabId) {
        if (this.topBarTabs) {
            this.topBarTabs.switchTab(tabId);
        }
    }

    /**
     * 关闭Tab - 委托给TopBarTabs组件
     * @param {string} tabId - Tab ID
     */
    closeTab(tabId) {
        if (this.topBarTabs) {
            this.topBarTabs.closeTab(tabId);
        }
    }

    /**
     * 更新Tab状态 - 委托给TopBarTabs组件
     * @param {string} tabId - Tab ID
     * @param {boolean} isActive - 是否激活
     */
    updateTabState(tabId, isActive) {
        if (this.topBarTabs) {
            this.topBarTabs.updateTabState(tabId, isActive);
        }
    }

    /**
     * 添加新Tab - 委托给TopBarTabs组件
     * @param {Object} tabData - Tab数据
     */
    addTab(tabData) {
        if (this.topBarTabs) {
            return this.topBarTabs.addTab(tabData);
        }
        return null;
    }

    /**
     * 打开搜索弹窗
     */
    openSearchModal() {
        // 如果搜索弹窗不存在，创建它
        if (!this.searchModal) {
            // 动态导入SearchModal组件
            if (typeof SearchModal !== 'undefined') {
                this.searchModal = new SearchModal();
                this.searchModal.setSearchCallback((query) => {
                    this.handleSearch(query);
                });
            } else {
                console.error('SearchModal component not found');
                return;
            }
        }
        
        this.searchModal.open();
    }

    /**
     * 处理搜索
     * @param {string} query - 搜索关键词
     */
    async handleSearch(query) {
        if (this.searchCallback) {
            this.searchCallback(query);
        } else {
            // 默认搜索逻辑 - 可以在这里添加产品搜索功能
            await this.performDefaultSearch(query);
        }
    }

    /**
     * 执行默认搜索
     * @param {string} query - 搜索关键词
     */
    async performDefaultSearch(query) {
        try {
            // 从API获取产品数据进行搜索
            const response = await fetch('http://localhost:3001/api/products');
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.products) {
                    // 搜索产品
                    const filteredResults = data.products.filter(product => {
                        const searchText = query.toLowerCase();
                        return (
                            (product.goodsTitleEn && product.goodsTitleEn.toLowerCase().includes(searchText)) ||
                            (product.goodsCat3 && product.goodsCat3.toLowerCase().includes(searchText)) ||
                            (product.goodsId && product.goodsId.includes(searchText)) ||
                            (product.goodsTitle && product.goodsTitle.toLowerCase().includes(searchText))
                        );
                    }).slice(0, 10).map(product => ({
                        id: product.goodsId,
                        title: product.goodsCat3 || product.goodsTitleEn || product.goodsTitle || '未知产品',
                        price: product.goodsPrice ? `¥${product.goodsPrice}` : null,
                        image: product.goodsImages && product.goodsImages.length > 0 ? product.goodsImages[0] : null
                    }));

                    if (this.searchModal) {
                        this.searchModal.showResults(filteredResults);
                    }
                    return;
                }
            }
        } catch (error) {
            console.warn('搜索产品数据失败，使用模拟数据:', error);
        }

        // 如果API搜索失败，使用模拟数据
        const mockResults = [
            {
                id: '601099514703283',
                title: '示例产品 1',
                price: '299.00',
                image: null
            },
            {
                id: '601099515504642',
                title: '示例产品 2',
                price: '199.00',
                image: null
            }
        ];

        // 简单的关键词匹配
        const filteredResults = mockResults.filter(product => 
            product.title.toLowerCase().includes(query.toLowerCase()) ||
            product.id.includes(query)
        );

        if (this.searchModal) {
            this.searchModal.showResults(filteredResults);
        }
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

        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) {
            searchBtn.replaceWith(searchBtn.cloneNode(true));
        }

        // 清理TopBarTabs组件
        if (this.topBarTabs) {
            this.topBarTabs.destroy();
            this.topBarTabs = null;
        }

        // 清理搜索弹窗
        if (this.searchModal) {
            this.searchModal.destroy();
            this.searchModal = null;
        }
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TopBar;
} else {
    window.TopBar = TopBar;
}
