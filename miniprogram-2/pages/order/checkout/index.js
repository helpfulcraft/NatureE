import Toast from 'tdesign-miniprogram/toast/index';
import { fetchAddress } from '../../../services/address/fetchAddress';
import { createOrder } from '../../../services/order/createOrder';

Page({
  data: {
    address: null,
    cartList: [],
    totalAmount: 0,
    totalNum: 0,
    freight: 0,
    loading: false,
    submitLoading: false,
    // 支付方式
    paymentVisible: false,
    paymentList: [
      { text: '微信支付', value: 'wxpay', icon: 'wechat' },
      { text: '余额支付', value: 'balance', icon: 'wallet' }
    ],
    selectedPayment: 'wxpay'
  },

  onLoad(options) {
    const { cartList, totalAmount } = options;
    
    if (!cartList) {
      Toast.fail('商品数据错误');
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
      return;
    }

    try {
      const goods = JSON.parse(decodeURIComponent(cartList));
      const amount = Number(totalAmount);
      
      this.setData({
        cartList: goods,
        totalAmount: amount,
        totalNum: goods.reduce((acc, cur) => acc + cur.num, 0)
      });

      this.loadDefaultAddress();
    } catch (err) {
      console.error('解析商品数据失败:', err);
      Toast.fail('商品数据错误');
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
    }
  },

  // 加载默认地址
  async loadDefaultAddress() {
    try {
      const address = await fetchAddress({ isDefault: true });
      this.setData({ address });
    } catch (err) {
      console.error('加载默认地址失败:', err);
    }
  },

  // 选择地址
  onSelectAddress() {
    wx.navigateTo({
      url: '/pages/address/list/index?select=true',
      events: {
        // 监听地址选择
        selectAddress: (address) => {
          this.setData({ address });
        }
      }
    });
  },

  // 选择支付方式
  onSelectPayment() {
    this.setData({ paymentVisible: true });
  },

  onPaymentChange(e) {
    this.setData({ 
      selectedPayment: e.detail.value,
      paymentVisible: false
    });
  },

  // 提交订单
  async onSubmit() {
    const { address, cartList, totalAmount, selectedPayment } = this.data;

    if (!address) {
      Toast.fail('请选择收货地址');
      return;
    }

    if (this.data.submitLoading) return;

    this.setData({ submitLoading: true });

    try {
      const orderData = {
        addressId: address.id,
        goodsList: cartList.map(item => ({
          spuId: item.spuId,
          skuId: item.skuId,
          num: item.num
        })),
        totalAmount,
        payType: selectedPayment
      };

      const { orderId } = await createOrder(orderData);

      // 跳转支付页面
      wx.navigateTo({
        url: `/pages/order/payment/index?orderId=${orderId}&amount=${totalAmount}`,
        success: () => {
          // 返回上一页,清空购物车
          const pages = getCurrentPages();
          const cartPage = pages[pages.length - 2];
          if (cartPage && cartPage.route.includes('cart')) {
            cartPage.clearSelectedGoods();
          }
        }
      });
    } catch (err) {
      console.error('创建订单失败:', err);
      Toast.fail('提交订单失败');
    } finally {
      this.setData({ submitLoading: false });
    }
  }
}); 