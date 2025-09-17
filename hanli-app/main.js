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
            preload: path.join(__dirname, 'preload.js')
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
                {
                    label: '新建产品',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        mainWindow.webContents.send('menu-new-product');
                    }
                },
                {
                    label: '导入数据',
                    accelerator: 'CmdOrCtrl+I',
                    click: () => {
                        mainWindow.webContents.send('menu-import-data');
                    }
                },
                { type: 'separator' },
                {
                    label: '退出',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
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
        // 将App置于最前窗口
        if (mainWindow) {
            if (mainWindow.isMinimized()) {
                mainWindow.restore();
            }
            mainWindow.show();
            mainWindow.maximize();
            mainWindow.focus();
            console.log('App已置于最前窗口');
        } else {
            // 如果窗口不存在，创建新窗口
            createWindow();
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

// 处理打开商品详情页的请求
ipcMain.on('open-product-detail', (event, data) => {
    console.log('收到打开商品详情页请求:', data);
    // 通知渲染进程打开商品详情页
    if (mainWindow) {
        mainWindow.webContents.send('navigate-to-product', data);
    }
});

// 处理自定义协议URL
app.on('open-url', (event, url) => {
    console.log('收到自定义协议URL:', url);
    event.preventDefault();
    
    // 如果应用已经运行，显示窗口
    if (mainWindow) {
        console.log('App已运行，显示窗口');
        if (mainWindow.isMinimized()) {
            mainWindow.restore();
        }
        mainWindow.show();
        mainWindow.maximize();
        mainWindow.focus();
    } else {
        console.log('App未运行，创建新窗口');
        // 如果应用没有运行，创建新窗口
        createWindow();
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
