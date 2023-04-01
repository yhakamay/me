import { motion } from "framer-motion";

import styles from "./overlay.module.scss";

type OverlayProps = {
  children: React.ReactNode;
  onClick: () => void;
};

export default function Overlay(props: OverlayProps) {
  const { children, onClick } = props;

  return (
    <motion.div
      onClick={onClick}
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {children}
    </motion.div>
  );
}
