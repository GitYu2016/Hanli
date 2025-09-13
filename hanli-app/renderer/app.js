// TopBar组件已移至 components/TopBar.js
// SidebarResizer组件已移至 components/SidebarResizer.js

// 第一列菜单和列表组件
class MenuListColumn {
    constructor(app) {
        this.app = app;
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // 文件夹切换功能已移除

        // 产品库区域展开/收起事件
        document.getElementById('productLibrarySection').addEventListener('click', (e) => {
            if (e.target.closest('.data-section-header')) {
                this.toggleDataSection('productLibrarySection');
            }
        });

        // 数据监控区域展开/收起事件
        document.getElementById('monitoringSection').addEventListener('click', (e) => {
            if (e.target.closest('.data-section-header')) {
                this.toggleDataSection('monitoringSection');
            }
        });
    }

    // 更新产品库商品数量
    updateProductLibraryCount(count) {
        const countElement = document.getElementById('productLibraryCount');
        if (countElement) {
            countElement.textContent = count;
        }
    }

    // 更新监控数量
    updateMonitoringCount(count) {
        const countElement = document.getElementById('monitoringCount');
        if (countElement) {
            countElement.textContent = count;
        }
    }

    // 渲染统一监控列表
    renderMonitoringList(items) {
        const monitoringList = document.getElementById('monitoringList');
        if (!monitoringList) return;

        if (items.length === 0) {
            monitoringList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 3V21H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M9 9L12 6L16 10L20 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <p>暂无监控数据</p>
                </div>
            `;
            return;
        }

        const monitoringItems = items.map(item => {
            const icon = item.type === 'goods' ? '📊' : '🏪';
            const typeLabel = item.type === 'goods' ? '商品' : '店铺';
            return `
                <div class="data-item" data-path="${item.path}" data-name="${item.name}" data-type="monitoring-${item.type}">
                    <div class="data-item-icon">${icon}</div>
                    <div class="data-item-info">
                        <div class="data-item-id">${item.name}</div>
                        <div class="data-item-type">${typeLabel}</div>
                    </div>
                </div>
            `;
        }).join('');

        monitoringList.innerHTML = monitoringItems;

        // 绑定点击事件
        monitoringList.querySelectorAll('.data-item').forEach(item => {
            item.addEventListener('click', () => {
                this.app.selectDataItem(item);
            });
        });
    }

    // 更新监控店铺数量
    updateMonitoringStoresCount(count) {
        const countElement = document.getElementById('monitoringStoresCount');
        if (countElement) {
            countElement.textContent = count;
        }
    }

    // 更新项目文件夹名称
    updateProjectFolderName(name) {
        const projectFolderNameElement = document.getElementById('projectFolderName');
        if (projectFolderNameElement) {
            projectFolderNameElement.textContent = name;
        }
    }

    // 切换侧边栏状态
    toggleSidebar(collapsed) {
        const menuListColumn = document.getElementById('menuListColumn');
        const resizeHandle = document.getElementById('resizeHandle');
        
        if (collapsed) {
            menuListColumn.classList.add('collapsed');
            // 收起时隐藏拖拽条
            if (resizeHandle) {
                resizeHandle.style.display = 'none';
            }
        } else {
            menuListColumn.classList.remove('collapsed');
            // 展开时显示拖拽条
            if (resizeHandle) {
                resizeHandle.style.display = 'block';
            }
        }
    }

    // 显示文件夹浮窗
    showFolderPopup() {
        const popup = document.getElementById('folderPopup');
        if (popup) {
            popup.style.display = 'block';
        }
    }

    // 隐藏文件夹浮窗
    hideFolderPopup() {
        const popup = document.getElementById('folderPopup');
        if (popup) {
            popup.style.display = 'none';
        }
    }

    // 渲染产品库商品列表
    renderProductLibraryList(items) {
        const goodsList = document.getElementById('productLibraryList');
        if (!goodsList) return;

        if (items.length === 0) {
            goodsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 7V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M3 7L5 21H19L21 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M8 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M16 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <p>暂无商品数据</p>
                </div>
            `;
            return;
        }

        // 新建产品项
        const newProductItem = `
            <div class="data-item new-product-item" data-type="new-product">
                <div class="data-item-icon">➕</div>
                <div class="data-item-id">新建产品</div>
            </div>
        `;
        
        // 商品列表项
        const goodsItems = items.map(item => `
            <div class="data-item" data-path="${item.path}" data-name="${item.name}" data-type="goods">
                <div class="data-item-icon">📦</div>
                <div class="data-item-id">${item.name}</div>
            </div>
        `).join('');
        
        goodsList.innerHTML = newProductItem + goodsItems;

        // 绑定点击事件
        goodsList.querySelectorAll('.data-item').forEach(item => {
            item.addEventListener('click', () => {
                this.app.selectDataItem(item);
            });
        });
    }

    // 渲染店铺列表
    renderStoresList(items) {
        const storesList = document.getElementById('storesList');
        if (!storesList) return;

        if (items.length === 0) {
            storesList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 9L12 2L21 9V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <p>暂无店铺数据</p>
                </div>
            `;
            return;
        }

        storesList.innerHTML = items.map(item => `
            <div class="data-item" data-path="${item.path}" data-name="${item.name}" data-type="stores">
                <div class="data-item-icon">🏪</div>
                <div class="data-item-id">${item.name}</div>
            </div>
        `).join('');

        // 绑定点击事件
        storesList.querySelectorAll('.data-item').forEach(item => {
            item.addEventListener('click', () => {
                this.app.selectDataItem(item);
            });
        });
    }

    // 渲染监控商品列表
    renderMonitoringGoodsList(items) {
        const monitoringGoodsList = document.getElementById('monitoringGoodsList');
        if (!monitoringGoodsList) return;

        if (items.length === 0) {
            monitoringGoodsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 7V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M3 7L5 21H19L21 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M8 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M16 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <p>暂无监控商品数据</p>
                </div>
            `;
            return;
        }

        const goodsItems = items.map(item => `
            <div class="data-item" data-path="${item.path}" data-name="${item.name}" data-type="monitoring-goods">
                <div class="data-item-icon">📊</div>
                <div class="data-item-id">${item.name}</div>
            </div>
        `).join('');

        monitoringGoodsList.innerHTML = goodsItems;

        // 绑定点击事件
        monitoringGoodsList.querySelectorAll('.data-item').forEach(item => {
            item.addEventListener('click', () => {
                this.app.selectDataItem(item);
            });
        });
    }

    // 渲染监控店铺列表
    renderMonitoringStoresList(items) {
        const monitoringStoresList = document.getElementById('monitoringStoresList');
        if (!monitoringStoresList) return;

        if (items.length === 0) {
            monitoringStoresList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 9L12 2L21 9V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <p>暂无监控店铺数据</p>
                </div>
            `;
            return;
        }

        const storesItems = items.map(item => `
            <div class="data-item" data-path="${item.path}" data-name="${item.name}" data-type="monitoring-stores">
                <div class="data-item-icon">🏪</div>
                <div class="data-item-id">${item.name}</div>
            </div>
        `).join('');

        monitoringStoresList.innerHTML = storesItems;

        // 绑定点击事件
        monitoringStoresList.querySelectorAll('.data-item').forEach(item => {
            item.addEventListener('click', () => {
                this.app.selectDataItem(item);
            });
        });
    }

    // 更新选中状态
    updateSelection(selectedElement) {
        document.querySelectorAll('.data-item').forEach(item => {
            item.classList.remove('active');
        });
        if (selectedElement) {
            selectedElement.classList.add('active');
        }
    }

    // 切换数据区域展开/收起状态
    toggleDataSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.toggle('collapsed');
        }
    }
}


// 第三列详情组件
class DetailColumn {
    constructor(app) {
        this.app = app;
        this.goodsBasicInfo = new GoodsBasicInfo(app);
        this.imageGallery = new ImageGallery(app);
        this.monitoringCharts = new MonitoringChartsModal(app);
        this.imageCardManager = new ImageCardManager(app);
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // 返回列表按钮
        document.getElementById('backToListBtn').addEventListener('click', () => {
            this.app.backToList();
        });
    }

    // 渲染详情内容
    async renderDetailContent(itemName, files, itemData, itemType) {
        try {
            console.log('开始渲染详情内容:', { itemName, files, itemData, itemType });
            
            const detailContent = document.getElementById('detailContent');
            if (!detailContent) {
                console.error('未找到detailContent元素');
                return;
            }
            
            const isGoods = itemType === 'goods';
            const isMonitoringGoods = itemType === 'monitoring-goods';
            const isMonitoringStores = itemType === 'monitoring-stores';
            let html = '';
            
            // 监控数据图表区域
            if (isMonitoringGoods || isMonitoringStores) {
                html += this.monitoringCharts.render(itemData, itemType);
            }
            
            // 商品信息卡片区域（仅对监控商品显示）
            if (isMonitoringGoods && itemData['goods_data.json']) {
                html += this.renderMonitoringGoodsInfoCard(itemData['goods_data.json']);
            }
            
            console.log('渲染图片区域...');
            // 2. 图片区域
            const showAddButton = !isMonitoringGoods && !isMonitoringStores;
            const showDeleteBtn = !isMonitoringGoods && !isMonitoringStores;
            html += await this.imageGallery.render(files, this.app.selectedItem?.path, showAddButton, showDeleteBtn);
            
            console.log('渲染基本信息区域...');
            // 3. 基本信息区域
            if (isGoods && itemData['goods_data.json']) {
                html += this.goodsBasicInfo.render(itemData['goods_data.json'], this.app.handleBasicInfoChange.bind(this.app));
            } else if (isGoods) {
                html += this.goodsBasicInfo.renderEmpty();
            } else if (!isGoods && itemData['store_data.json']) {
                const store = itemData['store_data.json'];
                html += `
                    <div class="detail-section">
                        <h3 class="detail-section-title">基本信息</h3>
                        <div class="detail-section-card">
                            <div class="detail-info">
                                <div class="detail-info-item">
                                    <span class="detail-info-label">店铺ID:</span>
                                    <span class="detail-info-value">${itemName}</span>
                                </div>
                                <div class="detail-info-item">
                                    <span class="detail-info-label">店铺名称:</span>
                                    <span class="detail-info-value">${store.storeName || ''}</span>
                                </div>
                                <div class="detail-info-item">
                                    <span class="detail-info-label">开店年份:</span>
                                    <span class="detail-info-value">${store.storeStartYear || ''}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            console.log('渲染附件区域...');
            // 4. 附件区域
            if (files && files.length > 0) {
                const otherFiles = files.filter(file => {
                    const fileType = window.fileTypeUtils.getFileType(file.name);
                    return !window.fileTypeUtils.isMediaFile(file.name);
                });
                
                if (otherFiles.length > 0) {
                    html += `
                        <div class="detail-section">
                            <h3 class="detail-section-title">附件</h3>
                            <div class="detail-section-card">
                                <div class="file-list-other">
                                    ${otherFiles.map(file => this.renderFileItem(file, this.app.selectedItem?.path, !isMonitoringGoods && !isMonitoringStores)).join('')}
                                </div>
                            </div>
                        </div>
                    `;
                }
            }
            
            console.log('设置HTML内容...');
            detailContent.innerHTML = html;
            
            console.log('创建图表...');
            // 如果是监控商品，创建监控数据图表
            if (isMonitoringGoods && itemData['goods_data.json']) {
                setTimeout(async () => {
                    await this.monitoringCharts.createCharts(itemData['goods_data.json']);
                }, 200);
            }
            
            console.log('添加滚动条支持...');
            // 为详情内容添加滚动条支持
            if (this.app.scrollbarManager) {
                this.app.scrollbarManager.addScrollableElement(detailContent);
            }
            
            console.log('绑定组件事件...');
            // 绑定组件事件
            this.bindComponentEvents(detailContent);
            
            
            console.log('初始化图片卡片管理器...');
            // 初始化图片卡片管理器
            this.imageCardManager.init(detailContent);
            
            console.log('详情内容渲染完成');
            
        } catch (error) {
            console.error('渲染详情内容失败:', error);
            console.error('错误堆栈:', error.stack);
            this.showDetailError('渲染详情内容失败: ' + error.message);
        }
    }


