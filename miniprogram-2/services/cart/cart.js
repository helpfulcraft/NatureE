import { config } from '../../config/index';
import { getCartItems, addToCart, removeFromCart, updateCartItem, clearCart, initCart } from '../../model/cart/cart';
import cartManager from '../../utils/cart-manager';

/** 获取购物车mock数据 */
function mockFetchCartGroupData(params) {
  const { delay } = require('../_utils/delay');
  const { genCartGroupData } = require('../../model/cart');

  return delay().then(() => genCartGroupData(params));
}

/** 获取购物车数据 */
export function fetchCartGroupData(params) {
  if (config.useMock) {
    return mockFetchCartGroupData(params);
  }

  return new Promise((resolve) => {
    resolve('real api');
  });
}

export async function fetchCartData() {
  return {
    data: await cartManager.getItems()
  };
}

export async function addGoodsToCart(goodsInfo) {
  // 确保数量是有效的数字
  const quantity = Math.max(1, parseInt(goodsInfo.quantity) || 1);
  
  // 从goodsInfo中移除quantity，因为它会作为第二个参数传递
  const { quantity: _, ...restInfo } = goodsInfo;
  
  await cartManager.addItem(restInfo, quantity);
  return {
    data: await cartManager.getItems()
  };
}

export async function removeGoodsFromCart(skuId) {
  await cartManager.removeItem(skuId);
  return {
    data: await cartManager.getItems()
  };
}

export async function updateCartItemData(skuId, updates) {
  if (updates.quantity) {
    await cartManager.updateQuantity(skuId, updates.quantity);
  }
  if (typeof updates.selected === 'boolean') {
    await cartManager.toggleSelect(skuId, updates.selected);
  }
  return {
    data: await cartManager.getItems()
  };
}

export async function clearCartData() {
  return {
    data: clearCart()
  };
}

export async function initCartData() {
  return {
    data: await cartManager.getItems()
  };
}
