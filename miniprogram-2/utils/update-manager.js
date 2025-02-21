/**
 * 小程序更新管理器
 * 用于检查和处理小程序版本更新
 */

import logger from './logger';
import errorHandler from './error-handler';

export default function checkUpdate() {
  if (!wx.getUpdateManager) return false;

  const updateManager = wx.getUpdateManager();
  
  updateManager.onCheckForUpdate(({ hasUpdate }) => {
    if (hasUpdate) {
      logger.info('发现新版本');
    }
  });

  updateManager.onUpdateReady(() => {
    wx.showModal({
      title: '更新提示',
      content: '新版本已经准备好，是否重启应用？',
      success: (res) => {
        if (res.confirm) {
          updateManager.applyUpdate();
        }
      }
    });
  });

  updateManager.onUpdateFailed((error) => {
    errorHandler.handleError(error);
  });
} 