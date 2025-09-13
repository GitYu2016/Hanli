/**
 * TopBar组件 - 顶部导航栏
 * 负责顶部导航栏的所有功能和交互
 */
class TopBar {
    constructor(app) {
        this.app = app;
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // 侧边栏切换按钮
        const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
        if (toggleSidebarBtn) {
            toggleSidebarBtn.addEventListener('click', () => {
                this.app.toggleSidebar();
            });
        }

        // 需求文档按钮
        const requirementsBtn = document.getElementById('requirementsBtn');
        if (requirementsBtn) {
            requirementsBtn.addEventListener('click', () => {
                this.app.requirementsModal.toggle();
            });
        }

        // 调试图标按钮
        const debugBtn = document.getElementById('debugBtn');
        if (debugBtn) {
            debugBtn.addEventListener('click', () => {
                this.app.debugPopupModal.toggle();
            });
        }

        // 日志按钮
        const logBtn = document.getElementById('logBtn');
        if (logBtn) {
            logBtn.addEventListener('click', () => {
                this.app.logModal.toggle();
            });
        }

        // 设置按钮
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.app.settingsModal.toggle();
            });
        }

        // 搜索功能
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.app.handleSearch(e.target.value);
            });
        }
    }

    // 更新搜索框值
    updateSearchValue(value) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = value;
        }
    }

    // 清空搜索框
    clearSearch() {
        this.updateSearchValue('');
    }

    // 聚焦搜索框
    focusSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
        }
    }

    // 切换侧边栏显示/隐藏
    toggleSidebar() {
        const sidebar = document.getElementById('menuListColumn');
        if (sidebar) {
            sidebar.classList.toggle('hidden');
            
            // 更新按钮图标
            this.updateToggleButtonIcon(sidebar.classList.contains('hidden'));
            
            // 更新拖拽条可见性
            this.updateResizeHandleVisibility();
        }
    }

    // 更新拖拽条可见性
    updateResizeHandleVisibility() {
        const sidebar = document.getElementById('menuListColumn');
        const resizeHandle = document.getElementById('resizeHandle');
        
        if (sidebar && resizeHandle) {
            if (sidebar.classList.contains('hidden')) {
                resizeHandle.style.display = 'none';
            } else {
                resizeHandle.style.display = 'block';
            }
        }
    }

    // 更新切换按钮图标
    updateToggleButtonIcon(isHidden) {
        const toggleBtn = document.getElementById('toggleSidebarBtn');
        if (toggleBtn) {
            const svg = toggleBtn.querySelector('svg');
            if (svg) {
                if (isHidden) {
                    // 显示展开图标（右箭头）
                    svg.innerHTML = `
                        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    `;
                    toggleBtn.title = "展开侧边栏";
                } else {
                    // 显示收起图标（左箭头）
                    svg.innerHTML = `
                        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    `;
                    toggleBtn.title = "收起侧边栏";
                }
            }
        }
    }

    // 显示/隐藏TopBar
    show() {
        const titlebar = document.getElementById('titlebar');
        if (titlebar) {
            titlebar.style.display = 'flex';
        }
    }

    hide() {
        const titlebar = document.getElementById('titlebar');
        if (titlebar) {
            titlebar.style.display = 'none';
        }
    }

    // 更新按钮状态
    updateButtonStates() {
        // 可以在这里添加按钮状态更新的逻辑
        // 例如：根据当前页面状态更新按钮的可用性
    }
}
