import logger from './logger';

// 页面配置模板
const PAGE_TEMPLATES = {
  // 基础页面模板
  basic: {
    navigationBarTitleText: '云商城',
    backgroundColor: '#f5f5f5',
    usingComponents: {
      't-loading': 'tdesign-miniprogram/loading/loading'
    }
  },

  // 列表页面模板
  list: {
    navigationBarTitleText: '商品列表',
    backgroundColor: '#f5f5f5',
    enablePullDownRefresh: true,
    usingComponents: {
      't-loading': 'tdesign-miniprogram/loading/loading',
      't-empty': 'tdesign-miniprogram/empty/empty',
      'goods-card': '/components/goods-card/index'
    }
  },

  // 详情页面模板
  detail: {
    navigationBarTitleText: '商品详情',
    backgroundColor: '#ffffff',
    usingComponents: {
      't-loading': 'tdesign-miniprogram/loading/loading',
      't-toast': 'tdesign-miniprogram/toast/toast'
    }
  },

  // 订单相关页面模板
  order: {
    navigationBarTitleText: '订单详情',
    backgroundColor: '#ffffff',
    usingComponents: {
      't-loading': 'tdesign-miniprogram/loading/loading',
      't-toast': 'tdesign-miniprogram/toast/toast',
      't-steps': 'tdesign-miniprogram/steps/steps',
      't-step': 'tdesign-miniprogram/steps/step-item'
    }
  },

  // 支付页面模板
  payment: {
    navigationBarTitleText: '订单支付',
    backgroundColor: '#ffffff',
    usingComponents: {
      't-toast': 'tdesign-miniprogram/toast/toast',
      't-radio': 'tdesign-miniprogram/radio/radio',
      't-radio-group': 'tdesign-miniprogram/radio-group/radio-group',
      't-button': 'tdesign-miniprogram/button/button'
    }
  },

  // 结果页面模板
  result: {
    navigationBarTitleText: '操作结果',
    backgroundColor: '#ffffff',
    usingComponents: {
      't-toast': 'tdesign-miniprogram/toast/toast',
      't-icon': 'tdesign-miniprogram/icon/icon',
      't-button': 'tdesign-miniprogram/button/button'
    }
  }
};

class PageConfigGenerator {
  constructor() {
    this.templates = PAGE_TEMPLATES;
  }

  // 生成页面配置
  generate(type = 'basic', options = {}) {
    const template = this.templates[type];
    if (!template) {
      logger.error('未找到页面模板:', type);
      return this.templates.basic;
    }

    return {
      ...template,
      ...options,
      usingComponents: {
        ...template.usingComponents,
        ...options.usingComponents
      }
    };
  }

  // 验证页面配置
  validate(config) {
    const errors = [];

    // 必需字段检查
    const requiredFields = ['navigationBarTitleText', 'usingComponents'];
    requiredFields.forEach(field => {
      if (!config[field]) {
        errors.push(`缺少必需字段: ${field}`);
      }
    });

    // 类型检查
    if (typeof config.navigationBarTitleText !== 'string') {
      errors.push('navigationBarTitleText 必须是字符串');
    }
    if (typeof config.usingComponents !== 'object') {
      errors.push('usingComponents 必须是对象');
    }

    // 组件路径检查
    if (config.usingComponents) {
      Object.entries(config.usingComponents).forEach(([name, path]) => {
        if (typeof path !== 'string') {
          errors.push(`组件 ${name} 的路径必须是字符串`);
        }
        if (!path.startsWith('/') && !path.startsWith('tdesign-miniprogram/')) {
          errors.push(`组件 ${name} 的路径必须以 / 或 tdesign-miniprogram/ 开头`);
        }
      });
    }

    // 背景颜色格式检查
    if (config.backgroundColor && !/^#[0-9a-fA-F]{6}$/.test(config.backgroundColor)) {
      errors.push('backgroundColor 必须是有效的十六进制颜色值');
    }

    // 标题长度检查
    if (config.navigationBarTitleText && config.navigationBarTitleText.length > 12) {
      errors.push('navigationBarTitleText 长度不能超过12个字符');
    }

    // 组件依赖检查
    if (config.usingComponents) {
      const components = Object.values(config.usingComponents);
      const tdesignComponents = components.filter(path => path.startsWith('tdesign-miniprogram/'));
      const customComponents = components.filter(path => path.startsWith('/'));

      // 检查TDesign组件版本兼容性
      if (tdesignComponents.length > 0) {
        logger.debug('使用了TDesign组件:', tdesignComponents);
      }

      // 检查自定义组件路径
      customComponents.forEach(path => {
        if (path.includes('..')) {
          errors.push(`组件路径不能使用相对路径: ${path}`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // 获取模板列表
  getTemplates() {
    return Object.keys(this.templates);
  }

  // 添加自定义模板
  addTemplate(name, config) {
    if (this.templates[name]) {
      logger.warn('模板已存在，将被覆盖:', name);
    }
    this.templates[name] = config;
  }

  // 获取页面类型建议
  suggestType(pagePath) {
    const pathSegments = pagePath.split('/');
    const pageName = pathSegments[pathSegments.length - 2] || '';

    const typeMap = {
      list: 'list',
      detail: 'detail',
      order: 'order',
      payment: 'payment',
      result: 'result'
    };

    return typeMap[pageName] || 'basic';
  }
}

export const pageConfigGenerator = new PageConfigGenerator(); 