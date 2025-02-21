// pages/usercenter/person-info/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    showUpdateDialog: false,
    updateField: '',
    updateValue: '',
    dialogContent: '',
    formItems: [
      { label: '头像', key: 'avatarUrl', type: 'avatar' },
      { label: '昵称', key: 'nickName', type: 'text' },
      { label: '手机号', key: 'phone', type: 'phone' }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.checkLogin();
    this.getUserInfo();
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
    // 每次显示页面时重新获取用户信息
    this.getUserInfo();
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

  getUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    const isLoggedIn = wx.getStorageSync('isLoggedIn');
    
    // 只有登录状态下的用户信息才有效
    this.setData({ 
      userInfo: isLoggedIn ? userInfo : null 
    });
  },

  onItemClick(e) {
    const { key } = e.currentTarget.dataset;
    if (!this.data.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    switch (key) {
      case 'avatarUrl':
        this.chooseAvatar();
        break;
      case 'nickName':
      case 'phone':
        this.showUpdateDialog(key);
        break;
    }
  },

  chooseAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        // 这里应该上传头像到服务器
        // 暂时直接更新本地存储
        const userInfo = { ...this.data.userInfo, avatarUrl: tempFilePath };
        wx.setStorageSync('userInfo', userInfo);
        this.setData({ userInfo });
        wx.showToast({
          title: '更新成功',
          icon: 'success'
        });
      }
    });
  },

  showUpdateDialog(field) {
    // 创建输入框组件
    const inputComponent = `
      <t-input
        value="${this.data.userInfo[field] || ''}"
        placeholder="请输入"
        type="${field === 'phone' ? 'number' : 'text'}"
        maxlength="${field === 'phone' ? 11 : 20}"
      />
    `;

    this.setData({
      showUpdateDialog: true,
      updateField: field,
      updateValue: this.data.userInfo[field] || '',
      dialogContent: inputComponent
    });
  },

  hideUpdateDialog() {
    this.setData({
      showUpdateDialog: false,
      updateField: '',
      updateValue: ''
    });
  },

  onUpdateInput(e) {
    this.setData({
      updateValue: e.detail.value
    });
  },

  onUpdateConfirm() {
    const { updateField, updateValue } = this.data;
    if (!updateValue.trim()) {
      wx.showToast({
        title: '内容不能为空',
        icon: 'none'
      });
      return;
    }

    // 这里应该调用服务器API更新信息
    // 暂时直接更新本地存储
    const userInfo = { ...this.data.userInfo, [updateField]: updateValue };
    wx.setStorageSync('userInfo', userInfo);
    this.setData({
      userInfo,
      showUpdateDialog: false
    });

    wx.showToast({
      title: '更新成功',
      icon: 'success'
    });
  },

  checkLogin() {
    const isLoggedIn = wx.getStorageSync('isLoggedIn');
    if (!isLoggedIn) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      });

      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/usercenter/login/index',
          fail: (err) => {
            console.error('跳转登录页失败:', err);
          }
        });
      }, 1000);
    }
  },

  onPopupChange(e) {
    const { visible } = e.detail;
    if (!visible) {
      this.hideUpdateDialog();
    }
  }
})