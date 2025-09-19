/**
 * 搜索弹窗组件
 * 提供产品搜索功能
 */
class SearchModal {
    constructor() {
        this.isOpen = false;
        this.searchCallback = null;
        this.init();
    }

    /**
     * 初始化搜索弹窗
     */
    init() {
        this.render();
        this.bindEvents();
    }

    /**
     * 设置搜索回调
     * @param {Function} callback - 搜索回调函数
     */
    setSearchCallback(callback) {
        this.searchCallback = callback;
    }

    /**
     * 渲染搜索弹窗HTML结构
     */
    render() {
        const modalHTML = `
            <div id="search-modal" class="search-modal" style="display: none;">
                <div class="search-modal-overlay"></div>
                <div class="search-modal-content">
                    <div class="search-modal-header">
                        <h3 class="search-modal-title">搜索产品</h3>
                        <div id="search-modal-close-container"></div>
                    </div>
                    <div class="search-modal-body">
                        <div class="search-input-container">
                            <i class="ph ph-magnifying-glass search-input-icon"></i>
                            <input 
                                type="text" 
                                id="search-input" 
                                class="search-input" 
                                placeholder="输入产品名称、ID或关键词..."
                                autocomplete="off"
                            >
                        </div>
                        <div class="search-results" id="search-results">
                            <!-- 搜索结果将在这里显示 -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 查找现有的搜索弹窗并替换
        const existingModal = document.getElementById('search-modal');
        if (existingModal) {
            existingModal.outerHTML = modalHTML;
        } else {
        // 如果不存在，插入到body中
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 创建关闭按钮
        this.createCloseButton();
    }
    }

    /**
     * 创建关闭按钮
     */
    createCloseButton() {
        const closeContainer = document.getElementById('search-modal-close-container');
        if (!closeContainer || !window.buttonInstance) return;

        const closeButton = window.buttonInstance.create({
            text: '',
            size: 'S',
            type: 'secondary',
            icon: 'ph-x',
            onClick: () => this.close(),
            className: 'search-modal-close-btn'
        });

        closeContainer.appendChild(closeButton);
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 关闭按钮事件已通过Button组件处理，无需额外绑定

        // 遮罩层点击事件
        const overlay = document.querySelector('.search-modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.close();
            });
        }

        // 搜索输入框事件
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            // 输入事件
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
    }

    /**
     * 注册快捷键
     */
    registerShortcuts() {
        // 回车键搜索
        window.keyboardShortcutManager.register('enter', (e) => {
            if (this.isOpen) {
                const searchInput = document.getElementById('search-input');
                if (searchInput && document.activeElement === searchInput) {
                    this.handleSearch(searchInput.value);
                }
            }
        }, 'search-modal', '执行搜索');

        // ESC键关闭
        window.keyboardShortcutManager.register('escape', (e) => {
            if (this.isOpen) {
                this.close();
            }
        }, 'search-modal', '关闭搜索框');
    }

    /**
     * 注销快捷键
     */
    unregisterShortcuts() {
        window.keyboardShortcutManager.unregisterContext('search-modal');
    }

    /**
     * 打开搜索弹窗
     */
    open() {
        const modal = document.getElementById('search-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.isOpen = true;
            
            // 注册快捷键
            this.registerShortcuts();
            
            // 聚焦到搜索输入框
            setTimeout(() => {
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.focus();
                }
            }, 100);
        }
    }

    /**
     * 关闭搜索弹窗
     */
    close() {
        const modal = document.getElementById('search-modal');
        if (modal) {
            modal.style.display = 'none';
            this.isOpen = false;
            
            // 注销快捷键
            this.unregisterShortcuts();
            
            // 清空搜索输入框和结果
            const searchInput = document.getElementById('search-input');
            const searchResults = document.getElementById('search-results');
            if (searchInput) searchInput.value = '';
            if (searchResults) searchResults.innerHTML = '';
        }
    }

    /**
     * 处理搜索
     * @param {string} query - 搜索关键词
     */
    handleSearch(query) {
        if (!query.trim()) {
            this.clearResults();
            return;
        }

        // 调用搜索回调
        if (this.searchCallback) {
            this.searchCallback(query.trim());
        }
    }

    /**
     * 显示搜索结果
     * @param {Array} results - 搜索结果数组
     */
    showResults(results) {
        const searchResults = document.getElementById('search-results');
        if (!searchResults) return;

        if (!results || results.length === 0) {
            searchResults.innerHTML = `
                <div class="search-no-results">
                    <i class="ph ph-magnifying-glass"></i>
                    <p>未找到相关产品</p>
                </div>
            `;
            return;
        }

        const resultsHTML = results.map(result => `
            <div class="search-result-item" data-product-id="${result.id}">
                <div class="search-result-image">
                    ${result.image ? `<img src="${result.image}" alt="${result.title}">` : '<i class="ph ph-image"></i>'}
                </div>
                <div class="search-result-content">
                    <h4 class="search-result-title">${result.title}</h4>
                    <p class="search-result-id">ID: ${result.id}</p>
                    ${result.price ? `<p class="search-result-price">¥${result.price}</p>` : ''}
                </div>
            </div>
        `).join('');

        searchResults.innerHTML = resultsHTML;

        // 绑定结果项点击事件
        const resultItems = searchResults.querySelectorAll('.search-result-item');
        resultItems.forEach(item => {
            item.addEventListener('click', () => {
                const productId = item.dataset.productId;
                this.selectProduct(productId);
            });
        });
    }

    /**
     * 清空搜索结果
     */
    clearResults() {
        const searchResults = document.getElementById('search-results');
        if (searchResults) {
            searchResults.innerHTML = '';
        }
    }

    /**
     * 选择产品
     * @param {string} productId - 产品ID
     */
    selectProduct(productId) {
        console.log('选择产品:', productId);
        
        // 关闭搜索弹窗
        this.close();
        
        // 检查是否已经打开了该产品的详情Tab
        if (typeof homePageInstance !== 'undefined' && homePageInstance.tabManager) {
            const existingTab = homePageInstance.tabManager.findTabByPageTypeAndParam('productDetail', 'productId', productId);
            
            if (existingTab) {
                // 如果已存在该产品的详情Tab，切换到该Tab
                console.log('产品详情Tab已存在，切换到现有Tab:', existingTab.id);
                homePageInstance.tabManager.setActiveTab(existingTab.id);
                homePageInstance.renderTabs();
                homePageInstance.tabManager.onTabSwitch(existingTab);
            } else {
                // 如果不存在，创建新的产品详情Tab
                console.log('产品详情Tab不存在，创建新Tab');
                
                // 创建产品详情Tab
                const pageData = {
                    type: 'productDetail',
                    title: `产品详情 - ${productId}`,
                    closable: true, // 产品详情支持关闭
                    productId: productId
                };
                
                const newTabId = homePageInstance.tabManager.addTab(pageData);
                homePageInstance.renderTabs();
                
                // 触发新Tab的切换事件
                const newTab = homePageInstance.tabManager.tabs.find(t => t.id === newTabId);
                if (newTab) {
                    homePageInstance.tabManager.onTabSwitch(newTab);
                }
                
                // 加载产品详情数据
                if (homePageInstance.loadProductDetailByGoodsId) {
                    homePageInstance.loadProductDetailByGoodsId(productId);
                }
            }
        } else {
            console.error('无法访问HomePage实例或TabManager');
        }
    }

    /**
     * 销毁组件
     */
    destroy() {
        const modal = document.getElementById('search-modal');
        if (modal) {
            modal.remove();
        }
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchModal;
} else {
    window.SearchModal = SearchModal;
}
