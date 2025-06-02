<template>
  <div class="panel-content" @contextmenu.prevent="handleUndo">
    <div class="panel-title-bar">
      <div class="title-group">
        <svg width="40" height="40" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" class="title-icon">
          <path d="M4.49999 29.25C4.20163 29.25 3.91548 29.3685 3.7045 29.5795C3.49352 29.7905 3.37499 30.0766 3.37499 30.375V34.875C3.37499 35.1734 3.49352 35.4595 3.7045 35.6705C3.91548 35.8815 4.20163 36 4.49999 36C4.79836 36 5.08451 35.8815 5.29549 35.6705C5.50647 35.4595 5.625 35.1734 5.625 34.875V30.375C5.625 30.0766 5.50647 29.7905 5.29549 29.5795C5.08451 29.3685 4.79836 29.25 4.49999 29.25ZM31.5 22.5C31.7984 22.5 32.0845 22.3815 32.2955 22.1705C32.5065 21.9595 32.625 21.6734 32.625 21.375V10.125C32.625 9.82663 32.5065 9.54048 32.2955 9.3295C32.0845 9.11853 31.7984 9 31.5 9C31.2016 9 30.9155 9.11853 30.7045 9.3295C30.4935 9.54048 30.375 9.82663 30.375 10.125V21.375C30.375 21.6734 30.4935 21.9595 30.7045 22.1705C30.9155 22.3815 31.2016 22.5 31.5 22.5ZM31.5 6.75C31.7984 6.75 32.0845 6.63147 32.2955 6.4205C32.5065 6.20952 32.625 5.92337 32.625 5.625V1.125C32.625 0.826631 32.5065 0.540483 32.2955 0.329505C32.0845 0.118526 31.7984 0 31.5 0C31.2016 0 30.9155 0.118526 30.7045 0.329505C30.4935 0.540483 30.375 0.826631 30.375 1.125V5.625C30.375 5.92337 30.4935 6.20952 30.7045 6.4205C30.9155 6.63147 31.2016 6.75 31.5 6.75ZM34.875 28.125C34.8706 27.3384 34.5915 26.5781 34.0861 25.9754C33.5807 25.3727 32.8806 24.9654 32.1068 24.824C31.333 24.6826 30.5342 24.8159 29.8482 25.2009C29.1623 25.5859 28.6324 26.1983 28.35 26.9325C26.7219 26.7762 25.1644 26.191 23.8363 25.2364C22.5082 24.2818 21.457 22.9921 20.79 21.4988L17.2687 13.6237C16.4224 11.743 15.0863 10.1243 13.4001 8.93684C11.7139 7.74938 9.73964 7.03684 7.68374 6.87375C7.53061 6.37792 7.26519 5.92408 6.90813 5.54751C6.55107 5.17094 6.11198 4.88178 5.625 4.7025V1.125C5.625 0.826631 5.50647 0.540483 5.29549 0.329505C5.08451 0.118526 4.79836 0 4.49999 0C4.20163 0 3.91548 0.118526 3.7045 0.329505C3.49352 0.540483 3.37499 0.826631 3.37499 1.125V4.7025C2.72345 4.93898 2.16051 5.37033 1.76269 5.93794C1.36487 6.50554 1.15146 7.18187 1.15146 7.875C1.15146 8.56813 1.36487 9.24446 1.76269 9.81206C2.16051 10.3797 2.72345 10.811 3.37499 11.0475V25.875C3.37499 26.1734 3.49352 26.4595 3.7045 26.6705C3.91548 26.8815 4.20163 27 4.49999 27C4.79836 27 5.08451 26.8815 5.29549 26.6705C5.50647 26.4595 5.625 26.1734 5.625 25.875V11.0475C6.08582 10.8839 6.50558 10.6221 6.85523 10.2802C7.20488 9.93831 7.47606 9.52453 7.65 9.0675C9.27807 9.22376 10.8356 9.80902 12.1637 10.7636C13.4918 11.7182 14.543 13.0079 15.21 14.5013L18.7312 22.3762C19.5775 24.257 20.9137 25.8757 22.5999 27.0632C24.2861 28.2506 26.2604 28.9632 28.3162 29.1262C28.4694 29.6221 28.7348 30.0759 29.0919 30.4525C29.4489 30.8291 29.888 31.1182 30.375 31.2975V34.875C30.375 35.1734 30.4935 35.4595 30.7045 35.6705C30.9155 35.8815 31.2016 36 31.5 36C31.7984 36 32.0845 35.8815 32.2955 35.6705C32.5065 35.4595 32.625 35.1734 32.625 34.875V31.2975C33.2815 31.0654 33.8501 30.6359 34.2529 30.0679C34.6558 29.5 34.873 28.8213 34.875 28.125ZM4.49999 9C4.27749 9 4.05998 8.93402 3.87498 8.8104C3.68997 8.68679 3.54578 8.51109 3.46063 8.30552C3.37548 8.09995 3.3532 7.87375 3.39661 7.65552C3.44002 7.43729 3.54717 7.23684 3.7045 7.0795C3.86183 6.92217 4.06229 6.81502 4.28052 6.77162C4.49875 6.72821 4.72495 6.75049 4.93051 6.83564C5.13608 6.92078 5.31178 7.06498 5.4354 7.24998C5.55901 7.43499 5.625 7.6525 5.625 7.875C5.625 8.17337 5.50647 8.45952 5.29549 8.6705C5.08451 8.88147 4.79836 9 4.49999 9ZM31.5 29.25C31.2775 29.25 31.06 29.184 30.875 29.0604C30.69 28.9368 30.5458 28.7611 30.4606 28.5555C30.3755 28.35 30.3532 28.1238 30.3966 27.9055C30.44 27.6873 30.5472 27.4868 30.7045 27.3295C30.8618 27.1722 31.0623 27.065 31.2805 27.0216C31.4987 26.9782 31.7249 27.0005 31.9305 27.0856C32.1361 27.1708 32.3118 27.315 32.4354 27.5C32.559 27.685 32.625 27.9025 32.625 28.125C32.625 28.4234 32.5065 28.7095 32.2955 28.9205C32.0845 29.1315 31.7984 29.25 31.5 29.25Z" fill="black"/>
          <path d="M4.5 31.5C3.83249 31.5 3.17997 31.3021 2.62495 30.9312C2.06994 30.5604 1.63735 30.0333 1.38191 29.4166C1.12646 28.7999 1.05963 28.1213 1.18985 27.4666C1.32008 26.8119 1.64151 26.2105 2.11352 25.7385C2.58552 25.2665 3.18689 24.9451 3.84157 24.8149C4.49626 24.6846 5.17486 24.7515 5.79156 25.0069C6.40826 25.2624 6.93536 25.6949 7.30621 26.25C7.67706 26.805 7.875 27.4575 7.875 28.125C7.875 29.0201 7.51942 29.8786 6.88649 30.5115C6.25355 31.1444 5.39511 31.5 4.5 31.5ZM4.5 27C4.2775 27 4.05999 27.066 3.87499 27.1896C3.68998 27.3132 3.54579 27.4889 3.46064 27.6945C3.37549 27.9001 3.35321 28.1263 3.39662 28.3445C3.44003 28.5627 3.54717 28.7632 3.70451 28.9205C3.86184 29.0778 4.0623 29.185 4.28052 29.2284C4.49875 29.2718 4.72495 29.2495 4.93052 29.1644C5.13609 29.0792 5.31179 28.935 5.4354 28.75C5.55902 28.565 5.625 28.3475 5.625 28.125C5.625 27.8266 5.50647 27.5405 5.2955 27.3295C5.08452 27.1185 4.79837 27 4.5 27ZM31.5 11.25C30.8325 11.25 30.18 11.0521 29.625 10.6812C29.0699 10.3104 28.6374 9.78326 28.3819 9.16656C28.1265 8.54986 28.0596 7.87126 28.1899 7.21657C28.3201 6.56189 28.6415 5.96052 29.1135 5.48852C29.5855 5.01651 30.1869 4.69508 30.8416 4.56485C31.4963 4.43463 32.1749 4.50146 32.7916 4.75691C33.4083 5.01235 33.9354 5.44494 34.3062 5.99995C34.6771 6.55497 34.875 7.20749 34.875 7.875C34.875 8.77011 34.5194 9.62855 33.8865 10.2615C33.2536 10.8944 32.3951 11.25 31.5 11.25ZM31.5 6.75C31.2775 6.75 31.06 6.81598 30.875 6.9396C30.69 7.06322 30.5458 7.23892 30.4606 7.44448C30.3755 7.65005 30.3532 7.87625 30.3966 8.09448C30.44 8.31271 30.5472 8.51316 30.7045 8.6705C30.8618 8.82783 31.0623 8.93498 31.2805 8.97839C31.4988 9.02179 31.725 8.99952 31.9305 8.91437C32.1361 8.82922 32.3118 8.68502 32.4354 8.50002C32.559 8.31501 32.625 8.09751 32.625 7.875C32.625 7.57663 32.5065 7.29049 32.2955 7.07951C32.0845 6.86853 31.7984 6.75 31.5 6.75Z" fill="black"/>
          <path d="M6.75 29.25C6.45163 29.25 6.16548 29.1315 5.95451 28.9205C5.74353 28.7095 5.625 28.4234 5.625 28.125C5.625 27.8266 5.74353 27.5405 5.95451 27.3295C6.16548 27.1185 6.45163 27 6.75 27C8.54084 26.9982 10.2928 26.4777 11.7942 25.5014C13.2955 24.5252 14.4819 23.1349 15.21 21.4988L18.7312 13.6237C19.6309 11.5827 21.1037 9.84664 22.9709 8.62645C24.8382 7.40627 27.0195 6.7544 29.25 6.75C29.5484 6.75 29.8345 6.86853 30.0455 7.07951C30.2565 7.29048 30.375 7.57663 30.375 7.875C30.375 8.17337 30.2565 8.45952 30.0455 8.67049C29.8345 8.88147 29.5484 9 29.25 9C27.4592 9.0018 25.7072 9.5223 24.2058 10.4986C22.7045 11.4748 21.5181 12.8651 20.79 14.5013L17.2688 22.3762C16.3691 24.4173 14.8963 26.1534 13.0291 27.3735C11.1619 28.5937 8.98055 29.2456 6.75 29.25Z" fill="black"/>
        </svg>
        <span class="title-text">关系视图</span>
      </div>
    </div>
    <PlatformSwitch />
    <div class="chart-container-full">
      <SankeyDiagram
       :nodes="filteredNodes"
       :links="filteredLinks"
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
import { watch, inject, onMounted, ref, computed } from 'vue';
const relations = useRelationsStore();

