import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * SSR-safe client mount detection without useEffect+setState.
 * Returns false on server/initial render, true after hydration.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
