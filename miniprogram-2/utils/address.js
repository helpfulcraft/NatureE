// 格式化地址
export function formatAddress(address) {
  if (!address) return '';
  
  const {
    provinceName = '',
    cityName = '',
    districtName = '',
    detailAddress = ''
  } = address;

  return [provinceName, cityName, districtName, detailAddress]
    .filter(Boolean)
    .join(' ');
}

// 格式化联系人信息
export function formatContact(address) {
  if (!address) return '';
  
  const { name = '', phone = '' } = address;
  return `${name} ${phone}`;
}

// 验证手机号
export function validatePhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone);
}

// 验证地址
export function validateAddress(address) {
  const {
    name,
    phone,
    provinceName,
    cityName,
    districtName,
    detailAddress
  } = address || {};

  if (!name || !phone || !provinceName || !cityName || !districtName || !detailAddress) {
    return false;
  }

  return validatePhone(phone);
}

// 获取默认地址
export function getDefaultAddress(addressList) {
  if (!Array.isArray(addressList)) return null;
  return addressList.find(addr => addr.isDefault) || addressList[0] || null;
}

// 排序地址列表（默认地址在前）
export function sortAddressList(addressList) {
  if (!Array.isArray(addressList)) return [];
  return [...addressList].sort((a, b) => {
    if (a.isDefault) return -1;
    if (b.isDefault) return 1;
    return 0;
  });
}

// 获取地址列表
export function getAddressList() {
  try {
    return wx.getStorageSync('addressList') || [];
  } catch (err) {
    console.error('获取地址列表失败:', err);
    return [];
  }
}

// 保存地址列表
export function saveAddressList(addressList) {
  try {
    wx.setStorageSync('addressList', addressList);
    return true;
  } catch (err) {
    console.error('保存地址列表失败:', err);
    return false;
  }
}

// 获取地址
export function getAddress(id) {
  const addressList = getAddressList();
  return addressList.find(addr => addr.id === id) || null;
}

// 添加地址
export function addAddress(address) {
  const addressList = getAddressList();
  const newAddress = {
    ...address,
    id: `address_${Date.now()}`
  };
  
  // 如果是默认地址，取消其他地址的默认状态
  if (newAddress.isDefault) {
    addressList.forEach(addr => {
      addr.isDefault = false;
    });
  }
  
  addressList.unshift(newAddress);
  return saveAddressList(addressList);
}

// 更新地址
export function updateAddress(address) {
  const addressList = getAddressList();
  const index = addressList.findIndex(addr => addr.id === address.id);
  
  if (index === -1) return false;
  
  // 如果是默认地址，取消其他地址的默认状态
  if (address.isDefault) {
    addressList.forEach(addr => {
      addr.isDefault = false;
    });
  }
  
  addressList[index] = address;
  return saveAddressList(addressList);
}

// 删除地址
export function deleteAddress(id) {
  const addressList = getAddressList();
  const newList = addressList.filter(addr => addr.id !== id);
  return saveAddressList(newList);
}

// 设置默认地址
export function setDefaultAddress(id) {
  const addressList = getAddressList();
  const newList = addressList.map(addr => ({
    ...addr,
    isDefault: addr.id === id
  }));
  return saveAddressList(newList);
} 