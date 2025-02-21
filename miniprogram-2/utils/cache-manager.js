import logger from './logger';

const DEFAULT_EXPIRE_TIME = 30 * 60 * 1000; // 30分钟
const CACHE_PREFIX = 'APP_CACHE_';
const CACHE_INFO_KEY = 'CACHE_INFO';

class CacheManager {
  constructor() {
    this.cacheInfo = this._loadCacheInfo();
    this._cleanExpiredCache();
  }

  // 设置缓存
  set(key, data, expireTime = DEFAULT_EXPIRE_TIME) {
    const cacheKey = CACHE_PREFIX + key;
    const timestamp = Date.now();
    const cacheData = {
      data,
      timestamp,
      expireTime
    };

    try {
      wx.setStorageSync(cacheKey, cacheData);
      this.cacheInfo[key] = {
        timestamp,
        expireTime
      };
      this._saveCacheInfo();
      return true;
    } catch (err) {
      logger.error('缓存写入失败:', err);
      return false;
    }
  }

  // 获取缓存
  get(key) {
    const cacheKey = CACHE_PREFIX + key;
    try {
      const cache = wx.getStorageSync(cacheKey);
      if (!cache) return null;

      const { data, timestamp, expireTime } = cache;
      if (Date.now() - timestamp > expireTime) {
        this.remove(key);
        return null;
      }

      return data;
    } catch (err) {
      logger.error('读取缓存失败:', err);
      return null;
    }
  }

  // 移除缓存
  remove(key) {
    const cacheKey = CACHE_PREFIX + key;
    try {
      wx.removeStorageSync(cacheKey);
      delete this.cacheInfo[key];
      this._saveCacheInfo();
      return true;
    } catch (err) {
      logger.error('删除缓存失败:', err);
      return false;
    }
  }

  // 清理所有缓存
  clear() {
    try {
      Object.keys(this.cacheInfo).forEach(key => {
        this.remove(key);
      });
      return true;
    } catch (err) {
      logger.error('清理缓存失败:', err);
      return false;
    }
  }

  // 获取缓存信息
  getCacheInfo() {
    return this.cacheInfo;
  }

  // 加载缓存信息
  _loadCacheInfo() {
    try {
      return wx.getStorageSync(CACHE_INFO_KEY) || {};
    } catch (err) {
      logger.error('加载缓存信息失败:', err);
      return {};
    }
  }

  // 保存缓存信息
  _saveCacheInfo() {
    try {
      wx.setStorageSync(CACHE_INFO_KEY, this.cacheInfo);
    } catch (err) {
      logger.error('保存缓存信息失败:', err);
    }
  }

  // 清理过期缓存
  _cleanExpiredCache() {
    const now = Date.now();
    Object.entries(this.cacheInfo).forEach(([key, info]) => {
      if (now - info.timestamp > info.expireTime) {
        this.remove(key);
      }
    });
  }

  // 检查缓存健康状态
  checkCacheHealth() {
    const totalSize = wx.getStorageInfoSync().currentSize;
    const limitSize = wx.getStorageInfoSync().limitSize;
    const usage = totalSize / limitSize;

    return {
      totalSize,
      limitSize,
      usage,
      cacheCount: Object.keys(this.cacheInfo).length,
      healthy: usage < 0.8 // 使用率低于80%认为健康
    };
  }
}

export const cacheManager = new CacheManager(); 