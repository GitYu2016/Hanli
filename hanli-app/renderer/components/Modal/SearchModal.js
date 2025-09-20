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
     * 注入搜索弹窗样式
     */
    injectStyles() {
        // 检查是否已经注入过样式
        if (document.getElementById('search-modal-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'search-modal-styles';
        style.textContent = `
            /* 搜索弹窗样式 */
            .search-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 1000;
                display: flex;
                align-items: flex-start;
                justify-content: center;
                padding-top: 80px;
            }

            .search-modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: var(--color-overlay);
            }

            .search-modal-content {
                position: relative;
                background-color: var(--color-modal-background) !important;
                border-radius: var(--radius-large);
                box-shadow: var(--shadow-large);
                width: 90%;
                max-width: 800px;
                max-height: 80vh;
                overflow: hidden;
                border: 1px solid var(--color-border-normal);
                transition: background-color 0.3s ease;
            }

            .search-input-container {
                position: relative;
                margin: 24px 24px 20px 24px;
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 16px 16px 16px 40px;
                border: 1px solid var(--color-border-normal);
                border-radius: var(--radius-medium);
                background-color: rgb(255 255 255 / 90%);
            }

            /* 深色主题下的背景色 */
            [data-theme="dark"] .search-input-container {
                background-color: rgb(240 240 240 / 90%);
            }

            .search-input-icon {
                display: flex;
                align-items: center;
                color: var(--color-text-secondary);
                font-size: 16px;
                pointer-events: none;
            }

            .search-input {
                flex: 1;
                border: none;
                background: transparent;
                color: var(--color-text-primary);
                font-size: 16px;
                outline: none;
                padding: 0;
            }

            .search-input:focus {
                outline: none;
            }
            
            .search-input-container:focus-within {
                border-color: var(--color-info);
                box-shadow: var(--shadow-focus);
            }

            .search-input::placeholder {
                color: var(--color-secondary);
            }

            .search-results {
                max-height: 400px;
                overflow-y: auto;
                scrollbar-width: thin;
                scrollbar-color: var(--color-border-normal) transparent;
                margin: 0 24px 24px 24px;
            }

            .search-results::-webkit-scrollbar {
                width: 6px;
            }

            .search-results::-webkit-scrollbar-track {
                background: transparent;
            }

            .search-results::-webkit-scrollbar-thumb {
                background-color: var(--color-border-normal);
                border-radius: var(--radius-small);
            }

            .search-results::-webkit-scrollbar-thumb:hover {
                background-color: var(--color-secondary);
            }

            .search-no-results {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px 20px;
                color: var(--color-text-secondary);
                text-align: center;
                gap: 12px;
            }

            .search-no-results-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 48px;
                height: 48px;
                background-color: var(--color-background-normal);
                border-radius: 50%;
                color: var(--color-secondary);
            }

            .search-no-results p {
                margin: 0;
                font-size: 16px;
            }

            .search-result-item {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 16px;
                border-radius: var(--radius-medium);
                cursor: pointer;
                transition: all 0.2s ease;
                border: 1px solid transparent;
            }

            .search-result-item:hover {
                background-color: var(--color-background-focused);
                border-color: var(--color-border-normal);
            }

            .search-result-image {
                width: 60px;
                height: 60px;
                border-radius: var(--radius-small);
                background-color: var(--color-surface-secondary);
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                flex-shrink: 0;
            }

            .search-result-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .search-result-image i {
                font-size: 24px;
                color: var(--color-secondary);
            }

            .search-result-content {
                flex: 1;
                min-width: 0;
            }

            .search-result-title {
                font-size: 16px;
                font-weight: 500;
                color: var(--color-text-primary);
                margin: 0 0 8px 0;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .search-result-id {
                font-size: 14px;
                color: var(--color-text-secondary);
                margin: 0 0 4px 0;
            }

            .search-result-price {
                font-size: 16px;
                font-weight: 600;
                color: var(--color-info);
                margin: 0;
            }

            /* 搜索图标样式 */
            .search-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                border-radius: var(--radius-small);
                background-color: transparent;
                color: var(--color-text-secondary);
                cursor: pointer;
                transition: all 0.2s ease;
                flex-shrink: 0;
                position: relative;
                z-index: 10;
            }

            .search-icon:hover {
                background-color: var(--color-background-focused);
                color: var(--color-text-primary);
                transform: scale(1.05);
            }

            .search-icon:active {
                transform: scale(0.95);
                background-color: var(--color-surface-secondary);
            }

            .search-icon i {
                font-size: 16px;
                pointer-events: none;
            }

            /* 响应式设计 */
            @media (max-width: 768px) {
                .search-modal {
                    padding-top: 60px;
                }
                
                .search-modal-content {
                    width: 95%;
                    margin: 0 16px;
                }
                
                .search-input-container {
                    margin: 20px 20px 16px 20px;
                }
                
                .search-results {
                    margin: 0 20px 20px 20px;
                }
                
                .search-result-item {
                    padding: 12px;
                    gap: 12px;
                }
                
                .search-result-image {
                    width: 50px;
                    height: 50px;
                }
                
                .search-result-title {
                    font-size: 15px;
                }
            }

            @media (max-width: 480px) {
                .search-modal {
                    padding-top: 40px;
                }
                
                .search-modal-content {
                    width: 100%;
                    margin: 0;
                    border-radius: var(--radius-medium);
                }
                
                .search-input-container {
                    margin: 16px 16px 12px 16px;
                }
                
                .search-results {
                    margin: 0 16px 16px 16px;
                }
                
                .search-input {
                    font-size: 16px; /* 防止iOS缩放 */
                }
            }
        `;

        document.head.appendChild(style);
    }

    /**
     * 初始化搜索弹窗
     */
    init() {
        this.injectStyles();
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
                    <div class="search-input-container">
                        <div class="search-input-icon">
                            ${Icon.render('search', { className: 'svg-icon', style: 'bold' })}
                        </div>
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
        `;

        // 查找现有的搜索弹窗并替换
        const existingModal = document.getElementById('search-modal');
        if (existingModal) {
            existingModal.outerHTML = modalHTML;
        } else {
            // 如果不存在，插入到body中
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // 搜索弹窗不需要关闭按钮
    }


    /**
     * 绑定事件监听器
     */
    bindEvents() {
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
            
            // 搜索弹窗不需要关闭按钮
            
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
                    <div class="search-no-results-icon">
                        ${Icon.render('search', { className: 'svg-icon', style: 'bold' })}
                    </div>
                    <p>未找到相关产品</p>
                </div>
            `;
            return;
        }

        const resultsHTML = results.map(result => `
            <div class="search-result-item" data-product-id="${result.id}">
                <div class="search-result-image">
                    ${result.image ? `<img src="${result.image}" alt="${result.title}">` : Icon.render('image', { className: 'svg-icon', style: 'bold' })}
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
