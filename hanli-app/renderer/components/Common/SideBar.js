/**
 * SideBar 组件
 * 负责侧边栏的渲染和交互逻辑
 * 样式定义在JavaScript中，通过StyleManager管理
 */
class SideBar {
    constructor() {
        this.isResizing = false;
        this.navigationCallback = null;
        this.initStyles();
        this.init();
    }

    /**
     * 初始化SideBar样式
     */
    initStyles() {
        // 确保StyleManager已加载
        if (typeof window.styleManager === 'undefined') {
            console.error('StyleManager未加载，请确保已引入StyleManager.js');
            return;
        }

        // 定义SideBar样式
        const sidebarStyles = {
            // SideBar容器
            '.sidebar': {
                'width': '220px',
                'height': '100%',
                'border-right': '1px solid var(--color-border-normal)',
                'overflow-y': 'auto',
                'overflow-x': 'hidden',
                'z-index': '100',
                'transition': 'width 0.3s ease, transform 0.3s ease',
                'user-select': 'none'
            },

            // SideBar内容
            '.sidebar-content': {
                'padding': '20px 12px',
                'display': 'flex',
                'flex-direction': 'column',
                'transition': 'background-color 0.2s ease'
            },


            '.sidebar-content.active': {
                'background-color': 'var(--color-background-focused)'
            },

            // SideBar项目
            '.sidebar-item': {
                'display': 'flex',
                'align-items': 'center',
                'padding': '12px 12px',
                'cursor': 'pointer',
                'transition': 'all 0.2s ease',
                'position': 'relative',
                'color': 'var(--color-secondary)',
                'background-color': 'transparent',
                'border-radius': '6px'
            },

            '.sidebar-item:hover': {
                'background-color': 'var(--color-background-normal-reverse)',
                'color': 'var(--color-primary)'
            },

            '.sidebar-item.active': {
                'background-color': 'var(--color-background-normal-reverse)',
                'color': 'var(--color-primary)',
                'font-weight': '600'
            },


            // SideBar项目内容
            '.sidebar-item-content': {
                'display': 'flex',
                'align-items': 'center',
                'gap': '8px',
                'width': '100%'
            },

            '.sidebar-item-icon': {
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                'width': '20px',
                'height': '20px',
                'flex-shrink': '0'
            },

            '.sidebar-item-icon .svg-icon': {
                'width': '16px',
                'height': '16px',
                'color': 'var(--color-secondary)',
                'transition': 'color 0.2s ease'
            },

            '.sidebar-item:hover .sidebar-item-icon .svg-icon, .sidebar-item.active .sidebar-item-icon .svg-icon': {
                'color': 'var(--color-focused)'
            },

            '.sidebar-item-text': {
                'font-size': '14px',
                'font-weight': '500',
                'flex': '1'
            },

            // SideBar分组
            '.sidebar-group': {
                'margin-top': '12px'
            },

            '.sidebar-group:first-child': {
                'margin-top': '0'
            },

            '.sidebar-group-title': {
                'padding': '8px 12px 8px',
                'font-size': '12px',
                'font-weight': '600',
                'color': 'var(--color-secondary)',
                'text-transform': 'uppercase',
                'letter-spacing': '0.5px',
                'transition': 'color 0.2s ease'
            },

            // 调整手柄
            '.sidebar-resize-handle': {
                'position': 'absolute',
                'top': '0',
                'right': '0',
                'width': '4px',
                'height': '100%',
                'background-color': 'transparent',
                'cursor': 'col-resize',
                'transition': 'background-color 0.2s ease'
            },

            '.sidebar-resize-handle:hover': {
                'background-color': 'var(--color-interactive-focus)'
            },

            // 响应式设计
            '@media (max-width: 768px)': {
                '.sidebar': {
                    'width': '200px',
                    'transform': 'translateX(-100%)'
                },
                '.sidebar.open': {
                    'transform': 'translateX(0)'
                },
                '.sidebar-content': {
                    'padding': '16px 0'
                },
                '.sidebar-item': {
                    'padding': '10px 16px'
                },
                '.sidebar-group-title': {
                    'padding': '6px 16px 10px'
                }
            },

            // 隐藏状态
            '.sidebar.hidden': {
                'transform': 'translateX(-100%)'
            }
        };

        // 注册样式到StyleManager
        window.styleManager.defineStyles('SideBar', sidebarStyles);
    }

