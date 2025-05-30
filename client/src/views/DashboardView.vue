<template>
  <div class="dashboard-page">
    <AppHeader class="dashboard-header" />
    <DashboardLayout>
      <template #overview>
        <OverviewPanel />
      </template>
      <template #relations>
        <RelationsPanel @selection-change="handleSelectionChange" />
      </template>
      <template #details>
        <DetailsPanel ref="detailsPanelRef" />
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
import { ref, provide } from 'vue';

// 获取关系存储和细节面板的引用
const relationsStore = useRelationsStore();
const detailsPanelRef = ref(null);

// 定义处理选择变化的方法
function handleSelectionChange(paperIds) {
  // 如果细节面板已渲染，直接调用其刷新方法
  if (detailsPanelRef.value && detailsPanelRef.value.refreshPanelWithIds) {
    detailsPanelRef.value.refreshPanelWithIds(paperIds);
  }
}

// 提供一个方法给子组件，用于获取选定论文IDs
provide('getSelectedPaperIds', () => {
  return relationsStore.getSelectedPaperIds();
});

// 提供一个刷新细节面板的方法
provide('refreshDetailsPanel', (paperIds) => {
  handleSelectionChange(paperIds);
});
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
  max-width: 2872px;
  margin-bottom: 12px;
}
</style>