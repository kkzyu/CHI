<template>
  <div class="panel-content">
    <div class="panel-title-bar">
      <div class="title-group">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="title-icon">
          <path d="M8.26782 16.733L21.2195 16.6591L21.2368 19.6931L8.28513 19.7671L8.26782 16.733ZM8.27 23.6692L18.1402 23.5952L18.163 26.6293L8.29276 26.7033L8.27 23.6692ZM8.27427 9.80968L30.2097 9.7106L30.2234 12.7447L8.28802 12.8438L8.27427 9.80968Z" fill="currentColor"/>
          <path d="M18.4024 38.9962H4.60212C3.76301 38.9962 3.08508 38.3182 3.08508 37.4791V3.46904C3.08508 2.62993 3.76301 1.952 4.60212 1.952H35.2131C36.0522 1.952 36.7301 2.62993 36.7301 3.46904V20.275C36.7301 21.1141 36.0522 21.792 35.2131 21.792C34.374 21.792 33.696 21.1141 33.696 20.275V4.98608H6.11916V35.9573H18.4024C19.2415 35.9573 19.9195 36.6353 19.9195 37.4744C19.9195 38.3135 19.2415 38.9962 18.4024 38.9962Z" fill="currentColor"/>
          <path d="M27.9597 36.6827C23.5603 36.6827 19.9811 33.1034 19.9811 28.704C19.9811 24.3046 23.5603 20.7253 27.9597 20.7253C32.3592 20.7253 35.9384 24.3046 35.9384 28.704C35.9384 33.1034 32.3544 36.6827 27.9597 36.6827ZM27.9597 23.7594C25.2338 23.7594 23.0152 25.9781 23.0152 28.704C23.0152 31.4299 25.2338 33.6486 27.9597 33.6486C30.6857 33.6486 32.9043 31.4299 32.9043 28.704C32.9043 25.9781 30.6809 23.7594 27.9597 23.7594Z" fill="currentColor"/>
          <path d="M36.1564 38.4747C35.7772 38.4747 35.3979 38.3324 35.104 38.048L31.4773 34.5541C30.8753 33.971 30.8563 33.0133 31.4394 32.4113C32.0225 31.8092 32.9801 31.7902 33.5822 32.3733L37.2089 35.8673C37.811 36.4504 37.8299 37.408 37.2468 38.0101C36.9529 38.323 36.5547 38.4747 36.1564 38.4747Z" fill="currentColor"/>
        </svg>
        <span class="title-text">细节视图</span>
      </div>
      <div class="search-bar-container">
        <div class="search-input-wrapper">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <input type="search" placeholder="输入标签关键词..." class="search-input"
          v-model="searchTerm"/>
        </div>
      </div>
    </div>
    <div class="paper-cards-container">
       <PaperCard v-for="paper in filteredPapers" :key="paper.id" :paper-data="paper" :search-term="searchTerm" />
      <div v-if="allPapers.length > 0 && filteredPapers.length === 0 && searchTerm" class="no-results-message">
        未找到包含“{{ searchTerm }}”标签的论文。
      </div>
      <div v-if="allPapers.length === 0" class="no-data-message">
        当前无论文数据。
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import PaperCard from '@/components/paper/PaperCard.vue';

const searchTerm = ref('');
const allPapers = ref([]); // 存储所有论文数据
const dummyPaper = (id) => {
  let currentAwardType = null;
  if (id % 3 === 1) { // 例如：id 为 1, 4, ... 的论文显示 honoraryMentionSVG
    currentAwardType = 'honorary';
  } else if (id % 3 === 2) { // 例如：id 为 2, 5, ... 的论文显示 bestPaperSVG
    currentAwardType = 'best';
  }
  // id % 3 === 0 的论文则 currentAwardType 为 null，不显示徽章
    // 为了方便测试搜索，让标签内容更多样化
  const researchContentBase = ['广告投放', '用户消费', '社交媒体', '推荐系统'];
  const researchMethodBase = ['倾向得分匹配', '对照实验', '线性回归', '机器学习'];
  const platformBase = ['Snapchat', 'TikTok', 'Web平台', '移动应用'];

  return {
    id: `paper-${id}`,
    award_type: currentAwardType, // **确保这里是 award_type**
    doi: `10.1145/3411764.3445394`,
    doi_url: `https://doi.org/10.1145/3411764.3445394`,
    title: `AdverTiming Matters: Examining User Ad Consumption for Effective Ad Allocations on Social Media`,
    authors: [
      'Saha, Koustuv',
      'Liu, Yozen',
      'Vincent, Nicholas',
      'Chowdhury, Farhan Asif',
      'Neves, Leonardo',
      'Shah, Neil',
      `Bos, Maarten W.` // 略作区分
    ],
    year: 2021,
    abstract: `Showing ads delivers revenue for online content distributors, but ad exposure can compromise user experience and cause user fatigue and frustration. Correctly balancing ads with other content is imperative. Currently, ad allocation relies primarily on demographics and inferred user interests, which are treated as static features and can be privacy-intrusive. This paper uses person-centric and momentary context features to understand optimal ad-timing. In a quasi-experimental study on a three-month longitudinal dataset of 100K Snapchat users, we find ad timing influences ad effectiveness. We draw insights on the relationship between ad effectiveness and momentary behaviors such as duration, interactivity, and interaction diversity. We simulate ad reallocation, finding that our study-driven insights lead to greater value for the platform. This work advances our understanding of ad consumption and bears implications for designing responsible ad allocation systems, improving both user and platform outcomes. We discuss privacy-preserving components and ethical implications of our work.`,
    tags: {
      research_content: [researchContentBase[id % researchContentBase.length], `内容 #${id}`, platformBase[id % platformBase.length].toLowerCase()],
      research_method: [researchMethodBase[id % researchMethodBase.length], `方法 ${id}`],
      platform: [platformBase[id % platformBase.length], `平台特性 ${id}`]
    }
  };
};

