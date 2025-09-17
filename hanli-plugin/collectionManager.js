// 采集管理器 - 统一管理采集流程
class CollectionManager {
    constructor() {
        this.isCollecting = false;
    }

    // 执行完整的采集流程
    async executeCollection(goodsInfoData, monitoringData, mediaData, shouldOpenApp = false) {
        if (this.isCollecting) {
            console.warn('采集正在进行中，请等待完成');
            return;
        }

        this.isCollecting = true;
        
        try {
            console.log('开始执行完整采集流程...');
            
            // 1. 创建文件夹并发送JSON数据
            await this.createFolderAndSaveJson(goodsInfoData, monitoringData, mediaData);
            
            // 2. 根据参数决定是否唤起App
            if (shouldOpenApp) {
                this.openApp(goodsInfoData.goodsId);
            }
            
            // 3. 异步下载媒体文件（由MediaManager处理）
            if (window.mediaManager) {
                window.mediaManager.downloadMediaFilesAsync(goodsInfoData.goodsId, mediaData);
            } else {
                console.warn('MediaManager未加载，跳过媒体文件下载');
            }
            
        } catch (error) {
            console.error('采集流程失败:', error);
            // 根据错误类型显示不同的提示
            if (error.message.includes('无法连接到hanli-app') || error.message.includes('保存JSON数据失败')) {
                this.showAppOpenFailedDialog(error.message);
            } else {
                this.showToast('采集失败: ' + error.message, 'error');
            }
        } finally {
            this.isCollecting = false;
        }
    }

    // 执行带进度跟踪的采集流程
    async executeCollectionWithProgress(goodsInfoData, monitoringData, mediaData, shouldOpenApp = false) {
        if (this.isCollecting) {
            console.warn('采集正在进行中，请等待完成');
            return;
        }

        this.isCollecting = true;
        
        try {
            console.log('开始执行带进度跟踪的采集流程...');
            
            // 1. 创建文件夹并发送JSON数据
            await this.createFolderAndSaveJson(goodsInfoData, monitoringData, mediaData);
            
            // 更新进度：JSON文件已保存
            if (window.collectionProgressDialog) {
                window.collectionProgressDialog.updateProgress(1);
            }
            
            // 2. 根据参数决定是否唤起App
            if (shouldOpenApp) {
                this.openApp(goodsInfoData.goodsId);
            }
            
            // 3. 异步下载媒体文件（由MediaManager处理）
            if (window.mediaManager) {
                await this.downloadMediaFilesWithProgress(goodsInfoData.goodsId, mediaData);
            } else {
                console.warn('MediaManager未加载，跳过媒体文件下载');
            }
            
        } catch (error) {
            console.error('采集流程失败:', error);
            // 根据错误类型显示不同的提示
            if (error.message.includes('无法连接到hanli-app') || error.message.includes('保存JSON数据失败')) {
                this.showAppOpenFailedDialog(error.message);
            } else {
                this.showToast('采集失败: ' + error.message, 'error');
            }
        } finally {
            this.isCollecting = false;
        }
    }

