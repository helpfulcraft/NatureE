Component({
  data: {
    active: 0,
    list: [
      {
        icon: 'home',
        text: '首页',
        url: '/pages/home/home/index'
      },
      {
        icon: 'app',
        text: '全部商品',
        url: '/pages/category/index'
      },
      {
        icon: 'cart',
        text: '购物车',
        url: '/pages/cart/index'
      },
      {
        icon: 'user',
        text: '我的',
        url: '/pages/my/index'
      }
    ]
  },

  methods: {
    switchTab(e) {
      const { index, item } = e.currentTarget.dataset;
      if (typeof index !== 'number' || !item?.url) return;
      
      this.setData({ active: index });
      wx.switchTab({
        url: item.url,
        fail: (err) => {
          console.error('切换标签页失败:', err);
        }
      });
    },

    init() {
      const pages = getCurrentPages();
      if (!pages?.length) return;
      
      const page = pages[pages.length - 1];
      if (!page?.route) return;
      
      const route = '/' + page.route;
      const active = this.data.list.findIndex(item => item.url === route);
      
      if (active !== -1 && active !== this.data.active) {
        this.setData({ active });
      }
    }
  }
});
