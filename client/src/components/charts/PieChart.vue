<template>
  <div class="chart-container">
    <div class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
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
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue';
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
  title: {
    type: String,
    required: true,
  },
  chartHeight: {
    type: String,
    default: '250px',
  },
  chartData: { // Expected: [{ name: 'TagName', value: count }, ...]
    type: Array,
    required: true,
    default: () => []
  },
  showSelector: {
    type: Boolean,
    default: false,
  },
  classificationOptions: { // Expected: [{ label: 'Display Name', value: 'internalValue' }, ...]
    type: Array,
    default: () => [], // Default to empty, parent should provide if showSelector is true
  }
});

const emit = defineEmits(['classificationChange']);

const chartRef = ref(null);
// Initialize selectedClassification based on the first option if available
const selectedClassification = ref(
  props.classificationOptions.length > 0 ? props.classificationOptions[0].value : null
);

let myChart = null;

const initChart = () => {
  if (myChart) {
    myChart.dispose();
    myChart = null;
  }
  if (chartRef.value && props.chartData && props.chartData.length > 0) {
    myChart = echarts.init(chartRef.value);
    myChart.setOption({
      // tooltip: {
      //   trigger: 'item',
      //   formatter: '{a} <br/>{b}: {c} ({d}%)',
      // },
      legend: {
        orient: 'vertical', // Keep legend on the side for more pie space
        left: "50%",
        top: 'center', // Center legend vertically
        //top: props.showSelector ? 1 : 10, // Adjust top based on selector presence
        type: 'plain',
        icon: 'circle', // Use circle for better visibility
        data: props.chartData.map(item => item.name),
      },
      series: [
        {
          name: props.title,
          type: 'pie',
          radius: ['0%', 75], // Donut chart
          center: ['25%', '50%'], // Adjusted center to accommodate legend on the right
          avoidLabelOverlap: true,
           itemStyle: {
            borderRadius: 0,
            borderColor: '#fff',
            borderWidth: 0
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
             label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold',
            },
            // itemStyle: {
            //   shadowBlur: 10,
            //   shadowOffsetX: 0,
            //   shadowColor: 'rgba(0, 0, 0, 0.5)'
            // }
          },
          labelLine: {
            show: false,
          },
          data: props.chartData,
        },
      ],
    });
  } else if (chartRef.value) { // Handle empty data state
     myChart = echarts.init(chartRef.value); // Init to show empty message
     myChart.setOption({
        title: {
            text: `无 "${props.title}" 数据`,
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

onMounted(() => {
  // Ensure selectedClassification is initialized from props before the first initChart
  if (props.showSelector && props.classificationOptions.length > 0 && !selectedClassification.value) {
     selectedClassification.value = props.classificationOptions[0].value;
  }
  nextTick(() => {
    initChart();
  });
});

// Watch for changes in chartData to re-initialize the chart
watch(() => props.chartData, (newData) => {
  if (newData) {
    // console.log(`PieChart [${props.title}] data updated:`, newData);
    nextTick(() => { // Ensure DOM is ready if chart was previously unmounted
        initChart();
    });
  }
}, { deep: true });

// Watch for changes in classificationOptions to reset selectedClassification if needed
watch(() => props.classificationOptions, (newOptions) => {
  if (props.showSelector && newOptions && newOptions.length > 0) {
    const currentSelectionStillValid = newOptions.some(opt => opt.value === selectedClassification.value);
    if (!currentSelectionStillValid) {
      selectedClassification.value = newOptions[0].value;
      // emit('classificationChange', selectedClassification.value); // Optionally emit if selection is forced to change
    }
  } else if (!props.showSelector) {
    selectedClassification.value = null; // Clear selection if selector is hidden
  }
   nextTick(() => { // Re-init if options change, as it might affect legend positioning logic
        initChart();
    });
}, { deep: true, immediate: true }); // Immediate to set initial selectedClassification based on props

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
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm, 8px);
  min-height: 30px; /* Ensure header has some height even if selector is hidden */
}
.chart-title {
  font-size: var(--font-size-large, 1.0em); /* Adjusted for consistency */
  color: var(--color-text-secondary, #333);
  margin-bottom: 0px;
  /* flex-grow: 1; Allow title to take space */
}
.classification-selector {
  margin-right: 8px; /* Adjusted for better spacing */
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 0.85em; /* Adjusted */
  max-width: 150px; /* Prevent selector from becoming too wide */
}
/* Chart div style is applied via :style prop */
</style>