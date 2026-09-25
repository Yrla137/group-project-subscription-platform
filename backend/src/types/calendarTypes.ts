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
        // Only present when the user has access to the seminar
        description?: string;
    };

export interface CalendarEntitlement {
    tierLevel: number;
    maxFutureDays: number;
}

export interface CalendarResponse {
    data: CalendarEvent[];
    meta: {
        from: string;
        to: string;
        horizonEnd: string;
        maxFutureDays: number;
        tierLevel: number;
    };
}