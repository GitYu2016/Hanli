/**
 * PageContainer 组件
 * 负责页面容器的渲染和内容管理
 * 样式定义在JavaScript中，通过StyleManager管理
 */
class PageContainer {
    constructor() {
        this.currentPage = null;
        this.pageContent = null;
        this.productCharts = null;
        this.pagination = null;
        this.initStyles();
        this.init();
    }

    /**
     * 初始化PageContainer样式
     */
    initStyles() {
        // 确保StyleManager已加载
        if (typeof window.styleManager === 'undefined') {
            console.error('StyleManager未加载，请确保已引入StyleManager.js');
            return;
        }

        // 定义PageContainer样式
        const pageContainerStyles = {
            // 页面容器
            '.page-container': {
                'flex': '1',
                'display': 'flex',
                'flex-direction': 'column',
                'overflow': 'hidden'
            },

            // 页面内容
            '.page-content': {
                'flex': '1',
                'overflow-y': 'auto',
                'overflow-x': 'hidden',
                'padding': '0 20px'
            },


            // 响应式设计
            '@media (max-width: 768px)': {
                '.page-content': {
                    'padding': '16px'
                }
            }
        };

        // 注册样式到StyleManager
        window.styleManager.defineStyles('PageContainer', pageContainerStyles);
    }

    /**
     * 初始化PageContainer组件
     */
    init() {
        this.render();
    }

    /**
     * 渲染PageContainer HTML结构
     */
    render() {
        const pageContainerHTML = `
            <div id="page-container" class="page-container">
                <div class="page-content">
                    <!-- 页面内容将动态渲染在这里 -->
                </div>
                <div id="pagination-container" class="pagination-container" style="display: none;"></div>
            </div>
        `;

        // 查找现有的page-container元素并替换
        const existingContainer = document.getElementById('page-container');
        if (existingContainer) {
            existingContainer.outerHTML = pageContainerHTML;
        } else {
            // 如果不存在，插入到main-layout中
            const mainLayout = document.querySelector('.main-layout');
            if (mainLayout) {
                mainLayout.insertAdjacentHTML('beforeend', pageContainerHTML);
            }
        }

        this.pageContent = document.querySelector('.page-content');
        // 异步初始化分页组件
        this.initPagination().catch(error => {
            console.error('分页组件初始化失败:', error);
        });
    }

    /**
     * 渲染首页内容
     */
    async renderHomePage() {
        if (!this.pageContent) return;

        // 清空内容
        this.pageContent.innerHTML = '';

        // 使用HomePage组件
        if (typeof homePageInstance !== 'undefined') {
            await homePageInstance.init(this.pageContent);
        } else {
            console.error('HomePage组件未加载');
            this.pageContent.innerHTML = '<div class="error-page">组件加载失败</div>';
        }

        this.currentPage = 'home';
        this.hidePagination();
    }

    /**
     * 渲染产品库页面
     * @param {Array} products - 产品列表
     * @param {number} totalCount - 总数量
     */
    async renderProductLibrary(products, totalCount = 0) {
        if (!this.pageContent) return;

        // 清空内容
        this.pageContent.innerHTML = '';

        // 使用ProductLibrary组件
        if (typeof productLibraryComponentInstance !== 'undefined') {
            await productLibraryComponentInstance.init(this.pageContent);
            // 如果有数据，直接设置到组件中
            if (products && products.length > 0) {
                await productLibraryComponentInstance.setProducts(products, totalCount);
            }
        } else {
            console.error('ProductLibraryComponent组件未加载');
            this.pageContent.innerHTML = '<div class="error-page">组件加载失败</div>';
        }

        this.currentPage = 'product-library';
        
        // 显示翻页组件
        this.showPagination();
    }

    /**
     * 渲染产品详情页面
     * @param {Object} product - 产品数据
     */
    async renderProductDetail(product) {
        if (!this.pageContent) return;

        // 清空内容
        this.pageContent.innerHTML = '';

        // 使用ProductDetail组件
        if (typeof productDetailComponentInstance !== 'undefined') {
            await productDetailComponentInstance.init(this.pageContent, product);
        } else {
            console.error('ProductDetailComponent组件未加载');
            this.pageContent.innerHTML = '<div class="error-page">组件加载失败</div>';
        }

        this.currentPage = 'product-detail';
        this.hidePagination();
    }

