const http = require('http');

async function testProductAPI(productId) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: `/api/products/${productId}`,
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

async function testProducts() {
    const products = [
        '601099514703283',
        '601099515504642', 
        '601099525339350',
        '601099537814729',
        '601099546215066'
    ];

    console.log('开始测试产品图片检测...\n');

    for (const productId of products) {
        try {
            console.log(`=== 测试产品: ${productId} ===`);
            const result = await testProductAPI(productId);
            
            if (result.success && result.product.images) {
                console.log(`图片数量: ${result.product.images.length}`);
                if (result.product.images.length > 0) {
                    console.log(`第一张图片URL: ${result.product.images[0].url}`);
                }
            } else {
                console.log('没有图片数据');
            }
            console.log('');
            
        } catch (error) {
            console.error(`测试产品 ${productId} 失败:`, error.message);
        }
    }
}

testProducts().catch(console.error);
