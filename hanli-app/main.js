const { app, BrowserWindow, Menu, ipcMain, protocol } = require('electron');
const path = require('path');
const { startServer } = require('./server');

// 设置应用名称和显示名称
app.setName('Hanli');
app.setAppUserModelId('com.hanli.product-management');

// 确保应用只运行一个实例
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    // 如果无法获取锁，说明已经有实例在运行，退出当前实例
    app.quit();
} else {
    // 获取锁成功，继续运行应用

// 设置应用信息
if (process.platform === 'darwin') {
    // 暂时注释掉图标设置，避免文件不存在错误
    // app.dock.setIcon(path.join(__dirname, 'assets/icon.png'));
    app.dock.setBadge('Hanli');
}

// 保持对窗口对象的全局引用
let mainWindow;

function createWindow() {
    // 获取屏幕尺寸
    const { screen } = require('electron');
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
    
    // 创建浏览器窗口 - 使用100%屏幕尺寸
    mainWindow = new BrowserWindow({
        width: screenWidth,
        height: screenHeight,
        minWidth: 800,
        minHeight: 600,
        title: 'Hanli',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: true,
            allowRunningInsecureContent: false,
            experimentalFeatures: false
        },
        frame: false, // 完全自定义窗口控制
        titleBarStyle: 'hidden', // 完全隐藏标题栏
        trafficLightPosition: { x: -1000, y: -1000 }, // 将原生按钮移到屏幕外
        show: false, // 先不显示，等加载完成后再显示
        icon: path.join(__dirname, 'assets/icon.png'), // 应用图标
        fullscreenable: true, // 允许全屏
        maximizable: true, // 允许最大化
        minimizable: true, // 允许最小化
        resizable: true // 允许调整大小
    });

    // 加载应用的index.html
    mainWindow.loadFile('renderer/index.html');

    // 设置窗口标题
    mainWindow.setTitle('Hanli');

    // 窗口准备好后显示
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        
        // 最大化窗口以使用100%屏幕空间
        mainWindow.maximize();
        
        // 开发模式下打开开发者工具
        if (process.argv.includes('--dev')) {
            mainWindow.webContents.openDevTools();
        }
        
        // 处理待处理的goodsId
        if (global.pendingGoodsId) {
            console.log('处理待处理的商品ID:', global.pendingGoodsId);
            setTimeout(() => {
                mainWindow.webContents.send('open-product-detail', { goodsId: global.pendingGoodsId });
                global.pendingGoodsId = null;
            }, 1000);
        }
    });

    // 设置全局窗口引用，供服务器使用
    global.mainWindow = mainWindow;

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
            label: '文件',
            submenu: [
                // 文件菜单项已移除
            ]
        },
        {
            label: '编辑',
            submenu: [
                { role: 'undo', label: '撤销' },
                { role: 'redo', label: '重做' },
                { type: 'separator' },
                { role: 'cut', label: '剪切' },
                { role: 'copy', label: '复制' },
                { role: 'paste', label: '粘贴' }
            ]
        },
        {
            label: '视图',
            submenu: [
                { role: 'reload', label: '重新加载' },
                { role: 'forceReload', label: '强制重新加载' },
                { role: 'toggleDevTools', label: '开发者工具' },
                { type: 'separator' },
                { role: 'resetZoom', label: '实际大小' },
                { role: 'zoomIn', label: '放大' },
                { role: 'zoomOut', label: '缩小' },
                { type: 'separator' },
                { role: 'togglefullscreen', label: '全屏' }
            ]
        },
        {
            label: '窗口',
            submenu: [
                { role: 'minimize', label: '最小化' },
                { role: 'close', label: '关闭' }
            ]
        },
        {
            label: '帮助',
            submenu: [
                {
                    label: '关于Hanli',
                    click: () => {
                        mainWindow.webContents.send('menu-about');
                    }
                }
            ]
        }
    ];

    // macOS特殊处理
    if (process.platform === 'darwin') {
        template.unshift({
            label: app.getName(),
            submenu: [
                { role: 'about', label: '关于' },
                { type: 'separator' },
                { role: 'services', label: '服务' },
                { type: 'separator' },
                { role: 'hide', label: '隐藏' },
                { role: 'hideOthers', label: '隐藏其他' },
                { role: 'unhide', label: '显示全部' },
                { type: 'separator' },
                { role: 'quit', label: '退出' }
            ]
        });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// 确保应用只有一个实例运行
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    // 注册自定义协议 - 使用正确的应用名称
    app.setAsDefaultProtocolClient('hanliapp');
}

