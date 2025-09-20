/**
 * JsonPreviewModal 组件
 * 负责JSON预览弹窗的渲染和交互逻辑
 * 样式定义在JavaScript中，通过StyleManager管理
 */
class JsonPreviewModal {
    constructor() {
        this.isOpen = false;
        this.jsonData = null;
        this.callbacks = {
            onClose: null,
            onCopy: null
        };
        this.buttonStates = {
            format: false,
            minify: false,
            copy: false,
            download: false
        };
        this.initStyles();
    }

    /**
     * 初始化JSON预览弹窗样式
     */
    initStyles() {
        // 确保StyleManager已加载
        if (typeof window.styleManager === 'undefined') {
            console.error('StyleManager未加载，请确保已引入StyleManager.js');
            return;
        }

        // 定义JSON预览弹窗样式
        const modalStyles = {
            // 弹窗遮罩层
            '.json-preview-modal': {
                'position': 'fixed',
                'top': '0',
                'left': '0',
                'width': '100%',
                'height': '100%',
                'z-index': '10000',
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                'background-color': 'rgba(0, 0, 0, 0.5)',
                'opacity': '0',
                'transition': 'opacity 0.3s ease'
            },

            '.json-preview-modal.show': {
                'opacity': '1'
            },

            // 弹窗内容
            '.json-preview-modal-content': {
                'background-color': 'var(--color-modal-background)',
                'border-radius': 'var(--radius-large)',
                'box-shadow': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                'width': '90%',
                'max-width': '900px',
                'max-height': '90vh',
                'display': 'flex',
                'flex-direction': 'column',
                'overflow': 'hidden',
                'transform': 'scale(0.9)',
                'transition': 'transform 0.3s ease'
            },

            '.json-preview-modal.show .json-preview-modal-content': {
                'transform': 'scale(1)'
            },

            // 弹窗头部
            '.json-preview-modal .modal-header': {
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'space-between',
                'padding': '20px 24px',
                'border-bottom': '1px solid var(--color-border-normal)',
                'background-color': 'var(--color-background-normal)'
            },

            '.json-preview-modal .modal-title': {
                'font-size': '18px',
                'font-weight': '600',
                'color': 'var(--color-primary)',
                'margin': '0'
            },

            '.json-preview-modal .modal-close': {
                'background': 'none',
                'border': 'none',
                'font-size': '20px',
                'color': 'var(--color-secondary)',
                'cursor': 'pointer',
                'padding': '8px',
                'border-radius': 'var(--radius-medium)',
                'transition': 'all 0.2s ease',
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'center'
            },

            '.json-preview-modal .modal-close:hover': {
                'background-color': 'var(--color-background-focused)',
                'color': 'var(--color-primary)'
            },

            // 弹窗主体
            '.json-preview-modal .modal-body': {
                'flex': '1',
                'display': 'flex',
                'flex-direction': 'column',
                'overflow': 'hidden'
            },

            // JSON预览容器
            '.json-preview-container': {
                'display': 'flex',
                'flex-direction': 'column',
                'height': '100%',
                'overflow': 'hidden'
            },

            // JSON工具栏
            '.json-toolbar': {
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'space-between',
                'padding': '16px 24px',
                'background-color': 'var(--color-background-normal)',
                'border-bottom': '1px solid var(--color-border-normal)',
                'flex-shrink': '0'
            },

            '.json-info': {
                'display': 'flex',
                'gap': '16px',
                'font-size': '14px',
                'color': 'var(--color-secondary)'
            },

            '.json-actions': {
                'display': 'flex',
                'gap': '8px',
                'align-items': 'center'
            },

            // JSON内容区域
            '.json-content': {
                'flex': '1',
                'overflow': 'auto',
                'padding': '24px',
                'background-color': 'var(--color-background-normal)'
            },

            '.json-text': {
                'font-family': '"Fira Code", "JetBrains Mono", "Consolas", "Monaco", monospace',
                'font-size': '14px',
                'line-height': '1.6',
                'color': 'var(--color-primary)',
                'background-color': 'var(--color-background-normal)',
                'padding': '20px',
                'border-radius': 'var(--radius-large)',
                'border': '1px solid var(--color-border-normal)',
                'overflow-x': 'auto',
                'white-space': 'pre-wrap',
                'word-break': 'break-word',
                'margin': '0',
                'min-height': '200px'
            },

            // JSON语法高亮
            '.json-text .json-key': {
                'color': 'var(--color-info)',
                'font-weight': '600'
            },

            '.json-text .json-string': {
                'color': 'var(--color-success)'
            },

            '.json-text .json-number': {
                'color': 'var(--color-warning)'
            },

            '.json-text .json-boolean': {
                'color': 'var(--color-error)',
                'font-weight': '600'
            },

            '.json-text .json-null': {
                'color': 'var(--color-secondary)',
                'font-style': 'italic'
            },

            '.json-text .json-punctuation': {
                'color': 'var(--color-secondary)'
            },

            // 工具栏按钮
            '.json-toolbar-btn': {
                'display': 'inline-flex',
                'align-items': 'center',
                'gap': '6px',
                'padding': '8px 12px',
                'background-color': 'var(--color-secondary)',
                'color': 'var(--color-primary)',
                'border': '1px solid var(--color-border-normal)',
                'border-radius': 'var(--radius-medium)',
                'font-size': '14px',
                'font-weight': '500',
                'cursor': 'pointer',
                'transition': 'all 0.2s ease',
                'text-decoration': 'none'
            },

            '.json-toolbar-btn:hover': {
                'background-color': 'var(--color-background-focused)',
                'border-color': 'var(--color-border-focused)',
                'transform': 'translateY(-1px)',
                'box-shadow': '0 2px 4px rgba(0, 0, 0, 0.1)'
            },

            '.json-toolbar-btn:active': {
                'transform': 'translateY(0)',
                'box-shadow': '0 1px 2px rgba(0, 0, 0, 0.1)'
            },

            '.json-toolbar-btn:disabled': {
                'opacity': '0.5',
                'cursor': 'not-allowed',
                'pointer-events': 'none'
            },

            '.json-toolbar-btn.loading': {
                'cursor': 'wait',
                'pointer-events': 'none'
            },

            // Toast通知样式
            '.toast': {
                'position': 'fixed',
                'top': '20px',
                'right': '20px',
                'padding': '12px 20px',
                'border-radius': 'var(--radius-medium)',
                'color': 'white',
                'font-weight': '500',
                'font-size': '14px',
                'z-index': '10001',
                'opacity': '0',
                'transform': 'translateX(100%)',
                'transition': 'all 0.3s ease',
                'box-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                'max-width': '300px',
                'word-wrap': 'break-word'
            },

            '.toast.success': {
                'background-color': 'var(--color-success)'
            },

            '.toast.error': {
                'background-color': 'var(--color-error)'
            },

            '.toast.warning': {
                'background-color': 'var(--color-warning)'
            },

            '.toast.info': {
                'background-color': 'var(--color-info)'
            },

            // 响应式设计
            '@media (max-width: 768px)': {
                '.json-preview-modal-content': {
                    'width': '95%',
                    'max-height': '95vh'
                },
                '.json-toolbar': {
                    'flex-direction': 'column',
                    'gap': '12px',
                    'align-items': 'stretch'
                },
                '.json-info': {
                    'justify-content': 'center'
                },
                '.json-actions': {
                    'justify-content': 'center',
                    'flex-wrap': 'wrap'
                },
                '.json-content': {
                    'padding': '16px'
                },
                '.json-text': {
                    'font-size': '12px',
                    'padding': '16px'
                }
            }
        };

        // 注册样式到StyleManager
        window.styleManager.defineStyles('JsonPreviewModal', modalStyles);
    }

