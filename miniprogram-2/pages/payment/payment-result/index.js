Page({
  // ... 其他代码保持不变

  onViewOrder() {
    // 保存订单信息
    wx.setStorageSync('fromPayment', true);
    wx.setStorageSync('lastOrderAmount', this.data.amount);
    wx.setStorageSync('lastOrderTitle', this.data.goodsTitle);
    wx.setStorageSync('lastOrderPrice', this.data.price);
    wx.setStorageSync('lastOrderQuantity', this.data.quantity);
    wx.setStorageSync('lastOrderImage', this.data.goodsImage);
    wx.setStorageSync('lastOrderSpecs', this.data.specs);

    wx.redirectTo({
      url: '/pages/order/order-list/index?status=2&fromPayment=true'  // 跳转到待发货状态
    });
  }
}); 