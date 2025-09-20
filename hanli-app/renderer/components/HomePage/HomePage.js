/**
 * HomePage 组件
 * 负责首页的整体布局、内容渲染和样式管理
 */
class HomePage {
    constructor() {
        this.container = null;
        this.dashboardData = {
            productCount: 0,
            todayCollect: 0
        };
        this.activityRefreshTimer = null;
    }

    /**
     * 初始化首页组件
     * @param {HTMLElement} container - 容器元素
     */
    async init(container) {
        this.container = container;
        this.injectStyles();
        this.render();
        await this.loadDashboardData();
        
        // 监听主题变化事件
        this.setupThemeListener();
    }

    /**
     * 设置主题监听器
     */
    setupThemeListener() {
        // 监听主题变化事件
        document.addEventListener('themeChanged', () => {
            console.log('HomePage: 检测到主题变化，重新应用样式');
            this.refreshStyles();
        });
        
        // 监听系统主题变化
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', () => {
                console.log('HomePage: 检测到系统主题变化，重新应用样式');
                this.refreshStyles();
            });
        }
    }

    /**
     * 刷新样式
     */
    refreshStyles() {
        // 重新注入样式
        this.injectStyles();
        
        // 如果组件已渲染，重新渲染以确保样式生效
        if (this.container && this.container.innerHTML) {
            // 保存当前状态
            const currentContent = this.container.innerHTML;
            
            // 重新渲染
            this.render();
            
            // 恢复数据
            this.updateDashboardUI();
        }
    }

    /**
     * 注入组件样式
     */
    injectStyles() {
        // 如果样式已存在，先移除
        const existingStyle = document.getElementById('homepage-styles');
        if (existingStyle) {
            existingStyle.remove();
        }

        const style = document.createElement('style');
        style.id = 'homepage-styles';
        style.textContent = `
            /* 首页内容样式 */
            .welcome-section {
                text-align: center;
                margin-bottom: 48px;
                padding: 40px 0;
            }

            .welcome-title {
                font-size: 32px;
                font-weight: 700;
                color: var(--color-primary);
                margin-bottom: 12px;
            }

            .welcome-desc {
                font-size: 18px;
                color: var(--color-secondary);
                line-height: 1.5;
            }

            .dashboard-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 32px;
                justify-content: center;
                align-items: center;
            }

            .dashboard-card {
                background-color: var(--color-background-normal);
                border-radius: var(--radius-card);
                padding: 32px;
                text-align: center;
                transition: transform 0.2s ease;
                min-width: 200px;
            }

            .dashboard-card:hover {
                transform: translateY(-2px);
            }

            .card-icon {
                font-size: 48px;
                margin-bottom: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--color-info);
            }

            .card-icon i {
                font-size: 48px;
                color: inherit;
            }

            .card-title {
                font-size: 16px;
                color: var(--color-secondary);
                margin-bottom: 12px;
                font-weight: 500;
            }

            .card-value {
                font-size: 36px;
                font-weight: 700;
                color: var(--color-primary);
            }

            .quick-actions {
                margin-bottom: 32px;
            }

            .section-title {
                font-size: 14px;
                font-weight: 600;
                color: var(--color-primary);
                margin-bottom: 16px;
            }

            .action-buttons {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 12px;
            }

            .action-btn {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                padding: 16px;
                background-color: var(--color-background-normal);
                border: none;
                border-radius: var(--radius-card);
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .action-btn:hover {
                background-color: var(--color-background-focused);
                transform: translateY(-1px);
            }

            .btn-icon {
                font-size: 24px;
            }

            .btn-text {
                font-size: 14px;
                font-weight: 500;
                color: var(--color-primary);
            }

            /* 最近活动样式 */
            .recent-activities {
                margin-bottom: 64px;
            }

            .activity-list {
                background-color: var(--color-background-normal);
                border-radius: var(--radius-card);
                padding: 16px;
            }

            .activity-items {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .activity-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                border-radius: var(--radius-medium);
                transition: background-color 0.2s ease;
            }

            .activity-item:hover {
                background-color: var(--color-background-focused);
            }

            .activity-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                border-radius: var(--radius-small);
                background-color: var(--color-background-normal);
                flex-shrink: 0;
            }

            .activity-icon i {
                font-size: 16px;
                color: var(--color-info);
            }

            .activity-content {
                flex: 1;
                min-width: 0;
            }

            .activity-title {
                font-size: 14px;
                font-weight: 500;
                color: var(--color-primary);
                margin-bottom: 4px;
            }

            .activity-time {
                font-size: 12px;
                color: var(--color-secondary);
            }

            .no-activities {
                text-align: center;
                padding: 32px;
                color: var(--color-secondary);
            }

            .no-activities i {
                font-size: 32px;
                margin-bottom: 12px;
                opacity: 0.5;
            }

            .no-activities p {
                margin: 0;
                font-size: 14px;
            }

            .loading-activities {
                text-align: center;
                padding: 32px;
                color: var(--color-secondary);
                font-size: 14px;
            }

            /* 响应式设计 */
            @media (max-width: 768px) {
                .welcome-title {
                    font-size: 24px;
                }

                .welcome-desc {
                    font-size: 16px;
                }

                .card-icon {
                    font-size: 32px;
                }

                .card-icon i {
                    font-size: 32px;
                }

                .dashboard-grid {
                    grid-template-columns: repeat(2, 1fr);
                }

                .action-buttons {
                    grid-template-columns: repeat(2, 1fr);
                }
            }

            @media (max-width: 480px) {
                .welcome-section {
                    padding: 20px 0;
                    margin-bottom: 32px;
                }

                .welcome-title {
                    font-size: 20px;
                }

                .welcome-desc {
                    font-size: 14px;
                }

                .dashboard-card {
                    padding: 20px;
                }

                .card-icon {
                    font-size: 24px;
                }

                .card-icon i {
                    font-size: 24px;
                }

                .action-btn {
                    padding: 12px;
                }

                .btn-icon {
                    font-size: 20px;
                }

                .btn-text {
                    font-size: 12px;
                }

                .dashboard-grid {
                    grid-template-columns: 1fr;
                }

                .action-buttons {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 渲染首页内容
     */
    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="welcome-section">
                <h1 class="welcome-title">欢迎使用Hanli</h1>
                <p class="welcome-desc">高效管理您的产品信息、图片资源和监控数据</p>
            </div>
            
            <div class="dashboard-grid">
                <div class="dashboard-card">
                    <div class="card-icon">
                        ${Icon.render('package', { className: 'svg-icon', style: 'bold' })}
                    </div>
                    <div class="card-title">产品总数</div>
                    <div class="card-value" id="product-count">0</div>
                </div>
                
                <div class="dashboard-card">
                    <div class="card-icon">
                        ${Icon.render('download', { className: 'svg-icon', style: 'bold' })}
                    </div>
                    <div class="card-title">今日采集</div>
                    <div class="card-value" id="today-collect">0</div>
                </div>
            </div>
            
            <div class="quick-actions">
                <h3 class="section-title">快速操作</h3>
                <div class="action-buttons">
                    <button class="action-btn" onclick="homePageInstance.navigateToProductLibrary()">
                        ${Icon.render('package', { className: 'svg-icon', style: 'bold' })}
                        <span class="btn-text">产品库</span>
                    </button>
                    
                    <button class="action-btn" onclick="homePageInstance.showSettings()">
                        ${Icon.render('settings', { className: 'svg-icon', style: 'bold' })}
                        <span class="btn-text">设置</span>
                    </button>
                    
                    <button class="action-btn" onclick="homePageInstance.showHelp()">
                        ${Icon.render('help', { className: 'svg-icon', style: 'bold' })}
                        <span class="btn-text">帮助</span>
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
            // 通过ProductDataManager获取产品总数，避免重复API调用
            if (window.productDataManager) {
                this.dashboardData.productCount = await window.productDataManager.loadProductCount();
            } else {
                // 备用方案：直接调用API
                const productResponse = await fetch('http://localhost:3001/api/products/count');
                if (productResponse.ok) {
                    const productData = await productResponse.json();
                    this.dashboardData.productCount = productData.count || 0;
                }
            }

            // 获取今日采集数据
            this.dashboardData.todayCollect = await this.getTodayCollectCount();

            // 更新UI
            this.updateDashboardUI();
            
            // 加载最近活动
            await this.loadRecentActivities();
            
            // 启动活动刷新定时器（每30秒刷新一次）
            this.startActivityRefresh();

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

        if (productCountEl) {
            productCountEl.textContent = this.dashboardData.productCount.toLocaleString();
        }
        
        if (todayCollectEl) {
            todayCollectEl.textContent = this.dashboardData.todayCollect.toLocaleString();
        }
    }

    /**
     * 获取今日采集数量
     * @returns {Promise<number>}
     */
    async getTodayCollectCount() {
        try {
            const response = await fetch('http://localhost:3001/api/products/today-collect');
            if (response.ok) {
                const data = await response.json();
                console.log(`今日采集数量: ${data.count}, 日期: ${data.date}`);
                return data.count || 0;
            }
            return 0;
        } catch (error) {
            console.error('获取今日采集数量失败:', error);
            return 0;
        }
    }

    /**
     * 加载最近活动
     */
    async loadRecentActivities() {
        const activityListEl = document.getElementById('activity-list');
        if (!activityListEl) return;

        try {
            const response = await fetch('http://localhost:3001/api/activities/recent');
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
                    ${Icon.render('info', { className: 'icon', style: 'regular' })}
                    <p>暂无最近活动</p>
                </div>
            `;
            return;
        }

        let html = '<div class="activity-items">';
        activities.forEach(activity => {
            const iconName = this.getActivityIcon(activity.type);
            html += `
                <div class="activity-item">
                    <div class="activity-icon">
                        ${Icon.render(iconName, { className: 'svg-icon', style: 'regular' })}
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
     * @returns {string} 图标名称
     */
    getActivityIcon(type) {
        const iconMap = {
            'product_added': 'package',
            'product_updated': 'arrow-clockwise',
            'data_collected': 'download',
            'folder_added': 'folder-plus',
            'folder_removed': 'folder-minus',
            'monitoring_updated': 'chart-line',
            'media_updated': 'image',
            'system': 'settings',
            'collection': 'cloud-download',
            'sync': 'sync',
            'backup': 'database',
            'monitoring': 'activity'
        };
        return iconMap[type] || 'info';
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
        console.log('显示帮助');
        alert('帮助功能开发中...');
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
        
        console.error(message);
    }

    /**
     * 启动活动刷新定时器
     */
    startActivityRefresh() {
        if (this.activityRefreshTimer) {
            clearInterval(this.activityRefreshTimer);
        }
        
        this.activityRefreshTimer = setInterval(async () => {
            await this.loadRecentActivities();
        }, 30000);
    }

    /**
     * 停止活动刷新定时器
     */
    stopActivityRefresh() {
        if (this.activityRefreshTimer) {
            clearInterval(this.activityRefreshTimer);
            this.activityRefreshTimer = null;
        }
    }

    /**
     * 销毁组件
     */
    destroy() {
        this.stopActivityRefresh();
        
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.container = null;
        this.dashboardData = {
            productCount: 0,
            todayCollect: 0
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
const homePageInstance = new HomePage();
