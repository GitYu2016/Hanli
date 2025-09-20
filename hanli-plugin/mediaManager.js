// 媒体管理器 - 统一管理图片视频的采集、筛选、下载
class MediaManager {
    constructor() {
        this.collectedImages = new Set();
        this.collectedVideos = new Set();
        this.imageObserver = null;
        this.videoObserver = null;
        this.isCollecting = false;
    }

    // 初始化图片收集
    initImageCollection() {
        console.log('开始初始化图片收集...');
        
        // 收集当前页面的图片
        this.collectCurrentImages();
        
        // 设置图片观察器
        this.setupImageObserver();
        
        // 设置滚动监听
        this.setupScrollListener();
        
        // 设置图片加载监听
        this.setupImageLoadListener();
    }

    // 初始化视频收集
    initVideoCollection() {
        console.log('开始初始化视频收集...');
        
        // 收集当前页面的视频
        this.collectCurrentVideos();
        
        // 设置视频观察器
        this.setupVideoObserver();
        
        // 设置视频加载监听
        this.setupVideoLoadListener();
    }

    // 收集当前页面的图片
    collectCurrentImages() {
        const allImages = document.querySelectorAll('img');
        console.log(`页面当前图片数量: ${allImages.length}`);
        
        // 详细调试：检查每个图片元素
        allImages.forEach((img, index) => {
            console.log(`图片 ${index}:`, {
                src: img.src,
                dataSrc: img.dataset.src,
                currentSrc: img.currentSrc,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight,
                complete: img.complete,
                loading: img.loading
            });
            
            // 检查多种可能的图片源
            const imageSources = [
                img.src,
                img.dataset.src,
                img.currentSrc,
                img.getAttribute('data-lazy-src'),
                img.getAttribute('data-original')
            ].filter(src => src && src.startsWith('http'));
            
            imageSources.forEach(src => {
                this.collectedImages.add(src);
                console.log(`添加图片源: ${src}`);
            });
        });
        
        console.log(`收集到图片数量: ${this.collectedImages.size}`);
        console.log(`收集到的图片列表:`, Array.from(this.collectedImages));
    }

