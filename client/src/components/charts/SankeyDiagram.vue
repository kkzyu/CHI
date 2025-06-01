<template>
  <div class="sankey-container">
    <svg ref="svgRef" class="sankey-svg"></svg>
    <NodeTooltip 
      :node="hoveredNode" 
      :x="tooltipX" 
      :y="tooltipY" 
      :visible="showNodeTooltip" 
    />
    <LinkTooltip
      :link="hoveredLink"
      :x="tooltipX"
      :y="tooltipY"
      :visible="showLinkTooltip"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref } from 'vue';
import * as d3 from 'd3';
// 直接使用any类型
import { sankey as d3Sankey, sankeyLinkHorizontal } from 'd3-sankey';
import { useRelationsStore } from '@/stores/relationsStore';
import { useDataStore } from '@/stores/dataStore'; 
import NodeTooltip from '@/components/ui/NodeTooltip.vue';
import LinkTooltip from '@/components/ui/LinkTooltip.vue';

// d3-sankey类型声明
type D3SankeyNode = any;
type D3SankeyLink = any;
type D3Sankey = any;

// 为标题定义类型
interface ColumnTitle {
  text: string;
  x: number;
  y: number;
  align: string;
}

interface NodeData {
  id: string;
  name: string;
  column: number;
  color?: string;
  value: number;
  x0?: number;
  y0?: number;
  x1?: number;
  y1?: number;
  originalValue?: number;
  level?: string;
  contentCategory?: string;
}

interface LinkData {
  source: string;
  target: string;
  value: number;
}

// 增加接口定义用于连接的tooltip
interface LinkTooltipData {
  sourceId: string;
  targetId: string;
  sourceName: string;
  targetName: string;
  value: number;
  source?: {
    id: string;
    name: string;
    column: number;
  };
  target?: {
    id: string;
    name: string;
    column: number;
  };
}

const props = defineProps<{
  nodes: NodeData[];
  links: LinkData[];
  prevNodes?: { id: string; x0: number; y0: number }[];
  selectedNode?: string | null;
  selectedLink?: { source: string; target: string } | null;
}>();

const svgRef = ref<SVGSVGElement|null>(null);
const emit = defineEmits(['node-toggle', 'reset-column', 'node-select', 'link-select', 'undo-operation', 'nodeDoubleClickedForPieDrillDown']);

// 节点tooltip状态
const hoveredNode = ref<NodeData | null>(null);
const tooltipX = ref(0);
const tooltipY = ref(0);
const showNodeTooltip = ref(false);

// 连接tooltip状态
const hoveredLink = ref<LinkTooltipData | null>(null);
const showLinkTooltip = ref(false);

// 定义全局可访问的图层变量
let linkLayer: any;
let nodeLayer: any;
let labelLayer: any;

