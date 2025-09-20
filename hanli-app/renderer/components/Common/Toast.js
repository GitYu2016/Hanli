/**
 * Toast 通知组件
 * 负责显示简单的文字通知消息，从右往左滑出
 * 样式定义在JavaScript中，通过StyleManager管理
 */
class Toast extends BaseComponent {
    constructor() {
        super('Toast');
        this.container = null;
        this.toasts = [];
        this.maxToasts = 3;
        this.defaultDuration = 2000;
        this.initStyles();
    }

    /**
     * 初始化Toast样式
     */
    initStyles() {
        // 定义Toast样式
        const toastStyles = {
            // Toast容器
            '.toast-container': {
                'position': 'fixed',
                'top': '20px',
                'right': '20px',
                'z-index': '10000',
                'display': 'flex',
                'flex-direction': 'column',
                'gap': '12px',
                'pointer-events': 'none'
            },

            // Toast基础样式
            '.toast': {
                'background-color': 'var(--color-toast-background)',
                'border': '1px solid var(--color-border-normal)',
                'border-radius': 'var(--radius-lg)',
                'box-shadow': 'var(--shadow-lg)',
                'min-width': '300px',
                'max-width': '400px',
                'opacity': '0',
                'transform': 'translateX(100%)',
                'transition': 'all 0.3s ease',
                'pointer-events': 'auto',
                'overflow': 'hidden'
            },

            // Toast类型样式 - 使用状态颜色作为背景色
            '.toast-success': {
                'background-color': 'var(--color-success)',
                'color': 'white'
            },

            '.toast-error': {
                'background-color': 'var(--color-error)',
                'color': 'white'
            },

            '.toast-warning': {
                'background-color': 'var(--color-warning)',
                'color': 'white'
            },

            '.toast-info': {
                'background-color': 'var(--color-info)',
                'color': 'white'
            },

            '.toast.show': {
                'opacity': '1',
                'transform': 'translateX(0)'
            },

            '.toast.hide': {
                'opacity': '0',
                'transform': 'translateX(100%)'
            },

            // Toast内容
            '.toast-content': {
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'space-between',
                'padding': '16px 20px'
            },

            // Toast消息
            '.toast-message': {
                'flex': '1',
                'font-size': '14px',
                'font-weight': '500',
                'line-height': '1.4',
                'word-wrap': 'break-word'
            },

            // 默认Toast消息颜色
            '.toast .toast-message': {
                'color': 'var(--color-text-primary)'
            },

            // 类型Toast消息颜色（白色文字）
            '.toast-success .toast-message, .toast-error .toast-message, .toast-warning .toast-message, .toast-info .toast-message': {
                'color': 'white'
            },

            // Toast关闭按钮
            '.toast-close': {
                'background': 'none',
                'border': 'none',
                'color': 'var(--color-text-secondary)',
                'cursor': 'pointer',
                'padding': '4px',
                'border-radius': 'var(--radius-small)',
                'transition': 'all 0.2s ease',
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                'flex-shrink': '0',
                'margin-left': '12px'
            },

            '.toast-close:hover': {
                'background-color': 'var(--color-background-focused)',
                'color': 'var(--color-text-primary)'
            },

            // 类型Toast关闭按钮颜色
            '.toast-success .toast-close, .toast-error .toast-close, .toast-warning .toast-close, .toast-info .toast-close': {
                'color': 'rgba(255, 255, 255, 0.8)'
            },

            '.toast-success .toast-close:hover, .toast-error .toast-close:hover, .toast-warning .toast-close:hover, .toast-info .toast-close:hover': {
                'background-color': 'rgba(255, 255, 255, 0.2)',
                'color': 'white'
            },

            // 响应式设计
            '@media (max-width: 768px)': {
                '.toast-container': {
                    'top': '10px',
                    'right': '10px',
                    'left': '10px'
                },
                '.toast': {
                    'min-width': 'auto',
                    'max-width': 'none'
                }
            }
        };

        // 使用基础组件的样式注册方法
        super.initStyles(toastStyles);
    }

    /**
     * 初始化Toast组件
     */
    init() {
        // 使用基础组件的方法创建Toast容器
        this.container = this.createStyledElement('div', 'toast-container', '', {
            id: 'toast-container'
        });
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
            return existingToast.dataset.toastId;
        }

        // 使用基础组件的方法创建Toast元素
        const toast = this.createStyledElement('div', `toast toast-${type}`, `
            <div class="toast-content">
                <span class="toast-message">${message}</span>
                ${window.iconButtonInstance.render('x', {
                    variant: 'ghost',
                    size: 'small',
                    title: '关闭',
                    className: 'toast-close'
                })}
            </div>
        `);

        // 设置唯一ID
        const toastId = Date.now().toString();
        toast.id = `toast-${toastId}`;
        toast.dataset.toastId = toastId;

        // 设置关闭按钮事件
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
        // 调用基础组件的销毁方法
        super.destroy();
        
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
        this.toasts = [];
    }
}

// 创建全局实例
const toastInstance = new Toast();

// 暴露到全局作用域
window.toastInstance = toastInstance;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    toastInstance.init();
});
