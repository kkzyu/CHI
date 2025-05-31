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
          :chart-data="barChartData"
          @bar-click="handleBarChartClick" v-if="statsLoaded && barChartData.years && barChartData.years.length > 0"
        />
        <div v-else class="loading-placeholder" :style="{ height: '120px' }">论文数量加载中...</div>
      </div>

      <div class="chart-wrapper">
        <PieChart
          title="研究内容"
          chart-height="190px"
          :chart-data="researchContentPieData"
          :show-selector="false" 
          v-if="statsLoaded"
        />
         <div v-else class="loading-placeholder" :style="{ height: '180px' }">研究内容数据加载中...</div>
      </div>

      <div class="chart-wrapper">
        <PieChart
          title="研究方法"
          chart-height="190px"
          :chart-data="researchMethodPieData"
          :show-selector="false"
          v-if="statsLoaded"
        />
        <div v-else class="loading-placeholder" :style="{ height: '180px' }">研究方法数据加载中...</div>
      </div>

      <div class="chart-wrapper">
        <PieChart
          title="研究平台"
          chart-height="195px"
          :chart-data="researchPlatformPieData"
          :show-selector="true"
          :classification-options="researchPlatformClassificationOptions"
          @classification-change="handlePlatformClassificationChange"
          v-if="statsLoaded"
        />
        <div v-else class="loading-placeholder" :style="{ height: '180px' }">研究平台数据加载中...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import BarChart from '@/components/charts/BarChart.vue';
import PieChart from '@/components/charts/PieChart.vue';

const allRawPapers = ref([]); // Will hold data from papers.json
const precomputedStatsRoot = ref(null); // Will hold data from precomputedStats.json
const statsLoaded = ref(false);
const selectedYearForPies = ref(null); // null 表示显示总体数据

const barChartData = ref({ years: [], series: [] });
const BAR_CHART_COLORS = {
  AWARDED: '#ffe13f',
  HONORABLE_MENTION: '#F9FE7C',
  REGULAR: '#E6EAEE',
};

const researchContentPieData = ref([]);
const researchMethodPieData = ref([]);
const researchPlatformPieData = ref([]);

const TAG_COLOR_DEFINITIONS_BY_DISPLAYNAME = {
    "研究内容": {
        "用户群体与个体特征": "#DC6866",
        "内容与用户交互行为": "#97A7AA",
        "平台算法与功能设计": "#6C97CE",
        "平台治理与规范": "#7D90FD",
        "社会问题与社会参与": "#AF98E0",
        "文化语境与全球视角": "#D55DC5",
        "疾病与健康传播": "#E3E3E3",
        // ... 如果您的 precomputedStats.json 中"研究内容"下还有其他一级分类名，请在此处添加
    },
    "研究方法": {
        "定性研究与用户参与方法": "#FBDCA7",
        "定量研究与实验设计": "#F9BC8B",
        "数据采集与语义预处理": "#FAB1DC",
        "模型构建与算法优化": "#DCEFAC",
        "混合方法与综合研究": "#BFD57A",
        "可视化与交互原型": "#EA8928",
        // ... 如果您的 precomputedStats.json 中"研究方法"下还有其他一级分类名，请在此处添加
    },
    "研究涉及平台-内容形式": { // 用于"研究平台"饼图，"内容形式"选项
        "图文为主": "#84C1FF",
        "图片为主": "#7ED6C2", 
        "视频为主": "#A1C298",    
        "音频为主": "#F3D250",
        "论坛": "#FF9A8B",
        "通信": "#D55DC5",
        "工具/搜索/电商": "#C3AED6",
        "区块链": "#D4D2D5",
        // ... 如果您的 precomputedStats.json 中"研究平台"->"内容形式"->"subCategory"下还有其他键名，请在此处添加
    },
    "研究涉及平台-平台属性": { // 用于"研究平台"饼图，"平台属性"选项
        "主流国际平台": "#84C1FF",    
        "中国本土平台": "#7ED6C2", 
        "匿名/去中心平台": "#A1C298",
        "垂直/边缘平台": "#F3D250",
        "专业工具/办公平台": "#FF9A8B",
        // ... 如果您的 precomputedStats.json 中"研究平台"->"平台属性"->"subCategory"下还有其他键名，请在此处添加
    }
};
function getRandomHexColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const researchPlatformClassificationOptions = ref([
  { label: '内容形式', value: '内容形式' },
  { label: '平台属性', value: '平台属性' },
]);
const currentPlatformClassification = ref(researchPlatformClassificationOptions.value[0].value);

