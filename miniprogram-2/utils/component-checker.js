/**
 * 组件依赖检查工具
 */

// 检查组件是否存在
const checkComponent = (componentPath) => {
  try {
    const fs = wx.getFileSystemManager();
    return new Promise((resolve) => {
      fs.access({
        path: componentPath,
        success: () => resolve(true),
        fail: () => resolve(false)
      });
    });
  } catch (error) {
    console.error('检查组件失败:', error);
    return Promise.resolve(false);
  }
};

// 检查 TDesign 组件
const checkTDesignComponents = async () => {
  const components = [
    'tdesign-miniprogram/button/button',
    'tdesign-miniprogram/image/image',
    'tdesign-miniprogram/loading/loading',
    'tdesign-miniprogram/empty/empty',
    'tdesign-miniprogram/icon/icon',
    'tdesign-miniprogram/search/search'
  ];

  const results = await Promise.all(
    components.map(async (path) => {
      const exists = await checkComponent(path);
      return { path, exists };
    })
  );

  return results.filter(({ exists }) => !exists);
};

export { checkComponent, checkTDesignComponents }; 