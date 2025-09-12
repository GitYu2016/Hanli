// 图片画廊组件
class ImageGallery {
    constructor(app) {
        this.app = app;
        this.container = null;
        this.imageController = null;
    }

    // 渲染图片画廊
    async render(files, itemPath, showAddButton = true, showDeleteBtn = true) {
        // 初始化图片控制器
        if (!this.imageController) {
            this.imageController = new ImageController(this.app);
            this.bindControllerEvents();
        }

        // 设置当前商品
        if (this.app.selectedItem) {
            console.log('设置图片控制器的当前项目:', this.app.selectedItem);
            await this.imageController.setCurrentItem(this.app.selectedItem);
        } else {
            console.warn('没有选中的项目，图片控制器无法设置当前项目');
        }

        // 更新图片文件列表
        this.imageController.updateImageFiles(files);

        const imageFiles = this.imageController.getImageFiles();
        
        if (imageFiles.length === 0) {
            return this.renderEmpty();
        }


        const addButton = showAddButton ? `
            <div class="file-preview-item add-image-item" id="addImageBtn">
                <div class="file-preview-image">
                    <div class="add-image-placeholder">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
                <div class="file-preview-info">
                    <div class="file-name">添加图片</div>
                </div>
            </div>
        ` : '';

        return `
            <div class="detail-section">
                <h3 class="detail-section-title">图片</h3>
                <div class="detail-section-card">
                    <div class="file-preview-grid" id="imageGalleryGrid">
                        ${imageFiles.map((file, index) => this.renderFileItem(file, itemPath, index + 1, showDeleteBtn)).join('')}
                        ${addButton}
                    </div>
                </div>
            </div>
        `;
    }

    // 渲染空状态
    renderEmpty(showAddButton = true) {
        const addButton = showAddButton ? `
            <div class="file-preview-item add-image-item" id="addImageBtn">
                <div class="file-preview-image">
                    <div class="add-image-placeholder">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
                <div class="file-preview-info">
                    <div class="file-name">添加图片</div>
                </div>
            </div>
        ` : '';

        return `
            <div class="detail-section">
                <h3 class="detail-section-title">图片</h3>
                <div class="detail-section-card">
                    <div class="file-preview-grid">
                        ${addButton}
                    </div>
                </div>
            </div>
        `;
    }

    // 绑定控制器事件
    bindControllerEvents() {
        if (!this.imageController) return;

        // 选择变化事件
        this.imageController.on('selectionChanged', (data) => {
            this.updateSelectionUI(data.selectedImages);
        });


        // 文件上传事件
        this.imageController.on('uploadCompleted', async (data) => {
            this.app.updateStatus(`上传完成: ${data.success} 成功, ${data.failed} 失败`);
            
        });

        // 文件删除事件
        this.imageController.on('deleteCompleted', (data) => {
            this.app.updateStatus(`删除完成: ${data.success} 成功, ${data.failed} 失败`);
        });
    }

