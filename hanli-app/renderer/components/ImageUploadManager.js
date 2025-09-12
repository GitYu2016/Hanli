// 图片上传管理器
class ImageUploadManager extends ImageManager {
    constructor(app) {
        super(app);
        this.uploadQueue = [];
        this.isUploading = false;
    }

    // 添加上传文件
    addFiles(files) {
        const fileArray = Array.from(files);
        const validFiles = fileArray.filter(file => {
            const fileType = this.getFileType(file.name);
            return fileType === 'image' || fileType === 'video';
        });

        if (validFiles.length === 0) {
            this.emit('uploadError', { message: '没有有效的图片或视频文件' });
            return;
        }

        this.uploadQueue.push(...validFiles);
        this.emit('filesAdded', { 
            files: validFiles,
            queueLength: this.uploadQueue.length
        });

        if (!this.isUploading) {
            this.processUploadQueue();
        }
    }

    // 处理上传队列
    async processUploadQueue() {
        if (this.isUploading || this.uploadQueue.length === 0) {
            return;
        }

        this.isUploading = true;
        this.emit('uploadStarted', { queueLength: this.uploadQueue.length });

        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        while (this.uploadQueue.length > 0) {
            const file = this.uploadQueue.shift();
            try {
                const success = await this.uploadFile(file);
                if (success) {
                    results.success++;
                    this.emit('fileUploaded', { file, success: true });
                } else {
                    results.failed++;
                    results.errors.push(`${file.name}: 上传失败`);
                    this.emit('fileUploaded', { file, success: false });
                }
            } catch (error) {
                results.failed++;
                results.errors.push(`${file.name}: ${error.message}`);
                this.emit('fileUploaded', { file, success: false, error });
            }
        }

        this.isUploading = false;
        this.emit('uploadCompleted', results);

        // 重新加载详情内容
        if (results.success > 0 && this.currentItem) {
            console.log('上传完成，重新加载详情内容...');
            await this.app.loadItemDetail(this.currentItem.path, this.currentItem.name);
        }
    }

    // 上传单个文件
    async uploadFile(file) {
        if (!this.currentItem) {
            throw new Error('没有选中的项目');
        }

        const targetPath = this.currentItem.path;
        const targetFilePath = `${targetPath}/${file.name}`;

        try {
            // 读取文件内容
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // 写入文件
            const result = await window.electronAPI.writeFile(targetFilePath, buffer);
            
            if (result.success) {
                console.log(`成功上传: ${file.name}`);
                
                // 将新文件添加到排序配置中
                this.addToSortOrder(file.name);
                
                return true;
            } else {
                console.error(`上传失败: ${file.name}`, result.error);
                return false;
            }
        } catch (error) {
            console.error(`处理文件失败: ${file.name}`, error);
            return false;
        }
    }

    // 添加文件到排序配置
    addToSortOrder(fileName) {
        // 获取当前排序配置
        const currentSort = this.sortOrder || [];
        
        // 如果文件不在排序配置中，添加到末尾
        if (!currentSort.includes(fileName)) {
            currentSort.push(fileName);
            this.sortOrder = currentSort; // 更新本地排序配置
            
            // 通知排序管理器更新
            this.updateSortOrder(currentSort);
            
            // 保存排序配置
            this.saveSortConfig();
            
            console.log(`文件 ${fileName} 已添加到排序配置，新序号: ${currentSort.length}`);
        }
    }

    // 保存排序配置
    async saveSortConfig() {
        if (!this.currentItem || !this.sortOrder) {
            return;
        }

        try {
            const sortConfig = {
                version: "1.0",
                lastUpdated: new Date().toISOString(),
                order: this.sortOrder
            };

            const sortConfigPath = `${this.currentItem.path}/image_sort.json`;
            const result = await window.electronAPI.writeFile(
                sortConfigPath, 
                Buffer.from(JSON.stringify(sortConfig, null, 2))
            );
            
            if (result.success) {
                console.log('排序配置已保存:', this.sortOrder);
            } else {
                console.error('保存排序配置失败:', result.error);
            }
        } catch (error) {
            console.error('保存排序配置失败:', error);
        }
    }

    // 清空上传队列
    clearQueue() {
        this.uploadQueue = [];
        this.emit('queueCleared', {});
    }

    // 获取队列状态
    getQueueStatus() {
        return {
            isUploading: this.isUploading,
            queueLength: this.uploadQueue.length,
            files: [...this.uploadQueue]
        };
    }

    // 取消上传
    cancelUpload() {
        this.uploadQueue = [];
        this.isUploading = false;
        this.emit('uploadCancelled', {});
    }

    // 创建文件选择器
    createFileSelector() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,video/*,.webp,.bmp,.tiff,.tif,.svg,.ico,.heic,.heif,.avif,.jfif,.pjpeg,.pjp,.flv,.webm,.mkv,.m4v,.3gp,.3g2,.asf,.rm,.rmvb,.vob,.ogv,.mts,.m2ts,.ts,.divx,.xvid,.f4v,.f4p,.f4a,.f4b';
        input.multiple = true;
        
        input.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                this.addFiles(files);
            }
        });
        
        return input;
    }

    // 打开文件选择器
    openFileSelector() {
        const input = this.createFileSelector();
        input.click();
    }

    // 处理拖拽上传
    handleDragUpload(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            this.addFiles(files);
        }
    }

    // 设置当前商品
    setCurrentItem(item) {
        super.setCurrentItem(item);
        this.clearQueue();
    }
}
