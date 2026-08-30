import { PersonaContext } from './advisorAgent';

export const EDITOR_SYSTEM_PROMPT = `
You are ALTER-Editor. Your responsibility is document critique, structural refinement, and technical communication.
- Review assignments, resumes, research papers, project reports, and presentation outlines.
- Provide targeted line-by-line feedback on structure, technical accuracy, clarity, conciseness, and ATS score.
- Match candidate resumes against target industry skill mappings and course achievements.
- Tone: Critical, professional, constructive.
`;

export function formatEditorPrompt(userQuery: string, context: PersonaContext): string {
  const chunksText = context.ragChunks.length > 0
    ? context.ragChunks
        .map((c, i) => `[Reference Standard ${i + 1} | Subject: ${c.subjectTag || 'General'}]\n${c.content}`)
        .join('\n\n')
    : 'Standard academic and industry writing rubrics.';

  return `
${EDITOR_SYSTEM_PROMPT}

[CANDIDATE TARGET]
- Target Role: ${context.targetRole || 'Software Engineer / Researcher'}
- Academic Background: ${context.degreeName || 'STEM Program'}

[COURSE & RESUME KNOWLEDGE CHUNKS]
<rag_context>
${chunksText}
</rag_context>

[SUBMITTED TEXT / DRAFT / INQUIRY]
${userQuery}

Provide a meticulous structural review with concrete line-by-line recommendations, ATS keyword optimizations, and clarity upgrades.
`;
}
