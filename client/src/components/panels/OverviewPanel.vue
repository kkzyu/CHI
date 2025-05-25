<template>
  <div class="panel-content">
    <h2 class="panel-title">概览视图</h2>
    <div class="charts-container">
      <div class="chart-wrapper">
        <BarChart
          title="论文数量"
          chart-height="200px"
          :chart-data="stackedBarData"
          v-if="stackedBarData.years.length > 0"
        />
        <div v-else class="loading-placeholder">Loading Paper Counts...</div>
      </div>

      <div class="chart-wrapper">
        <PieChart
          title="研究内容"
          chart-height="250px"
          :chart-data="researchContentPieData"
          :show-selector="true"
          :classification-options="researchContentClassificationOptions"
          @classification-change="val => handleClassificationChange('researchContent', val)"
          v-if="researchContentPieData.length > 0"
        />
        <div v-else class="loading-placeholder">Loading Research Content Data...</div>
      </div>

      <div class="chart-wrapper">
        <PieChart
          title="研究方法"
          chart-height="250px"
          :chart-data="researchMethodPieData"
          :show-selector="true"
          :classification-options="researchMethodClassificationOptions"
          @classification-change="val => handleClassificationChange('researchMethod', val)"
          v-if="researchMethodPieData.length > 0"
        />
        <div v-else class="loading-placeholder">Loading Research Method Data...</div>
      </div>

      <div class="chart-wrapper">
        <PieChart
          title="研究平台"
          chart-height="250px"
          :chart-data="researchPlatformPieData"
          :show-selector="true"
          :classification-options="researchPlatformClassificationOptions"
          @classification-change="val => handleClassificationChange('researchPlatform', val)"
          v-if="researchPlatformPieData.length > 0"
        />
        <div v-else class="loading-placeholder">Loading Research Platform Data...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import BarChart from '@/components/charts/BarChart.vue'; // Assuming this exists from previous step
import PieChart from '@/components/charts/PieChart.vue';   // Assuming this exists from previous step

// --- Reactive data for charts ---
const papersData = ref([]);
const allTagsHierarchy = ref(null); // Will store the content of allTagsById.json.allTagsById
const tagNameCache = reactive({
  研究内容: new Map(),
  研究方法: new Map(),
  研究平台: new Map(), // Combined or needs further splitting based on "内容形式" vs "平台属性"
});

const stackedBarData = ref({ years: [], series: [] });
const researchContentPieData = ref([]);
const researchMethodPieData = ref([]);
const researchPlatformPieData = ref([]);

// --- Classification options and current selections ---
// Levels: 1 = Top Category (e.g., "研究内容"), 2 = Children of L1, 3 = Children of L2, 'Leaf' = specific tags
const researchContentClassificationOptions = ref([
  { label: '按一级分类', value: 2 }, // Show L2 children of "研究内容"
  { label: '按二级分类', value: 3 }, // Show L3 children
  { label: '具体标签 (默认)', value: 'Leaf' }
]);
const researchMethodClassificationOptions = ref([
  { label: '按一级分类', value: 2 }, // Show L2 children of "研究方法"
  { label: '按二级分类', value: 3 }, // Show L3 children
  { label: '具体标签 (默认)', value: 'Leaf' }
]);
const researchPlatformClassificationOptions = ref([
  // For "研究平台", L1 children are "内容形式" and "平台属性". Let's use level 2 for these.
  { label: '按主要分类 (内容形式/平台属性)', value: 2 },
  { label: '按二级分类 (如具体内容形式)', value: 3 },
  { label: '具体平台 (默认)', value: 'Leaf' }
]);

const currentClassification = reactive({
  researchContent: 'Leaf', // Default to leaf tags
  researchMethod: 'Leaf',
  researchPlatform: 'Leaf',
});


// --- Data Processing Logic ---

