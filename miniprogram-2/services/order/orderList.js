import { config } from '../../config/index';
import { request } from '../../utils/request';
import { delay } from '../../utils/delay';
import { 
  fetchOrderDetail as fetchOrderDetailFromModel,
  addNewOrder,
  genOrders,
  genOrdersCount,
  genOrderDetail
} from '../../model/order/orderList';

/** 生成模拟订单数据 */
function mockOrderList(params) {
  const { status, pageNum, pageSize } = params;
  const list = [];
  
  // 生成订单列表
  for (let i = 0; i < pageSize; i++) {
    // 如果指定了状态且不是全部,则只生成对应状态的订单
    if (status !== 0 && Math.random() > 0.5) continue;
    
    const orderStatus = status === 0 ? Math.floor(Math.random() * 5) + 1 : status;
    const order = {
      orderId: `ORDER_${Date.now()}_${i}`,
      orderNo: `NO${Date.now()}${i}`,
      status: orderStatus,
      createTime: new Date().toISOString(),
      totalAmount: Math.floor(Math.random() * 1000) * 100,
      goodsList: [
        {
          id: `GOODS_${i}_1`,
          title: '商品示例',
          thumb: '/assets/images/default-goods.png',
          price: Math.floor(Math.random() * 100) * 100,
          num: Math.floor(Math.random() * 5) + 1,
          specs: '规格: 默认'
        }
      ]
    };
    list.push(order);
  }

  return {
    list,
    total: 100,
    pageNum,
    pageSize,
    hasMore: list.length === pageSize
  };
}

/** 获取订单列表 */
export async function fetchOrderList(params) {
  if (config.useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockOrderList(params));
      }, 500);
    });
  }

  // TODO: 实际接口调用
  return mockOrderList(params);
}

/** 获取订单详情 */
export async function fetchOrderDetail(orderId) {
  if (config.useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          orderId,
          orderNo: `NO${Date.now()}`,
          status: Math.floor(Math.random() * 5) + 1,
          createTime: new Date().toISOString(),
          totalAmount: Math.floor(Math.random() * 1000) * 100,
          address: {
            name: '张三',
            phone: '13800138000',
            province: '广东省',
            city: '深圳市',
            district: '南山区',
            detail: '科技园路000号'
          },
          goodsList: [
            {
              id: 'GOODS_1',
              title: '商品示例',
              thumb: '/assets/images/default-goods.png',
              price: Math.floor(Math.random() * 100) * 100,
              num: Math.floor(Math.random() * 5) + 1,
              specs: '规格: 默认'
            }
          ]
        });
      }, 500);
    });
  }

  // TODO: 实际接口调用
  return null;
}

/** 取消订单 */
export async function cancelOrder(orderId) {
  if (config.useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 500);
    });
  }

  // TODO: 实际接口调用
  return { success: true };
}

/** 确认收货 */
export async function confirmReceipt(orderId) {
  if (config.useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 500);
    });
  }

  // TODO: 实际接口调用
  return { success: true };
}

/** 删除订单 */
export async function deleteOrder(orderId) {
  if (config.useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 500);
    });
  }

  // TODO: 实际接口调用
  return { success: true };
}

/** 获取订单列表mock数据 */
function mockFetchOrders(params) {
  const { genOrders } = require('../../model/order/orderList');
  return delay(200).then(() => genOrders(params));
}

function mockFetchOrderDetail(orderId) {
  const { genOrderDetail } = require('../../model/order/orderDetail');
  return delay(200).then(() => genOrderDetail(orderId));
}

function mockCancelOrder() {
  return delay(200).then(() => ({ code: 0 }));
}

function mockDeleteOrder() {
  return delay(200).then(() => ({ code: 0 }));
}

function mockConfirmOrder() {
  return delay(200).then(() => ({ code: 0 }));
}

/** 获取订单列表数据 */
export function fetchOrders(params) {
  if (config.useMock) {
    return mockFetchOrders(params);
  }

  return new Promise((resolve) => {
    resolve('real api');
  });
}

/** 获取订单列表mock数据 */
function mockFetchOrdersCount(params) {
  const { genOrdersCount } = require('../../model/order/orderList');
  return delay().then(() => genOrdersCount(params));
}

/** 获取订单列表统计 */
export function fetchOrdersCount(params) {
  if (config.useMock) {
    return delay().then(() => genOrdersCount(params));
  }

  return request({
    url: `${config.baseUrl}/orders/count`,
    method: 'GET',
    data: params
  });
}

/** 添加新订单 */
export function addOrder(orderData) {
  if (config.useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const order = addNewOrder(orderData);
          resolve({
            code: 0,
            data: order,
            msg: 'success'
          });
        } catch (err) {
          resolve({
            code: -1,
            data: null,
            msg: err.message || '添加订单失败'
          });
        }
      }, 100);
    });
  }

  return request({
    url: `${config.baseUrl}/orders`,
    method: 'POST',
    data: orderData
  });
}
