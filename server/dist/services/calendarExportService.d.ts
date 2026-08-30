export declare class CalendarExportService {
    /**
     * Format a date into iCalendar UTC timestamp: YYYYMMDDTHHMMSSZ
     */
    private formatICalDate;
    /**
     * Generate RFC 5545 iCalendar string for user's schedule blocks
     */
    generateICalFeed(userId: string): Promise<string>;
}
export declare const calendarExportService: CalendarExportService;
