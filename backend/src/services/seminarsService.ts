// GET - gets all seminars from the database based on current user tier
const getSeminarsByTier = async (tier_id: string) => {
    const result = await pool.query(
        `SELECT
            seminars.*,
            tiers.level_number AS tier_level
         FROM seminars
         JOIN tiers ON seminars.tier_id = tiers.id
         WHERE seminars.tier_id = $1`,
        [tier_id]
    );
    return result.rows;
};

// GET id - gets a seminar with a specific id from the database
const getSeminarById = async (id: number): Promise<Seminar | null> => {
    const result = await pool.query(
        `SELECT
            seminars.id, seminars.seminar_title, seminars.seminar_description,
            seminars.seminar_date, seminars.tier_id, seminars.created_by, seminars.created_at,
            tiers.level_number AS tier_level
         FROM seminars
         JOIN tiers ON seminars.tier_id = tiers.id
         WHERE seminars.id = $1`,
        [id]
    );
    return result.rows[0] || null;
};