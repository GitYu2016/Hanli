// 监控数据采集管理器
class MonitorCollectionManager {
    constructor() {
        this.products = [];
        this.isCollecting = false;
        this.isPaused = false;
        this.currentIndex = 0;
        this.completedCount = 0;
        this.failedCount = 0;
        
        this.initializeElements();
        this.bindEvents();
        this.log('监控数据采集管理器已初始化');
        
        // 页面加载完成后自动加载商品清单
        this.autoLoadProducts();
    }

    initializeElements() {
        this.totalProductsEl = document.getElementById('total-products');
        this.completedProductsEl = document.getElementById('completed-products');
        this.currentProductEl = document.getElementById('current-product');
        this.successRateEl = document.getElementById('success-rate');
        this.progressFillEl = document.getElementById('progress-fill');
        this.progressTextEl = document.getElementById('progress-text');
        this.productCountEl = document.getElementById('product-count');
        this.productListContentEl = document.getElementById('product-list-content');
        this.logContentEl = document.getElementById('log-content');
    }

    bindEvents() {
        // 监听monitoring.json修改事件，自动刷新状态
        this.setupAutoRefresh();
    }

    async loadProducts() {
        try {
            this.log('开始加载商品清单...');

            // 从Hanli App获取商品清单
            const response = await fetch('http://localhost:3001/api/monitor/get-products-list');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || '获取商品清单失败');
            }

            this.products = data.products || [];
            this.log(`成功加载 ${this.products.length} 个商品`);
            
            // 检查每个商品的今日采集状态
            await this.checkTodayCollectionStatus();
            
            this.updateUI();
            this.renderProductList();
            
