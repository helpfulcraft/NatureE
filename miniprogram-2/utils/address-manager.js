/** 获取地址选择的Promise */
export function getAddressPromise() {
  return new Promise((resolve, reject) => {
    // 模拟地址数据
    const mockAddress = {
      id: `addr_${Date.now()}`,
      name: '张三',
      phone: '13800138000',
      province: '广东省',
      city: '深圳市',
      district: '南山区',
      detail: '科技园路000号',
      isDefault: true,
      checked: true
    };

    // 模拟选择地址
    wx.showModal({
      title: '模拟选择地址',
      content: '是否使用默认地址？',
      success(res) {
        if (res.confirm) {
          resolve(mockAddress);
        } else {
          reject(new Error('用户取消选择地址'));
        }
      },
      fail() {
        reject(new Error('选择地址失败'));
      }
    });
  });
}

/** 格式化地址信息 */
export function formatAddress(address) {
  if (!address) return '';
  
  const {
    province = '',
    city = '',
    district = '',
    detail = ''
  } = address;
  
  return `${province}${city}${district}${detail}`.trim();
}

/** 验证手机号 */
export function validatePhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone);
}

/** 验证地址信息 */
export function validateAddress(address) {
  if (!address) return false;
  
  const {
    name,
    phone,
    province,
    city,
    district,
    detail
  } = address;
  
  // 验证必填字段
  if (!name || !phone || !province || !city || !district || !detail) {
    return false;
  }
  
  // 验证手机号
  if (!validatePhone(phone)) {
    return false;
  }
  
  return true;
}

/** 保存地址 */
export function saveAddress(address) {
  return new Promise((resolve, reject) => {
    // 验证地址信息
    if (!validateAddress(address)) {
      reject(new Error('地址信息不完整'));
      return;
    }

    // 模拟保存地址
    setTimeout(() => {
      const savedAddress = {
        ...address,
        id: address.id || `addr_${Date.now()}`
      };
      
      // 保存到本地存储
      try {
        const addressList = wx.getStorageSync('addressList') || [];
        
        // 如果是默认地址，取消其他地址的默认状态
        if (savedAddress.isDefault) {
          addressList.forEach(item => {
            item.isDefault = false;
          });
        }
        
        // 更新或添加地址
        const index = addressList.findIndex(item => item.id === savedAddress.id);
        if (index > -1) {
          addressList[index] = savedAddress;
        } else {
          addressList.push(savedAddress);
        }
        
        wx.setStorageSync('addressList', addressList);
        resolve(savedAddress);
      } catch (err) {
        reject(new Error('保存地址失败'));
      }
    }, 500);
  });
}

/** 删除地址 */
export function deleteAddress(id) {
  return new Promise((resolve, reject) => {
    if (!id) {
      reject(new Error('地址ID不能为空'));
      return;
    }

    // 模拟删除地址
    setTimeout(() => {
      try {
        const addressList = wx.getStorageSync('addressList') || [];
        const newList = addressList.filter(item => item.id !== id);
        wx.setStorageSync('addressList', newList);
        resolve(true);
      } catch (err) {
        reject(new Error('删除地址失败'));
      }
    }, 500);
  });
}

/** 获取地址列表 */
export function getAddressList() {
  return new Promise((resolve) => {
    // 模拟获取地址列表
    setTimeout(() => {
      const addressList = wx.getStorageSync('addressList') || [];
      resolve(addressList);
    }, 500);
  });
}

/** 获取默认地址 */
export function getDefaultAddress() {
  return new Promise((resolve) => {
    // 模拟获取默认地址
    setTimeout(() => {
      const addressList = wx.getStorageSync('addressList') || [];
      const defaultAddress = addressList.find(item => item.isDefault) || addressList[0];
      resolve(defaultAddress || null);
    }, 500);
  });
} 