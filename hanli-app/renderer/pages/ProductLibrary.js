/**
 * ProductLibrary 组件
 * 负责产品库页面的渲染和数据管理
 */
class ProductLibraryComponent {
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
        this.currentCategory = 'all';
        this.categories = [];
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
    }

    /**
     * 渲染产品库页面
     */
    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="product-library-page">
                <div class="page-header">
                    <h1 class="page-title">
                        <i class="ph ph-package"></i>
                        产品库
                    </h1>
                </div>
                
                <div class="category-filter" id="category-filter">
                    <div class="filter-buttons">
                        <button class="filter-btn active" data-category="all">全部</button>
                    </div>
                </div>
                
                <div class="product-table-container">
                    <table class="product-table">
                        <thead>
                            <tr>
                                <th class="sortable" data-sort="goodsCat3">产品标题</th>
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
    setProducts(products, totalCount = 0) {
        this.products = products || [];
        this.totalCount = totalCount;
        
        // 提取所有分类
        this.extractCategories();
        
        // 应用分类筛选
        this.applyCategoryFilter();
        
        // 应用默认排序（按采集时间倒序）
        this.sortProducts();
        
        this.updateProductTable();
        this.updateSummary();
        this.updateSortIndicators();
        this.updateCategoryFilter();
        
        // 避免重复日志，只在调试模式下输出
        if (window.DEBUG_MODE) {
            console.log('产品库数据设置成功:', this.products.length, '个产品');
        }
    }

    /**
     * 加载产品库数据
     */
    async loadProductLibrary() {
        try {
            const response = await fetch('http://localhost:3001/api/products');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // 使用setProducts方法统一处理数据
                    this.setProducts(data.products, data.products ? data.products.length : 0);
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

        if (this.filteredProducts.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-row">
                        <div class="no-products">
                            <i class="ph ph-package"></i>
                            <p>暂无产品数据</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        // 计算当前页的产品数据
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const currentPageProducts = this.filteredProducts.slice(startIndex, endIndex);

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
        if (typeof homePageInstance !== 'undefined' && homePageInstance.pageContainer && homePageInstance.pageContainer.updatePagination) {
            homePageInstance.pageContainer.updatePagination({
                totalItems: this.filteredProducts.length,
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

        this.sortProducts();
        this.updateProductTable();
        this.updateSortIndicators();
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
            case 'goodsCat3':
                return product.goodsCat3 || product.goodsTitleEn || '';
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
            refreshBtn.innerHTML = '<i class="ph ph-arrow-clockwise rotate"></i>';
        }

        try {
            await this.loadProductLibrary();
            this.showToast('数据已刷新', 'success');
        } catch (error) {
            this.showToast('刷新失败', 'error');
        } finally {
            if (refreshBtn) {
                refreshBtn.innerHTML = '<i class="ph ph-arrow-clockwise"></i>';
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
                            <i class="ph ph-warning"></i>
                            <p>${message}</p>
                            <button class="retry-btn" onclick="productLibraryComponentInstance.refreshData()">
                                <i class="ph ph-arrow-clockwise"></i> 重试
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

        // 生成分类按钮
        const categoryButtons = this.categories.map(category => 
            `<button class="filter-btn" data-category="${category}">${category}</button>`
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
        
        // 更新按钮状态
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });

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
