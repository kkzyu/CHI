export function buildContentNodes(dataStore: any, state: any): any[] {
    const nodes: any[] = [];
    
    // 计算每个节点的论文数量(去重)
    const nodePaperIds: Record<string, Set<string>> = {};
    
    // 处理所有连接类型
    const connectionsByType = dataStore.crossLevelConnections?.connections ?? {};
    
    // 收集所有相关的论文ID
    Object.entries(connectionsByType).forEach(([connectionType, connections]: [string, any]) => {
        // 只处理与研究内容相关的连接
        if (connectionType.includes('研究内容')) {
            Object.entries(connections).forEach(([connectionKey, connectionInfo]: [string, any]) => {
                const [source, target] = connectionKey.split('__');
                // 确定哪个是研究内容节点
                const contentNode = connectionType.startsWith('研究内容') ? source : target;
                
                // 初始化集合
                if (!nodePaperIds[contentNode]) nodePaperIds[contentNode] = new Set();
                
                // 添加论文ID
                const paperIds = connectionInfo.paperIds || [];
                paperIds.forEach((paperId: string) => {
                    nodePaperIds[contentNode].add(paperId);
                });
            });
        }
    });
    
    // 辅助函数：获取节点的论文数量
    const getNodePaperCount = (nodeId: string): number => {
        return nodePaperIds[nodeId]?.size || 0;
    };

    if (state.columnLevels[2] === 'L1') {
        const contentNodes = Object.values<any>(dataStore.nodeMetadata?.['研究内容'] ?? {})
            .filter((n) => n.level === 2)
            .map((n) => {
                const hasChildren = dataStore.hierarchyMapping?.['研究内容']?.l1_to_l2?.[n.displayName]?.length > 0;
                
                // 使用去重后的论文数量
                const paperCount = getNodePaperCount(n.displayName);
                
                return {
                    id: n.displayName,
                    name: n.displayName,
                    column: 2,
                    color: n.color || '#dc6866',
                    value: paperCount || 1, // 至少为1，确保节点可见
                    level: 'L1',
                    hasChildren,
                };
            });
        nodes.push(...contentNodes);
        console.log(`研究内容 L1 节点数量: ${contentNodes.length}`);
    } else if (state.columnLevels[2] === 'L2' && state.expandedNodes[2].length > 0) {
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
                    
                    // 使用去重后的论文数量
                    const paperCount = getNodePaperCount(nodeId);
                    
                    const newNode = {
                        id: nodeId,
                        name: nodeId,
                        column: 2,
                        color: childMeta.color || '#dc6866',
                        value: paperCount || 1, // 至少为1，确保节点可见
                        level: 'L2',
                        parentId,
                        hasChildren,
                        originalId: childId,
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
        // 🔥 关键修复：L3内容节点生成
        console.log('=== 生成研究内容 L3 节点 ===');
        console.log('展开的L2节点:', state.expandedNodes[2]);
        
        state.expandedNodes[2].forEach(expandedL2NodeId => {
            console.log(`\n--- 处理展开的L2节点: ${expandedL2NodeId} ---`);
            
            // 🔥 关键修复：查找L3子节点的逻辑
            let l3Children = dataStore.hierarchyMapping?.['研究内容']?.l2_to_l3?.[expandedL2NodeId] ?? [];
            console.log(`直接查找 L2→L3 映射结果:`, l3Children);
            
            if (l3Children.length === 0) {
                console.log(`❌ 直接查找失败，尝试模糊匹配...`);
                
                // 尝试通过完整的层次化ID查找
                const allL2ToL3Mapping = dataStore.hierarchyMapping?.['研究内容']?.l2_to_l3 ?? {};
                console.log('所有L2→L3映射键:', Object.keys(allL2ToL3Mapping));
                
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
                    console.log(`通过匹配键 ${matchedKey} 找到L3子节点:`, l3Children);
                    
                    // 🔥 重要：记录匹配的完整键，供后续使用
                    l3Children.forEach(l3ChildId => {
                        console.log(`创建L3节点: ${l3ChildId}`);
                        
                        // 使用去重后的论文数量
                        const paperCount = getNodePaperCount(l3ChildId);
                        
                        // 🔥 关键修复：确保column属性始终为2（研究内容列）
                        const newNode = {
                            id: l3ChildId,
                            name: l3ChildId,
                            column: 2, // 强制设置为内容列
                            color: '#dc6866',
                            value: paperCount || 1, // 至少为1，确保节点可见
                            level: 'L3',
                            parentId: expandedL2NodeId,
                            hasChildren: false,
                            originalL2Parent: matchedKey, // 记录原始的L2父节点完整ID
                            contentCategory: '研究内容', // 添加明确的类别标记
                        };
                        console.log(`✅ 添加L3节点:`, newNode);
                        nodes.push(newNode);
                    });
                } else {
                    console.log(`❌ 未找到匹配的L2节点键`);
                }
            } else {
                // 直接查找成功的情况
                console.log(`✅ 直接查找成功，L3子节点:`, l3Children);
                
                l3Children.forEach(l3ChildId => {
                    console.log(`创建L3节点: ${l3ChildId}`);
                    
                    // 使用去重后的论文数量
                    const paperCount = getNodePaperCount(l3ChildId);
                    
                    // 🔥 关键修复：确保column属性始终为2（研究内容列）
                    const newNode = {
                        id: l3ChildId,
                        name: l3ChildId,
                        column: 2, // 强制设置为内容列
                        color: '#dc6866',
                        value: paperCount || 1, // 至少为1，确保节点可见
                        level: 'L3',
                        parentId: expandedL2NodeId,
                        hasChildren: false,
                        originalL2Parent: expandedL2NodeId, // 直接使用展开的L2节点ID
                        contentCategory: '研究内容', // 添加明确的类别标记
                    };
                    console.log(`✅ 添加L3节点:`, newNode);
                    nodes.push(newNode);
                });
            }
        });
        
        const l3ContentNodes = nodes.filter(n => n.column === 2 && n.level === 'L3');
        console.log(`\n=== L3内容节点创建完成 ===`);
        console.log(`最终生成的L3内容节点数量: ${l3ContentNodes.length}`);
        console.log(`L3内容节点ID列表:`, l3ContentNodes.map(n => n.id));
    }

    return nodes;
}