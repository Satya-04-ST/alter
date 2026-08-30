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
export declare class PersonaRouter {
    private geminiAI;
    private openai;
    constructor();
    /**
     * Builds the LangGraph StateGraph pipeline
     */
    createOrchestrationGraph(): import("@langchain/langgraph").CompiledStateGraph<{
        userId: string;
        userName: string;
        targetRole: string | null | undefined;
        degreeName: string | null | undefined;
        currentSemester: number;
        gpa: number | null | undefined;
        persona: PersonaType;
        query: string;
        subjectTag: string | undefined;
        retrievedChunks: {
            id: string;
            documentId: string;
            content: string;
            subjectTag?: string | null;
            moduleIndex?: number | null;
            similarity: number;
        }[];
        formattedPrompt: string;
    }, {
        userId?: string | undefined;
        userName?: string | undefined;
        targetRole?: string | null | undefined;
        degreeName?: string | null | undefined;
        currentSemester?: number | undefined;
        gpa?: number | null | undefined;
        persona?: PersonaType | undefined;
        query?: string | undefined;
        subjectTag?: string | undefined;
        retrievedChunks?: {
            id: string;
            documentId: string;
            content: string;
            subjectTag?: string | null;
            moduleIndex?: number | null;
            similarity: number;
        }[] | undefined;
        formattedPrompt?: string | undefined;
    }, "__start__" | "retrieveContext" | "formatPrompt", {
        userId: import("@langchain/langgraph").LastValue<string>;
        userName: import("@langchain/langgraph").LastValue<string>;
        targetRole: import("@langchain/langgraph").LastValue<string | null | undefined>;
        degreeName: import("@langchain/langgraph").LastValue<string | null | undefined>;
        currentSemester: import("@langchain/langgraph").LastValue<number>;
        gpa: import("@langchain/langgraph").LastValue<number | null | undefined>;
        persona: import("@langchain/langgraph").LastValue<PersonaType>;
        query: import("@langchain/langgraph").LastValue<string>;
        subjectTag: import("@langchain/langgraph").LastValue<string | undefined>;
        retrievedChunks: import("@langchain/langgraph").LastValue<{
            id: string;
            documentId: string;
            content: string;
            subjectTag?: string | null;
            moduleIndex?: number | null;
            similarity: number;
        }[]>;
        formattedPrompt: import("@langchain/langgraph").LastValue<string>;
    }, {
        userId: import("@langchain/langgraph").LastValue<string>;
        userName: import("@langchain/langgraph").LastValue<string>;
        targetRole: import("@langchain/langgraph").LastValue<string | null | undefined>;
        degreeName: import("@langchain/langgraph").LastValue<string | null | undefined>;
        currentSemester: import("@langchain/langgraph").LastValue<number>;
        gpa: import("@langchain/langgraph").LastValue<number | null | undefined>;
        persona: import("@langchain/langgraph").LastValue<PersonaType>;
        query: import("@langchain/langgraph").LastValue<string>;
        subjectTag: import("@langchain/langgraph").LastValue<string | undefined>;
        retrievedChunks: import("@langchain/langgraph").LastValue<{
            id: string;
            documentId: string;
            content: string;
            subjectTag?: string | null;
            moduleIndex?: number | null;
            similarity: number;
        }[]>;
        formattedPrompt: import("@langchain/langgraph").LastValue<string>;
    }, import("@langchain/langgraph").StateDefinition, {
        retrieveContext: {
            retrievedChunks: {
                id: string;
                documentId: string;
                content: string;
                subjectTag?: string | null;
                moduleIndex?: number | null;
                similarity: number;
            }[];
        };
        formatPrompt: {
            formattedPrompt: string;
        };
    }, unknown, unknown, []>;
    /**
     * Local deterministic offline AI synthesizer for zero-API-key local testing
     */
    private generateOfflineResponse;
    /**
     * Stream LLM response with Server-Sent Events generator
     */
    streamResponse(userId: string, query: string, persona?: PersonaType, subjectTag?: string): AsyncGenerator<StreamEventChunk, void, unknown>;
}
export declare const personaRouter: PersonaRouter;
