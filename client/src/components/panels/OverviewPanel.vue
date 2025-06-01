<template>
  <div class="panel-content">
    <div class="panel-title-bar">
      <div class="title-group">
        <svg width="40" height="40" viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg" class="title-icon">
          <path d="M32.7333 28.0234H10.5976C10.3262 28.0234 10.0543 28.0243 9.78288 28.0234C9.64301 28.023 9.50397 28.0143 9.36493 27.9965C9.45707 28.0089 9.54879 28.0214 9.64093 28.0334C9.38263 27.9967 9.12997 27.9277 8.88888 27.828L9.13666 27.9326C8.90181 27.832 8.68008 27.7032 8.47633 27.5491C8.54647 27.603 8.6162 27.6574 8.68634 27.7113C8.47556 27.5479 8.28619 27.3585 8.12272 27.1477C8.17668 27.2179 8.23105 27.2876 8.285 27.3577C8.13086 27.154 8.00209 26.9322 7.9015 26.6974L8.00609 26.9452C7.90632 26.7041 7.83729 26.4514 7.80065 26.1931C7.8131 26.2853 7.82555 26.377 7.83759 26.4691C7.80646 26.2288 7.81061 25.9893 7.81061 25.7478V24.7127V21.1475V16.7842V13.0426C7.81061 12.4761 7.80771 11.9091 7.81061 11.3426C7.81144 11.2061 7.82016 11.0703 7.83759 10.935C7.82514 11.0272 7.81269 11.1189 7.80065 11.211C7.83759 10.9521 7.90607 10.701 8.00609 10.459L7.9015 10.7068C8.00209 10.4719 8.13086 10.2502 8.285 10.0464C8.23105 10.1166 8.17668 10.1863 8.12272 10.2565C8.28619 10.0457 8.47556 9.8563 8.68634 9.69283C8.6162 9.74678 8.54647 9.80115 8.47633 9.85511C8.68008 9.70097 8.90181 9.57219 9.13666 9.47161L8.88888 9.5762C9.12995 9.47642 9.38262 9.4074 9.64093 9.37076C9.54879 9.38321 9.45707 9.39566 9.36493 9.4077C9.67331 9.36785 9.98915 9.38072 10.2996 9.38072H31.8899C32.1651 9.38072 32.4403 9.37989 32.7159 9.38072C32.8561 9.38113 32.9956 9.38985 33.1346 9.4077C33.0425 9.39524 32.9508 9.38279 32.8586 9.37076C33.1176 9.4077 33.3687 9.47618 33.6107 9.5762L33.3629 9.47161C33.5977 9.57219 33.8195 9.70097 34.0232 9.85511C33.9531 9.80115 33.8834 9.74678 33.8132 9.69283C34.024 9.8563 34.2134 10.0457 34.3768 10.2565C34.3229 10.1863 34.2685 10.1166 34.2146 10.0464C34.3687 10.2502 34.4975 10.4719 34.5981 10.7068L34.4935 10.459C34.5933 10.7001 34.6623 10.9527 34.6989 11.211C34.6865 11.1189 34.674 11.0272 34.662 10.935C34.6931 11.1753 34.689 11.4148 34.689 11.6564V24.3616C34.689 24.9281 34.6919 25.495 34.689 26.0616C34.6881 26.1981 34.6794 26.3338 34.662 26.4691C34.6744 26.377 34.6869 26.2853 34.6989 26.1931C34.6622 26.4514 34.5932 26.7041 34.4935 26.9452L34.5981 26.6974C34.4975 26.9322 34.3687 27.154 34.2146 27.3577C34.2685 27.2876 34.3229 27.2179 34.3768 27.1477C34.2134 27.3585 34.024 27.5479 33.8132 27.7113C33.8834 27.6574 33.9531 27.603 34.0232 27.5491C33.8195 27.7032 33.5977 27.832 33.3629 27.9326L33.6107 27.828C33.3696 27.9277 33.1169 27.9968 32.8586 28.0334C32.9508 28.021 33.0425 28.0085 33.1346 27.9965C33.0014 28.0139 32.8678 28.0226 32.7333 28.0234C32.1908 28.0272 31.6704 28.4982 31.6957 29.061C31.7206 29.6201 32.1518 30.1024 32.7333 30.0986C34.5416 30.0866 36.2063 28.8261 36.6413 27.0547C36.7671 26.5426 36.7641 26.0387 36.7641 25.5203V23.6456V20.9267V17.8363V14.8846V12.5794V11.3966C36.7641 10.9633 36.7098 10.5179 36.5699 10.1062C36.2711 9.22508 35.7116 8.50042 34.9471 7.97374C34.2453 7.49063 33.4036 7.30552 32.564 7.30552H9.89452C9.8248 7.30552 9.75507 7.30469 9.68534 7.30677C8.72951 7.3325 7.86125 7.69192 7.12995 8.29705C6.20524 9.06238 5.73583 10.2531 5.73583 11.4347V25.6117C5.73583 26.2006 5.74579 26.7895 5.94916 27.3532C6.26625 28.2314 6.83236 28.9623 7.61637 29.4732C8.24848 29.8853 9.01879 30.0949 9.77001 30.0986C9.97296 30.0999 10.1759 30.0986 10.3789 30.0986H32.7337C33.2766 30.0986 33.7962 29.6213 33.7713 29.061C33.746 28.4991 33.3152 28.0234 32.7333 28.0234Z" fill="#231815"/>
          <path d="M12.2461 13.9021V24.2001C12.2461 24.3391 12.2457 24.4786 12.2461 24.6176V24.6359C12.2408 24.7787 12.2706 24.9119 12.3354 25.0356C12.3773 25.1642 12.4487 25.2755 12.55 25.3697C12.6438 25.4709 12.7554 25.5423 12.8841 25.5843C13.0077 25.6494 13.141 25.6789 13.2837 25.6735C13.3759 25.661 13.4676 25.6486 13.5597 25.6365C13.7357 25.5872 13.888 25.4983 14.0175 25.3697C14.2039 25.1667 14.3213 24.9173 14.3213 24.6359V24.347V23.5676V22.4117V21.0014V19.4624V17.8981V16.4497V15.2211V14.3379C14.3213 14.1989 14.3218 14.0594 14.3213 13.9204V13.9021C14.3267 13.7594 14.2969 13.6261 14.2321 13.5025C14.1902 13.3738 14.1188 13.2626 14.0175 13.1684C13.9237 13.0671 13.8121 12.9957 13.6834 12.9538C13.5597 12.8886 13.4265 12.8592 13.2837 12.8645C13.1916 12.877 13.0999 12.8895 13.0077 12.9015C12.8318 12.9509 12.6794 13.0397 12.55 13.1684C12.3636 13.3713 12.2461 13.6207 12.2461 13.9021ZM17.662 20.2493L17.6545 20.686C17.6483 21.0354 17.6425 21.3845 17.6363 21.7339C17.6288 22.1564 17.6217 22.579 17.6143 23.0019C17.608 23.3671 17.6018 23.7323 17.5952 24.0972C17.5923 24.274 17.5873 24.4512 17.586 24.628V24.6359C17.5806 24.7787 17.6105 24.9119 17.6753 25.0356C17.7172 25.1642 17.7886 25.2755 17.8898 25.3697C17.9836 25.4709 18.0953 25.5423 18.224 25.5843C18.3476 25.6494 18.4809 25.6789 18.6236 25.6735C18.7158 25.661 18.8075 25.6486 18.8996 25.6365C19.0756 25.5872 19.2279 25.4983 19.3574 25.3697C19.4114 25.2995 19.4658 25.2298 19.5197 25.1597C19.6135 24.9978 19.6608 24.8231 19.6612 24.6359L19.6687 24.1993C19.6749 23.8498 19.6807 23.5008 19.687 23.1513C19.6944 22.7288 19.7015 22.3063 19.709 21.8833C19.7152 21.5181 19.7214 21.1529 19.7281 20.7881C19.731 20.6113 19.7359 20.434 19.7372 20.2572V20.2493C19.7426 20.1066 19.7127 19.9733 19.648 19.8497C19.606 19.721 19.5346 19.6098 19.4334 19.5155C19.3396 19.4143 19.2279 19.3429 19.0993 19.301C18.9756 19.2358 18.8424 19.2063 18.6996 19.2117C18.6075 19.2242 18.5157 19.2366 18.4236 19.2487C18.2476 19.2981 18.0953 19.3869 17.9658 19.5155C17.9118 19.5857 17.8575 19.6554 17.8035 19.7256C17.7101 19.8874 17.6628 20.0622 17.662 20.2493ZM22.8732 13.9021V24.2001C22.8732 24.3391 22.8728 24.4786 22.8732 24.6176V24.6359C22.8678 24.7787 22.8977 24.9119 22.9625 25.0356C23.0044 25.1642 23.0758 25.2755 23.177 25.3697C23.2708 25.4709 23.3825 25.5423 23.5111 25.5843C23.6348 25.6494 23.768 25.6789 23.9108 25.6735C24.003 25.661 24.0947 25.6486 24.1868 25.6365C24.3628 25.5872 24.5151 25.4983 24.6446 25.3697C24.831 25.1667 24.9484 24.9173 24.9484 24.6359V24.347V23.5676V22.4117V21.0014V19.4624V17.8981V16.4497V15.2211V14.3379C24.9484 14.1989 24.9488 14.0594 24.9484 13.9204V13.9021C24.9538 13.7594 24.9239 13.6261 24.8592 13.5025C24.8173 13.3738 24.7459 13.2626 24.6446 13.1684C24.5508 13.0671 24.4392 12.9957 24.3105 12.9538C24.1868 12.8886 24.0536 12.8592 23.9108 12.8645C23.8187 12.877 23.727 12.8895 23.6348 12.9015C23.4588 12.9509 23.3065 13.0397 23.177 13.1684C22.9907 13.3713 22.8732 13.6207 22.8732 13.9021ZM28.0762 20.4872V24.125C28.0762 24.2926 28.0749 24.4603 28.0762 24.6284V24.6355C28.0708 24.7782 28.1006 24.9115 28.1654 25.0352C28.2073 25.1638 28.2787 25.275 28.38 25.3693C28.4738 25.4705 28.5854 25.5419 28.7141 25.5838C28.8377 25.649 28.971 25.6785 29.1137 25.6731C29.2059 25.6606 29.2976 25.6482 29.3898 25.6361C29.5657 25.5867 29.718 25.4979 29.8475 25.3693C30.0339 25.1663 30.1513 24.9169 30.1513 24.6355V24.2238V23.2347V22.0323V20.9977C30.1513 20.83 30.1526 20.6623 30.1513 20.4942V20.4872C30.1567 20.3444 30.1269 20.2112 30.0621 20.0875C30.0202 19.9588 29.9488 19.8476 29.8475 19.7534C29.7537 19.6521 29.6421 19.5807 29.5134 19.5388C29.3897 19.4736 29.2565 19.4442 29.1137 19.4496C29.0216 19.462 28.9299 19.4745 28.8377 19.4865C28.6618 19.5359 28.5095 19.6247 28.38 19.7534C28.1936 19.9567 28.0762 20.2062 28.0762 20.4872ZM11.3833 34.5931H30.3153C30.571 34.5931 30.827 34.5947 31.0827 34.5931H31.1163C31.3824 34.5931 31.6617 34.4773 31.8501 34.2893C32.0302 34.1092 32.1655 33.8141 32.1539 33.5555C32.1419 33.287 32.0539 33.0089 31.8501 32.8217C31.6472 32.6353 31.3977 32.5179 31.1163 32.5179H12.1843C11.9286 32.5179 11.6726 32.5162 11.4169 32.5179H11.3833C11.1172 32.5179 10.8379 32.6337 10.6495 32.8217C10.4694 33.0018 10.3341 33.2969 10.3457 33.5555C10.3577 33.824 10.4457 34.1021 10.6495 34.2893C10.8529 34.4756 11.1023 34.5931 11.3833 34.5931Z" fill="#231815"/>
        </svg>
        <span class="title-text">概览视图</span>
      </div>
    </div>
    <div class="charts-container">
      <div class="chart-wrapper">
        <BarChart
          title="论文数量"
          chart-height="120px" 
          :chart-data="vizStore.barChartDataSource"
          @bar-click="handleBarChartClick" 
          v-if="dataStoresInitialized && barChartData.years && barChartData.years.length > 0"
        />
        <div v-else class="loading-placeholder" :style="{ height: '120px' }">论文数量加载中...</div>
      </div>

      <div class="chart-wrapper" v-if="shouldShowPieSection('researchContent')">
    <div class="pie-breadcrumb-header" v-if="vizStore.currentDisplayState.researchContent.parentTrail.length > 0 || (vizStore.currentDisplayState.researchContent.activeNodeId !== '研究内容' && vizStore.currentDisplayState.researchContent.parentTrail.length === 0 && vizStore.currentDisplayState.researchContent.activeNodeId !== vizStore.currentDisplayState.researchContent.pieTitle)">
        <span class="breadcrumb-trail">
            <a href="#" @click.prevent="handleBreadcrumbRootClick('researchContent')">研究内容</a>
            <template v-for="(item, index) in vizStore.currentDisplayState.researchContent.parentTrail" :key="`trail-${item.id}`">
                <span> &gt; </span>
                <a href="#" @click.prevent="handleBreadcrumbItemClick('researchContent', index)">{{ item.name }}</a>
            </template>
            <span v-if="vizStore.currentDisplayState.researchContent.activeNodeId !== '研究内容' && vizStore.currentDisplayState.researchContent.activeNodeId !== (vizStore.currentDisplayState.researchContent.parentTrail.length > 0 ? vizStore.currentDisplayState.researchContent.parentTrail[vizStore.currentDisplayState.researchContent.parentTrail.length - 1].id : '研究内容')">
               <span> &gt; </span> {{ vizStore.getNodeInfo(vizStore.currentDisplayState.researchContent.activeNodeId, 'researchContent')?.displayName || vizStore.currentDisplayState.researchContent.activeNodeId }}
            </span>
        </span>
        <button @click="handlePieDrillUp('researchContent')" class="breadcrumb-back-button" title="返回上一级">
            <svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor"><path d="M9.828 3.222a.75.75 0 0 1 0 1.06L5.61 8.5l4.218 4.218a.75.75 0 1 1-1.06 1.06l-4.75-4.75a.75.75 0 0 1 0-1.06l4.75-4.75a.75.75 0 0 1 1.06 0z"/></svg>
        </button>
    </div>

    <PieChart
      title="研究内容" categoryKey="researchContent"
      chart-height="190px" 
      :chart-data="researchContentPieData"
      :show-selector="false" 
      @drillUp="handlePieDrillUp('researchContent')" v-if="dataStoresInitialized"
    />
    <div v-else class="loading-placeholder" :style="{ height: '180px' }">研究内容数据加载中...</div>
