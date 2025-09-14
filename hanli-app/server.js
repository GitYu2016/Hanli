const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
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
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }
};

// 生成12位数字UUID
function generateProductId() {
    return Math.floor(100000000000 + Math.random() * 900000000000).toString();
}

// 保存JSON文件到商品文件夹
async function saveJsonFiles(goodsId, jsonData) {
    const goodsLibraryDir = path.join(dataDir, 'goods-library');
    const productDir = path.join(goodsLibraryDir, goodsId);
    await fs.mkdir(productDir, { recursive: true });
    
    const files = [];
    
    // 保存商品信息JSON
    if (jsonData.goodsInfo) {
        const goodsInfoPath = path.join(productDir, 'product.json');
        await fs.writeFile(goodsInfoPath, jsonData.goodsInfo, 'utf8');
        files.push(goodsInfoPath);
    }
    
    // 保存监控数据JSON
    if (jsonData.monitoring) {
        const monitoringPath = path.join(productDir, 'monitoring.json');
        await fs.writeFile(monitoringPath, jsonData.monitoring, 'utf8');
        files.push(monitoringPath);
    }
    
    // 保存媒体数据JSON
    if (jsonData.mediaData) {
        const mediaPath = path.join(productDir, 'media.json');
        await fs.writeFile(mediaPath, jsonData.mediaData, 'utf8');
        files.push(mediaPath);
    }
    
    return files;
}

// 下载媒体文件
async function downloadMediaFiles(goodsId, mediaList) {
    const goodsLibraryDir = path.join(dataDir, 'goods-library');
    const productDir = path.join(goodsLibraryDir, goodsId);
    
    // 确保商品目录存在
    await fs.mkdir(productDir, { recursive: true });
    
    const downloadedFiles = [];
    
    for (const media of mediaList) {
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
            await fs.writeFile(filePath, buffer);
            
            // 更新媒体数据中的路径
            media.path = path.relative(dataDir, filePath);
            downloadedFiles.push(filePath);
            
        } catch (error) {
            console.error('下载媒体文件失败:', media.url, error.message);
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
        const items = await fs.promises.readdir(goodsLibraryPath, { withFileTypes: true });
        
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
        
        const entries = await fs.readdir(goodsLibraryDir, { withFileTypes: true });
        
        for (const entry of entries) {
            if (entry.isDirectory()) {
                const productDir = path.join(goodsLibraryDir, entry.name);
                const productJsonPath = path.join(productDir, 'product.json');
                
                try {
                    const productData = await fs.readFile(productJsonPath, 'utf8');
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
            const productData = await fs.readFile(productJsonPath, 'utf8');
            product.goodsInfo = JSON.parse(productData);
        } catch (error) {
            console.warn(`读取商品信息失败: ${goodsId}`, error.message);
        }
        
        // 读取监控数据
        try {
            const monitoringData = await fs.readFile(monitoringJsonPath, 'utf8');
            product.monitoring = JSON.parse(monitoringData);
        } catch (error) {
            console.warn(`读取监控数据失败: ${goodsId}`, error.message);
        }
        
        // 读取媒体数据
        try {
            const mediaData = await fs.readFile(mediaJsonPath, 'utf8');
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

// 启动服务器
async function startServer() {
    await ensureDataDir();
    
    app.listen(PORT, () => {
        console.log(`Hanli API服务器已启动: http://localhost:${PORT}`);
        console.log(`数据存储目录: ${dataDir}`);
    });
}

module.exports = { startServer, app };
