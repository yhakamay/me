"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

import FadeInSection from "../molecules/fade_in_section";

import styles from "./profile.module.scss";

export default function Profile() {
  const [isOpen, setIsOpen] = useState(false);
  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <FadeInSection className={styles.profile}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 30,
          }}
          layoutId="profile-image"
          onClick={handleClick}
        >
          <div className={styles.avatar}>
            <Image
              src="/yhakamay.png"
              width={80}
              height={80}
              alt={"yhakamay"}
            />
          </div>
        </motion.div>
        <p>
          yhakamay, an ex-42 Tokyo student, is a technical consultant and an
          enthusiast of Next.js. Raised in Fukuoka and spent two years of
          childhood in Shanghai. Currently resides in Tokyo and works for Adobe
          as an AEM Technical Consultant.
        </p>
      </FadeInSection>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            onClick={handleClick}
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.card}
              layoutId="profile-image"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.content}>
                <Image
                  src="/yhakamay.png"
                  width={200}
                  height={200}
                  alt={"yhakamay"}
                />
                <h2>You found the secret area!</h2>
                <p>Ta-da 🎉 You can now learn more about Yusuke.</p>
                <div className={styles.favorites}>
                  <p>🍜</p>
                  <p>🏉</p>
                  <p>🧑‍💻</p>
                </div>
                <ul className={styles.tips}>
                  <li className={styles.tip}>
                    <p>
                      Yusuke raised in Fukuoka, which is famous for ramen. He
                      eats ramen (at least) thrice a week.
                    </p>
                  </li>
                  <li>
                    <p>
                      Yusuke has been played rugby for 10+ years. You can find
                      his senior thesis about rugby history{" "}
                      <a
                        href="https://drive.google.com/file/d/108ZTK2lljWeGGqLGB2EajhLlJdpWMSLm/view?usp=sharing"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        here
                      </a>
                      .
                    </p>
                  </li>
                  <li>
                    <p>
                      Yusuke started to learn programming at 42 Tokyo. Piscine,
                      the one-month exam was the most hardest thing in his life.
                    </p>
                  </li>
                </ul>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
