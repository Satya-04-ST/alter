import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { env } from '../config/env';
import { prisma, memStore, FallbackQuiz, FallbackQuizAttempt, FallbackQuizQuestion } from '../config/prisma';
import { ragService } from './ragService';

export class QuizService {
  private geminiAI: GoogleGenerativeAI | null = null;
  private openai: OpenAI | null = null;

  constructor() {
    if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.length > 5) {
      this.geminiAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    }
    if (env.OPENAI_API_KEY && env.OPENAI_API_KEY.length > 5) {
      this.openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    }
  }

  /**
   * Generate an active-recall evaluation quiz grounded in syllabus documents
   */
  async generateQuiz(
    userId: string,
    topic: string,
    questionCount: number = 4,
    subjectTag?: string
  ): Promise<FallbackQuiz> {
    // 1. Retrieve grounded RAG context chunks
    const chunks = await ragService.searchSimilarChunks(userId, topic, 4, subjectTag);
    const contextText = chunks.map((c) => c.content).join('\n\n');

    const quizId = `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    let generatedQuestions: FallbackQuizQuestion[] = [];

    // 2. Prompt LLM for structured questions
    const prompt = `
You are ALTER-Tutor. Generate a ${questionCount}-question active-recall multiple choice quiz on the topic: "${topic}".
Ground the questions strictly in the following retrieved curriculum context:
<rag_context>
${contextText || 'Standard academic STEM curriculum'}
</rag_context>

Return ONLY a valid JSON array of objects with the exact schema:
[
  {
    "id": "q1",
    "question": "Question text...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswerIndex": 0,
    "explanation": "Detailed explanation of why this answer is correct...",
    "difficulty": "MEDIUM",
    "topic": "${topic}"
  }
]
`;

    if (this.geminiAI) {
      try {
        const model = this.geminiAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const res = await model.generateContent(prompt);
        const text = res.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        generatedQuestions = JSON.parse(text);
      } catch (err: any) {
        console.warn('Gemini quiz generation failed, using fallback synthesizer:', err.message);
      }
    } else if (this.openai) {
      try {
        const res = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
        });
        const parsed = JSON.parse(res.choices[0].message.content || '{}');
        generatedQuestions = Array.isArray(parsed) ? parsed : (parsed.questions || []);
      } catch (err: any) {
        console.warn('OpenAI quiz generation failed, using fallback synthesizer:', err.message);
      }
    }

    // Deterministic Offline Fallback Questions if LLM unavailable
    if (!generatedQuestions || generatedQuestions.length === 0) {
      generatedQuestions = [
        {
          id: `q_${Date.now()}_1`,
          question: `In distributed consensus protocols (e.g., Raft/Paxos) for ${topic}, how is split-brain prevented during network partitions?`,
          options: [
            'By requiring a strict majority quorum (N/2 + 1) for leader election and log commits',
            'By broadcasting heartbeat signals unconditionally to all isolated nodes',
            'By delegating decision writes directly to the least loaded client node',
            'By executing asynchronous two-phase locking across all available partitions',
          ],
          correctAnswerIndex: 0,
          explanation: 'Strict majority quorums ensure that at most one partition can assemble enough votes to elect a valid leader and commit entries.',
          difficulty: 'MEDIUM',
          topic,
        },
        {
          id: `q_${Date.now()}_2`,
          question: `What fundamental trade-off does the CAP Theorem demonstrate in distributed systems under network partitions?`,
          options: [
            'You must choose between Linearizability and Latency',
            'You must trade off between Strong Consistency and High Availability',
            'Throughput scales inversely with database sharding dimensions',
            'Replication lag can be completely eliminated with asynchronous writes',
          ],
          correctAnswerIndex: 1,
          explanation: 'When a network partition occurs, a distributed system must choose between guaranteeing consistency or availability.',
          difficulty: 'EASY',
          topic,
        },
        {
          id: `q_${Date.now()}_3`,
          question: `How does consistent hashing with virtual nodes mitigate hotspots in distributed storage?`,
          options: [
            'By placing locks on adjacent keys in the binary tree',
            'By uniformly mapping physical nodes across multiple positions on the hash ring',
            'By routing all queries through a centralized master coordination node',
            'By using round-robin DNS resolution across web gateways',
          ],
          correctAnswerIndex: 1,
          explanation: 'Virtual nodes ensure uniform distribution of keys across the ring even when nodes have unequal capacity or enter/leave.',
          difficulty: 'HARD',
          topic,
        },
        {
          id: `q_${Date.now()}_4`,
          question: `What is the primary advantage of vector embeddings in semantic RAG pipelines?`,
          options: [
            'They compress raw PDF files into encrypted zip archives',
            'They capture dense conceptual and semantic relationships across multi-dimensional space',
            'They replace SQL relational foreign keys with boolean flags',
            'They execute regex pattern matching faster than ripgrep',
          ],
          correctAnswerIndex: 1,
          explanation: 'Dense vector embeddings represent the contextual semantic meaning of text rather than relying on exact keyword matches.',
          difficulty: 'MEDIUM',
          topic,
        },
      ];
    }

    const quiz: FallbackQuiz = {
      id: quizId,
      userId,
      title: `${topic} Active-Recall Evaluation`,
      subjectTag: subjectTag || topic,
      questions: generatedQuestions,
      createdAt: new Date(),
    };

    if (memStore.isPostgresReady) {
      await prisma.quiz.create({
        data: {
          id: quizId,
          title: quiz.title,
          questions: generatedQuestions as any,
        },
      });
    } else {
      memStore.quizzes.set(quizId, quiz);
    }

    return quiz;
  }

  /**
   * Submit and evaluate quiz attempt
   */
  async submitQuizAttempt(
    userId: string,
    quizId: string,
    answers: { questionId: string; selectedAnswer: number }[]
  ): Promise<FallbackQuizAttempt> {
    let quiz: FallbackQuiz | null = null;

    if (memStore.isPostgresReady) {
      const dbQuiz = await prisma.quiz.findUnique({ where: { id: quizId } });
      if (dbQuiz) {
        quiz = {
          id: dbQuiz.id,
          userId,
          title: dbQuiz.title,
          subjectTag: 'General',
          questions: dbQuiz.questions as any,
          createdAt: dbQuiz.createdAt,
        };
      }
    } else {
      quiz = memStore.quizzes.get(quizId) || null;
    }

    if (!quiz) {
      throw new Error('Quiz not found');
    }

    let score = 0;
    const total = quiz.questions.length;
    const details = quiz.questions.map((q) => {
      const userAns = answers.find((a) => a.questionId === q.id);
      const selected = userAns !== undefined ? userAns.selectedAnswer : -1;
      const isCorrect = selected === q.correctAnswerIndex;
      if (isCorrect) score += 1;

      return {
        questionId: q.id,
        selectedAnswer: selected,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const accuracy = total > 0 ? (score / total) * 100 : 0;
    const attemptId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Generate Socratic Tutor Feedback
    let tutorFeedback = '';
    if (accuracy >= 80) {
      tutorFeedback = `🌟 Excellent concept mastery (${accuracy.toFixed(0)}%)! You demonstrated strong foundational command of ${quiz.subjectTag}. Ready to tackle advanced research architectures.`;
    } else if (accuracy >= 50) {
      tutorFeedback = `👍 Solid foundation (${accuracy.toFixed(0)}%). Review the explanations for missed items to cement your understanding of quorum invariants and distributed guarantees.`;
    } else {
      tutorFeedback = `💡 Great active-recall effort (${accuracy.toFixed(0)}%). Recommend revisiting the course readings and asking ALTER-Tutor to step through the core derivations.`;
    }

    const attempt: FallbackQuizAttempt = {
      id: attemptId,
      userId,
      quizId,
      score,
      total,
      accuracy,
      details,
      tutorFeedback,
      createdAt: new Date(),
    };

    if (memStore.isPostgresReady) {
      await prisma.quizAttempt.create({
        data: {
          id: attemptId,
          userId,
          quizId,
          score,
          total,
          details: { details, accuracy, tutorFeedback } as any,
        },
      });
    } else {
      memStore.quizAttempts.set(attemptId, attempt);
    }

    return attempt;
  }
}

export const quizService = new QuizService();
