<template>
  <div 
    v-if="visible" 
    class="link-tooltip" 
    :style="{ top: `${y}px`, left: `${x}px` }"
  >
    <div class="tooltip-header">
      <div class="connection-title">连接信息</div>
      <div class="node-row">
        <span class="label">起点:</span>
        <span class="source">{{ link?.sourceName || '未知' }}</span>
      </div>
      <div class="node-row">
        <span class="label">终点:</span>
        <span class="target">{{ link?.targetName || '未知' }}</span>
      </div>
    </div>
    <div class="tooltip-content">
      <div class="tooltip-row">
        <span class="label">论文数量:</span>
        <span class="value paper-count">{{ link?.value || 0 }}</span>
      </div>
      <div class="tooltip-row">
        <span class="label">从:</span>
        <span class="value source-info">{{ getColumnName(link?.sourceId) }}</span>
      </div>
      <div class="tooltip-row">
        <span class="label">到:</span>
        <span class="value target-info">{{ getColumnName(link?.targetId) }}</span>
      </div>
      <div v-if="showDebug" class="tooltip-debug">
        <div class="debug-header">调试信息:</div>
        <pre>{{ JSON.stringify(link, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  link: {
    type: Object,
    default: () => ({})
  },
  x: {
    type: Number,
    default: 0
  },
  y: {
    type: Number,
    default: 0
  },
  visible: {
    type: Boolean,
    default: false
  }
});

// 调试模式开关
const showDebug = ref(false);

// 获取列名称
const getColumnName = (nodeId) => {
  if (!nodeId) return '未知';
  
  // 首先尝试从完整节点对象中获取column信息
  if (nodeId === props.link?.sourceId && props.link?.source && typeof props.link.source.column === 'number') {
    // 根据列索引确定类型
    switch(props.link.source.column) {
      case 0: return '研究平台';
      case 1: return '研究内容';
      case 2: return '研究方法';
      default: return '未知类型';
    }
  }
  
  if (nodeId === props.link?.targetId && props.link?.target && typeof props.link.target.column === 'number') {
    // 根据列索引确定类型
    switch(props.link.target.column) {
      case 0: return '研究平台';
      case 1: return '研究内容';
      case 2: return '研究方法';
      default: return '未知类型';
    }
  }
  
  // 如果无法从对象直接获取列信息，返回未知
  return '未知类型';
};
</script>

<style scoped>
.link-tooltip {
  position: fixed;
  z-index: 1000;
  background-color: var(--color-background-panel);
  color: var(--color-text-primary);
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-md);
  padding: 10px 14px;
  min-width: 220px;
  max-width: 320px;
  pointer-events: none;
  transform: translate(15px, -50%);
  border-left: 3px solid #999;
}

.tooltip-header {
  font-weight: bold;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 6px;
}

.connection-title {
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
  text-align: center;
}

.node-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 4px;
  font-size: 13px;
}

.node-row .label {
  min-width: 40px;
  color: #666;
}

.source, .target {
  width: calc(100% - 40px);
  word-wrap: break-word;
  word-break: break-all;
}

.tooltip-content {
  font-size: 12px;
}

.tooltip-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.label {
  color: var(--color-text-secondary);
}

.value {
  font-weight: 500;
}

.paper-count {
  color: #f56c6c;
  font-weight: 700;
}

.source-info, .target-info {
  font-style: italic;
}

.tooltip-debug {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed var(--color-border);
}

.debug-header {
  font-weight: bold;
  margin-bottom: 4px;
  color: #f56c6c;
}

pre {
  font-size: 10px;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 4px;
  border-radius: 2px;
}
</style> 