// 处理hanliapp://协议
app.on('open-url', (event, url) => {
    event.preventDefault();
    console.log('收到hanliapp协议调用:', url);
    
    if (url.startsWith('hanliapp://open')) {
        // 解析URL参数
        const urlObj = new URL(url);
        const goodsId = urlObj.searchParams.get('goodsId');
        
        // 将App置于最前窗口
        if (mainWindow) {
            if (mainWindow.isMinimized()) {
                mainWindow.restore();
            }
            mainWindow.show();
            mainWindow.maximize();
            mainWindow.focus();
            console.log('App已置于最前窗口');
            
            // 如果有goodsId，通知渲染进程打开产品详情页
            if (goodsId) {
                console.log('main.js: 收到商品ID，准备打开产品详情页:', goodsId);
                // 延迟一点时间确保窗口完全加载
                setTimeout(() => {
                    console.log('main.js: 发送open-product-detail事件到渲染进程，商品ID:', goodsId);
                    mainWindow.webContents.send('open-product-detail', { goodsId });
                }, 1000);
            } else {
                console.log('main.js: 没有收到goodsId参数');
            }
        } else {
            // 如果窗口不存在，创建新窗口
            createWindow();
            
            // 如果有goodsId，保存到全局变量，等窗口创建完成后处理
            if (goodsId) {
                global.pendingGoodsId = goodsId;
            }
        }
    }
});

// 处理Windows上的协议调用
app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 当尝试运行第二个实例时，将焦点放在现有窗口上
    if (mainWindow) {
        if (mainWindow.isMinimized()) {
            mainWindow.restore();
        }
        mainWindow.show();
        mainWindow.maximize();
        mainWindow.focus();
        console.log('App已置于最前窗口（第二个实例）');
    }
});

// 当Electron完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(async () => {
    // 再次确保协议注册
    app.setAsDefaultProtocolClient('hanliapp');
    console.log('hanliapp协议已注册');
    
    // 启动HTTP服务器
    await startServer();
    
    // 创建窗口
    createWindow();
});

// 当所有窗口都被关闭时退出应用
app.on('window-all-closed', () => {
    // 在macOS上，应用和菜单栏通常会保持活跃状态，直到用户使用Cmd + Q明确退出
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // 在macOS上，当点击dock图标并且没有其他窗口打开时，通常在应用中重新创建窗口
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    } else if (mainWindow) {
        // 如果窗口存在但被最小化，则恢复并最大化
        if (mainWindow.isMinimized()) {
            mainWindow.restore();
        }
        mainWindow.maximize();
        mainWindow.focus();
    }
});

// IPC通信处理
ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

ipcMain.handle('get-platform', () => {
    return process.platform;
});

// 处理窗口控制事件
ipcMain.on('window-minimize', () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
        window.minimize();
    }
});

ipcMain.on('window-maximize', () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
        if (window.isMaximized()) {
            window.unmaximize();
        } else {
            window.maximize();
        }
    }
});

ipcMain.on('window-close', () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
        window.close();
    }
});

ipcMain.on('window-toggle-fullscreen', () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
        window.setFullScreen(!window.isFullScreen());
    }
});

// 处理渲染进程的请求
ipcMain.on('show-settings', () => {
    // 可以在这里处理设置窗口的显示
    console.log('显示设置窗口');
});

// 处理打开系统浏览器的请求
ipcMain.handle('open-system-browser', async (event, url) => {
    try {
        const { shell } = require('electron');
        await shell.openExternal(url);
        return { success: true };
    } catch (error) {
        console.error('打开系统浏览器失败:', error);
        return { success: false, error: error.message };
    }
});

// 处理监控采集请求
ipcMain.handle('request-monitor-collection', async (event, data) => {
    try {
        const { goodsId, collectUrl } = data;
        console.log(`收到监控采集请求: ${goodsId} - ${collectUrl}`);
        
        // 打开系统浏览器
        const { shell } = require('electron');
        await shell.openExternal(collectUrl);
        
        return { success: true, message: '已打开系统浏览器，请等待插件采集完成' };
    } catch (error) {
        console.error('处理监控采集请求失败:', error);
        return { success: false, error: error.message };
    }
});

