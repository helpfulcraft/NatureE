// pages/order/order-payment/index.js
import Toast from 'tdesign-miniprogram/toast/index';
import { showToast } from '../../../utils/util';
import orderManager from '../../../utils/order-manager';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId: '',
    orderNo: '',
    totalAmount: 0,
    goodsName: '',
    createTime: '',
    selectedMethod: 'wechat',
    submitting: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (!options.orderId) {
      this.showError('订单参数错误');
      return;
    }
    this.loadOrderDetail(options.orderId);
  },

  async loadOrderDetail(orderId) {
    try {
      const order = await orderManager.getOrderDetail(orderId);
      if (!order) {
        throw new Error('订单不存在');
      }

      this.setData({
        orderId: order.orderId,
        orderNo: order.orderNo,
        totalAmount: order.totalAmount / 100,
        goodsName: order.goodsList[0]?.title || '商品',
        createTime: order.createTime
      });
    } catch (err) {
      console.error('加载订单详情失败:', err);
      showToast(err.message || '加载失败');
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  onSelectMethod(e) {
    const { method } = e.currentTarget.dataset;
    this.setData({ selectedMethod: method });
  },

  async onSubmitPay() {
    if (this.data.submitting) return;
    
    try {
      // 显示支付确认框
      const { confirm } = await wx.showModal({
        title: '确认支付',
        content: '确认支付该订单？',
        confirmText: '确认支付',
        cancelText: '取消'
      });

      if (!confirm) return;

      this.setData({ submitting: true });
      const { orderId } = this.data;

      // 调用模拟支付
      await orderManager.mockPayment(orderId);

      // 支付成功后清空购物车中已结算的商品
      try {
        const skuIdsToRemove = wx.getStorageSync('pendingSettleSkuIds') || [];
        console.log('待清除的商品SKU:', skuIdsToRemove);
        
        if (skuIdsToRemove.length > 0) {
          // 获取购物车页面实例
          const pages = getCurrentPages();
          const cartPage = pages.find(page => page.route.includes('pages/cart/index'));
          
          if (cartPage) {
            console.log('找到购物车页面，准备清除商品');
            await cartPage.clearSettledItems(skuIdsToRemove);
          } else {
            console.log('未找到购物车页面，直接通过cartManager清除商品');
            const { cartManager } = require('../../../utils/cart-manager');
            for (const skuId of skuIdsToRemove) {
              await cartManager.removeItem(skuId);
            }
          }
        } else {
          console.log('没有需要清除的商品');
        }
        
        // 清除存储的待结算商品ID
        wx.removeStorageSync('pendingSettleSkuIds');
      } catch (err) {
        console.error('清除购物车商品失败:', err);
      }

      // 支付成功
      wx.showToast({
        title: '支付成功',
        icon: 'success',
        duration: 1500
      });

      // 等待 Toast 显示完成后跳转
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/my/index',
          success: () => {
            // 跳转成功后，再跳转到订单列表页
            setTimeout(() => {
              wx.navigateTo({
                url: '/pages/order/order-list/index',
                fail: (err) => {
                  console.error('跳转订单列表失败:', err);
                }
              });
            }, 100);
          },
          fail: (err) => {
            console.error('跳转我的页面失败:', err);
            // 如果跳转失败，尝试直接返回
            wx.navigateBack();
          }
        });
      }, 1500);

    } catch (err) {
      console.error('支付失败:', err);
      
      const { confirm } = await wx.showModal({
        title: '支付失败',
        content: '是否重新支付？',
        confirmText: '重新支付',
        cancelText: '取消'
      });

      if (confirm) {
        this.onSubmitPay();
      } else {
        wx.navigateBack();
      }
    } finally {
      this.setData({ submitting: false });
    }
  },

  showError(message) {
    // 空函数，不执行任何操作
    console.log('错误信息(已禁用提示):', message);
    
    setTimeout(() => {
      wx.navigateBack();
    }, 2000);
  },

  async onPaymentSuccess() {
    try {
      // 获取待清除的商品SKU ID列表
      const skuIdsToRemove = wx.getStorageSync('pendingSettleSkuIds') || [];
      
      // 清除存储的SKU ID列表
      wx.removeStorageSync('pendingSettleSkuIds');

      // 返回购物车页面并清除已购买的商品
      const pages = getCurrentPages();
      const cartPage = pages.find(page => page.route.includes('cart'));
      
      if (cartPage) {
        // 如果购物车页面存在，调用清除方法
        await cartPage.clearSettledItems(skuIdsToRemove);
      }

      // 跳转到支付成功页面
      wx.redirectTo({
        url: '/pages/order/order-success/index',
        fail: (err) => {
          console.error('跳转支付成功页面失败:', err);
        }
      });
    } catch (err) {
      console.error('处理支付成功失败:', err);
    }
  }
})