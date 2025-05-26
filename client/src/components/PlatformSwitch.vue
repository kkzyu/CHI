<template>
  <div class="platform-switch">
    <label for="platform-select">研究平台分类：</label>
    <select id="platform-select" v-model="currentType" @change="onChange">
      <option value="内容形式">按内容形式</option>
      <option value="平台属性">按平台属性</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRelationsStore } from '@/stores/relationsStore';

const relations = useRelationsStore();

// 双向绑定当前类型
const currentType = computed({
  get: () => relations.state.currentPlatformType,
  set: (val: '内容形式' | '平台属性') => {
    if (val !== relations.state.currentPlatformType) {
      relations.setPlatformType(val);
    }
  },
});

function onChange() {
  // v-model 已经调用 setPlatformType，这里可留空备用
}
</script>

<style scoped>
.platform-switch {
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--color-text-primary);
}

select {
  margin-left: 6px;
  padding: 2px 6px;
  font-size: 14px;
}
</style> 