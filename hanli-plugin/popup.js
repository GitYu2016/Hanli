// 弹窗脚本
document.addEventListener('DOMContentLoaded', async () => {
    const statusIcon = document.getElementById('statusIcon');
    const statusText = document.getElementById('statusText');
    const collectBtn = document.getElementById('collectBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const currentPage = document.getElementById('currentPage');

    // 获取当前标签页信息
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
        currentPage.textContent = `当前页面: ${tab.url}`;
    }

    // 检查连接状态
    async function checkConnection() {
        try {
            const response = await fetch('http://localhost:3001/api/health', {
                method: 'GET',
                timeout: 3000
            });
            
            if (response.ok) {
                const result = await response.json();
                statusIcon.className = 'status-icon connected';
                statusText.textContent = 'Hanli已连接';
                collectBtn.disabled = false;
                collectBtn.textContent = '开始采集';
                console.log('连接检查成功:', result);
            } else {
                const errorText = await response.text();
                throw new Error(`连接失败: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('连接检查失败:', error);
            statusIcon.className = 'status-icon disconnected';
            statusText.textContent = 'Hanli未连接';
            collectBtn.disabled = true;
            collectBtn.textContent = '请先启动Hanli';
        }
    }

    // 执行采集
    async function executeCollection() {
        if (collectBtn.disabled) return;

        try {
            collectBtn.disabled = true;
            collectBtn.textContent = '采集中...';

            // 向当前标签页注入采集脚本
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    // 检查是否正在采集中
                    if (window.isCollecting) {
                        console.log('采集正在进行中，请等待完成');
                        return;
                    }
                    
                    // 检查必要的组件是否加载
                    if (typeof window.scrapeRawData !== 'function') {
                        alert('采集功能未就绪，请确保页面已完全加载');
                        return;
                    }
                    
                    if (typeof window.collectionManager === 'undefined') {
                        alert('CollectionManager未加载，请刷新页面重试');
                        return;
                    }
                    
                    if (typeof window.mediaManager === 'undefined') {
                        alert('MediaManager未加载，请刷新页面重试');
                        return;
                    }
                    
                    // 添加事件监听器
                    const handleCollectionComplete = () => {
                        collectBtn.disabled = false;
                        collectBtn.textContent = '开始采集';
                        window.removeEventListener('hanliPopupCollectionCompleted', handleCollectionComplete);
                        window.removeEventListener('hanliPopupCollectionFailed', handleCollectionFailed);
                    };
                    
                    const handleCollectionFailed = () => {
                        collectBtn.disabled = false;
                        collectBtn.textContent = '开始采集';
                        window.removeEventListener('hanliPopupCollectionCompleted', handleCollectionComplete);
                        window.removeEventListener('hanliPopupCollectionFailed', handleCollectionFailed);
                    };
                    
                    window.addEventListener('hanliPopupCollectionCompleted', handleCollectionComplete);
                    window.addEventListener('hanliPopupCollectionFailed', handleCollectionFailed);
                    
                    // 执行采集
                    window.scrapeRawData();
                }
            });

            // 设置超时，防止按钮永远处于采集中状态
            setTimeout(() => {
                if (collectBtn.disabled) {
                    collectBtn.disabled = false;
                    collectBtn.textContent = '开始采集';
                }
            }, 30000); // 30秒超时

        } catch (error) {
            console.error('采集失败:', error);
            alert('采集失败: ' + error.message);
            collectBtn.disabled = false;
            collectBtn.textContent = '开始采集';
        }
    }

    // 刷新状态
    async function refreshStatus() {
        refreshBtn.disabled = true;
        refreshBtn.textContent = '检查中...';
        
        await checkConnection();
        
        refreshBtn.disabled = false;
        refreshBtn.textContent = '刷新状态';
    }

    // 绑定事件
    collectBtn.addEventListener('click', executeCollection);
    refreshBtn.addEventListener('click', refreshStatus);

    // 初始检查
    await checkConnection();
});
