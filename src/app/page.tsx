import Image from "next/image";
import Link from "next/link";
import { BsGithub, BsInstagram, BsLinkedin, BsTwitter } from "react-icons/bs";

import styles from "./page.module.css";

export default async function Home() {
  const repos = await getRepos();

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <Link href="/">
          <Image src="/logo.png" width={24} height={24} alt={""} />
        </Link>
        <Link href="https://github.com/yhakamay/me/">
          <BsGithub className={styles.icon} />
        </Link>
      </div>
      <div className={styles.section}>
        <div className={styles.profile}>
          <Image src="/yhakamay.png" width={60} height={60} alt={"yhakamay"} />
          <p>
            yhakamay is ex-42 student, technical consultant, and Next.js lover.
          </p>
        </div>
      </div>
      <div className={styles.section}>
        <h3>Repositories</h3>
        <ul>
          {repos.slice(0, 10).map((repo: any) => (
            <li key={repo.id}>
              <Link
                href={repo.html_url}
                target={"_blank"}
                rel={"noopener noreferrer"}
              >
                <p className={styles.repo_name}>{repo.name}</p>
                {repo.description && (
                  <p className={styles.repo_description}>{repo.description}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
        <div className={styles.more}>
          <a href="https://github.com/yhakamay?tab=repositories">
            <p>More on GitHub →</p>
          </a>
        </div>
      </div>
      <div className={styles.section}>
        <h3>Contacts</h3>
        <div className={styles.icons}>
          <Link
            href="https://twitter.com/yhakamay"
            target={"_blank"}
            rel={"noopener noreferrer"}
          >
            <BsTwitter size={24} className={styles.icon} />
          </Link>
          <Link
            href="https://www.instagram.com/yhakamay/"
            target={"_blank"}
            rel={"noopener noreferrer"}
          >
            <BsInstagram size={24} className={styles.icon} />
          </Link>
          <Link
            href="https://www.linkedin.com/in/yusuke-hakamaya/"
            target={"_blank"}
            rel={"noopener noreferrer"}
          >
            <BsLinkedin size={24} className={styles.icon} />
          </Link>
        </div>
      </div>
      <div className={styles.footer}>
        <small>© 2023 yhakamay</small>
      </div>
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
