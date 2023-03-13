import Contacts from "../molecules/contacts";

import styles from "./footer.module.scss";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <small>© 2023 yhakamay</small>
      <Contacts />
    </footer>
  );
}
