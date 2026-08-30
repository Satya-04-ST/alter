import { StateGraph, Annotation } from '@langchain/langgraph';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { env } from '../config/env';
import { prisma, memStore } from '../config/prisma';
import { ragService } from '../services/ragService';
import { PersonaContext, formatAdvisorPrompt } from './advisorAgent';
import { formatLibrarianPrompt } from './librarianAgent';
import { formatTutorPrompt } from './tutorAgent';
import { formatEditorPrompt } from './editorAgent';
import { formatRoommatePrompt } from './roommateAgent';

export type PersonaType = 'ADVISOR' | 'LIBRARIAN' | 'TUTOR' | 'EDITOR' | 'ROOMMATE';

export interface StreamEventChunk {
  type: 'token' | 'citation' | 'done' | 'error';
  token?: string;
  citations?: {
    id: string;
    documentId: string;
    content: string;
    subjectTag?: string | null;
    moduleIndex?: number | null;
    similarity: number;
  }[];
  persona?: PersonaType;
  error?: string;
}

// LangGraph State Annotation
const OrchestratorState = Annotation.Root({
  userId: Annotation<string>(),
  userName: Annotation<string>(),
  targetRole: Annotation<string | null | undefined>(),
  degreeName: Annotation<string | null | undefined>(),
  currentSemester: Annotation<number>(),
  gpa: Annotation<number | null | undefined>(),
  persona: Annotation<PersonaType>(),
  query: Annotation<string>(),
  subjectTag: Annotation<string | undefined>(),
  retrievedChunks: Annotation<
    {
      id: string;
      documentId: string;
      content: string;
      subjectTag?: string | null;
      moduleIndex?: number | null;
      similarity: number;
    }[]
  >(),
  formattedPrompt: Annotation<string>(),
});

export class PersonaRouter {
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
   * Builds the LangGraph StateGraph pipeline
   */
  createOrchestrationGraph() {
    const workflow = new StateGraph(OrchestratorState)
      // Node 1: Retrieve RAG Chunks
      .addNode('retrieveContext', async (state) => {
        // Only fetch RAG context if not purely roommate or if query warrants grounding
        const chunks = await ragService.searchSimilarChunks(
          state.userId,
          state.query,
          state.persona === 'LIBRARIAN' ? 6 : 4,
          state.subjectTag
        );
        return { retrievedChunks: chunks };
      })
      // Node 2: Format Persona System & Context Prompt
      .addNode('formatPrompt', async (state) => {
        const context: PersonaContext = {
          userId: state.userId,
          userName: state.userName,
          targetRole: state.targetRole,
          degreeName: state.degreeName,
          currentSemester: state.currentSemester,
          gpa: state.gpa,
          ragChunks: state.retrievedChunks || [],
        };

        let prompt = '';
        switch (state.persona) {
          case 'ADVISOR':
            prompt = formatAdvisorPrompt(state.query, context);
            break;
          case 'LIBRARIAN':
            prompt = formatLibrarianPrompt(state.query, context);
            break;
          case 'TUTOR':
            prompt = formatTutorPrompt(state.query, context);
            break;
          case 'EDITOR':
            prompt = formatEditorPrompt(state.query, context);
            break;
          case 'ROOMMATE':
            prompt = formatRoommatePrompt(state.query, context);
            break;
          default:
            prompt = formatTutorPrompt(state.query, context);
        }

        return { formattedPrompt: prompt };
      })
      .addEdge('__start__', 'retrieveContext')
      .addEdge('retrieveContext', 'formatPrompt')
      .addEdge('formatPrompt', '__end__');

    return workflow.compile();
  }

