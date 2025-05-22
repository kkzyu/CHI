<template>
  <div class="panel-content">
    <h2 class="panel-title">关系视图</h2>
    <div class="chart-container-full">
      <SankeyDiagram />
    </div>
  </div>
</template>

<script setup>
// import PlaceholderChart from '@/components/charts/PlaceholderChart.vue';
import SankeyDiagram from '@/components/charts/SankeyDiagram.vue';
</script>

<style scoped>
.panel-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.panel-title {
  font-size: var(--font-size-panel-title);
  color: var(--color-text-primary);
  margin-bottom: var(--space-md);
  flex-shrink: 0;
}
.chart-container-full {
  flex-grow: 1; /* Chart takes all available vertical space */
  display: flex; /* To make placeholder chart or actual chart fill */
}
.chart-container-full > :deep(*) { /* Ensure child (PlaceholderChart or actual ECharts) fills this */
  width: 100%;
  height: 100%;
}
</style>