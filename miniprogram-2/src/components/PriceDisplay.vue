<template>
  <div class="price-display" :class="[type, size]">
    <template v-if="loading">
      <div class="price-skeleton"></div>
    </template>
    <template v-else>
      <span class="current-price">¥{{ formatPrice(price.currentPrice) }}</span>
      <span v-if="showOriginal && price.originalPrice !== price.currentPrice" 
            class="original-price">¥{{ formatPrice(price.originalPrice) }}</span>
      <span v-if="showTag && price.promotionPrice" class="promotion-tag">促销</span>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import { priceManager } from '@/services/PriceManager';

export default defineComponent({
  name: 'PriceDisplay',
  
  props: {
    skuId: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'normal',
      validator: (value: string) => ['normal', 'member', 'promotion'].includes(value)
    },
    size: {
      type: String,
      default: 'normal',
      validator: (value: string) => ['small', 'normal', 'large'].includes(value)
    },
    showOriginal: {
      type: Boolean,
      default: false
    },
    showTag: {
      type: Boolean,
      default: false
    }
  },
  
  setup(props) {
    const price = ref<any>(null);
    const loading = ref(true);
    
    const updatePrice = async () => {
      loading.value = true;
      try {
        price.value = await priceManager.getPriceInfo(props.skuId);
      } finally {
        loading.value = false;
      }
    };
    
    const handlePriceChange = (changes: any[]) => {
      const changed = changes.find(item => item.skuId === props.skuId);
      if (changed) {
        price.value = changed;
      }
    };
    
    onMounted(() => {
      updatePrice();
      priceManager.subscribePriceChange(handlePriceChange);
    });
    
    onUnmounted(() => {
      priceManager.unsubscribePriceChange(handlePriceChange);
    });
    
    const formatPrice = (price: number) => {
      return price.toFixed(2);
    };
    
    return {
      price,
      loading,
      formatPrice
    };
  }
});
</script>

<style scoped>
.price-display {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
}

.current-price {
  color: var(--color-primary);
  font-weight: bold;
}

.original-price {
  color: var(--color-text-secondary);
  text-decoration: line-through;
  font-size: 0.8em;
}

.promotion-tag {
  color: var(--color-primary);
  font-size: 0.8em;
  border: 1px solid currentColor;
  padding: 0 4px;
  border-radius: 2px;
}

.price-skeleton {
  width: 60px;
  height: 16px;
  background: #f0f0f0;
  border-radius: 2px;
  animation: skeleton-loading 1.5s infinite;
}

.small {
  font-size: var(--font-size-small);
}

.normal {
  font-size: var(--font-size-normal);
}

.large {
  font-size: var(--font-size-large);
}

@keyframes skeleton-loading {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.6;
  }
}
</style> 