    /**
     * 渲染错误页面
     * @param {string} message - 错误信息
     */
    renderErrorPage(message) {
        if (!this.pageContent) return;

        this.pageContent.innerHTML = `
            <div class="error-page">
                <div class="error-icon">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18C1.64584 18.3024 1.5729 18.6453 1.61207 18.9873C1.65124 19.3293 1.80026 19.6504 2.03696 19.9014C2.27367 20.1523 2.58521 20.3199 2.92484 20.3789C3.26447 20.4379 3.61418 20.3852 3.92 20.23L12 16.77L20.08 20.23C20.3858 20.3852 20.7355 20.4379 21.0752 20.3789C21.4148 20.3199 21.7263 20.1523 21.963 19.9014C22.1997 19.6504 22.3488 19.3293 22.3879 18.9873C22.4271 18.6453 22.3542 18.3024 22.18 18L13.71 3.86C13.5325 3.56631 13.2515 3.35219 12.9218 3.25912C12.5921 3.16605 12.2378 3.20046 11.93 3.3564C11.6222 3.51234 11.3846 3.77943 11.2656 4.10239C11.1467 4.42535 11.1555 4.77961 11.29 5.1L12.75 8.5L11.29 11.9C11.1555 12.2204 11.1467 12.5747 11.2656 12.8976C11.3846 13.2206 11.6222 13.4877 11.93 13.6436C12.2378 13.7995 12.5921 13.8339 12.9218 13.7409C13.2515 13.6478 13.5325 13.4337 13.71 13.14L22.18 1.86C22.3542 1.5576 22.4271 1.2147 22.3879 0.87268C22.3488 0.53066 22.1997 0.20959 21.963 -0.04135C21.7263 -0.29229 21.4148 -0.45993 21.0752 -0.51892C20.7355 -0.57791 20.3858 -0.52519 20.08 -0.37L12 3.07L3.92 -0.37C3.61418 -0.52519 3.26447 -0.57791 2.92484 -0.51892C2.58521 -0.45993 2.27367 -0.29229 2.03696 -0.04135C1.80026 0.20959 1.65124 0.53066 1.61207 0.87268C1.5729 1.2147 1.64584 1.5576 1.82 1.86L10.29 3.86Z"/></svg>
                </div>
                <div class="error-message">${message}</div>
                <button class="btn btn-primary" onclick="location.reload()">
                    重试
                </button>
            </div>
        `;

        this.currentPage = 'error';
        this.hidePagination();
    }

    /**
     * 渲染加载页面
     * @param {string} message - 加载信息
     */
    renderLoadingPage(message = '加载中...') {
        if (!this.pageContent) return;

        this.pageContent.innerHTML = `
            <div class="loading-page">
                <div class="loading-icon">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20Z"/></svg>
                </div>
                <div class="loading-message">${message}</div>
            </div>
        `;

        this.currentPage = 'loading';
        this.hidePagination();
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
     * 清空页面内容
     */
    clear() {
        if (this.pageContent) {
            this.pageContent.innerHTML = '';
        }
        this.currentPage = null;
        this.hidePagination();
    }

    /**
     * 获取当前页面类型
     * @returns {string|null} 当前页面类型
     */
    getCurrentPage() {
        return this.currentPage;
    }



    /**
     * 初始化分页组件
     */
    async initPagination() {
        // 确保Pagination组件已加载
        if (typeof Pagination === 'undefined') {
            console.error('Pagination组件未加载，请确保已引入Pagination.js');
            return;
        }

        // 创建分页组件实例
        this.pagination = new Pagination('pagination-container');
        
        // 异步初始化分页组件
        await this.pagination.init();
        
        // 设置页面变化回调
        this.pagination.setOnPageChange(async (page, paginationData) => {
            // 通知当前页面组件进行翻页
            if (this.currentPage === 'product-library' && typeof productLibraryComponentInstance !== 'undefined') {
                console.log(`📄 产品库翻页到第 ${page} 页，每页 ${paginationData.itemsPerPage} 条`);
                productLibraryComponentInstance.currentPage = page;
                
                // 重新加载数据
                try {
                    await productLibraryComponentInstance.loadProductLibrary(page);
                } catch (error) {
                    console.error('翻页加载数据失败:', error);
                    productLibraryComponentInstance.showError('翻页加载数据失败');
                }
            }
        });
    }

    /**
     * 更新翻页数据
     * @param {Object} data - 翻页数据
     */
    updatePagination(data) {
        if (this.pagination) {
            this.pagination.updatePagination(data);
        }
    }


    /**
     * 跳转到指定页面
     * @param {number} page - 页码
     */
    goToPage(page) {
        if (this.pagination) {
            this.pagination.goToPage(page);
        }
    }

    /**
     * 显示翻页组件
     */
    showPagination() {
        if (this.pagination) {
            this.pagination.show();
        }
    }

    /**
     * 隐藏翻页组件
     */
    hidePagination() {
        if (this.pagination) {
            this.pagination.hide();
        }
    }

    /**
     * 销毁组件
     */
    destroy() {
        this.clear();
        this.pageContent = null;
        if (this.pagination) {
            this.pagination.destroy();
            this.pagination = null;
        }
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PageContainer;
} else {
    window.PageContainer = PageContainer;
}
