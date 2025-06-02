import { defineStore } from 'pinia';
import { computed, reactive } from 'vue';
import { useDataStore } from './dataStore';
import { buildL1Snapshot } from './relationsStore/l1Builder';
import { buildMixedLevelSnapshot } from './relationsStore/mixedLevelBuilder';
import { expandNode, collapseNode } from './relationsStore/nodeOperations';
import { useVisualizationStore } from './visualizationStore'; // 确保导入

export const useRelationsStore = defineStore('relations', () => {
    // ───────────────────── 原始数据依赖 ─────────────────────
    const dataStore = useDataStore();
    const vizStore = useVisualizationStore();


    // ───────────────────── 交互状态 ─────────────────────
    const state = reactive({
        selectedYear: null as number | null,
        currentPlatformType: '内容形式' as '内容形式' | '平台属性',
        columnLevels: ['L1', 'L1', 'L1'] as ('L1' | 'L2' | 'L3')[],
        expandedNodes: { 0: [] as string[], 1: [] as string[], 2: [] as string[] } as Record<number, string[]>,
        filters: { yearRange: [2020, 2025] as [number, number], awardOnly: false },
        selected: { type: null as 'node' | 'link' | null, ids: [] as string[] },
        history: [] as any[],
        prevNodes: [] as { id: string; x0: number; y0: number }[],
    });

    // 计算属性
    const platformL1Map = computed(() => ({
        '内容形式': dataStore.platformConfiguration?.platformTypes?.['内容形式']?.hierarchy?.l1 || [],
        '平台属性': dataStore.platformConfiguration?.platformTypes?.['平台属性']?.hierarchy?.l1 || [],
    }));

    const switchMap = computed(() => dataStore.platformConfiguration?.switchMapping || {});

    const visibleNodes = computed(() => {
        if (state.columnLevels.every(level => level === 'L1')) {
            return buildL1Snapshot(dataStore, state).nodes;
        }
        return buildMixedLevelSnapshot(dataStore, state).nodes;
    });

    const visibleLinks = computed(() => {
        if (state.columnLevels.every(level => level === 'L1')) {
            return buildL1Snapshot(dataStore, state).links;
        }
        return buildMixedLevelSnapshot(dataStore, state).links;
    });

    const canUndo = computed(() => state.history.length > 0);

    // ───────────────────── Actions ─────────────────────
    function setPlatformType(to: '内容形式' | '平台属性') {
        if (to === state.currentPlatformType) return;
        pushHistory();
        state.prevNodes = visibleNodes.value.map(n => ({ id: n.id, x0: n.x0, y0: n.y0 }));
        state.currentPlatformType = to;
    }

    function togglePlatformType() {
        setPlatformType(state.currentPlatformType === '内容形式' ? '平台属性' : '内容形式');
    }

    function toggleNode(colIdx: number, nodeId: string) {
        const c = colIdx as 0 | 1 | 2;
        
        console.log('toggleNode被调用，参数:', { colIdx, nodeId });
        
        // 保存当前状态以便稍后撤销
        console.log('保存历史记录...');
    
        
        // 然后保存历史
        pushHistory();
        console.log('历史记录保存完成, 当前历史记录长度:', state.history.length);

         // 保存当前节点位置，用于平滑过渡
        state.prevNodes = visibleNodes.value.map(n => ({ id: n.id, x0: n.x0, y0: n.y0 }));
        const nodeBeingToggled = visibleNodes.value.find(n => n.id === nodeId && n.column === c);

        if (state.expandedNodes[c].includes(nodeId)) { // 准备折叠
        console.log(`正在折叠节点 ${nodeId}...`);
        collapseNode(dataStore, state, c, nodeId);

        // collapseNode 调用后, state.columnLevels[c] 和 state.expandedNodes[c] 已更新。
        if (c === 2) { // 研究内容列
            if (state.columnLevels[c] === 'L1' && state.expandedNodes[c].length === 0) {
                vizStore.resetPieChartDrillDown('researchContent');
            } else if (state.columnLevels[c] === 'L2' && state.expandedNodes[c].length > 0) {
                const currentL1ParentId = state.expandedNodes[c].find(id => {
                    const l1Node = Object.values<any>(dataStore.nodeMetadata?.['研究内容'] ?? {}).find(n => n.displayName === id && n.level === 2); //
                    return !!l1Node;
                });
                if (currentL1ParentId) {
                    vizStore.drillDown('researchContent', currentL1ParentId); //
                } else {
                     vizStore.drillUp('researchContent'); //
                }
            } else if (state.columnLevels[c] === 'L1') {
                vizStore.resetPieChartDrillDown('researchContent'); //
            }
        } else if (c === 0) { // 研究平台列 [已修改]
            if (state.columnLevels[c] === 'L1' && state.expandedNodes[c].length === 0) {
                vizStore.resetPieChartDrillDown('researchPlatform');
            }
            // 如果一个 L1 平台节点被展开 (在桑基图中显示L2节点) 然后被折叠,
            // 上述条件会通过重置饼图到 L1 概览来处理它。
            // 平台桑基图的层级是 L1->L2，没有特定的“上钻”到L2父节点的逻辑。
        } else if (c === 1) { // 研究方法列 [新增]
            if (state.columnLevels[c] === 'L1' && state.expandedNodes[c].length === 0) {
                vizStore.resetPieChartDrillDown('researchMethod');
            } else if (state.columnLevels[c] === 'L2' && state.expandedNodes[c].length > 0) {
                const currentL1ParentId = state.expandedNodes[c].find(id => {
                    // 使用 vizStore.getNodeInfo 是因为它已经为此设置好了
                    const nodeInfo = vizStore.getNodeInfo(id, 'researchMethod'); //
                    // 在 nodeMetadata 中, L1 分类通常是 level 2。 //
                    return nodeInfo && nodeInfo.level === 2;
                });
                if (currentL1ParentId) {
                    vizStore.drillDown('researchMethod', currentL1ParentId);
                } else {
                     vizStore.drillUp('researchMethod');
                }
            } else if (state.columnLevels[c] === 'L1') {
                 vizStore.resetPieChartDrillDown('researchMethod');
            }
        }
    } else { // 准备展开
        console.log(`正在展开节点 ${nodeId}...`);
        if (nodeBeingToggled && nodeBeingToggled.hasChildren) { //
            expandNode(dataStore, state, visibleNodes, c, nodeId); //
            // expandNode 调用后, nodeId 是被展开的节点。
            // 相应的饼图应该下钻到这个节点。
            if (c === 2) { // 研究内容列
                vizStore.drillDown('researchContent', nodeId); //
            } else if (c === 0) { // 研究平台列 [已修改]
                vizStore.drillDown('researchPlatform', nodeId);
            } else if (c === 1) { // 研究方法列 [新增]
                vizStore.drillDown('researchMethod', nodeId);
            }
        } else {
            console.log(`节点 ${nodeId} 没有子节点或未找到，无法展开`); //
        }
    }
}


    // 选择节点，获取相关论文
    function selectNode(nodeId: string) {
        // 清除之前的选择
        state.selected.type = 'node';
        state.selected.ids = [nodeId];
    }

    // 选择连接，获取相关论文
    function selectLink(sourceId: string, targetId: string) {
        // 清除之前的选择
        state.selected.type = 'link';
        state.selected.ids = [sourceId, targetId];
    }

    // 清除选择
    function clearSelection() {
        state.selected.type = null;
        state.selected.ids = [];
    }

    // 获取选中节点相关的论文ID列表
    function getSelectedPaperIds(): string[] {
        if (!state.selected.type) return [];
        
        console.log(`getSelectedPaperIds: 选择类型=${state.selected.type}, 选择IDs=${state.selected.ids.join(',')}`);
        
        if (state.selected.type === 'node') {
            const nodeId = state.selected.ids[0];
            // 从所有连接中查找包含该节点的连接，收集所有论文ID
            const paperIds = new Set<string>();
            const connections = dataStore.crossLevelConnections?.connections || {};
            
            console.log(`查找节点 ${nodeId} 的相关论文`);
            let connectionCount = 0;
            
            // 获取当前可见的节点和连接
            const currentVisibleNodes = visibleNodes.value;
            const currentVisibleLinks = visibleLinks.value;
            
            // 创建当前可见节点的ID集合，用于快速查询
            const visibleNodeIds = new Set(currentVisibleNodes.map(n => n.id));
            
            // 创建当前可见连接的映射，用于快速查询
            const visibleLinkMap = new Map();
            currentVisibleLinks.forEach(link => {
                // 安全地提取source和target
                let sourceId = '';
                let targetId = '';
                
                try {
                    if (typeof link.source === 'object' && link.source) {
                        sourceId = link.source.id || '';
                    } else if (typeof link.source === 'string') {
                        sourceId = link.source;
                    }
                    
                    if (typeof link.target === 'object' && link.target) {
                        targetId = link.target.id || '';
                    } else if (typeof link.target === 'string') {
                        targetId = link.target;
                    }
                    
                    if (sourceId && targetId) {
                        const key = `${sourceId}__${targetId}`;
                        visibleLinkMap.set(key, true);
                        // 同时存储反向连接键
                        const reverseKey = `${targetId}__${sourceId}`;
                        visibleLinkMap.set(reverseKey, true);
                    }
                } catch (e) {
                    console.warn('处理连接时出错:', e);
                }
            });
            
            // 遍历所有连接类型
            Object.values(connections).forEach((connectionGroup: any) => {
                // 遍历该类型下的所有连接
                Object.entries(connectionGroup).forEach(([connectionKey, connectionInfo]: [string, any]) => {
                    const [source, target] = connectionKey.split('__');
                    
                    // 如果连接包含选中的节点
                    if (source === nodeId || target === nodeId) {
                        // 确定另一端节点ID
                        const otherNodeId = source === nodeId ? target : source;
                        
                        // 检查是否应该包含这个连接的论文
                        const shouldInclude = 
                            // 如果是L1界面，包含所有连接
                            state.columnLevels.every(level => level === 'L1') ||
                            // 或者另一端节点在可见节点中且这个连接在可见连接中
                            (visibleNodeIds.has(otherNodeId) && visibleLinkMap.has(connectionKey));
                        
                        if (shouldInclude) {
                            // 添加连接相关的论文ID
                            const ids = connectionInfo.paperIds || [];
                            connectionCount++;
                            console.log(`找到相关连接: ${connectionKey}, 包含 ${ids.length} 篇论文`);
                            ids.forEach((id: string) => paperIds.add(id));
                        }
                    }
                });
            });
            
            const result = Array.from(paperIds);
            console.log(`节点 ${nodeId} 共有 ${connectionCount} 个相关连接, 涉及 ${result.length} 篇不重复论文`);
            return result;
        } 
        else if (state.selected.type === 'link') {
            const [sourceId, targetId] = state.selected.ids;
            // 查找指定连接的论文ID
            const connections = dataStore.crossLevelConnections?.connections || {};
            
            console.log(`查找连接 ${sourceId} -> ${targetId} 的相关论文`);
            
            // 创建一个Set来存储论文ID，确保去重
            const paperIds = new Set<string>();
            
            // 遍历所有连接类型
            for (const connectionGroup of Object.values(connections)) {
                // 尝试以两种顺序查找连接
                const key1 = `${sourceId}__${targetId}`;
                const key2 = `${targetId}__${sourceId}`;
                
                if (connectionGroup[key1]) {
                    const ids = connectionGroup[key1].paperIds || [];
                    ids.forEach((id: string) => paperIds.add(id));
                }
                if (connectionGroup[key2]) {
                    const ids = connectionGroup[key2].paperIds || [];
                    ids.forEach((id: string) => paperIds.add(id));
                }
            }
            
            const result = Array.from(paperIds);
            console.log(`连接 ${sourceId} -> ${targetId} 共有 ${result.length} 篇不重复论文`);
            return result;
        }
        
        return [];
    }

    function resetColumn(colIdx: number) {
        console.log(`重置第 ${colIdx} 列`);
        
        // 保存节点位置用于平滑过渡
        state.prevNodes = visibleNodes.value.map(n => ({ id: n.id, x0: n.x0, y0: n.y0 }));
        
        // 保存当前状态用于撤销
        pushHistory();
        
        const c = colIdx as 0 | 1 | 2;
        state.columnLevels[c] = 'L1';
        state.expandedNodes[c] = [];
        if (c === 2) { // 如果是研究内容列
            vizStore.resetPieChartDrillDown('researchContent');
        }
    }

    function applyFilters() {/* TODO */ }

    function pushHistory() {
        console.log('pushHistory开始执行');
        try {
            // 创建当前状态的深拷贝
            const snapshot = {
                currentPlatformType: state.currentPlatformType,
                columnLevels: [...state.columnLevels],
                expandedNodes: JSON.parse(JSON.stringify(state.expandedNodes)),
                // 保存节点位置，用于平滑过渡
                prevNodesState: state.prevNodes.length > 0 ? 
                    JSON.parse(JSON.stringify(state.prevNodes)) : []
            };
            
            console.log('创建的快照:', snapshot);
            state.history.push(snapshot);
            console.log('历史记录已添加，当前长度:', state.history.length);
        } catch (error) {
            console.error('pushHistory执行出错:', error);
        }
        console.log('pushHistory执行完成');
    }

    function popHistory() {
        console.log('popHistory开始执行');
        if (state.history.length === 0) {
            console.log('历史记录为空，无法撤销');
            return;
        }
        
        try {
            console.log('历史记录长度:', state.history.length);
            const snap = state.history.pop();
            console.log('历史快照:', snap);
            
            // 首先保存当前节点位置用于平滑过渡
            state.prevNodes = visibleNodes.value.map(n => ({ id: n.id, x0: n.x0, y0: n.y0 }));
            
            // 然后恢复状态
            state.currentPlatformType = snap.currentPlatformType;
            state.columnLevels = snap.columnLevels;
            state.expandedNodes = snap.expandedNodes;
            
            // 恢复之前保存的节点位置（如果有）
            if (snap.prevNodesState && snap.prevNodesState.length > 0) {
                state.prevNodes = snap.prevNodesState;
            }
            
            console.log('状态已恢复到历史快照');
            console.log('剩余历史记录长度:', state.history.length);
        } catch (error) {
            console.error('popHistory执行出错:', error);
        }
        
        console.log('popHistory执行完成');
    }

    function mapOldIdToNew(id: string, toType: '内容形式' | '平台属性') {
        if (state.currentPlatformType === toType) return id;
        const dir = state.currentPlatformType + '_to_' + toType;
        for (const oldKey in switchMap.value[dir]) {
            if (oldKey === id) return switchMap.value[dir][oldKey][0];
        }
        return null;
    }

    function setSelectedYear(year: number | null) {
    pushHistory(); // 或者决定年份更改是否应成为独立的历史事件
    state.prevNodes = visibleNodes.value.map(n => ({ id: n.id, x0: n.x0, y0: n.y0 }));
    state.selectedYear = year;
    // 这将触发 visibleNodes 和 visibleLinks 的重新计算
}

    return {
        state,
        visibleNodes,
        visibleLinks,
        setPlatformType,
        togglePlatformType,
        toggleNode,
        resetColumn,
        selectNode,
        selectLink,
        clearSelection,
        getSelectedPaperIds,
        expandNode: (colIdx: 0 | 1 | 2, nodeId: string) => expandNode(dataStore, state, visibleNodes, colIdx, nodeId),
        collapseNode: (colIdx: 0 | 1 | 2, nodeId?: string) => collapseNode(dataStore, state, colIdx, nodeId),
        applyFilters,
        pushHistory,
        popHistory,
        canUndo,
        mapOldIdToNew,
        setSelectedYear, 
    };

});