function render() {
  if(!svgRef.value) return;
  const width = 900, height = 700;
  const margin = 20; // 新增左右margin
  const svg = d3.select(svgRef.value)
                .attr('viewBox',`0 0 ${width} ${height}`)
                .attr('width','100%').attr('height','100%');


  
  // 添加右键点击事件到整个SVG
  svg.on('contextmenu', (evt) => {
    // 阻止默认的浏览器右键菜单
    evt.preventDefault();
    // 触发撤销操作
    emit('undo-operation');
  });

  // 确保图层存在
  linkLayer = svg.select('g.links');
  nodeLayer = svg.select('g.nodes');
  labelLayer = svg.select('g.column-labels');
  
  // 如果图层不存在，创建它们
  if (linkLayer.empty()) {
    linkLayer = svg.append('g').attr('class','links');
  }
  if (nodeLayer.empty()) {
    nodeLayer = svg.append('g').attr('class','nodes');
  }
  if (labelLayer.empty()) {
    labelLayer = svg.append('g').attr('class','column-labels');
  }

  // 添加三栏标题 - 确保与桑基图中的列顺序匹配
  const columnTitles: ColumnTitle[] = [
    { text: '研究平台', x: 0, y: 40, align: 'start' },       // 左侧margin
    { text: '研究内容', x: width / 2, y: 40, align: 'middle' }, // 居中
    { text: '研究方法', x: width , y: 40, align: 'end' }    // 右侧margin
  ];

  // 更新标题
  const titleSelection = labelLayer.selectAll('text.column-title')
    .data(columnTitles, (d: ColumnTitle) => d.text);
    
  // 删除不再需要的标题
  titleSelection.exit().remove();
    
  // 进入/更新逻辑
  const titleEnter = titleSelection.enter()
    .append('text')
    .attr('class', 'column-title')
    .attr('x', (d: ColumnTitle) => d.x)
    .attr('y', (d: ColumnTitle) => d.y)
    .attr('text-anchor', (d: ColumnTitle) => d.align)
    .text((d: ColumnTitle) => d.text)
    .style('font-size', '16px')
    .style('font-weight', '600')
    .style('fill', '#2c3e50')
    .style('cursor', 'pointer')
    .on('click', function(event, d: ColumnTitle) {
      // 点击处理逻辑
      let columnIndex;
      if (d.text === '研究平台') columnIndex = 0;
      else if (d.text === '研究内容') columnIndex = 2;
      else if (d.text === '研究方法') columnIndex = 1;
      if (columnIndex !== undefined) {
        emit('reset-column', columnIndex);
      }
    })
    .on('mouseover', function() {
      d3.select(this)
        .style('font-size', '17px');
    })
    .on('mouseout', function() {
      d3.select(this)
        .style('font-size', '16px');
    });


  // 更新现有标题样式和位置
  titleSelection.merge(titleEnter)
    .attr('x', (d: ColumnTitle) => d.x)
    .attr('y', (d: ColumnTitle) => d.y)
    .attr('text-anchor', (d: ColumnTitle) => d.align)
    .text((d: ColumnTitle) => d.text)
    .transition()
    .duration(300)
    .style('font-size', '16px')
    .style('fill', '#2c3e50');

  // 添加提示信息（使用title元素）
  titleEnter.append('title')
    .text('点击重置此列视图');

  // 如果没有节点数据或节点为空，显示空状态提示而不是完全不渲染
  if (!props.nodes || props.nodes.length === 0) {
    // 清除旧的节点和连接
    nodeLayer.selectAll('g').remove();
    linkLayer.selectAll('path').remove();
    
    // 添加空状态提示
    const emptyStateText = svg.select('.empty-state-text');
    if (emptyStateText.empty()) {
      svg.append('text')
        .attr('class', 'empty-state-text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('fill', '#999')
        .text('点击节点标题查看关系图');
    }
    
    return;
  } else {
    // 有数据时移除空状态提示
    svg.select('.empty-state-text').remove();
  }

  // 深拷贝，避免 d3-sankey 修改原数组
  // @ts-ignore - d3-sankey类型问题
  const graph = d3Sankey()
      // @ts-ignore
      .nodeWidth(16)
      // @ts-ignore
      .nodePadding(10)
      // @ts-ignore
      .nodeId((d: any) => d.id)
      // @ts-ignore
      .nodeSort((a: any, b: any) => a.column - b.column)  // 按列排序
      // @ts-ignore
      .extent([[margin, 60], [width - margin, height]]);  // 左右margin，顶部留空间

  const result = graph({
    nodes: props.nodes.map((n) => {
      // 复制节点并保存原始值
      const node = { ...n, originalValue: n.value };
      
      // 🔥关键修复：确保节点的column属性正确
      if (node.level === 'L3') {
        // 根据节点所属类别修正column值
        if (node.contentCategory === '研究内容') {
          node.column = 1; // 研究内容在中间列（列索引1）
        } else if (node.contentCategory === '研究方法') {
          node.column = 2; // 研究方法在右侧列（列索引2）
        }
        // 如果是平台，则保持column=0
      }
      
      return node;
    }) as any[],
    links: props.links.map((l) => ({ ...l })) as any[],
  });

  // 绘制连接
  const linkSel = linkLayer.selectAll('path')
    .data(result.links, (d: any) => d.source.id + '→' + d.target.id);

  const linkEnter = linkSel.enter().append('path')
        .attr('fill','none')
        .attr('stroke','#999')
        .attr('stroke-opacity',0.2)  // 开始时更透明
        .attr('d', sankeyLinkHorizontal())  // 初始形状
        .attr('stroke-width', 0)  // 开始时宽度为0
        .attr('class', (d: any) => {
          // 检查是否是选中的连接
          if (props.selectedLink && 
              ((d.source.id === props.selectedLink.source && d.target.id === props.selectedLink.target) ||
              (d.source.id === props.selectedLink.target && d.target.id === props.selectedLink.source))) {
            return 'selected-link';
          }
          return '';
        })
        .style('cursor', 'pointer'); // 添加鼠标样式指示器

  // 为所有连接（新的和现有的）应用过渡效果
  linkSel.merge(linkEnter as any)
        .transition()
        .duration(800)
        .attr('d', sankeyLinkHorizontal())
        .attr('stroke-width', (d: any) => Math.max(1, d.width))
        .attr('stroke-opacity', 0.3);

  // 应用选中连接的样式
  linkLayer.selectAll('path.selected-link')
        .attr('stroke', '#3498db')  // 选中连接的颜色
        .attr('stroke-opacity', 0.8); // 选中连接的不透明度

  // 平滑移除不再需要的连接
  linkSel.exit()
        .transition()
        .duration(500)
        .attr('stroke-width', 0)
        .attr('stroke-opacity', 0)
        .remove();

  // 画节点
  const nodeSel = nodeLayer.selectAll('g.node')
     .data(result.nodes, (d: any) => d.id);

  // --- Enter ---
  const nodeEnter = nodeSel.enter().append('g')
        .attr('class', 'node')
        .attr('transform', (d: any) => {
          const prev = props.prevNodes?.find(p => p.id === d.id);
          return prev ? `translate(${prev.x0},${prev.y0})` 
                      : `translate(${d.x0},${d.y0})`;
        })
        .style('opacity', 0)   // 开始时透明
        .attr('class', (d: any) => {
          const classes = ['node'];
          if (props.selectedNode === d.id) classes.push('selected-node');
          return classes.join(' ');
        })
        .style('cursor', 'pointer'); // 添加鼠标样式指示器

  // 进入节点子元素
  nodeEnter.append('rect')
        .attr('width', 0)  // 开始时宽度为0
        .attr('height', 0)  // 开始时高度为0
        .attr('fill', (d: any) => d.color || '#69c')
        .attr('rx', 2)  // 添加圆角
        .attr('ry', 2);

  // 修复节点文本逻辑，确保所有级别的节点都能正确显示文本
  nodeEnter.append('text')
        .attr('x', (d: any) => {
          // 根据节点所在列确定文本位置
          if (d.column === 0) return (d.x1 - d.x0) + 6; // 研究平台在左侧，文本在右侧
          if (d.column === 2) return -6; // 研究方法在右侧，文本在左侧
          if (d.column === 1) return -6; // 研究内容在中间，文本在左侧
          // 默认情况
          return d.column < 1 ? (d.x1 - d.x0) + 6 : -6;
        })
        .attr('y', (d: any) => (d.y1 - d.y0) / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', (d: any) => {
          // 根据节点所在列确定文本对齐方式
          if (d.column === 0) return 'start'; // 研究平台在左侧，文本左对齐
          if (d.column === 2) return 'end'; // 研究方法在右侧，文本右对齐
          if (d.column === 1) return 'end'; // 研究内容在中间，文本右对齐
          // 默认情况
          return d.column < 1 ? 'start' : 'end';
        })
        .style('font-size', '10px')
        .style('opacity', 0)  // 开始时文本透明
        .text((d: any) => d.name);

  // --- Enter 过渡 ---
  nodeEnter.transition()
        .duration(800)
        .style('opacity', 1)
        .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`);

  nodeEnter.select('rect')
        .transition()
        .duration(800)
        .attr('width', (d: any) => d.x1 - d.x0)
        .attr('height', (d: any) => d.y1 - d.y0);

  nodeEnter.select('text')
        .transition()
        .delay(200)  // 稍微延迟文本出现
        .duration(600)
        .style('opacity', 1);

  // 合并更新阶段
  nodeSel.merge(nodeEnter as any)
        .transition()
        .duration(600)
        .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`)
        .select('rect')
          .attr('width', (d: any) => d.x1 - d.x0)
          .attr('height', (d: any) => d.y1 - d.y0);

  // 应用选中节点的样式
  nodeLayer.selectAll('g.selected-node rect')
        .attr('stroke', '#2ecc71') // 选中节点的边框颜色
        .attr('stroke-width', 2);  // 选中节点的边框宽度

  // --- Exit ---
  nodeSel.exit()
        .transition()
        .duration(500)
        .style('opacity', 0)
        .remove();
  
  nodeLayer.selectAll('g.node')
      .on('dblclick', (evt:any, d:any) => { // d 是被双击的节点数据
        evt.preventDefault();
        evt.stopPropagation();
        
        // 触发桑基图自身层级更新
        emit('node-toggle', { id:d.id, column:d.column });

        // 新增：触发用于饼图下钻的事件
        // 我们传递节点的显示名称 (d.name) 和列索引 (d.column)
        // d.id 是节点的唯一ID，d.name 是其显示名称
        // d.column 是其在桑基图中的列索引 (0, 1, 或 2)
        emit('nodeDoubleClickedForPieDrillDown', { 
          nodeId: d.id, // 可以是原始ID，如果需要更精确的匹配
          nodeDisplayName: d.name, // 显示名称，可能更适合饼图下钻逻辑
          columnIndex: d.column 
        });
        })
        // 添加单击事件处理节点选择
      .on('click', (evt:any, d:any) => {
        // 阻止事件冒泡，避免影响其他事件
        evt.stopPropagation();
        emit('node-select', d.id);
      })
      // 添加右键点击事件处理返回上一级
      .on('contextmenu', (evt:any) => {
        // 阻止默认的浏览器右键菜单
        evt.preventDefault();
        // 阻止事件冒泡
        evt.stopPropagation();
        // 触发撤销操作
        emit('undo-operation');
      });
      
  // 节点悬停事件
  nodeLayer.selectAll('g.node')
    .on('mouseover', (event, d:any) => highlightNode(d.id, event, d))
    .on('mousemove', (event) => {
      tooltipX.value = event.clientX;
      tooltipY.value = event.clientY;
    })
    .on('mouseout', clearHighlight);
    
  // 连接悬停事件
  linkLayer.selectAll('path')
    .on('mouseover', (event, d:any) => highlightLink(event, d))
    .on('mousemove', (event) => {
      tooltipX.value = event.clientX;
      tooltipY.value = event.clientY;
    })
    .on('mouseout', clearHighlight)
    // 添加连接点击事件
    .on('click', (evt:any, d:any) => {
      // 阻止事件冒泡
      evt.stopPropagation();
      emit('link-select', { source: d.source.id, target: d.target.id });
    });

  // 在render()里，确保SVG有简约渐变定义（只需添加一次）
  if (svg.select('defs#sankey-title-defs-minimal').empty()) {
    const defs = svg.append('defs').attr('id', 'sankey-title-defs-minimal');
    defs.append('linearGradient')
      .attr('id', 'sankey-title-gradient-minimal')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '0%')
      .selectAll('stop')
      .data([
        { offset: '0%', color: '#2c3e50' },
        { offset: '100%', color: '#7b8fa3' }
      ])
      .enter()
      .append('stop')
      .attr('offset', d => d.offset)
      .attr('stop-color', d => d.color);
  }
}

