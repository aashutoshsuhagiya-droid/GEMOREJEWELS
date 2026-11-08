"use client";
import { motion, useReducedMotion } from "framer-motion";
export function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const reducedMotion = useReducedMotion();
  return <motion.div initial={reducedMotion ? false : { opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .18 }} transition={{ duration: reducedMotion ? 0 : .6, delay: reducedMotion ? 0 : delay, ease: "easeOut" }}>{children}</motion.div>;
}
