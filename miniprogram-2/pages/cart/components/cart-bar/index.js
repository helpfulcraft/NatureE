Component({
  options: {
    addGlobalClass: true,
    pureDataPattern: /^_/  // 指定纯数据字段
  },
  /**
   * 组件的属性列表
   */
  properties: {
    isAllSelected: Boolean,
    totalAmount: {
      type: Number,
      value: 0,
      observer(newVal) {
        // 确保值为数字
        const value = typeof newVal === 'number' ? newVal : 0;
        if (value !== this.data.totalAmount) {
          this.setData({ totalAmount: value });
        }
      }
    },
    totalDiscountAmount: {
      type: Number,
      value: 0,
      observer(newVal) {
        const value = typeof newVal === 'number' ? newVal : 0;
        if (value !== this.data.totalDiscountAmount) {
          this.setData({ totalDiscountAmount: value });
        }
      }
    },
    totalGoodsNum: {
      type: Number,
      value: 0,
      observer(newVal) {
        const value = typeof newVal === 'number' ? newVal : 0;
        if (value !== this.data.totalGoodsNum) {
          this.setData({ 
            totalGoodsNum: value,
            isDisabled: value === 0
          });
        }
      }
    },
    bottomHeight: {
      type: Number,
      value: 112  // 设置默认高度
    },
    fixed: {
      type: Boolean,
      value: true  // 默认固定在底部
    }
  },
  data: {
    isDisabled: true,
    _ready: false,
    _scrollTop: 0
  },

  lifetimes: {
    created() {
      console.log('组件创建');
    },

    attached() {
      // 组件挂载后初始化
      const { totalAmount, totalDiscountAmount, totalGoodsNum } = this.properties;
      
      this.setData({
        isDisabled: (Number(totalGoodsNum) || 0) === 0,
        _ready: true
      });

      // 使用性能更好的原生模式
      this._observer = wx.createIntersectionObserver(this, {
        thresholds: [0, 0.5, 1],
        observeAll: true,
        initialRatio: 1,
        nativeMode: true  // 启用原生模式以提高性能
      });

      this._observer
        .relativeToViewport({
          bottom: 0
        })
        .observe('.cart-bar', (res) => {
          const { intersectionRatio, boundingClientRect } = res;
          
          // 使用位置信息来判断是否需要固定定位
          const windowInfo = wx.getWindowInfo();
          const shouldFix = boundingClientRect.bottom > windowInfo.windowHeight;
          
          this.setData({
            _scrollTop: shouldFix ? 1 : 0
          });
        });
    },

    ready() {
      console.log('组件就绪 - 当前数据:', this.data);
    },

    detached() {
      console.log('组件卸载');
      if (this._observer) {
        this._observer.disconnect();
        this._observer = null;
      }
    }
  },

  methods: {
    handleSelectAll() {
      const { isAllSelected } = this.data;
      console.log('全选状态切换:', {
        当前状态: isAllSelected,
        即将切换为: !isAllSelected
      });
      this.setData({ isAllSelected: !isAllSelected });
      this.triggerEvent('handleSelectAll', { isAllSelected });
    },

    handleToSettle() {
      console.log('结算按钮点击:', {
        禁用状态: this.data.isDisabled,
        当前总金额: this.data._totalAmount,
        当前商品数: this.data._totalGoodsNum
      });

      if (this.data.isDisabled) return;
      this.triggerEvent('handleToSettle');
    },

    // 获取安全的数字值
    _getSafeNumber(value) {
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    }
  },

  observers: {
    // 监听所有数值属性的变化
    'totalAmount, totalDiscountAmount, totalGoodsNum': function(amount, discount, num) {
      if (!this.data._ready) return;  // 组件未就绪时不处理

      // 确保所有值都是数字
      const safeAmount = Number(amount) || 0;
      const safeDiscount = Number(discount) || 0;
      const safeNum = Number(num) || 0;

      this.setData({
        isDisabled: safeNum === 0
      });
    }
  }
});
