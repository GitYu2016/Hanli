/**
 * Tab管理类
 * 负责管理应用中的所有Tab相关功能
 */
class TabManager {
    constructor() {
        this.tabs = [];
        this.activeTabId = null;
        this.tabIdCounter = 0;
    }

    /**
     * 生成唯一Tab ID
     * @returns {string} 新的Tab ID
     */
    generateTabId() {
        return `tab_${++this.tabIdCounter}`;
    }

    /**
     * 新增Tab
     * @param {Object} pageData - 页面数据
     * @returns {string} 新Tab的ID
     */
    addTab(pageData) {
        const tabId = this.generateTabId();
        const tab = {
            id: tabId,
            pageType: pageData.type,
            title: pageData.title,
            pageData: pageData,
            isActive: false,
            closable: pageData.closable !== false // 默认为true，除非明确设置为false
        };
        
        this.tabs.push(tab);
        this.setActiveTab(tabId);
        return tabId;
    }

    /**
     * 设置活动Tab
     * @param {string} tabId - Tab ID
     */
    setActiveTab(tabId) {
        // 取消所有Tab的激活状态
        this.tabs.forEach(tab => tab.isActive = false);
        
        // 激活指定Tab
        const targetTab = this.tabs.find(tab => tab.id === tabId);
        if (targetTab) {
            targetTab.isActive = true;
            this.activeTabId = tabId;
        }
    }

    /**
     * 关闭Tab
     * @param {string} tabId - Tab ID
     * @returns {boolean} 是否关闭了活动Tab
     */
    closeTab(tabId) {
        const tabIndex = this.tabs.findIndex(tab => tab.id === tabId);
        if (tabIndex === -1) return false;

        const isActiveTab = this.tabs[tabIndex].isActive;
        this.tabs.splice(tabIndex, 1);

        if (isActiveTab && this.tabs.length > 0) {
            let newActiveIndex = tabIndex - 1;
            if (newActiveIndex < 0) {
                newActiveIndex = 0;
            }
            this.setActiveTab(this.tabs[newActiveIndex].id);
        } else if (this.tabs.length === 0) {
            this.activeTabId = null;
        }

        return isActiveTab;
    }

    /**
     * Tab切换回调
     * @param {Object} tab - Tab对象
     */
    onTabSwitch(tab) {
        // 触发自定义事件，让其他组件监听
        const event = new CustomEvent('tabSwitch', {
            detail: { tab }
        });
        document.dispatchEvent(event);
    }

    /**
     * 获取当前活动Tab
     * @returns {Object|null} 活动Tab对象
     */
    getActiveTab() {
        return this.tabs.find(tab => tab.isActive);
    }

    /**
     * 根据页面类型查找Tab
     * @param {string} pageType - 页面类型
     * @returns {Object|null} 找到的Tab对象
     */
    findTabByPageType(pageType) {
        return this.tabs.find(tab => tab.pageType === pageType);
    }

    /**
     * 根据页面类型和特定参数查找Tab（用于产品详情等需要区分不同实例的页面）
     * @param {string} pageType - 页面类型
     * @param {string} paramKey - 参数键
     * @param {*} paramValue - 参数值
     * @returns {Object|null} 找到的Tab对象
     */
    findTabByPageTypeAndParam(pageType, paramKey, paramValue) {
        return this.tabs.find(tab => 
            tab.pageType === pageType && 
            tab.pageData && 
            tab.pageData[paramKey] === paramValue
        );
    }

    /**
     * 获取所有Tab
     * @returns {Array} Tab数组
     */
    getAllTabs() {
        return [...this.tabs];
    }

    /**
     * 获取Tab数量
     * @returns {number} Tab数量
     */
    getTabCount() {
        return this.tabs.length;
    }

    /**
     * 检查是否有可关闭的Tab
     * @returns {boolean} 是否有可关闭的Tab
     */
    hasClosableTabs() {
        return this.tabs.some(tab => tab.closable);
    }

    /**
     * 清理所有Tab
     */
    clearAllTabs() {
        this.tabs = [];
        this.activeTabId = null;
    }

    /**
     * 销毁TabManager
     */
    destroy() {
        this.clearAllTabs();
        this.tabIdCounter = 0;
    }
}

// 导出TabManager类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TabManager;
} else if (typeof window !== 'undefined') {
    window.TabManager = TabManager;
}
