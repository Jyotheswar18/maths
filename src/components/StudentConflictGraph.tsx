import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { GraphNode, GraphLink } from '../types';

interface StudentConflictGraphProps {
  nodes: GraphNode[];
  links: GraphLink[];
}

export default function StudentConflictGraph({ nodes, links }: StudentConflictGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 400;

    // Create simulation
    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50));

    // Create container group
    const container = svg.append("g");

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    svg.call(zoom as any);

    // Create links
    const link = container.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", "#ff6b6b")
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "5,5");

    // Create nodes
    const node = container.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .enter().append("g")
      .attr("class", "node")
      .call(d3.drag<any, any>()
        .on("start", (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    // Add circles to nodes
    node.append("circle")
      .attr("r", 30)
      .attr("fill", (d: any) => d.color || "#64748b")
      .attr("stroke", "#fff")
      .attr("stroke-width", 3)
      .style("cursor", "pointer");

    // Add labels to nodes
    node.append("text")
      .text((d: any) => {
        // Truncate long course names
        return d.name.length > 8 ? d.name.substring(0, 8) + '...' : d.name;
      })
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("fill", "#fff")
      .style("pointer-events", "none");

    // Add full course name on hover
    node.append("title")
      .text((d: any) => `${d.name}\nSlot: ${d.slot !== undefined ? d.slot + 1 : 'Unassigned'}`);

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    // Add legend
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 180}, 20)`);

    legend.append("rect")
      .attr("width", 160)
      .attr("height", 80)
      .attr("fill", "rgba(255, 255, 255, 0.9)")
      .attr("stroke", "#ccc")
      .attr("rx", 5);

    legend.append("text")
      .attr("x", 10)
      .attr("y", 20)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text("Legend:");

    legend.append("circle")
      .attr("cx", 20)
      .attr("cy", 35)
      .attr("r", 8)
      .attr("fill", "#64748b");

    legend.append("text")
      .attr("x", 35)
      .attr("y", 40)
      .attr("font-size", "10px")
      .text("Course");

    legend.append("line")
      .attr("x1", 10)
      .attr("y1", 55)
      .attr("x2", 30)
      .attr("y2", 55)
      .attr("stroke", "#ff6b6b")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "3,3");

    legend.append("text")
      .attr("x", 35)
      .attr("y", 60)
      .attr("font-size", "10px")
      .text("Conflict");

    return () => {
      simulation.stop();
    };
  }, [nodes, links]);

  return (
    <div className="w-full h-full">
      <svg
        ref={svgRef}
        width="100%"
        height="400"
        viewBox="0 0 800 400"
        className="border border-slate-200 rounded-lg bg-white"
      >
      </svg>
      <div className="mt-2 text-sm text-slate-600 text-center">
        Drag nodes to rearrange • Scroll to zoom • Hover for details
      </div>
    </div>
  );
}
