import { fetchCartData, updateCartItemData, removeGoodsFromCart, initCartData, addGoodsToCart } from '../../services/cart/cart';
import cartManager from '../../utils/cart-manager';
import Toast from 'tdesign-miniprogram/toast/index';

Page({
  data: {
    isDataReady: false,  // 添加数据就绪标志
    cartList: [],
    cartGroupData: {
      storeGoods: [],
      invalidGoodItems: [],
    },
    isNotEmpty: false,
    selectedGoodsCount: 0,
    totalAmount: 0,
    totalDiscountAmount: 0,
    totalGoodsNum: 0,
    loading: true,
    totalPrice: 0,
    selectedAll: false,
    isAllSelected: false,
    totalCount: 0,
    isLoading: true,
    isEmpty: true,
    hasSelectedItems: false  // 添加是否有选中商品的标志
  },

  // 调用自定义tabbar的init函数，使页面与tabbar激活状态保持一致
  async onShow() {
    await this.refreshCart();
    if (typeof this.getTabBar === 'function') {
      this.getTabBar().init();
    }
  },

  async onLoad() {
    try {
      // 初始化购物车数据，并确保所有商品未选中
      await cartManager.updateAllSelection(false);
      await this.refreshCart();
    } catch (err) {
      console.error('初始化购物车失败:', err);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '加载失败',
        theme: 'error'
      });
    }
  },

  async refreshCart() {
    try {
      this.setData({ loading: true });
      const cartData = await cartManager.getItems();
      
      // 检查选中状态
      const hasSelectedItems = cartData.some(item => item.selected === true);
      const isAllSelected = cartData.length > 0 && cartData.every(item => item.selected === true);
      
      console.log('刷新购物车:', {
        cartData,
        hasSelectedItems,
        isAllSelected,
        cartDataDetails: cartData.map(item => ({
          skuId: item.skuId,
          selected: item.selected,
          price: item.price,
          quantity: item.quantity
        }))
      });
      
      // 更新页面数据
      this.setData({
        cartList: cartData,
        isEmpty: !cartData.length,
        hasSelectedItems,
        isAllSelected,
        selectedAll: isAllSelected,
        loading: false
      });

      // 计算总价和数量
      this.calculateTotal();
    } catch (err) {
      console.error('刷新购物车失败:', err);
      this.setData({ loading: false });
      Toast({
        context: this,
        selector: '#t-toast',
        message: '加载失败',
        theme: 'error'
      });
    }
  },

  async getCartList() {
    try {
      // 重置数据就绪状态
      this.setData({ isDataReady: false });

      const { data } = await fetchCartData();
      console.log('原始数据:', data);
      
      // 转换数据结构以适配页面显示
      const cartGroupData = {
        storeGoods: [{
          storeId: '1',
          storeName: '默认店铺',
          promotionGoodsList: [{
            promotionId: '1',
            promotionName: '默认活动',
            goodsPromotionList: data.map(item => {
              // 直接使用 Number 转换并确保是整数
              const price = Math.floor(Number(item.price) || 0);
              const originPrice = Math.floor(Number(item.originPrice) || 0);
              const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));

              return {
                ...item,
                stockQuantity: 999,
                isSelected: Boolean(item.checked),
                thumb: item.primaryImage || '',
                price,
                originPrice,
                title: item.title || '',
                spuId: item.spuId || '',
                skuId: item.skuId || '',
                quantity,
                specInfo: item.specInfo || [],
                specs: (item.specInfo || []).map(spec => spec.specValue).join(' '),
                primaryImage: item.primaryImage || '',
                available: true,
              };
            })
          }],
          shortageGoodsList: [],
          isSelected: data.every(item => item.checked),
          storeStockShortage: false
        }],
        invalidGoodItems: [],
        isNotEmpty: data.length > 0,
      };

      // 计算数值
      const selectedGoods = data.filter(item => item.checked);
      console.log('选中的商品:', selectedGoods);
      
      // 计算各项总额
      const computedTotalAmount = selectedGoods.reduce((sum, item) => {
        const price = Math.floor(Number(item.price) || 0);
        const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
        return sum + price * quantity;
      }, 0);

      const computedDiscountAmount = selectedGoods.reduce((sum, item) => {
        const originPrice = Math.floor(Number(item.originPrice) || 0);
        const price = Math.floor(Number(item.price) || 0);
        const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
        return sum + Math.max(0, (originPrice - price) * quantity);
      }, 0);

      const computedGoodsNum = data.reduce((sum, item) => {
        return sum + Math.max(1, Math.floor(Number(item.quantity) || 1));
      }, 0);

      // 先设置基础数据
      await this.setData({
        cartList: data,
        cartGroupData,
        isNotEmpty: Boolean(data.length > 0),
        selectedGoodsCount: selectedGoods.length
      });

      // 确保数值是整数
      const finalAmount = Math.floor(computedTotalAmount);
      const finalDiscountAmount = Math.floor(computedDiscountAmount);
      const finalGoodsNum = Math.floor(computedGoodsNum);

      // 设置数值数据并标记数据就绪
      this.setData({
        totalAmount: finalAmount,
        totalDiscountAmount: finalDiscountAmount,
        totalGoodsNum: finalGoodsNum,
        isDataReady: true
      });

      // 更新 tabBar 购物车图标
      if (typeof this.getTabBar === 'function') {
        const tabBar = this.getTabBar();
        if (tabBar) {
          tabBar.setData({
            cartNum: finalGoodsNum
          });
        }
      }

    } catch (err) {
      console.error('获取购物车数据失败:', err);
      // 错误时也要设置数据就绪状态和清空购物车数量
      this.setData({
        cartList: [],
        cartGroupData: {
          storeGoods: [],
          invalidGoodItems: [],
        },
        isNotEmpty: false,
        selectedGoodsCount: 0,
        totalAmount: 0,
        totalDiscountAmount: 0,
        totalGoodsNum: 0,
        isDataReady: true
      });

      // 清空 tabBar 购物车图标
      if (typeof this.getTabBar === 'function') {
        const tabBar = this.getTabBar();
        if (tabBar) {
          tabBar.setData({
            cartNum: 0
          });
        }
      }
      
      Toast({
        context: this,
        selector: '#t-toast',
        message: '获取购物车数据失败，请重试',
        duration: 2000
      });
    }
  },

  refreshData() {
    this.getCartGroupData().then((res) => {
      let isEmpty = true;
      const cartGroupData = res.data;
      // 一些组件中需要的字段可能接口并没有返回，或者返回的数据结构与预期不一致，需要在此先对数据做一些处理
      // 统计门店下加购的商品是否全选、是否存在缺货/无货
      for (const store of cartGroupData.storeGoods) {
        store.isSelected = true; // 该门店已加购商品是否全选
        store.storeStockShortage = false; // 该门店已加购商品是否存在库存不足
        if (!store.shortageGoodsList) {
          store.shortageGoodsList = []; // 该门店已加购商品如果库存为0需单独分组
        }
        for (const activity of store.promotionGoodsList) {
          activity.goodsPromotionList = activity.goodsPromotionList.filter((goods) => {
            goods.originPrice = undefined;

            // 统计是否有加购数大于库存数的商品
            if (goods.quantity > goods.stockQuantity) {
              store.storeStockShortage = true;
            }
            // 统计是否全选
            if (!goods.isSelected) {
              store.isSelected = false;
            }
            // 库存为0（无货）的商品单独分组
            if (goods.stockQuantity > 0) {
              return true;
            }
            store.shortageGoodsList.push(goods);
            return false;
          });

          if (activity.goodsPromotionList.length > 0) {
            isEmpty = false;
          }
        }
        if (store.shortageGoodsList.length > 0) {
          isEmpty = false;
        }
      }
      cartGroupData.invalidGoodItems = cartGroupData.invalidGoodItems.map((goods) => {
        goods.originPrice = undefined;
        return goods;
      });
      cartGroupData.isNotEmpty = !isEmpty;
      this.setData({ cartGroupData });
    });
  },

  findGoods(spuId, skuId) {
    let currentStore;
    let currentActivity;
    let currentGoods;
    const { storeGoods } = this.data.cartGroupData;
    for (const store of storeGoods) {
      for (const activity of store.promotionGoodsList) {
        for (const goods of activity.goodsPromotionList) {
          if (goods.spuId === spuId && goods.skuId === skuId) {
            currentStore = store;
            currentActivity = currentActivity;
            currentGoods = goods;
            return {
              currentStore,
              currentActivity,
              currentGoods,
            };
          }
        }
      }
    }
    return {
      currentStore,
      currentActivity,
      currentGoods,
    };
  },

  // 注：实际场景时应该调用接口获取购物车数据
  getCartGroupData() {
    const { cartGroupData } = this.data;
    if (!cartGroupData) {
      return fetchCartData();
    }
    return Promise.resolve({ data: cartGroupData });
  },

  // 选择单个商品
  async onSelectItem(e) {
    try {
      const isSelected = e.detail.checked;
      const { skuId } = e.currentTarget.dataset;
      console.log('商品选中状态改变:', { skuId, isSelected });
      
      // 更新单个商品的选中状态
      await cartManager.updateItemSelection(skuId, isSelected);
      
      // 刷新购物车数据
      await this.refreshCart();
    } catch (err) {
      console.error('选择商品失败:', err);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '操作失败',
        theme: 'error'
      });
    }
  },

  // 全选/取消全选
  async onSelectAll(e) {
    try {
      const isSelected = e.detail.checked;
      console.log('全选状态改变:', isSelected);
      
      // 更新所有商品的选中状态
      await cartManager.updateAllSelection(isSelected);
      
      // 刷新购物车数据
      await this.refreshCart();
    } catch (err) {
      console.error('全选操作失败:', err);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '操作失败',
        theme: 'error'
      });
    }
  },

  // 修改商品数量
  async onNumChange(e) {
    try {
      const { value } = e.detail;
      const { skuId } = e.currentTarget.dataset;
      
      await cartManager.updateItemQuantity(skuId, value);
      await this.refreshCart();
    } catch (err) {
      console.error('修改商品数量失败:', err);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '修改失败',
        theme: 'error'
      });
    }
  },

  // 删除商品
  async onDeleteItem(e) {
    try {
      const { skuId } = e.currentTarget.dataset;
      
      await cartManager.removeItem(skuId);
      await this.refreshCart();
      
      Toast({
        context: this,
        selector: '#t-toast',
        message: '删除成功',
        theme: 'success'
      });
    } catch (err) {
      console.error('删除商品失败:', err);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '删除失败',
        theme: 'error'
      });
    }
  },

  onGoodsSelect(e) {
    const { goods, isSelected } = e.detail;
    updateCartItemData(goods.skuId, { checked: isSelected })
      .then(() => this.getCartList());
  },

  onStoreSelect(e) {
    const { store, isSelected } = e.detail;
    const { cartList } = this.data;
    
    // 更新该店铺下所有商品的选中状态
    Promise.all(
      cartList.map(item => 
        updateCartItemData(item.skuId, { checked: isSelected })
      )
    ).then(() => this.getCartList());
  },

  onQuantityChange(e) {
    const { goods, quantity } = e.detail;
    updateCartItemData(goods.skuId, { quantity })
      .then(() => {
        this.getCartList();
        // 更新 tabBar 购物车图标
        if (typeof this.getTabBar === 'function') {
          const tabBar = this.getTabBar();
          if (tabBar) {
            tabBar.setData({
              cartNum: this.data.totalGoodsNum
            });
          }
        }
      });
  },

  goCollect() {
    /** 活动肯定有一个活动ID，用来获取活动banner，活动商品列表等 */
    const promotionID = '123';
    wx.navigateTo({
      url: `/pages/promotion-detail/index?promotion_id=${promotionID}`,
    });
  },

  goGoodsDetail(e) {
    const { spuId, storeId } = e.detail.goods;
    wx.navigateTo({
      url: `/pages/goods/details/index?spuId=${spuId}&storeId=${storeId}`,
    });
  },

  clearInvalidGoods() {
    // 实际场景时应该调用接口清空失效商品
    this.clearInvalidGoodsService().then(() => this.refreshData());
  },

  onGoodsDelete(e) {
    const { goods } = e.detail;
    removeGoodsFromCart(goods.skuId)
      .then(() => {
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        });
        this.getCartList();
        // 更新 tabBar 购物车图标
        if (typeof this.getTabBar === 'function') {
          const tabBar = this.getTabBar();
          if (tabBar) {
            tabBar.setData({
              cartNum: Math.max(0, this.data.totalGoodsNum - 1)
            });
          }
        }
      });
  },

  onToSettle() {
    const selectedItems = this.data.cartList.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请选择要结算的商品'
      });
      return;
    }

    wx.navigateTo({
      url: '/pages/order/order-confirm/index',
      success: (res) => {
        res.eventChannel.emit('selectedGoods', selectedItems);
      }
    });
  },

  onGotoHome() {
    wx.switchTab({
      url: '/pages/home/home/index'
    });
  },

  // 清除已结算的商品
  async clearSettledItems(skuIds) {
    try {
      if (!Array.isArray(skuIds) || skuIds.length === 0) {
        console.log('没有需要清除的商品');
        return;
      }

      console.log('准备清除已结算商品:', skuIds);
      let successCount = 0;

      // 移除购物车中的商品
      for (const skuId of skuIds) {
        try {
          await cartManager.removeItem(skuId);
          successCount++;
          console.log(`成功移除商品 ${skuId}, 已完成 ${successCount}/${skuIds.length}`);
        } catch (err) {
          console.error(`移除商品 ${skuId} 失败:`, err);
        }
      }

      // 刷新购物车
      await this.refreshCart();
      console.log('购物车刷新完成');

      // 更新 tabBar 购物车图标
      if (typeof this.getTabBar === 'function') {
        const tabBar = this.getTabBar();
        if (tabBar) {
          const cartData = await cartManager.getItems();
          const totalNum = cartData.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
          tabBar.setData({
            cartNum: totalNum
          });
          console.log('更新购物车图标数量:', totalNum);
        }
      }

      if (successCount > 0) {
        Toast({
          context: this,
          selector: '#t-toast',
          message: `已清除${successCount}件商品`,
          theme: 'success'
        });
      }
    } catch (err) {
      console.error('清除已结算商品失败:', err);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '清除商品失败',
        theme: 'error'
      });
    }
  },

  // 结算
  async onSubmit() {
    const selectedItems = this.data.cartList.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请选择要结算的商品',
        theme: 'warning'
      });
      return;
    }

    try {
      // 将选中的商品信息编码并传递给订单确认页
      const goodsRequestList = selectedItems.map(item => ({
        skuId: item.skuId,
        spuId: item.spuId,
        quantity: item.quantity,
        price: item.price,
        primaryImage: item.primaryImage,
        title: item.title,
        specInfo: item.specInfo || [],
        specs: item.specs
      }));

      const encodedGoodsList = encodeURIComponent(JSON.stringify(goodsRequestList));

      // 保存要结算的商品SKU ID列表，用于后续清除
      const skuIdsToSettle = selectedItems.map(item => item.skuId);
      wx.setStorageSync('pendingSettleSkuIds', skuIdsToSettle);

      wx.navigateTo({
        url: `/pages/order/order-confirm/index?goodsRequestList=${encodedGoodsList}`,
        fail: (err) => {
          console.error('跳转订单确认页失败:', err);
          Toast({
            context: this,
            selector: '#t-toast',
            message: '跳转失败',
            theme: 'error'
          });
        }
      });
    } catch (err) {
      console.error('结算失败:', err);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '结算失败',
        theme: 'error'
      });
    }
  },

  // 计算总价和总数量
  calculateTotal() {
    try {
      const { cartList } = this.data;
      let totalPrice = 0;
      let totalCount = 0;
      let selectedCount = 0;

      cartList.forEach(item => {
        if (item.selected) {  // 简化判断条件
          const price = parseInt(item.price) || 0;
          const quantity = Math.max(1, parseInt(item.quantity) || 1);
          totalPrice += price * quantity;
          totalCount += quantity;
          selectedCount++;
        }
      });

      const hasSelectedItems = selectedCount > 0;
      const isAllSelected = cartList.length > 0 && selectedCount === cartList.length;

      console.log('计算总价:', {
        totalPrice,
        totalCount,
        hasSelectedItems,
        selectedCount,
        total: cartList.length,
        isAllSelected,
        cartListDetails: cartList.map(item => ({
          skuId: item.skuId,
          selected: item.selected,
          price: item.price,
          quantity: item.quantity
        }))
      });

      this.setData({
        totalPrice,
        totalCount,
        hasSelectedItems,
        selectedGoodsCount: selectedCount,
        isAllSelected,
        selectedAll: isAllSelected,
        totalAmount: totalPrice
      });
    } catch (err) {
      console.error('计算总价失败:', err);
      this.setData({
        totalPrice: 0,
        totalCount: 0,
        hasSelectedItems: false,
        selectedGoodsCount: 0,
        isAllSelected: false,
        selectedAll: false,
        totalAmount: 0
      });
    }
  },

  // 检查是否全选
  checkSelectedAll() {
    const { cartList } = this.data;
    const isAllSelected = cartList.length > 0 && cartList.every(item => item.selected);
    this.setData({ isAllSelected });
  },

  // 清空失效商品
  // 注：实际场景时应该调用接口
  clearInvalidGoodsService() {
    this.data.cartGroupData.invalidGoodItems = [];
    return Promise.resolve();
  },
});
