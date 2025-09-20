/**
 * SVG 图标组件
 * 提供统一的图标渲染接口，使用本地SVG文件，支持主题适配和状态管理
 */
class Icon {
    /**
     * 是否已初始化样式
     */
    static stylesInitialized = false;
    /**
     * SVG图标缓存
     */
    static svgCache = new Map();
    /**
     * 图标样式定义
     */
    static styles = `
/* SVG 图标样式 - 使用本地SVG文件 */

/* ==================== SVG 图标基础样式 ==================== */

/* 基础 SVG 图标样式 */
.svg-icon {
    display: inline-block;
    width: 20px;
    height: 20px;
    vertical-align: middle;
    opacity: 0.8;
    /* 使用主题变量作为图标颜色 */
    color: var(--color-primary);
    /* 过渡动画 */
    transition: color 0.2s ease, opacity 0.2s ease;
}

/* 填充样式图标 */
.svg-icon-fill {
    display: inline-block;
    width: 20px;
    height: 20px;
    vertical-align: middle;
    opacity: 0.8;
    color: var(--color-primary);
    transition: color 0.2s ease, opacity 0.2s ease;
}

/* 基础图标样式 */
.icon {
    display: inline-block;
    width: 1em;
    height: 1em;
    vertical-align: middle;
    opacity: 0.8;
    /* 使用主题变量作为图标颜色 */
    color: var(--color-primary);
    /* 过渡动画 */
    transition: color 0.2s ease, opacity 0.2s ease;
}

/* SVG 图标状态变化 */
.svg-icon:hover,
.svg-icon.active,
.svg-icon-fill:hover,
.svg-icon-fill.active {
    color: var(--color-focused);
    opacity: 1;
}

.svg-icon.disabled,
.svg-icon-fill.disabled {
    color: var(--color-disabled);
    opacity: 0.5;
    cursor: not-allowed;
}

/* 图标状态变化 */
.icon:hover,
.icon.active {
    color: var(--color-focused);
    opacity: 1;
}

.icon.disabled {
    color: var(--color-disabled);
    opacity: 0.5;
    cursor: not-allowed;
}

/* 次要图标 */
.icon.secondary,
.svg-icon.secondary,
.svg-icon-fill.secondary {
    color: var(--color-secondary);
}

/* 特殊用途的图标颜色 */
.icon.success,
.svg-icon.success,
.svg-icon-fill.success {
    color: var(--color-success);
}

.icon.warning,
.svg-icon.warning,
.svg-icon-fill.warning {
    color: var(--color-warning);
}

.icon.info,
.svg-icon.info,
.svg-icon-fill.info {
    color: var(--color-info);
}

.icon.error,
.svg-icon.error,
.svg-icon-fill.error {
    color: var(--color-error);
}

/* 图标尺寸变体 */
.icon.small,
.svg-icon.small,
.svg-icon-fill.small {
    width: 0.75em;
    height: 0.75em;
}

.icon.large,
.svg-icon.large,
.svg-icon-fill.large {
    width: 1.25em;
    height: 1.25em;
}

.icon.xlarge,
.svg-icon.xlarge,
.svg-icon-fill.xlarge {
    width: 1.5em;
    height: 1.5em;
}

/* 图标旋转动画 */
.icon.rotate,
.svg-icon.rotate,
.svg-icon-fill.rotate {
    animation: icon-rotate 1s linear infinite;
}

@keyframes icon-rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

/* 图标脉冲动画 */
.icon.pulse,
.svg-icon.pulse,
.svg-icon-fill.pulse {
    animation: icon-pulse 2s ease-in-out infinite;
}

@keyframes icon-pulse {
    0%, 100% {
        opacity: 0.8;
    }
    50% {
        opacity: 1;
    }
}

/* ==================== 特定组件图标样式 ==================== */

/* 按钮图标 */
.btn-icon {
    margin-right: 0.5em;
}

.btn-loading-icon {
    margin-right: 0.5em;
    animation: icon-rotate 1s linear infinite;
}

/* 搜索输入框图标 */
.search-input-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-secondary);
    pointer-events: none;
}

/* 窗口控制图标 */
.window-control-btn .icon {
    width: 16px;
    height: 16px;
}

/* 侧边栏图标 */
.sidebar-item-icon .icon {
    width: 20px;
    height: 20px;
}

/* 分页图标 */
.pagination-btn .icon {
    width: 16px;
    height: 16px;
}


/* 附件卡片图标 */
.attachment-btn .icon {
    width: 16px;
    height: 16px;
}

/* 媒体卡片图标 */
.media-card-error .icon {
    width: 24px;
    height: 24px;
    color: var(--color-error);
}

/* 错误页面图标 */
.error-icon .icon {
    width: 48px;
    height: 48px;
    color: var(--color-error);
}

/* 加载页面图标 */
.loading-icon .icon {
    width: 32px;
    height: 32px;
    animation: icon-rotate 1s linear infinite;
}

/* 仪表板卡片图标 */
.card-icon .icon {
    width: 24px;
    height: 24px;
}

/* 操作按钮图标 */
.action-btn .icon {
    width: 20px;
    height: 20px;
}

/* 顶部栏图标 */
.top-bar-center .icon,
.top-bar-right .icon {
    width: 20px;
    height: 20px;
}

/* 标签页图标 */
.top-bar-tabs .icon {
    width: 16px;
    height: 16px;
}

/* 模态框关闭图标 */
.modal-close .icon,
.json-modal-close .icon {
    width: 20px;
    height: 20px;
}

/* Toast 关闭图标 */
.toast-close .icon {
    width: 16px;
    height: 16px;
}

/* 无数据状态图标 */
.no-activities .icon,
.no-products .icon,
.search-no-results .icon {
    width: 32px;
    height: 32px;
    color: var(--color-secondary);
}

/* 重试按钮图标 */
.retry-btn .icon {
    width: 16px;
    height: 16px;
    margin-right: 0.5em;
}

/* ==================== 主题适配 ==================== */

/* 确保图标在暗色主题下正确显示 */
[data-theme="dark"] .icon,
[data-theme="dark"] .svg-icon,
[data-theme="dark"] .svg-icon-fill {
    color: var(--color-primary);
}

[data-theme="dark"] .icon:hover,
[data-theme="dark"] .icon.active,
[data-theme="dark"] .svg-icon:hover,
[data-theme="dark"] .svg-icon.active,
[data-theme="dark"] .svg-icon-fill:hover,
[data-theme="dark"] .svg-icon-fill.active {
    color: var(--color-focused);
}

[data-theme="dark"] .icon.disabled,
[data-theme="dark"] .svg-icon.disabled,
[data-theme="dark"] .svg-icon-fill.disabled {
    color: var(--color-disabled);
}

[data-theme="dark"] .icon.secondary,
[data-theme="dark"] .svg-icon.secondary,
[data-theme="dark"] .svg-icon-fill.secondary {
    color: var(--color-secondary);
}
`;

