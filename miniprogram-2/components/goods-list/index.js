Component({
  properties: {
    goodsList: {
      type: Array,
      value: []
    },
    loading: {
      type: Boolean,
      value: false
    }
  },

  data: {
    loadMoreStatus: 0 // 0: loading, 1: empty, 2: noMore
  },

  observers: {
    'goodsList, loading': function(goodsList, loading) {
      if (!loading) {
        this.setData({
          loadMoreStatus: goodsList.length === 0 ? 1 : 2
        });
      }
    }
  },

  methods: {
    onTapGoods(e) {
      const { index } = e.currentTarget.dataset;
      const item = this.data.goodsList[index];
      if (item) {
        wx.navigateTo({
          url: `/pages/goods/details/index?id=${item.id}`
        });
      }
    }
  }
}); 