<template>
  <svg ref="svgRef" class="sankey-svg"/>
</template>

<script setup lang="ts">
import { onMounted, watch, ref } from 'vue';
import * as d3 from 'd3';
import { sankey as d3Sankey, sankeyLinkHorizontal } from 'd3-sankey';

interface SankeyNode {
  id: string;
  name: string;
  column: number;
  color?: string;
  value: number;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

const props = defineProps<{
  nodes: SankeyNode[];
  links: SankeyLink[];
  prevNodes?: { id:string; x0:number; y0:number }[];
}>();
const svgRef = ref<SVGSVGElement|null>(null);
const emit = defineEmits(['node-toggle']);


function render() {
  if(!svgRef.value) return;
  const width = 900, height = 600;
  const svg = d3.select(svgRef.value)
                .attr('viewBox',`0 0 ${width} ${height}`)
                .attr('width','100%').attr('height','100%');
  svg.selectAll('*').remove();          // 清屏

  // 新建图层
  const linkLayer = svg.append('g').attr('class','links');
  const nodeLayer = svg.append('g').attr('class','nodes');

  // 深拷贝，避免 d3-sankey 修改原数组
  const graph = d3Sankey<SankeyNode, SankeyLink>()
      .nodeWidth(16).nodePadding(24)
      .nodeId((d) => d.id)
      .nodeSort((a,b)=>a.column-b.column)  // 按列排序
      .extent([[0,0],[width,height]]);

  const result = graph({
    nodes: props.nodes.map((n) => ({ ...n })),
    links: props.links.map((l) => ({ ...l })),
  });

  const linkSel = linkLayer.selectAll('path')
    .data(result.links, (d:any)=> d.source.id + '→' + d.target.id);

  const linkEnter = linkSel.enter().append('path')
        .attr('fill','none')
        .attr('stroke','#999')
        .attr('stroke-opacity',0.3);

  linkEnter.merge(linkSel as any)
        .transition().duration(600)
        .attr('d', sankeyLinkHorizontal())
        .attr('stroke-width', (d:any)=>Math.max(1,d.width));

  linkSel.exit().transition().duration(400).style('opacity',0).remove();

  // 画节点
  const nodeSel = nodeLayer.selectAll('g')
     .data(result.nodes, (d:any)=> d.id);

  // --- Enter ---
  const nodeEnter = nodeSel.enter().append('g')
        .attr('transform', d => {
          const prev = props.prevNodes?.find(p => p.id === d.id);
          return prev ? `translate(${prev.x0},${prev.y0})` 
                      : `translate(${d.x0},${d.y0})`;
        })
        .style('opacity', 0);   // 仅设置初值，不做 transition

  // 进入节点子元素
  nodeEnter.append('rect')
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .attr('fill', d => d.color || '#69c');

  nodeEnter.append('text')
        .attr('x',  d => d.column === 0 ? (d.x1 - d.x0) + 6 : -6)
        .attr('y',  d => (d.y1 - d.y0) / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', d => d.column === 0 ? 'start' : 'end')
        .style('font-size', '10px')
        .text(d => d.name);

  // --- Enter 过渡 ---
  nodeEnter.transition().duration(600)
        .style('opacity', 1)
        .attr('transform', d => `translate(${d.x0},${d.y0})`);

  // 合并更新阶段
  nodeSel.merge(nodeEnter)
        .transition().duration(600)
        .attr('transform', d => `translate(${d.x0},${d.y0})`)
        .select('rect')
          .attr('width',  d => d.x1 - d.x0)
          .attr('height', d => d.y1 - d.y0);

  // --- Exit ---
  nodeSel.exit()
        .transition().duration(400)
        .style('opacity', 0)
        .remove();

  nodeLayer.selectAll('g')
      .on('dblclick', (evt:any,d:any)=>{
        emit('node-toggle',{ id:d.id, column:d.column });
      });

  // ========== Hover 高亮 ==========
  function highlight(nodeId:string) {
    linkLayer.selectAll<SVGPathElement,any>('path')
      .style('stroke-opacity', l =>
        (l.source.id===nodeId || l.target.id===nodeId) ? 0.9 : 0.05);
    nodeLayer.selectAll<SVGGElement,any>('g')
      .style('opacity', n => n.id===nodeId ? 1 : 0.4);
  }
  function clearHighlight() {
    linkLayer.selectAll('path').style('stroke-opacity',0.3);
    nodeLayer.selectAll('g').style('opacity',1);
  }

  nodeLayer.selectAll('g')
    .on('mouseover', (_,d:any)=> highlight(d.id))
    .on('mouseout',  clearHighlight);
}


onMounted(render);
let rafId:number;
watch(()=>[props.nodes,props.links],()=>{
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(render);
},{deep:true});
</script>

<style scoped>
.sankey-svg{ width:100%; height:100%; }
</style>