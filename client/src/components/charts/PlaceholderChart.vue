<template>
  <div class="placeholder-chart" :style="{ height: chartHeight }">
    <span class="placeholder-text">{{ title }}</span>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'Chart Placeholder'
  },
  chartHeight: {
    type: String,
    default: '200px' // Default height if not specified
  }
});
</script>

<style scoped>
.placeholder-chart {
  width: 100%;
  background-color: var(--color-placeholder-bg);
  border: 1px dashed var(--color-border);
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-placeholder-text);
  font-size: var(--font-size-sm);
  text-align: center;
  padding: var(--space-md);
}
.placeholder-text {
  /* Styles for the text inside placeholder if needed */
}
</style>