export interface StatsDay {
    date: string; // "YYYY-MM-DD"
    habitsScheduled: number;
    habitsDone: number;
    tasksTotal: number;
    tasksDone: number;
}

export interface StatsSummary {
    // Share of scheduled habit occurrences that were checked off, 0–1. null if nothing was scheduled
    habitRate: number | null;
    tasksDone: number;
    tasksTotal: number;
    // Days in a row (up to today) where every scheduled habit was done
    currentStreak: number;
    bestStreak: number;
    mostConsistent: { title: string; done: number; scheduled: number } | null;
}

export interface StatsResponse {
    data: {
        summary: StatsSummary;
        days: StatsDay[];
    };
    meta: {
        from: string;
        to: string;
    };
}
