/**
 * SettingsModal 组件
 * 负责系统设置弹窗的渲染和交互逻辑
 */
class SettingsModal {
    constructor() {
        this.isOpen = false;
        this.activeSection = 'general'; // 当前激活的设置区域
        this.settings = {
            theme: 'auto',
            backgroundColor: 'default',
        };
        this.callbacks = {
            onSave: null,
            onCancel: null,
            onThemeChange: null,
            onBackgroundColorChange: null
        };
        
        // 初始化主题选择器组件
        this.themeSelector = new Select({
            options: [
                { value: 'light', label: '浅色主题' },
                { value: 'dark', label: '深色主题' },
                { value: 'auto', label: '跟随系统' }
            ],
            value: this.settings.theme,
            placeholder: '请选择主题',
            className: 'theme-select',
            onChange: (theme) => {
                this.settings.theme = theme;
                this.previewTheme(theme);
                if (this.callbacks.onThemeChange) {
                    this.callbacks.onThemeChange(theme);
                }
            }
        });

        // 初始化背景色选择器组件
        this.backgroundColorSelector = new BackgroundColorSelector({
            currentBackgroundColor: this.settings.backgroundColor,
            onBackgroundColorChange: (bgColor) => {
                this.settings.backgroundColor = bgColor;
                if (this.callbacks.onBackgroundColorChange) {
                    this.callbacks.onBackgroundColorChange(bgColor);
                }
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
        // 同步主题选择器
        if (settings.theme) {
            this.themeSelector.setValue(settings.theme);
        }
        
        // 同步背景色选择器
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
     * 显示设置弹窗（open方法的别名）
     */
    show() {
        this.open();
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
        // 如果弹窗已存在，先移除
        this.removeModal();
        
        const modalHTML = `
            <div class="settings-modal" id="settings-modal">
                <div class="modal-overlay" onclick="window.settingsModalInstance.close()">
                    <div class="modal-content settings-modal-content" onclick="event.stopPropagation()">
                        <div class="modal-header">
                            <h2 class="modal-title">系统设置</h2>
                        </div>
                        
                        <div class="settings-modal-body">
                            <div class="settings-sidebar">
                                ${this.renderSidebarMenu()}
                            </div>
                            
                            <div class="settings-content">
                                ${this.renderSettingsContent()}
                            </div>
                        </div>
                        
                        <style>
                            /* 模态框固定高度样式 */
                            .settings-modal-content {
                                height: 600px;
                                max-height: 80vh;
                                display: flex;
                                flex-direction: column;
                            }
                            
                            .settings-modal-body {
                                flex: 1;
                                display: flex;
                                overflow: hidden;
                            }
                            
                            .settings-sidebar {
                                width: 200px;
                                flex-shrink: 0;
                                border-right: 1px solid var(--color-border-normal);
                                padding: 16px 16px;
                                overflow-y: auto;
                            }
                            
                            .settings-menu {
                                padding: 0;
                            }
                            
                            .settings-content {
                                flex: 1;
                                padding: 16px 24px;
                                overflow-y: auto;
                            }
                            
                            .modal-footer {
                                padding: 16px 24px;
                                border-top: 1px solid var(--color-border-normal);
                                display: flex;
                                justify-content: flex-end;
                                background: var(--color-surface-primary);
                            }
                            
                            /* 侧边栏项目样式 - 与SidebarItem组件保持一致 */
                            .sidebar-item {
                                position: relative;
                                cursor: pointer;
                                transition: all 0.2s ease;
                                border-radius: 6px;
                                margin-bottom: 2px;
                                user-select: none;
                                height: 40px;
                                padding: 0 12px;
                            }

                            .sidebar-item:hover:not(.disabled) {
                                background: var(--color-background-focused);
                            }

                            .sidebar-item.active {
                                background: var(--color-background-focused);
                            }

                            .sidebar-item.disabled {
                                opacity: 0.5;
                                cursor: not-allowed;
                            }

                            .sidebar-item-content {
                                display: flex;
                                align-items: center;
                                gap: 12px;
                                height: 100%;
                            }

                            .sidebar-item-icon {
                                width: 20px;
                                height: 20px;
                                flex-shrink: 0;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                color: var(--color-secondary);
                                transition: color 0.2s ease;
                            }

                            .sidebar-item.active .sidebar-item-icon {
                                color: var(--color-primary);
                            }

                            .sidebar-item-label {
                                font-size: 14px;
                                font-weight: 500;
                                color: var(--color-primary);
                                transition: color 0.2s ease;
                                line-height: 1.4;
                            }

                            .sidebar-item.active .sidebar-item-label {
                                color: var(--color-primary);
                            }

                            /* Phosphor 图标样式 */
                            .sidebar-item-icon .ph {
                                font-size: 20px;
                                opacity: 0.8;
                            }

                            .sidebar-item.active .sidebar-item-icon .ph {
                                opacity: 1;
                            }

                            /* 响应式设计 */
                            @media (max-width: 768px) {
                                .sidebar-item-content {
                                    gap: 10px;
                                }

                                .sidebar-item-label {
                                    font-size: 13px;
                                }
                            }

                            .shortcuts-list {
                                max-height: 300px;
                                overflow-y: auto;
                                padding: 12px;
                                background: var(--color-surface-secondary);
                                border-radius: var(--radius-lg);
                                border: 1px solid var(--color-border-normal);
                            }
                            
                            
                            .shortcuts-empty {
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                padding: 40px 20px;
                                color: var(--color-text-secondary);
                                text-align: center;
                            }
                            
                            .shortcuts-empty p {
                                margin: 0;
                                font-size: 14px;
                            }
                            
                            .shortcut-items {
                                display: flex;
                                flex-direction: column;
                                gap: 6px;
                            }
                            
                            .shortcut-item {
                                display: flex;
                                align-items: center;
                                justify-content: space-between;
                                padding: 8px 12px;
                                background: var(--color-surface-primary);
                                border-radius: var(--radius-md);
                                border: 1px solid var(--color-border-normal);
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
                                background: var(--color-surface-secondary);
                                border: 1px solid var(--color-border-normal);
                                border-radius: var(--radius-sm);
                                font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
                                font-size: 12px;
                                font-weight: 600;
                                color: var(--color-text-primary);
                                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                                min-width: 80px;
                                justify-content: center;
                            }
                            
                            .shortcut-description {
                                font-size: 13px;
                                color: var(--color-text-secondary);
                                flex: 1;
                                margin-left: 12px;
                            }
                            
                            @media (max-width: 480px) {
                                .shortcut-item {
                                    flex-direction: column;
                                    align-items: flex-start;
                                    gap: 8px;
                                }
                                
                                .shortcut-description {
                                    margin-left: 0;
                                }
                                
                                .shortcut-key {
                                    align-self: flex-start;
                                }
                            }
                        </style>
                        
                        <div class="modal-footer" id="settings-modal-footer">
                            <!-- 按钮将通过JavaScript动态创建 -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 创建按钮
        this.createButtons();
        
        // 设置全局引用
        window.settingsModalInstance = this;
    }

    /**
     * 创建弹窗按钮
     */
    createButtons() {
        // 创建footer按钮
        const footer = document.getElementById('settings-modal-footer');
        if (footer) {
            // 使用MPrimaryButton组件创建完成按钮
            if (window.mPrimaryButtonInstance) {
                const completeButton = window.mPrimaryButtonInstance.create({
                    text: '完成',
                    onClick: () => this.save(),
                    className: 'modal-btn-complete'
                });
                
                footer.appendChild(completeButton);
            } else {
                // 备选方案：创建简单的完成按钮
                const completeButton = document.createElement('button');
                completeButton.textContent = '完成';
                completeButton.className = 'btn btn-primary modal-btn-complete';
                completeButton.style.cssText = `
                    background: var(--color-primary);
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: background-color 0.2s ease;
                `;
                completeButton.addEventListener('click', () => this.save());
                completeButton.addEventListener('mouseenter', () => {
                    completeButton.style.backgroundColor = 'var(--color-primary-hover)';
                });
                completeButton.addEventListener('mouseleave', () => {
                    completeButton.style.backgroundColor = 'var(--color-primary)';
                });
                
                footer.appendChild(completeButton);
                console.warn('MPrimaryButton组件未加载，使用备选按钮');
            }
        }

        // 创建打开文件夹按钮
        const openFolderContainer = document.getElementById('open-folder-btn-container');
        if (openFolderContainer) {
            const openFolderButton = window.buttonInstance.secondary({
                text: '打开文件夹',
                size: 'S',
                onClick: () => this.openDataFolder(),
                className: 'setting-btn'
            });
            openFolderContainer.appendChild(openFolderButton);
        }

    }

    /**
     * 渲染快捷键列表
     * @returns {string} HTML字符串
     */
    renderShortcutsList() {
        // 直接显示快捷键项目，去掉分类嵌套
        const shortcuts = [
            { key: '⌘/Ctrl + F', description: '打开搜索框' },
            { key: '⌘/Ctrl + W', description: '关闭当前Tab或窗口' }
        ];

        return `
            <div class="shortcut-items">
                ${shortcuts.map(item => `
                    <div class="shortcut-item">
                        <kbd class="shortcut-key">${item.key}</kbd>
                        <span class="shortcut-description">${item.description}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }



    /**
     * 渲染左侧菜单
     * @returns {string} HTML字符串
     */
    renderSidebarMenu() {
        const menuItems = [
            { 
                id: 'general', 
                label: '通用', 
                icon: 'ph-gear'
            },
            { 
                id: 'function', 
                label: '功能', 
                icon: 'ph-sliders'
            }
        ];

        return `
            <div class="settings-menu">
                ${menuItems.map(item => `
                    <div class="sidebar-item ${this.activeSection === item.id ? 'active' : ''}" 
                         id="settings-${item.id}" 
                         data-section="${item.id}"
                         onclick="window.settingsModalInstance.switchSection('${item.id}')">
                        <div class="sidebar-item-content">
                            <div class="sidebar-item-icon">
                                <i class="ph ${item.icon}"></i>
                            </div>
                            <div class="sidebar-item-label">${item.label}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }


    /**
     * 切换设置区域
     * @param {string} sectionId - 区域ID
     */
    switchSection(sectionId) {
        this.activeSection = sectionId;
        
        // 更新菜单状态
        this.updateMenuState(sectionId);
        
        // 更新内容区域
        const contentArea = document.querySelector('.settings-content');
        if (contentArea) {
            contentArea.innerHTML = this.renderSettingsContent();
            this.bindContentEvents();
        }
    }

    /**
     * 更新菜单状态
     * @param {string} activeSectionId - 激活的区域ID
     */
    updateMenuState(activeSectionId) {
        const modal = document.getElementById('settings-modal');
        if (!modal) return;

        const menuItems = modal.querySelectorAll('.sidebar-item');
        menuItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === activeSectionId) {
                item.classList.add('active');
            }
        });
    }

    /**
     * 渲染设置内容
     * @returns {string} HTML字符串
     */
    renderSettingsContent() {
        switch (this.activeSection) {
            case 'general':
                return this.renderGeneralSettings();
            case 'function':
                return this.renderFunctionSettings();
            default:
                return this.renderGeneralSettings();
        }
    }

    /**
     * 渲染通用设置内容
     * @returns {string} HTML字符串
     */
    renderGeneralSettings() {
        return `
            <div class="settings-section">
                <h3 class="section-title">外观设置</h3>
                
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
        `;
    }

    /**
     * 渲染功能设置内容
     * @returns {string} HTML字符串
     */
    renderFunctionSettings() {
        return `
            <div class="settings-section">
                <h3 class="section-title">数据存储</h3>
                
                <div class="setting-item">
                    <label class="setting-label">数据存储路径</label>
                    <div class="setting-control">
                        <input type="text" class="setting-input" id="data-path" value="${this.getDataPath()}" readonly>
                        <div id="open-folder-btn-container"></div>
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

        // X按钮已移除，无需绑定关闭按钮事件

        // 绑定 SidebarItem 组件事件
        this.bindSidebarEvents();

        // 绑定内容区域事件
        this.bindContentEvents();
    }

    /**
     * 绑定侧边栏事件
     */
    bindSidebarEvents() {
        const modal = document.getElementById('settings-modal');
        if (!modal) return;

        const settingsMenu = modal.querySelector('.settings-menu');
        if (settingsMenu) {
            this.bindMenuEvents(settingsMenu);
        }
    }

    /**
     * 绑定菜单事件
     * @param {HTMLElement} settingsMenu - 设置菜单容器
     */
    bindMenuEvents(settingsMenu) {
        const menuItems = settingsMenu.querySelectorAll('.sidebar-item');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const sectionId = item.dataset.section;
                if (sectionId) {
                    this.switchSection(sectionId);
                }
            });
        });
    }

    /**
     * 绑定内容区域事件
     */
    bindContentEvents() {
        const modal = document.getElementById('settings-modal');
        if (!modal) return;

        // 绑定主题选择器事件
        const themeSelectorContainer = modal.querySelector('.theme-select');
        if (themeSelectorContainer) {
            this.themeSelector.bindEvents(themeSelectorContainer);
        }

        // 绑定背景色选择器事件
        const backgroundColorSelectorContainer = modal.querySelector('.background-color-selector');
        if (backgroundColorSelectorContainer) {
            this.backgroundColorSelector.bindEvents(backgroundColorSelectorContainer);
        }





        // 注册ESC键关闭快捷键
        this.registerShortcuts();
    }

    /**
     * 注册快捷键
     */
    registerShortcuts() {
        window.keyboardShortcutManager.register('escape', (e) => {
            this.close();
        }, 'settings-modal', '关闭设置弹窗');
    }

    /**
     * 注销快捷键
     */
    unregisterShortcuts() {
        window.keyboardShortcutManager.unregisterContext('settings-modal');
    }


    /**
     * 解绑事件监听器
     */
    unbindEvents() {
        this.unregisterShortcuts();
    }

    /**
     * 预览主题效果
     * @param {string} theme - 主题名称
     */
    previewTheme(theme) {
        const root = document.documentElement;
        const themeColors = document.getElementById('theme-colors');
        
        // 移除现有主题类
        root.classList.remove('theme-light', 'theme-dark', 'theme-auto');
        
        // 添加新主题类
        if (theme === 'auto') {
            // 跟随系统主题
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const actualTheme = prefersDark ? 'dark' : 'light';
            root.classList.add(`theme-${actualTheme}`);
            themeColors.href = `theme/${actualTheme}/colors.css`;
        } else {
            root.classList.add(`theme-${theme}`);
            themeColors.href = `theme/${theme}/colors.css`;
        }
    }

    /**
     * 预览背景色效果
     * @param {string} bgColor - 背景色名称
     */
    previewBackgroundColor(bgColor) {
        const body = document.body;
        
        // 移除现有背景色类
        body.classList.remove('bg-default', 'bg-blue', 'bg-green', 'bg-purple', 'bg-orange', 'bg-pink', 'bg-gray', 'bg-indigo');
        
        // 添加新背景色类
        body.classList.add(`bg-${bgColor}`);
    }




    /**
     * 加载当前设置
     */
    loadCurrentSettings() {
        // 从localStorage加载设置
        const savedTheme = localStorage.getItem('app-theme') || 'auto';
        const savedBackgroundColor = localStorage.getItem('app-background-color') || 'default';

        this.settings = {
            theme: savedTheme,
            backgroundColor: savedBackgroundColor,
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

        // 更新主题选择器
        this.themeSelector.setValue(this.settings.theme);

        // 更新背景色选择器
        this.backgroundColorSelector.setBackgroundColor(this.settings.backgroundColor);




    }

    /**
     * 保存设置
     */
    save() {
        const modal = document.getElementById('settings-modal');
        if (!modal) return;

        try {
            // 主题设置已由ThemeSelector组件处理
            localStorage.setItem('app-theme', this.settings.theme);

            // 背景色设置已由BackgroundColorSelector组件处理
            localStorage.setItem('app-background-color', this.settings.backgroundColor);





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
        const root = document.documentElement;
        const themeColors = document.getElementById('theme-colors');
        
        root.classList.remove('theme-light', 'theme-dark', 'theme-auto');
        
        const theme = localStorage.getItem('app-theme') || 'auto';
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const actualTheme = prefersDark ? 'dark' : 'light';
            root.classList.add(`theme-${actualTheme}`);
            themeColors.href = `theme/${actualTheme}/colors.css`;
        } else {
            root.classList.add(`theme-${theme}`);
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
    module.exports = SettingsModal;
} else {
    window.SettingsModal = SettingsModal;
}
