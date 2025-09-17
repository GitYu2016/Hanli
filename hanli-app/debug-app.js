// 调试版本的app.js
console.log('开始加载调试版本...');

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM加载完成，开始初始化...');
    
    try {
        // 检查组件是否加载
        console.log('检查组件加载状态:');
        console.log('- TopBar:', typeof TopBar !== 'undefined');
        console.log('- SideBar:', typeof SideBar !== 'undefined');
        console.log('- PageContainer:', typeof PageContainer !== 'undefined');
        console.log('- HomePageComponent:', typeof HomePageComponent !== 'undefined');
        console.log('- homePageComponentInstance:', typeof homePageComponentInstance !== 'undefined');
        
        // 创建简单的HomePage实例
        if (typeof HomePage !== 'undefined') {
            console.log('创建HomePage实例...');
            const homePageInstance = new HomePage();
            console.log('HomePage实例创建成功');
            
            console.log('开始初始化HomePage...');
            await homePageInstance.init();
            console.log('HomePage初始化完成');
        } else {
            console.error('HomePage类未定义');
        }
        
    } catch (error) {
        console.error('初始化过程中出现错误:', error);
        console.error('错误堆栈:', error.stack);
    }
});

console.log('调试脚本加载完成');
