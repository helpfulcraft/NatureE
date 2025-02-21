/** 微信支付 */
export function wechatPayOrder(payOrderInfo) {
  const { payInfo } = payOrderInfo;
  
  return new Promise((resolve, reject) => {
    wx.requestPayment({
      ...payInfo,
      success(res) {
        console.log('支付成功:', res);
        resolve(res);
      },
      fail(err) {
        console.error('支付失败:', err);
        reject(err);
      }
    });
  });
}

/** 提交支付 */
export function commitPay(params) {
  // 模拟支付成功
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          isSuccess: true,
          code: 'Success',
          data: {
            channel: 'wechat',
            payInfo: {
              timeStamp: String(Date.now()),
              nonceStr: 'nonceStr',
              package: 'prepay_id=mock_prepay_id',
              signType: 'MD5',
              paySign: 'mock_pay_sign'
            },
            tradeNo: `PAY_${Date.now()}`,
            interactId: `INTERACT_${Date.now()}`,
            transactionId: `TRANS_${Date.now()}`
          }
        }
      });
    }, 500);
  });
} 