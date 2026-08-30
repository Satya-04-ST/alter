'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../store/authStore';
import { Sparkles, ArrowRight, ShieldCheck, Cpu, BookOpen, Clock } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <main className="min-h-screen flex flex-col justify-between p-6 md:p-12">
      {/* Top Header */}
      <header className="flex items-center justify-between max-w-7xl mx-auto w-full py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">
            A
          </div>
          <div>
            <span className="text-xl font-bold tracking-wider text-white">ALTER</span>
            <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
              v1.0 Phase-1
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-5 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 rounded-xl shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
          >
            Initialize Workspace
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center my-auto py-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono mb-6 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          Multi-Persona AI Academic Workspace & RAG Orchestrator
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Master Your Degree with{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Contextual AI Personas
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Ingest handbooks, syllabi, and timetables into an intelligent dense-vector knowledge base.
          Orchestrate your academic career through 5 specialized AI personas.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 rounded-xl shadow-xl shadow-indigo-500/25 hover:shadow-cyan-500/40 transition-all transform hover:-translate-y-0.5"
          >
            Launch ALTER Workspace
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-slate-300 bg-void-900 hover:bg-void-850 border border-slate-700/60 rounded-xl transition-all"
          >
            Resume Session
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-16 text-left">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">5 AI Personas</h3>
            <p className="text-xs text-slate-400">Advisor, Librarian, Tutor, Editor, and Roommate routing.</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">RAG Ingestion</h3>
            <p className="text-xs text-slate-400">PDF-parse, OCR fallback, and 768-dim pgvector indexing.</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">30:40:30 AppShell</h3>
            <p className="text-xs text-slate-400">Synchronized tri-pane workspace with live document inspection.</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Enterprise Security</h3>
            <p className="text-xs text-slate-400">Bcrypt(12), JWT sessions, rate limiting, and tenant isolation.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full text-center text-xs text-slate-500 py-6 border-t border-slate-800/40">
        © 2026 ALTER Platform. Designed for Autonomous Academic Excellence.
      </footer>
    </main>
  );
}
