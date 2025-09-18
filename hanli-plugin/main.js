// 主协调器 - 管理图片采集和数据采集模块
class HanliPlugin {
    constructor() {
        this.imageCollector = null;
        this.dataCollector = null;
        this.init();
    }

    // 初始化插件
    init() {
        console.log('Hanli插件初始化...');
        
        // 初始化图片采集器
        this.imageCollector = new ImageCollector();
        
        // 初始化数据采集器
        this.dataCollector = new DataCollector();
        
        // 暴露到全局，方便调试
        window.hanliPlugin = this;
        
        console.log('Hanli插件初始化完成');
    }

    // 执行完整的数据采集
    async executeCollection() {
        try {
            console.log('开始执行数据采集...');
            
            // 1. 采集JSON数据
            const rawData = await this.dataCollector.scrapeRawData();
            if (!rawData) {
                console.error('JSON数据采集失败');
                return;
            }
            
            // 2. 处理商品信息数据
            const goodsInfoData = this.dataCollector.processGoodsInfoData(rawData);
            if (!goodsInfoData) {
                console.error('商品信息数据处理失败');
                return;
            }
            
            // 3. 处理监控数据
            const monitoringData = this.dataCollector.processMonitoringData(rawData);
            if (!monitoringData) {
                console.error('监控数据处理失败');
                return;
            }
            
            // 4. 收集页面图片
            this.imageCollector.triggerCollection();
            const pageImages = this.imageCollector.getAllImages();
            console.log('页面收集到的图片数量:', pageImages.length);
            
            // 5. 合并所有图片源
            let allImages = [...goodsInfoData.allImages, ...pageImages];
            allImages = [...new Set(allImages)]; // 去重
            
            console.log('=== 图片采集调试信息 ===');
            console.log('主图片数量:', goodsInfoData.allImages.length);
            console.log('页面图片数量:', pageImages.length);
            console.log('去重后总图片数量:', allImages.length);
            console.log('所有图片URLs:', allImages);
            
            // 6. 检测图片尺寸并筛选
            const imageInfoList = await this.imageCollector.detectAndFilterImages(allImages, {
                minWidth: 800,   // 最小宽度800px
                minHeight: 800,  // 最小高度800px
                maxWidth: 10000, // 最大尺寸要求很高
                maxHeight: 10000,
                targetWidth: 800,
                targetHeight: 800,
                tolerance: 100
            });
            
            console.log('所有图片检测结果:', imageInfoList);
            
            // 7. 按图片大小排序（面积从大到小）
            imageInfoList.sort((a, b) => {
                const areaA = a.width * a.height;
                const areaB = b.width * b.height;
                return areaB - areaA; // 降序排列
            });
            
            console.log('按大小排序后的图片:', imageInfoList.map(img => ({
                url: img.url,
                size: `${img.width}×${img.height}`,
                area: img.width * img.height
            })));
            
            // 8. 所有图片都已经通过800x800px筛选，直接使用
            let filteredImages = imageInfoList.map(img => img.url);
            
            console.log(`通过800×800px筛选的图片数量: ${imageInfoList.length}`);
            console.log('筛选后的图片列表:', imageInfoList.map(img => ({
                url: img.url,
                size: `${img.width}×${img.height}`,
                area: img.width * img.height
            })));
            
            console.log('筛选后图片数量:', filteredImages.length);
            console.log('筛选后图片URLs:', filteredImages);
            
            // 10. 更新商品信息数据，添加图片信息
            const finalGoodsInfoData = {
                ...goodsInfoData,
                filteredImages, // 筛选后的图片URL列表
                imageInfoList   // 包含详细尺寸信息的图片列表
            };
            
            // 11. 先发送JSON数据到hanli-app的data文件夹
            await this.sendJsonDataToApp({
                goodsInfoData: finalGoodsInfoData,
                monitoringData
            });
            
            // 12. 异步下载媒体文件（不阻塞主流程）
            this.downloadMediaFilesAsync(finalGoodsInfoData, monitoringData);
            
        } catch (error) {
            console.error('数据采集失败:', error);
            alert('数据采集失败: ' + error.message);
        }
    }

