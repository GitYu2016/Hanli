// 调试版本的ImageSelection组件
class ImageSelection {
    constructor() {
        this.selectedImageIndexes = new Set();
        this.onSelectionChange = null;
        this.isMultiSelectMode = false;
        this.boundKeydownHandler = null;
        this.boundKeyupHandler = null;
        console.log('ImageSelection构造函数调用');
    }

    init(container, images, onSelectionChange = null) {
        console.log('ImageSelection init调用', { container, images, onSelectionChange });
        this.container = container;
        this.images = images;
        this.onSelectionChange = onSelectionChange;
        this.selectedImageIndexes.clear();
        this.isMultiSelectMode = false;
        
        this.render();
        this.bindEvents();
        console.log('ImageSelection初始化完成');
    }

    render() {
        console.log('ImageSelection render调用', { container: this.container, images: this.images });
        if (!this.container || !this.images) return;

        let html = '<div class="image-selection-grid">';
        
        this.images.forEach((image, index) => {
            const isSelected = this.selectedImageIndexes.has(index);
            console.log(`渲染图片 ${index}:`, { image, isSelected });
            html += `
                <div class="image-selection-item ${isSelected ? 'selected' : ''}" 
                     data-index="${index}">
                    <div class="image-wrapper">
                        <img src="${image.url}" 
                             alt="产品图片 ${index + 1}" 
                             class="selection-image">
                        <div class="selection-overlay">
                            <div class="selection-checkbox">
                                <i class="ph ph-check"></i>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        this.container.innerHTML = html;
        console.log('ImageSelection render完成');
    }

    bindEvents() {
        console.log('ImageSelection bindEvents调用');
        if (!this.container) return;

        // 使用事件委托绑定图片点击事件
        this.container.addEventListener('click', (e) => {
            console.log('容器点击事件触发', e.target);
            const imageItem = e.target.closest('.image-selection-item');
            if (imageItem) {
                e.preventDefault();
                e.stopPropagation();
                
                // 获取图片的实际索引
                const index = parseInt(imageItem.getAttribute('data-index'));
                console.log('点击图片项', { index, imageItem });
                
                // 检测是否按住Shift键
                const isShiftPressed = e.shiftKey;
                console.log('Shift键状态', isShiftPressed);
                this.toggleSelection(index, isShiftPressed);
            } else {
                console.log('点击空白区域，取消选择');
                // 如果点击的不是图片项，则取消选择
                this.clearSelection();
            }
        });

        // 绑定键盘事件
        this.boundKeydownHandler = (e) => {
            if (e.key === 'Shift') {
                console.log('Shift键按下');
                this.isMultiSelectMode = true;
                this.updateMultiSelectUI();
            }
        };
        
        this.boundKeyupHandler = (e) => {
            if (e.key === 'Shift') {
                console.log('Shift键松开');
                this.isMultiSelectMode = false;
                this.updateMultiSelectUI();
            }
        };
        
        document.addEventListener('keydown', this.boundKeydownHandler);
        document.addEventListener('keyup', this.boundKeyupHandler);
        console.log('ImageSelection bindEvents完成');
    }

    toggleSelection(index, isShiftPressed = false) {
        console.log('toggleSelection调用', { index, isShiftPressed, currentSelection: Array.from(this.selectedImageIndexes) });
        
        if (isShiftPressed) {
            // 多选模式
            if (this.selectedImageIndexes.has(index)) {
                // 如果点击的是已选中的图片，则取消选择
                this.selectedImageIndexes.delete(index);
                console.log('多选模式：取消选择', index);
            } else {
                // 添加到选择列表
                this.selectedImageIndexes.add(index);
                console.log('多选模式：添加选择', index);
            }
        } else {
            // 单选模式
            if (this.selectedImageIndexes.has(index) && this.selectedImageIndexes.size === 1) {
                // 如果点击的是唯一已选中的图片，则取消选择
                this.selectedImageIndexes.clear();
                console.log('单选模式：取消选择', index);
            } else {
                // 清除所有选择，选择当前图片
                this.selectedImageIndexes.clear();
                this.selectedImageIndexes.add(index);
                console.log('单选模式：选择', index);
            }
        }
        
        console.log('选择后状态', Array.from(this.selectedImageIndexes));
        this.updateSelectionUI();
        this.notifySelectionChange();
    }

    updateSelectionUI() {
        console.log('updateSelectionUI调用', Array.from(this.selectedImageIndexes));
        if (!this.container) return;

        const imageItems = this.container.querySelectorAll('.image-selection-item');
        console.log('找到图片项数量', imageItems.length);
        
        imageItems.forEach((item, index) => {
            const isSelected = this.selectedImageIndexes.has(index);
            console.log(`更新图片项 ${index} 选择状态:`, isSelected);
            
            if (isSelected) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
            
            // 更新选择编号
            const selectionNumber = item.querySelector('.selection-number');
            if (this.selectedImageIndexes.size > 1 && this.selectedImageIndexes.has(index)) {
                if (!selectionNumber) {
                    const numberDiv = document.createElement('div');
                    numberDiv.className = 'selection-number';
                    item.querySelector('.image-wrapper').appendChild(numberDiv);
                }
                const numberDiv = item.querySelector('.selection-number');
                numberDiv.textContent = Array.from(this.selectedImageIndexes).indexOf(index) + 1;
            } else if (selectionNumber) {
                selectionNumber.remove();
            }
        });
    }

    updateMultiSelectUI() {
        if (!this.container) return;
        
        const grid = this.container.querySelector('.image-selection-grid');
        if (grid) {
            if (this.isMultiSelectMode) {
                grid.classList.add('multi-select-mode');
            } else {
                grid.classList.remove('multi-select-mode');
            }
        }
    }

    notifySelectionChange() {
        console.log('notifySelectionChange调用', Array.from(this.selectedImageIndexes));
        if (this.onSelectionChange) {
            const selectedImages = Array.from(this.selectedImageIndexes).map(index => ({
                image: this.images[index],
                index: index
            }));
            
            // 为了向后兼容，如果只有一个选择，也提供单个图片
            const singleImage = selectedImages.length === 1 ? selectedImages[0].image : null;
            const singleIndex = selectedImages.length === 1 ? selectedImages[0].index : null;
            
            console.log('通知选择变化', { singleImage, singleIndex, selectedImages });
            this.onSelectionChange(singleImage, singleIndex, selectedImages);
        }
    }

    clearSelection() {
        console.log('clearSelection调用');
        this.selectedImageIndexes.clear();
        this.updateSelectionUI();
        this.notifySelectionChange();
    }

    destroy() {
        console.log('ImageSelection destroy调用');
        // 清理事件监听器
        if (this.boundKeydownHandler) {
            document.removeEventListener('keydown', this.boundKeydownHandler);
            this.boundKeydownHandler = null;
        }
        if (this.boundKeyupHandler) {
            document.removeEventListener('keyup', this.boundKeyupHandler);
            this.boundKeyupHandler = null;
        }
        
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.container = null;
        this.images = null;
        this.onSelectionChange = null;
        this.selectedImageIndexes.clear();
        this.isMultiSelectMode = false;
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageSelection;
} else {
    window.ImageSelection = ImageSelection;
}
