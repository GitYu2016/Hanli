/**
 * 简化的侧边栏项目组件
 * 只包含图标和文字，支持本地 SVG 图标
 */
class SidebarItem {
    constructor(options = {}) {
        this.id = options.id || this.generateId();
        this.label = options.label || '';
        this.icon = options.icon || ''; // 可以是 Phosphor 图标类名或本地 SVG 路径
        this.isActive = options.isActive || false;
        this.isDisabled = options.isDisabled || false;
        this.onClick = options.onClick || (() => {});
        this.onHover = options.onHover || (() => {});
        this.iconType = this.getIconType(this.icon); // 'phosphor' 或 'svg'
        
        this.init();
    }

    /**
     * 生成唯一ID
     */
    generateId() {
        return 'sidebar-item-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 判断图标类型
     * @param {string} icon - 图标字符串
     * @returns {string} 'phosphor' 或 'svg'
     */
    getIconType(icon) {
        if (!icon) return 'phosphor';
        // 如果以 .svg 结尾或包含 /assets/svgs/ 路径，则认为是本地 SVG
        return icon.endsWith('.svg') || icon.includes('/assets/svgs/') ? 'svg' : 'phosphor';
    }

    /**
     * 初始化组件
     */
    init() {
        this.injectStyles();
    }

    /**
     * 注入组件样式
     */
    injectStyles() {
        // 检查是否已经注入过样式
        if (document.getElementById('sidebar-item-styles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'sidebar-item-styles';
        style.textContent = `
            /* 简化的侧边栏项目样式 */
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

            /* SVG 图标占位符样式 */
            .sidebar-item-icon .svg-icon-placeholder {
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0.8;
                transition: opacity 0.2s ease;
            }

            .sidebar-item.active .sidebar-item-icon .svg-icon-placeholder {
                opacity: 1;
            }

            /* 本地 SVG 图标样式 */
            .sidebar-item-icon svg {
                width: 20px;
                height: 20px;
                opacity: 0.8;
                transition: opacity 0.2s ease;
                fill: currentColor;
            }

            .sidebar-item.active .sidebar-item-icon svg {
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
        `;
        
        document.head.appendChild(style);
    }

    /**
     * 渲染侧边栏项目HTML
     * @returns {string} HTML字符串
     */
    render() {
        const disabledClass = this.isDisabled ? 'disabled' : '';
        const activeClass = this.isActive ? 'active' : '';
        
        // 根据图标类型渲染不同的图标元素
        const iconElement = this.getIconElement();
        
        return `
            <div class="sidebar-item ${activeClass} ${disabledClass}" 
                 id="${this.id}" 
                 data-label="${this.label}">
                <div class="sidebar-item-content">
                    ${this.icon ? `
                        <div class="sidebar-item-icon">
                            ${iconElement}
                        </div>
                    ` : ''}
                    
                    <div class="sidebar-item-label">${this.label}</div>
                </div>
            </div>
        `;
    }

    /**
     * 根据图标类型获取图标元素
     * @returns {string} 图标HTML字符串
     */
    getIconElement() {
        if (this.iconType === 'svg') {
            // 本地 SVG 图标 - 使用占位符，实际加载在 bindEvents 中处理
            return `<div class="svg-icon-placeholder" data-src="${this.icon}"></div>`;
        } else {
            // Phosphor 图标
            return `<i class="ph ${this.icon}"></i>`;
        }
    }

    /**
     * 异步加载 SVG 图标
     * @param {string} svgPath - SVG 文件路径
     * @returns {Promise<string>} SVG 内容
     */
    async loadSVGIcon(svgPath) {
        try {
            const response = await fetch(svgPath);
            if (!response.ok) {
                throw new Error(`Failed to load SVG: ${response.statusText}`);
            }
            return await response.text();
        } catch (error) {
            console.error('Error loading SVG icon:', error);
            return '';
        }
    }

    /**
     * 绑定事件监听器
     * @param {HTMLElement} container - 容器元素
     */
    async bindEvents(container) {
        const item = container.querySelector(`#${this.id}`);
        if (!item) return;

        // 如果是 SVG 图标，需要异步加载
        if (this.iconType === 'svg') {
            const placeholder = item.querySelector('.svg-icon-placeholder');
            if (placeholder) {
                const svgContent = await this.loadSVGIcon(this.icon);
                if (svgContent) {
                    placeholder.outerHTML = svgContent;
                }
            }
        }

        // 点击事件
        item.addEventListener('click', (e) => {
            if (this.isDisabled) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            
            this.onClick(this.id, this.label);
        });

        // 鼠标悬浮事件
        item.addEventListener('mouseenter', (e) => {
            if (this.isDisabled) return;
            
            this.onHover(this.id, this.label, 'enter');
        });

        item.addEventListener('mouseleave', (e) => {
            if (this.isDisabled) return;
            
            this.onHover(this.id, this.label, 'leave');
        });
    }

    /**
     * 设置为激活状态
     */
    setActive() {
        this.isActive = true;
        this.updateElement();
    }

    /**
     * 设置为非激活状态
     */
    setInactive() {
        this.isActive = false;
        this.updateElement();
    }

    /**
     * 设置禁用状态
     * @param {boolean} disabled - 是否禁用
     */
    setDisabled(disabled) {
        this.isDisabled = disabled;
        this.updateElement();
    }

    /**
     * 更新元素状态
     */
    updateElement() {
        const item = document.getElementById(this.id);
        if (!item) return;

        // 更新类名
        item.className = `sidebar-item ${this.isActive ? 'active' : ''} ${this.isDisabled ? 'disabled' : ''}`;
    }

    /**
     * 获取当前状态
     * @returns {Object} 当前状态对象
     */
    getState() {
        return {
            id: this.id,
            label: this.label,
            icon: this.icon,
            iconType: this.iconType,
            isActive: this.isActive,
            isDisabled: this.isDisabled
        };
    }

    /**
     * 销毁组件
     */
    destroy() {
        const item = document.getElementById(this.id);
        if (item) {
            item.remove();
        }
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SidebarItem;
} else if (typeof window !== 'undefined') {
    window.SidebarItem = SidebarItem;
}