    // 发送JSON数据到hanli-app（立即返回）
    async sendJsonDataToApp(data) {
        try {
            console.log('开始发送JSON数据到hanli-app...');
            
            // 生成媒体数据
            const mediaData = this.generateMediaData(data.goodsInfoData);
            
            // 将监控数据转换为标准数组格式
            const monitoringDataArray = this.convertToMonitoringArray(data.monitoringData);
            
            // 发送JSON文件到App
            const jsonData = {
                goodsId: data.goodsInfoData.goodsId,
                collectTime: data.goodsInfoData.collectTime,
                goodsInfo: JSON.stringify(data.goodsInfoData, null, 2),
                monitoring: JSON.stringify(monitoringDataArray, null, 2),
                mediaData: JSON.stringify(mediaData, null, 2)
            };
            
            const response = await fetch('http://localhost:3001/api/save-json-files', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jsonData)
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    console.log('JSON数据已成功保存到hanli-app的data文件夹');
                    console.log('保存的文件:', result.files);
                    // JSON数据保存成功后，立即唤起App
                    this.tryOpenApp();
                } else {
                    console.error('保存JSON数据失败:', result.error);
                    alert('保存JSON数据失败：' + result.error);
                }
            } else {
                console.error('无法连接到hanli-app，状态码:', response.status);
                alert('无法连接到hanli-app，请确保应用正在运行');
            }
        } catch (error) {
            console.error('发送JSON数据到hanli-app失败:', error);
            alert('无法连接到hanli-app，请确保应用正在运行');
        }
    }

    // 将监控数据转换为标准数组格式
    convertToMonitoringArray(monitoringData) {
        if (!monitoringData) {
            return [];
        }

        // 创建标准格式的监控数据条目
        const monitoringEntry = {
            id: Date.now().toString(),
            utcTime: new Date().toISOString().replace('Z', '+08:00'),
            goodsData: {
                goodsSold: monitoringData.goodsSold || '',
                goodsPromoPrice: monitoringData.goodsPromoPrice || '',
                goodsTitle: monitoringData.goodsTitle || '',
                goodsRating: monitoringData.goodsRating || '',
                goodsReviews: monitoringData.goodsReviews || ''
            },
            storeData: {
                storeSold: monitoringData.storeSold || '',
                storeFollowers: monitoringData.storeFollowers || '',
                storeItemsNum: monitoringData.storeltemsNum || '',
                storeRating: monitoringData.storeRating || '',
                storeName: monitoringData.storeName || ''
            }
        };

        return [monitoringEntry];
    }
    
    // 异步下载媒体文件
    async downloadMediaFilesAsync(goodsInfoData, monitoringData) {
        try {
            console.log('开始异步下载媒体文件...');
            
            // 生成媒体数据
            const mediaData = this.generateMediaData(goodsInfoData);
            
            // 发送下载请求到App
            const downloadData = {
                goodsId: goodsInfoData.goodsId,
                mediaList: mediaData.media
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
                    // 可以在这里添加下载完成的提示
                    this.showDownloadCompleteNotification(result.downloadedFiles.length);
                } else {
                    console.error('媒体文件下载失败:', result.error);
                }
            } else {
                console.error('媒体文件下载请求失败，状态码:', response.status);
            }
        } catch (error) {
            console.error('异步下载媒体文件失败:', error);
        }
    }
    
    // 生成媒体数据
    generateMediaData(goodsInfoData) {
        const mediaList = [];
        
        // 添加图片数据
        if (goodsInfoData.filteredImages && goodsInfoData.filteredImages.length > 0) {
            goodsInfoData.filteredImages.forEach((url, index) => {
                const imageInfo = goodsInfoData.imageInfoList.find(img => img.url === url);
                mediaList.push({
                    url: url,
                    width: imageInfo ? imageInfo.width : 0,
                    height: imageInfo ? imageInfo.height : 0,
                    isTargetSize: imageInfo ? imageInfo.isTargetSize : false,
                    type: 'image',
                    path: null // 初始为null，下载后更新
                });
            });
        }
        
        // 添加视频数据（如果有的话）
        if (goodsInfoData.videos && goodsInfoData.videos.length > 0) {
            goodsInfoData.videos.forEach(video => {
                mediaList.push({
                    url: video.url,
                    width: video.width || 0,
                    height: video.height || 0,
                    isTargetSize: false,
                    type: 'video',
                    path: null
                });
            });
        }
        
        return {
            goodsId: goodsInfoData.goodsId,
            media: mediaList
        };
    }
    
    // 尝试打开App
    tryOpenApp() {
        try {
            console.log('JSON数据已保存到data文件夹，正在唤起App...');
            
            // 创建一个隐藏的iframe来触发协议，避免打开新标签页
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = 'hanliapp://open';
            document.body.appendChild(iframe);
            
            // 立即移除iframe
            setTimeout(() => {
                if (iframe.parentNode) {
                    iframe.parentNode.removeChild(iframe);
                }
            }, 100);
            
            // 显示toast提示
            this.showToast('App已成功唤起！', 'success');
        } catch (e) {
            console.warn('无法唤起App:', e);
            this.showToast('唤起App失败，请手动打开', 'error');
        }
    }
    
    // 显示toast提示
    showToast(message, type = 'info') {
        // 创建toast容器（如果不存在）
        let toastContainer = document.getElementById('hanli-toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'hanli-toast-container';
            toastContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
            `;
            document.body.appendChild(toastContainer);
        }
        
        // 创建toast元素
        const toast = document.createElement('div');
        toast.style.cssText = `
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: var(--radius-medium);
            margin-bottom: 10px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            pointer-events: auto;
            max-width: 300px;
            word-wrap: break-word;
        `;
        toast.textContent = message;
        
        // 添加到容器
        toastContainer.appendChild(toast);
        
        // 触发动画
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 10);
        
        // 自动移除
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    // 显示下载完成通知
    showDownloadCompleteNotification(fileCount) {
        console.log(`媒体文件下载完成，共下载 ${fileCount} 个文件`);
        this.showToast(`媒体文件下载完成！共下载 ${fileCount} 个文件`, 'success');
    }

    // 发送数据到hanli-app（保留原方法作为备用）
    async sendToHanliApp(data) {
        try {
            const response = await fetch('http://localhost:3001/api/import-goods', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    // 不显示提示，直接唤起App
                    console.log('数据已成功发送到hanli-app');
                } else {
                    alert('发送失败：' + result.error);
                }
            } else {
                alert('无法连接到hanli-app，请确保应用正在运行');
            }
        } catch (error) {
            console.error('发送数据到hanli-app失败:', error);
            alert('无法连接到hanli-app，请确保应用正在运行');
        }
    }

    // 导出JSON数据（备用功能）
    exportJSON(data) {
        let jsonStr = JSON.stringify(data, null, 2);
        let blob = new Blob([jsonStr], {type: "application/json"});

        // 文件名用商品名，去掉非法字符
        let safeTitle = (data.goodsTitleEn || "temu_product").replace(/[\\/:*?"<>|]/g, "_");
        let fileName = safeTitle + ".json";

        let url = URL.createObjectURL(blob);
        let a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    }

    // 获取图片采集器
    getImageCollector() {
        return this.imageCollector;
    }

    // 获取数据采集器
    getDataCollector() {
        return this.dataCollector;
    }

    // 清理资源
    destroy() {
        if (this.imageCollector) {
            this.imageCollector.destroy();
        }
        this.imageCollector = null;
        this.dataCollector = null;
    }
}

// 页面加载完成后启动插件
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // 延迟启动，让图片有时间加载
        setTimeout(() => {
            window.hanliPluginInstance = new HanliPlugin();
            // 不再自动执行采集，等待用户点击采集按钮
            console.log('Hanli插件已初始化，等待用户点击采集按钮');
        }, 2000);
    });
} else {
    // 页面已经加载完成
    window.hanliPluginInstance = new HanliPlugin();
    // 不再自动执行采集，等待用户点击采集按钮
    console.log('Hanli插件已初始化，等待用户点击采集按钮');
}
