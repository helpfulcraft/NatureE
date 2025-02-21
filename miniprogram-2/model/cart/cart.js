let cartItems = [];  // 用于存储购物车数据

export function getCartItems() {
  return cartItems;
}

export function addToCart(item) {
  const existingItem = cartItems.find(
    cartItem => cartItem.spuId === item.spuId && cartItem.skuId === item.skuId
  );

  if (existingItem) {
    existingItem.quantity += item.quantity || 1;
  } else {
    cartItems.push({
      ...item,
      quantity: item.quantity || 1,
      checked: false,  // 默认不选中
      // 确保价格字段存在
      price: item.price || 0,
      originPrice: item.originPrice || 0,
      tagPrice: item.tagPrice || item.price || 0,
      settlePrice: item.settlePrice || item.price || 0,
    });
  }

  // 可以添加本地存储
  wx.setStorageSync('cartItems', cartItems);
  return cartItems;
}

export function removeFromCart(skuId) {
  cartItems = cartItems.filter(item => item.skuId !== skuId);
  wx.setStorageSync('cartItems', cartItems);
  return cartItems;
}

export function updateCartItem(skuId, updates) {
  const item = cartItems.find(item => item.skuId === skuId);
  if (item) {
    Object.assign(item, updates);
    wx.setStorageSync('cartItems', cartItems);
  }
  return cartItems;
}

export function clearCart() {
  cartItems = [];
  wx.setStorageSync('cartItems', cartItems);
  return cartItems;
}

// 初始化时从本地存储加载
export function initCart() {
  const savedItems = wx.getStorageSync('cartItems');
  if (savedItems) {
    cartItems = savedItems;
  }
  return cartItems;
} 