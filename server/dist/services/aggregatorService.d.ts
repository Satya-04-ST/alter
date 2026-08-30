export interface HackathonListing {
    id: string;
    title: string;
    host: string;
    prizePool: string;
    deadline: string;
    status: 'UPCOMING' | 'REGISTRATION_OPEN' | 'HACKING';
    tags: string[];
    url: string;
    location: string;
    description: string;
}
export interface ArxivPaperListing {
    id: string;
    title: string;
    authors: string[];
    summary: string;
    published: string;
    categories: string[];
    pdfUrl: string;
    arxivUrl: string;
}
export declare class AggregatorService {
    /**
     * Return curated active student hackathons, competitions, and research grants
     */
    getCuratedHackathons(): Promise<HackathonListing[]>;
    /**
     * Search arXiv research papers across CS/AI/Distributed Systems
     */
    searchArxivPapers(query?: string): Promise<ArxivPaperListing[]>;
}
export declare const aggregatorService: AggregatorService;
