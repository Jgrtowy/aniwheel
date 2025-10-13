import { ArrowDown10, ArrowDownUp, ArrowDownZA, ArrowUp01, ArrowUpAZ, CalendarArrowDown, CalendarArrowUp, CalendarPlus, Info, Star, WholeWord } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import type { SortField, SortOrder } from "~/lib/types";
import { useAnimeStore } from "~/store/anime";

export default function SortingPopover() {
    const { sortField, sortOrder, setSortField, setSortOrder } = useAnimeStore();

    const sortFieldOptions: { value: SortField; label: string; description: string; icon: React.ReactNode }[] = [
        { value: "date", label: "Date", description: "Date you added the title to your list", icon: <CalendarPlus /> },
        { value: "title", label: "Title", description: "Title of the anime in your language", icon: <WholeWord /> },
        { value: "score", label: "Score", description: "Weighted average user score", icon: <Star /> },
    ];

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

    const handleSortFieldChange = (field: SortField | "") => {
        if (field === "") return;
        setSortField(field);
        setSortOrder(getDefaultSortOrder(field));
    };

    const handleSortOrderChange = (order: SortOrder | "") => {
        if (order === "") return;
        setSortOrder(order);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline">
                    {getSortIcon()}
                    Sort
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 flex flex-col gap-6 p-4 bg-component-secondary">
                <div className="flex flex-col gap-1">
                    <h4 className="font-bold text-lg">Sort</h4>
                    <ToggleGroup type="single" variant="outline" className="w-full" value={sortField} onValueChange={handleSortFieldChange}>
                        {sortFieldOptions.map((option) => (
                            <ToggleGroupItem key={option.value} value={option.value} className="gap-1 icon-text-container data-[state=on]:bg-primary data-[state=on]:text-primary-foreground cursor-pointer">
                                {option.icon}
                                <span>{option.label}</span>
                                <span className="sr-only">Sort by {option.label}</span>
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 icon-text-container">
                        <Info className="size-3" />
                        <span>{sortFieldOptions.find((opt) => opt.value === sortField)?.description}</span>
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <h4 className="font-bold text-lg">Order</h4>
                    <ToggleGroup type="single" variant="outline" className="w-full" value={sortOrder} onValueChange={handleSortOrderChange}>
                        {sortOrderOptions[sortField].map((option) => (
                            <ToggleGroupItem key={option.value} value={option.value} className="gap-1 icon-text-container data-[state=on]:bg-primary data-[state=on]:text-primary-foreground cursor-pointer">
                                {option.icon}
                                <span>{option.label}</span>
                                <span className="sr-only">Sort by {option.label}</span>
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </div>
            </PopoverContent>
        </Popover>
    );
}
