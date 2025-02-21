// 订单状态枚举
export const OrderStatus = {
  PENDING_PAYMENT: 1,    // 待付款
  PENDING_DELIVERY: 2,   // 待发货
  PENDING_RECEIPT: 3,    // 待收货
  PENDING_COMMENT: 4,    // 待评价
  COMPLETED: 5,          // 已完成
  CANCELLED: 6           // 已取消
};

// 订单状态描述
export const orderStatusMap = {
  [OrderStatus.PENDING_PAYMENT]: '待付款',
  [OrderStatus.PENDING_DELIVERY]: '待发货',
  [OrderStatus.PENDING_RECEIPT]: '待收货',
  [OrderStatus.PENDING_COMMENT]: '待评价',
  [OrderStatus.COMPLETED]: '已完成',
  [OrderStatus.CANCELLED]: '已取消'
};

// 订单状态样式
export const orderStatusStyle = {
  [OrderStatus.PENDING_PAYMENT]: 'warning',   // 待付款
  [OrderStatus.PENDING_DELIVERY]: 'primary',  // 待发货
  [OrderStatus.PENDING_RECEIPT]: 'success',   // 待收货
  [OrderStatus.PENDING_COMMENT]: 'info',      // 待评价
  [OrderStatus.COMPLETED]: 'default',         // 已完成
  [OrderStatus.CANCELLED]: 'danger'           // 已取消
}; 