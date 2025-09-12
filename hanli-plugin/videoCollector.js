// 视频采集模块
class VideoCollector {
    constructor() {
        this.collectedVideos = new Set();
        this.videoObserver = null;
        this.init();
    }

    // 初始化视频收集
    init() {
        console.log('开始初始化视频收集...');
        
        // 立即收集当前页面的视频
        this.collectCurrentVideos();
        
        // 设置MutationObserver监听动态加载的视频
        this.setupVideoObserver();
        
        // 监听页面滚动，触发懒加载视频
        this.setupScrollListener();
        
        // 监听视频加载事件
        this.setupVideoLoadListener();
    }

    // 收集当前页面的视频
    collectCurrentVideos() {
        // 收集 <video> 标签
        const videoElements = document.querySelectorAll('video');
        videoElements.forEach(video => {
            if (video.src && video.src.startsWith('http')) {
                this.collectedVideos.add(video.src);
            }
            // 收集 <source> 标签中的视频
            const sources = video.querySelectorAll('source');
            sources.forEach(source => {
                if (source.src && source.src.startsWith('http')) {
                    this.collectedVideos.add(source.src);
                }
            });
        });

        // 收集带有视频URL的链接
        const videoLinks = document.querySelectorAll('a[href*=".mp4"], a[href*=".webm"], a[href*=".ogg"], a[href*=".avi"], a[href*=".mov"]');
        videoLinks.forEach(link => {
            if (link.href && link.href.startsWith('http')) {
                this.collectedVideos.add(link.href);
            }
        });

        console.log('当前页面视频数量:', this.collectedVideos.size);
    }

