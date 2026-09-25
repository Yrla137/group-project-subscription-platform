// Seminar //
interface Seminar {
    id: number;
    seminar_title: string;
    seminar_description: string | null;
    seminar_date: Date;
    startsAt: string;
    tier_level: number;
    tier_title: string | null;
    created_by: number | null;
    created_at: Date;
}

// Create Seminar //
interface CreateSeminar {
    seminar_title: string;
    seminar_description?: string;
    seminar_date: Date;
    tier_id: number;
    created_by: number;
}

// Update Seminar //
interface UpdateSeminar {
    seminar_title?: string;
    seminar_description?: string;
    seminar_date?: Date;
    tier_id?: number;
}

export type { Seminar, CreateSeminar, UpdateSeminar };