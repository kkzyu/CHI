export function buildL1Snapshot(dataStore: any, state: any) {
    // ---------- ① 生成三列节点 ----------
    // 平台节点(原始计算)
    const platformL1Raw = dataStore.getPlatformL1Nodes(state.currentPlatformType) ?? [];
    
    // ---------- 计算论文数量(去重) ----------
    // 创建论文ID计数映射表
    const nodePaperIds: Record<string, Set<string>> = {};
    
    // 处理crossLevelConnections中的数据
    const connectionsByType = dataStore.crossLevelConnections?.connections ?? {};
    const selectedYear = state.selectedYear ? String(state.selectedYear) : null;

    // 辅助函数：判断 paperIds 是否属于当前年份
    function filterPaperIdsByYear(paperIds: string[]) {
        if (!selectedYear) return paperIds;
        
        // 检查paperIdToYear映射是否存在且非空
        if (!dataStore.paperIdToYear || Object.keys(dataStore.paperIdToYear).length === 0) {
            console.warn('paperIdToYear映射不存在或为空，无法进行年份筛选，返回所有论文');
            return paperIds;
        }
        
        // 使用更健壮的筛选逻辑
        const filtered = paperIds.filter(pid => {
            const paperYear = dataStore.paperIdToYear?.[pid];
            // 如果找不到年份，保留该论文（宁可多显示也不要漏显示）
            if (paperYear === undefined) {
                return true;
            }
            return String(paperYear) === String(selectedYear);
        });
        
        // 只在开发环境下输出详细的筛选信息
        if (filtered.length === 0 && paperIds.length > 0) {
            console.warn('Year filter mismatch:', {
                paperIds: paperIds.length > 10 ? `${paperIds.length}篇论文` : paperIds,
                selectedYear,
                mapped: paperIds.length > 10 ? 
                    `${paperIds.filter(pid => dataStore.paperIdToYear?.[pid]).length}篇有年份映射` : 
                    paperIds.map(pid => dataStore.paperIdToYear?.[pid])
            });
        }
        
        return filtered;
    }

    
    // 遍历所有连接类型
    Object.entries(connectionsByType).forEach(([connectionType, connections]: [string, any]) => {
        // 遍历该类型下的所有连接
        Object.entries(connections).forEach(([connectionKey, connectionInfo]: [string, any]) => {
            const [source, target] = connectionKey.split('__');
            
            // 确保source和target在映射表中有对应的集合
            if (!nodePaperIds[source]) nodePaperIds[source] = new Set();
            if (!nodePaperIds[target]) nodePaperIds[target] = new Set();
            
            // 将论文ID添加到对应节点的集合中(自动去重)
            const filteredPaperIds = filterPaperIdsByYear(connectionInfo.paperIds || []);
            filteredPaperIds.forEach((paperId: string) => {
                nodePaperIds[source].add(paperId);
                nodePaperIds[target].add(paperId);
            });
        });
    });
    
    // 创建获取节点论文数量的辅助函数
    const getNodePaperCount = (nodeId: string): number => {
        return nodePaperIds[nodeId]?.size || 0;
    };
    
    // ---------- 构建节点 ----------
    // 平台节点(第0列)
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

    // 研究内容 L1
    const contentNodes = Object.values<any>(dataStore.nodeMetadata?.['研究内容'] ?? {})
        .filter((n) => n.level === 2) // level===2 表示 L1
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

    // 研究方法 L1
    const methodNodes = Object.values<any>(dataStore.nodeMetadata?.['研究方法'] ?? {})
        .filter((n) => n.level === 2) // level===2 表示 L1
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

    const nodes = [...platformNodes, ...contentNodes, ...methodNodes];

    // ---------- ② 生成连线 ----------
    // 连线生成保持不变，因为连线本身已经有正确的论文计数
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
        const filteredPaperIds = filterPaperIdsByYear(info.paperIds || []);
        if (filteredPaperIds.length === 0) continue;
        links.push({
            source: platform,
            target: content,
            value: filteredPaperIds.length,
            paperIds: filteredPaperIds,
        });
    }

    // b) 内容 (L1) → 方法 (L1)
    const rawContentMethod = dataStore.crossLevelConnections?.connections?.['研究内容_L1__研究方法_L1'] ?? {};
    for (const key in rawContentMethod) {
        if (!Object.prototype.hasOwnProperty.call(rawContentMethod, key)) continue;
        const [content, method] = key.split('__');
        const info = rawContentMethod[key];
        // 关键：加上年份过滤
        const filteredPaperIds = filterPaperIdsByYear(info.paperIds || []);
        if (filteredPaperIds.length === 0) continue;
        links.push({
            source: content,
            target: method,
            value: filteredPaperIds.length,
            paperIds: filteredPaperIds,
        });
    }
    console.log('Sankey nodes', nodes);
    console.log('Sankey links', links);
    console.log('selectedYear', selectedYear);
    console.log('crossLevelConnections', dataStore.crossLevelConnections?.connections);

    for (const key in rawPlatformContent) {
    const info = rawPlatformContent[key];
    const filteredPaperIds = filterPaperIdsByYear(info.paperIds || []);
    if (filteredPaperIds.length === 0) {
        console.log(`[No link] ${key} - paperIds:`, info.paperIds, 'filtered:', filteredPaperIds);
    }
    }

    // console.log('paperIdToYear keys sample:', Object.keys(dataStore.paperIdToYear).slice(0, 10));
    // console.log('sample paperIds in crossLevelConnections:', Object.values(connectionsByType)[0] && Object.values(Object.values(connectionsByType)[0])[0]?.paperIds);
    return { nodes, links };
}