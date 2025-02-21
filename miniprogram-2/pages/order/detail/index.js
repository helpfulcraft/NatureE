import Toast from 'tdesign-miniprogram/toast/index';
import { fetchOrderDetail } from '../../../services/order/fetchOrderDetail';

Page({
  data: {
    orderId: '',
    orderDetail: null,
    loading: true,
    // 订单状态步骤
    steps: [
      { title: '提交订单', desc: '' },
      { title: '支付订单', desc: '' },
      { title: '商家发货', desc: '' },
      { title: '确认收货', desc: '' },
      { title: '完成订单', desc: '' }
    ],
    currentStep: 0
  },

  onLoad(options) {
    const { orderId } = options;
    if (!orderId) {
      Toast.fail('订单不存在');
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
      return;
    }

    this.setData({ orderId });
    this.loadOrderDetail();
  },

  async loadOrderDetail() {
    try {
      const detail = await fetchOrderDetail(this.data.orderId);
      
      // 处理订单状态步骤
      const stepMap = {
        1: 0, // 待付款
        2: 1, // 待发货
        3: 2, // 待收货
        4: 3, // 待评价
        5: 4  // 已完成
      };

      this.setData({
        orderDetail: detail,
        currentStep: stepMap[detail.status] || 0,
        loading: false
      });
    } catch (err) {
      console.error('加载订单详情失败:', err);
      Toast.fail('加载失败');
      this.setData({ loading: false });
    }
  },

  // 复制订单号
  onCopyOrderNo() {
    wx.setClipboardData({
      data: this.data.orderDetail.orderNo,
      success: () => {
        Toast.success('复制成功');
      }
    });
  },

  // 取消订单
  async onCancelOrder() {
    try {
      await wx.showModal({
        title: '提示',
        content: '确定要取消该订单吗？'
      });

      // TODO: 调用取消订单接口
      Toast.success('订单已取消');
      this.loadOrderDetail();
    } catch (err) {
      console.error('取消订单失败:', err);
    }
  },

  // 去支付
  onGotoPay() {
    const { orderDetail } = this.data;
    wx.navigateTo({
      url: `/pages/order/payment/index?orderId=${orderDetail.orderId}&amount=${orderDetail.totalAmount}`
    });
  },

  // 确认收货
  async onConfirmReceipt() {
    try {
      await wx.showModal({
        title: '提示',
        content: '确认已收到商品？'
      });

      // TODO: 调用确认收货接口
      Toast.success('已确认收货');
      this.loadOrderDetail();
    } catch (err) {
      console.error('确认收货失败:', err);
    }
  },

  // 查看物流
  onViewLogistics() {
    const { orderDetail } = this.data;
    wx.navigateTo({
      url: `/pages/order/logistics/index?orderId=${orderDetail.orderId}`
    });
  },

  // 联系客服
  onContactService() {
    // TODO: 实现客服功能
  }
}); 