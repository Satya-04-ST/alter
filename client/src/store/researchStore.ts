import { create } from 'zustand';
import api from '../lib/api';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic: string;
}

export interface QuizData {
  id: string;
  title: string;
  subjectTag: string;
  questions: QuizQuestion[];
}

export interface QuizAttemptResult {
  id: string;
  score: number;
  total: number;
  accuracy: number;
  details: {
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
    explanation: string;
  }[];
  tutorFeedback?: string;
}

export interface StudyGuideData {
  title: string;
  markdownContent: string;
  citations: any[];
  generatedAt: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'CORE_CONCEPT' | 'PREREQUISITE' | 'PAPER' | 'ADVANCED_TOPIC';
  description: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface ResearchGraphData {
  topic: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface ResearchState {
  activeQuiz: QuizData | null;
  quizAttempt: QuizAttemptResult | null;
  studyGuide: StudyGuideData | null;
  graphData: ResearchGraphData | null;
  paperSummary: any | null;
  isLoading: boolean;
  error: string | null;

  generateQuiz: (topic: string, questionCount?: number, subjectTag?: string) => Promise<boolean>;
  submitQuizAttempt: (quizId: string, answers: { questionId: string; selectedAnswer: number }[]) => Promise<QuizAttemptResult | null>;
  synthesizeStudyGuide: (topic: string, subjectTag?: string) => Promise<boolean>;
  fetchResearchGraph: (topic: string) => Promise<boolean>;
}

export const useResearchStore = create<ResearchState>((set, get) => ({
  activeQuiz: null,
  quizAttempt: null,
  studyGuide: null,
  graphData: null,
  paperSummary: null,
  isLoading: false,
  error: null,

  generateQuiz: async (topic, questionCount = 4, subjectTag) => {
    set({ isLoading: true, error: null, quizAttempt: null });
    try {
      const res = await api.post('/quiz/generate', { topic, questionCount, subjectTag });
      if (res.data.success) {
        set({ activeQuiz: res.data.quiz, isLoading: false });
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (err: any) {
      set({ isLoading: false, error: err.response?.data?.error || 'Failed to generate quiz' });
      return false;
    }
  },

  submitQuizAttempt: async (quizId, answers) => {
    set({ isLoading: true });
    try {
      const res = await api.post(`/quiz/${quizId}/attempt`, { answers });
      if (res.data.success) {
        set({ quizAttempt: res.data.attempt, isLoading: false });
        return res.data.attempt;
      }
      set({ isLoading: false });
      return null;
    } catch (err: any) {
      set({ isLoading: false, error: err.response?.data?.error || 'Failed to submit quiz attempt' });
      return null;
    }
  },

  synthesizeStudyGuide: async (topic, subjectTag) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/research/synthesize', { topic, subjectTag });
      if (res.data.success) {
        set({ studyGuide: res.data.guide, isLoading: false });
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (err: any) {
      set({ isLoading: false, error: err.response?.data?.error || 'Failed to synthesize study guide' });
      return false;
    }
  },

  fetchResearchGraph: async (topic) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/research/graph?topic=${encodeURIComponent(topic)}`);
      if (res.data.success) {
        set({
          graphData: res.data.graph,
          paperSummary: res.data.paperSummary,
          isLoading: false,
        });
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (err: any) {
      set({ isLoading: false, error: err.response?.data?.error || 'Failed to fetch research graph' });
      return false;
    }
  },
}));
