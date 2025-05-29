import { buildPlatformNodes } from './nodeBuilders/platformNodeBuilder';
import { buildMethodNodes } from './nodeBuilders/methodNodeBuilder';
import { buildContentNodes } from './nodeBuilders/contentNodeBuilder';
import { buildConnections } from './connectionBuilders/connectionBuilder';

export function buildMixedLevelSnapshot(dataStore: any, state: any) {
    const nodes: any[] = [];
    const links: any[] = [];

    console.log('=== buildMixedLevelSnapshot 开始 ===');
    console.log('当前 columnLevels:', state.columnLevels);
    console.log('当前 expandedNodes:', state.expandedNodes);

    // ① 生成平台列节点（第0列）
    const platformNodes = buildPlatformNodes(dataStore, state);
    nodes.push(...platformNodes);

    // ② 生成研究方法列节点（第1列）
    const methodNodes = buildMethodNodes(dataStore, state);
    nodes.push(...methodNodes);

    // ③ 生成研究内容列节点（第2列）
    const contentNodes = buildContentNodes(dataStore, state);
    nodes.push(...contentNodes);

    console.log('=== 节点生成完成 ===');
    console.log('各列节点数量:', {
        column0: nodes.filter(n => n.column === 0).length,
        column1: nodes.filter(n => n.column === 1).length,
        column2: nodes.filter(n => n.column === 2).length,
        total: nodes.length
    });

    // ④ 生成连接
    const connections = buildConnections(dataStore, state, nodes);
    links.push(...connections);

    console.log('=== 连接生成完成 ===');
    console.log(`最终生成的连接数量: ${links.length}`);

    return { nodes, links };
}