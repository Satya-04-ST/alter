'use client';

import React, { useState } from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { DocumentUploader } from '../shared/DocumentUploader';
import { ChunkViewer } from '../shared/ChunkViewer';
import { PlannerCalendar } from '../planner/PlannerCalendar';
import { TaskCutListView } from '../planner/TaskCutListView';
import { QuizView } from '../research/QuizView';
import { SynthesisNotebook } from '../research/SynthesisNotebook';
import { ResearchGraphView } from '../research/ResearchGraphView';
import { InteractiveReactFlowGraph } from '../research/InteractiveReactFlowGraph';
import { HackathonFeedView } from '../aggregators/HackathonFeedView';
import {
  FileText,
  UploadCloud,
  Layers,
  Sparkles,
  BookOpen,
  Calendar as CalendarIcon,
  ListTodo,
  CheckCircle2,
  GraduationCap,
  Network,
  Trophy,
  GitBranch,
} from 'lucide-react';

export function CenterPanel() {
  const { activeDocument } = useWorkspaceStore();
  const [viewMode, setViewMode] = useState<
    'INGESTION' | 'READER' | 'CHUNKS' | 'PLANNER' | 'TASKS' | 'QUIZ' | 'SYNTHESIS' | 'GRAPH' | 'REACT_FLOW' | 'HACKATHONS'
  >('INGESTION');

  return (
    <div className="h-full flex flex-col glass-panel bg-void-950/40 overflow-hidden">
      {/* Center Panel Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-2 bg-void-900/60 overflow-x-auto gap-2">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            Workspace
          </span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-void-950 p-1 rounded-xl border border-slate-800 flex-shrink-0">
          <button
            onClick={() => setViewMode('INGESTION')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'INGESTION'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Ingest</span>
          </button>

          <button
            onClick={() => setViewMode('PLANNER')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'PLANNER'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Planner</span>
          </button>

          <button
            onClick={() => setViewMode('TASKS')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'TASKS'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Cut-List</span>
          </button>

          <button
            onClick={() => setViewMode('QUIZ')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'QUIZ'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Quizzer</span>
          </button>

          <button
            onClick={() => setViewMode('SYNTHESIS')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'SYNTHESIS'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Synthesis</span>
          </button>

          <button
            onClick={() => setViewMode('REACT_FLOW')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'REACT_FLOW'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>React Flow DAG</span>
          </button>

          <button
            onClick={() => setViewMode('HACKATHONS')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'HACKATHONS'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Hackathons</span>
          </button>

          <button
            onClick={() => setViewMode('GRAPH')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'GRAPH'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Knowledge Graph</span>
          </button>

          <button
            onClick={() => setViewMode('READER')}
            disabled={!activeDocument}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              viewMode === 'READER'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Reader</span>
          </button>

          <button
            onClick={() => setViewMode('CHUNKS')}
            disabled={!activeDocument}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              viewMode === 'CHUNKS'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Chunks</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Canvas */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* PLANNER VIEW */}
        {viewMode === 'PLANNER' && <PlannerCalendar />}

        {/* TASKS VIEW */}
        {viewMode === 'TASKS' && <TaskCutListView />}

        {/* QUIZ VIEW */}
        {viewMode === 'QUIZ' && <QuizView />}

        {/* SYNTHESIS NOTEBOOK VIEW */}
        {viewMode === 'SYNTHESIS' && <SynthesisNotebook />}

        {/* REACT FLOW DAG VIEW */}
        {viewMode === 'REACT_FLOW' && <InteractiveReactFlowGraph />}

        {/* HACKATHONS FEED VIEW */}
        {viewMode === 'HACKATHONS' && <HackathonFeedView />}

        {/* RESEARCH GRAPH VIEW */}
        {viewMode === 'GRAPH' && <ResearchGraphView />}

        {/* INGESTION VIEW */}
        {viewMode === 'INGESTION' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Document Ingestion & Multi-Tenant Pipeline
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Upload your course syllabus, degree handbook, or resume. The ingestion pipeline runs OCR, markdown sanitization, 400-token chunking, and dual-storage upsert into PostgreSQL and pgvector.
                  </p>
                </div>
              </div>

              <DocumentUploader />
            </div>

            {/* Ingestion Pipeline Architecture Flow */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-void-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
                  <FileText className="w-4 h-4" />
                  <span>1. Parsing & OCR</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Extracts structured text from PDFs via <code className="text-cyan-300 font-mono">pdf-parse</code> with automatic fallback to <code className="text-cyan-300 font-mono">tesseract.js</code> OCR.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-void-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold">
                  <Layers className="w-4 h-4" />
                  <span>2. Context Splitter</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Splits text into 400-token chunks with 50-token overlap, tagged with Module and Subject metadata.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-void-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                  <Sparkles className="w-4 h-4" />
                  <span>3. pgvector Storage</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Generates dense 768-dim embeddings partitioned by <code className="text-emerald-300 font-mono">userId</code> for cross-persona RAG.
                </p>
              </div>
            </div>

            {/* Active Document Quick Summary */}
            {activeDocument && (
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-white">Active Document Loaded</span>
                  </div>
                  <button
                    onClick={() => setViewMode('READER')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-mono"
                  >
                    Open in Reader →
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-void-950/80 font-mono text-xs text-slate-300 flex items-center justify-between">
                  <span>{activeDocument.fileName}</span>
                  <span className="text-cyan-400">{activeDocument.fileType}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* READER VIEW */}
        {viewMode === 'READER' && activeDocument && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">{activeDocument.fileName}</h3>
                <p className="text-xs text-slate-400 font-mono">
                  Type: {activeDocument.fileType} | Status: {activeDocument.status}
                </p>
              </div>
              <button
                onClick={() => setViewMode('CHUNKS')}
                className="px-3 py-1.5 rounded-xl bg-void-900 border border-slate-800 text-xs text-cyan-300 hover:bg-slate-800 flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                View Vector Chunks ({activeDocument.chunks?.length || 0})
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-void-900/90 border border-slate-800/80 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap max-h-[600px] overflow-y-auto">
              {activeDocument.parsedText || 'No text extracted for this document.'}
            </div>
          </div>
        )}

        {/* CHUNKS VIEW */}
        {viewMode === 'CHUNKS' && activeDocument && (
          <ChunkViewer
            chunks={activeDocument.chunks || []}
            documentName={activeDocument.fileName}
          />
        )}
      </div>

      {/* Footer Status */}
      <div className="p-3 border-t border-slate-800/80 bg-void-950/80 text-[11px] text-slate-500 flex items-center justify-between">
        <span>ALTER Panel 2/3 (40%)</span>
        <span className="font-mono text-cyan-400">Planner & RAG Engine Active</span>
      </div>
    </div>
  );
}