  /**
   * Local deterministic offline AI synthesizer for zero-API-key local testing
   */
  private generateOfflineResponse(persona: PersonaType, query: string, chunks: any[]): string {
    const pName = persona.charAt(0) + persona.slice(1).toLowerCase();
    const hasCitations = chunks && chunks.length > 0;
    const citationSummary = hasCitations
      ? `\n\n📚 **Grounded References Found:**\n` +
        chunks
          .map(
            (c, i) =>
              `- [Chunk #${i + 1}] **${c.subjectTag || 'Syllabus'}** (Module ${c.moduleIndex || 1}): ${(
                c.similarity * 100
              ).toFixed(1)}% match.`
          )
          .join('\n')
      : '';

    switch (persona) {
      case 'ADVISOR':
        return `### 🧭 Strategic Recommendation (${pName})\nBased on your curriculum trajectory, mastering this topic directly bridges your coursework to industry role requirements.\n\n1. **Core Milestones:** Focus first on foundational concepts before moving to high-throughput architectures.\n2. **Prerequisite Check:** Ensure solid grasp of data structures and distributed protocols.\n3. **Triage Action:** Prioritize this topic for the upcoming evaluation window.${citationSummary}`;
      case 'LIBRARIAN':
        return `### 📖 Academic Synthesis (${pName})\nI have retrieved and cross-referenced your syllabus documents for: "${query}".\n\n- **Curriculum Match:** Grounded directly in your active course modules.\n- **Recommended Literature:** Review the standard references in your uploaded syllabus for exact mathematical proofs and system diagrams.${citationSummary}`;
      case 'TUTOR':
        return `### 🎓 Step-by-Step Concept Breakdown (${pName})\nLet's break down "${query}" into intuitive steps:\n\n1. **Fundamental Principle:** Break the problem into decoupled sub-components.\n2. **Concrete Example:** When multiple nodes synchronize state, consensus algorithms guarantee data consistency across failures.\n\n*Quick Socratic Check:* How would network partitions affect your consistency guarantees in this model?${citationSummary}`;
      case 'EDITOR':
        return `### ✍️ Structural Review & Critique (${pName})\nHere is the critique for your text/query:\n\n- **Clarity & Conciseness:** Good technical focus, consider refining active verbs.\n- **ATS Keywords:** Recommend incorporating terms like *Fault Tolerance*, *Vector Indexing*, and *Distributed Consensus*.\n- **Flow:** Strong foundation—ensure key claims are backed with quantitative metrics.${citationSummary}`;
      case 'ROOMMATE':
        return `### ☕ Focus Check-in (${pName})\nHey! Great progress on your study session today. Keep up the momentum!\n\nRemember to take a 5-minute break if you just finished a 25-minute Pomodoro block. You've got this!`;
      default:
        return `### ALTER Assistant\nHere is the synthesized response for: ${query}${citationSummary}`;
    }
  }

  /**
   * Stream LLM response with Server-Sent Events generator
   */
  async *streamResponse(
    userId: string,
    query: string,
    persona: PersonaType = 'TUTOR',
    subjectTag?: string
  ): AsyncGenerator<StreamEventChunk, void, unknown> {
    // 1. Fetch user academic profile
    let userProfile = {
      name: 'Scholar',
      targetRole: 'AI Systems Architect',
      degreeName: 'Computer Science',
      currentSemester: 4,
      gpa: 3.8,
    };

    if (memStore.isPostgresReady) {
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      if (dbUser) {
        userProfile = {
          name: dbUser.name,
          targetRole: dbUser.targetRole || userProfile.targetRole,
          degreeName: dbUser.degreeName || userProfile.degreeName,
          currentSemester: dbUser.currentSemester,
          gpa: dbUser.gpa || userProfile.gpa,
        };
      }
    } else {
      const memUser = memStore.users.get(userId);
      if (memUser) {
        userProfile = {
          name: memUser.name,
          targetRole: memUser.targetRole || userProfile.targetRole,
          degreeName: memUser.degreeName || userProfile.degreeName,
          currentSemester: memUser.currentSemester,
          gpa: memUser.gpa || userProfile.gpa,
        };
      }
    }

    // 2. Execute LangGraph Orchestration Pipeline
    const graph = this.createOrchestrationGraph();
    const result = await graph.invoke({
      userId,
      userName: userProfile.name,
      targetRole: userProfile.targetRole,
      degreeName: userProfile.degreeName,
      currentSemester: userProfile.currentSemester,
      gpa: userProfile.gpa,
      persona,
      query,
      subjectTag,
    });

    // 3. Emit Grounded Citations immediately
    if (result.retrievedChunks && result.retrievedChunks.length > 0) {
      yield {
        type: 'citation',
        citations: result.retrievedChunks,
        persona,
      };
    }

    // 4. Stream response from Gemini LLM
    if (this.geminiAI) {
      try {
        const model = this.geminiAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
        });

        const streamResult = await model.generateContentStream(result.formattedPrompt);

        for await (const chunk of streamResult.stream) {
          const text = chunk.text();
          if (text) {
            yield { type: 'token', token: text, persona };
          }
        }

        yield { type: 'done', persona };
        return;
      } catch (err: any) {
        console.warn('Gemini stream generation failed, attempting OpenAI fallback:', err.message);
      }
    }

    // 5. Stream response from OpenAI LLM
    if (this.openai) {
      try {
        const stream = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: result.formattedPrompt }],
          stream: true,
        });

        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || '';
          if (text) {
            yield { type: 'token', token: text, persona };
          }
        }

        yield { type: 'done', persona };
        return;
      } catch (err: any) {
        console.warn('OpenAI stream generation failed, attempting offline fallback:', err.message);
      }
    }

    // 6. Resilient Offline Local Stream Generator
    const offlineText = this.generateOfflineResponse(persona, query, result.retrievedChunks || []);
    const words = offlineText.split(' ');

    for (let i = 0; i < words.length; i++) {
      yield { type: 'token', token: words[i] + ' ', persona };
      // Simulate real-time streaming cadence
      await new Promise((r) => setTimeout(r, 20));
    }

    yield { type: 'done', persona };
  }
}

export const personaRouter = new PersonaRouter();
