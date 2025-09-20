const { contextBridge, ipcRenderer } = require('electron');

// 通过contextBridge安全地暴露API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
    // 获取应用版本
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    
    // 获取平台信息
    getPlatform: () => ipcRenderer.invoke('get-platform'),
    
    // 显示设置
    showSettings: () => ipcRenderer.send('show-settings'),
    
    // 菜单事件已移除
    
    onMenuAbout: (callback) => {
        ipcRenderer.on('menu-about', callback);
    },
    
    // 监听商品详情页打开请求
    onNavigateToProduct: (callback) => {
        ipcRenderer.on('navigate-to-product', callback);
    },
    
    // 监听打开产品详情页请求
    onOpenProductDetail: (callback) => {
        ipcRenderer.on('open-product-detail', callback);
    },
    
    // 移除监听器
    removeAllListeners: (channel) => {
        ipcRenderer.removeAllListeners(channel);
    },
    
    // 文件操作API
    fileAPI: {
        // 选择文件
        selectFile: (options) => ipcRenderer.invoke('select-file', options),
        
        // 保存文件
        saveFile: (data, options) => ipcRenderer.invoke('save-file', data, options),
        
        // 读取文件
        readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
        
        // 在 Finder/文件夹中显示文件
        showInFinder: (filePath) => ipcRenderer.invoke('show-file-in-finder', filePath),
        
        // 在 Finder/文件夹中显示商品文件夹
        showGoodsFolderInFinder: (goodsId) => ipcRenderer.invoke('show-goods-folder-in-finder', goodsId),
        
        // 另存为文件
        saveAs: (sourcePath, fileName) => ipcRenderer.invoke('save-as-file', sourcePath, fileName),
        
        // 删除文件到废纸篓
        moveToTrash: (filePath) => ipcRenderer.invoke('move-to-trash', filePath),
        
        // 复制多个文件到文件夹
        copyFilesToFolder: (items, targetPath) => ipcRenderer.invoke('copy-files-to-folder', items, targetPath),
        
        // 获取桌面路径
        getDesktopPath: () => ipcRenderer.invoke('get-desktop-path')
    },
    
    // 数据存储API
    storageAPI: {
        // 获取数据
        get: (key) => ipcRenderer.invoke('storage-get', key),
        
        // 设置数据
        set: (key, value) => ipcRenderer.invoke('storage-set', key, value),
        
        // 删除数据
        delete: (key) => ipcRenderer.invoke('storage-delete', key),
        
        // 清空所有数据
        clear: () => ipcRenderer.invoke('storage-clear')
    },
    
    // 通知API
    notificationAPI: {
        // 显示通知
        show: (title, body, options) => ipcRenderer.invoke('notification-show', title, body, options),
        
        // 检查通知权限
        checkPermission: () => ipcRenderer.invoke('notification-check-permission'),
        
        // 请求通知权限
        requestPermission: () => ipcRenderer.invoke('notification-request-permission')
    },
    
    // 窗口控制API
    windowAPI: {
        // 最小化窗口
        minimize: () => ipcRenderer.send('window-minimize'),
        
        // 最大化窗口
        maximize: () => ipcRenderer.send('window-maximize'),
        
        // 关闭窗口
        close: () => ipcRenderer.send('window-close'),
        
        // 全屏切换
        toggleFullscreen: () => ipcRenderer.send('window-toggle-fullscreen')
    },
    
    // 系统信息API
    systemAPI: {
        // 获取系统信息
        getInfo: () => ipcRenderer.invoke('system-get-info'),
        
        // 获取内存使用情况
        getMemoryUsage: () => ipcRenderer.invoke('system-get-memory-usage'),
        
        // 获取CPU使用情况
        getCPUUsage: () => ipcRenderer.invoke('system-get-cpu-usage')
    },
    
    // 监控采集API
    monitorAPI: {
        // 打开系统浏览器
        openSystemBrowser: (url) => ipcRenderer.invoke('open-system-browser', url),
        
        // 请求监控采集
        requestMonitorCollection: (data) => ipcRenderer.invoke('request-monitor-collection', data),
        
        // 发送URL列表给插件
        sendUrlListToPlugin: (data) => ipcRenderer.invoke('send-url-list-to-plugin', data),
        // 在浏览器中打开HTML
        openHTMLInBrowser: (data) => ipcRenderer.invoke('open-html-in-browser', data),
        
        // 监听采集完成通知
        onMonitorCollectionCompleted: (callback) => {
            ipcRenderer.on('monitor-collection-completed', callback);
        },
        
        // 移除采集完成监听器
        removeMonitorCollectionCompletedListener: (callback) => {
            ipcRenderer.removeListener('monitor-collection-completed', callback);
        }
    },
    
    // 采集结果发送API（用于浏览器窗口中的脚本）
    sendCollectionResult: (result) => {
        ipcRenderer.send('collection-result', result);
    },
    
    // 监听文件变化
    on: (channel, callback) => {
        ipcRenderer.on(channel, callback);
    },
    
    // 移除文件变化监听器
    removeListener: (channel, callback) => {
        ipcRenderer.removeListener(channel, callback);
    }
});

// 在页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
    // 可以在这里添加一些初始化逻辑
    console.log('预加载脚本已加载');
    
    // 菜单事件监听器已移除
    
    if (window.electronAPI && window.electronAPI.onMenuAbout) {
        window.electronAPI.onMenuAbout(() => {
            console.log('菜单：关于 - 收到IPC事件');
            // 显示关于对话框
            const event = new CustomEvent('menu-about');
            console.log('菜单：关于 - 触发自定义事件');
            window.dispatchEvent(event);
        });
    } else {
        console.warn('electronAPI.onMenuAbout 不可用');
    }
    
    // 监听商品详情页打开请求
    if (window.electronAPI && window.electronAPI.onNavigateToProduct) {
        window.electronAPI.onNavigateToProduct((event, data) => {
            console.log('收到商品详情页打开请求:', data);
            // 触发页面上的商品详情页打开功能
            const customEvent = new CustomEvent('navigate-to-product', { detail: data });
            window.dispatchEvent(customEvent);
        });
    }
    
    // 监听打开产品详情页请求
    if (window.electronAPI && window.electronAPI.onOpenProductDetail) {
        window.electronAPI.onOpenProductDetail((event, data) => {
            console.log('preload.js: 收到打开产品详情页请求:', data);
            // 直接调用页面上的产品详情页打开功能
            if (window.mainAppInstance && data && data.goodsId) {
                console.log('preload.js: 调用mainAppInstance.viewProductDetail，商品ID:', data.goodsId);
                window.mainAppInstance.viewProductDetail(data.goodsId);
            } else {
                console.warn('preload.js: 无法调用viewProductDetail，mainAppInstance:', !!window.mainAppInstance, 'data:', data);
            }
        });
    }
});