// 在接口定义后添加：
const relationsStore = useRelationsStore();
const dataStore = useDataStore();

// 添加调试函数
function debugNodeExpansion() {
    console.log('=== 节点展开调试 ===');
    
    // 1. 检查数据源
    console.log('hierarchyMapping 研究内容:', dataStore.hierarchyMapping?.['研究内容']);
    
    // 特别检查目标节点的子节点元数据
    const targetChildren = dataStore.hierarchyMapping?.['研究内容']?.l1_to_l2?.['用户群体与个体特征'];
    console.log('目标节点的子节点列表:', targetChildren);
    
    // 检查每个子节点的元数据
    if (targetChildren) {
        targetChildren.forEach(childId => {
            const childMeta = Object.values<any>(dataStore.nodeMetadata?.['研究内容'] ?? {})
                .find(n => n.displayName === childId && n.level === 3);
            console.log(`子节点 ${childId} 的元数据:`, childMeta);
        });
    }
    
    // 检查所有研究内容的元数据
    console.log('所有研究内容元数据的 level 分布:');
    const allContentMeta = Object.values<any>(dataStore.nodeMetadata?.['研究内容'] ?? {});
    const levelCounts = allContentMeta.reduce((acc: Record<string, number>, item: any) => {
        acc[item.level] = (acc[item.level] || 0) + 1;
        return acc;
    }, {});
    console.log('Level 分布:', levelCounts);
}

