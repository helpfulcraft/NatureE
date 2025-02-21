/**
 * 网络请求工具
 */
import { errorHandler } from '../utils/error-handler';

// 请求配置
const REQUEST_CONFIG = {
  baseURL: 'https://api.example.com',
  timeout: 10000,
  header: {
    'content-type': 'application/json'
  }
};

// 请求方法
export const request = async (options) => {
  try {
    const { url, ...restOptions } = options;
    const res = await wx.request({
      url: REQUEST_CONFIG.baseURL + url,
      timeout: REQUEST_CONFIG.timeout,
      header: {
        ...REQUEST_CONFIG.header,
        ...restOptions.header
      },
      ...restOptions
    });

    if (res.statusCode >= 200 && res.statusCode < 300) {
      return res.data;
    }

    throw errorHandler.createBusinessError('API_001', '请求失败', {
      url,
      statusCode: res.statusCode,
      data: res.data
    });
  } catch (err) {
    throw errorHandler.handleError(err);
  }
}; 