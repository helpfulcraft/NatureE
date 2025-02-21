const formatTime = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':');
};

const formatNumber = n => {
  n = n.toString();
  return n[1] ? n : '0' + n;
};

const formatPrice = (price) => {
  if (typeof price !== 'number') {
    price = parseInt(price) || 0;
  }
  return (price / 100).toFixed(2);
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const showToast = (title, icon = 'none') => {
  // 检查全局配置是否允许显示错误提示
  const app = getApp();
  if (app?.globalData?.showErrorToast === false && icon === 'none') {
    // 如果全局禁用了错误提示且是错误类型的提示,则只打印日志
    console.log('错误信息(已禁用提示):', title);
    return;
  }

  wx.showToast({
    title,
    icon,
    duration: 2000
  });
};

const showLoading = (title = '加载中...') => {
  wx.showLoading({
    title,
    mask: true
  });
};

const hideLoading = () => {
  wx.hideLoading();
};

const showModal = async (options) => {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title: options.title || '提示',
      content: options.content || '',
      showCancel: options.showCancel !== false,
      cancelText: options.cancelText || '取消',
      confirmText: options.confirmText || '确定',
      success: (res) => {
        resolve(res);
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

module.exports = {
  formatTime,
  formatNumber,
  formatPrice,
  delay,
  showToast,
  showLoading,
  hideLoading,
  showModal
}; 