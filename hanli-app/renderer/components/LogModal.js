/**
 * 日志查看弹窗组件
 * 提供应用日志查看功能的弹窗界面
 */
class LogModal {
    constructor(app) {
        this.app = app;
        this.isVisible = false;
        this.element = null;
        this.logs = [];
        
        this.init();
    }

    /**
     * 初始化组件
     */
    init() {
        this.createElement();
        this.bindEvents();
        this.loadLogs();
    }

    /**
     * 创建DOM元素
     */
    createElement() {
        this.element = document.createElement('div');
        this.element.className = 'log-modal';
        this.element.id = 'logModal';
        this.element.style.display = 'none';
        
        this.element.innerHTML = `
            <div class="log-modal-content">
                <div class="log-modal-header">
                    <h3>应用日志</h3>
                    <div class="log-controls">
                        <button class="btn-icon" id="clearLogBtn" title="清空日志">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <button class="btn-icon" id="exportLogBtn" title="导出日志">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <button class="log-close-btn" id="logCloseBtn" title="关闭日志">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="log-modal-body">
                    <div class="log-content" id="logContent">
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
                    </div>
                </div>
            </div>
        `;
        
        // 添加到body
        document.body.appendChild(this.element);
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 关闭按钮
        const closeBtn = this.element.querySelector('#logCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide();
            });
        }

        // 清空日志按钮
        const clearBtn = this.element.querySelector('#clearLogBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearLogs();
            });
        }

        // 导出日志按钮
        const exportBtn = this.element.querySelector('#exportLogBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportLogs();
            });
        }

        // 点击背景关闭
        this.element.addEventListener('click', (e) => {
            if (e.target === this.element) {
                this.hide();
            }
        });
    }

    /**
     * 显示弹窗
     */
    show() {
        this.element.style.display = 'flex';
        this.isVisible = true;
        this.loadLogs();
        this.scrollToBottom();
    }

    /**
     * 隐藏弹窗
     */
    hide() {
        this.element.style.display = 'none';
        this.isVisible = false;
    }

    /**
     * 切换弹窗显示状态
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * 加载日志
     */
    loadLogs() {
        if (this.app && this.app.logs) {
            this.logs = [...this.app.logs];
            this.renderLogs();
        }
    }

    /**
     * 渲染日志
     */
    renderLogs() {
        const logContent = this.element.querySelector('#logContent');
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

        const logsHtml = this.logs.map(log => `
            <div class="log-item ${log.level || 'info'}">
                <div class="log-time">${this.formatTime(log.timestamp)}</div>
                <div class="log-level">${this.getLevelText(log.level)}</div>
                <div class="log-message">${this.escapeHtml(log.message)}</div>
                ${log.details ? `<div class="log-details">${this.escapeHtml(log.details)}</div>` : ''}
            </div>
        `).join('');

        logContent.innerHTML = logsHtml;
    }

    /**
     * 添加日志
     */
    addLog(level, message, details = null) {
        const log = {
            timestamp: new Date().toISOString(),
            level: level,
            message: message,
            details: details
        };

        this.logs.push(log);
        
        // 限制日志数量，避免内存过多占用
        if (this.logs.length > 1000) {
            this.logs = this.logs.slice(-1000);
        }

        // 如果弹窗正在显示，更新显示
        if (this.isVisible) {
            this.renderLogs();
            this.scrollToBottom();
        }
    }

    /**
     * 清空日志
     */
    clearLogs() {
        if (confirm('确定要清空所有日志吗？此操作不可撤销。')) {
            this.logs = [];
            if (this.app && this.app.logs) {
                this.app.logs = [];
            }
            this.renderLogs();
            this.app.updateStatus('日志已清空');
        }
    }

    /**
     * 导出日志
     */
    exportLogs() {
        try {
            const logData = {
                exportTime: new Date().toISOString(),
                totalLogs: this.logs.length,
                logs: this.logs
            };

            const dataStr = JSON.stringify(logData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `hanli-logs-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            this.app.updateStatus('日志已导出');
        } catch (error) {
            console.error('导出日志失败:', error);
            this.app.updateStatus('导出日志失败');
        }
    }

    /**
     * 滚动到底部
     */
    scrollToBottom() {
        const logContent = this.element.querySelector('#logContent');
        if (logContent) {
            logContent.scrollTop = logContent.scrollHeight;
        }
    }

    /**
     * 格式化时间
     */
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    }

    /**
     * 获取级别文本
     */
    getLevelText(level) {
        const levelTexts = {
            'info': '信息',
            'warn': '警告',
            'error': '错误',
            'debug': '调试',
            'success': '成功'
        };
        return levelTexts[level] || '信息';
    }

    /**
     * 转义HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 销毁组件
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
        this.isVisible = false;
        this.logs = [];
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LogModal;
} else {
    window.LogModal = LogModal;
}
