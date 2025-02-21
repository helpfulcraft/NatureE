import request from '../../utils/request';
import errorHandler from '../../utils/error-handler';

// 获取商品评论列表
export async function getGoodsDetailsCommentList(params = {}) {
  try {
    const data = await request.get('/api/goods/comments', {
      params
    });
    return data.list || [];
  } catch (err) {
    errorHandler.handleError(err);
    return [];
  }
}

// 获取商品评论统计
export async function getGoodsDetailsCommentsCount(params = {}) {
  try {
    const data = await request.get('/api/goods/comments/count', {
      params
    });
    return {
      commentCount: data.total || 0,
      goodRate: data.goodRate || 0,
      hasImageCount: data.hasImageCount || 0,
      badCount: data.badCount || 0,
      goodCount: data.goodCount || 0,
      middleCount: data.middleCount || 0
    };
  } catch (err) {
    errorHandler.handleError(err);
    return {
      commentCount: 0,
      goodRate: 0,
      hasImageCount: 0,
      badCount: 0,
      goodCount: 0,
      middleCount: 0
    };
  }
} 