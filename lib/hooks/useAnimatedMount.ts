import { useEffect, useState } from "react";

interface AnimatedMountState {
  /** DOM mount 여부 — exit 애니메이션이 끝나야 false */
  isVisible: boolean;
  /** enter 애니메이션 활성 여부 — visible 후 한 프레임 뒤에 true */
  isAnimating: boolean;
}

/**
 * 모달/오버레이의 mount + enter/exit 애니메이션 코디네이션.
 * isOpen이 true가 되면 즉시 mount 후 다음 프레임에 enter 애니메이션 시작.
 * isOpen이 false가 되면 exit 애니메이션 시작, exitDuration 후 unmount.
 *
 * 모든 setState는 rAF/setTimeout 콜백 안에서 호출되어 React 19
 * `set-state-in-effect` 룰을 통과합니다.
 */
export function useAnimatedMount(
  isOpen: boolean,
  exitDuration = 300
): AnimatedMountState {
  const [state, setState] = useState<AnimatedMountState>({
    isVisible: false,
    isAnimating: false,
  });

  useEffect(() => {
    if (isOpen) {
      const rafMount = requestAnimationFrame(() => {
        setState({ isVisible: true, isAnimating: false });
        const rafAnim = requestAnimationFrame(() =>
          setState((s) => ({ ...s, isAnimating: true }))
        );
        return () => cancelAnimationFrame(rafAnim);
      });
      return () => cancelAnimationFrame(rafMount);
    }

    const raf = requestAnimationFrame(() => {
      setState((s) => (s.isAnimating ? { ...s, isAnimating: false } : s));
    });
    const timer = setTimeout(() => {
      setState({ isVisible: false, isAnimating: false });
    }, exitDuration);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [isOpen, exitDuration]);

  return state;
}
