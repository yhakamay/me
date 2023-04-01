"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { CommitData } from "@/types/commit";

import FadeInSection from "../molecules/fade_in_section";

import styles from "./commits.module.scss";

type CommitsProps = {
  commits: CommitData[];
};

export default function Commits(props: CommitsProps) {
  const { commits } = props;

  return (
    <FadeInSection className={styles.commits}>
      <h2>Commits</h2>
      <motion.ul className={styles.items}>
        {commits.slice(0, 10).map((commit: CommitData, index) => {
          return (
            <motion.li
              key={commit.sha}
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
                href={commit.html_url}
                target={"_blank"}
                rel={"noopener noreferrer"}
              >
                {commit.commit.message && (
                  <p className={styles.message}>{commit.commit.message}</p>
                )}
                {commit.commit.author.date && (
                  <p className={styles.date_time}>
                    {commit.commit.author.date}
                  </p>
                )}
              </Link>
            </motion.li>
          );
        })}
      </motion.ul>
      <div className={styles.more}>
        <Link
          href="https://github.com/yhakamay"
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
