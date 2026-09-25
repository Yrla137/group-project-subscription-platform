// Seminar //
interface Seminar {
    id: number;
    seminar_title: string;
    seminar_description: string | null;
    seminar_date: string;
    startsAt: string;
    tier_id: number;
    tier_level: number;
    tier_title: string | null;
    created_by: number | null;
    created_at: Date;
}

// Create Seminar //
interface CreateSeminar {
    seminar_title: string;
    seminar_description?: string;
    seminar_date: string;
    tier_id: number;
    created_by: number;
}

// Update Seminar //
interface UpdateSeminar {
    seminar_title?: string;
    seminar_description?: string;
    seminar_date?: string;
    tier_id?: number;
}

// Used ONLY for the create form
interface CreateSeminarInput {
    seminar_title: string;
    seminar_description?: string;
    seminar_date: string;
    tier_id: number;
}

export type { Seminar, CreateSeminar, UpdateSeminar, CreateSeminarInput };