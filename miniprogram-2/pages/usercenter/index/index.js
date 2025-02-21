// pages/usercenter/index/index.js
import { fetchUserInfo } from '../../../services/user/fetchUserInfo';
import { fetchOrderCounts } from '../../../services/order/fetchOrderCounts';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    orderCounts: {
      unpaid: 0,
      unshipped: 0,
      unreceived: 0,
      uncommented: 0
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadUserInfo();
    this.loadOrderCounts();
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
    // 每次显示页面时重新加载订单数量
    this.loadOrderCounts();
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

  async loadUserInfo() {
    try {
      const userInfo = await fetchUserInfo();
      this.setData({ userInfo });
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  },

  async loadOrderCounts() {
    try {
      const orderCounts = await fetchOrderCounts();
      this.setData({ orderCounts });
    } catch (error) {
      console.error('获取订单数量失败:', error);
    }
  },

  onAllOrderClick() {
    wx.navigateTo({
      url: '/pages/order/order-list/index',
      fail: (err) => {
        console.error('跳转订单列表页失败:', err);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  onOrderTypeClick(e) {
    const { type } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/order/order-list/index?type=${type}`,
      fail: (err) => {
        console.error('跳转订单列表页失败:', err);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  onAddressClick() {
    wx.navigateTo({
      url: '/pages/usercenter/address/list/index',
      fail: (err) => {
        console.error('跳转地址列表页失败:', err);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  onCustomerServiceClick() {
    wx.makePhoneCall({
      phoneNumber: '400-xxx-xxxx',
      fail: (err) => {
        console.error('拨打客服电话失败:', err);
        wx.showToast({
          title: '拨打电话失败',
          icon: 'none'
        });
      }
    });
  },

  onSettingClick() {
    wx.navigateTo({
      url: '/pages/usercenter/setting/index',
      fail: (err) => {
        console.error('跳转设置页面失败:', err);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  }
})