/**
 * 增强版监控数据采集管理器
 * 支持localStorage事件触发 + 直接调用插件的fallback机制
 */
class EnhancedMonitorCollectionManager {
    constructor() {
        this.timeout = 10000; // 10秒超时
        this.retryAttempts = 3; // 重试次数
    }

    /**
     * 执行监控数据采集（带fallback机制）
     * @param {Object} product - 商品信息
     * @param {number} index - 商品索引
     * @returns {Promise<Object>} 采集结果
     */
    async performMonitoringDataCollection(product, index) {
        console.log(`开始采集商品: ${product.title}`);
        
        try {
            // 方法1: 尝试通过localStorage和自定义事件触发
            const eventResult = await this.triggerCollectionByEvent(product, index);
            if (eventResult.success) {
                console.log('通过事件触发采集成功');
                return eventResult.data;
            }
        } catch (error) {
            console.warn('事件触发失败:', error.message);
        }

        // 方法2: 直接调用插件函数（fallback）
        console.log('事件触发失败，尝试直接调用插件函数');
        try {
            const directResult = await this.triggerCollectionDirectly(product, index);
            if (directResult.success) {
                console.log('直接调用插件函数成功');
                return directResult.data;
            }
        } catch (error) {
            console.error('直接调用插件函数也失败:', error.message);
            throw new Error(`所有采集方法都失败: ${error.message}`);
        }
    }

