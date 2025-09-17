/**
 * ProductDetail 组件
 * 负责产品详情页面的渲染和数据管理
 */
class ProductDetailComponent {
    constructor() {
        this.container = null;
        this.product = null;
        this.productCharts = null;
        this.attachmentCard = null;
    }

    /**
     * 初始化产品详情组件
     * @param {HTMLElement} container - 容器元素
     * @param {Object} product - 产品数据
     */
    async init(container, product) {
        this.container = container;
        this.product = product;
        this.render();
        await this.initComponents();
    }

    /**
     * 渲染产品详情页面
     */
    render() {
        if (!this.container || !this.product) return;

        this.container.innerHTML = `
            <div class="product-detail-page">
                <div class="page-header">
                    <h1 class="page-title">产品详情</h1>
                </div>
                
                <div class="product-detail-content">
                    <!-- 第一个卡片：图表 -->
                    <div class="detail-section">
                        <h3 class="section-title">数据趋势</h3>
                        
                        <!-- 合并的趋势图表卡片 -->
                        <div class="detail-card chart-card">
                            <div class="card-content">
                                <div class="charts-container">
                                    <!-- 销量图表 -->
                                    <div class="chart-item">
                                        <h5 class="chart-item-title">销量趋势</h5>
                                        <div class="chart-container">
                                            <canvas id="sales-chart" width="800" height="150"></canvas>
                                        </div>
                                    </div>
                                    
                                    <!-- 价格图表 -->
                                    <div class="chart-item">
                                        <h5 class="chart-item-title">价格趋势</h5>
                                        <div class="chart-container">
                                            <canvas id="price-chart" width="800" height="150"></canvas>
                                        </div>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 第二个卡片：媒体 -->
                    <div class="detail-section">
                        <h3 class="section-title">媒体资源</h3>
                        <div class="detail-card media-card">
                            <div class="card-content">
                                ${this.renderMediaContent(this.product)}
                            </div>
                        </div>
                    </div>
                    
                    <!-- 第三个卡片：产品信息 -->
                    <div class="detail-section">
                        <h3 class="section-title">产品信息</h3>
                        <div class="detail-card info-card">
                            <div class="card-content">
                                ${this.renderProductInfo(this.product)}
                            </div>
                        </div>
                    </div>
                    
                    <!-- 第四个卡片：附件 -->
                    <div class="detail-section">
                        <h3 class="section-title">附件</h3>
                        <div class="detail-card attachments-card">
                            <div class="card-content">
                                <div id="attachments-list">
                                    <div class="loading-attachments">正在加载附件...</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 最后一个卡片：采集信息（简化版） -->
                    <div class="detail-section">
                        <div class="collect-info-simple">
                            <span class="collect-person">采集人：系统</span>
                            <span class="collect-separator">•</span>
                            <span class="collect-time">采集时间：${this.formatCollectTime(this.product.collectTime)}</span>
                            <span class="collect-separator">•</span>
                            <span class="collect-link">采集链接：</span>
                            <a href="${this.product.collectUrl || '#'}" 
                               class="collect-url-link" 
                               target="_blank" 
                               rel="noopener noreferrer"
                               id="collect-url-link">
                                ${this.product.collectUrl ? '查看原链接' : '暂无链接'}
                            </a>
                            ${this.product.collectUrl ? `
                            <button class="copy-btn-small" id="copy-url-btn" title="复制链接">
                                <i class="ph ph-copy"></i>
                            </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 初始化组件
     */
    async initComponents() {
        // 初始化图表组件
        await this.initProductCharts();
        
        // 初始化附件卡片组件
        await this.initAttachmentCard();
        
        // 绑定事件
        this.bindEvents();
    }

    /**
     * 初始化产品图表组件
     */
    async initProductCharts() {
        try {
            // 创建图表组件实例
            this.productCharts = new ProductCharts();
            
            // 获取监控数据
            await this.loadMonitoringData();
        } catch (error) {
            console.error('初始化图表组件失败:', error);
        }
    }

    /**
     * 加载监控数据
     */
    async loadMonitoringData() {
        try {
            // 尝试从API获取监控数据
            const response = await fetch(`http://localhost:3001/api/products/${this.product.goodsId}/monitoring`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.monitoring) {
                    console.log('获取到监控数据:', data.monitoring);
                    this.productCharts.renderCharts(this.product, data.monitoring);
                    return;
                }
            }
        } catch (error) {
            console.warn('获取监控数据失败，使用产品基本信息:', error);
        }
        
        // 如果API失败，使用产品基本信息
        this.productCharts.renderCharts(this.product, null);
    }

