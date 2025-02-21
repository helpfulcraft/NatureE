import checkUpdate from './utils/update-manager';
import logger, { Level } from './utils/logger';
import errorHandler from './utils/error-handler';
import performanceMonitor from './utils/performance-monitor';

// 根据环境设置日志级别
const isDev = __wxConfig.envVersion === 'develop' || __wxConfig.envVersion === 'trial';
logger.setLevel(isDev ? Level.DEBUG : Level.INFO);

// 配置错误处理
errorHandler.setConfig({
  enableReport: !isDev,
  reportUrl: 'https://api.example.com/error-report',
  showErrorToast: false
});

// 配置性能监控
performanceMonitor.setConfig({
  enableMonitor: true,
  logLevel: isDev ? 'debug' : 'warn',
  maxRecords: 1000
});

App({
  async onLaunch() {
    const startTime = Date.now();
    
    try {
      performanceMonitor.recordPageLoad('app', startTime);
    } catch (error) {
      await errorHandler.handleError(error);
    }
  },
  
  onShow() {
    try {
      checkUpdate();
    } catch (error) {
      errorHandler.handleError(error);
    }
  },

  globalData: {
    showErrorToast: false,  // 禁用错误提示
  }
});
