Component({
  properties: {
    searchValue: {
      type: String,
      value: ''
    }
  },

  data: {
    showPlaceholder: true
  },

  methods: {
    onSearch(e) {
      const { value } = e.detail;
      this.triggerEvent('search', { value });
    },

    onFocus() {
      // 点击搜索框时跳转到搜索页面
      wx.navigateTo({
        url: '/pages/home/search/index',
        fail: (err) => {
          console.error('跳转搜索页面失败:', err);
          wx.showToast({
            title: '跳转失败',
            icon: 'none'
          });
        }
      });
    }
  }
}); 