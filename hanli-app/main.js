const { app, BrowserWindow, Menu, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

// 保持对窗口对象的全局引用
let mainWindow;
let httpServer;

// 创建HTTP服务器
function createHttpServer() {
  const expressApp = express();
  
  // 启用CORS
  expressApp.use(cors());
  expressApp.use(express.json());
  
  // 保存JSON文件的API
  expressApp.post('/api/save-json-files', async (req, res) => {
    try {
      console.log('💾 收到保存JSON文件请求');
      const { goodsId, collectTime, goodsInfo, monitoring, mediaData } = req.body;
      
      if (!goodsId || !collectTime) {
        console.error('❌ 缺少必要参数:', { goodsId, collectTime });
        return res.json({ success: false, error: '缺少商品ID或采集时间' });
      }
      
      console.log('📁 商品ID:', goodsId, '采集时间:', collectTime);
      
      const tempPath = path.join(__dirname, 'data', 'Temp', goodsId);
      
      // 如果临时目录已存在，先删除
      if (fs.existsSync(tempPath)) {
        console.log('🗑️ 删除已存在的临时目录:', tempPath);
        await fs.promises.rm(tempPath, { recursive: true, force: true });
      }
      
      // 创建新的临时目录
      console.log('📂 创建新的临时目录:', tempPath);
      fs.mkdirSync(tempPath, { recursive: true });
      
      // 生成文件名
      const goodsInfoFile = `goods-${goodsId}-${collectTime}.json`;
      const monitoringFile = `monitoring-${goodsId}-${collectTime}.json`;
      const mediaDataFile = `media-${goodsId}-${collectTime}.json`;
      
      // 保存JSON文件到临时文件夹
      console.log('💾 开始保存JSON文件...');
      await fs.promises.writeFile(path.join(tempPath, goodsInfoFile), goodsInfo, 'utf8');
      console.log('✅ 商品信息JSON文件已保存:', goodsInfoFile);
      
      await fs.promises.writeFile(path.join(tempPath, monitoringFile), monitoring, 'utf8');
      console.log('✅ 监控数据JSON文件已保存:', monitoringFile);
      
      await fs.promises.writeFile(path.join(tempPath, mediaDataFile), mediaData, 'utf8');
      console.log('✅ 媒体数据JSON文件已保存:', mediaDataFile);
      
      console.log('🎉 所有JSON文件保存完成');
      
      res.json({ 
        success: true, 
        files: {
          goodsInfo: goodsInfoFile,
          monitoring: monitoringFile,
          mediaData: mediaDataFile
        }
      });
    } catch (error) {
      console.error('保存JSON文件失败:', error);
      res.json({ success: false, error: error.message });
    }
  });

  // 接收插件数据的API
  expressApp.post('/api/import-goods', async (req, res) => {
    try {
      console.log('📥 收到插件数据导入请求');
      const data = req.body;
      
      // 验证新的数据结构（基于JSON文件路径）
      if (!data.goodsId) {
        console.error('❌ 缺少商品ID');
        return res.json({ success: false, error: '缺少商品ID' });
      }
      
      if (!data.jsonFiles) {
        console.error('❌ 缺少JSON文件信息');
        return res.json({ success: false, error: '缺少JSON文件信息' });
      }
      
      console.log('✅ 数据验证通过，商品ID:', data.goodsId);
      
      // 发送数据到渲染进程
      if (mainWindow) {
        console.log('🔄 发送数据到渲染进程...');
        // 将窗口置于最前
        mainWindow.show();
        mainWindow.focus();
        mainWindow.moveTop();
        
        mainWindow.webContents.send('import-goods-data', data);
        console.log('✅ 数据已发送到渲染进程');
        res.json({ success: true, message: '数据已发送到应用' });
      } else {
        console.error('❌ 主窗口不存在');
        res.json({ success: false, error: '应用窗口未准备好' });
      }
    } catch (error) {
      console.error('处理商品数据失败:', error);
      res.json({ success: false, error: error.message });
    }
  });
  
  // 启动服务器
  httpServer = expressApp.listen(3001, 'localhost', () => {
    console.log('HTTP服务器已启动，端口: 3001');
  });
}

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 500,
    height: 400,
    minWidth: 400,
    minHeight: 300,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false, // 允许跨域图片加载
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'), // 应用图标
    titleBarStyle: 'hiddenInset', // macOS样式标题栏
    trafficLightPosition: { x: 20, y: 20 }, // 调整交通灯按钮位置（仅限macOS）
    show: false // 先不显示，等加载完成后再显示
  });

  // 加载应用的index.html
  mainWindow.loadFile('renderer/index.html');

  // 当窗口准备好显示时再显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // 开发模式下打开开发者工具
    if (process.argv.includes('--dev')) {
      mainWindow.webContents.openDevTools();
    }
  });

  // 当窗口被关闭时触发
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 设置菜单
  createMenu();
}

