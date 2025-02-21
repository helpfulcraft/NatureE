import { errorLogger } from '../../utils/error-logger';

Page({
  data: {
    logs: [],
    loading: false
  },

  onLoad() {
    this.loadLogs();
  },

  async loadLogs() {
    this.setData({ loading: true });
    
    try {
      await errorLogger.init();
      const logs = errorLogger.getLogs();
      
      this.setData({
        logs: logs.map(log => ({
          ...log,
          formattedTime: new Date(log.timestamp).toLocaleString()
        }))
      });
    } catch (err) {
      console.error('加载错误日志失败:', err);
    } finally {
      this.setData({ loading: false });
    }
  },

  async clearLogs() {
    try {
      await wx.showModal({
        title: '确认清理',
        content: '确定要清理所有错误日志吗？'
      });
      
      errorLogger.clear();
      this.setData({ logs: [] });
      
      wx.showToast({
        title: '清理成功',
        icon: 'success'
      });
    } catch {
      // 用户取消
    }
  },

  async exportLogs() {
    try {
      const filePath = await errorLogger.export();
      
      await wx.shareFileMessage({
        filePath,
        success: () => {
          wx.showToast({
            title: '导出成功',
            icon: 'success'
          });
        }
      });
    } catch (err) {
      console.error('导出错误日志失败:', err);
      wx.showToast({
        title: '导出失败',
        icon: 'error'
      });
    }
  }
}); 