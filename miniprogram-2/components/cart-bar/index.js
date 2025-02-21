Component({
  properties: {
    totalAmount: {
      type: Number,
      value: 0
    },
    totalDiscountAmount: {
      type: Number,
      value: 0
    },
    totalGoodsNum: {
      type: Number,
      value: 0
    },
    isAllSelected: {
      type: Boolean,
      value: false
    },
    fixed: {
      type: Boolean,
      value: true
    },
    bottomHeight: {
      type: Number,
      value: 0
    }
  },

  methods: {
    handleSelectAll() {
      this.triggerEvent('handleSelectAll');
    },

    handleToSettle() {
      this.triggerEvent('handleToSettle');
    }
  }
}); 