/**
 * 组件依赖检查工具
 */

import logger from './logger';
import errorHandler from './error-handler';

// TDesign 组件列表
const TDESIGN_COMPONENTS = [
  { name: 'button', path: 'tdesign-miniprogram/button/button' },
  { name: 'image', path: 'tdesign-miniprogram/image/image' },
  { name: 'loading', path: 'tdesign-miniprogram/loading/loading' },
  { name: 'empty', path: 'tdesign-miniprogram/empty/empty' },
  { name: 'icon', path: 'tdesign-miniprogram/icon/icon' },
  { name: 'search', path: 'tdesign-miniprogram/search/search' }
];

// 检查组件是否存在
async function checkComponentExists(componentPath) {
  // 开发环境跳过检查
  if (__wxConfig.envVersion === 'develop') {
    return true;
  }

  try {
    const fs = wx.getFileSystemManager();
    await new Promise((resolve, reject) => {
      fs.access({
        path: `${wx.env.USER_DATA_PATH}/${componentPath}.js`,
        success: resolve,
        fail: reject
      });
    });
    return true;
  } catch {
    return false;
  }
}

// 验证 TDesign 组件
async function validateTDesignComponents() {
  try {
    const missingComponents = [];
    
    for (const { name, path } of TDESIGN_COMPONENTS) {
      if (!await checkComponentExists(path)) {
        missingComponents.push({ name, path });
      }
    }
    
    if (missingComponents.length > 0) {
      throw errorHandler.createBusinessError(
        'COMP_001',
        'TDesign 组件缺失，请检查依赖安装',
        { components: missingComponents }
      );
    }
  } catch (error) {
    throw errorHandler.handleError(error);
  }
}

// 修复组件引用
function fixComponentPath(pagePath, pageConfig) {
  const { usingComponents = {} } = pageConfig;
  const fixed = { ...pageConfig };

  Object.entries(usingComponents).forEach(([name, path]) => {
    if (path.startsWith('tdesign-miniprogram/')) {
      const componentName = path.split('/').pop();
      if (componentName !== name) {
        fixed.usingComponents[name] = `tdesign-miniprogram/${name}/${name}`;
      }
    }
  });

  return fixed;
}

export {
  validateTDesignComponents,
  fixComponentPath,
  TDESIGN_COMPONENTS
}; 