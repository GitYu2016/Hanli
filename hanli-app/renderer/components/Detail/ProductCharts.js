/**
 * 产品图表组件
 * 负责产品详情页的图表渲染和数据处理
 */
class ProductCharts {
    constructor() {
        this.salesChart = null;
        this.priceChart = null;
        this.ratingChart = null;
        this.chartData = null;
    }

    /**
     * 渲染产品图表
     * @param {Object} product - 产品数据
     * @param {Object} monitoringData - 监控数据
     */
    renderCharts(product, monitoringData) {
        console.log('渲染产品图表:', product, monitoringData);
        
        // 显示加载状态
        this.showLoadingState();
        
        // 检查Chart.js是否已加载
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js未加载，无法显示图表');
            this.showErrorState('Chart.js未加载');
            return;
        }

        try {
            // 处理图表数据
            this.chartData = this.processChartData(product, monitoringData);
            
            // 渲染各个图表
            this.renderSalesChart();
            this.renderPriceChart();
            
            // 更新数据标签
            this.updateDataLabels();
            
            // 隐藏加载状态
            this.hideLoadingState();
        } catch (error) {
            console.error('图表渲染失败:', error);
            this.showErrorState('图表渲染失败');
        }
    }

    /**
     * 处理图表数据
     * @param {Object} product - 产品数据
     * @param {Object} monitoringData - 监控数据
     * @returns {Object} 处理后的图表数据
     */
    processChartData(product, monitoringData) {
        console.log('处理图表数据:', product, monitoringData);
        
        // 如果没有监控数据，使用产品基本信息生成单日数据
        if (!monitoringData || !monitoringData.trendData) {
            return this.generateSingleDayData(product, monitoringData);
        }

        const trendData = monitoringData.trendData;
        const labels = [];
        const sales = [];
        const promoPrice = [];
        const normalPrice = [];

        // 处理趋势数据
        if (trendData && Array.isArray(trendData)) {
            trendData.forEach((item, index) => {
                // 生成日期标签
                const date = new Date();
                date.setDate(date.getDate() - (trendData.length - 1 - index));
                labels.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }));

                // 销量数据 - 使用goodsSold字段
                sales.push(item.goodsSold || 0);

                // 价格数据 - 使用goodsPromoPrice和goodsNormalPrice字段
                promoPrice.push(this.parsePrice(item.goodsPromoPrice) || 0);
                normalPrice.push(this.parsePrice(item.goodsNormalPrice) || 0);
            });
        } else {
            // 如果没有趋势数据，使用产品基本信息
            return this.generateSingleDayData(product, monitoringData);
        }

        return {
            labels,
            sales,
            promoPrice,
            normalPrice
        };
    }

    /**
     * 生成单日数据
     * @param {Object} product - 产品数据
     * @param {Object} monitoringData - 监控数据
     * @returns {Object} 单日图表数据
     */
    generateSingleDayData(product, monitoringData) {
        const today = new Date();
        const labels = [today.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })];
        
        // 从监控数据中获取销量
        const sales = monitoringData ? (monitoringData.goodsSold || 0) : 0;
        
        // 从产品数据中获取价格
        let promoPrice = 0;
        let normalPrice = 0;
        
        if (product.skuList && product.skuList.length > 0) {
            const sku = product.skuList[0];
            promoPrice = this.parsePrice(sku.goodsPromoPrice) || 0;
            normalPrice = this.parsePrice(sku.goodsNormalPrice) || 0;
        }
        
        return {
            labels,
            sales: [sales],
            promoPrice: [promoPrice],
            normalPrice: [normalPrice]
        };
    }

    /**
     * 解析价格字符串
     * @param {string} priceStr - 价格字符串，如 "$11.24"
     * @returns {number} 解析后的价格数字
     */
    parsePrice(priceStr) {
        if (!priceStr) return 0;
        
        // 移除货币符号和空格，提取数字
        const match = priceStr.toString().match(/[\d.]+/);
        return match ? parseFloat(match[0]) : 0;
    }

    /**
     * 渲染销量图表
     */
    renderSalesChart() {
        const ctx = document.getElementById('sales-chart');
        if (!ctx) {
            console.error('销量图表canvas元素未找到');
            return;
        }

        // 销毁已存在的图表
        if (this.salesChart) {
            this.salesChart.destroy();
        }

        this.salesChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.chartData.labels,
                datasets: [{
                    label: '销量',
                    data: this.chartData.sales,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `销量: ${context.parsed.y}件`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '件';
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                }
            }
        });
    }

    /**
     * 渲染价格图表
     */
    renderPriceChart() {
        const ctx = document.getElementById('price-chart');
        if (!ctx) {
            console.error('价格图表canvas元素未找到');
            return;
        }

        // 销毁已存在的图表
        if (this.priceChart) {
            this.priceChart.destroy();
        }

        this.priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.chartData.labels,
                datasets: [{
                    label: '促销价格',
                    data: this.chartData.promoPrice,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }, {
                    label: '正常价格',
                    data: this.chartData.normalPrice,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ¥${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '¥' + value;
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                }
            }
        });
    }


    /**
     * 更新图表数据
     * @param {Object} product - 产品数据
     * @param {Object} monitoringData - 监控数据
     */
    updateCharts(product, monitoringData) {
        console.log('更新图表数据:', product, monitoringData);
        
        // 重新处理数据
        this.chartData = this.processChartData(product, monitoringData);
        
        // 更新各个图表
        if (this.salesChart) {
            this.salesChart.data.labels = this.chartData.labels;
            this.salesChart.data.datasets[0].data = this.chartData.sales;
            this.salesChart.update();
        }
        
        if (this.priceChart) {
            this.priceChart.data.labels = this.chartData.labels;
            this.priceChart.data.datasets[0].data = this.chartData.promoPrice;
            this.priceChart.data.datasets[1].data = this.chartData.normalPrice;
            this.priceChart.update();
        }
        
    }

    /**
     * 更新数据标签
     */
    updateDataLabels() {
        if (!this.chartData) return;
        
        // 更新销量图表标签
        const salesTitle = document.querySelector('.chart-item:nth-child(1) .chart-item-title');
        if (salesTitle) {
            const totalSales = this.chartData.sales.reduce((sum, val) => sum + val, 0);
            salesTitle.setAttribute('data-count', totalSales);
        }
        
        // 更新价格图表标签
        const priceTitle = document.querySelector('.chart-item:nth-child(2) .chart-item-title');
        if (priceTitle) {
            const avgPrice = this.chartData.normalPrice.reduce((sum, val) => sum + val, 0) / this.chartData.normalPrice.length;
            priceTitle.setAttribute('data-count', `¥${Math.round(avgPrice)}`);
        }
        
    }

    /**
     * 显示加载状态
     */
    showLoadingState() {
        const containers = ['sales-chart', 'price-chart'];
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                const chartContainer = container.closest('.chart-container');
                if (chartContainer) {
                    chartContainer.classList.add('loading');
                }
            }
        });
    }

    /**
     * 隐藏加载状态
     */
    hideLoadingState() {
        const containers = ['sales-chart', 'price-chart'];
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                const chartContainer = container.closest('.chart-container');
                if (chartContainer) {
                    chartContainer.classList.remove('loading', 'error');
                }
            }
        });
    }

    /**
     * 显示错误状态
     * @param {string} message - 错误信息
     */
    showErrorState(message) {
        const containers = ['sales-chart', 'price-chart'];
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                const chartContainer = container.closest('.chart-container');
                if (chartContainer) {
                    chartContainer.classList.remove('loading');
                    chartContainer.classList.add('error');
                    chartContainer.setAttribute('data-error', message);
                }
            }
        });
    }

    /**
     * 销毁图表
     */
    destroy() {
        if (this.salesChart) {
            this.salesChart.destroy();
            this.salesChart = null;
        }
        if (this.priceChart) {
            this.priceChart.destroy();
            this.priceChart = null;
        }
        this.chartData = null;
    }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductCharts;
}
