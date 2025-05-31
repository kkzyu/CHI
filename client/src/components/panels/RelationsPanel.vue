<template>
  <div class="panel-content" @contextmenu.prevent="handleUndo">
    <h2 class="panel-title">关系视图</h2>
    <PlatformSwitch />
    <UndoButton />
    <div class="chart-container-full">
      <SankeyDiagram
       :nodes="processedNodes"
       :links="processedLinks"
       :prev-nodes="relations.state.prevNodes"
       :selected-node="relations.state.selected.type === 'node' ? relations.state.selected.ids[0] : null"
       :selected-link="relations.state.selected.type === 'link' ? {source: relations.state.selected.ids[0], target: relations.state.selected.ids[1]} : null"
       @node-toggle="({id,column}) => relations.toggleNode(column, id)"
       @reset-column="handleResetColumn"
       @node-select="handleNodeSelect"
       @link-select="handleLinkSelect"
       @undo-operation="handleUndo" />
    </div>
  </div>
</template>

<script setup>
// import PlaceholderChart from '@/components/charts/PlaceholderChart.vue';
import SankeyDiagram from '@/components/charts/SankeyDiagram.vue';
import { useRelationsStore } from '@/stores/relationsStore';
import PlatformSwitch from '@/components/PlatformSwitch.vue';
import UndoButton from '@/components/common/UndoButton.vue';
import { watch, inject, onMounted, ref, computed } from 'vue';
const relations = useRelationsStore();

// 创建一个展示状态，追踪用户交互
const interactionState = ref({
  hasInteracted: false,
  isTransitioning: false
});

// 处理节点和连接的计算属性，确保过渡流畅
const processedNodes = computed(() => {
  // 如果没有交互，确保至少显示标题部分
  if (!interactionState.value.hasInteracted && !relations.visibleNodes.length) {
    return [];
  }
  
  // 返回实际数据
  return relations.visibleNodes;
});

const processedLinks = computed(() => {
  // 如果没有交互，不显示连接
  if (!interactionState.value.hasInteracted && !relations.visibleLinks.length) {
    return [];
  }
  
  // 返回实际数据
  return relations.visibleLinks;
});

// 在组件挂载时输出调试信息
onMounted(() => {
  console.log('RelationsPanel已挂载');
  console.log('当前历史记录状态:', relations.canUndo, relations.state.history.length);
  
  // 在初始加载完成后设置交互状态
  // 这将触发一个初始的渲染
  setTimeout(() => {
    interactionState.value.hasInteracted = true;
  }, 500);
});

// 获取细节面板刷新方法
const refreshDetailsPanel = inject('refreshDetailsPanel', null);

// 定义一个emit，用于向父组件发送选择变化事件
const emit = defineEmits(['selection-change']);

// 处理标题点击事件，重置对应列的显示状态
function handleResetColumn(columnIndex) {
  console.log(`重置第 ${columnIndex} 列`);
  
  // 标记为已交互并处于过渡状态
  interactionState.value.hasInteracted = true;
  interactionState.value.isTransitioning = true;
  
  // 延迟重置，允许平滑过渡
  setTimeout(() => {
    relations.resetColumn(columnIndex);
    
    // 重置完成后，取消过渡状态
    setTimeout(() => {
      interactionState.value.isTransitioning = false;
    }, 800);
  }, 50);
}

// 处理节点选择事件
function handleNodeSelect(nodeId) {
  console.log(`选择节点: ${nodeId}`);
  
  // 标记为已交互
  interactionState.value.hasInteracted = true;
  
  relations.selectNode(nodeId);
  
  // 获取选中节点相关的论文ID
  const paperIds = relations.getSelectedPaperIds();
  console.log(`选中节点 ${nodeId} 相关的论文数量: ${paperIds.length}`);
  
  // 发射选择变化事件
  emit('selection-change', paperIds);
  
  // 如果提供了刷新细节面板的方法，调用它
  if (refreshDetailsPanel) {
    refreshDetailsPanel(paperIds);
  }
}

// 处理连接选择事件
function handleLinkSelect({source, target}) {
  console.log(`选择连接: ${source} -> ${target}`);
  
  // 标记为已交互
  interactionState.value.hasInteracted = true;
  
  relations.selectLink(source, target);
  
  // 获取选中连接相关的论文ID
  const paperIds = relations.getSelectedPaperIds();
  console.log(`选中连接 ${source} -> ${target} 相关的论文数量: ${paperIds.length}`);
  
  // 发射选择变化事件
  emit('selection-change', paperIds);
  
  // 如果提供了刷新细节面板的方法，调用它
  if (refreshDetailsPanel) {
    refreshDetailsPanel(paperIds);
  }
}

// 处理undo操作
function handleUndo() {
  console.log('执行撤销操作，返回上一级');
  console.log('当前canUndo状态:', relations.canUndo);
  console.log('当前历史记录长度:', relations.state.history.length);
  
  if (relations.canUndo) {
    // 标记为处于过渡状态
    interactionState.value.isTransitioning = true;
    
    // 延迟执行撤销操作，以允许平滑过渡
    setTimeout(() => {
      console.log('开始执行popHistory');
      relations.popHistory();
      console.log('popHistory执行完成');
      
      // 操作完成后重置过渡状态
      setTimeout(() => {
        interactionState.value.isTransitioning = false;
      }, 800);
    }, 50);
  } else {
    console.log('没有可撤销的操作');
  }
}

// 监听选择状态变化，更新细节面板
watch(() => relations.state.selected, (newSelection) => {
  const paperIds = relations.getSelectedPaperIds();
  console.log(`选择状态变化，相关论文数量: ${paperIds.length}`);
  
  // 只有在有选中的论文时才发射事件和刷新面板
  if (paperIds.length > 0) {
    // 发射选择变化事件
    emit('selection-change', paperIds);
    
    // 如果提供了刷新细节面板的方法，调用它
    if (refreshDetailsPanel) {
      refreshDetailsPanel(paperIds);
    }
  }
}, { deep: true });
</script>

<style scoped>
.panel-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.panel-title {
  font-size: var(--font-size-panel-title);
  color: var(--color-text-primary);
  margin-bottom: var(--space-md);
  flex-shrink: 0;
}
.chart-container-full {
  flex-grow: 1; /* Chart takes all available vertical space */
  display: flex; /* To make placeholder chart or actual chart fill */
}
.chart-container-full > :deep(*) { /* Ensure child (PlaceholderChart or actual ECharts) fills this */
  width: 100%;
  height: 100%;
}
</style>