// 处理发送URL列表给插件的请求
ipcMain.handle('send-url-list-to-plugin', async (event, data) => {
    try {
        const { urls, timestamp, taskId } = data;
        console.log(`收到发送URL列表给插件的请求: 任务ID ${taskId}, URL数量 ${urls.length}`);
        
        // 这里可以通过多种方式与插件通信：
        // 1. 通过本地存储
        // 2. 通过HTTP请求
        // 3. 通过文件系统
        // 4. 通过WebSocket
        
        // 方案1: 通过本地存储（推荐）
        const storage = require('electron-store');
        const store = new storage();
        
        // 保存URL列表到本地存储
        store.set('collection-task', {
            taskId: taskId,
            urls: urls,
            timestamp: timestamp,
            status: 'pending'
        });
        
        console.log(`URL列表已保存到本地存储，任务ID: ${taskId}`);
        
        // 方案2: 通过HTTP请求通知插件（如果插件有HTTP接口）
        try {
            const axios = require('axios');
            await axios.post('http://localhost:3002/api/collection-task', {
                taskId: taskId,
                urls: urls,
                timestamp: timestamp
            }, {
                timeout: 5000
            });
            console.log('已通过HTTP通知插件');
        } catch (httpError) {
            console.log('HTTP通知插件失败，使用本地存储方案:', httpError.message);
        }
        
        return { 
            success: true, 
            message: `URL列表已发送给插件，任务ID: ${taskId}`,
            taskId: taskId
        };
    } catch (error) {
        console.error('发送URL列表给插件失败:', error);
        return { success: false, error: error.message };
    }
});

// 在浏览器中打开HTML
ipcMain.handle('open-html-in-browser', async (event, data) => {
    try {
        const { html, title, taskId } = data;
        console.log(`收到在浏览器中打开HTML的请求: 任务ID ${taskId}, 标题: ${title}`);
        
        // 创建临时HTML文件
        const fs = require('fs');
        const path = require('path');
        const os = require('os');
        
        const tempDir = os.tmpdir();
        const filename = `hanli-collection-task-${taskId}.html`;
        const filePath = path.join(tempDir, filename);
        
        // 写入HTML内容
        fs.writeFileSync(filePath, html, 'utf8');
        console.log(`临时HTML文件已创建: ${filePath}`);
        
        // 在默认浏览器中打开
        const { shell } = require('electron');
        await shell.openPath(filePath);
        
        console.log(`HTML文件已在浏览器中打开: ${filePath}`);
        
        return { 
            success: true, 
            message: `HTML文件已在浏览器中打开`,
            filePath: filePath,
            taskId: taskId
        };
    } catch (error) {
        console.error('在浏览器中打开HTML失败:', error);
        return { success: false, error: error.message };
    }
});

// 处理插件采集完成通知
ipcMain.on('monitor-collection-completed', (event, data) => {
    console.log('收到插件采集完成通知:', data);
    // 通知渲染进程采集完成
    mainWindow.webContents.send('monitor-collection-completed', data);
});

// 监听文件变化来检测采集完成
const chokidar = require('chokidar');
const path = require('path');

// 监听monitoring.json文件变化
const dataDir = path.join(__dirname, 'data', 'goods-library');
const watcher = chokidar.watch(dataDir, {
    ignored: /(^|[\/\\])\../, // 忽略隐藏文件
    persistent: true
});

watcher.on('change', (filePath) => {
    if (filePath.endsWith('monitoring.json')) {
        console.log('检测到monitoring.json文件变化:', filePath);
        // 通知渲染进程有新的监控数据
        mainWindow.webContents.send('monitor-data-updated', { filePath });
    }
});

// 处理打开商品详情页的请求
ipcMain.on('open-product-detail', (event, data) => {
    console.log('收到打开商品详情页请求:', data);
    // 通知渲染进程打开商品详情页
    if (mainWindow) {
        mainWindow.webContents.send('navigate-to-product', data);
    }
});

