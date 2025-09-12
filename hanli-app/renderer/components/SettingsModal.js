/**
 * 设置弹窗组件
 * 提供应用设置功能的弹窗界面
 */
class SettingsModal {
    constructor(app) {
        this.app = app;
        this.isVisible = false;
        this.element = null;
        this.currentSection = 'general';
        
        this.init();
    }

    /**
     * 初始化组件
     */
    init() {
        this.createElement();
        this.bindEvents();
        this.loadSettings();
    }

    /**
     * 创建DOM元素
     */
    createElement() {
        this.element = document.createElement('div');
        this.element.className = 'settings-modal';
        this.element.id = 'settingsModal';
        this.element.style.display = 'none';
        
        this.element.innerHTML = `
            <div class="settings-modal-content">
                <!-- 设置弹窗头部 -->
                <div class="settings-header">
                    <h2 class="settings-title">设置</h2>
                    <button class="settings-close-btn" id="settingsCloseBtn" title="关闭设置">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>

                <!-- 设置内容区域 -->
                <div class="settings-body">
                    <!-- 左侧设置项列表 -->
                    <div class="settings-sidebar">
                        <div class="settings-nav">
                            <button class="settings-nav-item active" data-section="general">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                                    <path d="M19.4 15A1.65 1.65 0 0 0 21 12A1.65 1.65 0 0 0 19.4 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M4.6 9A1.65 1.65 0 0 1 3 12A1.65 1.65 0 0 1 4.6 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M12 1V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M12 21V23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M4.22 4.22L5.64 5.64" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M18.36 18.36L19.78 19.78" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                常规设置
                            </button>
                            <button class="settings-nav-item" data-section="appearance">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
                                    <path d="M12 1V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M12 21V23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M4.22 4.22L5.64 5.64" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M18.36 18.36L19.78 19.78" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M1 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M21 12H23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M4.22 19.78L5.64 18.36" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M18.36 5.64L19.78 4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                外观设置
                            </button>
                            <button class="settings-nav-item" data-section="data">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                数据管理
                            </button>
                            <button class="settings-nav-item" data-section="about">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                关于应用
                            </button>
                        </div>
                    </div>

                    <!-- 右侧设置内容 -->
                    <div class="settings-content">
                        <!-- 常规设置 -->
                        <div class="settings-section active" id="general-settings">
                            <h3 class="settings-section-title">常规设置</h3>
                            <div class="settings-group">
                                <div class="settings-item">
                                    <div class="settings-item-label">
                                        <label for="autoStart">开机自启动</label>
                                        <span class="settings-item-desc">应用启动时自动打开</span>
                                    </div>
                                    <div class="settings-item-control">
                                        <input type="checkbox" id="autoStart" class="settings-checkbox">
                                    </div>
                                </div>
                                <div class="settings-item">
                                    <div class="settings-item-label">
                                        <label for="minimizeToTray">最小化到系统托盘</label>
                                        <span class="settings-item-desc">关闭窗口时最小化到系统托盘</span>
                                    </div>
                                    <div class="settings-item-control">
                                        <input type="checkbox" id="minimizeToTray" class="settings-checkbox">
                                    </div>
                                </div>
                                <div class="settings-item">
                                    <div class="settings-item-label">
                                        <label for="checkUpdates">自动检查更新</label>
                                        <span class="settings-item-desc">定期检查应用更新</span>
                                    </div>
                                    <div class="settings-item-control">
                                        <input type="checkbox" id="checkUpdates" class="settings-checkbox" checked>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 外观设置 -->
                        <div class="settings-section" id="appearance-settings">
                            <h3 class="settings-section-title">外观设置</h3>
                            <div class="settings-group">
                                <div class="settings-item">
                                    <div class="settings-item-label">
                                        <label for="themeSelect">主题</label>
                                        <span class="settings-item-desc">选择应用主题</span>
                                    </div>
                                    <div class="settings-item-control">
                                        <select id="themeSelect" class="settings-select">
                                            <option value="system">跟随系统</option>
                                            <option value="light">浅色主题</option>
                                            <option value="dark">深色主题</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="settings-item">
                                    <div class="settings-item-label">
                                        <label for="windowOpacity">窗口透明度</label>
                                        <span class="settings-item-desc">调整窗口背景透明度</span>
                                    </div>
                                    <div class="settings-item-control">
                                        <input type="range" id="windowOpacity" class="settings-range" min="0.5" max="1" step="0.1" value="0.8">
                                        <span class="settings-range-value">80%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 数据管理 -->
                        <div class="settings-section" id="data-settings">
                            <h3 class="settings-section-title">数据管理</h3>
                            <div class="settings-group">
                                <div class="settings-item">
                                    <div class="settings-item-label">
                                        <label>当前数据路径</label>
                                        <span class="settings-item-desc" id="currentDataPath">未选择</span>
                                    </div>
                                    <div class="settings-item-control">
                                        <button class="settings-btn" id="changeDataPathBtn">更改路径</button>
                                    </div>
                                </div>
                                <div class="settings-item">
                                    <div class="settings-item-label">
                                        <label>清除缓存</label>
                                        <span class="settings-item-desc">清除应用缓存数据</span>
                                    </div>
                                    <div class="settings-item-control">
                                        <button class="settings-btn" id="clearCacheBtn">清除缓存</button>
                                    </div>
                                </div>
                                <div class="settings-item">
                                    <div class="settings-item-label">
                                        <label>导出设置</label>
                                        <span class="settings-item-desc">导出当前设置配置</span>
                                    </div>
                                    <div class="settings-item-control">
                                        <button class="settings-btn" id="exportSettingsBtn">导出</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 关于应用 -->
                        <div class="settings-section" id="about-settings">
                            <h3 class="settings-section-title">关于应用</h3>
                            <div class="settings-group">
                                <div class="settings-item">
                                    <div class="settings-item-label">
                                        <label>应用名称</label>
                                        <span class="settings-item-desc">韩立客户端</span>
                                    </div>
                                </div>
                                <div class="settings-item">
                                    <div class="settings-item-label">
                                        <label>版本号</label>
                                        <span class="settings-item-desc" id="appVersion">1.0.0</span>
                                    </div>
                                </div>
                                <div class="settings-item">
                                    <div class="settings-item-label">
                                        <label>构建日期</label>
                                        <span class="settings-item-desc" id="buildDate">2024-01-01</span>
                                    </div>
                                </div>
                                <div class="settings-item">
                                    <div class="settings-item-label">
                                        <label>开发者</label>
                                        <span class="settings-item-desc">韩立团队</span>
                                    </div>
                                </div>
                            </div>
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
        const closeBtn = this.element.querySelector('#settingsCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide();
            });
        }

        // 点击背景关闭
        this.element.addEventListener('click', (e) => {
            if (e.target === this.element) {
                this.hide();
            }
        });

        // 导航按钮
        const navItems = this.element.querySelectorAll('.settings-nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                this.switchSection(section);
            });
        });

        // 设置项事件
        this.bindSettingsEvents();
    }

    /**
     * 绑定设置项事件
     */
    bindSettingsEvents() {
        // 主题选择
        const themeSelect = this.element.querySelector('#themeSelect');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.handleThemeChange(e.target.value);
            });
        }

        // 窗口透明度
        const opacityRange = this.element.querySelector('#windowOpacity');
        if (opacityRange) {
            opacityRange.addEventListener('input', (e) => {
                this.handleOpacityChange(e.target.value);
            });
        }

        // 数据路径更改
        const changeDataPathBtn = this.element.querySelector('#changeDataPathBtn');
        if (changeDataPathBtn) {
            changeDataPathBtn.addEventListener('click', () => {
                this.handleChangeDataPath();
            });
        }

        // 清除缓存
        const clearCacheBtn = this.element.querySelector('#clearCacheBtn');
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => {
                this.handleClearCache();
            });
        }

        // 导出设置
        const exportSettingsBtn = this.element.querySelector('#exportSettingsBtn');
        if (exportSettingsBtn) {
            exportSettingsBtn.addEventListener('click', () => {
                this.handleExportSettings();
            });
        }
    }

    /**
     * 显示弹窗
     */
    show() {
        this.element.style.display = 'flex';
        this.isVisible = true;
        this.updateDataPath();
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
     * 切换设置部分
     */
    switchSection(section) {
        // 更新导航状态
        const navItems = this.element.querySelectorAll('.settings-nav-item');
        navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.section === section);
        });

        // 更新内容显示
        const sections = this.element.querySelectorAll('.settings-section');
        sections.forEach(sectionEl => {
            sectionEl.classList.toggle('active', sectionEl.id === `${section}-settings`);
        });

        this.currentSection = section;
    }

    /**
     * 加载设置
     */
    loadSettings() {
        // 加载主题设置
        const themeSelect = this.element.querySelector('#themeSelect');
        if (themeSelect && this.app.currentTheme) {
            themeSelect.value = this.app.currentTheme;
        }

        // 加载其他设置
        this.loadStoredSettings();
    }

    /**
     * 加载存储的设置
     */
    loadStoredSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
            
            // 加载复选框设置
            const checkboxes = this.element.querySelectorAll('.settings-checkbox');
            checkboxes.forEach(checkbox => {
                const settingKey = checkbox.id;
                if (settings[settingKey] !== undefined) {
                    checkbox.checked = settings[settingKey];
                }
            });

            // 加载范围设置
            const opacityRange = this.element.querySelector('#windowOpacity');
            if (opacityRange && settings.windowOpacity !== undefined) {
                opacityRange.value = settings.windowOpacity;
                this.updateOpacityDisplay(settings.windowOpacity);
            }
        } catch (error) {
            console.error('加载设置失败:', error);
        }
    }

    /**
     * 保存设置
     */
    saveSettings() {
        try {
            const settings = {};
            
            // 保存复选框设置
            const checkboxes = this.element.querySelectorAll('.settings-checkbox');
            checkboxes.forEach(checkbox => {
                settings[checkbox.id] = checkbox.checked;
            });

            // 保存范围设置
            const opacityRange = this.element.querySelector('#windowOpacity');
            if (opacityRange) {
                settings.windowOpacity = opacityRange.value;
            }

            // 保存主题设置
            const themeSelect = this.element.querySelector('#themeSelect');
            if (themeSelect) {
                settings.theme = themeSelect.value;
            }

            localStorage.setItem('appSettings', JSON.stringify(settings));
        } catch (error) {
            console.error('保存设置失败:', error);
        }
    }

    /**
     * 处理主题变更
     */
    handleThemeChange(theme) {
        if (this.app && typeof this.app.setTheme === 'function') {
            this.app.setTheme(theme);
        }
        this.saveSettings();
    }

    /**
     * 处理透明度变更
     */
    handleOpacityChange(value) {
        this.updateOpacityDisplay(value);
        this.saveSettings();
    }

    /**
     * 更新透明度显示
     */
    updateOpacityDisplay(value) {
        const display = this.element.querySelector('.settings-range-value');
        if (display) {
            display.textContent = Math.round(value * 100) + '%';
        }
    }

    /**
     * 处理更改数据路径
     */
    handleChangeDataPath() {
        if (this.app && typeof this.app.selectDataFolder === 'function') {
            this.app.selectDataFolder();
        }
    }

    /**
     * 处理清除缓存
     */
    handleClearCache() {
        if (confirm('确定要清除所有缓存数据吗？此操作不可撤销。')) {
            try {
                localStorage.clear();
                this.app.updateStatus('缓存已清除');
                this.hide();
            } catch (error) {
                console.error('清除缓存失败:', error);
                this.app.updateStatus('清除缓存失败');
            }
        }
    }

    /**
     * 处理导出设置
     */
    handleExportSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
            const dataStr = JSON.stringify(settings, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'hanli-settings.json';
            link.click();
            
            URL.revokeObjectURL(url);
            this.app.updateStatus('设置已导出');
        } catch (error) {
            console.error('导出设置失败:', error);
            this.app.updateStatus('导出设置失败');
        }
    }

    /**
     * 更新数据路径显示
     */
    updateDataPath() {
        const dataPathElement = this.element.querySelector('#currentDataPath');
        if (dataPathElement && this.app && this.app.dataPath) {
            dataPathElement.textContent = this.app.dataPath;
        }
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
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SettingsModal;
} else {
    window.SettingsModal = SettingsModal;
}
