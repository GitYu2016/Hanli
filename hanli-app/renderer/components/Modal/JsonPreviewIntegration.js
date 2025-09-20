/**
 * JSON预览弹窗集成示例
 * 展示如何在现有项目中集成和使用JSON预览弹窗
 */

/**
 * JSON预览弹窗集成管理器
 * 提供全局的JSON预览功能
 */
class JsonPreviewIntegration {
    constructor() {
        this.modal = null;
        this.isInitialized = false;
    }

    /**
     * 初始化JSON预览功能
     */
    init() {
        if (this.isInitialized) return;

        try {
            // 创建JSON预览弹窗实例
            this.modal = new JsonPreviewModal();
            
            // 设置全局回调
            this.modal.setCallbacks({
                onClose: () => {
                    console.log('JSON预览弹窗已关闭');
                },
                onCopy: (jsonString) => {
                    console.log('JSON已复制到剪贴板');
                    // 可以在这里添加复制成功的通知
                    this.showNotification('JSON已复制到剪贴板', 'success');
                }
            });

            // 设置全局引用
            window.jsonPreviewModal = this.modal;
            
            this.isInitialized = true;
            
        } catch (error) {
            console.error('JSON预览功能初始化失败:', error);
        }
    }

    /**
     * 预览JSON数据
     * @param {Object|string} data - JSON数据
     * @param {string} title - 弹窗标题（可选）
     */
    preview(data, title = 'JSON预览') {
        if (!this.isInitialized) {
            this.init();
        }

        if (!this.modal) {
            console.error('JSON预览弹窗未初始化');
            return;
        }

        try {
            // 设置数据并打开弹窗
            this.modal.setJsonData(data);
            this.modal.open();
            
            // 更新弹窗标题（如果支持）
            this.updateModalTitle(title);
            
        } catch (error) {
            console.error('打开JSON预览失败:', error);
            this.showNotification('打开JSON预览失败', 'error');
        }
    }

    /**
     * 预览产品数据
     * @param {Object} productData - 产品数据
     */
    previewProduct(productData) {
        this.preview(productData, '产品数据预览');
    }

    /**
     * 预览API响应
     * @param {Object} responseData - API响应数据
     */
    previewApiResponse(responseData) {
        this.preview(responseData, 'API响应预览');
    }

    /**
     * 预览配置数据
     * @param {Object} configData - 配置数据
     */
    previewConfig(configData) {
        this.preview(configData, '配置数据预览');
    }

    /**
     * 更新弹窗标题
     * @param {string} title - 新标题
     */
    updateModalTitle(title) {
        const modal = document.getElementById('json-preview-modal');
        if (modal) {
            const titleElement = modal.querySelector('.modal-title');
            if (titleElement) {
                titleElement.textContent = title;
            }
        }
    }

    /**
     * 显示通知
     * @param {string} message - 通知消息
     * @param {string} type - 通知类型
     */
    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // 添加样式
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '6px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '10000',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });
        
        // 根据类型设置背景色
        const colors = {
            success: 'var(--color-success)',
            error: 'var(--color-error)',
            warning: 'var(--color-warning)',
            info: 'var(--color-info)'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // 自动隐藏
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * 销毁集成管理器
     */
    destroy() {
        if (this.modal) {
            this.modal.destroy();
            this.modal = null;
        }
        
        if (window.jsonPreviewModal === this.modal) {
            window.jsonPreviewModal = null;
        }
        
        this.isInitialized = false;
    }
}

// 创建全局实例
const jsonPreviewIntegration = new JsonPreviewIntegration();

// 自动初始化
document.addEventListener('DOMContentLoaded', function() {
    // 等待其他组件加载完成
    setTimeout(() => {
        jsonPreviewIntegration.init();
    }, 100);
});

// 导出到全局作用域
window.jsonPreviewIntegration = jsonPreviewIntegration;

// 提供便捷的全局函数
window.previewJson = (data, title) => jsonPreviewIntegration.preview(data, title);
window.previewProduct = (data) => jsonPreviewIntegration.previewProduct(data);
window.previewApiResponse = (data) => jsonPreviewIntegration.previewApiResponse(data);
window.previewConfig = (data) => jsonPreviewIntegration.previewConfig(data);

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JsonPreviewIntegration;
} else {
    window.JsonPreviewIntegration = JsonPreviewIntegration;
}