            if (this.products.length > 0) {
                this.log('商品清单加载完成，可以直接点击商品进行采集');
            }

        } catch (error) {
            this.log(`加载商品清单失败: ${error.message}`, 'error');
            this.showError('加载商品清单失败: ' + error.message);
        }
    }

    // 检查今日采集状态
    async checkTodayCollectionStatus() {
        this.log('检查今日采集状态...');
        
        const today = new Date().toISOString().split('T')[0]; // 获取今日日期 YYYY-MM-DD
        let todayCollectedCount = 0;
        
        for (let i = 0; i < this.products.length; i++) {
            const product = this.products[i];
            
            try {
                // 获取商品的monitoring.json数据
                const response = await fetch(`http://localhost:3001/api/monitor/get-monitoring-data?goodsId=${product.goodsId}`);
                
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.success && data.monitoringData && Array.isArray(data.monitoringData)) {
                        // 检查是否有今日的数据
                        const hasTodayData = data.monitoringData.some(entry => {
                            if (entry.utcTime) {
                                // 解析时间并比较日期
                                const entryDate = new Date(entry.utcTime).toISOString().split('T')[0];
                                return entryDate === today;
                            }
                            return false;
                        });
                        
                        if (hasTodayData) {
                            product.status = 'completed';
                            product.progress = '今日已采集';
                            todayCollectedCount++;
                            this.log(`商品 ${i + 1} (${product.title}) 今日已采集`);
                        } else {
                            product.status = 'pending';
                            product.progress = '等待采集';
                        }
                    } else {
                        product.status = 'pending';
                        product.progress = '等待采集';
                    }
                } else {
                    product.status = 'pending';
                    product.progress = '等待采集';
                }
            } catch (error) {
                console.warn(`检查商品 ${product.goodsId} 的采集状态失败:`, error);
                product.status = 'pending';
                product.progress = '等待采集';
            }
        }
        
        this.completedCount = todayCollectedCount;
        this.log(`今日采集状态检查完成，已采集 ${todayCollectedCount}/${this.products.length} 个商品`);
    }

    // 自动加载商品清单
    async autoLoadProducts() {
        this.log('页面加载完成，自动加载商品清单...');
        await this.loadProducts();
    }

    // 设置自动刷新监听
    setupAutoRefresh() {
        // 监听来自其他页面的monitoring.json更新事件
        window.addEventListener('storage', (e) => {
            if (e.key === 'monitoringDataUpdated') {
                this.log('检测到monitoring.json更新，自动刷新状态...');
                this.autoRefreshStatus();
            }
        });

        // 监听来自content script的monitoring.json更新事件
        window.addEventListener('message', (e) => {
            if (e.data && e.data.type === 'monitoringDataUpdated') {
                this.log('检测到monitoring.json更新，自动刷新状态...');
                this.autoRefreshStatus();
            }
        });

        // 定期检查状态（每30秒检查一次）
        setInterval(() => {
            if (this.products.length > 0) {
                this.autoRefreshStatus();
            }
        }, 30000);

        this.log('自动刷新监听已设置');
    }

    // 自动刷新状态
    async autoRefreshStatus() {
        if (this.products.length === 0) {
            return;
        }

        try {
            // 重新检查今日采集状态
            await this.checkTodayCollectionStatus();
            
            this.updateUI();
            this.renderProductList();
            
            this.log('状态已自动刷新', 'success');

        } catch (error) {
            console.warn('自动刷新状态失败:', error);
        }
    }

    async startCollection() {
        if (this.products.length === 0) {
            this.showError('请先加载商品清单');
            return;
        }

        this.log('商品清单已加载，可以直接点击商品进行采集');
        this.updateButtonStates();
    }

    // 手动采集单个商品
    async collectSingleProduct(index) {
        console.log('collectSingleProduct called with index:', index);
        this.log(`点击采集按钮，商品索引: ${index}`);
        
        if (index < 0 || index >= this.products.length) {
            this.log('无效的商品索引', 'error');
            return;
        }

        const product = this.products[index];
        
        // 检查是否已经在采集中
        if (product.status === 'collecting') {
            this.log(`商品 ${index + 1} 正在采集中，请稍候...`, 'warning');
            return;
        }

        // 检查是否已经完成
        if (product.status === 'completed') {
            this.log(`商品 ${index + 1} 今日已采集，无需重复采集`, 'warning');
            return;
        }

        try {
            this.log(`开始采集商品 ${index + 1}/${this.products.length}: ${product.title}`);
            this.updateProductStatus(index, 'collecting', '采集中...');
            
            // 打开新标签页
            const newTab = window.open(product.collectUrl, '_blank');
            
            if (!newTab) {
                throw new Error('无法打开新标签页，可能被浏览器阻止');
            }

            this.log(`已打开商品页面: ${product.collectUrl}`);
            
            // 等待页面加载
            await this.sleep(2000);
            
            // 执行监控数据采集
            const collectedData = await this.performMonitoringDataCollection(product, index);
            
            // 更新monitoring.json文件
            await this.updateMonitoringData(product.goodsId, collectedData);
            
            // 数据发送成功，立即关闭标签页
            if (newTab && !newTab.closed) {
                newTab.close();
                this.log(`数据已发送到API，已关闭商品页面: ${product.title}`);
            }
            
                this.completedCount++;
                this.updateProductStatus(index, 'completed', '今日已采集');
                this.log(`商品 ${index + 1} 采集成功，数据已保存`, 'success');
                
                // 通知其他页面monitoring.json已更新
                localStorage.setItem('monitoringDataUpdated', Date.now().toString());
            
        } catch (error) {
            this.failedCount++;
            this.updateProductStatus(index, 'failed', '采集失败');
            this.log(`商品 ${index + 1} 采集失败: ${error.message}`, 'error');
        }

        this.updateUI();
    }

    pauseCollection() {
        this.isPaused = true;
        this.updateButtonStates();
        this.log('采集已暂停');
    }

    stopCollection() {
        this.isCollecting = false;
        this.isPaused = false;
        this.updateButtonStates();
        this.log('采集已停止');
    }

    resetCollection() {
        this.isCollecting = false;
        this.isPaused = false;
        this.currentIndex = 0;
        this.completedCount = 0;
        this.failedCount = 0;
        
        // 重置所有商品状态
        this.products.forEach(product => {
            product.status = 'pending';
            product.progress = '等待中...';
        });
        
        this.updateUI();
        this.renderProductList();
        this.updateButtonStates();
        this.log('采集状态已重置');
    }

    async processProducts() {
        for (let i = this.currentIndex; i < this.products.length; i++) {
            if (!this.isCollecting) break;
            
            while (this.isPaused && this.isCollecting) {
                await this.sleep(1000);
            }
            
            if (!this.isCollecting) break;

            this.currentIndex = i;
            const product = this.products[i];
            
            this.log(`开始采集商品 ${i + 1}/${this.products.length}: ${product.title}`);
            this.updateUI();
            this.updateProductStatus(i, 'collecting', '采集中...');

            try {
                // 打开新标签页
                const newTab = window.open(product.collectUrl, '_blank');
                
                if (!newTab) {
                    throw new Error('无法打开新标签页，可能被浏览器阻止');
                }

                this.log(`已打开商品页面: ${product.collectUrl}`);
                this.log(`正在采集数据: ${product.title}...`);
                
                // 等待页面加载
                await this.sleep(2000);
                
                // 执行监控数据采集
                const collectedData = await this.performMonitoringDataCollection(product, i);
                
                // 更新monitoring.json文件
                await this.updateMonitoringData(product.goodsId, collectedData);
                
                // 关闭标签页
                if (newTab && !newTab.closed) {
                    newTab.close();
                    this.log(`已关闭商品页面: ${product.title}`);
                }
                
                this.completedCount++;
                this.updateProductStatus(i, 'completed', '已完成');
                this.log(`商品 ${i + 1} 采集成功`, 'success');
                
            } catch (error) {
                this.failedCount++;
                this.updateProductStatus(i, 'failed', '采集失败');
                this.log(`商品 ${i + 1} 采集失败: ${error.message}`, 'error');
            }

            this.updateUI();
            
            // 随机间隔2-5秒执行下一个
            if (i < this.products.length - 1 && this.isCollecting) {
                const randomDelay = Math.floor(Math.random() * 3000) + 2000; // 2-5秒
                this.log(`等待 ${randomDelay/1000} 秒后执行下一个商品...`);
                await this.sleep(randomDelay);
            }
        }
    }

    async performMonitoringDataCollection(product, index) {
        return new Promise((resolve, reject) => {
            // 发送采集请求到新标签页
            const collectionRequest = {
                action: 'startCollection',
                taskId: index,
                goodsId: product.goodsId,
                url: product.collectUrl,
                timestamp: new Date().toISOString()
            };

            // 通过localStorage与content script通信
            localStorage.setItem('collectionRequest', JSON.stringify(collectionRequest));
            this.log(`已发送采集请求: ${product.title}`);

            // 等待采集结果，设置超时时间为20秒
            this.waitForCollectionResult(index, 20000)
                .then(result => {
                    if (result.success) {
                        this.log(`采集数据成功: ${product.title}`, 'success');
                        resolve(result.collectedData);
                    } else {
                        reject(new Error(result.error || '采集失败'));
                    }
                })
                .catch(error => {
                    this.log(`采集数据失败: ${product.title} - ${error.message}`, 'error');
                    reject(error);
                });
        });
    }

    async waitForCollectionResult(taskId, timeout = 20000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const product = this.products[taskId];
            
            const checkResult = () => {
                const result = localStorage.getItem(`collectionResult_${taskId}`);
                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, timeout - elapsed);
                
                if (result) {
                    try {
                        const data = JSON.parse(result);
                        localStorage.removeItem(`collectionResult_${taskId}`);
                        this.log(`采集完成，耗时 ${Math.round(elapsed/1000)} 秒: ${product.title}`, 'success');
                        resolve(data);
                    } catch (error) {
                        reject(new Error('解析采集结果失败: ' + error.message));
                    }
                    return;
                }
                
                if (elapsed > timeout) {
                    this.log(`采集超时 (${Math.round(timeout/1000)}秒): ${product.title}`, 'error');
                    reject(new Error(`采集超时，超过 ${Math.round(timeout/1000)} 秒未收到结果`));
                    return;
                }
                
                // 每3秒显示一次剩余时间
                if (remaining > 0 && remaining % 3000 < 1000) {
                    this.log(`等待采集结果中，剩余 ${Math.round(remaining/1000)} 秒: ${product.title}`);
                }
                
                setTimeout(checkResult, 3000);
            };
            
            this.log(`开始等待采集结果，超时时间 ${Math.round(timeout/1000)} 秒: ${product.title}`);
            checkResult();
        });
    }

    async updateMonitoringData(goodsId, collectedData) {
        try {
            this.log(`开始更新monitoring.json: ${goodsId}`);
            
            // 获取现有数据
            const response = await fetch(`http://localhost:3001/api/monitor/get-monitoring-data?goodsId=${goodsId}`);
            
            let existingData = [];
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    existingData = data.monitoringData || [];
                    this.log(`获取到现有数据 ${existingData.length} 条记录`);
                } else {
                    this.log(`获取现有数据失败: ${data.error}`, 'warning');
                }
            } else {
                this.log(`获取现有数据失败: HTTP ${response.status}`, 'warning');
            }

            // 创建新的监控数据条目
            const newEntry = {
                id: Date.now().toString(),
                utcTime: new Date().toISOString().replace('Z', '+08:00'),
                goodsData: collectedData.goodsData || {},
                storeData: collectedData.storeData || {}
            };

            this.log(`创建新数据条目: ${JSON.stringify(newEntry, null, 2)}`);

            // 添加到数组开头
            existingData.unshift(newEntry);

            // 限制历史记录数量
            if (existingData.length > 100) {
                existingData = existingData.slice(0, 100);
                this.log(`数据已限制为100条记录`);
            }

            this.log(`准备更新数据，共 ${existingData.length} 条记录`);

            // 更新数据
            const updateResponse = await fetch('http://localhost:3001/api/monitor/update-monitoring-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    goodsId: goodsId,
                    monitoringData: existingData
                })
            });

            if (!updateResponse.ok) {
                const errorText = await updateResponse.text();
                throw new Error(`更新monitoring.json失败: ${updateResponse.status} - ${errorText}`);
            }

            const updateData = await updateResponse.json();
            if (!updateData.success) {
                throw new Error(updateData.error || '更新monitoring.json失败');
            }

            this.log(`✅ monitoring.json已成功更新: ${goodsId}`, 'success');

        } catch (error) {
            this.log(`❌ 更新monitoring.json失败: ${error.message}`, 'error');
            throw error;
        }
    }

    updateUI() {
        const total = this.products.length;
        const completed = this.completedCount;
        const current = this.currentIndex + 1;
        const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        this.totalProductsEl.textContent = total;
        this.completedProductsEl.textContent = completed;
        this.currentProductEl.textContent = current;
        this.successRateEl.textContent = successRate + '%';
        this.progressFillEl.style.width = progress + '%';
        
        if (this.isCollecting) {
            this.progressTextEl.textContent = `采集中... ${completed}/${total}`;
        } else if (completed === total && total > 0) {
            this.progressTextEl.textContent = `采集完成 ${completed}/${total}`;
        } else {
            this.progressTextEl.textContent = `准备就绪 ${completed}/${total}`;
        }
    }

    updateProductStatus(index, status, progress) {
        if (this.products[index]) {
            this.products[index].status = status;
            this.products[index].progress = progress;
        }
        this.renderProductList();
    }

    renderProductList() {
        if (this.products.length === 0) {
            this.productListContentEl.innerHTML = `
                <div style="padding: 40px; text-align: center; color: #666;">
                    点击"加载商品清单"开始
                </div>
            `;
            return;
        }

        this.productCountEl.textContent = this.products.length;

        const html = this.products.map((product, index) => `
            <div class="product-item">
                <div class="product-info">
                    <div class="product-title">${product.title}</div>
                    <div class="product-url">${product.collectUrl}</div>
                </div>
                <div class="product-actions">
                    <div class="product-status status-${product.status}">
                        ${product.progress}
                    </div>
                    <button class="collect-btn" data-index="${index}" 
                            ${product.status === 'collecting' ? 'disabled' : ''}>
                        ${product.status === 'collecting' ? '采集中...' : 
                          product.status === 'completed' ? '今日已采集' : 
                          product.status === 'failed' ? '重新采集' : '开始采集'}
                    </button>
                </div>
            </div>
        `).join('');

        this.productListContentEl.innerHTML = html;
        
        // 使用事件委托来处理按钮点击
        this.productListContentEl.addEventListener('click', (e) => {
            if (e.target.classList.contains('collect-btn')) {
                const index = parseInt(e.target.getAttribute('data-index'));
                console.log('Button clicked, index:', index);
                this.collectSingleProduct(index);
            }
        });
    }

    updateButtonStates() {
        // 按钮已移除，无需更新按钮状态
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        
        const timestampSpan = document.createElement('span');
        timestampSpan.className = 'log-timestamp';
        timestampSpan.textContent = `[${timestamp}]`;
        
        const messageSpan = document.createElement('span');
        messageSpan.className = `log-${type}`;
        messageSpan.textContent = message;
        
        logEntry.appendChild(timestampSpan);
        logEntry.appendChild(messageSpan);
        
        this.logContentEl.appendChild(logEntry);
        this.logContentEl.scrollTop = this.logContentEl.scrollHeight;
    }

    showError(message) {
        alert(message);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}

// 初始化管理器
document.addEventListener('DOMContentLoaded', () => {
    window.monitorCollectionManager = new MonitorCollectionManager();
});
