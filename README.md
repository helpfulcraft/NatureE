# 云南特色服装设计小程序

基于微信小程序开发的云南特色服装设计平台，集成了 AI 设计、在线商城等功能。

## 项目截图

|首页|商品列表|购物车|
|---|---|---|
|![首页](screenshots/home.jpg)|![商品列表](screenshots/category.jpg)|![购物车](screenshots/cart.jpg)|
|**个人中心**|**AI客服**|**在线设计**|
|![个人中心](screenshots/profile.jpg)|![AI客服](screenshots/ai-service.jpg)|![在线设计](screenshots/design.jpg)|

## 主要功能

- 🎨 AI 智能设计
  - 支持多种云南民族服装风格
  - 自定义颜色和设计元素
  - 集成 Stable Diffusion 模型

- 🛍️ 商城功能
  - 商品浏览和搜索
  - 购物车管理
  - 订单管理

- 👤 用户中心
  - 用户登录注册
  - 个人信息管理
  - 收货地址管理

## 技术栈

- 微信小程序原生开发
- TDesign 组件库
- Stable Diffusion WebUI API

## 开发环境配置

1. 安装依赖
```bash
npm install
```

2. 开发者工具配置
- 关闭 ES6 转 ES5
- 关闭上传代码时样式自动补全
- 关闭代码压缩上传
- 开启增强编译

3. Stable Diffusion 配置
- 使用秋叶整合包，已默认启用 API 功能
- 默认端口 7860

## 本地开发

1. 克隆项目
```bash
git clone [repository-url]
cd [project-name]
```

2. 安装依赖
```bash
npm install
```

3. 使用微信开发者工具打开项目

## 注意事项

1. 在线设计功能需要本地运行 Stable Diffusion WebUI（使用秋叶整合包启动即可）
2. 真机调试时需要将 `design.js` 中的 API 地址修改为电脑的局域网 IP
3. 小程序发布时需要配置合法域名

## 贡献指南

欢迎提交 Issue 和 Pull Request

## 许可证

MIT License 