import { TagIcon } from "lucide-react";
import { cn } from "@components/lib/utils";

interface CategoryLabelProps {
  name: string;
  className?: string;
}

export function CategoryLabel({ name, className }: CategoryLabelProps) {
  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300",
        className,
      )}
    >
      <TagIcon size={13} className="shrink-0" />
      <span className="truncate">{name}</span>
    </span>
  );
}
