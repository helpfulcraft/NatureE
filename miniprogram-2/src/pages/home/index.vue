<template>
  <div class="product-item" v-for="item in products" :key="item.skuId">
    <img :src="item.image" :alt="item.title">
    <h3>{{ item.title }}</h3>
    <price-display
      :sku-id="item.skuId"
      type="normal"
      size="large"
      :show-original="true"
      :show-tag="true"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import PriceDisplay from '@/components/PriceDisplay.vue';
import { priceManager } from '@/services/PriceManager';

export default defineComponent({
  components: {
    PriceDisplay
  },
  
  setup() {
    onMounted(async () => {
      // 预加载所有商品价格
      const skuIds = products.value.map(item => item.skuId);
      await priceManager.batchGetPriceInfo(skuIds);
    });
  }
});
</script> 