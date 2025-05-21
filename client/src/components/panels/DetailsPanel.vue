<template>
  <div class="panel-content">
    <h2 class="panel-title">细节视图</h2>
    <div class="paper-cards-container">
      <PaperCard v-for="n in 5" :key="n" :paper-data="dummyPaper(n)" />
      <!-- Real data will come from Pinia store -->
    </div>
  </div>
</template>

<script setup>
import PaperCard from '@/components/paper/PaperCard.vue';

// Dummy data for demonstration
const dummyPaper = (id) => ({
  id: `paper-${id}`,
  title: `示例论文标题 ${id}: 探索人机交互中的新范式`,
  authors: ['张三', '李四', '王五'],
  year: 2023,
  abstract: '这是一个示例摘要。它描述了论文的主要内容和贡献。为了测试卡片的高度和滚动，这里可以放更多文本。'.repeat(3),
  pdf_url: '#',
  tags: {
    research_content: ['用户体验', '设计方法'],
    research_method: ['定性研究', '访谈'],
    platform: ['移动设备', 'Web应用']
  }
});
</script>

<style scoped>
.panel-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.panel-title {
  font-size: var(--font-size-panel-title);
  color: var(--color-text-primary);
  margin-bottom: var(--space-md);
  flex-shrink: 0;
}
.paper-cards-container {
  display: flex;
  flex-direction: column;
  align-items: center; /* Center cards if they are narrower than container */
  gap: var(--space-md);
  flex-grow: 1;
  /* overflow-y: auto; The parent .details-column in DashboardLayout handles scrolling */
}
</style>