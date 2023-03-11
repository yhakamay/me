import Link from "next/link";
import { BsInstagram, BsLinkedin, BsTwitter } from "react-icons/bs";

import styles from "./contacts.module.scss";

export default function Contacts() {
  return (
    <section className={styles.contacts}>
      <h3>Contacts</h3>
      <div className={styles.icons}>
        <Link
          href="https://twitter.com/yhakamay"
          target={"_blank"}
          rel={"noopener noreferrer"}
        >
          <BsTwitter size={24} className={styles.icon} aria-label="twitter" />
        </Link>
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
        <Link
          href="https://www.linkedin.com/in/yusuke-hakamaya/"
          target={"_blank"}
          rel={"noopener noreferrer"}
        >
          <BsLinkedin size={24} className={styles.icon} aria-label="linkedin" />
        </Link>
      </div>
    </section>
  );
}
