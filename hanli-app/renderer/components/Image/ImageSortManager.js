// 图片排序管理器
class ImageSortManager extends ImageManager {
    constructor(app) {
        super(app);
        this.dragState = {
            isDragging: false,
            draggedElement: null,
            draggedIndex: -1,
            dropIndex: -1
        };
    }

    // 加载排序配置
    async loadSortConfig(itemPath) {
        try {
            const sortConfigPath = `${itemPath}/image_sort.json`;
            const result = await window.electronAPI.readFile(sortConfigPath);
            
            if (result.success && result.data) {
                const sortConfig = JSON.parse(result.data);
                if (sortConfig.order && Array.isArray(sortConfig.order)) {
                    this.updateSortOrder(sortConfig.order);
                    return sortConfig.order;
                }
            }
        } catch (error) {
            console.warn('加载排序配置失败:', error);
        }
        return [];
    }

    // 保存排序配置
    async saveSortConfig(itemPath, order) {
        try {
            const sortConfig = {
                version: "1.0",
                lastUpdated: new Date().toISOString(),
                order: order
            };

            const sortConfigPath = `${itemPath}/image_sort.json`;
            const result = await window.electronAPI.writeFile(
                sortConfigPath, 
                Buffer.from(JSON.stringify(sortConfig, null, 2))
            );
            
            if (result.success) {
                console.log('排序配置已保存:', order);
                return true;
            } else {
                console.error('保存排序配置失败:', result.error);
                return false;
            }
        } catch (error) {
            console.error('保存排序配置失败:', error);
            return false;
        }
    }

    // 创建序号映射文件
    async createOrderMapping(itemPath, order) {
        try {
            const mappingPath = `${itemPath}/image_order_mapping.json`;
            
            const orderMapping = {};
            order.forEach((fileName, index) => {
                orderMapping[index + 1] = fileName;
            });
            
            const result = await window.electronAPI.writeFile(
                mappingPath, 
                Buffer.from(JSON.stringify(orderMapping, null, 2))
            );
            
            if (result.success) {
                console.log('序号映射文件已创建:', orderMapping);
                return true;
            } else {
                console.error('创建序号映射文件失败:', result.error);
                return false;
            }
        } catch (error) {
            console.error('创建序号映射文件失败:', error);
            return false;
        }
    }

    // 开始拖拽
    startDrag(element, index) {
        this.dragState.isDragging = true;
        this.dragState.draggedElement = element;
        this.dragState.draggedIndex = index;
        
        this.emit('dragStarted', {
            element,
            index,
            dragState: this.dragState
        });
    }

    // 结束拖拽
    endDrag() {
        this.dragState.isDragging = false;
        this.dragState.draggedElement = null;
        this.dragState.draggedIndex = -1;
        this.dragState.dropIndex = -1;
        
        this.emit('dragEnded', {
            dragState: this.dragState
        });
    }

    // 处理拖拽移动
    handleDragMove(e) {
        if (!this.dragState.isDragging) return;

        // 这里可以添加拖拽移动时的视觉反馈逻辑
        // 比如高亮目标位置、显示拖拽预览等
        console.log('拖拽移动中...', e.clientX, e.clientY);
    }

    // 处理拖拽排序
    handleDragSort(fromIndex, toIndex) {
        if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
            return false;
        }

        const newOrder = [...this.sortOrder];
        const draggedItem = newOrder[fromIndex];
        
        // 移除拖拽的项目
        newOrder.splice(fromIndex, 1);
        
        // 插入到新位置
        newOrder.splice(toIndex, 0, draggedItem);
        
        // 更新排序
        this.updateSortOrder(newOrder);
        
        this.emit('sortChanged', {
            fromIndex,
            toIndex,
            newOrder: this.sortOrder
        });
        
        return true;
    }

    // 交换两个图片的位置
    swapImages(index1, index2) {
        if (index1 === index2 || index1 < 0 || index2 < 0) {
            return false;
        }

        const newOrder = [...this.sortOrder];
        [newOrder[index1], newOrder[index2]] = [newOrder[index2], newOrder[index1]];
        
        this.updateSortOrder(newOrder);
        
        this.emit('sortChanged', {
            fromIndex: index1,
            toIndex: index2,
            newOrder: this.sortOrder
        });
        
        return true;
    }

    // 移动图片到指定位置
    moveImage(fromIndex, toIndex) {
        if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
            return false;
        }

        const newOrder = [...this.sortOrder];
        const item = newOrder.splice(fromIndex, 1)[0];
        newOrder.splice(toIndex, 0, item);
        
        this.updateSortOrder(newOrder);
        
        this.emit('sortChanged', {
            fromIndex,
            toIndex,
            newOrder: this.sortOrder
        });
        
        return true;
    }

    // 重置排序
    resetSort() {
        const originalOrder = this.imageFiles.map(f => f.name);
        this.updateSortOrder(originalOrder);
        
        this.emit('sortReset', {
            newOrder: this.sortOrder
        });
    }

    // 获取当前排序
    getCurrentSort() {
        return [...this.sortOrder];
    }

    // 检查是否有自定义排序
    hasCustomSort() {
        return this.sortOrder.length > 0;
    }

    // 重写父类的文件更新方法
    updateImageFiles(files) {
        super.updateImageFiles(files);
        
        // 如果排序配置存在，按排序显示
        if (this.sortOrder.length > 0) {
            this.imageFiles = this.applySortOrder(this.imageFiles);
        }
    }
}