const handleBarChartClick = (year) => {
  console.log("Bar chart clicked, year:", year);
  if (selectedYearForPies.value === year) { 
    selectedYearForPies.value = null; // 再次点击同一柱子，重置为显示总体数据
    console.log("Resetting to overall pie data.");
  } else {
    selectedYearForPies.value = year; // 选择特定年份
    console.log(`Setting pie data for year: ${year}`);
  }
  processAllPieChartData(); // 根据新的 selectedYearForPies 重新处理饼图数据
};

async function fetchData() {
  statsLoaded.value = false;
  console.log("Fetching data...");
  try {
    const [papersResponse, precomputedStatsResponse] = await Promise.all([
      fetch('public/data/raw/papers.json'), // 路径指向您的 papers.json
      fetch('public/data/layout/precomputedStats.json')
    ]);

    if (!papersResponse.ok) throw new Error(`HTTP error! status: ${papersResponse.status} for papers.json`);
    if (!precomputedStatsResponse.ok) throw new Error(`HTTP error! status: ${precomputedStatsResponse.status} for precomputedStats.json`);

    const papersFileContent = await papersResponse.json();
    // **MODIFICATION START: Directly assign if papers.json is an array**
    if (Array.isArray(papersFileContent)) {
      allRawPapers.value = papersFileContent;
    } else if (papersFileContent && Array.isArray(papersFileContent.papers)) { // Fallback if it has a "papers" key
      allRawPapers.value = papersFileContent.papers;
    } else {
      allRawPapers.value = [];
      console.warn("papers.json is not an array and does not contain a 'papers' key with an array.");
    }
    // **MODIFICATION END**
    console.log("Fetched papers.json, number of papers:", allRawPapers.value.length);
    if (allRawPapers.value.length > 0) {
        // console.log("First paper from papers.json:", JSON.parse(JSON.stringify(allRawPapers.value[0])));
    }

    precomputedStatsRoot.value = await precomputedStatsResponse.json();
    // console.log("Fetched precomputedStats.json content:", JSON.parse(JSON.stringify(precomputedStatsRoot.value)));

    processBarChartData(); // 使用 allRawPapers (来自 papers.json)
    processAllPieChartData(); // 使用 precomputedStatsRoot (来自 precomputedStats.json)
    
    statsLoaded.value = true;
    // console.log("Data processing complete. Stats loaded.");

  } catch (error) {
    console.error("Failed to fetch or process initial data:", error);
    barChartData.value = { years: [], series: [] };
    researchContentPieData.value = [];
    researchMethodPieData.value = [];
    researchPlatformPieData.value = [];
    statsLoaded.value = true; 
  }
}

