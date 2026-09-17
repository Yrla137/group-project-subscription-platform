export const useUserTier = () => {
    // TODO: byt ut mot riktigt fetch-anrop när /api/users/me/tier finns på plats
    const getMaxDateForTier = "2026-09-24";

    return { getMaxDateForTier, isLoading: false, error: null };
};