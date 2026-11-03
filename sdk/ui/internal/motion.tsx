import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export function FadeIn({ children, delay = 0, y = 8, className }: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} initial={{ opacity: 0, y }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}
