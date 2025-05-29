import { defineStore } from 'pinia';
import { computed, reactive } from 'vue';
import { useDataStore } from './dataStore';
import { buildL1Snapshot } from './relationsStore/l1Builder';
import { buildMixedLevelSnapshot } from './relationsStore/mixedLevelBuilder';
import { expandNode, collapseNode } from './relationsStore/nodeOperations';

export const useRelationsStore = defineStore('relations', () => {
    // ───────────────────── 原始数据依赖 ─────────────────────
    const dataStore = useDataStore();

    // ───────────────────── 交互状态 ─────────────────────
    const state = reactive({
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
        if (state.expandedNodes[c].includes(nodeId)) {
            collapseNode(dataStore, state, c, nodeId);
        } else {
            expandNode(dataStore, state, visibleNodes, c, nodeId);
        }
    }

    function resetColumn(colIdx: number) {
        const c = colIdx as 0 | 1 | 2;
        state.columnLevels[c] = 'L1';
        state.expandedNodes[c] = [];
    }

    function applyFilters() {/* TODO */ }

    function pushHistory() {
        state.history.push(JSON.parse(JSON.stringify({
            currentPlatformType: state.currentPlatformType,
            columnLevels: [...state.columnLevels],
            expandedNodes: JSON.parse(JSON.stringify(state.expandedNodes))
        })));
    }

    function popHistory() {
        if (state.history.length === 0) return;
        const snap = state.history.pop();
        state.currentPlatformType = snap.currentPlatformType;
        state.columnLevels = snap.columnLevels;
        state.expandedNodes = snap.expandedNodes;
    }

    function mapOldIdToNew(id: string, toType: '内容形式' | '平台属性') {
        if (state.currentPlatformType === toType) return id;
        const dir = state.currentPlatformType + '_to_' + toType;
        for (const oldKey in switchMap.value[dir]) {
            if (oldKey === id) return switchMap.value[dir][oldKey][0];
        }
        return null;
    }

    return {
        state,
        visibleNodes,
        visibleLinks,
        setPlatformType,
        togglePlatformType,
        toggleNode,
        resetColumn,
        expandNode: (colIdx: 0 | 1 | 2, nodeId: string) => expandNode(dataStore, state, visibleNodes, colIdx, nodeId),
        collapseNode: (colIdx: 0 | 1 | 2, nodeId?: string) => collapseNode(dataStore, state, colIdx, nodeId),
        applyFilters,
        pushHistory,
        popHistory,
        canUndo,
        mapOldIdToNew,
    };
});