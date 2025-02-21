const baiduApiTest = require('../../utils/baiduApiTest');

Page({
  data: {
    testResult: ''
  },

  onLoad() {
    // 在页面加载时执行测试
    this.runTest();
  },

  runTest() {
    // 执行测试并将结果显示在页面上
    try {
      baiduApiTest();
    } catch (error) {
      this.setData({
        testResult: '测试执行出错: ' + JSON.stringify(error)
      });
    }
  }
}); 