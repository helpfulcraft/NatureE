import { config } from '../../config/index';
import { request } from '../../utils/request';
import { fetchOrderDetail as fetchOrderDetailFromList } from './orderList';

/** 获取订单详情mock数据 */
function mockFetchOrderDetail(params) {
  const { delay } = require('../_utils/delay');
  const { genOrderDetail } = require('../../model/order/orderDetail');

  return delay().then(() => genOrderDetail(params));
}

/** 获取订单详情 */
export function fetchOrderDetail(orderId) {
  console.log('[OrderDetail] 调用订单详情接口:', orderId);
  return fetchOrderDetailFromList(orderId);
}

/** 获取客服mock数据 */
function mockFetchBusinessTime(params) {
  const { delay } = require('../_utils/delay');
  const { genBusinessTime } = require('../../model/order/orderDetail');

  return delay().then(() => genBusinessTime(params));
}

/** 获取客服数据 */
export function fetchBusinessTime() {
  if (config.useMock) {
    return new Promise((resolve) => {
      resolve({
        code: 0,
        data: {
          telphone: '13888888888',
          businessTime: ['周一至周五 09:00-22:00', '周六至周日 09:00-24:00']
        }
      });
    });
  }

  return request({
    url: `${config.baseUrl}/business/time`,
    method: 'GET'
  });
}
