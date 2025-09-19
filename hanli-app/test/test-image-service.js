const http = require('http');

async function testImageService() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/products/601099514703283/image/1758109463316_li63u7h2m.jpeg',
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            console.log(`状态码: ${res.statusCode}`);
            console.log(`Content-Type: ${res.headers['content-type']}`);
            console.log(`Content-Length: ${res.headers['content-length']}`);
            
            if (res.statusCode === 200) {
                console.log('图片服务工作正常！');
                resolve(true);
            } else {
                console.log('图片服务返回错误');
                resolve(false);
            }
        });

        req.on('error', (error) => {
            console.error('请求错误:', error);
            reject(error);
        });

        req.end();
    });
}

testImageService().catch(console.error);
