const { contextBridge, ipcRenderer } = require('electron');

// 通过contextBridge安全地暴露API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
    // 获取应用版本
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    
    // 获取平台信息
    getPlatform: () => ipcRenderer.invoke('get-platform'),
    
    // 显示设置
    showSettings: () => ipcRenderer.send('show-settings'),
    
    // 监听菜单事件
    onMenuNewProduct: (callback) => {
        ipcRenderer.on('menu-new-product', callback);
    },
    
    onMenuImportData: (callback) => {
        ipcRenderer.on('menu-import-data', callback);
    },
    
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
        readFile: (filePath) => ipcRenderer.invoke('read-file', filePath)
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
    }
});

// 在页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
    // 可以在这里添加一些初始化逻辑
    console.log('预加载脚本已加载');
    
    // 监听菜单事件
    window.electronAPI.onMenuNewProduct(() => {
        console.log('菜单：新建产品');
        // 触发页面上的新建产品功能
        const event = new CustomEvent('menu-new-product');
        window.dispatchEvent(event);
    });
    
    window.electronAPI.onMenuImportData(() => {
        console.log('菜单：导入数据');
        // 触发页面上的导入数据功能
        const event = new CustomEvent('menu-import-data');
        window.dispatchEvent(event);
    });
    
    window.electronAPI.onMenuAbout(() => {
        console.log('菜单：关于');
        // 显示关于对话框
        const event = new CustomEvent('menu-about');
        window.dispatchEvent(event);
    });
    
    // 监听商品详情页打开请求
    window.electronAPI.onNavigateToProduct((event, data) => {
        console.log('收到商品详情页打开请求:', data);
        // 触发页面上的商品详情页打开功能
        const customEvent = new CustomEvent('navigate-to-product', { detail: data });
        window.dispatchEvent(customEvent);
    });
    
    // 监听打开产品详情页请求
    window.electronAPI.onOpenProductDetail((event, data) => {
        console.log('preload.js: 收到打开产品详情页请求:', data);
        // 直接调用页面上的产品详情页打开功能
        if (window.homePageInstance && data && data.goodsId) {
            console.log('preload.js: 调用homePageInstance.viewProductDetail，商品ID:', data.goodsId);
            window.homePageInstance.viewProductDetail(data.goodsId);
        } else {
            console.warn('preload.js: 无法调用viewProductDetail，homePageInstance:', !!window.homePageInstance, 'data:', data);
        }
    });
});
