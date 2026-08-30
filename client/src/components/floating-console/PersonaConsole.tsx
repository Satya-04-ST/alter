'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePersonaChat, ChatMessage } from '../../hooks/usePersonaChat';
import { CitationViewer } from './CitationViewer';
import { PersonaType } from '../../store/workspaceStore';
import {
  Sparkles,
  Send,
  X,
  Minimize2,
  Maximize2,
  Trash2,
  Compass,
  BookCheck,
  GraduationCap,
  FileEdit,
  Coffee,
  Loader2,
  StopCircle,
  CornerDownLeft,
  ChevronRight,
} from 'lucide-react';

const PERSONA_CONFIG: Record<
  PersonaType,
  {
    name: string;
    letter: string;
    role: string;
    accentColor: string;
    glowClass: string;
    borderClass: string;
    starters: string[];
    icon: React.ElementType;
  }
> = {
  ADVISOR: {
    name: 'Advisor',
    letter: 'A',
    role: 'Career Milestones & Cut-Lists',
    accentColor: 'text-purple-400',
    glowClass: 'shadow-glow-advisor',
    borderClass: 'border-purple-500/40',
    icon: Compass,
    starters: [
      'Map my courses to AI Systems Architect career skills',
      'Create a 3-week study roadmap for Distributed Systems',
      'Generate an exam crunch cut-list for this semester',
    ],
  },
  LIBRARIAN: {
    name: 'Librarian',
    letter: 'L',
    role: 'Literature & Syllabus Citations',
    accentColor: 'text-emerald-400',
    glowClass: 'shadow-glow-librarian',
    borderClass: 'border-emerald-500/40',
    icon: BookCheck,
    starters: [
      'Summarize Module 1 concepts from my uploaded syllabus',
      'Find key syllabus references for consensus algorithms',
      'Extract research topics and paper ideas from my curriculum',
    ],
  },
  TUTOR: {
    name: 'Tutor',
    letter: 'T',
    role: 'Socratic Concept Mastery',
    accentColor: 'text-sky-400',
    glowClass: 'shadow-glow-tutor',
    borderClass: 'border-sky-500/40',
    icon: GraduationCap,
    starters: [
      'Explain Raft consensus step-by-step with an analogy',
      'How does consistent hashing work in distributed key-value stores?',
      'Formulate a 3-question practice quiz on Module 2',
    ],
  },
  EDITOR: {
    name: 'Editor',
    letter: 'E',
    role: 'Assignment & Resume Critique',
    accentColor: 'text-amber-400',
    glowClass: 'shadow-glow-editor',
    borderClass: 'border-amber-500/40',
    icon: FileEdit,
    starters: [
      'Critique my resume skills against AI Systems Architect',
      'Review my project abstract for technical conciseness',
      'Highlight ATS keywords to add from my coursework',
    ],
  },
  ROOMMATE: {
    name: 'Roommate',
    letter: 'R',
    role: 'Pacing & Discipline Companion',
    accentColor: 'text-rose-400',
    glowClass: 'shadow-glow-roommate',
    borderClass: 'border-rose-500/40',
    icon: Coffee,
    starters: [
      "I'm starting a 25-minute Pomodoro session!",
      'Give me a quick motivation boost for finals week',
      'How should I structure my study breaks today?',
    ],
  },
};

