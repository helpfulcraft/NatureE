// pages/usercenter/login/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.hideHomeButton();
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

  async onGetUserProfile() {
    if (this.data.loading) return;
    
    try {
      this.setData({ loading: true });
      
      const { userInfo } = await wx.getUserProfile({
        desc: '用于完善会员资料'
      });

      // 模拟手机号，实际应该通过服务器获取或让用户绑定
      userInfo.phone = '13800138000';
      
      // 保存用户信息和登录状态
      wx.setStorageSync('userInfo', userInfo);
      wx.setStorageSync('isLoggedIn', true);

      wx.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 1500
      });

      // 延迟返回，让用户看到成功提示
      setTimeout(() => {
        const pages = getCurrentPages();
        if (pages.length > 1) {
          wx.navigateBack();
        } else {
          wx.switchTab({
            url: '/pages/my/index'
          });
        }
      }, 1500);

    } catch (err) {
      console.error('登录失败:', err);
      wx.showToast({
        title: '登录失败',
        icon: 'error'
      });
    } finally {
      this.setData({ loading: false });
    }
  }
})