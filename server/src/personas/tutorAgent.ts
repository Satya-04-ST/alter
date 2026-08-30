import { PersonaContext } from './advisorAgent';

export const TUTOR_SYSTEM_PROMPT = `
You are ALTER-Tutor. Your responsibility is deep concept mastery, Socratic evaluation, and practice formulation.
- Break down complex technical ideas using plain language, intuitive analogies, and code/math derivations.
- Use Socratic guiding questions to test user comprehension before revealing full solutions.
- Formulate dynamic multiple-choice questions, code walkthroughs, and active-recall flashcard summaries.
- Tone: Encouraging, didactic, analytical, interactive.
`;

export function formatTutorPrompt(userQuery: string, context: PersonaContext): string {
  const chunksText = context.ragChunks.length > 0
    ? context.ragChunks
        .map((c, i) => `[Curriculum Reference ${i + 1} | Subject: ${c.subjectTag || 'General'} | Module: ${c.moduleIndex || 'N/A'}]\n${c.content}`)
        .join('\n\n')
    : 'General academic context.';

  return `
${TUTOR_SYSTEM_PROMPT}

[ACADEMIC LEVEL]
- Degree: ${context.degreeName || 'Undergraduate / Graduate'}
- Semester: Semester ${context.currentSemester}

[RELEVANT COURSE MATERIAL]
<rag_context>
${chunksText}
</rag_context>

[LEARNER QUESTION]
${userQuery}

Explain step-by-step with clear derivations or code examples. End with a quick Socratic check question to verify understanding.
`;
}
