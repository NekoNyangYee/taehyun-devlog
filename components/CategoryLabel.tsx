import { TagIcon } from "lucide-react";
import { cn } from "@components/lib/utils";
import Link from "next/link";

interface CategoryLabelProps {
  name: string;
  href?: string;
  className?: string;
}

export function CategoryLabel({ name, href, className }: CategoryLabelProps) {
  const label = (
    <>
      <TagIcon size={13} className="shrink-0" />
      <span className="truncate">{name}</span>
    </>
  );
  const styles = cn(
    "category-label inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-[filter]",
    href && "hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:hover:brightness-110",
    className,
  );
  if (href) {
    return (
      <Link
        href={href}
        className={styles}
        aria-label={`${name} 카테고리 보기`}
      >
        {label}
      </Link>
    );
  }

  return (
    <span className={styles}>
      {label}
    </span>
  );
}
