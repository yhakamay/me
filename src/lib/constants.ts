/**
 * Cache lifetime, in seconds, for upstream feeds (GitHub repos, Zenn
 * articles) fetched at the data layer and revalidated by Next.js.
 */
export const REVALIDATE_SECONDS = 60 * 60 * 6; // 6h
