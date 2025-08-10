import { ArrowDown10, ArrowDownUp, ArrowDownZA, ArrowUp01, ArrowUpAZ, CalendarArrowDown, CalendarArrowUp, CalendarPlus, Star, WholeWord } from "lucide-react";
import { Button } from "~/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { useAnimeStore } from "~/lib/store";
import type { SortField, SortOrder } from "~/lib/types";

export default function SortingPopover() {
    const { sortField, sortOrder, setSortField, setSortOrder } = useAnimeStore();

    const sortOrderOptions: {
        [key in SortField]: {
            value: SortOrder;
            label: string;
            icon: React.ReactNode;
        }[];
    } = {
        date: [
            { value: "desc", label: "Newest first", icon: <CalendarArrowDown /> },
            { value: "asc", label: "Oldest first", icon: <CalendarArrowUp /> },
        ],
        title: [
            { value: "asc", label: "A-Z", icon: <ArrowUpAZ /> },
            { value: "desc", label: "Z-A", icon: <ArrowDownZA /> },
        ],
        score: [
            { value: "desc", label: "High to Low", icon: <ArrowDown10 /> },
            { value: "asc", label: "Low to High", icon: <ArrowUp01 /> },
        ],
    };

    const getSortIcon = (_sortOrder: SortOrder = sortOrder) => sortOrderOptions[sortField].find((opt) => opt.value === _sortOrder)?.icon || <ArrowDownUp />;

    const getDefaultSortOrder = (field: SortField): SortOrder => sortOrderOptions[field][0].value;

    const handleSortFieldChange = (field: SortField) => {
        setSortField(field);
        setSortOrder(getDefaultSortOrder(field));
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    {getSortIcon()}
                    Sort
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-component-secondary">
                <DropdownMenuLabel asChild className="font-bold text-lg">
                    <h4>Sort by:</h4>
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup value={sortField} onValueChange={(value) => handleSortFieldChange(value as SortField)}>
                    <DropdownMenuRadioItem value="date">
                        <CalendarPlus />
                        Date
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="title">
                        <WholeWord />
                        Title
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="score">
                        <Star />
                        Average score
                    </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuLabel asChild className="font-bold text-lg">
                    <h4>Order:</h4>
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
                    {sortOrderOptions[sortField].map((option) => (
                        <DropdownMenuRadioItem key={option.value} value={option.value}>
                            {option.icon}
                            {option.label}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
