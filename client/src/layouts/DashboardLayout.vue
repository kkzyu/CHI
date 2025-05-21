<template>
  <div class="dashboard-layout">
    <div class="column overview-column">
      <slot name="overview"></slot>
    </div>
    <div class="column relations-column">
      <slot name="relations"></slot>
    </div>
    <div class="column details-column">
      <slot name="details"></slot>
    </div>
  </div>
</template>

<script setup>
// No script needed for this layout component
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  gap: var(--column-gap);
  width: calc(var(--overview-panel-width) + var(--relations-panel-width) + var(--details-panel-width) + 2 * var(--column-gap));
  max-width: 100%; /* Ensure it doesn't overflow its container in App.vue */
  height: var(--panel-height); /* Fixed height for all columns' content area */
}

.column {
  height: 100%; /* Ensure column takes full panel height */
  background-color: var(--color-background-panel);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  display: flex; /* To allow panel content to flex if needed */
  flex-direction: column; /* Stack title and content vertically */
  padding: var(--space-md); /* Inner padding for panel content */
}

.overview-column {
  width: var(--overview-panel-width);
  overflow-y: auto; /* Scrollable */
}

.relations-column {
  width: var(--relations-panel-width);
  overflow-y: hidden; /* Not scrollable as per requirement */
}

.details-column {
  width: var(--details-panel-width);
  overflow-y: auto; /* Scrollable */
}
</style>