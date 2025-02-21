Component({
  properties: {
    // ... 其他属性保持不变
  },

  data: {
    // ... 其他数据保持不变
  },

  lifetimes: {
    attached() {
      // 通知页面组件已准备就绪
      this.triggerEvent('ready', { name: 'addressCard' });
    }
  },

  methods: {
    // ... 其他方法保持不变
  }
}); 