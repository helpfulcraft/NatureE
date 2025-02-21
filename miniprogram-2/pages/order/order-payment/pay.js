/** 模拟微信支付 */
export function wechatPayOrder(payOrderInfo) {
  return new Promise((resolve, reject) => {
    // 模拟支付确认对话框
    wx.showModal({
      title: '模拟支付',
      content: `确认支付 ¥${(payOrderInfo.amount / 100).toFixed(2)}？`,
      success(res) {
        if (res.confirm) {
          // 模拟支付成功
          setTimeout(() => {
            resolve({
              success: true,
              timeStamp: Date.now(),
              transactionId: `mock_trans_${Date.now()}`,
              orderId: payOrderInfo.orderId
            });
          }, 1000);
        } else {
          // 用户取消支付
          reject({
            errMsg: 'requestPayment:fail cancel',
            errCode: 'USER_CANCEL'
          });
        }
      },
      fail() {
        // 调用失败
        reject({
          errMsg: 'requestPayment:fail',
          errCode: 'SYSTEM_ERROR'
        });
      }
    });
  });
} 