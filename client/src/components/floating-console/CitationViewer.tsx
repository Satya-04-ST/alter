'use client';

import React, { useState } from 'react';
import { Citation } from '../../hooks/usePersonaChat';
import { BookOpen, ChevronDown, ChevronUp, Copy, Check, Sparkles } from 'lucide-react';

interface CitationViewerProps {
  citations: Citation[];
}

export function CitationViewer({ citations }: CitationViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!citations || citations.length === 0) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="mt-3 pt-2 border-t border-slate-800/80">
      {/* Citation Summary Pill */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 transition-colors"
      >
        <BookOpen className="w-3 h-3 text-cyan-400" />
        <span>Grounded in {citations.length} Syllabus Chunks</span>
        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {/* Expanded Sources Panel */}
      {isExpanded && (
        <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-1">
          {citations.map((cite, idx) => (
            <div
              key={cite.id || idx}
              className="p-2.5 rounded-lg bg-void-950/90 border border-slate-800 text-[11px] font-mono space-y-1.5"
            >
              <div className="flex items-center justify-between text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">#{idx + 1}</span>
                  {cite.subjectTag && (
                    <span className="text-slate-300 truncate max-w-[140px]">{cite.subjectTag}</span>
                  )}
                  {cite.moduleIndex && (
                    <span className="text-purple-300">Mod {cite.moduleIndex}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                    {(cite.similarity * 100).toFixed(0)}% match
                  </span>
                  <button
                    onClick={() => handleCopy(cite.id, cite.content)}
                    className="text-slate-500 hover:text-white"
                    title="Copy Citation"
                  >
                    {copiedId === cite.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              <p className="text-slate-300 text-[10px] leading-relaxed line-clamp-3">
                {cite.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
