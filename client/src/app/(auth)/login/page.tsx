'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/authStore';
import { Lock, Mail, ArrowRight, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginDemoUser, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('scholar@alter.edu');
  const [password, setPassword] = useState('demo1234!');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const success = await login({ email, password });
    if (success) {
      router.push('/dashboard');
    }
  };

  const handleDemoAccess = () => {
    clearError();
    loginDemoUser();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 py-8">
      <div className="w-full max-w-md my-auto">
        {/* Logo Card */}
        <div className="text-center mb-6">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 items-center justify-center font-extrabold text-2xl text-white shadow-xl shadow-cyan-500/25 mb-3">
            A
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Welcome to ALTER</h1>
          <p className="text-sm text-slate-400 mt-1">Access your multi-persona academic console</p>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-5">
          {/* Instant Demo Scholar Access Banner */}
          <button
            type="button"
            onClick={handleDemoAccess}
            className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/20 border border-cyan-500/40 hover:border-cyan-400 text-cyan-200 text-xs font-mono font-semibold flex items-center justify-between shadow-lg shadow-cyan-500/10 transition-all transform hover:-translate-y-0.5 group"
          >
            <div className="flex items-center gap-2 text-left">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              <div>
                <div className="font-bold text-white group-hover:text-cyan-300">⚡ Instant Demo Access</div>
                <div className="text-[10px] text-slate-400">Explore workspace with pre-seeded data</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="flex items-center gap-3 text-slate-600 text-xs font-mono">
            <div className="flex-1 h-px bg-slate-800" />
            <span>or sign in</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
                University / Academic Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-void-900/90 border border-slate-700/80 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-void-900/90 border border-slate-700/80 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Enter Workspace
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Don&apos;t have an account yet?{' '}
              <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                Initialize Profile
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
