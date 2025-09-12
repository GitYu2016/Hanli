// UI管理组件
export class UIManager {
    constructor(app) {
        this.app = app;
    }

    // 显示文件夹选择页面
    showFolderSelection(isReselect = false) {
        document.getElementById('folderSelectionPage').style.display = 'flex';
        document.getElementById('mainAppPage').style.display = 'none';
        document.getElementById('titlebar').style.display = 'none';
        
        // 更新标题和描述
        const title = document.getElementById('folderSelectionTitle');
        const description = document.getElementById('folderSelectionDescription');
        
        if (isReselect) {
            title.textContent = '重新选择数据文件夹';
            description.textContent = '当前已选择文件夹，点击下方按钮重新选择';
        } else {
            title.textContent = '选择数据文件夹';
            description.textContent = '请选择包含商品和店铺数据的文件夹';
        }
        
        this.app.updateStatus('请选择数据文件夹');
        
        // 渲染最近文件夹列表
        this.app.folderManager.renderRecentFolders();
        
        // 调整窗口大小到文件夹选择模式
        window.electronAPI.resizeToFolderSelection();
    }

    // 显示主应用页面
    showMainApp() {
        document.getElementById('folderSelectionPage').style.display = 'none';
        document.getElementById('mainAppPage').style.display = 'flex';
        document.getElementById('titlebar').style.display = 'flex';
        
        // 更新项目文件夹信息
        if (this.app.projectFolderName) {
            document.getElementById('projectFolderName').textContent = this.app.projectFolderName;
        }
        
        // 设置初始菜单状态
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        document.getElementById(this.app.currentType + 'Menu').classList.add('active');
        
        // 更新列表标题
        const listTitle = document.getElementById('listTitle');
        listTitle.textContent = this.app.currentType === 'goods' ? '商品列表' : '店铺列表';
        
        // 调整窗口大小到主应用模式
        window.electronAPI.resizeToMainApp();
    }

    // 切换侧边栏
    toggleSidebar() {
        const menuColumn = document.getElementById('menuColumn');
        this.app.isSidebarCollapsed = !this.app.isSidebarCollapsed;
        
        if (this.app.isSidebarCollapsed) {
            menuColumn.classList.add('collapsed');
        } else {
            menuColumn.classList.remove('collapsed');
        }
        
        this.app.updateStatus(this.app.isSidebarCollapsed ? '侧边栏已收起' : '侧边栏已展开');
    }

    // 处理搜索
    handleSearch(query) {
        this.app.searchQuery = query;
        this.filterCurrentList();
    }

