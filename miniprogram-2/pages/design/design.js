import Toast from 'tdesign-miniprogram/toast/index';

const STYLE_MAP = {
  '云南民族服装': 'yunnan ethnic costume',
  '现代改良旗袍': 'modern qipao',
  '苗族刺绣上衣': 'miao embroidery top',
  '傣族纱笼': 'dai sarong',
  '彝族马甲': 'yi vest',
  '纳西族披肩': 'naxi shawl'
};

const THEME_MAP = {
  '传统民族风': 'traditional ethnic',
  '现代简约风': 'modern minimalist',
  '复古文艺风': 'vintage artistic',
  '时尚潮流风': 'fashion trendy',
  '度假休闲风': 'resort casual'
};

const YUNNAN_ELEMENTS = [
  '云南花卉', '民族图腾', '孔雀元素',
  '银饰纹样', '扎染图案', '少数民族服饰'
];

Page({
  data: {
    // 服装类型选项
    styleOptions: [
      { value: 0, label: '云南民族服装' },
      { value: 1, label: '现代改良旗袍' },
      { value: 2, label: '苗族刺绣上衣' },
      { value: 3, label: '傣族纱笼' },
      { value: 4, label: '彝族马甲' },
      { value: 5, label: '纳西族披肩' }
    ],
    styleIndex: 0,

    // 风格选项
    themeOptions: [
      { value: 0, label: '传统民族风' },
      { value: 1, label: '现代简约风' },
      { value: 2, label: '复古文艺风' },
      { value: 3, label: '时尚潮流风' },
      { value: 4, label: '度假休闲风' }
    ],
    themeIndex: 0,

    // 颜色选项 - 使用云南特色颜色
    colors: [
      '#E60012', // 云南红
      '#1D953F', // 翡翠绿
      '#4C8DAE', // 天空蓝
      '#FFD700', // 金色
      '#800080', // 紫色
      '#FFA500', // 橙色
      '#FFFFFF', // 白色
      '#000000', // 黑色
      '#FFC0CB'  // 粉色
    ],
    colorNames: {
      '#E60012': '云南红',
      '#1D953F': '翡翠绿',
      '#4C8DAE': '天空蓝',
      '#FFD700': '金色',
      '#800080': '紫色',
      '#FFA500': '橙色',
      '#FFFFFF': '白色',
      '#000000': '黑色',
      '#FFC0CB': '粉色'
    },
    selectedColor: '#E60012',

    // 其他数据
    description: '',
    generatedImage: '',
    isGenerating: false,
    
    // SD API配置
    sdConfig: {
      steps: 30,
      width: 512,
      height: 768,
      cfg_scale: 7,
      negative_prompt: "low quality, bad anatomy, worst quality, low resolution, blurry, watermark, text, signature"
    }
  },

  onLoad() {
    // 检查是否有历史生成图片
    this.loadLastDesign();
    // 检查网络状态
    this.checkNetworkStatus();
  },

  // 检查网络状态
  checkNetworkStatus() {
    wx.getNetworkType({
      success: (res) => {
        if (res.networkType === 'none') {
          Toast({
            context: this,
            selector: '#t-toast',
            message: '请检查网络连接',
            theme: 'warning',
          });
        }
      }
    });

    // 监听网络状态变化
    wx.onNetworkStatusChange((res) => {
      if (!res.isConnected) {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '网络连接已断开',
          theme: 'warning',
        });
      }
    });
  },

  // 检查相册权限
  async checkAlbumPermission() {
    try {
      const res = await wx.getSetting();
      if (!res.authSetting['scope.writePhotosAlbum']) {
        await wx.authorize({
          scope: 'scope.writePhotosAlbum'
        });
      }
      return true;
    } catch (error) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请授权相册权限',
        theme: 'warning',
      });
      return false;
    }
  },

  // 加载上次的设计
  loadLastDesign() {
    const lastDesign = wx.getStorageSync('lastDesign');
    if (lastDesign) {
      this.setData({
        generatedImage: lastDesign.image,
        styleIndex: lastDesign.styleIndex,
        themeIndex: lastDesign.themeIndex,
        selectedColor: lastDesign.color,
        description: lastDesign.description
      });
    }
  },

  // 保存当前设计
  saveCurrentDesign() {
    const currentDesign = {
      image: this.data.generatedImage,
      styleIndex: this.data.styleIndex,
      themeIndex: this.data.themeIndex,
      color: this.data.selectedColor,
      description: this.data.description
    };
    wx.setStorageSync('lastDesign', currentDesign);
  },

  // 选择变化处理
  onStyleChange(e) {
    this.setData({ styleIndex: e.detail.value });
  },

  onThemeChange(e) {
    this.setData({ themeIndex: e.detail.value });
  },

  onColorSelect(e) {
    this.setData({ selectedColor: e.currentTarget.dataset.color });
  },

  onDescriptionChange(e) {
    this.setData({ description: e.detail.value });
  },

  // 预览图片
  previewImage() {
    if (!this.data.generatedImage) return;
    
    wx.previewImage({
      urls: [this.data.generatedImage],
      current: this.data.generatedImage
    });
  },

  // 生成提示词
  generatePrompt() {
    const styleLabel = this.data.styleOptions[this.data.styleIndex].label;
    const themeLabel = this.data.themeOptions[this.data.themeIndex].label;
    const style = STYLE_MAP[styleLabel];
    const theme = THEME_MAP[themeLabel];
    const colorName = this.data.colorNames[this.data.selectedColor];
    const description = this.data.description;

    // 基础提示词
    let prompt = `A ${style} in ${theme} style, ${colorName} as main color`;
    
    // 添加云南特色元素
    prompt += ', with Yunnan ethnic elements, traditional patterns';
    
    // 添加用户描述
    if (description) {
      prompt += `, ${description}`;
    }

    // 添加固定优化提示词
    prompt += `, Chinese ethnic minority costume, high quality, detailed, professional fashion photography, studio lighting, 8k uhd, trending on artstation`;

    return prompt;
  },

  // 调用SD API
  async callSDAPI(prompt) {
    // 使用本地地址
    const baseUrl = 'http://127.0.0.1:7860';

    return new Promise((resolve, reject) => {
      wx.request({
        url: `${baseUrl}/sdapi/v1/txt2img`,
        method: 'POST',
        data: {
          prompt: prompt,
          ...this.data.sdConfig,
          sampler_name: "DPM++ 2M Karras",
          seed: -1
        },
        success: (res) => {
          if (res.data && res.data.images && res.data.images[0]) {
            resolve('data:image/png;base64,' + res.data.images[0]);
          } else {
            reject(new Error('生成图片失败'));
          }
        },
        fail: (error) => {
          console.error('API调用失败:', error);
          reject(error);
        }
      });
    });
  },

  // 生成设计
  async onGenerate() {
    if (this.data.isGenerating) return;

    // 检查网络
    wx.getNetworkType({
      success: async (res) => {
        if (res.networkType === 'none') {
          Toast({
            context: this,
            selector: '#t-toast',
            message: '请检查网络连接',
            theme: 'warning',
          });
          return;
        }

        const prompt = this.generatePrompt();
        
        this.setData({ isGenerating: true });
        Toast({
          context: this,
          selector: '#t-toast',
          message: '正在生成设计...',
          theme: 'loading',
          direction: 'column',
          duration: 0
        });

        try {
          const result = await this.callSDAPI(prompt);
          this.setData({ 
            generatedImage: result,
            isGenerating: false 
          });
          
          // 保存当前设计
          this.saveCurrentDesign();
          
          Toast({
            context: this,
            selector: '#t-toast',
            message: '生成成功',
            theme: 'success',
          });
        } catch (error) {
          console.error('生成失败:', error);
          this.setData({ isGenerating: false });
          Toast({
            context: this,
            selector: '#t-toast',
            message: '生成失败，请重试',
            theme: 'error',
          });
        }
      }
    });
  },

  // 保存设计
  async onSave() {
    if (!this.data.generatedImage) return;
    
    // 检查相册权限
    const hasPermission = await this.checkAlbumPermission();
    if (!hasPermission) return;

    Toast({
      context: this,
      selector: '#t-toast',
      message: '正在保存...',
      theme: 'loading',
      duration: 0
    });
    
    try {
      // 将base64转为临时文件
      const fsm = wx.getFileSystemManager();
      const filePath = `${wx.env.USER_DATA_PATH}/temp_image.png`;
      
      const base64Data = this.data.generatedImage.split('base64,')[1];
      fsm.writeFileSync(filePath, base64Data, 'base64');
      
      // 保存到相册
      await new Promise((resolve, reject) => {
        wx.saveImageToPhotosAlbum({
          filePath: filePath,
          success: resolve,
          fail: reject
        });
      });
      
      Toast({
        context: this,
        selector: '#t-toast',
        message: '保存成功',
        theme: 'success',
      });
    } catch (error) {
      console.error('保存失败:', error);
      Toast({
        context: this,
        selector: '#t-toast',
        message: error.errMsg || '保存失败，请重试',
        theme: 'error',
      });
    }
  }
}); 