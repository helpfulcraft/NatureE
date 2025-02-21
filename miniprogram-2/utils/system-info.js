/**
 * 系统信息工具类
 */
import logger from './logger';

class SystemInfo {
  constructor() {
    this._systemInfo = null;
    this._windowInfo = null;
    this._deviceInfo = null;
  }

  // 获取系统设置
  async getSystemSetting() {
    try {
      return await wx.getSystemSetting();
    } catch (err) {
      logger.error('获取系统设置失败:', err);
      return {};
    }
  }

  // 获取应用授权设置
  async getAppAuthorizeSetting() {
    try {
      return await wx.getAppAuthorizeSetting();
    } catch (err) {
      logger.error('获取应用授权设置失败:', err);
      return {};
    }
  }

  // 获取设备信息
  async getDeviceInfo() {
    if (this._deviceInfo) {
      return this._deviceInfo;
    }
    try {
      this._deviceInfo = wx.getDeviceInfo();
      return this._deviceInfo;
    } catch (err) {
      logger.error('获取设备信息失败:', err);
      return {};
    }
  }

  // 获取窗口信息
  getWindowInfo() {
    if (this._windowInfo) {
      return this._windowInfo;
    }
    try {
      this._windowInfo = wx.getWindowInfo();
      return this._windowInfo;
    } catch (err) {
      logger.error('获取窗口信息失败:', err);
      return {};
    }
  }

  // 获取应用基础信息
  getAppBaseInfo() {
    try {
      return wx.getAppBaseInfo();
    } catch (err) {
      logger.error('获取应用基础信息失败:', err);
      return {};
    }
  }

  // 获取完整的系统信息
  async getSystemInfo() {
    if (this._systemInfo) {
      return this._systemInfo;
    }

    try {
      const [
        systemSetting,
        appAuthorizeSetting,
        deviceInfo
      ] = await Promise.all([
        this.getSystemSetting(),
        this.getAppAuthorizeSetting(),
        this.getDeviceInfo()
      ]);

      const windowInfo = this.getWindowInfo();
      const appBaseInfo = this.getAppBaseInfo();

      this._systemInfo = {
        ...systemSetting,
        ...appAuthorizeSetting,
        ...deviceInfo,
        ...windowInfo,
        ...appBaseInfo,
        windowWidth: windowInfo.windowWidth,
        windowHeight: windowInfo.windowHeight,
        screenWidth: windowInfo.screenWidth,
        screenHeight: windowInfo.screenHeight,
        statusBarHeight: windowInfo.statusBarHeight,
        pixelRatio: windowInfo.pixelRatio,
        platform: appBaseInfo.platform,
        system: deviceInfo.system,
        brand: deviceInfo.brand,
        model: deviceInfo.model,
        version: appBaseInfo.version,
        SDKVersion: appBaseInfo.SDKVersion
      };

      return this._systemInfo;
    } catch (err) {
      logger.error('获取系统信息失败:', err);
      return {};
    }
  }

  // 获取菜单按钮位置信息
  getMenuButtonInfo() {
    try {
      return wx.getMenuButtonBoundingClientRect();
    } catch (err) {
      logger.error('获取菜单按钮位置失败:', err);
      return null;
    }
  }

  // 获取系统主题
  getSystemTheme() {
    try {
      return wx.getSystemSetting().theme;
    } catch (err) {
      logger.error('获取系统主题失败:', err);
      return 'light';
    }
  }

  // 监听系统主题变化
  onThemeChange(callback) {
    wx.onThemeChange(callback);
  }

  // 取消监听系统主题变化
  offThemeChange(callback) {
    wx.offThemeChange(callback);
  }

  // 清除缓存
  clearCache() {
    this._systemInfo = null;
    this._windowInfo = null;
    this._deviceInfo = null;
  }
}

// 导出单例实例
export const systemInfo = new SystemInfo(); 