'use client';

import React, { useState } from 'react';
import { DocumentChunk } from '../../store/workspaceStore';
import { Layers, Database, Sparkles, Search, Check, Copy } from 'lucide-react';

interface ChunkViewerProps {
  chunks: DocumentChunk[];
  documentName: string;
}

export function ChunkViewer({ chunks, documentName }: ChunkViewerProps) {
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredChunks = chunks.filter(
    (c) =>
      c.content.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (c.subjectTag && c.subjectTag.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header & Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold text-white">Generated Vector Chunks</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
            {chunks.length} Total
          </span>
        </div>

        {/* Search */}
        <div className="relative w-48 sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter chunk text..."
            className="w-full pl-8 pr-3 py-1.5 bg-void-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Chunk List */}
      {filteredChunks.length === 0 ? (
        <div className="p-8 text-center border border-slate-800/80 rounded-2xl bg-void-900/30">
          <Layers className="w-8 h-8 mx-auto text-slate-600 mb-2" />
          <p className="text-xs text-slate-400">
            {chunks.length === 0
              ? 'No chunks generated yet. Processing or document is empty.'
              : 'No chunks matching search filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {filteredChunks.map((chunk, idx) => (
            <div
              key={chunk.id || idx}
              className="p-4 rounded-xl bg-void-900/80 border border-slate-800 hover:border-slate-700 transition-all group"
            >
              {/* Chunk Meta Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    Chunk #{idx + 1}
                  </span>
                  {chunk.moduleIndex && (
                    <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      Module {chunk.moduleIndex}
                    </span>
                  )}
                  {chunk.subjectTag && (
                    <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 truncate max-w-[150px]">
                      {chunk.subjectTag}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-void-950 px-2 py-0.5 rounded">
                    <Database className="w-3 h-3 text-cyan-400" />
                    768-dim Vector
                  </span>
                  <button
                    onClick={() => handleCopy(chunk.id, chunk.content)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Copy Chunk"
                  >
                    {copiedId === chunk.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Chunk Content */}
              <p className="text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap line-clamp-6 group-hover:line-clamp-none transition-all">
                {chunk.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
