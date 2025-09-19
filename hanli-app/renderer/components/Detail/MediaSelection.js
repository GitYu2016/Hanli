/**
 * MediaSelection 组件
 * 负责媒体文件（图片和视频）的选择功能，支持单选、多选和取消选中
 */
class MediaSelection {
    constructor() {
        this.selectedIndexes = new Set(); // 改为Set支持多选
        this.onSelectionChange = null;
        this.isMultiSelectMode = false; // 多选模式标志
        this.lastSelectedIndex = null; // 上一次选中的媒体项索引
    }

    /**
     * 初始化媒体选择组件
     * @param {HTMLElement} container - 媒体容器元素
     * @param {Array} mediaItems - 媒体项数组
     * @param {Function} onSelectionChange - 选择变化回调函数
     */
    init(container, mediaItems, onSelectionChange = null) {
        this.container = container;
        this.mediaItems = mediaItems;
        this.onSelectionChange = onSelectionChange;
        this.selectedIndexes.clear();
        this.isMultiSelectMode = false;
        this.lastSelectedIndex = null;
        
        this.bindEvents();
        this.updateSelectionUI();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        if (!this.container) return;

        // 使用事件委托绑定媒体项点击事件
        this.container.addEventListener('click', (e) => {
            // 检查点击的是否是媒体项区域
            const mediaItem = e.target.closest('[data-index]');
            if (mediaItem) {
                e.preventDefault();
                e.stopPropagation();
                
                // 获取媒体的实际索引
                const index = parseInt(mediaItem.getAttribute('data-index'));
                
                // 检测是否按住Shift键
                const isShiftPressed = e.shiftKey;
                this.toggleSelection(index, isShiftPressed);
            } else {
                // 如果点击的不是媒体项区域，则取消选择
                this.clearSelection();
            }
        });

        // 监听多选模式变化事件
        this.multiSelectHandler = (e) => {
            this.isMultiSelectMode = e.detail.isMultiSelect;
            this.updateMultiSelectUI();
        };
        
        document.addEventListener('multiSelectModeChange', this.multiSelectHandler);
    }

    /**
     * 切换媒体选择状态
     * @param {number} index - 媒体项索引
     * @param {boolean} isShiftPressed - 是否按住Shift键
     */
    toggleSelection(index, isShiftPressed = false) {
        if (isShiftPressed) {
            // 多选模式
            if (this.lastSelectedIndex !== null && this.lastSelectedIndex !== index) {
                // 连续选择：选中从lastSelectedIndex到index之间的所有媒体项
                this.selectRange(this.lastSelectedIndex, index);
            } else if (this.selectedIndexes.has(index)) {
                // 如果点击的是已选中的媒体项，则取消选择
                this.selectedIndexes.delete(index);
                this.lastSelectedIndex = null;
            } else {
                // 添加到选择列表
                this.selectedIndexes.add(index);
                this.lastSelectedIndex = index;
            }
        } else {
            // 单选模式
            if (this.selectedIndexes.has(index)) {
                // 如果点击的是已选中的媒体项，则取消选择
                this.selectedIndexes.clear();
                this.lastSelectedIndex = null;
            } else {
                // 清除所有选择，选择当前媒体项
                this.selectedIndexes.clear();
                this.selectedIndexes.add(index);
                this.lastSelectedIndex = index;
            }
        }
        
        this.updateSelectionUI();
        this.notifySelectionChange();
    }

    /**
     * 选择范围内的所有媒体项
     * @param {number} startIndex - 起始索引
     * @param {number} endIndex - 结束索引
     */
    selectRange(startIndex, endIndex) {
        const start = Math.min(startIndex, endIndex);
        const end = Math.max(startIndex, endIndex);
        
        // 选中范围内的所有媒体项
        for (let i = start; i <= end; i++) {
            this.selectedIndexes.add(i);
        }
        
        // 更新最后选中的索引
        this.lastSelectedIndex = endIndex;
    }

