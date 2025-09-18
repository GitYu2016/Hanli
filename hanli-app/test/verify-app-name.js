// 验证应用名称设置
const { app } = require('electron');

console.log('=== 应用名称验证 ===');
console.log('app.getName():', app.getName());
console.log('app.getAppPath():', app.getAppPath());
console.log('app.getVersion():', app.getVersion());
console.log('process.platform:', process.platform);
console.log('process.argv:', process.argv);

// 检查package.json
const packageJson = require('./package.json');
console.log('package.json name:', packageJson.name);
console.log('package.json productName:', packageJson.build?.productName);
console.log('package.json appId:', packageJson.build?.appId);
