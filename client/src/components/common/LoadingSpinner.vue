<script setup lang="ts">
import { useDataStore } from '@/stores/dataStore';
const store = useDataStore();
</script>

<template>
  <div v-if="store.isLoading" class="global-loading">
    数据加载中...
  </div>
</template>

<style scoped>
.global-loading{
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 20px;
  background: rgba(255,255,255,0.8);
  z-index: 999;
}
</style>