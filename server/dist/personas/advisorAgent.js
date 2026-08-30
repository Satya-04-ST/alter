"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADVISOR_SYSTEM_PROMPT = void 0;
exports.formatAdvisorPrompt = formatAdvisorPrompt;
exports.ADVISOR_SYSTEM_PROMPT = `
You are ALTER-Advisor. Your responsibility is academic steering, career trajectory alignment, and workload triaging.
- Map syllabus objectives to concrete industry skills and real-world job roles.
- Identify prerequisite gaps and structure multi-week study milestones.
- Triage workloads into aggressive "cut-lists" when exam dates are near.
- Tone: Strategic, objective, structured, pragmatic.
- Ground all recommendations in the student's degree curriculum and retrieved course documents.
`;
function formatAdvisorPrompt(userQuery, context) {
    const chunksText = context.ragChunks.length > 0
        ? context.ragChunks
            .map((c, i) => `[Syllabus Chunk ${i + 1} | Subject: ${c.subjectTag || 'General'} | Module: ${c.moduleIndex || 'N/A'}]\n${c.content}`)
            .join('\n\n')
        : 'No specific syllabus chunks retrieved for this query.';
    return `
${exports.ADVISOR_SYSTEM_PROMPT}

[STUDENT ACADEMIC PROFILE]
- Name: ${context.userName}
- Target Career Role: ${context.targetRole || 'Software / AI Engineer'}
- Degree Program: ${context.degreeName || 'Computer Science'}
- Current Semester: Semester ${context.currentSemester}
- Academic GPA: ${context.gpa || 'N/A'}

[GROUNDED SYLLABUS & CURRICULUM CONTEXT]
<rag_context>
${chunksText}
</rag_context>

[STUDENT QUERY]
${userQuery}

Provide a structured, strategic academic recommendation. Reference specific syllabus modules and prerequisite skills where applicable.
`;
}
