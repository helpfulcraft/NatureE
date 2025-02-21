/**
 * 网络请求工具
 */

import { handleError } from './error-handler';
import logger from './logger';

// 开发环境使用模拟数据
const isDev = __wxConfig.envVersion === 'develop' || __wxConfig.envVersion === 'trial';
const BASE_URL = isDev ? '' : 'https://api.example.com';

class Request {
  constructor(options = {}) {
    this.baseURL = options.baseURL || BASE_URL;
    this.timeout = options.timeout || 5000;
    this.interceptors = {
      request: [],
      response: []
    };
    
    this.maxRetries = 3;
    this.retryDelay = 1000;
    
    // 添加默认拦截器
    this.interceptors.request.push(this._handleToken);
    this.interceptors.response.push(this._handleError);
  }

  // 处理请求URL
  getUrl(path) {
    if (path.startsWith('http')) {
      return path;
    }
    return `${this.baseURL}${path}`;
  }

  // Token处理
  _handleToken(config) {
    const token = wx.getStorageSync('token');
    if (token) {
      config.header = {
        ...config.header,
        'Authorization': `Bearer ${token}`
      };
    }
    return config;
  }

  // 错误处理
  _handleError(response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return response.data;
    }
    throw handleError(new Error(`请求失败: ${response.statusCode}`));
  }

  async request(options, retries = this.maxRetries) {
    try {
      // 执行请求拦截器
      let config = { ...options };
      for (const interceptor of this.interceptors.request) {
        config = await interceptor(config);
      }

      // 开发环境使用mock数据
      if (isDev) {
        const mockResult = await this.mockRequest(config);
        if (mockResult) {
          return mockResult;
        }
      }

      const response = await this._wxRequest(config);
      return this.handleResponse(response);

    } catch (error) {
      if (retries > 0) {
        logger.warn(`请求失败,剩余重试次数:${retries}`, error);
        await this.delay(this.retryDelay);
        return this.request(options, retries - 1);
      }
      throw handleError(error);
    }
  }

  // 封装wx.request为Promise
  _wxRequest(config) {
    return new Promise((resolve, reject) => {
      wx.request({
        ...config,
        url: this.getUrl(config.url),
        timeout: this.timeout,
        success: resolve,
        fail: reject
      });
    });
  }

  async handleResponse(response) {
    try {
      // 执行响应拦截器
      let result = response;
      for (const interceptor of this.interceptors.response) {
        result = await interceptor(result);
      }
      return result;
    } catch (error) {
      throw handleError(error);
    }
  }

  // GET请求
  get(url, options = {}) {
    return this.request({
      url,
      method: 'GET',
      ...options
    });
  }

  // POST请求
  post(url, data, options = {}) {
    return this.request({
      url,
      method: 'POST',
      data,
      ...options
    });
  }

  // 开发环境模拟数据
  async mockRequest(options) {
    const { delay } = require('../utils/delay');
    await delay(500);

    // 根据url返回对应mock数据
    const mockData = this.getMockData(options.url);
    if (!mockData) {
      throw new Error('Mock data not found');
    }

    return {
      statusCode: 200,
      data: mockData
    };
  }

  // 获取mock数据
  getMockData(url) {
    // 添加基础mock数据结构
    const mockData = {
      '/api/home': {
        banners: [
          {
            id: 1,
            imgUrl: 'https://via.placeholder.com/750x350',
            link: '/pages/goods/details/index?id=1'
          },
          {
            id: 2,
            imgUrl: 'https://via.placeholder.com/750x350',
            link: '/pages/goods/details/index?id=2'
          }
        ],
        categories: [
          {
            id: 1,
            name: '手机数码',
            imgUrl: 'https://via.placeholder.com/100'
          },
          {
            id: 2,
            name: '家用电器',
            imgUrl: 'https://via.placeholder.com/100'
          },
          {
            id: 3,
            name: '电脑办公',
            imgUrl: 'https://via.placeholder.com/100'
          },
          {
            id: 4,
            name: '服装配饰',
            imgUrl: 'https://via.placeholder.com/100'
          }
        ],
        goods: [
          {
            id: 1,
            name: '示例商品1',
            price: 99.99,
            imgUrl: 'https://via.placeholder.com/200'
          },
          {
            id: 2,
            name: '示例商品2',
            price: 199.99,
            imgUrl: 'https://via.placeholder.com/200'
          }
        ]
      },
      '/api/goods/list': {
        list: [
          {
            id: 1,
            name: '示例商品1',
            price: 99.99,
            imgUrl: 'https://via.placeholder.com/200'
          },
          {
            id: 2,
            name: '示例商品2',
            price: 199.99,
            imgUrl: 'https://via.placeholder.com/200'
          }
        ],
        total: 2,
        hasMore: false
      }
    };

    return mockData[url];
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new Request(); 