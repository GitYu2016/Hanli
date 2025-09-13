// 侧边栏拖拽调整组件
class SidebarResizer {
    constructor(app) {
        this.app = app;
        this.isDragging = false;
        this.startX = 0;
        this.startWidth = 0;
        this.minWidth = 180;
        this.maxWidth = 500;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSavedWidth();
        this.updateResizeHandleVisibility();
    }

    bindEvents() {
        const resizeHandle = document.getElementById('resizeHandle');
        if (!resizeHandle) return;

        // 鼠标按下开始拖拽
        resizeHandle.addEventListener('mousedown', (e) => {
            this.startDragging(e);
        });

        // 全局鼠标移动和释放事件
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.handleDragging(e);
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.stopDragging();
            }
        });

        // 防止拖拽时选中文本
        document.addEventListener('selectstart', (e) => {
            if (this.isDragging) {
                e.preventDefault();
            }
        });
    }

    startDragging(e) {
        // 检查侧边栏是否收起
        const sidebar = document.getElementById('menuListColumn');
        if (sidebar.classList.contains('collapsed')) {
            return;
        }
        
        this.isDragging = true;
        this.startX = e.clientX;
        this.startWidth = sidebar.offsetWidth;
        
        // 添加拖拽样式
        document.body.classList.add('resizing');
        document.getElementById('resizeHandle').classList.add('dragging');
        
        e.preventDefault();
    }

    handleDragging(e) {
        if (!this.isDragging) return;

        const deltaX = e.clientX - this.startX;
        const newWidth = this.startWidth + deltaX;
        
        // 限制宽度范围
        const clampedWidth = Math.max(this.minWidth, Math.min(this.maxWidth, newWidth));
        
        // 更新侧边栏宽度
        const sidebar = document.getElementById('menuListColumn');
        sidebar.style.width = clampedWidth + 'px';
    }

    stopDragging() {
        if (!this.isDragging) return;

        this.isDragging = false;
        
        // 移除拖拽样式
        document.body.classList.remove('resizing');
        document.getElementById('resizeHandle').classList.remove('dragging');
        
        // 保存当前宽度
        const sidebar = document.getElementById('menuListColumn');
        const currentWidth = sidebar.offsetWidth;
        this.saveWidth(currentWidth);
    }

    // 保存宽度到本地存储
    saveWidth(width) {
        try {
            localStorage.setItem('sidebarWidth', width.toString());
        } catch (error) {
            console.warn('保存侧边栏宽度失败:', error);
        }
    }

    // 从本地存储加载宽度
    loadSavedWidth() {
        try {
            const savedWidth = localStorage.getItem('sidebarWidth');
            if (savedWidth) {
                const width = parseInt(savedWidth, 10);
                if (width >= this.minWidth && width <= this.maxWidth) {
                    const sidebar = document.getElementById('menuListColumn');
                    if (sidebar) {
                        sidebar.style.width = width + 'px';
                    }
                }
            }
        } catch (error) {
            console.warn('加载侧边栏宽度失败:', error);
        }
    }

    // 重置到默认宽度
    resetToDefault() {
        const sidebar = document.getElementById('menuListColumn');
        if (sidebar) {
            sidebar.style.width = '240px';
            this.saveWidth(240);
        }
    }

    // 更新拖拽条可见性
    updateResizeHandleVisibility() {
        const sidebar = document.getElementById('menuListColumn');
        const resizeHandle = document.getElementById('resizeHandle');
        
        if (sidebar && resizeHandle) {
            if (sidebar.classList.contains('collapsed')) {
                resizeHandle.style.display = 'none';
            } else {
                resizeHandle.style.display = 'block';
            }
        }
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SidebarResizer;
} else {
    window.SidebarResizer = SidebarResizer;
}
