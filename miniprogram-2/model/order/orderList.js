import { config } from '../../config/index';

// 示例商品数据
const mockGoodsList = [
  {
    title: '民族服饰',
    price: 4990,
    primaryImage: 'https://tse3-mm.cn.bing.net/th/id/OIP-C.SPYMlCcMXn6atWcDeMDOcwHaKt?rs=1&pid=ImgDetMain',
    specs: ['白色', 'M码']
  }
];

// 订单状态枚举
export const OrderStatus = {
  PENDING_PAYMENT: 1,   // 待付款
  PENDING_DELIVERY: 2,  // 待发货
  PENDING_RECEIPT: 3,   // 待收货
  PENDING_COMMENT: 4,   // 待评价
  COMPLETED: 5,         // 已完成
  CANCELLED: 6         // 已取消
};

// 存储所有订单
let orders = [];

// 生成测试数据
const generateTestOrders = () => {
  const testOrders = [];
  const statuses = [
    OrderStatus.PENDING_PAYMENT,
    OrderStatus.PENDING_DELIVERY,
    OrderStatus.PENDING_RECEIPT,
    OrderStatus.PENDING_COMMENT
  ];

  // 为每个状态创建2个测试订单
  statuses.forEach(status => {
    for (let i = 0; i < 2; i++) {
      testOrders.push({
        orderId: `test_order_${status}_${i}`,
        orderNo: `NO${Date.now()}${Math.floor(Math.random() * 1000)}`,
        status,
        createTime: new Date().toISOString(),
        totalAmount: 4990 + i * 1000, // 不同价格
        goodsList: [{
          id: `goods_${i}`,
          title: `民族服饰 ${i + 1}`,
          price: 4990,
          num: 1,
          primaryImage: 'https://tse3-mm.cn.bing.net/th/id/OIP-C.SPYMlCcMXn6atWcDeMDOcwHaKt?rs=1&pid=ImgDetMain',
          specs: ['白色', 'M码']
        }]
      });
    }
  });

  return testOrders;
};

// 生成订单号
const generateOrderNo = () => {
  return `NO${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

// 创建新订单
export const createOrder = (goodsList, totalAmount) => {
  const order = {
    orderId: `order_${Date.now()}`,
    orderNo: generateOrderNo(),
    status: OrderStatus.PENDING_PAYMENT,
    createTime: new Date().toISOString(),
    totalAmount,
    goodsList: goodsList.map(goods => ({
      id: goods.id || goods.spuId,
      title: goods.title,
      price: goods.price,
      num: goods.quantity || 1,
      thumb: goods.primaryImage || goods.thumb,
      specs: goods.specs || []
    }))
  };

  // 添加到订单列表
  orders.unshift(order);
  
  // 保存到本地存储
  try {
    const savedOrders = wx.getStorageSync('orders') || [];
    savedOrders.unshift(order);
    wx.setStorageSync('orders', savedOrders);
  } catch (err) {
    console.error('保存订单到本地存储失败:', err);
  }

  return order;
};

// 添加新订单
export const addNewOrder = (orderData) => {
  console.log('[Model] 添加新订单, 输入数据:', orderData);
  
  // 确保订单数据格式正确
  const order = {
    // 基本信息
    orderId: orderData.orderId || `order_${Date.now()}`,
    orderNo: orderData.orderNo || generateOrderNo(),
    status: orderData.status || OrderStatus.PENDING_PAYMENT,
    createTime: orderData.createTime || new Date().toISOString(),
    totalAmount: orderData.totalAmount,
    
    // 处理商品列表
    goodsList: (orderData.orderItems || orderData.goodsList || []).map(item => ({
      id: item.id || item.spuId,
      spuId: item.spuId || item.id,
      title: item.title || item.goods_name,
      price: item.price || item.goods_price,
      num: item.num || item.quantity || item.goods_num || 1,
      primaryImage: item.primaryImage || item.thumb || item.goods_img,
      thumb: item.primaryImage || item.thumb || item.goods_img,
      specs: item.specs || [],
      specDesc: Array.isArray(item.specs) ? item.specs.join(' ') : ''
    }))
  };

  console.log('[Model] 生成的新订单:', order);
  
  // 添加到内存中的订单列表
  orders.unshift(order);
  
  // 保存到本地存储
  try {
    const savedOrders = wx.getStorageSync('orders') || [];
    savedOrders.unshift(order);
    wx.setStorageSync('orders', savedOrders);
  } catch (err) {
    console.error('保存订单到本地存储失败:', err);
  }

  return order;
};

// 初始化订单列表
export const initOrderList = () => {
  console.log('初始化订单列表');
  try {
    // 从本地存储加载订单
    let savedOrders = wx.getStorageSync('orders') || [];
    
    // 如果没有订单数据，生成测试数据
    if (!savedOrders.length) {
      console.log('生成测试订单数据');
      savedOrders = generateTestOrders();
      wx.setStorageSync('orders', savedOrders);
    }
    
    orders = savedOrders;
    console.log('订单列表初始化完成:', orders);
    return orders;
  } catch (err) {
    console.error('初始化订单列表失败:', err);
    return [];
  }
};

// 获取订单列表
export const getOrderList = (status = -1, page = 1, pageSize = 10) => {
  console.log('获取订单列表:', { status, page, pageSize, orders });
  
  // 过滤订单
  let filteredOrders = orders;
  if (status !== -1) {
    filteredOrders = orders.filter(order => order.status === status);
  }

  // 分页
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageData = filteredOrders.slice(start, end);

  const result = {
    total: filteredOrders.length,
    data: pageData
  };

  console.log('返回订单数据:', result);
  return result;
};

// 更新订单状态
export const updateOrderStatus = (orderId, status) => {
  const order = orders.find(order => order.orderId === orderId);
  if (order) {
    order.status = status;
    
    // 更新本地存储
    try {
      const savedOrders = wx.getStorageSync('orders') || [];
      const updatedOrders = savedOrders.map(savedOrder => 
        savedOrder.orderId === orderId 
          ? { ...savedOrder, status } 
          : savedOrder
      );
      wx.setStorageSync('orders', updatedOrders);
    } catch (err) {
      console.error('更新本地存储中的订单状态失败:', err);
    }
    
    return true;
  }
  return false;
};

// 清空订单列表
export const clearOrders = () => {
  orders = [];
  try {
    wx.removeStorageSync('orders');
  } catch (err) {
    console.error('清空本地存储中的订单失败:', err);
  }
};

// 生成订单列表
export const genOrders = (params = {}) => {
  const { status = -1, page = 1, pageSize = 10 } = params;
  
  // 确保订单列表已初始化
  if (!orders.length) {
    initOrderList();
  }
  
  // 过滤订单
  let filteredOrders = orders;
  if (status !== -1) {
    filteredOrders = orders.filter(order => order.status === status);
  }

  // 分页
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageData = filteredOrders.slice(start, end);

  return {
    data: pageData,
    total: filteredOrders.length,
    pageSize,
    page
  };
};
