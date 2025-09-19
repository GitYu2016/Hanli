/**
 * AttachmentCard 组件
 * 负责显示和管理产品附件
 */
class AttachmentCard {
    constructor() {
        this.attachments = [];
        this.goodsId = null;
    }

    /**
     * 初始化附件卡片
     * @param {string} goodsId - 产品ID
     * @param {HTMLElement} container - 容器元素
     */
    async init(goodsId, container) {
        this.goodsId = goodsId;
        this.container = container;
        
        // 显示加载状态
        this.showLoading();
        
        try {
            await this.loadAttachments();
        } catch (error) {
            console.error('加载附件失败:', error);
            this.showError();
        }
    }

    /**
     * 加载附件列表
     */
    async loadAttachments() {
        if (!this.goodsId) {
            this.showError();
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/products/${this.goodsId}/attachments`);
            const data = await response.json();
            
            if (data.success && data.attachments) {
                this.attachments = data.attachments;
                this.render();
            } else {
                this.showEmpty();
            }
        } catch (error) {
            console.error('获取附件列表失败:', error);
            this.showError();
        }
    }

    /**
     * 渲染附件列表
     */
    render() {
        if (!this.container) return;

        if (this.attachments.length === 0) {
            this.showEmpty();
            return;
        }

        const html = this.renderAttachmentsList(this.attachments);
        this.container.innerHTML = html;
    }

    /**
     * 渲染附件列表HTML
     * @param {Array} attachments - 附件列表
     * @returns {string} HTML字符串
     */
    renderAttachmentsList(attachments) {
        let html = '<div class="attachments-list">';
        
        attachments.forEach(attachment => {
            const sizeText = this.formatFileSize(attachment.size);
            const modifiedText = this.formatDate(attachment.modified);
            const iconClass = attachment.name.endsWith('.json') ? 'ph-file-json' : 'ph-file-pdf';
            
            html += `
                <div class="attachment-item" 
                     oncontextmenu="attachmentCardInstance.showContextMenu(event, '${attachment.name}', '${attachment.path || ''}')"
                     data-file-name="${attachment.name}"
                     data-file-path="${attachment.path || ''}">
                    <div class="attachment-icon">
                        <i class="ph ${iconClass}"></i>
                    </div>
                    <div class="attachment-info">
                        <div class="attachment-name">${attachment.name}</div>
                        <div class="attachment-meta">
                            <span class="attachment-type">${attachment.type}</span>
                            <span class="attachment-separator">•</span>
                            <span class="attachment-size">${sizeText}</span>
                            <span class="attachment-separator">•</span>
                            <span class="attachment-date">${modifiedText}</span>
                        </div>
                    </div>
                    <div class="attachment-actions">
                        ${attachment.name.endsWith('.json') ? `
                        <button class="attachment-btn" onclick="attachmentCardInstance.viewJsonFile('${attachment.name}', '${this.goodsId}')" title="查看">
                            <i class="ph ph-eye"></i>
                        </button>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    /**
     * 显示加载状态
     */
    showLoading() {
        if (!this.container) return;
        this.container.innerHTML = '<div class="loading-attachments">正在加载附件...</div>';
    }

    /**
     * 显示空状态
     */
    showEmpty() {
        if (!this.container) return;
        this.container.innerHTML = '<div class="no-attachments">暂无附件</div>';
    }

    /**
     * 显示错误状态
     */
    showError() {
        if (!this.container) return;
        this.container.innerHTML = '<div class="error-attachments">加载附件失败</div>';
    }


    /**
     * 查看JSON文件
     * @param {string} fileName - 文件名
     * @param {string} goodsId - 产品ID（可选，如果未提供则使用实例的goodsId）
     */
    async viewJsonFile(fileName, goodsId = null) {
        const productId = goodsId || this.goodsId;
        if (!productId) {
            console.error('产品ID未提供');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/products/${productId}/file/${encodeURIComponent(fileName)}`);
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.showJsonModal(fileName, data.content);
                } else {
                    console.error('查看文件失败:', data.error);
                }
            } else {
                console.error('查看文件失败');
            }
        } catch (error) {
            console.error('查看JSON文件失败:', error);
        }
    }

    /**
     * 显示JSON查看模态框
     * @param {string} fileName - 文件名
     * @param {string} jsonText - JSON内容
     */
    showJsonModal(fileName, jsonText) {
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'json-modal-overlay';
        modal.innerHTML = `
            <div class="json-modal">
                <div class="json-modal-header">
                    <h3>${fileName}</h3>
                    <button class="json-modal-close" onclick="this.closest('.json-modal-overlay').remove()">
                        <i class="ph ph-x"></i>
                    </button>
                </div>
                <div class="json-modal-content">
                    <pre><code>${this.formatJson(jsonText)}</code></pre>
                </div>
                <div class="json-modal-footer">
                    <button class="btn btn-secondary" onclick="attachmentCardInstance.copyJson('${fileName}', '${this.goodsId}')">
                        <i class="ph ph-copy"></i> 复制
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * 格式化JSON文本
     * @param {string} jsonText - 原始JSON文本
     * @returns {string} 格式化后的JSON文本
     */
    formatJson(jsonText) {
        try {
            const obj = JSON.parse(jsonText);
            return JSON.stringify(obj, null, 2);
        } catch (error) {
            return jsonText;
        }
    }

    /**
     * 复制JSON内容
     * @param {string} fileName - 文件名
     * @param {string} goodsId - 产品ID（可选，如果未提供则使用实例的goodsId）
     */
    async copyJson(fileName, goodsId = null) {
        const productId = goodsId || this.goodsId;
        if (!productId) {
            console.error('产品ID未提供');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/products/${productId}/file/${encodeURIComponent(fileName)}`);
            const data = await response.json();
            
            if (data.success) {
                const formattedJson = this.formatJson(data.content);
                await navigator.clipboard.writeText(formattedJson);
                
                // 可以添加toast通知
                console.log('JSON内容已复制到剪贴板');
            } else {
                console.error('复制JSON失败:', data.error);
            }
        } catch (error) {
            console.error('复制JSON失败:', error);
        }
    }

    /**
     * 显示右键菜单
     * @param {Event} event - 右键事件
     * @param {string} fileName - 文件名
     * @param {string} filePath - 文件路径
     */
    showContextMenu(event, fileName, filePath) {
        event.preventDefault();
        
        // 移除现有的右键菜单
        this.hideContextMenu();
        
        // 创建右键菜单
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.id = 'attachment-context-menu';
        
        // 根据平台显示不同的文本
        const platform = navigator.platform.toLowerCase();
        const showInFinderText = platform.includes('mac') ? '在 Finder 中显示' : '在文件夹中显示';
        
        contextMenu.innerHTML = `
            <div class="context-menu-item" onclick="attachmentCardInstance.showInFinder('${fileName}', '${filePath}')">
                <span>${showInFinderText}</span>
            </div>
            <div class="context-menu-item" onclick="attachmentCardInstance.saveAs('${fileName}', '${filePath}')">
                <span>另存为</span>
            </div>
        `;
        
        // 设置菜单位置
        contextMenu.style.position = 'fixed';
        contextMenu.style.left = event.clientX + 'px';
        contextMenu.style.top = event.clientY + 'px';
        contextMenu.style.zIndex = '10000';
        
        // 添加到页面
        document.body.appendChild(contextMenu);
        
        // 点击其他地方隐藏菜单
        setTimeout(() => {
            document.addEventListener('click', this.hideContextMenu.bind(this), { once: true });
        }, 0);
    }

    /**
     * 隐藏右键菜单
     */
    hideContextMenu() {
        const contextMenu = document.getElementById('attachment-context-menu');
        if (contextMenu) {
            contextMenu.remove();
        }
    }

    /**
     * 在 Finder/文件夹中显示文件
     * @param {string} fileName - 文件名
     * @param {string} filePath - 文件路径
     */
    async showInFinder(fileName, filePath) {
        try {
            // 如果没有文件路径，尝试构建路径
            let fullPath = filePath;
            if (!fullPath && this.goodsId) {
                // 构建相对路径，主进程会处理转换为绝对路径
                fullPath = `hanli-app/data/goods-library/${this.goodsId}/${fileName}`;
            }
            
            if (!fullPath) {
                console.error('无法确定文件路径');
                return;
            }
            
            console.log('准备显示文件:', fullPath);
            
            // 调用 Electron API
            const result = await window.electronAPI.fileAPI.showInFinder(fullPath);
            
            if (result.success) {
                console.log('文件已在 Finder/文件夹中显示');
            } else {
                console.error('显示文件失败:', result.error);
            }
        } catch (error) {
            console.error('显示文件在 Finder 中失败:', error);
        } finally {
            // 隐藏右键菜单
            this.hideContextMenu();
        }
    }

    /**
     * 另存为文件
     * @param {string} fileName - 文件名
     * @param {string} filePath - 文件路径
     */
    async saveAs(fileName, filePath) {
        try {
            // 如果没有文件路径，尝试构建路径
            let fullPath = filePath;
            if (!fullPath && this.goodsId) {
                // 构建文件路径
                fullPath = `hanli-app/data/goods-library/${this.goodsId}/${fileName}`;
            }
            
            if (!fullPath) {
                console.error('无法确定文件路径');
                return;
            }
            
            // 调用 Electron API 另存为
            const result = await window.electronAPI.fileAPI.saveAs(fullPath, fileName);
            
            if (result.success) {
                console.log('文件另存为成功');
            } else {
                console.error('另存为失败:', result.error);
            }
        } catch (error) {
            console.error('另存为失败:', error);
        } finally {
            // 隐藏右键菜单
            this.hideContextMenu();
        }
    }

    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     * @returns {string} 格式化后的大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    /**
     * 格式化日期
     * @param {Date|string} date - 日期
     * @returns {string} 格式化后的日期
     */
    formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * 刷新附件列表
     */
    async refresh() {
        await this.loadAttachments();
    }

    /**
     * 销毁组件
     */
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.attachments = [];
        this.goodsId = null;
        this.container = null;
    }
}

// 创建全局实例
const attachmentCardInstance = new AttachmentCard();
