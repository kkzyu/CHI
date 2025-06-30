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
        paperIdToYear: {},

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
            const base = import.meta.env.BASE_URL;

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
                    rawPapersForYearMappingRes,
                ] = await Promise.all([
                    fetch(`${base}data/main/processedPapers.json`),
                    fetch(`${base}data/main/hierarchyMapping.json`),
                    fetch(`${base}data/main/nodeMetadata.json`),
                    fetch(`${base}data/interaction/crossLevelConnections.json`),
                    fetch(`${base}data/interaction/platformConfiguration.json`),
                    fetch(`${base}data/interaction/interactionStates.json`),
                    fetch(`${base}data/layout/precomputedStats.json`),
                    fetch(`${base}data/layout/sankeyLayoutConfig.json`),
                    fetch(`${base}data/raw/papers.json`),
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
                    { name: 'rawPapersForYearMapping', res: rawPapersForYearMappingRes },
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
                const rawPapersData = await rawPapersForYearMappingRes.json();
                const tempPaperIdToYear = {};
                
                // 改进年份映射逻辑
                console.log("[DataStore] 开始构建paperIdToYear映射...");
                let missingYearCount = 0;
                
                for (const paper of rawPapersData) {
                    if (paper.id) {
                        // 尝试从多个可能的字段获取年份
                        const year = paper.Year || paper.year || paper.publicationYear || paper.publication_year;
                        
                        if (year) {
                            tempPaperIdToYear[paper.id] = String(year);
                        } else {
                            // 记录缺失年份的论文数量
                            missingYearCount++;
                        }
                    }
                }
                
                this.paperIdToYear = tempPaperIdToYear;
                console.log(`[DataStore] paperIdToYear映射已填充。总条目数: ${Object.keys(this.paperIdToYear).length}, 缺失年份的论文数: ${missingYearCount}`);
                
                // 输出一些示例数据以便调试
                const sampleEntries = Object.entries(this.paperIdToYear).slice(0, 5);
                console.log("[DataStore] paperIdToYear示例内容:", JSON.stringify(sampleEntries));
                if (this.paperIdToYear['paper_117']) {
                    console.log("[DataStore] paper_117 的年份是:", this.paperIdToYear['paper_117']);
                } else {
                    console.log("[DataStore] 在 paperIdToYear 映射中未找到 paper_117。");
                }

                console.log("All core JSON data parsed and stored.");

            } catch (err) {
                this.error = err.message;
                console.error("Error loading data in dataStore:", err);
                this.paperIdToYear = {};
            } finally {
                this.isLoading = false;
                console.log("fetchAllData finished. isLoading:", this.isLoading);
            }
        },

    },
    getters: {
        initialSankeyLayoutConfig: (state) => state.sankeyLayoutConfig,
        initialStateTemplate: (state) => state.interactionStates?.stateTemplates?.initial,

        getPaperDetailsById: (state) => (paperId) => {
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
    }
});
