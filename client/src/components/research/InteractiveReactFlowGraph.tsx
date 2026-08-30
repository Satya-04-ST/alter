'use client';

import React, { useState, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Position,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Network, Sparkles, Layers, Info } from 'lucide-react';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Distributed Systems Core (CS402)' },
    position: { x: 250, y: 25 },
    style: {
      background: 'rgba(6, 182, 212, 0.15)',
      border: '1px solid rgba(6, 182, 212, 0.6)',
      color: '#fff',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: 'bold',
      fontFamily: 'monospace',
      padding: '12px',
      boxShadow: '0 0 15px rgba(6, 182, 212, 0.2)',
    },
  },
  {
    id: '2',
    data: { label: 'Consensus & Raft Quorums' },
    position: { x: 100, y: 140 },
    style: {
      background: 'rgba(139, 92, 246, 0.15)',
      border: '1px solid rgba(139, 92, 246, 0.6)',
      color: '#fff',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: 'bold',
      fontFamily: 'monospace',
      padding: '12px',
    },
  },
  {
    id: '3',
    data: { label: 'Vector Clocks & State Machine Replication' },
    position: { x: 420, y: 140 },
    style: {
      background: 'rgba(16, 185, 129, 0.15)',
      border: '1px solid rgba(16, 185, 129, 0.6)',
      color: '#fff',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: 'bold',
      fontFamily: 'monospace',
      padding: '12px',
    },
  },
  {
    id: '4',
    data: { label: 'Autonomous Swarm Robotics (ROB701)' },
    position: { x: 100, y: 260 },
    style: {
      background: 'rgba(245, 158, 11, 0.15)',
      border: '1px solid rgba(245, 158, 11, 0.6)',
      color: '#fff',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: 'bold',
      fontFamily: 'monospace',
      padding: '12px',
    },
  },
  {
    id: '5',
    data: { label: 'BFT Decentralized Sensor Fusion' },
    position: { x: 420, y: 260 },
    style: {
      background: 'rgba(236, 72, 153, 0.15)',
      border: '1px solid rgba(236, 72, 153, 0.6)',
      color: '#fff',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: 'bold',
      fontFamily: 'monospace',
      padding: '12px',
    },
  },
  {
    id: '6',
    type: 'output',
    data: { label: 'Lamport et al. (2024) Swarm Invariants' },
    position: { x: 260, y: 380 },
    style: {
      background: 'rgba(99, 102, 241, 0.25)',
      border: '1px solid rgba(99, 102, 241, 0.8)',
      color: '#fff',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: 'bold',
      fontFamily: 'monospace',
      padding: '12px',
      boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
    },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#06B6D4' } },
  { id: 'e1-3', source: '1', target: '3', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#06B6D4' } },
  { id: 'e2-4', source: '2', target: '4', markerEnd: { type: MarkerType.ArrowClosed, color: '#8B5CF6' } },
  { id: 'e3-5', source: '3', target: '5', markerEnd: { type: MarkerType.ArrowClosed, color: '#10B981' } },
  { id: 'e4-6', source: '4', target: '6', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#6366F1' } },
  { id: 'e5-6', source: '5', target: '6', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#6366F1' } },
];

export function InteractiveReactFlowGraph() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeData, setSelectedNodeData] = useState<any | null>(null);

  const onNodeClick = (_: any, node: Node) => {
    setSelectedNodeData(node.data);
  };

  return (
    <div className="glass-panel p-5 rounded-3xl border border-slate-800 bg-void-950/80 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
            Interactive React Flow Concept DAG
          </h4>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-void-900 px-2 py-0.5 rounded border border-slate-800">
          Drag, Pan & Inspect Nodes
        </span>
      </div>

      <div className="w-full h-[420px] rounded-2xl overflow-hidden border border-slate-800 bg-void-950 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
        >
          <Background color="#1e293b" gap={16} size={1} />
          <Controls className="bg-void-900 border-slate-800 text-white fill-white stroke-white" />
          <MiniMap
            nodeColor="#38bdf8"
            maskColor="rgba(2, 6, 23, 0.7)"
            className="bg-void-950 border border-slate-800 rounded-xl"
          />
        </ReactFlow>
      </div>

      {selectedNodeData && (
        <div className="p-3 rounded-xl bg-void-900/90 border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>Selected Node: {selectedNodeData.label}</span>
          </div>
          <span className="text-[10px] text-slate-400">Connected in Active DAG</span>
        </div>
      )}
    </div>
  );
}