    // 过滤当前列表
    filterCurrentList() {
        if (!this.app.searchQuery.trim()) {
            this.app.dataManager.renderList();
            return;
        }
        
        const filteredItems = this.app.currentItems.filter(item => 
            item.name.toLowerCase().includes(this.app.searchQuery.toLowerCase())
        );
        
        const listContent = document.getElementById('listContent');
        
        if (filteredItems.length === 0) {
            listContent.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <p>未找到匹配的项目</p>
                </div>
            `;
            return;
        }
        
        listContent.innerHTML = filteredItems.map(item => {
            const isGoods = this.app.currentType === 'goods';
            const icon = isGoods ? '📦' : '🏪';
            const title = item.name;
            const subtitle = isGoods ? '商品ID: ' + item.name : '店铺ID: ' + item.name;
            
            return `
                <div class="list-item" data-path="${item.path}" data-name="${item.name}">
                    <div class="list-item-icon">${icon}</div>
                    <div class="list-item-content">
                        <h4 class="list-item-title">${title}</h4>
                        <p class="list-item-subtitle">${subtitle}</p>
                    </div>
                </div>
            `;
        }).join('');

        // 绑定点击事件
        listContent.addEventListener('click', (e) => {
            const listItem = e.target.closest('.list-item');
            if (listItem) {
                const itemPath = listItem.dataset.path;
                const itemName = listItem.dataset.name;
                this.app.selectItem(itemPath, itemName);
            }
        });
    }

    // 切换文件夹浮窗
    toggleFolderPopup() {
        console.log('toggleFolderPopup被调用');
        const popup = document.getElementById('folderPopup');
        console.log('找到浮窗元素:', popup);
        console.log('当前显示状态:', popup.style.display);
        
        if (popup.style.display === 'none' || popup.style.display === '') {
            console.log('显示文件夹浮窗');
            this.showFolderPopup();
        } else {
            console.log('隐藏文件夹浮窗');
            this.hideFolderPopup();
        }
    }

    // 显示文件夹浮窗
    showFolderPopup() {
        console.log('showFolderPopup被调用');
        const popup = document.getElementById('folderPopup');
        console.log('设置文件夹浮窗显示');
        popup.style.display = 'block';
        console.log('文件夹浮窗显示状态已设置为:', popup.style.display);
        
        // 点击其他地方关闭浮窗
        setTimeout(() => {
            document.addEventListener('click', this.handleOutsideClick.bind(this));
        }, 0);
    }

    // 隐藏文件夹浮窗
    hideFolderPopup() {
        const popup = document.getElementById('folderPopup');
        popup.style.display = 'none';
        
        // 移除点击事件监听
        document.removeEventListener('click', this.handleOutsideClick.bind(this));
    }

    // 处理点击外部区域
    handleOutsideClick(event) {
        const popup = document.getElementById('folderPopup');
        const button = document.getElementById('changeFolderBtn');
        
        if (!popup.contains(event.target) && !button.contains(event.target)) {
            this.hideFolderPopup();
        }
    }

    // 打开文件
    async openFile(filePath, fileName) {
        try {
            // 检查文件类型
            const ext = fileName.split('.').pop().toLowerCase();
            const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
            
            if (imageExts.includes(ext)) {
                // 图片文件，在应用内预览
                await this.previewImage(filePath);
            } else {
                // 其他文件，用系统默认程序打开
                await window.electronAPI.openFile(filePath);
            }
        } catch (error) {
            console.error('打开文件失败:', error);
            this.app.updateStatus('打开文件失败: ' + error.message);
        }
    }

    // 预览图片
    async previewImage(filePath) {
        try {
            const result = await window.electronAPI.readImage(filePath);
            if (result.success) {
                this.showImagePreview(result.data, filePath);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('预览图片失败:', error);
            this.app.updateStatus('预览图片失败: ' + error.message);
        }
    }

    // 显示图片预览
    showImagePreview(imageData, filePath) {
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="image-modal-content">
                <div class="image-modal-header">
                    <h3>图片预览</h3>
                    <button class="btn-icon image-modal-close" id="closeImageModal">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
                <div class="image-modal-body">
                    <img src="${imageData}" alt="预览图片" class="preview-image">
                </div>
                <div class="image-modal-footer">
                    <button class="btn btn-secondary" id="openImageExternally">用系统程序打开</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 绑定事件
        document.getElementById('closeImageModal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        document.getElementById('openImageExternally').addEventListener('click', async () => {
            await window.electronAPI.openFile(filePath);
        });
        
        // 点击模态框背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    // 处理键盘快捷键
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + 1: 切换到商品列表
        if ((e.ctrlKey || e.metaKey) && e.key === '1') {
            e.preventDefault();
            this.app.dataManager.switchMenuType('goods');
        }
        // Ctrl/Cmd + 2: 切换到店铺列表
        else if ((e.ctrlKey || e.metaKey) && e.key === '2') {
            e.preventDefault();
            this.app.dataManager.switchMenuType('stores');
        }
        // F5: 刷新当前列表
        else if (e.key === 'F5') {
            e.preventDefault();
            this.app.dataManager.refreshCurrentList();
        }
        // Escape: 返回列表
        else if (e.key === 'Escape') {
            e.preventDefault();
            this.app.backToList();
        }
        // Ctrl/Cmd + F: 聚焦搜索框
        else if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            document.getElementById('searchInput').focus();
        }
    }

    // 更新状态
    updateStatus(message) {
        // 由于移除了状态栏，这个方法暂时保留但不执行任何操作
        console.log('状态:', message);
    }

    // 切换调试工具浮窗
    toggleDebugPopup() {
        console.log('toggleDebugPopup被调用');
        const popup = document.getElementById('debugPopup');
        console.log('找到浮窗元素:', popup);
        console.log('当前显示状态:', popup.style.display);
        
        if (popup.style.display === 'none' || popup.style.display === '') {
            console.log('显示浮窗');
            this.showDebugPopup();
        } else {
            console.log('隐藏浮窗');
            this.hideDebugPopup();
        }
    }

    // 显示调试工具浮窗
    showDebugPopup() {
        console.log('showDebugPopup被调用');
        const popup = document.getElementById('debugPopup');
        console.log('设置浮窗显示');
        popup.style.display = 'block';
        console.log('浮窗显示状态已设置为:', popup.style.display);
        
        // 点击其他地方关闭浮窗
        setTimeout(() => {
            document.addEventListener('click', this.handleDebugOutsideClick.bind(this));
        }, 0);
    }

    // 隐藏调试工具浮窗
    hideDebugPopup() {
        const popup = document.getElementById('debugPopup');
        popup.style.display = 'none';
        
        // 移除点击事件监听
        document.removeEventListener('click', this.handleDebugOutsideClick.bind(this));
    }

    // 处理调试浮窗外部点击
    handleDebugOutsideClick(event) {
        const popup = document.getElementById('debugPopup');
        const button = document.getElementById('debugBtn');
        
        if (!popup.contains(event.target) && !button.contains(event.target)) {
            this.hideDebugPopup();
        }
    }

    // 重置文件夹
    resetFolder() {
        try {
            // 清除本地存储
            localStorage.removeItem('selectedFolder');
            localStorage.removeItem('projectFolderName');
            
            // 重置应用状态
            this.app.dataPath = null;
            this.app.projectFolderName = null;
            this.app.currentItems = [];
            this.app.selectedItem = null;
            this.app.itemData = {};
            
            // 清空详情内容
            this.app.detailManager.clearDetailContent();
            
            // 切换到文件夹选择页面
            this.showFolderSelection(false);
            
            this.updateStatus('已重置文件夹，请重新选择');
            
        } catch (error) {
            console.error('重置文件夹失败:', error);
            this.updateStatus('重置失败: ' + error.message);
        }
    }
}
