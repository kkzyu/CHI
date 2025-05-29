export function buildL1Snapshot(dataStore: any, state: any) {
    // ---------- ① 生成三列节点 ----------
    const platformL1Raw = dataStore.getPlatformL1Nodes(state.currentPlatformType) ?? [];
    const platformNodes = platformL1Raw.map((n: any) => {
        const id = typeof n === 'string' ? n : n.id;
        const name = typeof n === 'string' ? n : n.name ?? n.id;
        const color = typeof n === 'string' ? '#6ca0dc' : n.color ?? '#6ca0dc';
        return {
            id,
            name,
            column: 0,
            color,
            value: 1,
            level: 'L1',
            hasChildren: true,
        };
    });

    // 研究内容 L1
    const contentNodes = Object.values<any>(dataStore.nodeMetadata?.['研究内容'] ?? {})
        .filter((n) => n.level === 2) // level===2 表示 L1
        .map((n) => {
            const hasChildren = dataStore.hierarchyMapping?.['研究内容']?.l1_to_l2?.[n.displayName]?.length > 0;
            return {
                id: n.displayName,
                name: n.displayName,
                column: 2,
                color: n.color || '#dc6866',
                value: n.totalPapers || 1,
                level: 'L1',
                hasChildren,
            };
        });

    // 研究方法 L1
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

    const nodes = [...platformNodes, ...contentNodes, ...methodNodes];

    // ---------- ② 生成连线 ----------
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
        links.push({
            source: platform,
            target: content,
            value: info.paperCount ?? 1,
            paperIds: info.paperIds ?? [],
        });
    }

    // b) 内容 (L1) → 方法 (L1)
    const rawContentMethod = dataStore.crossLevelConnections?.connections?.['研究内容_L1__研究方法_L1'] ?? {};
    for (const key in rawContentMethod) {
        if (!Object.prototype.hasOwnProperty.call(rawContentMethod, key)) continue;
        const [content, method] = key.split('__');
        const info = rawContentMethod[key];
        links.push({
            source: content,
            target: method,
            value: info.paperCount ?? 1,
            paperIds: info.paperIds ?? [],
        });
    }

    return { nodes, links };
}