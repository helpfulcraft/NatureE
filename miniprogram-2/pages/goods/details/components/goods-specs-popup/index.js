/* eslint-disable no-param-reassign */
/* eslint-disable no-nested-ternary */
import Toast from 'tdesign-miniprogram/toast/index';

Component({
  options: {
    multipleSlots: true,
    addGlobalClass: true,
  },

  properties: {
    src: {
      type: String,
    },
    title: String,
    show: {
      type: Boolean,
      value: false,
    },
    limitBuyInfo: {
      type: String,
      value: '',
    },
    isStock: {
      type: Boolean,
      value: true,
    },
    limitMaxCount: {
      type: Number,
      value: 999,
    },
    limitMinCount: {
      type: Number,
      value: 1,
    },
    buyNum: {
      type: Number,
      value: 1
    },
    skuList: {
      type: Array,
      value: [],
      observer(skuList) {
        if (skuList && skuList.length > 0) {
          if (this.initStatus) {
            this.initData();
          }
        }
      },
    },
    specList: {
      type: Array,
      value: [],
      observer(specList) {
        if (specList && specList.length > 0) {
          this.initData();
        }
      },
    },
    outOperateStatus: {
      type: Boolean,
      value: false,
    },
    hasAuth: {
      type: Boolean,
      value: false,
    },
    count: {
      type: Number,
      value: 1,
      observer(count) {
        this.setData({
          buyNum: count,
        });
      },
    },
    goods: {
      type: Object,
      observer(goods) {
        if (!goods) return;
        this.initSpecsData(goods);
      }
    },
  },

  initStatus: false,
  selectedSku: {},
  selectSpecObj: {},

  data: {
    _buyNum: 1,  // 内部使用的购买数量
    isAllSelectedSku: false,
    currentSku: null,
    selectedSpecValues: [],
    maxBuyNum: 999,  // 最大购买数量
    minBuyNum: 1,    // 最小购买数量
    stockNum: 0,      // 当前SKU库存
    selectedSpecs: {},
    stockInfo: {
      stock: 0,
      available: false,
      message: ''
    }
  },

  lifetimes: {
    attached() {
      // 初始化内部购买数量
      this.setData({
        _buyNum: this.properties.buyNum || 1
      });
    }
  },

  methods: {
    initData() {
      this.initStatus = true;
      const { specList } = this.properties;
      const selectedSku = {};

      specList.forEach((item) => {
        selectedSku[item.specId] = '';
      });

      this.setData({
        selectedSku,
        isAllSelectedSku: false,
        currentSku: null,
        selectedSpecValues: []
      });
    },

    checkSkuStockQuantity(specValueId, skuList) {
      // 找到包含该规格值的所有 SKU
      const matchingSKUs = skuList.filter(sku => 
        sku.specInfo.some(spec => spec.specValueId === specValueId)
      );

      // 计算总库存
      const stockQuantity = matchingSKUs.reduce((total, sku) => 
        total + (sku.stockInfo?.stockQuantity || sku.stock || 0), 0
      );

      return {
        stockQuantity,
        isStock: stockQuantity > 0,
        hasStock: stockQuantity > 0,
        specsArray: matchingSKUs.map(sku => 
          sku.specInfo.map(spec => spec.specValueId)
        )
      };
    },

    chooseSpecValueId(specValueId, specId) {
      const { selectSpecObj } = this;
      const { skuList, specList } = this.properties;
      if (selectSpecObj[specId]) {
        selectSpecObj[specId] = [];
        this.selectSpecObj = selectSpecObj;
      } else {
        selectSpecObj[specId] = [];
      }

      const itemAllSpecArray = [];
      const itemUnSelectArray = [];
      const itemSelectArray = [];
      specList.forEach((item) => {
        if (item.specId === specId) {
          const subSpecValueItem = item.specValueList.find((subItem) => subItem.specValueId === specValueId);
          let specSelectStatus = false;
          item.specValueList.forEach((n) => {
            itemAllSpecArray.push(n.hasStockObj.specsArray);
            if (n.isSelected) {
              specSelectStatus = true;
            }
            if (n.hasStockObj.hasStock) {
              itemSelectArray.push(n.specValueId);
            } else {
              itemUnSelectArray.push(n.specValueId);
            }
          });
          if (specSelectStatus) {
            selectSpecObj[specId] = this.flatten(subSpecValueItem?.hasStockObj.specsArray.concat(itemSelectArray));
          } else {
            const subSet = function (arr1, arr2) {
              const set2 = new Set(arr2);
              const subset = [];
              arr1.forEach((val) => {
                if (!set2.has(val)) {
                  subset.push(val);
                }
              });
              return subset;
            };
            selectSpecObj[specId] = subSet(this.flatten(itemAllSpecArray), this.flatten(itemUnSelectArray));
          }
        } else {
          // 未点击规格的逻辑
          const itemSelectArray = [];
          let specSelectStatus = false;
          item.specValueList.map(
            // 找到有库存的规格数组
            (n) => {
              itemSelectArray.push(n.hasStockObj.specsArray);
              if (n.isSelected) {
                specSelectStatus = true;
              }
              n.hasStockObj.hasStock = true;
              return n;
            },
          );
          if (specSelectStatus) {
            selectSpecObj[item.specId] = this.flatten(itemSelectArray);
          } else {
            delete selectSpecObj[item.specId];
          }
        }
        this.selectSpecObj = selectSpecObj;
      });
      const combatArray = Object.values(selectSpecObj);
      if (combatArray.length > 0) {
        const showArray = combatArray.reduce((x, y) => this.getIntersection(x, y));
        const lastResult = Array.from(new Set(showArray));
        specList.forEach((item) => {
          item.specValueList.forEach((subItem) => {
            if (lastResult.includes(subItem.specValueId)) {
              subItem.hasStockObj.hasStock = true;
            } else {
              subItem.hasStockObj.hasStock = false;
            }
          });
        });
      } else {
        specList.forEach((item) => {
          if (item.specValueList.length > 0) {
            item.specValueList.forEach((subItem) => {
              const obj = this.checkSkuStockQuantity(subItem.specValueId, skuList);
              subItem.hasStockObj = obj;
            });
          }
        });
      }
      this.setData({
        specList,
      });
    },

    flatten(input) {
      const stack = [...input];
      const res = [];
      while (stack.length) {
        const next = stack.pop();
        if (Array.isArray(next)) {
          stack.push(...next);
        } else {
          res.push(next);
        }
      }
      return res.reverse();
    },

    getIntersection(array, nextArray) {
      return array.filter((item) => nextArray.includes(item));
    },

    toChooseItem(e) {
      const { specid: specId, id, hasstock } = e.currentTarget.dataset;
      if (!hasstock) {
        wx.showToast({
          title: '该规格已售罄',
          icon: 'none'
        });
        return;
      }

      const { selectedSku } = this.data;
      const { specList, skuList } = this.properties;

      selectedSku[specId] = selectedSku[specId] === id ? '' : id;

      const selectedSpecValues = [];
      specList.forEach(spec => {
        const selectedValue = spec.specValueList.find(
          value => value.specValueId === selectedSku[spec.specId]
        );
        if (selectedValue) {
          selectedSpecValues.push({
            specId: spec.specId,
            specName: spec.title,
            specValueId: selectedValue.specValueId,
            specValue: selectedValue.specValue
          });
        }
      });

      let currentSku = null;
      if (this.isAllSelected(specList, selectedSku)) {
        currentSku = skuList.find(sku => {
          return sku.specInfo.every(spec => 
            selectedSku[spec.specId] === spec.specValueId
          );
        });
      }

      this.setData({
        selectedSku,
        selectedSpecValues,
        currentSku,
        isAllSelectedSku: this.isAllSelected(specList, selectedSku),
      });

      // 选择规格后更新库存信息
      this.updateStockInfo();

      this.triggerEvent('change', {
        specList,
        selectedSku,
        currentSku,
        selectedSpecValues,
        isAllSelectedSku: this.data.isAllSelectedSku,
      });
    },

    isAllSelected(skuTree, selectedSku) {
      const selected = Object.keys(selectedSku).filter((skuKeyStr) => selectedSku[skuKeyStr] !== '');
      return skuTree.length === selected.length;
    },

    handlePopupHide() {
      this.triggerEvent('closeSpecsPopup', {
        show: false,
      });
    },

    specsConfirm() {
      const { isStock } = this.properties;
      if (!isStock) return;
      this.triggerEvent('specsConfirm');
    },

    addCart() {
      const { isStock, title } = this.properties;
      const { currentSku, _buyNum, isAllSelectedSku, selectedSpecValues } = this.data;
      
      try {
        // 检查库存状态
        if (!isStock) {
          wx.showToast({
            title: '商品已售罄',
            icon: 'error'
          });
          return;
        }
        
        // 检查是否选择完整规格
        if (!isAllSelectedSku) {
          wx.showToast({
            title: '请选择完整规格',
            icon: 'none'
          });
          return;
        }
        
        // 检查SKU是否有效
        if (!currentSku) {
          wx.showToast({
            title: '商品规格无效',
            icon: 'error'
          });
          return;
        }
        
        // 构建购物车商品数据
        const cartData = {
          spuId: currentSku.spuId,
          skuId: currentSku.skuId,
          title,
          price: currentSku.price,
          originPrice: currentSku.originPrice,
          quantity: _buyNum,
          specs: selectedSpecValues.map(spec => spec.specValue).join(' '),
          primaryImage: this.properties.src,
          stockQuantity: currentSku.stockInfo?.stockQuantity || 0
        };
        
        // 触发加入购物车事件
        this.triggerEvent('addCart', {
          ...cartData,
          success: () => {
            wx.showToast({
              title: '已加入购物车',
              icon: 'success'
            });
            // 关闭弹窗
            this.handlePopupHide();
          },
          fail: (err) => {
            wx.showToast({
              title: err.message || '加入购物车失败',
              icon: 'error'
            });
          }
        });
      } catch (err) {
        console.error('加入购物车失败:', err);
        wx.showToast({
          title: '操作失败',
          icon: 'error'
        });
      }
    },

    buyNow() {
      const { isStock, title } = this.properties;
      const { currentSku, _buyNum, isAllSelectedSku, selectedSpecValues } = this.data;
      
      try {
        // 检查库存状态
        if (!isStock) {
          wx.showToast({
            title: '商品已售罄',
            icon: 'error'
          });
          return;
        }
        
        // 检查是否选择完整规格
        if (!isAllSelectedSku) {
          wx.showToast({
            title: '请选择完整规格',
            icon: 'none'
          });
          return;
        }
        
        // 检查SKU是否有效
        if (!currentSku) {
          wx.showToast({
            title: '商品规格无效',
            icon: 'error'
          });
          return;
        }
        
        // 构建订单商品数据
        const orderData = {
          spuId: currentSku.spuId,
          skuId: currentSku.skuId,
          title,
          price: currentSku.price,
          originPrice: currentSku.originPrice,
          quantity: _buyNum,
          specs: selectedSpecValues.map(spec => spec.specValue).join(' '),
          primaryImage: this.properties.src,
          stockQuantity: currentSku.stockInfo?.stockQuantity || 0,
          settlePrice: currentSku.price, // 结算价格
          tagPrice: currentSku.originPrice // 标签价格
        };
        
        // 触发立即购买事件
        this.triggerEvent('buyNow', {
          ...orderData,
          success: () => {
            // 关闭弹窗
            this.handlePopupHide();
            
            // 跳转到订单确认页
            const query = encodeURIComponent(JSON.stringify([orderData]));
            wx.navigateTo({
              url: `/pages/order/order-confirm/index?goodsRequestList=${query}`,
              fail: (err) => {
                console.error('跳转订单确认页失败:', err);
                wx.showToast({
                  title: '跳转失败',
                  icon: 'error'
                });
              }
            });
          },
          fail: (err) => {
            wx.showToast({
              title: err.message || '购买失败',
              icon: 'error'
            });
          }
        });
      } catch (err) {
        console.error('立即购买失败:', err);
        wx.showToast({
          title: '操作失败',
          icon: 'error'
        });
      }
    },

    handleBuyNumChange(e) {
      const { value } = e.detail;
      
      // 更新内部数量
      this.setData({
        _buyNum: value
      });

      // 触发外部事件
      this.triggerEvent('numberChange', {
        buyNum: value
      });
    },

    updateStockInfo() {
      const { currentSku } = this.data;
      const { limitMaxCount = 999, limitMinCount = 1 } = this.properties;
      
      // 获取当前SKU库存
      const stockNum = currentSku ? 
        (currentSku.stockInfo?.stockQuantity || currentSku.stock || 0) : 0;
      
      // 计算最大可购买数量（库存和限购取较小值）
      const maxBuyNum = Math.min(stockNum, limitMaxCount);
      
      this.setData({
        stockNum,
        maxBuyNum,
        minBuyNum: limitMinCount,
        // 如果当前购买数量超出范围，自动调整
        _buyNum: Math.min(Math.max(this.data._buyNum, limitMinCount), maxBuyNum)
      });
    },

    initSpecsData(goods) {
      const { specList = [], skuList = [] } = goods;
      
      // 处理规格数据
      const processedSpecList = specList.map(spec => ({
        ...spec,
        specValueList: spec.specValueList.map(value => ({
          ...value,
          disabled: !this.isValueAvailable(value.specValueId, skuList),
          selected: false
        }))
      }));

      this.setData({
        specList: processedSpecList,
        stockNum: goods.stockInfo?.stockQuantity || 0
      });

      this.updateStockInfo();
    },

    // 检查规格值是否可选
    isValueAvailable(specValueId, skuList) {
      return skuList.some(sku => 
        sku.specInfo.some(spec => 
          spec.specValueId === specValueId && 
          sku.stockInfo?.stockQuantity > 0
        )
      );
    },

    // 选择规格
    onSpecSelect(e) {
      const { specId, valueId } = e.currentTarget.dataset;
      
      // 更新选中状态
      const { selectedSpecs } = this.data;
      selectedSpecs[specId] = valueId;

      // 查找匹配的SKU
      const currentSku = this.findMatchedSku(selectedSpecs);
      
      this.setData({ 
        selectedSpecs,
        currentSku
      });

      this.updateStockInfo();
      this.triggerEvent('specchange', { selectedSpecs, currentSku });
    },

    // 查找匹配的SKU
    findMatchedSku(selectedSpecs) {
      const { skuList = [] } = this.properties.goods;
      
      return skuList.find(sku => 
        sku.specInfo.every(spec => 
          selectedSpecs[spec.specId] === spec.specValueId
        )
      );
    },

    // 获取已选规格文本
    getSelectedSpecText() {
      const { selectedSpecs, specList } = this.data;
      const selectedValues = [];
      
      specList.forEach(spec => {
        const selectedValue = spec.specValueList.find(
          value => value.specValueId === selectedSpecs[spec.specId]
        );
        if (selectedValue) {
          selectedValues.push(selectedValue.specValue);
        }
      });
      
      return selectedValues.length ? selectedValues.join('，') : '请选择规格';
    },

    // 检查是否已选择所有规格
    checkAllSelected() {
      const { selectedSpecs, specList } = this.data;
      return specList.every(spec => selectedSpecs[spec.specId]);
    },

    // 重置选择
    resetSelection() {
      this.setData({
        selectedSpecs: {},
        currentSku: null,
        _buyNum: this.data.minBuyNum
      });
      this.updateStockInfo();
    },

    // 确认选择
    onConfirm() {
      if (!this.checkAllSelected()) {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '请选择完整规格'
        });
        return;
      }

      const { currentSku, _buyNum } = this.data;
      if (!currentSku) {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '商品已售罄'
        });
        return;
      }

      this.triggerEvent('confirm', {
        sku: currentSku,
        buyNum: _buyNum,
        selectedSpecs: this.data.selectedSpecs,
        specText: this.getSelectedSpecText()
      });

      this.handlePopupHide();
    },

    // 更新规格状态
    updateSpecStatus() {
      const { specList, selectedSpecs } = this.data;
      const { skuList = [] } = this.properties.goods;
      
      // 更新每个规格值的状态
      const updatedSpecList = specList.map(spec => ({
        ...spec,
        specValueList: spec.specValueList.map(value => ({
          ...value,
          selected: selectedSpecs[spec.specId] === value.specValueId,
          disabled: !this.isValueAvailable(value.specValueId, skuList)
        }))
      }));

      this.setData({ 
        specList: updatedSpecList,
        isAllSelectedSku: this.checkAllSelected()
      });
    },

    // 监听数量变化
    onNumberChange(e) {
      const { value } = e.detail;
      
      // 数量边界检查
      if (value < this.data.minBuyNum || value > this.data.maxBuyNum) {
        return;
      }

      this.setData({ _buyNum: value });
      this.triggerEvent('numberchange', { buyNum: value });
    }
  },
});