    /**
     * 图标映射表 - 将内部图标名称映射到SVG文件名
     */
    static iconMap = {
        // 基础图标 - 映射到SVG文件名（不包含.svg扩展名）
        'home': 'house',
        'package': 'package',
        'settings': 'gear',
        'search': 'magnifying-glass',
        'download': 'download',
        'copy': 'copy',
        'eye': 'eye',
        'warning': 'warning',
        'check-circle': 'check-circle',
        'x': 'x',
        'minus': 'minus',
        'arrows-out': 'arrows-out',
        'arrow-clockwise': 'arrow-clockwise',
        'dots-three-vertical': 'dots-three-vertical',
        'image': 'image',
        'info': 'info',
        'spinner': 'spinner',
        'warning-circle': 'warning-circle',
        'caret-left': 'caret-left',
        'caret-right': 'caret-right',
        'help': 'question',
        'success': 'check-circle',
        'error': 'warning-circle',
        'loading': 'spinner',
        'sun': 'sun',
        'moon': 'moon',
        
        // 活动相关图标
        'folder-plus': 'folder-plus',
        'folder-minus': 'folder-minus',
        'folder-open': 'folder-open',
        'file-json': 'file-js', // 使用file-js作为JSON文件的图标
        'file-pdf': 'file-pdf',
        'chart-line': 'chart-line',
        'chart-bar': 'chart-bar',
        'clock': 'clock',
        'calendar': 'calendar',
        'activity': 'pulse',
        'pulse': 'pulse',
        'trending-up': 'chart-line-up',
        'database': 'database',
        'cloud-download': 'download',
        'refresh': 'arrow-clockwise',
        'sync': 'arrows-clockwise',
        'update': 'arrows-clockwise'
    };

