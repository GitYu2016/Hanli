/**
 * PageContainer 组件
 * 负责页面容器的渲染和内容管理
 */
class PageContainer {
    constructor() {
        this.currentPage = null;
        this.pageContent = null;
        this.productCharts = null;
        this.paginationData = {
            totalItems: 0,
            currentPage: 1,
            itemsPerPage: 100,
            totalPages: 1
        };
        this.init();
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
                <div id="pagination-container" class="pagination-container" style="display: none;">
                    <div class="pagination-content">
                        <span class="pagination-total">共 <strong id="pagination-total">0</strong> 条</span>
                        <div class="pagination-controls" id="pagination-controls" style="display: none;">
                            <button id="pagination-prev" class="pagination-btn" disabled>
                                <i class="ph ph-caret-left"></i> 上一页
                            </button>
                            <div class="pagination-jump">
                                跳转到 <input type="number" id="pagination-input" min="1" max="1" value="1"> 页
                            </div>
                            <button id="pagination-next" class="pagination-btn" disabled>
                                下一页 <i class="ph ph-caret-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
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
        this.bindPaginationEvents();
    }

    /**
     * 渲染首页内容
     */
    async renderHomePage() {
        if (!this.pageContent) return;

        // 清空内容
        this.pageContent.innerHTML = '';

        // 使用HomePage组件
        if (typeof homePageComponentInstance !== 'undefined') {
            await homePageComponentInstance.init(this.pageContent);
        } else {
            console.error('HomePageComponent组件未加载');
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
                productLibraryComponentInstance.setProducts(products, totalCount);
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
                    <i class="ph ph-warning"></i>
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
                    <i class="ph ph-spinner"></i>
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
     * 绑定翻页事件
     */
    bindPaginationEvents() {
        // 上一页按钮
        const prevBtn = document.getElementById('pagination-prev');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.goToPage(this.paginationData.currentPage - 1);
            });
        }

        // 下一页按钮
        const nextBtn = document.getElementById('pagination-next');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.goToPage(this.paginationData.currentPage + 1);
            });
        }

        // 跳转输入框
        const jumpInput = document.getElementById('pagination-input');
        if (jumpInput) {
            jumpInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= this.paginationData.totalPages) {
                        this.goToPage(page);
                    }
                }
            });
        }
    }

    /**
     * 更新翻页数据
     * @param {Object} data - 翻页数据
     */
    updatePagination(data) {
        this.paginationData = {
            totalItems: data.totalItems || 0,
            currentPage: data.currentPage || 1,
            itemsPerPage: data.itemsPerPage || 100,
            totalPages: Math.ceil((data.totalItems || 0) / (data.itemsPerPage || 100))
        };

        this.renderPagination();
    }

    /**
     * 渲染翻页组件
     */
    renderPagination() {
        const container = document.getElementById('pagination-container');
        const totalEl = document.getElementById('pagination-total');
        const controlsEl = document.getElementById('pagination-controls');
        const prevBtn = document.getElementById('pagination-prev');
        const nextBtn = document.getElementById('pagination-next');
        const inputEl = document.getElementById('pagination-input');

        if (!container) return;

        // 更新总数
        if (totalEl) {
            totalEl.textContent = this.paginationData.totalItems.toLocaleString();
        }

        // 如果只有一页，隐藏翻页控件
        if (this.paginationData.totalPages <= 1) {
            container.style.display = 'none';
            return;
        }

        // 显示翻页控件
        container.style.display = 'block';
        if (controlsEl) {
            controlsEl.style.display = 'flex';
        }

        // 更新按钮状态
        if (prevBtn) {
            prevBtn.disabled = this.paginationData.currentPage <= 1;
        }
        if (nextBtn) {
            nextBtn.disabled = this.paginationData.currentPage >= this.paginationData.totalPages;
        }

        // 更新输入框
        if (inputEl) {
            inputEl.value = this.paginationData.currentPage;
            inputEl.max = this.paginationData.totalPages;
        }
    }

    /**
     * 跳转到指定页面
     * @param {number} page - 页码
     */
    goToPage(page) {
        if (page < 1 || page > this.paginationData.totalPages) return;

        this.paginationData.currentPage = page;
        this.renderPagination();

        // 通知当前页面组件进行翻页
        if (this.currentPage === 'product-library' && typeof productLibraryComponentInstance !== 'undefined') {
            productLibraryComponentInstance.currentPage = page;
            productLibraryComponentInstance.updateProductTable();
            productLibraryComponentInstance.updateSummary();
        }
    }

    /**
     * 显示翻页组件
     */
    showPagination() {
        const container = document.getElementById('pagination-container');
        if (container) {
            container.style.display = 'block';
        }
    }

    /**
     * 隐藏翻页组件
     */
    hidePagination() {
        const container = document.getElementById('pagination-container');
        if (container) {
            container.style.display = 'none';
        }
    }

    /**
     * 销毁组件
     */
    destroy() {
        this.clear();
        this.pageContent = null;
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PageContainer;
} else {
    window.PageContainer = PageContainer;
}
