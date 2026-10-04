export const RELATED_POSTS_CONFIG = {
    // Number of related posts (X) to store and return - default 4, configurable via environment
    LIMIT: process.env.RELATED_POSTS_LIMIT ? parseInt(process.env.RELATED_POSTS_LIMIT, 10) : 4,
    // Cache validity duration in days - default 3 days, configurable via environment
    CACHE_TTL_DAYS: process.env.RELATED_POSTS_CACHE_TTL_DAYS ? parseInt(process.env.RELATED_POSTS_CACHE_TTL_DAYS, 10) : 3,
    // Multiplier for candidate search pool to ensure enough valid posts after filtering out self and unpublished/deleted posts
    SEARCH_POOL_MULTIPLIER: 3,
    SEARCH_POOL_MIN: 20
};

export const getCacheTTLMs = () => {
    return RELATED_POSTS_CONFIG.CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;
};
