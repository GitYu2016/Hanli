// 文件夹管理组件
export class FolderManager {
    constructor(app) {
        this.app = app;
        this.recentFolders = [];
    }

    // 加载最近文件夹列表
    loadRecentFolders() {
        try {
            const saved = localStorage.getItem('recentFolders');
            if (saved) {
                this.recentFolders = JSON.parse(saved);
            }
        } catch (error) {
            console.error('加载最近文件夹失败:', error);
            this.recentFolders = [];
        }
    }

    // 保存最近文件夹列表
    saveRecentFolders() {
        try {
            localStorage.setItem('recentFolders', JSON.stringify(this.recentFolders));
        } catch (error) {
            console.error('保存最近文件夹失败:', error);
        }
    }

    // 添加文件夹到最近列表
    addToRecentFolders(path, name) {
        // 移除已存在的相同路径
        this.recentFolders = this.recentFolders.filter(folder => folder.path !== path);
        
        // 添加到列表开头
        this.recentFolders.unshift({
            path: path,
            name: name,
            timestamp: Date.now()
        });
        
        // 限制最多保存10个
        if (this.recentFolders.length > 10) {
            this.recentFolders = this.recentFolders.slice(0, 10);
        }
        
        this.saveRecentFolders();
    }

    // 从最近列表中移除文件夹
    removeFromRecentFolders(path) {
        this.recentFolders = this.recentFolders.filter(folder => folder.path !== path);
        this.saveRecentFolders();
    }

    // 渲染最近文件夹列表
    renderRecentFolders() {
        const recentFoldersList = document.getElementById('recentFoldersList');
        const recentFolders = document.getElementById('recentFolders');
        
        if (this.recentFolders.length === 0) {
            recentFolders.style.display = 'none';
            return;
        }
        
        recentFolders.style.display = 'block';
        
        recentFoldersList.innerHTML = this.recentFolders.map(folder => `
            <div class="recent-folder-item" data-path="${folder.path}">
                <div class="recent-folder-info">
                    <div class="recent-folder-name">${folder.name}</div>
                    <div class="recent-folder-path">${folder.path}</div>
                </div>
                <div class="recent-folder-actions">
                    <button class="recent-folder-delete" data-path="${folder.path}" title="删除">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
        
        // 绑定点击事件
        recentFoldersList.addEventListener('click', (e) => {
            const folderItem = e.target.closest('.recent-folder-item');
            const deleteBtn = e.target.closest('.recent-folder-delete');
            
            if (deleteBtn) {
                e.stopPropagation();
                const path = deleteBtn.dataset.path;
                this.removeFromRecentFolders(path);
                this.renderRecentFolders();
            } else if (folderItem) {
                const path = folderItem.dataset.path;
                this.selectRecentFolder(path);
            }
        });
    }

    // 选择最近文件夹
    async selectRecentFolder(path) {
        try {
            this.app.updateStatus('正在加载文件夹...');
            
            // 验证文件夹是否仍然存在
            const result = await window.electronAPI.listDirectories(path);
            if (!result.success) {
                throw new Error('文件夹不存在或无法访问');
            }
            
            // 检查是否包含goods或stores子文件夹
            const goodsPath = `${path}/goods`;
            const storesPath = `${path}/stores`;
            
            const hasGoods = await window.electronAPI.listDirectories(goodsPath).then(r => r.success).catch(() => false);
            const hasStores = await window.electronAPI.listDirectories(storesPath).then(r => r.success).catch(() => false);
            
            if (!hasGoods && !hasStores) {
                throw new Error('文件夹不包含goods或stores子文件夹');
            }
            
            // 设置数据路径
            this.app.dataPath = path;
            this.app.projectFolderName = path.split('/').pop() || path.split('\\').pop();
            
            // 保存到本地存储
            localStorage.setItem('selectedFolder', this.app.dataPath);
            localStorage.setItem('projectFolderName', this.app.projectFolderName);
            
            // 添加到最近列表
            this.addToRecentFolders(path, this.app.projectFolderName);
            
            // 切换到主应用
            this.app.showMainApp();
            await this.app.loadData();
            
            this.app.updateStatus('文件夹加载完成');
            
        } catch (error) {
            console.error('选择最近文件夹失败:', error);
            this.app.updateStatus('选择文件夹失败: ' + error.message);
        }
    }

    // 选择文件夹
    async selectFolder() {
        try {
            console.log('selectFolder方法被调用');
            console.log('window.electronAPI:', window.electronAPI);
            console.log('selectFolder方法:', window.electronAPI.selectFolder);
            this.app.updateStatus('正在打开文件夹选择对话框...');
            
            const result = await window.electronAPI.selectFolder();
            console.log('selectFolder结果:', result);
            if (result.success) {
                this.app.tempSelectedPath = result.data.path;
                this.app.tempProjectName = result.data.name;
                
                // 如果当前在主应用页面，切换到文件夹选择页面显示确认信息
                if (document.getElementById('mainAppPage').style.display !== 'none') {
                    this.app.showFolderSelection(true);
                }
                
                // 显示选择的文件夹信息
                document.getElementById('selectedFolderPath').textContent = this.app.tempSelectedPath;
                document.getElementById('selectedFolderInfo').style.display = 'block';
                
                this.app.updateStatus('已选择文件夹，请确认');
            } else {
                throw new Error(result.error);
            }
            
        } catch (error) {
            console.error('选择文件夹失败:', error);
            this.app.updateStatus('选择文件夹失败: ' + error.message);
        }
    }

    // 确认文件夹选择
    async confirmFolderSelection() {
        try {
            if (!this.app.tempSelectedPath) {
                throw new Error('请先选择文件夹');
            }
            
            this.app.dataPath = this.app.tempSelectedPath;
            this.app.projectFolderName = this.app.tempProjectName;
            
            // 保存到本地存储
            localStorage.setItem('selectedFolder', this.app.dataPath);
            localStorage.setItem('projectFolderName', this.app.projectFolderName);
            
            // 添加到最近列表
            this.addToRecentFolders(this.app.dataPath, this.app.projectFolderName);
            
            // 切换到主应用
            this.app.showMainApp();
            await this.app.loadData();
            
            this.app.updateStatus('文件夹选择完成');
            
        } catch (error) {
            console.error('确认文件夹选择失败:', error);
            this.app.updateStatus('确认失败: ' + error.message);
        }
    }
}
