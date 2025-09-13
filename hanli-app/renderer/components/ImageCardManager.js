/**
 * 图片卡片管理器
 * 负责处理图片的框选、拖拽、删除、添加等功能
 */
class ImageCardManager {
    constructor(app) {
        this.app = app;
        this.isSelecting = false;
        this.selectionBox = null;
        this.startX = 0;
        this.startY = 0;
        this.endX = 0;
        this.endY = 0;
    }

    /**
     * 处理图片框选
     * @param {Event} e - 事件对象
     * @param {HTMLElement} item - 图片项元素
     */
    handleImageSelection(e, item) {
        e.preventDefault();
        e.stopPropagation();
        
        const isCtrlSelect = e.ctrlKey || e.metaKey;
        const isShiftSelect = e.shiftKey;
        
        if (isShiftSelect) {
            // Shift 键范围选择
            this.handleRangeSelection(item);
        } else if (isCtrlSelect) {
            // Ctrl/Cmd 键多选：切换当前项选中状态
            item.classList.toggle('selected');
        } else {
            // 单选模式：清除所有选中状态，选中当前项
            document.querySelectorAll('.file-preview-item.selected').forEach(selectedItem => {
                selectedItem.classList.remove('selected');
            });
            item.classList.add('selected');
        }
        
        // 更新框选状态
        this.updateSelectionState();
    }

