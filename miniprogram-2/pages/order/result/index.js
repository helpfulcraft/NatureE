import Toast from 'tdesign-miniprogram/toast/index';

Page({
  data: {
    status: 'success',
    message: '',
    icon: ''
  },

  onLoad(options) {
    const status = options.status || 'success';
    let message = '支付成功';
    let icon = 'check-circle';

    if (status === 'fail') {
      message = '支付失败';
      icon = 'close-circle';
    }

    this.setData({
      status,
      message,
      icon
    });

    // 如果是支付成功，2秒后自动跳转到订单列表
    if (status === 'success') {
      setTimeout(() => {
        this.onViewOrder();
      }, 2000);
    }
  },

  // 查看订单
  onViewOrder() {
    wx.redirectTo({
      url: '/pages/order/order-list/index',
      fail: (err) => {
        console.error('跳转订单列表失败:', err);
        // 如果跳转失败，尝试使用switchTab
        wx.switchTab({
          url: '/pages/order/order-list/index',
          fail: (switchErr) => {
            console.error('switchTab到订单列表失败:', switchErr);
            Toast({
              context: this,
              selector: '#t-toast',
              message: '跳转失败',
              theme: 'error'
            });
          }
        });
      }
    });
  },

  // 返回首页
  onBackToHome() {
    wx.switchTab({
      url: '/pages/home/home',
      fail: (err) => {
        console.error('跳转首页失败:', err);
        Toast({
          context: this,
          selector: '#t-toast',
          message: '跳转失败',
          theme: 'error'
        });
      }
    });
  },

  // 重新支付
  onRetryPay() {
    const pages = getCurrentPages();
    const payPage = pages[pages.length - 2];
    if (payPage && payPage.route.includes('payment')) {
      wx.navigateBack();
    } else {
      Toast.fail('订单信息已失效');
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/order/order-list/index'
        });
      }, 1500);
    }
  }
}); 