// 创建一个展示状态，追踪用户交互
const interactionState = ref({
  hasInteracted: true,
  isTransitioning: true
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

// 新增：过滤节点，只保留有连接的节点
const filteredNodes = computed(() => {
  const nodes = processedNodes.value;
  const links = processedLinks.value;
  
  if (!nodes.length || !links.length) return [];
  
  // 收集所有在links中出现的节点ID
  const nodeSet = new Set();
  links.forEach(link => {
    if (typeof link.source === 'string') nodeSet.add(link.source);
    if (typeof link.target === 'string') nodeSet.add(link.target);
    if (typeof link.source === 'object' && link.source && 'id' in link.source) nodeSet.add(link.source.id);
    if (typeof link.target === 'object' && link.target && 'id' in link.target) nodeSet.add(link.target.id);
  });
  
  // 只保留在连接中出现的节点
  return nodes.filter(node => nodeSet.has(node.id));
});

// 过滤后的连接，确保连接的两端都在过滤后的节点中
const filteredLinks = computed(() => {
  const links = processedLinks.value;
  const nodeIds = new Set(filteredNodes.value.map(n => n.id));
  
  return links.filter(link => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source?.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target?.id;
    return nodeIds.has(sourceId) && nodeIds.has(targetId);
  });
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
  background-color: white;
}
.panel-title-bar {
  display: flex;
  align-items: center;
  margin-bottom: var(--space-md);
  flex-shrink: 0;
  background-color: white;
  padding: 5px 8px 12px 1px;
  width: 100%;
  box-sizing: border-box;
  border-bottom: none;
}
.title-group {
  display: flex;
  align-items: center;
  color: var(--color-text-primary, #333);
  font-size: var(--font-size-panel-title, 1.5rem);
}
.title-icon {
  width: 1.2em;
  height: 1.2em;
  margin-right: var(--space-sm, 8px);
}
.title-text {
  font-weight: 600;
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