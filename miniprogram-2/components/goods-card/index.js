Component({
  options: {
    addGlobalClass: true,
  },

  properties: {
    id: {
      type: String,
      value: '',
      observer(id) {
        this.genIndependentID(id);
        if (this.properties.thresholds?.length) {
          this.createIntersectionObserverHandle();
        }
      },
    },
    data: {
      type: Object,
      observer(data) {
        if (!data) {
          return;
        }
        let isValidityLinePrice = true;
        if (data.originPrice && data.price && data.originPrice < data.price) {
          isValidityLinePrice = false;
        }
        this.setData({ goods: data, isValidityLinePrice });
      },
    },
    currency: {
      type: String,
      value: '¥',
    },

    thresholds: {
      type: Array,
      value: [],
      observer(thresholds) {
        if (thresholds && thresholds.length) {
          this.createIntersectionObserverHandle();
        } else {
          this.clearIntersectionObserverHandle();
        }
      },
    },

    item: {
      type: Object,
      value: {},
    },

    goods: {
      type: Object,
      value: {},
      observer(goods) {
        if (!goods) return;
        // 处理商品数据
        this.setData({
          goodsInfo: {
            ...goods,
            thumb: goods.primaryImage || '/assets/images/default-goods.png',
            price: goods.minSalePrice,
            originPrice: goods.maxLinePrice,
            title: goods.title || '商品标题'
          }
        });
      }
    }
  },

  data: {
    independentID: '',
    isValidityLinePrice: true,
    defaultImage: '/assets/images/default-goods.png',
    goodsInfo: null,
    windowWidth: 0,
    platform: '',
    imageLoadError: false,
    imageLoading: true,
    pricePrefix: '¥',
    priceUnit: '起',
    goodsData: null
  },

  lifetimes: {
    ready() {
      this.init();
    },
    detached() {
      this.clear();
    },
  },

  pageLifeTimes: {},

  methods: {
    clickHandle() {
      this.triggerEvent('click', { goods: this.data.goods });
    },

    clickThumbHandle() {
      this.triggerEvent('thumb', { goods: this.data.goods });
    },

    addCartHandle(e) {
      const { id } = e.currentTarget;
      const { id: cardID } = e.currentTarget.dataset;
      this.triggerEvent('add-cart', {
        ...e.detail,
        id,
        cardID,
        goods: this.data.goods,
      });
    },

    genIndependentID(id) {
      if (!id) return;
      this.setData({
        independentID: `${id}_${Math.random().toString(36).slice(2)}`,
      });
    },

    init() {
      const { thresholds, id } = this.properties;
      this.genIndependentID(id);
      if (thresholds && thresholds.length) {
        this.createIntersectionObserverHandle();
      }
    },

    clear() {
      this.clearIntersectionObserverHandle();
    },

    intersectionObserverContext: null,

    createIntersectionObserverHandle() {
      if (this.intersectionObserverContext || !this.data.independentID) {
        return;
      }
      this.intersectionObserverContext = this.createIntersectionObserver({
        thresholds: this.properties.thresholds,
      }).relativeToViewport();

      this.intersectionObserverContext.observe(
        `#${this.data.independentID}`,
        (res) => {
          this.intersectionObserverCB(res);
        },
      );
    },

    intersectionObserverCB() {
      this.triggerEvent('ob', {
        goods: this.data.goods,
        context: this.intersectionObserverContext,
      });
    },

    clearIntersectionObserverHandle() {
      if (this.intersectionObserverContext) {
        try {
          this.intersectionObserverContext.disconnect();
        } catch (e) {}
        this.intersectionObserverContext = null;
      }
    },

    onTap() {
      const { spuId } = this.data.goods;
      if (spuId) {
        wx.navigateTo({
          url: `/pages/goods/details/index?spuId=${spuId}`
        });
      }
    },

    onAddCart() {
      const { goods } = this.data;
      this.triggerEvent('add-cart', { goods });
    },

    attached() {
      const systemInfo = wx.getWindowInfo();
      const appBaseInfo = wx.getAppBaseInfo();
      
      this.setData({
        windowWidth: systemInfo.windowWidth,
        platform: appBaseInfo.platform
      });
    },

    onImageLoad() {
      this.setData({ 
        imageLoading: false,
        imageLoadError: false 
      });
    },

    onImageError() {
      this.setData({
        imageLoadError: true,
        imageLoading: false
      });
    },

    onAddCart(e) {
      e.stopPropagation();
      this.triggerEvent('addcart', {
        ...e.currentTarget.dataset.goods
      });
    }
  },
});
