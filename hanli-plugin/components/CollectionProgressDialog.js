// 采集进度对话框组件
class CollectionProgressDialog {
    constructor() {
        this.dialog = null;
        this.isVisible = false;
        this.totalFiles = 0;
        this.completedFiles = 0;
        this.currentGoodsId = null;
        this.keydownHandler = null;
        this.fileTypes = {
            json: 0,
            images: 0,
            videos: 0
        };
        this.completedFileTypes = {
            json: 0,
            images: 0,
            videos: 0
        };
    }

    // 显示进度对话框
    show(goodsId, totalFiles = 0) {
        if (this.isVisible) {
            this.updateProgress(0, totalFiles);
            return;
        }

        this.currentGoodsId = goodsId;
        this.totalFiles = totalFiles;
        this.completedFiles = 0;
        this.resetFileTypes();

        this.createDialog();
        this.isVisible = true;
        
        // 在采集开始时就启用"打开App"按钮
        this.enableOpenAppButton();
    }

    // 隐藏进度对话框
    hide() {
        if (this.dialog && this.dialog.parentNode) {
            this.dialog.parentNode.removeChild(this.dialog);
        }
        
        // 清理事件监听器
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
            this.keydownHandler = null;
        }
        
        this.dialog = null;
        this.isVisible = false;
    }

    // 更新进度
    updateProgress(completed, total = null) {
        if (total !== null) {
            this.totalFiles = total;
        }
        this.completedFiles = completed;

        if (this.dialog) {
            const progressText = this.dialog.querySelector('#progress-text');
            const progressBar = this.dialog.querySelector('#progress-bar');

            if (progressText) {
                progressText.textContent = `${completed}/${this.totalFiles}`;
            }

            if (progressBar) {
                const percentage = this.totalFiles > 0 ? (completed / this.totalFiles) * 100 : 0;
                progressBar.style.width = `${percentage}%`;
            }
        }
    }

    // 更新文件类型进度
    updateFileTypeProgress(type, completed, total) {
        this.fileTypes[type] = total;
        this.completedFileTypes[type] = completed;

        if (this.dialog) {
            const typeElement = this.dialog.querySelector(`#${type}-progress`);
            if (typeElement) {
                typeElement.textContent = `${type.toUpperCase()}: ${completed}/${total}`;
            }
        }
    }

    // 启用打开App按钮
    enableOpenAppButton() {
        if (this.dialog) {
            const openAppBtn = this.dialog.querySelector('#open-app-btn');
            if (openAppBtn) {
                openAppBtn.textContent = '打开App';
                openAppBtn.disabled = false;
                openAppBtn.style.background = '#4a9eff';
                openAppBtn.style.cursor = 'pointer';
                
                // 绑定事件监听器
                this.bindOpenAppEvent(openAppBtn);
            }
        }
    }

    // 显示采集完成
    showComplete() {
        if (this.dialog) {
            const progressText = this.dialog.querySelector('#progress-text');
            const openAppBtn = this.dialog.querySelector('#open-app-btn');

            if (progressText) {
                progressText.textContent = `采集完成！共处理 ${this.completedFiles} 个文件`;
            }

            if (openAppBtn) {
                // 确保按钮保持可点击状态
                openAppBtn.textContent = '打开App';
                openAppBtn.disabled = false;
                openAppBtn.style.background = '#4a9eff';
                openAppBtn.style.cursor = 'pointer';
                
                // 重新绑定事件监听器，确保按钮可以点击
                this.bindOpenAppEvent(openAppBtn);
            }

            // 隐藏进度条
            const progressContainer = this.dialog.querySelector('#progress-container');
            if (progressContainer) {
                progressContainer.style.display = 'none';
            }
        }
    }

    // 创建对话框
    createDialog() {
        // 创建对话框容器（无遮罩）
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10002;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        // 创建对话框内容
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: #2d2d2d;
            border-radius: var(--radius-large);
            padding: 0;
            max-width: 400px;
            width: 90vw;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
            overflow: hidden;
            color: #ffffff;
            border: 1px solid #444;
        `;

        dialog.innerHTML = `
            <div style="padding: 16px 20px;">
                <div id="progress-container" style="margin-bottom: 16px;">
                    <div style="background: #444; height: 6px; border-radius: 3px; overflow: hidden;">
                        <div id="progress-bar" style="background: #4a9eff; height: 100%; width: 0%; transition: width 0.3s ease;"></div>
                    </div>
                </div>
                <div id="progress-text" style="text-align: center; font-size: 14px; color: #cccccc; margin-bottom: 16px;">
                    0/${this.totalFiles}
                </div>

                <div style="margin-bottom: 16px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                    <div id="json-progress" style="font-size: 11px; color: #888; flex: 1; min-width: 80px;">
                        JSON: 0/0
                    </div>
                    <div id="images-progress" style="font-size: 11px; color: #888; flex: 1; min-width: 80px;">
                        IMAGES: 0/0
                    </div>
                    <div id="videos-progress" style="font-size: 11px; color: #888; flex: 1; min-width: 80px;">
                        VIDEOS: 0/0
                    </div>
                </div>

                <div style="display: flex; gap: 8px; justify-content: center;">
                    <button id="cancel-btn" style="
                        padding: 6px 12px;
                        background: transparent;
                        border: 1px solid #555;
                        border-radius: var(--radius-small);
                        color: #ffffff;
                        cursor: pointer;
                        font-size: 12px;
                        transition: all 0.2s ease;
                    " onmouseover="this.style.background='#444'" onmouseout="this.style.background='transparent'">
                        关闭
                    </button>
                    <button id="open-app-btn" style="
                        padding: 6px 12px;
                        background: #4a9eff;
                        border: none;
                        border-radius: var(--radius-small);
                        color: #ffffff;
                        cursor: pointer;
                        font-size: 12px;
                        font-weight: 500;
                        transition: all 0.2s ease;
                    ">
                        打开App
                    </button>
                </div>
            </div>
        `;

        container.appendChild(dialog);
        document.body.appendChild(container);

        this.dialog = container;

        // 绑定事件
        this.bindEvents();
    }

    // 绑定事件
    bindEvents() {
        if (!this.dialog) return;

        // 取消按钮
        const cancelBtn = this.dialog.querySelector('#cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hide();
                // 触发取消采集事件
                window.dispatchEvent(new CustomEvent('hanliCollectionCancelled'));
            });
        }

        // 打开App按钮
        const openAppBtn = this.dialog.querySelector('#open-app-btn');
        if (openAppBtn) {
            this.bindOpenAppEvent(openAppBtn);
        }

        // ESC键关闭（仅在采集完成时）
        this.keydownHandler = (e) => {
            if (e.key === 'Escape') {
                try {
                    if (this.dialog && this.dialog.querySelector) {
                        const openAppBtn = this.dialog.querySelector('#open-app-btn');
                        if (openAppBtn && !openAppBtn.disabled) {
                            this.hide();
                        }
                    }
                } catch (error) {
                    console.warn('处理ESC键事件时出错:', error);
                    // 如果出错，移除事件监听器
                    if (this.keydownHandler) {
                        document.removeEventListener('keydown', this.keydownHandler);
                        this.keydownHandler = null;
                    }
                }
            }
        };
        document.addEventListener('keydown', this.keydownHandler);
    }

    // 绑定打开App按钮事件
    bindOpenAppEvent(openAppBtn) {
        if (!openAppBtn) return;
        
        // 移除之前的事件监听器（如果有的话）
        const newOpenAppBtn = openAppBtn.cloneNode(true);
        openAppBtn.parentNode.replaceChild(newOpenAppBtn, openAppBtn);
        
        // 添加点击事件监听器
        newOpenAppBtn.addEventListener('click', () => {
            console.log('打开App按钮被点击');
            this.handleOpenAppClick();
        });
        
        // 添加鼠标悬停效果
        newOpenAppBtn.addEventListener('mouseenter', () => {
            if (!newOpenAppBtn.disabled) {
                newOpenAppBtn.style.background = '#3a8eef';
            }
        });
        
        newOpenAppBtn.addEventListener('mouseleave', () => {
            if (!newOpenAppBtn.disabled) {
                newOpenAppBtn.style.background = '#4a9eff';
            }
        });
    }
    
    // 处理打开App按钮点击
    async handleOpenAppClick() {
        // 检查是否是第一次点击
        const hasClickedBefore = localStorage.getItem('hanli_has_clicked_open_app');
        
        if (!hasClickedBefore) {
            // 第一次点击，显示浮窗提示
            const shouldAutoOpen = await this.showAutoOpenDialog();
            if (shouldAutoOpen !== null) {
                // 保存用户选择
                chrome.storage.sync.set({ autoOpenApp: shouldAutoOpen });
                localStorage.setItem('hanli_has_clicked_open_app', 'true');
            }
        }
        
        // 执行打开App
        this.openApp();
    }
    
    // 显示自动打开App的浮窗提示
    showAutoOpenDialog() {
        return new Promise((resolve) => {
            // 创建浮窗遮罩
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 10003;
                display: flex;
                align-items: center;
                justify-content: center;
            `;

            // 创建浮窗内容
            const dialog = document.createElement('div');
            dialog.style.cssText = `
                background: #2d2d2d;
                border-radius: var(--radius-large);
                padding: 0;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                overflow: hidden;
            `;

            dialog.innerHTML = `
                <div style="padding: 24px 24px 16px 24px; border-bottom: 1px solid #444;">
                    <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #ffffff;">
                        是否每次采集自动打开App
                    </h3>
                </div>
                <div style="padding: 16px 24px 24px 24px;">
                    <p style="margin: 0; font-size: 14px; color: #cccccc; line-height: 1.5;">
                        开启后，每次采集完成会自动打开Hanli客户端，无需手动点击。
                    </p>
                </div>
                <div style="padding: 0 24px 24px 24px; display: flex; gap: 12px; justify-content: flex-end;">
                    <button id="hanli-dialog-no" style="
                        background: transparent;
                        color: #cccccc;
                        border: 1px solid #555;
                        padding: 8px 16px;
                        border-radius: var(--radius-small);
                        font-size: 14px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='#444'" onmouseout="this.style.background='transparent'">
                        否
                    </button>
                    <button id="hanli-dialog-yes" style="
                        background: #4a9eff;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: var(--radius-small);
                        font-size: 14px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='#3a8eef'" onmouseout="this.style.background='#4a9eff'">
                        是
                    </button>
                </div>
            `;

            overlay.appendChild(dialog);
            document.body.appendChild(overlay);

            // 绑定按钮事件
            const noButton = dialog.querySelector('#hanli-dialog-no');
            const yesButton = dialog.querySelector('#hanli-dialog-yes');
            
            const closeDialog = (result) => {
                document.body.removeChild(overlay);
                resolve(result);
            };

            noButton.addEventListener('click', () => closeDialog(false));
            yesButton.addEventListener('click', () => closeDialog(true));
            
            // 点击遮罩关闭（返回null表示取消）
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    closeDialog(null);
                }
            });

            // ESC键关闭
            const handleKeyDown = (e) => {
                if (e.key === 'Escape') {
                    closeDialog(null);
                    document.removeEventListener('keydown', handleKeyDown);
                }
            };
            document.addEventListener('keydown', handleKeyDown);
        });
    }

    // 打开App
    openApp() {
        if (!this.currentGoodsId) return;

        try {
            console.log('正在打开App，商品ID:', this.currentGoodsId);
            
            // 创建隐藏的iframe来触发协议
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = `hanliapp://open?goodsId=${encodeURIComponent(this.currentGoodsId)}`;
            
            document.body.appendChild(iframe);
            
            // 立即移除iframe
            setTimeout(() => {
                if (iframe.parentNode) {
                    iframe.parentNode.removeChild(iframe);
                }
            }, 100);
            
            // 显示成功提示，但不关闭进度弹窗
            this.showToast('正在打开Hanli客户端...', 'success');
            
        } catch (error) {
            console.error('打开App失败:', error);
            this.showToast('打开App失败，请确保Hanli应用已安装并正在运行', 'error');
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
                z-index: 10003;
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

    // 重置文件类型计数
    resetFileTypes() {
        this.fileTypes = {
            json: 0,
            images: 0,
            videos: 0
        };
        this.completedFileTypes = {
            json: 0,
            images: 0,
            videos: 0
        };
    }
}

// 创建全局实例
window.collectionProgressDialog = new CollectionProgressDialog();

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CollectionProgressDialog;
}
