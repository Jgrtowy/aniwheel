"use client";

import { CheckIcon, ChevronsUpDownIcon, ListFilter } from "lucide-react";
import { useMemo } from "react";
import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "~/components/ui/command";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { DualRangeSlider } from "~/components/ui/dual-range-slider";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "~/components/ui/hover-card";
import { Label } from "~/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { useAnimeStore } from "~/lib/store";
import { cn } from "~/lib/utils";

export default function FiltersPopover() {
    const { fullMediaList, score, showAiredOnly, setScore, setShowAiredOnly, clearFilters, hasActiveFilters, getActiveFilterCount } = useAnimeStore();

    const availableGenres = useMemo(() => {
        const genreSet = new Set<string>();
        for (const anime of fullMediaList) {
            if (anime.genres) {
                for (const genre of anime.genres) genreSet.add(genre);
            }
        }
        return Array.from(genreSet).sort();
    }, [fullMediaList]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <ListFilter />
                    Filter
                    {hasActiveFilters() && (
                        <Badge className="text-xs font-bold rounded-full size-5" variant="secondary">
                            <span className="translate-y-0.25">{getActiveFilterCount()}</span>
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 flex flex-col gap-6 p-4">
                <h4 className="font-bold text-lg">Filter by:</h4>
                <div className="grid gap-6">
                    <GenreCombobox availableGenres={availableGenres} />
                    <div className="flex flex-col gap-1 text-sm">
                        <span>Score range:</span>
                        <DualRangeSlider value={[score.from, score.to]} onValueChange={([from, to]) => setScore(from, to)} min={0} max={10} step={0.1} labelPosition="bottom" label={(value) => value} />
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id="aired-only" className="cursor-pointer" checked={showAiredOnly} onCheckedChange={setShowAiredOnly} />
                        <Label htmlFor="aired-only" className="text-xs md:text-sm cursor-pointer">
                            Show aired only
                        </Label>
                    </div>
                </div>
                <Button variant="outline" onClick={clearFilters} size="sm" disabled={!hasActiveFilters()}>
                    Clear filters
                </Button>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function GenreCombobox({ availableGenres }: { availableGenres: string[] }) {
    const [open, setOpen] = useState(false);
    const { activeGenres, addActiveGenre, removeActiveGenre } = useAnimeStore();

    const handleGenreToggle = (genre: string) => (activeGenres.includes(genre) ? removeActiveGenre(genre) : addActiveGenre(genre));

    const handleRemoveGenre = (genre: string, event: React.MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();
        removeActiveGenre(genre);
    };

    const visibleGenres = activeGenres.slice(0, 2);
    const hiddenGenres = activeGenres.slice(2);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {/* biome-ignore lint/a11y/useSemanticElements: <explanation> */}
                <Button className="h-fit hover:!bg-background hover:!text-current dark:hover:!bg-input/30 dark:hover:!text-current w-full md:w-auto md:min-w-48 p-2" variant="outline" role="combobox" aria-expanded={open}>
                    <div className="flex flex-wrap items-center gap-1 flex-1">
                        {activeGenres.length === 0 ? (
                            <span className="text-muted-foreground">Genres...</span>
                        ) : (
                            <>
                                {visibleGenres.map((genre) => (
                                    <Badge key={genre} variant="secondary" className="text-xs cursor-pointer rounded-full bg-input hover:text-destructive" onClick={(e) => handleRemoveGenre(genre, e)}>
                                        {genre}
                                    </Badge>
                                ))}
                                {hiddenGenres.length > 0 && (
                                    <HoverCard>
                                        <HoverCardTrigger asChild>
                                            <Badge variant="default" className="text-xs cursor-pointer rounded-full">
                                                +{hiddenGenres.length} more
                                            </Badge>
                                        </HoverCardTrigger>
                                        <HoverCardContent className="w-auto p-4">
                                            <div className="flex flex-wrap gap-1">
                                                {hiddenGenres.map((genre) => (
                                                    <Badge key={genre} variant="secondary" className="text-xs cursor-pointer rounded-full bg-input hover:text-destructive" onClick={(e) => handleRemoveGenre(genre, e)}>
                                                        {genre}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </HoverCardContent>
                                    </HoverCard>
                                )}
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                        <ChevronsUpDownIcon className="h-4 w-4 shrink-0 opacity-50" />
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search genres..." />
                    <CommandList>
                        <CommandEmpty>No genre found.</CommandEmpty>
                        <CommandGroup>
                            {availableGenres.map((genre) => (
                                <CommandItem key={genre} value={genre} onSelect={() => handleGenreToggle(genre)}>
                                    <CheckIcon className={cn("mr-2 h-4 w-4", activeGenres.includes(genre) ? "opacity-100" : "opacity-0")} />
                                    {genre}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
