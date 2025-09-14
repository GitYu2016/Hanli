// 调试Fetch功能的脚本
class FetchDebugger {
    constructor() {
        this.baseUrl = 'http://localhost:3001';
        this.testResults = [];
    }

    async testAllEndpoints() {
        console.log('开始测试所有API端点...');
        
        // 测试健康检查
        await this.testHealthCheck();
        
        // 测试JSON保存
        await this.testJsonSave();
        
        // 测试媒体下载
        await this.testMediaDownload();
        
        // 输出测试结果
        this.printResults();
    }

    async testHealthCheck() {
        console.log('测试健康检查端点...');
        
        try {
            const response = await fetch(`${this.baseUrl}/api/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const result = {
                endpoint: '/api/health',
                status: response.status,
                ok: response.ok,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            };
            
            if (response.ok) {
                result.data = await response.json();
                console.log('健康检查成功:', result);
            } else {
                result.error = await response.text();
                console.error('健康检查失败:', result);
            }
            
            this.testResults.push(result);
            
        } catch (error) {
            const result = {
                endpoint: '/api/health',
                error: error.message,
                type: error.name
            };
            console.error('健康检查异常:', result);
            this.testResults.push(result);
        }
    }

    async testJsonSave() {
        console.log('测试JSON保存端点...');
        
        const testData = {
            goodsId: '123456789012',
            collectTime: new Date().toISOString(),
            goodsInfo: JSON.stringify({
                goodsId: '123456789012',
                goodsTitleCn: '测试商品',
                goodsTitleEn: 'Test Product',
                collectTime: new Date().toISOString(),
                collectUrl: window.location.href
            }, null, 2),
            monitoring: JSON.stringify({
                goodsId: '123456789012',
                collectTime: new Date().toISOString(),
                goodsSold: 100
            }, null, 2),
            mediaData: JSON.stringify({
                goodsId: '123456789012',
                media: []
            }, null, 2)
        };
        
        try {
            const response = await fetch(`${this.baseUrl}/api/save-json-files`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testData)
            });
            
            const result = {
                endpoint: '/api/save-json-files',
                status: response.status,
                ok: response.ok,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            };
            
            if (response.ok) {
                result.data = await response.json();
                console.log('JSON保存成功:', result);
            } else {
                result.error = await response.text();
                console.error('JSON保存失败:', result);
            }
            
            this.testResults.push(result);
            
        } catch (error) {
            const result = {
                endpoint: '/api/save-json-files',
                error: error.message,
                type: error.name
            };
            console.error('JSON保存异常:', result);
            this.testResults.push(result);
        }
    }

    async testMediaDownload() {
        console.log('测试媒体下载端点...');
        
        const mediaData = {
            goodsId: '123456789012',
            mediaList: [
                {
                    url: 'https://via.placeholder.com/800x800.jpg',
                    type: 'image',
                    width: 800,
                    height: 800
                }
            ]
        };
        
        try {
            const response = await fetch(`${this.baseUrl}/api/download-media`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(mediaData)
            });
            
            const result = {
                endpoint: '/api/download-media',
                status: response.status,
                ok: response.ok,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            };
            
            if (response.ok) {
                result.data = await response.json();
                console.log('媒体下载成功:', result);
            } else {
                result.error = await response.text();
                console.error('媒体下载失败:', result);
            }
            
            this.testResults.push(result);
            
        } catch (error) {
            const result = {
                endpoint: '/api/download-media',
                error: error.message,
                type: error.name
            };
            console.error('媒体下载异常:', result);
            this.testResults.push(result);
        }
    }

    printResults() {
        console.log('\n=== 测试结果汇总 ===');
        this.testResults.forEach((result, index) => {
            console.log(`\n测试 ${index + 1}: ${result.endpoint}`);
            if (result.ok) {
                console.log('✅ 成功');
                console.log('状态码:', result.status);
                console.log('响应数据:', result.data);
            } else if (result.error) {
                console.log('❌ 异常');
                console.log('错误类型:', result.type);
                console.log('错误信息:', result.error);
            } else {
                console.log('❌ 失败');
                console.log('状态码:', result.status);
                console.log('状态文本:', result.statusText);
                console.log('错误信息:', result.error);
            }
        });
        console.log('\n==================');
    }

    // 检查网络连接
    async checkNetworkConnection() {
        console.log('检查网络连接...');
        
        try {
            // 尝试访问一个简单的HTTP端点
            const response = await fetch(`${this.baseUrl}/api/health`, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache'
            });
            
            console.log('网络连接状态:', response.status);
            return response.ok;
        } catch (error) {
            console.error('网络连接失败:', error);
            return false;
        }
    }

    // 检查浏览器环境
    checkBrowserEnvironment() {
        console.log('检查浏览器环境...');
        
        const info = {
            userAgent: navigator.userAgent,
            protocol: window.location.protocol,
            host: window.location.host,
            origin: window.location.origin,
            fetchAvailable: typeof fetch !== 'undefined',
            corsSupported: 'cors' in Request.prototype
        };
        
        console.log('浏览器环境信息:', info);
        return info;
    }
}

// 创建全局调试器实例
window.fetchDebugger = new FetchDebugger();

// 自动运行测试
window.addEventListener('load', () => {
    console.log('页面加载完成，开始调试Fetch功能...');
    
    // 检查浏览器环境
    window.fetchDebugger.checkBrowserEnvironment();
    
    // 检查网络连接
    window.fetchDebugger.checkNetworkConnection().then(connected => {
        if (connected) {
            console.log('网络连接正常，开始测试API端点...');
            window.fetchDebugger.testAllEndpoints();
        } else {
            console.error('网络连接失败，请检查App是否正在运行');
        }
    });
});

// 导出调试器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FetchDebugger;
}
