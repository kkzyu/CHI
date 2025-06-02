<!-- filepath: client/src/components/charts/Legend.vue -->
<template>
  <div class="custom-legend">
    <div v-for="item in items" :key="item.id || item.name" class="legend-item">
      <span
        class="legend-color"
        :style="{ background: item.itemStyle?.color || item.color }"
      ></span>
      <span class="legend-label">{{ item.name }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({ items: Array });
</script>

<style scoped>
.custom-legend {
  margin-top: 12px;
}
.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-right: 8px;
  border: 1px solid #eee;
  flex-shrink: 0;
}
.legend-label {
  font-size: 13px;
  color: #333;
  white-space: normal; /* 允许完整显示 */
  word-break: break-all; /* 长标签自动换行 */
}
</style>