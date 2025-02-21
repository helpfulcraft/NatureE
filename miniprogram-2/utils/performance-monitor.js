/**
 * 性能监控工具
 */

import logger from './logger';

// 默认配置
const DEFAULT_CONFIG = {
  enableMonitor: true,
  logLevel: 'info',
  maxRecords: 100,
  pageLoadThreshold: 3000,    // 页面加载阈值(ms)
  networkTimeout: 5000,       // 网络请求超时(ms)
};

class PerformanceMonitor {
  constructor() {
    this.records = new Map();
    this.config = { ...DEFAULT_CONFIG };
  }

  // 记录页面加载
  recordPageLoad(page, startTime) {
    const duration = Date.now() - startTime;
    this.recordResourceLoad(page, 'load', duration);

    if (duration > this.config.pageLoadThreshold) {
      logger.warn('页面加载时间过长:', {
        page,
        duration,
        threshold: this.config.pageLoadThreshold
      });
    }
  }

  // 记录资源加载
  recordResourceLoad(resource, action, duration) {
    if (!this.config.enableMonitor) return;

    const key = `${resource}_${action}`;
    this.records.set(key, {
      type: 'resource',
      resource,
      action,
      duration,
      timestamp: Date.now()
    });
    logger.info(`资源加载: ${resource} ${action} ${duration}ms`);
  }

  // 记录错误
  recordError(resource, action, error) {
    if (!this.config.enableMonitor) return;

    const key = `${resource}_${action}_error`;
    this.records.set(key, {
      type: 'error',
      resource,
      action,
      error: error.message,
      stack: error.stack,
      timestamp: Date.now()
    });
    logger.error(`资源错误: ${resource} ${action}`, error);
  }

  // 清除记录
  clearRecords() {
    this.records.clear();
  }

  // 更新配置
  setConfig(newConfig) {
    Object.assign(this.config, newConfig);
    logger.setLevel(this.config.logLevel);
    logger.info('性能监控配置已更新:', this.config);
  }
}

// 导出单例实例
const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor; 