    // 绑定组件事件
    bindComponentEvents(detailContent) {
        // 绑定图片画廊事件
        const imageGalleryContainer = detailContent.querySelector('.file-preview-grid');
        if (imageGalleryContainer) {
            this.imageGallery.bindEvents(imageGalleryContainer);
        }

        // 绑定商品基本信息编辑事件
        const goodsBasicInfoContainer = detailContent.querySelector('#goodsBasicInfoContainer');
        if (goodsBasicInfoContainer) {
            this.goodsBasicInfo.bindEditEvents(goodsBasicInfoContainer);
        }

        // 绑定其他文件点击事件
        detailContent.querySelectorAll('.file-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const fileName = item.dataset.fileName;
                const filePath = this.app.selectedItem?.path + '/' + fileName;
                const fileType = window.fileTypeUtils.getFileType(fileName);
                
                if (fileType === 'json') {
                    this.app.openJsonViewer(filePath, fileName);
                } else if (fileType === 'pdf') {
                    this.app.openPdfViewer(filePath, fileName);
                } else {
                    this.app.openFile(filePath);
                }
            });
        });
    }

    // 渲染文件项
    renderFileItem(file, itemPath, showDeleteBtn = true) {
        const fileType = window.fileTypeUtils.getFileType(file.name);
        const iconClass = window.fileTypeUtils.getFileIconClass(fileType);
        const iconText = window.fileTypeUtils.getFileIconText(fileType);
        
        // 如果是图片或视频文件，直接显示预览
        if (fileType === 'image' || fileType === 'video') {
            const filePath = itemPath + '/' + file.name;
            if (fileType === 'image') {
                const deleteBtn = showDeleteBtn ? `
                    <button class="file-delete-btn" data-file-name="${file.name}" title="删除图片">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                ` : '';
                
                return `
                    <div class="file-preview-item" data-file-name="${file.name}">
                        <div class="file-preview-image">
                            <img src="file://${filePath}" alt="${file.name}" 
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                            <div class="file-preview-fallback" style="display: none;">
                                <div class="file-icon ${iconClass}">${iconText}</div>
                                <div class="file-name">${file.name}</div>
                            </div>
                            ${deleteBtn}
                        </div>
                        <div class="file-preview-info">
                            <div class="file-name">${file.name}</div>
                            <div class="file-size">${this.formatFileSize(file.size || 0)}</div>
                        </div>
                    </div>
                `;
            } else if (fileType === 'video') {
                const deleteBtn = showDeleteBtn ? `
                    <button class="file-delete-btn" data-file-name="${file.name}" title="删除视频">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                ` : '';
                
                return `
                    <div class="file-preview-item" data-file-name="${file.name}">
                        <div class="file-preview-video">
                            <video src="file://${filePath}" 
                                   onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                                   preload="metadata" muted>
                                <div class="file-preview-fallback" style="display: flex;">
                                    <div class="file-icon ${iconClass}">${iconText}</div>
                                    <div class="file-name">${file.name}</div>
                                </div>
                            </video>
                            <div class="file-preview-fallback" style="display: none;">
                                <div class="file-icon ${iconClass}">${iconText}</div>
                                <div class="file-name">${file.name}</div>
                            </div>
                            ${deleteBtn}
                        </div>
                        <div class="file-preview-info">
                            <div class="file-name">${file.name}</div>
                            <div class="file-size">${this.formatFileSize(file.size || 0)}</div>
                        </div>
                    </div>
                `;
            }
        }
        
        // 其他文件类型保持原有显示方式
        return `
            <div class="file-item" data-file-name="${file.name}">
                <div class="file-icon ${iconClass}">${iconText}</div>
                <div class="file-name">${file.name}</div>
                <div class="file-size">${this.formatFileSize(file.size || 0)}</div>
            </div>
        `;
    }


    // 获取文件类型（使用工具组件）
    getFileType(fileName) {
        return window.fileTypeUtils.getFileType(fileName);
    }

    // 获取文件图标类（使用工具组件）
    getFileIconClass(fileType) {
        return window.fileTypeUtils.getFileIconClass(fileType);
    }

    // 获取文件图标文本（使用工具组件）
    getFileIconText(fileType) {
        return window.fileTypeUtils.getFileIconText(fileType);
    }

    // 显示图片预览
    showImagePreview(imageData, fileName, goodsId = null, previewData = null) {
        // 直接使用GoodsPreviewModal进行预览
        if (this.goodsPreviewModal && previewData) {
            this.goodsPreviewModal.show(previewData);
        } else {
            console.error('商品预览组件未初始化或缺少预览数据');
        }
    }

    // 清空详情内容
    clearDetailContent() {
        // 清理组件
        this.goodsDataChart.clear();
        this.goodsBasicInfo.clear();
        this.monitoringCharts.clear();
        
        const detailContent = document.getElementById('detailContent');
        if (!detailContent) return;
        
        detailContent.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <p>请选择一个项目查看详情</p>
            </div>
        `;
    }

    // 显示详情错误
    showDetailError(message) {
        const detailContent = document.getElementById('detailContent');
        if (!detailContent) return;
        
        detailContent.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⚠️</div>
                <p>加载详情失败: ${message}</p>
            </div>
        `;
    }

    // 显示/隐藏返回按钮
    toggleBackButton(show) {
        const backBtn = document.getElementById('backToListBtn');
        if (backBtn) {
            backBtn.style.display = show ? 'block' : 'none';
        }
    }




    
    // 清除所有选中状态（委托给ImageCardManager）
    clearSelection() {
        this.imageCardManager.clearSelection();
    }
    

    // 渲染监控商品信息卡片
    renderMonitoringGoodsInfoCard(monitoringData) {
        if (!monitoringData) {
            return '';
        }

        // 格式化采集时间
        const formatCollectTime = (collectTime) => {
            if (!collectTime) return '未知时间';
            try {
                const date = new Date(collectTime);
                return date.toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (error) {
                return collectTime;
            }
        };

        // 生成产品来源信息
        const generateProductSource = (data) => {
            const collectTime = formatCollectTime(data.collectTime);
            const collectUrl = data.collectUrl;
            
            if (collectTime && collectUrl) {
                return `由 系统 于 ${collectTime} 从 <a href="${collectUrl}" target="_blank" class="collect-link" rel="noopener noreferrer">采集链接</a> 采集`;
            } else if (collectTime) {
                return `由 系统 于 ${collectTime} 采集`;
            } else {
                return '由 系统 采集';
            }
        };

        return `
            <div class="detail-section">
                <h3 class="detail-section-title">商品信息</h3>
                <div class="detail-section-card">
                    <div class="goods-basic-info">
                        <div class="basic-info-grid">
                            <!-- 基本信息 -->
                            <div class="info-item readonly">
                                <span class="info-label">商品ID:</span>
                                <span class="info-value">${monitoringData.goodsId || '未设置'}</span>
                            </div>
                            <div class="info-item readonly">
                                <span class="info-label">上架时间:</span>
                                <span class="info-value">${monitoringData.listingDate || '未设置'}</span>
                            </div>
                            <div class="info-item readonly">
                                <span class="info-label">采集时间:</span>
                                <span class="info-value">${formatCollectTime(monitoringData.collectTime)}</span>
                            </div>
                            <div class="info-item readonly">
                                <span class="info-label">商品分类1:</span>
                                <span class="info-value">${monitoringData.goodsCat1 || '未设置'}</span>
                            </div>
                            <div class="info-item readonly">
                                <span class="info-label">商品分类2:</span>
                                <span class="info-value">${monitoringData.goodsCat2 || '未设置'}</span>
                            </div>
                            <div class="info-item readonly">
                                <span class="info-label">商品分类3:</span>
                                <span class="info-value">${monitoringData.goodsCat3 || '未设置'}</span>
                            </div>
                        </div>
                        
                        <!-- SKU信息 -->
                        ${monitoringData.skuList && monitoringData.skuList.length > 0 ? `
                            <div class="info-section">
                                <h4 class="info-section-title">SKU信息 (${monitoringData.skuList.length}个规格)</h4>
                                <div class="sku-list">
                                    ${monitoringData.skuList.map(sku => `
                                        <div class="sku-item">
                                            <div class="sku-info">
                                                <div class="sku-name">${sku.skuName || '未设置'}</div>
                                                <div class="sku-price">${sku.goodsPromoPrice || '未设置'}</div>
                                            </div>
                                            <div class="sku-id">ID: ${sku.skuId || '未设置'}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        <!-- 店铺信息 -->
                        ${monitoringData.storeData ? `
                            <div class="info-section">
                                <h4 class="info-section-title">店铺信息</h4>
                                <div class="basic-info-grid">
                                    <div class="info-item readonly">
                                        <span class="info-label">店铺ID:</span>
                                        <span class="info-value">${monitoringData.storeId || '未设置'}</span>
                                    </div>
                                    <div class="info-item readonly">
                                        <span class="info-label">店铺名称:</span>
                                        <span class="info-value">${monitoringData.storeData.storeName || '未设置'}</span>
                                    </div>
                                    <div class="info-item readonly">
                                        <span class="info-label">店铺评分:</span>
                                        <span class="info-value">${monitoringData.storeData.storeRating || '未设置'}</span>
                                    </div>
                                    <div class="info-item readonly">
                                        <span class="info-label">店铺销量:</span>
                                        <span class="info-value">${monitoringData.storeData.storeSold || '未设置'}</span>
                                    </div>
                                    <div class="info-item readonly">
                                        <span class="info-label">店铺关注者:</span>
                                        <span class="info-value">${monitoringData.storeData.storeFollowers || '未设置'}</span>
                                    </div>
                                    <div class="info-item readonly">
                                        <span class="info-label">店铺商品数:</span>
                                        <span class="info-value">${monitoringData.storeData.storeltemsNum || '未设置'}</span>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                        
                        <!-- 产品来源 -->
                        <div class="info-section">
                            <h4 class="info-section-title">产品来源</h4>
                            <div class="product-source">
                                ${generateProductSource(monitoringData)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 工具方法：格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 MB';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 显示图片预览
    showImagePreview(imageData, fileName, goodsId = null, previewData = null) {
        if (this.app && this.app.showImagePreview) {
            this.app.showImagePreview(imageData, fileName, goodsId, previewData);
        } else {
            console.error('无法显示图片预览：app或showImagePreview方法不可用');
        }
    }
}

// 滚动条管理类
class ScrollbarManager {
    constructor() {
        this.hideTimeout = null;
        this.init();
    }

    init() {
        this.bindScrollEvents();
    }

    bindScrollEvents() {
        // 监听所有可滚动元素的滚动事件
        const scrollableElements = document.querySelectorAll('.menu-list, .file-preview-grid, .detail-section');
        
        scrollableElements.forEach(element => {
            // 确保默认状态下滚动条隐藏
            element.classList.remove('scrollbar-visible');
            
            element.addEventListener('scroll', () => {
                this.showScrollbar(element);
            });
        });

        // 监听鼠标进入/离开事件
        scrollableElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                // 鼠标进入时不自动显示滚动条，只有滚动时才显示
            });
            
            element.addEventListener('mouseleave', () => {
                this.hideScrollbar(element);
            });
        });
    }

    showScrollbar(element) {
        // 清除之前的隐藏定时器
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
        }

        // 显示滚动条
        element.classList.add('scrollbar-visible');

        // 设置3秒后隐藏
        this.hideTimeout = setTimeout(() => {
            this.hideScrollbar(element);
        }, 3000);
    }

    hideScrollbar(element) {
        element.classList.remove('scrollbar-visible');
    }

    // 为新的滚动元素添加事件监听
    addScrollableElement(element) {
        element.addEventListener('scroll', () => {
            this.showScrollbar(element);
        });

        element.addEventListener('mouseenter', () => {
            this.showScrollbar(element);
        });
        
        element.addEventListener('mouseleave', () => {
            this.hideScrollbar(element);
        });
    }
}

// 应用主脚本
class HanliApp {
    constructor() {
        this.dataPath = null;
        this.projectFolderName = null;
        this.productLibraryCount = 0;
        this.monitoringGoodsCount = 0;
        this.monitoringStoresCount = 0;
        this.currentType = 'goods'; // 当前选中的数据类型
        this.currentItems = []; // 当前列表项
        this.selectedItem = null; // 当前选中的项目
        this.itemData = {}; // 项目数据缓存
        this.logs = []; // 日志数组
        this.isSidebarCollapsed = false; // 侧边栏是否收起
        this.recentFolders = []; // 最近选择的文件夹列表
        this.currentTheme = 'system'; // 当前主题，默认跟随系统
        
        // 绑定事件处理函数，确保可以正确移除事件监听器
        this.boundHandleFolderOutsideClick = this.handleFolderOutsideClick.bind(this);
        
        // 初始化组件
        this.topBar = new TopBar(this);
        this.menuListColumn = new MenuListColumn(this);
        this.detailColumn = new DetailColumn(this);
        this.sidebarResizer = new SidebarResizer(this);
        this.scrollbarManager = new ScrollbarManager();
        this.debugPopupModal = new DebugPopupModal(this);
        this.settingsModal = new SettingsModal(this);
        this.goodsPreviewModal = new GoodsPreviewModal(this);
        this.logModal = new LogModal(this);
        this.requirementsModal = new RequirementsModal(this);
        
        this.init();
    }

    // 等待主题管理器初始化完成
    async waitForThemeManager() {
        return new Promise((resolve) => {
            if (window.themeManager) {
                resolve();
            } else {
                const checkThemeManager = () => {
                    if (window.themeManager) {
                        resolve();
                    } else {
                        setTimeout(checkThemeManager, 10);
                    }
                };
                checkThemeManager();
            }
        });
    }

    async init() {
        try {
            // 等待主题管理器初始化完成
            await this.waitForThemeManager();
            
            // 初始化主题
            this.initTheme();
            
            // 获取应用信息
            await this.loadAppInfo();
            
            // 绑定事件
            this.bindEvents();
            
            // 初始化商品数据导入功能
            this.initGoodsImport();
            
            // 初始化侧边栏切换按钮
            this.topBar.updateToggleButtonIcon(false);
            
            // 直接加载项目文件夹下的data文件夹
            await this.loadProjectData();
            
            // 添加初始化日志
            this.addLog('info', '应用初始化完成');
            
            // 更新状态
            this.updateStatus('应用已启动');
            
        } catch (error) {
            console.error('应用初始化失败:', error);
            this.updateStatus('应用初始化失败: ' + error.message);
        }
    }

    async loadAppInfo() {
        try {
            // 获取应用版本
            const version = await window.electronAPI.getAppVersion();
            document.querySelector('.version-info').textContent = `v${version}`;
            
            // 获取数据路径
            this.dataPath = await window.electronAPI.getDataPath();
            document.getElementById('dataPath').textContent = this.dataPath;
            
            // 更新平台信息
            const platform = window.electronAPI.platform;
            const platformNames = {
                'darwin': 'macOS',
                'win32': 'Windows',
                'linux': 'Linux'
            };
            document.getElementById('platformInfo').textContent = platformNames[platform] || platform;
            
        } catch (error) {
            console.error('加载应用信息失败:', error);
        }
    }

    bindEvents() {
        // 文件夹选择功能已移除，直接加载项目数据

        // 调试工具相关事件
        document.getElementById('resetFolderBtn').addEventListener('click', () => {
            this.resetFolder();
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // 设置弹窗相关事件
        this.bindSettingsEvents();
    }

    // 绑定设置弹窗事件
    bindSettingsEvents() {
        // 关闭设置弹窗
        document.getElementById('settingsCloseBtn').addEventListener('click', () => {
            this.closeSettings();
        });

        // 设置导航切换
        document.querySelectorAll('.settings-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.switchSettingsSection(section);
            });
        });

        // 主题选择
        document.getElementById('themeSelect').addEventListener('change', (e) => {
            this.setTheme(e.target.value);
            // 更新状态显示
            this.updateStatus(`主题已切换到: ${e.target.value}`);
        });

        // 窗口透明度调整
        const opacityRange = document.getElementById('windowOpacity');
        const opacityValue = document.querySelector('.settings-range-value');
        if (opacityRange && opacityValue) {
            opacityRange.addEventListener('input', (e) => {
                const value = Math.round(e.target.value * 100);
                opacityValue.textContent = value + '%';
                // 这里可以添加透明度调整逻辑
            });
        }

        // 数据管理按钮
        document.getElementById('changeDataPathBtn').addEventListener('click', () => {
            this.selectFolder();
            this.closeSettings();
        });

        document.getElementById('clearCacheBtn').addEventListener('click', () => {
            this.clearCache();
        });

        document.getElementById('exportSettingsBtn').addEventListener('click', () => {
            this.exportSettings();
        });

