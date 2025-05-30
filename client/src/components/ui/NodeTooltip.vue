<template>
  <div 
    v-if="visible" 
    class="node-tooltip" 
    :style="{ top: `${y}px`, left: `${x}px` }"
  >
    <div class="tooltip-header">{{ node?.name || '未知节点' }}</div>
    <div class="tooltip-content">
      <div class="tooltip-row">
        <span class="label">所属栏目:</span>
        <span class="value">{{ getColumnName(node) }}</span>
      </div>
      <div class="tooltip-row">
        <span class="label">所属层级:</span>
        <span class="value">{{ getLevel(node) }}</span>
      </div>
      <div class="tooltip-row">
        <span class="label">论文总数:</span>
        <span class="value">{{ getNodeValue(node) }}</span>
      </div>
      <div v-if="showDebug" class="tooltip-debug">
        <div class="debug-header">调试信息:</div>
        <pre>{{ JSON.stringify(node, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  node: {
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
const showDebug = ref(false); // 设置为false关闭调试

// 监控节点数据变化
watch(() => props.node, (newNode) => {
  if (newNode) {
    console.log('节点数据更新:', newNode);
    validateNodeData(newNode);
  }
}, { deep: true });

// 验证节点数据
function validateNodeData(node) {
  if (!node) {
    console.warn('节点数据为空');
    return;
  }
  
  // 检查必要属性
  const requiredProps = ['id', 'name', 'column', 'value'];
  for (const prop of requiredProps) {
    if (!(prop in node)) {
      console.warn(`节点缺少必要属性: ${prop}`);
    }
  }
  
  // 检查值类型
  if (typeof node.value !== 'number') {
    console.warn(`节点value属性类型不正确: ${typeof node.value}`);
  }
  
  if (typeof node.column !== 'number') {
    console.warn(`节点column属性类型不正确: ${typeof node.column}`);
  }
}

// Function to get the level description based on node column
const getLevel = (node) => {
  if (!node) return '未知';
  
  // 使用节点的level属性，而不是column属性
  if (!node.level) return '未知层级';
  
  // 根据level属性确定层级描述
  switch (node.level) {
    case 'L1': return 'L1 (一级分类)';
    case 'L2': return 'L2 (二级分类)';
    case 'L3': return 'L3 (三级分类)';
    default: return `${node.level}`;
  }
};

// 获取节点论文数量，确保显示原始值
const getNodeValue = (node) => {
  if (!node) return '未知';
  
  // 确保使用节点的原始值（我们在节点构建器中设置的）
  // 而不是d3-sankey可能修改过的值
  const originalValue = node.originalValue || node.value;
  console.log(`Tooltip显示节点 ${node.id} 的值: ${originalValue}`);
  
  return originalValue;
};

// 获取列名称
const getColumnName = (node) => {
  if (!node) return '未知';
  if (node.column === undefined || node.column === null) return '未知栏目';
  
  // 根据column属性确定栏目名称
  switch (node.column) {
    case 0: return '研究平台';
    case 1: return '研究方法';
    case 2: return '研究内容';
    default: return `栏目 ${node.column}`;
  }
};
</script>

<style scoped>
.node-tooltip {
  position: fixed;
  z-index: 1000;
  background-color: var(--color-background-panel);
  color: var(--color-text-primary);
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-md);
  padding: 8px 12px;
  min-width: 180px;
  max-width: 300px;
  pointer-events: none;
  transform: translate(15px, -50%);
}

.tooltip-header {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 6px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 4px;
}

.tooltip-content {
  font-size: 12px;
}

.tooltip-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.label {
  color: var(--color-text-secondary);
}

.value {
  font-weight: 500;
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