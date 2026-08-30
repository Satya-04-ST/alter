'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/authStore';
import { Lock, Mail, User, Target, GraduationCap, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    targetRole: 'AI Systems Architect',
    degreeName: 'B.Tech in Computer Science & AI',
    currentSemester: 4,
    gpa: 3.8,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'currentSemester' ? parseInt(value, 10) : name === 'gpa' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const success = await register(formData);
    if (success) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-xl">
        {/* Logo Card */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 items-center justify-center font-extrabold text-2xl text-white shadow-xl shadow-cyan-500/25 mb-3">
            A
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Initialize ALTER Profile</h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure your academic context and persona orchestrator
          </p>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Alex Vance"
                    className="w-full pl-10 pr-4 py-2.5 bg-void-900/90 border border-slate-700/80 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
                  Academic Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@university.edu"
                    className="w-full pl-10 pr-4 py-2.5 bg-void-900/90 border border-slate-700/80 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 bg-void-900/90 border border-slate-700/80 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
                  Degree / Program
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="degreeName"
                    value={formData.degreeName}
                    onChange={handleChange}
                    placeholder="B.Tech Computer Science"
                    className="w-full pl-10 pr-4 py-2.5 bg-void-900/90 border border-slate-700/80 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
                  Target Career Role
                </label>
                <div className="relative">
                  <Target className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="targetRole"
                    value={formData.targetRole}
                    onChange={handleChange}
                    placeholder="AI Systems Architect"
                    className="w-full pl-10 pr-4 py-2.5 bg-void-900/90 border border-slate-700/80 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
                  Current Semester
                </label>
                <select
                  name="currentSemester"
                  value={formData.currentSemester}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-void-900/90 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
                  Current GPA / Scale
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  name="gpa"
                  value={formData.gpa}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-void-900/90 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3.5 px-4 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registering Workspace...
                </>
              ) : (
                <>
                  Create Account & Initialize
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
