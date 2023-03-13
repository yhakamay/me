"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { Repo } from "@/types/repo";

import FadeInSection from "../molecules/fade_in_section";

import styles from "./repos.module.scss";

type ReposProps = {
  repos: Repo[];
};

export default function Repos(props: ReposProps) {
  const { repos } = props;

  return (
    <FadeInSection className={styles.repos}>
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
                y: 0,
                transition: {
                  delay: i * 0.04,
                  duration: 1,
                  ease: "easeInOut",
                },
              }),
              hidden: { opacity: 0, y: 8 },
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
        <Link
          href="https://github.com/yhakamay?tab=repositories"
          target={"_blank"}
          rel={"noopener noreferrer"}
        >
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
        </Link>
      </div>
    </FadeInSection>
  );
}
