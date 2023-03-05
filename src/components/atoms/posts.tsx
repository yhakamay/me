"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

import styles from "./posts.module.css";

export default function Posts({ posts }: { posts: any }) {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const handleClose = () => setSelectedPostId(null);

  return (
    <>
      <motion.div
        className={styles.overlay}
        onClick={handleClose}
        variants={{
          close: {},
          open: {
            display: "block",
            position: "fixed",
            opacity: 0.9,
          },
        }}
        initial={false}
        animate={selectedPostId ? "open" : "close"}
      />
      <div className={styles.posts}>
        {posts.map((post: any) => (
          <motion.div
            key={post.id}
            className={styles.post}
            layoutId={post.id}
            onClick={() => setSelectedPostId(post.id)}
            variants={{
              close: {},
              open: {
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "100%",
                height: "80vh",
                zIndex: 9999,
                padding: "2rem",
                transition: {
                  type: "spring",
                  stiffness: 800,
                  damping: 50,
                  delayChildren: 0.5,
                  staggerDirection: -1,
                },
              },
            }}
            animate={selectedPostId === post.id ? "open" : "close"}
          >
            <Image src="/yoga.svg" width={80} height={80} alt={""} />
            <motion.h3
              variants={{
                close: { display: "none", opacity: 0 },
                open: { display: "block", opacity: 1 },
              }}
              initial={false}
              animate={selectedPostId === post.id ? "open" : "close"}
            >
              {post.title}
            </motion.h3>
            <motion.p
              variants={{
                close: { display: "none", opacity: 0 },
                open: { display: "block", opacity: 1 },
              }}
              initial={false}
              animate={selectedPostId === post.id ? "open" : "close"}
            >
              {post.body}
            </motion.p>
          </motion.div>
        ))}
      </div>
    </>
  );
}
