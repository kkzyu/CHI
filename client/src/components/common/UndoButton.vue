<template>
    <button class="undo-btn" :disabled="!relations.canUndo" @click="relations.popHistory" title="撤销上一次操作">
      ⬅ 回退
    </button>
  </template>
  
  <script setup lang="ts">
  import { useRelationsStore } from '@/stores/relationsStore';
  const relations = useRelationsStore();
  </script>
  
  <style scoped>
  .undo-btn{ 
    padding: 4px 10px; 
    margin-bottom: 8px;
    cursor: pointer;
  }
  .undo-btn:disabled{ opacity:.4; cursor:not-allowed; }
  </style>