export function buildPlatformNodes(dataStore: any, state: any): any[] {
    const nodes: any[] = [];

    if (state.columnLevels[0] === 'L1') {
        // 生成平台 L1 节点
        const platformL1Raw = dataStore.getPlatformL1Nodes(state.currentPlatformType) ?? [];
        const platformNodes = platformL1Raw.map((n: any) => {
            const id = typeof n === 'string' ? n : n.id;
            const name = typeof n === 'string' ? n : n.name ?? n.id;
            const color = typeof n === 'string' ? '#6ca0dc' : n.color ?? '#6ca0dc';
            
            // 检查是否有L2子节点
            const platformConfig = dataStore.platformConfiguration?.platformTypes?.[state.currentPlatformType];
            const hasChildren = platformConfig?.hierarchy?.l2?.[id]?.length > 0;
            
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
        
        state.expandedNodes[0].forEach(parentId => {
            console.log(`处理展开的平台L1节点: ${parentId}`);
            
            const platformConfig = dataStore.platformConfiguration?.platformTypes?.[state.currentPlatformType];
            const l2Children = platformConfig?.hierarchy?.l2?.[parentId] ?? [];
            console.log(`L1平台 ${parentId} 的L2子节点:`, l2Children);

            l2Children.forEach(childId => {
                const newNode = {
                    id: childId,
                    name: childId,
                    column: 0,
                    color: '#6ca0dc',
                    value: 1,
                    level: 'L2',
                    parentId,
                    hasChildren: false, // 平台最多到L2
                };
                console.log(`添加平台L2子节点:`, newNode);
                nodes.push(newNode);
            });
        });
        
        console.log(`平台 L2 节点数量: ${nodes.filter(n => n.column === 0).length}`);
    }
    // 注意：平台没有L3层级，所以不需要处理L3的情况

    return nodes;
}