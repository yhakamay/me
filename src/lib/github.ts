import { REVALIDATE_SECONDS } from "@/lib/constants";
import { Repo } from "@/types/repo";

const USERNAME = "yhakamay";
const RECENT_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

/** Fetch the user's public repositories, sorted by most recently updated. */
export async function getRepos(limit = 6): Promise<Repo[]> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
  };
  if (process.env.GITHUB_API_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_API_TOKEN}`;
  }

  try {
    const res = await fetch(
      `https://api.github.com/users/${USERNAME}/repos?sort=updated&direction=desc&per_page=100`,
      { headers, next: { revalidate: REVALIDATE_SECONDS } }
    );

    if (!res.ok) {
      throw new Error(`GitHub API: ${res.status} ${res.statusText}`);
    }

    const repos: Repo[] = await res.json();
    const now = Date.now();

    return repos
      .filter((repo) => !repo.fork && !repo.archived)
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )
      .slice(0, limit)
      .map((repo) => ({
        ...repo,
        recent: now - new Date(repo.updated_at).getTime() < RECENT_MS,
      }));
  } catch (err) {
    console.error("Failed to fetch repositories:", err);
    return [];
  }
}
