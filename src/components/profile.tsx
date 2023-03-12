"use client";

import Image from "next/image";

import FadeInSection from "./fade_in_section";
import styles from "./profile.module.scss";

export default function Profile() {
  return (
    <>
      <FadeInSection className={styles.profile}>
        <Image src="/yhakamay.png" width={60} height={60} alt={"yhakamay"} />
        <p>
          yhakamay is ex-42 student, technical consultant, and Next.js lover.
        </p>
      </FadeInSection>
    </>
  );
}