function buildTagNameToIdCache(hierarchy) {
  if (!hierarchy) return;
  for (const tagId in hierarchy) {
    const node = hierarchy[tagId];
    if (node && node.category && node.name) {
      if (!tagNameCache[node.category]) {
        tagNameCache[node.category] = new Map();
      }
      // Potentially add more robust handling for duplicate names if they can exist meaningfully
      // For now, assumes name within a category (or globally if category isn't specific enough) is mappable.
      // This simple cache might be problematic if a short 'name' is not unique enough.
      // A more robust approach would be to ensure papers.json uses full IDs or more unique names.
      // Given the L3TagToIdMap structure, names are unique within L2 parents mostly.
      // The `allTagsById.json` uses full unique IDs as keys. The challenge is mapping paper's short tag names to these full IDs.
      // For now, we will assume `node.name` is sufficiently unique for lookup within its `node.category`.
      tagNameCache[node.category].set(node.name, node.id);

      // For research platforms, they might not have a 'category' field in the same way in allTagsById.json
      // Need to inspect how platform tags in papers.json map to allTagsById.json structure.
      // The `allTagsById.json` has "研究平台" as a top-level key, with children "内容形式" and "平台属性".
      // Platform names like "Facebook" are L3 nodes. Their `category` field is "内容形式" or "平台属性".
      // And their `parentId` would be something like "图文为主".
      // Let's adjust cache for platforms:
      if (node.category === "内容形式" || node.category === "平台属性") {
         if (!tagNameCache["研究平台"]) tagNameCache["研究平台"] = new Map();
         tagNameCache["研究平台"].set(node.name, node.id);
      }
    }
  }
}

function findAncestorAtLevel(tagId, targetLevel, hierarchy) {
  let currentNode = hierarchy[tagId];
  // Traverse up until the targetLevel is reached or no parent
  while (currentNode && currentNode.level > targetLevel && currentNode.parentId) {
    currentNode = hierarchy[currentNode.parentId];
  }
  // Return node if it's at the target level
  if (currentNode && currentNode.level === targetLevel) {
    return currentNode;
  }
  // If the original tag itself is already at or above the target level, but not exactly, means it's an ancestor or unrelated.
  // If the tag itself is the target level.
  if (hierarchy[tagId] && hierarchy[tagId].level === targetLevel) {
      return hierarchy[tagId];
  }
  return null;
}

function aggregatePaperTags(papers, columnName, aggregationLevelOrType, hierarchy) {
  const tagCounts = {};
  if (!hierarchy) { // Fallback if hierarchy data is not available
    return processDirectTags(papers, columnName);
  }

  const categoryForCacheLookup = (columnName === "研究涉及平台") ? "研究平台" : columnName;

  papers.forEach(paper => {
    const paperTagNames = paper[columnName]; // Array of tag names from papers.json

    if (Array.isArray(paperTagNames)) {
      paperTagNames.forEach(tagName => {
        let actualTagId = null;
        const categoryCache = tagNameCache[categoryForCacheLookup];

        if (categoryCache) {
            actualTagId = categoryCache.get(tagName);
        }
        // If not found by name, it might be an ID already, or a name not in cache.
        // Try direct lookup if it looks like an ID from hierarchy
        if (!actualTagId && hierarchy[tagName]) {
            actualTagId = tagName;
        }


        if (!actualTagId || !hierarchy[actualTagId]) {
          // If tag name from paper isn't found as an ID or in cache, count its name directly if 'Leaf'
          if (aggregationLevelOrType === 'Leaf') {
            tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
          }
          return;
        }

        let targetTagNode;
        if (aggregationLevelOrType === 'Leaf') {
          targetTagNode = hierarchy[actualTagId];
        } else { // aggregationLevelOrType is a number like 2 or 3
          targetTagNode = findAncestorAtLevel(actualTagId, aggregationLevelOrType, hierarchy);
        }

        if (targetTagNode && targetTagNode.name) {
          tagCounts[targetTagNode.name] = (tagCounts[targetTagNode.name] || 0) + 1;
        } else if (aggregationLevelOrType === 'Leaf' && hierarchy[actualTagId]) {
          // Fallback for Leaf if ancestor logic didn't apply but ID was valid
           tagCounts[hierarchy[actualTagId].name] = (tagCounts[hierarchy[actualTagId].name] || 0) + 1;
        }
      });
    }
  });
  return Object.entries(tagCounts).map(([name, value]) => ({ name, value }))
                 .sort((a, b) => b.value - a.value);
}

function processDirectTags(papers, columnName) { // Fallback if hierarchy is not used/available
    const tagCounts = {};
    papers.forEach(paper => {
        const tagsArray = paper[columnName];
        if (Array.isArray(tagsArray)) {
            tagsArray.forEach(tag => {
                const trimmedTag = String(tag).trim(); // Ensure tag is a string
                if (trimmedTag) {
                    tagCounts[trimmedTag] = (tagCounts[trimmedTag] || 0) + 1;
                }
            });
        }
    });
    return Object.entries(tagCounts).map(([name, value]) => ({ name, value }))
                   .sort((a, b) => b.value - a.value);
}