    /**
     * 初始化附件卡片组件
     */
    async initAttachmentCard() {
        try {
            const attachmentsList = document.getElementById('attachments-list');
            if (attachmentsList && typeof AttachmentCard !== 'undefined') {
                this.attachmentCard = new AttachmentCard();
                await this.attachmentCard.init(this.product.goodsInfo.goodsId, attachmentsList);
            }
        } catch (error) {
            console.error('初始化附件卡片失败:', error);
            const attachmentsList = document.getElementById('attachments-list');
            if (attachmentsList) {
                attachmentsList.innerHTML = '<div class="no-attachments">暂无附件</div>';
            }
        }
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 复制链接按钮
        const copyBtn = document.getElementById('copy-url-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                this.copyCollectUrl();
            });
        }
    }

    /**
     * 复制采集链接
     */
    async copyCollectUrl() {
        try {
            if (this.product.collectUrl) {
                await navigator.clipboard.writeText(this.product.collectUrl);
                this.showToast('链接已复制到剪贴板', 'success');
            }
        } catch (error) {
            console.error('复制链接失败:', error);
            this.showToast('复制失败', 'error');
        }
    }

    /**
     * 渲染媒体内容
     * @param {Object} product - 产品数据
     * @returns {string} HTML字符串
     */
    renderMediaContent(product) {
        let mediaHTML = '<div class="media-grid">';
        
        // 视频
        if (product.videos && product.videos.length > 0) {
            mediaHTML += '<div class="media-section">';
            mediaHTML += '<h4>视频</h4>';
            mediaHTML += '<div class="video-list">';
            product.videos.forEach((video, index) => {
                mediaHTML += `
                    <div class="video-item">
                        <video controls>
                            <source src="${video.url}" type="video/mp4">
                            您的浏览器不支持视频播放
                        </video>
                        <p class="video-title">视频 ${index + 1}</p>
                    </div>
                `;
            });
            mediaHTML += '</div></div>';
        }
        
        // 图片
        if (product.images && product.images.length > 0) {
            mediaHTML += '<div class="media-section">';
            mediaHTML += '<h4>图片</h4>';
            mediaHTML += '<div class="image-grid">';
            product.images.forEach((image, index) => {
                mediaHTML += `
                    <div class="image-item">
                        <img src="${image.url}" alt="产品图片 ${index + 1}" onclick="window.openImageModal('${image.url}')">
                    </div>
                `;
            });
            mediaHTML += '</div></div>';
        }
        
        // 如果没有媒体文件
        if ((!product.videos || product.videos.length === 0) && (!product.images || product.images.length === 0)) {
            mediaHTML += '<div class="no-media">暂无媒体资源</div>';
        }
        
        mediaHTML += '</div>';
        return mediaHTML;
    }

    /**
     * 渲染产品信息
     * @param {Object} product - 产品数据
     * @returns {string} HTML字符串
     */
    renderProductInfo(product) {
        let infoHTML = '<div class="product-info-grid">';
        
        // 基本信息
        infoHTML += '<div class="info-section">';
        infoHTML += '<h4>基本信息</h4>';
        infoHTML += '<div class="info-list">';
        infoHTML += `<div class="info-item"><span class="label">商品ID:</span><span class="value">${product.goodsId}</span></div>`;
        if (product.itemId) {
            infoHTML += `<div class="info-item"><span class="label">商品编号:</span><span class="value">${product.itemId}</span></div>`;
        }
        if (product.goodsCat1) {
            infoHTML += `<div class="info-item"><span class="label">分类1:</span><span class="value">${product.goodsCat1}</span></div>`;
        }
        if (product.goodsCat2) {
            infoHTML += `<div class="info-item"><span class="label">分类2:</span><span class="value">${product.goodsCat2}</span></div>`;
        }
        if (product.goodsCat3) {
            infoHTML += `<div class="info-item"><span class="label">商品名称:</span><span class="value">${product.goodsCat3}</span></div>`;
        }
        infoHTML += '</div></div>';
        
        // 价格信息
        if (product.skuList && product.skuList.length > 0) {
            infoHTML += '<div class="info-section">';
            infoHTML += '<h4>价格信息</h4>';
            infoHTML += '<div class="info-list">';
            product.skuList.forEach((sku, index) => {
                infoHTML += `<div class="info-item"><span class="label">SKU ${index + 1}:</span><span class="value">${sku.skuName || '未知'}</span></div>`;
                if (sku.goodsPromoPrice) {
                    infoHTML += `<div class="info-item"><span class="label">促销价:</span><span class="value price">${sku.goodsPromoPrice}</span></div>`;
                }
                if (sku.goodsNormalPrice) {
                    infoHTML += `<div class="info-item"><span class="label">原价:</span><span class="value price">${sku.goodsNormalPrice}</span></div>`;
                }
            });
            infoHTML += '</div></div>';
        }
        
        // 销量信息
        infoHTML += '<div class="info-section">';
        infoHTML += '<h4>销量信息</h4>';
        infoHTML += '<div class="info-list">';
        infoHTML += `<div class="info-item"><span class="label">销量:</span><span class="value">${(product.goodsSold || 0).toLocaleString()}</span></div>`;
        if (product.collectTime) {
            infoHTML += `<div class="info-item"><span class="label">采集时间:</span><span class="value">${this.formatCollectTime(product.collectTime)}</span></div>`;
        }
        infoHTML += '</div></div>';
        
        infoHTML += '</div>';
        return infoHTML;
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
     * 显示Toast通知
     * @param {string} message - 消息
     * @param {string} type - 类型 (success, error, info, warning)
     */
    showToast(message, type = 'info') {
        // 这里可以集成toast通知系统
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    /**
     * 销毁组件
     */
    destroy() {
        // 销毁图表组件
        if (this.productCharts) {
            this.productCharts.destroy();
            this.productCharts = null;
        }

        // 销毁附件卡片组件
        if (this.attachmentCard) {
            this.attachmentCard.destroy();
            this.attachmentCard = null;
        }

        if (this.container) {
            this.container.innerHTML = '';
        }
        
        this.product = null;
        this.container = null;
    }

    /**
     * 刷新组件
     */
    async refresh() {
        if (this.product && this.container) {
            await this.loadMonitoringData();
            if (this.attachmentCard) {
                await this.attachmentCard.refresh();
            }
        }
    }
}

// 创建全局实例
const productDetailComponentInstance = new ProductDetailComponent();
