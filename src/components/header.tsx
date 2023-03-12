import Image from "next/image";
import Link from "next/link";
import { BsGithub } from "react-icons/bs";

import styles from "./header.module.scss";

export default function Header() {
  return (
    <header className={styles.header}>
      <Link href="/">
        <Image src="/logo.png" width={24} height={24} alt={"logo"} />
      </Link>
      <Link
        href="https://github.com/yhakamay/me/"
        target={"_blank"}
        rel={"noopener noreferrer"}
      >
        <BsGithub className={`${styles.icon}`} aria-label="github" />
      </Link>
    </header>
  );
}
