/**
 * SettingsPage 组件
 * 系统设置页面，采用左侧菜单导航的布局方式
 */
class SettingsPage {
    constructor() {
        this.activeSection = 'general'; // 当前激活的设置区域
        this.settings = {
            // 通用设置
            theme: 'auto',
            backgroundColor: 'default',
            
            // 功能设置
            autoRefresh: true,
            showCollectTime: true,
            dataPath: '',
            
            // 快捷键设置
            shortcuts: {
                search: '⌘/Ctrl + F',
                closeTab: '⌘/Ctrl + W',
                settings: '⌘/Ctrl + ,'
            }
        };
        
        this.callbacks = {
            onSave: null,
            onThemeChange: null,
            onBackgroundColorChange: null
        };
        
        // 初始化子组件
        this.initComponents();
    }

    /**
     * 初始化子组件
     */
    initComponents() {
        // 初始化主题选择器
        this.themeSelector = new ThemeSelector({
            currentTheme: this.settings.theme,
            onThemeChange: (theme) => {
                this.settings.theme = theme;
                if (this.callbacks.onThemeChange) {
                    this.callbacks.onThemeChange(theme);
                }
            }
        });

        // 初始化背景色选择器
        this.backgroundColorSelector = new BackgroundColorSelector({
            currentBackgroundColor: this.settings.backgroundColor,
            onBackgroundColorChange: (bgColor) => {
                this.settings.backgroundColor = bgColor;
                if (this.callbacks.onBackgroundColorChange) {
                    this.callbacks.onBackgroundColorChange(bgColor);
                }
            }
        });

        // 初始化Switch组件
        this.autoRefreshSwitch = new Switch({
            id: 'auto-refresh-switch',
            checked: this.settings.autoRefresh,
            onChange: (checked) => {
                this.settings.autoRefresh = checked;
            }
        });

        this.showCollectTimeSwitch = new Switch({
            id: 'show-collect-time-switch',
            checked: this.settings.showCollectTime,
            onChange: (checked) => {
                this.settings.showCollectTime = checked;
            }
        });
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
        
        // 同步子组件
        if (settings.theme) {
            this.themeSelector.setTheme(settings.theme);
        }
        if (settings.backgroundColor) {
            this.backgroundColorSelector.setBackgroundColor(settings.backgroundColor);
        }
    }

    /**
     * 获取当前设置
     * @returns {Object} 设置对象
     */
    getSettings() {
        return { ...this.settings };
    }

    /**
     * 渲染设置页面
     * @returns {string} HTML字符串
     */
    render() {
        return `
            <div class="settings-page" id="settings-page">
                <div class="settings-container">
                    <!-- 左侧菜单 -->
                    <div class="settings-sidebar">
                        ${this.renderSidebar()}
                    </div>
                    
                    <!-- 右侧内容区域 -->
                    <div class="settings-content">
                        ${this.renderContent()}
                    </div>
                </div>
                
                <!-- 页面样式 -->
                <style>
                    ${this.getStyles()}
                </style>
            </div>
        `;
    }

    /**
     * 渲染左侧菜单
     * @returns {string} HTML字符串
     */
    renderSidebar() {
        const menuItems = [
            { id: 'general', label: '通用设置', icon: 'gear' },
            { id: 'function', label: '功能设置', icon: 'function' },
            { id: 'shortcuts', label: '快捷键', icon: 'keyboard' }
        ];

        return `
            <div class="sidebar-header">
                <h2 class="sidebar-title">系统设置</h2>
            </div>
            
            <nav class="sidebar-nav">
                ${menuItems.map(item => `
                    <div class="nav-item ${this.activeSection === item.id ? 'active' : ''}" 
                         data-section="${item.id}">
                        <div class="nav-icon svg-icon" data-icon="${item.icon}" data-filled="false"></div>
                        <span class="nav-label">${item.label}</span>
                    </div>
                `).join('')}
            </nav>
        `;
    }

