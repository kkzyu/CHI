<template>
  <div id="app-container">
    <AppHeader />
    <main class="main-content-area">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import AppHeader from '@/components/layout/AppHeader.vue';
</script>

<style>
/* Import global styles. Ensure variables are loaded first if not done in main.js */
/* Vite typically handles CSS imports well from anywhere. */
/* If you prefer, import base.css and variables.css in main.js */
@import '@/assets/styles/variables.css';
@import '@/assets/styles/base.css';

#app-container {
  width: 1920px;
  height: 1080px;
  display: flex;
  flex-direction: column;
  background-color: var(--color-background-page);
}

.main-content-area {
  flex-grow: 1;
  height: var(--main-content-height);
  /* Padding around the three columns if needed, or handled by DashboardLayout */
  /* Example: padding: var(--space-lg) calc((1920px - (var(--overview-panel-width) + var(--relations-panel-width) + var(--details-panel-width) + 2 * var(--column-gap))) / 2); */
  /* Simpler: center the DashboardLayout if it's narrower than 1920px */
  display: flex; /* To center DashboardLayout if it has fixed total width */
  justify-content: center; /* Center content horizontally */
  align-items: flex-start; /* Align content to the top, considering panel height */
  padding-top: calc((var(--main-content-height) - var(--panel-height)) / 2); /* Center panels vertically */
  padding-bottom: calc((var(--main-content-height) - var(--panel-height)) / 2);
}
</style>