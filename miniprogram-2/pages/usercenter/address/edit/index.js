// pages/usercenter/address/edit/index.js
import { handleSaveAddress, validateAddress, resolveAddress } from './util';
import { showToast } from '../../../../utils/util';
import { fetchAddressList } from '../../../../services/address/fetchAddress';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    isDefault: false,
    loading: false,
    region: ['请选择省市区'],
    customItem: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const { id } = options;
    if (id) {
      this.setData({ id });
      this.loadAddress(id);
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  async loadAddress(id) {
    try {
      const result = await fetchAddressList();
      if (result.code !== 'Success') {
        throw new Error(result.message || '获取地址失败');
      }

      const address = result.data.find(addr => addr.id === id);
      if (!address) {
        throw new Error('地址不存在');
      }

      this.setData({
        ...address,
        region: [address.province, address.city, address.district]
      });
    } catch (err) {
      console.error('加载地址失败:', err);
      showToast(err.message || '加载失败');
    }
  },

  onRegionChange(e) {
    const [province, city, district] = e.detail.value;
    this.setData({
      region: e.detail.value,
      province,
      city,
      district
    });
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [field]: e.detail.value
    });
  },

  onSwitchChange(e) {
    this.setData({
      isDefault: e.detail.value
    });
  },

  async onSave() {
    try {
      this.setData({ loading: true });

      const {
        id,
        name,
        phone,
        province,
        city,
        district,
        detail,
        isDefault
      } = this.data;

      const address = {
        id,
        name,
        phone,
        province,
        city,
        district,
        detail,
        isDefault
      };

      const validation = validateAddress(address);
      if (!validation.valid) {
        throw new Error(validation.message);
      }

      await handleSaveAddress(address);
      
      showToast('保存成功', 'success');
      
      // 如果是从选择地址进入的，返回选中的地址
      resolveAddress(address);
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      console.error('保存地址失败:', err);
      showToast(err.message || '保存失败');
    } finally {
      this.setData({ loading: false });
    }
  }
})