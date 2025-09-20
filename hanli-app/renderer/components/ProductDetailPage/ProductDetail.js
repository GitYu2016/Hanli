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
        this.mediaCard = null;
        this.selectedMedia = null;
        this.selectedMediaItems = []; // 支持多选
        this.moreMenu = null;
    }

    /**
     * 初始化产品详情组件
     * @param {HTMLElement} container - 容器元素
     * @param {Object} product - 产品数据
     */
    async init(container, product) {
        // 清理之前的状态
        this.destroy();
        
        this.container = container;
        this.product = product;
        this.componentsInitialized = false; // 重置初始化标志
        this.render();
        await this.initComponents();
    }

    /**
     * 检查是否有监控数据
     * @returns {boolean} 是否有有效的监控数据
     */
    checkMonitoringData() {
        // 检查是否有监控数据文件
        if (!this.monitoringData) {
            return false;
        }
        
        // 检查监控数据是否为空数组或空对象
        if (Array.isArray(this.monitoringData)) {
            return this.monitoringData.length > 0;
        }
        
        if (typeof this.monitoringData === 'object') {
            return Object.keys(this.monitoringData).length > 0;
        }
        
        return false;
    }

    /**
     * 渲染产品详情页面
     */
    render() {
        if (!this.container || !this.product) return;

        // 检查是否有监控数据
        const hasMonitoringData = this.checkMonitoringData();

        this.container.innerHTML = `
            <div class="product-detail-page">
                <div class="page-header">
                    <h1 class="page-title">产品详情</h1>
                    <div class="page-header-actions">
                        <div id="more-menu-container" class="product-more-menu-wrapper"></div>
                    </div>
                </div>
                
                <div class="product-detail-content">
                    ${hasMonitoringData ? `
                    <!-- 第一个卡片：图表 -->
                    <div class="detail-section">
                        <h3 class="section-title">
                            数据监控
                        </h3>
                        
                        <!-- 合并的趋势图表卡片 -->
                        <div class="detail-card chart-card">
                            <div class="card-content">
                                <div class="charts-container">
                                    <!-- 销量图表 -->
                                    <div class="chart-item">
                                        <h5 class="section-subtitle">
                                            销量
                                        </h5>
                                        <div class="chart-container">
                                            <canvas id="sales-chart" width="800" height="150"></canvas>
                                        </div>
                                    </div>
                                    
                                    <!-- 价格图表 -->
                                    <div class="chart-item">
                                        <h5 class="section-subtitle">
                                            价格
                                        </h5>
                                        <div class="chart-container">
                                            <canvas id="price-chart" width="800" height="150"></canvas>
                                        </div>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                    
                    <!-- 第二个卡片：媒体 -->
                    <div class="detail-section">
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
                                <div class="svg-icon" data-icon="copy" data-filled="false"></div>
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
        // 避免重复初始化
        if (this.componentsInitialized) {
            return;
        }
        
        // 先加载监控数据
        await this.loadMonitoringData();
        
        // 重新渲染页面（根据监控数据决定是否显示图表部分）
        this.render();
        
        // 初始化图表组件（只有在有监控数据时才初始化）
        if (this.checkMonitoringData()) {
            await this.initProductCharts();
            // 确保图表组件初始化后立即渲染
            if (this.productCharts && this.monitoringData) {
                this.productCharts.renderCharts(this.product, this.monitoringData);
            }
        }
        
        // 初始化附件卡片组件
        await this.initAttachmentCard();
        
        // 初始化媒体卡片组件
        await this.initMediaCard();
        
        // 初始化更多菜单组件
        await this.initMoreMenu();
        
        // 绑定事件
        this.bindEvents();
        
        this.componentsInitialized = true;
    }

    /**
     * 初始化产品图表组件
     */
    async initProductCharts() {
        try {
            // 创建图表组件实例
            this.productCharts = new ProductCharts();
        } catch (error) {
            console.error('初始化图表组件失败:', error);
        }
    }

    /**
     * 加载监控数据
     */
    async loadMonitoringData() {
        // 避免重复请求
        if (this.isLoadingMonitoringData) {
            return;
        }
        
        // 检查是否已经加载过相同产品的监控数据
        if (this.lastLoadedProductId === this.product?.goodsId && this.monitoringDataLoaded) {
            return;
        }
        
        this.isLoadingMonitoringData = true;
        
        try {
            // 尝试从API获取监控数据
            const response = await fetch(`http://localhost:3001/api/products/${this.product.goodsId}/monitoring`);
            console.log('API响应状态:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('API返回数据:', data);
                
                if (data.success && data.monitoring) {
                    console.log('获取到监控数据:', this.product.goodsId, data.monitoring);
                    this.monitoringData = data.monitoring;
                    // 只有当图表组件已初始化时才调用 renderCharts
                    if (this.productCharts) {
                        console.log('图表组件已存在，调用renderCharts');
                        this.productCharts.renderCharts(this.product, data.monitoring);
                    }
                    this.lastLoadedProductId = this.product.goodsId;
                    this.monitoringDataLoaded = true;
                    return;
                } else {
                    console.log('API返回数据格式不正确:', data);
                }
            } else {
                console.log('API请求失败:', response.status, response.statusText);
            }
        } catch (error) {
            console.warn('获取监控数据失败，使用产品基本信息:', error.message);
        } finally {
            this.isLoadingMonitoringData = false;
        }
        
        // 如果API失败，设置监控数据为空
        this.monitoringData = null;
        // 只有当图表组件已初始化时才调用 renderCharts
        if (this.productCharts) {
            this.productCharts.renderCharts(this.product, null);
        }
        this.lastLoadedProductId = this.product.goodsId;
        this.monitoringDataLoaded = true;
    }

    /**
     * 初始化附件卡片组件
     */
    async initAttachmentCard() {
        try {
            const attachmentsList = document.getElementById('attachments-list');
            if (attachmentsList && typeof AttachmentCard !== 'undefined') {
                this.attachmentCard = new AttachmentCard();
                await this.attachmentCard.init(this.product.goodsId, attachmentsList);
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
     * 初始化媒体卡片组件
     */
    async initMediaCard() {
        try {
            const mediaContainer = document.getElementById('media-card-container');
            if (mediaContainer && this.product) {
                // 合并图片和视频数据
                const mediaItems = [];
                
                // 添加视频
                if (this.product.videos && this.product.videos.length > 0) {
                    this.product.videos.forEach(video => {
                        mediaItems.push({
                            ...video,
                            type: 'video'
                        });
                    });
                }
                
                // 添加图片
                if (this.product.images && this.product.images.length > 0) {
                    this.product.images.forEach(image => {
                        mediaItems.push({
                            ...image,
                            type: 'image'
                        });
                    });
                }
                
                if (mediaItems.length > 0) {
                    if (typeof MediaCard !== 'undefined') {
                        this.mediaCard = new MediaCard();
                        this.mediaCard.init(
                            mediaContainer, 
                            mediaItems, 
                            {
                                goodsId: this.product.goodsId,
                                onSelectionChange: (selectedItems) => {
                                    this.onMediaSelectionChange(selectedItems);
                                },
                                onVideoContextMenu: (event, index, fileName, filePath) => {
                                    this.showVideoContextMenu(event, index, fileName, filePath);
                                }
                            }
                        );
                    } else {
                        console.error('MediaCard组件未加载');
                        mediaContainer.innerHTML = '<div class="no-media">媒体卡片组件加载失败</div>';
                    }
                }
            }
        } catch (error) {
            console.error('初始化媒体卡片组件失败:', error);
            const mediaContainer = document.getElementById('media-card-container');
            if (mediaContainer) {
                mediaContainer.innerHTML = '<div class="no-media">媒体卡片组件初始化失败</div>';
            }
        }
    }

    /**
     * 初始化更多菜单组件
     */
    async initMoreMenu() {
        try {
            const moreMenuContainer = document.getElementById('more-menu-container');
            if (moreMenuContainer && typeof IconButton !== 'undefined' && typeof ProductMoreMenu !== 'undefined') {
                // 如果已经存在MoreMenu实例，先销毁
                if (this.moreMenu) {
                    this.moreMenu.destroy();
                }
                
                // 定义菜单项
                const menuItems = [
                    {
                        label: '在 Finder 中显示',
                        action: 'show-in-finder',
                        icon: 'folder-open'
                    }
                ];
                
                // 如果 collectUrl 包含 temu，添加访问 TEMU 链接选项
                if (this.product && this.product.collectUrl && this.product.collectUrl.toLowerCase().includes('temu')) {
                    menuItems.push({
                        label: '访问 TEMU 链接',
                        action: 'visit-temu-link',
                        icon: 'eye'
                    });
                }
                
                // 创建完整的菜单结构
                moreMenuContainer.innerHTML = `
                    <div class="product-more-menu-container">
                        <div class="product-more-menu-trigger-wrapper">
                            <!-- IconButton将在这里渲染 -->
                        </div>
                        <div class="product-more-menu-dropdown" id="product-more-menu-dropdown">
                            <div class="product-more-menu-content">
                                ${this.renderMenuItems(menuItems)}
                            </div>
                        </div>
                    </div>
                `;
                
                // 使用IconButton渲染更多按钮
                const iconButton = new IconButton();
                const moreButtonHTML = iconButton.render('dots-three-vertical', {
                    size: 'normal',
                    variant: 'normal',
                    className: '',
                    title: '更多操作'
                });
                
                const triggerWrapper = moreMenuContainer.querySelector('.product-more-menu-trigger-wrapper');
                if (triggerWrapper) {
                    triggerWrapper.innerHTML = moreButtonHTML;
                }
                
                // 创建ProductMoreMenu浮窗实例
                this.moreMenu = new ProductMoreMenu();
                this.moreMenu.container = moreMenuContainer;
                this.moreMenu.menuItems = menuItems;
                this.moreMenu.isOpen = false;
                
                // 设置菜单点击回调
                this.moreMenu.setMenuClickCallback((action, menuItem) => {
                    this.handleMoreMenuClick(action, menuItem);
                });
                
                // 绑定IconButton点击事件
                const moreButton = moreMenuContainer.querySelector('.icon-button');
                if (moreButton) {
                    moreButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.moreMenu.toggle();
                    });
                }
                
                // 绑定点击外部关闭菜单事件
                this.moreMenu.handleDocumentClick = (e) => {
                    if (moreMenuContainer && !moreMenuContainer.contains(e.target)) {
                        this.moreMenu.close();
                    }
                };
                document.addEventListener('click', this.moreMenu.handleDocumentClick);
                
                // 更多菜单组件已初始化
            } else {
                console.error('更多菜单容器未找到或IconButton/ProductMoreMenu组件未加载');
            }
        } catch (error) {
            console.error('初始化更多菜单组件失败:', error);
        }
    }
    
    /**
     * 渲染菜单项
     * @param {Array} menuItems - 菜单项数组
     * @returns {string} HTML字符串
     */
    renderMenuItems(menuItems) {
        if (!menuItems || menuItems.length === 0) {
            return '<div class="product-more-menu-item disabled">暂无操作</div>';
        }

        return menuItems.map(item => {
            const disabledClass = item.disabled ? 'disabled' : '';
            
            return `
                <div class="product-more-menu-item ${disabledClass}" 
                     data-action="${item.action}">
                    ${item.icon ? `<div class="svg-icon" data-icon="${item.icon}" data-filled="false"></div>` : ''}
                    <span>${item.label}</span>
                </div>
            `;
        }).join('');
    }

    /**
     * 图片选择变化回调
     * @param {Object|null} selectedImage - 选中的图片对象（单选模式）
     * @param {number|null} selectedIndex - 选中的图片索引（单选模式）
     * @param {Array} selectedImages - 所有选中的图片数组（多选模式）
     */
    onMediaSelectionChange(selectedItems = []) {
        this.selectedMediaItems = selectedItems;
        this.selectedMedia = selectedItems.length === 1 ? selectedItems[0].item : null;
        console.log('媒体选择变化:', selectedItems);
    }

    /**
     * 处理更多菜单点击
     * @param {string} action - 操作类型
     * @param {HTMLElement} menuItem - 菜单项元素
     */
    async handleMoreMenuClick(action, menuItem) {
        switch (action) {
            case 'show-in-finder':
                await this.showInFinder();
                break;
            case 'visit-temu-link':
                await this.visitTemuLink();
                break;
            default:
                console.warn('未知的菜单操作:', action);
        }
    }

    /**
     * 在 Finder 中显示商品文件夹
     */
    async showInFinder() {
        try {
            if (!this.product || !this.product.goodsId) {
                this.showToast('商品ID不存在', 'error');
                return;
            }

            // 调用 Electron API 在 Finder 中显示商品文件夹
            const result = await window.electronAPI.fileAPI.showGoodsFolderInFinder(this.product.goodsId);
            
            if (result.success) {
                this.showToast('已在 Finder 中显示', 'success');
                console.log('商品文件夹路径:', result.path);
            } else {
                // 根据错误类型显示不同的提示
                let errorMessage = '打开失败';
                if (result.error.includes('不存在')) {
                    errorMessage = '文件夹不存在';
                } else if (result.error.includes('权限')) {
                    errorMessage = '权限不足';
                }
                this.showToast(errorMessage, 'error');
            }
        } catch (error) {
            console.error('在 Finder 中显示失败:', error);
            this.showToast('打开失败', 'error');
        }
    }

    /**
     * 访问 TEMU 链接
     */
    async visitTemuLink() {
        try {
            if (!this.product || !this.product.collectUrl) {
                this.showToast('链接不存在', 'error');
                return;
            }

            // 检查链接是否包含 temu
            if (!this.product.collectUrl.toLowerCase().includes('temu')) {
                this.showToast('这不是 TEMU 链接', 'error');
                return;
            }

            // 使用 Electron API 打开外部链接
            const result = await window.electronAPI.openSystemBrowser(this.product.collectUrl);
            
            if (result.success) {
                this.showToast('已在浏览器中打开 TEMU 链接', 'success');
                console.log('TEMU 链接已打开:', this.product.collectUrl);
            } else {
                console.error('打开 TEMU 链接失败:', result.error);
                this.showToast('打开链接失败', 'error');
            }
        } catch (error) {
            console.error('访问 TEMU 链接失败:', error);
            this.showToast('打开链接失败', 'error');
        }
    }

    /**
     * 降级复制方案
     * @param {string} text - 要复制的文本
     */
    fallbackCopyToClipboard(text) {
        // 创建临时文本区域
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                this.showToast('已复制', 'success');
            } else {
                throw new Error('execCommand failed');
            }
        } finally {
            document.body.removeChild(textArea);
        }
    }

    /**
     * 刷新数据
     */
    async refreshData() {
        try {
            if (!this.product || !this.product.goodsId) {
                this.showToast('商品信息不存在', 'error');
                return;
            }

            // 重置组件状态
            this.componentsInitialized = false;
            this.monitoringDataLoaded = false;
            this.lastLoadedProductId = null;
            
            // 执行刷新
            await this.refresh();
            
            // 显示刷新完成提示
            this.showToast('刷新完成', 'success');
            
            console.log('数据刷新完成');
        } catch (error) {
            console.error('刷新数据失败:', error);
            this.showToast('刷新失败', 'error');
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
        
        // 合并图片和视频数据
        const mediaItems = [];
        
        // 添加视频
        if (product.videos && product.videos.length > 0) {
            product.videos.forEach(video => {
                mediaItems.push({
                    ...video,
                    type: 'video'
                });
            });
        }
        
        // 添加图片
        if (product.images && product.images.length > 0) {
            product.images.forEach(image => {
                mediaItems.push({
                    ...image,
                    type: 'image'
                });
            });
        }
        
        if (mediaItems.length > 0) {
            mediaHTML += '<div class="media-section">';
            mediaHTML += '<h4 class="section-subtitle">媒体资源</h4>';
            mediaHTML += '<div id="media-card-container"></div>';
            mediaHTML += '</div>';
        } else {
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
        // 使用ProductInfoCard组件
        const productInfoCard = new ProductInfoCard();
        return productInfoCard.render(product);
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
     * @param {number} duration - 显示时长（毫秒）
     */
    showToast(message, type = 'info', duration = 3000) {
        if (typeof toastInstance !== 'undefined' && toastInstance) {
            toastInstance.show(message, type, duration);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    /**
     * 显示视频右键菜单
     * @param {Event} event - 右键事件
     * @param {number} index - 视频索引
     * @param {string} videoName - 视频名称
     * @param {string} videoPath - 视频路径
     */
    showVideoContextMenu(event, index, videoName, videoPath) {
        event.preventDefault();
        
        // 移除现有的右键菜单
        this.hideVideoContextMenu();
        
        // 创建右键菜单
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.id = 'video-context-menu';
        
        // 根据平台显示不同的文本
        const platform = navigator.platform.toLowerCase();
        const showInFinderText = platform.includes('mac') ? '在 Finder 中显示' : '在文件夹中显示';
        
        contextMenu.innerHTML = `
            <div class="context-menu-item" onclick="productDetailInstance.showVideoInFinder(${index}, '${videoName}', '${videoPath}')">
                <span>${showInFinderText}</span>
            </div>
            <div class="context-menu-item" onclick="productDetailInstance.saveVideoAs(${index}, '${videoName}', '${videoPath}')">
                <span>另存为</span>
            </div>
            <div class="context-menu-item context-menu-item-danger" onclick="productDetailInstance.moveVideoToTrash(${index}, '${videoName}', '${videoPath}')">
                <span>移到废纸篓</span>
            </div>
        `;
        
        // 设置菜单位置
        contextMenu.style.position = 'fixed';
        contextMenu.style.left = event.clientX + 'px';
        contextMenu.style.top = event.clientY + 'px';
        contextMenu.style.zIndex = '10000';
        
        // 添加到页面
        document.body.appendChild(contextMenu);
        
        // 点击其他地方隐藏菜单
        setTimeout(() => {
            document.addEventListener('click', this.hideVideoContextMenu.bind(this), { once: true });
        }, 0);
    }

    /**
     * 隐藏视频右键菜单
     */
    hideVideoContextMenu() {
        const contextMenu = document.getElementById('video-context-menu');
        if (contextMenu) {
            contextMenu.remove();
        }
    }

    /**
     * 在 Finder/文件夹中显示视频文件
     * @param {number} index - 视频索引
     * @param {string} videoName - 视频名称
     * @param {string} videoPath - 视频路径
     */
    async showVideoInFinder(index, videoName, videoPath) {
        try {
            // 如果没有文件路径，尝试构建路径
            let fullPath = videoPath;
            if (!fullPath && this.product && this.product.videos && this.product.videos[index]) {
                const video = this.product.videos[index];
                // 尝试从视频对象中获取路径信息
                if (video.path) {
                    fullPath = video.path;
                } else if (video.url && video.url.startsWith('file://')) {
                    // 如果是本地文件URL，转换为文件路径
                    fullPath = video.url.replace('file://', '');
                }
            }
            
            if (!fullPath) {
                console.error('无法确定视频文件路径');
                return;
            }
            
            // 调用 Electron API
            const result = await window.electronAPI.fileAPI.showInFinder(fullPath);
            
            if (result.success) {
                console.log('视频文件已在 Finder/文件夹中显示');
            } else {
                console.error('显示视频文件失败:', result.error);
            }
        } catch (error) {
            console.error('显示视频文件在 Finder 中失败:', error);
        } finally {
            // 隐藏右键菜单
            this.hideVideoContextMenu();
        }
    }

    /**
     * 另存为视频文件
     * @param {number} index - 视频索引
     * @param {string} videoName - 视频名称
     * @param {string} videoPath - 视频路径
     */
    async saveVideoAs(index, videoName, videoPath) {
        try {
            // 如果没有文件路径，尝试构建路径
            let fullPath = videoPath;
            if (!fullPath && this.product && this.product.videos && this.product.videos[index]) {
                const video = this.product.videos[index];
                // 尝试从视频对象中获取路径信息
                if (video.path) {
                    fullPath = video.path;
                } else if (video.url && video.url.startsWith('file://')) {
                    // 如果是本地文件URL，转换为文件路径
                    fullPath = video.url.replace('file://', '');
                }
            }
            
            if (!fullPath) {
                console.error('无法确定视频文件路径');
                return;
            }
            
            // 调用 Electron API 另存为
            const result = await window.electronAPI.fileAPI.saveAs(fullPath, videoName);
            
            if (result.success) {
                console.log('视频文件另存为成功');
            } else {
                console.error('另存为失败:', result.error);
            }
        } catch (error) {
            console.error('另存为失败:', error);
        } finally {
            // 隐藏右键菜单
            this.hideVideoContextMenu();
        }
    }

    /**
     * 移动视频文件到废纸篓
     * @param {number} index - 视频索引
     * @param {string} videoName - 视频名称
     * @param {string} videoPath - 视频路径
     */
    async moveVideoToTrash(index, videoName, videoPath) {
        try {
            // 确认删除操作
            const confirmed = confirm(`确定要将视频文件 "${videoName}" 移到废纸篓吗？\n\n此操作不可撤销。`);
            if (!confirmed) {
                this.hideVideoContextMenu();
                return;
            }

            // 如果没有文件路径，尝试构建路径
            let fullPath = videoPath;
            if (!fullPath && this.product && this.product.videos && this.product.videos[index]) {
                const video = this.product.videos[index];
                // 优先使用服务器提供的localPath（绝对路径）
                if (video.localPath) {
                    fullPath = video.localPath;
                    console.log('使用localPath:', fullPath);
                } else if (video.path) {
                    fullPath = video.path;
                    console.log('使用path:', fullPath);
                } else if (video.url && video.url.startsWith('file://')) {
                    // 如果是本地文件URL，转换为文件路径
                    fullPath = video.url.replace('file://', '');
                    console.log('从URL转换路径:', fullPath);
                } else if (video.url) {
                    // 如果是HTTP URL，无法删除
                    console.warn('视频URL是HTTP链接，无法删除:', video.url);
                    alert('无法删除网络视频');
                    return;
                }
            }
            
            // 如果还是没有路径，尝试构建默认路径
            if (!fullPath) {
                if (this.product && this.product.goodsId && videoName) {
                    // 构建相对路径，主进程会处理转换为绝对路径
                    fullPath = `hanli-app/data/goods-library/${this.product.goodsId}/${videoName}`;
                    console.log('尝试构建的路径:', fullPath);
                }
            }
            
            if (!fullPath) {
                console.error('无法确定视频文件路径');
                alert('无法确定视频文件路径，请检查文件是否存在');
                return;
            }
            
            console.log('准备删除视频文件到废纸篓:', fullPath);
            
            // 调用 Electron API 删除文件到废纸篓
            const result = await window.electronAPI.fileAPI.moveToTrash(fullPath);
            
            if (result.success) {
                console.log('视频文件已移动到废纸篓');
                
                // 从视频数组中移除已删除的视频
                if (this.product && this.product.videos && this.product.videos[index]) {
                    this.product.videos.splice(index, 1);
                    
                    // 重新渲染视频列表
                    this.render();
                }
                
                // 显示成功提示
                if (window.toastInstance) {
                    window.toastInstance.show('视频文件已移动到废纸篓', 'success');
                } else {
                    alert('视频文件已移动到废纸篓');
                }
            } else {
                console.error('删除视频文件失败:', result.error);
                alert('删除视频文件失败: ' + result.error);
            }
        } catch (error) {
            console.error('删除视频文件失败:', error);
            alert('删除视频文件失败: ' + error.message);
        } finally {
            // 隐藏右键菜单
            this.hideVideoContextMenu();
        }
    }

    /**
     * 销毁组件
     */
    destroy() {
        // 隐藏视频右键菜单
        this.hideVideoContextMenu();
        
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

        // 销毁媒体卡片组件
        if (this.mediaCard) {
            this.mediaCard.destroy();
            this.mediaCard = null;
        }

        // 销毁更多菜单组件
        if (this.moreMenu) {
            // 清理文档点击事件
            if (this.moreMenu.handleDocumentClick) {
                document.removeEventListener('click', this.moreMenu.handleDocumentClick);
            }
            this.moreMenu.destroy();
            this.moreMenu = null;
        }

        if (this.container) {
            this.container.innerHTML = '';
        }
        
        this.product = null;
        this.container = null;
        this.selectedMedia = null;
        this.selectedMediaItems = [];
        this.componentsInitialized = false; // 重置初始化标志
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