    // 渲染文件项
    renderFileItem(file, itemPath, orderNumber = null, showDeleteBtn = true) {
        const fileType = this.imageController ? this.imageController.getFileType(file.name) : this.getFileType(file.name);
        const iconClass = this.getFileIconClass(fileType);
        const iconText = this.getFileIconText(fileType);
        
        if (fileType === 'image' || fileType === 'video') {
            const filePath = itemPath + '/' + file.name;
            const orderDisplay = orderNumber ? `<div class="file-order-number">${orderNumber}</div>` : '';
            
            if (fileType === 'image') {
                const deleteBtn = showDeleteBtn ? `
                    <button class="file-delete-btn" data-file-name="${file.name}" title="删除图片">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                ` : '';

                return `
                    <div class="file-preview-item" data-file-name="${file.name}" data-order="${orderNumber || ''}" >
                        ${orderDisplay}
                        <div class="file-preview-image">
                            <img src="file://${filePath}" alt="${file.name}" 
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                            <div class="file-preview-fallback" style="display: none;">
                                <div class="file-icon ${iconClass}">${iconText}</div>
                                <div class="file-name">${file.name}</div>
                            </div>
                            ${deleteBtn}
                        </div>
                        <div class="file-preview-info">
                            <div class="file-name">${file.name}</div>
                            <div class="file-size">${this.formatFileSize(file.size || 0)}</div>
                        </div>
                    </div>
                `;
            } else if (fileType === 'video') {
                const deleteBtn = showDeleteBtn ? `
                    <button class="file-delete-btn" data-file-name="${file.name}" title="删除视频">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                ` : '';

                return `
                    <div class="file-preview-item" data-file-name="${file.name}" data-order="${orderNumber || ''}" >
                        ${orderDisplay}
                        <div class="file-preview-video">
                            <video src="file://${filePath}" 
                                   onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                                   preload="metadata" muted>
                                <div class="file-preview-fallback" style="display: flex;">
                                    <div class="file-icon ${iconClass}">${iconText}</div>
                                    <div class="file-name">${file.name}</div>
                                </div>
                            </video>
                            <div class="file-preview-fallback" style="display: none;">
                                <div class="file-icon ${iconClass}">${iconText}</div>
                                <div class="file-name">${file.name}</div>
                            </div>
                            ${deleteBtn}
                        </div>
                        <div class="file-preview-info">
                            <div class="file-name">${file.name}</div>
                            <div class="file-size">${this.formatFileSize(file.size || 0)}</div>
                        </div>
                    </div>
                `;
            }
        }
        return '';
    }