// 处理显示文件在 Finder/文件夹中的请求
ipcMain.handle('show-file-in-finder', async (event, filePath) => {
    try {
        const { shell } = require('electron');
        const path = require('path');
        const fs = require('fs');
        
        let fullPath = filePath;
        
        // 如果是相对路径，转换为绝对路径
        if (!path.isAbsolute(filePath)) {
            // 检查是否是商品库的相对路径
            if (filePath.startsWith('hanli-app/data/goods-library/')) {
                // 移除开头的 hanli-app/，因为 __dirname 已经指向 hanli-app 目录
                const relativePath = filePath.replace('hanli-app/', '');
                fullPath = path.join(__dirname, relativePath);
            } else {
                // 其他相对路径，相对于应用目录
                fullPath = path.join(__dirname, filePath);
            }
        }
        
        console.log('原始路径:', filePath);
        console.log('转换后路径:', fullPath);
        
        // 检查文件是否存在
        if (!fs.existsSync(fullPath)) {
            throw new Error('文件不存在: ' + fullPath);
        }
        
        // 根据平台显示文件
        if (process.platform === 'darwin') {
            // macOS: 在 Finder 中显示
            shell.showItemInFolder(fullPath);
        } else if (process.platform === 'win32') {
            // Windows: 在文件夹中显示
            shell.showItemInFolder(fullPath);
        } else {
            // Linux: 在文件管理器中显示
            shell.showItemInFolder(fullPath);
        }
        
        return { success: true };
    } catch (error) {
        console.error('显示文件在 Finder 中失败:', error);
        return { success: false, error: error.message };
    }
});

// 处理显示商品文件夹在 Finder 中的请求
ipcMain.handle('show-goods-folder-in-finder', async (event, goodsId) => {
    try {
        const { shell } = require('electron');
        const path = require('path');
        const fs = require('fs');
        
        // 构建商品文件夹路径
        const goodsLibraryPath = path.join(__dirname, 'data', 'goods-library', goodsId);
        
        // 检查文件夹是否存在
        if (!fs.existsSync(goodsLibraryPath)) {
            throw new Error('商品文件夹不存在: ' + goodsLibraryPath);
        }
        
        // 根据平台显示文件夹
        if (process.platform === 'darwin') {
            // macOS: 在 Finder 中显示
            shell.showItemInFolder(goodsLibraryPath);
        } else if (process.platform === 'win32') {
            // Windows: 在文件夹中显示
            shell.showItemInFolder(goodsLibraryPath);
        } else {
            // Linux: 在文件管理器中显示
            shell.showItemInFolder(goodsLibraryPath);
        }
        
        console.log('已在 Finder 中显示商品文件夹:', goodsLibraryPath);
        return { success: true, path: goodsLibraryPath };
    } catch (error) {
        console.error('显示商品文件夹在 Finder 中失败:', error);
        return { success: false, error: error.message };
    }
});

