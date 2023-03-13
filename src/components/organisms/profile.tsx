"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import FadeInSection from "../molecules/fade_in_section";

import styles from "./profile.module.scss";

export default function Profile() {
  return (
    <>
      <FadeInSection className={styles.profile}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          drag
          dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
          dragElastic={0.02}
          transition={{
            type: "spring",
            duration: 2,
            stiffness: 100,
            delay: 0.2,
          }}
        >
          <Image src="/yhakamay.png" width={60} height={60} alt={"yhakamay"} />
        </motion.div>
        <p>
          yhakamay is ex-42 student, technical consultant, and Next.js lover.
        </p>
      </FadeInSection>
    </>
  );
}
