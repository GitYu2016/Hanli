/**
 * ProductLibrary 组件
 * 负责产品库页面的渲染和数据管理
 */
class ProductLibraryComponent {
    /**
     * 获取组件样式
     * @returns {string} CSS样式字符串
     */
    getStyles() {
        return `
            /* 产品库页面样式 */
            .product-library-page {
                height: 100%;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                box-sizing: border-box;
            }

            .page-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-top: 8px;
            }

            .page-title {
                font-size: 18px;
                font-weight: 600;
                color: var(--color-primary);
                margin: 0;
            }

            .page-actions {
                display: flex;
                gap: 12px;
            }

            /* 分类筛选器样式 */
            .category-filter {
                padding: 0 16px 16px 0;
            }

            .filter-buttons {
                display: flex;
                gap: 4px;
                flex-wrap: wrap;
            }

            .filter-btn {
                padding: 4px 8px;
                border: 1px solid var(--color-border-normal);
                border-radius: var(--radius-small);
                background: var(--color-background-normal);
                color: var(--color-secondary);
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                white-space: nowrap;
            }

            .filter-btn:hover {
                background: var(--color-background-normal);
                border-color: var(--color-border-focused);
                color: var(--color-focused);
            }

            .filter-btn.active {
                background: var(--color-primary);
                border-color: var(--color-primary);
                color: var(--color-primary-reverse);
            }

            .filter-btn.active:hover {
                background: var(--color-primary);
                border-color: var(--color-primary);
            }

            .product-table-container {
                background: var(--color-background-normal);
                border-radius: var(--radius-card);
                overflow: auto;
                flex: 1;
                min-height: 0;
                max-height: calc(100vh - 180px);
                margin-bottom: 64px;
            }

            .product-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 14px;
            }

            .product-table thead {
                background: var(--color-background-normal);
                height: 40px;
            }

            .product-table th {
                padding: 0 12px;
                text-align: left;
                font-weight: 600;
                color: var(--color-primary);
                white-space: nowrap;
                position: relative;
                cursor: pointer;
                user-select: none;
            }

            .product-table th.sortable:hover {
                background-color: var(--color-background-focused);
            }

            .product-table th.sortable::after {
                content: '';
                position: absolute;
                right: 8px;
                top: 50%;
                transform: translateY(-50%);
                width: 12px;
                height: 12px;
                background-color: var(--color-secondary);
                mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M8 6L12 2L16 6M8 18L12 22L16 18M12 2V22' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
                mask-size: contain;
                mask-repeat: no-repeat;
                mask-position: center;
                opacity: 0.5;
                transition: all 0.2s ease;
            }

            .product-table th.sort-asc::after {
                background-color: var(--color-primary);
                mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M12 19V5M5 12L12 5L19 12' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
                opacity: 1;
            }

            .product-table th.sort-desc::after {
                background-color: var(--color-primary);
                mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M12 5V19M5 12L12 19L19 12' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
                opacity: 1;
            }

            .product-table td {
                padding: 0 12px;
                vertical-align: middle;
                height: 56px;
                text-align: left;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .product-price-growth.positive {
                color: var(--color-success);
                font-weight: 600;
            }

            .product-price-growth.negative {
                color: var(--color-error);
                font-weight: 600;
            }

            .product-row:hover {
                background-color: var(--color-background-focused);
                cursor: pointer;
            }

            .product-table tbody tr:hover {
                background: var(--color-background-focused);
            }


            .product-name {
                max-width: 300px;
                min-width: 200px;
                text-align: left;
                padding: 8px 12px;
            }

            .product-category {
                color: var(--color-secondary);
                font-size: 13px;
                min-width: 120px;
                max-width: 150px;
                padding: 8px 12px;
            }

            .product-sales {
                color: var(--color-primary);
                font-weight: 500;
                min-width: 100px;
                padding: 8px 12px;
            }

            .product-time {
                color: var(--color-secondary);
                font-size: 13px;
                min-width: 120px;
                padding: 8px 12px;
            }

            .product-name.clickable {
                cursor: pointer;
                transition: color 0.2s ease;
            }

            .product-name.clickable:hover {
                color: var(--color-primary);
            }

            .name-content {
                display: flex;
                align-items: center;
                gap: 8px;
                overflow: hidden;
                color: var(--color-primary);
                min-height: 32px;
            }

            .product-thumbnail {
                width: 32px;
                height: 32px;
                object-fit: cover;
                border-radius: var(--radius-small);
                flex-shrink: 0;
                border: 1px solid var(--color-border-normal);
            }

            .product-thumbnail.placeholder {
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: var(--color-background-normal);
                color: var(--color-secondary);
                font-size: 16px;
                border: 1px solid var(--color-border-normal);
            }

            .product-title {
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .product-sold {
                text-align: right;
                font-weight: 500;
                color: var(--color-secondary);
                min-width: 80px;
            }

            .product-price {
                font-weight: 600;
                color: var(--color-primary);
                min-width: 100px;
            }

            .product-actions {
                text-align: center;
                min-width: 100px;
            }

            /* 产品库组件样式 */
            .loading-products,
            .no-products,
            .error-products {
                text-align: center;
                padding: 32px;
                color: var(--color-secondary);
                font-size: 14px;
            }

            .loading-row,
            .empty-row,
            .error-row {
                text-align: center;
            }

            .no-products i,
            .error-products i {
                font-size: 32px;
                margin-bottom: 12px;
                opacity: 0.5;
                display: block;
            }

            .no-products p,
            .error-products p {
                margin: 0 0 16px 0;
                font-size: 14px;
            }

            .retry-btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                background-color: var(--color-primary);
                color: var(--color-primary-reverse);
                border: none;
                border-radius: var(--radius-small);
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .retry-btn:hover {
                background-color: var(--color-focused);
            }

            .refresh-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                border: none;
                background: none;
                color: var(--color-secondary);
                cursor: pointer;
                border-radius: var(--radius-small);
                transition: all 0.2s ease;
            }

            .refresh-btn:hover {
                background: var(--color-background-focused);
                color: var(--color-primary);
            }

            .refresh-btn i.rotate {
                animation: rotate 1s linear infinite;
            }

            @keyframes rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
    }
    constructor() {
        this.container = null;
        this.products = [];
        this.filteredProducts = [];
        this.totalCount = 0;
        this.currentPage = 1;
        this.itemsPerPage = 100;
        this.sortField = 'collectTime';
        this.sortOrder = 'desc'; // 默认按采集时间倒序，最近的在最上面
        this.refreshInterval = null;
        this.currentCategory = this.getStoredCategory() || 'all'; // 从本地存储读取分类选择
        this.categories = [];
        this.storageKey = 'productLibrary_selectedCategory'; // 本地存储的key
    }

    /**
     * 获取本地存储的分类选择
     * @returns {string|null} 存储的分类名称
     */
    getStoredCategory() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored || null;
        } catch (error) {
            console.warn('读取本地存储的分类选择失败:', error);
            return null;
        }
    }

    /**
     * 保存分类选择到本地存储
     * @param {string} category - 分类名称
     */
    setStoredCategory(category) {
        try {
            localStorage.setItem(this.storageKey, category);
            console.log('已保存分类选择到本地存储:', category);
        } catch (error) {
            console.warn('保存分类选择到本地存储失败:', error);
        }
    }

    /**
     * 初始化产品库组件
     * @param {HTMLElement} container - 容器元素
     */
    async init(container) {
        this.container = container;
        this.render();
        // 不在这里加载数据，由外部调用
        this.bindEvents();
        
        // 监听主题变化事件
        this.setupThemeListener();
    }

    /**
     * 设置主题监听器
     */
    setupThemeListener() {
        // 监听主题变化事件
        document.addEventListener('themeChanged', () => {
            console.log('ProductLibrary: 检测到主题变化，重新应用样式');
            this.refreshStyles();
        });
        
        // 监听系统主题变化
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', () => {
                console.log('ProductLibrary: 检测到系统主题变化，重新应用样式');
                this.refreshStyles();
            });
        }
    }

    /**
     * 刷新样式
     */
    refreshStyles() {
        // 重新注入样式
        this.injectStyles();
    }

    /**
     * 注入组件样式
     */
    injectStyles() {
        // 如果样式已存在，先移除
        const existingStyle = document.getElementById('product-library-styles');
        if (existingStyle) {
            existingStyle.remove();
        }

        const styleElement = document.createElement('style');
        styleElement.id = 'product-library-styles';
        styleElement.textContent = this.getStyles();
        document.head.appendChild(styleElement);
    }

    /**
     * 渲染产品库页面
     */
    render() {
        if (!this.container) return;

        // 注入样式
        this.injectStyles();

        this.container.innerHTML = `
            <div class="product-library-page">
                <div class="page-header">
                    <h1 class="page-title">
                        ${Icon.render('package', { className: 'svg-icon', style: 'bold' })}
                        产品库
                    </h1>
                </div>
                
                <div class="category-filter" id="category-filter">
                    <div class="filter-buttons">
                        <button class="filter-btn ${this.currentCategory === 'all' ? 'active' : ''}" data-category="all">全部</button>
                    </div>
                </div>
                
                <div class="product-table-container">
                    <table class="product-table">
                        <thead>
                            <tr>
                                <th class="sortable" data-sort="goodsTitle">产品标题</th>
                                <th class="sortable" data-sort="goodsCat2">二级分类</th>
                                <th class="sortable" data-sort="totalSales">总销量</th>
                                <th class="sortable sort-desc" data-sort="collectTime">采集日期</th>
                            </tr>
                        </thead>
                        <tbody id="product-table-body">
                            <tr>
                                <td colspan="4" class="loading-row">
                                    <div class="loading-products">正在加载产品数据...</div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
            </div>
        `;
    }

    /**
     * 设置产品数据（由外部调用）
     * @param {Array} products - 产品列表
     * @param {number} totalCount - 总数量
     */
    async setProducts(products, totalCount = 0) {
        this.products = products || [];
        this.totalCount = totalCount;
        
        // 优先从服务器获取所有分类，如果失败则使用本地分类
        const serverCategoriesLoaded = await this.loadAllCategories();
        if (!serverCategoriesLoaded) {
            // 如果服务器分类加载失败，使用本地分类
            this.extractCategories();
        }
        
        // 如果是从服务器分页加载的数据，直接使用
        // 否则进行本地筛选和排序处理
        if (products.length <= this.itemsPerPage && totalCount > this.itemsPerPage) {
            // 这是分页数据，直接使用
            this.filteredProducts = [...this.products];
        } else {
            // 这是全量数据，需要本地处理
            // 应用分类筛选
            this.applyCategoryFilter();
            
            // 应用默认排序（按采集时间倒序）
            this.sortProducts();
        }
        
        this.updateProductTable();
        this.updateSummary();
        this.updateSortIndicators();
        this.updateCategoryFilter();
        
        // 避免重复日志，只在调试模式下输出
        if (window.DEBUG_MODE) {
            console.log('产品库数据设置成功:', this.products.length, '个产品，总数:', this.totalCount);
        }
    }

    /**
     * 加载产品库数据
     * @param {number} page - 页码，可选
     */
    async loadProductLibrary(page = null) {
        try {
            // 使用传入的页码或当前页码
            const currentPage = page || this.currentPage;
            
            // 构建API请求URL，包含分页和排序参数
            const apiUrl = `http://localhost:3001/api/products?page=${currentPage}&itemsPerPage=${this.itemsPerPage}&sortField=${this.sortField}&sortOrder=${this.sortOrder}`;
            
            const response = await fetch(apiUrl);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // 使用setProducts方法统一处理数据
                    await this.setProducts(data.products, data.pagination ? data.pagination.totalItems : 0);
                } else {
                    this.showError('加载产品数据失败: ' + (data.error || '未知错误'));
                }
            } else {
                this.showError('服务器响应失败: ' + response.status);
            }
        } catch (error) {
            console.error('加载产品库失败:', error);
            this.showError('无法连接到本地服务器，请确保应用正在运行');
        }
    }

    /**
     * 更新产品表格
     */
    updateProductTable() {
        const tableBody = document.getElementById('product-table-body');
        if (!tableBody) return;

        if (this.products.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-row">
                        <div class="no-products">
                            ${Icon.render('package', { className: 'svg-icon', style: 'bold' })}
                            <p>暂无产品数据</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        // 如果使用服务器分页，直接显示当前页的产品数据
        // 如果使用本地分页，需要计算当前页的产品数据
        let currentPageProducts;
        if (this.totalCount > this.itemsPerPage && this.products.length <= this.itemsPerPage) {
            // 服务器分页模式，直接使用当前产品数据
            currentPageProducts = this.products;
        } else {
            // 本地分页模式，需要计算分页
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;
            currentPageProducts = this.filteredProducts.slice(startIndex, endIndex);
        }

        tableBody.innerHTML = this.generateProductTableRows(currentPageProducts);
    }

    /**
     * 获取产品的第一张图片
     * @param {Object} product - 产品数据
     * @returns {Object|null} 第一张图片信息
     */
    getFirstImage(product) {
        if (product.images && product.images.length > 0) {
            return product.images[0];
        }
        return null;
    }

    /**
     * 生成产品表格行
     * @param {Array} products - 产品列表
     * @returns {string} HTML字符串
     */
    generateProductTableRows(products) {
        return products.map(product => {
            const goodsCat3 = product.goodsCat3 || product.goodsTitleEn || '未知商品';
            const goodsCat2 = product.goodsCat2 || '未知分类';
            const totalSales = this.getTotalSales(product);
            const collectTime = this.formatCollectTime(product.collectTime);
            const firstImage = this.getFirstImage(product);
            
            return `
                <tr class="product-row" data-goods-id="${product.goodsId}">
                    <td class="product-name clickable" title="${goodsCat3}" data-goods-id="${product.goodsId}">
                        <div class="name-content">
                            ${firstImage ? 
                                `<img src="${firstImage.url}" alt="${goodsCat3}" class="product-thumbnail" onerror="this.style.display='none'" loading="lazy">` : 
                                `<div class="product-thumbnail placeholder">📦</div>`
                            }
                            <span class="product-title">${this.truncateText(goodsCat3, 50)}</span>
                        </div>
                    </td>
                    <td class="product-category">${goodsCat2}</td>
                    <td class="product-sales">${totalSales}</td>
                    <td class="product-time">${collectTime}</td>
                </tr>
            `;
        }).join('');
    }

    /**
     * 更新摘要信息
     */
    updateSummary() {
        // 更新翻页组件的数据
        if (typeof window.mainAppInstance !== 'undefined' && window.mainAppInstance.pageContainer && window.mainAppInstance.pageContainer.updatePagination) {
            // 优先使用全局产品总数，如果没有则使用过滤后的产品数量
            let totalItems = this.filteredProducts.length;
            
            // 尝试从全局ProductDataManager获取产品总数
            if (window.productDataManager && window.productDataManager.lastProductCount) {
                totalItems = window.productDataManager.lastProductCount;
            }
            
            window.mainAppInstance.pageContainer.updatePagination({
                totalItems: totalItems,
                currentPage: this.currentPage,
                itemsPerPage: this.itemsPerPage
            });
        }
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 绑定排序事件
        this.bindSortEvents();
        
        // 绑定产品点击事件
        this.bindProductClickEvents();
        
        // 绑定分类筛选事件
        this.bindCategoryFilterEvents();
    }

    /**
     * 绑定排序事件
     */
    bindSortEvents() {
        const sortableHeaders = document.querySelectorAll('.sortable');
        sortableHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
                const field = e.currentTarget.dataset.sort;
                this.handleSort(field);
            });
        });
    }

    /**
     * 绑定产品点击事件
     * 注意：产品点击事件已在app.js中统一处理，这里不需要重复绑定
     */
    bindProductClickEvents() {
        // 产品点击事件已在app.js中统一处理，避免重复绑定
    }

    /**
     * 处理排序
     * @param {string} field - 排序字段
     */
    handleSort(field) {
        if (this.sortField === field) {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortOrder = 'asc';
        }

        // 重置到第一页
        this.currentPage = 1;

        // 如果是服务器分页模式，需要重新请求数据
        if (this.totalCount > this.itemsPerPage && this.products.length <= this.itemsPerPage) {
            // 服务器分页模式，重新请求数据
            this.loadProductLibrary();
        } else {
            // 本地分页模式，本地排序
            this.sortProducts();
            this.updateProductTable();
        }
        
        this.updateSortIndicators();
        this.updateSummary();
    }

    /**
     * 排序产品
     */
    sortProducts() {
        this.filteredProducts.sort((a, b) => {
            let aVal = this.getSortValue(a, this.sortField);
            let bVal = this.getSortValue(b, this.sortField);

            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (aVal < bVal) return this.sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }

    /**
     * 获取排序值
     * @param {Object} product - 产品对象
     * @param {string} field - 字段名
     * @returns {*} 排序值
     */
    getSortValue(product, field) {
        switch (field) {
            case 'goodsTitle':
                return product.goodsCat3 || product.goodsTitleEn || product.goodsTitle || '';
            case 'goodsCat2':
                return product.goodsCat2 || '';
            case 'totalSales':
                return this.getTotalSalesValue(product);
            case 'collectTime':
                return new Date(product.collectTime || 0);
            default:
                return '';
        }
    }

    /**
     * 更新排序指示器
     */
    updateSortIndicators() {
        const headers = document.querySelectorAll('.sortable');
        headers.forEach(header => {
            header.classList.remove('sort-asc', 'sort-desc');
            if (header.dataset.sort === this.sortField) {
                header.classList.add(this.sortOrder === 'asc' ? 'sort-asc' : 'sort-desc');
            }
        });
    }

    /**
     * 导航到产品详情
     * @param {string} goodsId - 产品ID
     */
    async navigateToProductDetail(goodsId) {
        if (typeof homePageInstance !== 'undefined' && homePageInstance.navigateToProductDetail) {
            await homePageInstance.navigateToProductDetail(goodsId);
        } else {
            console.log('导航到产品详情:', goodsId);
        }
    }

    /**
     * 刷新数据
     */
    async refreshData() {
        const refreshBtn = document.querySelector('.refresh-btn');
        if (refreshBtn) {
            refreshBtn.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12Z M12 3V12L16.5 16.5"/></svg>';
        }

        try {
            await this.loadProductLibrary();
            this.showToast('数据已刷新', 'success');
        } catch (error) {
            this.showToast('刷新失败', 'error');
        } finally {
            if (refreshBtn) {
                refreshBtn.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12Z M12 3V12L16.5 16.5"/></svg>';
            }
        }
    }

    /**
     * 开始自动刷新
     */
    startAutoRefresh() {
        this.stopAutoRefresh();
        this.refreshInterval = setInterval(() => {
            this.loadProductLibrary();
        }, 5000); // 每5秒刷新一次
    }

    /**
     * 停止自动刷新
     */
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    /**
     * 显示错误信息
     * @param {string} message - 错误消息
     */
    showError(message) {
        const tableBody = document.getElementById('product-table-body');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="error-row">
                        <div class="error-products">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18C1.64584 18.3024 1.5729 18.6453 1.61207 18.9873C1.65124 19.3293 1.80026 19.6504 2.03696 19.9014C2.27367 20.1523 2.58521 20.3199 2.92484 20.3789C3.26447 20.4379 3.61418 20.3852 3.92 20.23L12 16.77L20.08 20.23C20.3858 20.3852 20.7355 20.4379 21.0752 20.3789C21.4148 20.3199 21.7263 20.1523 21.963 19.9014C22.1997 19.6504 22.3488 19.3293 22.3879 18.9873C22.4271 18.6453 22.3542 18.3024 22.18 18L13.71 3.86C13.5325 3.56631 13.2515 3.35219 12.9218 3.25912C12.5921 3.16605 12.2378 3.20046 11.93 3.3564C11.6222 3.51234 11.3846 3.77943 11.2656 4.10239C11.1467 4.42535 11.1555 4.77961 11.29 5.1L12.75 8.5L11.29 11.9C11.1555 12.2204 11.1467 12.5747 11.2656 12.8976C11.3846 13.2206 11.6222 13.4877 11.93 13.6436C12.2378 13.7995 12.5921 13.8339 12.9218 13.7409C13.2515 13.6478 13.5325 13.4337 13.71 13.14L22.18 1.86C22.3542 1.5576 22.4271 1.2147 22.3879 0.87268C22.3488 0.53066 22.1997 0.20959 21.963 -0.04135C21.7263 -0.29229 21.4148 -0.45993 21.0752 -0.51892C20.7355 -0.57791 20.3858 -0.52519 20.08 -0.37L12 3.07L3.92 -0.37C3.61418 -0.52519 3.26447 -0.57791 2.92484 -0.51892C2.58521 -0.45993 2.27367 -0.29229 2.03696 -0.04135C1.80026 0.20959 1.65124 0.53066 1.61207 0.87268C1.5729 1.2147 1.64584 1.5576 1.82 1.86L10.29 3.86Z"/></svg>
                            <p>${message}</p>
                            <button class="retry-btn" onclick="productLibraryComponentInstance.refreshData()">
                                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12Z M12 3V12L16.5 16.5"/></svg> 重试
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }
    }

    /**
     * 显示Toast通知
     * @param {string} message - 消息
     * @param {string} type - 类型 (success, error, info, warning)
     */
    showToast(message, type = 'info') {
        // 这里可以集成toast通知系统
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    /**
     * 获取总销量
     * @param {Object} product - 产品数据
     * @returns {string} 销量字符串
     */
    getTotalSales(product) {
        // 从monitoring.json中获取最近一天的goodsSold
        if (product.monitoringData && product.monitoringData.length > 0) {
            const latestData = product.monitoringData[product.monitoringData.length - 1];
            if (latestData.goodsData && latestData.goodsData.goodsSold) {
                return latestData.goodsData.goodsSold;
            }
        }
        return '-';
    }

    /**
     * 获取总销量数值（用于排序）
     * @param {Object} product - 产品数据
     * @returns {number} 销量数值
     */
    getTotalSalesValue(product) {
        if (product.monitoringData && product.monitoringData.length > 0) {
            const latestData = product.monitoringData[product.monitoringData.length - 1];
            if (latestData.goodsData && latestData.goodsData.goodsSold) {
                // 提取数字部分，去掉"件"等文字
                const salesText = latestData.goodsData.goodsSold;
                const match = salesText.match(/(\d+)/);
                return match ? parseInt(match[1]) : 0;
            }
        }
        return 0;
    }


    /**
     * 截断文本
     * @param {string} text - 原始文本
     * @param {number} maxLength - 最大长度
     * @returns {string} 截断后的文本
     */
    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    /**
     * 格式化采集时间
     * @param {string} collectTime - 采集时间
     * @returns {string} 格式化后的时间
     */
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
            return '时间格式错误';
        }
    }

    /**
     * 销毁组件
     */
    destroy() {
        this.stopAutoRefresh();
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.products = [];
        this.totalCount = 0;
        this.container = null;
        
        // 清理样式
        const styleElement = document.getElementById('product-library-styles');
        if (styleElement) {
            styleElement.remove();
        }
    }

    /**
     * 刷新组件
     */
    async refresh() {
        if (this.container) {
            await this.loadProductLibrary();
        }
    }

    /**
     * 提取所有分类
     */
    extractCategories() {
        const categorySet = new Set();
        this.products.forEach(product => {
            if (product.goodsCat1) {
                categorySet.add(product.goodsCat1);
            }
        });
        this.categories = Array.from(categorySet).sort();
    }

    /**
     * 从服务器获取所有分类
     */
    async loadAllCategories() {
        try {
            const response = await fetch('http://localhost:3001/api/categories');
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.categories) {
                    this.categories = data.categories;
                    console.log('成功加载所有分类:', this.categories);
                    return true;
                }
            }
        } catch (error) {
            console.warn('从服务器获取分类失败，使用本地分类:', error);
        }
        return false;
    }

    /**
     * 应用分类筛选
     */
    applyCategoryFilter() {
        if (this.currentCategory === 'all') {
            this.filteredProducts = [...this.products];
        } else {
            this.filteredProducts = this.products.filter(product => 
                product.goodsCat1 === this.currentCategory
            );
        }
    }

    /**
     * 更新分类筛选器
     */
    updateCategoryFilter() {
        const filterContainer = document.getElementById('category-filter');
        if (!filterContainer) return;

        const buttonsContainer = filterContainer.querySelector('.filter-buttons');
        if (!buttonsContainer) return;

        // 生成分类按钮，根据当前选择的分类设置active状态
        const categoryButtons = this.categories.map(category => 
            `<button class="filter-btn ${this.currentCategory === category ? 'active' : ''}" data-category="${category}">${category}</button>`
        ).join('');

        buttonsContainer.innerHTML = `
            <button class="filter-btn ${this.currentCategory === 'all' ? 'active' : ''}" data-category="all">全部</button>
            ${categoryButtons}
        `;

        // 重新绑定事件
        this.bindCategoryFilterEvents();
    }

    /**
     * 绑定分类筛选事件
     */
    bindCategoryFilterEvents() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.handleCategoryFilter(category);
            });
        });
    }

    /**
     * 处理分类筛选
     * @param {string} category - 分类名称
     */
    handleCategoryFilter(category) {
        this.currentCategory = category;
        
        // 保存分类选择到本地存储
        this.setStoredCategory(category);
        
        // 更新按钮状态
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });

        // 重置到第一页
        this.currentPage = 1;

        // 应用筛选
        this.applyCategoryFilter();
        
        // 重新排序
        this.sortProducts();
        
        // 更新表格和摘要
        this.updateProductTable();
        this.updateSummary();
    }
}

// 创建全局实例
const productLibraryComponentInstance = new ProductLibraryComponent();