    /**
     * 系统设置相关图标 - 使用bold样式
     */
    static settingsIcons = [
        'settings', 'gear', 'x', 'sun', 'moon', 'check-circle', 'warning-circle', 
        'info', 'help', 'database', 'folder-plus', 'folder-minus', 'refresh',
        'arrow-clockwise', 'sync', 'update', 'download', 'upload', 'copy',
        'eye', 'warning', 'success', 'error', 'loading', 'spinner'
    ];

    /**
     * 初始化样式
     * 将图标样式注入到页面中
     */
    static initStyles() {
        if (this.stylesInitialized) return;
        
        // 创建样式元素
        const styleElement = document.createElement('style');
        styleElement.id = 'svg-icons-styles';
        styleElement.textContent = this.styles;
        
        // 添加到 head 中
        document.head.appendChild(styleElement);
        
        this.stylesInitialized = true;
    }

    /**
     * 同步加载SVG文件
     * @param {string} iconName - 图标名称
     * @param {boolean} filled - 是否使用填充样式
     * @param {string} style - 图标样式 (regular, fill, bold, duotone)
     * @returns {string} SVG内容
     */
    static loadSVG(iconName, filled = false, style = 'regular') {
        const cacheKey = `${iconName}-${style}-${filled ? 'fill' : 'regular'}`;
        
        // 检查缓存
        if (this.svgCache.has(cacheKey)) {
            return this.svgCache.get(cacheKey);
        }

        try {
            let folder = style;
            let fileName = iconName;
            
            // 根据样式和填充状态确定文件名
            if (style === 'fill' && filled) {
                fileName = iconName !== 'house' ? `${iconName}-fill` : iconName;
            } else if (style === 'bold') {
                fileName = `${iconName}-bold`;
            } else if (style === 'duotone') {
                fileName = `${iconName}-duotone`;
            }
            
            const svgPath = `./assets/svgs/${folder}/${fileName}.svg`;
            
            // 使用同步XMLHttpRequest
            const xhr = new XMLHttpRequest();
            xhr.open('GET', svgPath, false); // 同步请求
            xhr.send();
            
            if (xhr.status === 200) {
                const svgContent = xhr.responseText;
                
                // 缓存SVG内容
                this.svgCache.set(cacheKey, svgContent);
                
                return svgContent;
            } else {
                throw new Error(`SVG文件加载失败: ${svgPath} (${xhr.status})`);
            }
        } catch (error) {
            console.error(`同步加载图标失败: ${iconName}`, error);
            return '';
        }
    }

