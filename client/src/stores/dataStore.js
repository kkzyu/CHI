import { defineStore } from 'pinia';

export const useDataStore = defineStore('data', {
    state: () => ({
        // 核心数据层
        processedPapers: null,
        hierarchyMapping: null,
        nodeMetadata: null,

        // 交互计算层
        crossLevelConnections: null,
        platformConfiguration: null,
        interactionStates: null, 

        // 统计与视图层
        precomputedStats: null,
        sankeyLayoutConfig: null, 

        // 加载状态和错误信息
        isLoading: false,
        error: null,
    }),
    actions: {
        async fetchAllData() {
            if (this.isLoading) return; 
            if (this.processedPapers) {
                console.log("Data already loaded.");
                return;
            }

            this.isLoading = true;
            this.error = null;
            console.log("Starting to fetch core data...");

            try {
                const [ 
                    processedPapersRes,
                    hierarchyMappingRes,
                    nodeMetadataRes,
                    crossLevelConnectionsRes,
                    platformConfigurationRes,
                    interactionStatesRes,
                    precomputedStatsRes,
                    sankeyLayoutConfigRes,
                ] = await Promise.all([
                    fetch('/data/main/processedPapers.json'),
                    fetch('/data/main/hierarchyMapping.json'),
                    fetch('/data/main/nodeMetadata.json'),
                    fetch('/data/interaction/crossLevelConnections.json'),
                    fetch('/data/interaction/platformConfiguration.json'),
                    fetch('/data/interaction/interactionStates.json'),
                    fetch('/data/layout/precomputedStats.json'),
                    fetch('/data/layout/sankeyLayoutConfig.json'),
                ]);

                // 检查所有响应是否成功
                const responses = [
                    { name: 'processedPapers', res: processedPapersRes },
                    { name: 'hierarchyMapping', res: hierarchyMappingRes },
                    { name: 'nodeMetadata', res: nodeMetadataRes },
                    { name: 'crossLevelConnections', res: crossLevelConnectionsRes },
                    { name: 'platformConfiguration', res: platformConfigurationRes },
                    { name: 'interactionStates', res: interactionStatesRes },
                    { name: 'precomputedStats', res: precomputedStatsRes },
                    { name: 'sankeyLayoutConfig', res: sankeyLayoutConfigRes },
                ];

                for (const item of responses) {
                    if (!item.res.ok) {
                        throw new Error(`Failed to load ${item.name}.json (status: ${item.res.status})`);
                    }
                }
                console.log("All core files fetched successfully. Parsing JSON...");

                // 解析JSON数据并赋值给state
                this.processedPapers = await processedPapersRes.json();
                this.hierarchyMapping = await hierarchyMappingRes.json();
                this.nodeMetadata = await nodeMetadataRes.json();
                this.crossLevelConnections = await crossLevelConnectionsRes.json();
                this.platformConfiguration = await platformConfigurationRes.json();
                this.interactionStates = await interactionStatesRes.json();
                this.precomputedStats = await precomputedStatsRes.json();
                this.sankeyLayoutConfig = await sankeyLayoutConfigRes.json();

                console.log("All core JSON data parsed and stored.");

            } catch (err) {
                this.error = err.message;
                console.error("Error loading data in dataStore:", err);
            } finally {
                this.isLoading = false;
                console.log("fetchAllData finished. isLoading:", this.isLoading);
            }
        },

        // 可以在这里添加其他actions，例如根据用户交互更新某些状态，
        // 或者从缓存/预计算数据中获取特定视图所需的数据的辅助函数。
        // 例如：
        // getSankeyDataForView(viewParams) {
        //   // 逻辑：根据viewParams (如层级、筛选) 从 crossLevelConnections 或 connectionCache 找数据
        //   // 如果找不到，可能触发一个更细致的计算或返回null提示组件进行计算
        // }
    },
    getters: {
        initialSankeyLayoutConfig: (state) => state.sankeyLayoutConfig,
        initialStateTemplate: (state) => state.interactionStates?.stateTemplates?.initial,

        // 获取特定论文的详细信息 - 现在从 processedPapers 获取
        // 假设 processedPapers.json 结构是 { "paper_001": { details... }, "paper_002": { ... } }
        // 或者如果是数组 [{id: "paper_001", ...}], 则需要调整查找逻辑
        getPaperDetailsById: (state) => (paperId) => {
            // 如果 processedPapers 是一个对象，键是 paperId:
            // return state.processedPapers?.[paperId] || null;
            // 如果 processedPapers 是一个数组，每个元素有 id 属性:
            if (state.processedPapers && Array.isArray(state.processedPapers.papers)) { // 假设论文在 papers 数组中
                return state.processedPapers.papers.find(p => p.id === paperId) || null;
            } else if (state.processedPapers && typeof state.processedPapers === 'object' && !Array.isArray(state.processedPapers)) {
                // 假设 processedPapers 本身就是一个以 paperId 为键的对象
                return state.processedPapers[paperId] || null;
            }
            return null;
        },

        getNodeMetadata: (state) => (category, nodeId) => {
            return state.nodeMetadata?.[category]?.[nodeId] || null;
        },

        getPlatformL1Nodes: (state) => (platformTypeName) => {
            const platformType = state.platformConfiguration?.platformTypes?.[platformTypeName];
            return platformType?.hierarchy?.l1 || [];
        }
        // 更多getters可以根据组件的需求添加
    }
});
