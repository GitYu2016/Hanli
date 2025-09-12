// 数据管理组件
export class DataManager {
    constructor(app) {
        this.app = app;
    }

    // 加载数据
    async loadData() {
        try {
            this.app.updateStatus('正在加载数据...');
            
            // 确保dataPath已设置
            if (!this.app.dataPath) {
                console.error('dataPath未设置，无法加载数据');
                this.app.updateStatus('数据路径未设置');
                return;
            }
            
            // 加载商品数据
            await this.loadGoodsData();
            
            // 加载店铺数据
            await this.loadStoresData();
            
            // 加载当前类型的列表
            await this.loadCurrentList();
            
            this.app.updateStatus('数据加载完成');
            
        } catch (error) {
            console.error('加载数据失败:', error);
            this.app.updateStatus('加载数据失败: ' + error.message);
        }
    }

    // 加载商品数据
    async loadGoodsData() {
        try {
            const fullPath = `${this.app.dataPath}/goods`;
            const result = await window.electronAPI.listDirectories(fullPath);
            if (result.success) {
                this.app.goodsCount = result.data.filter(item => item.isDirectory).length;
                document.getElementById('goodsCount').textContent = this.app.goodsCount;
            } else {
                console.warn('加载商品数据失败:', result.error);
                this.app.goodsCount = 0;
                document.getElementById('goodsCount').textContent = '0';
            }
        } catch (error) {
            console.error('加载商品数据失败:', error);
            this.app.goodsCount = 0;
            document.getElementById('goodsCount').textContent = '0';
        }
    }

    // 加载店铺数据
    async loadStoresData() {
        try {
            const fullPath = `${this.app.dataPath}/stores`;
            const result = await window.electronAPI.listDirectories(fullPath);
            if (result.success) {
                this.app.storesCount = result.data.filter(item => item.isDirectory).length;
                document.getElementById('storesCount').textContent = this.app.storesCount;
            } else {
                console.warn('加载店铺数据失败:', result.error);
                this.app.storesCount = 0;
                document.getElementById('storesCount').textContent = '0';
            }
        } catch (error) {
            console.error('加载店铺数据失败:', error);
            this.app.storesCount = 0;
            document.getElementById('storesCount').textContent = '0';
        }
    }

    // 加载当前类型的列表
    async loadCurrentList() {
        try {
            this.showListLoading();
            const fullPath = `${this.app.dataPath}/${this.app.currentType}`;
            const result = await window.electronAPI.listDirectories(fullPath);
            if (result.success) {
                this.app.currentItems = result.data.filter(item => item.isDirectory);
                this.renderList();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error(`加载${this.app.currentType}列表失败:`, error);
            this.showListError(error.message);
        }
    }

    // 显示列表加载状态
    showListLoading() {
        const listContent = document.getElementById('listContent');
        listContent.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>正在加载列表...</p>
            </div>
        `;
    }

    // 显示列表错误状态
    showListError(message) {
        const listContent = document.getElementById('listContent');
        listContent.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <p>加载失败: ${message}</p>
                <button class="btn btn-primary" id="retryListBtn">重试</button>
            </div>
        `;
        
        // 绑定重试按钮
        document.getElementById('retryListBtn').addEventListener('click', () => {
            this.loadCurrentList();
        });
    }

    // 渲染列表
    renderList() {
        const listContent = document.getElementById('listContent');
        
        if (this.app.currentItems.length === 0) {
            this.showEmptyList();
            return;
        }

        listContent.innerHTML = this.app.currentItems.map(item => {
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

    // 显示空列表状态
    showEmptyList() {
        const listContent = document.getElementById('listContent');
        const typeName = this.app.currentType === 'goods' ? '商品' : '店铺';
        
        listContent.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <p>暂无${typeName}数据</p>
            </div>
        `;
    }

    // 切换菜单类型
    async switchMenuType(type) {
        if (this.app.currentType === type) return;
        
        this.app.currentType = type;
        this.app.selectedItem = null;
        
        // 更新菜单状态
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        document.getElementById(type + 'Menu').classList.add('active');
        
        // 更新列表标题
        const listTitle = document.getElementById('listTitle');
        listTitle.textContent = type === 'goods' ? '商品列表' : '店铺列表';
        
        // 清空详情页
        this.app.clearDetailContent();
        
        // 加载新类型的列表
        await this.loadCurrentList();
        
        this.app.updateStatus(`已切换到${type === 'goods' ? '商品' : '店铺'}列表`);
    }

    // 刷新当前列表
    async refreshCurrentList() {
        await this.loadCurrentList();
        this.app.updateStatus('列表已刷新');
    }
}
