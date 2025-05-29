export function buildConnections(dataStore: any, state: any, nodes: any[]): any[] {
    const links: any[] = [];
    const allConnections = dataStore.crossLevelConnections?.connections ?? {};

    console.log('=== 开始生成连接 ===');
    console.log('当前层级配置:', state.columnLevels);

    // 1. 平台 → 研究内容连接
    buildPlatformToContentConnections(dataStore, state, nodes, allConnections, links);

    // 2. 研究内容 → 研究方法连接
    buildContentToMethodConnections(dataStore, state, nodes, allConnections, links);

    console.log('=== 连接生成完成 ===');
    console.log(`最终生成的连接数量: ${links.length}`);
    console.log('连接详情:', links.map(l => `${l.source} → ${l.target} (${l.value})`));

    return links;
}

function buildPlatformToContentConnections(dataStore: any, state: any, nodes: any[], allConnections: any, links: any[]) {
    console.log('=== 生成平台→研究内容连接 ===');

    // 根据当前平台层级和内容层级选择正确的连接数据源
    let platformContentConnectionKey = '';

    if (state.columnLevels[0] === 'L1' && state.columnLevels[2] === 'L1') {
        platformContentConnectionKey = state.currentPlatformType === '内容形式'
            ? '研究涉及平台-内容形式_L2__研究内容_L1'
            : '研究涉及平台-平台属性_L2__研究内容_L1';
    } else if (state.columnLevels[0] === 'L2' && state.columnLevels[2] === 'L1') {
        platformContentConnectionKey = state.currentPlatformType === '内容形式'
            ? '研究涉及平台-内容形式_L3__研究内容_L1'
            : '研究涉及平台-平台属性_L3__研究内容_L1';
    } else if (state.columnLevels[0] === 'L1' && state.columnLevels[2] === 'L2') {
        platformContentConnectionKey = state.currentPlatformType === '内容形式'
            ? '研究涉及平台-内容形式_L2__研究内容_L2'
            : '研究涉及平台-平台属性_L2__研究内容_L2';
    } else if (state.columnLevels[0] === 'L2' && state.columnLevels[2] === 'L2') {
        platformContentConnectionKey = state.currentPlatformType === '内容形式'
            ? '研究涉及平台-内容形式_L3__研究内容_L2'
            : '研究涉及平台-平台属性_L3__研究内容_L2';
    } else if (state.columnLevels[0] === 'L1' && state.columnLevels[2] === 'L3') {
        platformContentConnectionKey = state.currentPlatformType === '内容形式'
            ? '研究涉及平台-内容形式_L2__研究内容_L3'
            : '研究涉及平台-平台属性_L2__研究内容_L3';
    } else if (state.columnLevels[0] === 'L2' && state.columnLevels[2] === 'L3') {
        platformContentConnectionKey = state.currentPlatformType === '内容形式'
            ? '研究涉及平台-内容形式_L3__研究内容_L3'
            : '研究涉及平台-平台属性_L3__研究内容_L3';
    }

    const platformContentConnections = allConnections[platformContentConnectionKey] ?? {};
    console.log(`使用平台→内容连接键: ${platformContentConnectionKey}`);
    console.log(`找到平台→内容连接数量: ${Object.keys(platformContentConnections).length}`);

    const currentPlatformNodes = nodes.filter(n => n.column === 0);
    const currentContentNodes = nodes.filter(n => n.column === 2);

    console.log('当前显示的平台节点:', currentPlatformNodes.map(n => n.id));
    console.log('当前显示的内容节点:', currentContentNodes.map(n => n.id));

    // 处理平台→内容连接
    for (const connectionKey in platformContentConnections) {
        const [platformId, contentId] = connectionKey.split('__');
        const connectionInfo = platformContentConnections[connectionKey];
        
        console.log(`处理平台→内容连接: ${platformId} → ${contentId}`);
        
        const platformNode = currentPlatformNodes.find(n => n.id === platformId);
        const contentNode = currentContentNodes.find(n => n.id === contentId);
        
        if (platformNode && contentNode) {
            links.push({
                source: platformId,
                target: contentId,
                value: connectionInfo.paperCount || 1,
                paperIds: connectionInfo.paperIds || [],
                connectionStrength: connectionInfo.connectionStrength
            });
            console.log(`✅ 创建平台→内容连接: ${platformId} → ${contentId} (${connectionInfo.paperCount || 1})`);
        } else {
            console.log(`平台→内容连接节点不存在: ${platformId} → ${contentId}`);
            console.log(`平台节点存在: ${!!platformNode}, 内容节点存在: ${!!contentNode}`);
        }
    }
}

