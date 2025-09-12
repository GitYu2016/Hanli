/**
 * 调试工具浮窗组件
 * 提供调试功能的浮窗界面
 */
class DebugPopupModal {
    constructor(app) {
        this.app = app;
        this.isVisible = false;
        this.element = null;
        
        this.init();
    }

    /**
     * 初始化组件
     */
    init() {
        this.createElement();
        this.bindEvents();
    }

    /**
     * 创建DOM元素
     */
    createElement() {
        this.element = document.createElement('div');
        this.element.className = 'debug-popup';
        this.element.id = 'debugPopup';
        this.element.style.display = 'none';
        
        this.element.innerHTML = `
            <div class="debug-popup-content">
                <div class="debug-popup-header">
                    <h4>调试工具</h4>
                </div>
                <div class="debug-popup-body">
                    <button class="debug-popup-item" id="resetFolderBtn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 7V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M3 7L5 21H19L21 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M8 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M16 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        重置文件夹
                    </button>
                </div>
            </div>
        `;
        
        // 添加到body
        document.body.appendChild(this.element);
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 重置文件夹按钮
        const resetBtn = this.element.querySelector('#resetFolderBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.handleResetFolder();
            });
        }

        // 点击外部关闭浮窗
        document.addEventListener('click', (event) => {
            if (this.isVisible && !this.element.contains(event.target)) {
                const debugBtn = document.getElementById('debugBtn');
                if (debugBtn && !debugBtn.contains(event.target)) {
                    this.hide();
                }
            }
        });
    }

    /**
     * 显示浮窗
     */
    show() {
        this.element.style.display = 'block';
        this.isVisible = true;
    }

    /**
     * 隐藏浮窗
     */
    hide() {
        this.element.style.display = 'none';
        this.isVisible = false;
    }

    /**
     * 切换浮窗显示状态
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * 处理重置文件夹
     */
    handleResetFolder() {
        if (this.app && typeof this.app.resetFolder === 'function') {
            this.app.resetFolder();
        }
        this.hide();
    }

    /**
     * 销毁组件
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
        this.isVisible = false;
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DebugPopupModal;
} else {
    window.DebugPopupModal = DebugPopupModal;
}
