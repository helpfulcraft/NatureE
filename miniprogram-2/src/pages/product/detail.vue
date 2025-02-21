<template>
  <div class="product-detail">
    <!-- 其他商品信息 -->
    <div class="price-section">
      <price-display
        :sku-id="product.skuId"
        type="normal"
        size="large"
        :show-original="true"
        :show-tag="true"
      />
    </div>
    <!-- 其他内容 -->
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted } from 'vue';
import PriceDisplay from '@/components/PriceDisplay.vue';
import { priceManager } from '@/services/PriceManager';

export default defineComponent({
  components: {
    PriceDisplay
  },
  
  props: {
    skuId: {
      type: String,
      required: true
    }
  },
  
  setup(props) {
    const product = ref<any>(null);
    
    const updateProductPrice = async (skuId: string) => {
      try {
        const priceInfo = await priceManager.getPriceInfo(skuId);
        if (product.value) {
          product.value = {
            ...product.value,
            price: priceInfo.currentPrice,
            originalPrice: priceInfo.originalPrice
          };
        }
      } catch (error) {
        console.error('Failed to update product price:', error);
      }
    };
    
    // 监听 SKU 变化
    watch(() => props.skuId, async (newSkuId) => {
      if (newSkuId) {
        await updateProductPrice(newSkuId);
      }
    }, { immediate: true });
    
    // 订阅价格变更
    onMounted(() => {
      priceManager.subscribePriceChange((changes) => {
        const currentProduct = changes.find(item => item.skuId === props.skuId);
        if (currentProduct) {
          updateProductPrice(props.skuId);
        }
      });
    });
    
    return {
      product
    };
  }
});
</script> 