import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Network, Eye, EyeOff } from 'lucide-react';
import { ScheduleResult, GraphNode, GraphLink } from '../types';

interface GraphVisualizationProps {
  result: ScheduleResult | null;
}

export function GraphVisualization({ result }: GraphVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [showGraph, setShowGraph] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current?.parentElement) {
        const container = svgRef.current.parentElement;
        setDimensions({
          width: container.clientWidth - 32,
          height: Math.max(400, Math.min(600, container.clientWidth * 0.6))
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [showGraph]);

  useEffect(() => {
    if (!result || !showGraph || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Prepare data
    const nodes: GraphNode[] = Array.from(result.courses.values()).map(course => ({
      id: course.name,
      name: course.name,
      color: course.color,
      slot: course.slot
    }));

    const links: GraphLink[] = [];
    result.courses.forEach(course => {
      course.conflicts.forEach(conflictCourse => {
        if (course.name < conflictCourse) {
          links.push({
            source: course.name,
            target: conflictCourse
          });
        }
      });
    });

    // Create container
    const container = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create simulation
    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links).id(d => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(innerWidth / 2, innerHeight / 2))
      .force('collision', d3.forceCollide().radius(35));

    // Create links
    const link = container.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2);

    // Create nodes
    const node = container.append('g')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer');

    // Add circles to nodes
    node.append('circle')
      .attr('r', 25)
      .attr('fill', d => d.color || '#ccc')
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .style('filter', 'drop-shadow(2px 2px 4px rgba(0,0,0,0.2))');

    // Add labels to nodes
    node.append('text')
      .text(d => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', '#fff')
      .style('pointer-events', 'none');

    // Add slot labels below nodes
    node.append('text')
      .text(d => `Slot ${d.slot}`)
      .attr('text-anchor', 'middle')
      .attr('dy', '35px')
      .attr('font-size', '8px')
      .attr('fill', '#666')
      .style('pointer-events', 'none');

    // Add hover interactions
    node
      .on('mouseenter', function(event, d) {
        // Highlight connected links
        link
          .style('stroke', l => 
            (l.source as GraphNode).id === d.id || (l.target as GraphNode).id === d.id 
              ? '#ff6b6b' : '#999'
          )
          .style('stroke-width', l => 
            (l.source as GraphNode).id === d.id || (l.target as GraphNode).id === d.id 
              ? 4 : 2
          );

        // Highlight connected nodes
        node.select('circle')
          .style('opacity', n => {
            if (n.id === d.id) return 1;
            const isConnected = links.some(l => 
              ((l.source as GraphNode).id === d.id && (l.target as GraphNode).id === n.id) ||
              ((l.target as GraphNode).id === d.id && (l.source as GraphNode).id === n.id)
            );
            return isConnected ? 1 : 0.3;
          });
      })
      .on('mouseleave', function() {
        // Reset styles
        link
          .style('stroke', '#999')
          .style('stroke-width', 2);
        
        node.select('circle')
          .style('opacity', 1);
      });

    // Enable dragging
    node.call(d3.drag<SVGGElement, GraphNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }));

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x!)
        .attr('y1', d => (d.source as GraphNode).y!)
        .attr('x2', d => (d.target as GraphNode).x!)
        .attr('y2', d => (d.target as GraphNode).y!);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

  }, [result, showGraph, dimensions]);

  if (!result) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5 text-blue-600" />
              Conflict Graph
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Label htmlFor="graph-toggle" className="text-sm">
                {showGraph ? <Eye className="w-4 h-4 inline mr-1" /> : <EyeOff className="w-4 h-4 inline mr-1" />}
                {showGraph ? 'Hide' : 'Show'} Graph
              </Label>
              <Switch
                id="graph-toggle"
                checked={showGraph}
                onCheckedChange={setShowGraph}
              />
            </div>
          </div>
        </CardHeader>
        {showGraph && (
          <CardContent>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full bg-gray-50 rounded-lg p-4"
            >
              <svg ref={svgRef} className="w-full" />
              <div className="mt-4 text-sm text-gray-600 text-center">
                <p>Hover over nodes to highlight connections • Drag nodes to reposition</p>
                <p className="mt-1">Node colors represent exam time slots</p>
              </div>
            </motion.div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}