'use client';

import React, { useState } from 'react';
import { useResearchStore, QuizQuestion } from '../../store/researchStore';
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  RotateCcw,
  Loader2,
  ArrowRight,
  Flame,
  Clock,
  BookOpen,
} from 'lucide-react';

export function QuizView() {
  const {
    activeQuiz,
    quizAttempt,
    generateQuiz,
    submitQuizAttempt,
    isLoading,
    error,
  } = useResearchStore();

  const [topicInput, setTopicInput] = useState('Distributed Consensus & Quorums');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim() || isLoading) return;
    setHasSubmitted(false);
    setSelectedAnswers({});
    generateQuiz(topicInput, 4);
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (hasSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz || hasSubmitted) return;

    const answersPayload = activeQuiz.questions.map((q) => ({
      questionId: q.id,
      selectedAnswer: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : -1,
    }));

    const result = await submitQuizAttempt(activeQuiz.id, answersPayload);
    if (result) {
      setHasSubmitted(true);
    }
  };

  const handleRetake = () => {
    setHasSubmitted(false);
    setSelectedAnswers({});
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Generator Card */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-void-900/70 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center shadow-inner">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Active-Recall Quizzer
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Tutor Engine
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Generate dynamically grounded Socratic evaluation quizzes tailored to your syllabus
              </p>
            </div>
          </div>
        </div>

        {/* Generator Form */}
        <form onSubmit={handleGenerate} className="flex items-center gap-2">
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder="Enter syllabus topic (e.g. Distributed Consensus, SLAM, Transformers)..."
            className="flex-1 px-4 py-2.5 bg-void-950 border border-slate-800 rounded-xl text-white text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            disabled={isLoading || !topicInput.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Formulating Quiz...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-200" />
                Generate Quiz
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}
      </div>

      {/* Evaluation Results Banner (When Submitted) */}
      {hasSubmitted && quizAttempt && (
        <div className="glass-panel p-6 rounded-3xl border border-indigo-500/40 bg-gradient-to-br from-indigo-950/40 via-void-950 to-purple-950/40 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shadow-inner">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  Score: {quizAttempt.score} / {quizAttempt.total} ({quizAttempt.accuracy.toFixed(0)}% Accuracy)
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                  {quizAttempt.tutorFeedback}
                </p>
              </div>
            </div>

            <button
              onClick={handleRetake}
              className="px-4 py-2 rounded-xl bg-void-850 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-all shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              Retake Quiz
            </button>
          </div>
        </div>
      )}

      {/* Quiz Questions List */}
      {activeQuiz && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              {activeQuiz.title} ({activeQuiz.questions.length} Questions)
            </h4>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              Grounded in Course Chunks
            </span>
          </div>

          <div className="space-y-4">
            {activeQuiz.questions.map((q, qIndex) => {
              const selectedIdx = selectedAnswers[q.id];
              const isAnswered = selectedIdx !== undefined;
              const isCorrect = hasSubmitted && selectedIdx === q.correctAnswerIndex;

              return (
                <div
                  key={q.id}
                  className={`glass-panel p-5 rounded-2xl border transition-all ${
                    hasSubmitted
                      ? isCorrect
                        ? 'border-emerald-500/40 bg-emerald-950/10'
                        : 'border-rose-500/40 bg-rose-950/10'
                      : 'border-slate-800 bg-void-900/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-void-950 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center border border-slate-800">
                        {qIndex + 1}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-void-950 text-slate-400 border border-slate-800">
                        {q.difficulty}
                      </span>
                    </div>

                    {hasSubmitted && (
                      <span className="text-xs flex items-center gap-1 font-mono font-bold">
                        {isCorrect ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Correct
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Incorrect
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  <h5 className="text-xs font-medium text-white mb-3 leading-relaxed">
                    {q.question}
                  </h5>

                  {/* Options */}
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isOptionSelected = selectedIdx === optIdx;
                      const isTargetCorrect = optIdx === q.correctAnswerIndex;

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          disabled={hasSubmitted}
                          className={`w-full p-3 rounded-xl text-left text-xs font-mono transition-all flex items-center justify-between border ${
                            hasSubmitted
                              ? isTargetCorrect
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200 font-semibold'
                                : isOptionSelected
                                ? 'bg-rose-500/20 border-rose-500/50 text-rose-200'
                                : 'bg-void-950/60 border-slate-800 text-slate-400'
                              : isOptionSelected
                              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200 font-semibold shadow-inner'
                              : 'bg-void-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <span>{opt}</span>
                          <span className="text-[10px] font-mono text-slate-500">
                            [{String.fromCharCode(65 + optIdx)}]
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Socratic Explanation */}
                  {hasSubmitted && (
                    <div className="mt-3.5 pt-3 border-t border-slate-800/80 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-400 font-mono">
                        <HelpCircle className="w-3.5 h-3.5" />
                        Socratic Explanation
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Action */}
          {!hasSubmitted && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(selectedAnswers).length === 0}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                Submit Evaluation & Grade
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
