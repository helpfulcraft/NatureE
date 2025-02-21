import logger from './logger';

const REQUIRED_DOMAINS = {
  request: [
    'https://api.example.com',
    'https://tcb-api.tencentcloudapi.com'
  ],
  downloadFile: [
    'https://tdesign.gtimg.com'
  ]
};

export async function validateDomains() {
  try {
    const setting = await wx.getSetting();
    const { requestDomain, downloadFile } = setting.networkTimeout || {};
    
    const missingDomains = {
      request: REQUIRED_DOMAINS.request.filter(domain => !requestDomain?.includes(domain)),
      downloadFile: REQUIRED_DOMAINS.downloadFile.filter(domain => !downloadFile?.includes(domain))
    };

    if (missingDomains.request.length || missingDomains.downloadFile.length) {
      logger.warn('缺少必需的域名配置:', missingDomains);
      
      // 开发环境下显示详细提示
      if (__wxConfig.envVersion === 'develop') {
        wx.showModal({
          title: '域名配置缺失',
          content: `请在小程序管理后台添加以下域名：\n\n${[
            ...missingDomains.request.map(d => `request: ${d}`),
            ...missingDomains.downloadFile.map(d => `download: ${d}`)
          ].join('\n')}`,
          showCancel: false
        });
      }
      
      return false;
    }
    
    return true;
  } catch (err) {
    logger.error('域名配置检查失败:', err);
    return false;
  }
} 