</div>

      <div 
        class="chart-wrapper"
        v-if="shouldShowPieSection('researchMethod')"
      >
        <PieChart
          title="研究方法"
          categoryKey="researchMethod"
          chart-height="190px"
          :chart-data="researchMethodPieData"
          :show-selector="false"
          :showBackButton="vizStore.currentDisplayState.researchMethod.parentTrail.length > 0"
          :parentLabel="getParentLabel('researchMethod')"
          @drillUp="handlePieDrillUp"
          v-if="dataStoresInitialized"
        />
        <div v-else class="loading-placeholder" :style="{ height: '180px' }">研究方法数据加载中...</div>
      </div>

      <div 
        class="chart-wrapper"
        v-if="shouldShowPieSection('researchPlatform')"
      >
        <PieChart
          title="研究平台"
          categoryKey="researchPlatform"
          chart-height="195px"
          :chart-data="researchPlatformPieData"
          :show-selector="true"
          :classification-options="researchPlatformClassificationOptions"
          :showBackButton="vizStore.currentDisplayState.researchPlatform.parentTrail.length > 0"
          :parentLabel="getParentLabel('researchPlatform')"
          @classification-change="handlePlatformClassificationChange"
          @drillUp="handlePieDrillUp"
          v-if="dataStoresInitialized"
        />
        <div v-else class="loading-placeholder" :style="{ height: '180px' }">研究平台数据加载中...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import BarChart from '@/components/charts/BarChart.vue';
