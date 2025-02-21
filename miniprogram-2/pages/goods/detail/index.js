Page({
  data: {
    goods: null,
    loading: true
  },

  async onLoad({ spuId }) {
    const goods = await getGoodsDetail(spuId);
    this.setData({
      goods,
      loading: false
    });
  }
}); 