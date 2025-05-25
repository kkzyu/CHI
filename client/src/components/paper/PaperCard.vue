<template>
  <div class="paper-card">
    <div v-if="selectedAwardSvg" class="award-badge" :class="{ 'award-highlight': isAwardMatched }" v-html="selectedAwardSvg"></div>

    <div class="top-section">
      <h3 class="paper-title">{{ paperData.title }}</h3>
      <div class="doi-authors-container">
        <div class="doi-block">
          <p v-if="paperData.doi && paperData.doi_url" class="paper-doi">
            DOI: <a :href="paperData.doi_url" target="_blank" rel="noopener noreferrer">{{ paperData.doi }}</a>
          </p>
        </div>
        <div class="authors-block" v-if="paperData.authors && paperData.authors.length > 0">
          <p v-for="author in paperData.authors" :key="author" class="author-line">{{ author }}</p>
        </div>
      </div>
    </div>

    <div class="middle-section">
      <p class="paper-abstract">{{ truncateAbstract(paperData.abstract, 1500) }}</p>
    </div>

    <div class="bottom-section">
      <div class="tag-group" v-if="paperData.tags && paperData.tags.research_content && paperData.tags.research_content.length > 0">
        <strong class="tag-group-label">研究内容:</strong>
        <div class="tags-container">
          <span
            v-for="tag in paperData.tags.research_content"
            :key="tag"
            class="tag tag-content"
            v-html="highlightMatch(tag, searchTerm)"
          ></span>
        </div>
      </div>
      <div class="tag-group" v-if="paperData.tags && paperData.tags.research_method && paperData.tags.research_method.length > 0">
        <strong class="tag-group-label">研究方法:</strong>
        <div class="tags-container">
          <span
            v-for="tag in paperData.tags.research_method"
            :key="tag"
            class="tag tag-method"
            v-html="highlightMatch(tag, searchTerm)"
          ></span>
        </div>
      </div>
      <div class="tag-group" v-if="paperData.tags && paperData.tags.platform && paperData.tags.platform.length > 0">
        <strong class="tag-group-label">研究平台:</strong>
        <div class="tags-container">
          <span
            v-for="tag in paperData.tags.platform"
            :key="tag"
            class="tag tag-platform"
            v-html="highlightMatch(tag, searchTerm)"
          ></span>
        </div>
      </div>
    </div>

    </div>
</template>

<script setup>
import { computed } from 'vue';

// 两个奖章的SVG字符串

const honoraryMentionSVG = computed(() => {
  return `<svg width="100" height="20" viewBox="0 0 100 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="20" rx="6" fill="white"/>
    <g transform="translate(2, 1)">
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_192_174)">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M13.8291 14.3494C13.0169 15.1386 12.1523 15.9581 12.1523 15.9581L10.6617 13.4134C12.2226 13.0331 13.5721 12.132 14.5131 10.9058L16.1432 13.6879C16.1432 13.6879 14.9811 14.022 13.8291 14.3494ZM9.00006 12.3795C5.89618 12.3795 3.38069 9.85782 3.38069 6.74832C3.38069 3.63882 5.89618 1.11712 9.00006 1.11712C12.1039 1.11712 14.6194 3.63882 14.6194 6.74832C14.6194 9.85782 12.1039 12.3795 9.00006 12.3795ZM5.84781 15.9581C5.84781 15.9581 4.98325 15.1386 4.171 14.3494C3.019 14.022 1.85687 13.6879 1.85687 13.6879L3.487 10.9058C4.42806 12.132 5.77749 13.0331 7.33843 13.4134L5.84781 15.9581ZM15.1994 9.80775C15.6511 8.90157 15.9121 7.88681 15.9121 6.80962C15.9121 3.04874 12.8172 0 9.00006 0C5.18293 0 2.08806 3.04874 2.08806 6.80962C2.08806 7.88681 2.34906 8.90157 2.80075 9.80775L-0.00500488 14.5946C-0.00500488 14.5946 1.77419 14.9518 3.57925 15.3231C4.783 16.6629 5.98112 18 5.98112 18L8.56074 13.5979C8.70699 13.6069 8.85156 13.6198 9.00006 13.6198C9.14856 13.6198 9.29313 13.6069 9.43937 13.5979L12.019 18C12.019 18 13.2171 16.6629 14.4209 15.3231C16.2259 14.9518 18.0051 14.5946 18.0051 14.5946L15.1994 9.80775ZM9.00006 9.5625C7.44643 9.5625 6.18756 8.30363 6.18756 6.75C6.18756 5.19637 7.44643 3.9375 9.00006 3.9375C10.5537 3.9375 11.8126 5.19637 11.8126 6.75C11.8126 8.30363 10.5537 9.5625 9.00006 9.5625ZM9.00006 2.8125C6.82543 2.8125 5.06256 4.57538 5.06256 6.75C5.06256 8.92463 6.82543 10.6875 9.00006 10.6875C11.1747 10.6875 12.9376 8.92463 12.9376 6.75C12.9376 4.57538 11.1747 2.8125 9.00006 2.8125Z" fill="black"/>
        </g>
        <defs>
          <clipPath id="clip0_192_174">
            <rect width="18" height="18" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    </g>
    <text x="22" y="15" font-size="12" fill="black">荣誉提名</text>
  </svg>`;
});

