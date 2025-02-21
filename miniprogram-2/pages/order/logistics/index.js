import Toast from 'tdesign-miniprogram/toast/index';
import { fetchLogistics } from '../../../services/order/fetchLogistics';

Page({
  data: {
    orderId: '',
    loading: true,
    logistics: {
      company: '',
      trackingNo: '',
      status: 1, // 1: 运输中, 2: 已签收, 3: 异常
      statusText: '',
      traces: []
    }
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
    this.loadLogistics();
  },

  async loadLogistics() {
    try {
      const logistics = await fetchLogistics(this.data.orderId);
      
      // 处理物流状态文本
      const statusMap = {
        1: '运输中',
        2: '已签收',
        3: '运输异常'
      };

      this.setData({
        logistics: {
          ...logistics,
          statusText: statusMap[logistics.status] || '未知状态'
        },
        loading: false
      });
    } catch (err) {
      console.error('加载物流信息失败:', err);
      Toast.fail('加载失败');
      this.setData({ loading: false });
    }
  },

  // 复制运单号
  onCopyTrackingNo() {
    wx.setClipboardData({
      data: this.data.logistics.trackingNo,
      success: () => {
        Toast.success('复制成功');
      }
    });
  },

  // 刷新物流
  onRefresh() {
    if (this.data.loading) return;
    this.setData({ loading: true });
    this.loadLogistics();
  }
}); 