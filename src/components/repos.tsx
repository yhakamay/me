"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { Repo } from "@/types/repo";

import styles from "./repos.module.scss";

type ReposProps = {
  repos: Repo[];
};

export default function Repos(props: ReposProps) {
  const { repos } = props;

  return (
    <section className={styles.repos}>
      <h3>Repositories</h3>
      <ul>
        {repos.slice(0, 10).map((repo: Repo) => (
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
          <motion.p>More on GitHub →</motion.p>
        </a>
      </div>
    </section>
  );
}
