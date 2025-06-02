import { useVisualizationStore } from '../../visualizationStore'; // 💡 调整正确的路径
function getHashFallback(id: string, defaultColor: string): string {
    if (!id) return defaultColor;
    const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'];
    let hash = 0;
    for (let i = 0; i < String(id).length; i++) {
        hash = String(id).charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}
import { buildConnections } from '../connectionBuilders/connectionBuilder';

export function buildMethodNodes(dataStore: any, state: any): any[] {
    const nodes: any[] = [];
    const vizStore = useVisualizationStore(); // 💡 获取 visualizationStore 实例
    
    // 计算每个节点的论文数量(去重)
    const nodePaperIds: Record<string, Set<string>> = {};
    
    // 处理所有连接类型
    const connectionsByType = dataStore.crossLevelConnections?.connections ?? {};
    
    // 辅助函数：获取节点的论文数量（只统计完整标题）
    function getNodePaperCountStrict(nodeId: string): number {
        let paperIds = new Set<string>();
        Object.entries(connectionsByType).forEach(([connectionType, connections]: [string, any]) => {
            if (connectionType.includes('研究方法')) {
                Object.entries(connections).forEach(([connectionKey, connectionInfo]: [string, any]) => {
                    const parts = connectionKey.split('__');
                    if (parts.length === 2) {
                        const [source, target] = parts;
                        // 只统计source或target完整等于nodeId的连接
                        if (source === nodeId || target === nodeId) {
                            (connectionInfo.paperIds || []).forEach((pid: string) => paperIds.add(pid));
                        }
                    }
                });
            }
        });
        return paperIds.size;
    }
    
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
      if (column === 1) {
        // 方法列，判断是否作为source或target出现在links中
        return currentLinks.some(l => l.source === nodeId || l.target === nodeId);
      }
      return true;
    };

    if (state.columnLevels[1] === 'L1') {
        // 方法 L1 节点
        const methodNodes = Object.values<any>(dataStore.nodeMetadata?.['研究方法'] ?? {})
            .filter((n) => n.level === 2)
            .map((n) => {
                const hasChildren = dataStore.hierarchyMapping?.['研究方法']?.l1_to_l2?.[n.displayName]?.length > 0;
            
                let color = n.color || '#dc6866';
                const pieItem = vizStore.researchMethodPieDataSource.find(p => p.id === n.displayName || p.name === n.displayName);
                if (pieItem && pieItem.itemStyle?.color) {
                    color = pieItem.itemStyle.color;
                } else {
                    // 备用逻辑：如果扇形图当前未显示此节点，或扇形图本身对此节点使用了备用色
                    // 1. 再次检查节点自身元数据中的颜色
                    if (n.color && n.color !== '#PLACEHOLDER') {
                        color = n.color;
                    } else {
                        // 2. 尝试获取父级（即“研究方法”根节点）在元数据中的颜色
                        const rootMethodNodeMeta = dataStore.nodeMetadata?.['研究方法']?.['研究方法'];
                        if (rootMethodNodeMeta?.color && rootMethodNodeMeta.color !== '#PLACEHOLDER') {
                            color = rootMethodNodeMeta.color;
                        } else {
                           // 3. 最后使用哈希颜色或硬编码默认色
                           color = getHashFallback(n.displayName, '#dc6866');
                        }
                    }
                }
                // 使用去重后的论文数量
                const paperCount = getNodePaperCountStrict(n.displayName);
                
                return {
                    id: n.displayName,
                    name: n.displayName,
                    column: 1,
                    color: color,
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
                    let color = childMeta.color || '#dc6866'; //

                    // 💡 尝试从扇形图数据获取颜色
                    //    此时扇形图应已下钻到 parentId，其 dataSource 包含这些二级节点
                    const pieItem = vizStore.researchMethodPieDataSource.find(p => p.id === nodeId || p.name === nodeId);
                    if (pieItem && pieItem.itemStyle?.color) {
                        color = pieItem.itemStyle.color;
                    } else {
                        // 备用逻辑 (L2节点)
                        if (childMeta.color && childMeta.color !== '#PLACEHOLDER') {
                            color = childMeta.color;
                        } else {
                            // 尝试父级 L1 节点的元数据颜色
                            // parentId 就是 L1 节点的 displayName/ID
                            const parentL1Meta = allMethodMeta[parentId]; // 假设 parentId 可以在 allMethodMeta 中直接找到 L1 元数据
                            if (parentL1Meta?.color && parentL1Meta.color !== '#PLACEHOLDER') {
                                color = parentL1Meta.color;
                            } else {
                                color = getHashFallback(nodeId, '#dc6866');
                            }
                        }
                    }
                    // 使用去重后的论文数量
                    const paperCount = getNodePaperCountStrict(nodeId);
                    
                    // 新增：只push有连接的节点
                    if (!nodeHasLink(nodeId, 1)) return;
                    const newNode = {
                        id: nodeId,
                        name: nodeId,
                        column: 1,
                        color: color,
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
                        
                        // 使用严格匹配后的论文数量
                        const paperCount = getNodePaperCountStrict(l3ChildId);
                        
                        // 新增：只push有连接的节点
                        if (!nodeHasLink(l3ChildId, 1)) return;
                        const newNode = {
                            id: l3ChildId,
                            name: l3ChildId,
                            column: 1,
                            color: '#6cbd7b',
                            value: paperCount || 1, // 至少为1，确保节点可见
                            level: 'L3',
                            parentId: expandedL2NodeId,
                            hasChildren: false,
                            originalL2Parent: matchedKey,
                            methodCategory: '研究方法', // 添加明确的类别标记
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
                    
                    // 使用严格匹配后的论文数量
                    const paperCount = getNodePaperCountStrict(l3ChildId);
                    
                    // 新增：只push有连接的节点
                    if (!nodeHasLink(l3ChildId, 1)) return;
                    const newNode = {
                        id: l3ChildId,
                        name: l3ChildId,
                        column: 1,
                        color: '#6cbd7b',
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