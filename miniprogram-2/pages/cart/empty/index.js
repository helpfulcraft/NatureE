Page({
  data: {
    recommendList: [], // 推荐商品列表
    loading: true,
    pageLoading: false
  },

  onLoad() {
    const startTime = Date.now();
    performanceMonitor.recordPageLoad('cart-empty', startTime);
    this.loadRecommendGoods();
  },

  // 加载推荐商品
  async loadRecommendGoods() {
    try {
      // 从商品列表接口获取推荐商品
      const { fetchGoodsList } = require('../../../services/good/fetchGoodsList');
      const { list = [] } = await fetchGoodsList({
        pageSize: 4,
        pageNum: 1,
        sortBy: 'sales',
        sortType: 'desc'
      });

      this.setData({
        recommendList: list,
        loading: false
      });
    } catch (err) {
      console.error('加载推荐商品失败:', err);
      this.setData({ loading: false });
    }
  },

  // 跳转到首页
  onTapGoHome() {
    wx.switchTab({
      url: '/pages/home/home/index'
    });
  },

  // 跳转到商品详情
  onGoodsClick(e) {
    const { index } = e.currentTarget.dataset;
    const goods = this.data.recommendList[index];
    if (goods) {
      wx.navigateTo({
        url: `/pages/goods/details/index?spuId=${goods.spuId}`
      });
    }
  }
}); 