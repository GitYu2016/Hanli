// 图片采集模块
class ImageCollector {
    constructor() {
        this.collectedImages = new Set();
        this.imageObserver = null;
        this.init();
    }

    // 初始化图片收集
    init() {
        console.log('开始初始化图片收集...');
        
        // 立即收集当前页面的图片
        this.collectCurrentImages();
        
        // 设置MutationObserver监听动态加载的图片
        this.setupImageObserver();
        
        // 监听页面滚动，触发懒加载图片
        this.setupScrollListener();
        
        // 监听图片加载事件
        this.setupImageLoadListener();
    }

    // 收集当前页面的图片
    collectCurrentImages() {
        const allImages = document.querySelectorAll('img');
        allImages.forEach(img => {
            if (img.src && img.src.startsWith('http')) {
                this.collectedImages.add(img.src);
            }
        });
        console.log('当前页面图片数量:', this.collectedImages.size);
    }

    // 设置MutationObserver
    setupImageObserver() {
        this.imageObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // 检查新添加的节点是否是图片
                            if (node.tagName === 'IMG' && node.src && node.src.startsWith('http')) {
                                this.collectedImages.add(node.src);
                                console.log('发现新图片:', node.src);
                            }
                            
                            // 检查新添加的节点内部是否有图片
                            const imgs = node.querySelectorAll ? node.querySelectorAll('img') : [];
                            imgs.forEach(img => {
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
        
        // 开始观察
        this.imageObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('MutationObserver 已启动');
    }

    // 设置滚动监听器
    setupScrollListener() {
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                // 滚动后重新收集图片
                this.collectCurrentImages();
            }, 500);
        });
    }

    // 设置图片加载监听器
    setupImageLoadListener() {
        document.addEventListener('load', (e) => {
            if (e.target.tagName === 'IMG' && e.target.src && e.target.src.startsWith('http')) {
                this.collectedImages.add(e.target.src);
                console.log('图片加载完成:', e.target.src);
            }
        }, true);
    }

    // 获取所有收集到的图片
    getAllImages() {
        return Array.from(this.collectedImages);
    }

    // 手动触发图片收集
    triggerCollection() {
        console.log('手动触发图片收集...');
        this.collectCurrentImages();
        console.log('当前收集到的图片数量:', this.collectedImages.size);
        return this.getAllImages();
    }

    // 获取图片数量
    getCount() {
        return this.collectedImages.size;
    }

    // 检测图片尺寸并筛选
    async detectAndFilterImages(imageUrls, options = {}) {
        const {
            minWidth = 800,   // 最小宽度800px
            minHeight = 800,  // 最小高度800px
            maxWidth = 10000, // 最大尺寸要求很高
            maxHeight = 10000,
            targetWidth = 800,
            targetHeight = 800,
            tolerance = 100
        } = options;
        
        const imageInfoList = [];
        let loadedCount = 0;
        let errorCount = 0;
        
        console.log(`开始检测 ${imageUrls.length} 张图片的尺寸...`);
        
        for (const imageUrl of imageUrls) {
            try {
                // 创建图片对象来获取尺寸
                const img = new Image();
                img.crossOrigin = 'anonymous';
                
                const imagePromise = new Promise((resolve) => {
                    img.onload = () => {
                        const width = img.width;
                        const height = img.height;
                        
                        // 检查尺寸是否在范围内
                        const isInRange = width >= minWidth && width <= maxWidth && 
                                         height >= minHeight && height <= maxHeight;
                        
                        // 检查是否接近目标尺寸
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


    // 清理资源
    destroy() {
        if (this.imageObserver) {
            this.imageObserver.disconnect();
            this.imageObserver = null;
        }
        this.collectedImages.clear();
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageCollector;
} else {
    window.ImageCollector = ImageCollector;
}
