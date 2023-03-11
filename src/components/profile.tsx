import Image from "next/image";

import styles from "./profile.module.scss";

export default function Profile() {
  return (
    <>
      <section className={styles.profile}>
        <Image src="/yhakamay.png" width={60} height={60} alt={"yhakamay"} />
        <p>
          yhakamay is ex-42 student, technical consultant, and Next.js lover.
        </p>
      </section>
    </>
  );
}
