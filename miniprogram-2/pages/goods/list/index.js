import { fetchGoodsList } from '../../../services/good/fetchGoodsList';
import Toast from 'tdesign-miniprogram/toast/index';
import performanceMonitor from '../../../utils/performance-monitor';

const initFilters = {
  overall: 1,
  sorts: '',
  layout: 0,
};

Page({
  data: {
    goodsList: [],
    layout: 0,
    sorts: '',
    overall: 1,
    show: false,
    minVal: '',
    maxVal: '',
    filter: initFilters,
    hasLoaded: false,
    loadMoreStatus: 0,
    loading: true,
    pageLoading: true,
    activeTab: '0',
    isRefreshing: false,  // 是否正在刷新
    scrollTop: 0,
    params: {
      pageSize: 20,
      pageNum: 1,
      sortBy: 'default',
      sortType: 'desc'
    },
    hasMore: true,
    pageNum: 1,
    pageSize: 20,
    sortBy: 'default',
    sortType: 'desc',
    // 缓存相关
    cacheKey: 'GOODS_LIST_CACHE',
    cacheExpireTime: 5 * 60 * 1000, // 5分钟缓存
    lastCacheTime: 0
  },

  total: 0,

  // 排序类型映射
  sortTypeMap: {
    'price-asc': { sortBy: 'price', sortType: 'asc' },
    'price-desc': { sortBy: 'price', sortType: 'desc' },
    'sales-desc': { sortBy: 'sales', sortType: 'desc' },
    'default': { sortBy: 'default', sortType: 'desc' }
  },

  // 价格验证规则
  priceValidation: {
    min: 0,
    max: 999999,
    precision: 2
  },

  // 验证价格输入
  validatePrice(price, type = 'price') {
    if (!price) return true;
    
    const num = Number(price);
    if (isNaN(num)) {
      wx.showToast({
        title: '请输入有效的价格',
        icon: 'none'
      });
      return false;
    }
    
    if (num < this.priceValidation.min) {
      wx.showToast({
        title: '价格不能小于0',
        icon: 'none'
      });
      return false;
    }
    
    if (num > this.priceValidation.max) {
      wx.showToast({
        title: '价格超出范围',
        icon: 'none'
      });
      return false;
    }
    
    // 检查小数位数
    const decimalPlaces = (num.toString().split('.')[1] || '').length;
    if (decimalPlaces > this.priceValidation.precision) {
      wx.showToast({
        title: `价格最多${this.priceValidation.precision}位小数`,
        icon: 'none'
      });
      return false;
    }
    
    return true;
  },

  handleFilterChange(e) {
    const { value } = e.detail;
    try {
      let sorts = '';
      
      // 处理排序
      switch(value) {
        case '1': // 价格
          sorts = this.data.sorts === 'price-asc' ? 'price-desc' : 'price-asc';
          break;
        case '2': // 销量
          sorts = 'sales-desc';
          break;
        default:
          sorts = 'default';
      }
      
      this.setData({
        sorts,
        loadMoreStatus: 0,
        activeTab: value,
      }, () => {
        this.loadGoodsList(true);
      });
    } catch (err) {
      console.error('处理排序变更失败:', err);
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      });
    }
  },

  async onLoad() {
    // 尝试从缓存加载
    const cacheData = this.loadFromCache();
    if (cacheData) {
      this.setData({
        ...cacheData,
        loading: false
      });
    } else {
      await this.loadGoodsList(true);
    }
  },

  // 从缓存加载数据
  loadFromCache() {
    try {
      const cache = wx.getStorageSync(this.data.cacheKey);
      if (!cache) return null;

      const { data, timestamp } = cache;
      const now = Date.now();

      // 检查缓存是否过期
      if (now - timestamp > this.data.cacheExpireTime) {
        wx.removeStorageSync(this.data.cacheKey);
        return null;
      }

      return data;
    } catch (err) {
      console.error('读取缓存失败:', err);
      return null;
    }
  },

  // 保存数据到缓存
  saveToCache(data) {
    try {
      wx.setStorageSync(this.data.cacheKey, {
        data,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error('保存缓存失败:', err);
    }
  },

  async loadGoodsList(reset = false) {
    const startTime = Date.now();
    
    if (reset) {
      this.setData({ 
        pageNum: 1,
        goodsList: []
      });
    }

    try {
      const { list, hasMore } = await fetchGoodsList({
        pageNum: this.data.pageNum,
        pageSize: this.data.pageSize,
        sortBy: this.data.sortBy,
        sortType: this.data.sortType
      });

      const newData = {
        goodsList: reset ? list : [...this.data.goodsList, ...list],
        hasMore,
        loading: false,
        pageNum: this.data.pageNum + 1
      };

      this.setData(newData);

      // 只缓存第一页数据
      if (reset) {
        this.saveToCache(newData);
      }

      performanceMonitor.recordPageLoad('goodsList', startTime);
    } catch (err) {
      Toast.fail('加载失败');
      this.setData({ loading: false });
    }
  },

  onShow() {
    this.getTabBar().init();
    this.restorePageState();
  },

  onPullDownRefresh() {
    this.loadGoodsList(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadGoodsList();
    }
  },

  handleAddCart() {
    Toast({
      context: this,
      selector: '#t-toast',
      message: '点击加购',
    });
  },

  tagClickHandle() {
    Toast({
      context: this,
      selector: '#t-toast',
      message: '点击标签',
    });
  },

  async gotoGoodsDetail(e) {
    try {
      const { index } = e.detail;
      const goods = this.data.goodsList[index];
      
      if (!goods) {
        wx.showToast({
          title: '商品数据错误',
          icon: 'none'
        });
        return;
      }
      
      const spuId = String(goods.spuId || goods.id || '');
      if (!spuId) {
        wx.showToast({
          title: '商品ID错误',
          icon: 'none'
        });
        return;
      }
      
      // 保存当前页面状态
      this.savePageState();
      
      // 跳转到商品详情页
      wx.navigateTo({
        url: `/pages/goods/details/index?spuId=${spuId}`,
        fail: (err) => {
          console.error('跳转商品详情失败:', err);
          wx.showToast({
            title: '跳转失败',
            icon: 'error'
          });
        }
      });
    } catch (err) {
      console.error('处理商品点击事件失败:', err);
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      });
    }
  },

  // 保存页面状态
  savePageState() {
    const state = {
      scrollTop: this.data.scrollTop || 0,
      goodsList: this.data.goodsList,
      pageNum: this.data.pageNum,
      total: this.total,
      sorts: this.data.sorts,
      activeTab: this.data.activeTab,
      minVal: this.data.minVal,
      maxVal: this.data.maxVal
    };
    
    wx.setStorageSync('goodsListState', state);
  },

  // 恢复页面状态
  restorePageState() {
    const state = wx.getStorageSync('goodsListState');
    if (state) {
      this.setData({
        goodsList: state.goodsList,
        sorts: state.sorts,
        activeTab: state.activeTab,
        minVal: state.minVal,
        maxVal: state.maxVal
      });
      
      this.data.pageNum = state.pageNum;
      this.total = state.total;
      
      // 恢复滚动位置
      wx.pageScrollTo({
        scrollTop: state.scrollTop,
        duration: 0
      });
      
      // 清除保存的状态
      wx.removeStorageSync('goodsListState');
    }
  },

  showFilterPopup() {
    this.setData({ show: true });
  },

  onVisibleChange(e) {
    const { visible } = e.detail;
    if (!visible) {
      // 关闭弹窗时恢复之前的选中状态
      const prevTab = this.data.sorts ? 
        (this.data.sorts.includes('price') ? '1' : 
         this.data.sorts.includes('sales') ? '2' : '0') : 
        '0';
      
      this.setData({ 
        show: false,
        activeTab: prevTab
      });
    }
  },

  onMinValChange(e) {
    const value = e.detail.value.trim();
    if (value && !this.validatePrice(value, 'min')) {
      this.setData({ minVal: '' });
      return;
    }
    this.setData({ minVal: value });
  },

  onMaxValChange(e) {
    const value = e.detail.value.trim();
    if (value && !this.validatePrice(value, 'max')) {
      this.setData({ maxVal: '' });
      return;
    }
    this.setData({ maxVal: value });
  },

  onReset() {
    this.setData({
      minVal: '',
      maxVal: '',
      show: false,
      activeTab: '0',
      sorts: 'default',  // 重置排序
      loadMoreStatus: 0
    }, () => {
      this.loadGoodsList(true);
    });
  },

  onConfirm() {
    const { minVal, maxVal } = this.data;
    
    try {
      // 验证价格区间
      const min = Number(minVal);
      const max = Number(maxVal);
      
      if (minVal && maxVal && min > max) {
        wx.showToast({
          title: '最低价不能大于最高价',
          icon: 'none'
        });
        return;
      }
      
      // 验证价格有效性
      if (!this.validatePrice(minVal, 'min') || !this.validatePrice(maxVal, 'max')) {
        return;
      }

      this.data.pageNum = 1;
      this.setData({
        show: false,
        loadMoreStatus: 0,
        goodsList: [],
      }, () => {
        this.loadGoodsList(true);
      });
    } catch (err) {
      console.error('处理价格筛选失败:', err);
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      });
    }
  },

  onPageScroll(e) {
    this.setData({
      scrollTop: e.scrollTop
    });
  },
});