import PieChart from '@/components/charts/PieChart.vue'; // 确保这是您修改后的 PieChart.vue
import { useDataStore } from '@/stores/dataStore';
import { useVisualizationStore } from '@/stores/visualizationStore';
import { useRelationsStore } from '@/stores/relationsStore';


const dataStore = useDataStore();
const vizStore = useVisualizationStore();
const relationsStore = useRelationsStore(); // 引入 relationsStore

const dataStoresInitialized = ref(false);

// Bar Chart related
const BAR_CHART_COLORS = {
  AWARDED: '#ffe13f', // 最佳论文 - 橙色 (更偏黄一点)
  HONORABLE_MENTION: '#F9FE7C', // 荣誉提名 - 黄色
  REGULAR: '#E6EAEE', // 常规 - 灰色
};
const barChartData = ref({ years: [], series: [], totalPapersByYear: {} });


// Pie Chart related - data will now primarily come from vizStore getters
const researchContentPieData = computed(() => vizStore.researchContentPieDataSource);
const researchMethodPieData = computed(() => vizStore.researchMethodPieDataSource);
const researchPlatformPieData = computed(() => vizStore.researchPlatformPieDataSource);



const researchPlatformClassificationOptions = ref([
  { label: '内容形式', value: '内容形式' },
  { label: '平台属性', value: '平台属性' },
]);
// currentPlatformClassification is managed by vizStore.platformDisplayType

