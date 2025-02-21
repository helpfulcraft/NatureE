import loading from './loading-manager';

class CartManager {
  constructor() {
    this._key = 'CART_DATA';
    this._cache = null;
  }

  // 获取购物车数据
  async getItems() {
    if (!this._cache) {
      const data = wx.getStorageSync(this._key) || [];
      // 保持原有选中状态
      this._cache = data.map(item => ({
        ...item,
        selected: Boolean(item.selected)  // 只确保选中状态为布尔值
      }));
      await this._save(this._cache);
    }
    return this._cache;
  }

  // 获取选中的商品
  async getSelectedItems() {
    try {
      const cartItems = await this.getItems();
      return cartItems.filter(item => item.selected);
    } catch (err) {
      console.error('获取选中商品失败:', err);
      throw err;
    }
  }

  // 保存数据
  async _save(items) {
    try {
      // 确保所有项的选中状态都是布尔值
      const normalizedItems = items.map(item => ({
        ...item,
        selected: Boolean(item.selected)
      }));
      
      this._cache = normalizedItems;
      await wx.setStorageSync(this._key, normalizedItems);
      
      console.log('保存购物车数据:', {
        items: normalizedItems.map(item => ({
          skuId: item.skuId,
          selected: item.selected
        }))
      });
    } catch (err) {
      console.error('保存购物车数据失败:', err);
      throw err;
    }
  }

  // 添加商品
  async addItem(item, quantity = 1) {
    return loading.wrap(async () => {
      const items = await this.getItems();
      const index = items.findIndex(i => i.skuId === item.skuId);
      
      // 确保数量为正整数
      const safeQuantity = Math.max(1, parseInt(quantity) || 1);
      
      if (index > -1) {
        // 确保现有数量是有效的数字
        const currentQuantity = Math.max(1, parseInt(items[index].quantity) || 1);
        items[index].quantity = currentQuantity + safeQuantity;
      } else {
        items.push({ 
          ...item, 
          quantity: safeQuantity, 
          selected: false, // 新添加的商品默认不选中
          price: parseInt(item.price) || 0 // 确保价格为整数
        });
      }

      await this._save(items);
      await this._syncTabBar();
    }, { message: '添加中...' });
  }

  // 更新数量
  async updateItemQuantity(skuId, quantity) {
    return loading.wrap(async () => {
      const items = await this.getItems();
      const index = items.findIndex(i => i.skuId === skuId);
      
      // 确保数量为正整数
      const safeQuantity = Math.max(1, parseInt(quantity) || 1);
      
      if (index > -1) {
        items[index].quantity = safeQuantity;
        await this._save(items);
        await this._syncTabBar();
      }
    }, { message: '更新中...' });
  }

  // 删除商品
  async removeItem(skuId) {
    try {
      let cartItems = await this.getItems();
      cartItems = cartItems.filter(item => item.skuId !== skuId);
      this._cache = cartItems;  // 更新缓存
      await wx.setStorageSync(this._key, cartItems);
      console.log(`商品 ${skuId} 已从购物车中移除`);
      return true;
    } catch (err) {
      console.error(`移除商品 ${skuId} 失败:`, err);
      throw err;
    }
  }

  // 清空购物车
  async clearCart() {
    try {
      this._cache = [];  // 清空缓存
      await wx.setStorageSync(this._key, []);
      console.log('购物车已清空');
      return true;
    } catch (err) {
      console.error('清空购物车失败:', err);
      throw err;
    }
  }

  // 更新商品选中状态
  async updateItemSelection(skuId, selected) {
    try {
      const items = await this.getItems();
      const index = items.findIndex(i => i.skuId === skuId);
      
      if (index > -1) {
        items[index].selected = Boolean(selected);
        
        console.log('更新商品选中状态:', {
          skuId,
          selected: items[index].selected,
          item: items[index]
        });
        
        await this._save(items);
        await this._syncTabBar();
      }
    } catch (err) {
      console.error('更新商品选中状态失败:', err);
      throw err;
    }
  }

  // 更新全选状态
  async updateAllSelection(selected) {
    try {
      const items = await this.getItems();
      this._cache = items.map(item => ({
        ...item,
        selected: Boolean(selected)
      }));
      
      console.log('更新全选状态:', {
        selected,
        items: this._cache.map(item => ({
          skuId: item.skuId,
          selected: item.selected
        }))
      });
      
      await this._save(this._cache);
      await this._syncTabBar();
    } catch (err) {
      console.error('更新全选状态失败:', err);
      throw err;
    }
  }

  // 获取选中商品总数量
  async getTotalCount() {
    const items = await this.getItems();
    return items
      .filter(item => item.selected)
      .reduce((sum, item) => {
        const quantity = Math.max(1, parseInt(item.quantity) || 1);
        return sum + quantity;
      }, 0);
  }

  // 获取选中商品总价
  async getTotalPrice() {
    const items = await this.getItems();
    return items
      .filter(item => item.selected)
      .reduce((sum, item) => {
        const price = parseInt(item.price) || 0;
        const quantity = Math.max(1, parseInt(item.quantity) || 1);
        return sum + price * quantity;
      }, 0);
  }

  // 同步 TabBar 购物车数量
  async _syncTabBar() {
    const count = await this.getTotalCount();
    const pages = getCurrentPages();
    const page = pages[pages.length - 1];
    
    if (page && typeof page.getTabBar === 'function') {
      const tabBar = page.getTabBar();
      if (tabBar) {
        tabBar.setData({ 
          cartNum: Math.max(0, parseInt(count) || 0)
        });
      }
    }
  }
}

export const cartManager = new CartManager();
export default cartManager; 