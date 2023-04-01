import { motion } from "framer-motion";
import Image from "next/image";

import styles from "./secret_card.module.scss";

export default function SecretCard() {
  return (
    <motion.div
      className={styles.card}
      layoutId="profile-image"
      onClick={(e) => e.stopPropagation()}
    >
      <div className={styles.content}>
        <Image src="/yhakamay.png" width={200} height={200} alt={"yhakamay"} />
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
              Yusuke raised in Fukuoka, which is famous for ramen. He eats ramen
              (at least) thrice a week.
            </p>
          </li>
          <li>
            <p>
              Yusuke has been played rugby for 10+ years. You can find his
              senior thesis about rugby history{" "}
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
              Yusuke started to learn programming at 42 Tokyo. Piscine, the
              one-month exam was the most hardest thing in his life.
            </p>
          </li>
        </ul>
      </div>
    </motion.div>
  );
}
