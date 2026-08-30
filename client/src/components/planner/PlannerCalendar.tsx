'use client';

import React, { useState, useEffect } from 'react';
import { usePlannerStore, ScheduleEvent } from '../../store/plannerStore';
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  Layers,
  Zap,
  BookOpen,
  X,
  Loader2,
  Download,
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00',
];

export function PlannerCalendar() {
  const {
    events,
    fetchEvents,
    runAutoSchedule,
    uploadTimetable,
    isScheduling,
    statusMessage,
  } = usePlannerStore();

  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);
  const [timetableInput, setTimetableInput] = useState('');

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSampleTimetable = () => {
    setTimetableInput(`Course Code: CS402 - Distributed Systems
Mon 09:00 - 10:30 CS402: Distributed Architectures
Wed 09:00 - 10:30 CS402: Consensus & Storage Systems

Course Code: ROB701 - Autonomous Robotics
Tue 10:00 - 11:30 ROB701: Sensor Fusion & SLAM
Fri 11:00 - 12:30 ROB701: Swarm Intelligence Seminar

Course Code: AI301 - Deep Learning Systems
Mon 11:00 - 12:30 AI301: Transformer Optimization
Thu 14:00 - 15:30 AI301: Neural Acceleration Lab`);
  };

  const handleUploadTimetable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!timetableInput.trim()) return;
    const ok = await uploadTimetable(timetableInput);
    if (ok) {
      setIsTimetableModalOpen(false);
      setTimetableInput('');
    }
  };

  // Group events by day of week (0: Mon, 1: Tue, ..., 6: Sun)
  const getEventsForDay = (dayIndex: number) => {
    return events.filter((e) => {
      const d = new Date(e.startTime);
      const day = d.getDay(); // 0 is Sun, 1 is Mon
      const normalizedDay = day === 0 ? 6 : day - 1;
      return normalizedDay === dayIndex;
    });
  };

  const formatEventTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl glass-panel border border-slate-800 bg-void-900/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-inner">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Dynamic Academic Planner
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Weekly Grid
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Synchronized timetable lecture slots + conflict-free AI focus sessions
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTimetableModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-void-850 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-all shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            Ingest Timetable
          </button>

          <a
            href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/planner/export/ics`}
            download="alter_schedule.ics"
            className="px-3.5 py-2 rounded-xl bg-void-850 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-all shadow-sm"
            title="Download RFC 5545 iCalendar feed for Google/Apple Calendar"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            Export .ICS
          </a>

          <button
            onClick={() => runAutoSchedule()}
            disabled={isScheduling}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {isScheduling ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-cyan-200" />
                Auto-Schedule Focus Slots
              </>
            )}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2 font-mono">
          <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {DAYS.map((dayName, dayIdx) => {
          const dayEvents = getEventsForDay(dayIdx);

          return (
            <div
              key={dayName}
              className="glass-panel p-3.5 rounded-2xl border border-slate-800/80 bg-void-950/60 flex flex-col min-h-[380px]"
            >
              {/* Day Header */}
              <div className="pb-2.5 mb-3 border-b border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-bold text-white font-mono">{dayName.slice(0, 3)}</span>
                <span className="text-[10px] font-mono text-slate-500">{dayEvents.length} events</span>
              </div>

              {/* Day Events Stack */}
              <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[450px] pr-1">
                {dayEvents.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-center text-slate-600 text-[11px]">
                    <span>Open Interval</span>
                  </div>
                ) : (
                  dayEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className={`p-2.5 rounded-xl border text-xs transition-all ${
                        evt.isAutoGenerated
                          ? 'bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border-purple-500/40 shadow-sm shadow-purple-500/10'
                          : 'bg-void-900/90 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Time Pill */}
                      <div className="flex items-center justify-between mb-1.5 text-[10px] font-mono">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          {formatEventTime(evt.startTime)} - {formatEventTime(evt.endTime)}
                        </span>
                        {evt.isAutoGenerated && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                            AI Focus
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h5 className="font-semibold text-white text-[11px] line-clamp-2 leading-tight">
                        {evt.title}
                      </h5>

                      {/* Course badge */}
                      {evt.course && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-mono text-cyan-400">
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: evt.course.color || '#3B82F6' }}
                          />
                          <span>{evt.course.code}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Timetable Ingestion Modal */}
      {isTimetableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-xl p-6 rounded-3xl border border-slate-700 bg-void-950 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Ingest Class Timetable</h3>
              </div>
              <button
                onClick={() => setIsTimetableModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Paste your weekly class timetable, course schedule, or lecture hours. ALTER will automatically parse day-of-week slots, course codes, and populate recurring schedule blocks.
            </p>

            <form onSubmit={handleUploadTimetable} className="space-y-3">
              <textarea
                value={timetableInput}
                onChange={(e) => setTimetableInput(e.target.value)}
                placeholder="Paste class schedule (e.g. 'Mon 09:00 - 10:30 CS402: Distributed Systems')..."
                rows={7}
                className="w-full p-3 bg-void-900 border border-slate-800 rounded-xl text-white text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-400"
              />

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleSampleTimetable}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-mono underline"
                >
                  Load Sample Timetable Data
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTimetableModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-void-900 border border-slate-800 text-xs text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!timetableInput.trim()}
                    className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                  >
                    Parse & Ingest
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
