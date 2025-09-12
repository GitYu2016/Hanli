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
                minWidth: 50,   // 最小尺寸要求很低，确保获取所有图片
                minHeight: 50,
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
            
            // 8. 筛选大于800x800px的图片
            let largeImages = imageInfoList.filter(img => img.width > 800 && img.height > 800);
            let filteredImages = largeImages.map(img => img.url);
            
            console.log(`大于800×800px的图片数量: ${largeImages.length}`);
            console.log('大尺寸图片列表:', largeImages.map(img => ({
                url: img.url,
                size: `${img.width}×${img.height}`,
                area: img.width * img.height
            })));
            
            // 9. 如果没有大尺寸图片，选择最大的几张
            if (filteredImages.length === 0 && imageInfoList.length > 0) {
                console.log('没有大于800×800px的图片，选择最大的几张');
                const topImages = imageInfoList.slice(0, Math.min(5, imageInfoList.length));
                filteredImages = topImages.map(img => img.url);
            }
            
            console.log('筛选后图片数量:', filteredImages.length);
            console.log('筛选后图片URLs:', filteredImages);
            
            // 10. 更新商品信息数据，添加图片信息
            const finalGoodsInfoData = {
                ...goodsInfoData,
                filteredImages, // 筛选后的图片URL列表
                imageInfoList   // 包含详细尺寸信息的图片列表
            };
            
            // 11. 发送数据到hanli-app
            await this.sendToHanliApp({
                goodsInfoData: finalGoodsInfoData,
                monitoringData
            });
            
        } catch (error) {
            console.error('数据采集失败:', error);
            alert('数据采集失败: ' + error.message);
        }
    }

    // 发送数据到hanli-app
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
