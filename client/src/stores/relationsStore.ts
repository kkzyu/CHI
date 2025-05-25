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
        filters: { yearRange: [2000, 2024] as [number, number], awardOnly: false },
        selected: { type: null as 'node' | 'link' | null, ids: [] as string[] },
        history: [] as any[],
    });

    // ───────────────────── 工具函数：生成 L1 快照 ─────────────────────
    function buildL1Snapshot() {
        // ---------- ① 生成三列节点 ----------
        const platformL1Ids = dataStore.getPlatformL1Nodes(state.currentPlatformType) ?? [];

        const platformNodes = platformL1Ids.map((id: string) => {
            // 尝试从 platformConfiguration 中获取 name / color
            const pType = dataStore.platformConfiguration?.platformTypes?.[state.currentPlatformType];
            const meta = pType?.nodeMetadata?.[id] || {};
            return {
                id,
                name: meta.displayName || id,
                column: 0,
                color: meta.color || '#6ca0dc',
                value: meta.totalPapers || 1,
            };
        });

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

        const nodes = [...platformNodes, ...methodNodes, ...contentNodes];

        // ---------- ② 生成连线 ----------
        // 挑选一个典型的 L1-L1-L1 组合：研究涉及平台_L1 ↔ 研究方法_L1、研究内容_L1 ↔ 研究方法_L1 等。
        // 这里只取 "研究内容_L1__研究方法_L1" 这组，后续可补充更多。
        const rawLinksObj = dataStore.crossLevelConnections?.connections?.['研究内容_L1__研究方法_L1'] ?? {};
        const links: any[] = [];
        for (const key in rawLinksObj) {
            if (!Object.prototype.hasOwnProperty.call(rawLinksObj, key)) continue;
            const [source, target] = key.split('__');
            const info = rawLinksObj[key];
            links.push({
                source,
                target,
                value: info.paperCount ?? 1,
                paperIds: info.paperIds ?? [],
            });
        }

        return { nodes, links };
    }

    // ───────────────────── Getters ─────────────────────
    const visibleNodes = computed(() => buildL1Snapshot().nodes);
    const visibleLinks = computed(() => buildL1Snapshot().links);

    // ───────────────────── Actions（占位） ─────────────────────
    function togglePlatformType() {
        state.currentPlatformType = state.currentPlatformType === '内容形式' ? '平台属性' : '内容形式';
    }
    function expandNode() {/* TODO */ }
    function collapseNode() {/* TODO */ }
    function applyFilters() {/* TODO */ }
    function pushHistory() {/* TODO */ }
    function popHistory() {/* TODO */ }

    return {
        state,
        visibleNodes,
        visibleLinks,
        togglePlatformType,
        expandNode,
        collapseNode,
        applyFilters,
        pushHistory,
        popHistory,
    };
});