function processBarChartData() {
  // console.log("Processing Bar Chart Data using allRawPapers.value from papers.json...");
  if (!allRawPapers.value || allRawPapers.value.length === 0) {
    barChartData.value = { years: [], series: [] };
    console.warn("No data from papers.json to process for Bar Chart.");
    return;
  }

  const yearlyCounts = {};
  const allYearsSet = new Set();

  // **MODIFICATION START: Define award keywords and check Tags field**
  const awardKeywords = {
    bestPaper: ["#best paper"], // Customize as needed
    honorableMention: ["#honorable mention"] // Customize as needed
  };

  allRawPapers.value.forEach(paper => {
    const yearStr = String(paper.Year).trim(); // Assuming column name is "Year"
    if (!yearStr) return;
    allYearsSet.add(yearStr);

    if (!yearlyCounts[yearStr]) {
      yearlyCounts[yearStr] = { bestPaper: 0, honorableMention: 0, total: 0 };
    }
    yearlyCounts[yearStr].total++;

    const paperTagsValue = paper.Tags; // Assuming column name is "Tags"
    let isAwardedBest = false;
    let isHonorableMention = false;

    // **MODIFIED LOGIC TO HANDLE Tags AS ARRAY OR STRING**
    if (Array.isArray(paperTagsValue)) {
      const lowerCaseTagsArray = paperTagsValue.map(tag => String(tag).toLowerCase().trim());
      isAwardedBest = awardKeywords.bestPaper.some(keyword => 
        lowerCaseTagsArray.some(tagInArray => tagInArray.includes(keyword.toLowerCase()))
      );
      if (!isAwardedBest) { // 只有在不是最佳论文时，才检查是否为荣誉提名
        isHonorableMention = awardKeywords.honorableMention.some(keyword => 
          lowerCaseTagsArray.some(tagInArray => tagInArray.includes(keyword.toLowerCase()))
        );
      }
    } else if (typeof paperTagsValue === 'string' && paperTagsValue.trim() !== "") {
      const lowerCaseTagsString = paperTagsValue.toLowerCase();
      isAwardedBest = awardKeywords.bestPaper.some(keyword => lowerCaseTagsString.includes(keyword.toLowerCase()));
      if (!isAwardedBest) {
        isHonorableMention = awardKeywords.honorableMention.some(keyword => lowerCaseTagsString.includes(keyword.toLowerCase()));
      }
    }
    // **END OF MODIFIED LOGIC**

    if (isAwardedBest) {
      yearlyCounts[yearStr].bestPaper++;
    } else if (isHonorableMention) {
      yearlyCounts[yearStr].honorableMention++;
    }
  });
  // **MODIFICATION END**

  const sortedYears = Array.from(allYearsSet).sort((a, b) => Number(a) - Number(b));
  
  if (sortedYears.length === 0) {
      barChartData.value = { years: [], series: [] };
      return;
  }

  const bestPaperData = sortedYears.map(year => yearlyCounts[year]?.bestPaper || 0);
  const honorableMentionsData = sortedYears.map(year => yearlyCounts[year]?.honorableMention || 0);
  const regularPapersData = sortedYears.map(year => {
    const totalForYear = yearlyCounts[year]?.total || 0;
    const awardedForYear = (yearlyCounts[year]?.bestPaper || 0) + (yearlyCounts[year]?.honorableMention || 0);
    return totalForYear - awardedForYear;
  });

  barChartData.value = {
    years: sortedYears,
    series: [
      { name: '常规论文', data: regularPapersData, color: BAR_CHART_COLORS.REGULAR },
      { name: '荣誉提名', data: honorableMentionsData, color: BAR_CHART_COLORS.HONORABLE_MENTION },
      { name: '最佳论文', data: bestPaperData, color: BAR_CHART_COLORS.AWARDED }
    ],
  };
  // console.log("Final Bar Chart Data (from papers.json):", JSON.parse(JSON.stringify(barChartData.value)));
}


// **MODIFIED: extractPieDataWithColors 现在改为 applyColorsToPieData, extractPieData 简化**
function extractPieData(categoryDataObject, chartNameForLog) {
  if (!categoryDataObject || Object.keys(categoryDataObject).length === 0) {
    return [];
  }
  const result = Object.entries(categoryDataObject)
    .map(([name, data]) => {
      const value = (data && typeof data.total === 'number') ? data.total : 0;
      return { name, value }; // 只返回 name 和 value
    })
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);
  return result;
}

function applyColorsToPieData(pieDataArray, mainCategoryKeyForColor, subCategoryKeyForPlatformColor = null) {
    if (!pieDataArray || pieDataArray.length === 0) return [];

    let colorMapSource;
    if (mainCategoryKeyForColor === "研究平台" && subCategoryKeyForPlatformColor) {
        colorMapSource = TAG_COLOR_DEFINITIONS_BY_DISPLAYNAME[subCategoryKeyForPlatformColor === '内容形式' ? "研究涉及平台-内容形式" : "研究涉及平台-平台属性"];
    } else {
        colorMapSource = TAG_COLOR_DEFINITIONS_BY_DISPLAYNAME[mainCategoryKeyForColor];
    }

    if (!colorMapSource) {
        // console.warn(`Color definitions not found for category: ${mainCategoryKeyForColor}` + (subCategoryKeyForPlatformColor ? ` -> ${subCategoryKeyForPlatformColor}` : ''));
        return pieDataArray.map(item => ({ ...item, itemStyle: { color: getRandomHexColor() } }));
    }

    return pieDataArray.map(item => {
        const color = colorMapSource[item.name] || getRandomHexColor(); // 如果在映射中找不到特定名称，则使用随机颜色
        return { ...item, itemStyle: { color } };
    });
}