const bestPaperSVG = computed(() => {
  return `<svg width="95" height="20" viewBox="0 0 95 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="95" height="20" rx="6" fill="white"/>
    <g transform="translate(2, 1)">
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M14.6137 7.3125V3.9375C16.8367 3.9375 16.8597 3.81994 16.8597 5.0625C16.8597 6.30506 15.8546 7.3125 14.6137 7.3125ZM13.4909 6.1875C13.4909 8.67263 11.4806 11.8125 8.99994 11.8125C6.51931 11.8125 4.50893 8.67263 4.50893 6.1875V2.8125C4.50893 2.25619 5.09337 1.6875 5.63169 1.6875H12.3682C12.9065 1.6875 13.4909 2.23819 13.4909 2.8125V6.1875ZM3.38618 7.3125C2.14587 7.3125 1.14013 6.30506 1.14013 5.0625C1.14013 3.81994 1.16318 3.9375 3.38618 3.9375V7.3125ZM14.6137 2.8125C14.6137 1.56994 13.6085 0.5625 12.3682 0.5625H5.63169C4.39137 0.5625 3.38618 1.56994 3.38618 2.8125C-0.45963 2.8125 0.0173798 2.81194 0.0173798 5.0625C0.0173798 6.92606 1.52543 8.4375 3.38618 8.4375C3.52006 8.4375 3.64832 8.41612 3.77769 8.39812C4.53144 10.6054 6.30726 12.5938 8.43857 12.897V16.3125H6.75444C6.4445 16.3125 6.19307 16.5639 6.19307 16.875C6.19307 17.1861 6.4445 17.4375 6.75444 17.4375H11.2454C11.5554 17.4375 11.8068 17.1861 11.8068 16.875C11.8068 16.5639 11.5554 16.3125 11.2454 16.3125H9.56131V12.897C11.6926 12.5938 13.4684 10.6054 14.2228 8.39812C14.3516 8.41612 14.4798 8.4375 14.6137 8.4375C16.4744 8.4375 17.9825 6.92606 17.9825 5.0625C17.9825 2.81194 18.4595 2.8125 14.6137 2.8125Z" fill="black"/>
      </svg>
    </g>
    <text x="22" y="15" font-size="12" fill="black">最佳论文</text>
  </svg>`;
});

const props = defineProps({
  paperData: {
    type: Object,
    required: true,
    default: () => ({
      award_type: null, // 现在应该是 'honorary' 或 'best'
      title: '默认标题',
      doi: '',
      doi_url: '',
      authors: [],
      year: new Date().getFullYear(),
      abstract: '默认摘要内容...',
      tags: {
        research_content: [],
        research_method: [],
        platform: [],
      }
    }),
  },
  searchTerm: {
    type: String,
    default: ''
  }
});

const selectedAwardSvg = computed(() => {
  if (props.paperData.award_type === 'honorary') {
    return honoraryMentionSVG.value;
  }
  if (props.paperData.award_type === 'best') {
    return bestPaperSVG.value;
  }
  return null;
});

// 辅助函数：转义正则表达式特殊字符
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& 表示整个被匹配的字符串
};

