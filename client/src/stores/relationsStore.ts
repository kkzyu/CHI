import { defineStore } from 'pinia';
import { computed, reactive } from 'vue';
import { useDataStore } from './dataStore';
import { node } from 'globals';

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
        '内容形式': dataStore.platformConfiguration?.platformTypes?.['内容形式']?.hierarchy?.l1 || [],
        '平台属性': dataStore.platformConfiguration?.platformTypes?.['平台属性']?.hierarchy?.l1 || [],
    }));

    // 2. 读取 switchMapping（内容形式 → 平台属性，反向再做一次）
    const switchMap = computed(() => dataStore.platformConfiguration?.switchMapping || {});

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
                
                const platformConfig = dataStore.platformConfiguration?.platformTypes?.[state.currentPlatformType];
                const l2Children = platformConfig?.hierarchy?.l2?.[id] ?? [];
                const hasChildren = l2Children.length > 0;
                
                console.log(`平台L1节点 ${id} 的L2子节点数量: ${l2Children.length}`);
                
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
            // 生成平台 L2 节点
            console.log('=== 生成平台 L2 节点 ===');
            const platformConfig = dataStore.platformConfiguration?.platformTypes?.[state.currentPlatformType];
            
            state.expandedNodes[0].forEach(expandedL1NodeId => {
                console.log(`处理展开的平台L1节点: ${expandedL1NodeId}`);
                
                // 从 platformConfiguration 获取L2子节点
                const l2Children = platformConfig?.hierarchy?.l2?.[expandedL1NodeId] ?? [];
                console.log(`L1节点 ${expandedL1NodeId} 的L2子节点:`, l2Children);
                
                l2Children.forEach(l2NodeId => {
                    
                    const hasChildren = false;
                    
                    // 获取平台颜色（继承父节点颜色或使用默认颜色）
                    const parentColor = dataStore.getPlatformL1Nodes(state.currentPlatformType)
                        ?.find((n: any) => (typeof n === 'string' ? n : n.id) === expandedL1NodeId)?.color ?? '#6ca0dc';
                    
                    const platformNode = {
                        id: l2NodeId,
                        name: l2NodeId,
                        column: 0,
                        color: parentColor,
                        value: 1,
                        level: 'L2',
                        parentId: expandedL1NodeId,
                        hasChildren,
                    };
                    
                    console.log(`添加平台L2节点:`, platformNode);
                    nodes.push(platformNode);
                });
            });
            console.log(`平台 L2 节点数量: ${nodes.filter(n => n.column === 0).length}`);
        }

        // ② 生成研究方法列节点（第1列）
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
            console.log(`研究内容 L1 节点数量: ${contentNodes.length}`);
        } else if (state.columnLevels[2] === 'L2' && state.expandedNodes[2].length > 0) {
            // 生成研究内容 L2 节点
            state.expandedNodes[2].forEach(parentId => {
                console.log(`处理父节点: ${parentId}`);
                const children = dataStore.hierarchyMapping?.['研究内容']?.l1_to_l2?.[parentId] ?? [];
                console.log(`找到子节点:`, children);

                children.forEach(childId => {
                    const allContentMeta = dataStore.nodeMetadata?.['研究内容'] ?? {};
                    const childMeta = allContentMeta[childId];

                    console.log(`子节点 ${childId} 的元数据:`, childMeta);
                    if (childMeta) {
                        const hasChildren = dataStore.hierarchyMapping?.['研究内容']?.l2_to_l3?.[childId]?.length > 0;
                        const nodeId = childMeta.displayName;
                        const newNode = {
                            id: nodeId,
                            name: nodeId,
                            column: 2,
                            color: childMeta.color || '#dc6866',
                            value: childMeta.totalPapers || 1,
                            level: 'L2',
                            parentId,
                            hasChildren,
                            originalId: childId, // 保留原始ID
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

        // ④ 生成连接 - 完全重写连接逻辑
        
        // 🔥 关键修复：平台 → 研究内容 的连接
        // 从 crossLevelConnections 获取所有相关的连接数据
        const allConnections = dataStore.crossLevelConnections?.connections ?? {};
        
        // 1. 平台 → 研究内容连接
        console.log('=== 生成平台→研究内容连接 ===');
        
        // 根据当前平台层级和内容层级选择正确的连接数据源
        let platformContentConnectionKey = '';
        
        if (state.columnLevels[0] === 'L1' && state.columnLevels[2] === 'L1') {
        // L1平台 → L1内容：使用 L2平台→L1内容 数据，需要按L1平台分组聚合
            platformContentConnectionKey = state.currentPlatformType === '内容形式'
                ? '研究涉及平台-内容形式_L2__研究内容_L1'
                : '研究涉及平台-平台属性_L2__研究内容_L1';
        } else if (state.columnLevels[0] === 'L2' && state.columnLevels[2] === 'L1') {
            // L2平台 → L1内容：直接使用L2平台数据
            platformContentConnectionKey = state.currentPlatformType === '内容形式'
                ? '研究涉及平台-内容形式_L3__研究内容_L1'
                : '研究涉及平台-平台属性_L3__研究内容_L1';
        } else if (state.columnLevels[0] === 'L1' && state.columnLevels[2] === 'L2') {
            // L1平台 → L2内容
            platformContentConnectionKey = state.currentPlatformType === '内容形式'
                ? '研究涉及平台-内容形式_L2__研究内容_L2'
                : '研究涉及平台-平台属性_L2__研究内容_L2';
        } else if (state.columnLevels[0] === 'L2' && state.columnLevels[2] === 'L2') {
            // L2平台 → L2内容：直接使用
            platformContentConnectionKey = state.currentPlatformType === '内容形式'
                ? '研究涉及平台-内容形式_L3__研究内容_L2'
                : '研究涉及平台-平台属性_L3__研究内容_L2';
        } else if (state.columnLevels[0] === 'L1' && state.columnLevels[2] === 'L3') {
            // L1平台 → L3内容
            platformContentConnectionKey = state.currentPlatformType === '内容形式'
                ? '研究涉及平台-内容形式_L2__研究内容_L3'
                : '研究涉及平台-平台属性_L2__研究内容_L3';
        } else if (state.columnLevels[0] === 'L2' && state.columnLevels[2] === 'L3') {
            // L2平台 → L3内容：直接使用
            platformContentConnectionKey = state.currentPlatformType === '内容形式'
                ? '研究涉及平台-内容形式_L3__研究内容_L3'
                : '研究涉及平台-平台属性_L3__研究内容_L3';
        }


        const platformContentConnections = allConnections[platformContentConnectionKey] ?? {};
        console.log(`使用连接键: ${platformContentConnectionKey}`);
        console.log(`找到连接数量: ${Object.keys(platformContentConnections).length}`);

         // 🔥 关键修复：如果是L1平台到内容的连接，需要聚合L2平台的数据
        if (state.columnLevels[0] === 'L1'&& platformContentConnectionKey.includes('_L2__')) {
            // L1平台显示时，需要将L2平台的连接聚合到对应的L1平台
            console.log('处理L1平台聚合连接');
            console.log('当前显示的平台节点:', nodes.filter(n => n.column === 0).map(n => n.id));
            console.log('当前显示的内容节点:', nodes.filter(n => n.column === 2).map(n => n.id));
            for (const connectionKey in platformContentConnections) {
                const [platformId, contentId] = connectionKey.split('__');
                const connectionInfo = platformContentConnections[connectionKey];
                
                console.log(`处理直连: ${platformId} → ${contentId}`);
                
                // 检查两端节点是否存在
                const platformNode = nodes.find(n => n.column === 0 && n.id === platformId);
                const contentNode = nodes.find(n => n.column === 2 && n.id === contentId);
                
                if (platformNode && contentNode) {
                    links.push({
                        source: platformId,
                        target: contentId,
                        value: connectionInfo.paperCount || 1,
                        paperIds: connectionInfo.paperIds || [],
                        connectionStrength: connectionInfo.connectionStrength
                    });
                    console.log(`✅ 创建L1平台→内容连接: ${platformId} → ${contentId} (${connectionInfo.paperCount || 1})`);
                } else {
                    console.log(`连接节点不存在: ${platformId} → ${contentId}`);
                    console.log(`平台节点存在: ${!!platformNode}, 内容节点存在: ${!!contentNode}`);
                    if (!platformNode) {
                        console.log(`❌ 平台节点 "${platformId}" 不存在，可用平台节点:`, nodes.filter(n => n.column === 0).map(n => n.id));
                    }
                    if (!contentNode) {
                        console.log(`❌ 内容节点 "${contentId}" 不存在，可用内容节点:`, nodes.filter(n => n.column === 2).map(n => n.id));
                    }
                }
            }
        } else if (state.columnLevels[0] === 'L1' && platformContentConnectionKey.includes('_L3__')) {
            // L1平台显示，使用L3级别数据源：需要聚合具体平台到L1分类
            console.log('处理L1平台聚合连接（数据源为L3级别）');
            const platformConfig = dataStore.platformConfiguration?.platformTypes?.[state.currentPlatformType];
            const aggregatedConnections = new Map<string, any>();

            // 遍历所有L3平台的连接
            for (const connectionKey in platformContentConnections) {
                const [l3PlatformId, contentId] = connectionKey.split('__');
                const connectionInfo = platformContentConnections[connectionKey];
                
                console.log(`处理L3连接: ${l3PlatformId} → ${contentId}`);
                
                // 找到这个L3平台属于哪个L1平台
                let l1PlatformId = null;
                for (const [l1Id, l2Children] of Object.entries(platformConfig?.hierarchy?.l2 ?? {})) {
                    if (l2Children.includes(l3PlatformId)) {
                        l1PlatformId = l1Id;
                        break;
                    }
                }

                if (l1PlatformId) {
                    console.log(`${l3PlatformId} 属于 L1平台: ${l1PlatformId}`);
                    const aggregatedKey = `${l1PlatformId}__${contentId}`;
                    if (aggregatedConnections.has(aggregatedKey)) {
                        // 聚合连接数据
                        const existing = aggregatedConnections.get(aggregatedKey);
                        existing.paperCount += connectionInfo.paperCount || 0;
                        existing.paperIds = [...existing.paperIds, ...(connectionInfo.paperIds || [])];
                    } else {
                        // 新建聚合连接
                        aggregatedConnections.set(aggregatedKey, {
                            paperCount: connectionInfo.paperCount || 0,
                            paperIds: connectionInfo.paperIds || [],
                            connectionStrength: connectionInfo.connectionStrength
                        });
                    }
                } else {
                    console.log(`❌ 找不到 ${l3PlatformId} 对应的L1平台`);
                }
            }

            // 创建聚合后的连接
            for (const [aggregatedKey, aggregatedInfo] of aggregatedConnections) {
                const [platformId, contentId] = aggregatedKey.split('__');
                
                // 检查两端节点是否存在
                const platformNode = nodes.find(n => n.column === 0 && n.id === platformId);
                const contentNode = nodes.find(n => n.column === 2 && n.id === contentId);
                
                if (platformNode && contentNode) {
                    links.push({
                        source: platformId,
                        target: contentId,
                        value: aggregatedInfo.paperCount,
                        paperIds: aggregatedInfo.paperIds,
                        connectionStrength: aggregatedInfo.connectionStrength
                    });
                    console.log(`✅ 创建聚合平台→内容连接: ${platformId} → ${contentId} (${aggregatedInfo.paperCount})`);
                }
            }
        } else if (state.columnLevels[0] === 'L2') {
            // L2平台显示时，直接使用具体平台的连接
            console.log('处理L2平台直连');
            console.log('当前显示L2平台节点:', nodes.filter(n => n.column === 0).map(n => n.id));
            
            for (const connectionKey in platformContentConnections) {
                const [platformId, contentId] = connectionKey.split('__');
                const connectionInfo = platformContentConnections[connectionKey];
                
                // 检查两端节点是否存在
                const platformNode = nodes.find(n => n.column === 0 && n.id === platformId);
                const contentNode = nodes.find(n => n.column === 2 && n.id === contentId);
                
                if (platformNode && contentNode) {
                    links.push({
                        source: platformId,
                        target: contentId,
                        value: connectionInfo.paperCount ?? 1,
                        paperIds: connectionInfo.paperIds ?? [],
                        connectionStrength: connectionInfo.connectionStrength
                    });
                    console.log(`✅ 创建L2平台→内容连接: ${platformId} → ${contentId} (${connectionInfo.paperCount || 1})`);
                } else {
                    console.log(`连接节点不存在: ${platformId} → ${contentId}`);
                    console.log(`平台节点存在: ${!!platformNode}, 内容节点存在: ${!!contentNode}`);
                }
            }
        }

        console.log(`平台→内容连接创建完成，当前连接数: ${links.length}`);
        // 2. 研究内容 → 研究方法连接
        console.log('=== 生成研究内容→研究方法连接 ===');
        
        let contentMethodConnectionKey = '';
        
        if (state.columnLevels[2] === 'L1' && state.columnLevels[1] === 'L1') {
            contentMethodConnectionKey = '研究内容_L1__研究方法_L1';
        } else if (state.columnLevels[2] === 'L1' && state.columnLevels[1] === 'L2') {
            contentMethodConnectionKey = '研究内容_L1__研究方法_L2';
        } else if (state.columnLevels[2] === 'L1' && state.columnLevels[1] === 'L3') {
            contentMethodConnectionKey = '研究内容_L1__研究方法_L3';
        } else if (state.columnLevels[2] === 'L2' && state.columnLevels[1] === 'L1') {
            contentMethodConnectionKey = '研究内容_L2__研究方法_L1';
        } else if (state.columnLevels[2] === 'L2' && state.columnLevels[1] === 'L2') {
            contentMethodConnectionKey = '研究内容_L2__研究方法_L2';
        } else if (state.columnLevels[2] === 'L2' && state.columnLevels[1] === 'L3') {
            contentMethodConnectionKey = '研究内容_L2__研究方法_L3';
        } else if (state.columnLevels[2] === 'L3' && state.columnLevels[1] === 'L1') {
            contentMethodConnectionKey = '研究内容_L3__研究方法_L1';
        } else if (state.columnLevels[2] === 'L3' && state.columnLevels[1] === 'L2') {
            contentMethodConnectionKey = '研究内容_L3__研究方法_L2';
        } else if (state.columnLevels[2] === 'L3' && state.columnLevels[1] === 'L3') {
            contentMethodConnectionKey = '研究内容_L3__研究方法_L3';
        }

        const contentMethodConnections = allConnections[contentMethodConnectionKey] ?? {};
        console.log(`使用连接键: ${contentMethodConnectionKey}`);
        console.log(`找到连接数量: ${Object.keys(contentMethodConnections).length}`);
        // 🔥 关键修复：添加详细的调试信息
        console.log('当前显示的内容节点:', nodes.filter(n => n.column === 2).map(n => ({ 
            id: n.id, 
            name: n.name, 
            originalId: n.originalId 
        })));
        console.log('当前显示的方法节点:', nodes.filter(n => n.column === 1).map(n => n.id));
        for (const connectionKey in contentMethodConnections) {
            const [contentId, methodId] = connectionKey.split('__');
            const connectionInfo = contentMethodConnections[connectionKey];
            
            console.log(`处理连接: ${contentId} → ${methodId}`);
            
            // 检查两端节点是否存在
            const contentNode = nodes.find(n => n.column === 2 && n.id === contentId);
            const methodNode = nodes.find(n => n.column === 1 && n.id === methodId);
            
            if (contentNode && methodNode) {
                links.push({
                    source: contentId,
                    target: methodId,
                    value: connectionInfo.paperCount ?? 1,
                    paperIds: connectionInfo.paperIds ?? [],
                    connectionStrength: connectionInfo.connectionStrength
                });
                console.log(`创建内容→方法连接: ${contentId} → ${methodId} (${connectionInfo.paperCount || 1})`);
            } else {
                console.log(`连接节点不存在: ${contentId} → ${methodId}`);
                console.log(`内容节点存在: ${!!contentNode}, 方法节点存在: ${!!methodNode}`);
            }
        }

        console.log('=== 连接生成完成 ===');
        console.log(`最终生成的连接数量: ${links.length}`);
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

        const maxLevel = colIdx === 0 ? 'L2' : 'L3';
        if (state.columnLevels[colIdx] === 'L3') {
            console.log('已经是L3，无法继续展开');
            return;
        }

        // 检查节点是否有子节点
        const currentLevel = state.columnLevels[colIdx];
        let hasChildren = false;

        if (currentLevel === 'L1') {
            if (colIdx === 0) {
                // 平台节点展开
                console.log(`检查平台节点 ${nodeId} 的L2子节点`);
                console.log('当前平台类型:', state.currentPlatformType);
                
                const platformConfig = dataStore.platformConfiguration?.platformTypes?.[state.currentPlatformType];
                const l2Children = platformConfig?.hierarchy?.l2?.[nodeId] ?? [];
                
                console.log(`平台节点 ${nodeId} 的L2子节点:`, l2Children);
                hasChildren = l2Children.length > 0;
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
                hasChildren = false;
                console.log(`平台L2节点 ${nodeId} 没有L3子节点（平台最多到L2）`);
            } else {
                // 研究方法或研究内容 L2 → L3
                const categoryMap = colIdx === 1 ? '研究方法' : '研究内容';
                let l3Children = dataStore.hierarchyMapping?.[categoryMap]?.l2_to_l3?.[nodeId] ?? [];
                // 🔥 如果直接查找失败，尝试通过完整ID查找
                if (l3Children.length === 0) {
                    console.log('直接查找失败，尝试通过完整ID查找...');
                    
                    // 查找所有可能的完整ID
                    const allL2ToL3Mapping = dataStore.hierarchyMapping?.[categoryMap]?.l2_to_l3 ?? {};
                    console.log('所有L2→L3映射键:', Object.keys(allL2ToL3Mapping));
                    
                    // 尝试找到匹配的完整ID（包含displayName的ID）
                    let matchedFullId = null;
                    for (const fullId in allL2ToL3Mapping) {
                        // 检查完整ID是否包含当前nodeId，或者通过元数据匹配
                        const metadata = dataStore.nodeMetadata?.[categoryMap]?.[fullId];
                        if (metadata && metadata.displayName === nodeId) {
                            matchedFullId = fullId;
                            break;
                        }
                        // 或者检查ID是否以nodeId结尾
                        if (fullId.endsWith('-' + nodeId) || fullId.endsWith(nodeId)) {
                            matchedFullId = fullId;
                            break;
                        }
                    }
                    
                    if (matchedFullId) {
                        l3Children = allL2ToL3Mapping[matchedFullId] ?? [];
                        console.log(`找到匹配的完整ID: ${matchedFullId}, L3子节点:`, l3Children);
                    } else {
                        console.log('未找到匹配的完整ID');
                        
                        // 🔥 最后一种尝试：从当前显示的L2节点中找到originalId
                        const currentL2Nodes = visibleNodes.value.filter(n => n.column === colIdx && n.level === 'L2');
                        const targetNode = currentL2Nodes.find(n => n.id === nodeId || n.name === nodeId);
                        
                        if (targetNode && targetNode.originalId) {
                            console.log(`使用节点的originalId: ${targetNode.originalId}`);
                            l3Children = dataStore.hierarchyMapping?.[categoryMap]?.l2_to_l3?.[targetNode.originalId] ?? [];
                            console.log(`通过originalId找到的L3子节点:`, l3Children);
                        }
                    }
                }
                
                hasChildren = l3Children.length > 0;
                console.log(`${categoryMap} L2节点 ${nodeId} 最终的L3子节点:`, l3Children);
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
            // 🔥 关键修复：需要找到正确的L2节点ID来记录
            const currentL2Nodes = visibleNodes.value.filter(n => n.column === colIdx && n.level === 'L2');
            const targetNode = currentL2Nodes.find(n => n.id === nodeId || n.name === nodeId);
            
            const nodeIdToRecord = targetNode?.originalId || nodeId;
            state.expandedNodes[colIdx] = [nodeIdToRecord];
            console.log(`记录展开的L2节点ID: ${nodeIdToRecord}`);
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