function processAllPieChartData() {
  const rootStats = precomputedStatsRoot.value;
  let sourceForCategories = null;
  let currentYearDisplay = "Overall"; 

  if (selectedYearForPies.value && 
      rootStats?.yearlyStats?.[selectedYearForPies.value]?.byCategory) {
    sourceForCategories = rootStats.yearlyStats[selectedYearForPies.value].byCategory;
    currentYearDisplay = selectedYearForPies.value;
  } else if (rootStats?.yearlyStats?.overall?.byCategory) {
    if (selectedYearForPies.value) { 
        // console.warn(...);
    }
    sourceForCategories = rootStats.yearlyStats.overall.byCategory;
    currentYearDisplay = "Overall";
    if (selectedYearForPies.value) selectedYearForPies.value = null; 
  }
  
  if (!sourceForCategories) {
    console.warn(`Pie Chart Data WARNING: No suitable data source found (Year: ${selectedYearForPies.value || 'Overall'}). Pies will be empty.`);
    researchContentPieData.value = []; researchMethodPieData.value = []; researchPlatformPieData.value = [];
    return;
  }

  // --- "研究内容" Pie Data ---
  const rcCategoryData = sourceForCategories["研究内容"];
  let tempResearchContentData = extractPieData(rcCategoryData, `研究内容 (${currentYearDisplay})`);
  tempResearchContentData = applyColorsToPieData(tempResearchContentData, "研究内容"); // 应用颜色
  researchContentPieData.value = tempResearchContentData.filter(item => item.name !== "其他");

  // --- "研究方法" Pie Data ---
  const rmCategoryData = sourceForCategories["研究方法"];
  let tempResearchMethodData = extractPieData(rmCategoryData, `研究方法 (${currentYearDisplay})`);
  researchMethodPieData.value = applyColorsToPieData(tempResearchMethodData, "研究方法"); // 应用颜色

  // --- "研究平台" Pie Data ---
  const rpTopCategory = sourceForCategories["研究平台"];
  const platformType = currentPlatformClassification.value; // "内容形式" or "平台属性"
  let tempResearchPlatformData = [];

  if (rpTopCategory && platformType && rpTopCategory[platformType] && rpTopCategory[platformType].subCategory) {
    const platformSubCategoryData = rpTopCategory[platformType].subCategory;
    tempResearchPlatformData = extractPieData(platformSubCategoryData, `研究平台 - ${platformType} (${currentYearDisplay})`);
    // 为"研究平台"应用颜色时，需要传递正确的子类别键 (内容形式/平台属性)
    tempResearchPlatformData = applyColorsToPieData(tempResearchPlatformData, "研究平台", platformType); 
  }
  researchPlatformPieData.value = tempResearchPlatformData;
}
const handlePlatformClassificationChange = (newClassification) => {
  // console.log("Platform classification changed to:", newClassification);
  currentPlatformClassification.value = newClassification;
  processAllPieChartData();
};

onMounted(() => {
  fetchData();
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
  font-size: 1.15rem;
}
.title-icon {
  width: 1.5em;
  height: 1.5em;
  margin-right: 6px;
  color: #333;
}
.title-text {
  font-weight: 600;
}
.charts-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-md, 12px);
  padding: var(--space-md, 12px) var(--space-lg, 18px);
  flex-grow: 1;
  overflow-y: auto;
}
.chart-wrapper {
  background-color: #ffffff; 
  /* padding:8px; */
  /* border-radius: var(--border-radius-md, 6px);  */
  /* box-shadow: 0 2px 8px rgba(0,0,0,0.06); */
}
.loading-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--color-text-placeholder, #9ca3af);
  font-style: italic;
  font-size: 0.9em;
  text-align: center;
}
</style>