    /**
     * 渲染右侧内容区域
     * @returns {string} HTML字符串
     */
    renderContent() {
        const sections = {
            general: this.renderGeneralSettings(),
            function: this.renderFunctionSettings(),
            shortcuts: this.renderShortcutsSettings()
        };

        return `
            <div class="content-header">
                <h3 class="content-title">${this.getSectionTitle()}</h3>
                <p class="content-description">${this.getSectionDescription()}</p>
            </div>
            
            <div class="content-body">
                ${sections[this.activeSection] || ''}
            </div>
            
            <div class="content-footer">
                ${this.renderFooter()}
            </div>
        `;
    }

    /**
     * 渲染通用设置
     * @returns {string} HTML字符串
     */
    renderGeneralSettings() {
        return `
            <div class="settings-section">
                <div class="setting-group">
                    <h4 class="group-title">外观设置</h4>
                    
                    <div class="setting-item">
                        <label class="setting-label">主题设置</label>
                        <div class="setting-control">
                            ${this.themeSelector.render()}
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <label class="setting-label">背景色设置</label>
                        <div class="setting-control">
                            ${this.backgroundColorSelector.render()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 渲染功能设置
     * @returns {string} HTML字符串
     */
    renderFunctionSettings() {
        return `
            <div class="settings-section">
                <div class="setting-group">
                    <h4 class="group-title">数据管理</h4>
                    
                    <div class="setting-item">
                        <label class="setting-label">数据存储路径</label>
                        <div class="setting-control">
                            <input type="text" class="setting-input" id="data-path" 
                                   value="${this.getDataPath()}" readonly>
                            <div class="setting-actions">
                                <button class="btn-secondary btn-sm" id="open-folder-btn">打开文件夹</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <label class="setting-label">缓存管理</label>
                        <div class="setting-control">
                            <div class="setting-actions">
                                <button class="btn-warning btn-sm" id="clear-cache-btn">清除缓存</button>
                            </div>
                            <div class="setting-description">清理临时文件和缓存数据</div>
                        </div>
                    </div>
                </div>
                
                <div class="setting-group">
                    <h4 class="group-title">显示设置</h4>
                    
                    <div class="setting-item">
                        <label class="setting-label">自动刷新产品数据</label>
                        <div class="setting-control">
                            <div id="auto-refresh-switch-container"></div>
                            <div class="setting-description">在首页时每5秒自动刷新产品总数</div>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <label class="setting-label">显示采集时间</label>
                        <div class="setting-control">
                            <div id="show-collect-time-switch-container"></div>
                            <div class="setting-description">在产品列表中显示采集时间</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 渲染快捷键设置
     * @returns {string} HTML字符串
     */
    renderShortcutsSettings() {
        const shortcuts = [
            { key: '⌘/Ctrl + F', description: '打开搜索框' },
            { key: '⌘/Ctrl + W', description: '关闭当前Tab或窗口' },
            { key: '⌘/Ctrl + ,', description: '打开系统设置' },
            { key: '⌘/Ctrl + R', description: '刷新当前页面' },
            { key: '⌘/Ctrl + N', description: '新建Tab' }
        ];

        return `
            <div class="settings-section">
                <div class="setting-group">
                    <h4 class="group-title">快捷键列表</h4>
                    
                    <div class="shortcuts-container">
                        ${shortcuts.map(shortcut => `
                            <div class="shortcut-item">
                                <kbd class="shortcut-key">${shortcut.key}</kbd>
                                <span class="shortcut-description">${shortcut.description}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 渲染页面底部
     * @returns {string} HTML字符串
     */
    renderFooter() {
        return `
            <div class="footer-actions">
                <button class="btn-secondary btn-m" id="cancel-btn">取消</button>
                <button class="btn-primary btn-m" id="save-btn">保存设置</button>
            </div>
        `;
    }

    /**
     * 获取当前区域标题
     * @returns {string} 标题
     */
    getSectionTitle() {
        const titles = {
            general: '通用设置',
            function: '功能设置',
            shortcuts: '快捷键'
        };
        return titles[this.activeSection] || '设置';
    }

    /**
     * 获取当前区域描述
     * @returns {string} 描述
     */
    getSectionDescription() {
        const descriptions = {
            general: '设置应用的外观偏好',
            function: '配置应用功能和数据管理选项',
            shortcuts: '查看和管理应用快捷键'
        };
        return descriptions[this.activeSection] || '';
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
     * 绑定事件监听器
     */
    bindEvents() {
        const container = document.getElementById('settings-page');
        if (!container) return;

        // 左侧菜单点击事件
        const navItems = container.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                this.switchSection(section);
            });
        });


