/**
 * 小程序更新管理器
 * 用于检查和处理小程序更新
 */

const UPDATE_MANAGER_CONFIG = {
  FORCE_UPDATE: true, // 是否强制更新
  CHECK_INTERVAL: 3600000, // 检查更新间隔（1小时）
  TIPS: {
    UPDATE_READY: '新版本已经准备好，是否重启应用？',
    UPDATE_FAILED: '新版本下载失败，请检查网络后重试',
    FORCE_UPDATE_READY: '新版本已经准备好，需要重启应用',
  }
};

class UpdateManager {
  constructor() {
    // 获取更新管理器实例
    this.updateManager = wx.getUpdateManager();
    this.lastCheckTime = 0;
    this.init();
  }

  init() {
    if (!this.updateManager) {
      console.warn('当前小程序不支持更新管理器');
      return;
    }

    // 监听检查更新结果
    this.updateManager.onCheckForUpdate((res) => {
      this.lastCheckTime = Date.now();
      console.log('检查更新结果:', res);
    });

    // 监听更新下载完成
    this.updateManager.onUpdateReady(() => {
      if (UPDATE_MANAGER_CONFIG.FORCE_UPDATE) {
        this.forceUpdate();
      } else {
        this.showUpdateDialog();
      }
    });

    // 监听更新下载失败
    this.updateManager.onUpdateFailed(() => {
      wx.showToast({
        title: UPDATE_MANAGER_CONFIG.TIPS.UPDATE_FAILED,
        icon: 'none',
        duration: 3000
      });
    });
  }

  // 检查更新
  checkUpdate() {
    const now = Date.now();
    if (now - this.lastCheckTime < UPDATE_MANAGER_CONFIG.CHECK_INTERVAL) {
      console.log('距离上次检查时间未超过设定间隔');
      return;
    }

    try {
      this.updateManager.applyUpdate();
    } catch (err) {
      console.error('检查更新失败:', err);
    }
  }

  // 显示更新对话框
  showUpdateDialog() {
    wx.showModal({
      title: '更新提示',
      content: UPDATE_MANAGER_CONFIG.TIPS.UPDATE_READY,
      success: (res) => {
        if (res.confirm) {
          this.updateManager.applyUpdate();
        }
      }
    });
  }

  // 强制更新
  forceUpdate() {
    wx.showModal({
      title: '更新提示',
      content: UPDATE_MANAGER_CONFIG.TIPS.FORCE_UPDATE_READY,
      showCancel: false,
      success: () => {
        this.updateManager.applyUpdate();
      }
    });
  }
}

// 导出单例
let instance = null;
export default {
  getInstance() {
    if (!instance) {
      instance = new UpdateManager();
    }
    return instance;
  }
}; 