    /**
     * 更新选择状态的UI
     */
    updateSelectionUI() {
        if (!this.container) return;

        const mediaItems = this.container.querySelectorAll('[data-index]');
        mediaItems.forEach((item, index) => {
            const content = item.querySelector('.media-card-content');
            
            if (this.selectedIndexes.has(index)) {
                // 添加选中状态
                if (content) {
                    content.classList.add('selected');
                }
            } else {
                // 移除选中状态
                if (content) {
                    content.classList.remove('selected');
                }
            }
        });
    }

    /**
     * 更新多选模式的UI提示
     */
    updateMultiSelectUI() {
        if (!this.container) return;
        
        const grid = this.container.querySelector('.media-card-grid, .image-selection-grid');
        if (grid) {
            if (this.isMultiSelectMode) {
                grid.classList.add('multi-select-mode');
            } else {
                grid.classList.remove('multi-select-mode');
            }
        }
    }

    /**
     * 通知选择状态变化
     */
    notifySelectionChange() {
        if (this.onSelectionChange) {
            const selectedItems = Array.from(this.selectedIndexes).map(index => ({
                item: this.mediaItems[index],
                index: index
            }));
            
            // 只传递选中的媒体项数组
            this.onSelectionChange(selectedItems);
        }
    }

    /**
     * 获取当前选中的媒体项（单选模式兼容）
     * @returns {Object|null} 选中的媒体项对象
     */
    getSelectedItem() {
        return this.selectedIndexes.size === 1 ? 
            this.mediaItems[Array.from(this.selectedIndexes)[0]] : null;
    }

    /**
     * 获取当前选中的媒体项索引（单选模式兼容）
     * @returns {number|null} 选中的媒体项索引
     */
    getSelectedIndex() {
        return this.selectedIndexes.size === 1 ? 
            Array.from(this.selectedIndexes)[0] : null;
    }

    /**
     * 获取所有选中的媒体项
     * @returns {Array} 选中的媒体项数组
     */
    getSelectedItems() {
        return Array.from(this.selectedIndexes).map(index => ({
            item: this.mediaItems[index],
            index: index
        }));
    }

    /**
     * 获取选中的媒体项数量
     * @returns {number} 选中的媒体项数量
     */
    getSelectedCount() {
        return this.selectedIndexes.size;
    }

    /**
     * 清除选择
     */
    clearSelection() {
        this.selectedIndexes.clear();
        this.lastSelectedIndex = null;
        this.updateSelectionUI();
        this.notifySelectionChange();
    }

    /**
     * 设置选择状态（单选模式兼容）
     * @param {number|null} index - 要选择的媒体项索引
     */
    setSelection(index) {
        this.selectedIndexes.clear();
        this.lastSelectedIndex = null;
        if (index !== null && index >= 0 && index < this.mediaItems.length) {
            this.selectedIndexes.add(index);
            this.lastSelectedIndex = index;
        }
        this.updateSelectionUI();
        this.notifySelectionChange();
    }

    /**
     * 设置多选状态
     * @param {Array<number>} indexes - 要选择的媒体项索引数组
     */
    setMultiSelection(indexes) {
        this.selectedIndexes.clear();
        this.lastSelectedIndex = null;
        if (Array.isArray(indexes) && indexes.length > 0) {
            indexes.forEach(index => {
                if (index >= 0 && index < this.mediaItems.length) {
                    this.selectedIndexes.add(index);
                }
            });
            // 设置最后选中的索引为数组中的最后一个
            this.lastSelectedIndex = indexes[indexes.length - 1];
        }
        this.updateSelectionUI();
        this.notifySelectionChange();
    }

    /**
     * 销毁组件
     */
    destroy() {
        // 清理事件监听器
        if (this.multiSelectHandler) {
            document.removeEventListener('multiSelectModeChange', this.multiSelectHandler);
            this.multiSelectHandler = null;
        }
        
        this.container = null;
        this.mediaItems = null;
        this.onSelectionChange = null;
        this.selectedIndexes.clear();
        this.isMultiSelectMode = false;
        this.lastSelectedIndex = null;
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MediaSelection;
} else {
    window.MediaSelection = MediaSelection;
}

// 创建全局实例
const mediaSelectionInstance = new MediaSelection();
