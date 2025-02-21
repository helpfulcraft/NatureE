import { errorHandler } from '../../utils/error-handler';

Component({
  properties: {
    error: {
      type: Object,
      value: null,
      observer: 'onErrorChange'
    },
    type: {
      type: String,
      value: 'toast' // toast, modal, inline
    }
  },

  data: {
    visible: false,
    title: '',
    content: '',
    buttons: []
  },

  methods: {
    onErrorChange(error) {
      if (!error) {
        this.setData({ visible: false });
        return;
      }

      const errorInfo = errorHandler.formatError(error);
      
      switch (this.data.type) {
        case 'modal':
          this.showErrorModal(errorInfo);
          break;
        case 'inline':
          this.showErrorInline(errorInfo);
          break;
        default:
          this.showErrorToast(errorInfo);
      }
    },

    showErrorToast(error) {
      this.setData({
        visible: true,
        title: error.message,
        content: error.detail || ''
      });

      setTimeout(() => {
        this.setData({ visible: false });
      }, 3000);
    },

    showErrorModal(error) {
      const buttons = [];
      
      // 添加重试按钮
      if (error.retryable) {
        buttons.push({
          text: '重试',
          theme: 'primary',
          onClick: () => {
            this.triggerEvent('retry');
          }
        });
      }

      // 添加确定按钮
      buttons.push({
        text: '确定',
        onClick: () => {
          this.setData({ visible: false });
        }
      });

      this.setData({
        visible: true,
        title: error.title || '错误提示',
        content: error.message,
        buttons
      });
    },

    showErrorInline(error) {
      this.setData({
        visible: true,
        content: error.message
      });
    },

    onButtonClick(e) {
      const { index } = e.currentTarget.dataset;
      const button = this.data.buttons[index];
      if (button?.onClick) {
        button.onClick();
      }
    }
  }
}); 