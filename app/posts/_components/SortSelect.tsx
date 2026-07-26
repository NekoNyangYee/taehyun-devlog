import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@components/components/ui/select";
import { cn } from "@components/lib/utils";

/**
 * 정렬 선택 컴포넌트 (Presentational)
 * - 정렬 옵션 UI만 담당
 */
interface SortSelectProps {
    value: string;
    onChange: (value: string) => void;
}

export function SortSelect({ value, onChange }: SortSelectProps) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="h-12 w-36 rounded-none border-0 border-l border-gray-200 bg-transparent dark:border-white/10">
                <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent className={cn("w-auto rounded-none bg-white dark:bg-zinc-900 dark:border-white/10")}>
                <SelectItem value="new-sort">최신순</SelectItem>
                <SelectItem value="old-sort">오래된순</SelectItem>
                <SelectItem value="max-view-sort">조회 많은순</SelectItem>
                <SelectItem value="min-view-sort">조회 적은순</SelectItem>
            </SelectContent>
        </Select>
    );
}