    // 收集当前页面的视频
    collectCurrentVideos() {
        // 收集 <video> 标签
        const videoElements = document.querySelectorAll('video');
        videoElements.forEach(video => {
            if (video.src && video.src.startsWith('http')) {
                this.collectedVideos.add(video.src);
            }
            
            // 收集 <source> 标签
            const sources = video.querySelectorAll('source');
            sources.forEach(source => {
                if (source.src && source.src.startsWith('http')) {
                    this.collectedVideos.add(source.src);
                }
            });
        });
        
        // 收集页面中所有视频URL（通过正则匹配）
        const pageContent = document.documentElement.innerHTML;
        const videoUrlRegex = /https?:\/\/[^"'\s]+\.(mp4|webm|ogg|mov|avi|mkv)(\?[^"'\s]*)?/gi;
        const videoUrls = pageContent.match(videoUrlRegex) || [];
        
        videoUrls.forEach(url => {
            this.collectedVideos.add(url);
        });
        
        console.log(`收集到视频数量: ${this.collectedVideos.size}`);
    }

    // 设置图片观察器
    setupImageObserver() {
        this.imageObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // 检查新添加的图片
                            if (node.tagName === 'IMG') {
                                if (node.src && node.src.startsWith('http')) {
                                    this.collectedImages.add(node.src);
                                    console.log('发现新图片:', node.src);
                                }
                            }
                            
                            // 检查新添加元素中的图片
                            const images = node.querySelectorAll ? node.querySelectorAll('img') : [];
                            images.forEach(img => {
                                if (img.src && img.src.startsWith('http')) {
                                    this.collectedImages.add(img.src);
                                    console.log('发现新图片:', img.src);
                                }
                            });
                        }
                    });
                }
            });
        });
        
        this.imageObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // 设置视频观察器
    setupVideoObserver() {
        this.videoObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // 检查新添加的视频
                            if (node.tagName === 'VIDEO') {
                                if (node.src && node.src.startsWith('http')) {
                                    this.collectedVideos.add(node.src);
                                    console.log('发现新视频:', node.src);
                                }
                                
                                // 检查视频中的source标签
                                const sources = node.querySelectorAll('source');
                                sources.forEach(source => {
                                    if (source.src && source.src.startsWith('http')) {
                                        this.collectedVideos.add(source.src);
                                        console.log('发现新视频源:', source.src);
                                    }
                                });
                            }
                            
                            // 检查新添加元素中的视频
                            const videos = node.querySelectorAll ? node.querySelectorAll('video') : [];
                            videos.forEach(video => {
                                if (video.src && video.src.startsWith('http')) {
                                    this.collectedVideos.add(video.src);
                                    console.log('发现新视频:', video.src);
                                }
                                
                                const sources = video.querySelectorAll('source');
                                sources.forEach(source => {
                                    if (source.src && source.src.startsWith('http')) {
                                        this.collectedVideos.add(source.src);
                                        console.log('发现新视频源:', source.src);
                                    }
                                });
                            });
                        }
                    });
                }
            });
        });
        
        this.videoObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // 设置滚动监听
    setupScrollListener() {
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.collectCurrentImages();
            }, 500);
        });
    }

    // 设置图片加载监听
    setupImageLoadListener() {
        document.addEventListener('load', (e) => {
            if (e.target.tagName === 'IMG' && e.target.src && e.target.src.startsWith('http')) {
                this.collectedImages.add(e.target.src);
                console.log('图片加载完成:', e.target.src);
            }
        }, true);
    }

    // 设置视频加载监听
    setupVideoLoadListener() {
        document.addEventListener('load', (e) => {
            if (e.target.tagName === 'VIDEO' && e.target.src && e.target.src.startsWith('http')) {
                this.collectedVideos.add(e.target.src);
                console.log('视频加载完成:', e.target.src);
            }
        }, true);
    }

    // 获取所有收集到的图片
    getAllCollectedImages() {
        return Array.from(this.collectedImages);
    }

    // 获取所有收集到的视频
    getAllCollectedVideos() {
        return Array.from(this.collectedVideos);
    }

    // 检测图片尺寸并筛选
    async detectAndFilterImages(imageUrls, options = {}) {
        const {
            minWidth = 400,
            minHeight = 400,
            maxWidth = 2000,
            maxHeight = 2000,
            targetWidth = 800,
            targetHeight = 800,
            tolerance = 50
        } = options;
        
        const imageInfoList = [];
        let loadedCount = 0;
        let errorCount = 0;
        
        console.log(`开始检测 ${imageUrls.length} 张图片的尺寸...`);
        
        for (const imageUrl of imageUrls) {
            try {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                
                const imagePromise = new Promise((resolve) => {
                    img.onload = () => {
                        const width = img.width;
                        const height = img.height;
                        
                        const isInRange = width >= minWidth && width <= maxWidth && 
                                         height >= minHeight && height <= maxHeight;
                        
                        const isTargetSize = Math.abs(width - targetWidth) <= tolerance && 
                                           Math.abs(height - targetHeight) <= tolerance;
                        
                        const imageInfo = {
                            url: imageUrl,
                            width: width,
                            height: height,
                            isInRange: isInRange,
                            isTargetSize: isTargetSize,
                            aspectRatio: (width / height).toFixed(2)
                        };
                        
                        imageInfoList.push(imageInfo);
                        loadedCount++;
                        
                        
                        resolve();
                    };
                    img.onerror = () => {
                        console.warn('无法加载图片:', imageUrl);
                        errorCount++;
                        resolve();
                    };
                });
                
                img.src = imageUrl;
                await imagePromise;
            } catch (error) {
                console.warn('处理图片时出错:', imageUrl, error);
                errorCount++;
            }
        }
        
        return imageInfoList;
    }

    // 检测视频并筛选
    async detectAndFilterVideos(videoUrls, options = {}) {
        const {
            minSize = 1024 * 1024, // 1MB
            maxSize = 100 * 1024 * 1024, // 100MB
            maxCount = 10
        } = options;
        
        const videoInfoList = [];
        let processedCount = 0;
        let errorCount = 0;
        
        console.log(`开始检测 ${videoUrls.length} 个视频...`);
        
        for (const videoUrl of videoUrls) {
            try {
                const videoInfo = {
                    url: videoUrl,
                    width: 0,
                    height: 0,
                    duration: 0,
                    size: 0,
                    format: this.getVideoFormat(videoUrl),
                    isValid: true
                };
                
                // 尝试获取视频信息
                try {
                    const size = await this.getVideoFileSize(videoUrl);
                    videoInfo.size = size;
                    videoInfo.isValid = size >= minSize && size <= maxSize;
                } catch (error) {
                    console.warn('无法获取视频大小:', videoUrl, error);
                    videoInfo.isValid = true; // 假设有效
                }
                
                videoInfoList.push(videoInfo);
                processedCount++;
                
                console.log(`视频 ${processedCount}: ${videoUrl} - 格式:${videoInfo.format}, 大小:${videoInfo.size}bytes, 有效:${videoInfo.isValid}`);
                
            } catch (error) {
                console.warn('处理视频时出错:', videoUrl, error);
                errorCount++;
            }
        }
        
        console.log(`视频检测完成: 成功处理 ${processedCount} 个, 失败 ${errorCount} 个`);
        return videoInfoList;
    }

    // 获取视频文件大小
    async getVideoFileSize(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            const contentLength = response.headers.get('content-length');
            return contentLength ? parseInt(contentLength) : 0;
        } catch (error) {
            throw new Error('无法获取视频大小');
        }
    }

    // 获取视频格式
    getVideoFormat(url) {
        try {
            const extension = url.split('.').pop().split('?')[0].toLowerCase();
            const videoFormats = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];
            return videoFormats.includes(extension) ? extension : 'unknown';
        } catch (error) {
            return 'unknown';
        }
    }

    // 生成媒体数据
    generateMediaData(goodsId, imageInfoList, videoInfoList) {
        const mediaData = {
            goodsId: goodsId,
            media: []
        };

        // 添加筛选后的图片
        imageInfoList.forEach(img => {
            mediaData.media.push({
                url: img.url,
                width: img.width,
                height: img.height,
                isTargetSize: img.isTargetSize || false,
                type: 'image',
                path: null
            });
        });

        // 添加筛选后的视频
        videoInfoList.forEach(video => {
            mediaData.media.push({
                url: video.url,
                width: video.width || 0,
                height: video.height || 0,
                isTargetSize: true, // 视频不进行尺寸过滤
                type: 'video',
                path: null
            });
        });

        return mediaData;
    }

    // 异步下载媒体文件
    async downloadMediaFilesAsync(goodsId, mediaData) {
        try {
            console.log('开始异步下载媒体文件...');
            
            // 筛选符合尺寸要求的图片（最小800x800px）
            const filteredMedia = mediaData.media.filter(item => {
                if (item.type === 'image') {
                    const isLargeEnough = item.width >= 800 && item.height >= 800;
                    console.log(`图片筛选: ${item.url} - ${item.width}x${item.height} - 符合要求: ${isLargeEnough}`);
                    return isLargeEnough;
                }
                // 视频不进行尺寸筛选
                return true;
            });
            
            console.log(`筛选前媒体数量: ${mediaData.media.length}, 筛选后: ${filteredMedia.length}`);
            
            // 发送下载请求到App
            const downloadData = {
                goodsId: goodsId,
                mediaList: filteredMedia
            };
            
            const response = await fetch('http://localhost:3001/api/download-media', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(downloadData)
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    console.log('媒体文件下载完成:', result.downloadedFiles);
                    this.showDownloadCompleteNotification(result.downloadedFiles.length);
                    // 通知按钮状态更新为"已采集"
                    this.notifyCollectionCompleted();
                } else {
                    console.error('媒体文件下载失败:', result.error);
                    this.showToast('媒体文件下载失败: ' + result.error, 'error');
                    // 下载失败时重置按钮状态
                    this.notifyCollectionFailed();
                }
            } else {
                console.error('媒体文件下载请求失败，状态码:', response.status);
                this.showToast('媒体文件下载请求失败', 'error');
                // 下载失败时重置按钮状态
                this.notifyCollectionFailed();
            }
        } catch (error) {
            console.error('异步下载媒体文件失败:', error);
            this.showToast('媒体文件下载失败', 'error');
            // 下载失败时重置按钮状态
            this.notifyCollectionFailed();
        }
    }

    // 显示Toast提示
    showToast(message, type = 'info') {
        let toastContainer = document.getElementById('hanli-toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'hanli-toast-container';
            toastContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10001;
                pointer-events: none;
            `;
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.style.cssText = `
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
            color: white;
            padding: 12px 20px;
            border-radius: var(--radius-small);
            margin-bottom: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            pointer-events: auto;
            cursor: pointer;
        `;
        toast.textContent = message;
        
        toast.addEventListener('click', () => {
            toast.remove();
        });
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // 显示下载完成通知
    showDownloadCompleteNotification(fileCount) {
    }

    // 通知采集完成
    notifyCollectionCompleted() {
        // 触发自定义事件通知content.js更新按钮状态
        const event = new CustomEvent('hanliCollectionCompleted');
        document.dispatchEvent(event);
    }

    // 通知采集失败
    notifyCollectionFailed() {
        // 触发自定义事件通知content.js重置按钮状态
        const event = new CustomEvent('hanliCollectionFailed');
        document.dispatchEvent(event);
    }

    // 清理资源
    cleanup() {
        if (this.imageObserver) {
            this.imageObserver.disconnect();
            this.imageObserver = null;
        }
        if (this.videoObserver) {
            this.videoObserver.disconnect();
            this.videoObserver = null;
        }
        this.collectedImages.clear();
        this.collectedVideos.clear();
    }
}

// 导出到全局
window.MediaManager = MediaManager;
