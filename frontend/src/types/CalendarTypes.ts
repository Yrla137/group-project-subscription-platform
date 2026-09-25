export type SeminarLockReason = "tier" | "horizon" | null;

export type CalendarEvent =
    | { date: string; type: "task" }
    | { date: string; type: "habit" }
    | {
        id: string;
        date: string;
        type: "seminar";
        tierLevel: number;
        title: string;
        isLocked: boolean;
        lockReason: SeminarLockReason;
        description?: string;
    };

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