export function PersonaConsole() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    isStreaming,
    error,
    activePersona,
    setPersona,
    sendMessage,
    cancelStreaming,
    clearHistory,
  } = usePersonaChat();

  const activeConfig = PERSONA_CONFIG[activePersona];
  const ActiveIcon = activeConfig.icon;

  // Global Hotkey (Cmd/Ctrl + K) to toggle console
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isStreaming) return;
    sendMessage(inputQuery);
    setInputQuery('');
  };

  const handleStarterClick = (starter: string) => {
    sendMessage(starter);
  };

  return (
    <>
      {/* Floating Trigger Pill (When Closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-void-900/95 border ${activeConfig.borderClass} ${activeConfig.glowClass} text-white shadow-2xl backdrop-blur-xl hover:scale-105 transition-all duration-200 group`}
        >
          <div className="w-8 h-8 rounded-xl bg-void-950 flex items-center justify-center shadow-inner">
            <ActiveIcon className={`w-4 h-4 ${activeConfig.accentColor} animate-pulse`} />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>ALTER Console</span>
              <span className={`font-mono text-[10px] ${activeConfig.accentColor}`}>
                [{activeConfig.letter}] {activeConfig.name}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Press Cmd/Ctrl + K</div>
          </div>
        </button>
      )}

      {/* Floating Assistant Console Modal */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ease-in-out flex flex-col glass-panel rounded-3xl border ${activeConfig.borderClass} ${activeConfig.glowClass} shadow-2xl backdrop-blur-2xl overflow-hidden ${
            isExpanded
              ? 'inset-4 md:inset-10'
              : 'bottom-6 right-6 w-full max-w-lg h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-void-950/80">
            {/* Persona Switcher Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {(Object.keys(PERSONA_CONFIG) as PersonaType[]).map((p) => {
                const conf = PERSONA_CONFIG[p];
                const isSelected = activePersona === p;
                return (
                  <button
                    key={p}
                    onClick={() => setPersona(p)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold font-mono transition-all flex items-center gap-1 ${
                      isSelected
                        ? `bg-void-850 ${conf.accentColor} border border-slate-700 shadow-sm`
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <span>[{conf.letter}]</span>
                    <span className="hidden sm:inline-block font-sans text-[11px]">{conf.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1 text-slate-400 pl-2">
              <button
                onClick={clearHistory}
                title="Clear Chat History"
                className="p-1.5 rounded-lg hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Restore' : 'Maximize'}
                className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close (Cmd/Ctrl + K)"
                className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Persona Banner */}
          <div className="px-4 py-2 bg-void-900/40 border-b border-slate-800/60 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <ActiveIcon className={`w-3.5 h-3.5 ${activeConfig.accentColor}`} />
              <span className="font-semibold text-white">ALTER-{activeConfig.name}:</span>
              <span className="text-slate-400 truncate max-w-[260px]">{activeConfig.role}</span>
            </div>
            <span className="font-mono text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              LangGraph Orchestrated
            </span>
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-void-900 border border-slate-800 flex items-center justify-center">
                  <ActiveIcon className={`w-6 h-6 ${activeConfig.accentColor}`} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">ALTER-{activeConfig.name} Online</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    {activeConfig.role}. Grounded in your ingested academic knowledge base.
                  </p>
                </div>

                {/* Prompt Starter Pills */}
                <div className="w-full space-y-2 pt-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    Suggested Inquiries
                  </span>
                  <div className="flex flex-col gap-1.5 text-left">
                    {activeConfig.starters.map((starter, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleStarterClick(starter)}
                        className="p-2.5 rounded-xl bg-void-900/80 hover:bg-void-850 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between group"
                      >
                        <span className="truncate pr-2">{starter}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'USER' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'USER'
                        ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-tr-sm shadow-md'
                        : 'bg-void-900/90 border border-slate-800 text-slate-200 rounded-tl-sm shadow-inner'
                    }`}
                  >
                    {/* Header for Persona */}
                    {msg.sender !== 'USER' && (
                      <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-slate-800 text-[10px] font-mono text-slate-400">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span className={`font-bold ${activeConfig.accentColor}`}>
                          ALTER-{msg.sender}
                        </span>
                      </div>
                    )}

                    {/* Message Body */}
                    <div className="whitespace-pre-wrap font-sans">
                      {msg.text}
                      {msg.isStreaming && (
                        <span className="inline-block w-1.5 h-3.5 bg-cyan-400 ml-1 animate-pulse" />
                      )}
                    </div>

                    {/* Grounding Citations */}
                    {msg.citations && msg.citations.length > 0 && (
                      <CitationViewer citations={msg.citations} />
                    )}
                  </div>
                </div>
              ))
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Input Form */}
          <form
            onSubmit={handleSubmit}
            className="p-3 border-t border-slate-800/80 bg-void-950/90 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={`Ask ALTER-${activeConfig.name} about your curriculum...`}
              disabled={isStreaming}
              className="flex-1 px-4 py-2.5 bg-void-900 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />

            {isStreaming ? (
              <button
                type="button"
                onClick={cancelStreaming}
                className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                title="Stop Streaming"
              >
                <StopCircle className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!inputQuery.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white transition-all shadow-md shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>
      )}
    </>
  );
}
