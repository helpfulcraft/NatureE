import { fetchCategoryList } from '../../services/category/fetchCategoryList';
import { fetchGoodsList } from '../../services/good/fetchGoodsList';

Page({
  data: {
    loading: true,
    categories: [],
    currentCategory: null,
    goodsList: [],
    loadMoreStatus: 0,  // 0: 加载中, 1: 加载完成, 2: 没有更多
    pageNum: 1,
    pageSize: 20
  },

  onLoad() {
    this.init();
  },

  async init() {
    try {
      await this.loadCategories();
      this.setData({ loading: false });
    } catch (err) {
      console.error('初始化分类页失败:', err);
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'error'
      });
    }
  },

  async loadCategories() {
    try {
      const categories = await fetchCategoryList();
      if (categories?.length) {
        this.setData({ 
          categories,
          currentCategory: categories[0]
        });
        await this.loadGoodsList(true);
      }
    } catch (err) {
      console.error('加载分类列表失败:', err);
      throw err;
    }
  },

  async loadGoodsList(fresh = false) {
    if (this.data.loadMoreStatus === 2) return;
    
    try {
      const params = {
        categoryId: this.data.currentCategory.id,
        pageSize: this.data.pageSize,
        pageNum: fresh ? 1 : this.data.pageNum
      };

      const { list, total } = await fetchGoodsList(params);
      
      this.setData({
        goodsList: fresh ? list : this.data.goodsList.concat(list),
        loadMoreStatus: list.length < this.data.pageSize ? 2 : 1,
        pageNum: fresh ? 2 : this.data.pageNum + 1
      });
    } catch (err) {
      console.error('加载商品列表失败:', err);
      this.setData({ loadMoreStatus: 0 });
    }
  },

  onCategoryChange(e) {
    const { item } = e.currentTarget.dataset;
    this.setData({
      currentCategory: item,
      goodsList: [],
      pageNum: 1,
      loadMoreStatus: 0
    }, () => {
      this.loadGoodsList(true);
    });
  },

  onGoodsClick(e) {
    const { index } = e.currentTarget.dataset;
    const goods = this.data.goodsList[index];
    wx.navigateTo({
      url: `/pages/goods/details/index?spuId=${goods.spuId}`
    });
  },

  onReachBottom() {
    if (this.data.loadMoreStatus === 1) {
      this.loadGoodsList();
    }
  }
}); 