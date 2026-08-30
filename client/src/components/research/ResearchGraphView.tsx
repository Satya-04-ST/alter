'use client';

import React, { useState, useEffect } from 'react';
import { useResearchStore, GraphNode } from '../../store/researchStore';
import {
  Network,
  Sparkles,
  FileText,
  Layers,
  Search,
  ExternalLink,
  BookOpen,
  Info,
  Loader2,
} from 'lucide-react';

const NODE_COLORS: Record<string, { bg: string; border: string; text: string; label: string }> = {
  CORE_CONCEPT: {
    bg: 'bg-cyan-500/20',
    border: 'border-cyan-500/50 shadow-cyan-500/20',
    text: 'text-cyan-300',
    label: 'Core Concept',
  },
  PREREQUISITE: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/50 shadow-purple-500/20',
    text: 'text-purple-300',
    label: 'Prerequisite',
  },
  PAPER: {
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/50 shadow-emerald-500/20',
    text: 'text-emerald-300',
    label: 'ArXiv Paper',
  },
  ADVANCED_TOPIC: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/50 shadow-amber-500/20',
    text: 'text-amber-300',
    label: 'Advanced Topic',
  },
};

export function ResearchGraphView() {
  const { graphData, paperSummary, fetchResearchGraph, isLoading, error } = useResearchStore();
  const [topicInput, setTopicInput] = useState('Distributed Consensus & Swarm Robotics');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    fetchResearchGraph(topicInput);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim() || isLoading) return;
    fetchResearchGraph(topicInput);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Search Card */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-void-900/70 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center shadow-inner">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Interactive Research & Dependency Graph
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Concept Mapping
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Visualize multi-layered prerequisite hierarchies, research papers, and academic citations
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder="Enter research field or syllabus module to graph..."
            className="flex-1 px-4 py-2.5 bg-void-950 border border-slate-800 rounded-xl text-white text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            disabled={isLoading || !topicInput.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-500/20 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mapping Graph...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-purple-200" />
                Generate Graph
              </>
            )}
          </button>
        </form>
      </div>

      {/* Main Graph Canvas & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Graph Visualizer (2 Cols) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 bg-void-950/80 min-h-[480px] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Knowledge Graph: {graphData?.topic || topicInput}
            </span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              {graphData?.nodes.length || 0} Nodes | {graphData?.edges.length || 0} Relations
            </span>
          </div>

          {/* Node-Edge Interactive SVG Board */}
          <div className="relative w-full h-[380px] my-auto">
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {graphData?.edges.map((edge) => {
                const sourceNode = graphData.nodes.find((n) => n.id === edge.source);
                const targetNode = graphData.nodes.find((n) => n.id === edge.target);
                if (!sourceNode || !targetNode) return null;

                return (
                  <g key={edge.id}>
                    <line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke="#334155"
                      strokeWidth="2"
                      strokeDasharray="4"
                    />
                    <text
                      x={(sourceNode.x + targetNode.x) / 2}
                      y={(sourceNode.y + targetNode.y) / 2 - 5}
                      fill="#64748B"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {edge.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Nodes */}
            {graphData?.nodes.map((node) => {
              const color = NODE_COLORS[node.type] || NODE_COLORS.CORE_CONCEPT;
              const isSelected = selectedNode?.id === node.id;

              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  style={{
                    position: 'absolute',
                    left: `${node.x - 60}px`,
                    top: `${node.y - 20}px`,
                  }}
                  className={`w-[130px] p-2 rounded-xl text-center border transition-all duration-200 backdrop-blur-md shadow-lg ${
                    color.bg
                  } ${color.border} ${
                    isSelected ? 'ring-2 ring-cyan-400 scale-105 z-10' : 'hover:scale-105'
                  }`}
                >
                  <div className="text-[11px] font-bold text-white truncate">{node.label}</div>
                  <div className={`text-[9px] font-mono ${color.text}`}>{color.label}</div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/80 text-[10px] font-mono">
            {Object.entries(NODE_COLORS).map(([typeKey, conf]) => (
              <div key={typeKey} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${conf.bg} border ${conf.border}`} />
                <span className="text-slate-400">{conf.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Node & Paper Inspector (1 Col) */}
        <div className="space-y-4">
          {/* Selected Node Details */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 bg-void-900/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Info className="w-4 h-4" />
              <span>Concept Inspector</span>
            </div>

            {selectedNode ? (
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white">{selectedNode.label}</h4>
                <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-void-950 text-purple-300 border border-purple-500/30">
                  {selectedNode.type}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {selectedNode.description}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-4">
                Click any node on the graph canvas to inspect its formal definitions and dependencies.
              </p>
            )}
          </div>

          {/* Recommended Paper Summary */}
          {paperSummary && (
            <div className="glass-panel p-5 rounded-3xl border border-emerald-500/30 bg-emerald-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <BookOpen className="w-4 h-4" />
                  <span>Foundational Literature</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{paperSummary.year}</span>
              </div>

              <h5 className="text-xs font-bold text-white leading-snug">
                {paperSummary.title}
              </h5>
              <div className="text-[10px] font-mono text-slate-400">{paperSummary.authors}</div>
              <div className="text-[10px] font-mono text-cyan-300 bg-void-950 px-2 py-0.5 rounded border border-slate-800 inline-block">
                {paperSummary.arxivId}
              </div>

              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Key Innovations:
                </span>
                <ul className="text-[11px] text-slate-300 space-y-1 list-disc pl-4">
                  {paperSummary.keyContributions.map((c: string, idx: number) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