// --- INTERACTIONS ---
const handleBarChartClick = (year) => {
  // console.log("OverviewPanel: Bar chart clicked, year:", year);
  if (vizStore.selectedYear === year) {
    vizStore.selectYear(null); // 再次点击同一柱子，重置
    relationsStore.setSelectedYear(null); // 同步到 relationsStore
  } else {
    vizStore.selectYear(year); // 选择特定年份
    relationsStore.setSelectedYear(year); // 同步到 relationsStore
  }
  // Pie data will update automatically due to computed properties watching vizStore.selectedYear
};

const handlePlatformClassificationChange = (newClassification) => {
  // console.log("OverviewPanel: Platform classification changed to:", newClassification);
  vizStore.setPlatformDisplayType(newClassification);
  relationsStore.setPlatformType(newClassification); // 同步到 relationsStore
  // researchPlatformPieData will update automatically
};

const handlePieDrillUp = (categoryKey) => {
  // console.log(`OverviewPanel: Pie drill up for category: ${categoryKey}`);
  vizStore.drillUp(categoryKey);
  // If Sankey needs to react to pie drill up (e.g., collapse corresponding column)
  // This would require more complex logic to map pie categoryKey & parentTrail to Sankey nodes
  // For now, assume pie drill up primarily affects pies.
};

