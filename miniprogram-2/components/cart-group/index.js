Component({
  properties: {
    storeGoods: {
      type: Array,
      value: []
    },
    invalidGoodItems: {
      type: Array,
      value: []
    }
  },

  methods: {
    onGoodsSelect(e) {
      const { index } = e.currentTarget.dataset;
      this.triggerEvent('selectgoods', { index });
    },

    onStoreSelect(e) {
      const { index } = e.currentTarget.dataset;
      this.triggerEvent('selectstore', { index });
    },

    onQuantityChange(e) {
      const { index, value } = e.detail;
      this.triggerEvent('changequantity', { index, value });
    },

    onGoCollect(e) {
      const { index } = e.currentTarget.dataset;
      this.triggerEvent('gocollect', { index });
    },

    onGoodsClick(e) {
      const { index } = e.currentTarget.dataset;
      this.triggerEvent('goodsclick', { index });
    },

    onClearInvalidGoods() {
      this.triggerEvent('clearinvalidgoods');
    },

    onDelete(e) {
      const { index } = e.currentTarget.dataset;
      this.triggerEvent('delete', { index });
    }
  }
}); 