"use client";

import { motion } from "motion/react";

import { site } from "@/lib/site";

export function Skills() {
  return (
    <div className="flex flex-wrap gap-3">
      {site.skills.map((skill, i) => (
        <motion.span
          key={skill}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.4,
            delay: i * 0.05,
            ease: [0.22, 1, 0.36, 1],
          }}
          whileHover={{ y: -3 }}
          className="glass rounded-xl px-4 py-2.5 text-sm font-medium"
        >
          {skill}
        </motion.span>
      ))}
    </div>
  );
}
