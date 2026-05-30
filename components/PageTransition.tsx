"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { usePathname } from "next/navigation";
import { ReactNode, useContext, useRef } from "react";

function FrozenRouter({ children }: { children: ReactNode }) {
  const context = useContext(LayoutRouterContext);
  const frozen = useRef(context).current;

  return (
    <LayoutRouterContext.Provider value={frozen}>
      {children}
    </LayoutRouterContext.Provider>
  );
}

// /posts 그리고 /posts/[category] (상세 페이지 제외)
// 같은 transitionKey를 공유 → 카테고리 전환은 페이지-레벨 애니메이션 없이 통과
const POSTS_CATEGORY_PATTERN = /^\/posts(\/[^/]+)?$/;

const getTransitionKey = (pathname: string) =>
  POSTS_CATEGORY_PATTERN.test(pathname) ? "posts-group" : pathname;

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const transitionKey = getTransitionKey(pathname);

  return (
    <div className="flex-1 min-w-0 w-full overflow-x-clip">
      {/* initial={true} → 새로고침 시에도 mount 애니메이션이 정상 트리거되어 내부 contentReveal까지 안정적으로 재생됨 */}
      <AnimatePresence mode="wait" initial={true}>
        {/* 위에서 내려와 등장 → 페이지 전환 → 아래로 내려가며 사라짐 */}
        <motion.div
          key={transitionKey}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="w-full"
        >
          {/* FrozenRouter는 pathname별로 key → 카테고리 변경 시에도 콘텐츠 정상 업데이트 */}
          <FrozenRouter key={pathname}>{children}</FrozenRouter>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
