import { formatTime, showToast, showModal } from '../../../utils/util';
import { config, OrderStatus } from '../config';
import {
  fetchBusinessTime,
} from '../../../services/order/orderDetail';
import { fetchOrderDetail } from '../../../services/order/orderList';
import Toast from 'tdesign-miniprogram/toast/index';
import { getAddressList, getDefaultAddress } from '../../../utils/address';
import orderManager from '../../../utils/order-manager';
import { formatAddress, formatContact } from '../../../utils/address';
import { images } from '../../../config/images';

Page({
  data: {
    pageLoading: true,
    order: null,
    _order: {}, // 内部使用和提供给 order-card 的数据
    storeDetail: {},
    countDownTime: null,
    addressEditable: false,
    backRefresh: false, // 用于接收其他页面back时的状态
    formatCreateTime: '', //格式化订单创建时间
    logisticsNodes: [],
    /** 订单评论状态 */
    orderHasCommented: true,
    orderNo: '',
    orderId: '',
    orderDetail: null,
    isOrderLoading: true,
    loading: true,
    OrderStatus,  // 确保 OrderStatus 在 data 中可用
    defaultGoodsImage: images.defaultGoodsImage,
    loadingImage: images.loading
  },

  onLoad(options) {
    console.log('订单详情页 onLoad:', options);
    const { orderId } = options;
    if (!orderId) {
      showToast('订单ID不能为空');
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
      return;
    }
    
    this.setData({ orderId }, () => {
      this.loadOrderDetail();
    });
  },

  onShow() {
    console.log('订单详情页 onShow');
    if (this.data.orderId) {
      this.loadOrderDetail();
    }
  },

  onPageScroll(e) {
    this.pullDownRefresh && this.pullDownRefresh.onPageScroll(e);
  },

  onImgError(e) {
    if (e.detail) {
      console.error('img 加载失败');
    }
  },

  // 页面初始化，会展示pageLoading
  init() {
    this.setData({ pageLoading: true });
    this.getStoreDetail();
    this.getDetail()
      .then(() => {
        this.setData({ pageLoading: false });
      })
      .catch((e) => {
        console.error(e);
      });
  },

  // 页面刷新，展示下拉刷新
  onRefresh() {
    this.init();
    // 如果上一页为订单列表，通知其刷新数据
    const pages = getCurrentPages();
    const lastPage = pages[pages.length - 2];
    if (lastPage) {
      lastPage.data.backRefresh = true;
    }
  },

  // 页面刷新，展示下拉刷新
  onPullDownRefresh() {
    this.loadOrderDetail().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  async loadOrderDetail() {
    const { orderId } = this.data;
    this.setData({ loading: true });

    try {
      const order = await orderManager.getOrderDetail(orderId);
      if (!order) {
        throw new Error('订单不存在');
      }

      // 处理订单数据
      const processedOrder = {
        ...order,
        statusDesc: this.getStatusDesc(order.status),
        goodsList: order.goodsList.map(goods => ({
          ...goods,
          // 确保规格信息正确显示
          specs: Array.isArray(goods.specs) ? goods.specs : 
                (goods.specDesc ? goods.specDesc.split(' ') : []),
          specDesc: goods.specDesc || (Array.isArray(goods.specs) ? goods.specs.join(' ') : '')
        }))
      };

      console.log('处理后的订单数据:', processedOrder);
      
      this.setData({ 
        order: processedOrder,
        loading: false
      });
    } catch (err) {
      console.error('加载订单详情失败:', err);
      wx.showToast({
        title: err.message || '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  getStatusDesc(status) {
    const statusMap = {
      [OrderStatus.PENDING_PAYMENT]: '待付款',
      [OrderStatus.PENDING_DELIVERY]: '待发货',
      [OrderStatus.PENDING_RECEIPT]: '待收货',
      [OrderStatus.PENDING_COMMENT]: '待评价',
      [OrderStatus.COMPLETED]: '已完成',
      [OrderStatus.CANCELLED]: '已取消'
    };
    return statusMap[status] || '未知状态';
  },

  // 展开物流节点
  flattenNodes(nodes) {
    return (nodes || []).reduce((res, node) => {
      return (node.nodes || []).reduce((res1, subNode, index) => {
        res1.push({
          title: index === 0 ? node.title : '', // 子节点中仅第一个显示title
          desc: subNode.status,
          date: formatTime(+subNode.timestamp, 'YYYY-MM-DD HH:mm:ss'),
          icon: index === 0 ? LogisticsIconMap[node.code] || '' : '', // 子节点中仅第一个显示icon
        });
        return res1;
      }, res);
    }, []);
  },

  datermineInvoiceStatus(order) {
    // 1-已开票
    // 2-未开票（可补开）
    // 3-未开票
    // 4-门店不支持开票
    return order.invoiceStatus;
  },

  // 拼接省市区
  composeAddress(order) {
    return [
      //order.logisticsVO.receiverProvince,
      order.logisticsVO.receiverCity,
      order.logisticsVO.receiverCountry,
      order.logisticsVO.receiverArea,
      order.logisticsVO.receiverAddress,
    ]
      .filter((s) => !!s)
      .join(' ');
  },

  getStoreDetail() {
    fetchBusinessTime().then((res) => {
      const storeDetail = {
        storeTel: res.data.telphone,
        storeBusiness: res.data.businessTime.join('\n'),
      };
      this.setData({ storeDetail });
    });
  },

  // 仅对待支付状态计算付款倒计时
  // 返回时间若是大于2020.01.01，说明返回的是关闭时间，否则说明返回的直接就是剩余时间
  computeCountDownTime(order) {
    if (order.orderStatus !== OrderStatus.PENDING_PAYMENT) return null;
    return order.autoCancelTime > 1577808000000
      ? order.autoCancelTime - Date.now()
      : order.autoCancelTime;
  },

  onCountDownFinish() {
    //this.setData({ countDownTime: -1 });
    const { countDownTime, order } = this.data;
    if (
      countDownTime > 0 ||
      (order && order.groupInfoVo && order.groupInfoVo.residueTime > 0)
    ) {
      this.onRefresh();
    }
  },

  onGoodsCardTap(e) {
    const { index } = e.currentTarget.dataset;
    const goods = this.data.order.orderItemVOs[index];
    wx.navigateTo({ url: `/pages/goods/details/index?spuId=${goods.spuId}` });
  },

  // 选择地址
  async onSelectAddress() {
    try {
      // 获取地址列表
      const addressList = getAddressList();
      if (!addressList.length) {
        // 如果没有地址，跳转到地址编辑页面
        wx.navigateTo({
          url: '/pages/usercenter/address/edit/index'
        });
        return;
      }

      // 显示地址选择器
      wx.navigateTo({
        url: '/pages/usercenter/address/list/index?selectMode=1'
      });
    } catch (err) {
      console.error('选择地址失败:', err);
      showToast('选择地址失败');
    }
  },

  onOrderNumCopy() {
    wx.setClipboardData({
      data: this.data.order.orderNo,
    });
  },

  onDeliveryNumCopy() {
    wx.setClipboardData({
      data: this.data.order.logisticsVO.logisticsNo,
    });
  },

  onToInvoice() {
    wx.navigateTo({
      url: `/pages/order/invoice/index?orderNo=${this.data._order.orderNo}`,
    });
  },

  onSuppleMentInvoice() {
    wx.navigateTo({
      url: `/pages/order/receipt/index?orderNo=${this.data._order.orderNo}`,
    });
  },

  onDeliveryClick() {
    const logisticsData = {
      nodes: this.data.logisticsNodes,
      company: this.data.order.logisticsVO.logisticsCompanyName,
      logisticsNo: this.data.order.logisticsVO.logisticsNo,
      phoneNumber: this.data.order.logisticsVO.logisticsCompanyTel,
    };
    wx.navigateTo({
      url: `/pages/order/delivery-detail/index?data=${encodeURIComponent(
        JSON.stringify(logisticsData),
      )}`,
    });
  },

  /** 跳转订单评价 */
  navToCommentCreate() {
    wx.navigateTo({
      url: `/pages/order/createComment/index?orderNo=${this.orderNo}`,
    });
  },

  /** 跳转拼团详情/分享页*/
  toGrouponDetail() {
    wx.showToast({ title: '点击了拼团' });
  },

  clickService() {
    Toast({
      context: this,
      selector: '#t-toast',
      message: '您点击了联系客服',
    });
  },

  onOrderInvoiceView() {
    wx.navigateTo({
      url: `/pages/order/invoice/index?orderNo=${this.orderNo}`,
    });
  },

  showError(message) {
    Toast({
      context: this,
      selector: '#t-toast',
      message,
      icon: 'error'
    });
    this.setData({ loading: false });
  },

  // 取消订单
  async onCancelOrder() {
    const { orderId } = this.data;
    
    try {
      const { confirm } = await showModal({
        title: '提示',
        content: '确定要取消该订单吗？'
      });

      if (!confirm) return;

      await orderManager.cancelOrder(orderId);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '订单已取消'
      });
      this.loadOrderDetail();
    } catch (err) {
      console.error('取消订单失败:', err);
      this.showError('取消失败');
    }
  },

  // 去支付
  onGotoPay() {
    const { orderId } = this.data;
    wx.navigateTo({
      url: `/pages/order/order-payment/index?orderId=${orderId}`,
      fail: (err) => {
        console.error('跳转支付页面失败:', err);
        this.showError('跳转失败');
      }
    });
  },

  // 查看物流
  onViewLogistics() {
    const { order } = this.data;
    if (!order.logistics) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '暂无物流信息'
      });
      return;
    }

    wx.navigateTo({
      url: `/pages/order/logistics/index?orderId=${order.orderId}`,
      fail: (err) => {
        console.error('跳转物流页面失败:', err);
        this.showError('跳转失败');
      }
    });
  },

  // 确认收货
  async onConfirmReceipt() {
    const { orderId } = this.data;

    try {
      const { confirm } = await showModal({
        title: '提示',
        content: '确认已收到商品？'
      });

      if (!confirm) return;

      await orderManager.confirmReceipt(orderId);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '已确认收货'
      });
      this.loadOrderDetail();
    } catch (err) {
      console.error('确认收货失败:', err);
      this.showError('确认失败');
    }
  },

  // 删除订单
  async onDeleteOrder() {
    const { orderId } = this.data;

    try {
      const { confirm } = await showModal({
        title: '提示',
        content: '确定要删除该订单吗？'
      });

      if (!confirm) return;

      await orderManager.deleteOrder(orderId);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '订单已删除'
      });
      wx.navigateBack();
    } catch (err) {
      console.error('删除订单失败:', err);
      this.showError('删除失败');
    }
  },

  // 去评价
  onGotoComment() {
    const { order } = this.data;
    wx.navigateTo({
      url: `/pages/order/comment/index?orderId=${order.orderId}`,
      fail: (err) => {
        console.error('跳转评价页面失败:', err);
        this.showError('跳转失败');
      }
    });
  },

  copyOrderNo() {
    const { orderDetail } = this.data;
    if (!orderDetail?.orderNo) return;
    
    wx.setClipboardData({
      data: orderDetail.orderNo,
      success: () => {
        showToast('复制成功', 'success');
      }
    });
  },

  formatAddress,
  formatContact
});
