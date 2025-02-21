Component({
  properties: {
    item: Object
  },

  methods: {
    onTap() {
      const { spuId } = this.properties.item;
      wx.navigateTo({
        url: `/pages/goods/detail/index?spuId=${spuId}`
      });
    }
  }
}); 