/**
 * 统一日志管理工具
 */

export const Level = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

const config = {
  level: Level.INFO,
  maxLogLength: 1000,
  enableConsole: true,
  maxStorageSize: 5000,
  storageKey: 'APP_LOGS'
};

function formatLog(level, message, ...args) {
  const time = new Date().toISOString();
  return {
    time,
    level,
    message,
    args: args.map(arg => arg instanceof Error ? 
      { message: arg.message, stack: arg.stack, ...arg } : arg
    )
  };
}

function saveLog(logEntry) {
  try {
    const logs = wx.getStorageSync(config.storageKey) || [];
    logs.push(logEntry);
    
    if (logs.length > config.maxStorageSize) {
      logs.splice(0, logs.length - config.maxStorageSize);
    }
    
    wx.setStorageSync(config.storageKey, logs);
  } catch (error) {
    console.error('保存日志失败:', error);
  }
}

export default {
  setLevel(level) {
    config.level = level;
  },

  setConfig(newConfig) {
    Object.assign(config, newConfig);
  },

  debug(message, ...args) {
    if (config.level <= Level.DEBUG) {
      const logEntry = formatLog(Level.DEBUG, message, ...args);
      if (config.enableConsole) {
        console.log(`[${logEntry.time}] ${message}`, ...args);
      }
      saveLog(logEntry);
    }
  },

  info(message, ...args) {
    if (config.level <= Level.INFO) {
      const logEntry = formatLog(Level.INFO, message, ...args);
      if (config.enableConsole) {
        console.info(`[${logEntry.time}] ${message}`, ...args);
      }
      saveLog(logEntry);
    }
  },

  warn(message, ...args) {
    if (config.level <= Level.WARN) {
      const logEntry = formatLog(Level.WARN, message, ...args);
      if (config.enableConsole) {
        console.warn(`[${logEntry.time}] ${message}`, ...args);
      }
      saveLog(logEntry);
    }
  },

  error(message, ...args) {
    if (config.level <= Level.ERROR) {
      const logEntry = formatLog(Level.ERROR, message, ...args);
      if (config.enableConsole) {
        console.error(`[${logEntry.time}] ${message}`, ...args);
      }
      saveLog(logEntry);
    }
  },

  getLogs() {
    return wx.getStorageSync(config.storageKey) || [];
  },

  clearLogs() {
    wx.removeStorageSync(config.storageKey);
  },

  async exportLogs() {
    try {
      const logs = this.getLogs();
      const content = JSON.stringify(logs, null, 2);
      const filePath = `${wx.env.USER_DATA_PATH}/logs_${Date.now()}.json`;
      
      const fs = wx.getFileSystemManager();
      fs.writeFileSync(filePath, content, 'utf8');
      
      return filePath;
    } catch (error) {
      throw error;
    }
  }
}; 