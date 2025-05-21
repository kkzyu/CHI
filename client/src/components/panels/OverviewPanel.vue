<template>
  <div class="panel-content">
    <h2 class="panel-title">概览视图</h2>
    <div class="charts-container">
      <PlaceholderChart title="堆叠柱状图 Placeholder" chart-height="300px" />
      <PlaceholderChart title="饼图 A Placeholder" chart-height="250px" />
      <PlaceholderChart title="饼图 B Placeholder" chart-height="250px" />
      <!-- Add more charts as needed, panel will scroll -->
      <PlaceholderChart title="另一个图表" chart-height="200px" />
    </div>
  </div>
</template>

<script setup>
import PlaceholderChart from '@/components/charts/PlaceholderChart.vue';
</script>

<style scoped>
.panel-content {
  display: flex;
  flex-direction: column;
  height: 100%; /* Take full height of the slot from DashboardLayout */
}
.panel-title {
  font-size: var(--font-size-panel-title);
  color: var(--color-text-primary);
  margin-bottom: var(--space-md);
  flex-shrink: 0; /* Prevent title from shrinking */
}
.charts-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  flex-grow: 1; /* Allow this container to take remaining space */
  /* overflow-y: auto;  The parent .overview-column in DashboardLayout handles scrolling */
}
</style>