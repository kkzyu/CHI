<template>
  <div id="app-container">
    <main class="main-content-area">
      <router-view />
      <GlobalLoading />
    </main>
  </div>
</template>

<script setup>
import GlobalLoading from '@/components/common/LoadingSpinner.vue';
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
  background-color: #E6EAEE;
}

.main-content-area {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-bottom: 0;
}
</style>