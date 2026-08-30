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
    nodes: GraphNode[];
    edges: GraphEdge[];
    topic: string;
}
export declare class SynthesisService {
    private geminiAI;
    private openai;
    constructor();
    /**
     * Synthesize comprehensive multi-source study guide notebook
     */
    synthesizeStudyGuide(userId: string, topic: string, subjectTag?: string): Promise<{
        title: string;
        markdownContent: string;
        citations: any[];
        generatedAt: string;
    }>;
    /**
     * Analyze research paper or generate interactive knowledge graph
     */
    analyzePaperAndGraph(topic: string): Promise<{
        paperSummary: {
            title: string;
            authors: string;
            year: number;
            arxivId: string;
            keyContributions: string[];
        };
        graph: ResearchGraphData;
    }>;
}
export declare const synthesisService: SynthesisService;
