/* eslint-disable no-param-reassign */
import { config } from '../../config/index';
import { request } from '../../utils/request';
import errorHandler from '../../utils/error-handler';
import performanceMonitor from '../../utils/performance-monitor';
import { genGood } from '../../model/goods/good';  // 导入商品详情生成函数

// 商品图片列表
const goodsImages = [
  'https://tse3-mm.cn.bing.net/th/id/OIP-C.SPYMlCcMXn6atWcDeMDOcwHaKt?rs=1&pid=ImgDetMain',
  'https://tse4-mm.cn.bing.net/th/id/OIP-C.iJQReylpjWNEQbn_Z0tZOAHaL6?pid=ImgDet&w=474&h=762&rs=1',
  'https://tse3-mm.cn.bing.net/th/id/OIP-C.Jj0JGqbDln3ElPORsl-zQgHaLW?pid=ImgDet&w=474&h=726&rs=1',
  'https://tse4-mm.cn.bing.net/th/id/OIP-C.GAEO6ffBZmqz_Q_FEKiNSwHaKy?pid=ImgDet&w=474&h=690&rs=1'
];

// 分类商品名称映射
const categoryNames = {
  1: '民族服装',
  2: '苗族服饰',
  3: '彝族服饰',
  4: '傣族服饰',
  5: '白族服饰',
  6: '纳西服饰',
  7: '壮族服饰',
  8: '瑶族服饰',
  9: '布依服饰',
  10: '哈尼服饰',
  11: '民族配饰'
};

/** 获取商品列表（模拟数据） */
async function mockFetchGoodsList(params = {}) {
  const { pageSize = 10, pageNum = 1, sortBy = 'default', sortType = 'desc' } = params;
  
  // 模拟加载延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 生成商品列表
  const list = [];
  const startIndex = (pageNum - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  for (let i = startIndex; i < endIndex; i++) {
    // 使用与商品详情相同的价格生成逻辑
    const spuId = `goods_${i + 1}`;
    const goodDetail = genGood(spuId);
    
    if (goodDetail) {
      list.push({
        id: spuId,
        name: goodDetail.title,
        price: goodDetail.minSalePrice,  // 保持单位为分
        originalPrice: goodDetail.maxLinePrice,  // 保持单位为分
        imgUrl: goodDetail.primaryImage,
        sales: Math.floor(Math.random() * 1000),
        inventory: Math.floor(Math.random() * 100 + 50),
        tags: ['新品', '热销'],
        description: goodDetail.desc[0] || '精美民族服饰，传统与时尚的完美结合'
      });
    }
  }

  // 根据排序参数处理数据
  if (sortBy !== 'default') {
    list.sort((a, b) => {
      const compareResult = sortType === 'asc' ? 
        a[sortBy] - b[sortBy] : 
        b[sortBy] - a[sortBy];
      return compareResult;
    });
  }

  // 模拟总数和是否有更多
  const total = 100;
  const hasMore = endIndex < total;

  return {
    list,
    total,
    pageNum,
    pageSize,
    hasMore
  };
}

/** 获取商品列表 */
export const fetchGoodsList = async (params = {}) => {
  const { 
    pageNum = 1, 
    pageSize = 20, 
    categoryId = '', 
    keyword = '',
    sortBy = 'default',
    sortType = 'desc'
  } = params;

  try {
    // 模拟加载延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 生成商品列表
    const list = [];
    const total = 100;
    let filteredCount = 0;
    let currentIndex = 0;
    
    // 继续生成商品直到达到所需数量或已生成所有商品
    while (list.length < pageSize && currentIndex < total) {
      const spuId = `goods_${currentIndex + 1}`;
      const goodDetail = genGood(spuId);
      
      if (goodDetail) {
        // 根据分类ID筛选商品
        const currentCategoryId = Math.floor(currentIndex / 9) + 1; // 每个分类9个商品
        
        // 检查是否符合分类和关键词条件
        const matchesCategory = !categoryId || categoryId === '0' || parseInt(categoryId) === currentCategoryId;
        const matchesKeyword = !keyword || 
          goodDetail.title.includes(keyword) || 
          (categoryNames[currentCategoryId] && categoryNames[currentCategoryId].includes(keyword));
        
        if (matchesCategory && matchesKeyword) {
          filteredCount++;
          
          // 只添加在当前页范围内的商品
          if (filteredCount > (pageNum - 1) * pageSize && filteredCount <= pageNum * pageSize) {
            // 使用 Picsum Photos 生成随机图片
            const randomImageId = Math.floor(Math.random() * 1000) + 1;
            const imageUrl = `https://picsum.photos/300/400?random=${randomImageId}`;
            
            list.push({
              id: spuId,
              spuId,
              name: `${categoryNames[currentCategoryId] || '民族服饰'}-${currentIndex + 1}`,
              title: `${categoryNames[currentCategoryId] || '民族服饰'}-精品${currentIndex + 1}`,
              price: goodDetail.minSalePrice,
              minSalePrice: goodDetail.minSalePrice,
              originalPrice: goodDetail.maxLinePrice,
              image: imageUrl,
              primaryImage: imageUrl,
              categoryId: currentCategoryId,
              stock: Math.floor(Math.random() * 100) + 50,
              sales: Math.floor(Math.random() * 1000),
              tags: ['新品', '热销'],
              description: `${categoryNames[currentCategoryId] || '民族服饰'}，传统与时尚的完美结合`
            });
          }
        }
      }
      currentIndex++;
    }

    // 根据排序参数处理数据
    if (sortBy !== 'default') {
      list.sort((a, b) => {
        const compareResult = sortType === 'asc' ? 
          a[sortBy] - b[sortBy] : 
          b[sortBy] - a[sortBy];
        return compareResult;
      });
    }

    return {
      list,
      total: filteredCount,
      pageNum,
      pageSize,
      hasMore: filteredCount > pageNum * pageSize
    };
  } catch (err) {
    console.error('获取商品列表失败:', err);
    return {
      list: [],
      total: 0,
      pageNum,
      pageSize,
      hasMore: false
    };
  }
};
