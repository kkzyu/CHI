<template>
  <button 
    class="fullscreen-button" 
    @click="toggleFullscreen" 
    :title="isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
  >
    <svg v-if="!isFullscreen" class="fullscreen-icon" viewBox="0 0 24 24" width="24" height="24">
      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
    </svg>
    <svg v-else class="fullscreen-icon" viewBox="0 0 24 24" width="24" height="24">
      <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
    </svg>
  </button>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import screenfull from 'screenfull';

const isFullscreen = ref(false);

const toggleFullscreen = () => {
  if (screenfull.isEnabled) {
    screenfull.toggle();
  }
};

const updateFullscreenState = () => {
  isFullscreen.value = screenfull.isFullscreen;
};

onMounted(() => {
  if (screenfull.isEnabled) {
    screenfull.on('change', updateFullscreenState);
  }
});

onUnmounted(() => {
  if (screenfull.isEnabled) {
    screenfull.off('change', updateFullscreenState);
  }
});
</script>

<style scoped>
.fullscreen-button {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  background-color: var(--color-background-panel);
  color: var(--color-text-primary);
  border: none;
  border-radius: var(--border-radius-sm);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: background-color 0.2s;
}

.fullscreen-button:hover {
  background-color: var(--color-background-hover);
}

.fullscreen-icon {
  fill: currentColor;
}
</style> 