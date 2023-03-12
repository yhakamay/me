import Contacts from "@/components/contacts";
import Languages from "@/components/languages";
import Profile from "@/components/profile";
import Repos from "@/components/repos";
import { Repo } from "@/types/repo";

import styles from "./page.module.scss";

export default async function Home() {
  const repos = (await getRepos()) satisfies Repo[];
  const languages = (await getLanguages()) satisfies [string, number][];

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

async function getLanguages(): Promise<[string, number][]> {
  const repos = (await getRepos()) satisfies Repo[];

  const languages = new Map<string, number>();

  for (const repo of repos) {
    if (repo.language) {
      const count = languages.get(repo.language) || 0;
      languages.set(repo.language, count + 1);
    }
  }

  return Array.from(languages.entries()).sort((a, b) => b[1] - a[1]);
}
