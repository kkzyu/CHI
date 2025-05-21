<template>
  <header class="app-header">
    <div class="logo-area">CHI Paper Explorer</div>
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
  width: 1920px;
  height: var(--header-height);
  background-color: var(--color-background-header);
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-lg);
  flex-shrink: 0; /* Prevent header from shrinking */
  box-shadow: var(--shadow-sm);
}

.logo-area {
  font-size: var(--font-size-header-title);
  font-weight: bold;
  color: var(--color-primary);
}

/* Add styles for .navigation-area and .user-area if they have content */
.navigation-area, .user-area {
  display: flex;
  align-items: center;
}
</style>