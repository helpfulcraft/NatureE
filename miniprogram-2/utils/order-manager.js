import { OrderStatus, orderStatusMap, orderStatusStyle } from '../config/constants';

class OrderManager {
  constructor() {
    this._cache = new Map();
    this.init();
  }

  init() {
    try {
      const savedOrders = wx.getStorageSync('orders') || [];
      savedOrders.forEach(order => {
        this._cache.set(order.orderId, order);
      });
    } catch (err) {
      console.error('初始化订单管理器失败:', err);
    }
  }

  /** 创建新订单 */
  async createOrder(params) {
    try {
      const { address, goodsList, totalAmount, remark = '' } = params;
      
      if (!address || !goodsList || !Array.isArray(goodsList) || !goodsList.length) {
        throw new Error('订单参数不完整');
      }

      const orderId = `order_${Date.now()}`;
      const orderNo = `NO${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      const order = {
        orderId,
        orderNo,
        status: OrderStatus.PENDING_PAYMENT,
        createTime: new Date().toISOString(),
        address,
        goodsList: goodsList.map(goods => {
          // 处理规格信息
          const specs = this._formatSpecs(goods);
          const specDesc = this._getSpecDesc(goods);
          
          return {
            id: goods.id || goods.spuId,
            spuId: goods.spuId || goods.id,
            title: goods.title || goods.name,
            price: parseInt(goods.price) || 0,
            num: parseInt(goods.quantity) || parseInt(goods.num) || 1,
            primaryImage: goods.primaryImage || goods.thumb || goods.image,
            specs,
            specDesc,
            // 保存原始规格信息以备后用
            specInfo: goods.specInfo || null
          };
        }),
        totalAmount: parseInt(totalAmount) || 0,
        remark,
        freight: 0  // 运费暂时设为0
      };

      console.log('创建订单:', order);

      // 更新缓存和本地存储
      this._cache.set(orderId, order);
      this._updateLocalStorage();

      return { orderId, orderNo };
    } catch (error) {
      console.error('创建订单失败:', error);
      throw error;
    }
  }

  /** 获取订单列表 */
  async getOrderList(params = {}) {
    const { status = -1, page = 1, pageSize = 10 } = params;
    
    try {
      // 获取所有订单
      const allOrders = Array.from(this._cache.values());
      
      // 按状态过滤
      let filteredOrders = allOrders;
      if (status !== -1) {
        filteredOrders = allOrders.filter(order => order.status === status);
      }

      // 按创建时间倒序排序
      filteredOrders.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));

      // 分页
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const pageData = filteredOrders.slice(start, end);

      return {
        data: pageData,
        total: filteredOrders.length,
        pageSize,
        page,
        hasMore: end < filteredOrders.length
      };
    } catch (error) {
      console.error('获取订单列表失败:', error);
      throw error;
    }
  }

  /** 获取订单详情 */
  async getOrderDetail(orderId) {
    try {
      // 从缓存获取
      if (this._cache.has(orderId)) {
        return this._cache.get(orderId);
      }

      // 如果缓存中没有，尝试从本地存储获取所有订单
      const savedOrders = wx.getStorageSync('orders') || [];
      const order = savedOrders.find(o => o.orderId === orderId);
      
      if (order) {
        this._cache.set(orderId, order);
        return order;
      }

      throw new Error('订单不存在');
    } catch (error) {
      console.error('获取订单详情失败:', error);
      throw error;
    }
  }

  /** 取消订单 */
  async cancelOrder(orderId) {
    try {
      const order = await this.getOrderDetail(orderId);
      if (!order) {
        throw new Error('订单不存在');
      }

      // 更新订单状态
      order.status = OrderStatus.CANCELLED;
      order.cancelTime = new Date().toISOString();
      
      // 更新缓存和本地存储
      this._cache.set(orderId, order);
      this._updateLocalStorage();

      return { success: true };
    } catch (error) {
      console.error('取消订单失败:', error);
      throw error;
    }
  }

  /** 确认收货 */
  async confirmReceipt(orderId) {
    try {
      const order = await this.getOrderDetail(orderId);
      if (!order) {
        throw new Error('订单不存在');
      }

      // 更新订单状态
      order.status = OrderStatus.COMPLETED;
      order.completeTime = new Date().toISOString();
      
      // 更新缓存和本地存储
      this._cache.set(orderId, order);
      this._updateLocalStorage();

      return { success: true };
    } catch (error) {
      console.error('确认收货失败:', error);
      throw error;
    }
  }

  /** 删除订单 */
  async deleteOrder(orderId) {
    try {
      // 从缓存中移除
      this._cache.delete(orderId);
      
      // 更新本地存储
      this._updateLocalStorage();

      return { success: true };
    } catch (error) {
      console.error('删除订单失败:', error);
      throw error;
    }
  }

  /** 更新本地存储 */
  _updateLocalStorage() {
    try {
      const orders = Array.from(this._cache.values());
      wx.setStorageSync('orders', orders);
    } catch (err) {
      console.error('更新本地存储失败:', err);
      throw err;
    }
  }

  /** 清除缓存 */
  clearCache() {
    this._cache.clear();
    try {
      wx.removeStorageSync('orders');
    } catch (err) {
      console.error('清除本地存储失败:', err);
    }
  }

  /** 获取订单状态描述 */
  getStatusDesc(status) {
    return orderStatusMap[status] || '未知状态';
  }

  /** 获取订单状态标签样式 */
  getStatusStyle(status) {
    return orderStatusStyle[status] || 'default';
  }

  /** 支付订单 */
  async payOrder(orderId) {
    try {
      const order = await this.getOrderDetail(orderId);
      if (!order) {
        throw new Error('订单不存在');
      }

      if (order.status !== OrderStatus.PENDING_PAYMENT) {
        throw new Error('订单状态错误');
      }

      // 更新订单状态为待发货
      order.status = OrderStatus.PENDING_DELIVERY;
      order.payTime = new Date().toISOString();
      
      // 更新缓存和本地存储
      this._cache.set(orderId, order);
      this._updateLocalStorage();

      return { success: true };
    } catch (error) {
      console.error('支付订单失败:', error);
      throw error;
    }
  }

  /** 模拟支付流程 */
  async mockPayment(orderId) {
    try {
      // 模拟支付过程
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 更新订单状态
      await this.payOrder(orderId);

      return {
        success: true,
        timeStamp: Date.now(),
        transactionId: `mock_trans_${Date.now()}`
      };
    } catch (error) {
      console.error('模拟支付失败:', error);
      throw error;
    }
  }

  /** 格式化商品规格 */
  _formatSpecs(goods) {
    let specs = [];
    
    if (goods.specInfo && Array.isArray(goods.specInfo)) {
      // 如果有完整的规格信息，包含规格名和值
      specs = goods.specInfo.map(spec => `${spec.name || spec.title}: ${spec.value || spec.specValue}`);
    } else if (goods.specs && Array.isArray(goods.specs)) {
      // 如果是简单的规格数组，尝试获取完整信息
      specs = goods.specs.map(spec => {
        if (typeof spec === 'string') return spec;
        return `${spec.name || spec.title}: ${spec.value || spec.specValue}`;
      });
    } else if (typeof goods.specDesc === 'string' && goods.specDesc) {
      // 如果是字符串描述，直接使用
      specs = [goods.specDesc];
    }
    
    // 过滤掉无效的规格信息
    return specs.filter(Boolean);
  }

  /** 获取规格描述文本 */
  _getSpecDesc(goods) {
    if (goods.specDesc) return goods.specDesc;
    const specs = this._formatSpecs(goods);
    return specs.length ? specs.join(' ') : '';
  }
}

export const orderManager = new OrderManager();
export default orderManager; 