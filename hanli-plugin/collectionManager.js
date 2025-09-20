// 采集管理器 - 统一管理采集流程
class CollectionManager {
    constructor() {
        this.isCollecting = false;
    }

    // 执行完整的采集流程
    async executeCollection(goodsInfoData, monitoringData, mediaData, shouldOpenApp = false, rawData = null) {
        if (this.isCollecting) {
            console.warn('采集正在进行中，请等待完成');
            return;
        }

        this.isCollecting = true;
        
        try {
            console.log('开始执行完整采集流程...');
            
            // 1. 创建文件夹并发送JSON数据
            await this.createFolderAndSaveJson(goodsInfoData, monitoringData, mediaData, rawData);
            
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
    async executeCollectionWithProgress(goodsInfoData, monitoringData, mediaData, shouldOpenApp = false, rawData = null) {
        if (this.isCollecting) {
            console.warn('采集正在进行中，请等待完成');
            return;
        }

        this.isCollecting = true;
        
        try {
            console.log('开始执行带进度跟踪的采集流程...');
            
            // 1. 创建文件夹并发送JSON数据
            await this.createFolderAndSaveJson(goodsInfoData, monitoringData, mediaData, rawData);
            
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
            console.log('=== 开始媒体文件下载流程 ===');
            console.log('商品ID:', goodsId);
            console.log('📄 media-temp.json 中的媒体文件数量:', mediaData.media.length);
            
            // 第一步：筛选符合尺寸要求的图片（最小800x800px）
            console.log('🔍 第一步：筛选符合尺寸要求的图片（最小800x800px）');
            const sizeFilteredMedia = mediaData.media.filter(item => {
                if (item.type === 'image') {
                    const isLargeEnough = item.width >= 800 && item.height >= 800;
                    console.log(`  📷 图片尺寸筛选: ${item.url} - ${item.width}x${item.height} - 符合要求: ${isLargeEnough}`);
                    return isLargeEnough;
                }
                // 视频不进行尺寸筛选
                console.log(`  🎥 视频文件: ${item.url} - 跳过尺寸筛选`);
                return true;
            });
            
            console.log(`📊 尺寸筛选结果: ${mediaData.media.length} → ${sizeFilteredMedia.length} 个文件`);
            
            // 第二步：比较media-temp.json和media.json，获取新增的媒体文件
            console.log('🔍 第二步：比较media-temp.json和media.json，获取新增的媒体文件');
            const finalFilteredMedia = await this.getNewMediaFromComparison(goodsId, sizeFilteredMedia);
            
            console.log(`📊 本地去重结果: ${sizeFilteredMedia.length} → ${finalFilteredMedia.length} 个文件`);
            
            if (finalFilteredMedia.length === 0) {
                console.log('ℹ️ 没有新的媒体文件需要下载');
                return;
            }
            
            // 发送下载请求到App
            console.log('📤 发送媒体文件下载请求到hanli-app...');
            const downloadData = {
                goodsId: goodsId,
                mediaList: finalFilteredMedia
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
                    console.log('✅ 媒体文件下载完成！');
                    console.log('📁 下载的文件列表:');
                    result.downloadedFiles.forEach((file, index) => {
                        console.log(`  ${index + 1}. ${file}`);
                    });
                    
                    // 合并新下载的媒体信息到media.json
                    console.log('🔄 合并媒体信息到media.json...');
                    await this.mergeDownloadedMedia(goodsId, result.downloadedFiles);
                    
                    // 更新进度：所有媒体文件下载完成
                    if (window.collectionProgressDialog) {
                        window.collectionProgressDialog.updateProgress(finalFilteredMedia.length + 1); // +1 for JSON
                    }
                    
                    console.log('📊 媒体文件下载统计:');
                    console.log(`  📄 media-temp.json: ${mediaData.media.length} 个文件`);
                    console.log(`  📄 media.json: 新增 ${result.downloadedFiles.length} 个文件`);
                    console.log(`  ✅ 下载完成: ${result.downloadedFiles.length} 个文件`);
                    
                    this.showDownloadCompleteNotification(result.downloadedFiles.length);
                } else {
                    console.error('❌ 媒体文件下载失败:', result.error);
                    this.showToast('媒体文件下载失败: ' + result.error, 'error');
                }
            } else {
                const errorText = await response.text();
                console.error('❌ 媒体文件下载请求失败，状态码:', response.status, '错误信息:', errorText);
                this.showToast(`媒体文件下载请求失败: ${response.status} - ${errorText}`, 'error');
            }
        } catch (error) {
            console.error('❌ 带进度跟踪的媒体文件下载失败:', error);
            this.showToast('媒体文件下载失败', 'error');
        }
    }

    // 创建文件夹并保存JSON数据
    async createFolderAndSaveJson(goodsInfoData, monitoringData, mediaData, rawData = null) {
        try {
            // 根据传入的参数判断操作类型
            const isFirstSave = goodsInfoData && monitoringData && rawData;
            const isMediaUpdate = !goodsInfoData && !monitoringData && !rawData && mediaData;
            
            if (isFirstSave) {
                console.log('=== 开始创建文件夹并保存JSON数据 ===');
            } else if (isMediaUpdate) {
                console.log('=== 更新media-temp.json ===');
            } else {
                console.log('=== 保存JSON数据 ===');
            }
            
            const goodsId = goodsInfoData?.goodsId || mediaData?.goodsId;
            const collectTime = goodsInfoData?.collectTime || new Date().toISOString();
            
            console.log('商品ID:', goodsId);
            console.log('采集时间:', collectTime);
            
            // 准备JSON数据
            const jsonData = {
                goodsId: goodsId,
                collectTime: collectTime,
                goodsInfo: goodsInfoData ? JSON.stringify(goodsInfoData, null, 2) : null,
                monitoring: monitoringData ? JSON.stringify(monitoringData, null, 2) : null,
                mediaData: mediaData ? JSON.stringify(mediaData, null, 2) : null,
                rawData: rawData ? JSON.stringify(rawData, null, 2) : null,
                useTempFile: true // 标记使用临时文件
            };
            
            // 打印各个文件的数据大小
            console.log('📄 rawData.json 数据大小:', rawData ? JSON.stringify(rawData).length : 0, '字符');
            console.log('📄 product.json (goodsInfo) 数据大小:', goodsInfoData ? JSON.stringify(goodsInfoData).length : 0, '字符');
            console.log('📄 monitoring.json 数据大小:', monitoringData ? JSON.stringify(monitoringData).length : 0, '字符');
            console.log('📄 media-temp.json 数据大小:', mediaData ? JSON.stringify(mediaData).length : 0, '字符');
            
            console.log('正在发送JSON数据到hanli-app...');
            
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
                    console.log('✅ JSON数据已成功保存到hanli-app的data文件夹');
                    console.log('📁 保存的文件列表:');
                    
                    // 详细打印每个保存的文件
                    if (result.files) {
                        result.files.forEach(file => {
                            console.log(`  📄 ${file}`);
                        });
                    }
                    
                    // 打印各个JSON文件的保存状态
                    console.log('📊 文件保存状态:');
                    if (rawData) console.log('  ✅ rawData.json - 原始数据已保存');
                    if (goodsInfoData) console.log('  ✅ product.json (goodsInfo) - 商品信息已保存');
                    if (monitoringData) console.log('  ✅ monitoring.json - 监控数据已保存');
                    if (mediaData) console.log('  ✅ media-temp.json - 媒体数据已保存');
                    
                    // 显示Toast提示
                    this.showToast('JSON文件保存完成！', 'success');
                    
                } else {
                    throw new Error('保存JSON数据失败: ' + result.error);
                }
            } else {
                const errorText = await response.text();
                throw new Error(`无法连接到hanli-app，状态码: ${response.status}。错误信息: ${errorText}。请确保Hanli应用已启动`);
            }
        } catch (error) {
            console.error('❌ 创建文件夹并保存JSON失败:', error);
            this.showToast('JSON文件保存失败: ' + error.message, 'error');
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
            
            // 第一步：筛选符合尺寸要求的图片（最小800x800px）
            const sizeFilteredMedia = mediaData.media.filter(item => {
                if (item.type === 'image') {
                    const isLargeEnough = item.width >= 800 && item.height >= 800;
                    console.log(`图片尺寸筛选: ${item.url} - ${item.width}x${item.height} - 符合要求: ${isLargeEnough}`);
                    return isLargeEnough;
                }
                // 视频不进行尺寸筛选
                return true;
            });
            
            console.log(`尺寸筛选前媒体数量: ${mediaData.media.length}, 尺寸筛选后: ${sizeFilteredMedia.length}`);
            
            // 第二步：检查本地已存在的媒体文件，避免重复下载
            const finalFilteredMedia = await this.filterExistingMedia(goodsInfoData.goodsId, sizeFilteredMedia);
            
            console.log(`本地去重前媒体数量: ${sizeFilteredMedia.length}, 本地去重后: ${finalFilteredMedia.length}`);
            
            // 发送下载请求到App
            const downloadData = {
                goodsId: goodsInfoData.goodsId,
                mediaList: finalFilteredMedia
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

    // 检查本地已存在的媒体文件，避免重复下载
    async filterExistingMedia(goodsId, mediaList) {
        try {
            console.log(`开始检查商品 ${goodsId} 的本地媒体文件...`);
            
            // 调用App API检查本地media.json文件
            const response = await fetch('http://localhost:3001/api/check-existing-media', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    goodsId: goodsId,
                    mediaUrls: mediaList.map(item => item.url)
                })
            });
            
            if (!response.ok) {
                console.warn('检查本地媒体文件失败，将下载所有媒体文件');
                return mediaList;
            }
            
            const result = await response.json();
            if (!result.success) {
                console.warn('检查本地媒体文件失败:', result.error);
                return mediaList;
            }
            
            const existingUrls = new Set(result.existingUrls || []);
            console.log(`本地已存在的媒体文件数量: ${existingUrls.size}`);
            console.log('已存在的URLs:', Array.from(existingUrls));
            
            // 筛选出不存在的媒体文件
            const filteredMedia = mediaList.filter(item => {
                const urlExists = existingUrls.has(item.url);
                if (urlExists) {
                    console.log(`跳过已存在的媒体文件: ${item.url}`);
                }
                return !urlExists;
            });
            
            const skippedCount = mediaList.length - filteredMedia.length;
            if (skippedCount > 0) {
                this.showToast(`跳过 ${skippedCount} 个已存在的媒体文件`, 'info');
            }
            
            return filteredMedia;
            
        } catch (error) {
            console.error('检查本地媒体文件时出错:', error);
            // 出错时返回原始列表，继续下载
            return mediaList;
        }
    }

    // 通过比较media-temp.json和media.json获取新增的媒体文件
    async getNewMediaFromComparison(goodsId, mediaList) {
        try {
            console.log(`开始比较商品 ${goodsId} 的媒体文件...`);
            
            // 调用App API比较媒体文件
            const response = await fetch('http://localhost:3001/api/compare-media-files', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    goodsId: goodsId
                })
            });
            
            if (!response.ok) {
                console.warn('比较媒体文件失败，将下载所有媒体文件');
                return mediaList;
            }
            
            const result = await response.json();
            if (!result.success) {
                console.warn('比较媒体文件失败:', result.error);
                return mediaList;
            }
            
            const newUrls = new Set(result.newUrls || []);
            console.log(`新增的媒体文件数量: ${newUrls.size}`);
            console.log('新增的URLs:', Array.from(newUrls));
            
            // 筛选出新增的媒体文件
            const filteredMedia = mediaList.filter(item => {
                const isNew = newUrls.has(item.url);
                if (!isNew) {
                    console.log(`跳过已存在的媒体文件: ${item.url}`);
                }
                return isNew;
            });
            
            const skippedCount = mediaList.length - filteredMedia.length;
            if (skippedCount > 0) {
                this.showToast(`跳过 ${skippedCount} 个已存在的媒体文件`, 'info');
            }
            
            return filteredMedia;
            
        } catch (error) {
            console.error('比较媒体文件时出错:', error);
            return mediaList;
        }
    }

    // 合并新下载的媒体信息到media.json
    async mergeDownloadedMedia(goodsId, downloadedFiles) {
        try {
            console.log('=== 开始合并媒体信息到media.json ===');
            console.log('商品ID:', goodsId);
            console.log('📁 待合并的下载文件数量:', downloadedFiles.length);
            console.log('📄 下载文件列表:');
            downloadedFiles.forEach((file, index) => {
                console.log(`  ${index + 1}. ${file}`);
            });
            
            // 调用App API合并媒体文件
            console.log('📤 发送合并请求到hanli-app...');
            const response = await fetch('http://localhost:3001/api/merge-media-files', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    goodsId: goodsId,
                    downloadedMedia: downloadedFiles
                })
            });
            
            if (!response.ok) {
                console.warn('❌ 合并媒体文件失败，状态码:', response.status);
                return;
            }
            
            const result = await response.json();
            if (result.success) {
                console.log('✅ 媒体文件合并完成！');
                console.log('📊 合并统计:');
                console.log(`  📄 media.json: 新增 ${result.mergedCount} 个文件`);
                console.log(`  📄 media.json: 总计 ${result.totalCount} 个文件`);
                console.log('  ✅ 合并完成: 所有媒体信息已更新到media.json');
                
                this.showToast(`媒体文件合并完成: 新增 ${result.mergedCount} 个`, 'success');
            } else {
                console.error('❌ 合并媒体文件失败:', result.error);
                this.showToast('合并媒体文件失败: ' + result.error, 'error');
            }
            
        } catch (error) {
            console.error('❌ 合并媒体文件时出错:', error);
            this.showToast('合并媒体文件失败', 'error');
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
