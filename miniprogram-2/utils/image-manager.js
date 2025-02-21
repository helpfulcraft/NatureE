import logger from './logger';
import { fileManager } from './file-manager';
import { cdnBase } from '../config/index';

// 确保 CDN 基础路径末尾有斜杠
const imgPrefix = (cdnBase || 'https://cdn-we-retail.ym.tencent.com/').replace(/\/?$/, '/');

class ImageManager {
  constructor() {
    this.defaultImages = {
      goods: '/assets/images/default-goods.png',
      avatar: '/assets/images/default-avatar.png',
      banner: '/assets/images/default-banner.png'
    };
    this.localCache = new Map();
  }

  // 获取完整图片URL
  getImageUrl(path, type = 'goods') {
    if (!path) {
      return this.defaultImages[type];
    }

    // 如果是完整URL或本地路径，直接返回
    if (path.startsWith('http') || path.startsWith('/')) {
      return path;
    }

    // 拼接CDN路径
    return `${imgPrefix}${path}`;
  }

  // 预加载图片
  async preloadImages(urls) {
    const tasks = urls.map(url => this._preloadSingleImage(url));
    return Promise.allSettled(tasks);
  }

  // 预加载单张图片
  async _preloadSingleImage(url) {
    try {
      // 检查缓存
      if (this.localCache.has(url)) {
        return this.localCache.get(url);
      }

      // 下载图片
      const result = await new Promise((resolve, reject) => {
        wx.getImageInfo({
          src: url,
          success: resolve,
          fail: reject
        });
      });

      this.localCache.set(url, result);
      return result;
    } catch (err) {
      logger.error('预加载图片失败:', url, err);
      throw err;
    }
  }

  // 处理图片加载错误
  handleImageError(url, type = 'goods') {
    logger.warn('图片加载失败:', url);
    return this.defaultImages[type];
  }

  // 清理图片缓存
  clearCache() {
    this.localCache.clear();
  }
}

export const imageManager = new ImageManager();

// 图片加载组件的属性
export const imageLoadProps = {
  mode: 'aspectFill',
  lazyLoad: true,
  webp: true,
  fadeIn: true
}; 