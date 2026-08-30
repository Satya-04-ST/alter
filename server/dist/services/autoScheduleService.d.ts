export interface ParsedTimetableSlot {
    dayOfWeek: 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';
    startTimeStr: string;
    endTimeStr: string;
    courseCode: string;
    courseName: string;
    roomOrLink?: string;
}
export declare class AutoScheduleService {
    /**
     * Parse structured timetable text into course slots
     */
    parseTimetableText(text: string): ParsedTimetableSlot[];
    /**
     * Ingest timetable slots into PostgreSQL Courses and ScheduleBlocks
     */
    ingestTimetable(userId: string, slots: ParsedTimetableSlot[]): Promise<number>;
    /**
     * Conflict-Free Auto-Scheduling Algorithm:
     * Generates optimal study blocks around existing classes and user commitments
     */
    generateAutoSchedule(userId: string): Promise<any[]>;
    /**
     * Academic Triaging & Task Cut-List Engine:
     * Classifies tasks during crunch periods, cutting non-essential assignments.
     */
    runCutListTriage(userId: string, isExamWindowNear?: boolean): Promise<{
        retainedCount: number;
        cutCount: number;
        triagedTasks: any[];
    }>;
}
export declare const autoScheduleService: AutoScheduleService;
