/**
 * JsonPreviewModal 使用示例
 * 展示如何在其他组件中使用JSON预览弹窗
 */

// 使用示例
function showJsonPreviewExample() {
    // 创建JSON预览弹窗实例
    const jsonPreviewModal = new JsonPreviewModal();
    
    // 设置回调函数
    jsonPreviewModal.setCallbacks({
        onClose: () => {
            console.log('JSON预览弹窗已关闭');
        },
        onCopy: (jsonString) => {
            console.log('JSON已复制:', jsonString);
        }
    });
    
    // 示例JSON数据
    const sampleJsonData = {
        "id": "123456789012",
        "name": "示例产品",
        "price": 99.99,
        "currency": "RMB",
        "weight": 500,
        "dimensions": {
            "length": 100,
            "width": 50,
            "height": 30
        },
        "tags": ["电子产品", "数码", "手机配件"],
        "isAvailable": true,
        "createdAt": "2024-09-07T00:00:00",
        "updatedAt": "2024-09-07T12:00:00",
        "description": "这是一个示例产品的详细描述，包含了产品的各种属性和信息。",
        "images": [
            {
                "url": "https://example.com/image1.jpg",
                "alt": "产品主图",
                "width": 800,
                "height": 600
            },
            {
                "url": "https://example.com/image2.jpg",
                "alt": "产品细节图",
                "width": 800,
                "height": 600
            }
        ],
        "specifications": {
            "material": "铝合金",
            "color": "银色",
            "warranty": "1年",
            "origin": "中国"
        },
        "reviews": {
            "averageRating": 4.5,
            "totalReviews": 128,
            "ratingDistribution": {
                "5": 80,
                "4": 30,
                "3": 15,
                "2": 2,
                "1": 1
            }
        }
    };
    
    // 打开JSON预览弹窗
    jsonPreviewModal.open(sampleJsonData);
}

// 在页面加载完成后创建全局实例
document.addEventListener('DOMContentLoaded', function() {
    // 创建全局JSON预览弹窗实例
    window.jsonPreviewModalInstance = new JsonPreviewModal();
    
    // 设置全局回调
    window.jsonPreviewModalInstance.setCallbacks({
        onClose: () => {
            console.log('JSON预览弹窗已关闭');
        },
        onCopy: (jsonString) => {
            console.log('JSON已复制到剪贴板');
        }
    });
    
    // JSON预览弹窗组件已初始化
});

// 导出使用示例函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { showJsonPreviewExample };
} else {
    window.showJsonPreviewExample = showJsonPreviewExample;
}
