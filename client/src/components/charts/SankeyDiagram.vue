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

const props = defineProps<{ nodes: SankeyNode[]; links: SankeyLink[] }>();
const svgRef = ref<SVGSVGElement|null>(null);

function render() {
  if(!svgRef.value) return;
  const width = 900, height = 600;
  const svg = d3.select(svgRef.value)
                .attr('viewBox',`0 0 ${width} ${height}`)
                .attr('width','100%').attr('height','100%');
  svg.selectAll('*').remove();          // 清屏

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

  // 画连线
  svg.append('g')
     .selectAll('path')
     .data(result.links)
     .enter()
     .append('path')
     .attr('d', sankeyLinkHorizontal())
     .attr('fill','none')
     .attr('stroke','#999')
     .attr('stroke-opacity',0.4)
     .attr('stroke-width', d=>Math.max(1,d.width));

  // 画节点
  const nodeG = svg.append('g')
     .selectAll('g')
     .data(result.nodes)
     .enter()
     .append('g')
     .attr('transform', d=>`translate(${d.x0},${d.y0})`);

  nodeG.append('rect')
       .attr('width', d=>d.x1-d.x0)
       .attr('height',d=>d.y1-d.y0)
       .attr('fill', d=>d.color || '#69c');

  nodeG.append('text')
       .attr('x', -6)
       .attr('y', d=> (d.y1-d.y0)/2 )
       .attr('dy','0.35em')
       .attr('text-anchor','end')
       .style('font-size','10px')
       .text(d=>d.name);
}

onMounted(render);
watch(()=>[props.nodes,props.links], render, { deep:true });
</script>

<style scoped>
.sankey-svg{ width:100%; height:100%; }
</style>