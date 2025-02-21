import request from '../../utils/request';
import { handleError } from '../../utils/error-handler';

// 获取活动列表
export async function fetchActivityList(params = {}) {
  try {
    const { data } = await request.get('/api/activities', {
      params
    });
    return data;
  } catch (err) {
    handleError(err);
    return [];
  }
} 