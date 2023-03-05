import { motion } from "framer-motion";

import styles from "./overlay.module.css";

export default function Overlay({
  isSelected,
  onClick,
}: {
  isSelected: boolean;
  onClick: () => void;
}) {
  const variants = {
    open: {
      display: "block",
    },
    closed: {
      display: "none",
    },
  };

  console.log("isSelected", isSelected);

  return (
    <motion.div
      variants={variants}
      initial={false}
      animate={isSelected ? "open" : "closed"}
      transition={{ duration: 0.2 }}
      style={{
        pointerEvents: isSelected ? "auto" : "none",
      }}
      className={styles.overlay}
      onClick={onClick}
    />
  );
}
