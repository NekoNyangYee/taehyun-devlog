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
            <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent className={cn("w-auto bg-white")}>
                <SelectItem value="new-sort">최신순</SelectItem>
                <SelectItem value="old-sort">오래된순</SelectItem>
                <SelectItem value="max-view-sort">조회수 높은순</SelectItem>
                <SelectItem value="min-view-sort">조회수 낮은순</SelectItem>
            </SelectContent>
        </Select>
    );
}
