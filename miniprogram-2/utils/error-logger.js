import logger from './logger';

class ErrorLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 100;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    try {
      // 从本地存储恢复日志
      const logs = wx.getStorageSync('ERROR_LOGS');
      if (logs) {
        this.logs = JSON.parse(logs);
      }
      
      this.initialized = true;
    } catch (err) {
      logger.error('初始化错误日志失败:', err);
    }
  }

  // 记录错误
  log(error, context = {}) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      type: error.type,
      code: error.code,
      message: error.message,
      stack: error.stack,
      context: {
        page: getCurrentPages().pop()?.route,
        systemInfo: {
          ...wx.getDeviceInfo(),
          ...wx.getWindowInfo(),
          ...wx.getAppBaseInfo(),
          ...wx.getSystemSetting(),
          ...wx.getAppAuthorizeSetting()
        },
        ...context
      }
    };

    this.logs.unshift(errorLog);
    
    // 限制日志数量
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // 保存到本地存储
    this._saveLogs();

    return errorLog;
  }

  // 获取错误日志
  getLogs(filter = {}) {
    return this.logs.filter(log => {
      return Object.entries(filter).every(([key, value]) => {
        return log[key] === value;
      });
    });
  }

  // 清理日志
  clear() {
    this.logs = [];
    wx.removeStorageSync('ERROR_LOGS');
  }

  // 导出日志
  async export() {
    try {
      const content = JSON.stringify(this.logs, null, 2);
      const filePath = `${wx.env.USER_DATA_PATH}/error-logs.json`;
      
      await new Promise((resolve, reject) => {
        wx.getFileSystemManager().writeFile({
          filePath,
          data: content,
          encoding: 'utf8',
          success: resolve,
          fail: reject
        });
      });

      return filePath;
    } catch (err) {
      logger.error('导出错误日志失败:', err);
      throw err;
    }
  }

  // 保存日志到本地存储
  _saveLogs() {
    try {
      wx.setStorageSync('ERROR_LOGS', JSON.stringify(this.logs));
    } catch (err) {
      logger.error('保存错误日志失败:', err);
    }
  }
}

export const errorLogger = new ErrorLogger(); 