import { fetchGoodsList } from './fetchGoodsList';
import performanceMonitor from '../../utils/performance-monitor';

Page({
  data: {
    list: [],
    loading: true,
    params: {
      pageSize: 20,
      pageNum: 1,
      sortBy: 'default',
      sortType: 'desc'
    }
  },

  async onLoad() {
    await this.loadList();
  },

  async loadList() {
    const startTime = Date.now();
    
    const res = await fetchGoodsList(this.data.params);
    
    this.setData({
      list: res.list,
      loading: false
    });

    performanceMonitor.recordPageLoad('goodsList', startTime);
  }
}); 