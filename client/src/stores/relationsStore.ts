import { defineStore } from 'pinia';
import { computed, reactive } from 'vue';
import { useDataStore } from './dataStore';

/*
  RelationsStore 负责：
  1. 保存与桑基图交互相关的状态（列层级、已展开节点、筛选等）;
  2. 根据当前状态 + 全局数据，返回可见的 nodes/links（供图形组件消费）。
  下面先实现最小 MVP：仅返回 3 列 L1 级别的节点与连接，保证能画出第一张图。
*/

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

    // 1. 预生成 "两种分类下，平台 L1 节点 id 列表"
    const platformL1Map = computed(() => ({
        '内容形式': dataStore.platformConfiguration.platformTypes['内容形式'].hierarchy.l1,
        '平台属性': dataStore.platformConfiguration.platformTypes['平台属性'].hierarchy.l1,
    }));

    // 2. 读取 switchMapping（内容形式 → 平台属性，反向再做一次）
    const switchMap = computed(() => dataStore.platformConfiguration.switchMapping);

    // ───────────────────── 工具函数：生成 L1 快照 ─────────────────────
    function buildL1Snapshot() {
        // ---------- ① 生成三列节点 ----------
        const platformL1Raw = dataStore.getPlatformL1Nodes(state.currentPlatformType) ?? [];
        // 该数组元素可能是字符串，也可能是 { id, name, color }
        const platformNodes = platformL1Raw.map((n: any) => {
            const id = typeof n === 'string' ? n : n.id;
            const name = typeof n === 'string' ? n : n.name ?? n.id;
            const color = typeof n === 'string' ? '#6ca0dc' : n.color ?? '#6ca0dc';
            return {
                id,
                name,
                column: 0,
                color,
                value: 1,
            };
        });

        // 研究内容 L1
        const contentNodes = Object.values<any>(dataStore.nodeMetadata?.['研究内容'] ?? {})
            .filter((n) => n.level === 2)
            .map((n) => ({
                id: n.displayName,
                name: n.displayName,
                column: 2,
                color: n.color || '#dc6866',
                value: n.totalPapers || 1,
            }));

        // 研究方法 L1
        const methodNodes = Object.values<any>(dataStore.nodeMetadata?.['研究方法'] ?? {})
            .filter((n) => n.level === 2) // level===2 表示 L1
            .map((n) => ({
                id: n.displayName,
                name: n.displayName,
                column: 1,
                color: n.color || '#97a7aa',
                value: n.totalPapers || 1,
            }));

        const nodes = [...platformNodes, ...contentNodes, ...methodNodes];

        // ---------- ② 生成连线 ----------
        const links: any[] = [];

        // a) 平台 (L1)  →  内容 (L1)
        const platformKeyPrefix =
            state.currentPlatformType === '内容形式'
                ? '研究涉及平台-内容形式_L2__研究内容_L1'
                : '研究涉及平台-平台属性_L2__研究内容_L1';

        const rawPlatformContent = dataStore.crossLevelConnections?.connections?.[platformKeyPrefix] ?? {};
        for (const key in rawPlatformContent) {
            if (!Object.prototype.hasOwnProperty.call(rawPlatformContent, key)) continue;
            const [platform, content] = key.split('__');
            const info = rawPlatformContent[key];
            links.push({
                source: platform,
                target: content,
                value: info.paperCount ?? 1,
                paperIds: info.paperIds ?? [],
            });
        }

        // b) 方法 (L1)  →  内容 (L1)  —— 通过反转 "研究内容_L1__研究方法_L1"
        const rawContentMethod = dataStore.crossLevelConnections?.connections?.['研究内容_L1__研究方法_L1'] ?? {};
        for (const key in rawContentMethod) {
            if (!Object.prototype.hasOwnProperty.call(rawContentMethod, key)) continue;
            const [content, method] = key.split('__');
            const info = rawContentMethod[key];
            links.push({
                source: content, // 反向
                target: method,
                value: info.paperCount ?? 1,
                paperIds: info.paperIds ?? [],
            });
        }

        return { nodes, links };
    }

    // ───────────────────── Getters ─────────────────────
    const visibleNodes = computed(() => buildL1Snapshot().nodes);
    const visibleLinks = computed(() => buildL1Snapshot().links);
    const canUndo = computed(() => state.history.length > 0);

    // ───────────────────── Actions（占位） ─────────────────────
    function setPlatformType(to: '内容形式' | '平台属性') {
        if (to === state.currentPlatformType) return;
        pushHistory();                    // 回退支持
        // 1) 记录旧节点坐标（给前端过渡用）
        state.prevNodes = visibleNodes.value.map(n => ({ id: n.id, x0: n.x0, y0: n.y0 }));
        state.currentPlatformType = to;
    }
    function togglePlatformType() {
        setPlatformType(state.currentPlatformType === '内容形式' ? '平台属性' : '内容形式');
    }
    function expandNode(colIdx: 0 | 1 | 2, nodeId: string) {
        pushHistory();
        if (state.columnLevels[colIdx] === 'L3') return;       // 已经最深
        state.columnLevels[colIdx] = state.columnLevels[colIdx] === 'L1' ? 'L2' : 'L3';
        if (!state.expandedNodes[colIdx].includes(nodeId))
            state.expandedNodes[colIdx].push(nodeId);
    }

    function collapseNode(colIdx: 0 | 1 | 2, nodeId?: string) {
        pushHistory();
        // 若 nodeId 提供就收起该父节点；否则整个列上移一级
        if (nodeId) {
            state.expandedNodes[colIdx] = state.expandedNodes[colIdx].filter(id => id !== nodeId);
            if (state.expandedNodes[colIdx].length === 0) {
                state.columnLevels[colIdx] = state.columnLevels[colIdx] === 'L3' ? 'L2' : 'L1';
            }
        } else {
            state.columnLevels[colIdx] = state.columnLevels[colIdx] === 'L3' ? 'L2'
                : state.columnLevels[colIdx] === 'L2' ? 'L1' : 'L1';
            state.expandedNodes[colIdx] = [];
        }
    }

    function toggleNode(colIdx: number, nodeId: string) {
        const c = colIdx as 0 | 1 | 2;
        if (state.expandedNodes[c].includes(nodeId)) collapseNode(c, nodeId);
        else expandNode(c, nodeId);
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
        if (state.currentPlatformType === toType) return id; // 本身
        const dir = state.currentPlatformType + '_to_' + toType; // e.g. 内容形式_to_平台属性
        for (const oldKey in switchMap.value[dir]) {
            if (oldKey === id) return switchMap.value[dir][oldKey][0]; // 取映射列表第一个
        }
        return null; // 没有对应节点
    }

    return {
        state,
        visibleNodes,
        visibleLinks,
        setPlatformType,
        togglePlatformType,
        toggleNode,
        resetColumn,
        expandNode,
        collapseNode,
        applyFilters,
        pushHistory,
        popHistory,
        canUndo,
        mapOldIdToNew,
    };
});