import { config } from '../../config/index';
import { request } from '../request';

/** 获取结算详情 */
function mockSettleDetail(params) {
  console.log('获取结算详情参数:', params);
  
  if (!Array.isArray(params.goodsRequestList)) {
    throw new Error('商品列表必须是数组');
  }
  
  // 模拟接口返回数据
  return new Promise((resolve) => {
    setTimeout(() => {
      // 计算商品总价
      const totalAmount = params.goodsRequestList.reduce((sum, item) => {
        const price = parseInt(item.price) || 0;
        const quantity = parseInt(item.quantity) || 1;
        return sum + price * quantity;
      }, 0);

      // 计算运费（这里简单模拟：订单满99免运费，否则10元运费）
      const freight = totalAmount >= 9900 ? 0 : 1000;

      // 计算应付金额
      const totalPayAmount = totalAmount + freight;

      resolve({
        data: {
          isSuccess: true,
          code: 'Success',
          data: {
            totalAmount,
            totalPayAmount,
            totalGoodsCount: params.goodsRequestList.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0),
            totalDeliveryFee: freight,
            totalPromotionAmount: 0,
            totalCouponAmount: 0,
            userAddress: params.userAddressReq,
            storeGoodsList: [
              {
                storeId: '1',
                storeName: '默认店铺',
                remark: '',
                couponList: [],
                skuDetailVos: params.goodsRequestList.map(item => ({
                  ...item,
                  settlePrice: parseInt(item.price) || 0,
                  tagPrice: parseInt(item.price) || 0,
                  skuSpecLst: Array.isArray(item.specInfo) ? item.specInfo.map(spec => ({
                    specValue: spec.value
                  })) : []
                }))
              }
            ]
          }
        }
      });
    }, 500);
  });
}

/** 获取结算详情 */
export function fetchSettleDetail(params) {
  if (config.useMock) {
    return mockSettleDetail(params);
  }
  return request(`/order/settle-detail`, {
    method: 'POST',
    data: params,
  });
}

/** 提交订单 */
export function createOrder(params) {
  if (config.useMock) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            isSuccess: true,
            code: 'Success',
            data: {
              orderId: `ORDER_${Date.now()}`,
              orderNo: `NO_${Date.now()}`,
              totalAmount: params.totalAmount,
              status: 1,
              createTime: new Date().toISOString()
            }
          }
        });
      }, 500);
    });
  }
  return request(`/order/create`, {
    method: 'POST',
    data: params,
  });
} 