function buildContentToMethodConnections(dataStore: any, state: any, nodes: any[], allConnections: any, links: any[]) {
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
    console.log(`使用内容→方法连接键: ${contentMethodConnectionKey}`);
    console.log(`找到内容→方法连接数量: ${Object.keys(contentMethodConnections).length}`);

    const currentContentNodes = nodes.filter(n => n.column === 2);
    const currentMethodNodes = nodes.filter(n => n.column === 1);

    console.log('当前显示的内容节点:', currentContentNodes.map(n => ({ 
        id: n.id, 
        name: n.name, 
        originalId: n.originalId,
        level: n.level
    })));
    console.log('当前显示的方法节点:', currentMethodNodes.map(n => ({ 
        id: n.id, 
        name: n.name,
        level: n.level
    })));

    // 🔥 关键修复：处理不同层级的连接逻辑
    if (state.columnLevels[2] === 'L3' && state.columnLevels[1] === 'L1') {
        // L3内容 → L1方法：直接匹配L3内容节点
        console.log('处理L3内容→L1方法连接');
        
        for (const connectionKey in contentMethodConnections) {
            const [contentId, methodId] = connectionKey.split('__');
            const connectionInfo = contentMethodConnections[connectionKey];
            
            console.log(`处理连接: ${contentId} → ${methodId}`);
            
            const contentNode = currentContentNodes.find(n => n.id === contentId);
            const methodNode = currentMethodNodes.find(n => n.id === methodId);
            
            if (contentNode && methodNode) {
                links.push({
                    source: contentId,
                    target: methodId,
                    value: connectionInfo.paperCount ?? 1,
                    paperIds: connectionInfo.paperIds ?? [],
                    connectionStrength: connectionInfo.connectionStrength
                });
                console.log(`✅ 创建L3内容→L1方法连接: ${contentId} → ${methodId} (${connectionInfo.paperCount || 1})`);
            } else {
                console.log(`连接节点不存在: ${contentId} → ${methodId}`);
                console.log(`内容节点存在: ${!!contentNode}, 方法节点存在: ${!!methodNode}`);
                
                if (!contentNode) {
                    console.log(`❌ 内容节点 "${contentId}" 不存在`);
                    console.log(`可用的内容节点ID:`, currentContentNodes.map(n => n.id));
                }
                if (!methodNode) {
                    console.log(`❌ 方法节点 "${methodId}" 不存在`);
                    console.log(`可用的方法节点ID:`, currentMethodNodes.map(n => n.id));
                }
            }
        }
    } else {
        // 其他层级组合：使用通用的匹配逻辑
        console.log('处理其他层级组合的内容→方法连接');
        
        for (const connectionKey in contentMethodConnections) {
            const [contentId, methodId] = connectionKey.split('__');
            const connectionInfo = contentMethodConnections[connectionKey];
            
            console.log(`处理连接: ${contentId} → ${methodId}`);
            
            // 尝试多种匹配方式
            let contentNode = currentContentNodes.find(n => n.id === contentId);
            if (!contentNode) {
                contentNode = currentContentNodes.find(n => n.name === contentId);
            }
            if (!contentNode && currentContentNodes.some(n => n.originalId)) {
                contentNode = currentContentNodes.find(n => n.originalId === contentId);
            }
            
            let methodNode = currentMethodNodes.find(n => n.id === methodId);
            if (!methodNode) {
                methodNode = currentMethodNodes.find(n => n.name === methodId);
            }
            
            if (contentNode && methodNode) {
                links.push({
                    source: contentNode.id,
                    target: methodNode.id,
                    value: connectionInfo.paperCount ?? 1,
                    paperIds: connectionInfo.paperIds ?? [],
                    connectionStrength: connectionInfo.connectionStrength
                });
                console.log(`✅ 创建内容→方法连接: ${contentNode.id} → ${methodNode.id} (${connectionInfo.paperCount || 1})`);
            } else {
                console.log(`连接节点不存在: ${contentId} → ${methodId}`);
                console.log(`内容节点存在: ${!!contentNode}, 方法节点存在: ${!!methodNode}`);
            }
        }
    }

    console.log('=== 内容→方法连接生成完成 ===');
    console.log(`当前连接总数: ${links.length}`);
}