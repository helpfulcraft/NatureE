import { fetchGoodsList } from '../../../services/good/fetchGoodsList';

Page({
  data: {
    loading: true,
    goodsList: [],
    categoryId: '',
    keyword: '',
    title: '',
    pageNum: 1,
    pageSize: 20,
    hasMore: true,
    loadMoreStatus: 0, // 0: loading, 1: no-more
    isEmpty: false
  },

  onLoad(options) {
    const { categoryId = '', keyword = '', title = '' } = options || {};
    
    // 设置页面标题
    let pageTitle = decodeURIComponent(title);
    if (keyword) {
      pageTitle = `搜索：${decodeURIComponent(keyword)}`;
    }
    
    if (pageTitle) {
      wx.setNavigationBarTitle({
        title: pageTitle
      });
    }

    this.setData({
      categoryId: categoryId || '',
      keyword: keyword ? decodeURIComponent(keyword) : '',
      title: pageTitle || ''
    }, () => {
      this.loadGoodsList();
    });
  },

  async loadGoodsList(isLoadMore = false) {
    if (!isLoadMore) {
      this.setData({ loading: true });
    }

    try {
      const { pageNum, pageSize, categoryId, keyword } = this.data;
      const params = {
        pageNum,
        pageSize,
        categoryId,
        keyword
      };

      const { list = [], total = 0 } = await fetchGoodsList(params);
      
      const hasMore = pageNum * pageSize < total;
      const loadMoreStatus = hasMore ? 0 : 1;
      const isEmpty = !isLoadMore && list.length === 0;
      
      this.setData({
        loading: false,
        goodsList: isLoadMore ? [...this.data.goodsList, ...list] : list,
        hasMore,
        loadMoreStatus,
        isEmpty
      });
    } catch (error) {
      console.error('获取商品列表失败:', error);
      this.setData({
        loading: false,
        loadMoreStatus: 0,
        isEmpty: !this.data.goodsList.length
      });
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  onReachBottom() {
    const { hasMore, loading } = this.data;
    if (!hasMore || loading) return;

    this.setData({
      pageNum: this.data.pageNum + 1
    }, () => {
      this.loadGoodsList(true);
    });
  },

  onPullDownRefresh() {
    this.setData({
      pageNum: 1,
      goodsList: [],
      hasMore: true,
      isEmpty: false
    }, () => {
      this.loadGoodsList().then(() => {
        wx.stopPullDownRefresh();
      });
    });
  },

  onGoodsClick(e) {
    const { index } = e.currentTarget.dataset;
    const goods = this.data.goodsList[index];
    if (goods) {
      wx.navigateTo({
        url: `/pages/goods/details/index?spuId=${goods.spuId}`,
        fail: (err) => {
          console.error('跳转商品详情页失败:', err);
          wx.showToast({
            title: '页面跳转失败',
            icon: 'none'
          });
        }
      });
    }
  }
}); 