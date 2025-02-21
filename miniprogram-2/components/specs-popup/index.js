Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    goods: {
      type: Object,
      value: null,
      observer(newVal) {
        if (newVal) {
          console.log('商品数据更新:', newVal);
          this.initSpecsData(newVal);
        }
      }
    },
    quantity: {
      type: Number,
      value: 1
    }
  },

  data: {
    specs: [],
    selectedSpecs: {},
    currentSku: null,
    maxBuyNum: 999,
    minBuyNum: 1,
    buyNum: 1,
    isAllSelected: false,
    currentPrice: 0,
    currentStock: 0,
    selectedSpecsText: '',
    skuList: []
  },

  methods: {
    // 初始化规格数据
    initSpecsData(goods) {
      console.log('初始化规格数据:', goods);
      if (!goods || !goods.specs) {
        console.error('商品数据无效');
        return;
      }
      
      // 处理规格数据，添加选择状态
      const specs = goods.specs.map(spec => ({
        ...spec,
        values: spec.values.map(value => ({
          ...value,
          disabled: this._checkValueDisabled(value.name, spec.name, {}, goods.skuList),
          selected: false
        }))
      }));

      this.setData({ 
        specs,
        skuList: goods.skuList || [],
        currentPrice: goods.price,
        currentStock: this._getTotalStock(goods.skuList),
        buyNum: 1,
        selectedSpecs: {},
        isAllSelected: false,
        currentSku: null,
        selectedSpecsText: ''
      });
    },

    // 检查规格值是否禁用
    _checkValueDisabled(value, specName, selectedSpecs, skuList) {
      const tempSelected = { ...selectedSpecs };
      tempSelected[specName] = value;

      // 检查是否有可用的SKU
      return !skuList.some(sku => {
        const isMatch = sku.specInfo.every(spec => 
          !tempSelected[spec.name] || tempSelected[spec.name] === spec.value
        );
        return isMatch && sku.stock > 0;
      });
    },

    // 获取总库存
    _getTotalStock(skuList = []) {
      return skuList.reduce((total, sku) => total + (sku.stock || 0), 0);
    },

    // 选择规格
    onSelectSpec(e) {
      console.log('选择规格:', e.currentTarget.dataset);
      const { specIndex, valueIndex } = e.currentTarget.dataset;
      const { specs, selectedSpecs, skuList } = this.data;
      
      // 更新选中状态
      const newSpecs = [...specs];
      const currentSpec = newSpecs[specIndex];
      
      // 如果点击的是已禁用的规格，直接返回
      if (currentSpec.values[valueIndex].disabled) {
        console.log('规格已禁用');
        return;
      }

      // 切换选中状态
      currentSpec.values = currentSpec.values.map((value, idx) => ({
        ...value,
        selected: idx === valueIndex
      }));

      // 更新已选规格
      const newSelectedSpecs = { ...selectedSpecs };
      newSelectedSpecs[currentSpec.name] = currentSpec.values[valueIndex].name;

      // 检查是否已选择所有规格
      const isAllSelected = newSpecs.every(spec => 
        spec.values.some(value => value.selected)
      );

      console.log('已选规格:', newSelectedSpecs, '是否已选完:', isAllSelected);

      // 查找匹配的SKU
      const matchingSku = isAllSelected ? this._findMatchingSku(newSelectedSpecs) : null;
      console.log('匹配的SKU:', matchingSku);

      this.setData({ 
        specs: newSpecs,
        selectedSpecs: newSelectedSpecs,
        isAllSelected,
        currentSku: matchingSku,
        currentPrice: matchingSku ? matchingSku.price : this.properties.goods.price,
        currentStock: matchingSku ? matchingSku.stock : this._getTotalStock(skuList),
        selectedSpecsText: this._getSelectedSpecsText(newSelectedSpecs)
      });
    },

    // 查找匹配的SKU
    _findMatchingSku(selectedSpecs) {
      return this.data.skuList.find(sku => 
        sku.specInfo.every(spec => 
          selectedSpecs[spec.name] === spec.value
        )
      );
    },

    // 获取已选规格文本
    _getSelectedSpecsText(selectedSpecs) {
      return Object.entries(selectedSpecs)
        .map(([name, value]) => `${name}：${value}`)
        .join('，');
    },

    // 修改购买数量
    onQuantityChange(e) {
      console.log('修改数量:', e.currentTarget.dataset);
      const { type } = e.currentTarget.dataset;
      let { buyNum, maxBuyNum, minBuyNum } = this.data;
      
      if (type === 'minus' && buyNum > minBuyNum) {
        buyNum--;
      } else if (type === 'plus' && buyNum < maxBuyNum) {
        buyNum++;
      }
      
      this.setData({ buyNum });
      this.triggerEvent('quantityChange', { buyNum });
    },

    // 确认选择
    onConfirm() {
      console.log('确认选择');
      const { isAllSelected, selectedSpecs, currentSku, buyNum } = this.data;

      if (!isAllSelected) {
        wx.showToast({
          title: '请选择完整规格',
          icon: 'none'
        });
        return;
      }

      if (!currentSku) {
        wx.showToast({
          title: '商品规格无效',
          icon: 'none'
        });
        return;
      }

      if (buyNum > currentSku.stock) {
        wx.showToast({
          title: '库存不足',
          icon: 'none'
        });
        return;
      }

      const result = {
        selectedSpecs,
        quantity: buyNum,
        price: currentSku.price,
        skuId: currentSku.skuId,
        stock: currentSku.stock,
        specText: this._getSelectedSpecsText(selectedSpecs)
      };
      
      console.log('触发确认事件:', result);
      this.triggerEvent('confirm', result);
      this.triggerEvent('close');
    },

    // 关闭弹窗
    onClose() {
      console.log('关闭弹窗');
      this.triggerEvent('close');
    }
  }
}); 