    // 绑定事件
    bindEvents(container) {
        if (!container) return;

        // 为整个图片区域添加拖拽事件
        this.bindImageAreaDragEvents(container);

        // 绑定框选功能
        this.bindSelectionEvents(container);

        // 绑定文件点击事件和拖拽排序事件
        container.querySelectorAll('.file-preview-item').forEach((item, index) => {
            // 排除添加按钮
            if (item.classList.contains('add-image-item')) return;

            item.addEventListener('click', (e) => {
                this.handleImageSelection(e, item, index);
            });

            // 绑定拖拽事件
            item.addEventListener('mousedown', (e) => {
                this.handleImageDrag(e, item);
            });

        });

        // 绑定添加图片按钮事件
        const addImageBtn = container.querySelector('#addImageBtn');
        if (addImageBtn) {
            this.bindAddImageEvents(addImageBtn);
        }

        // 绑定删除按钮事件
        container.querySelectorAll('.file-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const fileName = btn.dataset.fileName;
                this.handleDeleteFile(fileName);
            });
        });
    }

    // 绑定框选功能
    bindSelectionEvents(container) {
        console.log('绑定框选功能');
        
        let isSelecting = false;
        let selectionBox = null;
        let startX = 0;
        let startY = 0;

        // 鼠标按下事件 - 开始框选
        container.addEventListener('mousedown', (e) => {
            // 排除图片和视频元素，以及它们的子元素
            if (e.target.closest('.file-preview-image, .file-preview-video')) {
                return;
            }

            // 排除添加按钮
            if (e.target.closest('.add-image-item')) {
                return;
            }

            isSelecting = true;
            startX = e.clientX;
            startY = e.clientY;

            // 创建框选框
            selectionBox = document.createElement('div');
            selectionBox.className = 'selection-box';
            selectionBox.style.left = startX + 'px';
            selectionBox.style.top = startY + 'px';
            selectionBox.style.width = '0px';
            selectionBox.style.height = '0px';
            selectionBox.style.display = 'block';
            
            document.body.appendChild(selectionBox);
            container.classList.add('selecting');

            e.preventDefault();
        });

        // 鼠标移动事件 - 更新框选
        document.addEventListener('mousemove', (e) => {
            if (!isSelecting || !selectionBox) return;

            const currentX = e.clientX;
            const currentY = e.clientY;

            const left = Math.min(startX, currentX);
            const top = Math.min(startY, currentY);
            const width = Math.abs(currentX - startX);
            const height = Math.abs(currentY - startY);

            selectionBox.style.left = left + 'px';
            selectionBox.style.top = top + 'px';
            selectionBox.style.width = width + 'px';
            selectionBox.style.height = height + 'px';

            // 检查框选范围内的图片
            this.updateSelectionInBox(container, selectionBox);
        });

        // 鼠标释放事件 - 结束框选
        document.addEventListener('mouseup', (e) => {
            if (!isSelecting || !selectionBox) return;

            isSelecting = false;
            container.classList.remove('selecting');
            
            if (selectionBox.parentNode) {
                selectionBox.parentNode.removeChild(selectionBox);
            }
            selectionBox = null;
        });
    }

    // 更新框选范围内的选择
    updateSelectionInBox(container, selectionBox) {
        const boxRect = selectionBox.getBoundingClientRect();
        const items = container.querySelectorAll('.file-preview-item:not(.add-image-item)');

        items.forEach(item => {
            const itemRect = item.getBoundingClientRect();
            
            // 检查是否在框选范围内
            const isInBox = !(itemRect.right < boxRect.left || 
                            itemRect.left > boxRect.right || 
                            itemRect.bottom < boxRect.top || 
                            itemRect.top > boxRect.bottom);

            if (isInBox) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }

    // 绑定图片区域拖拽事件
    bindImageAreaDragEvents(container) {
        console.log('绑定图片区域拖拽事件');
        
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('文件拖拽到图片区域上');
            container.classList.add('drag-over');
        });

        container.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // 只有当拖拽完全离开容器时才移除样式
            if (!container.contains(e.relatedTarget)) {
                console.log('文件拖拽离开图片区域');
                container.classList.remove('drag-over');
            }
        });

        container.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            container.classList.remove('drag-over');
            
            console.log('文件被拖拽到图片区域并释放');
            const files = Array.from(e.dataTransfer.files);
            console.log('拖拽的文件:', files);
            
            if (files.length > 0) {
                console.log('开始处理图片上传');
                this.app.handleImageUpload(files);
            } else {
                console.log('没有检测到文件');
            }
        });
    }

    // 处理图片选择
    handleImageSelection(e, item, index) {
        e.preventDefault();
        e.stopPropagation();
        
        const fileName = item.dataset.fileName;
        if (!fileName) return;

        // 检查是否点击了删除按钮
        if (e.target.closest('.file-delete-btn')) {
            this.handleDeleteFile(fileName);
            return;
        }

        // 处理多选和范围选择
        const isCtrlPressed = e.ctrlKey || e.metaKey;
        const isShiftPressed = e.shiftKey;

        if (isShiftPressed) {
            // Shift 键范围选择
            this.handleRangeSelection(item);
        } else if (isCtrlPressed) {
            // Ctrl/Cmd 键多选：切换当前项选中状态
            item.classList.toggle('selected');
        } else {
            // 单选模式：清除所有选中状态，选中当前项
            document.querySelectorAll('.file-preview-item.selected').forEach(selectedItem => {
                selectedItem.classList.remove('selected');
            });
            item.classList.add('selected');
        }

        // 更新选择状态
        this.updateSelectionState();

        // 使用图片控制器处理选择
        if (this.imageController) {
            this.imageController.selectImage(fileName, index, e);
        }
    }

    // 处理范围选择
    handleRangeSelection(targetItem) {
        const allItems = Array.from(document.querySelectorAll('.file-preview-item'));
        const selectedItems = document.querySelectorAll('.file-preview-item.selected');
        
        if (selectedItems.length === 0) {
            targetItem.classList.add('selected');
            return;
        }
        
        const targetIndex = allItems.indexOf(targetItem);
        const lastSelectedIndex = Math.max(...Array.from(selectedItems).map(item => allItems.indexOf(item)));
        
        const start = Math.min(targetIndex, lastSelectedIndex);
        const end = Math.max(targetIndex, lastSelectedIndex);
        
        for (let i = start; i <= end; i++) {
            allItems[i].classList.add('selected');
        }
    }

    // 更新选择状态
    updateSelectionState() {
        const selectedItems = document.querySelectorAll('.file-preview-item.selected');
        const allImageItems = document.querySelectorAll('.file-preview-item');
        
        allImageItems.forEach(item => {
            if (!item.classList.contains('add-image-item')) {
                item.classList.add('selectable');
            }
        });
    }

    // 处理图片拖拽
    handleImageDrag(e, item) {
        e.preventDefault();
        e.stopPropagation();
        
        // 如果点击的是图片或视频元素，不处理拖拽
        if (e.target.closest('.file-preview-image, .file-preview-video')) {
            return;
        }

        const selectedItems = document.querySelectorAll('.file-preview-item.selected');
        if (selectedItems.length === 0) {
            item.classList.add('selected');
            this.updateSelectionState();
        }
        
        this.startImageDrag(e, item);
    }

    // 开始图片拖拽
    startImageDrag(e, draggedItem) {
        const selectedItems = Array.from(document.querySelectorAll('.file-preview-item.selected'));
        if (selectedItems.length === 0) return;
        
        // 检查是否在拖拽排序模式
        const isDragSort = e.target.closest('.file-preview-item') === draggedItem;
        
        if (isDragSort) {
            // 拖拽排序模式
            this.startDragSort(e, draggedItem);
        } else {
            // 普通拖拽模式
            const dragPreview = this.createDragPreview(selectedItems);
            document.body.appendChild(dragPreview);
            
            this.isDraggingImages = true;
            this.draggedItems = selectedItems;
            this.dragOffset = { x: 0, y: 0 };
            
            const rect = draggedItem.getBoundingClientRect();
            this.dragOffset.x = e.clientX - rect.left;
            this.dragOffset.y = e.clientY - rect.top;
            
            this.updateDragPreview(e, dragPreview);
            this.bindDragEvents(dragPreview);
            
            selectedItems.forEach(item => {
                item.classList.add('dragging');
            });
        }
        
        e.preventDefault();
    }

    // 开始拖拽排序
    startDragSort(e, draggedItem) {
        if (!this.imageController) return;
        
        const fromIndex = Array.from(draggedItem.parentNode.children).indexOf(draggedItem);
        if (fromIndex === -1) return;
        
        this.imageController.startDrag(draggedItem, fromIndex);
        this.bindDragSortEvents();
    }

    // 创建拖拽预览
    createDragPreview(selectedItems) {
        const preview = document.createElement('div');
        preview.className = 'image-drag-preview';
        preview.innerHTML = `
            <div class="drag-preview-content">
                <div class="drag-preview-count">${selectedItems.length}</div>
                <div class="drag-preview-text">个文件</div>
            </div>
        `;
        return preview;
    }

    // 更新拖拽预览位置
    updateDragPreview(e, preview) {
        const x = e.clientX;
        const y = e.clientY;
        preview.style.left = x + 'px';
        preview.style.top = y + 'px';
    }

    // 绑定拖拽事件
    bindDragEvents(dragPreview) {
        const handleMouseMove = (e) => {
            if (this.isDraggingImages) {
                this.updateDragPreview(e, dragPreview);
            }
        };

        const handleMouseUp = (e) => {
            if (this.isDraggingImages) {
                this.endImageDrag(e, dragPreview);
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        this.dragEventHandlers = { handleMouseMove, handleMouseUp };
    }

    // 绑定拖拽排序事件
    bindDragSortEvents() {
        const handleMouseMove = (e) => {
            if (this.imageController) {
                this.imageController.handleDragMove(e);
            }
        };

        const handleMouseUp = (e) => {
            this.endDragSort();
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        this.dragSortEventHandlers = { handleMouseMove, handleMouseUp };
    }

    // 结束图片拖拽
    endImageDrag(e, dragPreview) {
        if (!this.isDraggingImages || !this.draggedItems) return;
        
        if (dragPreview && dragPreview.parentNode) {
            dragPreview.parentNode.removeChild(dragPreview);
        }
        
        this.draggedItems.forEach(item => {
            item.classList.remove('dragging');
        });
        
        if (this.dragEventHandlers) {
            document.removeEventListener('mousemove', this.dragEventHandlers.handleMouseMove);
            document.removeEventListener('mouseup', this.dragEventHandlers.handleMouseUp);
            this.dragEventHandlers = null;
        }
        
        this.isDraggingImages = false;
        this.draggedItems = null;
        this.dragOffset = null;
    }

    // 结束拖拽排序
    endDragSort() {
        if (this.imageController) {
            this.imageController.endDrag();
        }
        
        if (this.dragSortEventHandlers) {
            document.removeEventListener('mousemove', this.dragSortEventHandlers.handleMouseMove);
            document.removeEventListener('mouseup', this.dragSortEventHandlers.handleMouseUp);
            this.dragSortEventHandlers = null;
        }
    }

    // 绑定添加图片事件
    bindAddImageEvents(addImageBtn) {
        console.log('绑定添加图片按钮事件');
        
        addImageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('添加图片按钮被点击');
            
            if (this.imageController) {
                this.imageController.openFileSelector();
            } else {
                this.app.addImage();
            }
        });

        addImageBtn.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('文件拖拽到添加按钮上');
            addImageBtn.classList.add('drag-over');
        });

        addImageBtn.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('文件拖拽离开添加按钮');
            addImageBtn.classList.remove('drag-over');
        });

        addImageBtn.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            addImageBtn.classList.remove('drag-over');
            
            console.log('文件被拖拽到添加按钮并释放');
            const files = Array.from(e.dataTransfer.files);
            console.log('拖拽的文件:', files);
            
            if (files.length > 0) {
                console.log('开始处理图片上传');
                if (this.imageController) {
                    this.imageController.addFiles(files);
                } else {
                    this.app.handleImageUpload(files);
                }
            } else {
                console.log('没有检测到文件');
            }
        });
    }

    // 处理删除文件
    async handleDeleteFile(fileName) {
        console.log('开始处理删除文件:', fileName);
        
        if (!this.imageController) {
            console.error('图片控制器未初始化');
            return;
        }

        try {
            const result = await this.imageController.deleteFileWithConfirm(fileName);
            console.log('删除文件结果:', result);
        } catch (error) {
            console.error('删除文件时发生错误:', error);
        }
    }

    // 工具方法
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

    getFileIconClass(fileType) {
        const classes = {
            image: 'image',
            video: 'video',
            pdf: 'pdf',
            default: 'default'
        };
        return classes[fileType] || 'default';
    }

    getFileIconText(fileType) {
        const texts = {
            image: 'IMG',
            video: 'VID',
            pdf: 'PDF',
            default: 'FILE'
        };
        return texts[fileType] || 'FILE';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }



    // 更新图片序号
    updateImageOrderNumbers() {
        const grid = document.getElementById('imageGalleryGrid');
        if (!grid) return;

        const items = Array.from(grid.children).filter(item => 
            !item.classList.contains('add-image-item')
        );

        items.forEach((item, index) => {
            const orderNumber = index + 1;
            item.setAttribute('data-order', orderNumber);
            
            // 更新序号显示
            let orderElement = item.querySelector('.file-order-number');
            if (orderElement) {
                orderElement.textContent = orderNumber;
            } else {
                // 如果序号元素不存在，创建它
                const orderDisplay = document.createElement('div');
                orderDisplay.className = 'file-order-number';
                orderDisplay.textContent = orderNumber;
                
                // 将序号添加到文件项的开头
                item.insertBefore(orderDisplay, item.firstChild);
            }
        });
    }



    // 更新选择UI
    updateSelectionUI(selectedImages) {
        document.querySelectorAll('.file-preview-item').forEach(item => {
            const fileName = item.dataset.fileName;
            if (selectedImages && selectedImages.includes(fileName)) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }


    // 清空组件
    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        if (this.imageController) {
            this.imageController.clear();
        }
    }
}
