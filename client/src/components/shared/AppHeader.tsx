'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { PersonaToggle } from '../floating-console/PersonaToggle';
import {
  LogOut,
  User,
  GraduationCap,
  Sparkles,
  LayoutGrid,
  Calendar,
  BookOpen,
  FlaskConical,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';

export function AppHeader() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const {
    leftPanelCollapsed,
    rightPanelCollapsed,
    toggleLeftPanel,
    toggleRightPanel,
  } = useWorkspaceStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-void-950/80 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between z-30 sticky top-0">
      {/* Brand & Left Panel Control */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleLeftPanel}
          title={leftPanelCollapsed ? 'Expand Left Panel' : 'Collapse Left Panel'}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          {leftPanelCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>

        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            A
          </div>
          <div>
            <span className="font-bold tracking-wider text-white text-base">ALTER</span>
            <span className="hidden sm:inline-block text-[10px] ml-2 px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/20">
              ACADEMIC RAG
            </span>
          </div>
        </Link>
      </div>

      {/* Center Persona Selector */}
      <div className="hidden md:flex items-center justify-center">
        <PersonaToggle />
      </div>

      {/* Right Controls & User Profile */}
      <div className="flex items-center gap-3">
        {user && (
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-void-900 border border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span>Sem {user.currentSemester}</span>
            </div>
            <div className="w-px h-3.5 bg-slate-800" />
            <div className="text-slate-400">
              GPA: <span className="text-white font-mono font-semibold">{user.gpa?.toFixed(2) || 'N/A'}</span>
            </div>
          </div>
        )}

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-white">{user?.name || 'Student'}</div>
            <div className="text-[10px] text-slate-400 truncate max-w-[120px] font-mono">
              {user?.targetRole || 'Scholar'}
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Right Panel Toggle */}
        <button
          onClick={toggleRightPanel}
          title={rightPanelCollapsed ? 'Expand Right Panel' : 'Collapse Right Panel'}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          {rightPanelCollapsed ? <PanelRightOpen className="w-5 h-5" /> : <PanelRightClose className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}
