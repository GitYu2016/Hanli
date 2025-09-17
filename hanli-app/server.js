const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
// 移除uuid导入，使用自定义的ID生成函数

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 确保data目录存在
const dataDir = path.join(__dirname, 'data');
const ensureDataDir = async () => {
    try {
        await fsPromises.access(dataDir);
    } catch {
        await fsPromises.mkdir(dataDir, { recursive: true });
    }
};

// 生成12位数字UUID
function generateProductId() {
    return Math.floor(100000000000 + Math.random() * 900000000000).toString();
}

// 加载产品数据
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
        if (fs.existsSync(mediaFile)) {
            const mediaContent = await fsPromises.readFile(mediaFile, 'utf8');
            const mediaInfo = JSON.parse(mediaContent);
            productData.media = mediaInfo;
        }
        
        // 获取图片文件列表
        const files = await fsPromises.readdir(productDir);
        const imageFiles = files.filter(file => 
            file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png') || file.endsWith('.gif')
        );
        
        if (imageFiles.length > 0) {
            productData.images = imageFiles.map(file => ({
                filename: file,
                url: `file://${path.join(productDir, file)}`,
                localPath: path.join(productDir, file)
            }));
        }
        
        // 获取视频文件列表
        const videoFiles = files.filter(file => 
            file.endsWith('.mp4') || file.endsWith('.avi') || file.endsWith('.mov') || file.endsWith('.webm')
        );
        
        if (videoFiles.length > 0) {
            productData.videos = videoFiles.map(file => ({
                filename: file,
                url: `file://${path.join(productDir, file)}`,
                localPath: path.join(productDir, file)
            }));
        }
        
        return productData;
        
    } catch (error) {
        console.error('加载产品数据失败:', error);
        throw error;
    }
}

// 保存JSON文件到商品文件夹
async function saveJsonFiles(goodsId, jsonData) {
    const goodsLibraryDir = path.join(dataDir, 'goods-library');
    const productDir = path.join(goodsLibraryDir, goodsId);
    await fsPromises.mkdir(productDir, { recursive: true });
    
    const files = [];
    
    // 保存商品信息JSON
    if (jsonData.goodsInfo) {
        const goodsInfoPath = path.join(productDir, 'product.json');
        await fsPromises.writeFile(goodsInfoPath, jsonData.goodsInfo, 'utf8');
        files.push(goodsInfoPath);
    }
    
    // 保存监控数据JSON
    if (jsonData.monitoring) {
        const monitoringPath = path.join(productDir, 'monitoring.json');
        await fsPromises.writeFile(monitoringPath, jsonData.monitoring, 'utf8');
        files.push(monitoringPath);
    }
    
    // 保存媒体数据JSON
    if (jsonData.mediaData) {
        const mediaPath = path.join(productDir, 'media.json');
        await fsPromises.writeFile(mediaPath, jsonData.mediaData, 'utf8');
        files.push(mediaPath);
    }
    
    return files;
}

// 生成随机延迟时间（3-10秒）
function getRandomDelay() {
    const minDelay = 3000; // 3秒
    const maxDelay = 10000; // 10秒
    return Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
}

