import type { Variants } from "framer-motion";

export const contentReveal = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  transition: {
    duration: 0,
  },
};

export const contentRevealVariants: Variants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { duration: 0 },
  },
};
