import type { Transition, Variants } from "framer-motion";

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * 콘텐츠가 처음 마운트될 때(로딩 → 콘텐츠 전환 시점) 재생되는 통일 모션.
 * 모든 페이지/주요 컴포넌트에서 사용.
 */
export const contentReveal = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.35,
    ease: easeOut,
  } satisfies Transition,
};

export const contentRevealVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: easeOut },
  },
};
