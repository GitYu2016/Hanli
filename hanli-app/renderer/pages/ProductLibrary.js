/**
 * ProductLibrary 组件
 * 负责产品库页面的渲染和数据管理
 */
class ProductLibraryComponent {
    constructor() {
        this.container = null;
        this.products = [];
        this.totalCount = 0;
        this.currentPage = 1;
        this.itemsPerPage = 100;
        this.sortField = 'collectTime';
        this.sortOrder = 'desc'; // 默认按采集时间倒序，最近的在最上面
        this.refreshInterval = null;
    }

    /**
     * 初始化产品库组件
     * @param {HTMLElement} container - 容器元素
     */
    async init(container) {
        this.container = container;
        this.render();
        await this.loadProductLibrary();
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
                    <h1 class="page-title">产品库</h1>
                    <div class="page-actions">
                        <button class="refresh-btn" onclick="productLibraryComponentInstance.refreshData()" title="刷新数据">
                            <i class="ph ph-arrow-clockwise"></i>
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
                
                <div class="product-summary">
                    <div class="summary-item">
                        <span class="summary-label">总产品数:</span>
                        <span class="summary-value" id="total-count">0</span>
                    </div>
                    <div class="pagination-info">
                        <span>第 <strong id="current-page">1</strong> 页，共 <strong id="total-pages">1</strong> 页</span>
                    </div>
                </div>
            </div>
        `;
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
                    this.products = data.products || [];
                    this.totalCount = data.products ? data.products.length : 0;
                    
                    // 应用默认排序（按采集时间倒序）
                    this.sortProducts();
                    
                    this.updateProductTable();
                    this.updateSummary();
                    this.updateSortIndicators(); // 更新排序指示器
                    console.log('产品库数据加载成功:', this.products.length, '个产品');
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
                            <i class="ph ph-package"></i>
                            <p>暂无产品数据</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.generateProductTableRows(this.products);
    }

    /**
     * 生成产品表格行
     * @param {Array} products - 产品列表
     * @returns {string} HTML字符串
     */
    generateProductTableRows(products) {
        return products.map(product => {
            const goodsCat3 = product.goodsCat3 || product.goodsTitleEn || '未知商品';
            const yesterdaySales = this.getYesterdaySales(product);
            const priceGrowthPercent = this.getPriceGrowthPercent(product);
            const collectTime = this.formatCollectTime(product.collectTime);
            
            return `
                <tr class="product-row" data-goods-id="${product.goodsId}">
                    <td class="product-name clickable" title="${goodsCat3}" data-goods-id="${product.goodsId}">
                        <div class="name-content">${this.truncateText(goodsCat3, 50)}</div>
                    </td>
                    <td class="product-sales">${yesterdaySales}</td>
                    <td class="product-price-growth ${priceGrowthPercent.startsWith('+') ? 'positive' : priceGrowthPercent.startsWith('-') ? 'negative' : ''}">${priceGrowthPercent}</td>
                    <td class="product-time">${collectTime}</td>
                </tr>
            `;
        }).join('');
    }

    /**
     * 更新摘要信息
     */
    updateSummary() {
        const totalCountEl = document.getElementById('total-count');
        const currentPageEl = document.getElementById('current-page');
        const totalPagesEl = document.getElementById('total-pages');

        if (totalCountEl) {
            totalCountEl.textContent = this.totalCount.toLocaleString();
        }
        
        if (currentPageEl) {
            currentPageEl.textContent = this.currentPage;
        }
        
        if (totalPagesEl) {
            totalPagesEl.textContent = Math.ceil(this.totalCount / this.itemsPerPage);
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
     */
    bindProductClickEvents() {
        document.addEventListener('click', async (e) => {
            const productName = e.target.closest('.product-name.clickable');
            if (productName) {
                const goodsId = productName.dataset.goodsId;
                if (goodsId) {
                    await this.navigateToProductDetail(goodsId);
                }
            }
        });
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
        this.products.sort((a, b) => {
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
            case 'yesterdaySales':
                return product.yesterdaySales || 0;
            case 'priceGrowthPercent':
                return product.priceGrowthPercent || 0;
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
     * 获取昨日销量
     * @param {Object} product - 产品数据
     * @returns {string} 销量字符串
     */
    getYesterdaySales(product) {
        if (product.yesterdaySales !== undefined) {
            return Math.round(product.yesterdaySales).toLocaleString() + '件';
        }
        return '-';
    }

    /**
     * 获取价格增长百分比
     * @param {Object} product - 产品数据
     * @returns {string} 增长百分比字符串
     */
    getPriceGrowthPercent(product) {
        if (product.priceGrowthPercent !== undefined) {
            const percent = product.priceGrowthPercent;
            const sign = percent >= 0 ? '+' : '';
            return `${sign}${percent.toFixed(1)}%`;
        }
        return '-';
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
}

// 创建全局实例
const productLibraryComponentInstance = new ProductLibraryComponent();
