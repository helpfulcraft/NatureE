import logger from './logger';
import { errorLogger } from './error-logger';

class RecoveryManager {
  constructor() {
    this.recoveryStrategies = new Map();
    this.maxRetries = 3;
  }

  // 注册恢复策略
  registerStrategy(errorType, strategy) {
    this.recoveryStrategies.set(errorType, strategy);
  }

  // 尝试恢复
  async recover(error, context = {}) {
    const strategy = this.recoveryStrategies.get(error.type);
    if (!strategy) {
      logger.warn('未找到恢复策略:', error.type);
      return false;
    }

    try {
      const retryCount = context.retryCount || 0;
      if (retryCount >= this.maxRetries) {
        logger.error('超过最大重试次数:', error);
        return false;
      }

      logger.info('开始执行恢复策略:', {
        type: error.type,
        retry: retryCount + 1
      });

      await strategy(error, {
        ...context,
        retryCount: retryCount + 1
      });

      return true;
    } catch (err) {
      logger.error('执行恢复策略失败:', err);
      return false;
    }
  }

  // 自动恢复
  async autoRecover(error, context = {}) {
    const errorInfo = await errorLogger.log(error, context);
    return this.recover(error, {
      ...context,
      errorLog: errorInfo
    });
  }
}

export const recoveryManager = new RecoveryManager();

// 注册默认恢复策略
recoveryManager.registerStrategy('NETWORK', async (error, context) => {
  // 网络错误恢复策略
  await new Promise(resolve => setTimeout(resolve, 1000 * context.retryCount));
  return context.retry?.();
});

recoveryManager.registerStrategy('BUSINESS', async (error, context) => {
  // 业务错误恢复策略
  if (error.code === 'TOKEN_EXPIRED') {
    await wx.login();
    return context.retry?.();
  }
  return false;
});

recoveryManager.registerStrategy('VALIDATION', async (error, context) => {
  // 验证错误恢复策略
  if (context.form) {
    context.form.setData({
      errors: error.details
    });
  }
  return false;
});

// 添加系统错误恢复策略
recoveryManager.registerStrategy('SYSTEM', async (error, context) => {
  try {
    // 记录错误
    errorLogger.log(error);

    // 尝试恢复
    if (context.retryable) {
      const result = await context.retry();
      if (result) {
        logger.info('系统错误恢复成功');
        return true;
      }
    }

    // 不显示任何提示,直接返回
    return false;
  } catch (err) {
    logger.error('错误恢复失败:', err);
    return false;
  }
}); 