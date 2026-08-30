'use client';

import React, { useState } from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useAuthStore } from '../../store/authStore';
import { usePlannerStore } from '../../store/plannerStore';
import {
  Compass,
  BookCheck,
  GraduationCap,
  FileEdit,
  Coffee,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ListTodo,
  FileText,
  Layers,
  Database,
  Scissors,
  RotateCcw,
} from 'lucide-react';

const PERSONA_DETAILS = {
  ADVISOR: {
    title: 'ALTER-Advisor',
    letter: 'A',
    role: 'Career Path & Degree Auditing',
    tone: 'Strategic, objective, structured, pragmatic',
    icon: Compass,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/30',
    description:
      'Maps syllabus objectives to concrete industry skills, detects prerequisite gaps, and structures study milestones.',
  },
  LIBRARIAN: {
    title: 'ALTER-Librarian',
    letter: 'L',
    role: 'RAG Grounding & Reference Discovery',
    tone: 'Academic, precise, reference-oriented',
    icon: BookCheck,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    description:
      'Retrieves and grounds answers strictly within ingested handbooks and textbooks with page & module citations.',
  },
  TUTOR: {
    title: 'ALTER-Tutor',
    letter: 'T',
    role: 'Socratic Concept Mastery & Quizzes',
    tone: 'Encouraging, didactic, analytical, interactive',
    icon: GraduationCap,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10 border-sky-500/30',
    description:
      'Breaks down complex technical concepts with analogies, code derivations, and dynamic multiple-choice quizzes.',
  },
  EDITOR: {
    title: 'ALTER-Editor',
    letter: 'E',
    role: 'Assignment & Resume Review',
    tone: 'Critical, professional, constructive',
    icon: FileEdit,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/30',
    description:
      'Provides line-by-line structural feedback on reports, research drafts, presentation outlines, and ATS resumes.',
  },
  ROOMMATE: {
    title: 'ALTER-Roommate',
    letter: 'R',
    role: 'Study Habit & Discipline Companion',
    tone: 'Informal, supportive, lighthearted, concise',
    icon: Coffee,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/30',
    description:
      'Tracks daily study streaks, prompts timely breaks, and maintains motivation without long lectures.',
  },
};

export function RightPanel() {
  const { activePersona, documents, activeDocument } = useWorkspaceStore();
  const { user } = useAuthStore();
  const { tasks, updateTaskStatus, runCutListTriage } = usePlannerStore();
  const [activeTab, setActiveTab] = useState<'PERSONA' | 'SYNTHESIS' | 'CUTLIST'>('PERSONA');

  const persona = PERSONA_DETAILS[activePersona];
  const Icon = persona.icon;

  const totalChunks = documents.reduce((acc, d) => acc + (d.chunkCount || 0), 0);

  return (
    <div className="h-full flex flex-col glass-panel border-l border-slate-800/80 bg-void-950/60 overflow-hidden">
      {/* Panel Nav Tabs */}
      <div className="flex items-center border-b border-slate-800/80 px-3 py-2 gap-1 bg-void-900/40">
        {[
          { id: 'PERSONA', label: 'Active Persona', icon: Sparkles },
          { id: 'SYNTHESIS', label: 'RAG Stats', icon: Database },
          { id: 'CUTLIST', label: 'Cut-List', icon: ListTodo },
        ].map((tab) => {
          const TabIcon = tab.icon;
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
              <TabIcon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Panel Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ACTIVE PERSONA TAB */}
        {activeTab === 'PERSONA' && (
          <div className="space-y-4">
            <div className={`p-5 rounded-2xl border ${persona.bg} space-y-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-void-950/80 flex items-center justify-center shadow-inner">
                    <Icon className={`w-5 h-5 ${persona.color}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{persona.title}</h3>
                    <p className={`text-[11px] font-mono ${persona.color}`}>[{persona.letter}] {persona.role}</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {persona.description}
              </p>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Tone:</span>
                <span className="text-slate-300">{persona.tone}</span>
              </div>
            </div>

            {/* Persona Quick Actions */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                Persona Directives
              </span>
              <div className="p-4 rounded-xl bg-void-900/60 border border-slate-800 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Grounded Ingestion Active
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Queries to this persona will retrieve top-k chunks from your <code className="text-white font-mono">{documents.length}</code> ingested documents.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* RAG STATS TAB */}
        {activeTab === 'SYNTHESIS' && (
          <div className="space-y-4">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
              Vector Store Integrity
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-void-900/80 border border-slate-800">
                <div className="text-[11px] font-mono text-slate-400">Documents</div>
                <div className="text-xl font-bold font-mono text-white mt-1">{documents.length}</div>
              </div>

              <div className="p-4 rounded-xl bg-void-900/80 border border-slate-800">
                <div className="text-[11px] font-mono text-slate-400">Total Chunks</div>
                <div className="text-xl font-bold font-mono text-cyan-400 mt-1">{totalChunks}</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-void-900/60 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Embedding Dimension</span>
                <span className="font-mono text-white">768-dim</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Tenant Isolation</span>
                <span className="font-mono text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  userId Partitioned
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Vector Metric</span>
                <span className="font-mono text-cyan-400">Cosine Distance (&lt;=&gt;)</span>
              </div>
            </div>
          </div>
        )}

        {/* CUT-LIST TAB */}
        {activeTab === 'CUTLIST' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                Priority Task Cut-List
              </span>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Crunch Triage
              </span>
            </div>

            {/* Quick Trigger Button */}
            <button
              onClick={() => runCutListTriage(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 border border-amber-500/30 text-xs font-semibold text-amber-200 flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Scissors className="w-3.5 h-3.5 text-amber-400" />
              <span>Run Advisor Cut-List Triage</span>
            </button>

            {/* Task summary stats */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-void-900 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Active Tasks</div>
                <div className="text-white font-bold mt-0.5">{tasks.filter((t) => !t.isCut).length}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-void-900 border border-slate-800">
                <div className="text-rose-400 text-[10px]">Triaged Cut</div>
                <div className="text-rose-300 font-bold mt-0.5">{tasks.filter((t) => t.isCut).length}</div>
              </div>
            </div>

            {/* Task list preview */}
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {tasks.length === 0 ? (
                <div className="p-6 text-center border border-slate-800/80 rounded-2xl bg-void-900/40">
                  <ListTodo className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                  <p className="text-xs text-slate-400">No active tasks logged.</p>
                </div>
              ) : (
                tasks.slice(0, 6).map((t) => (
                  <div
                    key={t.id}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                      t.isCut
                        ? 'bg-rose-950/20 border-rose-900/40 text-rose-300 opacity-75'
                        : 'bg-void-900 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="truncate flex-1">
                      <div className="font-medium truncate text-[11px]">{t.title}</div>
                      <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="text-cyan-400">{t.priority}</span>
                        {t.isCut && <span className="text-rose-400 font-bold">• CUT</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => updateTaskStatus(t.id, t.isCut ? 'TODO' : 'CUT', !t.isCut)}
                      title={t.isCut ? 'Restore task' : 'Cut task'}
                      className="p-1 rounded text-slate-400 hover:text-white"
                    >
                      {t.isCut ? <RotateCcw className="w-3.5 h-3.5 text-emerald-400" /> : <Scissors className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/80 bg-void-950/80 text-[11px] text-slate-500 flex items-center justify-between">
        <span>ALTER Panel 3/3 (30%)</span>
        <span className="font-mono text-purple-400">Persona Router</span>
      </div>
    </div>
  );
}