        // 按钮事件
        const saveBtn = container.querySelector('#save-btn');
        const cancelBtn = container.querySelector('#cancel-btn');
        const openFolderBtn = container.querySelector('#open-folder-btn');
        const clearCacheBtn = container.querySelector('#clear-cache-btn');

        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.save());
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.cancel());
        }
        if (openFolderBtn) {
            openFolderBtn.addEventListener('click', () => this.openDataFolder());
        }
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => this.clearCache());
        }

        // 绑定子组件事件
        this.bindSubComponentEvents();
    }

    /**
     * 绑定子组件事件
     */
    bindSubComponentEvents() {
        const container = document.getElementById('settings-page');
        if (!container) return;

        // 绑定主题选择器事件
        const themeSelectorContainer = container.querySelector('.theme-selector');
        if (themeSelectorContainer) {
            this.themeSelector.bindEvents(themeSelectorContainer);
        }

        // 绑定背景色选择器事件
        const backgroundColorSelectorContainer = container.querySelector('.background-color-selector');
        if (backgroundColorSelectorContainer) {
            this.backgroundColorSelector.bindEvents(backgroundColorSelectorContainer);
        }

        // 渲染Switch组件
        const autoRefreshContainer = container.querySelector('#auto-refresh-switch-container');
        if (autoRefreshContainer) {
            autoRefreshContainer.innerHTML = this.autoRefreshSwitch.render();
            this.autoRefreshSwitch.bindEvents();
        }

        const showCollectTimeContainer = container.querySelector('#show-collect-time-switch-container');
        if (showCollectTimeContainer) {
            showCollectTimeContainer.innerHTML = this.showCollectTimeSwitch.render();
            this.showCollectTimeSwitch.bindEvents();
        }
    }

    /**
     * 切换设置区域
     * @param {string} section - 区域ID
     */
    switchSection(section) {
        if (this.activeSection === section) return;

        this.activeSection = section;
        this.updateUI();
    }

    /**
     * 更新UI显示
     */
    updateUI() {
        const container = document.getElementById('settings-page');
        if (!container) return;

        // 更新左侧菜单激活状态
        const navItems = container.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.section === this.activeSection);
        });

        // 更新右侧内容
        const contentBody = container.querySelector('.content-body');
        const contentTitle = container.querySelector('.content-title');
        const contentDescription = container.querySelector('.content-description');

        if (contentBody) {
            contentBody.innerHTML = this.getSectionContent();
        }
        if (contentTitle) {
            contentTitle.textContent = this.getSectionTitle();
        }
        if (contentDescription) {
            contentDescription.textContent = this.getSectionDescription();
        }

        // 重新绑定子组件事件
        setTimeout(() => {
            this.bindSubComponentEvents();
        }, 100);
    }

    /**
     * 获取当前区域内容
     * @returns {string} HTML字符串
     */
    getSectionContent() {
        const sections = {
            general: this.renderGeneralSettings(),
            function: this.renderFunctionSettings(),
            shortcuts: this.renderShortcutsSettings()
        };
        return sections[this.activeSection] || '';
    }

    /**
     * 加载当前设置
     */
    loadCurrentSettings() {
        // 从localStorage加载设置
        const savedTheme = localStorage.getItem('app-theme') || 'auto';
        const savedAutoRefresh = localStorage.getItem('app-auto-refresh') !== 'false';
        const savedShowCollectTime = localStorage.getItem('app-show-collect-time') !== 'false';
        const savedBackgroundColor = localStorage.getItem('app-background-color') || 'default';

        this.settings = {
            ...this.settings,
            theme: savedTheme,
            autoRefresh: savedAutoRefresh,
            showCollectTime: savedShowCollectTime,
            backgroundColor: savedBackgroundColor,
        };

        // 更新子组件
        this.themeSelector.setTheme(this.settings.theme);
        this.backgroundColorSelector.setBackgroundColor(this.settings.backgroundColor);
    }

    /**
     * 保存设置
     */
    save() {
        try {
            // 保存主题设置
            localStorage.setItem('app-theme', this.settings.theme);
            
            // 保存背景色设置
            localStorage.setItem('app-background-color', this.settings.backgroundColor);
            
            // 保存功能设置
            localStorage.setItem('app-auto-refresh', this.settings.autoRefresh.toString());
            localStorage.setItem('app-show-collect-time', this.settings.showCollectTime.toString());

            // 触发保存回调
            if (this.callbacks.onSave) {
                this.callbacks.onSave(this.settings);
            }

            // 显示保存成功提示
            this.showToast('设置已保存', 'success');
            
        } catch (error) {
            console.error('保存设置时发生错误:', error);
            this.showToast('保存设置失败，请重试', 'error');
        }
    }

    /**
     * 取消设置
     */
    cancel() {
        // 恢复原始设置
        this.loadCurrentSettings();
        
        // 触发取消回调
        if (this.callbacks.onCancel) {
            this.callbacks.onCancel();
        }
        
        this.showToast('已取消更改', 'info');
    }

    /**
     * 打开数据文件夹
     */
    openDataFolder() {
        // 这里应该调用主进程API打开文件夹
        console.log('打开数据文件夹');
        this.showToast('正在打开数据文件夹...', 'info');
    }

    /**
     * 清理缓存
     */
    clearCache() {
        if (confirm('确定要清理缓存吗？这将删除所有临时文件。')) {
            // 这里应该调用主进程API清理缓存
            console.log('清理缓存');
            this.showToast('缓存清理完成', 'success');
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
            success: 'var(--color-success)',
            error: 'var(--color-error)',
            warning: 'var(--color-warning)',
            info: 'var(--color-info)'
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
     * 获取页面样式
     * @returns {string} CSS样式
     */
    getStyles() {
        return `
            .settings-page {
                width: 100%;
                height: 100vh;
                display: flex;
                flex-direction: column;
                background: var(--color-body-bg-default);
            }
            
            .settings-container {
                flex: 1;
                display: flex;
                min-height: 0;
            }
            
            .settings-sidebar {
                width: 240px;
                background: var(--color-background-normal);
                display: flex;
                flex-direction: column;
            }
            
            .sidebar-header {
                padding: 24px 20px;
            }
            
            .sidebar-title {
                font-size: 18px;
                font-weight: 600;
                color: var(--color-primary);
                margin: 0;
            }
            
            .sidebar-nav {
                flex: 1;
                padding: 16px 0;
            }
            
            .nav-item {
                display: flex;
                align-items: center;
                padding: 12px 20px;
                cursor: pointer;
                transition: all 0.2s ease;
                color: var(--color-secondary);
                border-left: 3px solid transparent;
            }
            
            .nav-item:hover {
                background: var(--color-background-focused);
                color: var(--color-primary);
            }
            
            .nav-item.active {
                background: var(--color-background-focused);
                color: var(--color-focused);
                border-left-color: var(--color-info);
            }
            
            .nav-icon {
                width: 20px;
                height: 20px;
                margin-right: 12px;
            }
            
            .nav-label {
                font-size: 14px;
                font-weight: 500;
            }
            
            .settings-content {
                flex: 1;
                display: flex;
                flex-direction: column;
                padding: 24px 32px;
                overflow-y: auto;
            }
            
            .content-header {
                margin-bottom: 32px;
            }
            
            .content-title {
                font-size: 24px;
                font-weight: 600;
                color: var(--color-primary);
                margin: 0 0 8px 0;
            }
            
            .content-description {
                font-size: 14px;
                color: var(--color-secondary);
                margin: 0;
            }
            
            .content-body {
                flex: 1;
                margin-bottom: 32px;
            }
            
            .content-footer {
                padding-top: 24px;
            }
            
            .settings-section {
                display: flex;
                flex-direction: column;
                gap: 32px;
            }
            
            .setting-group {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .group-title {
                font-size: 16px;
                font-weight: 600;
                color: var(--color-primary);
                margin: 0;
                padding-bottom: 8px;
            }
            
            .setting-item {
                display: flex;
                align-items: flex-start;
                gap: 16px;
                padding: 16px 0;
            }
            
            .setting-label {
                min-width: 120px;
                font-size: 14px;
                font-weight: 500;
                color: var(--color-primary);
                margin: 0;
                padding-top: 8px;
            }
            
            .setting-control {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .setting-description {
                font-size: 12px;
                color: var(--color-secondary);
                margin: 0;
            }
            
            .setting-select {
                padding: 8px 12px;
                border: 1px solid var(--color-border-normal);
                border-radius: 6px;
                background: var(--color-background-normal);
                color: var(--color-primary);
                font-size: 14px;
                transition: all 0.2s ease;
            }
            
            .setting-select:focus {
                outline: none;
                border-color: var(--color-info);
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .setting-input {
                padding: 8px 12px;
                border: 1px solid var(--color-border-normal);
                border-radius: 6px;
                background: var(--color-background-normal);
                color: var(--color-primary);
                font-size: 14px;
                transition: all 0.2s ease;
                flex: 1;
            }
            
            .setting-input:focus {
                outline: none;
                border-color: var(--color-info);
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .setting-input:read-only {
                background: var(--color-background-focused);
                color: var(--color-secondary);
                cursor: not-allowed;
            }
            
            .setting-actions {
                display: flex;
                gap: 8px;
                align-items: center;
            }
            
            .btn-primary, .btn-secondary, .btn-warning {
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            
            .btn-primary {
                background: var(--color-info);
                color: white;
            }
            
            .btn-primary:hover {
                background: var(--color-info);
                opacity: 0.9;
            }
            
            .btn-secondary {
                background: var(--color-background-normal);
                color: var(--color-primary);
                border: 1px solid var(--color-border-normal);
            }
            
            .btn-secondary:hover {
                background: var(--color-background-focused);
            }
            
            .btn-warning {
                background: var(--color-warning);
                color: white;
            }
            
            .btn-warning:hover {
                background: var(--color-warning);
                opacity: 0.9;
            }
            
            .btn-sm {
                padding: 6px 12px;
                font-size: 12px;
            }
            
            .btn-m {
                padding: 10px 20px;
                font-size: 14px;
            }
            
            .footer-actions {
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }
            
            .shortcuts-container {
                display: flex;
                flex-direction: column;
                gap: 8px;
                padding: 16px;
                background: var(--color-background-normal);
                border-radius: var(--radius-card);
            }
            
            .shortcut-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 12px;
                background: var(--color-background-focused);
                border-radius: var(--radius-medium);
                transition: all 0.2s ease;
            }
            
            .shortcut-item:hover {
                background: var(--color-background-focused);
                border-color: var(--color-info);
            }
            
            .shortcut-key {
                display: inline-flex;
                align-items: center;
                padding: 4px 8px;
                background: var(--color-background-normal);
                border: 1px solid var(--color-border-normal);
                border-radius: 4px;
                font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
                font-size: 12px;
                font-weight: 600;
                color: var(--color-primary);
                min-width: 80px;
                justify-content: center;
            }
            
            .shortcut-description {
                font-size: 13px;
                color: var(--color-secondary);
                flex: 1;
                margin-left: 12px;
            }
            
            /* 响应式设计 */
            @media (max-width: 768px) {
                .settings-container {
                    flex-direction: column;
                }
                
                .settings-sidebar {
                    width: 100%;
                    height: auto;
                }
                
                .sidebar-nav {
                    display: flex;
                    overflow-x: auto;
                    padding: 0 16px;
                }
                
                .nav-item {
                    flex-shrink: 0;
                    white-space: nowrap;
                    border-left: none;
                    border-bottom: 3px solid transparent;
                }
                
                .nav-item.active {
                    border-left: none;
                    border-bottom-color: var(--color-info);
                }
                
                .settings-content {
                    padding: 16px;
                }
                
                .setting-item {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 8px;
                }
                
                .setting-label {
                    min-width: auto;
                    padding-top: 0;
                }
                
                .shortcut-item {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 8px;
                }
                
                .shortcut-description {
                    margin-left: 0;
                }
            }
        `;
    }

    /**
     * 销毁组件
     */
    destroy() {
        // 销毁子组件
        if (this.themeSelector) {
            this.themeSelector.destroy();
        }
        if (this.backgroundColorSelector) {
            this.backgroundColorSelector.destroy();
        }
        
        this.callbacks = {};
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SettingsPage;
} else {
    window.SettingsPage = SettingsPage;
}
