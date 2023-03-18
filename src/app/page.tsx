import Languages from "@/components/organisms/languages";
import Profile from "@/components/organisms/profile";
import Repos from "@/components/organisms/repos";
import { Repo } from "@/types/repo";
import { RepoLanguage } from "@/types/repo_languages";

export default async function Home() {
  const repos = (await getRepos()) satisfies Repo[];
  const languages = (await getAllLanguages(repos)) satisfies RepoLanguage[];

  return (
    <>
      <Profile />
      <Languages languages={languages} />
      <Repos repos={repos} />
    </>
  );
}

async function getRepos() {
  const res = await fetch(
    "https://api.github.com/users/yhakamay/repos?sort=updated&direction=desc",
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

async function getAllLanguages(repos: Repo[]): Promise<RepoLanguage[]> {
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
