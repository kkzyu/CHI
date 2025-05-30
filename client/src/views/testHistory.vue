<template>
  <div class="test-page">
    <h1>测试历史记录功能</h1>
    <div class="controls">
      <button @click="addHistory">添加历史记录</button>
      <button @click="popHistory" :disabled="!canUndo">撤销操作</button>
    </div>
    <div class="status">
      <p>当前历史记录长度: {{ history.length }}</p>
      <p>历史记录内容:</p>
      <pre>{{ JSON.stringify(history, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const history = ref([]);
const canUndo = computed(() => history.value.length > 0);

// 添加历史记录
function addHistory() {
  const item = {
    id: history.value.length + 1,
    timestamp: new Date().toISOString(),
    action: 'test-action-' + Math.floor(Math.random() * 1000)
  };
  history.value.push(item);
  console.log('历史记录已添加:', item);
  console.log('当前历史长度:', history.value.length);
}

// 弹出历史记录
function popHistory() {
  if (canUndo.value) {
    const item = history.value.pop();
    console.log('撤销操作:', item);
    console.log('剩余历史长度:', history.value.length);
  } else {
    console.log('没有可撤销的操作');
  }
}
</script>

<style scoped>
.test-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.controls {
  margin: 20px 0;
  display: flex;
  gap: 10px;
}

button {
  padding: 10px 15px;
  background: #4c7cff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.status {
  padding: 20px;
  background: #f5f5f5;
  border-radius: 4px;
}

pre {
  background: #eaeaea;
  padding: 10px;
  border-radius: 4px;
  overflow: auto;
}
</style> 