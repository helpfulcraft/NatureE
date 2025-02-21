import { fetchGoodsList } from './fetchGoodsList';
import performanceMonitor from '../../utils/performance-monitor';

Page({
  data: {
    list: [],
    loading: false,
    hasMore: true
  },

  async loadGoods(params) {
    const startTime = Date.now();
    this.setData({ loading: true });

    const res = await fetchGoodsList(params);
    
    performanceMonitor.recordPageLoad('goodsList', startTime);
    
    this.setData({
      list: res.list,
      hasMore: res.hasMore,
      loading: false
    });
  }
}); 