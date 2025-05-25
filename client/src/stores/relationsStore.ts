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
        const links: any[] = [];

        // a) 平台 (L1)  →  方法 (L1)
        const platformKeyPrefix =
            state.currentPlatformType === '内容形式'
                ? '研究涉及平台-内容形式_L2__研究方法_L1'
                : '研究涉及平台-平台属性_L2__研究方法_L1';

        const rawPlatformMethod = dataStore.crossLevelConnections?.connections?.[platformKeyPrefix] ?? {};
        for (const key in rawPlatformMethod) {
            if (!Object.prototype.hasOwnProperty.call(rawPlatformMethod, key)) continue;
            const [platform, method] = key.split('__');
            const info = rawPlatformMethod[key];
            links.push({
                source: platform,
                target: method,
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
                source: method, // 反向
                target: content,
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