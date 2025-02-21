// 分类缩略图列表
const categoryImages = [
  'https://img0.baidu.com/it/u=2521851051,2189484119&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=667', // 苗族
  'https://img1.baidu.com/it/u=3002377936,1519658561&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=667', // 彝族
  'https://img2.baidu.com/it/u=3489538457,1121729690&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=667', // 傣族
  'https://img0.baidu.com/it/u=3311401360,2457968679&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=667', // 白族
  'https://img1.baidu.com/it/u=2550716890,3574361686&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=667', // 纳西族
  'https://img2.baidu.com/it/u=2550716890,3574361686&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=667', // 壮族
  'https://img0.baidu.com/it/u=2550716890,3574361686&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=667', // 瑶族
  'https://img1.baidu.com/it/u=2550716890,3574361686&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=667', // 布依族
  'https://img2.baidu.com/it/u=2550716890,3574361686&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=667', // 哈尼族
  'https://img0.baidu.com/it/u=2550716890,3574361686&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=667', // 民族配饰
  'https://img1.baidu.com/it/u=2550716890,3574361686&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=667', // 其他民族服饰
  'https://img2.baidu.com/it/u=2550716890,3574361686&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=667'  // 全部商品
];

export const fetchCategories = () => {
  // 返回模拟的分类数据
  return Promise.resolve([
    { 
      id: 0, 
      name: '全部商品',
      icon: categoryImages[Math.floor(Math.random() * categoryImages.length)]
    },
    { 
      id: 1, 
      name: '民族服装',
      icon: categoryImages[Math.floor(Math.random() * categoryImages.length)]
    },
    { 
      id: 2, 
      name: '苗族服饰',
      icon: categoryImages[Math.floor(Math.random() * categoryImages.length)]
    },
    { 
      id: 3, 
      name: '彝族服饰',
      icon: categoryImages[Math.floor(Math.random() * categoryImages.length)]
    },
    { 
      id: 4, 
      name: '傣族服饰',
      icon: categoryImages[Math.floor(Math.random() * categoryImages.length)]
    },
    { 
      id: 5, 
      name: '白族服饰',
      icon: categoryImages[Math.floor(Math.random() * categoryImages.length)]
    },
    { 
      id: 6, 
      name: '纳西服饰',
      icon: categoryImages[Math.floor(Math.random() * categoryImages.length)]
    },
    { 
      id: 7, 
      name: '壮族服饰',
      icon: categoryImages[Math.floor(Math.random() * categoryImages.length)]
    },
    { 
      id: 8, 
      name: '瑶族服饰',
      icon: categoryImages[Math.floor(Math.random() * categoryImages.length)]
    },
    { 
      id: 9, 
      name: '布依服饰',
      icon: categoryImages[Math.floor(Math.random() * categoryImages.length)]
    },
    { 
      id: 10, 
      name: '哈尼服饰',
      icon: categoryImages[Math.floor(Math.random() * categoryImages.length)]
    },
    { 
      id: 11, 
      name: '民族配饰',
      icon: categoryImages[Math.floor(Math.random() * categoryImages.length)]
    }
  ]);
}; 