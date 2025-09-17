/**
 * HomePageComponent 组件
 * 负责首页内容的渲染和数据管理
 */
class HomePageComponent {
    constructor() {
        this.container = null;
        this.dashboardData = {
            productCount: 0,
            todayCollect: 0,
            averageRating: 0
        };
    }

    /**
     * 初始化首页组件
     * @param {HTMLElement} container - 容器元素
     */
    async init(container) {
        this.container = container;
        this.render();
        await this.loadDashboardData();
    }

    /**
     * 渲染首页内容
     */
    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="welcome-section">
                <h1 class="welcome-title">欢迎使用Hanli</h1>
                <p class="welcome-desc">高效管理您的产品信息、图片资源和数据分析</p>
            </div>
            
            <div class="dashboard-grid">
                <div class="dashboard-card">
                    <div class="card-icon">
                        <i class="ph ph-package"></i>
                    </div>
                    <div class="card-title">产品总数</div>
                    <div class="card-value" id="product-count">0</div>
                </div>
                
                <div class="dashboard-card">
                    <div class="card-icon">
                        <i class="ph ph-arrow-clockwise"></i>
                    </div>
                    <div class="card-title">今日采集</div>
                    <div class="card-value" id="today-collect">0</div>
                </div>
                
                <div class="dashboard-card">
                    <div class="card-icon">
                        <i class="ph ph-star"></i>
                    </div>
                    <div class="card-title">平均评分</div>
                    <div class="card-value" id="average-rating">0</div>
                </div>
            </div>
            
            <div class="quick-actions">
                <h3 class="section-title">快速操作</h3>
                <div class="action-buttons">
                    <button class="action-btn" onclick="homePageComponentInstance.navigateToProductLibrary()">
                        <i class="ph ph-package btn-icon"></i>
                        <span class="btn-text">产品库</span>
                    </button>
                    
                    <button class="action-btn" onclick="homePageComponentInstance.showSettings()">
                        <i class="ph ph-gear btn-icon"></i>
                        <span class="btn-text">设置</span>
                    </button>
                    
                    <button class="action-btn" onclick="homePageComponentInstance.showHelp()">
                        <i class="ph ph-info btn-icon"></i>
                        <span class="btn-text">帮助</span>
                    </button>
                    
                    <button class="action-btn" onclick="homePageComponentInstance.refreshData()">
                        <i class="ph ph-arrow-clockwise btn-icon"></i>
                        <span class="btn-text">刷新数据</span>
                    </button>
                </div>
            </div>
            
