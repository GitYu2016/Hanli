const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
const chokidar = require('chokidar');
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

// 活动记录相关变量
const activityFilePath = path.join(dataDir, 'activity.json');
let fileWatcher = null;

// 获取东八区时间
function getBeijingTime() {
    const now = new Date();
    const beijingTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    return beijingTime.toISOString();
}

// 读取活动记录
async function loadActivities() {
    try {
        if (fs.existsSync(activityFilePath)) {
            const content = await fsPromises.readFile(activityFilePath, 'utf8');
            return JSON.parse(content);
        }
        return [];
    } catch (error) {
        console.error('读取活动记录失败:', error);
        return [];
    }
}

// 保存活动记录
async function saveActivities(activities) {
    try {
        await fsPromises.writeFile(activityFilePath, JSON.stringify(activities, null, 2), 'utf8');
    } catch (error) {
        console.error('保存活动记录失败:', error);
    }
}

// 添加活动记录
async function addActivity(type, title, details = {}) {
    try {
        const activities = await loadActivities();
        const newActivity = {
            id: generateProductId(),
            type,
            title,
            details,
            time: getBeijingTime(),
            utcTime: getBeijingTime()
        };
        
        // 将新活动添加到数组开头
        activities.unshift(newActivity);
        
        // 只保留最近100条记录
        if (activities.length > 100) {
            activities.splice(100);
        }
        
        await saveActivities(activities);
        console.log('活动记录已添加:', newActivity.title);
        return newActivity;
    } catch (error) {
        console.error('添加活动记录失败:', error);
    }
}

// 启动文件监控
function startFileWatcher() {
    const goodsLibraryPath = path.join(dataDir, 'goods-library');
    
    // 确保目录存在
    if (!fs.existsSync(goodsLibraryPath)) {
        fs.mkdirSync(goodsLibraryPath, { recursive: true });
    }
    
    console.log('开始监控目录:', goodsLibraryPath);
    
    fileWatcher = chokidar.watch(goodsLibraryPath, {
        ignored: /(^|[\/\\])\../, // 忽略隐藏文件
        persistent: true,
        ignoreInitial: true, // 忽略初始扫描
        depth: 1 // 只监控一级目录
    });
    
    // 监听目录添加事件
    fileWatcher.on('addDir', async (dirPath) => {
        const dirName = path.basename(dirPath);
        console.log('检测到新目录:', dirName);
        
        // 等待一下确保目录完全创建
        setTimeout(async () => {
            try {
                // 检查是否是有效的产品目录（包含product.json）
                const productJsonPath = path.join(dirPath, 'product.json');
                if (fs.existsSync(productJsonPath)) {
                    const productContent = await fsPromises.readFile(productJsonPath, 'utf8');
                    const productInfo = JSON.parse(productContent);
                    
                    // 获取产品标题，优先级：goodsCat3 > goodsTitleEn > goodsTitle > 未知产品
                    const productTitle = productInfo.goodsCat3 || productInfo.goodsTitleEn || productInfo.goodsTitle || '未知产品';
                    await addActivity('product_added', `添加了产品: ${productTitle}`, {
                        goodsId: dirName,
                        productTitle: productTitle
                    });
                } else {
                    await addActivity('folder_added', `添加了文件夹: ${dirName}`, {
                        folderName: dirName
                    });
                }
            } catch (error) {
                console.error('处理新目录失败:', error);
                await addActivity('folder_added', `添加了文件夹: ${dirName}`, {
                    folderName: dirName
                });
            }
        }, 1000);
    });
    
    // 监听目录删除事件
    fileWatcher.on('unlinkDir', async (dirPath) => {
        const dirName = path.basename(dirPath);
        console.log('检测到目录删除:', dirName);
        
        await addActivity('folder_removed', `删除了文件夹: ${dirName}`, {
            folderName: dirName
        });
    });
    
    // 监听文件变化事件
    fileWatcher.on('change', async (filePath) => {
        const fileName = path.basename(filePath);
        const dirName = path.basename(path.dirname(filePath));
        
        if (fileName === 'product.json') {
            try {
                const productContent = await fsPromises.readFile(filePath, 'utf8');
                const productInfo = JSON.parse(productContent);
                
                // 获取产品标题，优先级：goodsCat3 > goodsTitleEn > goodsTitle > 未知产品
                const productTitle = productInfo.goodsCat3 || productInfo.goodsTitleEn || productInfo.goodsTitle || '未知产品';
                await addActivity('product_updated', `更新了产品: ${productTitle}`, {
                    goodsId: dirName,
                    productTitle: productTitle
                });
            } catch (error) {
                console.error('处理产品更新失败:', error);
            }
        } else if (fileName === 'monitoring.json') {
            await addActivity('monitoring_updated', `更新了监控数据: ${dirName}`, {
                goodsId: dirName
            });
        } else if (fileName === 'media.json') {
            await addActivity('media_updated', `更新了媒体数据: ${dirName}`, {
                goodsId: dirName
            });
        }
    });
    
    fileWatcher.on('error', error => {
        console.error('文件监控错误:', error);
    });
}

