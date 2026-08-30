'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { AppHeader } from '../../components/shared/AppHeader';
import { LeftPanel } from '../../components/panels/LeftPanel';
import { CenterPanel } from '../../components/panels/CenterPanel';
import { RightPanel } from '../../components/panels/RightPanel';
import { PersonaConsole } from '../../components/floating-console/PersonaConsole';
import { Loader2 } from 'lucide-react';

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const { leftPanelCollapsed, rightPanelCollapsed } = useWorkspaceStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-void-950 text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-xl shadow-cyan-500/25 animate-bounce">
          A
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400 font-mono">
          <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
          Synchronizing ALTER Workspace...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-void-950 text-slate-100 overflow-hidden relative">
      {/* Top Application Header */}
      <AppHeader />

      {/* 30 : 40 : 30 Three-Panel Workspace Shell */}
      <div className="flex-1 flex overflow-hidden h-[calc(100vh-4rem)]">
        {/* Left Panel (30%) */}
        <aside
          className={`transition-all duration-300 ease-in-out flex-shrink-0 ${
            leftPanelCollapsed ? 'w-0 hidden' : 'w-full lg:w-[30%] max-w-[420px]'
          }`}
        >
          <LeftPanel />
        </aside>

        {/* Center Panel (40%) */}
        <main
          className={`transition-all duration-300 ease-in-out flex-1 min-w-0 ${
            leftPanelCollapsed && rightPanelCollapsed
              ? 'w-full'
              : !leftPanelCollapsed && !rightPanelCollapsed
              ? 'lg:w-[40%]'
              : 'lg:w-[70%]'
          }`}
        >
          {children}
        </main>

        {/* Right Panel (30%) */}
        <aside
          className={`transition-all duration-300 ease-in-out flex-shrink-0 ${
            rightPanelCollapsed ? 'w-0 hidden' : 'w-full lg:w-[30%] max-w-[420px]'
          }`}
        >
          <RightPanel />
        </aside>
      </div>

      {/* Floating Multimodal Persona Console */}
      <PersonaConsole />
    </div>
  );
}
