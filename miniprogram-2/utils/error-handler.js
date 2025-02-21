/**
 * 统一错误处理工具
 */

import logger from './logger';
import { errorLogger } from './error-logger';
import { recoveryManager } from './recovery-manager';

// 错误类型定义
export const ErrorType = {
  NETWORK: 'NETWORK',      // 网络错误
  BUSINESS: 'BUSINESS',    // 业务错误
  VALIDATION: 'VALIDATION',// 验证错误
  SYSTEM: 'SYSTEM'        // 系统错误
};

// 错误码定义
export const ErrorCode = {
  NETWORK_TIMEOUT: 'NET_001',    // 网络超时
  NETWORK_OFFLINE: 'NET_002',    // 网络断开
  API_ERROR: 'API_001',          // 接口错误
  PARAM_INVALID: 'VAL_001',      // 参数无效
  SYSTEM_ERROR: 'SYS_001'        // 系统错误
};

// 自定义错误类
export class AppError extends Error {
  constructor(type, code, message, details = {}) {
    super(message);
    this.type = type;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// 错误处理配置
const config = {
  enableReport: true,     // 是否启用错误上报
  reportUrl: '',          // 错误上报地址
  showErrorToast: false,   // 禁用错误提示
  maxReportRetry: 3       // 上报重试次数
};

// 错误上报函数
const reportError = async (error) => {
  if (!config.enableReport) return;
  
  const appInfo = wx.getAppBaseInfo();
  const deviceInfo = wx.getDeviceInfo();
  
  const errorData = {
    type: error.type,
    code: error.code,
    message: error.message,
    details: error.details,
    timestamp: error.timestamp,
    stack: error.stack,
    platform: 'miniprogram',
    version: appInfo.version,
    system: deviceInfo.system
  };

  try {
    await wx.request({
      url: config.reportUrl,
      method: 'POST',
      data: errorData
    });
  } catch (reportError) {
    logger.error('错误上报失败:', reportError);
  }
};

// 错误提示函数
const showErrorMessage = (error) => {
  // 直接返回，不显示任何错误提示
  return;
};

// 统一错误处理函数
const handleError = async (error, context = {}) => {
  // 标准化错误对象
  const appError = error instanceof AppError ? error : new AppError(
    ErrorType.SYSTEM,
    ErrorCode.SYSTEM_ERROR,
    error.message || '系统错误'
  );
  
  // 记录错误日志
  logger.error('应用错误:', appError);
  
  // 收集错误日志
  await errorLogger.init();
  const errorLog = await errorLogger.log(appError, context);
  
  // 尝试自动恢复
  const recovered = await recoveryManager.autoRecover(appError, {
    ...context,
    errorLog
  });
  
  if (recovered) {
    logger.info('错误已恢复:', appError.type);
    return;
  }
  
  // 显示错误提示
  showErrorMessage(appError);
  
  // 上报错误
  await reportError(appError);
  
  return appError;
};

// 工具函数：创建业务错误
const createBusinessError = (code, message, details) => {
  return new AppError(ErrorType.BUSINESS, code, message, details);
};

// 工具函数：创建网络错误
const createNetworkError = (code, message, details) => {
  return new AppError(ErrorType.NETWORK, code, message, details);
};

// 工具函数：创建验证错误
const createValidationError = (message, details) => {
  return new AppError(ErrorType.VALIDATION, ErrorCode.PARAM_INVALID, message, details);
};

const errorHandler = {
  handleError,
  createBusinessError,
  createNetworkError,
  createValidationError,
  
  // 配置接口
  setConfig: (newConfig) => {
    Object.assign(config, newConfig);
  },

  // 格式化错误信息
  formatError(error) {
    if (!error) return null;

    // 直接返回 null,不显示任何错误提示
    return null;
  }
};

export default errorHandler;
export { handleError }; 