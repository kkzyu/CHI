<template>
  <div class="panel-content" ref="panelContentRef">
    <div class="panel-title-bar" ref="panelTitleBarRef">
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

    <div v-if="isLoading" class="loading-message">正在加载论文数据...</div>
    <div class="paper-cards-container" v-if="!isLoading && allPapers.length > 0">
      <PaperCard
        v-for="paper in filteredPapers"
        :key="paper.id"
        :paper-data="paper"
        :search-term="searchTerm"
      />
      <div v-if="filteredPapers.length === 0 && searchTerm" class="no-results-message">
        未找到包含"{{ searchTerm }}"的论文。
      </div>
    </div>
    <div v-if="!isLoading && allPapers.length === 0" class="no-data-message">
      未能加载论文数据或数据文件为空。
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import PaperCard from '@/components/paper/PaperCard.vue';

const searchTerm = ref('');
const allPapers = ref([]); // 存储所有论文数据
const isLoading = ref(true); // 开始时设置为true，直到数据加载完成
const panelContentRef = ref(null);
const panelTitleBarRef = ref(null);

// 数据转换函数，将从JSON读取的原始对象转换为PaperCard期望的格式
const transformPaperData = (rawDataArray) => {
  return rawDataArray.map((item, index) => {
    let awardType = null;
    // JSON中的 "Tags" 字段可能是字符串或数组，用于判断奖项
    let awardSourceField = '';
    if (Array.isArray(item.Tags)) {
      awardSourceField = item.Tags.join(' ').toLowerCase();
    } else if (item.Tags && typeof item.Tags === 'string') {
      awardSourceField = item.Tags.toLowerCase();
    }

    if (awardSourceField.includes('#honorable mention')) {
      awardType = 'honorary';
    } else if (awardSourceField.includes('#best paper')) { // 假设最佳论文的标记
      awardType = 'best';
    }

    const doiUrl = item.DOI || null;
    let doiText = null;
    if (doiUrl && typeof doiUrl === 'string') {
      const match = doiUrl.match(/(10\.\d{4,9}\/[-._;()/:A-Z0-9]+)/i);
      doiText = match ? match[0] : (doiUrl.startsWith('http') ? null : doiUrl);
    }

    const authorsArray = typeof item.Authors === 'string'
      ? item.Authors.split('\n').map(a => a.trim()).filter(a => a)
      : (Array.isArray(item.Authors) ? item.Authors.map(a => String(a).trim()).filter(a => a) : []);

    return {
      id: item.ID || `paper-json-${index}-${(item.Name || 'untitled').substring(0,10).replace(/\s/g,'-')}`,
      award_type: awardType,
      title: item.Name || 'N/A',
      doi: doiText,
      doi_url: doiUrl,
      authors: authorsArray,
      year: item.Year ? parseInt(item.Year) : null,
      abstract: item.Abstract || 'N/A',
      tags: {
        research_content: Array.isArray(item.研究内容) ? item.研究内容.map(t => String(t).trim()).filter(t => t) : [],
        research_method: Array.isArray(item.研究方法) ? item.研究方法.map(t => String(t).trim()).filter(t => t) : [],
        platform: Array.isArray(item.研究涉及平台) ? item.研究涉及平台.map(t => String(t).trim()).filter(t => t) : []
      },
    };
  });
};

onMounted(async () => {
  isLoading.value = true;
  try {
    const response = await fetch('data/raw/papers.json'); // 注意路径，相对于public目录, 但是public是CHI
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const jsonData = await response.json();
    allPapers.value = transformPaperData(jsonData);
  } catch (error) {
    console.error("无法加载或解析 papers.json:", error);
    alert("加载论文数据失败，请检查文件是否存在且格式正确。");
  } finally {
    isLoading.value = false;
  }
});

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
  background-color: white;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
}

.panel-title-bar {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 将标题组和搜索框推向两端 */
  flex-shrink: 0;
  position: sticky;
  background-color: white; /* 必须有背景色，防止内容透视 */
  z-index: 150; /* 确保在最上层 */
  top: 0;
  padding: 20px 16px 12px 16px;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 8px; /* 原本如果更大可改为8px或更小 */
  border-bottom: none;
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
  gap: 10px; /* 如原gap较大可适当减小 */
  flex-grow: 1;
  /* overflow-y: auto; The parent .details-column in DashboardLayout handles scrolling */
  padding-top: 0px;
  box-sizing: border-box;
}
</style>