    /**
     * 设置回调函数
     * @param {Object} callbacks - 回调函数对象
     */
    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    /**
     * 设置JSON数据
     * @param {Object|string} data - JSON数据
     */
    setJsonData(data) {
        this.jsonData = data;
    }

    /**
     * 打开JSON预览弹窗
     * @param {Object|string} data - JSON数据（可选，如果不传则使用已设置的数据）
     */
    open(data = null) {
        if (this.isOpen) return;

        if (data !== null) {
            this.setJsonData(data);
        }

        if (!this.jsonData) {
            console.error('JSON数据不能为空');
            return;
        }

        this.isOpen = true;
        this.render();
        this.bindEvents();
    }

    /**
     * 关闭JSON预览弹窗
     */
    close() {
        if (!this.isOpen) return;

        this.isOpen = false;
        this.unbindEvents();
        this.removeModal();
    }

    /**
     * 渲染JSON预览弹窗HTML
     */
    render() {
        const modalHTML = `
            <div class="json-preview-modal" id="json-preview-modal">
                <div class="modal-overlay" onclick="window.jsonPreviewModalInstance.close()">
                    <div class="modal-content json-preview-modal-content" onclick="event.stopPropagation()">
                        <div class="modal-header">
                            <h2 class="modal-title">JSON预览</h2>
                            <button class="modal-close" id="json-preview-close-btn" title="关闭">
                                <div class="svg-icon" data-icon="x" data-filled="false"></div>
                            </button>
                        </div>
                        
                        <div class="modal-body">
                            <div class="json-preview-container">
                                <div class="json-toolbar">
                                    <div class="json-info">
                                        <span class="json-size" id="json-size">大小: 0 KB</span>
                                        <span class="json-lines" id="json-lines">行数: 0</span>
                                    </div>
                                    <div class="json-actions" id="json-actions-container">
                                        <!-- 工具栏按钮将通过JavaScript动态创建 -->
                                    </div>
                                </div>
                                <div class="json-content">
                                    <pre class="json-text" id="json-text"></pre>
                                </div>
                            </div>
                        </div>
                        
                        <style>
                            .json-preview-modal {
                                position: fixed;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 100%;
                                z-index: 1000;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            }
                            
                            .json-preview-modal .modal-overlay {
                                position: absolute;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 100%;
                                background: rgba(0, 0, 0, 0.5);
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                padding: 20px;
                            }
                            
                            .json-preview-modal-content {
                                background: var(--color-background-normal);
                                border-radius: var(--radius-large);
                                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                                width: 90%;
                                max-width: 900px;
                                max-height: 90vh;
                                display: flex;
                                flex-direction: column;
                                overflow: hidden;
                                border: 1px solid var(--color-border-normal);
                            }
                            
                            .json-preview-container {
                                display: flex;
                                flex-direction: column;
                                height: 100%;
                                min-height: 400px;
                            }
                            
                            .json-toolbar {
                                display: flex;
                                align-items: center;
                                justify-content: space-between;
                                padding: 12px 16px;
                                background: var(--color-background-focused);
                                border-bottom: 1px solid var(--color-border-normal);
                                flex-shrink: 0;
                            }
                            
                            .json-info {
                                display: flex;
                                align-items: center;
                                gap: 16px;
                                font-size: 12px;
                                color: var(--color-secondary);
                            }
                            
                            .json-actions {
                                display: flex;
                                align-items: center;
                                gap: 8px;
                            }
                            
                            /* 工具栏按钮容器样式 */
                            .json-actions {
                                display: flex;
                                align-items: center;
                                gap: 8px;
                            }
                            
                            /* 工具栏按钮特殊样式 */
                            .json-actions .btn {
                                min-width: 32px;
                                height: 32px;
                                padding: 0;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            }
                            
                            .json-actions .btn-icon {
                                margin: 0;
                            }
                            
                            .json-actions .btn-text {
                                display: none;
                            }
                            
                            /* 工具栏按钮悬停效果 */
                            .json-actions .btn:hover {
                                transform: translateY(-1px);
                                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                            }
                            
                            .json-actions .btn:active {
                                transform: translateY(0);
                                box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
                            }
                            
                            .json-content {
                                flex: 1;
                                overflow: auto;
                                background: var(--color-background-normal);
                                position: relative;
                            }
                            
                            .json-text {
                                margin: 0;
                                padding: 16px;
                                font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
                                font-size: 13px;
                                line-height: 1.5;
                                color: var(--color-primary);
                                white-space: pre-wrap;
                                word-break: break-word;
                                overflow-wrap: break-word;
                                background: transparent;
                                border: none;
                                outline: none;
                                width: 100%;
                                min-height: 200px;
                            }
                            
                            /* JSON语法高亮 */
                            .json-text .json-key {
                                color: #268bd2;
                                font-weight: 600;
                            }
                            
                            .json-text .json-string {
                                color: #2aa198;
                            }
                            
                            .json-text .json-number {
                                color: #d33682;
                            }
                            
                            .json-text .json-boolean {
                                color: #b58900;
                                font-weight: 600;
                            }
                            
                            .json-text .json-null {
                                color: #93a1a1;
                                font-style: italic;
                            }
                            
                            .json-text .json-punctuation {
                                color: var(--color-secondary);
                            }
                            
                            /* 滚动条样式 */
                            .json-content::-webkit-scrollbar {
                                width: 8px;
                                height: 8px;
                            }
                            
                            .json-content::-webkit-scrollbar-track {
                                background: var(--color-background-focused);
                            }
                            
                            .json-content::-webkit-scrollbar-thumb {
                                background: var(--color-border-normal);
                                border-radius: var(--radius-small);
                            }
                            
                            .json-content::-webkit-scrollbar-thumb:hover {
                                background: var(--color-secondary);
                            }
                            
                            /* 响应式设计 */
                            @media (max-width: 768px) {
                                .json-preview-modal-content {
                                    width: 95%;
                                    max-height: 95vh;
                                }
                                
                                .json-toolbar {
                                    flex-direction: column;
                                    gap: 12px;
                                    align-items: stretch;
                                }
                                
                                .json-info {
                                    justify-content: center;
                                }
                                
                                .json-actions {
                                    justify-content: center;
                                    flex-wrap: wrap;
                                }
                                
                                .json-actions .btn {
                                    min-width: 40px;
                                    height: 36px;
                                }
                                
                                .json-text {
                                    font-size: 12px;
                                    padding: 12px;
                                }
                                
                                .modal-footer {
                                    flex-direction: column;
                                    gap: 8px;
                                }
                                
                                .modal-footer .btn {
                                    width: 100%;
                                }
                            }
                            
                            @media (max-width: 480px) {
                                .json-actions {
                                    gap: 6px;
                                }
                                
                                .json-actions .btn {
                                    min-width: 36px;
                                    height: 32px;
                                }
                                
                                .json-actions .btn-icon {
                                    font-size: 14px;
                                }
                            }
                        </style>
                        
                        <div class="modal-footer" id="json-preview-modal-footer">
                            <!-- 按钮将通过JavaScript动态创建 -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 创建按钮
        this.createButtons();
        
        // 渲染JSON内容
        this.renderJsonContent();
        
        // 设置全局引用
        window.jsonPreviewModalInstance = this;
    }

    /**
     * 创建弹窗按钮
     */
    createButtons() {
        if (!window.buttonInstance) return;

        // 创建工具栏按钮
        this.createToolbarButtons();
        
        // 创建footer按钮
        this.createFooterButtons();
    }

    /**
     * 创建工具栏按钮
     */
    createToolbarButtons() {
        const actionsContainer = document.getElementById('json-actions-container');
        if (!actionsContainer) return;

        // 创建格式化按钮
        const formatButton = window.mPrimaryButtonInstance.create({
            text: '格式化',
            icon: 'ph-code',
            onClick: () => this.formatJson(),
            className: 'json-toolbar-btn',
            id: 'format-json-btn'
        });

        // 创建压缩按钮
        const minifyButton = window.mPrimaryButtonInstance.create({
            text: '压缩',
            icon: 'ph-compress',
            onClick: () => this.minifyJson(),
            className: 'json-toolbar-btn',
            id: 'minify-json-btn'
        });

        // 创建复制按钮
        const copyButton = window.mPrimaryButtonInstance.create({
            text: '复制',
            icon: 'ph-copy',
            onClick: () => this.copyJson(),
            className: 'json-toolbar-btn',
            id: 'copy-json-btn'
        });

        // 创建下载按钮
        const downloadButton = window.mPrimaryButtonInstance.create({
            text: '下载',
            icon: 'ph-download',
            onClick: () => this.downloadJson(),
            className: 'json-toolbar-btn',
            id: 'download-json-btn'
        });

        // 添加按钮到容器
        actionsContainer.appendChild(formatButton);
        actionsContainer.appendChild(minifyButton);
        actionsContainer.appendChild(copyButton);
        actionsContainer.appendChild(downloadButton);
    }

    /**
     * 创建底部按钮
     */
    createFooterButtons() {
        const footer = document.getElementById('json-preview-modal-footer');
        if (!footer) return;

        // 创建关闭按钮
        const closeButton = window.mPrimaryButtonInstance.create({
            text: '关闭',
            icon: 'ph-x',
            onClick: () => this.close(),
            className: 'modal-btn-close'
        });

        // 创建复制按钮
        const copyButton = window.mPrimaryButtonInstance.create({
            text: '复制JSON',
            icon: 'ph-copy',
            onClick: () => this.copyJson(),
            className: 'modal-btn-copy'
        });

        // 添加按钮到footer
        footer.appendChild(closeButton);
        footer.appendChild(copyButton);
    }

    /**
     * 渲染JSON内容
     */
    renderJsonContent() {
        const jsonTextElement = document.getElementById('json-text');
        
        if (!jsonTextElement || !this.jsonData) return;

        // 验证JSON数据
        const validation = this.validateJsonData(this.jsonData);
        
        if (!validation.isValid) {
            this.handleJsonError(validation.error);
            return;
        }

        try {
            // 重置按钮状态
            this.resetButtonStates();
            
            // 格式化JSON
            const jsonString = JSON.stringify(validation.data, null, 2);

            // 应用语法高亮
            const highlightedJson = this.highlightJson(jsonString);
            jsonTextElement.innerHTML = highlightedJson;
            // 样式已通过StyleManager管理，无需手动设置

            // 更新统计信息
            this.updateJsonStats(jsonString);

        } catch (error) {
            console.error('JSON渲染失败:', error);
            this.handleJsonError(error.message);
        }
    }

    /**
     * JSON语法高亮
     * @param {string} jsonString - JSON字符串
     * @returns {string} 高亮后的HTML字符串
     */
    highlightJson(jsonString) {
        return jsonString
            .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?)/g, (match) => {
                let cls = 'json-number';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'json-key';
                    } else {
                        cls = 'json-string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'json-boolean';
                } else if (/null/.test(match)) {
                    cls = 'json-null';
                }
                return '<span class="' + cls + '">' + match + '</span>';
            })
            .replace(/([{}[\]])/g, '<span class="json-punctuation">$1</span>')
            .replace(/([,:])/g, '<span class="json-punctuation">$1</span>');
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 注册ESC键关闭快捷键
        this.registerShortcuts();
        
        // 绑定关闭按钮点击事件
        const closeButton = document.getElementById('json-preview-close-btn');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.close());
        }
    }

    /**
     * 注册快捷键
     */
    registerShortcuts() {
        if (window.keyboardShortcutManager) {
            window.keyboardShortcutManager.register('escape', (e) => {
                this.close();
            }, 'json-preview-modal', '关闭JSON预览弹窗');
        }
    }

    /**
     * 注销快捷键
     */
    unregisterShortcuts() {
        if (window.keyboardShortcutManager) {
            window.keyboardShortcutManager.unregisterContext('json-preview-modal');
        }
    }

    /**
     * 解绑事件监听器
     */
    unbindEvents() {
        this.unregisterShortcuts();
    }

    /**
     * 格式化JSON
     */
    formatJson() {
        try {
            // 设置按钮加载状态
            this.setButtonLoading('format-json-btn', true);
            
            // 验证JSON数据
            const validation = this.validateJsonData(this.jsonData);
            if (!validation.isValid) {
                this.handleJsonError(validation.error);
                return;
            }
            
            const formatted = JSON.stringify(validation.data, null, 2);
            const highlightedJson = this.highlightJson(formatted);
            
            const jsonTextElement = document.getElementById('json-text');
            if (jsonTextElement) {
                jsonTextElement.innerHTML = highlightedJson;
                // 样式已通过StyleManager管理，无需手动设置
            }
            
            // 更新统计信息
            this.updateJsonStats(formatted);
            
            this.showToast('JSON已格式化', 'success');
        } catch (error) {
            console.error('JSON格式化失败:', error);
            this.showToast('JSON格式化失败', 'error');
        } finally {
            // 清除按钮加载状态
            this.setButtonLoading('format-json-btn', false);
        }
    }

    /**
     * 压缩JSON
     */
    minifyJson() {
        try {
            // 设置按钮加载状态
            this.setButtonLoading('minify-json-btn', true);
            
            // 验证JSON数据
            const validation = this.validateJsonData(this.jsonData);
            if (!validation.isValid) {
                this.handleJsonError(validation.error);
                return;
            }
            
            const minified = JSON.stringify(validation.data);
            const highlightedJson = this.highlightJson(minified);
            
            const jsonTextElement = document.getElementById('json-text');
            if (jsonTextElement) {
                jsonTextElement.innerHTML = highlightedJson;
                // 样式已通过StyleManager管理，无需手动设置
            }
            
            // 更新统计信息
            this.updateJsonStats(minified);
            
            this.showToast('JSON已压缩', 'success');
        } catch (error) {
            console.error('JSON压缩失败:', error);
            this.showToast('JSON压缩失败', 'error');
        } finally {
            // 清除按钮加载状态
            this.setButtonLoading('minify-json-btn', false);
        }
    }

    /**
     * 复制JSON到剪贴板
     */
    async copyJson() {
        try {
            // 设置按钮加载状态
            this.setButtonLoading('copy-json-btn', true);
            
            // 验证JSON数据
            const validation = this.validateJsonData(this.jsonData);
            if (!validation.isValid) {
                this.showToast('JSON格式错误，无法复制', 'error');
                return;
            }
            
            const jsonString = JSON.stringify(validation.data, null, 2);
            await navigator.clipboard.writeText(jsonString);
            this.showToast('JSON已复制到剪贴板', 'success');
            
            // 触发复制回调
            if (this.callbacks.onCopy) {
                this.callbacks.onCopy(jsonString);
            }
        } catch (error) {
            console.error('复制JSON失败:', error);
            this.showToast('复制失败，请手动选择复制', 'error');
        } finally {
            // 清除按钮加载状态
            this.setButtonLoading('copy-json-btn', false);
        }
    }

    /**
     * 下载JSON文件
     */
    downloadJson() {
        try {
            // 设置按钮加载状态
            this.setButtonLoading('download-json-btn', true);
            
            // 验证JSON数据
            const validation = this.validateJsonData(this.jsonData);
            if (!validation.isValid) {
                this.showToast('JSON格式错误，无法下载', 'error');
                return;
            }
            
            const jsonString = JSON.stringify(validation.data, null, 2);

            // 创建Blob对象
            const blob = new Blob([jsonString], { type: 'application/json' });
            
            // 创建下载链接
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `json-data-${new Date().getTime()}.json`;
            
            // 触发下载
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // 清理URL对象
            URL.revokeObjectURL(url);
            
            this.showToast('JSON文件已下载', 'success');
        } catch (error) {
            console.error('下载JSON失败:', error);
            this.showToast('下载失败，请重试', 'error');
        } finally {
            // 清除按钮加载状态
            this.setButtonLoading('download-json-btn', false);
        }
    }

    /**
     * 设置按钮加载状态
     * @param {string} buttonId - 按钮ID
     * @param {boolean} loading - 是否加载中
     */
    setButtonLoading(buttonId, loading) {
        const button = document.getElementById(buttonId);
        if (button && window.mPrimaryButtonInstance) {
            window.mPrimaryButtonInstance.update(button, { loading });
            
            // 更新内部状态
            const stateKey = buttonId.replace('-json-btn', '');
            if (this.buttonStates.hasOwnProperty(stateKey)) {
                this.buttonStates[stateKey] = loading;
            }
        }
    }

    /**
     * 设置按钮禁用状态
     * @param {string} buttonId - 按钮ID
     * @param {boolean} disabled - 是否禁用
     */
    setButtonDisabled(buttonId, disabled) {
        const button = document.getElementById(buttonId);
        if (button && window.mPrimaryButtonInstance) {
            window.mPrimaryButtonInstance.update(button, { disabled });
        }
    }

    /**
     * 批量设置按钮状态
     * @param {Object} states - 按钮状态对象
     */
    setButtonsState(states) {
        Object.keys(states).forEach(buttonId => {
            const state = states[buttonId];
            if (state.loading !== undefined) {
                this.setButtonLoading(buttonId, state.loading);
            }
            if (state.disabled !== undefined) {
                this.setButtonDisabled(buttonId, state.disabled);
            }
        });
    }

    /**
     * 更新JSON统计信息
     * @param {string} jsonString - JSON字符串
     */
    updateJsonStats(jsonString) {
        const jsonSizeElement = document.getElementById('json-size');
        const jsonLinesElement = document.getElementById('json-lines');
        
        if (jsonSizeElement) {
            const sizeInKB = (new Blob([jsonString]).size / 1024).toFixed(2);
            jsonSizeElement.textContent = `大小: ${sizeInKB} KB`;
        }
        
        if (jsonLinesElement) {
            const lineCount = jsonString.split('\n').length;
            jsonLinesElement.textContent = `行数: ${lineCount}`;
        }
    }

    /**
     * 验证JSON数据
     * @param {Object|string} data - JSON数据
     * @returns {Object} 验证结果
     */
    validateJsonData(data) {
        try {
            let parsed;
            if (typeof data === 'string') {
                parsed = JSON.parse(data);
            } else {
                parsed = data;
            }
            
            return {
                isValid: true,
                data: parsed,
                error: null
            };
        } catch (error) {
            return {
                isValid: false,
                data: null,
                error: error.message
            };
        }
    }

    /**
     * 处理JSON错误状态
     * @param {string} errorMessage - 错误消息
     */
    handleJsonError(errorMessage) {
        // 禁用所有操作按钮
        this.setButtonsState({
            'format-json-btn': { disabled: true },
            'minify-json-btn': { disabled: true },
            'copy-json-btn': { disabled: true },
            'download-json-btn': { disabled: true }
        });
        
        // 显示错误信息
        const jsonTextElement = document.getElementById('json-text');
        if (jsonTextElement) {
            jsonTextElement.innerHTML = `<span style="color: var(--color-error);">JSON格式错误: ${errorMessage}</span>`;
        }
        
        // 重置统计信息
        const jsonSizeElement = document.getElementById('json-size');
        const jsonLinesElement = document.getElementById('json-lines');
        if (jsonSizeElement) jsonSizeElement.textContent = '大小: 0 KB';
        if (jsonLinesElement) jsonLinesElement.textContent = '行数: 0';
    }

    /**
     * 重置按钮状态
     */
    resetButtonStates() {
        this.setButtonsState({
            'format-json-btn': { disabled: false, loading: false },
            'minify-json-btn': { disabled: false, loading: false },
            'copy-json-btn': { disabled: false, loading: false },
            'download-json-btn': { disabled: false, loading: false }
        });
    }

    /**
     * 显示Toast通知
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型
     */
    showToast(message, type = 'info') {
        // 使用StyleManager创建toast元素
        const toast = window.styleManager.createStyledElement('div', 'JsonPreviewModal', '.toast', {
            className: `toast toast-${type}`,
            textContent: message
        });
        
        // 添加到页面
        document.body.appendChild(toast);
        
        // 显示动画
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // 自动隐藏
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    /**
     * 移除弹窗
     */
    removeModal() {
        const modal = document.getElementById('json-preview-modal');
        if (modal) {
            modal.remove();
        }
        
        // 清理全局引用
        if (window.jsonPreviewModalInstance === this) {
            window.jsonPreviewModalInstance = null;
        }
    }

    /**
     * 销毁组件
     */
    destroy() {
        this.close();
        this.callbacks = {};
        this.jsonData = null;
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JsonPreviewModal;
} else {
    window.JsonPreviewModal = JsonPreviewModal;
}
