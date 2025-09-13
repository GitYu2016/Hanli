// 详情管理组件
export class DetailManager {
    constructor(app) {
        this.app = app;
    }

    // 选择项目
    async selectItem(itemPath, itemName) {
        this.app.selectedItem = { 
            path: itemPath, 
            name: itemName, 
            type: this.app.currentType 
        };
        
        // 更新列表选中状态
        document.querySelectorAll('.list-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-path="${itemPath}"]`).classList.add('active');
        
        // 加载详情
        await this.loadItemDetail(itemPath, itemName);
        
        this.app.updateStatus(`已选择${this.app.currentType === 'goods' ? '商品' : '店铺'}: ${itemName}`);
    }

    // 加载项目详情
    async loadItemDetail(itemPath, itemName) {
        try {
            this.app.updateStatus('正在加载详情...');
            
            // 获取项目文件夹中的所有文件
            const result = await window.electronAPI.listDirectories(itemPath);
            if (!result.success) {
                throw new Error(result.error);
            }
            
            const files = result.data;
            
            // 加载项目数据
            let itemData = {};
            const dataFile = files.find(file => file.name === `${this.app.currentType}_data.json`);
            if (dataFile) {
                try {
                    const dataResult = await window.electronAPI.readFile(dataFile.path);
                    if (dataResult.success) {
                        itemData = JSON.parse(dataResult.data);
                    }
                } catch (error) {
                    console.warn('加载项目数据失败:', error);
                }
            }
            
            // 渲染详情内容
            this.renderDetailContent(itemName, files, itemData);
            
            this.app.updateStatus('详情加载完成');
            
        } catch (error) {
            console.error('加载详情失败:', error);
            this.showDetailError(error.message);
        }
    }

    // 渲染详情内容
    renderDetailContent(itemName, files, itemData) {
        const detailContent = document.getElementById('detailContent');
        const isGoods = this.app.currentType === 'goods';
        
        let html = `
            <div class="detail-section">
                <h3 class="detail-title">${itemName}</h3>
                <div class="detail-actions">
                    <button class="btn btn-secondary" id="backToListBtn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        返回列表
                    </button>
                    <button class="btn btn-primary" id="refreshDetailBtn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 4V10H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M23 20V14H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M22.99 14A9 9 0 0 1 18.36 18.36L14 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        刷新
                    </button>
                </div>
            </div>
        `;

        // 添加数据信息
        if (Object.keys(itemData).length > 0) {
            html += `
                <div class="detail-section">
                    <h4 class="detail-section-title">数据信息</h4>
                    <div class="detail-data">
                        ${this.formatItemData(itemData)}
                    </div>
                </div>
            `;
        }

        // 添加文件列表
        if (files.length > 0) {
            html += `
                <div class="detail-section">
                    <h4 class="detail-section-title">文件列表</h4>
                    <div class="file-list">
                        ${files.map(file => this.renderFileItem(file)).join('')}
                    </div>
                </div>
            `;
        }

        detailContent.innerHTML = html;

        // 绑定事件
        this.bindDetailEvents();
    }

    // 渲染文件项
    renderFileItem(file) {
        const icon = this.getFileIcon(file.name);
        const size = file.isDirectory ? '' : this.formatFileSize(file.size || 0);
        
        return `
            <div class="file-item" data-path="${file.path}" data-name="${file.name}">
                <div class="file-icon">${icon}</div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-meta">${file.isDirectory ? '文件夹' : size}</div>
                </div>
                <div class="file-actions">
                    <button class="btn-icon file-action-btn" title="打开">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    // 获取文件图标
    getFileIcon(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const iconMap = {
            'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️', 'bmp': '🖼️', 'webp': '🖼️',
            'mp4': '🎥', 'avi': '🎥', 'mov': '🎥', 'wmv': '🎥', 'flv': '🎥',
            'pdf': '📄', 'doc': '📄', 'docx': '📄', 'txt': '📄',
            'json': '📋', 'xml': '📋', 'csv': '📋',
            'zip': '📦', 'rar': '📦', '7z': '📦'
        };
        return iconMap[ext] || '📄';
    }

    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 格式化项目数据
    formatItemData(data) {
        return Object.entries(data).map(([key, value]) => `
            <div class="data-item">
                <span class="data-key">${key}:</span>
                <span class="data-value">${typeof value === 'object' ? JSON.stringify(value) : value}</span>
            </div>
        `).join('');
    }

    // 绑定详情事件
    bindDetailEvents() {
        // 返回列表按钮
        const backBtn = document.getElementById('backToListBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.app.backToList();
            });
        }

        // 刷新按钮
        const refreshBtn = document.getElementById('refreshDetailBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                if (this.app.selectedItem) {
                    this.loadItemDetail(this.app.selectedItem.path, this.app.selectedItem.name);
                }
            });
        }

        // 文件项点击事件
        const fileItems = document.querySelectorAll('.file-item');
        fileItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const filePath = item.dataset.path;
                const fileName = item.dataset.name;
                this.app.openFile(filePath, fileName);
            });
        });
    }

    // 显示详情错误
    showDetailError(message) {
        const detailContent = document.getElementById('detailContent');
        detailContent.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <p>加载详情失败: ${message}</p>
                <button class="btn btn-primary" id="retryDetailBtn">重试</button>
            </div>
        `;
        
        // 绑定重试按钮
        document.getElementById('retryDetailBtn').addEventListener('click', () => {
            if (this.app.selectedItem) {
                this.loadItemDetail(this.app.selectedItem.path, this.app.selectedItem.name);
            }
        });
    }

    // 清空详情内容
    clearDetailContent() {
        const detailContent = document.getElementById('detailContent');
        detailContent.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <p>请选择一个项目查看详情</p>
            </div>
        `;
    }
}
