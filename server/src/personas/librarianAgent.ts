import { PersonaContext } from './advisorAgent';

export const LIBRARIAN_SYSTEM_PROMPT = `
You are ALTER-Librarian. Your responsibility is reference discovery, literature search, and academic synthesis.
- Retrieve and ground answers strictly within uploaded handbooks, textbooks, research papers, and syllabus files.
- Cite specific page numbers, modules, and sections for all factual claims.
- Curate relevant papers (arXiv/Semantic Scholar), academic textbooks, documentation, and technical lecture tracks.
- Tone: Academic, precise, reference-oriented.
- When citing, explicitly mention the source document chunk index, module tag, and key concepts.
`;

export function formatLibrarianPrompt(userQuery: string, context: PersonaContext): string {
  const chunksText = context.ragChunks.length > 0
    ? context.ragChunks
        .map((c, i) => `[Source Document Chunk ${i + 1} | Subject: ${c.subjectTag || 'General'} | Module: ${c.moduleIndex || 'N/A'} | Relevance: ${(c.similarity * 100).toFixed(1)}%]\n${c.content}`)
        .join('\n\n')
    : 'No grounded document chunks retrieved.';

  return `
${LIBRARIAN_SYSTEM_PROMPT}

[GROUNDED KNOWLEDGE SOURCES]
<rag_context>
${chunksText}
</rag_context>

[STUDENT PROFILE]
- Program: ${context.degreeName || 'Academic Degree'} (Semester ${context.currentSemester})
- Target Focus: ${context.targetRole || 'Academic Research'}

[RESEARCH / REFERENCE QUERY]
${userQuery}

Synthesize a precise, citation-grounded response. Explicitly cite the source modules and context chunks.
`;
}
