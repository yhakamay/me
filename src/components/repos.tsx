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
      <motion.ul>
        {repos.slice(0, 10).map((repo: Repo, index) => (
          <motion.li
            key={repo.id}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={{
              visible: (i) => ({
                opacity: 1,
                transition: {
                  delay: i * 0.04,
                  duration: 0.4,
                  ease: "easeInOut",
                },
              }),
              hidden: { opacity: 0 },
            }}
          >
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
          </motion.li>
        ))}
      </motion.ul>
      <div className={styles.more}>
        <a href="https://github.com/yhakamay?tab=repositories">
          <motion.p
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{
              type: "spring",
              duration: 1,
              stiffness: 100,
              delay: 0.8,
            }}
          >
            More on GitHub →
          </motion.p>
        </a>
      </div>
    </section>
  );
}
