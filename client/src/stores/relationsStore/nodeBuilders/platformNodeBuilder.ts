import { buildConnections } from '../connectionBuilders/connectionBuilder';

export function buildPlatformNodes(dataStore: any, state: any): any[] {
    const nodes: any[] = [];
    
    // 计算每个节点的论文数量(去重)
    const nodePaperIds: Record<string, Set<string>> = {};
    
    // 辅助函数：获取节点的论文数量
    function getNodePaperCount(nodeId: string): number {
        return nodePaperIds[nodeId]?.size || 0;
    }
    
    // 处理所有连接类型
    const connectionsByType = dataStore.crossLevelConnections?.connections ?? {};
    
    // 收集所有相关的论文ID
    Object.entries(connectionsByType).forEach(([connectionType, connections]: [string, any]) => {
        // 只处理与平台相关的连接
        if (connectionType.includes('研究涉及平台')) {
            Object.entries(connections).forEach(([connectionKey, connectionInfo]: [string, any]) => {
                const [source, target] = connectionKey.split('__');
                // 平台节点始终是source
                const platformNode = source;
                
                // 初始化集合
                if (!nodePaperIds[platformNode]) nodePaperIds[platformNode] = new Set();
                
                // 添加论文ID
                const paperIds = connectionInfo.paperIds || [];
                paperIds.forEach((paperId: string) => {
                    nodePaperIds[platformNode].add(paperId);
                });
            });
        }
    });
    
    // 新增：获取当前所有links（buildConnections的结果）
    let currentLinks = [];
    try {
      currentLinks = buildConnections(dataStore, state, nodes);
    } catch (e) {
      // ignore for SSR or circular
    }
    // 辅助函数：判断节点是否有连接
    const nodeHasLink = (nodeId: string, column: number) => {
      if (!currentLinks.length) return true; // fallback: 全部显示
      if (column === 0) {
        // 平台列，判断是否作为source或target出现在links中
        return currentLinks.some(l => l.source === nodeId || l.target === nodeId);
      }
      return true;
    };

    if (state.columnLevels[0] === 'L1') {
        // 平台L1节点
        const platformL1Raw = dataStore.getPlatformL1Nodes(state.currentPlatformType) ?? [];
        const platformNodes = platformL1Raw.map((n: any) => {
            const id = typeof n === 'string' ? n : n.id;
            const name = typeof n === 'string' ? n : n.name ?? n.id;
            const color = typeof n === 'string' ? '#6ca0dc' : n.color ?? '#6ca0dc';
            
            // 使用去重后的论文数量
            const paperCount = getNodePaperCount(id);
            
            return {
                id,
                name,
                column: 0,
                color,
                value: paperCount || 1, // 至少为1，确保节点可见
                level: 'L1',
                hasChildren: true,
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
                // 使用去重后的论文数量
                const paperCount = getNodePaperCount(childId);
                // 新增：只push有连接的节点
                if (!nodeHasLink(childId, 0)) return;
                const newNode = {
                    id: childId,
                    name: childId,
                    column: 0,
                    color: '#6ca0dc',
                    value: paperCount || 1, // 至少为1，确保节点可见
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