    /**
     * 渲染图标（同步版本）
     * @param {string} name - 图标名称
     * @param {Object} options - 选项
     * @returns {string} 图标 HTML 字符串
     */
    static render(name, options = {}) {
        // 确保样式已初始化
        this.initStyles();
        const {
            className = '',
            size = 'normal',
            variant = 'normal',
            animate = false,
            filled = false,
            style = 'regular'
        } = options;

        const iconName = this.iconMap[name];
        if (!iconName) {
            console.warn(`图标 "${name}" 不存在`);
            return '';
        }

        // 系统设置相关图标自动使用bold样式
        let finalStyle = style;
        if (this.settingsIcons.includes(name) && style === 'regular') {
            finalStyle = 'bold';
        }

        // 同步加载SVG内容
        const svgContent = this.loadSVG(iconName, filled, finalStyle);
        if (!svgContent) {
            return '';
        }

        // 构建 CSS 类名
        let classes = [filled ? 'svg-icon-fill' : 'svg-icon'];
        if (className) classes.push(className);
        if (size !== 'normal') classes.push(size);
        if (variant !== 'normal') classes.push(variant);
        if (animate) classes.push(animate);

        // 创建SVG元素并添加类名
        const svgElement = svgContent.replace('<svg', `<svg class="${classes.join(' ')}"`);
        
        return svgElement;
    }



    /**
     * 渲染多个图标
     * @param {Array} iconList - 图标列表
     * @returns {string} 图标 HTML 字符串
     */
    static renderMultiple(iconList) {
        return iconList.map(({ name, options }) => 
            this.render(name, options)
        ).join('');
    }

    /**
     * 获取所有可用图标名称
     * @returns {Array} 图标名称列表
     */
    static getAvailableIcons() {
        return Object.keys(this.iconMap);
    }

    /**
     * 检查图标是否存在
     * @param {string} name - 图标名称
     * @returns {boolean} 是否存在
     */
    static exists(name) {
        return name in this.iconMap;
    }



    /**
     * 处理所有带有data-icon属性的元素
     */
    static processDataIcons() {
        const iconElements = document.querySelectorAll('[data-icon]');
        iconElements.forEach(element => {
            const iconName = element.getAttribute('data-icon');
            const filled = element.getAttribute('data-filled') === 'true';
            const style = element.getAttribute('data-style') || 'regular';
            
            if (iconName && !element.innerHTML.trim()) {
                // 使用render方法生成图标HTML
                const iconHTML = this.render(iconName, { 
                    filled: filled, 
                    style: style,
                    className: element.className.replace('svg-icon', '').trim()
                });
                
                if (iconHTML) {
                    element.outerHTML = iconHTML;
                }
            }
        });
    }

    /**
     * 初始化图标系统
     */
    static init() {
        this.initStyles();
        // 处理现有的data-icon元素
        this.processDataIcons();
        
        // 监听DOM变化，处理动态添加的图标
        if (typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const iconElements = node.querySelectorAll ? node.querySelectorAll('[data-icon]') : [];
                            iconElements.forEach(element => {
                                const iconName = element.getAttribute('data-icon');
                                const filled = element.getAttribute('data-filled') === 'true';
                                const style = element.getAttribute('data-style') || 'regular';
                                
                                if (iconName && !element.innerHTML.trim()) {
                                    const iconHTML = this.render(iconName, { 
                                        filled: filled, 
                                        style: style,
                                        className: element.className.replace('svg-icon', '').trim()
                                    });
                                    
                                    if (iconHTML) {
                                        element.outerHTML = iconHTML;
                                    }
                                }
                            });
                            
                            // 如果节点本身是图标元素
                            if (node.hasAttribute && node.hasAttribute('data-icon')) {
                                const iconName = node.getAttribute('data-icon');
                                const filled = node.getAttribute('data-filled') === 'true';
                                const style = node.getAttribute('data-style') || 'regular';
                                
                                if (iconName && !node.innerHTML.trim()) {
                                    const iconHTML = this.render(iconName, { 
                                        filled: filled, 
                                        style: style,
                                        className: node.className.replace('svg-icon', '').trim()
                                    });
                                    
                                    if (iconHTML) {
                                        node.outerHTML = iconHTML;
                                    }
                                }
                            }
                        }
                    });
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

}

// 导出到全局
if (typeof window !== 'undefined') {
    window.Icon = Icon;
}

// 如果是 Node.js 环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Icon;
}