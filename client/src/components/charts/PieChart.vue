<template>
  <div class="chart-container">
    <div class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
      <div class="header-actions">
        <select v-if="showSelector" v-model="selectedClassification" @change="onClassificationChange" class="classification-selector">
          <option v-for="option in classificationOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="showBackButton" class="pie-hierarchical-back-nav">
      <div v-for="(trailItem, index) in parentTrail" :key="trailItem.id"
           class="hierarchical-back-item"
           :style="{ 'padding-left': index * 20 + 'px' }" @click="handleHierarchicalDrillUp(index)"
           :title="'返回 ' + trailItem.name">
        <span class="indicator-triangle">▼</span>
        <span class="indicator-label">{{ trailItem.name }}</span>
      </div>

      <div class="hierarchical-back-item current-active-parent"
           :style="{ 'padding-left': parentTrail.length * 20 + 'px' }"
           @click="handleSingleDrillUp" :title="'返回 ' + activeNodeDisplayName">
        <span class="indicator-triangle">▼</span>
        <span class="indicator-label">{{ activeNodeDisplayName }}</span>
      </div>
    </div>

    <div ref="chartRef" :style="{ height: chartHeight }"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onBeforeUnmount, computed,toRaw } from 'vue'; // 引入 computed
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
  },
  parentTrail: { type: Array, default: () => [] }, // 从 vizStore 传入
  activeNodeDisplayName: { type: String, default: '' } // 从 vizStore 传入
});

// emit drillUp 事件，并传递 categoryKey
const emit = defineEmits(['classificationChange', 'drillUp']);
// 原有的单步上钻处理函数
const handleSingleDrillUp = () => {
  emit('drillUp', props.categoryKey);
};

// 新的层级上钻处理函数
const handleHierarchicalDrillUp = (trailIndex) => {
  // trailIndex 是点击的 parentTrail 中的项目索引
  // 我们需要告诉父组件要回到哪一级
  emit('hierarchicalDrillUp', { categoryKey: props.categoryKey, targetTrailIndex: trailIndex });
};
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
            return name;
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
          center: ['20%', '50%'],
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
  position: relative;
}

.chart-header {
  display: flex;
  justify-content: space-between; /* 让标题和 header-actions 分布在两侧 */
  align-items: center;
  margin-bottom: var(--space-sm, 8px);
  min-height: 30px;
}

.chart-title {
  font-size: var(--font-size-large, 1.0em); /* 与之前一致 */
  color: var(--color-text-secondary, #333); /* 与之前一致 */
  margin-bottom: 0px; /* header 已有 margin-bottom */
  margin-right: var(--space-sm, 8px); /* 与右侧元素的间距 */
  white-space: nowrap;
}

.pie-hierarchical-back-nav {
  position: absolute;
  top: 0;
  left: 40%; /* 距离右侧24px，可根据需要调整 */
  z-index: 2;
  background: rgba(255,255,255,0.92); /* 可选，防止遮挡 */
  padding: 2px 8px;
  border-radius: 4px;
  margin: 0; /* 去除原有 margin */
  width: auto; /* 让内容自适应宽度 */
  box-shadow: 0 1px 4px rgba(0,0,0,0.04); /* 可选阴影 */
}

.hierarchical-back-item {
  display: flex;        /* 使用 flex 布局来对齐三角形和标签 */
  align-items: center;  /* 垂直居中对齐 */
  cursor: pointer;
  margin-bottom: 4px;     /* 层级项之间的垂直间距 */
  font-size: 13px;        /* 统一字体大小，应与图例项协调 */
  color: #333;           /* 文字颜色 */
  /* 动态的 padding-left (内联样式 :style="{ 'padding-left': index * 20 + 'px' }") 用于实现层级缩进 */
  /* 这个 padding-left 是相对于 .hierarchical-back-item 自身的，而不是 .pie-hierarchical-back-nav 的 50% margin */
}

.hierarchical-back-item:hover .indicator-label {
  text-decoration: underline; /* 鼠标悬停时标签加下划线 */
}

.indicator-triangle {
  margin-right: 6px;  /* 三角形与标签之间的间距 */
  font-size: 10px;    /* 三角形图标的大小 */
  color: #555;       /* 三角形的颜色 (与图片中颜色接近) */
  line-height: 1;     /* 确保三角形在行内垂直对齐良好 */
  flex-shrink: 0;     /* 防止三角形在空间不足时被压缩 */
}

.indicator-label {
  font-weight: 600;     /* 标签文字加粗，与图片中样式一致 */
  white-space: nowrap;  /* 防止标签文字换行 */
  overflow: visible;      /*不隐藏超出部分的文字 */
  /* 标签将占据 .hierarchical-back-item 中的剩余空间 */
  /* 例如，可以给一个最大宽度以防止在极端缩进情况下完全不显示 */
  max-width: calc(100% - 20px); /* 减去三角形和一些间距的估算值 */
}

.current-active-parent .indicator-label {
  /* 当前活动父级标签的特殊样式（如果需要）*/
  /* font-weight: bold; */ /* 已在 .indicator-label 中通过 font-weight: 600 设置 */
}
.classification-selector {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 0.85em;
  max-width: 150px; /* 已有样式 */
}
</style>