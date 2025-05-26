<template>
  <div class="dashboard-page">
    <AppHeader class="dashboard-header" />
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
  </div>
</template>

<script setup>
import AppHeader from '@/components/layout/AppHeader.vue';
import { useRelationsStore } from '@/stores/relationsStore';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import OverviewPanel from '@/components/panels/OverviewPanel.vue';
import RelationsPanel from '@/components/panels/RelationsPanel.vue';
import DetailsPanel from '@/components/panels/DetailsPanel.vue';
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 40px;
}
.dashboard-header {
  width: 100%;
  max-width: 1872px;
  margin-bottom: 12px;
}
</style>