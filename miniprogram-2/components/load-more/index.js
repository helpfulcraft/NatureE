Component({
  properties: {
    status: {
      type: Number,
      value: 0 // 0: loading, 1: empty, 2: noMore
    },
    loadingText: {
      type: String,
      value: '加载中...'
    },
    emptyText: {
      type: String,
      value: '暂无数据'
    },
    noMoreText: {
      type: String,
      value: '没有更多了'
    }
  },

  methods: {
    onRetry() {
      if (this.properties.status !== 0) {
        this.triggerEvent('retry');
      }
    },

    onLoadMore() {
      if (this.properties.status !== 0) {
        this.triggerEvent('loadmore');
      }
    }
  }
}); 