'use client';

import React from 'react';
import { useWorkspaceStore, PersonaType } from '../../store/workspaceStore';
import { Compass, BookCheck, GraduationCap, FileEdit, Coffee } from 'lucide-react';

const PERSONAS: {
  id: PersonaType;
  letter: string;
  name: string;
  role: string;
  icon: React.ElementType;
  activeClass: string;
  glowClass: string;
}[] = [
  {
    id: 'ADVISOR',
    letter: 'A',
    name: 'Advisor',
    role: 'Curriculum & Roadmaps',
    icon: Compass,
    activeClass: 'bg-purple-600 text-white shadow-glow-advisor',
    glowClass: 'border-purple-500/50 text-purple-400',
  },
  {
    id: 'LIBRARIAN',
    letter: 'L',
    name: 'Librarian',
    role: 'RAG Grounding & Papers',
    icon: BookCheck,
    activeClass: 'bg-emerald-600 text-white shadow-glow-librarian',
    glowClass: 'border-emerald-500/50 text-emerald-400',
  },
  {
    id: 'TUTOR',
    letter: 'T',
    name: 'Tutor',
    role: 'Socratic Concept Mastery',
    icon: GraduationCap,
    activeClass: 'bg-sky-600 text-white shadow-glow-tutor',
    glowClass: 'border-sky-500/50 text-sky-400',
  },
  {
    id: 'EDITOR',
    letter: 'E',
    name: 'Editor',
    role: 'Draft & Resume Critique',
    icon: FileEdit,
    activeClass: 'bg-amber-600 text-white shadow-glow-editor',
    glowClass: 'border-amber-500/50 text-amber-400',
  },
  {
    id: 'ROOMMATE',
    letter: 'R',
    name: 'Roommate',
    role: 'Pacing & Discipline',
    icon: Coffee,
    activeClass: 'bg-rose-600 text-white shadow-glow-roommate',
    glowClass: 'border-rose-500/50 text-rose-400',
  },
];

export function PersonaToggle() {
  const { activePersona, setPersona } = useWorkspaceStore();

  return (
    <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-void-900/90 border border-slate-800 shadow-inner">
      {PERSONAS.map((p) => {
        const isActive = activePersona === p.id;
        const Icon = p.icon;

        return (
          <button
            key={p.id}
            onClick={() => setPersona(p.id)}
            className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              isActive
                ? `${p.activeClass} scale-100`
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <span className="font-mono text-sm font-bold">[{p.letter}]</span>
            <span className="hidden sm:inline-block font-sans">{p.name}</span>

            {/* Hover Tooltip */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center px-2.5 py-1 bg-void-900 text-[11px] text-slate-300 rounded-md border border-slate-700 whitespace-nowrap shadow-xl z-50 pointer-events-none">
              <Icon className="w-3 h-3 mr-1.5 text-cyan-400" />
              {p.role}
            </div>
          </button>
        );
      })}
    </div>
  );
}
