const { contextBridge, ipcRenderer } = require('electron');

// 通过contextBridge安全地暴露API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 获取应用版本
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // 获取数据文件夹路径
  getDataPath: () => ipcRenderer.invoke('get-data-path'),
  
  // 读取文件
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  
  // 读取图片文件
  readImage: (filePath) => ipcRenderer.invoke('read-image', filePath),
  
  // 列出目录内容
  listDirectories: (dirPath) => ipcRenderer.invoke('list-directories', dirPath),
  
  // 打开文件夹
  openFolder: (folderPath) => ipcRenderer.invoke('open-folder', folderPath),
  
  // 打开文件
  openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),
  
  // 写入文件
  writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data),
  
  // 删除文件
  deleteFile: (filePath) => ipcRenderer.invoke('delete-file', filePath),
  
  // 选择文件夹
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  
  // 窗口大小调整
  resizeToMainApp: () => ipcRenderer.invoke('resize-to-main-app'),
  resizeToFolderSelection: () => ipcRenderer.invoke('resize-to-folder-selection'),
  
  // 商品数据相关
  saveGoodsData: (goodsData) => ipcRenderer.invoke('save-goods-data', goodsData),
  getMonitoringFiles: (goodsId) => ipcRenderer.invoke('get-monitoring-files', goodsId),
  onImportGoodsData: (callback) => {
    ipcRenderer.on('import-goods-data', (event, goodsData) => {
      callback(goodsData);
    });
  },
  
  // 平台信息
  platform: process.platform,
  
  // 开发模式检测
  isDev: process.argv.includes('--dev')
});
