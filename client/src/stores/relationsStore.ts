import { defineStore } from 'pinia';
import { computed, reactive } from 'vue';
import { useDataStore } from './dataStore';

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
                level: 'L1',
                hasChildren: true,
            };
        });

        // 研究内容 L1
        const contentNodes = Object.values<any>(dataStore.nodeMetadata?.['研究内容'] ?? {})
            .filter((n) => n.level === 2)
            .map((n) => {
                const hasChildren = dataStore.hierarchyMapping?.['研究内容']?.l1_to_l2?.[n.displayName]?.length > 0;
                return {
                    id: n.displayName,
                    name: n.displayName,
                    column: 2,
                    color: n.color || '#dc6866',
                    value: n.totalPapers || 1,
                    level: 'L1',
                    hasChildren,
                };

            });

        // 研究方法 L1
        const methodNodes = Object.values<any>(dataStore.nodeMetadata?.['研究方法'] ?? {})
            .filter((n) => n.level === 2) // level===2 表示 L1
            .map((n) => {
                const hasChildren = dataStore.hierarchyMapping?.['研究方法']?.l1_to_l2?.[n.displayName]?.length > 0;
                return {
                    id: n.displayName,
                    name: n.displayName,
                    column: 1,
                    color: n.color || '#97a7aa',
                    value: n.totalPapers || 1,
                    level: 'L1',
                    hasChildren,
                };

            });

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
    // 在 buildL1Snapshot 函数后面添加新的函数

    // ───────────────────── 工具函数：生成混合层级快照 ─────────────────────
    function buildMixedLevelSnapshot() {
        const nodes: any[] = [];
        const links: any[] = [];

        // ① 生成平台列节点（第0列）
        if (state.columnLevels[0] === 'L1') {
            // 平台 L1 节点
            const platformL1Raw = dataStore.getPlatformL1Nodes(state.currentPlatformType) ?? [];
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
                    level: 'L1',
                    hasChildren: true, // 平台节点都可以展开
                };
            });
            nodes.push(...platformNodes);
        } else {
            // 平台 L2/L3 展开节点 - 这里需要根据 expandedNodes[0] 来生成
            // TODO: 实现平台L2/L3节点生成逻辑
        }

        // ② 生成研究方法列节点（第1列）
        if (state.columnLevels[1] === 'L1') {
            const methodNodes = Object.values<any>(dataStore.nodeMetadata?.['研究方法'] ?? {})
                .filter((n) => n.level === 2) // level===2 表示 L1
                .map((n) => {
                    // 检查是否有子节点
                    const hasChildren = dataStore.hierarchyMapping?.['研究方法']?.l1_to_l2?.[n.displayName]?.length > 0;
                    return {
                        id: n.displayName,
                        name: n.displayName,
                        column: 1,
                        color: n.color || '#97a7aa',
                        value: n.totalPapers || 1,
                        level: 'L1',
                        hasChildren,
                    };
                });
            nodes.push(...methodNodes);
        } else if (state.columnLevels[1] === 'L2' && state.expandedNodes[1].length > 0) {
            // 生成展开的 L2 子节点
            state.expandedNodes[1].forEach(parentId => {
                const children = dataStore.hierarchyMapping?.['研究方法']?.l1_to_l2?.[parentId] ?? [];
                children.forEach(childId => {
                    const allMethodMeta = dataStore.nodeMetadata?.['研究方法'] ?? {};
                    const childMeta = allMethodMeta[childId];
                    
                    if (childMeta) {
                        const hasChildren = dataStore.hierarchyMapping?.['研究方法']?.l2_to_l3?.[childId]?.length > 0;
                        nodes.push({
                            id: childId,
                            name: childId,
                            column: 1,
                            color: childMeta.color || '#97a7aa',
                            value: childMeta.totalPapers || 1,
                            level: 'L2',
                            parentId,
                            hasChildren,
                        });
                    }
                });
            });
        }
        // TODO: 处理 L3 情况

        // ③ 生成研究内容列节点（第2列）
        if (state.columnLevels[2] === 'L1') {
            const contentNodes = Object.values<any>(dataStore.nodeMetadata?.['研究内容'] ?? {})
                .filter((n) => n.level === 2) // level===2 表示 L1
                .map((n) => {
                    const hasChildren = dataStore.hierarchyMapping?.['研究内容']?.l1_to_l2?.[n.displayName]?.length > 0;
                    return {
                        id: n.displayName,
                        name: n.displayName,
                        column: 2,
                        color: n.color || '#dc6866',
                        value: n.totalPapers || 1,
                        level: 'L1',
                        hasChildren,
                    };
                });
            nodes.push(...contentNodes);
        } else if (state.columnLevels[2] === 'L2' && state.expandedNodes[2].length > 0) {
            console.log('=== 生成研究内容 L2 节点 ===');
            console.log('expandedNodes[2]:', state.expandedNodes[2]);
            // 生成展开的 L2 子节点
            state.expandedNodes[2].forEach(parentId => {
                console.log(`处理父节点: ${parentId}`);
                const children = dataStore.hierarchyMapping?.['研究内容']?.l1_to_l2?.[parentId] ?? [];
                console.log(`找到子节点:`, children);

                children.forEach(childId => {
                    console.log(`处理子节点: ${childId}`);
                    const allContentMeta = dataStore.nodeMetadata?.['研究内容'] ?? {};
                    const childMeta = allContentMeta[childId];
                       
                    console.log(`子节点 ${childId} 的元数据:`, childMeta);
                    if (childMeta) {
                        const hasChildren = dataStore.hierarchyMapping?.['研究内容']?.l2_to_l3?.[childId]?.length > 0;
                        const newNode = {
                            id: childId,
                            name: childId,
                            column: 2,
                            color: childMeta.color || '#dc6866',
                            value: childMeta.totalPapers || 1,
                            level: 'L2',
                            parentId,
                            hasChildren,
                        };
                        console.log(`添加子节点:`, newNode);
                        nodes.push(newNode);
                    } else {
                        console.warn(`❌ 找不到子节点 ${childId} 的元数据`);
                    }
                });
            });
            console.log('=== 生成研究内容 L2 节点完成 ===');
            console.log('当前第2列节点:', nodes.filter(n => n.column === 2));
        }
        // ④ 修复连接生成逻辑
        console.log('=== 连接生成调试 ===');
        console.log('当前 columnLevels:', state.columnLevels);
        console.log('生成的节点数量:', nodes.length);
        console.log('第2列节点:', nodes.filter(n => n.column === 2));

        // 生成所有需要的连接
        // a) 平台 → 研究内容 的连接（无论研究内容是L1还是L2）
        const platformKeyPrefix = state.currentPlatformType === '内容形式'
            ? '研究涉及平台-内容形式_L2__研究内容_L1'
            : '研究涉及平台-平台属性_L2__研究内容_L1';

        const rawPlatformContent = dataStore.crossLevelConnections?.connections?.[platformKeyPrefix] ?? {};
        console.log('平台-内容连接数据:', Object.keys(rawPlatformContent).length);

        for (const key in rawPlatformContent) {
            const [platform, content] = key.split('__');
            const info = rawPlatformContent[key];

            // 检查平台节点是否存在
            const platformExists = nodes.some(n => n.column === 0 && n.id === platform);

            // 检查内容节点是否存在（可能是L1节点，也可能是L2子节点的父节点）
            let contentExists = false;
            if (state.columnLevels[2] === 'L1') {
                contentExists = nodes.some(n => n.column === 2 && n.id === content);
            } else if (state.columnLevels[2] === 'L2') {
                // 如果研究内容展开到L2，需要检查这个L1内容是否是展开节点的父节点
                contentExists = state.expandedNodes[2].includes(content);
                if (contentExists) {
                    // 将连接分配给该父节点的所有子节点
                    const children = dataStore.hierarchyMapping?.['研究内容']?.l1_to_l2?.[content] ?? [];
                    children.forEach(childId => {
                        const childExists = nodes.some(n => n.column === 2 && n.id === childId);
                        if (childExists) {
                            links.push({
                                source: platform,
                                target: childId,
                                value: Math.ceil((info.paperCount ?? 1) / children.length), // 平均分配
                                paperIds: info.paperIds ?? [],
                            });
                        }
                    });
                }
            }

            if (platformExists && contentExists && state.columnLevels[2] === 'L1') {
                links.push({
                    source: platform,
                    target: content,
                    value: info.paperCount ?? 1,
                    paperIds: info.paperIds ?? [],
                });
            }
        }

        // b) 研究内容 → 研究方法 的连接
        if (state.columnLevels[2] === 'L2' && state.columnLevels[1] === 'L1') {
            // 研究内容L2 → 研究方法L1
            // 需要使用正确的连接键，可能需要从L2到L1的映射
            const l2ToL1Connections = dataStore.crossLevelConnections?.connections?.['研究内容_L2__研究方法_L1'];

            if (l2ToL1Connections) {
                console.log('找到L2-L1连接数据');
                for (const key in l2ToL1Connections) {
                    const [content, method] = key.split('__');
                    const info = l2ToL1Connections[key];

                    const contentExists = nodes.some(n => n.column === 2 && n.id === content);
                    const methodExists = nodes.some(n => n.column === 1 && n.id === method);

                    if (contentExists && methodExists) {
                        links.push({
                            source: content,
                            target: method,
                            value: info.paperCount ?? 1,
                            paperIds: info.paperIds ?? [],
                        });
                    }
                }
            } else {
                // 如果没有直接的L2-L1连接，尝试通过L1-L1连接推导
                console.log('没有直接L2-L1连接，尝试推导');
                const l1ToL1Connections = dataStore.crossLevelConnections?.connections?.['研究内容_L1__研究方法_L1'] ?? {};

                for (const key in l1ToL1Connections) {
                    const [contentL1, method] = key.split('__');
                    const info = l1ToL1Connections[key];

                    // 检查这个L1内容是否是当前展开的节点
                    if (state.expandedNodes[2].includes(contentL1)) {
                        // 获取该L1节点的所有L2子节点
                        const children = dataStore.hierarchyMapping?.['研究内容']?.l1_to_l2?.[contentL1] ?? [];
                        const methodExists = nodes.some(n => n.column === 1 && n.id === method);

                        if (methodExists && children.length > 0) {
                            // 将连接平均分配给所有子节点
                            const valuePerChild = Math.ceil((info.paperCount ?? 1) / children.length);

                            children.forEach(childId => {
                                const childExists = nodes.some(n => n.column === 2 && n.id === childId);
                                if (childExists) {
                                    links.push({
                                        source: childId,
                                        target: method,
                                        value: valuePerChild,
                                        paperIds: info.paperIds ?? [],
                                    });
                                }
                            });
                        }
                    }
                }
            }
        } else if (state.columnLevels[2] === 'L1' && state.columnLevels[1] === 'L1') {
            // 都是L1，使用原有逻辑
            const rawContentMethod = dataStore.crossLevelConnections?.connections?.['研究内容_L1__研究方法_L1'] ?? {};
            for (const key in rawContentMethod) {
                const [content, method] = key.split('__');
                const info = rawContentMethod[key];

                const contentExists = nodes.some(n => n.column === 2 && n.id === content);
                const methodExists = nodes.some(n => n.column === 1 && n.id === method);

                if (contentExists && methodExists) {
                    links.push({
                        source: content,
                        target: method,
                        value: info.paperCount ?? 1,
                        paperIds: info.paperIds ?? [],
                    });
                }
            }
        }

        console.log('最终生成的连接数量:', links.length);
        console.log('连接详情:', links.slice(0, 5)); // 显示前5个连接

        return { nodes, links };
    }

    // 修改现有的 visibleNodes 和 visibleLinks 计算属性
    const visibleNodes = computed(() => {
        // 如果所有列都是L1，使用原有的简单逻辑
        if (state.columnLevels.every(level => level === 'L1')) {
            return buildL1Snapshot().nodes;
        }
        // 否则使用混合层级逻辑
        return buildMixedLevelSnapshot().nodes;
    });

    const visibleLinks = computed(() => {
        if (state.columnLevels.every(level => level === 'L1')) {
            return buildL1Snapshot().links;
        }
        return buildMixedLevelSnapshot().links;
    });
    // ───────────────────── Getters ─────────────────────
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
        console.log('=== expandNode 被调用 ===');
        console.log('参数:', { colIdx, nodeId });
        console.log('调用前 columnLevels:', [...state.columnLevels]);
        console.log('调用前 expandedNodes:', JSON.parse(JSON.stringify(state.expandedNodes)));

        pushHistory();
        if (state.columnLevels[colIdx] === 'L3') {
            console.log('已经是L3，无法继续展开');
            return;
        }

        // 更新列级别
        const newLevel = state.columnLevels[colIdx] === 'L1' ? 'L2' : 'L3';
        state.columnLevels[colIdx] = newLevel;

        // 添加展开节点
        if (!state.expandedNodes[colIdx].includes(nodeId)) {
            state.expandedNodes[colIdx].push(nodeId);
        }

        console.log('调用后 columnLevels:', [...state.columnLevels]);
        console.log('调用后 expandedNodes:', JSON.parse(JSON.stringify(state.expandedNodes)));
        console.log('=== expandNode 完成 ===');
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