        // 点击弹窗外部关闭
        document.getElementById('settingsModal').addEventListener('click', (e) => {
            if (e.target.id === 'settingsModal') {
                this.closeSettings();
            }
        });
    }

    // 清除缓存
    clearCache() {
        try {
            localStorage.clear();
            this.updateStatus('缓存已清除');
            // 重新加载数据
            if (this.dataPath) {
                this.loadData();
            }
        } catch (error) {
            console.error('清除缓存失败:', error);
            this.updateStatus('清除缓存失败');
        }
    }

    // 导出设置
    exportSettings() {
        try {
            const settings = {
                theme: this.currentTheme,
                dataPath: this.dataPath,
                projectFolderName: this.projectFolderName,
                recentFolders: this.recentFolders,
                exportDate: new Date().toISOString()
            };
            
            const dataStr = JSON.stringify(settings, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `hanli-settings-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            this.updateStatus('设置已导出');
        } catch (error) {
            console.error('导出设置失败:', error);
            this.updateStatus('导出设置失败');
        }
    }

    // 加载项目数据
    async loadProjectData() {
        try {
            // 使用Electron API获取数据路径
            const dataPath = await window.electronAPI.getDataPath();
            console.log('数据路径:', dataPath);
            this.addLog('info', '开始加载项目数据', { dataPath });
            
            // 检查data文件夹是否存在
            const result = await window.electronAPI.listDirectories(dataPath);
            if (!result.success) {
                throw new Error(`项目文件夹下未找到data文件夹: ${dataPath}`);
            }
            
            // 设置数据路径
            this.dataPath = dataPath;
            this.projectFolderName = '项目数据';
            
            // 加载数据
            await this.loadData();
            
            // 直接显示主应用界面
            this.showMainApp();
            
            this.updateStatus('项目数据加载完成');
            this.addLog('info', '项目数据加载完成');
            
        } catch (error) {
            console.error('加载项目数据失败:', error);
            this.addLog('error', '加载项目数据失败', { error: error.message });
            this.updateStatus('加载项目数据失败: ' + error.message);
            // 如果加载失败，显示错误信息
            this.showDataLoadError(error.message);
        }
    }


    // 显示数据加载错误
    showDataLoadError(errorMessage) {
        const folderSelectionPage = document.getElementById('folderSelectionPage');
        const mainAppPage = document.getElementById('mainAppPage');
        
        if (folderSelectionPage) {
            folderSelectionPage.style.display = 'flex';
        }
        if (mainAppPage) {
            mainAppPage.style.display = 'none';
        }
        
        // 更新错误信息显示
        const titleElement = document.getElementById('folderSelectionTitle');
        const descElement = document.getElementById('folderSelectionDescription');
        
        if (titleElement) {
            titleElement.textContent = '数据加载失败';
        }
        if (descElement) {
            descElement.textContent = `错误: ${errorMessage}`;
        }
    }

    async loadData() {
        try {
            this.updateStatus('正在加载数据...');
            
            // 确保dataPath已设置
            if (!this.dataPath) {
                console.error('dataPath未设置，无法加载数据');
                this.updateStatus('数据路径未设置');
                return;
            }
            
            // 加载产品库数据
            await this.loadProductLibraryData();
            
            // 加载监控数据
            await this.loadMonitoringData();
            
            this.updateStatus('数据加载完成');
            
        } catch (error) {
            console.error('加载数据失败:', error);
            this.updateStatus('加载数据失败: ' + error.message);
        }
    }

    async loadProductLibraryData() {
        try {
            // 产品库商品数据存储在 goods-library/goods 下
            const fullPath = `${this.dataPath}/goods-library/goods`;
            const result = await window.electronAPI.listDirectories(fullPath);
            if (result.success) {
                const goodsItems = result.data.filter(item => item.isDirectory);
                this.productLibraryCount = goodsItems.length;
                this.menuListColumn.updateProductLibraryCount(this.productLibraryCount);
                this.menuListColumn.renderProductLibraryList(goodsItems);
            } else {
                console.warn('加载产品库数据失败:', result.error);
                this.productLibraryCount = 0;
                this.menuListColumn.updateProductLibraryCount(0);
                this.menuListColumn.renderProductLibraryList([]);
            }
        } catch (error) {
            console.error('加载产品库数据失败:', error);
            this.productLibraryCount = 0;
            this.menuListColumn.updateProductLibraryCount(0);
            this.menuListColumn.renderProductLibraryList([]);
        }
    }

    async loadMonitoringData() {
        try {
            // 合并加载监控数据（商品和店铺）
            await this.loadUnifiedMonitoringData();
        } catch (error) {
            console.error('加载监控数据失败:', error);
        }
    }

    async loadUnifiedMonitoringData() {
        try {
            // 加载监控商品数据
            const goodsPath = `${this.dataPath}/data-monitoring/goods`;
            const goodsResult = await window.electronAPI.listDirectories(goodsPath);
            
            // 加载监控店铺数据
            const storesPath = `${this.dataPath}/data-monitoring/stores`;
            const storesResult = await window.electronAPI.listDirectories(storesPath);
            
            let allMonitoringItems = [];
            
            // 合并商品数据
            if (goodsResult.success) {
                const goodsItems = goodsResult.data.filter(item => item.isDirectory);
                allMonitoringItems = allMonitoringItems.concat(goodsItems.map(item => ({
                    ...item,
                    type: 'goods'
                })));
            }
            
            // 合并店铺数据
            if (storesResult.success) {
                const storesItems = storesResult.data.filter(item => item.isDirectory);
                allMonitoringItems = allMonitoringItems.concat(storesItems.map(item => ({
                    ...item,
                    type: 'stores'
                })));
            }
            
            this.monitoringCount = allMonitoringItems.length;
            this.menuListColumn.updateMonitoringCount(this.monitoringCount);
            this.menuListColumn.renderMonitoringList(allMonitoringItems);
            
        } catch (error) {
            console.error('加载统一监控数据失败:', error);
            this.monitoringCount = 0;
            this.menuListColumn.updateMonitoringCount(0);
            this.menuListColumn.renderMonitoringList([]);
        }
    }

    async loadMonitoringGoodsData() {
        try {
            // 监控商品数据存储在 data-monitoring/goods 下
            const fullPath = `${this.dataPath}/data-monitoring/goods`;
            const result = await window.electronAPI.listDirectories(fullPath);
            if (result.success) {
                const goodsItems = result.data.filter(item => item.isDirectory);
                this.monitoringGoodsCount = goodsItems.length;
                this.menuListColumn.updateMonitoringGoodsCount(this.monitoringGoodsCount);
                this.menuListColumn.renderMonitoringGoodsList(goodsItems);
            } else {
                console.warn('加载监控商品数据失败:', result.error);
                this.monitoringGoodsCount = 0;
                this.menuListColumn.updateMonitoringGoodsCount(0);
                this.menuListColumn.renderMonitoringGoodsList([]);
            }
        } catch (error) {
            console.error('加载监控商品数据失败:', error);
            this.monitoringGoodsCount = 0;
            this.menuListColumn.updateMonitoringGoodsCount(0);
            this.menuListColumn.renderMonitoringGoodsList([]);
        }
    }

    async loadMonitoringStoresData() {
        try {
            // 监控店铺数据存储在 data-monitoring/stores 下
            const fullPath = `${this.dataPath}/data-monitoring/stores`;
            const result = await window.electronAPI.listDirectories(fullPath);
            if (result.success) {
                const storesItems = result.data.filter(item => item.isDirectory);
                this.monitoringStoresCount = storesItems.length;
                this.menuListColumn.updateMonitoringStoresCount(this.monitoringStoresCount);
                this.menuListColumn.renderMonitoringStoresList(storesItems);
            } else {
                console.warn('加载监控店铺数据失败:', result.error);
                this.monitoringStoresCount = 0;
                this.menuListColumn.updateMonitoringStoresCount(0);
                this.menuListColumn.renderMonitoringStoresList([]);
            }
        } catch (error) {
            console.error('加载监控店铺数据失败:', error);
            this.monitoringStoresCount = 0;
            this.menuListColumn.updateMonitoringStoresCount(0);
            this.menuListColumn.renderMonitoringStoresList([]);
        }
    }

    // 店铺数据加载暂时禁用
    async loadStoresData() {
        // 暂时禁用店铺数据加载

        this.menuListColumn.updateStoresCount(0);
        this.menuListColumn.renderStoresList([]);
        return;
    }

    // 选择数据项
    async selectDataItem(element) {
        // 更新选中状态
        this.menuListColumn.updateSelection(element);
        
        const itemPath = element.dataset.path;
        const itemName = element.dataset.name;
        const itemType = element.dataset.type;
        this.selectedItem = { path: itemPath, name: itemName, type: itemType };
        
        // 如果是新建产品，显示新建产品页面
        if (itemType === 'new-product') {
            this.showNewProductPage();
            this.updateStatus('新建产品');
            return;
        }
        
        // 加载详情
        await this.loadItemDetail(itemPath, itemName, itemType);
        
        // 根据类型显示不同的状态信息
        let typeLabel = '项目';
        if (itemType === 'goods') {
            typeLabel = '商品';
        } else if (itemType === 'monitoring-goods') {
            typeLabel = '监控商品';
        } else if (itemType === 'monitoring-stores') {
            typeLabel = '监控店铺';
        }
        
        this.updateStatus(`已选择${typeLabel}: ${itemName}`);
    }

    // 显示新建产品页面
    showNewProductPage() {
        const detailContent = document.getElementById('detailContent');
        if (!detailContent) return;
        
        detailContent.innerHTML = `
            <!-- 基本信息区域 -->
            <div class="detail-section">
                <h3 class="detail-section-title">基本信息</h3>
                <div class="detail-section-card">
                    <div class="new-product-form">
                        <div class="form-group">
                            <label class="form-label">产品名称</label>
                            <input type="text" class="form-input" id="productName" placeholder="请输入产品名称">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">产品描述</label>
                            <textarea class="form-textarea" id="productDescription" placeholder="请输入产品描述" rows="4"></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">产品价格 (RMB)</label>
                            <input type="number" class="form-input" id="productPrice" placeholder="0.00" step="0.01">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">产品重量 (g)</label>
                            <input type="number" class="form-input" id="productWeight" placeholder="0" step="1">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">产品尺寸 (mm)</label>
                            <div class="form-row">
                                <input type="number" class="form-input" id="productLength" placeholder="长" step="0.1">
                                <input type="number" class="form-input" id="productWidth" placeholder="宽" step="0.1">
                                <input type="number" class="form-input" id="productHeight" placeholder="高" step="0.1">
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button class="btn btn-primary" id="createProductBtn">创建产品</button>
                            <button class="btn btn-secondary" id="cancelProductBtn">取消</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 图片区域 -->
            <div class="detail-section">
                <h3 class="detail-section-title">图片</h3>
                <div class="detail-section-card">
                    <div class="file-preview-grid">
                        <div class="file-preview-item add-image-item" id="addImageBtn">
                            <div class="file-preview-image">
                                <div class="add-image-placeholder">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </div>
                            </div>
                            <div class="file-preview-info">
                                <div class="file-name">添加图片</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 附件区域 -->
            <div class="detail-section">
                <h3 class="detail-section-title">附件</h3>
                <div class="detail-section-card">
                    <div class="file-list-other">
                        <div class="file-item add-file-item" id="addFileBtn">
                            <div class="file-icon">📎</div>
                            <div class="file-name">添加附件</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 绑定新建产品页面事件
        this.bindNewProductEvents();
    }

    // 绑定新建产品页面事件
    bindNewProductEvents() {
        // 创建产品按钮
        document.getElementById('createProductBtn').addEventListener('click', () => {
            this.createProduct();
        });
        
        // 取消按钮
        document.getElementById('cancelProductBtn').addEventListener('click', () => {
            this.backToList();
        });
        
        // 添加图片按钮
        document.getElementById('addImageBtn').addEventListener('click', () => {
            this.addImage();
        });
        
        // 添加附件按钮
        document.getElementById('addFileBtn').addEventListener('click', () => {
            this.addFile();
        });
    }

    // 创建产品
    async createProduct() {
        const productName = document.getElementById('productName').value.trim();
        const productDescription = document.getElementById('productDescription').value.trim();
        const productPrice = parseFloat(document.getElementById('productPrice').value) || 0;
        const productWeight = parseInt(document.getElementById('productWeight').value) || 0;
        const productLength = parseFloat(document.getElementById('productLength').value) || 0;
        const productWidth = parseFloat(document.getElementById('productWidth').value) || 0;
        const productHeight = parseFloat(document.getElementById('productHeight').value) || 0;
        
        if (!productName) {
            this.updateStatus('请输入产品名称');
            return;
        }
        
        try {
            // 生成产品ID (12位数字)
            const productId = Math.floor(100000000000 + Math.random() * 900000000000).toString();
            
            // 创建产品基本信息
            const basicInfo = {
                "productId": productId,
                "productName": productName,
                "description": productDescription,
                "price": productPrice,
                "weight": productWeight,
                "dimensions": {
                    "length": productLength,
                    "width": productWidth,
                    "height": productHeight
                },
                "createdAt": new Date().toISOString().replace('Z', '+08:00'),
                "updatedAt": new Date().toISOString().replace('Z', '+08:00')
            };
            
            // 创建产品数据
            const productData = {
                "productId": productId,
                "salesData": [],
                "inventoryData": [],
                "createdAt": new Date().toISOString().replace('Z', '+08:00'),
                "updatedAt": new Date().toISOString().replace('Z', '+08:00')
            };
            
            // 创建产品文件夹
            const productPath = `${this.dataPath}/goods-library/goods/${productId}`;
            await window.electronAPI.createDirectory(productPath);
            
            // 保存产品信息文件
            await window.electronAPI.writeFile(`${productPath}/goods_basic.json`, JSON.stringify(basicInfo, null, 2));
            await window.electronAPI.writeFile(`${productPath}/goods_data.json`, JSON.stringify(productData, null, 2));
            
            this.updateStatus(`产品 "${productName}" 创建成功`);
            
            // 重新加载产品库列表
            await this.loadProductLibraryData();
            
            // 选择新创建的产品
            const newProductElement = document.querySelector(`[data-name="${productId}"]`);
            if (newProductElement) {
                this.selectDataItem(newProductElement);
            }
            
        } catch (error) {
            console.error('创建产品失败:', error);
            this.updateStatus('创建产品失败: ' + error.message);
        }
    }

    // 添加图片
    addImage() {
        // 创建文件输入元素
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,video/*,.webp,.bmp,.tiff,.tif,.svg,.ico,.heic,.heif,.avif,.jfif,.pjpeg,.pjp,.flv,.webm,.mkv,.m4v,.3gp,.3g2,.asf,.rm,.rmvb,.vob,.ogv,.mts,.m2ts,.ts,.divx,.xvid,.f4v,.f4p,.f4a,.f4b';
        input.multiple = true;
        
        input.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                console.log('选择的文件:', files.map(f => f.name));
                this.handleImageUpload(files);
            }
        });
        
        input.click();
    }

    // 添加附件
    addFile() {
        // 创建文件输入元素
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        
        input.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                this.handleFileUpload(files);
            }
        });
        
        input.click();
    }

    // 处理图片上传
    async handleImageUpload(files) {
        try {
            console.log('handleImageUpload 被调用，文件数量:', files.length);
            console.log('当前选中的项目:', this.selectedItem);
            
            if (!this.selectedItem) {
                console.error('没有选中的项目');
                this.updateStatus('请先选择一个商品');
                return;
            }

            this.updateStatus(`正在上传 ${files.length} 张图片...`);

            const targetPath = this.selectedItem.path;
            console.log('目标路径:', targetPath);
            
            // 检查目标路径是否存在
            if (!targetPath) {
                console.error('目标路径为空');
                this.updateStatus('目标路径无效');
                return;
            }
            
            let successCount = 0;
            let errorCount = 0;

            for (const file of files) {
                try {
                    console.log(`处理文件: ${file.name}, 大小: ${file.size} bytes`);
                    
                    // 检查文件类型
                    const fileType = window.fileTypeUtils.getFileType(file.name);
                    console.log(`文件类型: ${fileType}`);
                    
                    if (!window.fileTypeUtils.isMediaFile(file.name)) {
                        console.warn(`跳过非媒体文件: ${file.name}`);
                        continue;
                    }

                    // 读取文件内容
                    const arrayBuffer = await file.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    console.log(`文件内容读取完成，大小: ${buffer.length} bytes`);
                    
                    // 构建目标文件路径
                    const targetFilePath = `${targetPath}/${file.name}`;
                    console.log(`目标文件路径: ${targetFilePath}`);
                    
                    // 写入文件
                    console.log('开始写入文件...');
                    const result = await window.electronAPI.writeFile(targetFilePath, buffer);
                    console.log('写入结果:', result);
                    
                    if (result.success) {
                        successCount++;
                        console.log(`成功上传: ${file.name}`);
                        
                        // 验证文件是否真的存在
                        try {
                            const verifyResult = await window.electronAPI.readFile(targetFilePath);
                            if (verifyResult.success) {
                                console.log(`文件验证成功: ${file.name}, 大小: ${verifyResult.data.length} bytes`);
                            } else {
                                console.warn(`文件验证失败: ${file.name}`);
                            }
                        } catch (verifyError) {
                            console.warn(`文件验证出错: ${file.name}`, verifyError);
                        }
                    } else {
                        errorCount++;
                        console.error(`上传失败: ${file.name}`, result.error);
                    }
                } catch (error) {
                    errorCount++;
                    console.error(`处理文件失败: ${file.name}`, error);
                }
            }

            // 更新状态
            if (successCount > 0) {
                this.updateStatus(`成功上传 ${successCount} 张图片`);
                console.log('重新加载详情内容...');
                // 重新加载详情内容以显示新图片
                await this.loadItemDetail(this.selectedItem.path, this.selectedItem.name);
            }
            
            if (errorCount > 0) {
                this.updateStatus(`上传完成，${successCount} 成功，${errorCount} 失败`);
            }

        } catch (error) {
            console.error('图片上传失败:', error);
            this.updateStatus('图片上传失败: ' + error.message);
        }
    }

    // 处理文件上传
    handleFileUpload(files) {
        // 这里可以实现文件上传逻辑
        console.log('上传文件:', files);
        this.updateStatus(`已选择 ${files.length} 个文件`);
    }

    // 加载项目详情
    async loadItemDetail(itemPath, itemName, itemType) {
        try {
            console.log('开始加载详情:', { itemPath, itemName, itemType, selectedItem: this.selectedItem });
            this.updateStatus('正在加载详情...');
            
            // 验证路径
            if (!itemPath) {
                throw new Error('项目路径为空');
            }
            
            // 获取项目文件夹中的所有文件
            console.log('调用listDirectories API:', itemPath);
            const result = await window.electronAPI.listDirectories(itemPath);
            console.log('listDirectories结果:', result);
            
            if (!result.success) {
                throw new Error(`无法读取目录: ${result.error}`);
            }
            
            const files = result.data.filter(file => file.name !== '.DS_Store');
            console.log('过滤后的文件列表:', files);
            
            const itemData = {};
            
            // 加载JSON文件
            for (const file of files) {
                if (file.name.endsWith('.json')) {
                    console.log('加载JSON文件:', file.name);
                    const fileResult = await window.electronAPI.readFile(itemPath + '/' + file.name);
                    if (fileResult.success) {
                        try {
                            itemData[file.name] = JSON.parse(fileResult.data);
                            console.log(`成功解析JSON文件: ${file.name}`);
                        } catch (e) {
                            console.warn(`解析JSON文件失败: ${file.name}`, e);
                        }
                    } else {
                        console.warn(`读取JSON文件失败: ${file.name}`, fileResult.error);
                    }
                }
            }
            
            // 查找最新的goods-goodsId-time.json文件
            const latestGoodsData = this.findLatestGoodsDataFile(files, itemData);
            if (latestGoodsData) {
                itemData['goods_data.json'] = latestGoodsData;
                console.log('使用最新的商品数据文件:', latestGoodsData);
            }
            
            console.log('准备渲染详情页:', { itemName, files, itemData, type: itemType });
            
            // 渲染详情页
            await this.detailColumn.renderDetailContent(itemName, files, itemData, itemType);
            
            this.updateStatus('详情加载完成');
            
        } catch (error) {
            console.error('加载详情失败:', error);
            console.error('错误堆栈:', error.stack);
            this.detailColumn.showDetailError(error.message);
        }
    }

    // 打开文件
    async openFile(filePath) {
        try {
            const fileName = filePath.split('/').pop();
            const fileType = window.fileTypeUtils.getFileType(fileName);
            
            if (fileType === 'image') {
                await this.previewImage(filePath);
            } else {
                const result = await window.electronAPI.openFile(filePath);
                if (result.success) {
                    this.updateStatus('已打开文件: ' + fileName);
                } else {
                    throw new Error(result.error);
                }
            }
        } catch (error) {
            console.error('打开文件失败:', error);
            this.updateStatus('无法打开文件: ' + error.message);
        }
    }

    // 预览图片
    async previewImage(filePath, goodsId = null, previewData = null) {
        try {
            this.updateStatus('正在加载图片...');
            const result = await window.electronAPI.readImage(filePath);
            if (result.success) {
                this.detailColumn.showImagePreview(result.data, filePath.split('/').pop(), goodsId, previewData);
                this.updateStatus('图片预览已显示');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('预览图片失败:', error);
            this.updateStatus('无法预览图片: ' + error.message);
        }
    }

    // 预览选中的媒体文件
    async previewSelectedMedia() {
        const selectedItems = document.querySelectorAll('.file-preview-item.selected');
        
        if (selectedItems.length === 0) {
            this.updateStatus('请先选择要预览的图片或视频');
            return;
        }
        
        if (selectedItems.length > 1) {
            this.updateStatus('只能预览一个文件，请选择单个文件');
            return;
        }
        
        const selectedItem = selectedItems[0];
        const fileName = selectedItem.getAttribute('data-file-name');
        
        if (!fileName) {
            this.updateStatus('无法获取文件名');
            return;
        }
        
        // 构建文件路径
        const filePath = `${this.selectedItem.path}/${fileName}`;
        
        // 获取文件类型
        const fileType = window.fileTypeUtils.getFileType(fileName);
        
        try {
            if (fileType === 'image') {
                await this.previewImage(filePath);
            } else if (fileType === 'video') {
                // 对于视频，直接打开文件
                const result = await window.electronAPI.openFile(filePath);
                if (result.success) {
                    this.updateStatus('正在用系统程序打开视频');
                } else {
                    throw new Error(result.error);
                }
            } else {
                this.updateStatus('不支持预览此文件类型');
            }
        } catch (error) {
            console.error('预览文件失败:', error);
            this.updateStatus('预览失败: ' + error.message);
        }
    }

    // 打开JSON查看器
    async openJsonViewer(filePath, fileName) {
        try {
            this.updateStatus('正在加载JSON文件...');
            const result = await window.electronAPI.readFile(filePath);
            if (result.success) {
                this.showJsonViewer(result.data, fileName);
                this.updateStatus('JSON文件已打开');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('打开JSON文件失败:', error);
            this.updateStatus('无法打开JSON文件: ' + error.message);
        }
    }

    // 打开PDF查看器
    async openPdfViewer(filePath, fileName) {
        try {
            this.updateStatus('正在加载PDF文件...');
            const result = await window.electronAPI.readFile(filePath);
            if (result.success) {
                this.showPdfViewer(result.data, fileName);
                this.updateStatus('PDF文件已打开');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('打开PDF文件失败:', error);
            this.updateStatus('无法打开PDF文件: ' + error.message);
        }
    }

    // 显示JSON查看器弹窗
    showJsonViewer(jsonData, fileName) {
        // 移除现有的查看器
        const existingViewer = document.querySelector('.file-viewer-modal');
        if (existingViewer) {
            existingViewer.remove();
        }

        // 格式化JSON数据
        let formattedJson;
        try {
            const parsed = JSON.parse(jsonData);
            formattedJson = JSON.stringify(parsed, null, 2);
        } catch (error) {
            formattedJson = jsonData; // 如果解析失败，显示原始数据
        }

        const modal = document.createElement('div');
        modal.className = 'file-viewer-modal';
        modal.innerHTML = `
            <div class="file-viewer-overlay">
                <div class="file-viewer-container">
                    <div class="file-viewer-header">
                        <h3>${fileName}</h3>
                        <div class="file-viewer-actions">
                            <button class="btn-icon" id="copyJsonBtn" title="复制JSON">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
                                </svg>
                            </button>
                            <button class="btn-icon" id="closeViewerBtn" title="关闭">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="file-viewer-content">
                        <pre class="json-content">${formattedJson}</pre>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 绑定事件
        document.getElementById('closeViewerBtn').addEventListener('click', () => {
            modal.remove();
        });

        document.getElementById('copyJsonBtn').addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(formattedJson);
                this.updateStatus('JSON内容已复制到剪贴板');
            } catch (error) {
                console.error('复制失败:', error);
                this.updateStatus('复制失败');
            }
        });

        // 点击遮罩层关闭
        modal.querySelector('.file-viewer-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                modal.remove();
            }
        });
    }

    // 显示PDF查看器弹窗
    showPdfViewer(pdfData, fileName) {
        // 移除现有的查看器
        const existingViewer = document.querySelector('.file-viewer-modal');
        if (existingViewer) {
            existingViewer.remove();
        }

        // 将PDF数据转换为Blob URL
        const pdfBlob = new Blob([pdfData], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(pdfBlob);

        const modal = document.createElement('div');
        modal.className = 'file-viewer-modal';
        modal.innerHTML = `
            <div class="file-viewer-overlay">
                <div class="file-viewer-container pdf-container">
                    <div class="file-viewer-header">
                        <h3>${fileName}</h3>
                        <div class="file-viewer-actions">
                            <button class="btn-icon" id="openPdfExternally" title="用系统程序打开">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 13V19C18 20.1 17.1 21 16 21H5C3.9 21 3 20.1 3 19V8C3 6.9 3.9 6 5 6H11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <polyline points="15,3 21,3 21,9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                            <button class="btn-icon" id="closeViewerBtn" title="关闭">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="file-viewer-content pdf-content">
                        <iframe src="${pdfUrl}" width="100%" height="100%" frameborder="0"></iframe>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 绑定事件
        document.getElementById('closeViewerBtn').addEventListener('click', () => {
            URL.revokeObjectURL(pdfUrl); // 清理Blob URL
            modal.remove();
        });

        document.getElementById('openPdfExternally').addEventListener('click', async () => {
            try {
                const result = await window.electronAPI.openFile(this.selectedItem?.path + '/' + fileName);
                if (result.success) {
                    this.updateStatus('正在用系统程序打开PDF');
                } else {
                    throw new Error(result.error);
                }
            } catch (error) {
                console.error('打开PDF失败:', error);
                this.updateStatus('无法打开PDF文件');
            }
        });

        // 点击遮罩层关闭
        modal.querySelector('.file-viewer-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                URL.revokeObjectURL(pdfUrl); // 清理Blob URL
                modal.remove();
            }
        });
    }

    // 处理商品基本信息变更
    async handleBasicInfoChange(updatedData) {
        try {
            if (!this.selectedItem) {
                console.error('没有选中的项目');
                return;
            }

            const filePath = `${this.selectedItem.path}/goods_basic.json`;
            const jsonString = JSON.stringify(updatedData, null, 2);
            
            const result = await window.electronAPI.writeFile(filePath, jsonString);
            if (result.success) {
                this.updateStatus('商品基本信息已保存');
                console.log('商品基本信息保存成功');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('保存商品基本信息失败:', error);
            this.updateStatus('保存失败: ' + error.message);
        }
    }

    // 刷新数据
    async refreshData() {
        await this.loadData();
        this.updateStatus('数据已刷新');
    }

    // 返回列表
    backToList() {
        this.selectedItem = null;
        this.detailColumn.clearDetailContent();
        this.updateStatus('已返回列表');
    }

    // 显示文件夹选择页面（已移除，直接加载项目数据）

    // 显示主应用页面
    showMainApp() {
        document.getElementById('folderSelectionPage').style.display = 'none';
        document.getElementById('mainAppPage').style.display = 'flex';
        document.getElementById('titlebar').style.display = 'flex';
        
        // 更新项目文件夹信息
        if (this.projectFolderName) {
            this.menuListColumn.updateProjectFolderName(this.projectFolderName);
        }
        
        // 调整窗口大小到主应用模式
        window.electronAPI.resizeToMainApp();
    }

    // 选择文件夹（已移除，直接加载项目数据）


    // 切换侧边栏
    toggleSidebar() {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
        this.menuListColumn.toggleSidebar(this.isSidebarCollapsed);
        
        // 更新拖拽条可见性
        this.sidebarResizer.updateResizeHandleVisibility();
        
        this.updateStatus(this.isSidebarCollapsed ? '侧边栏已收起' : '侧边栏已展开');
    }

    // 处理搜索






    // 重置文件夹
    resetFolder() {
        try {
            // 清除本地存储
            localStorage.removeItem('selectedFolder');
            localStorage.removeItem('projectFolderName');
            
            // 重置应用状态
            this.dataPath = null;
            this.projectFolderName = null;
            this.currentItems = [];
            this.selectedItem = null;
            this.itemData = {};
            
            // 清空详情内容
            this.detailColumn.clearDetailContent();
            
            // 隐藏调试浮窗
            this.hideDebugPopup();
            
            // 切换到文件夹选择页面
            this.showFolderSelection(false);
            
            this.updateStatus('已重置文件夹，请重新选择');
            
        } catch (error) {
            console.error('重置文件夹失败:', error);
            this.updateStatus('重置失败: ' + error.message);
        }
    }

    // 处理键盘快捷键
    handleKeyboardShortcuts(e) {
        // F5: 刷新数据
        if (e.key === 'F5') {
            e.preventDefault();
            this.refreshData();
        }
        // 空格键: 预览选中的图片/视频
        else if (e.key === ' ') {
            e.preventDefault();
            this.previewSelectedMedia();
        }
        // Escape: 返回列表或清除图片选择
        else if (e.key === 'Escape') {
            e.preventDefault();
            // 如果有选中的图片，先清除选择
            const selectedImages = document.querySelectorAll('.file-preview-item.selected');
            if (selectedImages.length > 0) {
                this.detailColumn.clearSelection();
            } else {
                this.backToList();
            }
        }
        // Ctrl/Cmd + F: 聚焦搜索框
        else if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            this.topBar.focusSearch();
        }
    }

    async openDataFolder() {
        try {
            const result = await window.electronAPI.openFolder('');
            if (result.success) {
                this.updateStatus('已打开数据文件夹');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('打开数据文件夹失败:', error);
            this.updateStatus('无法打开数据文件夹: ' + error.message);
        }
    }

    updateStatus(message) {
        const statusElement = document.getElementById('statusText');
        if (statusElement) {
            statusElement.textContent = message;
        }
        console.log('状态更新:', message);
    }

    // 工具方法：格式化日期
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
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
        const noRecentFolders = document.getElementById('noRecentFolders');
        
        if (this.recentFolders.length === 0) {
            if (recentFolders) {
                recentFolders.style.display = 'none';
            }
            if (noRecentFolders) {
                noRecentFolders.style.display = 'flex';
            }
            return;
        }
        
        if (recentFolders) {
            recentFolders.style.display = 'block';
        }
        if (noRecentFolders) {
            noRecentFolders.style.display = 'none';
        }
        
        if (recentFoldersList) {
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
    }

    // 选择最近文件夹
    async selectRecentFolder(path) {
        try {
            this.updateStatus('正在加载文件夹...');
            
            // 验证文件夹是否仍然存在
            const result = await window.electronAPI.listDirectories(path);
            if (!result.success) {
                throw new Error('文件夹不存在或无法访问');
            }
            
            // 检查是否包含goods-library/goods子文件夹
            const goodsLibraryPath = `${path}/goods-library`;
            const goodsPath = `${path}/goods-library/goods`;
            const dataMonitoringPath = `${path}/data-monitoring`;
            
            const hasGoodsLibrary = await window.electronAPI.listDirectories(goodsLibraryPath).then(r => r.success).catch(() => false);
            const hasGoods = await window.electronAPI.listDirectories(goodsPath).then(r => r.success).catch(() => false);
            const hasDataMonitoring = await window.electronAPI.listDirectories(dataMonitoringPath).then(r => r.success).catch(() => false);
            
            if (!hasGoodsLibrary) {
                throw new Error('文件夹不包含goods-library子文件夹');
            }
            
            if (!hasGoods) {
                throw new Error('文件夹不包含goods-library/goods子文件夹');
            }
            
            if (!hasDataMonitoring) {
                console.warn('文件夹不包含data-monitoring子文件夹，监控功能将不可用');
            }
            
            // 设置数据路径
            this.dataPath = path;
            this.projectFolderName = path.split('/').pop() || path.split('\\').pop();
            
            // 保存到本地存储
            localStorage.setItem('selectedFolder', this.dataPath);
            localStorage.setItem('projectFolderName', this.projectFolderName);
            
            // 添加到最近列表
            this.addToRecentFolders(path, this.projectFolderName);
            
            // 切换到主应用
            this.showMainApp();
            await this.loadData();
            
            this.updateStatus('文件夹加载完成');
            
        } catch (error) {
            console.error('选择最近文件夹失败:', error);
            this.updateStatus('选择文件夹失败: ' + error.message);
        }
    }

    // 切换文件夹浮窗
    toggleFolderPopup() {
        const popup = document.getElementById('folderPopup');
        console.log('toggleFolderPopup被调用，当前显示状态:', popup.style.display);
        if (popup.style.display === 'none' || popup.style.display === '') {
            this.showFolderPopup();
        } else {
            this.hideFolderPopup();
        }
    }

    // 显示文件夹浮窗
    showFolderPopup() {
        this.menuListColumn.showFolderPopup();
        
        // 点击其他地方关闭浮窗
        setTimeout(() => {
            document.addEventListener('click', this.boundHandleFolderOutsideClick);
        }, 0);
    }

    // 隐藏文件夹浮窗
    hideFolderPopup() {
        this.menuListColumn.hideFolderPopup();
        
        // 移除点击事件监听
        document.removeEventListener('click', this.boundHandleFolderOutsideClick);
    }

    // 处理文件夹浮窗外部点击
    handleFolderOutsideClick(event) {
        const popup = document.getElementById('folderPopup');
        const button = document.getElementById('changeFolderBtn');
        
        if (!popup.contains(event.target) && !button.contains(event.target)) {
            this.hideFolderPopup();
        }
    }

    // 主题管理方法
    initTheme() {
        // 主题管理器已经在全局初始化，这里只需要同步当前主题
        this.currentTheme = window.themeManager.getCurrentTheme();
        
        // 监听主题变化事件
        document.addEventListener('themeChanged', (event) => {
            this.currentTheme = event.detail.theme;
            this.updateStatus(`主题已切换到: ${event.detail.appliedTheme}`);
        });
    }

    // 设置主题
    setTheme(theme) {
        if (window.themeManager && window.themeManager.isThemeAvailable(theme)) {
            window.themeManager.switchTheme(theme);
        }
    }

    // 应用主题（保持向后兼容）
    applyTheme(theme) {
        this.setTheme(theme);
    }

    // 获取当前主题
    getCurrentTheme() {
        return window.themeManager ? window.themeManager.getCurrentTheme() : this.currentTheme;
    }

    // 获取实际应用的主题
    getAppliedTheme() {
        return window.themeManager ? window.themeManager.getAppliedTheme() : this.currentTheme;
    }

    // 设置弹窗管理
    openSettings() {
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) {
            settingsModal.style.display = 'flex';
            this.initSettingsContent();
        }
    }

    closeSettings() {
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) {
            settingsModal.style.display = 'none';
        }
    }

    // 初始化设置内容
    initSettingsContent() {
        // 更新当前主题选择
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.value = this.getCurrentTheme();
        }

        // 更新当前数据路径
        const currentDataPath = document.getElementById('currentDataPath');
        if (currentDataPath) {
            currentDataPath.textContent = this.dataPath || '未选择';
        }

        // 更新应用版本信息
        this.updateAppInfo();
    }

    // 更新应用信息
    async updateAppInfo() {
        try {
            const version = await window.electronAPI.getAppVersion();
            const versionElement = document.getElementById('appVersion');
            if (versionElement) {
                versionElement.textContent = version;
            }
        } catch (error) {
            console.warn('获取应用版本失败:', error);
        }

        // 设置构建日期
        const buildDateElement = document.getElementById('buildDate');
        if (buildDateElement) {
            buildDateElement.textContent = new Date().toLocaleDateString('zh-CN');
        }
    }

    // 切换设置页面
    switchSettingsSection(section) {
        // 更新导航状态
        document.querySelectorAll('.settings-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // 更新内容显示
        document.querySelectorAll('.settings-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${section}-settings`).classList.add('active');
    }

    // 商品数据导入和预览功能
    initGoodsImport() {
        console.log('初始化商品数据导入功能');
        console.log('goodsPreviewModal 实例:', this.goodsPreviewModal);
        
        // 监听来自主进程的商品数据导入事件
        window.electronAPI.onImportGoodsData((goodsData) => {
            console.log('收到商品数据导入事件:', goodsData);
            this.showGoodsPreview(goodsData);
        });

        // 绑定预览弹窗事件
        this.bindGoodsPreviewEvents();
        
        // 绑定预览标签页切换事件
        this.bindPreviewTabEvents();
        
        // 测试弹窗是否可用
        setTimeout(() => {
            console.log('测试弹窗元素是否存在:', document.getElementById('goodsPreviewModal'));
            console.log('弹窗实例方法:', typeof this.goodsPreviewModal?.show);
            
            // 添加测试按钮（仅用于调试）
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                this.addTestButton();
            }
        }, 1000);
    }
    
    // 添加测试按钮（仅用于调试）
    addTestButton() {
        const testBtn = document.createElement('button');
        testBtn.textContent = '测试弹窗';
        testBtn.style.position = 'fixed';
        testBtn.style.top = '10px';
        testBtn.style.right = '10px';
        testBtn.style.zIndex = '9999';
        testBtn.style.padding = '10px';
        testBtn.style.background = '#007bff';
        testBtn.style.color = 'white';
        testBtn.style.border = 'none';
        testBtn.style.borderRadius = '4px';
        testBtn.style.cursor = 'pointer';
        
        testBtn.addEventListener('click', () => {
            console.log('测试按钮被点击');
            const testData = {
                goodsId: 'test-123',
                jsonFiles: {
                    goodsInfo: 'test-goods.json',
                    monitoring: 'test-monitoring.json',
                    mediaData: 'test-media.json'
                },
                goodsInfoData: { name: '测试商品', price: '100' },
                monitoringData: [{ timestamp: '2024-01-01', data: { price: '100' } }],
                mediaData: { media: [{ url: 'https://via.placeholder.com/150', type: 'image' }] }
            };
            this.showGoodsPreview(testData);
        });
        
        document.body.appendChild(testBtn);
    }

    // 绑定预览标签页切换事件
    bindPreviewTabEvents() {
        // 注意：Tab切换事件现在由GoodsPreviewModal组件自己处理
        // 这里不再绑定事件，避免覆盖弹窗的Tab切换逻辑
        console.log('预览标签页切换事件由GoodsPreviewModal组件处理');
    }

    // 显示所有图片（用于预览弹窗，不进行筛选和排序）
    displayAllImages(imageInfoList = []) {
        const imagesGrid = document.getElementById('imagesGrid');
        if (!imagesGrid) return;

        // 清空现有内容
        imagesGrid.innerHTML = '';

        if (!imageInfoList || imageInfoList.length === 0) {
            imagesGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="2"/>
                            <polyline points="21,15 16,10 5,21" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </div>
                    <p>暂无采集图片</p>
                </div>
            `;
            return;
        }

        // 直接显示所有图片，按原始顺序
        imageInfoList.forEach((imageInfo, index) => {
            const imageItem = document.createElement('div');
            imageItem.className = 'image-item';
            
            const sizeText = `${imageInfo.width}×${imageInfo.height}px`;
            const aspectRatio = `比例 ${imageInfo.aspectRatio}`;
            const area = imageInfo.width * imageInfo.height;
            const isLargeImage = imageInfo.width > 800 && imageInfo.height > 800;
            
            // 根据图片大小添加标识
            let statusBadge = '';
            if (isLargeImage) {
                statusBadge = '<span class="status-badge large-image">大尺寸</span>';
            } else if (imageInfo.width > 400 && imageInfo.height > 400) {
                statusBadge = '<span class="status-badge medium-image">中等尺寸</span>';
            } else {
                statusBadge = '<span class="status-badge small-image">小尺寸</span>';
            }
            
            // 添加面积信息
            const areaText = `面积: ${(area / 1000).toFixed(0)}K像素`;
            
            imageItem.innerHTML = `
                <img src="${imageInfo.url}" alt="采集图片 ${index + 1}" loading="lazy" 
                     onerror="this.parentElement.querySelector('.image-info').innerHTML='<span style=color:var(--error-color)>加载失败</span>'">
                <div class="image-info">
                    <div class="image-size">${sizeText}</div>
                    <div class="image-aspect">${aspectRatio}</div>
                    <div class="image-area">${areaText}</div>
                    <div class="image-index">图片 ${index + 1}</div>
                    ${statusBadge}
                </div>
            `;
            
            // 如果是大尺寸图片，添加特殊样式
            if (isLargeImage) {
                imageItem.classList.add('large-image-item');
            }
            
            imagesGrid.appendChild(imageItem);
        });
    }

    // 显示商品信息列表
    displayGoodsInfoList(goodsInfoData) {
        const goodsInfoList = document.getElementById('goodsInfoList');
        if (!goodsInfoList) return;

        goodsInfoList.innerHTML = '';

        if (!goodsInfoData) {
            goodsInfoList.innerHTML = '<div class="empty-state"><p>暂无商品信息</p></div>';
            return;
        }

        // 基本信息
        const basicInfoSection = document.createElement('div');
        basicInfoSection.className = 'data-list-section';
        basicInfoSection.innerHTML = '<div class="data-list-section-title">基本信息</div>';
        
        const basicFields = [
            { label: '商品ID', value: goodsInfoData.goodsId },
            { label: '商品名称(英文)', value: goodsInfoData.goodsTitleEn },
            { label: '商品名称(中文)', value: goodsInfoData.goodsTitleCn },
            { label: '商品分类1', value: goodsInfoData.goodsCat1 },
            { label: '商品分类2', value: goodsInfoData.goodsCat2 },
            { label: '商品分类3', value: goodsInfoData.goodsCat3 },
            { label: '采集时间', value: goodsInfoData.collectTime }
        ];

        basicFields.forEach(field => {
            const item = document.createElement('div');
            item.className = 'data-list-item';
            item.innerHTML = `
                <div class="data-list-label">${field.label}</div>
                <div class="data-list-value ${!field.value ? 'empty' : ''}">${field.value || '未设置'}</div>
            `;
            basicInfoSection.appendChild(item);
        });

        goodsInfoList.appendChild(basicInfoSection);

        // SKU信息
        if (goodsInfoData.skuList && goodsInfoData.skuList.length > 0) {
            const skuSection = document.createElement('div');
            skuSection.className = 'data-list-section';
            skuSection.innerHTML = '<div class="data-list-section-title">SKU信息</div>';
            
            goodsInfoData.skuList.forEach((sku, index) => {
                const skuItem = document.createElement('div');
                skuItem.className = 'data-list-item';
                skuItem.innerHTML = `
                    <div class="data-list-label">SKU ${index + 1}</div>
                    <div class="data-list-value">
                        <div><strong>SKU ID:</strong> ${sku.skuId || '未设置'}</div>
                        <div><strong>SKU名称:</strong> ${sku.skuName || '未设置'}</div>
                        <div><strong>促销价格:</strong> ${sku.goodsPromoPrice || '未设置'}</div>
                        <div><strong>正常价格:</strong> ${sku.goodsNormalPrice || '未设置'}</div>
                        ${sku.skuPic ? `<div><strong>图片:</strong> <a href="${sku.skuPic}" target="_blank">查看图片</a></div>` : ''}
                    </div>
                `;
                skuSection.appendChild(skuItem);
            });
            
            goodsInfoList.appendChild(skuSection);
        }

        // 商品属性
        if (goodsInfoData.goodsPropertyInfo && Object.keys(goodsInfoData.goodsPropertyInfo).length > 0) {
            const propertySection = document.createElement('div');
            propertySection.className = 'data-list-section';
            propertySection.innerHTML = '<div class="data-list-section-title">商品属性</div>';
            
            Object.entries(goodsInfoData.goodsPropertyInfo).forEach(([key, value]) => {
                const item = document.createElement('div');
                item.className = 'data-list-item';
                item.innerHTML = `
                    <div class="data-list-label">${key}</div>
                    <div class="data-list-value">${value || '未设置'}</div>
                `;
                propertySection.appendChild(item);
            });
            
            goodsInfoList.appendChild(propertySection);
        }
    }

    // 显示监控数据列表
    displayMonitoringDataList(monitoringData) {
        const monitoringDataList = document.getElementById('monitoringDataList');
        if (!monitoringDataList) return;

        monitoringDataList.innerHTML = '';

        if (!monitoringData) {
            monitoringDataList.innerHTML = '<div class="empty-state"><p>暂无监控数据</p></div>';
            return;
        }

        // 基本信息
        const basicInfoSection = document.createElement('div');
        basicInfoSection.className = 'data-list-section';
        basicInfoSection.innerHTML = '<div class="data-list-section-title">监控基本信息</div>';
        
        const basicFields = [
            { label: '商品ID', value: monitoringData.goodsId },
            { label: '上架日期', value: monitoringData.listingDate },
            { label: '采集时间', value: monitoringData.collectTime },
            { label: '商品销量', value: monitoringData.goodsSold },
            { label: '商品分类1', value: monitoringData.goodsCat1 },
            { label: '商品分类2', value: monitoringData.goodsCat2 },
            { label: '商品分类3', value: monitoringData.goodsCat3 }
        ];

        basicFields.forEach(field => {
            const item = document.createElement('div');
            item.className = 'data-list-item';
            item.innerHTML = `
                <div class="data-list-label">${field.label}</div>
                <div class="data-list-value ${!field.value ? 'empty' : ''}">${field.value || '未设置'}</div>
            `;
            basicInfoSection.appendChild(item);
        });

        monitoringDataList.appendChild(basicInfoSection);

        // 店铺信息
        if (monitoringData.storeId || monitoringData.storeName) {
            const storeSection = document.createElement('div');
            storeSection.className = 'data-list-section';
            storeSection.innerHTML = '<div class="data-list-section-title">店铺信息</div>';
            
            const storeFields = [
                { label: '店铺ID', value: monitoringData.storeId },
                { label: '店铺名称', value: monitoringData.storeName }
            ];

            storeFields.forEach(field => {
                const item = document.createElement('div');
                item.className = 'data-list-item';
                item.innerHTML = `
                    <div class="data-list-label">${field.label}</div>
                    <div class="data-list-value ${!field.value ? 'empty' : ''}">${field.value || '未设置'}</div>
                `;
                storeSection.appendChild(item);
            });
            
            monitoringDataList.appendChild(storeSection);
        }

        // 店铺数据
        if (monitoringData.storeData) {
            const storeDataSection = document.createElement('div');
            storeDataSection.className = 'data-list-section';
            storeDataSection.innerHTML = '<div class="data-list-section-title">店铺数据</div>';
            
            const storeDataFields = [
                { label: '店铺评分', value: monitoringData.storeData.storeRating },
                { label: '店铺销量', value: monitoringData.storeData.storeSold },
                { label: '店铺关注者', value: monitoringData.storeData.storeFollowers },
                { label: '店铺商品数', value: monitoringData.storeData.storeltemsNum },
                { label: '店铺开业年份', value: monitoringData.storeData.storeStartYear }
            ];

            storeDataFields.forEach(field => {
                const item = document.createElement('div');
                item.className = 'data-list-item';
                item.innerHTML = `
                    <div class="data-list-label">${field.label}</div>
                    <div class="data-list-value ${!field.value ? 'empty' : ''}">${field.value || '未设置'}</div>
                `;
                storeDataSection.appendChild(item);
            });
            
            monitoringDataList.appendChild(storeDataSection);
        }
    }

    // 显示媒体数据列表
    displayMediaDataList(mediaData) {
        console.log('displayMediaDataList 被调用，mediaData:', mediaData);
        const mediaDataList = document.getElementById('mediaDataList');
        if (!mediaDataList) {
            console.log('mediaDataList 元素未找到');
            return;
        }

        mediaDataList.innerHTML = '';

        if (!mediaData) {
            console.log('媒体数据为空，显示空状态');
            mediaDataList.innerHTML = '<div class="empty-state"><p>暂无媒体数据</p></div>';
            return;
        }

        // 基本信息
        const basicInfoSection = document.createElement('div');
        basicInfoSection.className = 'data-list-section';
        basicInfoSection.innerHTML = '<div class="data-list-section-title">媒体基本信息</div>';
        
        const basicFields = [
            { label: '商品ID', value: mediaData.goodsId },
            { label: '媒体数量', value: mediaData.media ? mediaData.media.length : 0 }
        ];

        basicFields.forEach(field => {
            const item = document.createElement('div');
            item.className = 'data-list-item';
            item.innerHTML = `
                <div class="data-list-label">${field.label}</div>
                <div class="data-list-value ${!field.value ? 'empty' : ''}">${field.value || '未设置'}</div>
            `;
            basicInfoSection.appendChild(item);
        });

        mediaDataList.appendChild(basicInfoSection);

        // 媒体数组信息
        if (mediaData.media && mediaData.media.length > 0) {
            const mediaArraySection = document.createElement('div');
            mediaArraySection.className = 'data-list-section';
            mediaArraySection.innerHTML = '<div class="data-list-section-title">媒体数组 (media)</div>';

            mediaData.media.forEach((mediaItem, index) => {
                const item = document.createElement('div');
                item.className = 'data-list-item media-item';
                
                const mediaType = mediaItem.width > 0 && mediaItem.height > 0 ? '图片' : '视频';
                const sizeText = mediaItem.width > 0 && mediaItem.height > 0 ? 
                    `${mediaItem.width}×${mediaItem.height}px` : '未知尺寸';
                const statusText = mediaItem.isTargetSize ? '符合要求' : '尺寸较小';
                const pathText = mediaItem.path ? '已缓存' : '未缓存';
                
                item.innerHTML = `
                    <div class="data-list-label">${mediaType} ${index + 1}</div>
                    <div class="data-list-value">
                        <div class="media-item-info">
                            <div class="media-url">${mediaItem.url}</div>
                            <div class="media-details">
                                <span class="media-size">${sizeText}</span>
                                <span class="media-status ${mediaItem.isTargetSize ? 'valid' : 'invalid'}">${statusText}</span>
                                <span class="media-cache ${mediaItem.path ? 'cached' : 'uncached'}">${pathText}</span>
                            </div>
                            ${mediaItem.path ? `<div class="media-path">${mediaItem.path}</div>` : ''}
                        </div>
                    </div>
                `;
                mediaArraySection.appendChild(item);
            });

            mediaDataList.appendChild(mediaArraySection);
        }

        // 显示完整JSON结构
        const jsonSection = document.createElement('div');
        jsonSection.className = 'data-list-section';
        jsonSection.innerHTML = '<div class="data-list-section-title">完整JSON数据</div>';
        
        const jsonItem = document.createElement('div');
        jsonItem.className = 'data-list-item json-item';
        jsonItem.innerHTML = `
            <div class="data-list-label">JSON内容</div>
            <div class="data-list-value">
                <pre class="json-content">${JSON.stringify(mediaData, null, 2)}</pre>
            </div>
        `;
        jsonSection.appendChild(jsonItem);
        mediaDataList.appendChild(jsonSection);
    }

    // 图片过滤方法
    filterImages(imageInfoList) {
        if (!imageInfoList || imageInfoList.length === 0) {
            return [];
        }

        console.log('返回所有图片，总数:', imageInfoList.length);
        
        // 不过滤，返回所有图片
        return imageInfoList;
    }

    // 过滤视频
    filterVideos(videoInfoList) {
        if (!videoInfoList || videoInfoList.length === 0) {
            return [];
        }

        console.log('返回所有视频，总数:', videoInfoList.length);
        
        // 不过滤，返回所有视频
        return videoInfoList;
    }

    // 显示筛选的图片
    displayFilteredImages(images, imageInfoList = []) {
        const imagesGrid = document.getElementById('imagesGrid');
        if (!imagesGrid) return;

        // 清空现有内容
        imagesGrid.innerHTML = '';

        if (!images || images.length === 0) {
            imagesGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="2"/>
                            <polyline points="21,15 16,10 5,21" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </div>
                    <p>暂无符合要求的图片（需要宽高都≥800px）</p>
                </div>
            `;
            return;
        }

        // 按图片大小排序（面积从大到小）
        const sortedImageInfoList = [...images].sort((a, b) => {
            const areaA = a.width * a.height;
            const areaB = b.width * b.height;
            return areaB - areaA;
        });

        // 初始化选中状态（所有筛选出来的图片默认选中）
        this.selectedImages = new Set(sortedImageInfoList.map(img => img.url));

        // 显示排序后的图片
        sortedImageInfoList.forEach((imageInfo, index) => {
            const imageItem = document.createElement('div');
            imageItem.className = 'image-item selectable';
            imageItem.dataset.imageUrl = imageInfo.url;
            
            const sizeText = `${imageInfo.width}×${imageInfo.height}px`;
            const aspectRatio = `比例 ${imageInfo.aspectRatio}`;
            const area = imageInfo.width * imageInfo.height;
            
            // 添加面积信息
            const areaText = `面积: ${(area / 1000).toFixed(0)}K像素`;
            
            // 直接使用网络URL
            const imageSrc = imageInfo.url;
            
            imageItem.innerHTML = `
                <div class="image-checkbox">
                    <input type="checkbox" id="img-${index}" checked>
                    <label for="img-${index}"></label>
                </div>
                <img src="${imageSrc}" alt="采集图片 ${index + 1}" loading="lazy" 
                     onerror="this.parentElement.querySelector('.image-info').innerHTML='<span style=color:var(--error-color)>加载失败</span>'">
                <div class="image-info">
                    <div class="image-size">${sizeText}</div>
                    <div class="image-aspect">${aspectRatio}</div>
                    <div class="image-area">${areaText}</div>
                    <div class="image-index">排名 ${index + 1}</div>
                    <span class="status-badge large-image">符合要求</span>
                </div>
            `;
            
            // 添加点击事件
            imageItem.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleImageSelection(imageItem, imageInfo.url);
            });
            
            imagesGrid.appendChild(imageItem);
        });
    }

    // 切换图片选择状态
    toggleImageSelection(imageItem, imageUrl) {
        const checkbox = imageItem.querySelector('input[type="checkbox"]');
        const isSelected = checkbox.checked;
        
        if (isSelected) {
            // 取消选中
            checkbox.checked = false;
            imageItem.classList.remove('selected');
            this.selectedImages.delete(imageUrl);
        } else {
            // 选中
            checkbox.checked = true;
            imageItem.classList.add('selected');
            this.selectedImages.add(imageUrl);
        }
        
        console.log(`图片选择状态变更: ${imageUrl} - ${checkbox.checked ? '选中' : '取消选中'}`);
        console.log(`当前选中图片数量: ${this.selectedImages.size}`);
    }

    // 显示合并的媒体内容（视频在前，图片在后）
    displayMediaContent(videos, allImages, allMedia) {
        const mediaGrid = document.getElementById('mediaGrid');
        if (!mediaGrid) return;

        console.log('displayMediaContent 被调用');
        console.log('videos 参数:', videos);
        console.log('allImages 参数:', allImages);
        console.log('allMedia 参数:', allMedia);

        // 清空现有内容
        mediaGrid.innerHTML = '';

        // 如果没有媒体内容，显示空状态
        if ((!videos || videos.length === 0) && (!allImages || allImages.length === 0)) {
            console.log('没有媒体数据，显示空状态');
            mediaGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="2"/>
                            <polyline points="21,15 16,10 5,21" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </div>
                    <p>暂无采集媒体</p>
                </div>
            `;
            return;
        }

        // 初始化选中状态
        this.selectedVideos = new Set();
        this.selectedImages = new Set();

        let itemIndex = 0;

        // 1. 先显示视频（按面积排序）
        if (videos && videos.length > 0) {
            const sortedVideos = [...videos].sort((a, b) => {
                const areaA = (a.width || 0) * (a.height || 0);
                const areaB = (b.width || 0) * (b.height || 0);
                return areaB - areaA;
            });

            sortedVideos.forEach((videoInfo, index) => {
                const videoItem = document.createElement('div');
                videoItem.className = 'media-item video-item selectable';
                videoItem.dataset.videoUrl = videoInfo.url;
                
                // 直接使用原始URL
                const finalSrc = videoInfo.url;
                console.log(`视频 ${index + 1}: ${videoInfo.url}`);
                
                const sizeText = videoInfo.width && videoInfo.height ? 
                    `${videoInfo.width}×${videoInfo.height}px` : '未知尺寸';
                const aspectRatio = videoInfo.aspectRatio ? 
                    `比例 ${videoInfo.aspectRatio}` : '未知比例';
                const area = (videoInfo.width || 0) * (videoInfo.height || 0);
                const areaText = area > 0 ? `面积: ${(area / 1000).toFixed(0)}K像素` : '';
                
                videoItem.innerHTML = `
                    <div class="video-checkbox">
                        <input type="checkbox" id="video-${itemIndex}" checked>
                        <label for="video-${itemIndex}"></label>
                    </div>
                    <div class="video-container">
                        <video src="${finalSrc}" 
                               poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjZjNmNGY2Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9Ijc1IiByPSIyMCIgZmlsbD0iIzk5YTNhZiIvPgo8cG9seWdvbiBwb2ludHM9IjkwLDY1IDEwMCw3NSAxMTAsNjUiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo="
                               onloadstart="console.log('开始加载视频:', '${finalSrc}')"
                               oncanplay="console.log('视频可以播放:', '${finalSrc}')"
                               onerror="console.error('视频加载失败:', '${finalSrc}', event); this.parentElement.querySelector('.video-info').innerHTML='<span style=color:var(--error-color)>加载失败: ' + event.type + '</span>'"
                               onload="console.log('视频加载完成:', '${finalSrc}')"
                               controls preload="metadata" muted>
                            您的浏览器不支持视频播放
                        </video>
                        <div class="video-play-overlay">
                            <div class="play-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" fill="rgba(0,0,0,0.7)" stroke="white" stroke-width="2"/>
                                    <polygon points="10,8 16,12 10,16" fill="white"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div class="video-info">
                        <div class="video-size">${sizeText}</div>
                        <div class="video-aspect">${aspectRatio}</div>
                        ${areaText ? `<div class="video-area">${areaText}</div>` : ''}
                        <div class="video-index">视频 ${index + 1}</div>
                        <span class="status-badge large-video">加载中</span>
                    </div>
                `;
                
                // 添加点击事件
                videoItem.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleVideoSelection(videoInfo.url, itemIndex);
                });

                // 添加视频事件监听
                const video = videoItem.querySelector('video');
                const playOverlay = videoItem.querySelector('.video-play-overlay');
                if (video && playOverlay) {
                    video.addEventListener('play', () => { playOverlay.style.opacity = '0'; });
                    video.addEventListener('pause', () => { playOverlay.style.opacity = '1'; });
                    video.addEventListener('ended', () => { playOverlay.style.opacity = '1'; });
                    playOverlay.addEventListener('click', (e) => { e.stopPropagation(); video.play(); });
                }

                this.selectedVideos.add(videoInfo.url);
                mediaGrid.appendChild(videoItem);
                itemIndex++;
            });
        }

        // 2. 再显示图片（按面积排序）
        if (allImages && allImages.length > 0) {
            const sortedImages = [...allImages].sort((a, b) => {
                const areaA = (a.width || 0) * (a.height || 0);
                const areaB = (b.width || 0) * (b.height || 0);
                return areaB - areaA;
            });

            sortedImages.forEach((imageInfo, index) => {
                const imageItem = document.createElement('div');
                imageItem.className = 'media-item image-item selectable';
                imageItem.dataset.imageUrl = imageInfo.url;
                imageItem.dataset.index = itemIndex;

                const sizeText = imageInfo.width && imageInfo.height ? 
                    `${imageInfo.width}×${imageInfo.height}px` : '未知尺寸';
                const aspectRatio = imageInfo.aspectRatio ? 
                    `比例 ${imageInfo.aspectRatio}` : '未知比例';
                const area = (imageInfo.width || 0) * (imageInfo.height || 0);
                const areaText = area > 0 ? `面积: ${(area / 1000).toFixed(0)}K像素` : '';

                // 直接使用原始URL
                const imageSrc = imageInfo.url;
                
                console.log(`图片显示: ${imageInfo.url}`);

                imageItem.innerHTML = `
                    <div class="image-checkbox">
                        <input type="checkbox" id="image-${itemIndex}" checked>
                        <label for="image-${itemIndex}"></label>
                    </div>
                    <div class="image-container">
                        <img src="${imageSrc}" alt="采集图片 ${index + 1}" 
                             onerror="this.parentElement.querySelector('.image-info').innerHTML='<span style=color:var(--error-color)>加载失败</span>'"
                             onload="console.log('图片加载完成:', '${imageSrc}')">
                    </div>
                    <div class="image-info">
                        <div class="image-size">${sizeText}</div>
                        <div class="image-aspect">${aspectRatio}</div>
                        ${areaText ? `<div class="image-area">${areaText}</div>` : ''}
                        <div class="image-index">图片 ${index + 1}</div>
                        <span class="status-badge large-image">已采集</span>
                    </div>
                `;

                // 添加点击事件
                imageItem.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleImageSelection(imageInfo.url, itemIndex);
                });

                this.selectedImages.add(imageInfo.url);
                mediaGrid.appendChild(imageItem);
                itemIndex++;
            });
        }
    }

    // 更新图片显示（缓存完成后调用）
    updateImageDisplay(allImages) {
        const mediaGrid = document.getElementById('mediaGrid');
        if (!mediaGrid) return;

        // 检查缓存是否可用
        if (!this.cachedImages || this.cachedImages.length === 0) {
            console.log('图片缓存不可用，跳过更新');
            return;
        }

        // 图片直接使用URL，无需更新缓存路径
        console.log('图片直接使用URL，无需更新缓存路径');
    }

    // 更新视频显示
    updateVideoDisplay(videos) {
        // 视频直接使用URL，无需更新缓存路径
        console.log('视频直接使用URL，无需更新缓存路径');
    }

    // 显示所有视频（不进行过滤）
    displayAllVideos(videos) {
        const videosGrid = document.getElementById('videosGrid');
        if (!videosGrid) return;

        console.log('displayAllVideos 被调用');
        console.log('videos 参数:', videos);

        // 清空现有内容
        videosGrid.innerHTML = '';

        if (!videos || videos.length === 0) {
            console.log('没有视频数据，显示空状态');
            videosGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                            <polygon points="22,8 12,13 2,8" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </div>
                    <p>暂无采集视频</p>
                </div>
            `;
            return;
        }

        // 按视频大小排序（面积从大到小）
        const sortedVideos = [...videos].sort((a, b) => {
            const areaA = (a.width || 0) * (a.height || 0);
            const areaB = (b.width || 0) * (b.height || 0);
            return areaB - areaA;
        });

        // 初始化选中状态（所有视频默认选中）
        this.selectedVideos = new Set(sortedVideos.map(video => video.url));

        // 显示所有视频
        sortedVideos.forEach((videoInfo, index) => {
            const videoItem = document.createElement('div');
            videoItem.className = 'video-item selectable';
            videoItem.dataset.videoUrl = videoInfo.url;
            
            // 直接使用原始URL
            const finalSrc = videoInfo.url;
            console.log(`视频 ${index + 1}: ${videoInfo.url}`);
            
            const sizeText = videoInfo.width && videoInfo.height ? 
                `${videoInfo.width}×${videoInfo.height}px` : '未知尺寸';
            const aspectRatio = videoInfo.aspectRatio ? 
                `比例 ${videoInfo.aspectRatio}` : '未知比例';
            const area = (videoInfo.width || 0) * (videoInfo.height || 0);
            const areaText = area > 0 ? `面积: ${(area / 1000).toFixed(0)}K像素` : '';
            
            videoItem.innerHTML = `
                <div class="video-checkbox">
                    <input type="checkbox" id="video-${index}" checked>
                    <label for="video-${index}"></label>
                </div>
                <div class="video-container">
                    <video src="${videoInfo.url}" 
                           poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjZjNmNGY2Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9Ijc1IiByPSIyMCIgZmlsbD0iIzk5YTNhZiIvPgo8cG9seWdvbiBwb2ludHM9IjkwLDY1IDEwMCw3NSAxMTAsNjUiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo="
                           onloadstart="console.log('开始加载视频:', '${finalSrc}')"
                           oncanplay="console.log('视频可以播放:', '${finalSrc}')"
                           onerror="console.error('视频加载失败:', '${finalSrc}', event); this.parentElement.querySelector('.video-info').innerHTML='<span style=color:var(--error-color)>加载失败: ' + event.type + '</span>'"
                           onload="console.log('视频加载完成:', '${finalSrc}')"
                           controls preload="metadata" muted>
                        您的浏览器不支持视频播放
                    </video>
                    <div class="video-play-overlay">
                        <div class="play-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" fill="rgba(0,0,0,0.7)" stroke="white" stroke-width="2"/>
                                <polygon points="10,8 16,12 10,16" fill="white"/>
                            </svg>
                        </div>
                    </div>
                </div>
                <div class="video-info">
                    <div class="video-size">${sizeText}</div>
                    <div class="video-aspect">${aspectRatio}</div>
                    ${areaText ? `<div class="video-area">${areaText}</div>` : ''}
                    <div class="video-index">视频 ${index + 1}</div>
                    <span class="status-badge large-video">已采集</span>
                </div>
            `;
            
            // 添加点击事件
            videoItem.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleVideoSelection(videoItem, videoInfo.url);
            });
            
            // 添加视频播放事件处理
            const video = videoItem.querySelector('video');
            const playOverlay = videoItem.querySelector('.video-play-overlay');
            
            if (video && playOverlay) {
                // 视频开始播放时隐藏播放图标
                video.addEventListener('play', () => {
                    playOverlay.style.opacity = '0';
                });
                
                // 视频暂停时显示播放图标
                video.addEventListener('pause', () => {
                    playOverlay.style.opacity = '1';
                });
                
                // 视频结束播放时显示播放图标
                video.addEventListener('ended', () => {
                    playOverlay.style.opacity = '1';
                });
                
                // 点击播放图标时播放视频
                playOverlay.addEventListener('click', (e) => {
                    e.stopPropagation();
                    video.play();
                });
            }
            
            videosGrid.appendChild(videoItem);
        });
    }

    // 显示筛选的视频（保留原方法，但不再使用）
    displayFilteredVideos(videos, videoInfoList = []) {
        const videosGrid = document.getElementById('videosGrid');
        if (!videosGrid) return;

        console.log('displayFilteredVideos 被调用');
        console.log('videos 参数:', videos);
        console.log('videoInfoList 参数:', videoInfoList);

        // 清空现有内容
        videosGrid.innerHTML = '';

        if (!videos || videos.length === 0) {
            console.log('没有视频数据，显示空状态');
            videosGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                            <polygon points="22,8 12,13 2,8" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </div>
                    <p>暂无符合要求的视频（需要宽高都≥800px）</p>
                </div>
            `;
            return;
        }

        // 按视频大小排序（面积从大到小）
        const sortedVideoInfoList = [...videos].sort((a, b) => {
            const areaA = a.width * a.height;
            const areaB = b.width * b.height;
            return areaB - areaA;
        });

        // 初始化选中状态（所有筛选出来的视频默认选中）
        this.selectedVideos = new Set(sortedVideoInfoList.map(video => video.url));

        // 显示排序后的视频
        sortedVideoInfoList.forEach((videoInfo, index) => {
            const videoItem = document.createElement('div');
            videoItem.className = 'video-item selectable';
            videoItem.dataset.videoUrl = videoInfo.url;
            
            const sizeText = `${videoInfo.width}×${videoInfo.height}px`;
            const aspectRatio = `比例 ${videoInfo.aspectRatio}`;
            const area = videoInfo.width * videoInfo.height;
            
            // 添加面积信息
            const areaText = `面积: ${(area / 1000).toFixed(0)}K像素`;
            
            videoItem.innerHTML = `
                <div class="video-checkbox">
                    <input type="checkbox" id="video-${index}" checked>
                    <label for="video-${index}"></label>
                </div>
                <video src="${videoInfo.url}" alt="采集视频 ${index + 1}" 
                       onerror="this.parentElement.querySelector('.video-info').innerHTML='<span style=color:var(--error-color)>加载失败</span>'"
                       onloadstart="console.log('开始加载视频:', '${videoInfo.url}')"
                       oncanplay="console.log('视频可以播放:', '${videoInfo.url}')"
                       onerror="console.error('视频加载失败:', '${videoInfo.url}', event)"
                       controls preload="metadata">
                    您的浏览器不支持视频播放
                </video>
                <div class="video-info">
                    <div class="video-size">${sizeText}</div>
                    <div class="video-aspect">${aspectRatio}</div>
                    <div class="video-area">${areaText}</div>
                    <div class="video-index">排名 ${index + 1}</div>
                    <span class="status-badge large-video">符合要求</span>
                </div>
            `;
            
            // 添加点击事件
            videoItem.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleVideoSelection(videoItem, videoInfo.url);
            });
            
            videosGrid.appendChild(videoItem);
        });
    }

    // 切换视频选择状态
    toggleVideoSelection(videoItem, videoUrl) {
        const checkbox = videoItem.querySelector('input[type="checkbox"]');
        const isSelected = checkbox.checked;
        
        if (isSelected) {
            // 取消选中
            checkbox.checked = false;
            videoItem.classList.remove('selected');
            this.selectedVideos.delete(videoUrl);
        } else {
            // 选中
            checkbox.checked = true;
            videoItem.classList.add('selected');
            this.selectedVideos.add(videoUrl);
        }
        
        console.log(`视频选择状态变更: ${videoUrl} - ${checkbox.checked ? '选中' : '取消选中'}`);
        console.log(`当前选中视频数量: ${this.selectedVideos.size}`);
    }

    // 获取选中的图片信息
    getSelectedImages() {
        if (!this.selectedImages || this.selectedImages.size === 0) {
            return [];
        }
        
        // 从当前导入数据中获取图片信息
        const mediaInfo = this.currentImportData.mediaInfo || { images: [] };
        const allImages = this.filterImages(mediaInfo.images || []);
        
        // 返回选中的图片信息
        return allImages.filter(img => this.selectedImages.has(img.url));
    }

    // 获取选中的视频信息
    getSelectedVideos() {
        if (!this.selectedVideos || this.selectedVideos.size === 0) {
            return [];
        }
        
        // 从当前导入数据中获取视频信息（不进行过滤）
        const mediaInfo = this.currentImportData.mediaInfo || { videos: [] };
        const allVideos = mediaInfo.videos || [];
        
        // 返回选中的视频信息
        return allVideos.filter(video => this.selectedVideos.has(video.url));
    }

    // 缓存图片到临时文件夹（仅在保存时调用）
    async cacheImages(goodsId, images) {
        try {
            console.log('开始缓存图片:', images.length, '张');
            const result = await window.electronAPI.cacheImages(goodsId, images);
            if (result.success) {
                console.log('图片缓存成功:', result.cachedImages.length, '张');
                this.cachedImages = result.cachedImages;
                return result.cachedImages;
            } else {
                console.error('图片缓存失败:', result.error);
                return null;
            }
        } catch (error) {
            console.error('缓存图片时出错:', error);
            return null;
        }
    }

    // 缓存视频到临时文件夹（仅在保存时调用）
    async cacheVideos(goodsId, videos) {
        try {
            console.log('开始缓存视频:', videos.length, '个');
            const result = await window.electronAPI.cacheVideos(goodsId, videos);
            if (result.success) {
                console.log('视频缓存成功:', result.cachedVideos.length, '个');
                this.cachedVideos = result.cachedVideos;
                return result.cachedVideos;
            } else {
                console.error('视频缓存失败:', result.error);
                return null;
            }
        } catch (error) {
            console.error('缓存视频时出错:', error);
            return null;
        }
    }

    // 获取缓存的图片路径
    getCachedImageSrc(originalUrl) {
        if (!this.cachedImages || this.cachedImages.length === 0) {
            console.log('getCachedImageSrc: 没有缓存的图片');
            return null;
        }
        
        console.log('getCachedImageSrc: 查找缓存图片', {
            originalUrl: originalUrl,
            cachedImagesCount: this.cachedImages.length,
            cachedUrls: this.cachedImages.map(img => img.originalUrl)
        });
        
        // 尝试多种匹配方式
        let cachedImage = this.cachedImages.find(img => img.originalUrl === originalUrl);
        
        if (!cachedImage) {
            // 尝试URL解码后匹配
            try {
                const decodedUrl = decodeURIComponent(originalUrl);
                cachedImage = this.cachedImages.find(img => img.originalUrl === decodedUrl);
            } catch (e) {
                console.log('URL解码失败:', e);
            }
        }
        
        if (!cachedImage) {
            // 尝试移除查询参数后匹配
            try {
                const urlWithoutQuery = originalUrl.split('?')[0];
                cachedImage = this.cachedImages.find(img => {
                    const imgUrlWithoutQuery = img.originalUrl.split('?')[0];
                    return imgUrlWithoutQuery === urlWithoutQuery;
                });
            } catch (e) {
                console.log('URL处理失败:', e);
            }
        }
        if (cachedImage && cachedImage.tempPath) {
            console.log('getCachedImageSrc: 找到缓存图片', {
                originalUrl: originalUrl,
                tempPath: cachedImage.tempPath
            });
            // 在 Electron 中直接使用本地文件路径
            return cachedImage.tempPath;
        }
        
        console.log('getCachedImageSrc: 未找到缓存图片', {
            originalUrl: originalUrl,
            cachedImagesCount: this.cachedImages.length
        });
        return null;
    }

    // 获取缓存的视频路径
    getCachedVideoSrc(originalUrl) {
        if (!this.cachedVideos || this.cachedVideos.length === 0) {
            console.log('getCachedVideoSrc: 没有缓存的视频');
            return null;
        }
        
        // 尝试多种匹配方式
        let cachedVideo = this.cachedVideos.find(video => video.originalUrl === originalUrl);
        
        if (!cachedVideo) {
            // 尝试URL解码后匹配
            try {
                const decodedUrl = decodeURIComponent(originalUrl);
                cachedVideo = this.cachedVideos.find(video => video.originalUrl === decodedUrl);
            } catch (e) {
                console.log('URL解码失败:', e);
            }
        }
        
        if (!cachedVideo) {
            // 尝试移除查询参数后匹配
            try {
                const urlWithoutQuery = originalUrl.split('?')[0];
                cachedVideo = this.cachedVideos.find(video => {
                    const videoUrlWithoutQuery = video.originalUrl.split('?')[0];
                    return videoUrlWithoutQuery === urlWithoutQuery;
                });
            } catch (e) {
                console.log('URL处理失败:', e);
            }
        }
        if (cachedVideo && cachedVideo.tempPath) {
            console.log('getCachedVideoSrc: 找到缓存视频', {
                originalUrl: originalUrl,
                tempPath: cachedVideo.tempPath
            });
            // 在 Electron 中直接使用本地文件路径
            return cachedVideo.tempPath;
        }
        
        console.log('getCachedVideoSrc: 未找到缓存视频', {
            originalUrl: originalUrl,
            cachedVideosCount: this.cachedVideos.length
        });
        return null;
    }

    // 根据媒体数据显示内容
    displayMediaFromData(mediaArray) {
        const mediaGrid = document.getElementById('mediaGrid');
        if (!mediaGrid) {
            console.error('找不到 mediaGrid 元素');
            return;
        }

        if (!mediaArray || mediaArray.length === 0) {
            this.displayEmptyMediaState();
            return;
        }

        // 清空现有内容
        mediaGrid.innerHTML = '';

        // 分离图片和视频
        // 根据文件扩展名判断类型
        const images = mediaArray.filter(item => {
            const url = item.url || '';
            return url.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i);
        });
        const videos = mediaArray.filter(item => {
            const url = item.url || '';
            return url.match(/\.(mp4|webm|ogg|avi|mov)$/i);
        });

        // 按尺寸排序图片（从大到小）
        const sortedImages = images.sort((a, b) => (b.width * b.height) - (a.width * a.height));

        // 显示视频（在前面）
        videos.forEach((videoItem, index) => {
            this.createVideoElement(videoItem, index);
        });

        // 显示图片
        sortedImages.forEach((imageItem, index) => {
            this.createImageElement(imageItem, index);
        });

        console.log('媒体内容显示完成:', {
            images: sortedImages.length,
            videos: videos.length
        });
    }

    // 创建视频元素
    createVideoElement(videoItem, index) {
        const mediaGrid = document.getElementById('mediaGrid');
        const videoContainer = document.createElement('div');
        videoContainer.className = 'video-item selectable';
        videoContainer.dataset.videoUrl = videoItem.url;

        const src = videoItem.path || videoItem.url;
        const sizeText = videoItem.width > 0 && videoItem.height > 0 ? `${videoItem.width}×${videoItem.height}px` : '视频';
        
        videoContainer.innerHTML = `
            <div class="video-checkbox">
                <input type="checkbox" id="video-${index}" checked>
                <label for="video-${index}"></label>
            </div>
            <video src="${src}" alt="采集视频 ${index + 1}" 
                   onerror="this.parentElement.querySelector('.video-info').innerHTML='<span style=color:var(--error-color)>加载失败</span>'"
                   onloadstart="console.log('开始加载视频:', '${src}')"
                   oncanplay="console.log('视频可以播放:', '${src}')"
                   controls preload="metadata">
                您的浏览器不支持视频播放
            </video>
            <div class="video-info">
                <div class="video-size">${sizeText}</div>
                <div class="video-index">视频 ${index + 1}</div>
                <span class="status-badge large-video">符合要求</span>
            </div>
        `;

        // 添加点击事件
        videoContainer.addEventListener('click', (e) => {
            if (e.target.type !== 'checkbox' && e.target.tagName !== 'VIDEO') {
                this.toggleVideoSelection(videoItem.url);
            }
        });

        mediaGrid.appendChild(videoContainer);
    }

    // 创建图片元素
    createImageElement(imageItem, index) {
        const mediaGrid = document.getElementById('mediaGrid');
        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-item selectable';
        imageContainer.dataset.imageUrl = imageItem.url;

        const src = imageItem.url; // 直接使用URL
        const sizeText = `${imageItem.width}×${imageItem.height}px`;
        const isTargetSize = imageItem.isTargetSize;
        
        imageContainer.innerHTML = `
            <div class="image-checkbox">
                <input type="checkbox" id="image-${index}" ${isTargetSize ? 'checked' : ''}>
                <label for="image-${index}"></label>
            </div>
            <img src="${src}" alt="采集图片 ${index + 1}" 
                 onerror="this.parentElement.querySelector('.image-info').innerHTML='<span style=color:var(--error-color)>加载失败</span>'"
                 loading="lazy">
            <div class="image-info">
                <div class="image-size">${sizeText}</div>
                <div class="image-index">排名 ${index + 1}</div>
                <span class="status-badge ${isTargetSize ? 'large-image' : 'small-image'}">
                    ${isTargetSize ? '符合要求' : '尺寸较小'}
                </span>
            </div>
        `;

        // 添加点击事件
        imageContainer.addEventListener('click', (e) => {
            if (e.target.type !== 'checkbox' && e.target.tagName !== 'IMG') {
                this.toggleImageSelection(imageItem.url);
            }
        });

        mediaGrid.appendChild(imageContainer);
    }

    // 更新媒体显示
    updateMediaDisplay(mediaArray) {
        if (!mediaArray || mediaArray.length === 0) return;

        const mediaGrid = document.getElementById('mediaGrid');
        if (!mediaGrid) return;

        // 清空现有内容
        mediaGrid.innerHTML = '';

        // 分离视频和图片
        const videos = mediaArray.filter(item => item.type && item.type.startsWith('video/'));
        const images = mediaArray.filter(item => !item.type || item.type.startsWith('image/'));

        console.log(`更新媒体显示: ${videos.length} 个视频, ${images.length} 张图片`);

        // 显示视频
        videos.forEach((video, index) => {
            this.createVideoElement(video, index);
        });

        // 显示图片
        images.forEach((image, index) => {
            this.createImageElement(image, index);
        });
    }

    // 显示空状态
    displayEmptyMediaState() {
        const mediaGrid = document.getElementById('mediaGrid');
        if (!mediaGrid) return;

        mediaGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="2"/>
                        <polyline points="21,15 16,10 5,21" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </div>
                <p>暂无媒体内容</p>
            </div>
        `;
    }

    // 缓存媒体文件
    async cacheMediaFiles(goodsId, mediaData) {
        try {
            console.log('开始缓存媒体文件:', mediaData.media.length, '个');
            const result = await window.electronAPI.cacheMediaFiles(goodsId, mediaData);
            if (result.success) {
                console.log('媒体文件缓存成功:', result.mediaData.media.length, '个');
                return result;
            } else {
                console.error('媒体文件缓存失败:', result.error);
                return null;
            }
        } catch (error) {
            console.error('缓存媒体文件时出错:', error);
            return null;
        }
    }

    // 缓存媒体文件到临时文件夹
    async cacheMediaFilesToTemp(goodsId, mediaData) {
        try {
            console.log('开始缓存媒体文件到临时文件夹:', mediaData.media.length, '个');
            const result = await window.electronAPI.cacheMediaFilesToTemp(goodsId, mediaData);
            if (result.success) {
                console.log('媒体文件缓存到临时文件夹成功:', result.mediaData.media.length, '个');
                return result;
            } else {
                console.error('媒体文件缓存到临时文件夹失败:', result.error);
                return null;
            }
        } catch (error) {
            console.error('缓存媒体文件到临时文件夹时出错:', error);
            return null;
        }
    }

    // 更新确认按钮文本
    updateConfirmButtonText() {
        const confirmBtn = document.getElementById('previewConfirmBtn');
        if (confirmBtn) {
            confirmBtn.textContent = '保存到目标文件夹';
            confirmBtn.classList.remove('saved');
        }
    }

    // 刷新媒体内容显示（用于Tab切换时）
    refreshMediaContent() {
        const mediaGrid = document.getElementById('mediaGrid');
        if (!mediaGrid) return;

        // 检查是否有媒体内容
        const imageItems = mediaGrid.querySelectorAll('.image-item');
        const videoItems = mediaGrid.querySelectorAll('.video-item');
        
        console.log('刷新媒体内容:', {
            imageItemsCount: imageItems.length,
            videoItemsCount: videoItems.length,
            currentMediaData: this.currentMediaData ? this.currentMediaData.media.length : 0
        });

        // 如果媒体内容为空，但媒体数据存在，重新显示
        if ((imageItems.length === 0 && videoItems.length === 0) && 
            this.currentMediaData && this.currentMediaData.media.length > 0) {
            console.log('媒体内容为空但媒体数据存在，重新显示');
            this.displayMediaFromData(this.currentMediaData.media);
        }
    }


    // 显示商品数据预览弹窗
    async showGoodsPreview(data) {
        console.log('showGoodsPreview 被调用，数据:', data);
        console.log('goodsPreviewModal 实例:', this.goodsPreviewModal);
        
        const modal = document.getElementById('goodsPreviewModal');
        console.log('通过getElementById找到的modal:', modal);
        
        if (!modal) {
            console.error('找不到 goodsPreviewModal 元素');
            console.log('当前页面所有元素:', document.querySelectorAll('[id*="goods"]'));
            return;
        }

        const { goodsId, jsonFiles } = data;
        console.log('商品ID:', goodsId);
        console.log('JSON文件:', jsonFiles);

        try {
            // 读取JSON文件
            console.log('开始读取JSON文件...');
            
            const [goodsInfoResult, monitoringResult, mediaDataResult] = await Promise.all([
                window.electronAPI.readJsonFile(jsonFiles.goodsInfo, goodsId),
                window.electronAPI.readJsonFile(jsonFiles.monitoring, goodsId),
                window.electronAPI.readJsonFile(jsonFiles.mediaData, goodsId)
            ]);

            if (!goodsInfoResult.success) {
                throw new Error(`读取商品信息JSON失败: ${goodsInfoResult.error}`);
            }
            if (!monitoringResult.success) {
                throw new Error(`读取监控数据JSON失败: ${monitoringResult.error}`);
            }
            if (!mediaDataResult.success) {
                throw new Error(`读取媒体数据JSON失败: ${mediaDataResult.error}`);
            }

            const goodsInfoData = goodsInfoResult.data;
            const monitoringData = monitoringResult.data;
            const mediaData = mediaDataResult.data;

            console.log('JSON文件读取成功');
            console.log('商品信息数据:', goodsInfoData);
            console.log('监控数据:', monitoringData);
            console.log('媒体数据:', mediaData);

            // 显示商品信息列表
            this.displayGoodsInfoList(goodsInfoData);
            
            // 显示监控数据列表
            this.displayMonitoringDataList(monitoringData);
            
            // 显示媒体数据列表
            this.displayMediaDataList(mediaData);

            // 显示预览弹窗
            this.goodsPreviewModal.show({
                goodsInfoData: goodsInfoData,
                monitoringData: monitoringData,
                mediaData: mediaData
            });

            // 保存当前导入数据供后续使用
            this.currentImportData = {
                goodsInfoData: goodsInfoData,
                monitoringData: monitoringData,
                mediaData: mediaData
            };

            console.log('商品数据预览弹窗已显示');

        } catch (error) {
            console.error('读取JSON文件失败:', error);
            this.updateStatus(`读取数据失败: ${error.message}`);
        }
    }

    // 处理预览弹窗确认操作
    async handlePreviewConfirm(previewData, goodsId = null) {
        console.log('预览弹窗确认操作，数据:', previewData, '商品ID:', goodsId);
        
        try {
            // 获取商品ID
            const targetGoodsId = goodsId || (previewData && previewData.goodsInfoData && previewData.goodsInfoData.goodsId);
            
            if (!targetGoodsId) {
                console.error('无法获取商品ID');
                this.updateStatus('无法获取商品ID，操作失败');
                return;
            }
            
            console.log('开始处理商品数据保存和媒体文件下载:', targetGoodsId);
            
            // 下载媒体文件到产品库
            let downloadedMedia = [];
            if (previewData.mediaData && previewData.mediaData.media && previewData.mediaData.media.length > 0) {
                console.log('开始下载媒体文件到产品库...');
                const downloadResult = await this.downloadMediaToProductLibrary(targetGoodsId, previewData.mediaData.media);
                if (downloadResult && downloadResult.success) {
                    console.log('媒体文件下载成功');
                    downloadedMedia = downloadResult.mediaData;
                    this.updateStatus(`已下载 ${downloadedMedia.length} 个媒体文件到产品库`);
                } else {
                    console.error('媒体文件下载失败:', downloadResult?.error);
                    this.updateStatus(`媒体文件下载失败: ${downloadResult?.error || '未知错误'}`);
                    return;
                }
            }
            
            // 保存商品数据到目标文件夹
            const saveData = {
                goodsInfoData: previewData.goodsInfoData,
                monitoringData: previewData.monitoringData || [],
                mediaData: previewData.mediaData ? { ...previewData.mediaData, media: downloadedMedia } : null
            };
            
            const saveResult = await window.electronAPI.saveGoodsData(saveData);
            if (saveResult.success) {
                console.log('数据保存到目标文件夹成功:', saveResult);
                this.updateStatus(`数据已保存到目标文件夹: 商品信息 -> ${saveResult.paths.goodsInfo}, 监控数据 -> ${saveResult.paths.monitoring}`);
                
                // 清理临时文件
                await this.cleanupTempFiles(targetGoodsId);
                
                // 刷新数据列表
                if (typeof this.loadData === 'function') {
                    await this.loadData();
                }
                
                // 跳转到产品库的该商品详情页
                await this.navigateToProductDetail(targetGoodsId);
                
            } else {
                console.error('数据保存到目标文件夹失败:', saveResult.error);
                this.updateStatus(`数据保存失败: ${saveResult.error}`);
            }
        } catch (error) {
            console.error('处理预览确认操作时出错:', error);
            this.updateStatus(`处理失败: ${error.message}`);
        }
    }

    // 下载媒体文件到产品库
    async downloadMediaToProductLibrary(goodsId, mediaList) {
        try {
            console.log('开始下载媒体文件到产品库:', { goodsId, mediaCount: mediaList.length });
            
            // 分离图片和视频
            const images = mediaList.filter(media => {
                const mediaUrl = media.url || media.src;
                const isVideo = (media.type === 'video') || 
                               (media.type && media.type.startsWith('video/')) || 
                               (mediaUrl && mediaUrl.match(/\.(mp4|webm|ogg|avi|mov|mkv|flv|wmv|m4v|3gp)$/i));
                return !isVideo;
            });

            const videos = mediaList.filter(media => {
                const mediaUrl = media.url || media.src;
                const isVideo = (media.type === 'video') || 
                               (media.type && media.type.startsWith('video/')) || 
                               (mediaUrl && mediaUrl.match(/\.(mp4|webm|ogg|avi|mov|mkv|flv|wmv|m4v|3gp)$/i));
                return isVideo;
            });

            console.log('分离结果 - 图片:', images.length, '视频:', videos.length);

            const downloadedMedia = [];

            // 下载图片到产品库
            for (const image of images) {
                const imageUrl = image.url || image.src;
                if (imageUrl && imageUrl.startsWith('http')) {
                    try {
                        const result = await window.electronAPI.downloadImageToProductLibrary(goodsId, imageUrl, image.name || '图片');
                        if (result.success) {
                            downloadedMedia.push({
                                ...image,
                                localPath: result.localPath,
                                cached: true
                            });
                        }
                    } catch (error) {
                        console.error('下载图片失败:', imageUrl, error);
                    }
                }
            }

            // 下载视频到产品库
            for (const video of videos) {
                const videoUrl = video.url || video.src;
                if (videoUrl && videoUrl.startsWith('http')) {
                    try {
                        const result = await window.electronAPI.downloadVideoToProductLibrary(goodsId, videoUrl, video.name || '视频');
                        if (result.success) {
                            downloadedMedia.push({
                                ...video,
                                localPath: result.localPath,
                                cached: true
                            });
                        }
                    } catch (error) {
                        console.error('下载视频失败:', videoUrl, error);
                    }
                }
            }

            console.log('媒体文件下载完成，成功下载:', downloadedMedia.length);
            return {
                success: true,
                mediaData: downloadedMedia
            };

        } catch (error) {
            console.error('下载媒体文件时出错:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 跳转到产品库商品详情页
    async navigateToProductDetail(goodsId) {
        try {
            console.log('开始跳转到商品详情页:', goodsId);
            
            // 确保产品库数据已加载
            if (typeof this.loadProductLibraryData === 'function') {
                console.log('正在加载产品库数据...');
                await this.loadProductLibraryData();
                console.log('产品库数据加载完成');
            } else {
                console.error('loadProductLibraryData 方法不可用');
                return;
            }
            
            // 查找对应的商品元素
            const selector = `[data-name="${goodsId}"][data-type="goods"]`;
            console.log('查找商品元素，选择器:', selector);
            const productElement = document.querySelector(selector);
            
            if (productElement) {
                console.log('找到商品元素:', productElement);
                // 选择该商品
                if (typeof this.selectDataItem === 'function') {
                    await this.selectDataItem(productElement);
                    console.log(`已跳转到商品详情页: ${goodsId}`);
                    this.updateStatus(`已跳转到商品详情页: ${goodsId}`);
                } else {
                    console.error('selectDataItem 方法不可用');
                }
            } else {
                console.error(`未找到商品: ${goodsId}`);
                console.log('当前页面所有商品元素:', document.querySelectorAll('[data-type="goods"]'));
                this.updateStatus(`未找到商品: ${goodsId}`);
            }
        } catch (error) {
            console.error('跳转到商品详情页失败:', error);
            this.updateStatus(`跳转失败: ${error.message}`);
        }
    }

    // 将媒体文件从临时文件夹移动到目标文件夹
    async moveMediaFilesFromTemp(goodsId, mediaData) {
        try {
            console.log('开始移动媒体文件从临时文件夹到目标文件夹:', goodsId);
            const result = await window.electronAPI.moveMediaFilesFromTemp(goodsId, mediaData);
            if (result.success) {
                console.log('媒体文件移动成功:', result.mediaData.media.length, '个');
                return result;
            } else {
                console.error('媒体文件移动失败:', result.error);
                return null;
            }
        } catch (error) {
            console.error('移动媒体文件时出错:', error);
            return null;
        }
    }

    // 清理临时文件
    async cleanupTempFiles(goodsId) {
        try {
            console.log('开始清理临时文件:', goodsId);
            const result = await window.electronAPI.cleanupTempFiles(goodsId);
            if (result.success) {
                console.log('临时文件清理成功');
            } else {
                console.error('临时文件清理失败:', result.error);
            }
        } catch (error) {
            console.error('清理临时文件时出错:', error);
        }
    }

    // 绑定商品预览弹窗事件
    bindGoodsPreviewEvents() {
        const modal = document.getElementById('goodsPreviewModal');
        if (!modal) return;

        // 关闭按钮
        const closeBtn = document.getElementById('goodsPreviewCloseBtn');
        const cancelBtn = document.getElementById('previewCancelBtn');
        const confirmBtn = document.getElementById('previewConfirmBtn');

        const closeModal = () => {
            modal.style.display = 'none';
            this.currentImportData = null;
        };

        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeModal);
        }

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.saveGoodsData();
            });
        }

        // 点击背景关闭弹窗
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // 保存商品数据（数据已保存，只关闭弹窗）
    async saveGoodsData() {
        if (!this.currentImportData) {
            this.updateStatus('没有可保存的商品数据');
            return;
        }

        // 数据已在采集时自动保存，直接关闭弹窗
        this.updateStatus('数据已保存');
        
        // 关闭预览弹窗
        const modal = document.getElementById('goodsPreviewModal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // 清空当前数据
        this.currentImportData = null;
        this.currentMediaData = null;
        
        // 刷新数据列表
        this.loadData();
    }

    // 查找最新的goods-goodsId-time.json文件
    findLatestGoodsDataFile(files, itemData) {
        // 查找所有符合 goods-*-*.json 格式的文件
        const goodsDataFiles = files.filter(file => {
            const name = file.name;
            return name.startsWith('goods-') && 
                   name.includes('-') && 
                   name.endsWith('.json') &&
                   name !== 'goods_data.json';
        });
        
        if (goodsDataFiles.length === 0) {
            console.log('未找到goods-*-*.json格式的文件');
            return null;
        }
        
        // 按文件名中的时间戳排序，获取最新的文件
        goodsDataFiles.sort((a, b) => {
            // 解析文件名中的时间戳：goods-goodsId-2024-09-07-00-00-00.json
            const getTimestampFromFileName = (fileName) => {
                const parts = fileName.replace('.json', '').split('-');
                if (parts.length >= 8) {
                    // 新格式：goods-goodsId-2024-09-07-00-00-00
                    const year = parts[2];
                    const month = parts[3];
                    const day = parts[4];
                    const hour = parts[5];
                    const minute = parts[6];
                    const second = parts[7];
                    const isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
                    return new Date(isoString).getTime();
                } else if (parts.length >= 3) {
                    // 旧格式：goods-goodsId-timestamp（数字时间戳）
                    const timestamp = parts[parts.length - 1];
                    return parseInt(timestamp) || 0;
                }
                return 0;
            };
            
            const timestampA = getTimestampFromFileName(a.name);
            const timestampB = getTimestampFromFileName(b.name);
            
            return timestampB - timestampA; // 降序排列，最新的在前
        });
        
        const latestFile = goodsDataFiles[0];
        const timestamp = latestFile.name.replace('.json', '').split('-').slice(2).join('-');
        console.log('找到最新的商品数据文件:', latestFile.name, '时间戳:', timestamp);
        
        // 返回对应的数据
        return itemData[latestFile.name] || null;
    }

    // 添加日志
    addLog(level, message, data = null) {
        const timestamp = new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        const logEntry = {
            timestamp,
            level,
            message,
            data: data ? JSON.stringify(data, null, 2) : null
        };
        
        this.logs.push(logEntry);
        
        // 限制日志数量，最多保留1000条
        if (this.logs.length > 1000) {
            this.logs = this.logs.slice(-1000);
        }
        
        // 如果日志弹窗是打开的，实时更新显示
        const logModal = document.getElementById('logModal');
        if (logModal && logModal.style.display !== 'none') {
            this.updateLogDisplay();
        }
    }

    // 显示日志弹窗
    showLogModal() {
        const logModal = document.getElementById('logModal');
        if (!logModal) {
            console.error('未找到日志弹窗元素');
            return;
        }
        
        logModal.style.display = 'flex';
        this.updateLogDisplay();
        this.bindLogEvents();
    }

    // 更新日志显示
    updateLogDisplay() {
        const logContent = document.getElementById('logContent');
        if (!logContent) return;
        
        if (this.logs.length === 0) {
            logContent.innerHTML = `
                <div class="log-empty">
                    <div class="empty-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <p>暂无日志记录</p>
                </div>
            `;
            return;
        }
        
        const logEntries = this.logs.map(log => `
            <div class="log-entry">
                <span class="log-timestamp">${log.timestamp}</span>
                <span class="log-level ${log.level}">${log.level}</span>
                <span class="log-message">${log.message}</span>
                ${log.data ? `<pre style="margin-top: 4px; font-size: 11px; color: var(--text-muted); background: var(--bg-secondary); padding: 8px; border-radius: 4px; overflow-x: auto;">${log.data}</pre>` : ''}
            </div>
        `).join('');
        
        logContent.innerHTML = logEntries;
        
        // 滚动到底部
        logContent.scrollTop = logContent.scrollHeight;
    }

    // 绑定日志弹窗事件
    bindLogEvents() {
        // 关闭日志弹窗
        const logCloseBtn = document.getElementById('logCloseBtn');
        if (logCloseBtn) {
            logCloseBtn.onclick = () => {
                const logModal = document.getElementById('logModal');
                if (logModal) {
                    logModal.style.display = 'none';
                }
            };
        }
        
        // 清空日志
        const clearLogBtn = document.getElementById('clearLogBtn');
        if (clearLogBtn) {
            clearLogBtn.onclick = () => {
                this.logs = [];
                this.updateLogDisplay();
            };
        }
        
        // 导出日志
        const exportLogBtn = document.getElementById('exportLogBtn');
        if (exportLogBtn) {
            exportLogBtn.onclick = () => {
                this.exportLogs();
            };
        }
        
        // 点击弹窗背景关闭
        const logModal = document.getElementById('logModal');
        if (logModal) {
            logModal.onclick = (e) => {
                if (e.target === logModal) {
                    logModal.style.display = 'none';
                }
            };
        }
    }

    // 导出日志
    exportLogs() {
        if (this.logs.length === 0) {
            alert('暂无日志可导出');
            return;
        }
        
        const logText = this.logs.map(log => {
            let text = `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`;
            if (log.data) {
                text += `\n${log.data}`;
            }
            return text;
        }).join('\n\n');
        
        const blob = new Blob([logText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hanli-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }







}

// 当DOM加载完成后启动应用
document.addEventListener('DOMContentLoaded', () => {
    window.hanliApp = new HanliApp();
});

// 全局错误处理
window.addEventListener('error', (event) => {
    console.error('全局错误:', event.error);
    if (window.hanliApp) {
        window.hanliApp.updateStatus('发生错误: ' + event.error.message);
    }
});

// 未处理的Promise拒绝
window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise拒绝:', event.reason);
    if (window.hanliApp) {
        window.hanliApp.updateStatus('发生错误: ' + event.reason);
    }
});