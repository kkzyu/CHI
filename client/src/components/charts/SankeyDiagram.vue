<template>
  <div>
    <button @click="resetView">Reset View</button>
    <div ref="sankeyChart" style="width: 100%; height: 800px;"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts/core';
import { SankeyChart } from 'echarts/charts';
import { TooltipComponent, TitleComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([SankeyChart, TooltipComponent, TitleComponent, CanvasRenderer]);

// Root IDs for our three main categories
const ROOT_PLATFORM_ID = '研究平台'; // This is the L0 root for platforms
const ROOT_CONTENT_ID = '研究内容';
const ROOT_METHOD_ID = '研究方法';



export default {
  name: 'SankeyDiagram',
  data() {
    return {
      allTags: {},
      papersData: [],
      // l3Map: {}, // L3TagToIdMap.json - might not be directly needed if allTagsById is comprehensive
      
      platformNameToIdMap: {}, // For mapping paper platform names to IDs

      // activeHierarchy stores arrays of node IDs for each level of expansion
      // The last array in each list is what's currently displayed
      activePlatformHierarchy: [],
      activeContentHierarchy: [],
      activeMethodHierarchy: [],

      chartInstance: null,
      isLoading: true,
    };
  },
  async mounted() {
    await this.loadData();
    this.initializeHierarchies();
    this.initChart();
    this.updateChart();
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    if (this.chartInstance) {
      this.chartInstance.dispose();
    }
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    async loadData() {
      const baseUrl = import.meta.env.BASE_URL; 
      try {
            const fetchData = async (path) => { // path should be relative to the base
            const url = `${baseUrl}${path}`;
            const response = await fetch(url);
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`HTTP error for ${url}! Status: ${response.status}. Response:`, errorText.substring(0, 500) + "...");
                throw new Error(`HTTP error! status: ${response.status} for ${url}`);
            }
            return response.json();
            };

            // Assuming your JSON files are in public/data/
            const [allTagsData, papersData /*, l3MapData*/] = await Promise.all([
            fetchData('data/allTagsById.json'),
            fetchData('data/papers.json'),
            // fetchData('data/L3TagToIdMap.json') // If you use it
            ]);

            this.allTags = allTagsData.allTagsById;
            this.papersData = papersData;
            // this.l3Map = l3MapData.l3TagToIdMap;

            this.buildPlatformNameToIdMap();
            this.preprocessPapersData();
            this.isLoading = false;

        } catch (error) {
            console.error("Error loading data:", error);
            this.isLoading = false;
        }
    },

    buildPlatformNameToIdMap() {
        // Platforms are L3 under "内容形式" or "平台属性" which are L2 under "研究平台"
        // Or, more simply, any tag with level 3 and category "内容形式" or "平台属性"
        for (const tagId in this.allTags) {
            const tag = this.allTags[tagId];
            if (tag.level === 3 && (tag.category === '内容形式' || tag.category === '平台属性')) {
                this.platformNameToIdMap[tag.name] = tag.id;
            }
            // Handle cases like "Instagram Reels" which might be an L3 name but ID is "视频为主-Instagram_Reels"
            // The current structure seems to have L3 names as platform names.
        }
        // Special cases if names don't directly match
        this.platformNameToIdMap['Instagram Reels'] = '视频为主-Instagram_Reels';
        this.platformNameToIdMap['Google Maps'] = '工具/搜索/电商-Google_Maps';
        this.platformNameToIdMap['Google Search'] = '工具/搜索/电商-Google_Search';
        this.platformNameToIdMap['Amazon Mechanical Turk'] = '工具/搜索/电商-Amazon_Mechanical_Turk';
        this.platformNameToIdMap['House Party'] = '视频为主-House_Party';
        this.platformNameToIdMap['SMs. Mechanical'] = '专业工具/办公平台-SMs._Mechanical'; // This seems like a typo in data, might be AMT
        this.platformNameToIdMap['Turk'] = '专业工具/办公平台-Turk'; // Also likely AMT
        this.platformNameToIdMap['Mastodon.Naver'] = '图文为主-Mastodon.Naver'; // If this is two platforms, data needs splitting
    },

    preprocessPapersData() {
        this.papersData = this.papersData.map(paper => {
            const platformIds = (paper.研究涉及平台 || [])
                .map(name => this.platformNameToIdMap[name] || name) // Fallback to name if no ID found
                .filter(id => id); // Ensure no undefined/null
            
            // Assuming 研究内容 and 研究方法 in papers.json are already L3/L4 IDs
            // If they are names, they'd need mapping too. The provided L3TagToIdMap.json suggests they are names.
            // For simplicity, I'll assume they are IDs as per allTagsById.json structure for L3/L4.
            // If they are names, you'd use L3TagToIdMap.json to convert them.
            // Example: paper.研究内容 = paper.研究内容.map(name => this.l3Map['研究内容'][name] || name);

            return {
                ...paper,
                platformTagIds: platformIds,
                contentTagIds: paper.研究内容 || [],
                methodTagIds: paper.研究方法 || [],
            };
        });
    },

    initializeHierarchies() {
      // Initial view: L1 children of the root categories
      this.activePlatformHierarchy = [this.allTags[ROOT_PLATFORM_ID]?.childrenIds || []];
      this.activeContentHierarchy = [this.allTags[ROOT_CONTENT_ID]?.childrenIds || []];
      this.activeMethodHierarchy = [this.allTags[ROOT_METHOD_ID]?.childrenIds || []];
    },

    resetView() {
      this.initializeHierarchies();
      this.updateChart();
    },

    initChart() {
      this.chartInstance = echarts.init(this.$refs.sankeyChart);
      this.chartInstance.on('click', this.handleNodeClick);
    },

    handleResize() {
        if (this.chartInstance) {
            this.chartInstance.resize();
        }
    },
    
    // Recursive helper to get all leaf descendant IDs (L3/L4)
    getAllLeafDescendantIds(tagId) {
      if (!this.allTags[tagId]) return [];
      const tag = this.allTags[tagId];
      if (!tag.childrenIds || tag.childrenIds.length === 0) {
        // It's a leaf if it has no children OR if it's an L3/L4 tag (as per problem, L3/L4 are actual paper tags)
        // The problem states "最后一级标签为实际上给这些论文打的标签"
        // Let's assume L3 and L4 are the "leaf" levels for paper tagging.
        // A more robust way: check if it's a level that papers are tagged with.
        // For now, simple recursion: if no children, it's a leaf in its branch.
        return [tagId];
      }
      let leaves = [];
      for (const childId of tag.childrenIds) {
        leaves = leaves.concat(this.getAllLeafDescendantIds(childId));
      }
      return [...new Set(leaves)]; // Unique leaves
    },

    generateSankeyData() {
      if (this.isLoading || !Object.keys(this.allTags).length) {
        return { nodes: [], links: [] };
      }

      const currentPlatformIds = this.activePlatformHierarchy[this.activePlatformHierarchy.length - 1];
      const currentContentIds = this.activeContentHierarchy[this.activeContentHierarchy.length - 1];
      const currentMethodIds = this.activeMethodHierarchy[this.activeMethodHierarchy.length - 1];

      const echartsNodes = [];
      const nodeSet = new Set(); // To avoid duplicate nodes

      const addNodesToEcharts = (ids, depth) => {
        ids.forEach(id => {
          if (!nodeSet.has(id) && this.allTags[id]) {
            echartsNodes.push({
              id: id,
              name: this.allTags[id].name,
              depth: depth, // ECharts uses depth for column
              itemStyle: { color: this.getColorForNode(this.allTags[id]) }
            });
            nodeSet.add(id);
          }
        });
      };

      addNodesToEcharts(currentPlatformIds, 0);
      addNodesToEcharts(currentContentIds, 1);
      addNodesToEcharts(currentMethodIds, 2);
      
      const echartsLinks = [];

      // Platform -> Content links
      currentPlatformIds.forEach(pId => {
        const platformLeafIds = this.getAllLeafDescendantIds(pId);
        currentContentIds.forEach(cId => {
          const contentLeafIds = this.getAllLeafDescendantIds(cId);
          let count = 0;
          this.papersData.forEach(paper => {
            const hasPlatform = paper.platformTagIds.some(paperPId => platformLeafIds.includes(paperPId));
            const hasContent = paper.contentTagIds.some(paperCId => contentLeafIds.includes(paperCId));
            if (hasPlatform && hasContent) {
              count++;
            }
          });
          if (count > 0) {
            echartsLinks.push({ source: pId, target: cId, value: count });
          }
        });
      });

      // Content -> Method links
      currentContentIds.forEach(cId => {
        const contentLeafIds = this.getAllLeafDescendantIds(cId);
        currentMethodIds.forEach(mId => {
          const methodLeafIds = this.getAllLeafDescendantIds(mId);
          let count = 0;
          this.papersData.forEach(paper => {
            const hasContent = paper.contentTagIds.some(paperCId => contentLeafIds.includes(paperCId));
            const hasMethod = paper.methodTagIds.some(paperMId => methodLeafIds.includes(paperMId));
            if (hasContent && hasMethod) {
              count++;
            }
          });
          if (count > 0) {
            echartsLinks.push({ source: cId, target: mId, value: count });
          }
        });
      });
      return { nodes: echartsNodes, links: echartsLinks };
    },

    getColorForNode(node) {
        // Basic coloring logic, can be expanded
        if (!node) return '#5470c6'; // Default ECharts blue
        const level = node.level;
        const category = node.category; // "研究内容", "研究方法", "内容形式", "平台属性"

        if (category === '研究内容') {
            if (level === 1) return '#91cc75'; // Greenish
            if (level === 2) return '#fac858'; // Yellowish
            if (level === 3) return '#ee6666'; // Reddish
            return '#73c0de'; // Bluish
        } else if (category === '研究方法') {
            if (level === 1) return '#3ba272';
            if (level === 2) return '#fc8452';
            if (level === 3) return '#9a60b4';
            return '#ea7ccc';
        } else if (category === '内容形式' || category === '平台属性') { // Platform related
            if (level === 1) return '#5470c6'; // Default ECharts blue
            if (level === 2) return '#91cc75';
            return '#fac858';
        }
        return '#cccccc'; // Default grey
    },

    updateChart() {
      if (!this.chartInstance || this.isLoading) return;
      const { nodes, links } = this.generateSankeyData();
      
      const option = {
        title: {
          text: 'Multi-level Sankey Diagram'
        },
        tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove'
        },
        series: [
          {
            type: 'sankey',
            data: nodes,
            links: links,
            emphasis: {
              focus: 'adjacency'
            },
            nodeAlign: 'justify', // 'left', 'right', 'justify'
            orient: 'horizontal',
            label: {
              show: true,
              position: 'right', // 'top', 'left', 'right', 'bottom', 'inside', ...
              formatter: '{b}' // {b} is node name
            },
            lineStyle: {
              color: 'source', // 'source', 'target', or a specific color
              curveness: 0.5
            },
            levels: [ // Optional: for specific styling per level/depth
              { depth: 0, itemStyle: { color: '#5470c6' }, lineStyle: { color: 'source', opacity: 0.4 } },
              { depth: 1, itemStyle: { color: '#91cc75' }, lineStyle: { color: 'source', opacity: 0.4 } },
              { depth: 2, itemStyle: { color: '#fac858' }, lineStyle: { color: 'source', opacity: 0.4 } },
              // Add more depths if you expand beyond L3 effectively
            ]
          }
        ]
      };
      this.chartInstance.setOption(option, true); // true to not merge with previous options
    },

    handleNodeClick(params) {
      if (params.dataType === 'node') {
        const clickedNodeId = params.data.id;
        const clickedNode = this.allTags[clickedNodeId];
        if (!clickedNode) return;

        let targetHierarchy;
        // Determine which hierarchy to modify based on clickedNode's depth or category
        // This assumes nodes are uniquely assigned to a conceptual column
        // A more robust way would be to check which `active...Hierarchy` contains the node or its ancestor.
        if (clickedNode.depth === 0) targetHierarchy = this.activePlatformHierarchy;
        else if (clickedNode.depth === 1) targetHierarchy = this.activeContentHierarchy;
        else if (clickedNode.depth === 2) targetHierarchy = this.activeMethodHierarchy;
        else {
            // Fallback: check category if depth is not set or ambiguous
            const rootParentId = this.findRootParentId(clickedNodeId);
            if (rootParentId === ROOT_PLATFORM_ID) targetHierarchy = this.activePlatformHierarchy;
            else if (rootParentId === ROOT_CONTENT_ID) targetHierarchy = this.activeContentHierarchy;
            else if (rootParentId === ROOT_METHOD_ID) targetHierarchy = this.activeMethodHierarchy;
            else return; // Unknown category
        }


        const currentLevelIndex = targetHierarchy.length - 1;
        const currentDisplayedNodes = targetHierarchy[currentLevelIndex];

        // Check if the clicked node is one of the currently displayed nodes
        if (currentDisplayedNodes.includes(clickedNodeId)) {
          if (clickedNode.childrenIds && clickedNode.childrenIds.length > 0) {
            // Expand: Add children as a new level
            targetHierarchy.push(clickedNode.childrenIds);
          } else if (targetHierarchy.length > 1) {
            // Collapse: If it's a leaf or has no children to expand to, and not at base level, pop to go up
            targetHierarchy.pop();
          }
        } else {
          // Clicked on a node that is not in the current deepest display level.
          // This means we need to find which level it belongs to and collapse back to it + 1 (its children)
          // or if it's a parent of the current display, collapse to it.
          let foundLevel = -1;
          for(let i=0; i < targetHierarchy.length; i++) {
            if(targetHierarchy[i].includes(clickedNodeId)) {
              foundLevel = i;
              break;
            }
          }

          if (foundLevel !== -1 && clickedNode.childrenIds && clickedNode.childrenIds.length > 0) {
            // Collapse back to the level of the clicked node, then show its children
            targetHierarchy.splice(foundLevel + 1); // Remove deeper levels
            targetHierarchy.push(clickedNode.childrenIds); // Add its children
          } else if (foundLevel !== -1 && targetHierarchy.length > 1) {
             // Clicked on a node that is an ancestor of the current view, and it's a leaf or we want to show it
             targetHierarchy.splice(foundLevel + 1);
          }
        }
        this.updateChart();
      }
    },
    findRootParentId(tagId) {
        let currentTag = this.allTags[tagId];
        if (!currentTag) return null;

        // The main categories "研究内容", "研究方法", "研究平台" are L1 themselves, but act as L0 for their children.
        // Their children are the "true" L1s of the Sankey.
        // The root categories themselves have parentId: null and a specific category name.
        if (currentTag.parentId === null && 
            (currentTag.id === ROOT_CONTENT_ID || currentTag.id === ROOT_METHOD_ID || currentTag.id === ROOT_PLATFORM_ID)) {
            return currentTag.id;
        }
        
        while (currentTag && currentTag.parentId !== null) {
            const parent = this.allTags[currentTag.parentId];
            if (!parent) break; 
            // If the parent is one of the root categories, then this tag belongs to that root.
            if (parent.id === ROOT_CONTENT_ID || parent.id === ROOT_METHOD_ID || parent.id === ROOT_PLATFORM_ID) {
                return parent.id;
            }
            currentTag = parent;
        }
        // If the tag itself is a root category (e.g. "研究内容")
        if (this.allTags[tagId] && this.allTags[tagId].parentId === null && 
            (tagId === ROOT_CONTENT_ID || tagId === ROOT_METHOD_ID || tagId === ROOT_PLATFORM_ID)) {
          return tagId;
        }
        return null; // Should not happen if data is consistent
    }
  }
};
</script>

<style scoped>
/* Add any styles if needed */
</style>