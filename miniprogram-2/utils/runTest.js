const { testBaiduAPI } = require('./testBaiduAPI');

const token = '0847251d-f226-454f-a715-f2dcff6602f1';

async function runTest() {
    try {
        console.log('开始测试百度API...');
        
        // 测试简单问候
        console.log('\n测试1: 简单问候');
        await testBaiduAPI(token);
        
        // 测试复杂问题
        console.log('\n\n测试2: 复杂问题');
        await testBaiduAPI(token, "请帮我写一首关于春天的诗");
        
    } catch (error) {
        console.error('测试过程中发生错误:', error);
    }
}

runTest(); 