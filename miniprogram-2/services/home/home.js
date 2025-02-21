import request from '../../utils/request';
import errorHandler from '../../utils/error-handler';

// 获取首页数据
export async function fetchHome() {
  try {
    const data = await request.get('/api/home');
    return {
      bannerList: data.banners || [],
      categoryList: data.categories || [],
      goodsList: data.goods || []
    };
  } catch (err) {
    errorHandler.handleError(err);
    return {
      bannerList: [],
      categoryList: [],
      goodsList: []
    };
  }
}

// 获取轮播图数据
export const fetchBannerList = async () => {
  try {
    const res = await request({
      url: '/home/banner',
      method: 'GET'
    });
    return res.data;
  } catch (error) {
    console.error('获取轮播图数据失败:', error);
    throw error;
  }
};

// 获取推荐商品
export const fetchRecommendGoods = async (params) => {
  try {
    const res = await request({
      url: '/home/recommend',
      method: 'GET',
      data: params
    });
    return res.data;
  } catch (error) {
    console.error('获取推荐商品失败:', error);
    throw error;
  }
}; 