    // 带进度跟踪的媒体文件下载
    async downloadMediaFilesWithProgress(goodsId, mediaData) {
        try {
            console.log('开始带进度跟踪的媒体文件下载...');
            
            // 筛选符合尺寸要求的图片（最小800x800px）
            const filteredMedia = mediaData.media.filter(item => {
                if (item.type === 'image') {
                    const isLargeEnough = item.width >= 800 && item.height >= 800;
                    console.log(`图片筛选: ${item.url} - ${item.width}x${item.height} - 符合要求: ${isLargeEnough}`);
                    return isLargeEnough;
                }
                // 视频不进行尺寸筛选
                return true;
            });
            
            console.log(`筛选前媒体数量: ${mediaData.media.length}, 筛选后: ${filteredMedia.length}`);
            
            // 发送下载请求到App
            const downloadData = {
                goodsId: goodsId,
                mediaList: filteredMedia
            };
            
            const response = await fetch('http://localhost:3001/api/download-media', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(downloadData)
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    console.log('媒体文件下载完成:', result.downloadedFiles);
                    
                    // 更新进度：所有媒体文件下载完成
                    if (window.collectionProgressDialog) {
                        window.collectionProgressDialog.updateProgress(filteredMedia.length + 1); // +1 for JSON
                    }
                    
                    this.showDownloadCompleteNotification(result.downloadedFiles.length);
                } else {
                    console.error('媒体文件下载失败:', result.error);
                    this.showToast('媒体文件下载失败: ' + result.error, 'error');
                }
            } else {
                const errorText = await response.text();
                console.error('媒体文件下载请求失败，状态码:', response.status, '错误信息:', errorText);
                this.showToast(`媒体文件下载请求失败: ${response.status} - ${errorText}`, 'error');
            }
        } catch (error) {
            console.error('带进度跟踪的媒体文件下载失败:', error);
            this.showToast('媒体文件下载失败', 'error');
        }
    }

    // 创建文件夹并保存JSON数据
    async createFolderAndSaveJson(goodsInfoData, monitoringData, mediaData) {
        try {
            console.log('开始创建文件夹并保存JSON数据...');
            
            // 发送JSON文件到App
            const jsonData = {
                goodsId: goodsInfoData.goodsId,
                collectTime: goodsInfoData.collectTime,
                goodsInfo: JSON.stringify(goodsInfoData, null, 2),
                monitoring: JSON.stringify(monitoringData, null, 2),
                mediaData: JSON.stringify(mediaData, null, 2)
            };
            
            const response = await fetch('http://localhost:3001/api/save-json-files', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jsonData)
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    console.log('JSON数据已成功保存到hanli-app的data文件夹');
                    console.log('保存的文件:', result.files);
                    this.showToast('JSON数据已保存！', 'success');
                } else {
                    throw new Error('保存JSON数据失败: ' + result.error);
                }
            } else {
                const errorText = await response.text();
                throw new Error(`无法连接到hanli-app，状态码: ${response.status}。错误信息: ${errorText}。请确保Hanli应用已启动`);
            }
        } catch (error) {
            console.error('创建文件夹并保存JSON失败:', error);
            throw error;
        }
    }

    // 唤起App
    openApp(goodsId = null) {
        try {
            console.log('正在唤起App...', goodsId ? `商品ID: ${goodsId}` : '');
            
            // 创建一个隐藏的iframe来触发协议，避免打开新标签页
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            
            // 如果有goodsId，通过URL参数传递
            if (goodsId) {
                iframe.src = `hanliapp://open?goodsId=${encodeURIComponent(goodsId)}`;
            } else {
                iframe.src = 'hanliapp://open';
            }
            
            document.body.appendChild(iframe);
            
            // 立即移除iframe
            setTimeout(() => {
                if (iframe.parentNode) {
                    iframe.parentNode.removeChild(iframe);
                }
            }, 100);
            
            // 显示成功提示
            this.showToast('正在打开Hanli客户端...', 'success');
            
        } catch (error) {
            console.error('唤起App失败:', error);
            this.showAppOpenFailedDialog('唤起App失败，请确保Hanli应用已安装并正在运行');
        }
    }

    // 异步下载媒体文件（现在由MediaManager处理）
    async downloadMediaFilesAsync(goodsInfoData, mediaData) {
        try {
            console.log('开始异步下载媒体文件...');
            
            // 筛选符合尺寸要求的图片（最小800x800px）
            const filteredMedia = mediaData.media.filter(item => {
                if (item.type === 'image') {
                    const isLargeEnough = item.width >= 800 && item.height >= 800;
                    console.log(`图片筛选: ${item.url} - ${item.width}x${item.height} - 符合要求: ${isLargeEnough}`);
                    return isLargeEnough;
                }
                // 视频不进行尺寸筛选
                return true;
            });
            
            console.log(`筛选前媒体数量: ${mediaData.media.length}, 筛选后: ${filteredMedia.length}`);
            
            // 发送下载请求到App
            const downloadData = {
                goodsId: goodsInfoData.goodsId,
                mediaList: filteredMedia
            };
            
            const response = await fetch('http://localhost:3001/api/download-media', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(downloadData)
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    console.log('媒体文件下载完成:', result.downloadedFiles);
                    this.showDownloadCompleteNotification(result.downloadedFiles.length);
                } else {
                    console.error('媒体文件下载失败:', result.error);
                    this.showToast('媒体文件下载失败: ' + result.error, 'error');
                }
            } else {
                const errorText = await response.text();
                console.error('媒体文件下载请求失败，状态码:', response.status, '错误信息:', errorText);
                this.showToast(`媒体文件下载请求失败: ${response.status} - ${errorText}`, 'error');
            }
        } catch (error) {
            console.error('异步下载媒体文件失败:', error);
            this.showToast('媒体文件下载失败', 'error');
        }
    }

    // 显示Toast提示
    showToast(message, type = 'info') {
        // 创建toast容器（如果不存在）
        let toastContainer = document.getElementById('hanli-toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'hanli-toast-container';
            toastContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
            `;
            document.body.appendChild(toastContainer);
        }
        
        // 创建toast元素
        const toast = document.createElement('div');
        toast.style.cssText = `
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: var(--radius-medium);
            margin-bottom: 10px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            pointer-events: auto;
            max-width: 300px;
            word-wrap: break-word;
        `;
        toast.textContent = message;
        
        // 添加到容器
        toastContainer.appendChild(toast);
        
        // 触发动画
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 10);
        
        // 自动移除
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // 显示下载完成通知
    showDownloadCompleteNotification(fileCount) {
        console.log(`媒体文件下载完成，共下载 ${fileCount} 个文件`);
        this.showToast(`媒体文件下载完成！共下载 ${fileCount} 个文件`, 'success');
    }

    // 显示App打开失败弹窗
    showAppOpenFailedDialog(message) {
        // 创建弹窗遮罩
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10002;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        // 创建弹窗内容
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: white;
            border-radius: var(--radius-large);
            padding: 0;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            overflow: hidden;
        `;

        dialog.innerHTML = `
            <div style="padding: 24px 24px 16px 24px; border-bottom: 1px solid #e0e0e0;">
                <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #333;">
                    打开应用失败
                </h3>
            </div>
            <div style="padding: 16px 24px 24px 24px;">
                <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.5;">
                    ${message}
                </p>
            </div>
            <div style="padding: 0 24px 24px 24px; text-align: right;">
                <button id="hanli-dialog-ok" style="
                    background: #007AFF;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: var(--radius-small);
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.2s;
                " onmouseover="this.style.background='#0056CC'" onmouseout="this.style.background='#007AFF'">
                    好的
                </button>
            </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        // 点击按钮关闭弹窗
        const okButton = dialog.querySelector('#hanli-dialog-ok');
        const closeDialog = () => {
            document.body.removeChild(overlay);
        };

        okButton.addEventListener('click', closeDialog);
        
        // 点击遮罩关闭弹窗
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeDialog();
            }
        });

        // ESC键关闭弹窗
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                closeDialog();
                document.removeEventListener('keydown', handleKeyDown);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
    }

    // 检查App连接状态
    async checkAppConnection() {
        try {
            const response = await fetch('http://localhost:3001/api/health', {
                method: 'GET',
                timeout: 3000
            });
            return response.ok;
        } catch (error) {
            console.error('检查App连接失败:', error);
            return false;
        }
    }

    // 获取采集状态
    getCollectionStatus() {
        return {
            isCollecting: this.isCollecting
        };
    }
}

// 创建全局实例
window.collectionManager = new CollectionManager();

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CollectionManager;
}