// --- HELPER FOR PIE CHART UI ---
const getParentLabel = (categoryKey) => {
  const trail = vizStore.currentDisplayState[categoryKey]?.parentTrail;
  if (trail && trail.length > 0) {
    const parentNodeId = trail[trail.length - 1].id;
    // Assuming getNodeInfo can correctly find the display name.
    // It might need the categoryKey if IDs are not globally unique across categories.
    const parentNodeInfo = vizStore.getNodeInfo(parentNodeId, categoryKey); 
    return parentNodeInfo?.displayName || parentNodeId;
  }
  return '';
};

// --- CONDITIONAL RENDERING LOGIC ---
const shouldShowPieSection = (targetCategoryKey) => {
  // // Check if any category is in a drilled-down state (L2 or deeper)
  // const anyCategoryDrilledDown = Object.values(vizStore.currentDisplayState).some(
  //   (state) => state.parentTrail.length > 0
  // );

  // if (anyCategoryDrilledDown) {
  //   // If drilled down, only show the pie chart section that is currently active (its parentTrail is not empty)
  //   return vizStore.currentDisplayState[targetCategoryKey].parentTrail.length > 0;
  // }
  // // If no category is drilled down, show all pie chart sections
  return true;
};


// --- DATA PROCESSING & INITIALIZATION ---
async function initializePanelData() {
  dataStoresInitialized.value = false;
  console.log("[OverviewPanel] initializePanelData: Starting...");
  try {
    if (!dataStore.allDataLoaded) {
      console.log("[OverviewPanel] initializePanelData: dataStore not loaded, fetching all data...");
      await dataStore.fetchAllData();
      console.log("[OverviewPanel] initializePanelData: dataStore.fetchAllData() complete.");
    }
    
    console.log("[OverviewPanel] initializePanelData: Calling vizStore.fetchData()...");
    await vizStore.fetchData(); // 确保 vizStore.fetchData 是 async 并被正确 await
    console.log("[OverviewPanel] initializePanelData: vizStore.fetchData() complete.");

    processBarChartData();
    console.log("[OverviewPanel] initializePanelData: Bar chart data processed.");
    
    dataStoresInitialized.value = true;
    console.log("[OverviewPanel] initializePanelData: Panel fully initialized. dataStoresInitialized set to true.");

  } catch (error) {
    console.error("[OverviewPanel] initializePanelData: Failed", error);
    dataStoresInitialized.value = true; 
  }
}

