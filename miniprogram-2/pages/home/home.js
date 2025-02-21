import { fetchHome } from '../../services/home/home';
import { fetchGoodsList } from '../../services/good/fetchGoodsList';
import Toast from 'tdesign-miniprogram/toast/index';
import { imageManager } from '../../utils/image-manager';

Page({
  data: {
    tabList: [],
    goodsList: [],
    goodsListLoadStatus: 0, // 0:可加载 1:加载中 2:没有更多 3:加载失败
    pageLoading: false,
    bannerList: [],
    categoryList: [],
    // 轮播图配置
    swiperConfig: {
      current: 0,
      autoplay: true,
      duration: 500,
      interval: 5000,
      navigation: { type: 'dots' }
    }
  },

  pagination: {
    pageSize: 20,
    pageNum: 1
  },

  onShow() {
    this.getTabBar()?.init();
  },

  onLoad() {
    this.init();
  },

  onPullDownRefresh() {
    this.init().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.goodsListLoadStatus === 0) {
      this.loadGoodsList();
    }
  },

  async init() {
    this.setData({ pageLoading: true });
    try {
      await Promise.all([
        this.loadHomePage(),
        this.loadGoodsList(true)
      ]);
    } catch (err) {
      console.error('首页加载失败:', err);
      Toast.fail('加载失败');
    } finally {
      this.setData({ pageLoading: false });
    }
  },

  async loadHomePage() {
    const { bannerList = [], categoryList = [], tabList = [] } = await fetchHome();
    this.setData({ 
      bannerList: this._processImages(bannerList, 'banner'),
      categoryList: this._processImages(categoryList, 'category'),
      tabList
    });
  },

  async loadGoodsList(fresh = false) {
    if (fresh) {
      this.pagination.pageNum = 1;
      wx.pageScrollTo({ scrollTop: 0 });
    }

    this.setData({ goodsListLoadStatus: 1 });

    try {
      const params = {
        pageSize: this.pagination.pageSize,
        pageNum: this.pagination.pageNum
      };
      
      const { list = [], total = 0 } = await fetchGoodsList(params);
      
      this.setData({
        goodsList: fresh ? list : this.data.goodsList.concat(list),
        goodsListLoadStatus: list.length < params.pageSize ? 2 : 0
      });

      this.pagination.pageNum++;
    } catch (err) {
      console.error('加载商品列表失败:', err);
      this.setData({ goodsListLoadStatus: 3 });
    }
  },

  _processImages(list = [], type = 'goods') {
    return list.map(item => ({
      ...item,
      imgUrl: imageManager.getImageUrl(item.imgUrl, type)
    }));
  },

  onGoodsClick(e) {
    const { index } = e.currentTarget.dataset;
    const goods = this.data.goodsList[index];
    if (goods?.spuId) {
      wx.navigateTo({
        url: `/pages/goods/details/index?spuId=${goods.spuId}`
      });
    }
  },

  onCategoryClick(e) {
    const { id } = e.currentTarget.dataset;
    if (id) {
      wx.navigateTo({
        url: `/pages/goods/list/index?categoryId=${id}`
      });
    }
  },

  onSearchClick() {
    wx.navigateTo({
      url: '/pages/goods/search/index'
    });
  }
});
