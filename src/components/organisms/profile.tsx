"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

import Overlay from "../atoms/overlay";
import FadeInSection from "../molecules/fade_in_section";
import SecretCard from "../molecules/secret_card";

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
          <Overlay onClick={handleClick}>
            <SecretCard />
          </Overlay>
        )}
      </AnimatePresence>
    </>
  );
}
