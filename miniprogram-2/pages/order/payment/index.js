import Toast from 'tdesign-miniprogram/toast/index';
import { payOrder } from '../../../services/order/payOrder';

Page({
  data: {
    orderId: '',
    amount: 0,
    loading: false,
    paymentMethods: [
      {
        title: '微信支付',
        icon: 'wechat',
        value: 'wxpay',
        desc: '推荐使用微信支付'
      },
      {
        title: '余额支付',
        icon: 'wallet',
        value: 'balance',
        desc: '可用余额 ¥0.00'
      }
    ],
    selectedMethod: 'wxpay'
  },

  onLoad(options) {
    const { orderId, amount } = options;
    if (!orderId || !amount) {
      Toast.fail('订单数据错误');
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
      return;
    }

    this.setData({
      orderId,
      amount: Number(amount)
    });
  },

  // 选择支付方式
  onMethodChange(e) {
    this.setData({
      selectedMethod: e.detail.value
    });
  },

  // 确认支付
  async onPayConfirm() {
    if (this.data.loading) return;
    
    const { orderId, amount, selectedMethod } = this.data;

    this.setData({ loading: true });

    try {
      const payData = {
        orderId,
        amount,
        payType: selectedMethod
      };

      if (selectedMethod === 'wxpay') {
        // 调用微信支付
        const { nonceStr, paySign, signType, timeStamp } = await payOrder(payData);
        
        try {
          await wx.requestPayment({
            timeStamp,
            nonceStr,
            package: payData.package,
            signType,
            paySign
          });
          
          // 支付成功
          Toast.success('支付成功');
          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/order/result/index?status=success'
            });
          }, 1500);
        } catch (err) {
          // 支付失败或取消
          console.error('微信支付失败:', err);
          if (err.errMsg.includes('cancel')) {
            Toast.info('支付已取消');
          } else {
            Toast.fail('支付失败');
            setTimeout(() => {
              wx.redirectTo({
                url: '/pages/order/result/index?status=fail'
              });
            }, 1500);
          }
        }
      } else {
        // 余额支付
        await payOrder(payData);
        Toast.success('支付成功');
        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/order/result/index?status=success'
          });
        }, 1500);
      }
    } catch (err) {
      console.error('支付失败:', err);
      Toast.fail('支付失败');
    } finally {
      this.setData({ loading: false });
    }
  },

  // 取消支付
  onCancel() {
    wx.showModal({
      title: '提示',
      content: '确定要取消支付吗？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  }
}); 