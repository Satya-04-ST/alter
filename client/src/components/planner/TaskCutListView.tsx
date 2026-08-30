'use client';

import React, { useState, useEffect } from 'react';
import { usePlannerStore, TaskItem } from '../../store/plannerStore';
import {
  ListTodo,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Scissors,
  RotateCcw,
  Sparkles,
  Layers,
  X,
  Flame,
  Check,
} from 'lucide-react';

const PRIORITY_BADGES = {
  CRITICAL: 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold',
  HIGH: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  MEDIUM: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  LOW: 'bg-slate-800 text-slate-400 border-slate-700',
};

export function TaskCutListView() {
  const {
    tasks,
    fetchTasks,
    createTask,
    updateTaskStatus,
    deleteTask,
    runCutListTriage,
    isLoading,
  } = usePlannerStore();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'TODO' | 'IN_PROGRESS' | 'CUT' | 'COMPLETED'>('ALL');
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [newTaskCourse, setNewTaskCourse] = useState('CS402');

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = tasks.filter((t) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'CUT') return t.isCut || t.status === 'CUT';
    return t.status === activeFilter && !t.isCut;
  });

  const cutTasksCount = tasks.filter((t) => t.isCut || t.status === 'CUT').length;
  const criticalTasksCount = tasks.filter((t) => t.priority === 'CRITICAL' && !t.isCut).length;

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const ok = await createTask({
      title: newTaskTitle,
      priority: newTaskPriority,
      courseId: newTaskCourse,
    });

    if (ok) {
      setNewTaskTitle('');
      setIsNewTaskModalOpen(false);
    }
  };

  const handleToggleComplete = (task: TaskItem) => {
    const nextStatus = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    updateTaskStatus(task.id, nextStatus, false);
  };

  const handleToggleCut = (task: TaskItem) => {
    const nextCut = !task.isCut;
    updateTaskStatus(task.id, nextCut ? 'CUT' : 'TODO', nextCut);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Triage Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 rounded-2xl glass-panel border border-slate-800 bg-void-900/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shadow-inner">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Academic Task & Cut-List Triage
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Advisor Engine
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Isolate critical degree requirements and de-prioritize non-essential tasks during crunch periods
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewTaskModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-void-850 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            Add Task
          </button>

          <button
            onClick={() => runCutListTriage(true)}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-rose-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            <Scissors className="w-3.5 h-3.5" />
            Trigger Crunch Triage
          </button>
        </div>
      </div>

      {/* Filter Tabs & Metrics Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-void-900 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'ALL', label: 'All Tasks', count: tasks.length },
            { id: 'TODO', label: 'To Do', count: tasks.filter((t) => t.status === 'TODO' && !t.isCut).length },
            { id: 'IN_PROGRESS', label: 'In Progress', count: tasks.filter((t) => t.status === 'IN_PROGRESS' && !t.isCut).length },
            { id: 'CUT', label: '🚨 Cut-List', count: cutTasksCount },
            { id: 'COMPLETED', label: 'Done', count: tasks.filter((t) => t.status === 'COMPLETED').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeFilter === tab.id
                  ? 'bg-void-850 text-cyan-300 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-void-950 text-slate-400">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Crunch Stats Pill */}
        <div className="hidden sm:flex items-center gap-3 text-xs font-mono">
          <span className="text-rose-400 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" />
            {criticalTasksCount} Critical
          </span>
          <span className="text-amber-400 flex items-center gap-1">
            <Scissors className="w-3.5 h-3.5" />
            {cutTasksCount} Triaged Cut
          </span>
        </div>
      </div>

      {/* Task List Stack */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="p-10 text-center glass-panel rounded-2xl border border-slate-800/80 bg-void-900/30">
            <ListTodo className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-xs text-slate-400">No tasks in this category.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between group ${
                task.isCut
                  ? 'bg-rose-950/20 border-rose-900/40 opacity-75'
                  : task.status === 'COMPLETED'
                  ? 'bg-void-900/40 border-slate-800 opacity-60'
                  : 'glass-panel border-slate-800 hover:border-slate-700 bg-void-900/80'
              }`}
            >
              <div className="flex items-start gap-3 flex-1 overflow-hidden">
                {/* Complete Toggle Button */}
                <button
                  onClick={() => handleToggleComplete(task)}
                  className="mt-0.5 text-slate-500 hover:text-cyan-400 transition-colors flex-shrink-0"
                >
                  {task.status === 'COMPLETED' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                <div className="space-y-1 truncate pr-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold ${
                        task.status === 'COMPLETED'
                          ? 'line-through text-slate-400'
                          : task.isCut
                          ? 'text-rose-300'
                          : 'text-white'
                      }`}
                    >
                      {task.title}
                    </span>

                    {/* Cut Pill */}
                    {task.isCut && (
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        TRIAGED CUT
                      </span>
                    )}
                  </div>

                  {task.description && (
                    <p className="text-[11px] text-slate-400 truncate">{task.description}</p>
                  )}

                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className={`px-2 py-0.5 rounded border text-[9px] ${PRIORITY_BADGES[task.priority]}`}>
                      {task.priority}
                    </span>
                    {task.courseId && (
                      <span className="text-slate-400 bg-void-950 px-2 py-0.5 rounded">
                        {task.courseId}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-90">
                {/* Cut/Restore Toggle */}
                <button
                  onClick={() => handleToggleCut(task)}
                  title={task.isCut ? 'Restore to Active Todo' : 'Triage into Cut-List'}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1 border transition-all ${
                    task.isCut
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                      : 'bg-void-850 border-slate-700 text-slate-400 hover:text-amber-300 hover:border-amber-500/40'
                  }`}
                >
                  {task.isCut ? (
                    <>
                      <RotateCcw className="w-3 h-3 text-emerald-400" />
                      Restore
                    </>
                  ) : (
                    <>
                      <Scissors className="w-3 h-3 text-amber-400" />
                      Cut
                    </>
                  )}
                </button>

                <button
                  onClick={() => deleteTask(task.id)}
                  title="Delete Task"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-slate-700 bg-void-950 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Create Academic Task</h3>
              <button onClick={() => setIsNewTaskModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Implement Distributed Key-Value Store"
                  className="w-full px-3.5 py-2 bg-void-900 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase">
                    Priority
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-void-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="CRITICAL">CRITICAL (Exams/Major)</option>
                    <option value="HIGH">HIGH (Milestones)</option>
                    <option value="MEDIUM">MEDIUM (Standard)</option>
                    <option value="LOW">LOW (Optional/Readings)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={newTaskCourse}
                    onChange={(e) => setNewTaskCourse(e.target.value)}
                    placeholder="CS402"
                    className="w-full px-3.5 py-2 bg-void-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-void-900 border border-slate-800 text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
