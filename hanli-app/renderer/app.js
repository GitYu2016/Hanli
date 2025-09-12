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
            
            
            console.log('更新框选状态...');
            // 更新框选状态
            this.updateSelectionState();
            
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
    showImagePreview(imageData, fileName) {
        const detailContent = document.getElementById('detailContent');
        if (!detailContent) return;
        
        const existingPreview = detailContent.querySelector('.image-preview-modal');
        
        if (existingPreview) {
            existingPreview.remove();
        }
        
        const modal = document.createElement('div');
        modal.className = 'image-preview-modal';
        modal.innerHTML = `
            <div class="image-preview-overlay">
                <div class="image-preview-container">
                    <div class="image-preview-header">
                        <h4>${fileName}</h4>
                        <button class="btn-icon" id="closeImagePreview">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>
                    <div class="image-preview-content">
                        <img src="${imageData}" alt="${fileName}" />
                    </div>
                </div>
            </div>
        `;
        
        detailContent.appendChild(modal);
        
        // 绑定关闭事件
        modal.querySelector('#closeImagePreview').addEventListener('click', () => {
            modal.remove();
        });
        
        // 点击遮罩层关闭
        modal.querySelector('.image-preview-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                modal.remove();
            }
        });
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

    // 处理图片框选
    handleImageSelection(e, item) {
        e.preventDefault();
        e.stopPropagation();
        
        const isCtrlSelect = e.ctrlKey || e.metaKey;
        const isShiftSelect = e.shiftKey;
        
        if (isShiftSelect) {
            // Shift 键范围选择
            this.handleRangeSelection(item);
        } else if (isCtrlSelect) {
            // Ctrl/Cmd 键多选：切换当前项选中状态
            item.classList.toggle('selected');
        } else {
            // 单选模式：清除所有选中状态，选中当前项
            document.querySelectorAll('.file-preview-item.selected').forEach(selectedItem => {
                selectedItem.classList.remove('selected');
            });
            item.classList.add('selected');
        }
        
        // 更新框选状态
        this.updateSelectionState();
    }


    // 绑定添加图片事件
    bindAddImageEvents(addImageBtn) {
        // 点击添加图片
        addImageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.app.addImage();
        });

        // 拖拽文件到添加按钮
        addImageBtn.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            addImageBtn.classList.add('drag-over');
        });

        addImageBtn.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            addImageBtn.classList.remove('drag-over');
        });

        addImageBtn.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            addImageBtn.classList.remove('drag-over');
            
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                this.app.handleImageUpload(files);
            }
        });
    }

    // 处理删除文件
    async handleDeleteFile(fileName) {
        if (!this.app.selectedItem) {
            console.error('没有选中的项目');
            return;
        }

        // 显示确认对话框
        const confirmed = confirm(`确定要删除文件 "${fileName}" 吗？\n\n此操作不可撤销。`);
        if (!confirmed) {
            return;
        }

        try {
            const filePath = `${this.app.selectedItem.path}/${fileName}`;
            const result = await window.electronAPI.deleteFile(filePath);
            
            if (result.success) {
                this.app.updateStatus(`文件 "${fileName}" 已删除`);
                // 重新加载详情内容
                await this.app.loadItemDetail(this.app.selectedItem.path, this.app.selectedItem.name);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('删除文件失败:', error);
            this.app.updateStatus('删除文件失败: ' + error.message);
        }
    }
    
    // 处理范围选择（Shift 键）
    handleRangeSelection(targetItem) {
        const allItems = Array.from(document.querySelectorAll('.file-preview-item'));
        const selectedItems = document.querySelectorAll('.file-preview-item.selected');
        
        if (selectedItems.length === 0) {
            // 如果没有已选中的项，只选中当前项
            targetItem.classList.add('selected');
            return;
        }
        
        // 找到最后选中的项作为起始点
        const lastSelected = Array.from(selectedItems).pop();
        const startIndex = allItems.indexOf(lastSelected);
        const endIndex = allItems.indexOf(targetItem);
        
        if (startIndex === -1 || endIndex === -1) return;
        
        // 选择范围内的所有项
        const start = Math.min(startIndex, endIndex);
        const end = Math.max(startIndex, endIndex);
        
        for (let i = start; i <= end; i++) {
            allItems[i].classList.add('selected');
        }
    }
    
    // 更新框选状态
    updateSelectionState() {
        const selectedItems = document.querySelectorAll('.file-preview-item.selected');
        const allImageItems = document.querySelectorAll('.file-preview-item');
        
        // 为所有图片项添加可框选状态
        allImageItems.forEach(item => {
            item.classList.add('selectable');
        });
        
        // 如果有选中的项，显示选中数量
        if (selectedItems.length > 0) {
            console.log(`已选中 ${selectedItems.length} 张图片`);
        }
    }
    
    // 清除所有选中状态
    clearSelection() {
        document.querySelectorAll('.file-preview-item.selected').forEach(item => {
            item.classList.remove('selected');
        });
        this.updateSelectionState();
    }
    
    // 添加框选拖拽功能
    addSelectionBoxFeature(container) {
        const filePreviewGrid = container.querySelector('.file-preview-grid');
        if (!filePreviewGrid) return;
        
        // 找到包含图片的详情卡片区域
        const detailSectionCard = filePreviewGrid.closest('.detail-section-card');
        if (!detailSectionCard) return;
        
        let isSelecting = false;
        let startX, startY, endX, endY;
        let selectionBox = null;
        
        // 创建选择框元素
        const createSelectionBox = () => {
            const box = document.createElement('div');
            box.className = 'selection-box';
            detailSectionCard.appendChild(box);
            return box;
        };
        
        // 更新选择框位置
        const updateSelectionBox = (box, startX, startY, endX, endY) => {
            const left = Math.min(startX, endX);
            const top = Math.min(startY, endY);
            const width = Math.abs(endX - startX);
            const height = Math.abs(endY - startY);
            
            box.style.left = left + 'px';
            box.style.top = top + 'px';
            box.style.width = width + 'px';
            box.style.height = height + 'px';
            box.style.display = 'block';
        };
        
        // 获取选择框内的图片项
        const getItemsInSelection = (startX, startY, endX, endY) => {
            const left = Math.min(startX, endX);
            const top = Math.min(startY, endY);
            const right = Math.max(startX, endX);
            const bottom = Math.max(startY, endY);
            
            const items = filePreviewGrid.querySelectorAll('.file-preview-item');
            const selectedItems = [];
            
            items.forEach(item => {
                const rect = item.getBoundingClientRect();
                const cardRect = detailSectionCard.getBoundingClientRect();
                
                const itemLeft = rect.left - cardRect.left;
                const itemTop = rect.top - cardRect.top;
                const itemRight = itemLeft + rect.width;
                const itemBottom = itemTop + rect.height;
                
                // 检查是否有重叠
                if (itemLeft < right && itemRight > left && itemTop < bottom && itemBottom > top) {
                    selectedItems.push(item);
                }
            });
            
            return selectedItems;
        };
        
        // 鼠标按下事件 - 在整个详情卡片区域监听
        detailSectionCard.addEventListener('mousedown', (e) => {
            // 排除图片和视频元素，以及它们的子元素
            if (e.target.closest('.file-preview-image, .file-preview-video')) {
                return;
            }
            
            e.preventDefault();
            isSelecting = true;
            
            const rect = detailSectionCard.getBoundingClientRect();
            startX = e.clientX - rect.left;
            startY = e.clientY - rect.top;
            
            // 检查是否按住Shift键
            const isShiftSelect = e.shiftKey;
            
            // 如果不是Shift框选，清除之前的选择
            if (!isShiftSelect) {
                document.querySelectorAll('.file-preview-item.selected').forEach(item => {
                    item.classList.remove('selected');
                });
            }
            
            detailSectionCard.classList.add('selecting');
            filePreviewGrid.classList.add('selecting');
            selectionBox = createSelectionBox();
        });
        
        // 鼠标移动事件
        document.addEventListener('mousemove', (e) => {
            if (!isSelecting || !selectionBox) return;
            
            const rect = detailSectionCard.getBoundingClientRect();
            endX = e.clientX - rect.left;
            endY = e.clientY - rect.top;
            
            updateSelectionBox(selectionBox, startX, startY, endX, endY);
        });
        
        // 鼠标释放事件
        document.addEventListener('mouseup', (e) => {
            if (!isSelecting || !selectionBox) return;
            
            isSelecting = false;
            detailSectionCard.classList.remove('selecting');
            filePreviewGrid.classList.remove('selecting');
            
            // 获取选择框内的图片
            const selectedItems = getItemsInSelection(startX, startY, endX, endY);
            
            // 检查是否按住Shift键
            const isShiftSelect = e.shiftKey;
            
            if (isShiftSelect) {
                // Shift框选：反向选择（已选中的取消选择，未选中的添加选择）
                selectedItems.forEach(item => {
                    item.classList.toggle('selected');
                });
            } else {
                // 普通框选：直接选择框内的所有图片
                selectedItems.forEach(item => {
                    item.classList.add('selected');
                });
            }
            
            // 移除选择框
            if (selectionBox && selectionBox.parentNode) {
                selectionBox.parentNode.removeChild(selectionBox);
            }
            selectionBox = null;
            
            // 更新选择状态
            this.updateSelectionState();
        });
        
        // 鼠标离开事件
        filePreviewGrid.addEventListener('mouseleave', () => {
            if (isSelecting && selectionBox) {
                isSelecting = false;
                detailSectionCard.classList.remove('selecting');
                filePreviewGrid.classList.remove('selecting');
                
                if (selectionBox && selectionBox.parentNode) {
                    selectionBox.parentNode.removeChild(selectionBox);
                }
                selectionBox = null;
            }
        });
    }

    // 工具方法：格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 MB';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
    async previewImage(filePath) {
        try {
            this.updateStatus('正在加载图片...');
            const result = await window.electronAPI.readImage(filePath);
            if (result.success) {
                this.detailColumn.showImagePreview(result.data, filePath.split('/').pop());
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
        // 监听来自主进程的商品数据导入事件
        window.electronAPI.onImportGoodsData((goodsData) => {
            console.log('收到商品数据导入事件:', goodsData);
            this.showGoodsPreview(goodsData);
        });

        // 绑定预览弹窗事件
        this.bindGoodsPreviewEvents();
        
        // 绑定预览标签页切换事件
        this.bindPreviewTabEvents();
        
    }
    

    // 绑定预览标签页切换事件
    bindPreviewTabEvents() {
        const tabs = document.querySelectorAll('.preview-tab');
        const sections = document.querySelectorAll('.preview-section');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.getAttribute('data-tab');
                
                // 移除所有活动状态
                tabs.forEach(t => t.classList.remove('active'));
                sections.forEach(s => s.classList.remove('active'));
                
                // 激活当前标签页
                tab.classList.add('active');
                
                // 根据data-tab属性找到对应的section
                let targetSection;
                if (targetTab === 'images') {
                    targetSection = document.getElementById('previewImages');
                } else if (targetTab === 'goodsInfo') {
                    targetSection = document.getElementById('previewGoodsInfo');
                } else if (targetTab === 'monitoring') {
                    targetSection = document.getElementById('previewMonitoring');
                }
                
                if (targetSection) {
                    targetSection.classList.add('active');
                }
            });
        });
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

    // 图片过滤方法
    filterImages(imageInfoList) {
        if (!imageInfoList || imageInfoList.length === 0) {
            return [];
        }

        console.log('开始过滤图片，总数:', imageInfoList.length);
        
        // 过滤条件
        const filteredImages = imageInfoList.filter(imageInfo => {
            const width = imageInfo.width;
            const height = imageInfo.height;
            const aspectRatio = width / height;
            
            // 基本尺寸要求：至少有一边达到800px
            const hasMinSize = width >= 800 || height >= 800;
            
            // 宽高比要求：在0.5到2.0之间（避免过于细长或过于扁平的图片）
            const hasGoodAspectRatio = aspectRatio >= 0.5 && aspectRatio <= 2.0;
            
            // 最小尺寸要求：避免过小的图片
            const hasMinDimensions = width >= 400 && height >= 400;
            
            const isValid = hasMinSize && hasGoodAspectRatio && hasMinDimensions;
            
            if (isValid) {
                console.log(`图片通过筛选: ${width}×${height}px, 比例: ${aspectRatio.toFixed(2)}`);
            } else {
                console.log(`图片被过滤: ${width}×${height}px, 比例: ${aspectRatio.toFixed(2)}`);
            }
            
            return isValid;
        });
        
        console.log(`图片过滤完成: ${filteredImages.length}/${imageInfoList.length} 张图片通过筛选`);
        
        // 如果没有符合要求的图片，选择最大的几张
        if (filteredImages.length === 0 && imageInfoList.length > 0) {
            console.log('没有符合筛选条件的图片，选择最大的5张');
            const sortedImages = [...imageInfoList].sort((a, b) => {
                const areaA = a.width * a.height;
                const areaB = b.width * b.height;
                return areaB - areaA;
            });
            return sortedImages.slice(0, Math.min(5, sortedImages.length));
        }
        
        return filteredImages;
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
                    <p>暂无采集图片</p>
                </div>
            `;
            return;
        }

        // 按图片大小排序（面积从大到小）
        const sortedImageInfoList = [...imageInfoList].sort((a, b) => {
            const areaA = a.width * a.height;
            const areaB = b.width * b.height;
            return areaB - areaA;
        });

        // 显示排序后的图片
        sortedImageInfoList.forEach((imageInfo, index) => {
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
                    <div class="image-index">排名 ${index + 1}</div>
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

    // 显示商品数据预览弹窗
    showGoodsPreview(data) {
        console.log('showGoodsPreview 被调用，数据:', data);
        const modal = document.getElementById('goodsPreviewModal');
        if (!modal) {
            console.error('找不到 goodsPreviewModal 元素');
            return;
        }

        const { goodsInfoData, monitoringData } = data;
        console.log('商品信息数据:', goodsInfoData);
        console.log('监控数据:', monitoringData);

        // 这些元素在HTML中已被移除，不再需要填充
        
    // 显示采集的图片 - 在hanli-app中进行最终筛选
    const filteredImages = this.filterImages(goodsInfoData.imageInfoList || []);
    this.displayFilteredImages(filteredImages, goodsInfoData.imageInfoList || []);
        
        // 显示商品信息列表
        this.displayGoodsInfoList(goodsInfoData);
        
        // 显示监控数据列表
        this.displayMonitoringDataList(monitoringData);

        // 存储当前商品数据
        this.currentImportData = data;

        // 显示弹窗
        console.log('准备显示弹窗');
        modal.style.display = 'flex';
        console.log('弹窗显示状态:', modal.style.display);
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

    // 保存商品数据
    async saveGoodsData() {
        if (!this.currentImportData) {
            this.updateStatus('没有可保存的商品数据');
            return;
        }

        try {
            this.updateStatus('正在保存商品数据...');
            
            const result = await window.electronAPI.saveGoodsData(this.currentImportData);
            
            if (result.success) {
                let statusMessage = `商品数据已保存到: 商品信息 -> ${result.paths.goodsInfo}, 监控数据 -> ${result.paths.monitoring}`;
                if (result.savedImages && result.savedImages.length > 0) {
                    statusMessage += `, 商品库已保存 ${result.savedImages.length} 张筛选图片`;
                }
                if (result.monitoringSavedImages && result.monitoringSavedImages.length > 0) {
                    statusMessage += `, 监控文件夹已保存 ${result.monitoringSavedImages.length} 张筛选图片`;
                }
                this.updateStatus(statusMessage);
                
                // 关闭预览弹窗
                const modal = document.getElementById('goodsPreviewModal');
                if (modal) {
                    modal.style.display = 'none';
                }
                
                // 清空当前数据
                this.currentImportData = null;
                
                // 刷新数据列表
                this.loadData();
            } else {
                this.updateStatus(`保存失败: ${result.error}`);
            }
        } catch (error) {
            console.error('保存商品数据失败:', error);
            this.updateStatus(`保存失败: ${error.message}`);
        }
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