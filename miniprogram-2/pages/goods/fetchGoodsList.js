import { request } from '../../utils/request';
import errorHandler from '../../utils/error-handler';
import performanceMonitor from '../../utils/performance-monitor';

export async function fetchGoodsList(params) {
  const startTime = Date.now();

  try {
    const res = await request({
      url: '/goods/list',
      data: params
    });

    performanceMonitor.recordResourceLoad('goodsList', 'fetch', Date.now() - startTime);
    return res.data;
  } catch (error) {
    errorHandler.handleError(error);
    return {
      list: [],
      total: 0,
      hasMore: false
    };
  }
} 