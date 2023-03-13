"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BsInstagram, BsLinkedin, BsTwitter } from "react-icons/bs";

import FadeInSection from "../molecules/fade_in_section";

import styles from "./contacts.module.scss";

export default function Contacts() {
  return (
    <FadeInSection className={styles.contacts}>
      <h3>Contacts</h3>
      <motion.ul className={styles.icons}>
        <motion.li
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{
            type: "spring",
            duration: 2,
            stiffness: 100,
            delay: 0.6,
          }}
        >
          <Link
            href="https://twitter.com/yhakamay"
            target={"_blank"}
            rel={"noopener noreferrer"}
          >
            <BsTwitter size={24} className={styles.icon} aria-label="twitter" />
          </Link>
        </motion.li>
        <motion.li
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{
            type: "spring",
            duration: 2,
            stiffness: 100,
            delay: 0.8,
          }}
        >
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
        </motion.li>
        <motion.li
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{
            type: "spring",
            duration: 2,
            stiffness: 100,
            delay: 1,
          }}
        >
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
        </motion.li>
      </motion.ul>
    </FadeInSection>
  );
}
