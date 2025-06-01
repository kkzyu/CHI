<template>
  <div class="chart-container">
    <div class="chart-header">
      <div v-if="showBackButton" class="back-button-container" @click="handleDrillUp">
        <span class="back-icon">◀</span> <span class="parent-label-text">{{ parentLabel }}</span>
      </div>
      <h3 v-if="!showBackButton" class="chart-title">{{ title }}</h3>
      <select v-if="showSelector" v-model="selectedClassification" @change="onClassificationChange" class="classification-selector">
        <option v-for="option in classificationOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>
    <div ref="chartRef" :style="{ height: chartHeight }"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onBeforeUnmount, computed } from 'vue'; // 引入 computed
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  PieChart,
  CanvasRenderer,
]);

const props = defineProps({
  title: { // 这个 title 可能是固定的根级别标题，例如 "研究内容"
    type: String,
    required: true,
  },
  categoryKey: { // 用于区分是哪个饼图，例如 'researchContent', 'researchPlatform'
    type: String,
    required: true,
  },
  chartHeight: {
    type: String,
    default: '250px',
  },
  chartData: {
    type: Array,
    required: true,
    default: () => []
  },
  showSelector: {
    type: Boolean,
    default: false,
  },
  classificationOptions: {
    type: Array,
    default: () => [],
  },
  // 新增 Props 用于下钻状态
  showBackButton: { // 是否显示返回按钮 (通常由 store 中 parentTrail.length > 0 决定)
    type: Boolean,
    default: false,
  },
  parentLabel: { // 父级标签的名称，用于返回按钮中显示
    type: String,
    default: '',
  }
});

// emit drillUp 事件，并传递 categoryKey
const emit = defineEmits(['classificationChange', 'drillUp']);

const chartRef = ref(null);
const selectedClassification = ref(
  props.classificationOptions.length > 0 ? props.classificationOptions[0].value : null
);

let myChart = null;

// （可选）可以根据是否下钻动态调整图表内显示的标题
// const chartDisplayTitle = computed(() => {
//   if (props.showBackButton && props.parentLabel) {
//     // return `${props.parentLabel} - ${props.title}`; // 或者只显示父级/当前层级
//     return props.parentLabel; // 例如，下钻后标题变为父级标签名
//   }
//   return props.title;
// });


const initChart = () => {
  if (myChart) {
    myChart.dispose();
    myChart = null;
  }
  if (chartRef.value && props.chartData && props.chartData.length > 0) {
    myChart = echarts.init(chartRef.value);
    myChart.setOption({
      tooltip: { // 恢复 tooltip，根据用户需求
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        left: "50%", 
        top: 'center',
        type: 'plain', // 使用 'scroll' 类型可以在图例项过多时滚动
        icon: 'circle',
        data: props.chartData.map(item => item.name),
        selectedMode: false, // 禁止图例点击交互
        formatter: function (name) { // 图例文字过长时截断
            return echarts.format.truncateText(name, 80, '12px Microsoft Yahei', '…');
        },
        tooltip: { // 图例的 tooltip，显示完整名称
            show: true
        }
      },
      series: [
        {
          name: props.showBackButton ? props.parentLabel : props.title, // 系列名称可以动态
          type: 'pie',
          radius: ['0%', '75%'], 
          center: ['25%', '50%'],
          avoidLabelOverlap: true,
           itemStyle: {
            borderRadius: 0,
            borderColor: '#fff',
            borderWidth: 0 // 通常饼图块之间不需要边框，除非特殊设计
          },
          label: {
            show: false, // 通常饼图内部不直接显示标签，依赖 tooltip 和 legend
            position: 'center',
          },
          emphasis: {
             label: { // hover时在饼图中心显示标签
              show: true,
              fontSize: 16,
              fontWeight: 'bold',
              formatter: '{b}\n{d}%' // 显示名称和百分比
            },
          },
          labelLine: {
            show: false,
          },
          data: props.chartData,
        },
      ],
    });
    
    // （可选）如果需要饼图扇区点击进行下钻的逻辑
    // myChart.on('click', (params) => {
    //   if (params.componentType === 'series' && params.seriesType === 'pie') {
    //     // emit('drillDown', { categoryKey: props.categoryKey, nodeId: params.data.id || params.name });
    //     // console.log('Pie slice clicked:', params.data.name, 'ID:', params.data.id);
    //     // 这里需要确保 params.data 中有唯一标识符 (id)
    //   }
    // });

  } else if (chartRef.value) {
     if (myChart) myChart.dispose(); // 清理旧实例
     myChart = echarts.init(chartRef.value);
     myChart.setOption({
        title: {
            text: `无 "${props.showBackButton ? props.parentLabel : props.title}" 数据`,
            left: 'center',
            top: 'center',
            textStyle: { color: '#888', fontSize: 14, lineHeight: 20 }
        },
        series: []
     });
  }
};

