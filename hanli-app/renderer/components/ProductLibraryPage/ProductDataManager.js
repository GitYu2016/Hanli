/**
 * 产品数据管理类
 * 负责管理产品库的数据加载、排序、分页等功能
 */
class ProductDataManager {
    constructor() {
        this.currentSortField = 'collectTime';
        this.currentSortOrder = 'desc';
        this.currentPage = 1;
        this.itemsPerPage = 100;
        this.isLoading = false;
        this.productCountRefreshTimer = null;
        this.productLibraryRefreshTimer = null;
        this.visibilityListenerInitialized = false;
    }

    /**
     * 初始化产品数据管理器
     */
    init() {
        this.initVisibilityListener();
    }

    /**
     * 加载产品总数
     * @returns {Promise<number>} 产品总数
     */
    async loadProductCount() {
        // 防止重复加载
        if (this.isLoadingCount) {
            console.log('⏳ 产品总数正在加载中，跳过重复请求');
            return this.lastProductCount || 0;
        }
        
        this.isLoadingCount = true;
        
        try {
            // 通过API获取产品总数
            const response = await fetch('http://localhost:3001/api/products/count');
            if (response.ok) {
                const data = await response.json();
                const count = data.count || 0;
                
                // 更新UI中的产品总数显示
                this.updateProductCountDisplay(count);
                
                // 缓存结果
                this.lastProductCount = count;
                
                console.log(`📊 产品总数已更新: ${count}`);
                return count;
            } else {
                console.error('获取产品总数失败:', response.status);
                this.updateProductCountDisplay(0);
                return 0;
            }
        } catch (error) {
            console.error('获取产品总数失败:', error);
            this.updateProductCountDisplay(0);
            return 0;
        } finally {
            this.isLoadingCount = false;
        }
    }

    /**
     * 更新产品总数显示
     * @param {number} count - 产品总数
     */
    updateProductCountDisplay(count) {
        const countElement = document.getElementById('product-count');
        if (countElement) {
            countElement.textContent = count;
        }
    }

    /**
     * 按需刷新产品总数
     * @param {Function} isOnHomePageCallback - 检查是否在首页的回调函数
     */
    refreshProductCountIfNeeded(isOnHomePageCallback) {
        // 只有在首页时才刷新
        if (isOnHomePageCallback && isOnHomePageCallback()) {
            // 防止频繁刷新，如果正在加载则跳过
            if (this.isLoadingCount) {
                console.log('⏳ 产品总数正在加载中，跳过重复刷新');
                return;
            }
            console.log('🔄 按需刷新产品总数...');
            this.loadProductCount();
        }
    }

    /**
     * 初始化页面可见性监听
     */
    initVisibilityListener() {
        // 如果已经初始化过，直接返回
        if (this.visibilityListenerInitialized) {
            return;
        }

        // 绑定事件处理函数，以便后续可以正确移除
        this.handleVisibilityChange = () => {
            if (!document.hidden && this.isOnHomePage()) {
                console.log('📱 App从后台切换到前台，按需刷新产品总数');
                this.refreshProductCountIfNeeded(() => this.isOnHomePage());
            }
        };

        this.handleWindowFocus = () => {
            if (this.isOnHomePage()) {
                console.log('🎯 窗口获得焦点，按需刷新产品总数');
                this.refreshProductCountIfNeeded(() => this.isOnHomePage());
            }
        };

        // 监听页面可见性变化（App从后台到前台）
        document.addEventListener('visibilitychange', this.handleVisibilityChange);

        // 监听窗口焦点变化（作为备用）
        window.addEventListener('focus', this.handleWindowFocus);

        // 标记为已初始化
        this.visibilityListenerInitialized = true;
    }

    /**
     * 检查是否在首页
     * @returns {boolean} 是否在首页
     */
    isOnHomePage() {
        // 这个方法需要从外部传入检查逻辑
        // 因为TabManager在外部管理
        return false;
    }

