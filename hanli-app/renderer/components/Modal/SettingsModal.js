/**
 * SettingsModal 组件
 * 负责系统设置弹窗的渲染和交互逻辑
 */
class SettingsModal {
    constructor() {
        this.isOpen = false;
        this.settings = {
            theme: 'auto',
            language: 'zh-CN',
            autoRefresh: true,
            showCollectTime: true
        };
        this.callbacks = {
            onSave: null,
            onCancel: null,
            onThemeChange: null
        };
    }

    /**
     * 设置回调函数
     * @param {Object} callbacks - 回调函数对象
     */
    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    /**
     * 设置当前设置
     * @param {Object} settings - 设置对象
     */
    setSettings(settings) {
        this.settings = { ...this.settings, ...settings };
    }

    /**
     * 获取当前设置
     * @returns {Object} 设置对象
     */
    getSettings() {
        return { ...this.settings };
    }

    /**
     * 打开设置弹窗
     */
    open() {
        if (this.isOpen) return;

        this.isOpen = true;
        this.render();
        this.bindEvents();
        this.loadCurrentSettings();
    }

    /**
     * 关闭设置弹窗
     */
    close() {
        if (!this.isOpen) return;

        this.isOpen = false;
        this.unbindEvents();
        this.removeModal();
    }

    /**
     * 渲染设置弹窗HTML
     */
    render() {
        const modalHTML = `
            <div class="settings-modal" id="settings-modal">
                <div class="modal-overlay" onclick="window.settingsModalInstance.close()">
                    <div class="modal-content settings-modal-content" onclick="event.stopPropagation()">
                        <div class="modal-header">
                            <h2 class="modal-title">系统设置</h2>
                            <button class="modal-close" onclick="window.settingsModalInstance.close()">
                                <i class="ph ph-x"></i>
                            </button>
                        </div>
                        
                        <div class="modal-body">
                            ${this.renderSettingsContent()}
                        </div>
                        
                        <div class="modal-footer">
                            <button class="btn btn-secondary" onclick="window.settingsModalInstance.cancel()">取消</button>
                            <button class="btn btn-primary" onclick="window.settingsModalInstance.save()">保存设置</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 设置全局引用
        window.settingsModalInstance = this;
    }

    /**
     * 渲染设置内容
     * @returns {string} HTML字符串
     */
    renderSettingsContent() {
        return `
            <div class="settings-section">
                <h3 class="section-title">外观设置</h3>
                
                <div class="setting-item">
                    <label class="setting-label">主题模式</label>
                    <div class="setting-control">
                        <div class="theme-selector">
                            <label class="theme-option ${this.settings.theme === 'light' ? 'active' : ''}" data-theme="light">
                                <input type="radio" name="theme" value="light" ${this.settings.theme === 'light' ? 'checked' : ''}>
                                <span class="theme-preview light-theme">
                                    <div class="preview-header"></div>
                                    <div class="preview-content"></div>
                                </span>
                                <span class="theme-name">浅色主题</span>
                            </label>
                            
                            <label class="theme-option ${this.settings.theme === 'dark' ? 'active' : ''}" data-theme="dark">
                                <input type="radio" name="theme" value="dark" ${this.settings.theme === 'dark' ? 'checked' : ''}>
                                <span class="theme-preview dark-theme">
                                    <div class="preview-header"></div>
                                    <div class="preview-content"></div>
                                </span>
                                <span class="theme-name">深色主题</span>
                            </label>
                            
                            <label class="theme-option ${this.settings.theme === 'auto' ? 'active' : ''}" data-theme="auto">
                                <input type="radio" name="theme" value="auto" ${this.settings.theme === 'auto' ? 'checked' : ''}>
                                <span class="theme-preview auto-theme">
                                    <div class="preview-header"></div>
                                    <div class="preview-content"></div>
                                </span>
                                <span class="theme-name">跟随系统</span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <div class="setting-item">
                    <label class="setting-label">语言设置</label>
                    <div class="setting-control">
                        <select class="setting-select" id="language-select">
                            <option value="zh-CN" ${this.settings.language === 'zh-CN' ? 'selected' : ''}>简体中文</option>
                            <option value="en-US" ${this.settings.language === 'en-US' ? 'selected' : ''}>English</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="settings-section">
                <h3 class="section-title">功能设置</h3>
                
                <div class="setting-item">
                    <label class="setting-label">自动刷新产品数据</label>
                    <div class="setting-control">
                        <label class="switch">
                            <input type="checkbox" id="auto-refresh" ${this.settings.autoRefresh ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                        <span class="setting-description">在首页时每5秒自动刷新产品总数</span>
                    </div>
                </div>
                
                <div class="setting-item">
                    <label class="setting-label">显示采集时间</label>
                    <div class="setting-control">
                        <label class="switch">
                            <input type="checkbox" id="show-collect-time" ${this.settings.showCollectTime ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                        <span class="setting-description">在产品列表中显示采集时间</span>
                    </div>
                </div>
            </div>
            
            <div class="settings-section">
                <h3 class="section-title">数据设置</h3>
                
                <div class="setting-item">
                    <label class="setting-label">数据存储路径</label>
                    <div class="setting-control">
                        <input type="text" class="setting-input" id="data-path" value="${this.getDataPath()}" readonly>
                        <button class="btn btn-sm btn-secondary" onclick="window.settingsModalInstance.openDataFolder()">打开文件夹</button>
                    </div>
                </div>
                
                <div class="setting-item">
                    <label class="setting-label">缓存管理</label>
                    <div class="setting-control">
                        <button class="btn btn-sm btn-warning" onclick="window.settingsModalInstance.clearCache()">清理缓存</button>
                        <span class="setting-description">清理临时文件和缓存数据</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        const modal = document.getElementById('settings-modal');
        if (!modal) return;

        // 主题选择事件
        const themeOptions = modal.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // 移除其他选项的active类
                themeOptions.forEach(opt => opt.classList.remove('active'));
                // 添加当前选项的active类
                option.classList.add('active');
                // 选中对应的radio
                const radio = option.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                    // 预览主题效果
                    this.previewTheme(radio.value);
                }
            });
        });

        // 语言选择事件
        const languageSelect = modal.querySelector('#language-select');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                console.log('语言设置变更:', e.target.value);
            });
        }

        // 开关事件
        const switches = modal.querySelectorAll('.switch input[type="checkbox"]');
        switches.forEach(switchEl => {
            switchEl.addEventListener('change', (e) => {
                console.log('设置变更:', e.target.id, e.target.checked);
            });
        });

        // ESC键关闭
        this.handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                this.close();
            }
        };
        document.addEventListener('keydown', this.handleKeyDown);
    }

    /**
     * 解绑事件监听器
     */
    unbindEvents() {
        if (this.handleKeyDown) {
            document.removeEventListener('keydown', this.handleKeyDown);
            this.handleKeyDown = null;
        }
    }

    /**
     * 预览主题效果
     * @param {string} theme - 主题名称
     */
    previewTheme(theme) {
        const body = document.body;
        const themeColors = document.getElementById('theme-colors');
        
        // 移除现有主题类
        body.classList.remove('theme-light', 'theme-dark', 'theme-auto');
        
        // 添加新主题类
        if (theme === 'auto') {
            // 跟随系统主题
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const actualTheme = prefersDark ? 'dark' : 'light';
            body.classList.add(`theme-${actualTheme}`);
            themeColors.href = `theme/${actualTheme}/colors.css`;
        } else {
            body.classList.add(`theme-${theme}`);
            themeColors.href = `theme/${theme}/colors.css`;
        }
    }

    /**
     * 加载当前设置
     */
    loadCurrentSettings() {
        // 从localStorage加载设置
        const savedTheme = localStorage.getItem('app-theme') || 'auto';
        const savedLanguage = localStorage.getItem('app-language') || 'zh-CN';
        const savedAutoRefresh = localStorage.getItem('app-auto-refresh') !== 'false';
        const savedShowCollectTime = localStorage.getItem('app-show-collect-time') !== 'false';

        this.settings = {
            theme: savedTheme,
            language: savedLanguage,
            autoRefresh: savedAutoRefresh,
            showCollectTime: savedShowCollectTime
        };

        // 更新UI
        this.updateUI();
    }

    /**
     * 更新UI显示
     */
    updateUI() {
        const modal = document.getElementById('settings-modal');
        if (!modal) return;

        // 更新主题选择
        const themeRadios = modal.querySelectorAll('input[name="theme"]');
        themeRadios.forEach(radio => {
            radio.checked = radio.value === this.settings.theme;
        });

        // 更新主题选项样式
        const themeOptions = modal.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.classList.remove('active');
            const radio = option.querySelector('input[type="radio"]');
            if (radio && radio.checked) {
                option.classList.add('active');
            }
        });

        // 更新语言选择
        const languageSelect = modal.querySelector('#language-select');
        if (languageSelect) {
            languageSelect.value = this.settings.language;
        }

        // 更新开关状态
        const autoRefreshCheckbox = modal.querySelector('#auto-refresh');
        const showCollectTimeCheckbox = modal.querySelector('#show-collect-time');
        
        if (autoRefreshCheckbox) {
            autoRefreshCheckbox.checked = this.settings.autoRefresh;
        }
        if (showCollectTimeCheckbox) {
            showCollectTimeCheckbox.checked = this.settings.showCollectTime;
        }
    }

    /**
     * 保存设置
     */
    save() {
        const modal = document.getElementById('settings-modal');
        if (!modal) return;

        try {
            // 获取主题设置
            const selectedThemeRadio = modal.querySelector('input[name="theme"]:checked');
            if (selectedThemeRadio) {
                this.settings.theme = selectedThemeRadio.value;
                localStorage.setItem('app-theme', this.settings.theme);
            }

            // 获取语言设置
            const languageSelect = modal.querySelector('#language-select');
            if (languageSelect) {
                this.settings.language = languageSelect.value;
                localStorage.setItem('app-language', this.settings.language);
            }

            // 获取功能设置
            const autoRefreshCheckbox = modal.querySelector('#auto-refresh');
            const showCollectTimeCheckbox = modal.querySelector('#show-collect-time');
            
            if (autoRefreshCheckbox) {
                this.settings.autoRefresh = autoRefreshCheckbox.checked;
                localStorage.setItem('app-auto-refresh', this.settings.autoRefresh.toString());
            }
            
            if (showCollectTimeCheckbox) {
                this.settings.showCollectTime = showCollectTimeCheckbox.checked;
                localStorage.setItem('app-show-collect-time', this.settings.showCollectTime.toString());
            }

            // 触发保存回调
            if (this.callbacks.onSave) {
                this.callbacks.onSave(this.settings);
            }

            // 显示保存成功提示
            this.showToast('设置已保存');

            // 关闭弹窗
            this.close();
            
        } catch (error) {
            console.error('保存设置时发生错误:', error);
            this.showToast('保存设置失败，请重试');
        }
    }

    /**
     * 取消设置
     */
    cancel() {
        // 恢复原始主题
        this.restoreOriginalTheme();
        
        // 触发取消回调
        if (this.callbacks.onCancel) {
            this.callbacks.onCancel();
        }

        // 关闭弹窗
        this.close();
    }

    /**
     * 恢复原始主题
     */
    restoreOriginalTheme() {
        const body = document.body;
        const themeColors = document.getElementById('theme-colors');
        
        body.classList.remove('theme-light', 'theme-dark', 'theme-auto');
        
        const theme = localStorage.getItem('app-theme') || 'auto';
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const actualTheme = prefersDark ? 'dark' : 'light';
            body.classList.add(`theme-${actualTheme}`);
            themeColors.href = `theme/${actualTheme}/colors.css`;
        } else {
            body.classList.add(`theme-${theme}`);
            themeColors.href = `theme/${theme}/colors.css`;
        }
    }

    /**
     * 获取数据存储路径
     * @returns {string} 数据路径
     */
    getDataPath() {
        // 这里应该从主进程获取实际的数据路径
        return '/Users/chiuyu/Projects/hanli-master/hanli-app/data';
    }

    /**
     * 打开数据文件夹
     */
    openDataFolder() {
        // 这里应该调用主进程API打开文件夹
        console.log('打开数据文件夹');
        this.showToast('正在打开数据文件夹...');
    }

    /**
     * 清理缓存
     */
    clearCache() {
        if (confirm('确定要清理缓存吗？这将删除所有临时文件。')) {
            // 这里应该调用主进程API清理缓存
            console.log('清理缓存');
            this.showToast('缓存清理完成');
        }
    }

    /**
     * 显示Toast通知
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型
     */
    showToast(message, type = 'info') {
        // 创建toast元素
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // 添加样式
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '6px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '10000',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });
        
        // 根据类型设置背景色
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        toast.style.backgroundColor = colors[type] || colors.info;
        
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
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.remove();
        }
        
        // 清理全局引用
        if (window.settingsModalInstance === this) {
            window.settingsModalInstance = null;
        }
    }

    /**
     * 销毁组件
     */
    destroy() {
        this.close();
        this.callbacks = {};
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SettingsModal;
} else {
    window.SettingsModal = SettingsModal;
}
