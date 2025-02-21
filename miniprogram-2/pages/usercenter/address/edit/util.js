import { saveAddress } from '../../../../services/address/fetchAddress';

/** 获取地址选择的Promise */
export function getAddressPromise() {
  return new Promise((resolve, reject) => {
    // 创建一个全局变量来存储Promise的resolve和reject函数
    getApp().globalData = getApp().globalData || {};
    getApp().globalData.addressPromise = {
      resolve,
      reject
    };
  });
}

/** 解析地址 */
export function resolveAddress(address) {
  const app = getApp();
  if (app.globalData && app.globalData.addressPromise) {
    app.globalData.addressPromise.resolve(address);
    app.globalData.addressPromise = null;
  }
}

/** 取消地址选择 */
export function rejectAddress() {
  const app = getApp();
  if (app.globalData && app.globalData.addressPromise) {
    app.globalData.addressPromise.reject(new Error('cancel'));
    app.globalData.addressPromise = null;
  }
}

/** 验证手机号 */
export function validatePhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone);
}

/** 验证地址信息 */
export function validateAddress(address) {
  const {
    name,
    phone,
    province,
    city,
    district,
    detail
  } = address || {};

  if (!name || !phone || !province || !city || !district || !detail) {
    return {
      valid: false,
      message: '请完善地址信息'
    };
  }

  if (!validatePhone(phone)) {
    return {
      valid: false,
      message: '请输入正确的手机号'
    };
  }

  return {
    valid: true
  };
}

/** 保存地址 */
export async function handleSaveAddress(address) {
  const validation = validateAddress(address);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const result = await saveAddress(address);
  if (result.code !== 'Success') {
    throw new Error(result.message || '保存失败');
  }

  return result;
}

/** 格式化地址 */
export function formatAddress(address) {
  if (!address) return '';
  
  const {
    province = '',
    city = '',
    district = '',
    detail = ''
  } = address;

  return [province, city, district, detail]
    .filter(Boolean)
    .join(' ');
}

/** 格式化联系人信息 */
export function formatContact(address) {
  if (!address) return '';
  
  const { name = '', phone = '' } = address;
  return `${name} ${phone}`;
} 