// 停止文件监控
function stopFileWatcher() {
    if (fileWatcher) {
        fileWatcher.close();
        fileWatcher = null;
        console.log('文件监控已停止');
    }
}

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
            productData.images = imageFiles.map(file => {
                // 尝试从media.json中找到对应的图片信息
                let imageInfo = {
                    filename: file,
                    url: `http://localhost:3001/api/products/${path.basename(productDir)}/image/${file}`,
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
        const mediaFileName = jsonData.useTempFile ? 'media-temp.json' : 'media.json';
        const mediaPath = path.join(productDir, mediaFileName);
        await fsPromises.writeFile(mediaPath, jsonData.mediaData, 'utf8');
        files.push(mediaPath);
    }
    
    // 保存原始JSON数据（按照rawdata_goodsId_时间命名）
    if (jsonData.rawData && jsonData.collectTime) {
        // 生成文件名：rawdata_goodsId_时间.json
        const rawDataFileName = `rawdata_${goodsId}_${jsonData.collectTime}.json`;
        const rawDataPath = path.join(productDir, rawDataFileName);
        await fsPromises.writeFile(rawDataPath, jsonData.rawData, 'utf8');
        files.push(rawDataPath);
        console.log(`原始JSON数据已保存: ${rawDataFileName}`);
    }
    
    return files;
}

// 生成随机延迟时间（2-6秒）
function getRandomDelay() {
    const minDelay = 2000; // 2秒
    const maxDelay = 6000; // 6秒
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

// 检查本地已存在的媒体文件
async function checkExistingMediaFiles(goodsId, mediaUrls) {
    try {
        const productDir = path.join(dataDir, 'goods-library', goodsId);
        const mediaJsonPath = path.join(productDir, 'media.json');
        
        // 如果商品目录不存在，返回空数组
        if (!fs.existsSync(productDir)) {
            console.log(`商品目录不存在: ${productDir}`);
            return [];
        }
        
        // 如果media.json文件不存在，返回空数组
        if (!fs.existsSync(mediaJsonPath)) {
            console.log(`media.json文件不存在: ${mediaJsonPath}`);
            return [];
        }
        
        // 读取media.json文件
        const mediaJsonContent = await fsPromises.readFile(mediaJsonPath, 'utf8');
        let mediaData;
        
        try {
            mediaData = JSON.parse(mediaJsonContent);
        } catch (parseError) {
            console.error('解析media.json失败:', parseError);
            return [];
        }
        
        // 提取已存在的媒体文件URL
        const existingUrls = [];
        if (mediaData && mediaData.media && Array.isArray(mediaData.media)) {
            mediaData.media.forEach(media => {
                if (media.url && mediaUrls.includes(media.url)) {
                    existingUrls.push(media.url);
                }
            });
        }
        
        console.log(`商品 ${goodsId} 检查结果: 已存在 ${existingUrls.length} 个媒体文件`);
        return existingUrls;
        
    } catch (error) {
        console.error('检查本地媒体文件时出错:', error);
        return [];
    }
}

// 比较media-temp.json和media.json，找出新增的媒体文件
async function compareMediaFilesAndGetNewUrls(goodsId) {
    try {
        const productDir = path.join(dataDir, 'goods-library', goodsId);
        const mediaTempPath = path.join(productDir, 'media-temp.json');
        const mediaJsonPath = path.join(productDir, 'media.json');
        
        // 如果商品目录不存在，返回空数组
        if (!fs.existsSync(productDir)) {
            console.log(`商品目录不存在: ${productDir}`);
            return { newUrls: [], newMediaList: [] };
        }
        
        // 如果media-temp.json文件不存在，返回空数组
        if (!fs.existsSync(mediaTempPath)) {
            console.log(`media-temp.json文件不存在: ${mediaTempPath}`);
            return { newUrls: [], newMediaList: [] };
        }
        
        // 读取media-temp.json文件
        const mediaTempContent = await fsPromises.readFile(mediaTempPath, 'utf8');
        let tempMediaData;
        
        try {
            tempMediaData = JSON.parse(mediaTempContent);
        } catch (parseError) {
            console.error('解析media-temp.json失败:', parseError);
            return { newUrls: [], newMediaList: [] };
        }
        
        // 如果media.json文件不存在，所有temp中的媒体都是新的
        if (!fs.existsSync(mediaJsonPath)) {
            console.log(`media.json文件不存在，所有媒体都是新的`);
            const newMediaList = tempMediaData.media || [];
            const newUrls = newMediaList.map(media => media.url).filter(url => url);
            return { newUrls, newMediaList };
        }
        
        // 读取media.json文件
        const mediaJsonContent = await fsPromises.readFile(mediaJsonPath, 'utf8');
        let existingMediaData;
        
        try {
            existingMediaData = JSON.parse(mediaJsonContent);
        } catch (parseError) {
            console.error('解析media.json失败:', parseError);
            return { newUrls: [], newMediaList: [] };
        }
        
        // 获取已存在的URL集合
        const existingUrls = new Set();
        if (existingMediaData && existingMediaData.media && Array.isArray(existingMediaData.media)) {
            existingMediaData.media.forEach(media => {
                if (media.url) {
                    existingUrls.add(media.url);
                }
            });
        }
        
        // 找出新增的媒体文件
        const newMediaList = [];
        const newUrls = [];
        
        if (tempMediaData && tempMediaData.media && Array.isArray(tempMediaData.media)) {
            tempMediaData.media.forEach(media => {
                if (media.url && !existingUrls.has(media.url)) {
                    newMediaList.push(media);
                    newUrls.push(media.url);
                }
            });
        }
        
        console.log(`商品 ${goodsId} 比较结果: 新增 ${newUrls.length} 个媒体文件`);
        return { newUrls, newMediaList };
        
    } catch (error) {
        console.error('比较媒体文件时出错:', error);
        return { newUrls: [], newMediaList: [] };
    }
}

// 合并新下载的媒体信息到media.json
async function mergeMediaFiles(goodsId, downloadedMedia) {
    try {
        const productDir = path.join(dataDir, 'goods-library', goodsId);
        const mediaTempPath = path.join(productDir, 'media-temp.json');
        const mediaJsonPath = path.join(productDir, 'media.json');
        
        // 如果商品目录不存在，返回错误
        if (!fs.existsSync(productDir)) {
            throw new Error(`商品目录不存在: ${productDir}`);
        }
        
        // 如果media-temp.json文件不存在，返回错误
        if (!fs.existsSync(mediaTempPath)) {
            throw new Error(`media-temp.json文件不存在: ${mediaTempPath}`);
        }
        
        // 读取media-temp.json文件
        const mediaTempContent = await fsPromises.readFile(mediaTempPath, 'utf8');
        let tempMediaData;
        
        try {
            tempMediaData = JSON.parse(mediaTempContent);
        } catch (parseError) {
            throw new Error('解析media-temp.json失败: ' + parseError.message);
        }
        
        // 更新下载的媒体文件路径信息
        if (downloadedMedia && Array.isArray(downloadedMedia)) {
            const downloadedPaths = new Map();
            downloadedMedia.forEach(media => {
                if (media.url && media.path) {
                    downloadedPaths.set(media.url, media.path);
                }
            });
            
            // 更新temp数据中的路径信息
            if (tempMediaData.media && Array.isArray(tempMediaData.media)) {
                tempMediaData.media.forEach(media => {
                    if (media.url && downloadedPaths.has(media.url)) {
                        media.path = downloadedPaths.get(media.url);
                    }
                });
            }
        }
        
        // 如果media.json文件不存在，直接重命名temp文件
        if (!fs.existsSync(mediaJsonPath)) {
            await fsPromises.rename(mediaTempPath, mediaJsonPath);
            console.log(`商品 ${goodsId} 媒体文件合并完成: 重命名temp文件`);
            return { mergedCount: tempMediaData.media ? tempMediaData.media.length : 0, totalCount: tempMediaData.media ? tempMediaData.media.length : 0 };
        }
        
        // 读取现有的media.json文件
        const mediaJsonContent = await fsPromises.readFile(mediaJsonPath, 'utf8');
        let existingMediaData;
        
        try {
            existingMediaData = JSON.parse(mediaJsonContent);
        } catch (parseError) {
            throw new Error('解析media.json失败: ' + parseError.message);
        }
        
        // 合并媒体数据
        const existingUrls = new Set();
        if (existingMediaData.media && Array.isArray(existingMediaData.media)) {
            existingMediaData.media.forEach(media => {
                if (media.url) {
                    existingUrls.add(media.url);
                }
            });
        }
        
        let mergedCount = 0;
        if (tempMediaData.media && Array.isArray(tempMediaData.media)) {
            tempMediaData.media.forEach(media => {
                if (media.url && !existingUrls.has(media.url)) {
                    existingMediaData.media.push(media);
                    mergedCount++;
                }
            });
        }
        
        // 保存合并后的media.json
        await fsPromises.writeFile(mediaJsonPath, JSON.stringify(existingMediaData, null, 2), 'utf8');
        
        // 删除临时文件
        await fsPromises.unlink(mediaTempPath);
        
        console.log(`商品 ${goodsId} 媒体文件合并完成: 新增 ${mergedCount} 个媒体文件`);
        return { mergedCount, totalCount: existingMediaData.media ? existingMediaData.media.length : 0 };
        
    } catch (error) {
        console.error('合并媒体文件时出错:', error);
        throw error;
    }
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

// 获取今日采集数量
app.get('/api/products/today-collect', async (req, res) => {
    try {
        const goodsLibraryPath = path.join(dataDir, 'goods-library');
        
        // 检查goods-library目录是否存在
        if (!fs.existsSync(goodsLibraryPath)) {
            return res.json({ 
                success: true, 
                count: 0 
            });
        }
        
        // 获取今天的日期（东八区）
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD格式
        
        // 读取所有商品目录
        const items = await fsPromises.readdir(goodsLibraryPath, { withFileTypes: true });
        const productDirs = items.filter(item => item.isDirectory());
        
        let todayCollectCount = 0;
        
        // 遍历每个商品目录，检查product.json中的collectTime
        for (const productDir of productDirs) {
            const productPath = path.join(goodsLibraryPath, productDir.name);
            const productJsonPath = path.join(productPath, 'product.json');
            
            if (fs.existsSync(productJsonPath)) {
                try {
                    const productContent = await fsPromises.readFile(productJsonPath, 'utf8');
                    const productData = JSON.parse(productContent);
                    
                    // 检查collectTime是否为今天
                    if (productData.collectTime) {
                        const collectDate = new Date(productData.collectTime);
                        const collectDateStr = collectDate.toISOString().split('T')[0];
                        
                        if (collectDateStr === todayStr) {
                            todayCollectCount++;
                        }
                    }
                } catch (error) {
                    console.warn(`读取商品信息失败 ${productDir.name}:`, error);
                }
            }
        }
        
        res.json({ 
            success: true, 
            count: todayCollectCount,
            date: todayStr
        });
    } catch (error) {
        console.error('获取今日采集数量失败:', error);
        res.status(500).json({ 
            success: false, 
            error: '获取今日采集数量失败',
            count: 0 
        });
    }
});

// 保存JSON文件
app.post('/api/save-json-files', async (req, res) => {
    try {
        const { goodsId, goodsInfo, monitoring, mediaData, rawData, collectTime, targetPath, useTempFile } = req.body;
        
        if (!goodsId) {
            return res.status(400).json({ 
                success: false, 
                error: '商品ID不能为空' 
            });
        }
        
        const jsonData = {
            goodsInfo,
            monitoring,
            mediaData,
            rawData,
            collectTime,
            useTempFile: useTempFile || false
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

// 检查本地已存在的媒体文件
app.post('/api/check-existing-media', async (req, res) => {
    try {
        const { goodsId, mediaUrls } = req.body;
        
        if (!goodsId || !mediaUrls) {
            return res.status(400).json({ 
                success: false, 
                error: '商品ID和媒体URL列表不能为空' 
            });
        }
        
        const existingUrls = await checkExistingMediaFiles(goodsId, mediaUrls);
        
        res.json({
            success: true,
            message: '本地媒体文件检查完成',
            existingUrls: existingUrls,
            existingCount: existingUrls.length,
            totalChecked: mediaUrls.length
        });
        
    } catch (error) {
        console.error('检查本地媒体文件失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 比较media-temp.json和media.json，获取新增的媒体文件
app.post('/api/compare-media-files', async (req, res) => {
    try {
        const { goodsId } = req.body;
        
        if (!goodsId) {
            return res.status(400).json({ 
                success: false, 
                error: '商品ID不能为空' 
            });
        }
        
        const { newUrls, newMediaList } = await compareMediaFilesAndGetNewUrls(goodsId);
        
        res.json({
            success: true,
            message: '媒体文件比较完成',
            newUrls: newUrls,
            newMediaList: newMediaList,
            newCount: newUrls.length
        });
        
    } catch (error) {
        console.error('比较媒体文件失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 合并新下载的媒体信息到media.json
app.post('/api/merge-media-files', async (req, res) => {
    try {
        const { goodsId, downloadedMedia } = req.body;
        
        if (!goodsId) {
            return res.status(400).json({ 
                success: false, 
                error: '商品ID不能为空' 
            });
        }
        
        const result = await mergeMediaFiles(goodsId, downloadedMedia);
        
        res.json({
            success: true,
            message: '媒体文件合并完成',
            mergedCount: result.mergedCount,
            totalCount: result.totalCount
        });
        
    } catch (error) {
        console.error('合并媒体文件失败:', error);
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
            return res.json({ 
                success: true, 
                products: [],
                pagination: {
                    totalItems: 0,
                    totalPages: 0,
                    currentPage: 1,
                    itemsPerPage: 100
                }
            });
        }
        
        const entries = await fsPromises.readdir(goodsLibraryDir, { withFileTypes: true });
        
        for (const entry of entries) {
            if (entry.isDirectory()) {
                const productDir = path.join(goodsLibraryDir, entry.name);
                
                try {
                    // 使用loadProductData函数加载完整的产品数据，包括图片
                    const productData = await loadProductData(productDir);
                    
                    // 确保goodsId存在
                    if (!productData.goodsId) {
                        productData.goodsId = entry.name;
                    }
                    
                    products.push(productData);
                } catch (error) {
                    console.warn(`读取商品数据失败: ${entry.name}`, error.message);
                }
            }
        }
        
        // 获取分页参数
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = parseInt(req.query.itemsPerPage) || 100;
        const sortField = req.query.sortField || 'collectTime';
        const sortOrder = req.query.sortOrder || 'desc';
        const totalItems = products.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        // 排序产品
        products.sort((a, b) => {
            let aVal = getSortValue(a, sortField);
            let bVal = getSortValue(b, sortField);
            
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        
        // 如果请求分页数据，则进行分页处理
        let paginatedProducts = products;
        if (req.query.page || req.query.itemsPerPage) {
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            paginatedProducts = products.slice(startIndex, endIndex);
        }
        
        res.json({
            success: true,
            products: paginatedProducts,
            pagination: {
                totalItems: totalItems,
                totalPages: totalPages,
                currentPage: page,
                itemsPerPage: itemsPerPage
            }
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

// 获取排序值
function getSortValue(product, field) {
    switch (field) {
        case 'goodsTitle':
            return product.goodsCat3 || product.goodsTitleEn || product.goodsTitle || '';
        case 'goodsCat2':
            return product.goodsCat2 || '';
        case 'totalSales':
            return getTotalSalesValue(product);
        case 'collectTime':
            return new Date(product.collectTime || 0);
        default:
            return '';
    }
}

// 获取总销量数值（用于排序）
function getTotalSalesValue(product) {
    if (product.monitoringData && product.monitoringData.length > 0) {
        const latestData = product.monitoringData[product.monitoringData.length - 1];
        if (latestData.goodsData && latestData.goodsData.goodsSold) {
            // 提取数字部分，去掉"件"等文字
            const salesText = latestData.goodsData.goodsSold;
            const match = salesText.match(/(\d+)/);
            return match ? parseInt(match[1]) : 0;
        }
    }
    return 0;
}

// 获取产品附件列表
app.get('/api/products/:goodsId/attachments', async (req, res) => {
    try {
        const { goodsId } = req.params;
        const goodsLibraryDir = path.join(dataDir, 'goods-library');
        const productDir = path.join(goodsLibraryDir, goodsId);
        
        // 检查产品目录是否存在
        if (!fs.existsSync(productDir)) {
            return res.status(404).json({ 
                error: '产品目录不存在',
                attachments: []
            });
        }
        
        // 读取目录下的所有文件
        const files = await fsPromises.readdir(productDir);
        
        // 过滤出JSON和PDF文件
        const attachments = [];
        for (const file of files) {
            const filePath = path.join(productDir, file);
            const stats = await fsPromises.stat(filePath);
            
            // 只处理文件，跳过目录
            if (stats.isFile()) {
                const ext = path.extname(file).toLowerCase();
                if (ext === '.json' || ext === '.pdf') {
                    attachments.push({
                        name: file,
                        type: ext === '.json' ? 'JSON文件' : 'PDF文件',
                        size: stats.size,
                        modified: stats.mtime,
                        path: filePath
                    });
                }
            }
        }
        
        // 按修改时间排序，最新的在前
        attachments.sort((a, b) => b.modified - a.modified);
        
        res.json({
            success: true,
            attachments: attachments
        });
        
    } catch (error) {
        console.error('获取附件列表失败:', error);
        res.status(500).json({ 
            error: '获取附件列表失败',
            attachments: []
        });
    }
});

// 读取文件内容
app.get('/api/products/:goodsId/file/:fileName', async (req, res) => {
    try {
        const { goodsId, fileName } = req.params;
        const goodsLibraryDir = path.join(dataDir, 'goods-library');
        const productDir = path.join(goodsLibraryDir, goodsId);
        const filePath = path.join(productDir, fileName);
        
        // 检查产品目录是否存在
        if (!fs.existsSync(productDir)) {
            return res.status(404).json({ 
                error: '产品目录不存在'
            });
        }
        
        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ 
                error: '文件不存在'
            });
        }
        
        // 检查文件扩展名，只允许JSON和PDF
        const ext = path.extname(fileName).toLowerCase();
        if (ext !== '.json' && ext !== '.pdf') {
            return res.status(400).json({ 
                error: '不支持的文件类型'
            });
        }
        
        // 读取文件内容
        if (ext === '.json') {
            const content = await fsPromises.readFile(filePath, 'utf8');
            res.json({
                success: true,
                content: content,
                fileName: fileName
            });
        } else {
            // PDF文件返回文件流
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
        }
        
    } catch (error) {
        console.error('读取文件失败:', error);
        res.status(500).json({ 
            error: '读取文件失败'
        });
    }
});

// 图片服务路由
app.get('/api/products/:goodsId/image/:fileName', async (req, res) => {
    try {
        const { goodsId, fileName } = req.params;
        const goodsLibraryDir = path.join(dataDir, 'goods-library');
        const productDir = path.join(goodsLibraryDir, goodsId);
        const imagePath = path.join(productDir, fileName);
        
        // 检查产品目录是否存在
        if (!fs.existsSync(productDir)) {
            return res.status(404).json({ 
                error: '产品目录不存在'
            });
        }
        
        // 检查图片文件是否存在
        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({ 
                error: '图片文件不存在'
            });
        }
        
        // 检查文件扩展名，只允许图片格式
        const ext = path.extname(fileName).toLowerCase();
        if (!['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
            return res.status(400).json({ 
                error: '不支持的文件格式'
            });
        }
        
        // 设置正确的Content-Type
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };
        
        res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
        res.setHeader('Cache-Control', 'public, max-age=3600'); // 缓存1小时
        
        // 直接发送文件
        res.sendFile(imagePath);
        
    } catch (error) {
        console.error('图片服务错误:', error);
        res.status(500).json({ 
            error: '服务器内部错误'
        });
    }
});

// 获取最近活动
app.get('/api/activities/recent', async (req, res) => {
    try {
        const activities = await loadActivities();
        
        // 只返回最近5个活动
        const recentActivities = activities.slice(0, 5);
        
        res.json({ 
            success: true, 
            activities: recentActivities
        });
    } catch (error) {
        console.error('获取最近活动失败:', error);
        res.status(500).json({ 
            success: false, 
            error: '获取最近活动失败',
            activities: []
        });
    }
});

// 获取所有活动
app.get('/api/activities', async (req, res) => {
    try {
        const activities = await loadActivities();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        
        const paginatedActivities = activities.slice(offset, offset + limit);
        
        res.json({ 
            success: true, 
            activities: paginatedActivities,
            total: activities.length,
            page,
            limit
        });
    } catch (error) {
        console.error('获取活动列表失败:', error);
        res.status(500).json({ 
            success: false, 
            error: '获取活动列表失败',
            activities: []
        });
    }
});

// 添加活动（用于手动添加）
app.post('/api/activities', async (req, res) => {
    try {
        const { type, title, details } = req.body;
        
        if (!type || !title) {
            return res.status(400).json({
                success: false,
                error: '缺少必要参数: type 和 title'
            });
        }
        
        const activity = await addActivity(type, title, details);
        
        res.json({ 
            success: true, 
            activity
        });
    } catch (error) {
        console.error('添加活动失败:', error);
        res.status(500).json({ 
            success: false, 
            error: '添加活动失败'
        });
    }
});

// 扫描所有产品的collectUrl
app.get('/api/monitor/scan-urls', async (req, res) => {
    try {
        const goodsLibraryDir = path.join(dataDir, 'goods-library');
        const urls = [];
        
        // 检查goods-library目录是否存在
        if (!fs.existsSync(goodsLibraryDir)) {
            return res.json({ 
                success: true, 
                urls: [],
                count: 0,
                message: '没有找到产品数据'
            });
        }
        
        // 读取所有产品目录
        const entries = await fsPromises.readdir(goodsLibraryDir, { withFileTypes: true });
        
        for (const entry of entries) {
            if (entry.isDirectory()) {
                const productDir = path.join(goodsLibraryDir, entry.name);
                const productJsonPath = path.join(productDir, 'product.json');
                
                try {
                    // 读取product.json文件
                    if (fs.existsSync(productJsonPath)) {
                        const productData = await fsPromises.readFile(productJsonPath, 'utf8');
                        const product = JSON.parse(productData);
                        
                        // 检查是否有collectUrl
                        if (product.collectUrl) {
                            urls.push({
                                goodsId: entry.name,
                                collectUrl: product.collectUrl,
                                goodsTitle: product.goodsTitleEn || product.goodsTitleCn || '未知商品'
                            });
                        }
                    }
                } catch (error) {
                    console.warn(`读取产品数据失败: ${entry.name}`, error.message);
                }
            }
        }
        
        res.json({
            success: true,
            urls: urls,
            count: urls.length,
            message: `成功扫描到 ${urls.length} 个URL`
        });
        
    } catch (error) {
        console.error('扫描URL失败:', error);
        res.status(500).json({
            success: false,
            error: '扫描URL失败',
            urls: [],
            count: 0
        });
    }
});

// 保存监控数据
app.post('/api/monitor/save-data', async (req, res) => {
    try {
        const { goodsId, monitoringData } = req.body;
        
        if (!goodsId || !monitoringData) {
            return res.status(400).json({ 
                success: false, 
                error: '商品ID和监控数据不能为空' 
            });
        }

        // 验证商品ID格式（12位数字）
        if (!/^\d{12}$/.test(goodsId)) {
            return res.status(400).json({
                success: false,
                error: '商品ID格式不正确，应为12位数字'
            });
        }

        // 验证监控数据格式
        if (!monitoringData.timestamp || !monitoringData.goodsData || !monitoringData.storeData) {
            return res.status(400).json({
                success: false,
                error: '监控数据格式不正确，缺少必要字段'
            });
        }

        // 验证时间戳格式
        const timestampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
        if (!timestampRegex.test(monitoringData.timestamp)) {
            return res.status(400).json({
                success: false,
                error: '时间戳格式不正确，应为YYYY-MM-DDTHH:mm:ss格式'
            });
        }

        // 验证商品数据
        if (typeof monitoringData.goodsData.goodsSold !== 'number' || 
            typeof monitoringData.goodsData.goodsPromoPrice !== 'number') {
            return res.status(400).json({
                success: false,
                error: '商品数据格式不正确'
            });
        }

        // 验证店铺数据
        const storeData = monitoringData.storeData;
        if (typeof storeData.storeSold !== 'number' || 
            typeof storeData.storeFollowers !== 'number' || 
            typeof storeData.storeltemsNum !== 'number' || 
            typeof storeData.storeRating !== 'number' ||
            typeof storeData.storeStartYear !== 'number') {
            return res.status(400).json({
                success: false,
                error: '店铺数据格式不正确'
            });
        }
        
        const goodsLibraryDir = path.join(dataDir, 'goods-library');
        const productDir = path.join(goodsLibraryDir, goodsId);
        
        // 确保产品目录存在
        if (!fs.existsSync(productDir)) {
            await fsPromises.mkdir(productDir, { recursive: true });
        }
        
        // 保存monitoring.json文件 - 时间序列追加模式
        const monitoringPath = path.join(productDir, 'monitoring.json');
        
        // 读取现有数据
        let existingData = [];
        if (fs.existsSync(monitoringPath)) {
            try {
                const existingContent = await fsPromises.readFile(monitoringPath, 'utf8');
                existingData = JSON.parse(existingContent);
                if (!Array.isArray(existingData)) {
                    existingData = [];
                }
            } catch (error) {
                console.warn(`读取现有监控数据失败: ${goodsId}`, error.message);
                existingData = [];
            }
        }
        
        // 追加新数据
        existingData.push(monitoringData);
        
        // 按时间戳排序（最新的在前）
        existingData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // 限制历史数据数量（保留最近100条记录）
        if (existingData.length > 100) {
            existingData = existingData.slice(0, 100);
        }
        
        await fsPromises.writeFile(monitoringPath, JSON.stringify(existingData, null, 2), 'utf8');
        
        console.log(`监控数据已保存: ${goodsId}`);
        
        res.json({
            success: true,
            message: '监控数据保存成功',
            filePath: monitoringPath
        });
        
    } catch (error) {
        console.error('保存监控数据失败:', error);
        res.status(500).json({
            success: false,
            error: '保存监控数据失败: ' + error.message
        });
    }
});

// 更新监控数据
app.post('/api/monitor/update-data', async (req, res) => {
    try {
        console.log('开始更新监控数据...');
        
        const goodsLibraryDir = path.join(dataDir, 'goods-library');
        
        // 检查商品库目录是否存在
        if (!fs.existsSync(goodsLibraryDir)) {
            return res.json({
                success: true,
                message: '商品库目录不存在，无需更新',
                updatedCount: 0
            });
        }
        
        // 获取所有商品目录
        const productDirs = await fsPromises.readdir(goodsLibraryDir);
        const validProductDirs = productDirs.filter(dir => {
            // 检查是否为12位数字目录
            return /^\d{12}$/.test(dir) && fs.statSync(path.join(goodsLibraryDir, dir)).isDirectory();
        });
        
        if (validProductDirs.length === 0) {
            return res.json({
                success: true,
                message: '没有找到有效的商品目录',
                updatedCount: 0
            });
        }
        
        let updatedCount = 0;
        const errors = [];
        
        // 遍历每个商品目录，更新监控数据
        for (const goodsId of validProductDirs) {
            try {
                const productDir = path.join(goodsLibraryDir, goodsId);
                const monitoringPath = path.join(productDir, 'monitoring.json');
                
                // 检查监控数据文件是否存在
                if (!fs.existsSync(monitoringPath)) {
                    console.log(`商品 ${goodsId} 没有监控数据文件，跳过`);
                    continue;
                }
                
                // 读取现有监控数据
                const existingContent = await fsPromises.readFile(monitoringPath, 'utf8');
                let existingData = JSON.parse(existingContent);
                
                if (!Array.isArray(existingData) || existingData.length === 0) {
                    console.log(`商品 ${goodsId} 监控数据为空，跳过`);
                    continue;
                }
                
                // 获取最新的监控数据
                const latestData = existingData[0];
                
                // 生成新的时间戳（当前时间）
                const newTimestamp = new Date().toLocaleString('sv-SE', {
                    timeZone: 'Asia/Shanghai'
                }).replace(' ', 'T');
                
                // 创建新的监控数据（保持相同的数据，只更新时间戳）
                const newMonitoringData = {
                    ...latestData,
                    timestamp: newTimestamp
                };
                
                // 将新数据添加到数组开头
                existingData.unshift(newMonitoringData);
                
                // 限制历史数据数量（保留最近100条记录）
                if (existingData.length > 100) {
                    existingData = existingData.slice(0, 100);
                }
                
                // 保存更新后的数据
                await fsPromises.writeFile(monitoringPath, JSON.stringify(existingData, null, 2), 'utf8');
                
                console.log(`商品 ${goodsId} 监控数据已更新`);
                updatedCount++;
                
            } catch (error) {
                console.error(`更新商品 ${goodsId} 监控数据失败:`, error);
                errors.push(`商品 ${goodsId}: ${error.message}`);
            }
        }
        
        console.log(`监控数据更新完成，共更新 ${updatedCount} 个商品`);
        
        res.json({
            success: true,
            message: `监控数据更新完成`,
            updatedCount: updatedCount,
            totalProducts: validProductDirs.length,
            errors: errors.length > 0 ? errors : undefined
        });
        
    } catch (error) {
        console.error('更新监控数据失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 处理插件采集完成通知
app.post('/api/monitor/collection-completed', async (req, res) => {
    try {
        const { goodsId, success, monitoringData, error } = req.body;
        
        console.log('收到插件采集完成通知:', { goodsId, success, error });
        
        if (success && monitoringData) {
            // 验证商品ID格式
            if (!/^\d{12}$/.test(goodsId)) {
                return res.status(400).json({
                    success: false,
                    error: '商品ID格式不正确，应为12位数字'
                });
            }
            
            // 验证监控数据格式
            if (!monitoringData.timestamp || !monitoringData.goodsData || !monitoringData.storeData) {
                return res.status(400).json({
                    success: false,
                    error: '监控数据格式不正确，缺少必要字段'
                });
            }
            
            // 保存监控数据
            const productDir = path.join(dataDir, 'goods-library', goodsId);
            await fsPromises.mkdir(productDir, { recursive: true });
            
            const monitoringPath = path.join(productDir, 'monitoring.json');
            let existingData = [];
            
            // 读取现有数据
            if (fs.existsSync(monitoringPath)) {
                try {
                    const existingContent = await fsPromises.readFile(monitoringPath, 'utf8');
                    existingData = JSON.parse(existingContent);
                    if (!Array.isArray(existingData)) {
                        existingData = [];
                    }
                } catch (error) {
                    console.warn('读取现有监控数据失败，将创建新文件:', error.message);
                    existingData = [];
                }
            }
            
            // 追加新数据
            existingData.push(monitoringData);
            
            // 按时间戳排序（最新的在前）
            existingData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            // 限制历史数据数量（保留最近100条记录）
            if (existingData.length > 100) {
                existingData = existingData.slice(0, 100);
            }
            
            // 写入文件
            await fsPromises.writeFile(monitoringPath, JSON.stringify(existingData, null, 2), 'utf8');
            
            console.log(`监控数据已保存: ${goodsId}`);
        }
        
        res.json({ success: true });
        
    } catch (error) {
        console.error('处理插件采集完成通知失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取商品清单
app.get('/api/monitor/get-products-list', async (req, res) => {
    try {
        const goodsLibraryDir = path.join(dataDir, 'goods-library');
        
        if (!fs.existsSync(goodsLibraryDir)) {
            return res.json({ success: true, products: [] });
        }
        
        const productDirs = await fsPromises.readdir(goodsLibraryDir);
        const products = [];
        
        for (const productDir of productDirs) {
            const productPath = path.join(goodsLibraryDir, productDir);
            const stat = await fsPromises.stat(productPath);
            
            if (stat.isDirectory()) {
                // 读取product.json获取商品信息
                const productJsonPath = path.join(productPath, 'product.json');
                if (fs.existsSync(productJsonPath)) {
                    try {
                        const productContent = await fsPromises.readFile(productJsonPath, 'utf8');
                        const productData = JSON.parse(productContent);
                        
                        // 提取采集URL
                        const collectUrl = productData.collectUrl || productData.url || '';
                        if (collectUrl) {
                            products.push({
                                goodsId: productDir,
                                title: productData.goodsTitleCn || productData.goodsTitleEn || productData.title || '未知商品',
                                collectUrl: collectUrl,
                                status: 'pending',
                                progress: '等待中...'
                            });
                        }
                    } catch (error) {
                        console.error(`读取商品信息失败 ${productDir}:`, error);
                    }
                }
            }
        }
        
        console.log(`获取到 ${products.length} 个商品`);
        res.json({ success: true, products: products });
    } catch (error) {
        console.error('获取商品清单失败:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 获取所有分类
app.get('/api/categories', async (req, res) => {
    try {
        const goodsLibraryDir = path.join(dataDir, 'goods-library');
        
        if (!fs.existsSync(goodsLibraryDir)) {
            return res.json({ 
                success: true, 
                categories: [],
                message: '没有找到产品数据'
            });
        }
        
        const categorySet = new Set();
        const entries = await fsPromises.readdir(goodsLibraryDir, { withFileTypes: true });
        
        for (const entry of entries) {
            if (entry.isDirectory()) {
                const productDir = path.join(goodsLibraryDir, entry.name);
                const productJsonPath = path.join(productDir, 'product.json');
                
                try {
                    if (fs.existsSync(productJsonPath)) {
                        const productData = await fsPromises.readFile(productJsonPath, 'utf8');
                        const product = JSON.parse(productData);
                        
                        // 提取一级分类
                        if (product.goodsCat1) {
                            categorySet.add(product.goodsCat1);
                        }
                    }
                } catch (error) {
                    console.warn(`读取产品数据失败: ${entry.name}`, error.message);
                }
            }
        }
        
        const categories = Array.from(categorySet).sort();
        
        res.json({
            success: true,
            categories: categories,
            count: categories.length,
            message: `成功获取 ${categories.length} 个分类`
        });
        
    } catch (error) {
        console.error('获取分类失败:', error);
        res.status(500).json({ 
            success: false, 
            error: '获取分类失败',
            message: error.message
        });
    }
});

// 获取monitoring.json数据
app.get('/api/monitor/get-monitoring-data', async (req, res) => {
    try {
        const { goodsId } = req.query;
        
        if (!goodsId) {
            return res.status(400).json({
                success: false,
                error: '缺少goodsId参数'
            });
        }
        
        const productDir = path.join(dataDir, 'goods-library', goodsId);
        const monitoringPath = path.join(productDir, 'monitoring.json');
        
        if (!fs.existsSync(monitoringPath)) {
            return res.status(404).json({
                success: false,
                error: 'monitoring.json文件不存在'
            });
        }
        
        const content = await fsPromises.readFile(monitoringPath, 'utf8');
        const monitoringData = JSON.parse(content);
        
        res.json({
            success: true,
            monitoringData: monitoringData
        });
        
    } catch (error) {
        console.error('获取monitoring.json失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取产品监控数据 - 产品详情页专用API
app.get('/api/products/:goodsId/monitoring', async (req, res) => {
    try {
        const { goodsId } = req.params;
        
        if (!goodsId) {
            return res.status(400).json({
                success: false,
                error: '商品ID不能为空'
            });
        }
        
        const productDir = path.join(dataDir, 'goods-library', goodsId);
        const monitoringPath = path.join(productDir, 'monitoring.json');
        
        if (!fs.existsSync(monitoringPath)) {
            return res.status(404).json({
                success: false,
                error: 'monitoring.json文件不存在'
            });
        }
        
        const content = await fsPromises.readFile(monitoringPath, 'utf8');
        const monitoringData = JSON.parse(content);
        
        res.json({
            success: true,
            monitoring: monitoringData
        });
        
    } catch (error) {
        console.error('获取产品监控数据失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 更新monitoring.json数据
app.post('/api/monitor/update-monitoring-data', async (req, res) => {
    try {
        const { goodsId, monitoringData } = req.body;
        
        if (!goodsId || !monitoringData) {
            return res.status(400).json({
                success: false,
                error: '缺少必要参数'
            });
        }
        
        const productDir = path.join(dataDir, 'goods-library', goodsId);
        
        // 确保产品目录存在
        if (!fs.existsSync(productDir)) {
            await fsPromises.mkdir(productDir, { recursive: true });
        }
        
        const monitoringPath = path.join(productDir, 'monitoring.json');
        
        // 读取现有数据
        let existingData = [];
        if (fs.existsSync(monitoringPath)) {
            try {
                const existingContent = await fsPromises.readFile(monitoringPath, 'utf8');
                existingData = JSON.parse(existingContent);
                if (!Array.isArray(existingData)) {
                    existingData = [];
                }
            } catch (error) {
                console.warn(`读取现有monitoring.json失败，将创建新文件: ${error.message}`);
                existingData = [];
            }
        }
        
        // 合并数据
        let finalData;
        if (Array.isArray(monitoringData)) {
            // 如果是数组，追加到现有数据
            finalData = [...existingData, ...monitoringData];
        } else {
            // 如果是单个对象，追加到现有数据
            finalData = [...existingData, monitoringData];
        }
        
        // 限制历史记录数量（最多100条）
        if (finalData.length > 100) {
            finalData = finalData.slice(-100);
        }
        
        // 保存更新后的数据
        await fsPromises.writeFile(monitoringPath, JSON.stringify(finalData, null, 2), 'utf8');
        
        console.log(`monitoring.json已更新: ${goodsId}，新增 ${Array.isArray(monitoringData) ? monitoringData.length : 1} 条记录`);
        
        res.json({
            success: true,
            message: 'monitoring.json更新成功',
            goodsId: goodsId,
            totalRecords: finalData.length
        });
        
    } catch (error) {
        console.error('更新monitoring.json失败:', error);
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
        
        // 启动文件监控
        startFileWatcher();
    });
}

// 启动服务器
startServer();

module.exports = { startServer, app };