onMounted(() => {
    render();
    // 延迟调试，确保数据已加载
    setTimeout(debugNodeExpansion, 1000);
});

let rafId: number;
watch(() => [props.nodes, props.links, props.selectedNode, props.selectedLink], () => {
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(render);
}, {deep: true});

function highlightNode(nodeId:string, event:MouseEvent, nodeData:any) {
  linkLayer.selectAll('path')
    .style('stroke-opacity', l =>
      (l.source.id===nodeId || l.target.id===nodeId) ? 0.9 : 0.05);
  nodeLayer.selectAll('g')
    .style('opacity', n => n.id===nodeId ? 1 : 0.4);
  
  // 添加日志，查看传递的节点数据
  console.log('悬停节点数据:', nodeData);
  
  // 确保有必要的字段，避免空值导致问题
  if (nodeData && typeof nodeData === 'object') {
    // 创建一个干净的对象传递给tooltip，避免d3内部属性干扰
    hoveredNode.value = {
      id: nodeData.id,
      name: nodeData.name,
      column: nodeData.column,
      level: nodeData.level,
      value: nodeData.value,
      originalValue: nodeData.originalValue
    };
  } else {
    console.warn('悬停节点数据无效:', nodeData);
    hoveredNode.value = null;
  }
  
  // 显示节点tooltip，隐藏连接tooltip
  tooltipX.value = event.clientX;
  tooltipY.value = event.clientY;
  showNodeTooltip.value = true;
  showLinkTooltip.value = false;
}

