<template>
  <div class="chart-container">
    <div class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
    </div>
    <div ref="chartRef" :style="{ height: chartHeight }"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { useVisualizationStore } from '@/stores/visualizationStore';

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
  selectedYear: {
    type: [String, Number, null],
    default: null
  }
});

const emit = defineEmits(['bar-click']);

const chartRef = ref(null);
let myChart = null;
const vizStore = useVisualizationStore();

const initChart = () => {
  if (myChart) {
    myChart.dispose();
  }
  if (chartRef.value && props.chartData && props.chartData.years && props.chartData.series) {
    myChart = echarts.init(chartRef.value);
    
    // 根据选中年份设置每个柱子的透明度
    const seriesData = props.chartData.series.map((s, index) => {
      return {
        name: s.name,
        type: 'bar',
        stack: 'total', // 堆叠柱状图
        label: {
          show: index === props.chartData.series.length - 1, // 仅在最后一个堆叠部分显示标签
          position: 'top', // 数据标签显示在柱子顶部
          formatter: (params) => {
            const total = props.chartData.series.reduce((sum, series) => {
              return sum + series.data[params.dataIndex];
            }, 0); // 计算堆叠总值
            return total;
          },
        },
        emphasis: {
          focus: 'series',
        },
        data: s.data.map((value, idx) => {
          // 如果有选中的年份且当前不是选中的年份，则降低透明度
          const isSelected = props.selectedYear === props.chartData.years[idx];
          const opacity = props.selectedYear && !isSelected ? 0.3 : 1;
          
          return {
            value: value,
            itemStyle: {
              color: s.color,
              opacity: opacity
            }
          };
        }),
        itemStyle: {
          borderRadius: 
            index === 0
              ? [0, 0, 5, 5] // 底部堆叠部分：左下和右下为圆角
              : index === props.chartData.series.length - 1
              ? [5, 5, 0, 0] // 顶部堆叠部分：左上和右上为圆角
              : [0, 0, 0, 0], // 中间堆叠部分：无圆角
        },
      };
    });
    
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
        data: props.chartData.series.map(s => ({
          name: s.name,
          itemStyle: {
            color: s.color
          }
        })),
      },
      grid: {
        left: '3%',
        right: '30%',
        top: '20%',
        bottom: '3%',
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
      series: seriesData,
    });
    
    myChart.on('click', (params) => {
      emit('bar-click', params.name);
    });
  }
};

onMounted(() => {
  nextTick(() => { // Ensure DOM is ready
    initChart();
  });
});

// 监听图表数据变化
watch(() => props.chartData, (newData) => {
  if (newData) {
    nextTick(() => {
      initChart();
    });
  }
}, { deep: true });

// 监听选中年份变化
watch(() => props.selectedYear, (newYear) => {
  if (myChart) {
    nextTick(() => {
      initChart();
    });
  }
});

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