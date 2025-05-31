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
    <FullscreenButton />
  </div>
  <div class="dashboard-bottom-spacer"></div>
</template>

<script setup>
import FullscreenButton from '../components/FullscreenButton.vue';
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  gap: var(--column-gap-sm);
  width: calc(var(--overview-panel-width) + var(--relations-panel-width) + var(--details-panel-width) + 2 * var(--column-gap-sm));
  max-width: 100%;
  height: var(--panel-height);
  margin: 0 var(--layout-side-margin) var(--layout-bottom-margin-lg) var(--layout-side-margin);
  
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
  padding: 0%; /* No padding for the details column */
}

.dashboard-bottom-spacer {
  height: 40px;
  width: 100%;
  pointer-events: none;
}
</style>