// 延迟函数
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 下载媒体文件
async function downloadMediaFiles(goodsId, mediaList) {
    const goodsLibraryDir = path.join(dataDir, 'goods-library');
    const productDir = path.join(goodsLibraryDir, goodsId);
    
    // 确保商品目录存在
    await fsPromises.mkdir(productDir, { recursive: true });
    
    const downloadedFiles = [];
    
    for (let i = 0; i < mediaList.length; i++) {
        const media = mediaList[i];
        try {
            // 使用Node.js的https模块下载文件
            const https = require('https');
            const http = require('http');
            const url = require('url');
            
            const parsedUrl = new url.URL(media.url);
            const client = parsedUrl.protocol === 'https:' ? https : http;
            
            const response = await new Promise((resolve, reject) => {
                const req = client.get(media.url, (res) => {
                    if (res.statusCode !== 200) {
                        reject(new Error(`HTTP ${res.statusCode}`));
                        return;
                    }
                    resolve(res);
                });
                req.on('error', reject);
            });
            
            const chunks = [];
            response.on('data', chunk => chunks.push(chunk));
            
            await new Promise((resolve, reject) => {
                response.on('end', resolve);
                response.on('error', reject);
            });
            
            const buffer = Buffer.concat(chunks);
            const ext = path.extname(parsedUrl.pathname) || '.jpg';
            const filename = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}${ext}`;
            
            // 直接保存到商品目录，不使用子文件夹
            const filePath = path.join(productDir, filename);
            await fsPromises.writeFile(filePath, buffer);
            
            // 更新媒体数据中的路径
            media.path = path.relative(dataDir, filePath);
            downloadedFiles.push(filePath);
            
            console.log(`成功下载文件: ${filename}`);
            
        } catch (error) {
            console.error('下载媒体文件失败:', media.url, error.message);
        }
        
        // 如果不是最后一个文件，添加随机延迟
        if (i < mediaList.length - 1) {
            const delayTime = getRandomDelay();
            console.log(`等待 ${delayTime}ms 后下载下一个文件...`);
            await delay(delayTime);
        }
    }
    
    return downloadedFiles;
}

// API路由

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Hanli API服务正常运行',
        timestamp: new Date().toISOString()
    });
});

// 获取产品总数
app.get('/api/products/count', async (req, res) => {
    try {
        const goodsLibraryPath = path.join(dataDir, 'goods-library');
        
        // 检查goods-library目录是否存在
        if (!fs.existsSync(goodsLibraryPath)) {
            return res.json({ 
                success: true, 
                count: 0 
            });
        }
        
        // 读取目录内容
        const items = await fsPromises.readdir(goodsLibraryPath, { withFileTypes: true });
        
        // 统计文件夹数量
        const folderCount = items.filter(item => item.isDirectory()).length;
        
        res.json({ 
            success: true, 
            count: folderCount 
        });
    } catch (error) {
        console.error('获取产品总数失败:', error);
        res.status(500).json({ 
            success: false, 
            error: '获取产品总数失败',
            count: 0 
        });
    }
});

// 保存JSON文件
app.post('/api/save-json-files', async (req, res) => {
    try {
        const { goodsId, goodsInfo, monitoring, mediaData, targetPath } = req.body;
        
        if (!goodsId) {
            return res.status(400).json({ 
                success: false, 
                error: '商品ID不能为空' 
            });
        }
        
        const jsonData = {
            goodsInfo,
            monitoring,
            mediaData
        };
        
        const files = await saveJsonFiles(goodsId, jsonData);
        
        res.json({
            success: true,
            message: 'JSON文件保存成功',
            files: files.map(f => path.relative(dataDir, f))
        });
        
    } catch (error) {
        console.error('保存JSON文件失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 下载媒体文件
app.post('/api/download-media', async (req, res) => {
    try {
        const { goodsId, mediaList, targetPath } = req.body;
        
        if (!goodsId || !mediaList) {
            return res.status(400).json({ 
                success: false, 
                error: '商品ID和媒体列表不能为空' 
            });
        }
        
        const downloadedFiles = await downloadMediaFiles(goodsId, mediaList);
        
        res.json({
            success: true,
            message: '媒体文件下载成功',
            downloadedFiles: downloadedFiles.map(f => path.relative(dataDir, f))
        });
        
    } catch (error) {
        console.error('下载媒体文件失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取单个产品详情
app.get('/api/products/:goodsId', async (req, res) => {
    try {
        const { goodsId } = req.params;
        
        if (!goodsId) {
            return res.status(400).json({ 
                success: false, 
                error: '商品ID不能为空' 
            });
        }
        
        const productDir = path.join(dataDir, 'goods-library', goodsId);
        
        if (!fs.existsSync(productDir)) {
            return res.status(404).json({
                success: false,
                error: '产品不存在'
            });
        }
        
        // 读取产品数据文件
        const productData = await loadProductData(productDir);
        
        res.json({
            success: true,
            product: productData
        });
        
    } catch (error) {
        console.error('获取产品详情失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 导入商品并打开详情页
app.post('/api/import-goods-and-open', async (req, res) => {
    try {
        const { goodsId, jsonFiles } = req.body;
        
        if (!goodsId) {
            return res.status(400).json({ 
                success: false, 
                error: '商品ID不能为空' 
            });
        }
        
        // 通知主进程打开商品详情页
        if (global.mainWindow) {
            global.mainWindow.webContents.send('open-product-detail', { goodsId });
        }
        
        res.json({
            success: true,
            message: '商品数据已导入，正在打开详情页',
            goodsId: goodsId
        });
        
    } catch (error) {
        console.error('导入商品失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取商品列表
app.get('/api/products', async (req, res) => {
    try {
        const products = [];
        const goodsLibraryDir = path.join(dataDir, 'goods-library');
        
        // 检查goods-library目录是否存在
        if (!fs.existsSync(goodsLibraryDir)) {
            return res.json({ success: true, products: [] });
        }
        
        const entries = await fsPromises.readdir(goodsLibraryDir, { withFileTypes: true });
        
        for (const entry of entries) {
            if (entry.isDirectory()) {
                const productDir = path.join(goodsLibraryDir, entry.name);
                const productJsonPath = path.join(productDir, 'product.json');
                
                try {
                    const productData = await fsPromises.readFile(productJsonPath, 'utf8');
                    const product = JSON.parse(productData);
                    products.push({
                        goodsId: entry.name,
                        ...product
                    });
                } catch (error) {
                    console.warn(`读取商品数据失败: ${entry.name}`, error.message);
                }
            }
        }
        
        res.json({
            success: true,
            products: products
        });
        
    } catch (error) {
        console.error('获取商品列表失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取单个商品详情
app.get('/api/products/:goodsId', async (req, res) => {
    try {
        const { goodsId } = req.params;
        const goodsLibraryDir = path.join(dataDir, 'goods-library');
        const productDir = path.join(goodsLibraryDir, goodsId);
        
        const productJsonPath = path.join(productDir, 'product.json');
        const monitoringJsonPath = path.join(productDir, 'monitoring.json');
        const mediaJsonPath = path.join(productDir, 'media.json');
        
        const product = {};
        
        // 读取商品信息
        try {
            const productData = await fsPromises.readFile(productJsonPath, 'utf8');
            product.goodsInfo = JSON.parse(productData);
        } catch (error) {
            console.warn(`读取商品信息失败: ${goodsId}`, error.message);
        }
        
        // 读取监控数据
        try {
            const monitoringData = await fsPromises.readFile(monitoringJsonPath, 'utf8');
            product.monitoring = JSON.parse(monitoringData);
        } catch (error) {
            console.warn(`读取监控数据失败: ${goodsId}`, error.message);
        }
        
        // 读取媒体数据
        try {
            const mediaData = await fsPromises.readFile(mediaJsonPath, 'utf8');
            product.mediaData = JSON.parse(mediaData);
        } catch (error) {
            console.warn(`读取媒体数据失败: ${goodsId}`, error.message);
        }
        
        res.json({
            success: true,
            product: product
        });
        
    } catch (error) {
        console.error('获取商品详情失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取产品趋势数据
app.get('/api/products/:goodsId/trend', async (req, res) => {
    try {
        const { goodsId } = req.params;
        const goodsLibraryDir = path.join(dataDir, 'goods-library');
        const productDir = path.join(goodsLibraryDir, goodsId);
        
        // 读取当前产品数据
        const productJsonPath = path.join(productDir, 'product.json');
        const monitoringJsonPath = path.join(productDir, 'monitoring.json');
        
        let product = {};
        let monitoring = {};
        
        try {
            const productData = await fsPromises.readFile(productJsonPath, 'utf8');
            product = JSON.parse(productData);
        } catch (error) {
            console.warn(`读取商品信息失败: ${goodsId}`, error.message);
        }
        
        try {
            const monitoringData = await fsPromises.readFile(monitoringJsonPath, 'utf8');
            monitoring = JSON.parse(monitoringData);
        } catch (error) {
            console.warn(`读取监控数据失败: ${goodsId}`, error.message);
        }
        
        // 合并数据
        const combinedData = { ...product, ...monitoring };
        
        // 生成趋势数据
        const trendData = generateTrendData(combinedData);
        
        res.json({
            success: true,
            trendData: trendData
        });
        
    } catch (error) {
        console.error('获取产品趋势数据失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 生成基于真实数据的趋势数据
function generateTrendData(product) {
    const data = {
        labels: [],
        sales: [],
        promoPrice: [],
        normalPrice: [],
        rating: []
    };
    
    // 获取真实数据
    const realSales = product.goodsSold || 0;
    const realPromoPrice = extractPrice(product.skuList?.[0]?.goodsPromoPrice);
    const realNormalPrice = extractPrice(product.skuList?.[0]?.goodsNormalPrice);
    const realRating = product.storeData?.storeRating || 0;
    
    // 获取采集时间
    const collectTime = product.collectTime;
    let displayDate;
    
    if (collectTime) {
        // 解析采集时间
        const collectDate = new Date(collectTime);
        displayDate = collectDate.toLocaleDateString('zh-CN', { 
            month: '2-digit', 
            day: '2-digit',
            year: '2-digit'
        });
    } else {
        // 如果没有采集时间，使用当前日期
        displayDate = new Date().toLocaleDateString('zh-CN', { 
            month: '2-digit', 
            day: '2-digit',
            year: '2-digit'
        });
    }
    
    // 只显示真实的数据点
    data.labels.push(displayDate);
    data.sales.push(realSales);
    data.promoPrice.push(realPromoPrice);
    data.normalPrice.push(realNormalPrice);
    data.rating.push(realRating);
    
    return data;
}

// 提取价格数值
function extractPrice(priceStr) {
    if (!priceStr) return 0;
    const match = priceStr.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
}

// 启动服务器
async function startServer() {
    await ensureDataDir();
    
    app.listen(PORT, () => {
        console.log(`Hanli API服务器已启动: http://localhost:${PORT}`);
        console.log(`数据存储目录: ${dataDir}`);
    });
}

module.exports = { startServer, app };
