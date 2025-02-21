/**
 * Loading 状态管理器
 * 使用装饰器模式实现自动管理 loading 状态
 */

class LoadingManager {
  constructor(options = {}) {
    this._count = 0;
    this._timer = null;
    this._config = {
      timeout: options.timeout || 15000,
      defaultMessage: options.message || '加载中...',
      mask: options.mask !== false,
      minShowTime: options.minShowTime || 500, // 最小显示时间
      maxShowTime: options.maxShowTime || 30000, // 最大显示时间
      retryTimes: options.retryTimes || 3, // 重试次数
      retryDelay: options.retryDelay || 1000, // 重试延迟
    };
  }

  /**
   * 装饰异步函数，自动处理 loading 状态
   * @param {Object} options 配置选项
   * @returns {Function} 装饰器函数
   */
  decorate(options = {}) {
    return (target, propertyKey, descriptor) => {
      const originalMethod = descriptor.value;
      
      descriptor.value = async function (...args) {
        const loadingManager = new LoadingManager({
          ...this._config,
          ...options
        });
        
        return loadingManager.wrap(async () => {
          return await originalMethod.apply(this, args);
        }, options);
      };
      
      return descriptor;
    };
  }

  /**
   * 包装异步函数，自动处理 loading 状态
   * @param {Function} asyncFn 异步函数
   * @param {Object} options 配置选项
   * @returns {Promise} 
   */
  async wrap(asyncFn, options = {}) {
    const startTime = Date.now();
    let retryCount = 0;
    
    const config = {
      ...this._config,
      ...options
    };

    const execute = async () => {
      try {
        this._show(options);
        const result = await asyncFn();
        
        // 确保最小显示时间
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < config.minShowTime) {
          await this._wait(config.minShowTime - elapsedTime);
        }
        
        return result;
      } catch (error) {
        // 处理重试逻辑
        if (retryCount < config.retryTimes && this._shouldRetry(error)) {
          retryCount++;
          await this._wait(config.retryDelay);
          return execute();
        }
        throw this._enhanceError(error);
      } finally {
        this._hide();
      }
    };

    return execute();
  }

  /**
   * 显示 loading
   * @private
   */
  _show(options = {}) {
    this._count++;
    
    if (this._count === 1) {
      // 清除可能存在的定时器
      this._clearTimer();
      
      // 显示 loading
      wx.showLoading({
        title: options.message || this._config.defaultMessage,
        mask: options.mask ?? this._config.mask
      });

      // 设置最大显示时间定时器
      this._timer = setTimeout(() => {
        console.warn('Loading 超时自动关闭');
        this._hideAll();
      }, this._config.maxShowTime);
    }
  }

  /**
   * 隐藏 loading
   * @private
   */
  _hide() {
    this._count = Math.max(0, this._count - 1);
    
    if (this._count === 0) {
      this._clearTimer();
      wx.hideLoading();
    }
  }

  /**
   * 强制隐藏所有 loading
   * @private
   */
  _hideAll() {
    this._count = 0;
    this._clearTimer();
    wx.hideLoading();
  }

  /**
   * 清除定时器
   * @private
   */
  _clearTimer() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }

  /**
   * 等待指定时间
   * @private
   */
  _wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 判断是否应该重试
   * @private
   */
  _shouldRetry(error) {
    // 可以根据错误类型判断是否需要重试
    return error.errMsg?.includes('timeout') || 
           error.errMsg?.includes('fail') ||
           error.message?.includes('网络');
  }

  /**
   * 增强错误信息
   * @private
   */
  _enhanceError(error) {
    if (error instanceof Error) {
      error.retryCount = this._retryCount;
      error.loadingTime = Date.now() - this._startTime;
    }
    return error;
  }
}

// 创建默认实例
const loading = new LoadingManager();

// 导出装饰器工厂函数
export const withLoading = (options = {}) => loading.decorate(options);

// 导出默认实例和类
export default loading;
export { LoadingManager }; 