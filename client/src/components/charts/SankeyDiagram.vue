<template>
  <div class="sankey-diagram-container">
    <div ref="sankeyChartRef" class="sankey-chart"></div>
    <div v-if="isLoading" class="loading-overlay">Loading Sankey Data...</div>
    <div v-if="errorMsg" class="error-message">{{ errorMsg }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import * as echarts from 'echarts/core';
import { SankeyChart } from 'echarts/charts';
import { TooltipComponent, TitleComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { useDataStore } from '@/stores/dataStore'; 

// 注册ECharts模块
echarts.use([
  SankeyChart,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  CanvasRenderer
]);

const dataStore = useDataStore();
const sankeyChartRef = ref(null); // DOM引用
let chartInstance = null;
const isLoading = ref(false);
const errorMsg = ref(null);

// 我们将在这里准备ECharts的option
const chartOption = ref({});

onMounted(() => {
  if (sankeyChartRef.value) {
    chartInstance = echarts.init(sankeyChartRef.value);
    // 初始加载数据和渲染图表
    loadAndRenderInitialSankey();
    // 添加窗口大小调整监听器
    window.addEventListener('resize', resizeChart);
  }
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose();
  }
  window.removeEventListener('resize', resizeChart);
});

function resizeChart() {
  if (chartInstance) {
    chartInstance.resize();
  }
}

// 监听Pinia store中的相关数据变化，以便重新渲染 (后续步骤会用到)
// watch(() => dataStore.someRelevantDataForSankey, () => {
//   loadAndRenderInitialSankey();
// });

async function loadAndRenderInitialSankey() {
  isLoading.value = true;
  errorMsg.value = null;
  try {
    // 确保所有必要的数据都已加载到Pinia store
    if (!dataStore.processedPapers || !dataStore.interactionStates || !dataStore.connectionCache || !dataStore.nodeMetadata || !dataStore.platformConfiguration || !dataStore.hierarchyMapping || !dataStore.sankeyLayoutConfig) {
      // 如果数据还没加载（理论上App.vue中应已处理，但作为保险）
      await dataStore.fetchAllData();
      if (dataStore.error) throw new Error(`Failed to fetch initial data: ${dataStore.error}`);
    }

    // 1. 确定初始状态的查询键
    const initialState = dataStore.interactionStates?.stateTemplates?.initial;
    if (!initialState) {
      throw new Error("Initial state template not found in interactionStates.json");
    }

    const platformType = initialState.platformType; // e.g., "内容形式"
    const yearRange = initialState.selectedFilters.years.join('-'); // e.g., "2020-2024"
    const awardStatus = initialState.selectedFilters.awardStatus; // e.g., "all"
    // 构建查询键 (这需要与您 connectionCache.json 中的键匹配)
    // 示例键："内容形式_L1_L1_L1_2020-2024_all"
    const initialQueryKey = `${platformType}_L1_L1_L1_${yearRange}_${awardStatus}`;

    // 2. 从 connectionCache.json 获取初始视图数据
    const cachedViewData = dataStore.connectionCache?.queryCache?.[initialQueryKey];
    if (!cachedViewData) {
      throw new Error(`Initial view data not found in connectionCache for key: ${initialQueryKey}. You might need to pre-populate this cache entry or implement fallback logic.`);
    }

    const echartsNodes = [];
    const echartsLinks = [];

    // 3. 准备 ECharts Nodes
    // ECharts Sankey的node需要有 name 属性，这个name要和links中的source/target对应
    // 还需要 depth 来确定节点在哪一列 (0, 1, 2 for a 3-column Sankey)

    const columnCategories = ['研究涉及平台', '研究内容', '研究方法'];
    const nodePositions = dataStore.sankeyLayoutConfig?.layoutSettings?.columnPositions?.['3columns'];


    cachedViewData.nodes && Object.entries(cachedViewData.nodes).forEach(([category, nodesInCategory]) => {
      const columnIndex = columnCategories.indexOf(category); // 0, 1, or 2
      if (columnIndex === -1) {
        console.warn(`Unknown category "${category}" found in cachedViewData.nodes`);
        return;
      }

      nodesInCategory.forEach(nodeData => {
        let nodeMeta = {};
        if (category === '研究涉及平台') {
          const platformConfig = dataStore.platformConfiguration?.platformTypes?.[platformType]?.hierarchy?.l1?.find(p => p.id === nodeData.id);
          nodeMeta = {
            displayName: platformConfig?.name || nodeData.id,
            color: platformConfig?.color,
            description: platformConfig?.description,
          };
        } else {
          const meta = dataStore.nodeMetadata?.[category]?.[nodeData.id];
          nodeMeta = {
            displayName: meta?.displayName || nodeData.id,
            color: meta?.color,
            description: meta?.description,
          };
        }

        echartsNodes.push({
          name: nodeData.id, // 重要：这个name用于links的source/target匹配
          depth: columnIndex, // 指定节点在哪一列
          value: nodeData.value, // 节点的值，通常是流经该节点的总量
          itemStyle: {
            color: nodeMeta.color || dataStore.sankeyLayoutConfig?.nodeSettings?.defaultColor || '#5470c6' // 从元数据获取颜色
          },
          // 可以添加其他自定义数据到节点上，供tooltip使用
          tooltipData: {
            displayName: nodeMeta.displayName,
            paperCount: nodeData.papers, // 假设cachedViewData.nodes有papers字段
            description: nodeMeta.description
          }
        });
      });
    });

    // 4. 准备 ECharts Links
    cachedViewData.links && cachedViewData.links.forEach(linkData => {
      echartsLinks.push({
        source: linkData.source, // 源节点 name
        target: linkData.target, // 目标节点 name
        value: linkData.value,   // 连接的权重/流量
        lineStyle: { // 可以根据sankeyLayoutConfig配置
          opacity: dataStore.sankeyLayoutConfig?.layoutSettings?.linkSettings?.opacity,
          color: dataStore.sankeyLayoutConfig?.layoutSettings?.linkSettings?.defaultColor, // 使用默认颜色
          curveness: dataStore.sankeyLayoutConfig?.layoutSettings?.linkSettings?.curvature
        },
        // 可以添加其他自定义数据到连接上，供tooltip使用
        tooltipData: {
          paperCount: linkData.papers?.length || linkData.value,
          paperIds: linkData.papers
        }
      });
    });

    // 5. 配置 ECharts Option
    const layoutSettings = dataStore.sankeyLayoutConfig?.layoutSettings;
    const interactionConfig = dataStore.sankeyLayoutConfig?.interactionConfig;

    chartOption.value = {
      title: {
        // text: 'CHI Papers Sankey Diagram - Initial View (L1)',
        // left: 'center'
      },
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
        formatter: (params) => {
          if (params.dataType === 'node' && params.data.tooltipData) {
            const nodeData = params.data.tooltipData;
            return `${nodeData.displayName || params.name}<br/>论文数: ${nodeData.paperCount || params.value || 'N/A'}${nodeData.description ? '<br/>' + nodeData.description : ''}`;
          } else if (params.dataType === 'edge' && params.data.tooltipData) {
            const linkData = params.data.tooltipData;
            return `从 ${params.data.source} 到 ${params.data.target}<br/>论文数: ${linkData.paperCount || params.value}`;
          }
          return `${params.name}: ${params.value}`;
        },
        backgroundColor: interactionConfig?.hover?.tooltip?.backgroundColor,
        textStyle: {
            color: interactionConfig?.hover?.tooltip?.textColor,
            fontSize: interactionConfig?.hover?.tooltip?.fontSize
        },
        padding: interactionConfig?.hover?.tooltip?.padding,
        borderColor: interactionConfig?.hover?.tooltip?.borderColor || '#ccc',
        borderWidth: interactionConfig?.hover?.tooltip?.borderWidth || 1,
      },
      series: [
        {
          type: 'sankey',
          data: echartsNodes,
          links: echartsLinks,
          emphasis: { // 高亮状态
            focus: 'adjacency' // 高亮相邻的节点和边
          },
          nodeWidth: layoutSettings?.nodeSettings?.width,
          nodeGap: layoutSettings?.nodeSettings?.spacing?.vertical, // ECharts中nodeGap是垂直间距
          nodeAlign: 'justify', // 节点对齐方式
          draggable: false, // 通常桑基图节点不拖拽
          layoutIterations: layoutSettings?.layoutIterations || 32, // 布局迭代次数
          label: { // 节点标签配置
            show: layoutSettings?.nodeLabelSettings?.showLabels,
            position: 'right', // or 'left', 'top', 'bottom', 'inside'
            formatter: '{b}', // {b} 表示节点名称 (name)
            fontSize: layoutSettings?.nodeLabelSettings?.fontSize,
            color: layoutSettings?.nodeLabelSettings?.fillColor,
            fontFamily: layoutSettings?.nodeLabelSettings?.fontFamily,
            // ... 其他标签配置，如 offsetX (可能需要通过rich text实现复杂偏移)
          },
          lineStyle: { // 全局连接线样式 (会被单个link的lineStyle覆盖)
            color: layoutSettings?.linkSettings?.defaultColor,
            opacity: layoutSettings?.linkSettings?.opacity,
            curveness: layoutSettings?.linkSettings?.curvature,
          },
          itemStyle: { // 全局节点样式 (会被单个node的itemStyle覆盖)
             borderWidth: layoutSettings?.nodeSettings?.borderWidth || 1,
             borderColor: layoutSettings?.nodeSettings?.borderColor || '#aaa',
          },
          // ECharts桑基图通过 levels 来精细控制每一层的样式
          levels: [
            { depth: 0, itemStyle: { color: nodePositions && nodePositions['研究涉及平台'] ? (dataStore.nodeMetadata?.['研究涉及平台']?.[Object.keys(dataStore.nodeMetadata?.['研究涉及平台'])[0]]?.color || '#c23531') : '#c23531' }, lineStyle: { opacity: 0.5 } }, // 第一列的样式
            { depth: 1, itemStyle: { color: nodePositions && nodePositions['研究内容'] ? (dataStore.nodeMetadata?.['研究内容']?.[Object.keys(dataStore.nodeMetadata?.['研究内容'])[0]]?.color || '#2f4554') : '#2f4554' }, lineStyle: { opacity: 0.5 }  }, // 第二列的样式
            { depth: 2, itemStyle: { color: nodePositions && nodePositions['研究方法'] ? (dataStore.nodeMetadata?.['研究方法']?.[Object.keys(dataStore.nodeMetadata?.['研究方法'])[0]]?.color || '#61a0a8') : '#61a0a8' }, lineStyle: { opacity: 0.5 }  }, // 第三列的样式
          ],
          // 控制桑基图在容器内的位置和大小
          left: layoutSettings?.dimensions?.margins?.left || '5%',
          right: layoutSettings?.dimensions?.margins?.right || '20%', // 右边留多点空间给标签
          top: layoutSettings?.dimensions?.margins?.top || '5%',
          bottom: layoutSettings?.dimensions?.margins?.bottom || '5%',
        }
      ]
    };

    if (chartInstance) {
      chartInstance.setOption(chartOption.value, true); // true表示不合并，清除之前的配置
    }

  } catch (err) {
    console.error("Error rendering Sankey:", err);
    errorMsg.value = err.message || "An unknown error occurred while rendering the Sankey diagram.";
  } finally {
    isLoading.value = false;
  }
}

</script>

<style scoped>
.sankey-diagram-container {
  width: 100%;
  height: 600px; /* 初始高度，可以根据需要调整或从配置读取 */
  position: relative;
}
.sankey-chart {
  width: 100%;
  height: 100%;
}
.loading-overlay, .error-message {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.8);
  font-size: 1.2em;
}
.error-message {
  color: red;
}
</style>