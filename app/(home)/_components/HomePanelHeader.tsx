import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface HomePanelHeaderProps {
  title: string;
  href?: string;
}

export function HomePanelHeader({
  title,
  href,
}: HomePanelHeaderProps) {
  const content = (
    <>
      <span className="font-mono text-sm font-semibold tracking-[0.08em]">
        {title}
      </span>
      {href && <ArrowRight aria-hidden="true" size={16} />}
    </>
  );

  const baseClassName =
    "flex min-h-12 items-center justify-between border-b border-gray-200 bg-gray-50 px-4 text-gray-600 dark:border-white/10 dark:bg-zinc-900 dark:text-gray-300 sm:px-5";

  if (!href) {
    return <div className={baseClassName}>{content}</div>;
  }

  return (
    <Link
      href={href}
      className={`${baseClassName} transition-colors hover:bg-gray-100 hover:text-gray-950 dark:hover:bg-zinc-800 dark:hover:text-white`}
    >
      {content}
    </Link>
  );
}
