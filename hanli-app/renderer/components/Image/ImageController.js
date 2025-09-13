// 图片控制器 - 统一管理所有图片相关功能
class ImageController {
    constructor(app) {
        this.app = app;
        
        // 初始化各个管理器
        this.selectionManager = new ImageSelectionManager(app);
        this.sortManager = new ImageSortManager(app);
        this.uploadManager = new ImageUploadManager(app);
        this.deleteManager = new ImageDeleteManager(app);
        
        // 绑定事件
        this.bindEvents();
    }

    // 绑定事件
    bindEvents() {
        // 选择管理器事件
        this.selectionManager.on('selectionChanged', (data) => {
            this.emit('selectionChanged', data);
        });

        // 排序管理器事件
        this.sortManager.on('sortChanged', (data) => {
            this.emit('sortChanged', data);
        });

        this.sortManager.on('dragStarted', (data) => {
            this.emit('dragStarted', data);
        });

        this.sortManager.on('dragEnded', (data) => {
            this.emit('dragEnded', data);
        });

        // 上传管理器事件
        this.uploadManager.on('filesAdded', (data) => {
            this.emit('filesAdded', data);
        });

        this.uploadManager.on('uploadStarted', (data) => {
            this.emit('uploadStarted', data);
        });

        this.uploadManager.on('fileUploaded', (data) => {
            this.emit('fileUploaded', data);
        });

        this.uploadManager.on('uploadCompleted', (data) => {
            // 同步排序配置到排序管理器
            if (this.uploadManager.sortOrder) {
                this.sortManager.updateSortOrder(this.uploadManager.sortOrder);
            }
            this.emit('uploadCompleted', data);
        });

        this.uploadManager.on('uploadError', (data) => {
            this.emit('uploadError', data);
        });

        // 删除管理器事件
        this.deleteManager.on('fileDeleted', (data) => {
            this.emit('fileDeleted', data);
        });

        this.deleteManager.on('deleteStarted', (data) => {
            this.emit('deleteStarted', data);
        });

        this.deleteManager.on('deleteCompleted', (data) => {
            this.emit('deleteCompleted', data);
        });
    }

    // 事件系统
    on(event, callback) {
        if (!this.listeners) {
            this.listeners = new Map();
        }
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.listeners && this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.listeners && this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`事件 ${event} 监听器执行失败:`, error);
                }
            });
        }
    }

    // 设置当前商品
    async setCurrentItem(item) {
        this.selectionManager.setCurrentItem(item);
        this.sortManager.setCurrentItem(item);
        this.uploadManager.setCurrentItem(item);
        this.deleteManager.setCurrentItem(item);

        // 加载排序配置
        if (item) {
            const sortOrder = await this.sortManager.loadSortConfig(item.path);
            // 将排序配置传递给上传管理器
            this.uploadManager.sortOrder = sortOrder;
        }
    }

    // 更新图片文件列表
    updateImageFiles(files) {
        const imageVideoFiles = this.sortManager.filterImageVideoFiles(files);
        
        this.selectionManager.updateImageFiles(imageVideoFiles);
        this.sortManager.updateImageFiles(imageVideoFiles);
        this.uploadManager.updateImageFiles(imageVideoFiles);
        this.deleteManager.updateImageFiles(imageVideoFiles);
    }

    // 选择相关方法
    selectImage(fileName, index, event) {
        return this.selectionManager.selectImage(fileName, index, event);
    }

    deselectImage(fileName) {
        return this.selectionManager.deselectImage(fileName);
    }

    clearSelection() {
        return this.selectionManager.clearSelection();
    }

    selectAll() {
        return this.selectionManager.selectAll();
    }

    invertSelection() {
        return this.selectionManager.invertSelection();
    }

    isSelected(fileName) {
        return this.selectionManager.isSelected(fileName);
    }

    getSelectedImages() {
        return this.selectionManager.getSelectedImages();
    }

    getSelectionCount() {
        return this.selectionManager.getSelectionCount();
    }

    setSelectionMode(mode) {
        return this.selectionManager.setSelectionMode(mode);
    }

    // 排序相关方法
    startDrag(element, index) {
        return this.sortManager.startDrag(element, index);
    }

    endDrag() {
        return this.sortManager.endDrag();
    }

    handleDragMove(e) {
        return this.sortManager.handleDragMove(e);
    }

    handleDragSort(fromIndex, toIndex) {
        return this.sortManager.handleDragSort(fromIndex, toIndex);
    }

    swapImages(index1, index2) {
        return this.sortManager.swapImages(index1, index2);
    }

    moveImage(fromIndex, toIndex) {
        return this.sortManager.moveImage(fromIndex, toIndex);
    }

    resetSort() {
        return this.sortManager.resetSort();
    }

    getCurrentSort() {
        return this.sortManager.getCurrentSort();
    }

    hasCustomSort() {
        return this.sortManager.hasCustomSort();
    }

    // 上传相关方法
    addFiles(files) {
        return this.uploadManager.addFiles(files);
    }

    openFileSelector() {
        return this.uploadManager.openFileSelector();
    }

    handleDragUpload(e) {
        return this.uploadManager.handleDragUpload(e);
    }

    getQueueStatus() {
        return this.uploadManager.getQueueStatus();
    }

    cancelUpload() {
        return this.uploadManager.cancelUpload();
    }

    // 删除相关方法
    deleteFile(fileName) {
        return this.deleteManager.deleteFile(fileName);
    }

    deleteFiles(fileNames) {
        return this.deleteManager.deleteFiles(fileNames);
    }

    deleteFileWithConfirm(fileName) {
        return this.deleteManager.deleteFileWithConfirm(fileName);
    }

    deleteFilesWithConfirm(fileNames) {
        return this.deleteManager.deleteFilesWithConfirm(fileNames);
    }

    clearAllImages() {
        return this.deleteManager.clearAllImages();
    }

    getDeleteStatus() {
        return this.deleteManager.getDeleteStatus();
    }

    cancelDelete() {
        return this.deleteManager.cancelDelete();
    }

    // 获取当前图片文件列表
    getImageFiles() {
        return this.sortManager.imageFiles;
    }

    // 获取文件类型
    getFileType(fileName) {
        return this.sortManager.getFileType(fileName);
    }

    // 清空所有数据
    clear() {
        this.selectionManager.clear();
        this.sortManager.clear();
        this.uploadManager.clear();
        this.deleteManager.clear();
    }
}
