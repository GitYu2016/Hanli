/**
 * Toast 通知组件
 * 负责显示各种类型的通知消息
 */
class Toast {
    constructor() {
        this.container = null;
        this.toasts = [];
        this.maxToasts = 3;
        this.defaultDuration = 2000;
    }

    /**
     * 初始化Toast组件
     */
    init() {
        // 创建Toast容器
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    }

    /**
     * 显示Toast通知
     * @param {string} message - 消息内容
     * @param {string} type - 类型 (success, error, info, warning)
     * @param {number} duration - 显示时长（毫秒）
     */
    show(message, type = 'info', duration = this.defaultDuration) {
        if (!this.container) {
            this.init();
        }

        // 防重复显示：检查是否已经有相同的消息正在显示
        const existingToast = Array.from(this.container.children).find(toast => {
            const messageElement = toast.querySelector('.toast-message');
            return messageElement && messageElement.textContent.trim() === message.trim();
        });

        if (existingToast) {
            console.log('Toast: 重复消息，跳过显示:', message);
            return existingToast.dataset.toastId;
        }

        // 创建Toast元素
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // 添加图标
        const iconClass = this.getIconClass(type);
        toast.innerHTML = `
            <div class="toast-content">
                <i class="ph ph-${iconClass}"></i>
                <span class="toast-message">${message}</span>
                <button class="toast-close" onclick="toastInstance.closeToast('${Date.now()}')">
                    <i class="ph ph-x"></i>
                </button>
            </div>
        `;

        // 设置唯一ID
        const toastId = Date.now().toString();
        toast.id = `toast-${toastId}`;
        toast.dataset.toastId = toastId;

        // 修复关闭按钮的onclick事件，使用正确的toastId
        const closeButton = toast.querySelector('.toast-close');
        if (closeButton) {
            closeButton.onclick = () => {
                this.closeToast(toastId);
            };
        }

        // 添加到容器
        this.container.appendChild(toast);
        this.toasts.push(toastId);

        // 限制Toast数量
        if (this.toasts.length > this.maxToasts) {
            const oldestToastId = this.toasts.shift();
            const oldestToast = document.getElementById(`toast-${oldestToastId}`);
            if (oldestToast) {
                oldestToast.remove();
            }
        }

        // 触发显示动画
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // 自动关闭
        if (duration > 0) {
            setTimeout(() => {
                this.closeToast(toastId);
            }, duration);
        }

        return toastId;
    }

    /**
     * 根据类型获取图标类名
     * @param {string} type - 类型
     * @returns {string} 图标类名
     */
    getIconClass(type) {
        const iconMap = {
            success: 'check-circle',
            error: 'warning-circle',
            info: 'info',
            warning: 'warning'
        };
        return iconMap[type] || 'info';
    }

    /**
     * 关闭Toast
     * @param {string} toastId - Toast ID
     */
    closeToast(toastId) {
        const toast = document.getElementById(`toast-${toastId}`);
        if (toast) {
            toast.classList.add('hide');
            setTimeout(() => {
                toast.remove();
                const index = this.toasts.indexOf(toastId);
                if (index > -1) {
                    this.toasts.splice(index, 1);
                }
            }, 300);
        }
    }

    /**
     * 关闭所有Toast
     */
    closeAll() {
        this.toasts.forEach(toastId => {
            this.closeToast(toastId);
        });
    }

    /**
     * 显示成功消息
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长
     */
    success(message, duration = this.defaultDuration) {
        return this.show(message, 'success', duration);
    }

    /**
     * 显示错误消息
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长
     */
    error(message, duration = this.defaultDuration) {
        return this.show(message, 'error', duration);
    }

    /**
     * 显示信息消息
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长
     */
    info(message, duration = this.defaultDuration) {
        return this.show(message, 'info', duration);
    }

    /**
     * 显示警告消息
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长
     */
    warning(message, duration = this.defaultDuration) {
        return this.show(message, 'warning', duration);
    }

    /**
     * 销毁组件
     */
    destroy() {
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
        this.toasts = [];
    }
}

// 创建全局实例
const toastInstance = new Toast();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    toastInstance.init();
});
