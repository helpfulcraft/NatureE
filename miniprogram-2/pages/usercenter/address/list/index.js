/* eslint-disable no-param-reassign */
import { fetchAddressList, deleteAddress } from '../../../../services/address/fetchAddress';
import { showToast, showModal } from '../../../../utils/util';

Page({
  data: {
    addressList: [],
    from: '',  // 来源页面
    loading: true
  },

  /** 选择模式 */
  selectMode: false,
  /** 是否已经选择地址，不置为true的话页面离开时会触发取消选择行为 */
  hasSelect: false,

  onLoad(options) {
    const { from = '' } = options;
    this.setData({ from });
    this.loadAddressList();
  },

  onShow() {
    this.loadAddressList();
  },

  async loadAddressList() {
    try {
      this.setData({ loading: true });
      const result = await fetchAddressList();
      
      if (result.code !== 'Success') {
        throw new Error(result.message || '获取地址列表失败');
      }

      this.setData({
        addressList: result.data || [],
        loading: false
      });
    } catch (err) {
      console.error('加载地址列表失败:', err);
      showToast(err.message || '加载失败');
      this.setData({ loading: false });
    }
  },

  onAddAddress() {
    wx.navigateTo({
      url: '/pages/usercenter/address/edit/index'
    });
  },

  onEditAddress(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/usercenter/address/edit/index?id=${id}`
    });
  },

  async onDeleteAddress(e) {
    const { id } = e.currentTarget.dataset;
    
    try {
      const { confirm } = await showModal({
        title: '提示',
        content: '确定要删除该地址吗？'
      });

      if (!confirm) return;

      const result = await deleteAddress(id);
      
      if (result.code !== 'Success') {
        throw new Error(result.message || '删除失败');
      }

      showToast('删除成功', 'success');
      this.loadAddressList();
    } catch (err) {
      console.error('删除地址失败:', err);
      showToast(err.message || '删除失败');
    }
  },

  onSelectAddress(e) {
    const { id } = e.currentTarget.dataset;
    const { from } = this.data;
    
    if (from === 'order') {
      // 如果是从订单页面来的，选择地址后返回
      const address = this.data.addressList.find(addr => addr.id === id);
      if (!address) {
        showToast('地址不存在');
        return;
      }

      // 触发选择地址事件
      const eventChannel = this.getOpenerEventChannel();
      eventChannel.emit('selectAddress', address);
      
      wx.navigateBack();
    }
  },

  onUnload() {
    if (this.selectMode && !this.hasSelect) {
      rejectAddress();
    }
  },

  getWXAddressHandle() {
    wx.chooseAddress({
      success: (res) => {
        if (res.errMsg.indexOf('ok') === -1) {
          Toast({
            context: this,
            selector: '#t-toast',
            message: res.errMsg,
            icon: '',
            duration: 1000,
          });
          return;
        }
        Toast({
          context: this,
          selector: '#t-toast',
          message: '添加成功',
          icon: '',
          duration: 1000,
        });
        const { length: len } = this.data.addressList;
        this.setData({
          [`addressList[${len}]`]: {
            name: res.userName,
            phoneNumber: res.telNumber,
            address: `${res.provinceName}${res.cityName}${res.countryName}${res.detailInfo}`,
            isDefault: 0,
            tag: '微信地址',
            id: len,
          },
        });
      },
    });
  },

  selectHandle({ detail }) {
    const { id } = detail || {};
    // 获取选中的地址数据
    const selectedAddress = this.data.addressList.find(addr => addr.id === id);
    
    if (this.selectMode) {
      this.hasSelect = true;
      
      // 返回上一页并传递地址数据
      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2];
      
      if (prevPage) {
        // 调用上一页的地址选择回调
        if (typeof prevPage.onSelectAddress === 'function') {
          prevPage.onSelectAddress(selectedAddress);
        }
        
        // 更新上一页的地址数据
        prevPage.setData({
          userAddress: selectedAddress,
          'settleDetailData.userAddress': selectedAddress
        });
      }
      
      wx.navigateBack({ delta: 1 });
    } else {
      this.editAddressHandle({ detail });
    }
  },

  createHandle() {
    this.waitForNewAddress();
    wx.navigateTo({ url: '/pages/usercenter/address/edit/index' });
  },

  waitForNewAddress() {
    getAddressPromise()
      .then((newAddress) => {
        let addressList = [...this.data.addressList];

        newAddress.phoneNumber = newAddress.phone;
        newAddress.address = `${newAddress.provinceName}${newAddress.cityName}${newAddress.districtName}${newAddress.detailAddress}`;
        newAddress.tag = newAddress.addressTag;

        if (!newAddress.addressId) {
          newAddress.id = `${addressList.length}`;
          newAddress.addressId = `${addressList.length}`;

          if (newAddress.isDefault === 1) {
            addressList = addressList.map((address) => {
              address.isDefault = 0;

              return address;
            });
          } else {
            newAddress.isDefault = 0;
          }

          addressList.push(newAddress);
        } else {
          addressList = addressList.map((address) => {
            if (address.addressId === newAddress.addressId) {
              return newAddress;
            }
            return address;
          });
        }

        addressList.sort((prevAddress, nextAddress) => {
          if (prevAddress.isDefault && !nextAddress.isDefault) {
            return -1;
          }
          if (!prevAddress.isDefault && nextAddress.isDefault) {
            return 1;
          }
          return 0;
        });

        this.setData({
          addressList: addressList,
        });
      })
      .catch((e) => {
        if (e.message !== 'cancel') {
          Toast({
            context: this,
            selector: '#t-toast',
            message: '地址编辑发生错误',
            icon: '',
            duration: 1000,
          });
        }
      });
  },

  onSelect(address) {
    // 返回上一页并传递地址数据
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    
    if (prevPage && prevPage.onSelectAddress) {
      prevPage.onSelectAddress(address);
    }
    
    wx.navigateBack();
  }
});