    // 设置MutationObserver
    setupVideoObserver() {
        this.videoObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // 检查新添加的节点是否是视频
                            if (node.tagName === 'VIDEO' && node.src && node.src.startsWith('http')) {
                                this.collectedVideos.add(node.src);
                                console.log('发现新视频:', node.src);
                            }
                            
                            // 检查新添加的节点内部是否有视频
                            const videos = node.querySelectorAll ? node.querySelectorAll('video') : [];
                            videos.forEach(video => {
                                if (video.src && video.src.startsWith('http')) {
                                    this.collectedVideos.add(video.src);
                                    console.log('发现新视频:', video.src);
                                }
                                // 检查 <source> 标签
                                const sources = video.querySelectorAll('source');
                                sources.forEach(source => {
                                    if (source.src && source.src.startsWith('http')) {
                                        this.collectedVideos.add(source.src);
                                        console.log('发现新视频源:', source.src);
                                    }
                                });
                            });

                            // 检查视频链接
                            const videoLinks = node.querySelectorAll ? 
                                node.querySelectorAll('a[href*=".mp4"], a[href*=".webm"], a[href*=".ogg"], a[href*=".avi"], a[href*=".mov"]') : [];
                            videoLinks.forEach(link => {
                                if (link.href && link.href.startsWith('http')) {
                                    this.collectedVideos.add(link.href);
                                    console.log('发现新视频链接:', link.href);
                                }
                            });
                        }
                    });
                }
            });
        });
        
        // 开始观察
        this.videoObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('视频 MutationObserver 已启动');
    }

    // 设置滚动监听器
    setupScrollListener() {
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                // 滚动后重新收集视频
                this.collectCurrentVideos();
            }, 500);
        });
    }

    // 设置视频加载监听器
    setupVideoLoadListener() {
        document.addEventListener('load', (e) => {
            if (e.target.tagName === 'VIDEO' && e.target.src && e.target.src.startsWith('http')) {
                this.collectedVideos.add(e.target.src);
                console.log('视频加载完成:', e.target.src);
            }
        }, true);
    }

    // 获取所有收集到的视频
    getAllVideos() {
        return Array.from(this.collectedVideos);
    }

    // 手动触发视频收集
    triggerCollection() {
        console.log('手动触发视频收集...');
        this.collectCurrentVideos();
        console.log('当前收集到的视频数量:', this.collectedVideos.size);
        return this.getAllVideos();
    }

    // 获取视频数量
    getCount() {
        return this.collectedVideos.size;
    }

    // 检测视频信息并筛选
    async detectAndFilterVideos(videoUrls, options = {}) {
        const {
            minDuration = 1,      // 最小时长（秒）
            maxDuration = 300,    // 最大时长（秒）
            minSize = 1024 * 1024, // 最小文件大小（1MB）
            maxSize = 500 * 1024 * 1024, // 最大文件大小（500MB）
            supportedFormats = ['mp4', 'webm', 'ogg', 'avi', 'mov']
        } = options;
        
        const videoInfoList = [];
        let loadedCount = 0;
        let errorCount = 0;
        
        console.log(`开始检测 ${videoUrls.length} 个视频的信息...`);
        
        for (const videoUrl of videoUrls) {
            try {
                // 检查文件格式
                const url = new URL(videoUrl);
                const pathname = url.pathname.toLowerCase();
                const hasValidFormat = supportedFormats.some(format => pathname.includes(`.${format}`));
                
                if (!hasValidFormat) {
                    console.log(`跳过不支持的视频格式: ${videoUrl}`);
                    continue;
                }

                // 创建视频对象来获取信息
                const video = document.createElement('video');
                video.crossOrigin = 'anonymous';
                video.preload = 'metadata';
                
                const videoPromise = new Promise((resolve) => {
                    video.onloadedmetadata = () => {
                        const duration = video.duration;
                        const videoWidth = video.videoWidth;
                        const videoHeight = video.videoHeight;
                        
                        // 检查时长是否在范围内
                        const isDurationValid = duration >= minDuration && duration <= maxDuration;
                        
                        // 尝试获取文件大小（通过HEAD请求）
                        this.getVideoFileSize(videoUrl).then(fileSize => {
                            const isSizeValid = fileSize >= minSize && fileSize <= maxSize;
                            
                            const videoInfo = {
                                url: videoUrl,
                                duration: duration,
                                width: videoWidth,
                                height: videoHeight,
                                fileSize: fileSize,
                                isDurationValid: isDurationValid,
                                isSizeValid: isSizeValid,
                                aspectRatio: videoWidth && videoHeight ? (videoWidth / videoHeight).toFixed(2) : null,
                                format: this.getVideoFormat(videoUrl)
                            };
                            
                            videoInfoList.push(videoInfo);
                            loadedCount++;
                            
                            console.log(`视频 ${loadedCount}: ${duration}s, ${videoWidth}×${videoHeight}px, 时长有效:${isDurationValid}, 大小有效:${isSizeValid}`);
                            
                            resolve();
                        }).catch(() => {
                            // 如果无法获取文件大小，仍然添加视频信息
                            const videoInfo = {
                                url: videoUrl,
                                duration: duration,
                                width: videoWidth,
                                height: videoHeight,
                                fileSize: null,
                                isDurationValid: isDurationValid,
                                isSizeValid: true, // 假设大小有效
                                aspectRatio: videoWidth && videoHeight ? (videoWidth / videoHeight).toFixed(2) : null,
                                format: this.getVideoFormat(videoUrl)
                            };
                            
                            videoInfoList.push(videoInfo);
                            loadedCount++;
                            resolve();
                        });
                    };
                    
                    video.onerror = () => {
                        console.warn('无法加载视频:', videoUrl);
                        errorCount++;
                        resolve();
                    };
                });
                
                video.src = videoUrl;
                await videoPromise;
            } catch (error) {
                console.warn('处理视频时出错:', videoUrl, error);
                errorCount++;
            }
        }
        
        console.log(`视频检测完成: 成功加载 ${loadedCount} 个, 失败 ${errorCount} 个`);
        return videoInfoList;
    }

    // 获取视频文件大小
    async getVideoFileSize(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            const contentLength = response.headers.get('content-length');
            return contentLength ? parseInt(contentLength) : null;
        } catch (error) {
            console.warn('无法获取视频文件大小:', url, error);
            return null;
        }
    }

    // 获取视频格式
    getVideoFormat(url) {
        try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname.toLowerCase();
            if (pathname.includes('.mp4')) return 'mp4';
            if (pathname.includes('.webm')) return 'webm';
            if (pathname.includes('.ogg')) return 'ogg';
            if (pathname.includes('.avi')) return 'avi';
            if (pathname.includes('.mov')) return 'mov';
            return 'unknown';
        } catch (error) {
            return 'unknown';
        }
    }

    // 清理资源
    destroy() {
        if (this.videoObserver) {
            this.videoObserver.disconnect();
            this.videoObserver = null;
        }
        this.collectedVideos.clear();
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VideoCollector;
} else {
    window.VideoCollector = VideoCollector;
}
