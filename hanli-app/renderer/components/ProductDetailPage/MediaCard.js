/**
 * MediaCard 组件
 * 统一的媒体卡片组件，支持图片和视频的加载、显示、选择等功能
 */
class MediaCard {
    constructor() {
        this.container = null;
        this.mediaItems = [];
        this.onImageClick = null;
        this.onVideoContextMenu = null;
        this.goodsId = null;
        this.loadingStates = new Map(); // 跟踪每个媒体项的加载状态
        this.mediaSelection = null; // 媒体选择组件实例
        this.stylesInjected = false; // 标记样式是否已注入
    }

    /**
     * 注入组件样式
     */
    injectStyles() {
        if (this.stylesInjected) return;
        
        const styleId = 'media-card-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
/* 媒体卡片组件样式 */
.media-card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
    padding: 16px 0;
}

.media-card-item {
    position: relative;
    background: var(--color-surface-secondary);
    border-radius: var(--radius-card);
    overflow: hidden;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    aspect-ratio: 3/4;
}

.media-card-item:hover {
    cursor: pointer;
}

.media-card-wrapper {
    position: relative;
    width: 100%;
    flex: 1;
    min-height: 0;
    border-radius: var(--radius-card);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.media-card-content.selected {
    outline: 3px solid var(--color-info);
    outline-offset: 2px;
}

.media-card-content {
    position: relative;
    width: 100%;
    flex: 1;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-surface-secondary);
}

.media-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.media-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.media-card-info {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-height: 60px;
    pointer-events: none;
    user-select: none;
}

.media-card-title {
    font-size: 12px;
    color: var(--color-text-primary);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;
}

.media-card-meta {
    font-size: 10px;
    color: var(--color-text-secondary);
    text-align: center;
    font-family: monospace;
}

/* 加载状态样式 */
.media-card-loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--color-surface-secondary);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.loading-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid var(--color-border);
    border-top: 2px solid var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.loading-text {
    font-size: 12px;
    color: var(--color-text-secondary);
}

/* 错误状态样式 */
.media-card-error {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--color-surface-secondary);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--color-error);
}

.media-card-error i {
    font-size: 24px;
}

.error-text {
    font-size: 12px;
}

/* 多选模式样式 */
.media-card-grid.multi-select-mode {
    position: relative;
}

.media-card-grid.multi-select-mode::before {
    content: "按住Shift键进行多选";
    position: absolute;
    top: -30px;
    left: 0;
    font-size: 12px;
    color: var(--color-primary);
    background: var(--color-primary-light);
    padding: 4px 8px;
    border-radius: var(--radius-small);
    opacity: 0.8;
    z-index: 10;
}

.media-card-grid.multi-select-mode .media-card-item {
    cursor: crosshair;
}

/* 选中状态下的媒体信息样式 */
.media-card-content.selected + .media-card-info .media-card-title {
    color: var(--color-primary);
    font-weight: 600;
}

/* 图片卡片特殊样式 */
.image-card .media-card-content {
    aspect-ratio: 1/1;
}

/* 视频卡片特殊样式 */
.video-card {
    aspect-ratio: 1/1;
}

.video-card .media-card-content {
    aspect-ratio: 1/1;
}

/* 拖拽相关样式 */
.media-card-item.dragging {
    opacity: 0.6;
    transform: scale(0.95);
    transition: all 0.2s ease;
    z-index: 1000;
}

.media-card-item.drag-selected {
    transform: scale(1.02);
    opacity: 0.8;
    transition: all 0.2s ease;
}

.media-card-item[draggable="true"] {
    cursor: grab;
}

.media-card-item[draggable="true"]:active {
    cursor: grabbing;
}

/* 拖拽提示样式 */
.drag-hint {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--color-primary);
    color: white;
    padding: 12px 24px;
    border-radius: var(--radius-card);
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.drag-hint.show {
    opacity: 1;
}

/* 拖拽区域样式 */
.drop-zone {
    border: 2px dashed var(--color-primary);
    border-radius: var(--radius-card);
    padding: 20px;
    text-align: center;
    color: var(--color-text-secondary);
    background: var(--color-surface-secondary);
    transition: all 0.3s ease;
}

