import { motion } from "framer-motion";

type FadeInSectionProps = {
  children: React.ReactNode;
  className?: string;
};

export default function FadeInSection(props: FadeInSectionProps) {
  const { children, className } = props;

  return (
    <motion.section
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        type: "spring",
        duration: 2,
        stiffness: 100,
        delay: 0.2,
        when: "beforeChildren",
      }}
    >
      {children}
    </motion.section>
  );
}
