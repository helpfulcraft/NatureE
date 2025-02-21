Component({
  options: {
    addGlobalClass: true,
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
  },

  properties: {
    show: {
      type: Boolean,
      value: false,
    },
    item: {
      type: Object,
      value: {},
      observer(item) {
        if (item) {
          this.setData({
            goods: {
              ...item,
              thumb: item.primaryImage || '',  // 确保有默认值
              specs: (item.specInfo || []).map(spec => spec.specValue).join(' '),
            }
          });
        }
      }
    },
    title: {
      type: String,
      observer(newVal) {
        this.setData({ 'goods.title': newVal });
      },
    },
    price: {
      type: String,
      value: '',
      observer(newVal) {
        this.setData({ 'goods.price': newVal });
      },
    },
    thumbMode: {
      type: String,
      value: 'aspectFit',
    },
    zIndex: {
      type: Number,
      value: 99,
    },
  },

  data: {
    goods: null,
  },
  methods: {
    onClose() {
      this.triggerEvent('close');
    },

    onCloseOver() {
      this.triggerEvent('closeover');
    },
  },
});
