/**
 * AttachmentCard 组件
 * 负责显示和管理产品附件
 */
class AttachmentCard {
    constructor() {
        this.attachments = [];
        this.goodsId = null;
        this.stylesInjected = false;
    }

    /**
     * 注入组件样式
     */
    injectStyles() {
        if (this.stylesInjected) return;

        const styleId = 'attachment-card-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* 附件列表样式 */
            .attachments-card {
                margin-bottom: 16px;
            }

            .attachments-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .attachment-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                transition: all 0.2s ease;
            }

            .attachment-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                border-radius: var(--radius-small);
                background-color: var(--color-background-focused);
                flex-shrink: 0;
            }

            .attachment-icon i {
                font-size: 16px;
                color: var(--color-info);
            }

            .attachment-info {
                flex: 1;
                min-width: 0;
            }

            .attachment-name {
                font-size: 14px;
                font-weight: 500;
                color: var(--color-text-primary);
                margin-bottom: 4px;
                word-break: break-all;
            }

            .attachment-meta {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 12px;
                color: var(--color-text-secondary);
                flex-wrap: wrap;
            }

            .attachment-type {
                color: var(--color-info);
                font-weight: 500;
            }

            .attachment-separator {
                opacity: 0.5;
            }

            .attachment-size,
            .attachment-date {
                color: var(--color-text-secondary);
            }

            .attachment-actions {
                display: flex;
                gap: 8px;
                flex-shrink: 0;
            }

            .attachment-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                border: none;
                background: none;
                color: var(--color-text-secondary);
                cursor: pointer;
                border-radius: var(--radius-small);
                transition: all 0.2s ease;
            }

            .attachment-btn:hover {
                background-color: var(--color-background-focused);
                color: var(--color-info);
            }

            .attachment-btn i {
                font-size: 14px;
            }

            .loading-attachments,
            .no-attachments,
            .error-attachments {
                text-align: center;
                padding: 24px;
                color: var(--color-text-secondary);
                font-size: 14px;
            }

            .error-attachments {
                color: var(--color-destructive);
            }

            /* JSON 模态框样式 */
            .json-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: var(--color-overlay);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }

            .json-modal {
                background-color: var(--color-modal-background);
                border-radius: var(--radius-card);
                box-shadow: var(--shadow-large);
                width: 80%;
                max-width: 800px;
                max-height: 80vh;
                display: flex;
                flex-direction: column;
            }

            .json-modal-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 20px;
            }

            .json-modal-header h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                color: var(--color-text-primary);
            }

            .json-modal-close {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                border: none;
                background: none;
                color: var(--color-text-secondary);
                cursor: pointer;
                border-radius: var(--radius-small);
                transition: all 0.2s ease;
            }

            .json-modal-close:hover {
                background-color: var(--color-background-focused);
                color: var(--color-text-primary);
            }

            .json-modal-content {
                flex: 1;
                overflow: auto;
                padding: 20px;
            }

            .json-modal-content pre {
                margin: 0;
                padding: 16px;
                background-color: var(--color-background-focused);
                border-radius: var(--radius-small);
                overflow: auto;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 12px;
                line-height: 1.5;
                color: var(--color-text-primary);
            }

            .json-modal-footer {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 12px;
                padding: 16px 20px;
            }

            /* 右键菜单样式 */
            .context-menu {
                position: fixed;
                background-color: var(--color-modal-background);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-small);
                box-shadow: var(--shadow-medium);
                padding: 4px 0;
                min-width: 160px;
                z-index: 10000;
            }

            .context-menu-item {
                padding: 8px 16px;
                cursor: pointer;
                font-size: 14px;
                color: var(--color-text-primary);
                transition: background-color 0.2s ease;
            }

            .context-menu-item:hover {
                background-color: var(--color-background-focused);
            }
        `;

        document.head.appendChild(style);
        this.stylesInjected = true;
    }

    /**
     * 初始化附件卡片
     * @param {string} goodsId - 产品ID
     * @param {HTMLElement} container - 容器元素
     */
    async init(goodsId, container) {
        this.goodsId = goodsId;
        this.container = container;
        
        // 注入组件样式
        this.injectStyles();
        
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
                        <div class="svg-icon" data-icon="${iconClass.replace('ph-', '')}" data-filled="false"></div>
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
                            <div class="svg-icon" data-icon="eye" data-filled="false"></div>
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
                    <button class="json-modal-close" title="关闭">
                        <div class="svg-icon" data-icon="x" data-filled="false"></div>
                    </button>
                </div>
                <div class="json-modal-content">
                    <pre><code>${this.formatJson(jsonText)}</code></pre>
                </div>
                <div class="json-modal-footer" id="json-modal-footer">
                    <!-- 按钮将通过JavaScript动态创建 -->
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 创建复制按钮
        const footer = modal.querySelector('#json-modal-footer');
        if (footer) {
            if (window.mPrimaryButtonInstance) {
                const copyButton = window.mPrimaryButtonInstance.create({
                    text: '复制',
                    icon: 'ph-copy',
                    onClick: () => this.copyJson(fileName, this.goodsId)
                });
                footer.appendChild(copyButton);
            } else {
                // 降级处理：如果MPrimaryButton不可用，使用普通按钮
                console.warn('MPrimaryButton组件未加载，使用降级按钮');
                const fallbackButton = document.createElement('button');
                fallbackButton.className = 'btn btn-secondary';
                fallbackButton.innerHTML = '<div class="svg-icon" data-icon="copy" data-filled="false"></div> 复制';
                fallbackButton.onclick = () => this.copyJson(fileName, this.goodsId);
                footer.appendChild(fallbackButton);
            }
        }

        // 添加关闭事件监听器
        const closeButton = modal.querySelector('.json-modal-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.closeJsonModal(modal));
        }

        // 点击遮罩层关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeJsonModal(modal);
            }
        });

        // ESC键关闭
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                this.closeJsonModal(modal);
                document.removeEventListener('keydown', handleKeyDown);
            }
        };
        document.addEventListener('keydown', handleKeyDown);

        // 存储模态框引用以便后续关闭
        this.currentJsonModal = modal;
    }

    /**
     * 关闭JSON模态框
     * @param {HTMLElement} modal - 模态框元素
     */
    closeJsonModal(modal) {
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
        this.currentJsonModal = null;
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
