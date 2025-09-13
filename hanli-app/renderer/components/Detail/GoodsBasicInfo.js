// 商品基本信息组件
class GoodsBasicInfo {
    constructor(app) {
        this.app = app;
        this.container = null;
        this.basicData = null;
        this.onDataChange = null;
    }

    // 渲染商品基本信息
    render(basicData, onDataChange = null) {
        console.log('GoodsBasicInfo render 接收到的数据:', basicData);
        
        this.basicData = basicData;
        this.onDataChange = onDataChange;
        
        if (!basicData) {
            console.log('商品基本信息数据无效');
            return this.renderEmpty();
        }

        // 兼容两种数据结构：
        // 1. 嵌套结构：{ goodsBasic: { ... } }
        // 2. 平铺结构：{ goodsId: "...", goodsTitleEn: "...", ... }
        let goodsBasic;
        if (basicData.goodsBasic) {
            // 嵌套结构
            goodsBasic = basicData.goodsBasic;
        } else if (basicData.goodsId || basicData.goodsTitleEn || basicData.goodsTitleCn) {
            // 平铺结构，直接使用整个对象
            goodsBasic = basicData;
        } else {
            console.log('商品基本信息数据结构不匹配');
            return this.renderEmpty();
        }

        console.log('商品基本信息解析后:', goodsBasic);
        
        // 格式化采集时间
        const formatCollectTime = (collectTime) => {
            if (!collectTime) return '';
            // 如果是时间戳格式，转换为东八区时间
            if (typeof collectTime === 'number' || /^\d{10,13}$/.test(collectTime.toString())) {
                const timestamp = parseInt(collectTime);
                const date = new Date(timestamp);
                return date.toLocaleString('zh-CN', { 
                    timeZone: 'Asia/Shanghai',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            }
            // 如果是字符串格式，尝试解析
            if (typeof collectTime === 'string') {
                // 如果是YYYYMMDDHHMM格式
                if (/^\d{12}$/.test(collectTime)) {
                    const year = collectTime.substring(0, 4);
                    const month = collectTime.substring(4, 6);
                    const day = collectTime.substring(6, 8);
                    const hour = collectTime.substring(8, 10);
                    const minute = collectTime.substring(10, 12);
                    return `${year}-${month}-${day} ${hour}:${minute}`;
                }
            }
            return collectTime;
        };

        // 渲染SKU列表
        const renderSkuList = (skuList) => {
            if (!skuList || !Array.isArray(skuList) || skuList.length === 0) {
                return '<div class="info-item"><span class="info-label">SKU信息:</span><span class="info-value">暂无SKU信息</span></div>';
            }
            
            let skuHtml = '<div class="info-item sku-list-item"><span class="info-label">SKU信息:</span><div class="sku-list">';
            skuList.forEach((sku, index) => {
                skuHtml += `
                    <div class="sku-item">
                        <div class="sku-details">
                            <span class="sku-name">${sku.skuName || '未命名'}</span>
                            <span class="sku-price">${sku.goodsPromoPrice || '价格未设置'}</span>
                        </div>
                        ${sku.skuPic ? `<img src="${sku.skuPic}" alt="${sku.skuName}" class="sku-image">` : ''}
                    </div>
                `;
            });
            skuHtml += '</div></div>';
            return skuHtml;
        };

        // 渲染商品属性
        const renderGoodsPropertyInfo = (propertyInfo) => {
            if (!propertyInfo || typeof propertyInfo !== 'object' || Object.keys(propertyInfo).length === 0) {
                return '<div class="info-item"><span class="info-label">商品属性:</span><span class="info-value">暂无属性信息</span></div>';
            }
            
            let propertyHtml = '<div class="info-item property-list-item"><span class="info-label">商品属性:</span><div class="property-list">';
            Object.entries(propertyInfo).forEach(([key, value]) => {
                propertyHtml += `
                    <div class="property-item">
                        <span class="property-key">${key}:</span>
                        <span class="property-value">${value || '未设置'}</span>
                    </div>
                `;
            });
            propertyHtml += '</div></div>';
            return propertyHtml;
        };

        // 生成产品来源信息
        const generateProductSource = (goodsBasic) => {
            const collectTime = formatCollectTime(goodsBasic.collectTime);
            const collectUrl = goodsBasic.collectUrl;
            
            if (collectTime && collectUrl) {
                return `由 系统 于 ${collectTime} 从 <a href="${collectUrl}" target="_blank" class="collect-link">采集链接</a> 采集`;
            } else if (collectTime) {
                return `由 系统 于 ${collectTime} 从 采集链接 采集`;
            } else {
                return '由 系统 新建';
            }
        };

        return `
            <div class="detail-section">
                <h3 class="detail-section-title">基本信息</h3>
                <div class="detail-section-card" id="goodsBasicInfoContainer">
                    <div class="goods-basic-info">
                        <div class="basic-info-grid">
                            <!-- 基本信息 -->
                            <div class="info-item readonly">
                                <span class="info-label">商品ID:</span>
                                <span class="info-value">${goodsBasic.goodsId || '未设置'}</span>
                            </div>
                            <div class="info-item readonly">
                                <span class="info-label">商品编号:</span>
                                <span class="info-value">${goodsBasic.itemId || '未设置'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">商品名称(中文):</span>
                                <input type="text" class="info-input" data-field="goodsTitleCn" value="${goodsBasic.goodsTitleCn || ''}" placeholder="请输入商品中文名称">
                            </div>
                            <div class="info-item">
                                <span class="info-label">商品名称(英文):</span>
                                <input type="text" class="info-input" data-field="goodsTitleEn" value="${goodsBasic.goodsTitleEn || ''}" placeholder="请输入商品英文名称">
                            </div>
                            <div class="info-item">
                                <span class="info-label">一级分类:</span>
                                <input type="text" class="info-input" data-field="goodsCat1" value="${goodsBasic.goodsCat1 || ''}" placeholder="请输入一级分类">
                            </div>
                            <div class="info-item">
                                <span class="info-label">二级分类:</span>
                                <input type="text" class="info-input" data-field="goodsCat2" value="${goodsBasic.goodsCat2 || ''}" placeholder="请输入二级分类">
                            </div>
                            <div class="info-item">
                                <span class="info-label">三级分类:</span>
                                <input type="text" class="info-input" data-field="goodsCat3" value="${goodsBasic.goodsCat3 || ''}" placeholder="请输入三级分类">
                            </div>
                            
                            <!-- SKU信息 -->
                            ${renderSkuList(goodsBasic.skuList)}
                            
                            <!-- 商品属性 -->
                            ${renderGoodsPropertyInfo(goodsBasic.goodsPropertyInfo)}
                            
                            <!-- 产品来源 -->
                            <div class="info-item product-source">
                                <span class="info-label">产品来源:</span>
                                <span class="info-value source-info">${generateProductSource(goodsBasic)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 渲染空状态
    renderEmpty() {
        return `
            <div class="detail-section">
                <h3 class="detail-section-title">基本信息</h3>
                <div class="detail-section-card">
                    <div class="empty-state">
                        <p>暂无商品基本信息</p>
                    </div>
                </div>
            </div>
        `;
    }

    // 绑定编辑事件
    bindEditEvents(container) {
        if (!container) return;
        
        const inputs = container.querySelectorAll('.info-input');
        inputs.forEach(input => {
            // 失焦时保存
            input.addEventListener('blur', (e) => {
                this.saveField(e.target);
            });
            
            // 回车键保存
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.target.blur();
                }
            });
        });
    }

    // 保存单个字段
    saveField(input) {
        const field = input.dataset.field;
        const value = input.value.trim();
        
        if (!this.basicData || !this.basicData.goodsBasic) {
            console.error('数据无效，无法保存');
            return;
        }

        // 特殊处理标签字段
        if (field === 'goodsTags') {
            const tags = value ? value.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
            this.basicData.goodsBasic[field] = tags;
        } else {
            this.basicData.goodsBasic[field] = value;
        }

        // 调用回调函数保存数据
        if (this.onDataChange) {
            this.onDataChange(this.basicData);
        }

        console.log(`字段 ${field} 已保存:`, value);
    }

    // 清空组件
    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}