    /**
     * 初始化SideBar组件
     */
    init() {
        this.render();
        this.bindEvents();
    }

    /**
     * 设置导航回调
     * @param {Function} callback - 导航回调函数
     */
    setNavigationCallback(callback) {
        this.navigationCallback = callback;
    }

    /**
     * 渲染SideBar HTML结构
     */
    render() {
        const sidebarHTML = `
            <div id="sidebar" class="sidebar">
                <div class="sidebar-content">
                    <div class="sidebar-item active" data-page="home">
                        <div class="sidebar-item-content">
                            <div class="sidebar-item-icon">
                                ${Icon.render('home', { className: 'svg-icon', style: 'bold' })}
                            </div>
                            <div class="sidebar-item-text">首页</div>
                        </div>
                    </div>
                    
                    <div class="sidebar-group">
                        <div class="sidebar-group-title">选品</div>
                        <div class="sidebar-item" data-page="product-library">
                            <div class="sidebar-item-content">
                                <div class="sidebar-item-icon">
                                    ${Icon.render('package', { className: 'svg-icon', style: 'bold' })}
                                </div>
                                <div class="sidebar-item-text">产品库</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="sidebar-resizer" id="sidebar-resizer"></div>
            </div>
        `;

        // 查找现有的sidebar元素并替换
        const existingSidebar = document.getElementById('sidebar');
        if (existingSidebar) {
            existingSidebar.outerHTML = sidebarHTML;
        } else {
            // 如果不存在，插入到main-layout开始处
            const mainLayout = document.querySelector('.main-layout');
            if (mainLayout) {
                mainLayout.insertAdjacentHTML('afterbegin', sidebarHTML);
            }
        }
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 侧边栏点击事件
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                this.navigateToPage(page);
            });
        });

        // 侧边栏拖拽调整宽度
        this.bindSidebarResizer();
    }

    /**
     * 绑定侧边栏拖拽调整器
     */
    bindSidebarResizer() {
        const resizer = document.getElementById('sidebar-resizer');
        const sidebar = document.getElementById('sidebar');
        
        if (!resizer || !sidebar) return;

        resizer.addEventListener('mousedown', (e) => {
            this.isResizing = true;
            document.addEventListener('mousemove', this.handleResize);
            document.addEventListener('mouseup', this.stopResize);
            e.preventDefault();
        });
    }

    /**
     * 处理侧边栏拖拽调整
     * @param {MouseEvent} e - 鼠标事件
     */
    handleResize = (e) => {
        if (!this.isResizing) return;
        
        const sidebar = document.getElementById('sidebar');
        const newWidth = e.clientX;
        const minWidth = 200;
        const maxWidth = 320;
        
        if (newWidth >= minWidth && newWidth <= maxWidth) {
            // 使用CSS变量而不是内联样式
            sidebar.style.setProperty('--sidebar-width', newWidth + 'px');
            sidebar.style.width = newWidth + 'px';
        }
    }

    /**
     * 停止侧边栏拖拽调整
     */
    stopResize = () => {
        this.isResizing = false;
        document.removeEventListener('mousemove', this.handleResize);
        document.removeEventListener('mouseup', this.stopResize);
    }

    /**
     * 导航到页面
     * @param {string} page - 页面标识
     */
    navigateToPage(page) {
        if (this.navigationCallback) {
            this.navigationCallback(page);
        }
        
        // 更新侧边栏选中状态
        this.updateActiveState(page);
    }

    /**
     * 更新侧边栏激活状态
     * @param {string} activePage - 当前激活的页面
     */
    updateActiveState(activePage) {
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`[data-page="${activePage}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    /**
     * 根据Tab更新侧边栏状态
     * @param {Object} tab - Tab对象
     */
    updateSidebarForTab(tab) {
        // 清除所有侧边栏项的激活状态
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // 根据Tab类型设置对应的侧边栏项为激活状态
        let targetPage = null;
        switch (tab.pageData.type) {
            case 'home':
                targetPage = 'home';
                break;
            case 'goodsList':
                targetPage = 'product-library';
                break;
            case 'productDetail':
                // 产品详情页不更新侧边栏状态，保持当前状态
                return;
        }
        
        if (targetPage) {
            const sidebarItem = document.querySelector(`[data-page="${targetPage}"]`);
            if (sidebarItem) {
                sidebarItem.classList.add('active');
            }
        }
    }

    /**
     * 设置侧边栏宽度
     * @param {number} width - 宽度值
     */
    setWidth(width) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.style.setProperty('--sidebar-width', width + 'px');
            sidebar.style.width = width + 'px';
        }
    }

    /**
     * 获取侧边栏宽度
     * @returns {number} 当前宽度
     */
    getWidth() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            return parseInt(sidebar.style.width) || 220;
        }
        return 220;
    }

    /**
     * 显示/隐藏侧边栏
     * @param {boolean} visible - 是否显示
     */
    setVisible(visible) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            if (visible) {
                sidebar.classList.remove('hidden');
            } else {
                sidebar.classList.add('hidden');
            }
        }
    }

    /**
     * 添加侧边栏项
     * @param {Object} itemData - 侧边栏项数据
     */
    addSidebarItem(itemData) {
        const sidebarContent = document.querySelector('.sidebar-content');
        if (!sidebarContent) return;

        const { page, icon, text, group } = itemData;
        
        let targetGroup = sidebarContent;
        if (group) {
            // 查找或创建分组
            let groupElement = sidebarContent.querySelector(`[data-group="${group}"]`);
            if (!groupElement) {
                groupElement = document.createElement('div');
                groupElement.className = 'sidebar-group';
                groupElement.dataset.group = group;
                groupElement.innerHTML = `<div class="sidebar-group-title">${group}</div>`;
                sidebarContent.appendChild(groupElement);
            }
            targetGroup = groupElement;
        }

        const itemHTML = `
            <div class="sidebar-item" data-page="${page}">
                <div class="sidebar-item-content">
                    <div class="sidebar-item-icon">
                        <div class="svg-icon" data-icon="${icon.replace('ph-', '')}" data-filled="false" data-style="bold"></div>
                    </div>
                    <div class="sidebar-item-text">${text}</div>
                </div>
            </div>
        `;

        targetGroup.insertAdjacentHTML('beforeend', itemHTML);

        // 重新绑定事件
        this.bindEvents();
    }

    /**
     * 移除侧边栏项
     * @param {string} page - 页面标识
     */
    removeSidebarItem(page) {
        const item = document.querySelector(`[data-page="${page}"]`);
        if (item) {
            item.remove();
        }
    }

    /**
     * 销毁组件
     */
    destroy() {
        // 清理事件监听器
        const resizer = document.getElementById('sidebar-resizer');
        if (resizer) {
            resizer.replaceWith(resizer.cloneNode(true));
        }

        const sidebarItems = document.querySelectorAll('.sidebar-item');
        sidebarItems.forEach(item => {
            item.replaceWith(item.cloneNode(true));
        });

        // 清理拖拽事件
        document.removeEventListener('mousemove', this.handleResize);
        document.removeEventListener('mouseup', this.stopResize);
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SideBar;
} else {
    window.SideBar = SideBar;
}
