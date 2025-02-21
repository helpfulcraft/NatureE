/**
 * 字体加载工具
 */

import logger from './logger';
import errorHandler from './error-handler';
import { fileManager } from './file-manager';

// 字体配置
const FONT_CONFIG = {
  tdesign: {
    family: 'tdesign',
    source: 'https://tdesign.gtimg.com/icon/0.3.1/fonts/t.woff',
    fallback: 'system-ui'
  }
};

// 字体文件映射
const FONT_URL_MAP = {
  development: {
    tdesign: '/miniprogram/assets/fonts/tdesign.woff'
  },
  production: {
    tdesign: 'https://tdesign.gtimg.com/icon/0.3.1/fonts/t.woff'
  }
};

const FONT_CACHE_KEY = 'TDESIGN_FONT_CACHE';
const FONT_TIMEOUT = 5000;  // 5秒超时
const MAX_RETRIES = 3;

// 本地字体存储路径
const LOCAL_FONT_DIR = `${wx.env.USER_DATA_PATH}/fonts`;

class FontLoader {
  constructor() {
    this.loadedFonts = new Set();
    this._initFontDir();
  }

  // 初始化字体目录
  async _initFontDir() {
    try {
      await fileManager.mkdir(LOCAL_FONT_DIR, { recursive: true });
    } catch (err) {
      if (!err.message?.includes('file already exists')) {
        logger.error('创建字体目录失败:', err);
      }
    }
  }

  // 加载字体
  async loadFont(fontName) {
    try {
      // 检查是否已加载
      if (this.loadedFonts.has(fontName)) {
        return true;
      }

      const config = FONT_CONFIG[fontName];
      if (!config) {
        throw new Error(`未知字体: ${fontName}`);
      }

      // 检查缓存
      const cachedPath = wx.getStorageSync(`${FONT_CACHE_KEY}_${fontName}`);
      if (cachedPath && await this.checkFontFile(cachedPath)) {
        return await this.useFontFile(cachedPath, config);
      }

      // 下载字体
      const tempPath = await this.downloadFont(config.source);
      
      // 保存到本地
      const localPath = await this.saveFontFile(tempPath, fontName);
      
      // 使用字体
      const success = await this.useFontFile(localPath, config);
      if (success) {
        this.loadedFonts.add(fontName);
        wx.setStorageSync(`${FONT_CACHE_KEY}_${fontName}`, localPath);
      }

      return success;
    } catch (err) {
      logger.error('加载字体失败:', err);
      return false;
    }
  }

  // 检查字体文件
  async checkFontFile(path) {
    try {
      await fileManager.access(path);
      return true;
    } catch {
      return false;
    }
  }

  // 下载字体
  async downloadFont(url) {
    const res = await wx.downloadFile({
      url,
      timeout: FONT_TIMEOUT
    });

    if (res.statusCode !== 200) {
      throw new Error('下载字体失败');
    }

    return res.tempFilePath;
  }

  // 保存字体文件
  async saveFontFile(tempPath, fontName) {
    const fileName = `${fontName}_${Date.now()}.woff`;
    const targetPath = `${LOCAL_FONT_DIR}/${fileName}`;

    await fileManager.copyFile(tempPath, targetPath);
    return targetPath;
  }

  // 使用字体文件
  async useFontFile(path, config) {
    return new Promise((resolve) => {
      wx.loadFontFace({
        family: config.family,
        source: `url("${path}")`,
        fallback: config.fallback,
        success: () => {
          logger.info(`字体加载成功: ${config.family}`);
          resolve(true);
        },
        fail: (err) => {
          logger.warn(`字体加载失败: ${config.family}`, err);
          resolve(false);
        }
      });
    });
  }

  // 清理字体缓存
  clearCache() {
    this.loadedFonts.clear();
    wx.removeStorageSync(FONT_CACHE_KEY);
  }
}

export const fontLoader = new FontLoader();

// 检查字体文件是否存在
async function checkFontFile(path) {
  try {
    const fs = wx.getFileSystemManager();
    await new Promise((resolve, reject) => {
      fs.access({
        path: `${wx.env.USER_DATA_PATH}${path}`,
        success: resolve,
        fail: reject
      });
    });
    return true;
  } catch {
    return false;
  }
}

// 加载单个字体
async function loadFont(config) {
  try {
    // 检查字体文件
    const exists = await checkFontFile(config.source);
    if (!exists) {
      throw new Error(`字体文件不存在: ${config.source}`);
    }

    await new Promise((resolve, reject) => {
      wx.loadFontFace({
        family: config.family,
        source: `url("${config.source}")`,
        success: () => {
          logger.info(`字体加载成功: ${config.family}`);
          resolve();
        },
        fail: (error) => {
          logger.warn(`字体加载失败: ${config.family}`, error);
          reject(error);
        }
      });
    });
  } catch (error) {
    // 字体加载失败不阻止应用启动
    errorHandler.createBusinessError('FONT_004', '字体加载失败', {
      cause: error
    });
  }
}

// 加载所有字体
export async function loadFonts() {
  try {
    // 检查本地是否存在
    const exists = await fileManager.access(LOCAL_FONT_DIR);
    if (!exists) {
      // 下载字体文件
      await fileManager.downloadFile(FONT_URL, LOCAL_FONT_DIR);
    }
    return LOCAL_FONT_DIR;
  } catch (err) {
    console.error('加载字体失败:', err);
    return FONT_URL;
  }
}

// 导出字体配置供其他模块使用
export const FontConfig = FONT_CONFIG;

export async function loadTDesignFont() {
  try {
    // 检查缓存
    const cache = wx.getStorageSync(FONT_CACHE_KEY);
    if (cache) {
      return cache;
    }

    // 下载字体
    const res = await wx.downloadFile({
      url: FONT_URL,
      timeout: 5000
    });

    if (res.statusCode === 200) {
      // 保存到缓存
      wx.setStorageSync(FONT_CACHE_KEY, res.tempFilePath);
      return res.tempFilePath;
    }

    throw new Error('下载字体失败');
  } catch (err) {
    console.error('加载字体失败:', err);
    return FONT_URL; // 降级使用在线字体
  }
} 