onMounted(() => {
  // 生成一些虚拟数据用于展示
  const initialPapers = [];
  for (let i = 1; i <= 10; i++) { // 生成10条虚拟数据
    initialPapers.push(dummyPaper(i));
  }
  allPapers.value = initialPapers;
});

// 计算属性，用于根据 searchTerm 筛选论文, 如果用户输入的搜索词匹配论文的任何一个标签，或者匹配论文的奖项类型对应的文本（“荣誉提名”或“最佳论文”），则该论文卡片会被显示。
const filteredPapers = computed(() => {
  const term = searchTerm.value.toLowerCase().trim();
  if (!term) {
    return allPapers.value; // 如果搜索词为空，返回所有论文
  }

  const awardDisplayTexts = {
    honorary: "荣誉提名", // 将 award_type 映射到显示文本
    best: "最佳论文"
  };

  return allPapers.value.filter(paper => {
    // 1. 检查标签是否匹配
    let tagMatch = false;
    if (paper.tags) {
      const allCardTags = [
        ...(paper.tags.research_content || []),
        ...(paper.tags.research_method || []),
        ...(paper.tags.platform || [])
      ];
      tagMatch = allCardTags.some(tag => typeof tag === 'string' && tag.toLowerCase().includes(term));
    }

    // 2. 检查奖项类型对应的文本是否匹配
    let awardMatch = false;
    if (paper.award_type && awardDisplayTexts[paper.award_type]) {
      awardMatch = awardDisplayTexts[paper.award_type].toLowerCase().includes(term);
    }

    // 如果标签匹配 OR 奖项文本匹配，则返回 true
    return tagMatch || awardMatch;
  });
});
</script>

<style scoped>
.panel-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.panel-title-bar { /* 原 .panel-title */
  display: flex;
  align-items: center;
  justify-content: space-between; /* 将标题组和搜索框推向两端 */
  margin-bottom: var(--space-md, 16px);
  flex-shrink: 0;
  /* height: 40px; /* 可以设定一个固定高度以确保对齐和一致性 */
}

.title-group {
  display: flex;
  align-items: center;
  color: var(--color-text-primary, #333);
  font-size: var(--font-size-panel-title, 1.5rem); /* 标题文字大小 */
}

.title-icon {
  /* 调整SVG图标大小以匹配字体 */
  width: 1.2em;  /* 相对于 .title-group 的 font-size */
  height: 1.2em; /* 相对于 .title-group 的 font-size */
  margin-right: var(--space-sm, 8px);
  /* fill: currentColor; /* 确保在SVG标签内或此处设置 */
}

.title-text {
  font-weight: 600; /* 可以让标题文字加粗一些 */
}

.search-bar-container {
  /* 容器不需要太多样式，主要控制内部wrapper */
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--space-sm, 10px);
  top: 50%;
  transform: translateY(-50%);
  width: 16px; /* 固定搜索图标大小 */
  height: 16px;
  color: var(--color-text-secondary, #757575); /* 搜索图标颜色 */
  pointer-events: none; /* 防止图标干扰输入框点击 */
}

.search-input {
  width: 220px; /* 或根据需要调整宽度 var(--search-input-width, 220px) */
  padding: var(--space-xs, 8px) var(--space-sm, 12px) var(--space-xs, 8px) var(--space-lg, 32px); /* 左边距给图标留空间 */
  font-size: var(--font-size-sm, 0.875rem); /* 搜索框内字体大小 */
  border: 1px solid var(--color-border, #ccc);
  border-radius: var(--border-radius-md, 6px); /* 调整圆角以匹配图片 */
  background-color: var(--color-background-input, #fff);
  color: var(--color-text-primary, #ffffff);
  outline: none;
}

.search-input:focus {
  border-color: var(--color-primary, #bcc1c3);
  box-shadow: 0 0 0 0.2rem rgba(237, 237, 239, 0.205); /* 示例 focus 效果 */
}

.search-input::placeholder {
  color: var(--color-text-placeholder, #999);
}

/* 移除Webkit下搜索框默认的取消按钮 (可选) */
.search-input::-webkit-search-cancel-button,
.search-input::-webkit-search-decoration {
  -webkit-appearance: none;
  appearance: none;
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