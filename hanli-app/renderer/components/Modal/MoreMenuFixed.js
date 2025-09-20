/**
 * MoreMenu 组件 - 修复版
 * 负责显示更多操作菜单，修复了展开功能问题
 */
class MoreMenuFixed {
    constructor() {
        this.container = null;
        this.isOpen = false;
        this.menuItems = [];
        this.handleContainerClick = null;
        this.handleDocumentClick = null;
        this.onMenuClick = null;
    }

    /**
     * 初始化更多菜单
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
     * 渲染更多菜单
     */
    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="more-menu-container">
                <button class="more-menu-trigger" id="more-menu-trigger" title="更多操作">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5C12.5523 5 13 4.55228 13 4C13 3.44772 12.5523 3 12 3C11.4477 3 11 3.44772 11 4C11 4.55228 11.4477 5 12 5Z M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z M12 21C12.5523 21 13 20.5523 13 20C13 19.4477 12.5523 19 12 19C11.4477 19 11 19.4477 11 20C11 20.5523 11.4477 21 12 21Z"/></svg>
                </button>
                <div class="more-menu-dropdown" id="more-menu-dropdown">
                    <div class="more-menu-content">
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
            return '<div class="more-menu-item disabled">暂无操作</div>';
        }

        return this.menuItems.map(item => {
            const disabledClass = item.disabled ? 'disabled' : '';
            
            return `
                <div class="more-menu-item ${disabledClass}"
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
        
        // 绑定触发按钮点击事件
        const trigger = document.getElementById('more-menu-trigger');
        if (trigger) {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggle();
            });
        }

        // 使用事件委托绑定菜单项点击事件
        if (this.container) {
            this.handleContainerClick = (e) => {
                e.stopPropagation();
                
                // 检查是否点击了菜单项
                const menuItem = e.target.closest('.more-menu-item:not(.disabled)');
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
        const trigger = document.getElementById('more-menu-trigger');
        if (trigger) {
            trigger.removeEventListener('click', this.toggle);
        }
        
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
        console.log('MoreMenu toggle called, current state:', this.isOpen);
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
        console.log('MoreMenu opening...');
        const dropdown = document.getElementById('more-menu-dropdown');
        if (dropdown) {
            dropdown.classList.add('show');
            this.isOpen = true;
            console.log('MoreMenu opened successfully');
        } else {
            console.error('MoreMenu dropdown element not found');
        }
    }

    /**
     * 关闭菜单
     */
    close() {
        console.log('MoreMenu closing...');
        const dropdown = document.getElementById('more-menu-dropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
            this.isOpen = false;
            console.log('MoreMenu closed successfully');
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
window.MoreMenuFixed = MoreMenuFixed;

// 创建全局实例
const moreMenuFixedInstance = new MoreMenuFixed();
