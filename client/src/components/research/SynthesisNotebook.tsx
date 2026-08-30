'use client';

import React, { useState } from 'react';
import { useResearchStore } from '../../store/researchStore';
import {
  BookOpen,
  Sparkles,
  Download,
  Copy,
  Check,
  Layers,
  FileText,
  Loader2,
  Share2,
} from 'lucide-react';

export function SynthesisNotebook() {
  const { studyGuide, synthesizeStudyGuide, isLoading, error } = useResearchStore();
  const [topicInput, setTopicInput] = useState('Distributed Systems & Autonomous Consensus');
  const [isCopied, setIsCopied] = useState(false);

  const handleSynthesize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim() || isLoading) return;
    synthesizeStudyGuide(topicInput);
  };

  const handleCopy = () => {
    if (!studyGuide) return;
    navigator.clipboard.writeText(studyGuide.markdownContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!studyGuide) return;
    const blob = new Blob([studyGuide.markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${studyGuide.title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Generator Card */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-void-900/70 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Multi-Source Synthesis Notebook
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Librarian Engine
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Aggregate syllabi, lecture transcripts, and research papers into executive study guides
              </p>
            </div>
          </div>
        </div>

        {/* Generator Form */}
        <form onSubmit={handleSynthesize} className="flex items-center gap-2">
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder="Enter research / curriculum topic to synthesize..."
            className="flex-1 px-4 py-2.5 bg-void-950 border border-slate-800 rounded-xl text-white text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            disabled={isLoading || !topicInput.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Synthesizing Guide...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-200" />
                Synthesize Guide
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}
      </div>

      {/* Synthesized Guide View */}
      {studyGuide && (
        <div className="glass-panel rounded-3xl border border-slate-800 bg-void-950/80 overflow-hidden shadow-2xl space-y-0">
          {/* Header Controls */}
          <div className="p-4 border-b border-slate-800 bg-void-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white font-mono">{studyGuide.title}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-xl bg-void-850 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied!' : 'Copy Markdown'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-xl bg-void-850 hover:bg-slate-800 border border-slate-700 text-xs text-cyan-300 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .md</span>
              </button>
            </div>
          </div>

          {/* Markdown Content Canvas */}
          <div className="p-6 text-xs leading-relaxed text-slate-200 font-sans space-y-4 max-h-[650px] overflow-y-auto whitespace-pre-wrap selection:bg-cyan-500/30">
            {studyGuide.markdownContent}
          </div>

          {/* Citations Footer */}
          {studyGuide.citations && studyGuide.citations.length > 0 && (
            <div className="p-4 border-t border-slate-800/80 bg-void-900/40 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Grounded Ingested Sources ({studyGuide.citations.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {studyGuide.citations.map((c, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-void-950 border border-slate-800 text-cyan-300"
                  >
                    #{idx + 1} {c.subjectTag || 'Syllabus'} (Mod {c.moduleIndex || 1})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
