'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspaceStore, DocumentItem } from '../../store/workspaceStore';
import { usePomodoroStore } from '../../store/pomodoroStore';
import { PomodoroWidget } from '../shared/PomodoroWidget';
import {
  FolderOpen,
  FileText,
  Trash2,
  Plus,
  Compass,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  GraduationCap,
  Layers,
} from 'lucide-react';

export function LeftPanel() {
  const {
    documents,
    activeDocument,
    fetchDocuments,
    setActiveDocument,
    deleteDocument,
  } = useWorkspaceStore();

  const {
    mode,
    timeLeft,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    setMode,
    tick,
    focusedMinutesToday,
  } = usePomodoroStore();

  const [activeTab, setActiveTab] = useState<'DOCUMENTS' | 'ROADMAP' | 'POMODORO'>('DOCUMENTS');

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Pomodoro Interval Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, tick]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col glass-panel border-r border-slate-800/80 bg-void-950/60 overflow-hidden">
      {/* Panel Nav Tabs */}
      <div className="flex items-center border-b border-slate-800/80 px-3 py-2 gap-1 bg-void-900/40">
        {[
          { id: 'DOCUMENTS', label: 'Documents', icon: FolderOpen },
          { id: 'ROADMAP', label: 'Roadmap', icon: Compass },
          { id: 'POMODORO', label: 'Focus', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-void-850 text-cyan-300 border border-slate-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Panel Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* DOCUMENTS TAB */}
        {activeTab === 'DOCUMENTS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                Ingested Knowledge Base
              </span>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                {documents.length} Files
              </span>
            </div>

            {documents.length === 0 ? (
              <div className="p-6 text-center border border-slate-800/80 rounded-2xl bg-void-900/40">
                <FileText className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p className="text-xs text-slate-400">No documents ingested yet.</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Upload your syllabus or handbook in the center panel to begin RAG grounding.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => {
                  const isSelected = activeDocument?.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setActiveDocument(doc)}
                      className={`p-3 rounded-xl cursor-pointer transition-all border flex items-start justify-between group ${
                        isSelected
                          ? 'bg-cyan-950/30 border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                          : 'bg-void-900/60 border-slate-800/80 hover:bg-void-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 overflow-hidden">
                        <div className="mt-0.5 w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <h4 className="text-xs font-medium text-white truncate group-hover:text-cyan-300">
                            {doc.fileName}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                              {doc.fileType}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {doc.chunkCount || 0} chunks
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteDocument(doc.id);
                        }}
                        title="Delete Document"
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ROADMAP TAB */}
        {activeTab === 'ROADMAP' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                Prerequisite Milestones
              </span>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                AI Advisor
              </span>
            </div>

            <div className="space-y-3">
              {[
                { title: 'Foundations of Distributed Systems', status: 'In Progress', progress: 65 },
                { title: 'High-Concurrency Event Streaming (Kafka)', status: 'Upcoming', progress: 20 },
                { title: 'Vector DBs & pgvector Search Architectures', status: 'Mastered', progress: 100 },
                { title: 'Kubernetes Container Orchestration', status: 'Planned', progress: 0 },
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-void-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{item.title}</span>
                    <span className="font-mono text-[10px] text-cyan-400">{item.progress}%</span>
                  </div>
                  <div className="w-full bg-void-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-cyan-400 h-1.5 rounded-full"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* POMODORO TAB */}
        {activeTab === 'POMODORO' && <PomodoroWidget />}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/80 bg-void-950/80 text-[11px] text-slate-500 flex items-center justify-between">
        <span>ALTER Panel 1/3 (30%)</span>
        <span className="font-mono text-cyan-400">Online</span>
      </div>
    </div>
  );
}