// 高亮匹配文本的函数
const highlightMatch = (text, term) => {
  if (!term || !text || typeof text !== 'string') {
    return text; // 如果没有搜索词、文本或文本不是字符串，则返回原文
  }
  const lowerText = text.toLowerCase();
  const lowerTerm = term.toLowerCase().trim();

  if (!lowerTerm || !lowerText.includes(lowerTerm)) {
    return text; // 没有匹配则返回原文
  }

  // 使用正则表达式进行不区分大小写的全局替换，并将匹配项用 <mark> 包裹
  // RegExp 会将 term 中的特殊字符作为字面量处理，因为 escapeRegExp 已经转义
  const escapedTerm = escapeRegExp(lowerTerm);
  const regex = new RegExp(`(${escapedTerm})`, 'gi');

  return text.replace(regex, '<mark class="highlight">$1</mark>');
};

// 检查奖项是否匹配搜索词（用于给徽章本身添加高亮类）
const isAwardMatched = computed(() => {
  const term = props.searchTerm.toLowerCase().trim();
  if (!term || !props.paperData.award_type) {
    return false;
  }
  const awardDisplayTexts = {
    honorary: "荣誉提名",
    best: "最佳论文"
  };
  if (awardDisplayTexts[props.paperData.award_type]) {
    return awardDisplayTexts[props.paperData.award_type].toLowerCase().includes(term);
  }
  return false;
});

const truncateAbstract = (text, length) => {
  if (!text) return '';
  if (text.length <= length) {
    return text;
  }
  return text.substring(0, length) + '...';
};
</script>

<style scoped>
/* 定义各区域高度变量，您可以根据需要调整这些值 */
:root {
  --paper-card-overall-width: 500px; /* 示例卡片总宽度 */
  --top-section-height: 180px;     /* 标题/DOI/作者区域高度 */
  --middle-section-height: 230px;  /* 摘要区域高度 */
  --bottom-section-height: 100px;  /* 标签区域高度 */
}

