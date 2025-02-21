import { OrderStatus, orderStatusMap } from '../../config/constants';

// 订单配置
export const config = {
  // 订单超时时间（分钟）
  orderTimeout: 30,
  
  // 订单列表配置
  orderList: {
    pageSize: 10,
    defaultTab: -1
  },

  // 支付配置
  payment: {
    timeoutMinutes: 30
  }
};

// 导出订单状态相关常量
export { OrderStatus, orderStatusMap }; 