    /**
     * 绑定添加图片事件
     * @param {HTMLElement} addImageBtn - 添加图片按钮
     */
    bindAddImageEvents(addImageBtn) {
        // 点击添加图片
        addImageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.app.addImage();
        });

        // 拖拽文件到添加按钮
        addImageBtn.addEventListener('dragover', (e) => {
            e.preventDefault();
            addImageBtn.classList.add('drag-over');
        });

        addImageBtn.addEventListener('dragleave', (e) => {
            e.preventDefault();
            addImageBtn.classList.remove('drag-over');
        });

        addImageBtn.addEventListener('drop', (e) => {
            e.preventDefault();
            addImageBtn.classList.remove('drag-over');
            
            const files = Array.from(e.dataTransfer.files);
            this.app.handleFileDrop(files);
        });
    }

    /**
     * 处理删除文件
     * @param {string} fileName - 文件名
     */
    async handleDeleteFile(fileName) {
        if (!this.app.selectedItem) {
            console.error('没有选中的项目');
            return;
        }

        // 显示确认对话框
        const confirmed = confirm(`确定要删除文件 "${fileName}" 吗？\n\n此操作不可撤销。`);
        if (!confirmed) {
            return;
        }

        try {
            // 调用主应用的删除文件方法
            await this.app.deleteFile(fileName);
            
            // 刷新详情内容
            if (this.app.detailColumn && typeof this.app.detailColumn.renderDetailContent === 'function') {
                await this.app.detailColumn.renderDetailContent(this.app.selectedItem);
            }
            
            this.app.updateStatus(`文件 "${fileName}" 已删除`);
        } catch (error) {
            console.error('删除文件失败:', error);
            this.app.updateStatus('删除文件失败: ' + error.message);
        }
    }
    
    /**
     * 处理范围选择（Shift 键）
     * @param {HTMLElement} targetItem - 目标项
     */
    handleRangeSelection(targetItem) {
        const allItems = Array.from(document.querySelectorAll('.file-preview-item'));
        const selectedItems = document.querySelectorAll('.file-preview-item.selected');
        
        if (selectedItems.length === 0) {
            // 如果没有已选中的项，只选中当前项
            targetItem.classList.add('selected');
            return;
        }
        
        // 找到最后选中的项作为起始点
        const lastSelected = selectedItems[selectedItems.length - 1];
        const startIndex = allItems.indexOf(lastSelected);
        const endIndex = allItems.indexOf(targetItem);
        
        // 选择范围内的所有项
        const start = Math.min(startIndex, endIndex);
        const end = Math.max(startIndex, endIndex);
        
        for (let i = start; i <= end; i++) {
            allItems[i].classList.add('selected');
        }
    }
    
    /**
     * 更新框选状态
     */
    updateSelectionState() {
        const selectedItems = document.querySelectorAll('.file-preview-item.selected');
        const allImageItems = document.querySelectorAll('.file-preview-item');
        
        // 为所有图片项添加可框选状态
        allImageItems.forEach(item => {
            item.classList.add('selectable');
        });
        
        // 如果有选中的项，显示选中数量
        if (selectedItems.length > 0) {
            console.log(`已选中 ${selectedItems.length} 个文件`);
        }
    }
    
    /**
     * 清除所有选中状态
     */
    clearSelection() {
        document.querySelectorAll('.file-preview-item.selected').forEach(item => {
            item.classList.remove('selected');
        });
        this.updateSelectionState();
    }
    
    /**
     * 添加框选拖拽功能
     * @param {HTMLElement} container - 容器元素
     */
    addSelectionBoxFeature(container) {
        const filePreviewGrid = container.querySelector('.file-preview-grid');
        if (!filePreviewGrid) return;
        
        // 找到包含图片的详情卡片区域
        const detailSectionCard = filePreviewGrid.closest('.detail-section-card');
        if (!detailSectionCard) return;
        
        // 鼠标按下事件
        filePreviewGrid.addEventListener('mousedown', (e) => {
            // 只处理左键点击
            if (e.button !== 0) return;
            
            // 如果点击的是图片项，不启动框选
            if (e.target.closest('.file-preview-item')) return;
            
            e.preventDefault();
            
            this.isSelecting = true;
            this.startX = e.clientX;
            this.startY = e.clientY;
            
            // 创建选择框
            this.selectionBox = document.createElement('div');
            this.selectionBox.className = 'selection-box';
            this.selectionBox.style.position = 'absolute';
            this.selectionBox.style.border = '2px dashed #007acc';
            this.selectionBox.style.backgroundColor = 'rgba(0, 122, 204, 0.1)';
            this.selectionBox.style.pointerEvents = 'none';
            this.selectionBox.style.zIndex = '1000';
            
            detailSectionCard.appendChild(this.selectionBox);
            detailSectionCard.classList.add('selecting');
            filePreviewGrid.classList.add('selecting');
        });
        
        // 鼠标移动事件
        filePreviewGrid.addEventListener('mousemove', (e) => {
            if (!this.isSelecting || !this.selectionBox) return;
            
            this.endX = e.clientX;
            this.endY = e.clientY;
            
            // 更新选择框位置和大小
            const left = Math.min(this.startX, this.endX);
            const top = Math.min(this.startY, this.endY);
            const width = Math.abs(this.endX - this.startX);
            const height = Math.abs(this.endY - this.startY);
            
            this.selectionBox.style.left = left + 'px';
            this.selectionBox.style.top = top + 'px';
            this.selectionBox.style.width = width + 'px';
            this.selectionBox.style.height = height + 'px';
            
            // 检查哪些图片在选择框内
            const filePreviewItems = filePreviewGrid.querySelectorAll('.file-preview-item');
            filePreviewItems.forEach(item => {
                const rect = item.getBoundingClientRect();
                const isInSelection = (
                    rect.left < Math.max(this.startX, this.endX) &&
                    rect.right > Math.min(this.startX, this.endX) &&
                    rect.top < Math.max(this.startY, this.endY) &&
                    rect.bottom > Math.min(this.startY, this.endY)
                );
                
                if (isInSelection) {
                    item.classList.add('in-selection');
                } else {
                    item.classList.remove('in-selection');
                }
            });
        });
        
        // 鼠标释放事件
        filePreviewGrid.addEventListener('mouseup', (e) => {
            if (!this.isSelecting || !this.selectionBox) return;
            
            this.isSelecting = false;
            detailSectionCard.classList.remove('selecting');
            filePreviewGrid.classList.remove('selecting');
            
            // 获取选择框内的图片
            const selectedItems = filePreviewGrid.querySelectorAll('.file-preview-item.in-selection');
            
            // 清除所有图片的in-selection状态
            filePreviewGrid.querySelectorAll('.file-preview-item').forEach(item => {
                item.classList.remove('in-selection');
            });
            
            const isShiftSelect = e.shiftKey;
            
            // 如果不是Shift框选，清除之前的选择
            if (!isShiftSelect) {
                document.querySelectorAll('.file-preview-item.selected').forEach(item => {
                    item.classList.remove('selected');
                });
            }
            
            if (isShiftSelect) {
                // Shift框选：反向选择（已选中的取消选择，未选中的添加选择）
                selectedItems.forEach(item => {
                    item.classList.toggle('selected');
                });
            } else {
                // 普通框选：直接选择框内的所有图片
                selectedItems.forEach(item => {
                    item.classList.add('selected');
                });
            }
            
            // 移除选择框
            if (this.selectionBox && this.selectionBox.parentNode) {
                this.selectionBox.parentNode.removeChild(this.selectionBox);
            }
            this.selectionBox = null;
            
            this.updateSelectionState();
        });
        
        // 鼠标离开事件
        filePreviewGrid.addEventListener('mouseleave', () => {
            if (this.isSelecting && this.selectionBox) {
                this.isSelecting = false;
                detailSectionCard.classList.remove('selecting');
                filePreviewGrid.classList.remove('selecting');
                
                if (this.selectionBox && this.selectionBox.parentNode) {
                    this.selectionBox.parentNode.removeChild(this.selectionBox);
                }
                this.selectionBox = null;
            }
        });
    }

    /**
     * 初始化图片卡片功能
     * @param {HTMLElement} container - 容器元素
     */
    init(container) {
        // 添加框选拖拽功能
        this.addSelectionBoxFeature(container);
        
        // 绑定添加图片事件
        const addImageBtn = container.querySelector('#addImageBtn');
        if (addImageBtn) {
            this.bindAddImageEvents(addImageBtn);
        }
        
        // 绑定图片选择事件
        const imageItems = container.querySelectorAll('.file-preview-item');
        imageItems.forEach(item => {
            item.addEventListener('click', (e) => {
                this.handleImageSelection(e, item);
            });
        });
    }

    /**
     * 销毁管理器
     */
    destroy() {
        this.clearSelection();
        this.isSelecting = false;
        this.selectionBox = null;
    }
}

// 导出到全局
window.ImageCardManager = ImageCardManager;
