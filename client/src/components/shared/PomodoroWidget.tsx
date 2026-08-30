'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePomodoroStore } from '../../store/pomodoroStore';
import api from '../../lib/api';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Coffee,
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export function PomodoroWidget() {
  const {
    mode,
    timeLeft,
    isRunning,
    completedCycles,
    focusedMinutesToday,
    setMode,
    startTimer,
    pauseTimer,
    resetTimer,
    tick,
  } = usePomodoroStore();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sessionSubject, setSessionSubject] = useState('Distributed Systems Review');

  // Web Audio API Synthesizer for Ambient Sound Alerts
  const playChime = (type: 'start' | 'complete' | 'break') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'start') {
        osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
      } else if (type === 'complete') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.5);
      } else {
        osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
        osc.frequency.exponentialRampToValueAtTime(329.63, ctx.currentTime + 0.4);
      }

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio context not allowed until user gesture
    }
  };

  // Timer Tick Engine
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        if (timeLeft > 0) {
          tick();
        } else {
          handleSessionComplete();
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, tick]);

  const handleSessionComplete = async () => {
    pauseTimer();
    playChime('complete');

    if (mode === 'FOCUS') {
      try {
        await api.post('/study/sessions', {
          durationMin: 25,
          category: 'POMODORO',
          subject: sessionSubject,
        });
      } catch (err) {
        console.warn('Failed to log study session:', err);
      }

      setMode('SHORT_BREAK');
    } else {
      setMode('FOCUS');
    }
  };

  const handleStart = () => {
    playChime('start');
    startTimer();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent =
    mode === 'FOCUS'
      ? ((25 * 60 - timeLeft) / (25 * 60)) * 100
      : mode === 'SHORT_BREAK'
      ? ((5 * 60 - timeLeft) / (5 * 60)) * 100
      : ((15 * 60 - timeLeft) / (15 * 60)) * 100;

  return (
    <div className="glass-panel p-5 rounded-3xl border border-slate-800 bg-void-900/80 shadow-2xl space-y-4">
      {/* Header & Mode Pills */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white font-mono">Pomodoro Focus Engine</span>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="text-slate-500 hover:text-slate-300 p-1 transition-colors"
          title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-3 gap-1 bg-void-950 p-1 rounded-xl border border-slate-800 text-[11px] font-mono">
        <button
          onClick={() => {
            setMode('FOCUS');
            resetTimer();
          }}
          className={`py-1.5 rounded-lg font-semibold transition-all ${
            mode === 'FOCUS'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Focus (25m)
        </button>

        <button
          onClick={() => {
            setMode('SHORT_BREAK');
            resetTimer();
          }}
          className={`py-1.5 rounded-lg font-semibold transition-all ${
            mode === 'SHORT_BREAK'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Short (5m)
        </button>

        <button
          onClick={() => {
            setMode('LONG_BREAK');
            resetTimer();
          }}
          className={`py-1.5 rounded-lg font-semibold transition-all ${
            mode === 'LONG_BREAK'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Long (15m)
        </button>
      </div>

      {/* Big Digital Timer Display */}
      <div className="text-center py-3 relative">
        <div className="text-4xl font-mono font-extrabold text-white tracking-wider">
          {formatTime(timeLeft)}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-void-950 h-1.5 rounded-full mt-3 overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-300 ${
              mode === 'FOCUS' ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={resetTimer}
          className="p-2.5 rounded-xl bg-void-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Reset Timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {isRunning ? (
          <button
            onClick={pauseTimer}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-void-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Pause className="w-4 h-4" />
            Pause
          </button>
        ) : (
          <button
            onClick={handleStart}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-500/25 transition-all transform hover:-translate-y-0.5"
          >
            <Play className="w-4 h-4" />
            Start Session
          </button>
        )}

        <button
          onClick={handleSessionComplete}
          className="p-2.5 rounded-xl bg-void-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Skip to next block"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Streak & Metrics Footer */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
        <span className="text-slate-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{completedCycles} Cycles Completed</span>
        </span>
        <span className="text-cyan-400 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{focusedMinutesToday}m Focused</span>
        </span>
      </div>
    </div>
  );
}
