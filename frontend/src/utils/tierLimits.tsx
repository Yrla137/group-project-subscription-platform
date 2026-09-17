export const TIER_LOOKAHEAD_DAYS: Record<string, number> = {
    free: 7,
    basic: 30,
    premium: 90,
};

export const getMaxDateForTier = (tier: string | null): Date | null => {
    if (!tier) return null;
    const days = TIER_LOOKAHEAD_DAYS[tier] ?? 7;
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + days);
    return maxDate;
};