// 图片删除管理器
class ImageDeleteManager extends ImageManager {
    constructor(app) {
        super(app);
        this.deleteQueue = [];
        this.isDeleting = false;
    }

    // 删除单个文件
    async deleteFile(fileName) {
        // 尝试从应用实例获取当前选中的项目
        const currentItem = this.currentItem || this.app?.selectedItem;
        if (!currentItem) {
            console.error('没有选中的项目，无法删除文件');
            throw new Error('没有选中的项目');
        }

        const filePath = `${currentItem.path}/${fileName}`;
        console.log(`准备删除文件: ${filePath}`);
        
        try {
            const result = await window.electronAPI.deleteFile(filePath);
            
            if (result.success) {
                console.log(`成功删除: ${fileName}`);
                this.emit('fileDeleted', { fileName, success: true });
                return true;
            } else {
                console.error(`删除失败: ${fileName}`, result.error);
                this.emit('fileDeleted', { fileName, success: false, error: result.error });
                return false;
            }
        } catch (error) {
            console.error(`删除文件失败: ${fileName}`, error);
            this.emit('fileDeleted', { fileName, success: false, error });
            return false;
        }
    }

    // 批量删除文件
    async deleteFiles(fileNames) {
        if (!Array.isArray(fileNames) || fileNames.length === 0) {
            return { success: 0, failed: 0, errors: [] };
        }

        this.isDeleting = true;
        this.emit('deleteStarted', { fileNames });

        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        for (const fileName of fileNames) {
            try {
                const success = await this.deleteFile(fileName);
                if (success) {
                    results.success++;
                } else {
                    results.failed++;
                    results.errors.push(`${fileName}: 删除失败`);
                }
            } catch (error) {
                results.failed++;
                results.errors.push(`${fileName}: ${error.message}`);
            }
        }

        this.isDeleting = false;
        this.emit('deleteCompleted', results);

        // 重新加载详情内容
        if (results.success > 0) {
            const currentItem = this.currentItem || this.app?.selectedItem;
            if (currentItem) {
                console.log('删除成功，重新加载详情内容');
                await this.app.loadItemDetail(currentItem.path, currentItem.name);
            } else {
                console.warn('无法获取当前项目，跳过重新加载详情内容');
            }
        }

        return results;
    }

    // 确认删除对话框
    showDeleteConfirmDialog(fileName) {
        return new Promise((resolve) => {
            const confirmed = confirm(`确定要删除文件 "${fileName}" 吗？\n\n此操作不可撤销。`);
            resolve(confirmed);
        });
    }

    // 确认批量删除对话框
    showBatchDeleteConfirmDialog(fileNames) {
        return new Promise((resolve) => {
            const confirmed = confirm(`确定要删除 ${fileNames.length} 个文件吗？\n\n此操作不可撤销。`);
            resolve(confirmed);
        });
    }

    // 删除文件（带确认）
    async deleteFileWithConfirm(fileName) {
        const confirmed = await this.showDeleteConfirmDialog(fileName);
        if (confirmed) {
            return await this.deleteFile(fileName);
        }
        return false;
    }

    // 批量删除文件（带确认）
    async deleteFilesWithConfirm(fileNames) {
        const confirmed = await this.showBatchDeleteConfirmDialog(fileNames);
        if (confirmed) {
            return await this.deleteFiles(fileNames);
        }
        return { success: 0, failed: 0, errors: [] };
    }

    // 清空所有图片
    async clearAllImages() {
        const imageFiles = this.imageFiles.map(f => f.name);
        if (imageFiles.length === 0) {
            return { success: 0, failed: 0, errors: [] };
        }

        const confirmed = confirm(`确定要删除所有 ${imageFiles.length} 个图片/视频文件吗？\n\n此操作不可撤销。`);
        if (confirmed) {
            return await this.deleteFiles(imageFiles);
        }
        return { success: 0, failed: 0, errors: [] };
    }

    // 获取删除状态
    getDeleteStatus() {
        return {
            isDeleting: this.isDeleting,
            queueLength: this.deleteQueue.length
        };
    }

    // 取消删除
    cancelDelete() {
        this.deleteQueue = [];
        this.isDeleting = false;
        this.emit('deleteCancelled', {});
    }
}
