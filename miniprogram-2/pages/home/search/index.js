Page({
  data: {
    searchValue: '',
    historyList: [],
    hotList: ['民族服装', '苗族服饰', '彝族服饰', '傣族服饰'],
    suggestList: []
  },

  onLoad() {
    // 加载搜索历史
    this.loadSearchHistory();
  },

  loadSearchHistory() {
    const history = wx.getStorageSync('searchHistory') || [];
    this.setData({ historyList: history });
  },

  saveSearchHistory(keyword) {
    if (!keyword) return;
    
    let history = wx.getStorageSync('searchHistory') || [];
    // 去重
    history = history.filter(item => item !== keyword);
    // 新搜索添加到开头
    history.unshift(keyword);
    // 最多保存10条
    if (history.length > 10) {
      history = history.slice(0, 10);
    }
    
    wx.setStorageSync('searchHistory', history);
    this.setData({ historyList: history });
  },

  clearHistory() {
    wx.showModal({
      title: '提示',
      content: '确定清空搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('searchHistory');
          this.setData({ historyList: [] });
        }
      }
    });
  },

  onChange(e) {
    const { value } = e.detail;
    this.setData({ 
      searchValue: value,
      suggestList: value ? this.getSearchSuggestions(value) : []
    });
  },

  onSearch(e) {
    const value = e.detail.value || this.data.searchValue;
    if (!value.trim()) {
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none'
      });
      return;
    }

    this.saveSearchHistory(value);
    this.navigateToList(value);
  },

  onClear() {
    this.setData({ 
      searchValue: '',
      suggestList: []
    });
  },

  onHistoryTap(e) {
    const { value } = e.currentTarget.dataset;
    this.setData({ searchValue: value });
    this.navigateToList(value);
  },

  onHotTap(e) {
    const { value } = e.currentTarget.dataset;
    this.setData({ searchValue: value });
    this.navigateToList(value);
  },

  onSuggestTap(e) {
    const { value } = e.currentTarget.dataset;
    this.setData({ searchValue: value });
    this.navigateToList(value);
  },

  // 模拟搜索建议
  getSearchSuggestions(keyword) {
    if (!keyword) return [];
    
    const suggestions = [];
    const categories = ['民族', '苗族', '彝族', '傣族', '白族', '纳西'];
    const items = ['服装', '服饰', '配饰', '手工艺'];
    
    categories.forEach(category => {
      if (category.includes(keyword)) {
        items.forEach(item => {
          suggestions.push(`${category}${item}`);
        });
      }
    });
    
    return suggestions.slice(0, 10);
  },

  navigateToList(keyword) {
    try {
      console.log('准备跳转到搜索结果页，关键词:', keyword);
      
      wx.navigateTo({
        url: `/pages/category/list/index?keyword=${encodeURIComponent(keyword)}`,
        success: () => {
          console.log('跳转搜索结果页成功');
        },
        fail: (err) => {
          console.error('跳转搜索结果页失败:', err);
          wx.showToast({
            title: '跳转失败',
            icon: 'none',
            duration: 2000
          });
        }
      });
    } catch (err) {
      console.error('跳转搜索结果页出错:', err);
      wx.showToast({
        title: '系统错误',
        icon: 'none',
        duration: 2000
      });
    }
  }
}); 