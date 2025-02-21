// API配置
const API_KEY = '0847251d-f226-454f-a715-f2dcff6602f1';
const API_URL = 'https://aip.baidubce.com/rpc/2.0/unit/v3/chat';

// 测试函数
function testBaiduApi() {
  // 获取access token
  wx.request({
    url: `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${API_KEY}&client_secret=${API_KEY}`,
    method: 'GET',
    success: function(tokenRes) {
      if (!tokenRes.data.access_token) {
        console.error('获取access token失败');
        return;
      }

      console.log('成功获取access token:', tokenRes.data.access_token);

      // 测试对话
      wx.request({
        url: `${API_URL}?access_token=${tokenRes.data.access_token}`,
        method: 'POST',
        data: {
          log_id: "UNITTEST_" + Date.now(),
          version: "3.0",
          service_id: "S1234",  // 需要替换为实际的service_id
          session_id: "",
          request: {
            query: "你好",
            user_id: "test_user"
          }
        },
        header: {
          'content-type': 'application/json'
        },
        success: function(chatRes) {
          console.log('API测试结果:', chatRes.data);
        },
        fail: function(error) {
          console.error('对话请求失败:', error);
        }
      });
    },
    fail: function(error) {
      console.error('获取token失败:', error);
    }
  });
}

// 执行测试
testBaiduApi(); 