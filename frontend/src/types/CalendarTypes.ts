export type SeminarLockReason = "tier" | "horizon" | null;

export type CalendarEvent =
    | { date: string; type: "task" }
    | { date: string; type: "habit" }
    | {
        id: string;
        date: string;
        // Full timestamp (ISO, UTC), used to show the start time
        startsAt: string;
        type: "seminar";
        tierLevel: number;
        tierTitle: string | null;
        title: string;
        isLocked: boolean;
        lockReason: SeminarLockReason;
        // Only sent when the user has access to the seminar
        description?: string;
    };

export type SeminarCalendarEvent = Extract<CalendarEvent, { type: "seminar" }>;

export interface CalendarMeta {
    from: string;
    to: string;
    horizonEnd: string;
    maxFutureDays: number;
    tierLevel: number;
}

export interface CalendarResponse {
    data: CalendarEvent[];
    meta: CalendarMeta;
}