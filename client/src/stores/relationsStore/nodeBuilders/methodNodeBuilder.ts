export function buildMethodNodes(dataStore: any, state: any): any[] {
    const nodes: any[] = [];

    if (state.columnLevels[1] === 'L1') {
        // 生成研究方法 L1 节点
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
        nodes.push(...methodNodes);
        console.log(`研究方法 L1 节点数量: ${methodNodes.length}`);
        
    } else if (state.columnLevels[1] === 'L2' && state.expandedNodes[1].length > 0) {
        // 生成研究方法 L2 节点
        console.log('=== 生成研究方法 L2 节点 ===');
        
        state.expandedNodes[1].forEach(parentId => {
            console.log(`处理展开的方法L1节点: ${parentId}`);
            
            const children = dataStore.hierarchyMapping?.['研究方法']?.l1_to_l2?.[parentId] ?? [];
            console.log(`L1方法 ${parentId} 的L2子节点:`, children);

            children.forEach(childId => {
                const allMethodMeta = dataStore.nodeMetadata?.['研究方法'] ?? {};
                const childMeta = allMethodMeta[childId];

                if (childMeta) {
                    const hasChildren = dataStore.hierarchyMapping?.['研究方法']?.l2_to_l3?.[childId]?.length > 0;
                    const nodeId = childMeta.displayName;
                    const newNode = {
                        id: nodeId,
                        name: nodeId,
                        column: 1,
                        color: childMeta.color || '#97a7aa',
                        value: childMeta.totalPapers || 1,
                        level: 'L2',
                        parentId,
                        hasChildren,
                        originalId: childId,
                    };
                    console.log(`添加方法L2子节点:`, newNode);
                    nodes.push(newNode);
                } else {
                    console.warn(`❌ 找不到方法子节点 ${childId} 的元数据`);
                }
            });
        });
        
        console.log(`研究方法 L2 节点数量: ${nodes.filter(n => n.column === 1).length}`);
        
    } else if (state.columnLevels[1] === 'L3' && state.expandedNodes[1].length > 0) {
        // 生成研究方法 L3 节点
        console.log('=== 生成研究方法 L3 节点 ===');
        console.log('展开的方法L2节点:', state.expandedNodes[1]);
        
        state.expandedNodes[1].forEach(expandedL2NodeId => {
            console.log(`\n--- 处理展开的方法L2节点: ${expandedL2NodeId} ---`);
            
            // 查找L3子节点
            let l3Children = dataStore.hierarchyMapping?.['研究方法']?.l2_to_l3?.[expandedL2NodeId] ?? [];
            console.log(`直接查找 L2→L3 映射结果:`, l3Children);
            
            if (l3Children.length === 0) {
                console.log(`❌ 直接查找失败，尝试模糊匹配...`);
                
                // 尝试通过完整的层次化ID查找
                const allL2ToL3Mapping = dataStore.hierarchyMapping?.['研究方法']?.l2_to_l3 ?? {};
                console.log('所有方法L2→L3映射键:', Object.keys(allL2ToL3Mapping));
                
                // 查找匹配的完整键
                let matchedKey = null;
                for (const fullKey of Object.keys(allL2ToL3Mapping)) {
                    if (fullKey.endsWith('-' + expandedL2NodeId) || fullKey.includes(expandedL2NodeId)) {
                        matchedKey = fullKey;
                        console.log(`找到匹配的完整键: ${fullKey}`);
                        break;
                    }
                }
                
                if (matchedKey) {
                    l3Children = allL2ToL3Mapping[matchedKey];
                    console.log(`通过匹配键 ${matchedKey} 找到L3子节点:`, l3Children);
                    
                    l3Children.forEach(l3ChildId => {
                        console.log(`创建方法L3节点: ${l3ChildId}`);
                        
                        const newNode = {
                            id: l3ChildId,
                            name: l3ChildId,
                            column: 1,
                            color: '#97a7aa',
                            value: 1,
                            level: 'L3',
                            parentId: expandedL2NodeId,
                            hasChildren: false,
                            originalL2Parent: matchedKey,
                        };
                        console.log(`✅ 添加方法L3节点:`, newNode);
                        nodes.push(newNode);
                    });
                } else {
                    console.log(`❌ 未找到匹配的方法L2节点键`);
                }
            } else {
                // 直接查找成功的情况
                console.log(`✅ 直接查找成功，方法L3子节点:`, l3Children);
                
                l3Children.forEach(l3ChildId => {
                    console.log(`创建方法L3节点: ${l3ChildId}`);
                    
                    const newNode = {
                        id: l3ChildId,
                        name: l3ChildId,
                        column: 1,
                        color: '#97a7aa',
                        value: 1,
                        level: 'L3',
                        parentId: expandedL2NodeId,
                        hasChildren: false,
                        originalL2Parent: expandedL2NodeId,
                    };
                    console.log(`✅ 添加方法L3节点:`, newNode);
                    nodes.push(newNode);
                });
            }
        });
        
        const l3MethodNodes = nodes.filter(n => n.column === 1 && n.level === 'L3');
        console.log(`\n=== 方法L3节点创建完成 ===`);
        console.log(`最终生成的方法L3节点数量: ${l3MethodNodes.length}`);
        console.log(`方法L3节点ID列表:`, l3MethodNodes.map(n => n.id));
    }

    return nodes;
}