(() => {
    // 引入CollectionManager
    if (typeof CollectionManager === 'undefined') {
        console.warn('CollectionManager未加载，使用备用方案');
        // 如果CollectionManager未加载，创建简单的实现
        window.collectionManager = {
            async executeCollection(goodsInfoData, monitoringData, mediaData) {
                console.warn('CollectionManager未加载，使用备用方案');
                alert('CollectionManager未加载，请刷新页面重试');
            }
        };
    } else {
        // 正确实例化CollectionManager
        window.collectionManager = new CollectionManager();
        console.log('CollectionManager已加载并实例化');
    }

    // 引入CollectionProgressDialog
    if (typeof CollectionProgressDialog === 'undefined') {
        console.warn('CollectionProgressDialog未加载，使用备用方案');
        // 如果CollectionProgressDialog未加载，创建简单的实现
        window.collectionProgressDialog = {
            show: () => {},
            hide: () => {},
            updateProgress: () => {},
            updateFileTypeProgress: () => {},
            showComplete: () => {}
        };
    } else {
        // 正确实例化CollectionProgressDialog
        window.collectionProgressDialog = new CollectionProgressDialog();
        console.log('CollectionProgressDialog已加载并实例化');
    }

    // 媒体管理器
    let mediaManager = null;
    let collectButton = null;
    let monitorButton = null;
    // 将采集状态设为全局变量，供popup.js访问
    window.isCollecting = false;
    
    // 检测是否为Temu商品详情页
    function isTemuProductPage() {
        const url = window.location.href;
        // 严格检测条件：URL中必须包含temu.com
        const isTemu = url.includes('temu.com');
        console.log('页面URL检测:', url);
        console.log('是否为Temu商品页:', isTemu);
        return isTemu;
    }

    // 创建悬浮按钮容器
    function createCollectButton() {
        console.log('尝试创建采集按钮...');
        if (collectButton) {
            console.log('采集按钮已存在，跳过创建');
            return; // 按钮已存在
        }

        // 创建按钮容器
        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'hanli-button-container';
        buttonContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10000;
            display: flex;
            gap: 12px;
            align-items: center;
        `;

        // 检测系统主题
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // 创建"采集并监控"按钮
        collectButton = document.createElement('div');
        collectButton.id = 'hanli-collect-btn';
        collectButton.innerHTML = '采集并监控';
        collectButton.style.cssText = `
            background: ${isDarkMode ? '#000000' : '#333333'};
            color: white;
            padding: 12px 24px;
            border-radius: var(--radius-medium);
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
            user-select: none;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 120px;
        `;

        // 创建"仅采集监控数据"按钮
        monitorButton = document.createElement('div');
        monitorButton.id = 'hanli-monitor-btn';
        monitorButton.innerHTML = '仅采集监控数据';
        monitorButton.style.cssText = `
            background: #4a9eff;
            color: white;
            padding: 12px 24px;
            border-radius: var(--radius-medium);
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
            user-select: none;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 140px;
        `;

        // 采集按钮悬停效果
        collectButton.addEventListener('mouseenter', () => {
            if (!collectButton.disabled) {
                collectButton.style.background = isDarkMode ? '#333333' : '#555555';
                collectButton.style.transform = 'translateY(-2px)';
                collectButton.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)';
            }
        });

        collectButton.addEventListener('mouseleave', () => {
            if (!collectButton.disabled) {
                collectButton.style.background = isDarkMode ? '#000000' : '#333333';
                collectButton.style.transform = 'translateY(0)';
                collectButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
            }
        });

        // 监控按钮悬停效果
        monitorButton.addEventListener('mouseenter', () => {
            if (!monitorButton.disabled) {
                monitorButton.style.background = '#3a8eef';
                monitorButton.style.transform = 'translateY(-2px)';
                monitorButton.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)';
            }
        });

        monitorButton.addEventListener('mouseleave', () => {
            if (!monitorButton.disabled) {
                monitorButton.style.background = '#4a9eff';
                monitorButton.style.transform = 'translateY(0)';
                monitorButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
            }
        });

        // 采集按钮点击事件
        collectButton.addEventListener('click', () => {
            if (window.isCollecting) {
                console.log('采集正在进行中，请等待完成');
                return;
            }
            console.log('采集按钮被点击');
            updateCollectButtonStatus('collecting');
            // 显示进度对话框并开始采集
            showCollectionProgressDialog();
        });

        // 监控按钮点击事件
        monitorButton.addEventListener('click', () => {
            console.log('仅采集监控数据按钮被点击');
            collectMonitoringDataOnly();
        });

        // 将按钮添加到容器
        buttonContainer.appendChild(collectButton);
        buttonContainer.appendChild(monitorButton);
        document.body.appendChild(buttonContainer);
        
        console.log('采集按钮和监控按钮已创建');
    }

    // 移除采集按钮
    function removeCollectButton() {
        const buttonContainer = document.getElementById('hanli-button-container');
        if (buttonContainer) {
            buttonContainer.remove();
            collectButton = null;
            monitorButton = null;
            console.log('采集按钮和监控按钮已移除');
        }
    }

    // 初始化媒体管理器
    function initMediaManager() {
        if (typeof MediaManager === 'undefined') {
            console.warn('MediaManager未加载，使用备用方案');
            return;
        }
        
        mediaManager = new MediaManager();
        mediaManager.initImageCollection();
        mediaManager.initVideoCollection();
        window.mediaManager = mediaManager; // 设置为全局变量供CollectionManager使用
        console.log('MediaManager已初始化');
    }

    // 更新采集按钮状态
    function updateCollectButtonStatus(status) {
        if (!collectButton) return;
        
        // 检测当前主题
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        switch (status) {
            case 'collecting':
                collectButton.innerHTML = '采集中...';
                collectButton.style.background = '#666666';
                collectButton.style.cursor = 'not-allowed';
                collectButton.disabled = true;
                // 同时禁用监控按钮
                if (monitorButton) {
                    monitorButton.style.background = '#666666';
                    monitorButton.style.cursor = 'not-allowed';
                    monitorButton.disabled = true;
                }
                window.isCollecting = true;
                break;
            case 'completed':
                collectButton.innerHTML = '已采集';
                collectButton.style.background = '#4caf50';
                collectButton.style.cursor = 'default';
                collectButton.disabled = true;
                // 重新启用监控按钮
                if (monitorButton) {
                    monitorButton.style.background = '#4a9eff';
                    monitorButton.style.cursor = 'pointer';
                    monitorButton.disabled = false;
                }
                window.isCollecting = false;
                break;
            case 'ready':
            default:
                collectButton.innerHTML = '采集并监控';
                collectButton.style.background = isDarkMode ? '#000000' : '#333333';
                collectButton.style.cursor = 'pointer';
                collectButton.disabled = false;
                // 重新启用监控按钮
                if (monitorButton) {
                    monitorButton.style.background = '#4a9eff';
                    monitorButton.style.cursor = 'pointer';
                    monitorButton.disabled = false;
                }
                window.isCollecting = false;
                break;
        }
    }

    // 显示采集进度对话框
    function showCollectionProgressDialog() {
        // 先获取商品ID（从URL或页面数据中提取）
        let goodsId = '';
        try {
            // 尝试从URL中提取商品ID
            const urlParams = new URLSearchParams(window.location.search);
            goodsId = urlParams.get('goods_id') || urlParams.get('id') || '';
            
            // 如果URL中没有，尝试从页面数据中获取
            if (!goodsId) {
                const scripts = Array.from(document.querySelectorAll("script"));
                const rawScript = scripts.find(s => s.textContent.includes("window.rawData"));
                if (rawScript) {
                    const match = rawScript.textContent.match(/window\.rawData\s*=\s*(\{.*?\});/s);
                    if (match) {
                        const rawData = JSON.parse(match[1]);
                        goodsId = rawData?.store?.goodsId || '';
                    }
                }
            }
        } catch (error) {
            console.warn('无法获取商品ID:', error);
        }

        // 估算总文件数（JSON + 图片 + 视频）
        const estimatedFiles = 3; // JSON文件 + 预估的图片和视频数量
        window.collectionProgressDialog.show(goodsId, estimatedFiles);
        
        // 开始采集流程
        scrapeRawDataWithProgress();
    }
    
    // 这些函数已移动到MediaManager中
    
    
    // 设置滚动监听器
    function setupScrollListener() {
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                // 滚动后重新收集图片
                collectCurrentImages();
            }, 500);
        });
    }
    
    // 设置图片加载监听器
    function setupImageLoadListener() {
        document.addEventListener('load', (e) => {
            if (e.target.tagName === 'IMG' && e.target.src && e.target.src.startsWith('http')) {
                collectedImages.add(e.target.src);
                console.log('图片加载完成:', e.target.src);
            }
        }, true);
    }
    
    // 获取所有收集到的图片
    function getAllCollectedImages() {
        return Array.from(collectedImages);
    }
    
    // 收集当前页面的视频
    function collectCurrentVideos() {
        // 收集 <video> 标签
        const videoElements = document.querySelectorAll('video');
        videoElements.forEach(video => {
            if (video.src && video.src.startsWith('http')) {
                collectedVideos.add(video.src);
            }
            // 收集 <source> 标签中的视频
            const sources = video.querySelectorAll('source');
            sources.forEach(source => {
                if (source.src && source.src.startsWith('http')) {
                    collectedVideos.add(source.src);
                }
            });
        });

        // 收集带有视频URL的链接
        const videoLinks = document.querySelectorAll('a[href*=".mp4"], a[href*=".webm"], a[href*=".ogg"], a[href*=".avi"], a[href*=".mov"]');
        videoLinks.forEach(link => {
            if (link.href && link.href.startsWith('http')) {
                collectedVideos.add(link.href);
            }
        });

        console.log('当前页面视频数量:', collectedVideos.size);
    }
    
    // 设置视频MutationObserver
    function setupVideoObserver() {
        videoObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // 检查新添加的节点是否是视频
                            if (node.tagName === 'VIDEO' && node.src && node.src.startsWith('http')) {
                                collectedVideos.add(node.src);
                                console.log('发现新视频:', node.src);
                            }
                            
                            // 检查新添加的节点内部是否有视频
                            const videos = node.querySelectorAll ? node.querySelectorAll('video') : [];
                            videos.forEach(video => {
                                if (video.src && video.src.startsWith('http')) {
                                    collectedVideos.add(video.src);
                                    console.log('发现新视频:', video.src);
                                }
                                // 检查 <source> 标签
                                const sources = video.querySelectorAll('source');
                                sources.forEach(source => {
                                    if (source.src && source.src.startsWith('http')) {
                                        collectedVideos.add(source.src);
                                        console.log('发现新视频源:', source.src);
                                    }
                                });
                            });

                            // 检查视频链接
                            const videoLinks = node.querySelectorAll ? 
                                node.querySelectorAll('a[href*=".mp4"], a[href*=".webm"], a[href*=".ogg"], a[href*=".avi"], a[href*=".mov"]') : [];
                            videoLinks.forEach(link => {
                                if (link.href && link.href.startsWith('http')) {
                                    collectedVideos.add(link.href);
                                    console.log('发现新视频链接:', link.href);
                                }
                            });
                        }
                    });
                }
            });
        });
        
        // 开始观察
        videoObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('视频 MutationObserver 已启动');
    }
    
    // 设置视频加载监听器
    function setupVideoLoadListener() {
        document.addEventListener('load', (e) => {
            if (e.target.tagName === 'VIDEO' && e.target.src && e.target.src.startsWith('http')) {
                collectedVideos.add(e.target.src);
                console.log('视频加载完成:', e.target.src);
            }
        }, true);
    }
    
    // 获取所有收集到的视频
    function getAllCollectedVideos() {
        return Array.from(collectedVideos);
    }
    
    // 手动触发视频收集
    function triggerVideoCollection() {
        console.log('手动触发视频收集...');
        collectCurrentVideos();
        console.log('当前收集到的视频数量:', collectedVideos.size);
        return Array.from(collectedVideos);
    }
    
    // 手动触发图片收集
    function triggerImageCollection() {
        console.log('手动触发图片收集...');
        collectCurrentImages();
        console.log('当前收集到的图片数量:', collectedImages.size);
        return Array.from(collectedImages);
    }
    
    // 暴露到全局，方便调试和右键菜单调用
    window.hanliImageCollector = {
        getImages: getAllCollectedImages,
        triggerCollection: triggerImageCollection,
        getCount: () => collectedImages.size
    };
    
    window.hanliVideoCollector = {
        getVideos: getAllCollectedVideos,
        triggerCollection: triggerVideoCollection,
        getCount: () => collectedVideos.size
    };
    
    // 创建提示弹窗
    function createAppNotRunningModal() {
        // 检查是否已存在弹窗
        if (document.getElementById('hanli-app-modal')) {
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'hanli-app-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10001;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: #2d2d2d;
            border-radius: var(--radius-large);
            padding: 32px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            color: #ffffff;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            position: relative;
        `;

        // 图标区域
        const iconContainer = document.createElement('div');
        iconContainer.style.cssText = `
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 24px;
            position: relative;
        `;

        const mainIcon = document.createElement('div');
        mainIcon.style.cssText = `
            width: 64px;
            height: 64px;
            border: 2px dashed #666;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        `;

        // 创建应用图标（简化的Hanli图标）
        const appIcon = document.createElement('div');
        appIcon.style.cssText = `
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #ff6b35, #f7931e);
            border-radius: var(--radius-medium);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 18px;
        `;
        appIcon.textContent = '韩';

        // 警告图标
        const warningIcon = document.createElement('div');
        warningIcon.style.cssText = `
            position: absolute;
            bottom: -2px;
            right: -2px;
            width: 20px;
            height: 20px;
            background: #ffa500;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: bold;
        `;
        warningIcon.textContent = '!';

        mainIcon.appendChild(appIcon);
        mainIcon.appendChild(warningIcon);
        iconContainer.appendChild(mainIcon);

        // 标题
        const title = document.createElement('h2');
        title.style.cssText = `
            margin: 0 0 16px 0;
            font-size: 20px;
            font-weight: bold;
            color: #ffffff;
        `;
        title.textContent = 'Hanli客户端尚未启动';

        // 内容
        const content = document.createElement('div');
        content.style.cssText = `
            margin-bottom: 24px;
            line-height: 1.5;
            color: #cccccc;
        `;

        const line1 = document.createElement('div');
        line1.style.cssText = 'margin-bottom: 8px;';
        line1.textContent = '您需要启动Hanli客户端才能保存商品数据。';

        const line2 = document.createElement('div');
        line2.style.cssText = 'margin-bottom: 8px;';
        line2.textContent = '如果客户端已经打开但仍然无法连接，';

        const line3 = document.createElement('div');
        const helpLink = document.createElement('span');
        helpLink.style.cssText = `
            color: #4a9eff;
            text-decoration: underline;
            cursor: pointer;
        `;
        helpLink.textContent = '点击这里';
        helpLink.addEventListener('click', () => {
            alert('请检查：\n1. Hanli客户端是否正在运行\n2. 端口3001是否被占用\n3. 防火墙是否阻止了连接');
        });

        const line3Text = document.createElement('span');
        line3Text.textContent = ' 查看解决方案。';

        line3.appendChild(helpLink);
        line3.appendChild(line3Text);

        content.appendChild(line1);
        content.appendChild(line2);
        content.appendChild(line3);

        // 按钮区域
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 12px;
            justify-content: center;
        `;

        const cancelBtn = document.createElement('button');
        cancelBtn.style.cssText = `
            padding: 12px 24px;
            background: transparent;
            border: 1px solid #555;
            border-radius: var(--radius-small);
            color: #ffffff;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s ease;
        `;
        cancelBtn.textContent = '取消';
        cancelBtn.addEventListener('mouseenter', () => {
            cancelBtn.style.background = '#444';
        });
        cancelBtn.addEventListener('mouseleave', () => {
            cancelBtn.style.background = 'transparent';
        });
        cancelBtn.addEventListener('click', () => {
            modal.remove();
        });

        const openAppBtn = document.createElement('button');
        openAppBtn.style.cssText = `
            padding: 12px 24px;
            background: #4a9eff;
            border: none;
            border-radius: var(--radius-small);
            color: #ffffff;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s ease;
        `;
        openAppBtn.textContent = '启动Hanli客户端';
        openAppBtn.addEventListener('mouseenter', () => {
            openAppBtn.style.background = '#3a8eef';
        });
        openAppBtn.addEventListener('mouseleave', () => {
            openAppBtn.style.background = '#4a9eff';
        });
        openAppBtn.addEventListener('click', () => {
            // 尝试打开Hanli客户端
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = 'hanliapp://open';
            document.body.appendChild(iframe);
            setTimeout(() => {
                if (iframe.parentNode) {
                    iframe.parentNode.removeChild(iframe);
                }
            }, 100);
            modal.remove();
        });

        buttonContainer.appendChild(cancelBtn);
        buttonContainer.appendChild(openAppBtn);

        modalContent.appendChild(iconContainer);
        modalContent.appendChild(title);
        modalContent.appendChild(content);
        modalContent.appendChild(buttonContainer);

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // 点击背景关闭弹窗
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // ESC键关闭弹窗
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', handleKeyDown);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
    }

    // 执行监控采集
    async function performMonitorCollection(goodsId) {
        try {
            console.log(`开始监控采集: ${goodsId}`);
            
            // 找到包含 window.rawData 的 <script>
            let scripts = Array.from(document.querySelectorAll("script"));
            let rawScript = scripts.find(s => s.textContent.includes("window.rawData"));
            if (!rawScript) {
                throw new Error("未找到 window.rawData");
            }

            // 正则提取 JSON 字符串
            let match = rawScript.textContent.match(/window\.rawData\s*=\s*(\{.*?\});/s);
            if (!match) {
                throw new Error("无法解析 window.rawData");
            }

            let jsonStr = match[1];
            let rawData;
            try {
                rawData = JSON.parse(jsonStr);
            } catch (e) {
                throw new Error("JSON解析失败: " + e.message);
            }

            // 提取监控数据
            const monitoringData = extractMonitoringData(rawData);
            
            // 通知App采集完成
            notifyAppCollectionCompleted(goodsId, monitoringData);
            
        } catch (error) {
            console.error('监控采集失败:', error);
            // 通知App采集失败
            notifyAppCollectionCompleted(goodsId, null, error.message);
        }
    }

    // 提取监控数据
    function extractMonitoringData(rawData) {
        // 提取销量数值的函数
        function extractSoldNumeric(soldText) {
            if (!soldText || typeof soldText !== 'string') {
                return 0;
            }
            
            const cleaned = soldText.replace(/[^\d.kKw万]/g, '');
            if (!cleaned) {
                return 0;
            }
            
            if (cleaned.includes('万') || cleaned.includes('w') || cleaned.includes('W')) {
                const match = cleaned.match(/(\d+(?:\.\d+)?)[万wW]/);
                if (match) {
                    return Math.round(parseFloat(match[1]) * 10000);
                }
            } else if (cleaned.includes('k') || cleaned.includes('K')) {
                const match = cleaned.match(/(\d+(?:\.\d+)?)[kK]/);
                if (match) {
                    return Math.round(parseFloat(match[1]) * 1000);
                }
            } else {
                const match = cleaned.match(/(\d+(?:\.\d+)?)/);
                if (match) {
                    return Math.round(parseFloat(match[1]));
                }
            }
            
            return 0;
        }

        // 提取店铺销量数值的函数
        function extractStoreSoldNumeric(storeSoldText) {
            if (!storeSoldText || typeof storeSoldText !== 'string') {
                return 0;
            }
            
            const cleaned = storeSoldText.replace(/[^\d.kKw万]/g, '');
            if (!cleaned) {
                return 0;
            }
            
            if (cleaned.includes('万') || cleaned.includes('w') || cleaned.includes('W')) {
                const match = cleaned.match(/(\d+(?:\.\d+)?)[万wW]/);
                if (match) {
                    return Math.round(parseFloat(match[1]) * 10000);
                }
            } else if (cleaned.includes('k') || cleaned.includes('K')) {
                const match = cleaned.match(/(\d+(?:\.\d+)?)[kK]/);
                if (match) {
                    return Math.round(parseFloat(match[1]) * 1000);
                }
            } else {
                const match = cleaned.match(/(\d+(?:\.\d+)?)/);
                if (match) {
                    return Math.round(parseFloat(match[1]));
                }
            }
            
            return 0;
        }

        // 提取店铺粉丝数数值的函数
        function extractStoreFollowersNumeric(followersText) {
            if (!followersText || typeof followersText !== 'string') {
                return 0;
            }
            
            const cleaned = followersText.replace(/[^\d.kKw万]/g, '');
            if (!cleaned) {
                return 0;
            }
            
            if (cleaned.includes('万') || cleaned.includes('w') || cleaned.includes('W')) {
                const match = cleaned.match(/(\d+(?:\.\d+)?)[万wW]/);
                if (match) {
                    return Math.round(parseFloat(match[1]) * 10000);
                }
            } else if (cleaned.includes('k') || cleaned.includes('K')) {
                const match = cleaned.match(/(\d+(?:\.\d+)?)[kK]/);
                if (match) {
                    return Math.round(parseFloat(match[1]) * 1000);
                }
            } else {
                const match = cleaned.match(/(\d+(?:\.\d+)?)/);
                if (match) {
                    return Math.round(parseFloat(match[1]));
                }
            }
            
            return 0;
        }

        // 提取店铺商品数数值的函数
        function extractStoreItemsNumeric(itemsText) {
            if (!itemsText || typeof itemsText !== 'string') {
                return 0;
            }
            
            const cleaned = itemsText.replace(/[^\d.kKw万]/g, '');
            if (!cleaned) {
                return 0;
            }
            
            if (cleaned.includes('万') || cleaned.includes('w') || cleaned.includes('W')) {
                const match = cleaned.match(/(\d+(?:\.\d+)?)[万wW]/);
                if (match) {
                    return Math.round(parseFloat(match[1]) * 10000);
                }
            } else if (cleaned.includes('k') || cleaned.includes('K')) {
                const match = cleaned.match(/(\d+(?:\.\d+)?)[kK]/);
                if (match) {
                    return Math.round(parseFloat(match[1]) * 1000);
                }
            } else {
                const match = cleaned.match(/(\d+(?:\.\d+)?)/);
                if (match) {
                    return Math.round(parseFloat(match[1]));
                }
            }
            
            return 0;
        }

        // 提取店铺开始年份数值的函数
        function extractStoreStartYearNumeric(startYearText) {
            if (!startYearText || typeof startYearText !== 'string') {
                return 0;
            }
            
            // 提取年份数字，如 "店铺于 1 年前加入 Temu" -> 1
            const yearMatch = startYearText.match(/(\d+)\s*年/);
            if (yearMatch) {
                const yearsAgo = parseInt(yearMatch[1]);
                // 计算实际的开店年份：当前年份 - 几年前
                const currentYear = new Date().getFullYear();
                const actualStartYear = currentYear - yearsAgo;
                return actualStartYear;
            }
            
            // 如果没有找到年份信息，返回0
            return 0;
        }

        // 价格转换函数：将美元价格转换为人民币数值
        function convertPriceToCNY(priceStr) {
            if (!priceStr || typeof priceStr !== 'string') {
                return 0;
            }
            
            // 提取价格数字，支持 $1.99, $2, $10.50 等格式
            const priceMatch = priceStr.match(/\$?(\d+(?:\.\d+)?)/);
            if (priceMatch) {
                const usdPrice = parseFloat(priceMatch[1]);
                // 美元转人民币汇率（可以根据需要调整）
                const exchangeRate = 7.0; // 1 USD = 7 CNY
                const cnyPrice = Math.round(usdPrice * exchangeRate * 100) / 100; // 保留两位小数
                return cnyPrice;
            }
            
            return 0;
        }

        let goodsSoldRaw = rawData?.store?.goods?.sideSalesTip || "";
        let goodsSold = extractSoldNumeric(goodsSoldRaw);
        
        let mallData = rawData?.store?.moduleMap?.mallModule?.data?.mallData || {};
        let storeSoldRaw = (mallData?.goodsSalesNumUnit || []).join(' ');
        let storeFollowersRaw = (mallData?.followerNumUnit || []).join(' ');
        let storeltemsNumRaw = (mallData?.goodsNumUnit || []).join(' ');
        let storeStartYearRaw = (mallData?.mallTags || []).map(tag => tag.text).join('|');
        
        let storeSold = extractStoreSoldNumeric(storeSoldRaw);
        let storeFollowers = extractStoreFollowersNumeric(storeFollowersRaw);
        let storeltemsNum = extractStoreItemsNumeric(storeltemsNumRaw);
        let storeStartYear = extractStoreStartYearNumeric(storeStartYearRaw);

        // 转换价格：美元转人民币数值
        let goodsPromoPriceStr = rawData?.store?.sku?.[0]?.normalPriceStr || '';
        let goodsPromoPrice = convertPriceToCNY(goodsPromoPriceStr);

        return {
            timestamp: new Date().toLocaleString('sv-SE', { 
                timeZone: 'Asia/Shanghai' 
            }).replace(' ', 'T'),
            goodsData: {
                goodsSold: goodsSold, // 数字
                goodsPromoPrice: goodsPromoPrice // 数字（人民币）
            },
            storeData: {
                storeSold: storeSold, // 数字
                storeFollowers: storeFollowers, // 数字
                storeltemsNum: storeltemsNum, // 数字
                storeRating: mallData?.mallStar || 0, // 数字
                storeStartYear: storeStartYear // 数字
            }
        };
    }

    // 通知App采集完成
    function notifyAppCollectionCompleted(goodsId, monitoringData, error = null) {
        const data = {
            goodsId: goodsId,
            success: !error,
            monitoringData: monitoringData,
            error: error
        };
        
        console.log('通知App采集完成:', data);
        
        // 通过fetch发送到App
        fetch('http://localhost:3001/api/monitor/collection-completed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).catch(err => {
            console.error('通知App失败:', err);
        });
    }

    // 暴露采集函数到全局作用域，供右键菜单调用
    window.scrapeRawData = scrapeRawData;
    
    // 调试函数：强制创建采集按钮
    window.debugCreateButton = function() {
        console.log('强制创建采集按钮');
        createCollectButton();
    };
    
    // 调试函数：检查页面状态
    window.debugPageStatus = function() {
        console.log('=== 页面调试信息 ===');
        console.log('当前URL:', window.location.href);
        console.log('是否为Temu商品页:', isTemuProductPage());
        console.log('页面加载状态:', document.readyState);
        console.log('采集按钮是否存在:', !!collectButton);
        console.log('采集按钮元素:', collectButton);
        console.log('==================');
    };

    // 调试函数：测试销量数值提取
    window.testSoldExtraction = function() {
        console.log('=== 销量数值提取测试 ===');
        const testCases = [
            '37',
            '3.7k',
            '37k',
            '3.7万',
            '37万',
            '3.7w',
            '37W',
            '已售37件',
            '销量3.7k+',
            'Sold 37',
            '3.7K sold',
            '37万+',
            '3.7万+',
            'invalid',
            '',
            null,
            undefined
        ];
        
        testCases.forEach(testCase => {
            const result = extractSoldNumeric(testCase);
            console.log(`"${testCase}" -> ${result}`);
        });
        console.log('==================');
    };
    

    function joinObjectField(list, key = "specValue", separator = "") {
        if (!Array.isArray(list)) {
            console.error("入参必须是对象数组");
            return "";
        }
        return list
            .map(item => item?.[key]) // 取字段
            .filter(v => v)           // 过滤掉 undefined / null / 空字符串
            .join(separator);
    }

    // 提取销量数值的函数
    function extractSoldNumeric(soldText) {
        if (!soldText || typeof soldText !== 'string') {
            return 0;
        }
        
        // 移除所有非数字、小数点、k、K、万、w、W 的字符
        const cleaned = soldText.replace(/[^\d.kKw万]/g, '');
        
        if (!cleaned) {
            return 0;
        }
        
        // 处理各种格式
        if (cleaned.includes('万') || cleaned.includes('w') || cleaned.includes('W')) {
            // 处理万为单位的情况，如 "3.7万"、"37万"
            const match = cleaned.match(/(\d+(?:\.\d+)?)[万wW]/);
            if (match) {
                return Math.round(parseFloat(match[1]) * 10000);
            }
        } else if (cleaned.includes('k') || cleaned.includes('K')) {
            // 处理k为单位的情况，如 "3.7k"、"37k"
            const match = cleaned.match(/(\d+(?:\.\d+)?)[kK]/);
            if (match) {
                return Math.round(parseFloat(match[1]) * 1000);
            }
        } else {
            // 处理纯数字情况，如 "37"、"3700"
            const match = cleaned.match(/(\d+(?:\.\d+)?)/);
            if (match) {
                return Math.round(parseFloat(match[1]));
            }
        }
        
        return 0;
    }

    // 提取店铺销量数值的函数
    function extractStoreSoldNumeric(storeSoldText) {
        if (!storeSoldText || typeof storeSoldText !== 'string') {
            return 0;
        }
        
        // 移除所有非数字、小数点、k、K、万、w、W 的字符
        const cleaned = storeSoldText.replace(/[^\d.kKw万]/g, '');
        
        if (!cleaned) {
            return 0;
        }
        
        // 处理各种格式
        if (cleaned.includes('万') || cleaned.includes('w') || cleaned.includes('W')) {
            // 处理万为单位的情况，如 "7.8万"、"78万"
            const match = cleaned.match(/(\d+(?:\.\d+)?)[万wW]/);
            if (match) {
                return Math.round(parseFloat(match[1]) * 10000);
            }
        } else if (cleaned.includes('k') || cleaned.includes('K')) {
            // 处理k为单位的情况，如 "7.8k"、"78k"
            const match = cleaned.match(/(\d+(?:\.\d+)?)[kK]/);
            if (match) {
                return Math.round(parseFloat(match[1]) * 1000);
            }
        } else {
            // 处理纯数字情况，如 "78"、"7800"
            const match = cleaned.match(/(\d+(?:\.\d+)?)/);
            if (match) {
                return Math.round(parseFloat(match[1]));
            }
        }
        
        return 0;
    }

    // 提取店铺粉丝数数值的函数
    function extractStoreFollowersNumeric(followersText) {
        if (!followersText || typeof followersText !== 'string') {
            return 0;
        }
        
        // 移除所有非数字、小数点、k、K、万、w、W 的字符
        const cleaned = followersText.replace(/[^\d.kKw万]/g, '');
        
        if (!cleaned) {
            return 0;
        }
        
        // 处理各种格式
        if (cleaned.includes('万') || cleaned.includes('w') || cleaned.includes('W')) {
            // 处理万为单位的情况，如 "4.8万"、"48万"
            const match = cleaned.match(/(\d+(?:\.\d+)?)[万wW]/);
            if (match) {
                return Math.round(parseFloat(match[1]) * 10000);
            }
        } else if (cleaned.includes('k') || cleaned.includes('K')) {
            // 处理k为单位的情况，如 "4.8k"、"48k"
            const match = cleaned.match(/(\d+(?:\.\d+)?)[kK]/);
            if (match) {
                return Math.round(parseFloat(match[1]) * 1000);
            }
        } else {
            // 处理纯数字情况，如 "483"、"4830"
            const match = cleaned.match(/(\d+(?:\.\d+)?)/);
            if (match) {
                return Math.round(parseFloat(match[1]));
            }
        }
        
        return 0;
    }

    // 提取店铺商品数数值的函数
    function extractStoreItemsNumeric(itemsText) {
        if (!itemsText || typeof itemsText !== 'string') {
            return 0;
        }
        
        // 移除所有非数字、小数点、k、K、万、w、W 的字符
        const cleaned = itemsText.replace(/[^\d.kKw万]/g, '');
        
        if (!cleaned) {
            return 0;
        }
        
        // 处理各种格式
        if (cleaned.includes('万') || cleaned.includes('w') || cleaned.includes('W')) {
            // 处理万为单位的情况，如 "1.2万"、"12万"
            const match = cleaned.match(/(\d+(?:\.\d+)?)[万wW]/);
            if (match) {
                return Math.round(parseFloat(match[1]) * 10000);
            }
        } else if (cleaned.includes('k') || cleaned.includes('K')) {
            // 处理k为单位的情况，如 "1.2k"、"12k"
            const match = cleaned.match(/(\d+(?:\.\d+)?)[kK]/);
            if (match) {
                return Math.round(parseFloat(match[1]) * 1000);
            }
        } else {
            // 处理纯数字情况，如 "5"、"50"
            const match = cleaned.match(/(\d+(?:\.\d+)?)/);
            if (match) {
                return Math.round(parseFloat(match[1]));
            }
        }
        
        return 0;
    }

    // 提取店铺开始年份数值的函数
    function extractStoreStartYearNumeric(startYearText) {
        if (!startYearText || typeof startYearText !== 'string') {
            return 0;
        }
        
        // 提取年份数字，如 "店铺于 1 年前加入 Temu" -> 1
        const yearMatch = startYearText.match(/(\d+)\s*年/);
        if (yearMatch) {
            const yearsAgo = parseInt(yearMatch[1]);
            // 计算实际的开店年份：当前年份 - 几年前
            const currentYear = new Date().getFullYear();
            const actualStartYear = currentYear - yearsAgo;
            return actualStartYear;
        }
        
        // 如果没有找到年份信息，返回0
        return 0;
    }


    // 检测视频信息并筛选
    async function detectAndFilterVideos(videoUrls, options = {}) {
        const {
            minDuration = 1,      // 最小时长（秒）
            maxDuration = 300,    // 最大时长（秒）
            minSize = 1024 * 1024, // 最小文件大小（1MB）
            maxSize = 500 * 1024 * 1024, // 最大文件大小（500MB）
            supportedFormats = ['mp4', 'webm', 'ogg', 'avi', 'mov']
        } = options;
        
        const videoInfoList = [];
        let loadedCount = 0;
        let errorCount = 0;
        
        console.log(`开始检测 ${videoUrls.length} 个视频的信息...`);
        
        for (const videoUrl of videoUrls) {
            try {
                // 检查文件格式
                const url = new URL(videoUrl);
                const pathname = url.pathname.toLowerCase();
                const hasValidFormat = supportedFormats.some(format => pathname.includes(`.${format}`));
                
                if (!hasValidFormat) {
                    console.log(`跳过不支持的视频格式: ${videoUrl}`);
                    continue;
                }

                // 创建视频对象来获取信息
                const video = document.createElement('video');
                video.crossOrigin = 'anonymous';
                video.preload = 'metadata';
                
                const videoPromise = new Promise((resolve) => {
                    video.onloadedmetadata = () => {
                        const duration = video.duration;
                        const videoWidth = video.videoWidth;
                        const videoHeight = video.videoHeight;
                        
                        // 检查时长是否在范围内
                        const isDurationValid = duration >= minDuration && duration <= maxDuration;
                        
                        // 尝试获取文件大小（通过HEAD请求）
                        getVideoFileSize(videoUrl).then(fileSize => {
                            const isSizeValid = fileSize >= minSize && fileSize <= maxSize;
                            
                            const videoInfo = {
                                url: videoUrl,
                                duration: duration,
                                width: videoWidth,
                                height: videoHeight,
                                fileSize: fileSize,
                                isDurationValid: isDurationValid,
                                isSizeValid: isSizeValid,
                                aspectRatio: videoWidth && videoHeight ? (videoWidth / videoHeight).toFixed(2) : null,
                                format: getVideoFormat(videoUrl)
                            };
                            
                            videoInfoList.push(videoInfo);
                            loadedCount++;
                            
                            console.log(`视频 ${loadedCount}: ${duration}s, ${videoWidth}×${videoHeight}px, 时长有效:${isDurationValid}, 大小有效:${isSizeValid}`);
                            
                            resolve();
                        }).catch(() => {
                            // 如果无法获取文件大小，仍然添加视频信息
                            const videoInfo = {
                                url: videoUrl,
                                duration: duration,
                                width: videoWidth,
                                height: videoHeight,
                                fileSize: null,
                                isDurationValid: isDurationValid,
                                isSizeValid: true, // 假设大小有效
                                aspectRatio: videoWidth && videoHeight ? (videoWidth / videoHeight).toFixed(2) : null,
                                format: getVideoFormat(videoUrl)
                            };
                            
                            videoInfoList.push(videoInfo);
                            loadedCount++;
                            resolve();
                        });
                    };
                    
                    video.onerror = () => {
                        console.warn('无法加载视频:', videoUrl);
                        errorCount++;
                        resolve();
                    };
                });
                
                video.src = videoUrl;
                await videoPromise;
            } catch (error) {
                console.warn('处理视频时出错:', videoUrl, error);
                errorCount++;
            }
        }
        
        console.log(`视频检测完成: 成功加载 ${loadedCount} 个, 失败 ${errorCount} 个`);
        return videoInfoList;
    }

    // 获取视频文件大小
    async function getVideoFileSize(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            const contentLength = response.headers.get('content-length');
            return contentLength ? parseInt(contentLength) : null;
        } catch (error) {
            console.warn('无法获取视频文件大小:', url, error);
            return null;
        }
    }

    // 获取视频格式
    function getVideoFormat(url) {
        try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname.toLowerCase();
            if (pathname.includes('.mp4')) return 'mp4';
            if (pathname.includes('.webm')) return 'webm';
            if (pathname.includes('.ogg')) return 'ogg';
            if (pathname.includes('.avi')) return 'avi';
            if (pathname.includes('.mov')) return 'mov';
            return 'unknown';
        } catch (error) {
            return 'unknown';
        }
    }

    // 检测图片尺寸并筛选
    async function detectAndFilterImages(imageUrls, options = {}) {
        const {
            minWidth = 400,
            minHeight = 400,
            maxWidth = 2000,
            maxHeight = 2000,
            targetWidth = 800,
            targetHeight = 800,
            tolerance = 50 // 允许的尺寸误差
        } = options;
        
        const imageInfoList = [];
        let loadedCount = 0;
        let errorCount = 0;
        
        console.log(`开始检测 ${imageUrls.length} 张图片的尺寸...`);
        
        for (const imageUrl of imageUrls) {
            try {
                // 创建图片对象来获取尺寸
                const img = new Image();
                img.crossOrigin = 'anonymous';
                
                const imagePromise = new Promise((resolve) => {
                    img.onload = () => {
                        const width = img.width;
                        const height = img.height;
                        
                        // 检查尺寸是否在范围内
                        const isInRange = width >= minWidth && width <= maxWidth && 
                                         height >= minHeight && height <= maxHeight;
                        
                        // 检查是否接近目标尺寸
                        const isTargetSize = Math.abs(width - targetWidth) <= tolerance && 
                                           Math.abs(height - targetHeight) <= tolerance;
                        
                        const imageInfo = {
                            url: imageUrl,
                            width: width,
                            height: height,
                            isInRange: isInRange,
                            isTargetSize: isTargetSize,
                            aspectRatio: (width / height).toFixed(2)
                        };
                        
                        imageInfoList.push(imageInfo);
                        loadedCount++;
                        
                        console.log(`图片 ${loadedCount}: ${width}×${height}px, 范围内:${isInRange}, 目标尺寸:${isTargetSize}`);
                        
                        resolve();
                    };
                    img.onerror = () => {
                        console.warn('无法加载图片:', imageUrl);
                        errorCount++;
                        resolve();
                    };
                });
                
                img.src = imageUrl;
                await imagePromise;
            } catch (error) {
                console.warn('处理图片时出错:', imageUrl, error);
                errorCount++;
            }
        }
        
        console.log(`图片检测完成: 成功加载 ${loadedCount} 张, 失败 ${errorCount} 张`);
        return imageInfoList;
    }

    // 带进度跟踪的采集函数
    async function scrapeRawDataWithProgress() {
        try {
            // 更新进度：开始JSON处理
            window.collectionProgressDialog.updateFileTypeProgress('json', 0, 1);
            
            // 找到包含 window.rawData 的 <script>
            let scripts = Array.from(document.querySelectorAll("script"));
            let rawScript = scripts.find(s => s.textContent.includes("window.rawData"));
            if (!rawScript) {
                console.error("未找到 window.rawData");
                window.collectionProgressDialog.hide();
                updateCollectButtonStatus('ready');
                return;
            }

            // 正则提取 JSON 字符串
            let match = rawScript.textContent.match(/window\.rawData\s*=\s*(\{.*?\});/s);
            if (!match) {
                console.error("无法解析 window.rawData");
                window.collectionProgressDialog.hide();
                updateCollectButtonStatus('ready');
                return;
            }

            let jsonStr = match[1];
            let rawData;
            try {
                rawData = JSON.parse(jsonStr);
            } catch (e) {
                console.error("JSON解析失败: " + e.message);
                window.collectionProgressDialog.hide();
                updateCollectButtonStatus('ready');
                return;
            }

            // 更新进度：JSON处理完成
            window.collectionProgressDialog.updateFileTypeProgress('json', 1, 1);
            window.collectionProgressDialog.updateProgress(1);

            // 提取商品信息
            const goodsInfo = extractGoodsInfo(rawData);
            const mediaData = await processMediaWithProgress(rawData, goodsInfo.goodsId);
            
            // 更新总文件数
            const totalFiles = 1 + mediaData.media.length; // JSON + 媒体文件
            window.collectionProgressDialog.updateProgress(1, totalFiles);

            // 使用CollectionManager执行完整采集流程（不自动打开App）
            await window.collectionManager.executeCollectionWithProgress(
                goodsInfo.goodsInfoData, 
                goodsInfo.monitoringData, 
                mediaData, 
                false // 不自动打开App
            );

            // 显示采集完成
            window.collectionProgressDialog.showComplete();
            updateCollectButtonStatus('completed');
            
            // 通知采集完成事件
            document.dispatchEvent(new CustomEvent('hanliCollectionCompleted'));

        } catch (error) {
            console.error('采集流程失败:', error);
            window.collectionProgressDialog.hide();
            updateCollectButtonStatus('ready');
            alert('采集失败: ' + error.message);
        }
    }

    // 处理媒体文件并更新进度
    async function processMediaWithProgress(rawData, goodsId) {
        // 使用MediaManager处理媒体文件
        if (!mediaManager) {
            console.error('MediaManager未初始化');
            return { media: [] };
        }
        
        // 获取收集到的图片和视频
        const pageImages = mediaManager.getAllCollectedImages();
        const pageVideos = mediaManager.getAllCollectedVideos();
        
        // 合并所有图片源
        let allImages = [...(rawData?.store?.goods?.mainImages || [])];
        allImages = [...allImages, ...pageImages];
        allImages = [...new Set(allImages)]; // 去重
        
        // 更新图片进度
        window.collectionProgressDialog.updateFileTypeProgress('images', 0, allImages.length);
        
        // 使用MediaManager进行图片筛选
        const allImageInfo = await mediaManager.detectAndFilterImages(allImages, {
            minWidth: 800,
            minHeight: 800,
            maxWidth: 10000,
            maxHeight: 10000,
            targetWidth: 800,
            targetHeight: 800,
            tolerance: 50,
            maxCount: 100
        });
        
        // 筛选出符合尺寸要求的图片
        const filteredImageInfo = allImageInfo.filter(img => {
            return img.width >= 800 && img.height >= 800;
        });
        
        // 更新图片进度
        window.collectionProgressDialog.updateFileTypeProgress('images', filteredImageInfo.length, allImages.length);
        
        // 处理视频数据
        window.collectionProgressDialog.updateFileTypeProgress('videos', 0, pageVideos.length);
        
        const allVideoInfo = await mediaManager.detectAndFilterVideos(pageVideos, {
            minSize: 0,
            maxSize: 1024 * 1024 * 1024,
            maxCount: 50
        });
        
        // 更新视频进度
        window.collectionProgressDialog.updateFileTypeProgress('videos', allVideoInfo.length, pageVideos.length);
        
        // 生成媒体数据
        const mediaData = mediaManager.generateMediaData(goodsId, filteredImageInfo, allVideoInfo);
        
        return mediaData;
    }

    // 提取商品信息
    function extractGoodsInfo(rawData) {
        // 取出标题和价格（根据 Temu rawData 结构调整字段）
        let goodsId = rawData?.store?.goodsId || "";
        // 遍历 crumbOptList
        let crumbOptList = rawData?.store?.crumbOptList || [];
        let goodsCat1 = ''
        if (crumbOptList.length > 1) {
            goodsCat1 = crumbOptList[1].optName
        }
        let goodsCat2 = ''
        if (crumbOptList.length > 2) {
            goodsCat2 = crumbOptList[2].optName
        }

        let goodsTitleEn = rawData?.store?.goods?.goodsName || "";
        let itemId = rawData?.store?.goods?.itemId || "";
        let goodsCat3 = goodsTitleEn
        let goodsSoldRaw = rawData?.store?.goods?.sideSalesTip || "";
        let goodsSold = extractSoldNumeric(goodsSoldRaw);
        let goodsPropertys = rawData?.store?.goods?.goodsProperty || [];
        let skuInfoList = rawData?.store?.sku || [];
        let skuList = [];
        for (let sku of skuInfoList) {
            let specs = sku?.specs || [];
            let skuName = joinObjectField(specs, 'specValue', '|');

            skuList.push({
                skuId: sku.skuId,
                skuName: skuName,
                skuPic: sku.thumbUrl,
                goodsPromoPrice: sku.normalPriceStr,
                goodsNormalPrice: sku.normalLinePriceStr
            });
        }

        let mallData = rawData?.store?.moduleMap?.mallModule?.data?.mallData || {};
        let storeId = mallData?.mallId || '';
        let storeName = mallData?.mallName || '';
        let storeRating = mallData?.mallStar || '';
        let storeSoldRaw = (mallData?.goodsSalesNumUnit || []).join(' ');
        let storeFollowersRaw = (mallData?.followerNumUnit || []).join(' ');
        let storeltemsNumRaw = (mallData?.goodsNumUnit || []).join(' ');
        let storeStartYearRaw = joinObjectField((mallData?.mallTags || []), 'text', '|');
        
        let storeSold = extractStoreSoldNumeric(storeSoldRaw);
        let storeFollowers = extractStoreFollowersNumeric(storeFollowersRaw);
        let storeltemsNum = extractStoreItemsNumeric(storeltemsNumRaw);
        let storeStartYear = extractStoreStartYearNumeric(storeStartYearRaw);
        let goodsPropertyInfo = {};
        for (let goodsProperty of goodsPropertys) {
            let goodsDescKey = goodsProperty?.["key"] || '';
            let goodsDescValues = (goodsProperty?.["values"] || []).join('|');
            goodsPropertyInfo[goodsDescKey] = goodsDescValues
        }

        // 生成当前时间戳（东八区ISO格式）
        const now = new Date();
        const collectTime = now.toLocaleString('sv-SE', { 
            timeZone: 'Asia/Shanghai' 
        }).replace(' ', 'T');

        // 商品信息数据
        let goodsInfoData = {
            goodsId,
            itemId,
            goodsCat1,
            goodsCat2,
            goodsCat3,
            goodsTitleEn,
            goodsTitleCn: "", // 留空，支持用户编辑
            skuList,
            goodsPropertyInfo,
            collectTime,
            collectUrl: window.location.href // 添加采集链接
        };

        // 商品监控数据
        let monitoringData = {
            goodsId,
            listingDate: "", // 留空
            collectTime,
            goodsSold,
            goodsCat1,
            goodsCat2,
            goodsCat3,
            skuList: skuList.map(sku => ({
                skuId: sku.skuId,
                skuName: sku.skuName,
                skuPic: sku.skuPic,
                goodsPromoPrice: sku.goodsPromoPrice
            })),
            storeId,
            storeName,
            storeData: {
                storeRating,
                storeSold,
                storeFollowers,
                storeltemsNum,
                storeStartYear
            }
        };

        return { goodsInfoData, monitoringData };
    }

    async function scrapeRawData() {
        // 找到包含 window.rawData 的 <script>
        let scripts = Array.from(document.querySelectorAll("script"));
        let rawScript = scripts.find(s => s.textContent.includes("window.rawData"));
        if (!rawScript) {
            console.error("未找到 window.rawData");
            return;
        }

        // 正则提取 JSON 字符串
        let match = rawScript.textContent.match(/window\.rawData\s*=\s*(\{.*?\});/s);
        if (!match) {
            console.error("无法解析 window.rawData");
            return;
        }

        let jsonStr = match[1];
        let rawData;
        try {
            rawData = JSON.parse(jsonStr);
        } catch (e) {
            console.error("JSON解析失败: " + e.message);
            return;
        }

        // 取出标题和价格（根据 Temu rawData 结构调整字段）
        let goodsId = rawData?.store?.goodsId || "";
        // 遍历 crumbOptList
        let crumbOptList = rawData?.store?.crumbOptList || [];
        let goodsCat1 = ''
        if (crumbOptList.length > 1) {
            goodsCat1 = crumbOptList[1].optName
        }
        let goodsCat2 = ''
        if (crumbOptList.length > 2) {
            goodsCat2 = crumbOptList[2].optName
        }

        let goodsTitleEn = rawData?.store?.goods?.goodsName || "";
        let itemId = rawData?.store?.goods?.itemId || "";
        let goodsCat3 = goodsTitleEn
        let goodsSoldRaw = rawData?.store?.goods?.sideSalesTip || "";
        let goodsSold = extractSoldNumeric(goodsSoldRaw);
        let goodsPropertys = rawData?.store?.goods?.goodsProperty || [];
        let skuInfoList = rawData?.store?.sku || [];
        let skuList = [];
        for (let sku of skuInfoList) {
            let specs = sku?.specs || [];
            let skuName = joinObjectField(specs, 'specValue', '|');

            skuList.push({
                skuId: sku.skuId,
                skuName: skuName,
                skuPic: sku.thumbUrl,
                goodsPromoPrice: sku.normalPriceStr,
                goodsNormalPrice: sku.normalLinePriceStr
            });
        }

        // 获取商品主图片 - 尝试多种可能的字段名
        let mainImages = rawData?.store?.goods?.mainImages || 
                        rawData?.store?.goods?.images || 
                        rawData?.store?.goods?.imageList || 
                        [];
        let allImages = [...mainImages];
        
        console.log('原始主图片数据:', rawData?.store?.goods?.mainImages);
        console.log('备用图片字段1:', rawData?.store?.goods?.images);
        console.log('备用图片字段2:', rawData?.store?.goods?.imageList);
        
        // 添加SKU图片
        skuList.forEach(sku => {
            if (sku.skuPic) {
                allImages.push(sku.skuPic);
            }
        });
        
        // 尝试从其他可能的位置获取图片
        // 检查是否有其他图片字段
        if (rawData?.store?.goods) {
            Object.keys(rawData.store.goods).forEach(key => {
                if (key.toLowerCase().includes('image') || key.toLowerCase().includes('pic')) {
                    console.log(`发现可能的图片字段 ${key}:`, rawData.store.goods[key]);
                }
            });
        }

        // 使用MediaManager处理媒体文件
        if (!mediaManager) {
            console.error('MediaManager未初始化');
            return;
        }
        
        // 获取收集到的图片和视频
        const pageImages = mediaManager.getAllCollectedImages();
        const pageVideos = mediaManager.getAllCollectedVideos();
        console.log('页面收集到的图片数量:', pageImages.length);
        console.log('页面收集到的视频数量:', pageVideos.length);
        
        // 合并所有图片源
        allImages = [...allImages, ...pageImages];
        
        // 去重处理
        allImages = [...new Set(allImages)];
        
        console.log('=== 图片采集调试信息 ===');
        console.log('主图片数量:', mainImages.length);
        console.log('SKU图片数量:', skuList.filter(sku => sku.skuPic).length);
        console.log('去重前总图片数量:', mainImages.length + skuList.filter(sku => sku.skuPic).length);
        console.log('去重后总图片数量:', allImages.length);
        console.log('所有图片URLs:', allImages);

        // 使用MediaManager进行图片筛选
        console.log('开始进行图片筛选...');
        const allImageInfo = await mediaManager.detectAndFilterImages(allImages, {
            minWidth: 800,       // 最小宽度800px
            minHeight: 800,      // 最小高度800px
            maxWidth: 10000,     // 增加最大尺寸限制
            maxHeight: 10000,    // 增加最大尺寸限制
            targetWidth: 800,
            targetHeight: 800,
            tolerance: 50,
            maxCount: 100        // 增加最大数量限制
        });
        
        // 筛选出符合尺寸要求的图片
        const filteredImageInfo = allImageInfo.filter(img => {
            const isLargeEnough = img.width >= 800 && img.height >= 800;
            console.log(`图片筛选结果: ${img.url} - ${img.width}x${img.height} - 符合要求: ${isLargeEnough}`);
            return isLargeEnough;
        });
        
        console.log(`图片筛选完成: 原始${allImageInfo.length}张, 筛选后${filteredImageInfo.length}张`);
        
        // 处理视频数据
        console.log('=== 视频采集调试信息 ===');
        console.log('页面收集到的视频数量:', pageVideos.length);
        console.log('所有视频URLs:', pageVideos);
        
        // 使用MediaManager检测视频
        const allVideoInfo = await mediaManager.detectAndFilterVideos(pageVideos, {
            minSize: 0,          // 不设置最小文件大小限制
            maxSize: 1024 * 1024 * 1024, // 最大1GB
            maxCount: 50         // 增加最大数量限制
        });
        console.log(`检测到视频数量: ${allVideoInfo.length}`);
        
        // 使用MediaManager生成媒体数据
        const mediaData = mediaManager.generateMediaData(goodsId, filteredImageInfo, allVideoInfo);
        console.log('插件生成的媒体数据:', mediaData);
        let mallData = rawData?.store?.moduleMap?.mallModule?.data?.mallData || {};
        let storeId = mallData?.mallId || '';
        let storeName = mallData?.mallName || '';
        let storeRating = mallData?.mallStar || '';
        let storeSoldRaw = (mallData?.goodsSalesNumUnit || []).join(' ');
        let storeFollowersRaw = (mallData?.followerNumUnit || []).join(' ');
        let storeltemsNumRaw = (mallData?.goodsNumUnit || []).join(' ');
        let storeStartYearRaw = joinObjectField((mallData?.mallTags || []), 'text', '|');
        
        let storeSold = extractStoreSoldNumeric(storeSoldRaw);
        let storeFollowers = extractStoreFollowersNumeric(storeFollowersRaw);
        let storeltemsNum = extractStoreItemsNumeric(storeltemsNumRaw);
        let storeStartYear = extractStoreStartYearNumeric(storeStartYearRaw);
        let goodsPropertyInfo = {};
        for (let goodsProperty of goodsPropertys) {
            let goodsDescKey = goodsProperty?.["key"] || '';
            let goodsDescValues = (goodsProperty?.["values"] || []).join('|');
            goodsPropertyInfo[goodsDescKey] = goodsDescValues
        }

        // 生成当前时间戳（东八区ISO格式）
        const now = new Date();
        const collectTime = now.toLocaleString('sv-SE', { 
            timeZone: 'Asia/Shanghai' 
        }).replace(' ', 'T');

        // 商品信息数据
        let goodsInfoData = {
            goodsId,
            itemId,
            goodsCat1,
            goodsCat2,
            goodsCat3,
            goodsTitleEn,
            goodsTitleCn: "", // 留空，支持用户编辑
            skuList,
            goodsPropertyInfo,
            collectTime,
            collectUrl: window.location.href // 添加采集链接
        };

        // 商品监控数据
        let monitoringData = {
            goodsId,
            listingDate: "", // 留空
            collectTime,
            goodsSold,
            goodsCat1,
            goodsCat2,
            goodsCat3,
            skuList: skuList.map(sku => ({
                skuId: sku.skuId,
                skuName: sku.skuName,
                skuPic: sku.skuPic,
                goodsPromoPrice: sku.goodsPromoPrice
            })),
            storeId,
            storeName,
            storeData: {
                storeRating,
                storeSold,
                storeFollowers,
                storeltemsNum,
                storeStartYear
            }
        };

        // 使用CollectionManager执行完整采集流程（默认打开App）
        try {
            await window.collectionManager.executeCollection(goodsInfoData, monitoringData, mediaData, true);
        } catch (error) {
            console.error('采集流程失败:', error);
            alert('采集失败: ' + error.message);
            updateCollectButtonStatus('ready'); // 采集失败时重置按钮状态
        }
    }

    // 延迟创建按钮的函数
    function delayedCreateButton() {
        setTimeout(() => {
            console.log('延迟创建采集按钮...');
            if (isTemuProductPage()) {
                console.log('检测到Temu商品详情页，创建采集按钮');
                createCollectButton();
            }
        }, 1000); // 延迟1秒
    }

    // 页面加载完成后开始收集图片和视频
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOMContentLoaded 事件触发');
            initMediaManager();
            delayedCreateButton();
        });
    } else {
        // 页面已经加载完成
        console.log('页面已加载完成');
        initMediaManager();
        delayedCreateButton();
    }

    // 监听URL变化（SPA页面切换）
    let currentUrl = window.location.href;
    const urlObserver = new MutationObserver(() => {
        if (window.location.href !== currentUrl) {
            currentUrl = window.location.href;
            console.log('URL变化:', currentUrl);
            
            // 延迟检查，给页面时间加载
            setTimeout(() => {
                if (isTemuProductPage()) {
                    console.log('切换到Temu商品详情页，创建采集按钮');
                    createCollectButton();
                } else {
                    console.log('离开Temu商品详情页，移除采集按钮');
                    removeCollectButton();
                }
            }, 500);
        }
    });

    // 开始观察URL变化
    urlObserver.observe(document, { subtree: true, childList: true });

    // 监听采集完成事件
    document.addEventListener('hanliCollectionCompleted', () => {
        console.log('收到采集完成通知，更新按钮状态为"已采集"');
        updateCollectButtonStatus('completed');
        // 通知popup.js采集完成
        window.dispatchEvent(new CustomEvent('hanliPopupCollectionCompleted'));
    });

    // 监听监控采集请求
    document.addEventListener('hanliMonitorCollectionRequest', (event) => {
        console.log('收到监控采集请求:', event.detail);
        const { goodsId, collectUrl } = event.detail;
        
        // 检查当前页面是否匹配请求的URL
        if (window.location.href === collectUrl) {
            console.log('页面匹配，开始监控采集');
            // 执行监控采集
            performMonitorCollection(goodsId);
        }
    });

    // 自动检测URL变化并触发监控采集
    let lastUrl = window.location.href;
    const urlCheckInterval = setInterval(() => {
        if (window.location.href !== lastUrl) {
            lastUrl = window.location.href;
            console.log('URL变化检测到:', lastUrl);
            
            // 检查是否是Temu商品页面
            if (isTemuProductPage()) {
                console.log('检测到Temu商品页面，尝试自动监控采集');
                // 尝试从URL或页面数据中提取goodsId
                let goodsId = '';
                try {
                    // 尝试从URL中提取商品ID
                    const urlParams = new URLSearchParams(window.location.search);
                    goodsId = urlParams.get('goods_id') || urlParams.get('id') || '';
                    
                    // 如果URL中没有，尝试从页面数据中获取
                    if (!goodsId) {
                        const scripts = Array.from(document.querySelectorAll("script"));
                        const rawScript = scripts.find(s => s.textContent.includes("window.rawData"));
                        if (rawScript) {
                            const match = rawScript.textContent.match(/window\.rawData\s*=\s*(\{.*?\});/s);
                            if (match) {
                                const rawData = JSON.parse(match[1]);
                                goodsId = rawData?.store?.goodsId || '';
                            }
                        }
                    }
                    
                    if (goodsId) {
                        console.log(`自动触发监控采集: ${goodsId}`);
                        // 延迟执行，确保页面完全加载
                        setTimeout(() => {
                            performMonitorCollection(goodsId);
                        }, 3000);
                    }
                } catch (error) {
                    console.warn('自动监控采集失败:', error);
                }
            }
        }
    }, 1000); // 每秒检查一次

    // 监听采集失败事件
    document.addEventListener('hanliCollectionFailed', () => {
        console.log('收到采集失败通知，重置按钮状态');
        updateCollectButtonStatus('ready');
        // 通知popup.js采集失败
        window.dispatchEvent(new CustomEvent('hanliPopupCollectionFailed'));
    });

    // 监听取消采集事件
    document.addEventListener('hanliCollectionCancelled', () => {
        console.log('收到取消采集通知，重置按钮状态');
        updateCollectButtonStatus('ready');
        window.isCollecting = false;
        // 隐藏进度对话框
        if (window.collectionProgressDialog) {
            window.collectionProgressDialog.hide();
        }
    });

    // 监听localStorage变化，处理监控数据采集请求
    window.addEventListener('storage', (e) => {
        if (e.key === 'collectionRequest') {
            console.log('收到监控数据采集请求:', e.newValue);
            
            try {
                const request = JSON.parse(e.newValue);
                if (request.action === 'startCollection') {
                    handleMonitorCollectionRequest(request);
                }
            } catch (error) {
                console.error('解析采集请求失败:', error);
                // 返回错误结果
                localStorage.setItem('collectionResult_' + request.taskId, JSON.stringify({
                    success: false,
                    error: '解析采集请求失败: ' + error.message
                }));
            }
        }
    });

    // 处理监控数据采集请求
    async function handleMonitorCollectionRequest(request) {
        const { taskId, goodsId, url } = request;
        console.log(`开始处理监控数据采集请求: 任务ID=${taskId}, 商品ID=${goodsId}, URL=${url}`);
        
        try {
            // 检查当前页面是否是目标URL
            if (window.location.href !== url) {
                console.log('当前页面URL不匹配，跳过采集');
                localStorage.setItem('collectionResult_' + taskId, JSON.stringify({
                    success: false,
                    error: '页面URL不匹配'
                }));
                return;
            }
            
            // 执行监控数据采集
            const monitoringData = await performMonitorDataCollection(goodsId);
            
            if (monitoringData) {
                // 返回成功结果
                localStorage.setItem('collectionResult_' + taskId, JSON.stringify({
                    success: true,
                    collectedData: {
                        goodsData: monitoringData.goodsData || {},
                        storeData: monitoringData.storeData || {}
                    }
                }));
                console.log('监控数据采集成功:', taskId);
            } else {
                throw new Error('采集数据为空');
            }
            
        } catch (error) {
            console.error('监控数据采集失败:', error);
            // 返回错误结果
            localStorage.setItem('collectionResult_' + taskId, JSON.stringify({
                success: false,
                error: error.message
            }));
        }
    }

    // 执行监控数据采集
    async function performMonitorDataCollection(goodsId) {
        try {
            console.log(`开始监控数据采集: ${goodsId}`);
            
            // 显示采集提示卡片
            showCollectionCard();
            
            // 等待1秒让用户看到提示
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 找到包含 window.rawData 的 <script>
            let scripts = Array.from(document.querySelectorAll("script"));
            let rawScript = scripts.find(s => s.textContent.includes("window.rawData"));
            if (!rawScript) {
                throw new Error("未找到 window.rawData");
            }

            // 正则提取 JSON 字符串
            let match = rawScript.textContent.match(/window\.rawData\s*=\s*(\{.*?\});/s);
            if (!match) {
                throw new Error("无法解析 window.rawData");
            }

            let jsonStr = match[1];
            let rawData;
            try {
                rawData = JSON.parse(jsonStr);
            } catch (e) {
                throw new Error("JSON解析失败: " + e.message);
            }

            // 提取监控数据
            const monitoringData = extractMonitoringData(rawData);
            
            // 隐藏采集提示卡片
            hideCollectionCard();
            
            // 转换为监控数据采集页面需要的格式
            return {
                goodsData: {
                    goodsSold: monitoringData.goodsSold,
                    goodsPromoPrice: monitoringData.goodsPromoPrice,
                    goodsTitle: monitoringData.goodsTitle,
                    goodsRating: monitoringData.goodsRating,
                    goodsReviews: monitoringData.goodsReviews
                },
                storeData: {
                    storeSold: monitoringData.storeSold,
                    storeFollowers: monitoringData.storeFollowers,
                    storeItemsNum: monitoringData.storeltemsNum,
                    storeRating: monitoringData.storeRating,
                    storeName: monitoringData.storeName
                }
            };
            
        } catch (error) {
            console.error('监控数据采集失败:', error);
            // 确保在出错时也隐藏提示卡片
            hideCollectionCard();
            throw error;
        }
    }

    // 显示采集提示卡片
    function showCollectionCard() {
        // 如果已经存在，先移除
        hideCollectionCard();
        
        // 创建采集提示卡片
        const card = document.createElement('div');
        card.id = 'hanli-collection-card';
        card.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #ff6b35, #f7931e);
            color: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 999999;
            text-align: center;
            min-width: 400px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            animation: fadeIn 0.3s ease-in-out;
        `;
        
        card.innerHTML = `
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 15px;">
                🔄 正在采集数据
            </div>
            <div style="font-size: 16px; margin-bottom: 10px;">
                汉利插件正在自动采集监控数据
            </div>
            <div style="display: flex; justify-content: center; align-items: center;">
                <div style="width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid white; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 10px;"></div>
                <span>请稍候，正在处理页面数据...</span>
            </div>
            <style>
                @keyframes fadeIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }
                @keyframes fadeOut {
                    from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    to { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        document.body.appendChild(card);
        console.log('显示采集提示卡片');
    }

    // 隐藏采集提示卡片
    function hideCollectionCard() {
        const card = document.getElementById('hanli-collection-card');
        if (card) {
            card.style.animation = 'fadeOut 0.3s ease-in-out';
            setTimeout(() => {
                if (card.parentNode) {
                    card.parentNode.removeChild(card);
                }
            }, 300);
            console.log('隐藏采集提示卡片');
        }
    }

    // 仅采集监控数据（不采集图片和商品信息）
    async function collectMonitoringDataOnly() {
        try {
            console.log('开始仅采集监控数据...');
            
            // 更新按钮状态为采集中
            updateMonitorButtonStatus('collecting');
            
            // 找到包含 window.rawData 的 <script>
            let scripts = Array.from(document.querySelectorAll("script"));
            let rawScript = scripts.find(s => s.textContent.includes("window.rawData"));
            if (!rawScript) {
                throw new Error("未找到 window.rawData");
            }

            // 正则提取 JSON 字符串
            let match = rawScript.textContent.match(/window\.rawData\s*=\s*(\{.*?\});/s);
            if (!match) {
                throw new Error("无法解析 window.rawData");
            }

            let jsonStr = match[1];
            let rawData;
            try {
                rawData = JSON.parse(jsonStr);
            } catch (e) {
                throw new Error("JSON解析失败: " + e.message);
            }

            // 提取监控数据
            const monitoringData = extractMonitoringData(rawData);
            
            // 获取商品ID
            const goodsId = rawData?.store?.goodsId || "";
            if (!goodsId) {
                throw new Error("无法获取商品ID");
            }

            // 转换为监控数据格式
            const monitoringEntry = {
                id: Date.now().toString(),
                utcTime: new Date().toISOString().replace('Z', '+08:00'),
                goodsData: {
                    goodsSold: monitoringData.goodsData.goodsSold + "件",
                    goodsPromoPrice: "¥" + monitoringData.goodsData.goodsPromoPrice,
                    goodsTitle: rawData?.store?.goods?.goodsName || "",
                    goodsRating: rawData?.store?.goods?.rating || "0",
                    goodsReviews: (rawData?.store?.goods?.reviewCount || 0) + "条评价"
                },
                storeData: {
                    storeSold: monitoringData.storeData.storeSold + "件",
                    storeFollowers: monitoringData.storeData.storeFollowers + "人关注",
                    storeItemsNum: monitoringData.storeData.storeltemsNum + "个商品",
                    storeRating: monitoringData.storeData.storeRating.toString(),
                    storeName: rawData?.store?.moduleMap?.mallModule?.data?.mallData?.mallName || ""
                }
            };

            console.log('监控数据提取完成:', monitoringEntry);

            // 发送到App后端保存到monitoring.json
            const response = await fetch('http://localhost:3001/api/monitor/update-monitoring-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    goodsId: goodsId,
                    monitoringData: [monitoringEntry] // 直接发送单个条目
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`保存monitoring.json失败: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || '保存monitoring.json失败');
            }

            console.log('监控数据已保存到monitoring.json');
            
            // 更新按钮状态为已完成
            updateMonitorButtonStatus('completed');
            
            // 显示成功消息
            showSuccessMessage('监控数据采集成功！数据已保存到monitoring.json');
            
            // 触发完成事件
            window.dispatchEvent(new CustomEvent('hanliPopupMonitoringCollectionCompleted', {
                detail: { monitoringData: monitoringEntry }
            }));

            // 通知监控数据采集页面更新状态
            localStorage.setItem('monitoringDataUpdated', Date.now().toString());
            
            // 向父窗口发送消息（如果存在）
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                    type: 'monitoringDataUpdated',
                    goodsId: goodsId,
                    timestamp: Date.now()
                }, '*');
            }

        } catch (error) {
            console.error('仅采集监控数据失败:', error);
            
            // 更新按钮状态为就绪
            updateMonitorButtonStatus('ready');
            
            // 显示错误消息
            showErrorMessage('监控数据采集失败: ' + error.message);
            
            // 触发失败事件
            window.dispatchEvent(new CustomEvent('hanliPopupMonitoringCollectionFailed', {
                detail: { error: error.message }
            }));
        }
    }

    // 显示成功消息
    function showSuccessMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            font-weight: 500;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;
        
        messageDiv.innerHTML = `
            <div style="display: flex; align-items: center;">
                <div style="margin-right: 10px; font-size: 18px;">✅</div>
                <div>${message}</div>
            </div>
            <style>
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            </style>
        `;
        
        document.body.appendChild(messageDiv);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.parentNode.removeChild(messageDiv);
                    }
                }, 300);
            }
        }, 3000);
    }

    // 显示错误消息
    function showErrorMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 15px 20px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            font-weight: 500;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;
        
        messageDiv.innerHTML = `
            <div style="display: flex; align-items: center;">
                <div style="margin-right: 10px; font-size: 18px;">❌</div>
                <div>${message}</div>
            </div>
            <style>
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            </style>
        `;
        
        document.body.appendChild(messageDiv);
        
        // 5秒后自动移除
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.parentNode.removeChild(messageDiv);
                    }
                }, 300);
            }
        }, 5000);
    }

    // 更新监控按钮状态
    function updateMonitorButtonStatus(status) {
        if (!monitorButton) return;
        
        switch (status) {
            case 'collecting':
                monitorButton.innerHTML = '采集中...';
                monitorButton.style.background = '#666666';
                monitorButton.style.cursor = 'not-allowed';
                monitorButton.disabled = true;
                break;
            case 'completed':
                monitorButton.innerHTML = '已采集';
                monitorButton.style.background = '#4caf50';
                monitorButton.style.cursor = 'default';
                monitorButton.disabled = true;
                // 2秒后恢复
                setTimeout(() => {
                    updateMonitorButtonStatus('ready');
                }, 2000);
                break;
            case 'ready':
            default:
                monitorButton.innerHTML = '仅采集监控数据';
                monitorButton.style.background = '#4a9eff';
                monitorButton.style.cursor = 'pointer';
                monitorButton.disabled = false;
                break;
        }
    }

    // 将函数暴露到全局作用域
    window.collectMonitoringDataOnly = collectMonitoringDataOnly;

})();
