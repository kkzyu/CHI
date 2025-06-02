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

export function buildContentNodes(dataStore: any, state: any): any[] {
    const nodes: any[] = [];
    const vizStore = useVisualizationStore(); // 💡 获取 visualizationStore 实例

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
                let color = n.color || '#dc6866';
                const pieItem = vizStore.researchContentPieDataSource.find(p => p.id === n.displayName || p.name === n.displayName);
                if (pieItem && pieItem.itemStyle?.color) {
                    color = pieItem.itemStyle.color;
                } else {
                    // 备用逻辑：如果扇形图当前未显示此节点，或扇形图本身对此节点使用了备用色
                    // 1. 再次检查节点自身元数据中的颜色
                    if (n.color && n.color !== '#PLACEHOLDER') {
                        color = n.color;
                    } else {
                        // 2. 尝试获取父级（即“研究内容”根节点）在元数据中的颜色
                        const rootContentNodeMeta = dataStore.nodeMetadata?.['研究内容']?.['研究内容'];
                        if (rootContentNodeMeta?.color && rootContentNodeMeta.color !== '#PLACEHOLDER') {
                            color = rootContentNodeMeta.color;
                        } else {
                           // 3. 最后使用哈希颜色或硬编码默认色
                           color = getHashFallback(n.displayName, '#dc6866');
                        }
                    }
                }
                // 使用去重后的论文数量
                const paperCount = getNodePaperCount(n.displayName);
                
                return {
                    id: n.displayName,
                    name: n.displayName,
                    column: 2,
                    color: color,
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
                    let color = childMeta.color || '#dc6866'; //

                    // 💡 尝试从扇形图数据获取颜色
                    //    此时扇形图应已下钻到 parentId，其 dataSource 包含这些二级节点
                    const pieItem = vizStore.researchContentPieDataSource.find(p => p.id === nodeId || p.name === nodeId);
                    if (pieItem && pieItem.itemStyle?.color) {
                        color = pieItem.itemStyle.color;
                    } else {
                        // 备用逻辑 (L2节点)
                        if (childMeta.color && childMeta.color !== '#PLACEHOLDER') {
                            color = childMeta.color;
                        } else {
                            // 尝试父级 L1 节点的元数据颜色
                            // parentId 就是 L1 节点的 displayName/ID
                            const parentL1Meta = allContentMeta[parentId]; // 假设 parentId 可以在 allContentMeta 中直接找到 L1 元数据
                            if (parentL1Meta?.color && parentL1Meta.color !== '#PLACEHOLDER') {
                                color = parentL1Meta.color;
                            } else {
                                color = getHashFallback(nodeId, '#dc6866');
                            }
                        }
                    }
                    // 使用去重后的论文数量
                    const paperCount = getNodePaperCount(nodeId);
                    
                    const newNode = {
                        id: nodeId,
                        name: nodeId,
                        column: 2,
                        color: color ,
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
                        const allContentMeta = dataStore.nodeMetadata?.['研究内容'] ?? {};
                        console.log(`创建L3节点: ${l3ChildId}`);
                        
                        let parentColor = '#dc6866';
                        // expandedL2NodeId 是当前 L2 父节点的 id
                        const l2ParentMeta = allContentMeta[expandedL2NodeId];
                        // if (l2ParentMeta?.color && l2ParentMeta.color !== '#PLACEHOLDER') {
                        //     parentColor = l2ParentMeta.color;
                        // }
                        // 也可以尝试从 PieChart 数据源获取
                        const pieItem = vizStore.researchContentPieDataSource.find(
                            p => p.id === expandedL2NodeId || p.name === expandedL2NodeId
                        );
                        

                        
                        // 使用去重后的论文数量
                        const paperCount = getNodePaperCount(l3ChildId);
                        
                        // 🔥 关键修复：确保column属性始终为2（研究内容列）
                        if (pieItem && pieItem.itemStyle?.color) {
                            parentColor = pieItem.itemStyle.color;
                        } else if (l2ParentMeta?.color && l2ParentMeta.color !== '#PLACEHOLDER') {
                            parentColor = l2ParentMeta.color;
                        }
                        const newNode = {
                            id: l3ChildId,
                            name: l3ChildId,
                            column: 2,
                            color: parentColor,
                            value: paperCount || 1,
                            level: 'L3',
                            parentId: expandedL2NodeId,
                            hasChildren: false,
                            originalL2Parent: matchedKey,
                            contentCategory: '研究内容',
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
                    const allContentMeta = dataStore.nodeMetadata?.['研究内容'] ?? {}; // 获取所有研究内容的元数据
                    let parentColor = '#dc6866'; // 默认颜色
                    const pieItem = vizStore.researchContentPieDataSource.find(
                        p => p.id === expandedL2NodeId || p.name === expandedL2NodeId
                    );
                    if (pieItem && pieItem.itemStyle?.color) {
                            parentColor = pieItem.itemStyle.color;
                        } else {
                            // 如果饼图没有颜色，尝试回退到L2父节点的元数据颜色
                            // 这里需要一种可靠的方式来获取l2ParentMeta
                            // 假设我们能够正确获取 l2ParentMeta:
                            // const l2ParentMeta = /* 正确获取L2父节点的元数据 */;
                            // if (l2ParentMeta?.color && l2ParentMeta.color !== '#PLACEHOLDER') {
                            //    parentColor = l2ParentMeta.color;
                            // } else {
                            //    // 如果L2元数据也没有颜色，可以考虑L1父级的颜色或哈希颜色
                            //    parentColor = getHashFallback(expandedL2NodeId, '#dc6866'); // 使用L2节点的ID生成哈希色作为最终备用
                            // }
                            // 在您提供的代码中，如果pieItem没有颜色，会尝试l2ParentMeta，如果还没有，则parentColor维持默认。
                            // 您的代码实际逻辑更接近下面这样:
                            const l2ParentMetaAttempt = allContentMeta[expandedL2NodeId]; // 再次尝试，但此查找可能仍有问题
                            if (l2ParentMetaAttempt?.color && l2ParentMetaAttempt.color !== '#PLACEHOLDER') {
                                parentColor = l2ParentMetaAttempt.color;
                            } else {
                                // 如果 pieItem 和 l2ParentMetaAttempt 都没有提供有效颜色，parentColor 会是初始的 '#dc6866'
                            }
                        }

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