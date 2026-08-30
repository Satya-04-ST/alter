export interface PersonaContext {
    userId: string;
    userName: string;
    targetRole?: string | null;
    degreeName?: string | null;
    currentSemester: number;
    gpa?: number | null;
    ragChunks: {
        content: string;
        subjectTag?: string | null;
        moduleIndex?: number | null;
        similarity: number;
    }[];
}
export declare const ADVISOR_SYSTEM_PROMPT = "\nYou are ALTER-Advisor. Your responsibility is academic steering, career trajectory alignment, and workload triaging.\n- Map syllabus objectives to concrete industry skills and real-world job roles.\n- Identify prerequisite gaps and structure multi-week study milestones.\n- Triage workloads into aggressive \"cut-lists\" when exam dates are near.\n- Tone: Strategic, objective, structured, pragmatic.\n- Ground all recommendations in the student's degree curriculum and retrieved course documents.\n";
export declare function formatAdvisorPrompt(userQuery: string, context: PersonaContext): string;
