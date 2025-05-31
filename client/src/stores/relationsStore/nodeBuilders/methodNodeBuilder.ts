export function buildMethodNodes(dataStore: any, state: any): any[] {
    const nodes: any[] = [];
    
    // 计算每个节点的论文数量(去重)
    const nodePaperIds: Record<string, Set<string>> = {};
    
    // 处理所有连接类型
    const connectionsByType = dataStore.crossLevelConnections?.connections ?? {};
    
    // 收集所有相关的论文ID
    Object.entries(connectionsByType).forEach(([connectionType, connections]: [string, any]) => {
        // 只处理与研究方法相关的连接
        if (connectionType.includes('研究方法')) {
            Object.entries(connections).forEach(([connectionKey, connectionInfo]: [string, any]) => {
                const [source, target] = connectionKey.split('__');
                // 确定哪个是研究方法节点
                const methodNode = connectionType.endsWith('研究方法') ? target : source;
                
                // 初始化集合
                if (!nodePaperIds[methodNode]) nodePaperIds[methodNode] = new Set();
                
                // 添加论文ID
                const paperIds = connectionInfo.paperIds || [];
                paperIds.forEach((paperId: string) => {
                    nodePaperIds[methodNode].add(paperId);
                });
            });
        }
    });
    
    // 辅助函数：获取节点的论文数量
    const getNodePaperCount = (nodeId: string): number => {
        return nodePaperIds[nodeId]?.size || 0;
    };

    if (state.columnLevels[1] === 'L1') {
        // 方法 L1 节点
        const methodNodes = Object.values<any>(dataStore.nodeMetadata?.['研究方法'] ?? {})
            .filter((n) => n.level === 2)
            .map((n) => {
                const hasChildren = dataStore.hierarchyMapping?.['研究方法']?.l1_to_l2?.[n.displayName]?.length > 0;
                
                // 使用去重后的论文数量
                const paperCount = getNodePaperCount(n.displayName);
                
                return {
                    id: n.displayName,
                    name: n.displayName,
                    column: 1,
                    color: n.color || '#97a7aa',
                    value: paperCount || 1, // 至少为1，确保节点可见
                    level: 'L1',
                    hasChildren,
                };
            });
        nodes.push(...methodNodes);
        console.log(`研究方法 L1 节点数量: ${methodNodes.length}`);

    } else if (state.columnLevels[1] === 'L2' && state.expandedNodes[1].length > 0) {
        // 方法 L2 节点
        state.expandedNodes[1].forEach(parentId => {
            console.log(`处理方法父节点: ${parentId}`);
            const children = dataStore.hierarchyMapping?.['研究方法']?.l1_to_l2?.[parentId] ?? [];
            console.log(`找到方法子节点:`, children);

            children.forEach(childId => {
                const allMethodMeta = dataStore.nodeMetadata?.['研究方法'] ?? {};
                const childMeta = allMethodMeta[childId];

                console.log(`方法子节点 ${childId} 的元数据:`, childMeta);
                if (childMeta) {
                    const hasChildren = dataStore.hierarchyMapping?.['研究方法']?.l2_to_l3?.[childId]?.length > 0;
                    const nodeId = childMeta.displayName;
                    
                    // 使用去重后的论文数量
                    const paperCount = getNodePaperCount(nodeId);
                    
                    const newNode = {
                        id: nodeId,
                        name: nodeId,
                        column: 1,
                        color: childMeta.color || '#97a7aa',
                        value: paperCount || 1, // 至少为1，确保节点可见
                        level: 'L2',
                        parentId,
                        hasChildren,
                        originalId: childId,
                    };
                    console.log(`添加L2方法子节点:`, newNode);
                    nodes.push(newNode);
                } else {
                    console.warn(`❌ 找不到方法子节点 ${childId} 的元数据`);
                }
            });
        });
        console.log(`研究方法 L2 节点数量: ${nodes.filter(n => n.column === 1).length}`);

    } else if (state.columnLevels[1] === 'L3' && state.expandedNodes[1].length > 0) {
        // 方法 L3 节点
        console.log('=== 生成研究方法 L3 节点 ===');
        console.log('展开的L2方法节点:', state.expandedNodes[1]);
        
        state.expandedNodes[1].forEach(expandedL2NodeId => {
            console.log(`\n--- 处理展开的L2方法节点: ${expandedL2NodeId} ---`);
            
            // 查找L3子节点
            let l3Children = dataStore.hierarchyMapping?.['研究方法']?.l2_to_l3?.[expandedL2NodeId] ?? [];
            console.log(`直接查找 L2→L3 方法映射结果:`, l3Children);
            
            if (l3Children.length === 0) {
                console.log(`❌ 直接查找失败，尝试模糊匹配...`);
                
                // 尝试通过完整的层次化ID查找
                const allL2ToL3Mapping = dataStore.hierarchyMapping?.['研究方法']?.l2_to_l3 ?? {};
                console.log('所有L2→L3方法映射键:', Object.keys(allL2ToL3Mapping));
                
                // 查找匹配的完整键
                let matchedKey = null;
                for (const fullKey of Object.keys(allL2ToL3Mapping)) {
                    // 检查是否以展开的节点ID结尾或包含该ID
                    if (fullKey.endsWith('-' + expandedL2NodeId) || fullKey.includes(expandedL2NodeId)) {
                        matchedKey = fullKey;
                        console.log(`找到匹配的完整键: ${fullKey}`);
                        break;
                    }
                }
                
                if (matchedKey) {
                    l3Children = allL2ToL3Mapping[matchedKey];
                    console.log(`通过匹配键 ${matchedKey} 找到L3方法子节点:`, l3Children);
                    
                    l3Children.forEach(l3ChildId => {
                        console.log(`创建L3方法节点: ${l3ChildId}`);
                        
                        // 使用去重后的论文数量
                        const paperCount = getNodePaperCount(l3ChildId);
                        
                        const newNode = {
                            id: l3ChildId,
                            name: l3ChildId,
                            column: 1,
                            color: '#97a7aa',
                            value: paperCount || 1, // 至少为1，确保节点可见
                            level: 'L3',
                            parentId: expandedL2NodeId,
                            hasChildren: false,
                            originalL2Parent: matchedKey,
                            contentCategory: '研究方法', // 添加明确的类别标记
                        };
                        console.log(`✅ 添加L3方法节点:`, newNode);
                        nodes.push(newNode);
                    });
                } else {
                    console.log(`❌ 未找到匹配的L2方法节点键`);
                }
            } else {
                // 直接查找成功的情况
                console.log(`✅ 直接查找成功，L3方法子节点:`, l3Children);
                
                l3Children.forEach(l3ChildId => {
                    console.log(`创建L3方法节点: ${l3ChildId}`);
                    
                    // 使用去重后的论文数量
                    const paperCount = getNodePaperCount(l3ChildId);
                    
                    const newNode = {
                        id: l3ChildId,
                        name: l3ChildId,
                        column: 1,
                        color: '#97a7aa',
                        value: paperCount || 1, // 至少为1，确保节点可见
                        level: 'L3',
                        parentId: expandedL2NodeId,
                        hasChildren: false,
                        originalL2Parent: expandedL2NodeId,
                        contentCategory: '研究方法', // 添加明确的类别标记
                    };
                    console.log(`✅ 添加L3方法节点:`, newNode);
                    nodes.push(newNode);
                });
            }
        });
        
        const l3MethodNodes = nodes.filter(n => n.column === 1 && n.level === 'L3');
        console.log(`\n=== L3方法节点创建完成 ===`);
        console.log(`最终生成的L3方法节点数量: ${l3MethodNodes.length}`);
        console.log(`L3方法节点ID列表:`, l3MethodNodes.map(n => n.id));
    }

    return nodes;
}