function highlightLink(event:MouseEvent, linkData:any) {
  // 高亮当前连接，降低其他连接的不透明度
  linkLayer.selectAll('path')
    .style('stroke-opacity', l => 
      (l.source.id === linkData.source.id && l.target.id === linkData.target.id) ? 0.9 : 0.05);
  
  // 高亮源节点和目标节点
  nodeLayer.selectAll('g')
    .style('opacity', n => 
      (n.id === linkData.source.id || n.id === linkData.target.id) ? 1 : 0.4);
  
  console.log('悬停连接数据:', linkData);
  
  // 准备连接tooltip数据
  if (linkData && typeof linkData === 'object') {
    hoveredLink.value = {
      sourceId: linkData.source.id,
      targetId: linkData.target.id,
      sourceName: linkData.source.name,
      targetName: linkData.target.name,
      value: linkData.value,
      // 传递完整的节点对象，以便获取column信息
      source: {
        id: linkData.source.id,
        name: linkData.source.name,
        column: linkData.source.column
      },
      target: {
        id: linkData.target.id,
        name: linkData.target.name,
        column: linkData.target.column
      }
    };
  } else {
    console.warn('悬停连接数据无效:', linkData);
    hoveredLink.value = null;
  }
  
  // 显示连接tooltip，隐藏节点tooltip
  tooltipX.value = event.clientX;
  tooltipY.value = event.clientY;
  showLinkTooltip.value = true;
  showNodeTooltip.value = false;
}