// 处理另存为文件的请求
ipcMain.handle('save-as-file', async (event, sourcePath, fileName) => {
    try {
        const { dialog } = require('electron');
        const fs = require('fs');
        const path = require('path');
        
        // 检查源文件是否存在
        if (!fs.existsSync(sourcePath)) {
            throw new Error('源文件不存在: ' + sourcePath);
        }
        
        // 打开保存对话框
        const result = await dialog.showSaveDialog(mainWindow, {
            title: '另存为',
            defaultPath: fileName,
            filters: [
                { name: '所有文件', extensions: ['*'] },
                { name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'] },
                { name: '视频文件', extensions: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'] },
                { name: '文档文件', extensions: ['pdf', 'doc', 'docx', 'txt', 'json'] }
            ]
        });
        
        if (result.canceled) {
            return { success: false, canceled: true };
        }
        
        // 复制文件到目标位置
        const targetPath = result.filePath;
        fs.copyFileSync(sourcePath, targetPath);
        
        return { success: true, targetPath: targetPath };
    } catch (error) {
        console.error('另存为文件失败:', error);
        return { success: false, error: error.message };
    }
});

// 处理删除文件到废纸篓的请求
ipcMain.handle('move-to-trash', async (event, filePath) => {
    try {
        const { shell } = require('electron');
        const fs = require('fs');
        const path = require('path');
        
        let fullPath = filePath;
        
        // 如果是相对路径，转换为绝对路径
        if (!path.isAbsolute(filePath)) {
            // 检查是否是商品库的相对路径
            if (filePath.startsWith('hanli-app/data/goods-library/')) {
                // 移除开头的 hanli-app/，因为 __dirname 已经指向 hanli-app 目录
                const relativePath = filePath.replace('hanli-app/', '');
                fullPath = path.join(__dirname, relativePath);
            } else {
                // 其他相对路径，相对于应用目录
                fullPath = path.join(__dirname, filePath);
            }
        }
        
        console.log('准备删除文件到废纸篓:', fullPath);
        
        // 检查文件是否存在
        if (!fs.existsSync(fullPath)) {
            throw new Error('文件不存在: ' + fullPath);
        }
        
        // 使用 Electron 的 shell.trashItem 方法将文件移动到废纸篓
        await shell.trashItem(fullPath);
        
        console.log('文件已移动到废纸篓:', fullPath);
        return { success: true, message: '文件已移动到废纸篓' };
    } catch (error) {
        console.error('移动文件到废纸篓失败:', error);
        return { success: false, error: error.message };
    }
});

// 处理获取桌面路径的请求
ipcMain.handle('get-desktop-path', async (event) => {
    try {
        const os = require('os');
        const path = require('path');
        
        const homeDir = os.homedir();
        const desktopPath = path.join(homeDir, 'Desktop');
        
        return { success: true, path: desktopPath };
    } catch (error) {
        console.error('获取桌面路径失败:', error);
        return { success: false, error: error.message };
    }
});

// 处理多文件复制到文件夹的请求
ipcMain.handle('copy-files-to-folder', async (event, items, targetPath) => {
    try {
        const fs = require('fs');
        const path = require('path');
        
        console.log('收到多文件复制请求:', { items, targetPath });
        
        // 确保目标文件夹存在
        if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath, { recursive: true });
        }
        
        const results = [];
        let successCount = 0;
        let errorCount = 0;
        
        for (const item of items) {
            try {
                let sourcePath = item.filePath;
                
                // 如果是相对路径，转换为绝对路径
                if (!path.isAbsolute(sourcePath)) {
                    if (sourcePath.startsWith('hanli-app/data/goods-library/')) {
                        const relativePath = sourcePath.replace('hanli-app/', '');
                        sourcePath = path.join(__dirname, relativePath);
                    } else {
                        sourcePath = path.join(__dirname, sourcePath);
                    }
                }
                
                // 检查源文件是否存在
                if (!fs.existsSync(sourcePath)) {
                    throw new Error(`源文件不存在: ${sourcePath}`);
                }
                
                // 构建目标文件路径
                const targetFilePath = path.join(targetPath, item.fileName);
                
                // 如果目标文件已存在，添加序号
                let finalTargetPath = targetFilePath;
                let counter = 1;
                while (fs.existsSync(finalTargetPath)) {
                    const ext = path.extname(item.fileName);
                    const nameWithoutExt = path.basename(item.fileName, ext);
                    finalTargetPath = path.join(targetPath, `${nameWithoutExt}_${counter}${ext}`);
                    counter++;
                }
                
                // 复制文件
                fs.copyFileSync(sourcePath, finalTargetPath);
                
                results.push({
                    fileName: item.fileName,
                    success: true,
                    targetPath: finalTargetPath
                });
                
                successCount++;
                console.log(`文件复制成功: ${item.fileName} -> ${finalTargetPath}`);
                
            } catch (error) {
                results.push({
                    fileName: item.fileName,
                    success: false,
                    error: error.message
                });
                
                errorCount++;
                console.error(`文件复制失败: ${item.fileName}`, error);
            }
        }
        
        return {
            success: errorCount === 0,
            message: `复制完成: 成功 ${successCount} 个，失败 ${errorCount} 个`,
            results: results,
            successCount: successCount,
            errorCount: errorCount
        };
        
    } catch (error) {
        console.error('多文件复制失败:', error);
        return { success: false, error: error.message };
    }
});


// 处理Windows上的自定义协议
app.on('second-instance', (event, commandLine, workingDirectory) => {
    console.log('收到第二个实例启动请求:', commandLine);
    
    // 如果应用已经运行，显示窗口
    if (mainWindow) {
        if (mainWindow.isMinimized()) {
            mainWindow.restore();
        }
        mainWindow.show();
        mainWindow.maximize();
        mainWindow.focus();
    }
});

// 安全设置：防止新窗口创建
app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
        console.log('阻止打开新窗口:', navigationUrl);
    });
});

} // 关闭单实例检查的代码块
