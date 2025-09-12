// 图片管理器基类
class ImageManager {
    constructor(app) {
        this.app = app;
        this.listeners = new Map(); // 事件监听器
        this.currentItem = null;
        this.imageFiles = [];
        this.sortOrder = [];
    }

    // 事件系统
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
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
    setCurrentItem(item) {
        this.currentItem = item;
        this.imageFiles = [];
        this.sortOrder = [];
        this.emit('itemChanged', { item });
    }

    // 更新图片文件列表
    updateImageFiles(files) {
        const oldFiles = [...this.imageFiles];
        this.imageFiles = files || [];
        
        // 如果排序配置存在，按排序显示
        if (this.sortOrder.length > 0) {
            this.imageFiles = this.applySortOrder(this.imageFiles);
        }
        
        this.emit('filesChanged', { 
            oldFiles, 
            newFiles: this.imageFiles,
            added: this.imageFiles.filter(f => !oldFiles.some(of => of.name === f.name)),
            removed: oldFiles.filter(of => !this.imageFiles.some(f => f.name === of.name))
        });
    }

    // 应用排序配置
    applySortOrder(files) {
        if (!this.sortOrder || this.sortOrder.length === 0) {
            return files;
        }

        const sortedFiles = [];
        
        // 按照排序配置的顺序排列文件
        this.sortOrder.forEach(fileName => {
            const file = files.find(f => f.name === fileName);
            if (file) {
                sortedFiles.push(file);
            }
        });
        
        // 添加排序配置中不存在的文件（新上传的文件）
        files.forEach(file => {
            if (!this.sortOrder.includes(file.name)) {
                sortedFiles.push(file);
            }
        });
        
        return sortedFiles;
    }

    // 更新排序配置
    updateSortOrder(order) {
        this.sortOrder = order || [];
        this.imageFiles = this.applySortOrder(this.imageFiles);
        this.emit('sortChanged', { order: this.sortOrder });
    }

    // 获取文件类型
    getFileType(fileName) {
        const ext = fileName.toLowerCase().split('.').pop();
        
        // 图片格式
        const imageFormats = [
            'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'tif', 
            'svg', 'ico', 'heic', 'heif', 'avif', 'jfif', 'pjpeg', 'pjp'
        ];
        
        // 视频格式
        const videoFormats = [
            'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v', 
            '3gp', '3g2', 'asf', 'rm', 'rmvb', 'vob', 'ogv', 'mts', 
            'm2ts', 'ts', 'divx', 'xvid', 'f4v', 'f4p', 'f4a', 'f4b'
        ];
        
        if (imageFormats.includes(ext)) return 'image';
        if (videoFormats.includes(ext)) return 'video';
        if (ext === 'pdf') return 'pdf';
        return 'default';
    }

    // 过滤图片和视频文件
    filterImageVideoFiles(files) {
        return files.filter(file => {
            const fileType = this.getFileType(file.name);
            return fileType === 'image' || fileType === 'video';
        });
    }

    // 清空数据
    clear() {
        this.currentItem = null;
        this.imageFiles = [];
        this.sortOrder = [];
        this.emit('cleared', {});
    }
}
