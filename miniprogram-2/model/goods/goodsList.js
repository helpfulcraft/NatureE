import { genGood } from './good';  // 导入商品详情的生成函数

export function genGoodsList(params) {
  console.log('生成商品列表参数:', params);  // 添加日志
  
  const { sortBy = 'default', sortType = 'desc', pageSize = 20, pageNum = 1 } = params;
  
  // 手动设置一些淘宝商品图片
  const goodsImages = [
    'https://tse3-mm.cn.bing.net/th/id/OIP-C.SPYMlCcMXn6atWcDeMDOcwHaKt?rs=1&pid=ImgDetMain',
    'https://tse4-mm.cn.bing.net/th/id/OIP-C.iJQReylpjWNEQbn_Z0tZOAHaL6?pid=ImgDet&w=474&h=762&rs=1',
    'https://tse3-mm.cn.bing.net/th/id/OIP-C.Jj0JGqbDln3ElPORsl-zQgHaLW?pid=ImgDet&w=474&h=726&rs=1',
    'https://tse4-mm.cn.bing.net/th/id/OIP-C.GAEO6ffBZmqz_Q_FEKiNSwHaKy?pid=ImgDet&w=474&h=690&rs=1',
    // 可以继续添加更多图片...
  ];
  
  const list = Array(pageSize).fill(0).map((_, index) => {
    const id = `${pageNum}_${index}`;
    // 使用与商品详情相同的价格生成逻辑
    const goodDetail = genGood(id);
    
    return {
      id,
      spuId: id,
      title: `商品标题 ${id}`,
      price: goodDetail.minSalePrice,  // 使用最低销售价
      originPrice: goodDetail.maxLinePrice,  // 使用最高标价
      sales: Math.floor(Math.random() * 10000),
      primaryImage: goodDetail.primaryImage,
      // 添加价格区间显示
      minSalePrice: goodDetail.minSalePrice,
      maxSalePrice: goodDetail.maxSalePrice,
    };
  });

  // 根据排序参数处理数据
  if(sortBy === 'price') {
    list.sort((a, b) => sortType === 'asc' ? a.price - b.price : b.price - a.price);
  } else if(sortBy === 'sales') {
    list.sort((a, b) => b.sales - a.sales);
  }

  return {
    list,
    pageNum,
    pageSize,
    total: 100,
    hasMore: pageNum * pageSize < 100
  };
} 