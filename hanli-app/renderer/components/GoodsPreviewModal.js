/**
 * 商品数据预览弹窗组件
 * 提供商品数据预览功能的弹窗界面
 */
class GoodsPreviewModal {
    constructor(app) {
        this.app = app;
        this.isVisible = false;
        this.element = null;
        this.currentTab = 'images';
        this.previewData = null;
        
        this.init();
    }

    /**
     * 初始化组件
     */
    init() {
        this.createElement();
        this.bindEvents();
    }

    /**
     * 创建DOM元素
     */
    createElement() {
        this.element = document.createElement('div');
        this.element.className = 'goods-preview-modal';
        this.element.id = 'goodsPreviewModal';
        this.element.style.display = 'none';
        
        this.element.innerHTML = `
            <div class="goods-preview-modal-content">
                <div class="goods-preview-header">
                    <h3>商品数据预览</h3>
                    <button class="goods-preview-close-btn" id="goodsPreviewCloseBtn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
                <div class="goods-preview-body">
                    <div class="preview-tabs">
                        <button class="preview-tab active" data-tab="images">采集图片</button>
                        <button class="preview-tab" data-tab="goodsInfo">商品信息</button>
                        <button class="preview-tab" data-tab="monitoring">监控数据</button>
                    </div>
                    <div class="preview-content">
                        <!-- 图片预览区域 -->
                        <div id="previewImages" class="preview-section active">
                            <div class="images-grid" id="imagesGrid">
                                <div class="empty-state">
                                    <div class="empty-icon">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                                            <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="2"/>
                                            <polyline points="21,15 16,10 5,21" stroke="currentColor" stroke-width="2"/>
                                        </svg>
                                    </div>
                                    <p>暂无采集图片</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 商品信息列表区域 -->
                        <div id="previewGoodsInfo" class="preview-section">
                            <div class="data-list" id="goodsInfoList">
                                <div class="empty-state">
                                    <p>暂无商品信息</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 监控数据列表区域 -->
                        <div id="previewMonitoring" class="preview-section">
                            <div class="data-list" id="monitoringDataList">
                                <div class="empty-state">
                                    <p>暂无监控数据</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="goods-preview-footer">
                    <button class="btn-secondary" id="previewCancelBtn">取消</button>
                    <button class="btn-primary" id="previewConfirmBtn">确认保存</button>
                </div>
            </div>
        `;
        
        // 添加到body
        document.body.appendChild(this.element);
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 关闭按钮
        const closeBtn = this.element.querySelector('#goodsPreviewCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide();
            });
        }

        // 取消按钮
        const cancelBtn = this.element.querySelector('#previewCancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hide();
            });
        }

        // 确认按钮
        const confirmBtn = this.element.querySelector('#previewConfirmBtn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.handleConfirm();
            });
        }

        // 点击背景关闭
        this.element.addEventListener('click', (e) => {
            if (e.target === this.element) {
                this.hide();
            }
        });

        // 标签页切换
        const tabs = this.element.querySelectorAll('.preview-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    /**
     * 显示弹窗
     */
    show(data = null) {
        this.element.style.display = 'flex';
        this.isVisible = true;
        
        if (data) {
            this.previewData = data;
            this.loadPreviewData(data);
        }
    }

    /**
     * 隐藏弹窗
     */
    hide() {
        this.element.style.display = 'none';
        this.isVisible = false;
        this.previewData = null;
    }

    /**
     * 切换弹窗显示状态
     */
    toggle(data = null) {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show(data);
        }
    }

    /**
     * 切换标签页
     */
    switchTab(tabName) {
        // 更新标签状态
        const tabs = this.element.querySelectorAll('.preview-tab');
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // 更新内容显示
        const sections = this.element.querySelectorAll('.preview-section');
        sections.forEach(section => {
            section.classList.toggle('active', section.id === `preview${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
        });

        this.currentTab = tabName;
    }

    /**
     * 加载预览数据
     */
    loadPreviewData(data) {
        this.loadImages(data.images || []);
        this.loadGoodsInfo(data.goodsInfo || {});
        this.loadMonitoringData(data.monitoringData || []);
    }

    /**
     * 加载图片数据
     */
    loadImages(images) {
        const imagesGrid = this.element.querySelector('#imagesGrid');
        if (!imagesGrid) return;

        if (images.length === 0) {
            imagesGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="2"/>
                            <polyline points="21,15 16,10 5,21" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </div>
                    <p>暂无采集图片</p>
                </div>
            `;
            return;
        }

        const imagesHtml = images.map((image, index) => `
            <div class="image-item" data-index="${index}">
                <img src="${image.url || image.src}" alt="图片 ${index + 1}" loading="lazy">
                <div class="image-overlay">
                    <div class="image-info">
                        <span class="image-name">${image.name || `图片 ${index + 1}`}</span>
                        <span class="image-size">${this.formatFileSize(image.size)}</span>
                    </div>
                </div>
            </div>
        `).join('');

        imagesGrid.innerHTML = imagesHtml;

        // 绑定图片点击事件
        this.bindImageEvents(imagesGrid);
    }

    /**
     * 加载商品信息
     */
    loadGoodsInfo(goodsInfo) {
        const goodsInfoList = this.element.querySelector('#goodsInfoList');
        if (!goodsInfoList) return;

        if (Object.keys(goodsInfo).length === 0) {
            goodsInfoList.innerHTML = `
                <div class="empty-state">
                    <p>暂无商品信息</p>
                </div>
            `;
            return;
        }

        const infoItems = Object.entries(goodsInfo).map(([key, value]) => `
            <div class="data-item">
                <div class="data-item-label">${this.formatFieldName(key)}</div>
                <div class="data-item-value">${this.formatFieldValue(value)}</div>
            </div>
        `).join('');

        goodsInfoList.innerHTML = infoItems;
    }

    /**
     * 加载监控数据
     */
    loadMonitoringData(monitoringData) {
        const monitoringDataList = this.element.querySelector('#monitoringDataList');
        if (!monitoringDataList) return;

        if (monitoringData.length === 0) {
            monitoringDataList.innerHTML = `
                <div class="empty-state">
                    <p>暂无监控数据</p>
                </div>
            `;
            return;
        }

        const dataItems = monitoringData.map((item, index) => `
            <div class="data-item">
                <div class="data-item-header">
                    <span class="data-item-title">数据记录 ${index + 1}</span>
                    <span class="data-item-time">${this.formatTime(item.timestamp)}</span>
                </div>
                <div class="data-item-content">
                    ${Object.entries(item.data || {}).map(([key, value]) => `
                        <div class="data-field">
                            <span class="data-field-label">${this.formatFieldName(key)}:</span>
                            <span class="data-field-value">${this.formatFieldValue(value)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        monitoringDataList.innerHTML = dataItems;
    }

    /**
     * 绑定图片事件
     */
    bindImageEvents(imagesGrid) {
        const imageItems = imagesGrid.querySelectorAll('.image-item');
        imageItems.forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                this.previewImage(index);
            });
        });
    }

    /**
     * 预览图片
     */
    previewImage(index) {
        if (this.previewData && this.previewData.images) {
            const image = this.previewData.images[index];
            if (image) {
                // 这里可以打开图片预览器或放大查看
                console.log('预览图片:', image);
                // 可以调用主应用的图片预览功能
                if (this.app && typeof this.app.previewImage === 'function') {
                    this.app.previewImage(image.url || image.src);
                }
            }
        }
    }

    /**
     * 处理确认操作
     */
    handleConfirm() {
        if (this.app && typeof this.app.handlePreviewConfirm === 'function') {
            this.app.handlePreviewConfirm(this.previewData);
        }
        this.hide();
    }

    /**
     * 格式化字段名称
     */
    formatFieldName(key) {
        const fieldNames = {
            'name': '商品名称',
            'price': '价格',
            'weight': '重量',
            'dimensions': '尺寸',
            'category': '分类',
            'description': '描述',
            'tags': '标签',
            'id': '商品ID',
            'createdAt': '创建时间',
            'updatedAt': '更新时间'
        };
        return fieldNames[key] || key;
    }

    /**
     * 格式化字段值
     */
    formatFieldValue(value) {
        if (value === null || value === undefined) {
            return '未设置';
        }
        if (typeof value === 'object') {
            return JSON.stringify(value, null, 2);
        }
        if (typeof value === 'boolean') {
            return value ? '是' : '否';
        }
        return String(value);
    }

    /**
     * 格式化文件大小
     */
    formatFileSize(bytes) {
        if (!bytes) return '未知';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * 格式化时间
     */
    formatTime(timestamp) {
        if (!timestamp) return '未知时间';
        const date = new Date(timestamp);
        return date.toLocaleString('zh-CN');
    }

    /**
     * 销毁组件
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
        this.isVisible = false;
        this.previewData = null;
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GoodsPreviewModal;
} else {
    window.GoodsPreviewModal = GoodsPreviewModal;
}
