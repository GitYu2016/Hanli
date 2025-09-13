(() => {
    // 全局图片收集器
    let collectedImages = new Set();
    let imageObserver = null;
    let collectButton = null;
    
    // 全局视频收集器
    let collectedVideos = new Set();
    let videoObserver = null;
    
    // 检测是否为Temu商品详情页
    function isTemuProductPage() {
        const url = window.location.href;
        // 放宽检测条件：只要是temu.com域名就显示按钮
        const isTemu = url.includes('temu.com');
        console.log('页面URL检测:', url);
        console.log('是否为Temu商品页:', isTemu);
        return isTemu;
    }

    // 创建悬浮采集按钮
    function createCollectButton() {
        console.log('尝试创建采集按钮...');
        if (collectButton) {
            console.log('采集按钮已存在，跳过创建');
            return; // 按钮已存在
        }

        collectButton = document.createElement('div');
        collectButton.id = 'hanli-collect-btn';
        collectButton.innerHTML = '采集';
        collectButton.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 10000;
            background: #ff6b35;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
            user-select: none;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        // 悬停效果
        collectButton.addEventListener('mouseenter', () => {
            collectButton.style.background = '#e55a2b';
            collectButton.style.transform = 'translateY(-2px)';
            collectButton.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)';
        });

        collectButton.addEventListener('mouseleave', () => {
            collectButton.style.background = '#ff6b35';
            collectButton.style.transform = 'translateY(0)';
            collectButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        });

        // 点击事件
        collectButton.addEventListener('click', () => {
            console.log('采集按钮被点击');
            scrapeRawData();
        });

        document.body.appendChild(collectButton);
        console.log('采集按钮已创建');
    }

    // 移除采集按钮
    function removeCollectButton() {
        if (collectButton) {
            collectButton.remove();
            collectButton = null;
            console.log('采集按钮已移除');
        }
    }

    // 初始化图片监听
    function initImageCollection() {
        console.log('开始初始化图片收集...');
        
        // 立即收集当前页面的图片
        collectCurrentImages();
        
        // 设置MutationObserver监听动态加载的图片
        setupImageObserver();
        
        // 监听页面滚动，触发懒加载图片
        setupScrollListener();
        
        // 监听图片加载事件
        setupImageLoadListener();
    }
    
    // 初始化视频监听
    function initVideoCollection() {
        console.log('开始初始化视频收集...');
        
        // 立即收集当前页面的视频
        collectCurrentVideos();
        
        // 设置MutationObserver监听动态加载的视频
        setupVideoObserver();
        
        // 监听页面滚动，触发懒加载视频
        setupScrollListener();
        
        // 监听视频加载事件
        setupVideoLoadListener();
    }
    
    // 收集当前页面的图片
    function collectCurrentImages() {
        const allImages = document.querySelectorAll('img');
        allImages.forEach(img => {
            if (img.src && img.src.startsWith('http')) {
                collectedImages.add(img.src);
            }
        });
        console.log('当前页面图片数量:', collectedImages.size);
    }
    
    // 设置MutationObserver
    function setupImageObserver() {
        imageObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // 检查新添加的节点是否是图片
                            if (node.tagName === 'IMG' && node.src && node.src.startsWith('http')) {
                                collectedImages.add(node.src);
                                console.log('发现新图片:', node.src);
                            }
                            
                            // 检查新添加的节点内部是否有图片
                            const imgs = node.querySelectorAll ? node.querySelectorAll('img') : [];
                            imgs.forEach(img => {
                                if (img.src && img.src.startsWith('http')) {
                                    collectedImages.add(img.src);
                                    console.log('发现新图片:', img.src);
                                }
                            });
                        }
                    });
                }
            });
        });
        
        // 开始观察
        imageObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('MutationObserver 已启动');
    }
    
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
            border-radius: 12px;
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

        // 创建应用图标（简化的韩立图标）
        const appIcon = document.createElement('div');
        appIcon.style.cssText = `
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #ff6b35, #f7931e);
            border-radius: 8px;
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
        title.textContent = '韩立客户端尚未启动';

        // 内容
        const content = document.createElement('div');
        content.style.cssText = `
            margin-bottom: 24px;
            line-height: 1.5;
            color: #cccccc;
        `;

        const line1 = document.createElement('div');
        line1.style.cssText = 'margin-bottom: 8px;';
        line1.textContent = '您需要启动韩立客户端才能保存商品数据。';

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
            alert('请检查：\n1. 韩立客户端是否正在运行\n2. 端口3001是否被占用\n3. 防火墙是否阻止了连接');
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
            border-radius: 6px;
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
            border-radius: 6px;
            color: #ffffff;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s ease;
        `;
        openAppBtn.textContent = '启动韩立客户端';
        openAppBtn.addEventListener('mouseenter', () => {
            openAppBtn.style.background = '#3a8eef';
        });
        openAppBtn.addEventListener('mouseleave', () => {
            openAppBtn.style.background = '#4a9eff';
        });
        openAppBtn.addEventListener('click', () => {
            // 尝试打开韩立客户端
            window.open('hanli://open', '_blank');
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
    
    // 生成JSON文件
    async function generateJsonFiles(goodsInfoData, monitoringData, mediaData) {
        try {
            console.log('开始生成JSON文件...');
            
            const goodsId = goodsInfoData.goodsId;
            const collectTime = goodsInfoData.collectTime;
            
            // 生成JSON数据
            const goodsInfoJson = JSON.stringify(goodsInfoData, null, 2);
            const monitoringJson = JSON.stringify(monitoringData, null, 2);
            const mediaDataJson = JSON.stringify(mediaData, null, 2);
            
            // 通过API发送JSON数据到App，让App保存到数据目录
            const jsonData = {
                goodsId: goodsId,
                collectTime: collectTime,
                goodsInfo: goodsInfoJson,
                monitoring: monitoringJson,
                mediaData: mediaDataJson
            };
            
            const response = await fetch('http://localhost:3001/api/save-json-files', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jsonData)
            });
            
            if (!response.ok) {
                throw new Error(`保存JSON文件失败: ${response.statusText}`);
            }
            
            const result = await response.json();
            if (!result.success) {
                throw new Error(`保存JSON文件失败: ${result.error}`);
            }
            
            console.log('JSON文件保存完成:', result.files);
            return result.files;
            
        } catch (error) {
            console.error('生成JSON文件失败:', error);
            throw error;
        }
    }

    // 发送数据到hanli-app
    async function sendToHanliApp(data) {
        try {
            const response = await fetch('http://localhost:3001/api/import-goods', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    // 不显示提示，直接唤起App
                    console.log('数据已成功发送到hanli-app');
                } else {
                    // 显示错误提示
                    createAppNotRunningModal();
                }
            } else {
                // 显示连接失败提示
                createAppNotRunningModal();
            }
        } catch (error) {
            console.error('发送数据到hanli-app失败:', error);
            // 显示连接失败提示
            createAppNotRunningModal();
        }
    }

    function exportJSON(data) {
        let jsonStr = JSON.stringify(data, null, 2);
        let blob = new Blob([jsonStr], {type: "application/json"});

        // 文件名用商品名，去掉非法字符
        let safeTitle = (data.goodsTitleEn || "temu_product").replace(/[\\/:*?"<>|]/g, "_");
        let fileName = safeTitle + ".json";

        let url = URL.createObjectURL(blob);
        let a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    }

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
            return parseInt(yearMatch[1]);
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

    async function scrapeRawData() {
        // 找到包含 window.rawData 的 <script>
        let scripts = Array.from(document.querySelectorAll("script"));
        let rawScript = scripts.find(s => s.textContent.includes("window.rawData"));
        if (!rawScript) {
            alert("未找到 window.rawData");
            return;
        }

        // 正则提取 JSON 字符串
        let match = rawScript.textContent.match(/window\.rawData\s*=\s*(\{.*?\});/s);
        if (!match) {
            alert("无法解析 window.rawData");
            return;
        }

        let jsonStr = match[1];
        let rawData;
        try {
            rawData = JSON.parse(jsonStr);
        } catch (e) {
            alert("JSON解析失败: " + e.message);
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

        // 在采集前再次收集图片和视频，确保获取到最新的媒体文件
        triggerImageCollection();
        triggerVideoCollection();
        const pageImages = getAllCollectedImages();
        const pageVideos = getAllCollectedVideos();
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

        // 在插件端进行图片筛选
        console.log('开始进行图片筛选...');
        const allImageInfo = await detectAndFilterImages(allImages, {
            minWidth: 0,         // 不设置最小尺寸限制
            minHeight: 0,        // 不设置最小尺寸限制
            maxWidth: 10000,     // 增加最大尺寸限制
            maxHeight: 10000,    // 增加最大尺寸限制
            targetWidth: 800,
            targetHeight: 800,
            tolerance: 50,
            maxCount: 100        // 增加最大数量限制
        });
        console.log(`检测到图片数量: ${allImageInfo.length}`);
        
        // 处理视频数据
        console.log('=== 视频采集调试信息 ===');
        console.log('页面收集到的视频数量:', pageVideos.length);
        console.log('所有视频URLs:', pageVideos);
        
        // 检测视频（不进行筛选，保留所有视频）
        const allVideoInfo = await detectAndFilterVideos(pageVideos, {
            minDuration: 0,      // 不设置最小时长限制
            maxDuration: 3600,   // 最大时长1小时
            minSize: 0,          // 不设置最小文件大小限制
            maxSize: 1024 * 1024 * 1024, // 最大1GB
            supportedFormats: ['mp4', 'webm', 'ogg', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'm4v', '3gp'],
            maxCount: 50         // 增加最大数量限制
        });
        console.log(`检测到视频数量: ${allVideoInfo.length}`);
        
        // 生成媒体数据（包含所有图片和视频）
        const mediaData = {
            goodsId: goodsId,
            media: []
        };

        // 添加所有图片
        allImageInfo.forEach(img => {
            mediaData.media.push({
                url: img.url,
                width: img.width,
                height: img.height,
                isTargetSize: img.isTargetSize || false,
                type: 'image',
                path: null // 初始为null，缓存后更新
            });
        });

        // 添加所有视频
        allVideoInfo.forEach(video => {
            mediaData.media.push({
                url: video.url,
                width: video.width || 0,
                height: video.height || 0,
                isTargetSize: true, // 视频不进行尺寸过滤
                type: 'video',
                path: null // 初始为null，缓存后更新
            });
        });

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

        // 生成JSON文件
        const jsonFiles = await generateJsonFiles(goodsInfoData, monitoringData, mediaData);
        
        // 发送数据到hanli-app，包含JSON文件路径
        sendToHanliApp({
            goodsId: goodsId,
            jsonFiles: jsonFiles
        });
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
            initImageCollection();
            initVideoCollection();
            delayedCreateButton();
        });
    } else {
        // 页面已经加载完成
        console.log('页面已加载完成');
        initImageCollection();
        initVideoCollection();
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
})();
