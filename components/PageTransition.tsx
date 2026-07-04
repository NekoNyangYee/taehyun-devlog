import { ReactNode } from "react";

export default function PageTransition({ children }: { children: ReactNode }) {
  return <div className="flex-1 min-w-0 w-full overflow-x-clip">{children}</div>;
}
