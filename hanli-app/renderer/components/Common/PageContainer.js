/**
 * PageContainer 组件
 * 负责页面容器的渲染和内容管理
 */
class PageContainer {
    constructor() {
        this.currentPage = null;
        this.pageContent = null;
        this.productCharts = null;
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
        } else {
            console.error('ProductLibraryComponent组件未加载');
            this.pageContent.innerHTML = '<div class="error-page">组件加载失败</div>';
        }

        this.currentPage = 'product-library';
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
    }

    /**
     * 获取当前页面类型
     * @returns {string|null} 当前页面类型
     */
    getCurrentPage() {
        return this.currentPage;
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
