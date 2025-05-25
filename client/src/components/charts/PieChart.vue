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
  import { ref, onMounted, watch, nextTick } from 'vue';
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
    },
    showSelector: {
      type: Boolean,
      default: false,
    },
    classificationOptions: { // Expected: [{ label: 'Display Name', value: 'internalValue' }, ...]
      type: Array,
      default: () => [{ label: 'Default View', value: 'default' }],
    }
  });
  
  const emit = defineEmits(['classificationChange']);
  
  const chartRef = ref(null);
  const selectedClassification = ref(props.classificationOptions.length > 0 ? props.classificationOptions[0].value : 'default');
  let myChart = null;
  
  const initChart = () => {
    if (myChart) {
      myChart.dispose();
    }
    if (chartRef.value && props.chartData) {
      myChart = echarts.init(chartRef.value);
      myChart.setOption({
        // title: {
        //   text: props.title, // Title handled by component's own title prop
        //   left: 'left',
        // },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: props.showSelector ? 40 : 20, // Adjust top if selector is present
          // bottom: 20, // Alternative for positioning
          type: 'scroll', // Enable scrollable legend if many items
          data: props.chartData.map(item => item.name),
        },
        series: [
          {
            name: props.title, // Series name for tooltip
            type: 'pie',
            radius: ['40%', '70%'], // Adjust for donut chart appearance
            center: ['40%', '50%'], // Adjust center to make space for legend
            avoidLabelOverlap: false,
            label: {
              show: false, // Hides labels on pie slices
              position: 'center',
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '16',
                fontWeight: 'bold',
              },
            },
            labelLine: {
              show: false,
            },
            data: props.chartData,
          },
        ],
      });
    }
  };
  
  const onClassificationChange = () => {
    emit('classificationChange', selectedClassification.value);
    // You would typically refetch or reprocess data here based on the selected classification
    // For this example, it just emits an event.
  };
  
  onMounted(() => {
    nextTick(() => {
      initChart();
    });
  });
  
  watch(() => props.chartData, (newData) => {
    if (newData) {
      // Ensure selectedClassification is valid if options change
      if (!props.classificationOptions.find(opt => opt.value === selectedClassification.value) && props.classificationOptions.length > 0) {
          selectedClassification.value = props.classificationOptions[0].value;
      }
      initChart();
    }
  }, { deep: true });
  
  watch(() => props.classificationOptions, () => {
      if (!props.classificationOptions.find(opt => opt.value === selectedClassification.value) && props.classificationOptions.length > 0) {
          selectedClassification.value = props.classificationOptions[0].value;
      }
      // Potentially re-init chart or update options if needed when classifications change
  }, {deep: true });
  
  // Optional: Resize listener
  </script>
  
  <style scoped>
  .chart-container {
    display: flex;
    flex-direction: column;
    position: relative; /* For absolute positioning of selector if needed */
  }
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-sm, 8px);
  }
  .chart-title {
    font-size: var(--font-size-large, 1.1em);
    color: var(--color-text-secondary, #333);
    margin: 0;
  }
  .classification-selector {
    /* Positioned by flexbox in chart-header */
    /* Or, if you want it above the legend specifically:
    position: absolute;
    top: 0;
    right: 10px; // Adjust to align with where legend starts
    z-index: 10;
    */
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid #ccc;
    font-size: 0.9em;
    margin-left: var(--space-md, 16px); /* Add some space if it's next to title */
  }
  /* Ensure chart div has a defined size, passed by chartHeight prop */
  </style>