/**
 * ProductMoreMenu 组件
 * 产品更多操作菜单组件，包含完整的样式和功能
 */
class ProductMoreMenu {
    constructor() {
        this.container = null;
        this.isOpen = false;
        this.menuItems = [];
        this.handleContainerClick = null;
        this.handleDocumentClick = null;
        this.onMenuClick = null;
        this.styles = this.createStyles();
        this.injectStyles();
    }

    /**
     * 创建组件样式
     * @returns {string} CSS 样式字符串
     */
    createStyles() {
        return `
            .product-more-menu-container {
                position: relative;
                display: inline-block;
            }


            .product-more-menu-dropdown {
                position: absolute;
                top: 100%;
                right: 0;
                margin-top: 4px;
                background-color: var(--color-modal-background);
                border: 1px solid var(--color-border-normal);
                border-radius: var(--radius-medium);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 1000;
                min-width: 160px;
                opacity: 0;
                visibility: hidden;
                transform: translateY(-8px);
                transition: all 0.2s ease;
            }

            .product-more-menu-dropdown.show {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }

            .product-more-menu-content {
                padding: 4px 0;
            }

            .product-more-menu-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                cursor: pointer;
                transition: all 0.2s ease;
                color: var(--color-text-primary);
                font-size: 14px;
                white-space: nowrap;
            }

            .product-more-menu-item:hover:not(.disabled) {
                background-color: var(--color-background-focused);
                color: var(--color-text-primary);
            }

            .product-more-menu-item:active:not(.disabled) {
                background-color: var(--color-surface-secondary);
            }

            .product-more-menu-item.disabled {
                color: var(--color-text-disabled);
                cursor: not-allowed;
                opacity: 0.6;
            }

            .product-more-menu-item i {
                font-size: 14px;
                width: 16px;
                text-align: center;
                flex-shrink: 0;
            }

            .product-more-menu-item span {
                flex: 1;
                min-width: 0;
            }

            /* 响应式设计 */
            @media (max-width: 768px) {
                .product-more-menu-dropdown {
                    right: -8px;
                    min-width: 140px;
                }
                
                .product-more-menu-item {
                    padding: 10px 12px;
                    font-size: 15px;
                }
            }

            @media (max-width: 480px) {
                .product-more-menu-dropdown {
                    right: -12px;
                    min-width: 120px;
                }
                
                .product-more-menu-item {
                    padding: 12px 16px;
                    font-size: 16px;
                }
            }
        `;
    }

    /**
     * 注入样式到页面
     */
    injectStyles() {
        // 检查是否已经注入过样式
        if (document.getElementById('product-more-menu-styles')) {
            return;
        }

        const styleElement = document.createElement('style');
        styleElement.id = 'product-more-menu-styles';
        styleElement.textContent = this.styles;
        document.head.appendChild(styleElement);
    }

    /**
     * 初始化产品更多菜单
     * @param {HTMLElement} container - 容器元素
     * @param {Array} menuItems - 菜单项数组
     */
    init(container, menuItems = []) {
        this.container = container;
        this.menuItems = menuItems;
        this.render();
        this.bindEvents();
    }

    /**
     * 渲染产品更多菜单
     */
    render() {
        if (!this.container) return;

        // 只渲染下拉菜单部分，触发按钮由IconButton组件提供
        this.container.innerHTML = `
            <div class="product-more-menu-container">
                <div class="product-more-menu-dropdown" id="product-more-menu-dropdown">
                    <div class="product-more-menu-content">
                        ${this.renderMenuItems()}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 渲染菜单项
     * @returns {string} HTML字符串
     */
    renderMenuItems() {
        if (!this.menuItems || this.menuItems.length === 0) {
            return '<div class="product-more-menu-item disabled">暂无操作</div>';
        }

        return this.menuItems.map(item => {
            const disabledClass = item.disabled ? 'disabled' : '';
            
            return `
                <div class="product-more-menu-item ${disabledClass}" 
                     data-action="${item.action}">
                    ${item.icon ? `<div class="svg-icon" data-icon="${item.icon}" data-filled="false"></div>` : ''}
                    <span>${item.label}</span>
                </div>
            `;
        }).join('');
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 清理之前的事件监听器
        this.cleanupEvents();

        // 使用事件委托绑定菜单项点击事件
        if (this.container) {
            this.handleContainerClick = (e) => {
                e.stopPropagation();
                
                // 检查是否点击了菜单项
                const menuItem = e.target.closest('.product-more-menu-item:not(.disabled)');
                if (menuItem) {
                    const action = menuItem.getAttribute('data-action');
                    
                    if (action && this.onMenuClick) {
                        this.onMenuClick(action, menuItem);
                    }
                    
                    this.close();
                }
            };
            
            this.container.addEventListener('click', this.handleContainerClick);
        }

        // 点击其他地方关闭菜单
        this.handleDocumentClick = (e) => {
            if (this.container && !this.container.contains(e.target)) {
                this.close();
            }
        };
        document.addEventListener('click', this.handleDocumentClick);
    }

    /**
     * 清理事件监听器
     */
    cleanupEvents() {
        if (this.container && this.handleContainerClick) {
            this.container.removeEventListener('click', this.handleContainerClick);
        }
        
        if (this.handleDocumentClick) {
            document.removeEventListener('click', this.handleDocumentClick);
        }
    }

    /**
     * 切换菜单显示状态
     */
    toggle() {
        console.log('ProductMoreMenu toggle called, current state:', this.isOpen);
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * 打开菜单
     */
    open() {
        console.log('ProductMoreMenu opening...');
        const dropdown = document.getElementById('product-more-menu-dropdown');
        if (dropdown) {
            dropdown.classList.add('show');
            this.isOpen = true;
            console.log('ProductMoreMenu opened successfully');
        } else {
            console.error('ProductMoreMenu dropdown element not found');
        }
    }

    /**
     * 关闭菜单
     */
    close() {
        console.log('ProductMoreMenu closing...');
        const dropdown = document.getElementById('product-more-menu-dropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
            this.isOpen = false;
            console.log('ProductMoreMenu closed successfully');
        }
    }

    /**
     * 设置菜单点击回调
     * @param {Function} callback - 回调函数
     */
    setMenuClickCallback(callback) {
        this.onMenuClick = callback;
    }

    /**
     * 更新菜单项
     * @param {Array} menuItems - 新的菜单项数组
     */
    updateMenuItems(menuItems) {
        this.menuItems = menuItems;
        this.render();
        this.bindEvents();
    }

    /**
     * 销毁组件
     */
    destroy() {
        // 清理事件监听器
        this.cleanupEvents();
        
        // 清理文档点击事件
        if (this.handleDocumentClick) {
            document.removeEventListener('click', this.handleDocumentClick);
        }
        
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.container = null;
        this.menuItems = [];
        this.isOpen = false;
        this.handleContainerClick = null;
        this.handleDocumentClick = null;
        this.onMenuClick = null;
    }
}

// 暴露到全局作用域
window.ProductMoreMenu = ProductMoreMenu;