    /**
     * 加载产品库数据
     * @param {Function} renderCallback - 渲染回调函数
     * @param {number} page - 页码，默认为当前页
     * @returns {Promise<Object>} 产品数据
     */
    async loadProductLibrary(renderCallback, page = null) {
        // 避免重复加载
        if (this.isLoading) {
            return {
                products: [],
                totalCount: 0,
                success: false,
                message: '正在加载中，请稍候...'
            };
        }
        
        this.isLoading = true;
        
        try {
            // 使用传入的页码或当前页码
            const currentPage = page || this.currentPage;
            
            // 构建API请求URL，包含分页参数
            const apiUrl = `http://localhost:3001/api/products?page=${currentPage}&itemsPerPage=${this.itemsPerPage}`;
            
            // 通过API获取产品列表
            const response = await fetch(apiUrl);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // 对产品进行排序
                    const sortedProducts = this.sortProducts(data.products);
                    
                    // 调用渲染回调
                    if (renderCallback) {
                        await renderCallback(sortedProducts, data.pagination.totalItems);
                    }
                    
                    // 同时更新产品总数显示（避免重复API调用）
                    this.updateProductCountDisplay(data.pagination.totalItems);
                    
                    console.log(`📦 产品库数据加载成功: 第${currentPage}页，共${data.pagination.totalItems}个产品`);
                    return {
                        products: sortedProducts,
                        totalCount: data.pagination.totalItems,
                        pagination: data.pagination,
                        success: true
                    };
                } else {
                    console.error('获取产品列表失败:', data.error);
                    throw new Error(data.error);
                }
            } else {
                console.error('获取产品列表失败:', response.status);
                throw new Error(`网络请求失败: ${response.status}`);
            }
        } catch (error) {
            console.error('加载产品库数据失败:', error);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * 排序产品
     * @param {Array} products - 产品数组
     * @returns {Array} 排序后的产品数组
     */
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

    /**
     * 分页产品
     * @param {Array} products - 产品数组
     * @returns {Array} 分页后的产品数组
     */
    paginateProducts(products) {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return products.slice(startIndex, endIndex);
    }

    /**
     * 处理排序
     * @param {string} field - 排序字段
     * @param {Function} updateCallback - 更新回调函数
     */
    handleSort(field, updateCallback) {
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
        
        // 调用更新回调
        if (updateCallback) {
            updateCallback();
        }
    }

    /**
     * 更新排序表头样式
     */
    updateSortHeaders() {
        const sortableHeaders = document.querySelectorAll('.product-table th.sortable');
        sortableHeaders.forEach(header => {
            header.classList.remove('sort-asc', 'sort-desc');
            if (header.dataset.sort === this.currentSortField) {
                header.classList.add(`sort-${this.currentSortOrder}`);
            }
        });
    }

    /**
     * 启动产品库自动刷新
     * @param {Function} isOnProductLibraryPageCallback - 检查是否在产品库页面的回调函数
     * @param {Function} refreshCallback - 刷新回调函数
     */
    startProductLibraryRefresh(isOnProductLibraryPageCallback, refreshCallback) {
        // 清除现有定时器
        this.stopProductLibraryRefresh();
        
        // 设置新的定时器，每5秒刷新一次
        this.productLibraryRefreshTimer = setInterval(() => {
            // 只有在产品库页面时才执行刷新
            if (isOnProductLibraryPageCallback && isOnProductLibraryPageCallback()) {
                console.log('自动刷新产品库数据...');
                if (refreshCallback) {
                    refreshCallback();
                }
            }
        }, 5000);
    }

    /**
     * 停止产品库自动刷新
     */
    stopProductLibraryRefresh() {
        if (this.productLibraryRefreshTimer) {
            clearInterval(this.productLibraryRefreshTimer);
            this.productLibraryRefreshTimer = null;
        }
    }

    /**
     * 获取产品价格
     * @param {Object} product - 产品对象
     * @returns {string} 价格字符串
     */
    getProductPrice(product) {
        if (product.skuList && product.skuList.length > 0) {
            const sku = product.skuList[0];
            return sku.goodsPromoPrice || sku.goodsNormalPrice || '价格未知';
        }
        return '价格未知';
    }

    /**
     * 获取昨日销量
     * @param {Object} product - 产品对象
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
     * @param {Object} product - 产品对象
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
            return collectTime;
        }
    }

    /**
     * 设置分页参数
     * @param {number} page - 页码
     * @param {number} itemsPerPage - 每页项目数
     */
    setPagination(page, itemsPerPage) {
        this.currentPage = page;
        this.itemsPerPage = itemsPerPage;
    }

    /**
     * 获取当前分页信息
     * @returns {Object} 分页信息
     */
    getPaginationInfo() {
        return {
            currentPage: this.currentPage,
            itemsPerPage: this.itemsPerPage,
            currentSortField: this.currentSortField,
            currentSortOrder: this.currentSortOrder
        };
    }

    /**
     * 销毁产品数据管理器
     */
    destroy() {
        // 移除事件监听器
        if (this.handleVisibilityChange) {
            document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        }
        if (this.handleWindowFocus) {
            window.removeEventListener('focus', this.handleWindowFocus);
        }
        
        // 清除定时器
        this.stopProductLibraryRefresh();
        
        // 重置状态
        this.isLoading = false;
        this.visibilityListenerInitialized = false;
    }
}

// 导出ProductDataManager类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductDataManager;
} else if (typeof window !== 'undefined') {
    window.ProductDataManager = ProductDataManager;
}
