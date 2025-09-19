/**
 * MoreMenu 组件
 * 负责显示更多操作菜单
 */
class MoreMenu {
    constructor() {
        this.container = null;
        this.isOpen = false;
        this.menuItems = [];
        this.handleContainerClick = null;
        this.handleDocumentClick = null;
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
                <div id="more-menu-trigger-container"></div>
                <div class="more-menu-dropdown" id="more-menu-dropdown">
                    <div class="more-menu-content">
                        ${this.renderMenuItems()}
                    </div>
                </div>
            </div>
        `;

        // 创建触发按钮
        this.createTriggerButton();
    }

    /**
     * 创建触发按钮
     */
    createTriggerButton() {
        const triggerContainer = document.getElementById('more-menu-trigger-container');
        if (!triggerContainer || !window.buttonInstance) return;

        const triggerButton = window.buttonInstance.create({
            text: '',
            size: 'S',
            type: 'secondary',
            icon: 'ph-dots-three-vertical',
            onClick: () => this.toggle(),
            className: 'more-menu-trigger-btn'
        });

        triggerButton.title = '更多操作';
        triggerContainer.appendChild(triggerButton);
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
            const iconClass = item.icon ? `ph ph-${item.icon}` : '';
            
            return `
                <div class="more-menu-item ${disabledClass}" 
                     data-action="${item.action}">
                    ${item.icon ? `<i class="${iconClass}"></i>` : ''}
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
        
        // 使用事件委托，直接在容器上绑定事件
        if (this.container) {
            this.handleContainerClick = (e) => {
                e.stopPropagation();
                
                // 检查是否点击了触发按钮（通过Button组件创建）
                if (e.target.closest('.more-menu-trigger-btn')) {
                    this.toggle();
                }
                // 检查是否点击了菜单项
                else if (e.target.closest('.more-menu-item:not(.disabled)')) {
                    const menuItem = e.target.closest('.more-menu-item');
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
        const dropdown = document.getElementById('more-menu-dropdown');
        if (dropdown) {
            dropdown.classList.add('show');
            this.isOpen = true;
        }
    }

    /**
     * 关闭菜单
     */
    close() {
        const dropdown = document.getElementById('more-menu-dropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
            this.isOpen = false;
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
    }
}

// 暴露到全局作用域
window.MoreMenu = MoreMenu;

// 创建全局实例
const moreMenuInstance = new MoreMenu();