.drop-zone.drag-over {
    border-color: var(--color-primary);
    background: var(--color-primary-light);
    color: var(--color-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
    .media-card-grid {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 10px;
    }
    
    .media-card-item {
        aspect-ratio: 1/1;
    }
    
    .video-card {
        aspect-ratio: 16/9;
    }
}

/* 动画 */
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
        `;
        
        document.head.appendChild(style);
        this.stylesInjected = true;
    }

    /**
     * 初始化媒体卡片组件
     * @param {HTMLElement} container - 容器元素
     * @param {Array} mediaItems - 媒体项数组，包含图片和视频
     * @param {Object} options - 配置选项
     */
    init(container, mediaItems, options = {}) {
        // 注入样式
        this.injectStyles();
        
        this.container = container;
        this.mediaItems = mediaItems || [];
        this.goodsId = options.goodsId || null;
        this.onImageClick = options.onImageClick || null;
        this.onVideoContextMenu = options.onVideoContextMenu || null;
        
        this.loadingStates.clear();
        
        // 初始化媒体选择组件
        if (typeof MediaSelection !== 'undefined') {
            this.mediaSelection = new MediaSelection();
            this.mediaSelection.init(container, this.mediaItems, options.onSelectionChange);
        } else {
            console.error('MediaSelection组件未加载');
        }
        
        this.render();
        this.bindEvents();
    }

    /**
     * 渲染媒体卡片
     */
    render() {
        if (!this.container || !this.mediaItems) return;

        let html = '<div class="media-card-grid">';
        
        this.mediaItems.forEach((item, index) => {
            const isSelected = this.mediaSelection ? this.mediaSelection.selectedIndexes.has(index) : false;
            const loadingState = this.loadingStates.get(index) || 'idle';
            
            if (item.type === 'image') {
                html += this.renderImageCard(item, index, isSelected, loadingState);
            } else if (item.type === 'video') {
                html += this.renderVideoCard(item, index, isSelected, loadingState);
            }
        });
        
        html += '</div>';
        this.container.innerHTML = html;
    }

    /**
     * 渲染图片卡片
     * @param {Object} image - 图片对象
     * @param {number} index - 索引
     * @param {boolean} isSelected - 是否选中
     * @param {string} loadingState - 加载状态
     * @returns {string} HTML字符串
     */
    renderImageCard(image, index, isSelected, loadingState) {
        const fileName = this.getFileName(image);
        const fileSize = this.getFileSize(image);
        
        return `
            <div class="media-card-item image-card" 
                 data-index="${index}"
                 data-type="image"
                 data-file-name="${fileName}"
                 data-file-path="${image.path || ''}"
                 draggable="true"
                 oncontextmenu="mediaCardInstance.showImageContextMenu(event, ${index}, '${fileName}', '${image.path || ''}')">
                <div class="media-card-content ${isSelected ? 'selected' : ''}">
                    ${loadingState === 'loading' ? this.renderLoadingState() : ''}
                    ${loadingState === 'error' ? this.renderErrorState() : ''}
                    <img src="${image.url}" 
                         alt="${fileName}" 
                         class="media-image"
                         onload="mediaCardInstance.onImageLoad(event, ${index})"
                         onerror="mediaCardInstance.onImageError(event, ${index})"
                         onloadstart="mediaCardInstance.onImageLoadStart(event, ${index})"
                         style="${loadingState === 'loading' || loadingState === 'idle' ? 'display: none;' : ''}">
                </div>
                <div class="media-card-info">
                    <div class="media-card-title">${fileName}</div>
                    <div class="media-card-meta" id="media-size-${index}">${fileSize}</div>
                </div>
            </div>
        `;
    }

    /**
     * 渲染视频卡片
     * @param {Object} video - 视频对象
     * @param {number} index - 索引
     * @param {boolean} isSelected - 是否选中
     * @param {string} loadingState - 加载状态
     * @returns {string} HTML字符串
     */
    renderVideoCard(video, index, isSelected, loadingState) {
        const fileName = this.getFileName(video);
        const fileSize = this.getFileSize(video);
        
        return `
            <div class="media-card-item video-card" 
                 data-index="${index}"
                 data-type="video"
                 data-file-name="${fileName}"
                 data-file-path="${video.path || ''}"
                 draggable="true"
                 oncontextmenu="mediaCardInstance.showVideoContextMenu(event, ${index}, '${fileName}', '${video.path || ''}')">
                <div class="media-card-content ${isSelected ? 'selected' : ''}">
                    ${loadingState === 'loading' ? this.renderLoadingState() : ''}
                    ${loadingState === 'error' ? this.renderErrorState() : ''}
                    <video controls class="media-video" style="${loadingState === 'loading' ? 'display: none;' : ''}">
                        <source src="${video.url}" type="video/mp4">
                        您的浏览器不支持视频播放
                    </video>
                </div>
                <div class="media-card-info">
                    <div class="media-card-title">${fileName}</div>
                    <div class="media-card-meta" id="media-size-${index}">${fileSize}</div>
                </div>
            </div>
        `;
    }

    /**
     * 渲染加载状态
     * @returns {string} HTML字符串
     */
    renderLoadingState() {
        return `
            <div class="media-card-loading">
                <div class="loading-spinner"></div>
                <div class="loading-text">加载中...</div>
            </div>
        `;
    }

    /**
     * 渲染错误状态
     * @returns {string} HTML字符串
     */
    renderErrorState() {
        return `
            <div class="media-card-error">
                
                <div class="error-text">加载失败</div>
            </div>
        `;
    }

    /**
     * 获取文件名
     * @param {Object} item - 媒体项对象
     * @returns {string} 文件名
     */
    getFileName(item) {
        if (item.name) {
            return item.name;
        } else if (item.title) {
            return item.title;
        } else if (item.url) {
            const urlParts = item.url.split('/');
            const fileName = urlParts[urlParts.length - 1];
            return fileName || '未知文件';
        } else {
            return '未知文件';
        }
    }

    /**
     * 获取文件大小信息
     * @param {Object} item - 媒体项对象
     * @returns {string} 文件大小字符串
     */
    getFileSize(item) {
        // 对于图片，优先显示尺寸信息
        if (item.type === 'image' && item.width && item.height) {
            const memorySize = this.calculateImageMemory(item.width, item.height);
            const memoryText = this.formatFileSize(memorySize);
            return `${item.width}×${item.height} (${memoryText})`;
        }
        
        // 如果有文件大小信息，显示文件大小
        if (item.fileSize) {
            return this.formatFileSize(item.fileSize);
        } else if (item.size) {
            if (typeof item.size === 'number') {
                return this.formatFileSize(item.size);
            } else {
                return '未知大小';
            }
        } else {
            return '未知大小';
        }
    }

    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     * @returns {string} 格式化后的大小字符串
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    /**
     * 计算图片内存占用
     * @param {number} width - 图片宽度
     * @param {number} height - 图片高度
     * @param {number} channels - 颜色通道数，默认为4（RGBA）
     * @returns {number} 内存占用字节数
     */
    calculateImageMemory(width, height, channels = 4) {
        const pixelCount = width * height;
        const bytesPerPixel = channels;
        return pixelCount * bytesPerPixel;
    }

    /**
     * 图片开始加载事件处理
     * @param {Event} event - 图片加载开始事件
     * @param {number} index - 图片索引
     */
    onImageLoadStart(event, index) {
        // 添加调试信息
        console.log('图片开始加载:', {
            index: index,
            src: event.target.src,
            mediaItemsLength: this.mediaItems ? this.mediaItems.length : 'undefined'
        });
        
        // 设置加载状态
        this.loadingStates.set(index, 'loading');
        
        // 显示加载状态
        const loadingElement = event.target.parentElement.querySelector('.media-card-loading');
        if (loadingElement) {
            loadingElement.style.display = 'flex';
        }
    }

    /**
     * 图片加载完成事件处理
     * @param {Event} event - 图片加载事件
     * @param {number} index - 图片索引
     */
    onImageLoad(event, index) {
        const img = event.target;
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        
        
        // 更新图片对象中的尺寸信息
        if (this.mediaItems && this.mediaItems[index]) {
            this.mediaItems[index].width = width;
            this.mediaItems[index].height = height;
        }
        
        // 更新加载状态
        this.loadingStates.set(index, 'loaded');
        
        // 计算内存占用
        const memorySize = this.calculateImageMemory(width, height);
        const memoryText = this.formatFileSize(memorySize);
        
        // 更新显示的尺寸和内存信息
        const sizeElement = document.getElementById(`media-size-${index}`);
        if (sizeElement) {
            sizeElement.textContent = `${width}×${height} (${memoryText})`;
        }
        
        // 显示图片
        img.style.display = 'block';
        
        // 隐藏加载状态
        const loadingElement = img.parentElement.querySelector('.media-card-loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    /**
     * 图片加载错误事件处理
     * @param {Event} event - 图片错误事件
     * @param {number} index - 图片索引
     */
    onImageError(event, index) {
        // 添加详细的调试信息
        console.log('图片加载错误调试信息:', {
            index: index,
            mediaItemsLength: this.mediaItems ? this.mediaItems.length : 'undefined',
            mediaItems: this.mediaItems,
            targetSrc: event.target.src
        });
        
        let imageUrl = '未知URL';
        if (this.mediaItems && this.mediaItems[index]) {
            imageUrl = this.mediaItems[index].url;
        } else if (event.target.src) {
            imageUrl = event.target.src;
        }
        
        console.warn(`图片加载失败: ${imageUrl}`);
        
        // 更新加载状态
        this.loadingStates.set(index, 'error');
        
        // 更新显示的尺寸信息为错误状态
        const sizeElement = document.getElementById(`media-size-${index}`);
        if (sizeElement) {
            sizeElement.textContent = '加载失败';
        }
        
        // 显示错误状态
        const loadingElement = event.target.parentElement.querySelector('.media-card-loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        const errorElement = event.target.parentElement.querySelector('.media-card-error');
        if (errorElement) {
            errorElement.style.display = 'flex';
        }
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        if (!this.container) return;

        // 使用事件委托绑定点击事件
        this.container.addEventListener('click', (e) => {
            const mediaCard = e.target.closest('.media-card-item');
            if (mediaCard) {
                e.preventDefault();
                e.stopPropagation();
                
                const index = parseInt(mediaCard.getAttribute('data-index'));
                const type = mediaCard.getAttribute('data-type');
                
                if (type === 'image') {
                    this.handleImageClick(index, e);
                } else if (type === 'video') {
                    this.handleVideoClick(index, e);
                }
            }
        });

        // 绑定拖拽事件
        this.bindDragEvents();
    }

    /**
     * 绑定拖拽事件
     */
    bindDragEvents() {
        if (!this.container) return;

        // 使用事件委托绑定拖拽事件
        this.container.addEventListener('dragstart', (e) => {
            const mediaCard = e.target.closest('.media-card-item');
            if (mediaCard) {
                this.handleDragStart(e, mediaCard);
            }
        });

        this.container.addEventListener('dragend', (e) => {
            const mediaCard = e.target.closest('.media-card-item');
            if (mediaCard) {
                this.handleDragEnd(e, mediaCard);
            }
        });

        // 监听全局拖拽事件，用于检测拖拽到文件夹
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            this.handleGlobalDrop(e);
        });
    }

    /**
     * 处理图片点击事件
     * @param {number} index - 图片索引
     * @param {Event} event - 点击事件
     */
    handleImageClick(index, event) {
        // 图片点击事件已禁用，不再触发任何操作
        return;
    }

    /**
     * 处理视频点击事件
     * @param {number} index - 视频索引
     * @param {Event} event - 点击事件
     */
    handleVideoClick(index, event) {
        // 视频点击处理逻辑（如果需要的话）
    }

    /**
     * 处理拖拽开始事件
     * @param {Event} event - 拖拽事件
     * @param {HTMLElement} mediaCard - 媒体卡片元素
     */
    handleDragStart(event, mediaCard) {
        const index = parseInt(mediaCard.getAttribute('data-index'));
        const isSelected = this.mediaSelection && this.mediaSelection.selectedIndexes.has(index);
        
        // 如果当前项未选中，则选中它
        if (!isSelected && this.mediaSelection) {
            this.mediaSelection.toggleSelection(index, false);
        }
        
        // 获取所有选中的媒体项
        const selectedItems = this.getSelectedItems();
        
        if (selectedItems.length === 0) {
            event.preventDefault();
            return;
        }
        
        // 设置拖拽数据
        const dragData = {
            type: 'media-files',
            items: selectedItems.map(item => ({
                index: item.index,
                fileName: this.getFileName(item.item),
                filePath: this.getFilePath(item.item),
                type: item.item.type
            }))
        };
        
        event.dataTransfer.setData('application/json', JSON.stringify(dragData));
        event.dataTransfer.effectAllowed = 'copy';
        
        // 添加拖拽视觉反馈
        mediaCard.classList.add('dragging');
        
        // 为所有选中的项添加拖拽样式
        selectedItems.forEach(item => {
            const cardElement = this.container.querySelector(`[data-index="${item.index}"]`);
            if (cardElement) {
                cardElement.classList.add('drag-selected');
            }
        });
        
        // 显示拖拽提示
        this.showDragHint(`拖拽 ${selectedItems.length} 个文件到文件夹进行复制`);
        
        console.log('开始拖拽媒体文件:', dragData);
    }

    /**
     * 处理拖拽结束事件
     * @param {Event} event - 拖拽事件
     * @param {HTMLElement} mediaCard - 媒体卡片元素
     */
    handleDragEnd(event, mediaCard) {
        // 移除拖拽视觉反馈
        mediaCard.classList.remove('dragging');
        
        // 移除所有拖拽样式
        const dragSelectedElements = this.container.querySelectorAll('.drag-selected');
        dragSelectedElements.forEach(element => {
            element.classList.remove('drag-selected');
        });
        
        // 隐藏拖拽提示
        this.hideDragHint();
        
        console.log('拖拽结束');
    }

    /**
     * 处理全局拖拽放置事件
     * @param {Event} event - 拖拽事件
     */
    async handleGlobalDrop(event) {
        try {
            const dragData = JSON.parse(event.dataTransfer.getData('application/json'));
            
            if (dragData.type === 'media-files' && dragData.items && dragData.items.length > 0) {
                console.log('检测到媒体文件拖拽放置:', dragData);
                
                // 检查是否拖拽到文件夹
                const targetPath = await this.getDropTargetPath(event);
                if (targetPath) {
                    this.copyFilesToFolder(dragData.items, targetPath);
                } else {
                    console.log('未检测到有效的拖拽目标文件夹');
                }
            }
        } catch (error) {
            console.error('处理拖拽放置事件失败:', error);
        }
    }

    /**
     * 获取拖拽目标路径
     * @param {Event} event - 拖拽事件
     * @returns {Promise<string|null>} 目标路径
     */
    async getDropTargetPath(event) {
        // 检查是否拖拽到文件管理器窗口
        const targetElement = event.target;
        
        // 检查是否拖拽到系统文件管理器
        // 在macOS上，拖拽到Finder会触发drop事件
        // 在Windows上，拖拽到文件资源管理器也会触发drop事件
        
        // 检查拖拽数据是否包含文件路径信息
        const files = event.dataTransfer.files;
        if (files && files.length > 0) {
            // 如果拖拽的是文件，说明可能是从外部拖拽进来的，不是我们要处理的
            return null;
        }
        
        // 检查是否拖拽到应用窗口外部
        const rect = document.body.getBoundingClientRect();
        const isOutsideApp = (
            event.clientX < rect.left || 
            event.clientX > rect.right || 
            event.clientY < rect.top || 
            event.clientY > rect.bottom
        );
        
        if (isOutsideApp) {
            // 拖拽到应用外部，可能是拖拽到文件管理器
            // 这里可以尝试获取桌面路径作为默认目标
            return await this.getDesktopPath();
        }
        
        // 检查是否拖拽到特定的拖拽区域
        if (targetElement && targetElement.classList.contains('drop-zone')) {
            return targetElement.dataset.targetPath || null;
        }
        
        return null;
    }

    /**
     * 获取桌面路径
     * @returns {Promise<string>} 桌面路径
     */
    async getDesktopPath() {
        try {
            // 使用Electron API获取桌面路径
            if (window.electronAPI && window.electronAPI.fileAPI && window.electronAPI.fileAPI.getDesktopPath) {
                const result = await window.electronAPI.fileAPI.getDesktopPath();
                if (result.success) {
                    return result.path;
                }
            }
        } catch (error) {
            console.error('获取桌面路径失败:', error);
        }
        
        // 降级方案：使用navigator.platform判断
        const os = navigator.platform.toLowerCase();
        if (os.includes('mac')) {
            return '~/Desktop';
        } else if (os.includes('win')) {
            return '~/Desktop';
        } else {
            return '~/Desktop';
        }
    }

    /**
     * 获取文件路径
     * @param {Object} item - 媒体项对象
     * @returns {string} 文件路径
     */
    getFilePath(item) {
        if (item.localPath) {
            return item.localPath;
        } else if (item.path) {
            return item.path;
        } else if (item.url && item.url.startsWith('file://')) {
            return item.url.replace('file://', '');
        } else {
            // 构建默认路径
            const fileName = this.getFileName(item);
            let goodsId = this.goodsId;
            
            if (!goodsId && window.homePageInstance && window.homePageInstance.currentProductDetail) {
                goodsId = window.homePageInstance.currentProductDetail.goodsId;
            }
            
            if (goodsId && fileName) {
                return `hanli-app/data/goods-library/${goodsId}/${fileName}`;
            }
            
            return '';
        }
    }

    /**
     * 复制文件到文件夹
     * @param {Array} items - 要复制的文件项数组
     * @param {string} targetPath - 目标文件夹路径
     */
    async copyFilesToFolder(items, targetPath) {
        try {
            console.log('开始复制文件到文件夹:', { items, targetPath });
            
            // 调用主进程API复制文件
            const result = await window.electronAPI.fileAPI.copyFilesToFolder(items, targetPath);
            
            if (result.success) {
                console.log('文件复制成功');
                if (window.toastInstance) {
                    window.toastInstance.show(`已复制 ${items.length} 个文件到目标文件夹`, 'success');
                } else {
                    alert(`已复制 ${items.length} 个文件到目标文件夹`);
                }
            } else {
                console.error('文件复制失败:', result.error);
                if (window.toastInstance) {
                    window.toastInstance.show('文件复制失败: ' + result.error, 'error');
                } else {
                    alert('文件复制失败: ' + result.error);
                }
            }
        } catch (error) {
            console.error('复制文件到文件夹失败:', error);
            if (window.toastInstance) {
                window.toastInstance.show('复制文件失败: ' + error.message, 'error');
            } else {
                alert('复制文件失败: ' + error.message);
            }
        }
    }

    /**
     * 显示拖拽提示
     * @param {string} message - 提示消息
     */
    showDragHint(message) {
        // 移除现有的提示
        this.hideDragHint();
        
        // 创建提示元素
        const hint = document.createElement('div');
        hint.className = 'drag-hint show';
        hint.id = 'drag-hint';
        hint.textContent = message;
        
        // 添加到页面
        document.body.appendChild(hint);
        
        // 3秒后自动隐藏
        setTimeout(() => {
            this.hideDragHint();
        }, 3000);
    }

    /**
     * 隐藏拖拽提示
     */
    hideDragHint() {
        const hint = document.getElementById('drag-hint');
        if (hint) {
            hint.remove();
        }
    }

    /**
     * 获取选中的媒体项（代理方法）
     * @returns {Array} 选中的媒体项数组
     */
    getSelectedItems() {
        return this.mediaSelection ? this.mediaSelection.getSelectedItems() : [];
    }

    /**
     * 获取选中的媒体项数量（代理方法）
     * @returns {number} 选中的媒体项数量
     */
    getSelectedCount() {
        return this.mediaSelection ? this.mediaSelection.getSelectedCount() : 0;
    }

    /**
     * 清除选择（代理方法）
     */
    clearSelection() {
        if (this.mediaSelection) {
            this.mediaSelection.clearSelection();
        }
    }

    /**
     * 设置选择状态（代理方法）
     * @param {Array<number>} indexes - 要选择的索引数组
     */
    setSelection(indexes) {
        if (this.mediaSelection) {
            this.mediaSelection.setMultiSelection(indexes);
        }
    }

    /**
     * 更新选择状态UI（代理方法）
     */
    updateSelectionUI() {
        if (this.mediaSelection) {
            this.mediaSelection.updateSelectionUI();
        }
    }


    /**
     * 播放视频
     * @param {number} index - 视频索引
     */
    playVideo(index) {
        const video = this.container.querySelector(`[data-index="${index}"] video`);
        if (video) {
            video.play();
        }
    }

    /**
     * 显示图片右键菜单
     * @param {Event} event - 右键事件
     * @param {number} index - 图片索引
     * @param {string} fileName - 文件名
     * @param {string} filePath - 文件路径
     */
    showImageContextMenu(event, index, fileName, filePath) {
        event.preventDefault();
        
        // 移除现有的右键菜单
        this.hideContextMenu();
        
        // 创建右键菜单
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.id = 'media-context-menu';
        
        // 根据平台显示不同的文本
        const platform = navigator.platform.toLowerCase();
        const showInFinderText = platform.includes('mac') ? '在 Finder 中显示' : '在文件夹中显示';
        
        contextMenu.innerHTML = `
            <div class="context-menu-item" onclick="mediaCardInstance.showInFinder(${index}, '${fileName}', '${filePath}')">
                <span>${showInFinderText}</span>
            </div>
            <div class="context-menu-item" onclick="mediaCardInstance.saveAs(${index}, '${fileName}', '${filePath}')">
                <span>另存为</span>
            </div>
            <div class="context-menu-item context-menu-item-danger" onclick="mediaCardInstance.moveToTrash(${index}, '${fileName}', '${filePath}')">
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
            document.addEventListener('click', this.hideContextMenu.bind(this), { once: true });
        }, 0);
    }

    /**
     * 显示视频右键菜单
     * @param {Event} event - 右键事件
     * @param {number} index - 视频索引
     * @param {string} fileName - 文件名
     * @param {string} filePath - 文件路径
     */
    showVideoContextMenu(event, index, fileName, filePath) {
        event.preventDefault();
        
        // 移除现有的右键菜单
        this.hideContextMenu();
        
        // 创建右键菜单
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.id = 'media-context-menu';
        
        // 根据平台显示不同的文本
        const platform = navigator.platform.toLowerCase();
        const showInFinderText = platform.includes('mac') ? '在 Finder 中显示' : '在文件夹中显示';
        
        contextMenu.innerHTML = `
            <div class="context-menu-item" onclick="mediaCardInstance.showInFinder(${index}, '${fileName}', '${filePath}')">
                <span>${showInFinderText}</span>
            </div>
            <div class="context-menu-item" onclick="mediaCardInstance.saveAs(${index}, '${fileName}', '${filePath}')">
                <span>另存为</span>
            </div>
            <div class="context-menu-item context-menu-item-danger" onclick="mediaCardInstance.moveToTrash(${index}, '${fileName}', '${filePath}')">
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
            document.addEventListener('click', this.hideContextMenu.bind(this), { once: true });
        }, 0);
    }

    /**
     * 隐藏右键菜单
     */
    hideContextMenu() {
        const contextMenu = document.getElementById('media-context-menu');
        if (contextMenu) {
            contextMenu.remove();
        }
    }

    /**
     * 在 Finder/文件夹中显示文件
     * @param {number} index - 媒体项索引
     * @param {string} fileName - 文件名
     * @param {string} filePath - 文件路径
     */
    async showInFinder(index, fileName, filePath) {
        try {
            // 如果没有文件路径，尝试从媒体项对象中获取路径信息
            let fullPath = filePath;
            
            if (!fullPath && this.mediaItems && this.mediaItems[index]) {
                const item = this.mediaItems[index];
                
                // 优先使用服务器提供的localPath（绝对路径）
                if (item.localPath) {
                    fullPath = item.localPath;
                    console.log('使用localPath:', fullPath);
                } else if (item.path) {
                    fullPath = item.path;
                    console.log('使用path:', fullPath);
                } else if (item.url && item.url.startsWith('file://')) {
                    // 如果是本地文件URL，转换为文件路径
                    fullPath = item.url.replace('file://', '');
                    console.log('从URL转换路径:', fullPath);
                } else if (item.url) {
                    // 如果是HTTP URL，尝试从URL中提取路径信息
                    console.warn('媒体URL是HTTP链接，无法在本地文件系统中显示:', item.url);
                    alert('无法在本地文件系统中显示网络媒体');
                    return;
                }
            }
            
            // 如果还是没有路径，尝试构建默认路径
            if (!fullPath) {
                // 首先尝试使用保存的商品ID
                let goodsId = this.goodsId;
                
                // 如果没有保存的商品ID，尝试从当前页面获取
                if (!goodsId) {
                    const currentUrl = window.location.href;
                    const goodsIdMatch = currentUrl.match(/goodsId[=:]([^&\/]+)/);
                    if (goodsIdMatch) {
                        goodsId = goodsIdMatch[1];
                    }
                }
                
                // 如果还没有商品ID，尝试从全局变量获取
                if (!goodsId && window.homePageInstance && window.homePageInstance.currentProductDetail) {
                    goodsId = window.homePageInstance.currentProductDetail.goodsId;
                }
                
                if (goodsId && fileName) {
                    // 构建相对路径，主进程会处理转换为绝对路径
                    fullPath = `hanli-app/data/goods-library/${goodsId}/${fileName}`;
                    console.log('尝试构建的路径:', fullPath);
                }
            }
            
            if (!fullPath) {
                console.error('无法确定文件路径');
                alert('无法确定文件路径，请检查文件是否存在');
                return;
            }
            
            console.log('准备显示文件:', fullPath);
            
            // 调用 Electron API
            const result = await window.electronAPI.fileAPI.showInFinder(fullPath);
            
            if (result.success) {
                console.log('文件已在 Finder/文件夹中显示');
            } else {
                console.error('显示文件失败:', result.error);
                alert('显示文件失败: ' + result.error);
            }
        } catch (error) {
            console.error('显示文件在 Finder 中失败:', error);
            alert('显示文件失败: ' + error.message);
        } finally {
            // 隐藏右键菜单
            this.hideContextMenu();
        }
    }

    /**
     * 另存为文件
     * @param {number} index - 媒体项索引
     * @param {string} fileName - 文件名
     * @param {string} filePath - 文件路径
     */
    async saveAs(index, fileName, filePath) {
        try {
            // 如果没有文件路径，尝试构建路径
            let fullPath = filePath;
            
            if (!fullPath && this.mediaItems && this.mediaItems[index]) {
                const item = this.mediaItems[index];
                
                // 尝试从媒体项对象中获取路径信息
                if (item.path) {
                    fullPath = item.path;
                } else if (item.url && item.url.startsWith('file://')) {
                    // 如果是本地文件URL，转换为文件路径
                    fullPath = item.url.replace('file://', '');
                } else if (item.url) {
                    // 如果是HTTP URL，尝试从URL中提取路径信息
                    console.warn('媒体URL是HTTP链接，无法另存为本地文件:', item.url);
                    alert('无法另存为网络媒体');
                    return;
                }
            }
            
            // 如果还是没有路径，尝试构建默认路径
            if (!fullPath) {
                // 首先尝试使用保存的商品ID
                let goodsId = this.goodsId;
                
                // 如果没有保存的商品ID，尝试从当前页面获取
                if (!goodsId) {
                    const currentUrl = window.location.href;
                    const goodsIdMatch = currentUrl.match(/goodsId[=:]([^&\/]+)/);
                    if (goodsIdMatch) {
                        goodsId = goodsIdMatch[1];
                    }
                }
                
                // 如果还没有商品ID，尝试从全局变量获取
                if (!goodsId && window.homePageInstance && window.homePageInstance.currentProductDetail) {
                    goodsId = window.homePageInstance.currentProductDetail.goodsId;
                }
                
                if (goodsId && fileName) {
                    // 构建可能的文件路径
                    fullPath = `hanli-app/data/goods-library/${goodsId}/${fileName}`;
                    console.log('尝试构建的路径:', fullPath);
                }
            }
            
            if (!fullPath) {
                console.error('无法确定文件路径');
                alert('无法确定文件路径，请检查文件是否存在');
                return;
            }
            
            console.log('准备另存为文件:', fullPath);
            
            // 调用 Electron API 另存为
            const result = await window.electronAPI.fileAPI.saveAs(fullPath, fileName);
            
            if (result.success) {
                console.log('文件另存为成功');
                alert('文件另存为成功');
            } else {
                console.error('另存为失败:', result.error);
                alert('另存为失败: ' + result.error);
            }
        } catch (error) {
            console.error('另存为失败:', error);
            alert('另存为失败: ' + error.message);
        } finally {
            // 隐藏右键菜单
            this.hideContextMenu();
        }
    }

    /**
     * 移动文件到废纸篓
     * @param {number} index - 媒体项索引
     * @param {string} fileName - 文件名
     * @param {string} filePath - 文件路径
     */
    async moveToTrash(index, fileName, filePath) {
        try {
            // 确认删除操作
            const confirmed = confirm(`确定要将文件 "${fileName}" 移到废纸篓吗？\n\n此操作不可撤销。`);
            if (!confirmed) {
                this.hideContextMenu();
                return;
            }

            // 如果没有文件路径，尝试构建路径
            let fullPath = filePath;
            
            if (!fullPath && this.mediaItems && this.mediaItems[index]) {
                const item = this.mediaItems[index];
                
                // 优先使用服务器提供的localPath（绝对路径）
                if (item.localPath) {
                    fullPath = item.localPath;
                    console.log('使用localPath:', fullPath);
                } else if (item.path) {
                    fullPath = item.path;
                    console.log('使用path:', fullPath);
                } else if (item.url && item.url.startsWith('file://')) {
                    // 如果是本地文件URL，转换为文件路径
                    fullPath = item.url.replace('file://', '');
                    console.log('从URL转换路径:', fullPath);
                } else if (item.url) {
                    // 如果是HTTP URL，无法删除
                    console.warn('媒体URL是HTTP链接，无法删除:', item.url);
                    alert('无法删除网络媒体');
                    return;
                }
            }
            
            // 如果还是没有路径，尝试构建默认路径
            if (!fullPath) {
                // 首先尝试使用保存的商品ID
                let goodsId = this.goodsId;
                
                // 如果没有保存的商品ID，尝试从当前页面获取
                if (!goodsId) {
                    const currentUrl = window.location.href;
                    const goodsIdMatch = currentUrl.match(/goodsId[=:]([^&\/]+)/);
                    if (goodsIdMatch) {
                        goodsId = goodsIdMatch[1];
                    }
                }
                
                // 如果还没有商品ID，尝试从全局变量获取
                if (!goodsId && window.homePageInstance && window.homePageInstance.currentProductDetail) {
                    goodsId = window.homePageInstance.currentProductDetail.goodsId;
                }
                
                if (goodsId && fileName) {
                    // 构建相对路径，主进程会处理转换为绝对路径
                    fullPath = `hanli-app/data/goods-library/${goodsId}/${fileName}`;
                    console.log('尝试构建的路径:', fullPath);
                }
            }
            
            if (!fullPath) {
                console.error('无法确定文件路径');
                alert('无法确定文件路径，请检查文件是否存在');
                return;
            }
            
            console.log('准备删除文件到废纸篓:', fullPath);
            
            // 调用 Electron API 删除文件到废纸篓
            const result = await window.electronAPI.fileAPI.moveToTrash(fullPath);
            
            if (result.success) {
                console.log('文件已移动到废纸篓');
                
                // 从媒体项数组中移除已删除的媒体项
                if (this.mediaItems && this.mediaItems[index]) {
                    this.mediaItems.splice(index, 1);
                    
                    // 更新选择状态
                    if (this.mediaSelection) {
                        this.mediaSelection.clearSelection();
                    }
                    
                    // 重新渲染媒体列表
                    this.render();
                    
                    // 通知选择状态变化
                    this.notifySelectionChange();
                }
                
                // 显示成功提示
                if (window.toastInstance) {
                    window.toastInstance.show('文件已移动到废纸篓', 'success');
                } else {
                    alert('文件已移动到废纸篓');
                }
            } else {
                console.error('删除文件失败:', result.error);
                alert('删除文件失败: ' + result.error);
            }
        } catch (error) {
            console.error('删除文件失败:', error);
            alert('删除文件失败: ' + error.message);
        } finally {
            // 隐藏右键菜单
            this.hideContextMenu();
        }
    }


    /**
     * 销毁组件
     */
    destroy() {
        // 销毁媒体选择组件
        if (this.mediaSelection) {
            this.mediaSelection.destroy();
            this.mediaSelection = null;
        }
        
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.container = null;
        this.mediaItems = [];
        this.onImageClick = null;
        this.onVideoContextMenu = null;
        this.loadingStates.clear();
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MediaCard;
} else {
    window.MediaCard = MediaCard;
}

// 创建全局实例
const mediaCardInstance = new MediaCard();
