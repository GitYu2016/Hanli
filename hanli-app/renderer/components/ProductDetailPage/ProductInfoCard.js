/**
 * ProductInfoCard 组件
 * 负责产品信息卡片的渲染和样式管理
 */
class ProductInfoCard {
    constructor() {
        this.stylesInjected = false;
    }

    /**
     * 注入组件样式
     */
    injectStyles() {
        if (this.stylesInjected) return;

        const styleId = 'product-info-card-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* 产品信息卡片样式 */
            .product-info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 16px;
            }

            .info-section {
                background: var(--color-surface-secondary);
                border-radius: var(--radius-card);
                padding: 16px;
            }

            .info-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .info-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                font-size: 13px;
            }

            .info-item .label {
                font-weight: 500;
                color: var(--color-text-secondary);
                min-width: 70px;
                font-size: 12px;
            }

            .info-item .value {
                color: var(--color-text-primary);
                text-align: right;
                word-break: break-word;
                font-size: 13px;
            }

            .info-item .value.price {
                font-weight: 600;
                color: var(--color-info);
            }

            /* 响应式设计 */
            @media (max-width: 768px) {
                .product-info-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;

        document.head.appendChild(style);
        this.stylesInjected = true;
    }

    /**
     * 渲染产品信息卡片
     * @param {Object} product - 产品数据
     * @param {Object} options - 渲染选项
     * @returns {string} HTML字符串
     */
    render(product, options = {}) {
        this.injectStyles();

        const {
            showBasicInfo = true,
            showPriceInfo = true,
            showSalesInfo = true,
            showPropertyInfo = true,
            showStoreInfo = true
        } = options;

        let infoHTML = '<div class="product-info-grid">';
        
        // 基本信息
        if (showBasicInfo) {
            infoHTML += this.renderBasicInfo(product);
        }
        
        // 价格信息
        if (showPriceInfo && product.skuList && product.skuList.length > 0) {
            infoHTML += this.renderPriceInfo(product);
        }
        
        // 销量信息
        if (showSalesInfo) {
            infoHTML += this.renderSalesInfo(product);
        }
        
        // 商品属性
        if (showPropertyInfo && product.goodsPropertyInfo) {
            infoHTML += this.renderPropertyInfo(product);
        }
        
        // 店铺信息
        if (showStoreInfo && product.storeData) {
            infoHTML += this.renderStoreInfo(product);
        }
        
        infoHTML += '</div>';
        return infoHTML;
    }

    /**
     * 渲染基本信息
     * @param {Object} product - 产品数据
     * @returns {string} HTML字符串
     */
    renderBasicInfo(product) {
        let html = '<div class="info-section">';
        html += '<h4 class="section-subtitle">基本信息</h4>';
        html += '<div class="info-list">';
        html += `<div class="info-item"><span class="label">商品ID:</span><span class="value">${product.goodsId}</span></div>`;
        
        if (product.itemId) {
            html += `<div class="info-item"><span class="label">商品编号:</span><span class="value">${product.itemId}</span></div>`;
        }
        if (product.goodsCat1) {
            html += `<div class="info-item"><span class="label">分类1:</span><span class="value">${product.goodsCat1}</span></div>`;
        }
        if (product.goodsCat2) {
            html += `<div class="info-item"><span class="label">分类2:</span><span class="value">${product.goodsCat2}</span></div>`;
        }
        if (product.goodsCat3) {
            html += `<div class="info-item"><span class="label">商品名称:</span><span class="value">${product.goodsCat3}</span></div>`;
        }
        
        html += '</div></div>';
        return html;
    }

    /**
     * 渲染价格信息
     * @param {Object} product - 产品数据
     * @returns {string} HTML字符串
     */
    renderPriceInfo(product) {
        let html = '<div class="info-section">';
        html += '<h4 class="section-subtitle">价格信息</h4>';
        html += '<div class="info-list">';
        
        product.skuList.forEach((sku, index) => {
            html += `<div class="info-item"><span class="label">SKU ${index + 1}:</span><span class="value">${sku.skuName || '未知'}</span></div>`;
            if (sku.goodsPromoPrice) {
                html += `<div class="info-item"><span class="label">促销价:</span><span class="value price">${sku.goodsPromoPrice}</span></div>`;
            }
            if (sku.goodsNormalPrice) {
                html += `<div class="info-item"><span class="label">原价:</span><span class="value price">${sku.goodsNormalPrice}</span></div>`;
            }
        });
        
        html += '</div></div>';
        return html;
    }

    /**
     * 渲染销量信息
     * @param {Object} product - 产品数据
     * @returns {string} HTML字符串
     */
    renderSalesInfo(product) {
        let html = '<div class="info-section">';
        html += '<h4 class="section-subtitle">销量信息</h4>';
        html += '<div class="info-list">';
        html += `<div class="info-item"><span class="label">销量:</span><span class="value">${Math.round(product.goodsSold || 0).toLocaleString()}</span></div>`;
        
        if (product.collectTime) {
            html += `<div class="info-item"><span class="label">采集时间:</span><span class="value">${this.formatCollectTime(product.collectTime)}</span></div>`;
        }
        
        html += '</div></div>';
        return html;
    }

    /**
     * 渲染商品属性信息
     * @param {Object} product - 产品数据
     * @returns {string} HTML字符串
     */
    renderPropertyInfo(product) {
        let html = '<div class="info-section">';
        html += '<h4 class="section-subtitle">商品属性</h4>';
        html += '<div class="info-list">';
        
        Object.entries(product.goodsPropertyInfo).forEach(([key, value]) => {
            html += `<div class="info-item"><span class="label">${key}:</span><span class="value">${value}</span></div>`;
        });
        
        html += '</div></div>';
        return html;
    }

    /**
     * 渲染店铺信息
     * @param {Object} product - 产品数据
     * @returns {string} HTML字符串
     */
    renderStoreInfo(product) {
        let html = '<div class="info-section">';
        html += '<h4 class="section-subtitle">店铺信息</h4>';
        html += '<div class="info-list">';
        
        if (product.storeName) {
            html += `<div class="info-item"><span class="label">店铺名称:</span><span class="value">${product.storeName}</span></div>`;
        }
        if (product.storeData.storeRating) {
            html += `<div class="info-item"><span class="label">店铺评分:</span><span class="value">${product.storeData.storeRating}</span></div>`;
        }
        if (product.storeData.storeSold) {
            html += `<div class="info-item"><span class="label">店铺销量:</span><span class="value">${Math.round(product.storeData.storeSold).toLocaleString()}</span></div>`;
        }
        
        html += '</div></div>';
        return html;
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
     * 渲染到指定容器
     * @param {HTMLElement} container - 目标容器
     * @param {Object} product - 产品数据
     * @param {Object} options - 渲染选项
     */
    renderToContainer(container, product, options = {}) {
        if (!container) {
            console.error('ProductInfoCard: 容器元素不存在');
            return;
        }

        container.innerHTML = this.render(product, options);
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductInfoCard;
} else if (typeof window !== 'undefined') {
    window.ProductInfoCard = ProductInfoCard;
}
