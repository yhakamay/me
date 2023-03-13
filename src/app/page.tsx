import Contacts from "@/components/contacts";
import Languages from "@/components/languages";
import Profile from "@/components/profile";
import Repos from "@/components/repos";
import { Repo } from "@/types/repo";
import { RepoLanguage } from "@/types/repo_languages";

import styles from "./page.module.scss";

export default async function Home() {
  const repos = (await getRepos()) satisfies Repo[];
  const languages = (await getAllLanguages(repos)) satisfies RepoLanguage[];

  return (
    <main className={styles.main}>
      <Profile />
      <Languages languages={languages} />
      <Repos repos={repos} />
      <Contacts />
    </main>
  );
}

async function getRepos() {
  const res = await fetch(
    "https://api.github.com/users/yhakamay/repos?sort=updated&direction=desc",
    {
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
