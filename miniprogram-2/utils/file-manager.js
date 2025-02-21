import logger from './logger';
import errorHandler from './error-handler';

class FileManager {
  constructor() {
    this.fs = wx.getFileSystemManager();
    this.userPath = wx.env.USER_DATA_PATH;
  }

  // 读取文件
  async readFile(path, options = {}) {
    const { encoding = 'utf8', createIfNotExists = false } = options;

    try {
      const filePath = this._getFullPath(path);
      
      // 检查文件是否存在
      const exists = await this.exists(filePath);
      if (!exists) {
        if (createIfNotExists) {
          await this.writeFile(path, '', { encoding });
          return '';
        }
        throw errorHandler.createBusinessError('FILE_001', '文件不存在', { path });
      }

      return await new Promise((resolve, reject) => {
        this.fs.readFile({
          filePath,
          encoding,
          success: (res) => resolve(res.data),
          fail: reject
        });
      });
    } catch (err) {
      logger.error(`读取文件失败: ${path}`, err);
      throw errorHandler.createBusinessError('FILE_002', '读取文件失败', { path, error: err });
    }
  }

  // 写入文件
  async writeFile(path, data, options = {}) {
    const { encoding = 'utf8', createPath = true } = options;

    try {
      const filePath = this._getFullPath(path);
      
      // 确保目录存在
      if (createPath) {
        await this._ensureDir(path);
      }

      await new Promise((resolve, reject) => {
        this.fs.writeFile({
          filePath,
          data,
          encoding,
          success: resolve,
          fail: reject
        });
      });

      return true;
    } catch (err) {
      logger.error(`写入文件失败: ${path}`, err);
      throw errorHandler.createBusinessError('FILE_003', '写入文件失败', { path, error: err });
    }
  }

  // 检查文件是否存在
  async exists(path) {
    try {
      const filePath = this._getFullPath(path);
      await new Promise((resolve, reject) => {
        this.fs.access({
          path: filePath,
          success: resolve,
          fail: reject
        });
      });
      return true;
    } catch {
      return false;
    }
  }

  // 确保目录存在
  async _ensureDir(path) {
    const dir = path.substring(0, path.lastIndexOf('/'));
    if (!dir) return;

    try {
      const dirPath = this._getFullPath(dir);
      await new Promise((resolve, reject) => {
        this.fs.mkdir({
          dirPath,
          recursive: true,
          success: resolve,
          fail: reject
        });
      });
    } catch (err) {
      if (err.errMsg?.includes('file already exists')) {
        return;
      }
      throw err;
    }
  }

  // 获取完整路径
  _getFullPath(path) {
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
    return `${this.userPath}/${path}`;
  }
}

export const fileManager = new FileManager(); 