function clearHighlight() {
  // 如果有选中的节点或连接，保持它们的高亮状态
  if (!props.selectedNode && !props.selectedLink) {
    linkLayer.selectAll('path').style('stroke-opacity', 0.3);
    nodeLayer.selectAll('g').style('opacity', 1);
  } else {
    // 恢复非选中项的正常状态，保持选中项的高亮
    linkLayer.selectAll('path')
      .style('stroke-opacity', l => {
        if (props.selectedLink && 
            ((l.source.id === props.selectedLink.source && l.target.id === props.selectedLink.target) ||
             (l.source.id === props.selectedLink.target && l.target.id === props.selectedLink.source))) {
          return 0.8; // 保持选中连接的高亮
        }
        return 0.3; // 其他连接恢复正常
      });
      
    nodeLayer.selectAll('g')
      .style('opacity', n => {
        if (props.selectedNode && n.id === props.selectedNode) {
          return 1; // 保持选中节点的高亮
        }
        return 1; // 其他节点恢复正常
      });
  }
  
  // 隐藏所有tooltip
  showNodeTooltip.value = false;
  showLinkTooltip.value = false;
}
</script>

<style scoped>
.sankey-container {
  position: relative;
  width: 100%;
  height: 100%;
  /* 防止文本选择 */
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
/* 在style部分添加这些规则 */
:deep(.column-title) {
  font-size: 16px;
  font-weight: 600;
  fill: #2c3e50;
  transition: all 0.3s cubic-bezier(.4,1.4,.6,1);
  cursor: pointer;
  filter: drop-shadow(0 0 0px #fff0); /* 初始无发光 */
}

:deep(.column-title:hover) {
  /* 简约渐变高亮色 */
  fill: url(#sankey-title-gradient-minimal);
  /* 低调淡蓝灰发光 */
  filter: drop-shadow(0 0 6px #9da3acdd);
}

:deep(.sankey-container) {
  overflow: visible; /* 允许标题显示在边界 */
}

.sankey-svg {
  width: 100%;
  height: 100%;
}

/* 添加节点悬停效果 */
:deep(.node) {
  transition: filter 0.3s ease, opacity 0.4s ease;
}

:deep(.node:hover) {
  filter: brightness(1.1);
}

:deep(.node rect) {
  transition: fill 0.3s ease, stroke-width 0.3s ease, stroke 0.3s ease;
}

:deep(.node:hover rect) {
  stroke: rgba(255, 255, 255, 0.5);
  stroke-width: 1px;
}

/* 添加链接过渡效果 */
:deep(path) {
  transition: stroke-opacity 0.3s ease, stroke-width 0.3s ease, stroke 0.3s ease;
}

:deep(path:hover) {
  stroke-opacity: 0.7 !important;
  cursor: pointer;
}

/* 添加选中状态过渡 */
:deep(.selected-node rect) {
  animation: pulse 2s infinite alternate ease-in-out;
}

@keyframes pulse {
  0% {
    stroke-width: 2px;
  }
  100% {
    stroke-width: 3px;
  }
}
</style>