export function expandNode(dataStore: any, state: any, visibleNodes: any, colIdx: 0 | 1 | 2, nodeId: string) {
    console.log('=== expandNode 被调用 ===');
    console.log('参数:', { colIdx, nodeId });
    console.log('调用前 columnLevels:', [...state.columnLevels]);
    console.log('调用前 expandedNodes:', JSON.parse(JSON.stringify(state.expandedNodes)));

    const maxLevel = colIdx === 0 ? 'L2' : 'L3';
    if (state.columnLevels[colIdx] === maxLevel) {
        console.log(`已经是${maxLevel}，无法继续展开`);
        return;
    }

    // 检查节点是否有子节点
    const currentLevel = state.columnLevels[colIdx];
    let hasChildren = false;

    if (currentLevel === 'L1') {
        if (colIdx === 0) {
            // 平台节点展开
            const platformConfig = dataStore.platformConfiguration?.platformTypes?.[state.currentPlatformType];
            const l2Children = platformConfig?.hierarchy?.l2?.[nodeId] ?? [];
            hasChildren = l2Children.length > 0;
            console.log(`平台节点 ${nodeId} 的L2子节点:`, l2Children);
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
            // 🔥 关键修复：研究方法或研究内容 L2 → L3
            const categoryMap = colIdx === 1 ? '研究方法' : '研究内容';
            
            console.log(`查找 ${categoryMap} L2节点 ${nodeId} 的L3子节点...`);
            
            // 首先尝试直接查找
            let l3Children = dataStore.hierarchyMapping?.[categoryMap]?.l2_to_l3?.[nodeId] ?? [];
            console.log(`直接查找结果:`, l3Children);
            
            // 如果直接查找失败，通过当前显示的L2节点找到完整ID
            if (l3Children.length === 0) {
                console.log('直接查找失败，通过当前节点信息查找...');
                
                const currentL2Nodes = visibleNodes.value.filter(n => n.column === colIdx && n.level === 'L2');
                const targetNode = currentL2Nodes.find(n => n.id === nodeId || n.name === nodeId);
                
                if (targetNode && targetNode.originalId) {
                    // 使用节点的originalId
                    l3Children = dataStore.hierarchyMapping?.[categoryMap]?.l2_to_l3?.[targetNode.originalId] ?? [];
                    console.log(`通过originalId ${targetNode.originalId} 找到L3子节点:`, l3Children);
                } else {
                    // 通过模糊匹配查找
                    const allL2ToL3Mapping = dataStore.hierarchyMapping?.[categoryMap]?.l2_to_l3 ?? {};
                    let matchedKey = null;
                    
                    for (const fullKey of Object.keys(allL2ToL3Mapping)) {
                        if (fullKey.endsWith('-' + nodeId) || fullKey.includes(nodeId)) {
                            matchedKey = fullKey;
                            break;
                        }
                    }
                    
                    if (matchedKey) {
                        l3Children = allL2ToL3Mapping[matchedKey];
                        console.log(`通过模糊匹配 ${matchedKey} 找到L3子节点:`, l3Children);
                    }
                }
            }
            
            hasChildren = l3Children.length > 0;
            console.log(`${categoryMap} L2节点 ${nodeId} 最终的L3子节点数量: ${l3Children.length}`);
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
        // L2→L3：记录能够找到L3子节点的L2节点ID
        const currentL2Nodes = visibleNodes.value.filter(n => n.column === colIdx && n.level === 'L2');
        const targetNode = currentL2Nodes.find(n => n.id === nodeId || n.name === nodeId);
        
        let nodeIdToRecord = nodeId;
        
        // 🔥 关键修复：确定记录哪个ID
        if (targetNode && targetNode.originalId) {
            // 使用originalId，这是完整的层次化ID
            nodeIdToRecord = targetNode.originalId;
        } else {
            // 尝试找到完整的L2 ID
            const categoryMap = colIdx === 1 ? '研究方法' : '研究内容';
            const allL2ToL3Mapping = dataStore.hierarchyMapping?.[categoryMap]?.l2_to_l3 ?? {};
            
            for (const fullKey of Object.keys(allL2ToL3Mapping)) {
                if (fullKey.endsWith('-' + nodeId) || fullKey.includes(nodeId)) {
                    nodeIdToRecord = fullKey;
                    break;
                }
            }
        }
        
        state.expandedNodes[colIdx] = [nodeIdToRecord];
        console.log(`记录展开的L2节点ID: ${nodeIdToRecord}`);
    }

    console.log('调用后 columnLevels:', [...state.columnLevels]);
    console.log('调用后 expandedNodes:', JSON.parse(JSON.stringify(state.expandedNodes)));
    console.log('=== expandNode 完成 ===');
}

export function collapseNode(dataStore: any, state: any, colIdx: 0 | 1 | 2, nodeId?: string) {
    console.log('=== collapseNode 被调用 ===');
    console.log('参数:', { colIdx, nodeId });
    console.log('调用前 columnLevels:', [...state.columnLevels]);
    console.log('调用前 expandedNodes:', JSON.parse(JSON.stringify(state.expandedNodes)));

    if (nodeId) {
        // 折叠特定节点
        state.expandedNodes[colIdx] = state.expandedNodes[colIdx].filter(id => id !== nodeId);
        
        // 如果没有展开的节点了，回退到上一级
        if (state.expandedNodes[colIdx].length === 0) {
            state.columnLevels[colIdx] = state.columnLevels[colIdx] === 'L3' ? 'L2' : 'L1';
        }
    } else {
        // 折叠整列
        state.columnLevels[colIdx] = state.columnLevels[colIdx] === 'L3' ? 'L2'
            : state.columnLevels[colIdx] === 'L2' ? 'L1' : 'L1';
        state.expandedNodes[colIdx] = [];
    }

    console.log('调用后 columnLevels:', [...state.columnLevels]);
    console.log('调用后 expandedNodes:', JSON.parse(JSON.stringify(state.expandedNodes)));
    console.log('=== collapseNode 完成 ===');
}