            <div class="recent-activities">
                <h3 class="section-title">最近活动</h3>
                <div class="activity-list" id="activity-list">
                    <div class="loading-activities">正在加载活动...</div>
                </div>
            </div>
        `;
    }

    /**
     * 加载仪表板数据
     */
    async loadDashboardData() {
        try {
            // 获取产品总数
            const productResponse = await fetch('/api/products/count');
            if (productResponse.ok) {
                const productData = await productResponse.json();
                this.dashboardData.productCount = productData.count || 0;
            }

            // 获取今日采集数据（这里可以扩展为真实的API）
            this.dashboardData.todayCollect = await this.getTodayCollectCount();

            // 获取平均评分（这里可以扩展为真实的API）
            this.dashboardData.averageRating = await this.getAverageRating();

            // 更新UI
            this.updateDashboardUI();
            
            // 加载最近活动
            await this.loadRecentActivities();

        } catch (error) {
            console.error('加载仪表板数据失败:', error);
            this.showError('加载数据失败');
        }
    }

    /**
     * 更新仪表板UI
     */
    updateDashboardUI() {
        const productCountEl = document.getElementById('product-count');
        const todayCollectEl = document.getElementById('today-collect');
        const averageRatingEl = document.getElementById('average-rating');

        if (productCountEl) {
            productCountEl.textContent = this.dashboardData.productCount.toLocaleString();
        }
        
        if (todayCollectEl) {
            todayCollectEl.textContent = this.dashboardData.todayCollect.toLocaleString();
        }
        
        if (averageRatingEl) {
            averageRatingEl.textContent = this.dashboardData.averageRating.toFixed(1);
        }
    }

    /**
     * 获取今日采集数量
     * @returns {Promise<number>}
     */
    async getTodayCollectCount() {
        try {
            // 这里可以实现真实的今日采集统计
            // 暂时返回模拟数据
            const today = new Date().toISOString().split('T')[0];
            const response = await fetch(`/api/products/count?date=${today}`);
            if (response.ok) {
                const data = await response.json();
                return data.count || 0;
            }
            return 0;
        } catch (error) {
            console.error('获取今日采集数量失败:', error);
            return 0;
        }
    }

    /**
     * 获取平均评分
     * @returns {Promise<number>}
     */
    async getAverageRating() {
        try {
            // 这里可以实现真实的评分统计
            // 暂时返回模拟数据
            const response = await fetch('/api/products/average-rating');
            if (response.ok) {
                const data = await response.json();
                return data.averageRating || 0;
            }
            return 4.5; // 默认评分
        } catch (error) {
            console.error('获取平均评分失败:', error);
            return 4.5;
        }
    }

    /**
     * 加载最近活动
     */
    async loadRecentActivities() {
        const activityListEl = document.getElementById('activity-list');
        if (!activityListEl) return;

        try {
            const response = await fetch('/api/activities/recent');
            if (response.ok) {
                const data = await response.json();
                this.renderRecentActivities(data.activities || []);
            } else {
                this.renderRecentActivities([]);
            }
        } catch (error) {
            console.error('加载最近活动失败:', error);
            this.renderRecentActivities([]);
        }
    }

    /**
     * 渲染最近活动列表
     * @param {Array} activities - 活动列表
     */
    renderRecentActivities(activities) {
        const activityListEl = document.getElementById('activity-list');
        if (!activityListEl) return;

        if (activities.length === 0) {
            activityListEl.innerHTML = `
                <div class="no-activities">
                    <i class="ph ph-info"></i>
                    <p>暂无最近活动</p>
                </div>
            `;
            return;
        }

        let html = '<div class="activity-items">';
        activities.forEach(activity => {
            html += `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="ph ${this.getActivityIcon(activity.type)}"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">${activity.title}</div>
                        <div class="activity-time">${this.formatActivityTime(activity.time)}</div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        activityListEl.innerHTML = html;
    }

    /**
     * 获取活动图标
     * @param {string} type - 活动类型
     * @returns {string} 图标类名
     */
    getActivityIcon(type) {
        const iconMap = {
            'product_added': 'ph-package',
            'product_updated': 'ph-arrow-clockwise',
            'data_collected': 'ph-download',
            'system': 'ph-gear'
        };
        return iconMap[type] || 'ph-info';
    }

    /**
     * 格式化活动时间
     * @param {string|Date} time - 时间
     * @returns {string} 格式化后的时间
     */
    formatActivityTime(time) {
        const date = new Date(time);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) { // 1分钟内
            return '刚刚';
        } else if (diff < 3600000) { // 1小时内
            return `${Math.floor(diff / 60000)}分钟前`;
        } else if (diff < 86400000) { // 1天内
            return `${Math.floor(diff / 3600000)}小时前`;
        } else {
            return date.toLocaleDateString('zh-CN');
        }
    }

    /**
     * 导航到产品库
     */
    navigateToProductLibrary() {
        if (typeof homePageInstance !== 'undefined' && homePageInstance.navigateToProductLibrary) {
            homePageInstance.navigateToProductLibrary();
        } else {
            console.log('导航到产品库');
        }
    }

    /**
     * 显示设置
     */
    showSettings() {
        if (typeof settingsModalInstance !== 'undefined') {
            settingsModalInstance.show();
        } else {
            console.log('显示设置');
        }
    }

    /**
     * 显示帮助
     */
    showHelp() {
        // 这里可以打开帮助文档或显示帮助信息
        console.log('显示帮助');
        alert('帮助功能开发中...');
    }

    /**
     * 刷新数据
     */
    async refreshData() {
        await this.loadDashboardData();
        this.showToast('数据已刷新', 'success');
    }

    /**
     * 显示错误信息
     * @param {string} message - 错误消息
     */
    showError(message) {
        const productCountEl = document.getElementById('product-count');
        if (productCountEl) {
            productCountEl.textContent = '-';
        }
        
        // 可以添加toast通知
        console.error(message);
    }

    /**
     * 显示Toast通知
     * @param {string} message - 消息
     * @param {string} type - 类型 (success, error, info, warning)
     */
    showToast(message, type = 'info') {
        // 这里可以集成toast通知系统
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    /**
     * 销毁组件
     */
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.container = null;
        this.dashboardData = {
            productCount: 0,
            todayCollect: 0,
            averageRating: 0
        };
    }

    /**
     * 刷新组件
     */
    async refresh() {
        if (this.container) {
            await this.loadDashboardData();
        }
    }
}

// 创建全局实例
const homePageComponentInstance = new HomePageComponent();
