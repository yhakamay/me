import Commits from "@/components/organisms/commits";
import Languages from "@/components/organisms/languages";
import Profile from "@/components/organisms/profile";
import Repos from "@/components/organisms/repos";
import { CommitData } from "@/types/commit";
import { Repo } from "@/types/repo";
import { RepoLanguage } from "@/types/repo_language";

export default async function Home() {
  const repos: Repo[] = await fetchRepos();
  const languages: RepoLanguage[] = await fetchAllLanguages(repos);
  const commits: CommitData[] = await fetchCommits(repos);

  return (
    <>
      <Profile />
      <Languages languages={languages} />
      <Commits commits={commits} />
      <Repos repos={repos} />
    </>
  );
}

async function fetchRepos(): Promise<Repo[]> {
  const res = await fetch(
    "https://api.github.com/users/yhakamay/repos?sort=updated&direction=desc?per_page=100",
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_API_TOKEN}`,
      },
      next: {
        revalidate: 60 * 60 * 24,
      },
    }
  );

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  return res.json();
}

async function fetchAllLanguages(repos: Repo[]): Promise<RepoLanguage[]> {
  const promises = repos.map((repo) =>
    fetch(repo.languages_url, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_API_TOKEN}`,
      },
      next: {
        revalidate: 60 * 60 * 24,
      },
    })
  );
  const responses = await Promise.all(promises);

  const languageMaps = await Promise.all(
    responses.map((response) => response.json())
  );

  const combinedMap = new Map();
  for (const languageMap of languageMaps) {
    for (const [language, bytes] of Object.entries(languageMap)) {
      const existingBytes = combinedMap.get(language) ?? 0;
      combinedMap.set(language, existingBytes + bytes);
    }
  }

  const languages = Array.from(combinedMap.entries()).map(([name, count]) => ({
    name,
    count,
  }));

  return languages;
}

async function fetchCommits(repos: Repo[]) {
  const promises = repos.map((repo) =>
    fetch(
      `https://api.github.com/repos/yhakamay/${repo.name}/commits?per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_API_TOKEN}`,
        },
        next: {
          revalidate: 60 * 60 * 24,
        },
      }
    ).then((response) => response.json())
  );

  const responses = await Promise.all(promises);
  const commits: CommitData[] = responses[0];

  return commits;
}