.paper-card {
  width: var(--paper-card-overall-width, var(--paper-card-width, 100%)); /* 使用新的总宽度或旧的变量 */
  /* 总高度现在由各部分高度和间距决定，也可以设置一个总的 var(--paper-card-height) 然后让各section flex-basis */
  background-color: var(--color-background-card, #fff);
  border: 1px solid var(--color-border-light, #e0e0e0);
  border-radius: var(--border-radius-sm, 8px);
  padding: var(--space-md, 16px);
  box-shadow: var(--shadow-xs, 0 1px 3px rgba(0,0,0,0.1));
  display: flex;
  flex-direction: column;
  position: relative; /* For award badge positioning */
  overflow: visible; /* 如果徽章稍微超出边界，可能需要设为 visible 或调整 */
}

.award-badge {
  position: absolute;
  top: 8px;   /* 向上偏移，以突出显示 */
  left: 8px;  /* 向左偏移，以突出显示 */
  width: auto; /* 宽度自适应内容 */
  height: 20px; /* SVG的高度 */
  z-index: 10;
  pointer-events: none; /* 防止徽章遮挡下方元素的交互 */
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out; /* 为高亮效果添加过渡 */
}
.award-badge.award-highlight :deep(svg rect) { /* 如果奖项匹配，给徽章背景加一点效果 */
  stroke: var(--color-primary, #007bff); /* 例如，高亮边框 */
  stroke-width: 1.5px;
  /* 或者 filter: drop-shadow(0 0 3px var(--color-primary-light, #86b7fe)); */
}
/* SVG将填充其容器.award-badge */
.award-badge :deep(svg) {
  display: block;
}

/* 高亮样式 */
.tag :deep(.highlight) { /* :deep() 用于穿透到 v-html 渲染的内容 */
  background-color: #f6f6ef; /* 高亮背景 */
  /* color: #333; */ /* 可以设置特定文字颜色，如果需要 */
  padding: 0 0; /* 微调高亮区域的垂直填充 */
  margin: 0 0; /* 抵消padding带来的额外高度 */
  border-radius: 2px;
}

/* Top Section: Title, DOI, Authors */
.top-section {
  padding-top: var(--space-md, 14px);
  height: var(--top-section-height);
  display: flex;
  flex-direction: column;
  margin-bottom: 1px; /* 与摘要区域的间距 */
  overflow: hidden; /* 防止内容溢出固定高度 */

}

.paper-title {
  font-size: var(--font-size-card-title, 1.25rem);
  font-weight: 600;
  color: var(--color-text-primary, #222);
  margin-bottom: var(--space-xxs, 4px);
  line-height: 1.3;
  /* 允许多行，但由top-section的固定高度和overflow控制 */
}

.doi-authors-container {
  display: flex;
  justify-content: space-between; /* DOI 左, Authors 右 */
  align-items: flex-start; /* 顶部对齐 */
  flex-grow: 1; /* 占据剩余空间 */
  overflow: hidden;
}

.doi-block {
  flex-shrink: 0; /* 防止 DOI 区块被压缩 */
  margin-right: var(--space-sm, 12px);
}

.paper-doi {
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--color-text-secondary, #555);
  margin-bottom: var(--space-xs, 8px);
}
.paper-doi a {
  color: var(--color-primary, #007bff);
  text-decoration: none;
}
.paper-doi a:hover {
  text-decoration: underline;
}

.authors-block {
  text-align: right;
  font-size: var(--font-size-sm, 0.55rem);
  color: var(--color-text-secondary, #555);
  max-height: 100%; /* 确保作者列表不会超出doi-authors-container的高度 */
  overflow-y: hidden; /* 如果作者过多，允许滚动，但通常期望在固定高度内显示 */
}
.author-line {
  margin: 0.1rem;      /* 移除 <p> 标签的默认垂直外边距 */
  padding: 0.1rem;     /* 移除 <p> 标签的默认内边距 */
  line-height: 1.1; /* 关键：调整行高。*/
}


/* Middle Section: Abstract */
.middle-section {
  height: var(--middle-section-height);
  overflow-y: auto; /* 超出部分滚动 */
  margin-bottom: var(--space-sm, 12px); /* 与标签区域的间距 */
  padding-right: var(--space-xs, 8px); /* 为滚动条留出空间，防止文字紧贴 */
}

.paper-abstract {
  font-size: var(--font-size-sm, 0.875rem);
  line-height: 1.6;
  color: var(--color-text-primary, #333);
  /* margin-bottom 移除，由 middle-section 控制底部空间 */
}

/* Bottom Section: Tags */
.bottom-section {
  height: var(--bottom-section-height);
  overflow-y: auto; /* 如果标签组总高度超出，则允许滚动 */
  display: flex;
  flex-direction: column;
  gap: var(--space-xs, 8px); /* 各标签组之间的间隙 */
}

.tag-group {
  display: flex;
  /* align-items: baseline; */ /* 基线对齐可能导致标签换行时不对齐 */
  align-items: baseline; /* 顶部对齐，以便标签换行时标签名和第一行标签对齐 */
  margin-bottom: var(--space-xxs, 4px); /* 组内间距，如果用gap则不需要这个 */
}

.tag-group-label {
  font-weight: bold;
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--color-text-primary, #333);
  margin-right: var(--space-sm, 8px);
  white-space: nowrap; /* 确保标签名不换行 */
  /*padding-top: var(--space-xs, 6px);  使其与tag垂直方向大致居中 */
}

.tags-container {
  display: flex;
  flex-wrap: wrap; /* 允许标签换行 */
  gap: var(--space-xs, 6px); /* 标签之间的间隙 */
}

.tag {
  display: inline-block;
  padding: var(--space-xs, 6px) var(--space-sm, 10px);
  font-size: var(--font-size-xs, 0.75rem);
  border-radius: var(--border-radius-sm, 6px);
  background-color: var(--color-placeholder-bg, #f0f0f0);
  color: var(--color-text-secondary, #555);
  white-space: nowrap;
  line-height: 1.2; /* 调整行高确保padding生效 */
}

.tag-content { background-color: var(--color-tag-content, #E6EAEE); color: var(--color-tag-content-text, #000000); }
.tag-method { background-color: var(--color-tag-method, #E6EAEE); color: var(--color-tag-method-text, #000000); }
.tag-platform { background-color: var(--color-tag-platform, #E6EAEE); color: var(--color-tag-platform-text, #000000); }

/* 滚动条美化 (可选) */
.middle-section::-webkit-scrollbar,
.bottom-section::-webkit-scrollbar,
.authors-block::-webkit-scrollbar {
  width: 6px;
}
.middle-section::-webkit-scrollbar-thumb,
.bottom-section::-webkit-scrollbar-thumb,
.authors-block::-webkit-scrollbar-thumb {
  background-color: var(--color-border-light, #ccc);
  border-radius: 3px;
}
.middle-section::-webkit-scrollbar-track,
.bottom-section::-webkit-scrollbar-track,
.authors-block::-webkit-scrollbar-track {
  background-color: transparent;
}

</style>
