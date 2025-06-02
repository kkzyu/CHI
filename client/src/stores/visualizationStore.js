import { defineStore } from 'pinia';
import { ref, reactive, computed } from 'vue';




export const useVisualizationStore = defineStore('visualization', () => {

    // 辅助函数：根据ID从层级数据中获取颜色 (示例，具体实现依赖你的颜色定义)
// 你可能需要整合来自 nodeMetadata.json 和 platformConfiguration.json 的颜色信息
function getTagColor(tagIdOrName, categoryKey) {
  let colorToReturn = null;
  // 平台特殊处理
  if (categoryKey === '研究平台' && platformConfig.value) {
    const currentPlatformDisplayType = currentDisplayState.researchPlatform.displayType;
    const typeConfig = platformConfig.value.platformTypes[currentPlatformDisplayType];
    if (typeConfig?.hierarchy?.l1) {
      const l1Node = typeConfig.hierarchy.l1.find(n => n.name === tagIdOrName || n.id === tagIdOrName);
      if (l1Node?.color && l1Node.color !== '#PLACEHOLDER') colorToReturn = l1Node.color;
    }
  }
  // 内容/方法优先查 nodeMetadata
  if (!colorToReturn) {
    const nodeInfoFromMeta = getNodeInfo(tagIdOrName, categoryKey);
    if (nodeInfoFromMeta?.color && nodeInfoFromMeta.color !== '#PLACEHOLDER') {
      colorToReturn = nodeInfoFromMeta.color;
    } else if (nodeInfoFromMeta?.parent) {
      // fallback: 查父节点颜色
      const parentInfo = getNodeInfo(nodeInfoFromMeta.parent, categoryKey);
      if (parentInfo?.color && parentInfo.color !== '#PLACEHOLDER') {
        colorToReturn = parentInfo.color;
      }
    }
  }
  // 备用hash色
  if (!colorToReturn) {
    const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'];
    let hash = 0;
    for (let i = 0; i < String(tagIdOrName).length; i++) {
      hash = String(tagIdOrName).charCodeAt(i) + ((hash << 5) - hash);
    }
    colorToReturn = colors[Math.abs(hash) % colors.length];
  }
  return colorToReturn;
}

  // --- 1. State (状态) ---
  const awardStatsByYear = ref({});
  const allRawPapers = ref([]); // 存储来自 papers.json 的原始论文数据
  const tagsHierarchy = ref(null); // 存储来自 allTagsById.json 的完整标签层级数据
  const nodeMetadata = ref(null); // 存储来自 nodeMetadata.json 的元数据 (可选，如果颜色等信息在这里)
  const platformConfig = ref(null); // 存储来自 platformConfiguration.json 的数据
  const precomputedStats = ref(null); // 存储来自 precomputedStats.json 的预计算统计数据

  const selectedYear = ref(null); // 当前选中的年份，null 表示未选中 (显示所有年份数据汇总)

  // 各个饼图的当前显示状态
  const currentDisplayState = reactive({
    researchContent: {
      parentTrail: [], // 面包屑导航路径 [{id, name}]
      activeNodeId: '研究内容', // 当前作为父节点展示其子项的节点ID
      displayLevelName: '一级分类', // 当前显示层级的名称 (用于标题)
      pieTitle: '研究内容' // 动态饼图标题
    },
    researchMethod: {
      parentTrail: [],
      activeNodeId: '研究方法',
      displayLevelName: '一级分类',
      pieTitle: '研究方法'
    },
    researchPlatform: {
      parentTrail: [],
      activeNodeId: '研究平台', // 初始可以是 '研究平台' 本身
      displayType: '内容形式', // '内容形式' 或 '平台属性'
      displayLevelName: '主要分类', // 例如 按内容形式 - L1
      pieTitle: '研究平台 - 按内容形式'
    }
  });

  // --- 2. Actions (操作) ---

  /**
   * 异步获取所有必要的数据文件
   */
async function fetchData() {
    console.log("[VS] fetchData: STARTING");
    try {
      const [
        papersRes,
        tagsHierarchyRes, // from allTagsById.json
        precomputedStatsRes,
        nodeMetaRes,       // from nodeMetadata.json
        platformConfigRes
      ] = await Promise.all([
        fetch('data/raw/papers.json').then(res => {
          console.log('[VS] papers.json status:', res.status);
          if (!res.ok) throw new Error(`Fetch failed for papers.json: ${res.status}`);
          return res.json();
        }),
        fetch('data/raw/allTagsById.json').then(res => { // <<<< 重点关注这个文件
          console.log('[VS] allTagsById.json status:', res.status);
          if (!res.ok) throw new Error(`Fetch failed for allTagsById.json: ${res.status}`);
          return res.json();
        }),
        fetch('data/layout/precomputedStats.json').then(res => {
          console.log('[VS] precomputedStats.json status:', res.status);
          if (!res.ok) throw new Error(`Fetch failed for precomputedStats.json: ${res.status}`);
          return res.json();
        }),
        fetch('data/main/nodeMetadata.json').then(res => {
          console.log('[VS] nodeMetadata.json status:', res.status);
          if (!res.ok) throw new Error(`Fetch failed for nodeMetadata.json: ${res.status}`);
          return res.json();
        }),
        fetch('data/interaction/platformConfiguration.json').then(res => {
          console.log('[VS] platformConfiguration.json status:', res.status);
          if (!res.ok) throw new Error(`Fetch failed for platformConfiguration.json: ${res.status}`);
          return res.json();
        })
      ]);

      console.log("[VS] fetchData: All fetches nominally complete.");
    //   const paperIdToYear = {};
    //     for (const paper of papersRes) {
    //     if (paper.id && paper.Year) {
    //         paperIdToYear[paper.id] = String(paper.Year);
    //         console.log(`[VS] fetchData: paperIdToYear[${paper.id}] = ${paper.Year}`);
    //     }
    //     }
    //     // 存到全局
    //     window.paperIdToYear = paperIdToYear; // 或 dataStore.paperIdToYear = paperIdToYear;

        const tempAwardStats = {};
    for (const paper of papersRes) {
    const year = String(paper.Year || paper.year);
    if (!year) continue;
    if (!tempAwardStats[year]) {
        tempAwardStats[year] = { bestPaper: 0, honorableMention: 0, notAwarded: 0, total: 0 };
    }
    tempAwardStats[year].total += 1;
    let tags = [];
    if (Array.isArray(paper.Tags)) {
        tags = paper.Tags.map(t => t.trim().toLowerCase()).filter(Boolean);
    } else if (typeof paper.Tags === 'string') {
        tags = paper.Tags.split(/[;,，、\s]+/).map(t => t.trim().toLowerCase()).filter(Boolean);
    }
    if (tags.includes('#best paper')) {
        tempAwardStats[year].bestPaper += 1;
    } else if (tags.includes('#honorable mention')) {
        tempAwardStats[year].honorableMention += 1;
    } else {
        tempAwardStats[year].notAwarded += 1;
    }
    }
    awardStatsByYear.value = tempAwardStats;
    console.log('awardStatsByYear:', tempAwardStats);

      allRawPapers.value = papersRes;
      
      console.log("[VS] raw content of tagsHierarchyRes (from allTagsById.json):", JSON.parse(JSON.stringify(tagsHierarchyRes)));
      tagsHierarchy.value = tagsHierarchyRes.allTagsById; // <<<< 审视这里
      // 如果 allTagsById.json 的根就是你期望的对象, 例如 {"研究内容": {...}}, 那么应该是:
      // tagsHierarchy.value = tagsHierarchyRes; 
      console.log("[VS] state.tagsHierarchy after assignment:", JSON.parse(JSON.stringify(tagsHierarchy.value)));

      precomputedStats.value = precomputedStatsRes; // 赋值
        console.log("[VS] fetchData: state.precomputedStats AFTER assignment:", 
                    precomputedStats.value ? "LOADED" : "NULL/UNDEFINED");
        if (precomputedStats.value && precomputedStats.value.yearlyStats) {
            console.log("[VS] fetchData: state.precomputedStats.yearlyStats.overall exists:", 
                        !!precomputedStats.value.yearlyStats.overall);
            if (precomputedStats.value.yearlyStats.overall && precomputedStats.value.yearlyStats.overall.byCategory) {
                console.log("[VS] fetchData: overall.byCategory keys:", 
                            Object.keys(precomputedStats.value.yearlyStats.overall.byCategory));
            } else {
                console.warn("[VS] fetchData: overall.byCategory is missing or structured unexpectedly!");
            }
        } else {
            console.warn("[VS] fetchData: state.precomputedStats.yearlyStats is missing!");
        }

    nodeMetadata.value = nodeMetaRes; // 赋值
    console.log("[VS] fetchData: state.nodeMetadata AFTER assignment:", 
                nodeMetadata.value ? "LOADED" : "NULL/UNDEFINED");
    // 在 visualizationStore.js 的 fetchData 内部，nodeMetadata.value 赋值后
if (nodeMetadata.value) {
    console.log("[VS] fetchData: Top-level keys in nodeMetadata.value:", Object.keys(nodeMetadata.value));
    
    // 检查 "研究内容" 的根节点
    console.log("[VS] fetchData: nodeMetadata['研究内容'] exists:", !!nodeMetadata.value['研究内容']);
    console.log("[VS] fetchData: nodeMetadata['研究内容']['研究内容'] (root node) exists:", 
                !!(nodeMetadata.value['研究内容'] && nodeMetadata.value['研究内容']['研究内容']));

    // 检查 "研究涉及平台-内容形式" 的根节点
    const platformContentMetaKey = "研究涉及平台-内容形式";
    console.log(`[VS] fetchData: nodeMetadata['${platformContentMetaKey}'] exists:`, !!nodeMetadata.value[platformContentMetaKey]);
    console.log(`[VS] fetchData: nodeMetadata['${platformContentMetaKey}']['${platformContentMetaKey}'] (root node) exists:`, 
                !!(nodeMetadata.value[platformContentMetaKey] && nodeMetadata.value[platformContentMetaKey][platformContentMetaKey]));
    console.log(`[VS] fetchData: nodeMetadata['${platformContentMetaKey}']['图文为主'] (example child) exists:`,
                !!(nodeMetadata.value[platformContentMetaKey] && nodeMetadata.value[platformContentMetaKey]['图文为主']));

} else {
    console.error("[VS] fetchData: state.nodeMetadata.value is NULL or UNDEFINED after assignment!");
}

      
      platformConfig.value = platformConfigRes;
      console.log("[VS] state.platformConfig assigned:", platformConfig.value ? "OK" : "NULL/UNDEFINED");

      currentDisplayState.researchContent.pieTitle = currentDisplayState.researchContent.activeNodeId;
      currentDisplayState.researchMethod.pieTitle = currentDisplayState.researchMethod.activeNodeId;
      updatePlatformPieTitle();
      console.log("[VS] fetchData: COMPLETED SUCCESSFULLY");

    } catch (error) {
      console.error("[VS] fetchData: FAILED", error);
      // 发生错误时，确保这些状态确实是 null，以便守卫条件能准确反映问题
      tagsHierarchy.value = null;
      precomputedStats.value = null;
      nodeMetadata.value = null;
      platformConfig.value = null;
    }
  }

  /**
   * 更新柱状图选中的年份
   */
  function selectYear(year) {
    selectedYear.value = year;
    // 年份变化时，可能需要重置饼图的钻取状态到顶层，或根据需求保留
    // 为了简单起见，这里不重置，让用户可以继续在特定年份下钻取
    // 如果需要重置：
    // resetPieChartDrillDown('researchContent');
    // resetPieChartDrillDown('researchMethod');
    // resetPieChartDrillDown('researchPlatform');
  }

  /**
   * 获取节点信息 (辅助函数)
   */
// 在 visualizationStore.js 中
// 在 visualizationStore.js 中
function getNodeInfo(nodeId, categoryKey) {
  // 直接使用通过 ref 或 reactive 定义的顶层变量
  // 不需要 state.nodeMetadata.value，而是直接 nodeMetadata.value
  // 不需要 currentDisplayState.researchPlatform.displayType，而是直接 currentDisplayState.researchPlatform.displayType

  if (!nodeMetadata.value || !nodeId) { // 移除 !categoryKey 检查, 它会在下面处理
    // console.warn(`[VS getNodeInfo] Initial check fail: nodeMetadata loaded: ${!!nodeMetadata.value}, nodeId: ${nodeId}, categoryKey: ${categoryKey}`);
    return null;
  }
  const CATEGORY_KEY_TO_METADATA_KEY = {
    researchContent: '研究内容',
    researchMethod: '研究方法',
    researchPlatform: null, // 下面有特殊处理
  };

  let actualMetadataCategoryKey = CATEGORY_KEY_TO_METADATA_KEY[categoryKey] ?? categoryKey;
  let nodeIdToFindWithinThatKey = nodeId;

if (categoryKey === 'researchPlatform') {
  const currentPlatformDisplayType = currentDisplayState.researchPlatform.displayType;
  actualMetadataCategoryKey = `研究涉及平台-${currentPlatformDisplayType}`;
  // 这里 nodeId === '研究平台' 时，应该返回 null，表示没有实际元数据节点
  if (nodeId === '研究平台') {
    // 直接返回 null，避免查找不存在的根节点
    return null;
  }
}
  
  // nodeMetadata 是顶层 ref 对象，需要通过 .value 访问其内容
  const categoryDataInMetadata = nodeMetadata.value[actualMetadataCategoryKey]; 
  if (categoryDataInMetadata && categoryDataInMetadata[nodeIdToFindWithinThatKey]) {
    return categoryDataInMetadata[nodeIdToFindWithinThatKey];
  }

    // 如果是平台数据，尝试在平台配置中查找
  if (categoryKey === 'researchPlatform') {
    const platformTypeConfig = platformConfig.value?.platformTypes?.[currentDisplayState.researchPlatform.displayType];
    const l1Node = platformTypeConfig?.hierarchy?.l1?.find(n => n.id === nodeId || n.name === nodeId);
    if (l1Node) {
      return {
        level: 2,
        displayName: l1Node.name,
        id: l1Node.id,
        color: l1Node.color,
        children: categoryDataInMetadata?.[l1Node.name]?.children || []
      };
    }
  }
  
  console.warn(`[VS getNodeInfo] Node not found. Attempted to find ID "${nodeIdToFindWithinThatKey}" within metadata key "${actualMetadataCategoryKey}". Original (nodeId: "${nodeId}", categoryKey: "${categoryKey}")`);
  return null;
}
  
  /**
   * 更新饼图标题和显示层级名称 (辅助函数)
   */
  function updatePieDisplayInfo(categoryKey, activeNodeDisplayName, trail) {
      const state = currentDisplayState[categoryKey];
      if (trail.length > 0) {
          state.pieTitle = `${trail[trail.length -1].name} - 子分类`;
      } else {
          state.pieTitle = activeNodeDisplayName;
          if (categoryKey === 'researchPlatform') {
             updatePlatformPieTitle(); // 特殊处理平台标题
          }
      }
  }
  
  /**
   * 更新研究平台饼图的标题 (辅助函数)
   */
  function updatePlatformPieTitle() {
      const state = currentDisplayState.researchPlatform;
      const baseTitle = '研究平台';
      if (state.parentTrail.length > 0) {
          state.pieTitle = `${state.parentTrail[state.parentTrail.length -1].name} - 子分类`;
      } else {
          state.pieTitle = `${baseTitle} - 按${state.displayType}`;
      }
  }


  /**
   * 处理饼图/Sankey节点的钻取
   * @param {string} categoryKey - 'researchContent', 'researchMethod', 'researchPlatform'
   * @param {string} nodeIdToDrill - 要钻取到的节点ID (它将成为新的父节点)
   */
    function drillDown(categoryKey, nodeIdToDrill) {
        const stateForCategory = currentDisplayState[categoryKey];
        const nodeInfo = getNodeInfo(nodeIdToDrill, categoryKey);

        // 修改后的条件：只要 nodeInfo 存在，就允许进行状态更新。
        // 面包屑和激活节点应该反映用户的点击，即使该节点是叶子节点。
        if (nodeInfo) { // <--- 修改点：移除了对 nodeInfo.children.length > 0 的检查

            // 这部分是您上次采纳的修复，用于正确处理 parentTrail
            if (stateForCategory.activeNodeId !== nodeIdToDrill) {
                const currentActiveNodeDisplayName = getNodeInfo(stateForCategory.activeNodeId, categoryKey)?.displayName || stateForCategory.activeNodeId;
                stateForCategory.parentTrail.push({ id: stateForCategory.activeNodeId, name: currentActiveNodeDisplayName });
            }

            stateForCategory.activeNodeId = nodeIdToDrill;
            updatePieDisplayInfo(categoryKey, nodeInfo.displayName || nodeInfo.name, stateForCategory.parentTrail);

            // （可选）如果新激活的节点没有子项供饼图显示，可以打印一个日志。
            // 饼图的渲染逻辑（通过 getPieDataForCategory）应能处理这种情况并显示空状态。
            if (!nodeInfo.children || nodeInfo.children.length === 0) {
                console.log(`[VS drillDown] Node ${nodeIdToDrill} is now active but has no children to display in the pie chart for category ${categoryKey}. NodeInfo:`, nodeInfo);
            }

        } else {
            console.warn(`[VS drillDown] Node info not found for ${nodeIdToDrill} in category ${categoryKey}. Cannot drill down.`);
        }
    }

    function drillUp(categoryKey) {
    const stateForCategory = currentDisplayState[categoryKey]; // 获取对应类别的状态对象
    if (stateForCategory.parentTrail.length > 0) {
        const parent = stateForCategory.parentTrail.pop();
        stateForCategory.activeNodeId = parent.id;
        const activeNodeInfo = getNodeInfo(stateForCategory.activeNodeId, categoryKey);
        updatePieDisplayInfo(categoryKey, activeNodeInfo?.displayName || stateForCategory.activeNodeId, stateForCategory.parentTrail);
    }
    }
  
  /**
   * 重置特定饼图的钻取状态到顶层
   */
  function resetPieChartDrillDown(categoryKey) {
      const state = currentDisplayState[categoryKey];
      let rootNodeId = '';
      let rootNodeName = '';
      if (categoryKey === 'researchContent') {
          rootNodeId = '研究内容';
          rootNodeName = '研究内容';
      } else if (categoryKey === 'researchMethod') {
          rootNodeId = '研究方法';
          rootNodeName = '研究方法';
      } else if (categoryKey === 'researchPlatform') {
          rootNodeId = '研究平台'; // 或者根据 displayType 变化，例如直接是 '内容形式'
          rootNodeName = `研究平台 - 按${state.displayType}`;
      }
      state.parentTrail = [];
      state.activeNodeId = rootNodeId;
      state.pieTitle = rootNodeName;
      if (categoryKey === 'researchPlatform') updatePlatformPieTitle();
  }

  /**
   * 设置研究平台的分类方式 ('内容形式' 或 '平台属性')
   */
  function setPlatformDisplayType(type) {
    const state = currentDisplayState.researchPlatform;
    if (state.displayType !== type) {
      state.displayType = type;
      // 切换类型时，重置钻取路径到该类型对应的顶层或研究平台本身
      state.parentTrail = [];
      state.activeNodeId = '研究平台'; // 重置到总的“研究平台”节点，getter会根据displayType选择子节点
      updatePlatformPieTitle();
    }
  }

  // --- 3. Getters (计算属性) ---

  /**
   * 根据选中年份筛选后的论文数据 (来自 precomputedStats)
   * 注意：precomputedStats 的结构是按年份组织的，所以筛选逻辑会直接作用于这个对象。
   */
const currentYearStats = computed(() => {
  if (!precomputedStats.value || !precomputedStats.value.yearlyStats) { // 添加对 yearlyStats 的检查
    // console.warn("[VS] currentYearStats: precomputedStats.value or precomputedStats.value.yearlyStats is null/undefined.");
    return null;
  }
  if (selectedYear.value) {
    // console.log(`[VS] currentYearStats: Using year ${selectedYear.value}`);
    return precomputedStats.value.yearlyStats[selectedYear.value];
  }
  // console.log("[VS] currentYearStats: Using overall stats");
  return precomputedStats.value.yearlyStats.overall; // <--- 修改此处
});

  /**
   * 柱状图数据源
   */


const barChartDataSource = computed(() => {
  const stats = awardStatsByYear.value;
  const years = Object.keys(stats).sort((a, b) => Number(a) - Number(b));
  const awardColors = { BEST_PAPER: '#FFC300', HONORABLE_MENTION: '#FFEEAA', NOT_AWARDED: '#CCCCCC' };
  return {
    years,
    series: [
      {
        name: '常规论文',
        data: years.map(year => stats[year]?.notAwarded || 0),
        color: awardColors.NOT_AWARDED,
      },
      {
        name: '荣誉提名',
        data: years.map(year => stats[year]?.honorableMention || 0),
        color: awardColors.HONORABLE_MENTION,
      },
      {
        name: '最佳论文',
        data: years.map(year => stats[year]?.bestPaper || 0),
        color: awardColors.BEST_PAPER,
      }
    ],
    totalCounts: years.map(year => stats[year]?.total || 0)
  };
});

  /**
   * 通用饼图数据提取逻辑 (核心)
   * @param {string} categoryKey - 'researchContent', 'researchMethod', 'researchPlatform'
   */
  // 在 visualizationStore.js 的 getPieDataForCategory 函数中

function getPieDataForCategory(categoryKey) {
    const CATEGORY_KEY_TO_CN = {
        researchContent: '研究内容',
        researchMethod: '研究方法',
        researchPlatform: '研究平台'
  };
    const statsCategoryKey = CATEGORY_KEY_TO_CN[categoryKey] || categoryKey;
    if (!currentYearStats.value || !nodeMetadata.value || !platformConfig.value) {
        console.warn(`[${categoryKey}] PieData: Missing essential store data (currentYearStats, nodeMetadata, or platformConfig).`);
        return [];
    }
  const displayConf = currentDisplayState[categoryKey];

  // 顶层“研究平台”特殊处理，不依赖 activeNodeInfo
  if (categoryKey === 'researchPlatform' && displayConf.parentTrail.length === 0) {
    const platformTypeConfig = platformConfig.value.platformTypes[displayConf.displayType];
    if (!platformTypeConfig?.hierarchy?.l1) return [];
    const l1PlatformStatsContainer = currentYearStats.value.byCategory?.['研究平台']?.[displayConf.displayType]?.subCategory;
    if (!l1PlatformStatsContainer) {
      console.warn(`[VS - ${categoryKey}] PieData L1: Stats container for L1 platforms not found at 'currentYearStats.byCategory.研究平台.${displayConf.displayType}.subCategory'.`);
    }
    let itemsToShowDetails = platformTypeConfig.hierarchy.l1.map(l1NodeFromConfig => {
      const count = l1PlatformStatsContainer?.[l1NodeFromConfig.name]?.total || 0;
      return { 
        id: l1NodeFromConfig.id,    
        name: l1NodeFromConfig.name, 
        value: count, 
        color: l1NodeFromConfig.color 
      };
    });
    itemsToShowDetails = itemsToShowDetails.filter(item => item && item.value > 0);
    itemsToShowDetails.sort((a, b) => b.value - a.value);
    return itemsToShowDetails.map(item => ({
      ...item,
      itemStyle: { color: item.color || getTagColor(item.id, categoryKey) },
    }));
  }
  

  // 其他情况（内容/方法/平台下钻）才用 activeNodeInfo
  const activeNodeInfo = getNodeInfo(displayConf.activeNodeId, categoryKey); 
  if (!activeNodeInfo) {
    console.warn(`[VS - ${categoryKey}] PieData: Active node info not found for ID: "${displayConf.activeNodeId}" (category: "${categoryKey}"). getNodeInfo returned null.`);
    return [];
  }

    
    // C. 获取当前年份的统计数据中对应此大类的数据 (保持不变)
    const statsForRootCategory = currentYearStats.value.byCategory?.[statsCategoryKey];
    if (!statsForRootCategory && categoryKey !== 'researchPlatform') { // researchPlatform的顶层统计路径不同
        console.warn(`[${categoryKey}] PieData: Stats not found for root category "${categoryKey}" in currentYearStats.`);
        return [];
    }


    let itemsToShowDetails = [];

    // D. 判断显示层级并提取数据
  if (displayConf.parentTrail.length === 0) { // 正在显示L1层 (饼图的顶层)
    // if (categoryKey === 'researchPlatform') {
    //   // activeNodeInfo 此时应该是代表当前 displayType 的元节点，例如 nodeMetadata["研究涉及平台-内容形式"]["研究涉及平台-内容形式"]
    //   // 其 children 属性 (如果按元数据定义) 应该是 L1 平台类型名，如 "图文为主"
    //   // 但我们通常从 platformConfig 获取 L1 结构，从 precomputedStats 获取计数

    //   const platformTypeConfig = platformConfig.value.platformTypes[displayConf.displayType];
    //   if (!platformTypeConfig?.hierarchy?.l1) { /* ... return [] */ }

    //   // 正确的路径来获取L1平台类型的统计数据容器
    //   const l1PlatformStatsContainer = currentYearStats.value.byCategory?.['研究平台']?.[displayConf.displayType]?.subCategory;

    //   if (!l1PlatformStatsContainer) {
    //     console.warn(`[VS - ${categoryKey}] PieData L1: Stats container for L1 platforms not found at 'currentYearStats.byCategory.研究平台.${displayConf.displayType}.subCategory'.`);
    //   }

    //   itemsToShowDetails = platformTypeConfig.hierarchy.l1.map(l1NodeFromConfig => { // "图文为主", etc.
    //     const count = l1PlatformStatsContainer?.[l1NodeFromConfig.name]?.total || 0;
    //     return { 
    //       id: l1NodeFromConfig.id,    
    //       name: l1NodeFromConfig.name, 
    //       value: count, 
    //       color: l1NodeFromConfig.color 
    //     };
    //   });
    // } else { // 研究内容 或 研究方法 顶层
      // activeNodeInfo 是 "研究内容" 或 "研究方法" 的根节点 (例如 nodeMetadata['研究内容']['研究内容'])
      // activeNodeInfo.children 是 L2 节点 ID (全名，如 "用户群体与个体特征")
      const childrenNodeIDsFromMetadata = activeNodeInfo.children || []; 
      
      const statsForThisCategory = currentYearStats.value.byCategory?.[statsCategoryKey]; // e.g., currentYearStats.byCategory['研究内容']
      if (!statsForThisCategory) { /* ... return [] */ }

        itemsToShowDetails = childrenNodeIDsFromMetadata.map(childFullId => {
  const childNodeInfo = getNodeInfo(childFullId, categoryKey); 
  if (!childNodeInfo) return null;
  let count = 0;
  // L1 层直接用 statsForThisCategory
  count = statsForThisCategory?.[childNodeInfo.displayName]?.total || 0;
  return { 
    id: childNodeInfo.id,
    name: childNodeInfo.displayName,
    value: count,
    color: childNodeInfo.color
  };
}).filter(item => item !== null);
    }
   else { // 正在显示下钻后的层级 (L2 或 L3 pie display)
    let statsContainerForChildren;
    if (categoryKey === 'researchPlatform') {
        const statsContainerForChildren = currentYearStats.value.byCategory?.['研究平台']?.[displayConf.displayType]?.subCategory?.[activeNodeInfo.displayName]?.tags;
        console.log('            [PieData] statsContainerForChildren:', statsContainerForChildren, 'activeNodeInfo.displayName:', activeNodeInfo.displayName);

        if (!statsContainerForChildren) {
        console.warn(`[VS - ${categoryKey}] PieData: Stats container not found for platform children`);
        return [];
        }
        const colors_platform = ['#F4ED88', '#ADFD99', '#64DEFF', '#9BCBFD'];
        itemsToShowDetails = (activeNodeInfo.children || []).map((childId, idx) => {
        const childNodeInfo = getNodeInfo(childId, categoryKey);
        if (!childNodeInfo) return null;
        const count = statsContainerForChildren?.[childNodeInfo.displayName]?.total || 0;
        return {
            id: childNodeInfo.id,
            name: childNodeInfo.displayName,
            value: count || 1,
            // 用 idx 做颜色分配
            // color: colors_platform[idx % colors_platform.length]
        };
    }).filter(item => item !== null)
    //   .sort((a, b) => b.value - a.value)
    //   .slice(0, 4);
    ;
    itemsToShowDetails = itemsToShowDetails
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);
    // 再分配颜色
itemsToShowDetails = itemsToShowDetails.map((item, idx) => ({
  ...item,
  color: colors_platform[idx % colors_platform.length]
}));
  }else{
    // activeNodeInfo 是我们已下钻进入的父节点。
    // 例如：研究内容 -> activeNodeId="用户群体与个体特征" (L2), activeNodeInfo 是其元数据
    // 例如：研究平台 -> activeNodeId="图文为主" (L1平台类型), activeNodeInfo 是其元数据
    const childrenNodeIDsFromMetadata = activeNodeInfo.children || [];
    statsContainerForChildren = currentYearStats.value.byCategory?.[statsCategoryKey]?.[activeNodeInfo.displayName]?.subCategory;

    
    
    if (!statsContainerForChildren) { /* ... console.warn ... */ }

    itemsToShowDetails = childrenNodeIDsFromMetadata.map(childFullId => {
      const childNodeInfo = getNodeInfo(childFullId, categoryKey); 
      if (!childNodeInfo) return null;
      let count = 0;
      count = statsContainerForChildren?.[childNodeInfo.displayName]?.total || 0;
      return { 
        id: childNodeInfo.id,
        name: childNodeInfo.displayName,
        value: count
      };
    }).filter(item => item !== null);
    
    // 排序并分配颜色
    itemsToShowDetails.sort((a, b) => b.value - a.value);
    const colors_content = ['#4A8AB2', '#D0BDBD', '#B84A60', '#E7A6A6'];
    const colors_method = ['#B99C3C', '#859639', '#AF8969', '#EC9F51'];
    
    if (categoryKey === 'researchContent') {
      itemsToShowDetails = itemsToShowDetails.map((item, index) => ({
        ...item,
        color: colors_content[index % colors_content.length] // 循环使用颜色
      }));
    }
    else if (categoryKey === 'researchMethod'){
        itemsToShowDetails = itemsToShowDetails.map((item, index) => ({
            ...item,
            color: colors_method[index % colors_method.length] // 循环使用颜色
        }));
    }
    }
  }

  // E. 过滤、排序、应用TopN、添加颜色
  let processedItems = itemsToShowDetails.filter(item => item && item.value > 0);

  // 只在研究平台且下钻到L3时（parentTrail长度为1）显示前4
  if (categoryKey === 'researchPlatform' && displayConf.parentTrail.length === 1) {
    processedItems.sort((a, b) => b.value - a.value);
    processedItems = processedItems.slice(0, 4);
  } else {
    processedItems.sort((a, b) => b.value - a.value);
  }

  return processedItems.map(item => ({
    ...item,
    itemStyle: { color: item.color || getTagColor(item.id, categoryKey) }
  }));
}
//   const researchContentPieDataSource = computed(() => {
//     // console.log("Forcing researchContentPieDataSource with hardcoded data");
//     return [
//         { name: '测试类别A', value: 10, itemStyle: { color: '#DC6866' } },
//         { name: '测试类别B', value: 20, itemStyle: { color: '#97A7AA' } },
//     ];
// });

  const researchContentPieDataSource = computed(() => getPieDataForCategory('researchContent'));
  const researchMethodPieDataSource = computed(() => getPieDataForCategory('researchMethod'));
  const researchPlatformPieDataSource = computed(() => getPieDataForCategory('researchPlatform'));
  
  /**
   * Sankey 图数据源 (高度依赖Sankey图的期望格式和交互逻辑)
   * 这里只做简单筛选示例
   */
  const sankeyDiagramData = computed(() => {
    if (!precomputedStats.value) return { nodes: [], links: [] };
    // TODO: 根据 selectedYear 和 currentDisplayState (可能影响Sankey图的层级和焦点)
    // 从 precomputedStats.value 或 crossLevelConnections.json 构造 Sankey 数据
    // 这是一个复杂的部分，需要明确Sankey图如何响应年份和层级变化
    // 示例：只基于年份筛选 crossLevelConnections
    // const connectionsData = store.crossLevelConnections; // 假设已加载
    // if (selectedYear.value) { /* filter/recompute connectionsData */ }
    return {
        nodes: [], // { name: 'NodeA', itemStyle: { color: '...' } }
        links: []  // { source: 'NodeA', target: 'NodeB', value: 10 }
    };
  });


  return {
    // State
    allRawPapers,
    tagsHierarchy,
    nodeMetadata,
    platformConfig,
    precomputedStats,
    selectedYear,
    currentDisplayState,
    awardStatsByYear,


    // Getters
    currentYearStats,
    barChartDataSource,
    researchContentPieDataSource,
    researchMethodPieDataSource,
    researchPlatformPieDataSource,
    sankeyDiagramData, // Sankey 数据也应由 store 管理
    getNodeInfo,

    // Actions
    fetchData,
    selectYear,
    drillDown,
    drillUp,
    setPlatformDisplayType,
    resetPieChartDrillDown,
  };
});