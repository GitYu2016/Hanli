// 图片选择管理器
class ImageSelectionManager extends ImageManager {
    constructor(app) {
        super(app);
        this.selectedImages = new Set();
        this.selectionMode = 'single'; // 'single', 'multiple', 'range'
        this.lastSelectedIndex = -1;
    }

    // 选择图片
    selectImage(fileName, index, event) {
        const isCtrlPressed = event.ctrlKey || event.metaKey;
        const isShiftPressed = event.shiftKey;

        if (this.selectionMode === 'single' || (!isCtrlPressed && !isShiftPressed)) {
            // 单选模式
            this.selectedImages.clear();
            this.selectedImages.add(fileName);
            this.lastSelectedIndex = index;
        } else if (isCtrlPressed) {
            // Ctrl/Cmd + 点击：多选
            if (this.selectedImages.has(fileName)) {
                this.selectedImages.delete(fileName);
            } else {
                this.selectedImages.add(fileName);
            }
            this.lastSelectedIndex = index;
        } else if (isShiftPressed && this.lastSelectedIndex !== -1) {
            // Shift + 点击：范围选择
            const startIndex = Math.min(this.lastSelectedIndex, index);
            const endIndex = Math.max(this.lastSelectedIndex, index);
            
            for (let i = startIndex; i <= endIndex; i++) {
                if (i < this.imageFiles.length) {
                    this.selectedImages.add(this.imageFiles[i].name);
                }
            }
        }

        this.emit('selectionChanged', {
            selectedImages: Array.from(this.selectedImages),
            selectionCount: this.selectedImages.size
        });
    }

    // 取消选择图片
    deselectImage(fileName) {
        this.selectedImages.delete(fileName);
        this.emit('selectionChanged', {
            selectedImages: Array.from(this.selectedImages),
            selectionCount: this.selectedImages.size
        });
    }

    // 清空选择
    clearSelection() {
        this.selectedImages.clear();
        this.lastSelectedIndex = -1;
        this.emit('selectionChanged', {
            selectedImages: [],
            selectionCount: 0
        });
    }

    // 全选
    selectAll() {
        this.selectedImages.clear();
        this.imageFiles.forEach(file => {
            this.selectedImages.add(file.name);
        });
        this.emit('selectionChanged', {
            selectedImages: Array.from(this.selectedImages),
            selectionCount: this.selectedImages.size
        });
    }

    // 反选
    invertSelection() {
        const newSelection = new Set();
        this.imageFiles.forEach(file => {
            if (!this.selectedImages.has(file.name)) {
                newSelection.add(file.name);
            }
        });
        this.selectedImages = newSelection;
        this.emit('selectionChanged', {
            selectedImages: Array.from(this.selectedImages),
            selectionCount: this.selectedImages.size
        });
    }

    // 检查图片是否被选中
    isSelected(fileName) {
        return this.selectedImages.has(fileName);
    }

    // 获取选中的图片
    getSelectedImages() {
        return Array.from(this.selectedImages);
    }

    // 获取选中的图片数量
    getSelectionCount() {
        return this.selectedImages.size;
    }

    // 设置选择模式
    setSelectionMode(mode) {
        this.selectionMode = mode;
        if (mode === 'single') {
            this.clearSelection();
        }
        this.emit('selectionModeChanged', { mode });
    }

    // 处理图片删除后的选择更新
    onImageDeleted(deletedFileName) {
        this.selectedImages.delete(deletedFileName);
        this.emit('selectionChanged', {
            selectedImages: Array.from(this.selectedImages),
            selectionCount: this.selectedImages.size
        });
    }

    // 处理图片添加后的选择更新
    onImageAdded(addedFileName) {
        // 新添加的图片默认不选中
        this.emit('selectionChanged', {
            selectedImages: Array.from(this.selectedImages),
            selectionCount: this.selectedImages.size
        });
    }

    // 重写父类的文件更新方法
    updateImageFiles(files) {
        super.updateImageFiles(files);
        
        // 清理已删除文件的选择状态
        const currentFileNames = this.imageFiles.map(f => f.name);
        const toRemove = [];
        this.selectedImages.forEach(fileName => {
            if (!currentFileNames.includes(fileName)) {
                toRemove.push(fileName);
            }
        });
        toRemove.forEach(fileName => this.selectedImages.delete(fileName));
        
        if (toRemove.length > 0) {
            this.emit('selectionChanged', {
                selectedImages: Array.from(this.selectedImages),
                selectionCount: this.selectedImages.size
            });
        }
    }
}
