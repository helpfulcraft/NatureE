import { request } from '../../utils/request';
import errorHandler from '../../utils/error-handler';
import performanceMonitor from '../../utils/performance-monitor';

export async function getGoodsDetail(spuId) {
  const startTime = Date.now();
  
  try {
    const res = await request({
      url: `/goods/${spuId}`
    });
    
    performanceMonitor.recordResourceLoad('goods', spuId, Date.now() - startTime);
    return res.data;
  } catch (error) {
    errorHandler.handleError(error);
    return null;
  }
} 