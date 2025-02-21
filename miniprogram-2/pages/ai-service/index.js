import Toast from 'tdesign-miniprogram/toast/index';

const token = '0847251d-f226-454f-a715-f2dcff6602f1';
const API_URL = 'https://keyue.cloud.baidu.com/online/core/v5/stream/query';

Page({
  data: {
    userInfo: null,
    messages: [],
    inputValue: '',
    loading: false,
    scrollToMessage: '',
    sessionId: '',
    quickQuestions: [
      '如何查看订单状态？',
      '怎么修改收货地址？',
      '如何申请退款？',
      '商品什么时候发货？',
      '如何修改订单？',
      '优惠券怎么使用？'
    ]
  },

  onLoad() {
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    this.setData({ 
      userInfo,
      sessionId: 'session_' + Date.now()
    });
  },

  onInputChange(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  onQuickQuestionTap(e) {
    const { question } = e.currentTarget.dataset;
    this.setData({
      inputValue: question
    }, () => {
      this.onSend();
    });
  },

  async onSend() {
    const { inputValue, loading, sessionId } = this.data;
    if (loading) return;
    if (!inputValue.trim()) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      });
      return;
    }

    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      time: new Date().toLocaleTimeString()
    };

    this.setData({
      messages: [...this.data.messages, userMessage],
      inputValue: '',
      loading: true,
      scrollToMessage: `msg-${userMessage.id}`
    });

    try {
      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: API_URL,
          method: 'POST',
          data: {
            queryText: inputValue,
            sessionId,
            variables: {}
          },
          header: {
            'Content-Type': 'application/json',
            'token': token
          },
          success: resolve,
          fail: reject
        });
      });

      // 处理响应数据
      const lines = response.data.split('\n');
      let aiResponse = '';
      
      for (const line of lines) {
        if (line.startsWith('data:')) {
          try {
            const data = JSON.parse(line.slice(5));
            if (data.answer?.[0]?.reply?.text) {
              aiResponse += data.answer[0].reply.text;
            }
          } catch (e) {
            console.error('解析响应时出错:', e);
          }
        }
      }

      if (aiResponse) {
        const aiMessage = {
          id: Date.now(),
          type: 'ai',
          content: aiResponse,
          time: new Date().toLocaleTimeString()
        };

        this.setData({
          messages: [...this.data.messages, aiMessage],
          scrollToMessage: `msg-${aiMessage.id}`
        });
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      wx.showToast({
        title: '发送失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  onScrollToUpper() {
    // 可以在这里实现加载历史消息的功能
    console.log('滚动到顶部');
  }
}); 