// 创建应用菜单
function createMenu() {
  const template = [
    {
      label: '韩立客户端',
      submenu: [
        {
          label: '关于韩立客户端',
          role: 'about'
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '文件',
      submenu: [
        {
          label: '打开数据文件夹',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            const dataPath = path.join(__dirname, 'data');
            require('child_process').exec(`open "${dataPath}"`);
          }
        },
        { type: 'separator' },
        {
          label: '刷新',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.reload();
          }
        }
      ]
    },
    {
      label: '视图',
      submenu: [
        {
          label: '重新加载',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.reload();
          }
        },
        {
          label: '强制重新加载',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            mainWindow.webContents.reloadIgnoringCache();
          }
        },
        {
          label: '切换开发者工具',
          accelerator: 'F12',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          }
        },
        { type: 'separator' },
        {
          label: '实际大小',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            mainWindow.webContents.setZoomLevel(0);
          }
        },
        {
          label: '放大',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            const currentZoom = mainWindow.webContents.getZoomLevel();
            mainWindow.webContents.setZoomLevel(currentZoom + 0.5);
          }
        },
        {
          label: '缩小',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            const currentZoom = mainWindow.webContents.getZoomLevel();
            mainWindow.webContents.setZoomLevel(currentZoom - 0.5);
          }
        }
      ]
    },
    {
      label: '窗口',
      submenu: [
        {
          label: '最小化',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          label: '关闭',
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// 当Electron完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(() => {
  createWindow();
  createHttpServer();
});

// 当所有窗口都被关闭时退出应用
app.on('window-all-closed', () => {
  // 关闭HTTP服务器
  if (httpServer) {
    httpServer.close();
  }
  
  // 在macOS上，应用和菜单栏通常会保持活跃状态
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // 在macOS上，当点击dock图标并且没有其他窗口打开时，
  // 通常在应用中重新创建一个窗口
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC通信处理
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-data-path', () => {
  return path.join(__dirname, 'data');
});

ipcMain.handle('read-file', async (event, filePath) => {
  try {
    // filePath 已经是完整路径，直接使用
    const data = await fs.promises.readFile(filePath, 'utf8');
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 读取JSON文件
ipcMain.handle('read-json-file', async (event, fileName, goodsId) => {
  try {
    console.log('开始读取JSON文件:', { fileName, goodsId });
    const tempPath = path.join(__dirname, 'data', 'Temp', goodsId);
    const filePath = path.join(tempPath, fileName);
    console.log('JSON文件路径:', filePath);
    
    // 检查文件是否存在
    const fileExists = await fs.promises.access(filePath).then(() => true).catch(() => false);
    console.log('文件是否存在:', fileExists);
    
    if (!fileExists) {
      console.error('JSON文件不存在:', filePath);
      return { success: false, error: `文件不存在: ${filePath}` };
    }
    
    const data = await fs.promises.readFile(filePath, 'utf8');
    console.log('文件读取成功，数据长度:', data.length);
    
    const jsonData = JSON.parse(data);
    console.log('JSON解析成功，数据类型:', typeof jsonData);
    
    // 根据文件类型显示不同的加载信息
    if (fileName.includes('goods-')) {
      console.log('✅ 已加载商品信息JSON文件:', fileName);
    } else if (fileName.includes('monitoring-')) {
      console.log('✅ 已加载监控数据JSON文件:', fileName);
    } else if (fileName.includes('media-')) {
      console.log('✅ 已加载媒体数据JSON文件:', fileName);
    } else {
      console.log('✅ 已加载JSON文件:', fileName);
    }
    
    return { success: true, data: jsonData };
  } catch (error) {
    console.error('读取JSON文件失败:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('read-image', async (event, filePath) => {
  try {
    // filePath 已经是完整路径，直接使用
    const data = await fs.promises.readFile(filePath);
    const base64 = data.toString('base64');
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : 
                     ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                     ext === '.gif' ? 'image/gif' : 'image/webp';
    return { 
      success: true, 
      data: `data:${mimeType};base64,${base64}`,
      size: data.length
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('list-directories', async (event, dirPath) => {
  try {
    const items = await fs.promises.readdir(dirPath, { withFileTypes: true });
    const itemsWithStats = await Promise.all(
      items.map(async (item) => {
        const itemPath = path.join(dirPath, item.name);
        try {
          const stats = await fs.promises.stat(itemPath);
          return {
            name: item.name,
            isDirectory: item.isDirectory(),
            path: itemPath,
            size: stats.size,
            mtime: stats.mtime
          };
        } catch (statError) {
          // 如果无法获取文件统计信息，使用默认值
          return {
            name: item.name,
            isDirectory: item.isDirectory(),
            path: itemPath,
            size: 0,
            mtime: new Date()
          };
        }
      })
    );
    
    return { 
      success: true, 
      data: itemsWithStats
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-folder', async (event, folderPath) => {
  try {
    const fullPath = path.join(__dirname, 'data', folderPath);
    await shell.showItemInFolder(fullPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-file', async (event, filePath) => {
  try {
    // filePath 已经是完整路径，直接使用
    await shell.openPath(filePath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});


ipcMain.handle('delete-file', async (event, filePath) => {
  try {
    await fs.unlink(filePath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('write-file', async (event, filePath, data) => {
  try {
    await fs.promises.writeFile(filePath, data);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('select-folder', async (event) => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: '选择数据文件夹',
      properties: ['openDirectory'],
      message: '请选择包含商品和店铺数据的文件夹'
    });
    
    if (result.canceled) {
      return { success: false, error: '用户取消选择' };
    }
    
    const selectedPath = result.filePaths[0];
    
    // 检查文件夹是否包含goods和stores子文件夹
    const goodsPath = path.join(selectedPath, 'goods');
    const storesPath = path.join(selectedPath, 'stores');
    
    const hasGoods = await fs.promises.access(goodsPath).then(() => true).catch(() => false);
    const hasStores = await fs.promises.access(storesPath).then(() => true).catch(() => false);
    
    if (!hasGoods && !hasStores) {
      return { 
        success: false, 
        error: '选择的文件夹不包含goods或stores子文件夹' 
      };
    }
    
    return { 
      success: true, 
      data: {
        path: selectedPath,
        name: path.basename(selectedPath),
        hasGoods,
        hasStores
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 调整窗口大小到主应用模式
ipcMain.handle('resize-to-main-app', () => {
  if (mainWindow) {
    // 获取屏幕尺寸
    const { screen } = require('electron');
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    
    // 设置窗口大小为屏幕工作区域大小（铺满屏幕）
    mainWindow.setSize(width, height);
    mainWindow.center();
  }
});

// 调整窗口大小到文件夹选择模式
ipcMain.handle('resize-to-folder-selection', () => {
  if (mainWindow) {
    mainWindow.setSize(500, 400);
    mainWindow.center();
  }
});

// 获取监控数据文件
ipcMain.handle('get-monitoring-files', async (event, goodsId) => {
  try {
    const dataPath = path.join(__dirname, 'data');
    const monitoringPath = path.join(dataPath, 'data-monitoring', 'goods', goodsId);
    
    // 检查目录是否存在
    if (!fs.existsSync(monitoringPath)) {
      return [];
    }
    
    // 读取目录中的所有JSON文件
    const files = await fs.promises.readdir(monitoringPath);
    const jsonFiles = files.filter(file => file.endsWith('.json') && file.startsWith('goods-'));
    
    // 读取所有JSON文件的内容
    const monitoringFiles = [];
    for (const file of jsonFiles) {
      try {
        const filePath = path.join(monitoringPath, file);
        const content = await fs.promises.readFile(filePath, 'utf8');
        const data = JSON.parse(content);
        monitoringFiles.push(data);
      } catch (error) {
        console.error(`读取监控文件 ${file} 失败:`, error);
      }
    }
    
    return monitoringFiles;
  } catch (error) {
    console.error('获取监控文件失败:', error);
    return [];
  }
});

// 保存商品数据到goods-library和data-monitoring
ipcMain.handle('save-goods-data', async (event, data) => {
  try {
    const { goodsInfoData, monitoringData, mediaData } = data;
    const dataPath = path.join(__dirname, 'data');
    
    if (!goodsInfoData.goodsId) {
      return { success: false, error: '商品ID不能为空' };
    }
    
    const goodsId = goodsInfoData.goodsId;
    const collectTime = goodsInfoData.collectTime;
    
    // 生成文件名（将ISO时间格式转换为文件名安全格式）
    const fileNameSuffix = collectTime ? collectTime.replace(/[:.]/g, '-').replace('T', '-') : Date.now().toString();
    const fileName = `goods-${goodsId}-${fileNameSuffix}.json`;
    
    // 保存商品信息数据
    const goodsLibraryPath = path.join(dataPath, 'goods-library', 'goods', goodsId);
    await fs.promises.mkdir(goodsLibraryPath, { recursive: true });
    
    const goodsInfoPath = path.join(goodsLibraryPath, fileName);
    await backupAndSaveFile(goodsInfoPath, goodsInfoData);
    
    // 保存监控数据
    const monitoringPath = path.join(dataPath, 'data-monitoring', 'goods', goodsId);
    await fs.promises.mkdir(monitoringPath, { recursive: true });
    
    const monitoringFilePath = path.join(monitoringPath, fileName);
    await backupAndSaveFile(monitoringFilePath, monitoringData);
    
    // 保存媒体数据到产品库
    if (mediaData && mediaData.media && mediaData.media.length > 0) {
      const mediaFileName = `media-${goodsId}-${fileNameSuffix}.json`;
      const mediaPath = path.join(goodsLibraryPath, mediaFileName);
      await backupAndSaveFile(mediaPath, mediaData);
      console.log('媒体数据已保存到产品库:', mediaPath);
    }
    
    // 保存媒体数据到数据监控文件夹
    if (mediaData && mediaData.media && mediaData.media.length > 0) {
      const mediaFileName = `media-${goodsId}-${fileNameSuffix}.json`;
      const monitoringMediaPath = path.join(monitoringPath, mediaFileName);
      await backupAndSaveFile(monitoringMediaPath, mediaData);
      console.log('媒体数据已保存到数据监控文件夹:', monitoringMediaPath);
    }
    
    // 保存筛选的图片到商品库
    let savedImages = [];
    if (goodsInfoData.filteredImages && goodsInfoData.filteredImages.length > 0) {
      savedImages = await saveFilteredImages(goodsInfoData.filteredImages, goodsLibraryPath, goodsId);
    }
    
    // 保存筛选的图片到数据监控文件夹
    let monitoringSavedImages = [];
    if (goodsInfoData.filteredImages && goodsInfoData.filteredImages.length > 0) {
      monitoringSavedImages = await saveFilteredImages(goodsInfoData.filteredImages, monitoringPath, goodsId);
    }
    
    // 保存图片尺寸信息到商品库
    if (goodsInfoData.imageInfoList && goodsInfoData.imageInfoList.length > 0) {
      const imageInfoPath = path.join(goodsLibraryPath, `image-info-${goodsId}.json`);
      await backupAndSaveFile(imageInfoPath, goodsInfoData.imageInfoList);
    }
    
    // 保存图片尺寸信息到数据监控文件夹
    if (goodsInfoData.imageInfoList && goodsInfoData.imageInfoList.length > 0) {
      const monitoringImageInfoPath = path.join(monitoringPath, `image-info-${goodsId}.json`);
      await backupAndSaveFile(monitoringImageInfoPath, goodsInfoData.imageInfoList);
    }
    
    // 清理临时文件夹
    try {
      const tempPath = path.join(dataPath, 'Temp', goodsId);
      if (fs.existsSync(tempPath)) {
        await fs.promises.rm(tempPath, { recursive: true, force: true });
        console.log('临时文件夹已清理:', tempPath);
      }
    } catch (cleanupError) {
      console.warn('清理临时文件夹失败:', cleanupError.message);
    }
    
    return { 
      success: true, 
      paths: {
        goodsInfo: goodsInfoPath,
        monitoring: monitoringFilePath
      },
      savedImages,
      monitoringSavedImages
    };
  } catch (error) {
    console.error('保存商品数据失败:', error);
    return { success: false, error: error.message };
  }
});

// 保存筛选的图片
async function saveFilteredImages(imageUrls, targetDir, goodsId) {
  const savedImages = [];
  const https = require('https');
  const http = require('http');
  
  for (let i = 0; i < imageUrls.length; i++) {
    try {
      const imageUrl = imageUrls[i];
      const url = new URL(imageUrl);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;
      
      // 生成文件名
      const ext = path.extname(url.pathname) || '.jpg';
      const fileName = `image_${i + 1}_${Date.now()}${ext}`;
      const filePath = path.join(targetDir, fileName);
      
      // 下载图片
      const file = fs.createWriteStream(filePath);
      
      const request = client.get(imageUrl, (response) => {
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          savedImages.push({
            originalUrl: imageUrl,
            fileName: fileName,
            filePath: filePath
          });
          console.log(`图片已保存: ${fileName}`);
        });
      });
      
      request.on('error', (error) => {
        console.error(`下载图片失败: ${imageUrl}`, error);
        fs.unlink(filePath, () => {}); // 删除空文件
      });
      
      file.on('error', (error) => {
        console.error(`保存图片失败: ${fileName}`, error);
        fs.unlink(filePath, () => {}); // 删除空文件
      });
      
    } catch (error) {
      console.error(`处理图片URL失败: ${imageUrls[i]}`, error);
    }
  }
  
  return savedImages;
}

// 备份并保存文件
async function backupAndSaveFile(filePath, data) {
  try {
    // 检查文件是否存在
    const exists = await fs.promises.access(filePath).then(() => true).catch(() => false);
    
    if (exists) {
      // 生成备份文件名（添加时间戳）
      const dir = path.dirname(filePath);
      const ext = path.extname(filePath);
      const name = path.basename(filePath, ext);
      const timestamp = new Date().getTime();
      const backupPath = path.join(dir, `${name}-backup-${timestamp}${ext}`);
      
      // 备份原文件
      await fs.promises.copyFile(filePath, backupPath);
      console.log(`已备份原文件到: ${backupPath}`);
    }
    
    // 保存新文件
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    
  } catch (error) {
    console.error('备份和保存文件失败:', error);
    throw error;
  }
}

// 缓存图片到临时文件夹
ipcMain.handle('cache-image-to-temp', async (event, goodsId, imageUrl, imageData) => {
  try {
    console.log('开始缓存图片到临时文件夹:', { goodsId, imageUrl });
    
    // 如果Temp文件夹已存在，先删除
    const tempPath = path.join(__dirname, 'data', 'Temp', goodsId);
    if (fs.existsSync(tempPath)) {
      console.log('🗑️ 删除已存在的临时目录:', tempPath);
      await fs.promises.rm(tempPath, { recursive: true, force: true });
    }
    
    // 创建新的Temp文件夹
    await fs.promises.mkdir(tempPath, { recursive: true });
    
    // 生成文件名
    const urlObj = new URL(imageUrl);
    const fileName = path.basename(urlObj.pathname) || `image_${Date.now()}.jpg`;
    const filePath = path.join(tempPath, fileName);
    
    // 如果是base64数据，直接写入
    if (imageData && imageData.startsWith('data:')) {
      const base64Data = imageData.split(',')[1];
      await fs.promises.writeFile(filePath, base64Data, 'base64');
    } else {
      // 如果是URL，下载文件（优先使用imageData，如果没有则使用imageUrl）
      const downloadUrl = imageData || imageUrl;
      await downloadFile(downloadUrl, filePath);
    }
    
    console.log('图片缓存成功:', filePath);
    return { success: true, tempPath: filePath };
    
  } catch (error) {
    console.error('缓存图片失败:', error);
    return { success: false, error: error.message };
  }
});

// 缓存视频到临时文件夹
ipcMain.handle('cache-video-to-temp', async (event, goodsId, videoUrl, videoData) => {
  try {
    console.log('开始缓存视频到临时文件夹:', { goodsId, videoUrl });
    
    // 如果Temp文件夹已存在，先删除
    const tempPath = path.join(__dirname, 'data', 'Temp', goodsId);
    if (fs.existsSync(tempPath)) {
      console.log('🗑️ 删除已存在的临时目录:', tempPath);
      await fs.promises.rm(tempPath, { recursive: true, force: true });
    }
    
    // 创建新的Temp文件夹
    await fs.promises.mkdir(tempPath, { recursive: true });
    
    // 生成文件名
    const urlObj = new URL(videoUrl);
    const fileName = path.basename(urlObj.pathname) || `video_${Date.now()}.mp4`;
    const filePath = path.join(tempPath, fileName);
    
    // 如果是base64数据，直接写入
    if (videoData && videoData.startsWith('data:')) {
      const base64Data = videoData.split(',')[1];
      await fs.promises.writeFile(filePath, base64Data, 'base64');
    } else {
      // 如果是URL，下载文件（优先使用videoData，如果没有则使用videoUrl）
      const downloadUrl = videoData || videoUrl;
      await downloadFile(downloadUrl, filePath);
    }
    
    console.log('视频缓存成功:', filePath);
    return { success: true, tempPath: filePath };
    
  } catch (error) {
    console.error('缓存视频失败:', error);
    return { success: false, error: error.message };
  }
});

// 下载图片到产品库
ipcMain.handle('download-image-to-product-library', async (event, goodsId, imageUrl, fileName) => {
  try {
    console.log('开始下载图片到产品库:', { goodsId, imageUrl, fileName });
    
    // 创建产品库图片文件夹
    const productLibraryPath = path.join(__dirname, 'data', 'goods-library', 'goods', goodsId);
    await fs.promises.mkdir(productLibraryPath, { recursive: true });
    
    // 生成文件名
    const urlObj = new URL(imageUrl);
    const originalFileName = path.basename(urlObj.pathname) || `image_${Date.now()}.jpg`;
    const fileExtension = path.extname(originalFileName) || '.jpg';
    const finalFileName = fileName ? `${fileName}${fileExtension}` : originalFileName;
    const filePath = path.join(productLibraryPath, finalFileName);
    
    // 下载网络图片
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`下载图片失败: ${response.status} ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    await fs.promises.writeFile(filePath, Buffer.from(buffer));
    
    console.log('图片下载到产品库成功:', filePath);
    return { success: true, localPath: filePath };
  } catch (error) {
    console.error('下载图片到产品库失败:', error);
    return { success: false, error: error.message };
  }
});

// 下载视频到产品库
ipcMain.handle('download-video-to-product-library', async (event, goodsId, videoUrl, fileName) => {
  try {
    console.log('开始下载视频到产品库:', { goodsId, videoUrl, fileName });
    
    // 创建产品库视频文件夹
    const productLibraryPath = path.join(__dirname, 'data', 'goods-library', 'goods', goodsId);
    await fs.promises.mkdir(productLibraryPath, { recursive: true });
    
    // 生成文件名
    const urlObj = new URL(videoUrl);
    const originalFileName = path.basename(urlObj.pathname) || `video_${Date.now()}.mp4`;
    const fileExtension = path.extname(originalFileName) || '.mp4';
    const finalFileName = fileName ? `${fileName}${fileExtension}` : originalFileName;
    const filePath = path.join(productLibraryPath, finalFileName);
    
    // 下载网络视频
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error(`下载视频失败: ${response.status} ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    await fs.promises.writeFile(filePath, Buffer.from(buffer));
    
    console.log('视频下载到产品库成功:', filePath);
    return { success: true, localPath: filePath };
  } catch (error) {
    console.error('下载视频到产品库失败:', error);
    return { success: false, error: error.message };
  }
});

// 缓存媒体文件到临时文件夹
ipcMain.handle('cache-media-files-to-temp', async (event, goodsId, mediaData) => {
  try {
    console.log('开始缓存媒体文件到临时文件夹:', { goodsId, mediaCount: mediaData.media.length });
    
    // 如果Temp文件夹已存在，先删除
    const tempPath = path.join(__dirname, 'data', 'Temp', goodsId);
    if (fs.existsSync(tempPath)) {
      console.log('🗑️ 删除已存在的临时目录:', tempPath);
      await fs.promises.rm(tempPath, { recursive: true, force: true });
    }
    
    // 创建新的Temp文件夹
    await fs.promises.mkdir(tempPath, { recursive: true });
    
    const cachedMedia = [];
    
    for (const media of mediaData.media) {
      try {
        const mediaUrl = media.url || media.src;
        if (!mediaUrl) continue;
        
        // 生成文件名
        const urlObj = new URL(mediaUrl);
        const fileName = path.basename(urlObj.pathname) || 
          `${media.type === 'video' ? 'video' : 'image'}_${Date.now()}.${media.type === 'video' ? 'mp4' : 'jpg'}`;
        const filePath = path.join(tempPath, fileName);
        
        // 下载文件
        await downloadFile(mediaUrl, filePath);
        
        // 更新媒体数据
        const cachedMediaItem = {
          ...media,
          originalUrl: mediaUrl,
          tempPath: filePath,
          cached: true
        };
        cachedMedia.push(cachedMediaItem);
        
        console.log('媒体文件缓存成功:', fileName);
        
      } catch (mediaError) {
        console.error('缓存单个媒体文件失败:', mediaError);
        // 继续处理其他文件
      }
    }
    
    console.log('媒体文件缓存完成:', cachedMedia.length, '个');
    return { 
      success: true, 
      mediaData: { 
        ...mediaData, 
        media: cachedMedia 
      } 
    };
    
  } catch (error) {
    console.error('缓存媒体文件失败:', error);
    return { success: false, error: error.message };
  }
});

// 下载文件的辅助函数
async function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const request = protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`下载失败: ${response.statusCode}`));
        return;
      }
      
      const fileStream = fs.createWriteStream(filePath);
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      
      fileStream.on('error', (error) => {
        fs.unlink(filePath, () => {}); // 删除部分下载的文件
        reject(error);
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('下载超时'));
    });
  });
}
