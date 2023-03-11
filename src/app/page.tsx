import Contacts from "@/components/contacts";
import Profile from "@/components/profile";
import Repos from "@/components/repos";
import { Repo } from "@/types/repo";

import styles from "./page.module.scss";

export default async function Home() {
  const repos = (await getRepos()) satisfies Repo[];

  return (
    <main className={styles.main}>
      <Profile />
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