function processAllPaperData() {
  if (!papersData.value.length || !allTagsHierarchy.value) {
    console.log("Paper data or tag hierarchy not yet loaded.");
    return;
  }
  const papers = papersData.value;
  const hierarchy = allTagsHierarchy.value;

  // --- Process for Stacked Bar Chart ---
  const yearlyCounts = {};
  const awardTypes = {
    BEST_PAPER: '#best paper',
    HONORABLE_MENTION: '#honorable mention',
  };
  const awardColors = { // As per initial request
    BEST_PAPER: '#ffe13f', 
    HONORABLE_MENTION: '#F9FE7C', 
    NOT_AWARDED: '#E6EAEE',
  };

  papers.forEach(paper => {
    const year = paper.Year;
    if (!year) return;
    if (!yearlyCounts[year]) {
      yearlyCounts[year] = {
        [awardTypes.BEST_PAPER]: 0,
        [awardTypes.HONORABLE_MENTION]: 0,
        'not_awarded': 0,
      };
    }
    // Tags in papers.json is an array or empty string
    if (Array.isArray(paper.Tags) && paper.Tags.includes(awardTypes.BEST_PAPER)) {
      yearlyCounts[year][awardTypes.BEST_PAPER]++;
    } else if (Array.isArray(paper.Tags) && paper.Tags.includes(awardTypes.HONORABLE_MENTION)) {
      yearlyCounts[year][awardTypes.HONORABLE_MENTION]++;
    } else {
      yearlyCounts[year].not_awarded++;
    }
  });

  const sortedYears = Object.keys(yearlyCounts).sort((a, b) => Number(a) - Number(b));
  stackedBarData.value = {
    years: sortedYears,
    series: [
      { name: 'Not Awarded', data: sortedYears.map(y => yearlyCounts[y]?.not_awarded || 0), color: awardColors.NOT_AWARDED },
      { name: '荣誉提名', data: sortedYears.map(y => yearlyCounts[y]?.[awardTypes.HONORABLE_MENTION] || 0), color: awardColors.HONORABLE_MENTION },
      { name: '最佳论文', data: sortedYears.map(y => yearlyCounts[y]?.[awardTypes.BEST_PAPER] || 0), color: awardColors.BEST_PAPER },
      
    ],
  };

  // --- Process for Pie Charts ---
  researchContentPieData.value = aggregatePaperTags(papers, '研究内容', currentClassification.researchContent, hierarchy);
  researchMethodPieData.value = aggregatePaperTags(papers, '研究方法', currentClassification.researchMethod, hierarchy);
  researchPlatformPieData.value = aggregatePaperTags(papers, '研究涉及平台', currentClassification.researchPlatform, hierarchy);
}


async function fetchAllData() {
  try {
    const [papersResponse, tagsHierarchyResponse] = await Promise.all([
      fetch('public/data/papers.json'), // Assuming papers.json is in public/data
      fetch('public/data/allTagsById.json') // Assuming allTagsById.json is in public/data
    ]);

    if (!papersResponse.ok) throw new Error(`HTTP error! status: ${papersResponse.status} for papers.json`);
    if (!tagsHierarchyResponse.ok) throw new Error(`HTTP error! status: ${tagsHierarchyResponse.status} for allTagsById.json`);

    papersData.value = await papersResponse.json();
    const tagsJson = await tagsHierarchyResponse.json();
    allTagsHierarchy.value = tagsJson.allTagsById; // Extract the main hierarchy object

    if (!allTagsHierarchy.value) {
        console.error("allTagsById field not found in allTagsById.json");
        allTagsHierarchy.value = {}; // Avoid null errors, fallback to direct processing
    }
    
    buildTagNameToIdCache(allTagsHierarchy.value);
    processAllPaperData();

  } catch (error) {
    console.error("Failed to fetch or process initial data:", error);
    // Initialize chart data to empty to prevent errors in child components
    stackedBarData.value = { years: [], series: [] };
    researchContentPieData.value = [];
    researchMethodPieData.value = [];
    researchPlatformPieData.value = [];
  }
}

onMounted(() => {
  fetchAllData();
});

const handleClassificationChange = (chartType, newLevel) => {
  if (chartType === 'researchContent') {
    currentClassification.researchContent = newLevel;
  } else if (chartType === 'researchMethod') {
    currentClassification.researchMethod = newLevel;
  } else if (chartType === 'researchPlatform') {
    currentClassification.researchPlatform = newLevel;
  }
  // Re-process data for all charts, or selectively for the changed one
  processAllPaperData(); // This will re-calculate all pie data based on current classifications
};

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
.charts-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  flex-grow: 1;
  /* overflow-y handled by parent */
}
.chart-wrapper {
  background-color: transparent;
  padding: var(--space-md, 5px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.loading-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 150px;
  color: var(--color-text-secondary, #666);
  font-style: italic;
}
</style>