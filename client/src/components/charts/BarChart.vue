<template>
    <div class="chart-container">
      <div class="chart-header">
        <h3 class="chart-title">{{ title }}</h3>
      </div>
      <div ref="chartRef" :style="{ height: chartHeight }"></div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch, nextTick } from 'vue';
  import * as echarts from 'echarts/core';
  import { BarChart } from 'echarts/charts';
  import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent,
  } from 'echarts/components';
  import { CanvasRenderer } from 'echarts/renderers';
  
  echarts.use([
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent,
    BarChart,
    CanvasRenderer,
  ]);
  
  const props = defineProps({
    title: {
      type: String,
      required: true,
    },
    chartHeight: {
      type: String,
      default: '500px',
    },
    chartData: {
      type: Object, // Expected: { years: [], series: [{ name: '', data: [], color: '' }, ...] }
      required: true,
    },
  });
  
  const chartRef = ref(null);
  let myChart = null;
  
  const initChart = () => {
    if (myChart) {
      myChart.dispose();
    }
    if (chartRef.value && props.chartData && props.chartData.years && props.chartData.series) {
      myChart = echarts.init(chartRef.value);
      myChart.setOption({
        title: {
          // Title is handled by the component's own title prop
          // text: props.title,
          // left: 'left',
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        // 图例设置
        legend: {
          orient: 'vertical',
          right: '1%',
          top: 0,
          data: ['最佳论文', '荣誉提名'],
        },
        grid: {
          left: '3%',
          right: '30%',
          top: '20%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: props.chartData.years,
          axisLine: { show: false }, // 隐藏 x 轴轴线
          axisTick: { show: false }, // 隐藏 x 轴刻度
          axisLabel: { interval:0 }, // 显示 x 轴标签
          splitLine: { show: false }, // 隐藏网格线
        },
        yAxis: {
          type: 'value',
          axisLine: { show: false }, // 隐藏 Y 轴轴线
          axisTick: { show: false }, // 隐藏 Y 轴刻度
          axisLabel: { show: false }, // 隐藏 Y 轴标签
          splitLine: { show: false }, // 隐藏网格线
        },
        series: props.chartData.series.map(s => ({
          name: s.name,
          type: 'bar',
          stack: 'total',
          label: {
            // show: true, // Optionally show value labels on bars
            // position: 'inside'
          },
          emphasis: {
            focus: 'series',
          },
          data: s.data,
          itemStyle: {
            color: s.color,
          },
        })),
      });
    }
  };
  
  onMounted(() => {
    nextTick(() => { // Ensure DOM is ready
      initChart();
    });
  });
  
  watch(() => props.chartData, (newData) => {
    if (newData) {
      initChart();
    }
  }, { deep: true });
  
  // Optional: Resize listener
  // onBeforeUnmount(() => {
  //   if (myChart) {
  //     myChart.dispose();
  //   }
  //   window.removeEventListener('resize', resizeChart);
  // });
  // const resizeChart = () => {
  //   myChart?.resize();
  // };
  // onMounted(() => {
  //   window.addEventListener('resize', resizeChart);
  // });
  </script>
  
  <style scoped>
  .chart-container {
    display: flex;
    flex-direction: column;
  }
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-sm, 8px); /* Assuming var(--space-sm) is defined */
  }
  .chart-title {
    font-size: var(--font-size-large, 1.1em); /* Adjust as needed */
    color: var(--color-text-secondary, #333);
    margin: 0;
  }
  /* Ensure chart div has a defined size, passed by chartHeight prop */
  </style>