const onClassificationChange = () => {
  emit('classificationChange', selectedClassification.value);
};

// 返回按钮点击处理
const handleDrillUp = () => {
  emit('drillUp', props.categoryKey); // 触发 drillUp 事件，并传递 categoryKey
};

onMounted(() => {
  if (props.showSelector && props.classificationOptions.length > 0 && !selectedClassification.value) {
     selectedClassification.value = props.classificationOptions[0].value;
  }
  nextTick(() => {
    initChart();
  });
});

watch(() => props.chartData, (newData) => {
  if (newData) {
    nextTick(() => {
        initChart();
    });
  }
}, { deep: true });

watch(() => props.classificationOptions, (newOptions) => {
  if (props.showSelector && newOptions && newOptions.length > 0) {
    const currentSelectionStillValid = newOptions.some(opt => opt.value === selectedClassification.value);
    if (!currentSelectionStillValid) {
      selectedClassification.value = newOptions[0].value;
    }
  } else if (!props.showSelector) {
    selectedClassification.value = null;
  }
   nextTick(() => {
        initChart();
    });
}, { deep: true, immediate: true });

// 监听 showBackButton 和 parentLabel 的变化也可能需要重新初始化图表，
// 因为它们可能影响标题或图例的定位逻辑，或者只是为了确保显示正确。
watch([() => props.showBackButton, () => props.parentLabel], () => {
    nextTick(() => {
        initChart();
    });
});
watch(() => props.chartData, (val) => {
  console.log('PieChart received chartData:', val);
}, { immediate: true });


onBeforeUnmount(() => {
  if (myChart) {
    myChart.dispose();
  }
});
</script>

<style scoped>
.chart-container {
  display: flex;
  flex-direction: column;
  position: relative; /* 确保子元素定位正确 */
}
.chart-header {
  display: flex;
  justify-content: space-between; /* 使标题和选择器分布在两侧 */
  align-items: center;
  margin-bottom: var(--space-sm, 8px);
  min-height: 30px; 
  position: relative; /* 用于返回按钮的潜在绝对定位（如果需要） */
}

/* 返回按钮容器样式 */
.back-button-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px; /* 内边距 */
  border: 1px solid var(--color-border, #ccc); /* 边框形成方框 */
  border-radius: 4px; /* 轻微圆角 */
  background-color: var(--color-background-soft, #f9f9f9);
  /* flex-grow: 1;  如果希望它占据更多空间 */
  margin-right: 10px; /* 与右侧元素（如选择器）的间距 */
}

.back-button-container:hover {
  background-color: var(--color-background-mute, #f0f0f0);
}

.back-icon {
  margin-right: 6px; /* 图标和文字之间的距离 */
  font-size: 0.9em; /* 图标大小 */
  color: var(--color-text-accent, #007bff);
}

.parent-label-text {
  font-size: var(--font-size-medium, 0.9em); /* 父标签文字大小 */
  color: var(--color-text-secondary, #333);
  font-weight: 500;
}

.chart-title {
  font-size: var(--font-size-large, 1.0em);
  color: var(--color-text-secondary, #333);
  margin-bottom: 0px; /* header 已有 margin-bottom */
  /* 如果返回按钮显示，标题可以不占据空间或隐藏 */
  /* flex-grow: 1; */ /* 移除，让返回按钮和选择器决定空间 */
}
.classification-selector {
  /* margin-right: 8px; */ /* 如果返回按钮在左，选择器在右，可以不需要左边距 */
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 0.85em;
  max-width: 150px;
  /* flex-shrink: 0; 防止选择器被压缩 */
}
</style>