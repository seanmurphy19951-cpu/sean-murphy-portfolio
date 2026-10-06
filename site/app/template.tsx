"use client";
import { motion, useReducedMotion } from "motion/react";

/** Soft fade-in on every route change (opacity only, so fixed children keep working). */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}
