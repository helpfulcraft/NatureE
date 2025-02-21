// 模拟地址数据
const mockAddresses = [
  {
    id: 'addr_1',
    name: '张三',
    phone: '13800138000',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    detail: '科技园路000号',
    isDefault: true
  },
  {
    id: 'addr_2',
    name: '李四',
    phone: '13800138001',
    province: '广东省',
    city: '广州市',
    district: '天河区',
    detail: '天河路111号',
    isDefault: false
  }
];

/** 获取地址列表 */
export async function fetchAddressList() {
  // 模拟接口延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    // 从本地存储获取地址列表
    const savedAddresses = wx.getStorageSync('addressList') || mockAddresses;
    return {
      data: savedAddresses,
      code: 'Success'
    };
  } catch (err) {
    console.error('获取地址列表失败:', err);
    return {
      data: [],
      code: 'Error',
      message: err.message
    };
  }
}

/** 获取默认地址 */
export async function fetchDefaultAddress() {
  const result = await fetchAddressList();
  if (result.code !== 'Success') {
    return result;
  }
  
  const defaultAddress = result.data.find(addr => addr.isDefault) || result.data[0];
  return {
    data: defaultAddress,
    code: 'Success'
  };
}

/** 保存地址 */
export async function saveAddress(address) {
  // 模拟接口延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    const addressList = wx.getStorageSync('addressList') || [];
    
    // 如果是默认地址，取消其他地址的默认状态
    if (address.isDefault) {
      addressList.forEach(addr => {
        addr.isDefault = false;
      });
    }
    
    // 更新或添加地址
    const index = addressList.findIndex(addr => addr.id === address.id);
    if (index > -1) {
      addressList[index] = address;
    } else {
      addressList.push({
        ...address,
        id: `addr_${Date.now()}`
      });
    }
    
    wx.setStorageSync('addressList', addressList);
    return {
      code: 'Success',
      message: '保存成功'
    };
  } catch (err) {
    console.error('保存地址失败:', err);
    return {
      code: 'Error',
      message: err.message
    };
  }
}

/** 删除地址 */
export async function deleteAddress(id) {
  // 模拟接口延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    const addressList = wx.getStorageSync('addressList') || [];
    const newList = addressList.filter(addr => addr.id !== id);
    wx.setStorageSync('addressList', newList);
    return {
      code: 'Success',
      message: '删除成功'
    };
  } catch (err) {
    console.error('删除地址失败:', err);
    return {
      code: 'Error',
      message: err.message
    };
  }
} 