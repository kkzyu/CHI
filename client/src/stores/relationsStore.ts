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
                hasChildren: true, // 暂时都设为true
            };
        });

        // 研究内容 L1
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

        // a) 平台 (L1) → 内容 (L1)
        const platformKeyPrefix = state.currentPlatformType === '内容形式'
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

        // b) 内容 (L1) → 方法 (L1) - 正确的方向，不反转
        const rawContentMethod = dataStore.crossLevelConnections?.connections?.['研究内容_L1__研究方法_L1'] ?? {};
        for (const key in rawContentMethod) {
            if (!Object.prototype.hasOwnProperty.call(rawContentMethod, key)) continue;
            const [content, method] = key.split('__');
            const info = rawContentMethod[key];
            links.push({
                source: content, // 内容 → 方法
                target: method,
                value: info.paperCount ?? 1,
                paperIds: info.paperIds ?? [],
            });
        }

        return { nodes, links };
    }

    // ───────────────────── 工具函数：生成混合层级快照 ─────────────────────
    function buildMixedLevelSnapshot() {
        const nodes: any[] = [];
        const links: any[] = [];

        console.log('=== buildMixedLevelSnapshot 开始 ===');
        console.log('当前 columnLevels:', state.columnLevels);
        console.log('当前 expandedNodes:', state.expandedNodes);

        // ① 生成平台列节点（第0列）
        if (state.columnLevels[0] === 'L1') {
            // 生成平台 L1 节点
            const platformL1Raw = dataStore.getPlatformL1Nodes(state.currentPlatformType) ?? [];
            const platformNodes = platformL1Raw.map((n: any) => {
                const id = typeof n === 'string' ? n : n.id;
                const name = typeof n === 'string' ? n : n.name ?? n.id;
                const color = typeof n === 'string' ? '#6ca0dc' : n.color ?? '#6ca0dc';
                
                // 🔥 修复：检查平台是否有L2子节点
                const categoryKey = state.currentPlatformType === '内容形式' 
                    ? '研究涉及平台-内容形式' 
                    : '研究涉及平台-平台属性';
                const l1Key = state.currentPlatformType === '内容形式' ? '内容形式' : '平台属性';
                const hasChildren = (dataStore.hierarchyMapping?.[categoryKey]?.l1_to_l2?.[l1Key]?.length ?? 0) > 0;
                
                return {
                    id,
                    name,
                    column: 0,
                    color,
                    value: 1,
                    level: 'L1',
                    hasChildren,
                };
            });
            nodes.push(...platformNodes);
            console.log(`平台 L1 节点数量: ${platformNodes.length}`);
        } else if (state.columnLevels[0] === 'L2' && state.expandedNodes[0].length > 0) {
            // 🔥 新增：生成平台 L2 节点
            const categoryKey = state.currentPlatformType === '内容形式' 
                ? '研究涉及平台-内容形式' 
                : '研究涉及平台-平台属性';
            const l1Key = state.currentPlatformType === '内容形式' ? '内容形式' : '平台属性';
            
            const platformL2Children = dataStore.hierarchyMapping?.[categoryKey]?.l1_to_l2?.[l1Key] ?? [];
            platformL2Children.forEach(l2NodeId => {
                // 检查是否有L3子节点
                const l3Children = dataStore.hierarchyMapping?.[categoryKey]?.l2_to_l3?.[l2NodeId] ?? [];
                const hasChildren = l3Children.length > 0;
                
                nodes.push({
                    id: l2NodeId,
                    name: l2NodeId,
                    column: 0,
                    color: '#6ca0dc',
                    value: 1,
                    level: 'L2',
                    parentId: l1Key,
                    hasChildren,
                });
            });
            console.log(`平台 L2 节点数量: ${nodes.filter(n => n.column === 0).length}`);
        } else if (state.columnLevels[0] === 'L3' && state.expandedNodes[0].length > 0) {
            // 🔥 新增：生成平台 L3 节点
            const categoryKey = state.currentPlatformType === '内容形式' 
                ? '研究涉及平台-内容形式' 
                : '研究涉及平台-平台属性';
            
            state.expandedNodes[0].forEach(expandedNodeId => {
                const l3Children = dataStore.hierarchyMapping?.[categoryKey]?.l2_to_l3?.[expandedNodeId] ?? [];
                l3Children.forEach(l3ChildId => {
                    nodes.push({
                        id: l3ChildId,
                        name: l3ChildId,
                        column: 0,
                        color: '#6ca0dc',
                        value: 1,
                        level: 'L3',
                        parentId: expandedNodeId,
                        hasChildren: false,
                    });
                });
            });
            console.log(`平台 L3 节点数量: ${nodes.filter(n => n.column === 0).length}`);
        }

        // ② 生成研究方法列节点（第1列）- 修复元数据查找
        if (state.columnLevels[1] === 'L1') {
            const methodNodes = Object.values<any>(dataStore.nodeMetadata?.['研究方法'] ?? {})
                .filter((n) => n.level === 2) // level===2 表示 L1
                .map((n) => {
                    const children = dataStore.hierarchyMapping?.['研究方法']?.l1_to_l2?.[n.displayName] ?? [];
                    const hasChildren = children.length > 0;
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
            console.log(`研究方法 L1 节点数量: ${methodNodes.length}`);
        } else if (state.columnLevels[1] === 'L2' && state.expandedNodes[1].length > 0) {
            // 生成研究方法 L2 节点
            state.expandedNodes[1].forEach(parentId => {
                const children = dataStore.hierarchyMapping?.['研究方法']?.l1_to_l2?.[parentId] ?? [];
                children.forEach(childId => {
                    // 🔥 修复：如果没有元数据，创建基本节点
                    const allMethodMeta = dataStore.nodeMetadata?.['研究方法'] ?? {};
                    const childMeta = allMethodMeta[childId];
                    
                    const l3Children = dataStore.hierarchyMapping?.['研究方法']?.l2_to_l3?.[childId] ?? [];
                    const hasChildren = l3Children.length > 0;
                    
                    const nodeData = {
                        id: childId,
                        name: childMeta?.displayName || childId,
                        column: 1,
                        color: childMeta?.color || '#97a7aa',
                        value: childMeta?.totalPapers || 1,
                        level: 'L2',
                        parentId,
                        hasChildren,
                    };
                    
                    console.log(`添加研究方法L2节点:`, nodeData);
                    nodes.push(nodeData);
                });
            });
            console.log(`研究方法 L2 节点数量: ${nodes.filter(n => n.column === 1).length}`);
        } else if (state.columnLevels[1] === 'L3' && state.expandedNodes[1].length > 0) {
            // 生成研究方法 L3 节点
            state.expandedNodes[1].forEach(expandedNodeId => {
                const l3Children = dataStore.hierarchyMapping?.['研究方法']?.l2_to_l3?.[expandedNodeId] ?? [];
                l3Children.forEach(l3ChildId => {
                    const allMethodMeta = dataStore.nodeMetadata?.['研究方法'] ?? {};
                    const childMeta = allMethodMeta[l3ChildId];

                    nodes.push({
                        id: l3ChildId,
                        name: childMeta?.displayName || l3ChildId,
                        column: 1,
                        color: childMeta?.color || '#97a7aa',
                        value: childMeta?.totalPapers || 1,
                        level: 'L3',
                        parentId: expandedNodeId,
                        hasChildren: false,
                    });
                });
            });
            console.log(`研究方法 L3 节点数量: ${nodes.filter(n => n.column === 1).length}`);
        }

        // ③ 生成研究内容列节点（第2列）- 始终生成
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
            console.log(`研究内容 L1 节点数量: ${contentNodes.length}`);
        } else if (state.columnLevels[2] === 'L2' && state.expandedNodes[2].length > 0) {
            // 生成研究内容 L2 节点
            state.expandedNodes[2].forEach(parentId => {
                console.log(`处理父节点: ${parentId}`);
                const children = dataStore.hierarchyMapping?.['研究内容']?.l1_to_l2?.[parentId] ?? [];
                console.log(`找到子节点:`, children);

                children.forEach(childId => {
                    // 🔥 修复：使用直接键查找
                    const allContentMeta = dataStore.nodeMetadata?.['研究内容'] ?? {};
                    const childMeta = allContentMeta[childId];

                    console.log(`子节点 ${childId} 的元数据:`, childMeta);
                    if (childMeta) {
                        const hasChildren = dataStore.hierarchyMapping?.['研究内容']?.l2_to_l3?.[childId]?.length > 0;
                        const newNode = {
                            id: childId,
                            name: childMeta.displayName || childId,
                            column: 2,
                            color: childMeta.color || '#dc6866',
                            value: childMeta.totalPapers || 1,
                            level: 'L2',
                            parentId,
                            hasChildren,
                        };
                        console.log(`添加L2子节点:`, newNode);
                        nodes.push(newNode);
                    } else {
                        console.warn(`❌ 找不到子节点 ${childId} 的元数据`);
                    }
                });
            });
            console.log(`研究内容 L2 节点数量: ${nodes.filter(n => n.column === 2).length}`);
        } else if (state.columnLevels[2] === 'L3' && state.expandedNodes[2].length > 0) {
            // 生成研究内容 L3 节点
            state.expandedNodes[2].forEach(expandedNodeId => {
                console.log(`处理L2展开节点: ${expandedNodeId}`);
                // 直接按L2节点查找L3子节点
                const l3Children = dataStore.hierarchyMapping?.['研究内容']?.l2_to_l3?.[expandedNodeId] ?? [];
                console.log(`L2节点 ${expandedNodeId} 的L3子节点:`, l3Children);

                l3Children.forEach(l3ChildId => {
                    const allContentMeta = dataStore.nodeMetadata?.['研究内容'] ?? {};
                    const childMeta = allContentMeta[l3ChildId];

                    if (childMeta) {
                        nodes.push({
                            id: l3ChildId,
                            name: childMeta.displayName || l3ChildId,
                            column: 2,
                            color: childMeta.color || '#dc6866',
                            value: childMeta.totalPapers || 1,
                            level: 'L3',
                            parentId: expandedNodeId,
                            hasChildren: false,
                        });
                    } else {
                        console.warn(`❌ 找不到L3节点 ${l3ChildId} 的元数据`);
                        // 即使没有元数据，也尝试创建基本节点
                        const basicNode = {
                            id: l3ChildId,
                            name: l3ChildId,
                            column: 2,
                            color: '#dc6866',
                            value: 1,
                            level: 'L3',
                            parentId: expandedNodeId,
                            hasChildren: false,
                        };
                        console.log(`创建基本L3节点:`, basicNode);
                        nodes.push(basicNode);
                    }
                });
            });
            console.log(`研究内容 L3 节点数量: ${nodes.filter(n => n.column === 2).length}`);

        }

        console.log('=== 节点生成完成 ===');
        console.log('各列节点数量:', {
            column0: nodes.filter(n => n.column === 0).length,
            column1: nodes.filter(n => n.column === 1).length,
            column2: nodes.filter(n => n.column === 2).length,
            total: nodes.length
        });

        // ④ 生成连接
        // a) 平台 → 研究内容 的连接
        const platformKeyPrefix = state.currentPlatformType === '内容形式'
            ? '研究涉及平台-内容形式_L2__研究内容_L1'
            : '研究涉及平台-平台属性_L2__研究内容_L1';

        const rawPlatformContent = dataStore.crossLevelConnections?.connections?.[platformKeyPrefix] ?? {};
        console.log('平台-内容连接数据:', Object.keys(rawPlatformContent).length);

        for (const key in rawPlatformContent) {
            const [platform, content] = key.split('__');
            const info = rawPlatformContent[key];

            const platformExists = nodes.some(n => n.column === 0 && n.id === platform);
            let contentExists = false;

            if (state.columnLevels[2] === 'L1') {
                contentExists = nodes.some(n => n.column === 2 && n.id === content);
                if (platformExists && contentExists) {
                    links.push({
                        source: platform,
                        target: content,
                        value: info.paperCount ?? 1,
                        paperIds: info.paperIds ?? [],
                    });
                }
            } else if (state.columnLevels[2] === 'L2') {
                // 检查这个L1内容是否是展开节点的父节点
                contentExists = state.expandedNodes[2].includes(content);
                if (contentExists) {
                    // 将连接分配给该父节点的所有子节点
                    const children = dataStore.hierarchyMapping?.['研究内容']?.l1_to_l2?.[content] ?? [];
                    children.forEach(childId => {
                        const childExists = nodes.some(n => n.column === 2 && n.id === childId);
                        if (platformExists && childExists) {
                            links.push({
                                source: platform,
                                target: childId,
                                value: Math.ceil((info.paperCount ?? 1) / children.length),
                                paperIds: info.paperIds ?? [],
                            });
                        }
                    });
                }
            } else if (state.columnLevels[2] === 'L3') {
                // 🔥 新增：平台 → 内容L3
                const currentL3Nodes = nodes.filter(n => n.column === 2 && n.level === 'L3');

                currentL3Nodes.forEach(l3Node => {
                    // 通过L3节点找到对应的L2父节点
                    const l2ParentId = l3Node.parentId;

                    // 通过L2节点找到对应的L1父节点
                    const l1ParentId = dataStore.hierarchyMapping?.['研究内容']?.l2_to_l1?.[l2ParentId];

                    // 检查L1父节点是否与当前连接的content匹配
                    if (l1ParentId === content && platformExists) {
                        links.push({
                            source: platform,
                            target: l3Node.id,
                            value: Math.ceil((info.paperCount ?? 1) / currentL3Nodes.length),
                            paperIds: info.paperIds ?? [],
                        });
                        console.log(`创建平台到L3连接: ${platform} -> ${l3Node.id}`);
                    }
                });
            }
        }

        // b) 研究内容 → 研究方法 的连接
        const rawContentMethod = dataStore.crossLevelConnections?.connections?.['研究内容_L1__研究方法_L1'] ?? {};
        console.log('内容-方法连接数据:', Object.keys(rawContentMethod).length);

        for (const key in rawContentMethod) {
            const [content, method] = key.split('__');
            const info = rawContentMethod[key];

            // 🔥 修复：添加完整的连接逻辑
            if (state.columnLevels[2] === 'L1' && state.columnLevels[1] === 'L1') {
                // L1 → L1
                const contentExists = nodes.some(n => n.column === 2 && n.id === content);
                const methodExists = nodes.some(n => n.column === 1 && n.id === method);
                if (contentExists && methodExists) {
                    links.push({
                        source: content,
                        target: method,
                        value: info.paperCount ?? 1,
                        paperIds: info.paperIds ?? [],
                    });
                    console.log(`创建L1→L1连接: ${content} → ${method}`);
                }
            } else if (state.columnLevels[2] === 'L2' && state.columnLevels[1] === 'L1') {
                // L2 → L1
                if (state.expandedNodes[2].includes(content)) {
                    const children = dataStore.hierarchyMapping?.['研究内容']?.l1_to_l2?.[content] ?? [];
                    const methodExists = nodes.some(n => n.column === 1 && n.id === method);
                    if (methodExists) {
                        children.forEach(childId => {
                            const childExists = nodes.some(n => n.column === 2 && n.id === childId);
                            if (childExists) {
                                links.push({
                                    source: childId,
                                    target: method,
                                    value: Math.ceil((info.paperCount ?? 1) / children.length),
                                    paperIds: info.paperIds ?? [],
                                });
                            }
                        });
                    }
                }
            } else if (state.columnLevels[2] === 'L1' && state.columnLevels[1] === 'L2') {
                // L1 → L2
                if (state.expandedNodes[1].includes(method)) {
                    const children = dataStore.hierarchyMapping?.['研究方法']?.l1_to_l2?.[method] ?? [];
                    const contentExists = nodes.some(n => n.column === 2 && n.id === content);
                    if (contentExists) {
                        children.forEach(childId => {
                            const childExists = nodes.some(n => n.column === 1 && n.id === childId);
                            if (childExists) {
                                links.push({
                                    source: content,
                                    target: childId,
                                    value: Math.ceil((info.paperCount ?? 1) / children.length),
                                    paperIds: info.paperIds ?? [],
                                });
                                console.log(`创建L1→L2连接: ${content} → ${childId}`);
                            }
                        });
                    }
                }
            } else if (state.columnLevels[2] === 'L2' && state.columnLevels[1] === 'L2') {
                // L2 → L2
                if (state.expandedNodes[2].includes(content) && state.expandedNodes[1].includes(method)) {
                    const contentChildren = dataStore.hierarchyMapping?.['研究内容']?.l1_to_l2?.[content] ?? [];
                    const methodChildren = dataStore.hierarchyMapping?.['研究方法']?.l1_to_l2?.[method] ?? [];
                    
                    contentChildren.forEach(contentChildId => {
                        methodChildren.forEach(methodChildId => {
                            const contentChildExists = nodes.some(n => n.column === 2 && n.id === contentChildId);
                            const methodChildExists = nodes.some(n => n.column === 1 && n.id === methodChildId);
                            if (contentChildExists && methodChildExists) {
                                links.push({
                                    source: contentChildId,
                                    target: methodChildId,
                                    value: Math.ceil((info.paperCount ?? 1) / (contentChildren.length * methodChildren.length)),
                                    paperIds: info.paperIds ?? [],
                                });
                                console.log(`创建L2→L2连接: ${contentChildId} → ${methodChildId}`);
                            }
                        });
                    });
                }
            }
            // 可以继续添加 L3 相关的连接逻辑...
        }

        console.log('最终生成的连接数量:', links.length);
        console.log('连接详情:', links.slice(0, 5));

        return { nodes, links };
    }

    // 计算属性
    const visibleNodes = computed(() => {
        if (state.columnLevels.every(level => level === 'L1')) {
            return buildL1Snapshot().nodes;
        }
        return buildMixedLevelSnapshot().nodes;
    });

    const visibleLinks = computed(() => {
        if (state.columnLevels.every(level => level === 'L1')) {
            return buildL1Snapshot().links;
        }
        return buildMixedLevelSnapshot().links;
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

        // 检查节点是否有子节点
        const currentLevel = state.columnLevels[colIdx];
        let hasChildren = false;

        if (currentLevel === 'L1') {
            if (colIdx === 0) {
                // 🔥 修复：启用平台节点展开
                const categoryKey = state.currentPlatformType === '内容形式' 
                    ? '研究涉及平台-内容形式' 
                    : '研究涉及平台-平台属性';
                
                // 检查平台是否有L2子节点
                const platformL2Children = dataStore.hierarchyMapping?.[categoryKey]?.l1_to_l2?.['内容形式'] ?? 
                                         dataStore.hierarchyMapping?.[categoryKey]?.l1_to_l2?.['平台属性'] ?? [];
                hasChildren = platformL2Children.length > 0;
                
                console.log(`平台节点 ${nodeId} 的L2子节点:`, platformL2Children);
                console.log(`平台节点是否有子节点:`, hasChildren);
            } else {
                // 研究方法或研究内容
                const categoryMap = colIdx === 1 ? '研究方法' : '研究内容';
                const children = dataStore.hierarchyMapping?.[categoryMap]?.l1_to_l2?.[nodeId];
                hasChildren = children && children.length > 0;
                console.log(`${categoryMap} L1节点 ${nodeId} 的L2子节点:`, children);
            }
        } else if (currentLevel === 'L2') {
            // L2 → L3
            if (colIdx === 0) {
                // 平台 L2 → L3
                const categoryKey = state.currentPlatformType === '内容形式' 
                    ? '研究涉及平台-内容形式' 
                    : '研究涉及平台-平台属性';
                const l3Children = dataStore.hierarchyMapping?.[categoryKey]?.l2_to_l3?.[nodeId] ?? [];
                hasChildren = l3Children.length > 0;
                console.log(`平台L2节点 ${nodeId} 的L3子节点:`, l3Children);
            } else {
                // 研究方法或研究内容 L2 → L3
                const categoryMap = colIdx === 1 ? '研究方法' : '研究内容';
                const l3Children = dataStore.hierarchyMapping?.[categoryMap]?.l2_to_l3?.[nodeId] ?? [];
                hasChildren = l3Children.length > 0;
                console.log(`${categoryMap} L2节点 ${nodeId} 的L3子节点:`, l3Children);
            }
        }

        if (!hasChildren) {
            console.log(`节点 ${nodeId} 没有子节点，无法展开`);
            return;
        }

        // 更新列级别
        const newLevel = state.columnLevels[colIdx] === 'L1' ? 'L2' : 'L3';
        state.columnLevels[colIdx] = newLevel;

        // 管理展开节点
        if (newLevel === 'L2') {
            // L1→L2：添加展开的L1节点
            if (!state.expandedNodes[colIdx].includes(nodeId)) {
                state.expandedNodes[colIdx].push(nodeId);
            }
        } else if (newLevel === 'L3') {
            // L2→L3：清空之前的记录，只记录展开的L2节点
            state.expandedNodes[colIdx] = [nodeId];
        }

        console.log('调用后 columnLevels:', [...state.columnLevels]);
        console.log('调用后 expandedNodes:', JSON.parse(JSON.stringify(state.expandedNodes)));
        console.log('=== expandNode 完成 ===');
    }

    function collapseNode(colIdx: 0 | 1 | 2, nodeId?: string) {
        pushHistory();
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
        expandNode,
        collapseNode,
        applyFilters,
        pushHistory,
        popHistory,
        canUndo,
        mapOldIdToNew,
    };
});