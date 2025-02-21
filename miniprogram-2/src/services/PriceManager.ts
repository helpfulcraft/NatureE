interface PriceInfo {
  skuId: string;
  spuId: string;
  originalPrice: number;    // 原价
  currentPrice: number;     // 当前价格
  memberPrice?: number;     // 会员价
  promotionPrice?: number;  // 促销价
  updateTime: number;       // 更新时间戳
}

class PriceManager {
  private subscribers: Array<(changes: PriceInfo[]) => void> = [];
  private cache: Map<string, PriceInfo> = new Map();
  private readonly maxAge = 5 * 60 * 1000; // 5分钟缓存
  
  // 获取商品价格信息
  async getPriceInfo(skuId: string): Promise<PriceInfo> {
    const cached = this.cache.get(skuId);
    if (cached && Date.now() - cached.updateTime < this.maxAge) {
      return cached;
    }
    
    const price = await this.fetchPriceFromServer(skuId);
    this.cache.set(skuId, price);
    return price;
  }
  
  // 批量获取价格信息
  async batchGetPriceInfo(skuIds: string[]): Promise<Map<string, PriceInfo>> {
    const result = new Map<string, PriceInfo>();
    const needFetch = [];
    
    for (const skuId of skuIds) {
      const cached = this.cache.get(skuId);
      if (cached && Date.now() - cached.updateTime < this.maxAge) {
        result.set(skuId, cached);
      } else {
        needFetch.push(skuId);
      }
    }
    
    if (needFetch.length > 0) {
      const prices = await this.batchFetchPriceFromServer(needFetch);
      prices.forEach((price, skuId) => {
        this.cache.set(skuId, price);
        result.set(skuId, price);
      });
    }
    
    return result;
  }
  
  // 订阅价格变更
  subscribePriceChange(callback: (changes: PriceInfo[]) => void): void {
    this.subscribers.push(callback);
  }
  
  // 取消订阅
  unsubscribePriceChange(callback: Function): void {
    this.subscribers = this.subscribers.filter(cb => cb !== callback);
  }
  
  // 处理价格变更
  private handlePriceChange(changes: PriceInfo[]): void {
    changes.forEach(price => {
      this.cache.set(price.skuId, price);
    });
    
    this.subscribers.forEach(callback => {
      callback(changes);
    });
  }
  
  // 从服务器获取价格
  private async fetchPriceFromServer(skuId: string): Promise<PriceInfo> {
    // 实现具体的API调用
    return {} as PriceInfo;
  }
  
  // 批量从服务器获取价格
  private async batchFetchPriceFromServer(skuIds: string[]): Promise<Map<string, PriceInfo>> {
    // 实现具体的批量API调用
    return new Map();
  }
}

export const priceManager = new PriceManager(); 