function processBarChartData() {
  if (!dataStore.precomputedStats?.yearlyStats) {
    barChartData.value = { years: [], series: [], totalPapersByYear: {} };
    console.warn("OverviewPanel: No precomputed yearlyStats to process for Bar Chart.");
    return;
  }

  const yearlyStats = dataStore.precomputedStats.yearlyStats;
  const sortedYears = Object.keys(yearlyStats)
    .filter(year => year !== 'overall' && yearlyStats[year]?.total !== undefined) // Filter out 'overall' and ensure 'total' exists
    .sort((a, b) => Number(a) - Number(b));

  if (sortedYears.length === 0) {
      barChartData.value = { years: [], series: [], totalPapersByYear: {} };
      return;
  }
  
  const totalPapersByYear = {};
  const bestPaperData = [];
  const honorableMentionsData = [];
  const regularPapersData = [];

  sortedYears.forEach(year => {
    const yearData = yearlyStats[year];
    const total = yearData.total || 0;
    totalPapersByYear[year] = total;

    // Extract awarded counts from precomputedStats
    // Assuming precomputedStats.yearlyStats[year].awards.bestPaper and .awards.honorableMention exist
    // Or, if it's directly under yearData:
    const best = yearData.awards?.['#best paper'] || yearData['#best paper'] || 0; // Check both structures
    const honorable = yearData.awards?.['#honorable mention'] || yearData['#honorable mention'] || 0;
    
    bestPaperData.push(best);
    honorableMentionsData.push(honorable);
    regularPapersData.push(total - best - honorable);
  });
  
  barChartData.value = {
    years: sortedYears,
    series: [
      { name: '常规论文', data: regularPapersData, color: BAR_CHART_COLORS.REGULAR },
      { name: '荣誉提名', data: honorableMentionsData, color: BAR_CHART_COLORS.HONORABLE_MENTION },
      { name: '最佳论文', data: bestPaperData, color: BAR_CHART_COLORS.AWARDED }
    ],
    totalPapersByYear: totalPapersByYear
  };
}


function handleBreadcrumbRootClick(categoryKey) {
  vizStore.resetPieChartDrillDown(categoryKey);
  // 如果桑基图也需要联动重置，则调用 relationsStore.resetColumn(columnIndex)
  if (categoryKey === 'researchContent') relationsStore.resetColumn(2);
  else if (categoryKey === 'researchMethod') relationsStore.resetColumn(1);
  else if (categoryKey === 'researchPlatform') relationsStore.resetColumn(0);
}

function handleBreadcrumbItemClick(categoryKey, trailIndex) {
  const trail = vizStore.currentDisplayState[categoryKey].parentTrail;
  const clicksToDrillUp = trail.length - 1 - trailIndex;
  for (let i = 0; i < clicksToDrillUp; i++) {
    vizStore.drillUp(categoryKey);
    // 考虑是否以及如何同步桑基图的上卷
  }
}

