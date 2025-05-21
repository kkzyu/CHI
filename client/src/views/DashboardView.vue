<template>
  <DashboardLayout>
    <template #overview>
      <OverviewPanel />
    </template>
    <template #relations>
      <RelationsPanel />
    </template>
    <template #details>
      <DetailsPanel />
    </template>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import OverviewPanel from '@/components/panels/OverviewPanel.vue';
import RelationsPanel from '@/components/panels/RelationsPanel.vue';
import DetailsPanel from '@/components/panels/DetailsPanel.vue';
</script>

<style scoped>
/* This view component might not need specific styles if layout handles everything */
</style>