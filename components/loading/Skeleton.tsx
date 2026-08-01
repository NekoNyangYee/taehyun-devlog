import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

import { cn } from "@components/lib/utils";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  animate?: boolean;
  children?: ReactNode;
}

export function Skeleton({
  animate = true,
  children,
  className,
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("skeleton-bone", !animate && "skeleton-bone-static", className)}
      style={style as CSSProperties}
      {...props}
    >
      {children ? <span className="invisible">{children}</span> : null}
    </div>
  );
}