// handlePieDrillUp 已经存在，确保它调用 vizStore.drillUp(categoryKey)
// 并考虑是否需要同步桑基图的上卷
const handlePieDrillUpFromChild = (categoryKey) => { // 重命名以区分
    console.log(`OverviewPanel: Pie drill up for category: ${categoryKey}`);
    vizStore.drillUp(categoryKey);
    // 如果桑基图需要响应扇形图的上卷（例如，折叠对应列的当前展开节点）
    // 这需要更复杂的逻辑来映射扇形图的 categoryKey 和 parentTrail 到桑基图的节点和列
    // 例如:
    // if (categoryKey === 'researchContent') {
    //   const currentSankeyLevel = relationsStore.state.columnLevels[2];
    //   const currentExpandedContentNodes = relationsStore.state.expandedNodes[2];
    //   // 基于 vizStore.currentDisplayState.researchContent.activeNodeId (现在是父级)
    //   // 来决定如何在 relationsStore 中调用 collapseNode 或 resetColumn
    // }
};

onMounted(() => {
  initializePanelData();

  // Watch for changes in selected year from vizStore (e.g., if another component changes it)
  // This might be redundant if interactions are one-way (Overview -> vizStore)
  // but good for consistency if selectedYear can be changed externally.
  watch(() => vizStore.selectedYear, (newYear, oldYear) => {
    if (newYear !== oldYear) {
      // console.log(`OverviewPanel: vizStore.selectedYear changed to ${newYear}. Pie data will re-compute.`);
      // Bar chart selection state might need to be updated if it's not directly bound.
      // However, bar chart click ALREADY updates vizStore.selectedYear.
    }
  }, { immediate: false }); // Set to true if you need to react on mount based on initial vizStore.selectedYear

  // Watch for platform display type changes
   watch(() => vizStore.platformDisplayType, (newType, oldType) => {
    if (newType !== oldType) {
      // console.log(`OverviewPanel: vizStore.platformDisplayType changed to ${newType}. Platform pie will re-compute.`);
    }
  }, { immediate: false });
  watch(researchContentPieData, (val) => {
  console.log('Pie chart data changed:', val);
});
});

</script>

<style scoped>
.panel-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: white;
}
.panel-title-bar {
  display: flex;
  align-items: center;
  padding: 2px 8px 6px 0px;
  width: 100%;
  box-sizing: border-box;
  border-bottom: none;
}
.title-group {
  display: flex;
  align-items: center;
  color: var(--color-text-primary, #333);
  font-size: 1.15rem; /* approx 18.4px if 1rem = 16px */
}
.title-icon {
  /* width: 1.5em; */ /* Controlled by svg width/height directly */
  /* height: 1.5em; */
  margin-right: 6px;
  color: #333; /* Or use var(--color-text-primary) */
}
.title-text {
  font-weight: 600;
}
.charts-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs, 8px); /* Reduced gap slightly */
  padding: var(--space-sm, 8px) var(--space-md, 12px); /* Reduced padding slightly */
  flex-grow: 1;
  overflow-y: auto;
  /* background-color: #f0f2f5; */ /* Optional background for the scrollable area */
}
.chart-wrapper {
  background-color: #ffffff; 
  /* border-radius: var(--border-radius-md, 6px); */
  /* box-shadow: 0 1px 3px rgba(0,0,0,0.05); */ /* Softer shadow */
  /* padding-bottom: var(--space-xs, 8px); */ /* Add some space below each chart if needed */
}
.loading-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--color-text-placeholder, #9ca3af);
  font-style: italic;
  font-size: 0.9em;
  text-align: center;
  min-height: 100px; /* Ensure placeholder has some height */
}
.pie-breadcrumb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 8px 4px 8px; /* 根据需要调整 */
  font-size: 0.85em;
  color: var(--color-text-secondary);
}
.breadcrumb-trail a {
  color: var(--color-primary);
  text-decoration: none;
}
.breadcrumb-trail a:hover {
  text-decoration: underline;
}
.breadcrumb-back-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  color: var(--color-text-secondary);
}
.breadcrumb-back-button:hover {
  color: var(--color-primary);
}

</style>