    /**
     * 通过localStorage和自定义事件触发采集
     * @param {Object} product - 商品信息
     * @param {number} index - 商品索引
     * @returns {Promise<Object>} 采集结果
     */
    async triggerCollectionByEvent(product, index) {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('事件触发超时'));
            }, this.timeout);

            // 监听采集完成事件
            const handleCollectionComplete = (event) => {
                clearTimeout(timeoutId);
                window.removeEventListener('hanliPopupMonitoringCollectionCompleted', handleCollectionComplete);
                
                if (event.detail && event.detail.monitoringData) {
                    resolve({
                        success: true,
                        data: event.detail.monitoringData
                    });
                } else {
                    reject(new Error('采集完成但数据无效'));
                }
            };

            // 监听采集失败事件
            const handleCollectionError = (event) => {
                clearTimeout(timeoutId);
                window.removeEventListener('hanliPopupMonitoringCollectionError', handleCollectionError);
                reject(new Error(event.detail?.error || '采集失败'));
            };

            // 注册事件监听器
            window.addEventListener('hanliPopupMonitoringCollectionCompleted', handleCollectionComplete, { once: true });
            window.addEventListener('hanliPopupMonitoringCollectionError', handleCollectionError, { once: true });

            // 发送采集请求
            const collectionRequest = {
                action: 'startCollection',
                taskId: index,
                goodsId: product.goodsId,
                url: product.collectUrl,
                timestamp: new Date().toISOString()
            };

            console.log('发送localStorage采集请求:', collectionRequest);
            
            // 通过localStorage发送请求
            localStorage.setItem('collectionRequest', JSON.stringify(collectionRequest));
            
            // 发送自定义事件
            window.dispatchEvent(new CustomEvent('hanliMonitorCollectionRequest', {
                detail: collectionRequest
            }));

            // 额外发送一个存储事件（某些情况下localStorage.setItem不会触发storage事件）
            window.dispatchEvent(new CustomEvent('storage', {
                detail: {
                    key: 'collectionRequest',
                    newValue: JSON.stringify(collectionRequest)
                }
            }));
        });
    }

    /**
     * 直接调用插件函数（fallback方法）
     * @param {Object} product - 商品信息
     * @param {number} index - 商品索引
     * @returns {Promise<Object>} 采集结果
     */
    async triggerCollectionDirectly(product, index) {
        return new Promise(async (resolve, reject) => {
            try {
                // 检查插件函数是否可用
                if (typeof window.collectMonitoringDataOnly !== 'function') {
                    // 如果插件函数不可用，尝试等待一段时间后重试
                    await this.waitForPluginFunction();
                }

                if (typeof window.collectMonitoringDataOnly !== 'function') {
                    throw new Error('插件函数不可用');
                }

                console.log('直接调用插件函数 collectMonitoringDataOnly');
                
                // 监听采集完成事件
                const handleComplete = (event) => {
                    window.removeEventListener('hanliPopupMonitoringCollectionCompleted', handleComplete);
                    window.removeEventListener('hanliPopupMonitoringCollectionError', handleError);
                    
                    if (event.detail && event.detail.monitoringData) {
                        resolve({
                            success: true,
                            data: event.detail.monitoringData
                        });
                    } else {
                        reject(new Error('采集完成但数据无效'));
                    }
                };

                const handleError = (event) => {
                    window.removeEventListener('hanliPopupMonitoringCollectionCompleted', handleComplete);
                    window.removeEventListener('hanliPopupMonitoringCollectionError', handleError);
                    reject(new Error(event.detail?.error || '采集失败'));
                };

                // 注册事件监听器
                window.addEventListener('hanliPopupMonitoringCollectionCompleted', handleComplete, { once: true });
                window.addEventListener('hanliPopupMonitoringCollectionError', handleError, { once: true });

                // 设置超时
                const timeoutId = setTimeout(() => {
                    window.removeEventListener('hanliPopupMonitoringCollectionCompleted', handleComplete);
                    window.removeEventListener('hanliPopupMonitoringCollectionError', handleError);
                    reject(new Error('直接调用插件函数超时'));
                }, this.timeout);

                // 直接调用插件函数
                const result = await window.collectMonitoringDataOnly();
                
                // 如果函数直接返回结果（同步）
                if (result && result.monitoringData) {
                    clearTimeout(timeoutId);
                    window.removeEventListener('hanliPopupMonitoringCollectionCompleted', handleComplete);
                    window.removeEventListener('hanliPopupMonitoringCollectionError', handleError);
                    resolve({
                        success: true,
                        data: result.monitoringData
                    });
                }
                // 否则等待事件触发

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * 等待插件函数加载
     * @param {number} maxWaitTime - 最大等待时间（毫秒）
     * @returns {Promise<void>}
     */
    async waitForPluginFunction(maxWaitTime = 5000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWaitTime) {
            if (typeof window.collectMonitoringDataOnly === 'function') {
                console.log('插件函数已加载');
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        throw new Error('等待插件函数加载超时');
    }

    /**
     * 重试机制
     * @param {Function} fn - 要重试的函数
     * @param {number} attempts - 重试次数
     * @returns {Promise<any>} 重试结果
     */
    async retry(fn, attempts = this.retryAttempts) {
        let lastError;
        
        for (let i = 0; i < attempts; i++) {
            try {
                console.log(`重试第 ${i + 1}/${attempts} 次`);
                return await fn();
            } catch (error) {
                lastError = error;
                console.warn(`重试 ${i + 1} 失败:`, error.message);
                
                if (i < attempts - 1) {
                    // 等待一段时间后重试
                    await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                }
            }
        }
        
        throw lastError;
    }

    /**
     * 执行带重试的监控数据采集
     * @param {Object} product - 商品信息
     * @param {number} index - 商品索引
     * @returns {Promise<Object>} 采集结果
     */
    async performMonitoringDataCollectionWithRetry(product, index) {
        return this.retry(() => this.performMonitoringDataCollection(product, index));
    }
}

// 使用示例
async function enhancedAutoCollection() {
    const manager = new EnhancedMonitorCollectionManager();
    
    // 示例商品数据
    const product = {
        goodsId: '601099525339350',
        title: '示例商品',
        collectUrl: 'https://www.temu.com/example-product.html'
    };
    
    try {
        console.log('开始增强版监控数据采集...');
        const result = await manager.performMonitoringDataCollectionWithRetry(product, 0);
        console.log('采集成功:', result);
        return result;
    } catch (error) {
        console.error('采集失败:', error);
        throw error;
    }
}

// 如果在浏览器环境中，将函数暴露到全局
if (typeof window !== 'undefined') {
    window.EnhancedMonitorCollectionManager = EnhancedMonitorCollectionManager;
    window.enhancedAutoCollection = enhancedAutoCollection;
}

// 如果在Node.js环境中，导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EnhancedMonitorCollectionManager, enhancedAutoCollection };
}
