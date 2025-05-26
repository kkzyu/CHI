<template>
  <header class="app-header">
    <div class="logo-area">CHI4SocialMedia</div>
    <nav class="navigation-area">
      <!-- Navigation items if any -->
    </nav>
    <div class="user-area">
      <!-- User profile / settings if any -->
    </div>
  </header>
</template>

<script setup>
// No script needed for this basic version
</script>

<style scoped>
.app-header {
  width: 100%;
  height: var(--header-height);
  background-color: #E6EAEE;
  border-bottom: none;
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 var(--space-lg) 0 8px;
  flex-shrink: 0;
}

.logo-area {
  font-family: 'Times New Roman', Times, serif;
  font-weight: 400;
  font-size: 48px;
  color: #000000;
  width: 350px;
  height: 55px;
  line-height: 55px;
  letter-spacing: 0;
  position: relative;
  top: 2px;
  left: 0px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  /* 其他样式可根据需要保留 */
}

/* Add styles for .navigation-area and .user-area if they have content */
.navigation-area, .user-area {
  display: flex;
  align-items: center;
}
</style>