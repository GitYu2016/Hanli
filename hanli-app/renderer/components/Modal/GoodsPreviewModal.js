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
                    <h3>预览</h3>
                    <button class="goods-preview-close-btn" id="goodsPreviewCloseBtn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
                <div class="goods-preview-body">
                    <div class="preview-tabs">
                        <button class="preview-tab active" data-tab="media">图片与视频</button>
                        <button class="preview-tab" data-tab="goodsInfo">商品信息</button>
                        <button class="preview-tab" data-tab="monitoring">监控数据</button>
                    </div>
                    <div class="preview-content">
                        <!-- 媒体预览区域（图片和视频） -->
                        <div id="previewMedia" class="preview-section active">
                            <div class="media-grid" id="mediaGrid">
                                <div class="empty-state">
                                    <div class="empty-icon">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                                            <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="2"/>
                                            <polyline points="21,15 16,10 5,21" stroke="currentColor" stroke-width="2"/>
                                        </svg>
                                    </div>
                                    <p>暂无采集媒体</p>
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
                    <button class="btn-primary" id="previewConfirmBtn">确定</button>
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
        console.log('GoodsPreviewModal.show 被调用，数据:', data);
        console.log('弹窗元素:', this.element);
        
        if (!this.element) {
            console.error('弹窗元素不存在！');
            return;
        }
        
        this.element.style.display = 'flex';
        this.isVisible = true;
        
        if (data) {
            this.previewData = data;
            this.loadPreviewData(data);
        }
        
        console.log('弹窗显示状态:', this.element.style.display);
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
    async switchTab(tabName) {
        console.log('🔄 切换Tab到:', tabName);
        
        // 更新标签状态
        const tabs = this.element.querySelectorAll('.preview-tab');
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // 更新内容显示
        const sections = this.element.querySelectorAll('.preview-section');
        sections.forEach(section => {
            let targetId;
            if (tabName === 'media') {
                targetId = 'previewMedia';
            } else {
                targetId = `preview${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`;
            }
            section.classList.toggle('active', section.id === targetId);
        });

        this.currentTab = tabName;
        
        // 每次切换Tab时重新加载JSON文件
        console.log('📖 开始重新加载Tab数据...');
        await this.reloadCurrentTabData(tabName);
    }

    /**
     * 重新加载当前Tab的数据
     */
    async reloadCurrentTabData(tabName) {
        try {
            console.log('🔄 重新加载Tab数据:', tabName);
            
            // 获取当前的商品ID和JSON文件信息
            if (!this.currentData || !this.currentData.goodsId || !this.currentData.jsonFiles) {
                console.warn('⚠️ 没有可用的数据信息，跳过重新加载');
                return;
            }

            const { goodsId, jsonFiles } = this.currentData;
            console.log('📁 商品ID:', goodsId);
            
            // 根据Tab类型加载对应的JSON文件
            let fileName, loadMethod;
            switch (tabName) {
                case 'media':
                    fileName = jsonFiles.mediaData;
                    loadMethod = 'loadImages';
                    break;
                case 'goodsInfo':
                    fileName = jsonFiles.goodsInfo;
                    loadMethod = 'loadGoodsInfo';
                    break;
                case 'monitoring':
                    fileName = jsonFiles.monitoring;
                    loadMethod = 'loadMonitoringData';
                    break;
                default:
                    console.warn('⚠️ 未知的Tab类型:', tabName);
                    return;
            }

            console.log('📄 读取JSON文件:', fileName);

            // 读取JSON文件
            const result = await window.electronAPI.readJsonFile(fileName, goodsId);
            if (!result.success) {
                console.error(`❌ 读取${tabName}数据失败:`, result.error);
                return;
            }

            console.log('✅ JSON文件读取成功，开始加载数据...');

            // 调用对应的加载方法
            if (loadMethod === 'loadImages') {
                this.loadImages(result.data.media || []);
            } else if (loadMethod === 'loadGoodsInfo') {
                this.loadGoodsInfo(result.data);
            } else if (loadMethod === 'loadMonitoringData') {
                this.loadMonitoringData(result.data);
            }

            console.log(`✅ ${tabName}数据重新加载完成`);

        } catch (error) {
            console.error('❌ 重新加载Tab数据失败:', error);
        }
    }

    /**
     * 加载预览数据
     */
    loadPreviewData(data) {
        console.log('loadPreviewData 接收到的数据:', data);
        
        // 处理不同的数据结构
        let images = [];
        let goodsInfo = {};
        let monitoringData = [];
        
        if (data.images) {
            // 直接传递的图片数组
            images = data.images;
            console.log('使用直接传递的图片数据，数量:', images.length);
        } else if (data.mediaData && data.mediaData.media) {
            // 从插件生成的mediaData中获取所有媒体（图片和视频）
            images = data.mediaData.media;
            console.log('使用mediaData中的媒体数据，数量:', images.length);
        } else {
            console.warn('没有找到图片数据');
        }
        
        if (data.goodsInfo) {
            goodsInfo = data.goodsInfo;
            console.log('使用goodsInfo数据');
        } else if (data.goodsInfoData) {
            goodsInfo = data.goodsInfoData;
            console.log('使用goodsInfoData数据');
        } else {
            console.warn('没有找到商品信息数据');
        }
        
        if (data.monitoringData) {
            monitoringData = data.monitoringData;
            console.log('使用monitoringData数据，数量:', monitoringData.length);
        } else {
            console.warn('没有找到监控数据');
        }
        
        console.log('处理后的数据 - 图片:', images.length, '商品信息:', Object.keys(goodsInfo).length, '监控数据:', monitoringData.length);
        
        // 保存当前数据信息供Tab切换时使用
        this.currentData = {
            goodsId: data.goodsId,
            jsonFiles: data.jsonFiles
        };
        
        console.log('保存的currentData:', this.currentData);
        
        this.loadImages(images);
        this.loadGoodsInfo(goodsInfo);
        this.loadMonitoringData(monitoringData);
        
        // 开始下载媒体文件到Temp文件夹
        this.startDownloadingMediaFiles(images, data.goodsId);
    }

    /**
     * 开始下载媒体文件到Temp文件夹
     * @param {Array} mediaList - 媒体文件列表
     * @param {string} goodsId - 商品ID
     */
    async startDownloadingMediaFiles(mediaList, goodsId) {
        if (!goodsId || !mediaList || mediaList.length === 0) {
            console.log('跳过媒体文件下载：缺少商品ID或媒体文件');
            return;
        }

        console.log('开始下载媒体文件到Temp文件夹:', { goodsId, mediaCount: mediaList.length });

        try {
            // 分离图片和视频
            const images = mediaList.filter(media => {
                const imageUrl = media.url || media.src;
                const isVideo = (media.type === 'video') || 
                               (media.type && media.type.startsWith('video/')) || 
                               (imageUrl && imageUrl.match(/\.(mp4|webm|ogg|avi|mov|mkv|flv|wmv|m4v|3gp)$/i));
                return !isVideo;
            });

            const videos = mediaList.filter(media => {
                const imageUrl = media.url || media.src;
                const isVideo = (media.type === 'video') || 
                               (media.type && media.type.startsWith('video/')) || 
                               (imageUrl && imageUrl.match(/\.(mp4|webm|ogg|avi|mov|mkv|flv|wmv|m4v|3gp)$/i));
                return isVideo;
            });

            console.log('分离结果 - 图片:', images.length, '视频:', videos.length);

            // 下载图片
            for (const image of images) {
                const imageUrl = image.url || image.src;
                if (imageUrl && imageUrl.startsWith('http')) {
                    try {
                        await this.cacheImageToTemp(goodsId, imageUrl, image.name || '图片');
                    } catch (error) {
                        console.error('下载图片失败:', imageUrl, error);
                    }
                }
            }

            // 下载视频
            for (const video of videos) {
                const videoUrl = video.url || video.src;
                if (videoUrl && videoUrl.startsWith('http')) {
                    try {
                        await this.cacheVideoToTemp(goodsId, videoUrl, video.name || '视频');
                    } catch (error) {
                        console.error('下载视频失败:', videoUrl, error);
                    }
                }
            }

            console.log('媒体文件下载完成');
            if (this.app && typeof this.app.updateStatus === 'function') {
                this.app.updateStatus(`已下载 ${images.length} 张图片和 ${videos.length} 个视频到临时文件夹`);
            }

        } catch (error) {
            console.error('下载媒体文件时出错:', error);
            if (this.app && typeof this.app.updateStatus === 'function') {
                this.app.updateStatus(`下载媒体文件失败: ${error.message}`);
            }
        }
    }

    /**
     * 加载图片数据
     */
    loadImages(images) {
        console.log('loadImages 被调用，媒体数量:', images.length);
        const imagesGrid = this.element.querySelector('#mediaGrid');
        if (!imagesGrid) {
            console.error('找不到 #mediaGrid 元素');
            return;
        }
        console.log('找到 mediaGrid 元素:', imagesGrid);

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
                    <p>暂无采集媒体</p>
                </div>
            `;
            return;
        }

        // 分离图片和视频
        const imageList = [];
        const videoList = [];
        
        images.forEach((media, index) => {
            const mediaUrl = media.url || media.src;
            const isVideo = (media.type === 'video') || 
                           (media.type && media.type.startsWith('video/')) || 
                           (mediaUrl && mediaUrl.match(/\.(mp4|webm|ogg|avi|mov|mkv|flv|wmv|m4v|3gp)$/i));
            
            if (isVideo) {
                videoList.push({ ...media, originalIndex: index });
            } else {
                imageList.push({ ...media, originalIndex: index });
            }
        });

        console.log('分离结果 - 图片:', imageList.length, '视频:', videoList.length);

        // 合并数组：图片在前，视频在后
        const sortedMedia = [...imageList, ...videoList];

        const mediaHtml = sortedMedia.map((media, displayIndex) => {
            const mediaUrl = media.url || media.src;
            const isVideo = (media.type === 'video') || 
                           (media.type && media.type.startsWith('video/')) || 
                           (mediaUrl && mediaUrl.match(/\.(mp4|webm|ogg|avi|mov|mkv|flv|wmv|m4v|3gp)$/i));
            const isLocalFile = mediaUrl && !mediaUrl.startsWith('http');
            
            return `
                <div class="media-item" data-index="${media.originalIndex}" data-type="${isVideo ? 'video' : 'image'}">
                    ${isVideo ? this.createVideoPlaceholder(media, displayIndex) : this.createImageElement(media, displayIndex, isLocalFile)}
                    <div class="media-overlay">
                        <div class="media-info">
                            <span class="media-name">${media.name || `${isVideo ? '视频' : '图片'} ${displayIndex + 1}`}</span>
                            <div class="media-details">
                                <span class="media-size">${media.width && media.height ? `${media.width}×${media.height}px` : '未知尺寸'}</span>
                                ${media.isTargetSize ? '<span class="media-status target-size">目标尺寸</span>' : '<span class="media-status small-size">小尺寸</span>'}
                                ${isLocalFile ? '<span class="media-status local">本地文件</span>' : '<span class="media-status loading">加载中...</span>'}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        imagesGrid.innerHTML = mediaHtml;

        // 绑定媒体点击事件
        this.bindMediaEvents(imagesGrid);
        
        // 异步加载图片
        this.loadImagesAsync(sortedMedia);
    }

    /**
     * 创建图片元素
     */
    createImageElement(image, index, isLocalFile) {
        const imageUrl = image.url || image.src;
        
        if (isLocalFile) {
            // 本地文件直接显示
            return `<img src="${imageUrl}" alt="图片 ${index + 1}" loading="lazy">`;
        } else {
            // 网络图片直接显示，不显示占位符
            return `<img src="${imageUrl}" alt="图片 ${index + 1}" loading="lazy" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="image-error-fallback" style="display: none;">
                        <div class="file-icon image">IMG</div>
                        <div class="file-name">图片加载失败</div>
                    </div>`;
        }
    }

    /**
     * 创建视频占位符
     */
    createVideoPlaceholder(video, index) {
        return `
            <div class="video-placeholder">
                <div class="video-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polygon points="5,3 19,12 5,21" fill="currentColor"/>
                    </svg>
                </div>
                <div class="video-info">
                    <span class="video-name">${video.name || `视频 ${index + 1}`}</span>
                    <div class="video-details">
                        <span class="video-size">${video.width && video.height ? `${video.width}×${video.height}px` : '未知尺寸'}</span>
                        <span class="video-duration">${this.formatDuration(video.duration)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 异步加载图片
     */
    loadImagesAsync(images) {
        images.forEach((image, index) => {
            const imageUrl = image.url || image.src;
            const isLocalFile = imageUrl && !imageUrl.startsWith('http');
            
            // 只处理网络图片的加载状态
            if (!isLocalFile) {
                const mediaItem = this.element.querySelector(`[data-index="${index}"]`);
                if (mediaItem) {
                    const imgElement = mediaItem.querySelector('img');
                    const statusElement = mediaItem.querySelector('.media-status');
                    
                    if (imgElement && statusElement) {
                        // 监听图片加载状态
                        imgElement.onload = () => {
                            statusElement.textContent = '已加载';
                            statusElement.classList.add('loaded');
                        };
                        
                        imgElement.onerror = () => {
                            statusElement.textContent = '加载失败';
                            statusElement.classList.add('error');
                        };
                    }
                }
            }
        });
    }

    /**
     * 格式化视频时长
     */
    formatDuration(seconds) {
        if (!seconds) return '未知时长';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                <div class="data-item-label">数据记录 ${index + 1}</div>
                <div class="data-item-value">
                    <div class="monitoring-record">
                        <div class="monitoring-time">${this.formatTime(item.timestamp)}</div>
                        <div class="monitoring-fields">
                            ${Object.entries(item.data || {}).map(([key, value]) => `
                                <div class="monitoring-field">
                                    <span class="monitoring-field-label">${this.formatFieldName(key)}:</span>
                                    <span class="monitoring-field-value">${this.formatFieldValue(value)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        monitoringDataList.innerHTML = dataItems;
    }


    /**
     * 绑定媒体事件
     */
    bindMediaEvents(mediaGrid) {
        // 移除媒体项目的点击事件，不支持点击放大
        // 媒体项目现在只用于显示，不支持交互
        console.log('媒体项目已加载，不支持点击放大功能');
    }

    /**
     * 预览图片
     */
    previewImage(index) {
        // 获取图片数据
        let images = [];
        if (this.previewData && this.previewData.images) {
            images = this.previewData.images;
        } else if (this.previewData && this.previewData.mediaData && this.previewData.mediaData.media) {
            images = this.previewData.mediaData.media;
        }
        
        const image = images[index];
        if (image) {
            console.log('预览图片:', image);
            
            // 获取商品ID用于缓存
            const goodsId = this.getCurrentGoodsId();
            
            // 图片预览功能已移除，不支持点击放大
            console.log('图片预览功能已禁用，不支持点击放大');
        }
    }

    /**
     * 预览视频
     */
    previewVideo(index) {
        // 获取媒体数据
        let media = [];
        if (this.previewData && this.previewData.images) {
            media = this.previewData.images;
        } else if (this.previewData && this.previewData.mediaData && this.previewData.mediaData.media) {
            media = this.previewData.mediaData.media;
        }
        
        const video = media[index];
        if (video) {
            console.log('预览视频:', video);
            
            // 获取商品ID用于缓存
            const goodsId = this.getCurrentGoodsId();
            
            // 缓存视频到临时文件夹
            if (goodsId && video.url && video.url.startsWith('http')) {
                this.cacheVideoToTemp(goodsId, video.url, video.name || `视频 ${index + 1}`);
            }
            
            // 可以调用主应用的视频预览功能
            if (this.app && typeof this.app.previewVideo === 'function') {
                this.app.previewVideo(video.url || video.src);
            } else {
                // 简单的视频预览
                this.showVideoPreview(video);
            }
        }
    }

    /**
     * 显示视频预览
     */
    showVideoPreview(video) {
        const modal = document.createElement('div');
        modal.className = 'video-preview-modal';
        modal.innerHTML = `
            <div class="video-preview-content">
                <div class="video-preview-header">
                    <h3>视频预览</h3>
                    <button class="video-preview-close-btn" id="videoPreviewCloseBtn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
                <div class="video-preview-body">
                    <video controls width="100%" height="auto">
                        <source src="${video.url || video.src}" type="${video.type || 'video/mp4'}">
                        您的浏览器不支持视频播放。
                    </video>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 绑定关闭事件
        const closeBtn = modal.querySelector('#videoPreviewCloseBtn');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    /**
     * 处理编辑操作
     */
    handleEdit() {
        // 获取当前商品ID
        const goodsId = this.getCurrentGoodsId();
        console.log('获取到的商品ID:', goodsId);
        
        if (goodsId) {
            // 跳转到产品库商品详情页
            this.navigateToProductDetail(goodsId);
            // 关闭弹窗
            this.hide();
        } else {
            console.error('无法获取商品ID');
            if (window.hanliApp && typeof window.hanliApp.updateStatus === 'function') {
                window.hanliApp.updateStatus('无法获取商品ID，无法跳转到编辑页面');
            }
        }
    }

    /**
     * 获取当前商品ID
     */
    getCurrentGoodsId() {
        // 优先从hanliApp的当前导入数据中获取
        if (window.hanliApp && window.hanliApp.currentImportData) {
            const goodsInfoData = window.hanliApp.currentImportData.goodsInfoData;
            if (goodsInfoData && goodsInfoData.goodsId) {
                return goodsInfoData.goodsId;
            }
        }
        
        // 备用方案：从商品信息列表中获取goodsId
        const goodsInfoList = document.getElementById('goodsInfoList');
        if (goodsInfoList) {
            const goodsIdElement = goodsInfoList.querySelector('[data-field="goodsId"]');
            if (goodsIdElement) {
                const valueElement = goodsIdElement.querySelector('.data-value');
                return valueElement ? valueElement.textContent.trim() : null;
            }
        }
        return null;
    }

    /**
     * 跳转到产品库商品详情页
     */
    async navigateToProductDetail(goodsId) {
        try {
            console.log('开始跳转到商品详情页:', goodsId);
            
            // 确保产品库数据已加载
            if (window.hanliApp && typeof window.hanliApp.loadProductLibraryData === 'function') {
                console.log('正在加载产品库数据...');
                await window.hanliApp.loadProductLibraryData();
                console.log('产品库数据加载完成');
            } else {
                console.error('hanliApp.loadProductLibraryData 方法不可用');
                return;
            }
            
            // 查找对应的商品元素
            const selector = `[data-name="${goodsId}"][data-type="goods"]`;
            console.log('查找商品元素，选择器:', selector);
            const productElement = document.querySelector(selector);
            
            if (productElement) {
                console.log('找到商品元素:', productElement);
                // 选择该商品
                if (window.hanliApp && typeof window.hanliApp.selectDataItem === 'function') {
                    await window.hanliApp.selectDataItem(productElement);
                    console.log(`已跳转到商品详情页: ${goodsId}`);
                    if (window.hanliApp && typeof window.hanliApp.updateStatus === 'function') {
                        window.hanliApp.updateStatus(`已跳转到商品详情页: ${goodsId}`);
                    }
                } else {
                    console.error('hanliApp.selectDataItem 方法不可用');
                }
            } else {
                console.error(`未找到商品: ${goodsId}`);
                console.log('当前页面所有商品元素:', document.querySelectorAll('[data-type="goods"]'));
                if (window.hanliApp && typeof window.hanliApp.updateStatus === 'function') {
                    window.hanliApp.updateStatus(`未找到商品: ${goodsId}`);
                }
            }
        } catch (error) {
            console.error('跳转到商品详情页失败:', error);
            if (window.hanliApp && typeof window.hanliApp.updateStatus === 'function') {
                window.hanliApp.updateStatus(`跳转失败: ${error.message}`);
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
            'goodsId': '商品ID',
            'goodsTitleEn': '商品名称(英文)',
            'goodsTitleCn': '商品名称(中文)',
            'goodsCat1': '商品分类1',
            'goodsCat2': '商品分类2',
            'goodsCat3': '商品分类3',
            'collectTime': '采集时间',
            'skuList': 'SKU列表',
            'goodsPropertyInfo': '商品属性信息',
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
            return '<span class="empty">未设置</span>';
        }
        
        if (Array.isArray(value)) {
            if (value.length === 0) {
                return '<span class="empty">无数据</span>';
            }
            // 对于数组，显示数量和简要信息
            return `${value.length} 项数据`;
        }
        
        if (typeof value === 'object') {
            // 对于对象，显示键的数量
            const keys = Object.keys(value);
            if (keys.length === 0) {
                return '<span class="empty">无数据</span>';
            }
            return `${keys.length} 个属性`;
        }
        
        if (typeof value === 'boolean') {
            return value ? '是' : '否';
        }
        
        // 对于字符串，如果太长则截断
        const str = String(value);
        if (str.length > 100) {
            return str.substring(0, 100) + '...';
        }
        
        return str;
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
     * 缓存图片到临时文件夹
     * @param {string} goodsId - 商品ID
     * @param {string} imageUrl - 图片URL
     * @param {string} fileName - 文件名
     */
    async cacheImageToTemp(goodsId, imageUrl, fileName) {
        try {
            console.log('开始缓存图片到临时文件夹:', { goodsId, imageUrl, fileName });
            
            // 传递imageUrl作为imageData参数，因为main.js会处理URL下载
            const result = await window.electronAPI.cacheImageToTemp(goodsId, imageUrl, imageUrl);
            if (result.success) {
                console.log('图片缓存成功:', result.tempPath);
                if (this.app && typeof this.app.updateStatus === 'function') {
                    this.app.updateStatus(`图片已缓存到临时文件夹: ${fileName}`);
                }
            } else {
                console.error('图片缓存失败:', result.error);
                if (this.app && typeof this.app.updateStatus === 'function') {
                    this.app.updateStatus(`图片缓存失败: ${result.error}`);
                }
            }
            return result;
        } catch (error) {
            console.error('缓存图片时出错:', error);
            if (this.app && typeof this.app.updateStatus === 'function') {
                this.app.updateStatus(`缓存图片时出错: ${error.message}`);
            }
            return { success: false, error: error.message };
        }
    }

    /**
     * 缓存视频到临时文件夹
     * @param {string} goodsId - 商品ID
     * @param {string} videoUrl - 视频URL
     * @param {string} fileName - 文件名
     */
    async cacheVideoToTemp(goodsId, videoUrl, fileName) {
        try {
            console.log('开始缓存视频到临时文件夹:', { goodsId, videoUrl, fileName });
            
            // 传递videoUrl作为videoData参数，因为main.js会处理URL下载
            const result = await window.electronAPI.cacheVideoToTemp(goodsId, videoUrl, videoUrl);
            if (result.success) {
                console.log('视频缓存成功:', result.tempPath);
                if (this.app && typeof this.app.updateStatus === 'function') {
                    this.app.updateStatus(`视频已缓存到临时文件夹: ${fileName}`);
                }
            } else {
                console.error('视频缓存失败:', result.error);
                if (this.app && typeof this.app.updateStatus === 'function') {
                    this.app.updateStatus(`视频缓存失败: ${result.error}`);
                }
            }
        } catch (error) {
            console.error('缓存视频时出错:', error);
            if (this.app && typeof this.app.updateStatus === 'function') {
                this.app.updateStatus(`视频缓存出错: ${error.message}`);
            }
        }
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
