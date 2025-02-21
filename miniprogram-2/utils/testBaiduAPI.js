const axios = require('axios');

async function testBaiduAPI(token, queryText = "你好，这是一条测试消息") {
    try {
        console.log('正在发送测试消息...');
        const url = 'https://keyue.cloud.baidu.com/online/core/v5/stream/query';
        
        const requestData = {
            queryText,
            sessionId: "test-" + Date.now(),
            variables: {}
        };

        console.log('发送请求:', {
            url,
            headers: {
                'Content-Type': 'application/json',
                'token': token
            },
            data: requestData
        });

        const response = await axios.post(url, requestData, {
            headers: {
                'Content-Type': 'application/json',
                'token': token
            },
            responseType: 'text'  // 改为text类型
        });
        
        // 处理响应数据
        const lines = response.data.split('\n');
        let fullResponse = '';
        
        for (const line of lines) {
            if (line.startsWith('data:')) {
                try {
                    const data = JSON.parse(line.slice(5));
                    if (data.answer && data.answer[0] && data.answer[0].reply && data.answer[0].reply.text) {
                        const text = data.answer[0].reply.text;
                        process.stdout.write(text);  // 实时打印
                        fullResponse += text;
                    }
                } catch (e) {
                    // 忽略解析错误的行
                }
            }
        }
        
        console.log('\n\n完整回复:', fullResponse);
        return true;
    } catch (error) {
        console.error('API测试失败。错误详情:');
        if (error.response) {
            console.error('状态码:', error.response.status);
            console.error('响应头:', error.response.headers);
            console.error('响应数据:', error.response.data);
        } else if (error.request) {
            console.error('请求发送失败:', error.request);
        } else {
            console.error('错误信息:', error.message);
        }
        return false;
    }
}

// 使用示例
// testBaiduAPI('你的token');

module.exports = {
    testBaiduAPI
}; 