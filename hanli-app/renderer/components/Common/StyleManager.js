/**
 * 样式管理工具类
 * 用于在JavaScript中定义和管理CSS样式
 */
class StyleManager {
    constructor() {
        this.styles = new Map();
        this.styleElement = null;
        this.init();
    }

    /**
     * 初始化样式管理器
     */
    init() {
        // 创建或获取样式元素
        this.styleElement = document.getElementById('dynamic-styles') || this.createStyleElement();
    }

    /**
     * 创建样式元素
     * @returns {HTMLElement} 样式元素
     */
    createStyleElement() {
        const styleElement = document.createElement('style');
        styleElement.id = 'dynamic-styles';
        styleElement.type = 'text/css';
        document.head.appendChild(styleElement);
        return styleElement;
    }

    /**
     * 定义组件样式
     * @param {string} componentName - 组件名称
     * @param {Object} styles - 样式对象
     */
    defineStyles(componentName, styles) {
        this.styles.set(componentName, styles);
        this.updateStyleElement();
    }

    /**
     * 获取组件样式
     * @param {string} componentName - 组件名称
     * @returns {Object} 样式对象
     */
    getStyles(componentName) {
        return this.styles.get(componentName) || {};
    }

    /**
     * 更新样式元素
     */
    updateStyleElement() {
        if (!this.styleElement) return;

        let cssText = '';
        for (const [componentName, styles] of this.styles) {
            cssText += this.generateCSS(componentName, styles);
        }
        
        this.styleElement.textContent = cssText;
    }

    /**
     * 生成CSS文本
     * @param {string} componentName - 组件名称
     * @param {Object} styles - 样式对象
     * @returns {string} CSS文本
     */
    generateCSS(componentName, styles) {
        let css = `/* ${componentName} 组件样式 */\n`;
        
        for (const [selector, rules] of Object.entries(styles)) {
            css += `${selector} {\n`;
            for (const [property, value] of Object.entries(rules)) {
                css += `  ${property}: ${value};\n`;
            }
            css += `}\n\n`;
        }
        
        return css;
    }

    /**
     * 应用样式到元素
     * @param {HTMLElement} element - 目标元素
     * @param {string} componentName - 组件名称
     * @param {string} styleName - 样式名称
     */
    applyStyle(element, componentName, styleName) {
        const styles = this.getStyles(componentName);
        const styleRules = styles[styleName];
        
        if (styleRules) {
            Object.assign(element.style, styleRules);
        }
    }

    /**
     * 创建样式化的元素
     * @param {string} tagName - 标签名
     * @param {string} componentName - 组件名称
     * @param {string} styleName - 样式名称
     * @param {Object} attributes - 属性对象
     * @returns {HTMLElement} 创建的元素
     */
    createStyledElement(tagName, componentName, styleName, attributes = {}) {
        const element = document.createElement(tagName);
        
        // 应用样式
        this.applyStyle(element, componentName, styleName);
        
        // 设置属性
        for (const [key, value] of Object.entries(attributes)) {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else {
                element.setAttribute(key, value);
            }
        }
        
        return element;
    }

    /**
     * 添加CSS变量
     * @param {Object} variables - CSS变量对象
     */
    addCSSVariables(variables) {
        const root = document.documentElement;
        for (const [name, value] of Object.entries(variables)) {
            root.style.setProperty(`--${name}`, value);
        }
    }


    /**
     * 获取CSS变量值
     * @param {string} name - 变量名
     * @returns {string} 变量值
     */
    getCSSVariable(name) {
        return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
    }

    /**
     * 创建响应式样式
     * @param {string} componentName - 组件名称
     * @param {Object} breakpoints - 断点样式对象
     */
    createResponsiveStyles(componentName, breakpoints) {
        const styles = {};
        
        for (const [breakpoint, rules] of Object.entries(breakpoints)) {
            const mediaQuery = breakpoint === 'mobile' ? '(max-width: 768px)' :
                              breakpoint === 'tablet' ? '(min-width: 769px) and (max-width: 1024px)' :
                              breakpoint === 'desktop' ? '(min-width: 1025px)' : breakpoint;
            
            styles[`@media ${mediaQuery}`] = rules;
        }
        
        this.defineStyles(componentName, styles);
    }

    /**
     * 创建动画样式
     * @param {string} componentName - 组件名称
     * @param {Object} animations - 动画对象
     */
    createAnimations(componentName, animations) {
        const styles = {};
        
        for (const [name, keyframes] of Object.entries(animations)) {
            styles[`@keyframes ${name}`] = keyframes;
        }
        
        this.defineStyles(componentName, styles);
    }

    /**
     * 清理样式
     * @param {string} componentName - 组件名称（可选，不传则清理所有）
     */
    cleanup(componentName = null) {
        if (componentName) {
            this.styles.delete(componentName);
        } else {
            this.styles.clear();
        }
        this.updateStyleElement();
    }
}

// 创建全局样式管理器实例
window.styleManager = new StyleManager();

// 导出样式管理器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StyleManager;
}
