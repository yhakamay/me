import { motion } from "framer-motion";

type OverlayProps = {
  children: React.ReactNode;
  onClick: () => void;
};

export default function Overlay(props: OverlayProps) {
  const { children, onClick } = props;

  return (
    <motion.div
      onClick={onClick}
      className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-80 flex justify-center items-center z-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {children}
    </motion.div>
  );
}
