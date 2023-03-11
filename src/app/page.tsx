import Image from "next/image";
import Link from "next/link";
import { BsInstagram, BsLinkedin, BsTwitter } from "react-icons/bs";

import styles from "./page.module.scss";

export default async function Home() {
  const repos = await getRepos();

  return (
    <main className={styles.main}>
      <section className={styles.profile}>
        <Image src="/yhakamay.png" width={60} height={60} alt={"yhakamay"} />
        <p>
          yhakamay is ex-42 student, technical consultant, and Next.js lover.
        </p>
      </section>
      <section className={styles.repos}>
        <h3>Repositories</h3>
        <ul>
          {repos.slice(0, 10).map((repo: any) => (
            <li key={repo.id}>
              <Link
                href={repo.html_url}
                target={"_blank"}
                rel={"noopener noreferrer"}
              >
                <p className={styles.name}>{repo.name}</p>
                {repo.description ? (
                  <p className={styles.description}>{repo.description}</p>
                ) : (
                  <p className={`${styles.description} ${styles.not_provided}`}>
                    {repo.description ?? "(no description)"}
                  </p>
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
      </section>
      <section className={styles.contacts}>
        <h3>Contacts</h3>
        <div className={styles.icons}>
          <Link
            href="https://twitter.com/yhakamay"
            target={"_blank"}
            rel={"noopener noreferrer"}
          >
            <BsTwitter size={24} className={styles.icon} aria-label="twitter" />
          </Link>
          <Link
            href="https://www.instagram.com/yhakamay/"
            target={"_blank"}
            rel={"noopener noreferrer"}
          >
            <BsInstagram
              size={24}
              className={styles.icon}
              aria-label="instagram"
            />
          </Link>
          <Link
            href="https://www.linkedin.com/in/yusuke-hakamaya/"
            target={"_blank"}
            rel={"noopener noreferrer"}
          >
            <BsLinkedin
              size={24}
              className={styles.icon}
              aria-label="linkedin"
            />
          </Link>
        </div>
      </section>
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
