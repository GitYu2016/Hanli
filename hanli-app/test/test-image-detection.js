const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

// 复制loadProductData函数用于测试
async function loadProductData(productDir) {
    try {
        const productData = {};
        
        // 读取product.json
        const productFile = path.join(productDir, 'product.json');
        if (fs.existsSync(productFile)) {
            const productContent = await fsPromises.readFile(productFile, 'utf8');
            const productInfo = JSON.parse(productContent);
            Object.assign(productData, productInfo);
        }
        
        // 读取monitoring.json
        const monitoringFile = path.join(productDir, 'monitoring.json');
        if (fs.existsSync(monitoringFile)) {
            const monitoringContent = await fsPromises.readFile(monitoringFile, 'utf8');
            const monitoringInfo = JSON.parse(monitoringContent);
            Object.assign(productData, monitoringInfo);
        }
        
        // 读取media.json
        const mediaFile = path.join(productDir, 'media.json');
        let mediaData = null;
        if (fs.existsSync(mediaFile)) {
            const mediaContent = await fsPromises.readFile(mediaFile, 'utf8');
            const mediaInfo = JSON.parse(mediaContent);
            productData.media = mediaInfo;
            mediaData = mediaInfo;
        }
        
        // 获取图片文件列表
        const files = await fsPromises.readdir(productDir);
        console.log(`[图片检测] 产品目录: ${productDir}`);
        console.log(`[图片检测] 目录中总文件数: ${files.length}`);
        
        const imageFiles = files.filter(file => 
            file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png') || file.endsWith('.gif')
        );
        
        console.log(`[图片检测] 找到图片文件数: ${imageFiles.length}`);
        if (imageFiles.length > 0) {
            console.log(`[图片检测] 图片文件列表:`, imageFiles);
        }
        
        if (imageFiles.length > 0) {
            productData.images = imageFiles.map(file => {
                // 尝试从media.json中找到对应的图片信息
                let imageInfo = {
                    filename: file,
                    url: `file://${path.resolve(productDir, file)}`,
                    localPath: path.join(productDir, file)
                };
                
                if (mediaData && mediaData.media) {
                    const mediaImage = mediaData.media.find(media => 
                        media.type === 'image' && 
                        (media.path === file || 
                         media.url.includes(file) ||
                         path.basename(media.url) === file)
                    );
                    
                    if (mediaImage) {
                        imageInfo = {
                            ...imageInfo,
                            width: mediaImage.width,
                            height: mediaImage.height,
                            isTargetSize: mediaImage.isTargetSize,
                            aspectRatio: mediaImage.aspectRatio
                        };
                    }
                }
                
                return imageInfo;
            });
        }
        
        // 获取视频文件列表
        const videoFiles = files.filter(file => 
            file.endsWith('.mp4') || file.endsWith('.avi') || file.endsWith('.mov') || file.endsWith('.webm')
        );
        
        console.log(`[视频检测] 找到视频文件数: ${videoFiles.length}`);
        if (videoFiles.length > 0) {
            console.log(`[视频检测] 视频文件列表:`, videoFiles);
        }
        
        if (videoFiles.length > 0) {
            productData.videos = videoFiles.map(file => ({
                filename: file,
                url: `file://${path.resolve(productDir, file)}`,
                localPath: path.join(productDir, file)
            }));
        }
        
        return productData;
        
    } catch (error) {
        console.error('加载产品数据失败:', error);
        throw error;
    }
}

async function testProducts() {
    const dataDir = path.join(__dirname, 'hanli-app/data');
    const goodsLibraryDir = path.join(dataDir, 'goods-library');
    
    const products = [
        '601099514703283',
        '601099515504642', 
        '601099525339350',
        '601099537814729',
        '601099546215066'
    ];

    console.log('开始测试产品图片检测...\n');

    for (const productId of products) {
        try {
            console.log(`\n=== 测试产品: ${productId} ===`);
            const productDir = path.join(goodsLibraryDir, productId);
            
            if (!fs.existsSync(productDir)) {
                console.log(`产品目录不存在: ${productDir}`);
                continue;
            }
            
            const productData = await loadProductData(productDir);
            
            console.log(`最终结果 - 图片数量: ${productData.images ? productData.images.length : 0}`);
            if (productData.images && productData.images.length > 0) {
                console.log(`第一张图片URL: ${productData.images[0].url}`);
            }
            
        } catch (error) {
            console.error(`测试产品 ${productId} 失败:`, error.message);
        }
    }
}

testProducts().catch(console.error);
