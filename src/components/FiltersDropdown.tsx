"use client";

import { CheckIcon, ChevronsUpDownIcon, ListFilter } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "~/components/ui/command";
import { DualRangeSlider } from "~/components/ui/dual-range-slider";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "~/components/ui/hover-card";
import { Label } from "~/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import type { MediaItem } from "~/lib/types";
import { cn } from "~/lib/utils";
import { useAnimeStore } from "~/store/anime";
import { Switch } from "./ui/switch";

export default function FiltersPopover() {
    const { fullMediaList, score, showUnaired, showPlanning, showDropped, showPaused, availableFormats, availableCustomLists, setScore, setShowUnaired, setShowPlanning, setShowDropped, setShowPaused, clearFilters, hasActiveFilters, getActiveFilterCount } = useAnimeStore();

    const availableGenres = useMemo(() => {
        const genreSet = new Set<string>();
        for (const anime of fullMediaList) {
            if (anime.genres) {
                for (const genre of anime.genres) genreSet.add(genre);
            }
        }
        return Array.from(genreSet).sort();
    }, [fullMediaList]);

    const planningCount = fullMediaList.filter((anime) => anime.status === "PLANNING").length;
    const pausedCount = fullMediaList.filter((anime) => anime.status === "PAUSED").length;
    const droppedCount = fullMediaList.filter((anime) => anime.status === "DROPPED").length;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="px-3 has-[>svg]:px-3">
                    {hasActiveFilters() ? <div className="text-xs leading-tight font-bold rounded-full size-4 bg-primary pt-0.25">{getActiveFilterCount()}</div> : <ListFilter />}
                    Filter
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 flex flex-col gap-6 p-4 bg-component-secondary">
                <h4 className="font-bold text-lg">Filter</h4>
                <div className="grid gap-6">
                    <div className="flex flex-col gap-1 text-sm">
                        <span>Genres:</span>
                        <GenreCombobox availableGenres={availableGenres} />
                    </div>
                    <div className="flex flex-col gap-1 text-sm">
                        <span>Score range:</span>
                        <DualRangeSlider value={[score.from, score.to]} onValueChange={([from, to]) => setScore(from, to)} min={0} max={10} step={0.1} labelPosition="bottom" label={(value) => value} />
                    </div>
                    <div className="flex flex-col gap-1 text-sm">
                        <span>Show lists:</span>
                        <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-1">
                                <Checkbox id="planning" className="cursor-pointer bg-background/50" checked={showPlanning} onCheckedChange={setShowPlanning} />
                                <Label htmlFor="planning" className="text-sm cursor-pointer">
                                    Planning ({planningCount})
                                </Label>
                            </div>
                            <div className="flex items-center gap-1">
                                <Checkbox id="paused" className="cursor-pointer bg-background/50" checked={showPaused} onCheckedChange={setShowPaused} />
                                <Label htmlFor="paused" className="text-sm cursor-pointer">
                                    Paused ({pausedCount})
                                </Label>
                            </div>
                            <div className="flex items-center gap-1">
                                <Checkbox id="dropped" className="cursor-pointer bg-background/50" checked={showDropped} onCheckedChange={setShowDropped} />
                                <Label htmlFor="dropped" className="text-sm cursor-pointer">
                                    Dropped ({droppedCount})
                                </Label>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 text-sm">
                        <span>Show formats:</span>
                        <div className="grid grid-cols-3 gap-y-3">
                            {Array.from(availableFormats.values()).map((format) => (
                                <FormatCheckbox key={format} format={format} />
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 text-sm">
                        <span>Filter by custom lists:</span>
                        <div className="flex flex-wrap gap-3">
                            <div className="col-span-3 flex flex-wrap gap-3">{availableCustomLists.size > 0 && Array.from(availableCustomLists.values()).map((list) => <CustomListsCheckbox key={list} list={list} />)}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 icon-text-container">
                        <Switch id="show-unaired" className="cursor-pointer" checked={showUnaired} onCheckedChange={setShowUnaired} />
                        <Label htmlFor="show-unaired">Include unaired titles</Label>
                    </div>
                </div>
                <Button variant="outline" onClick={clearFilters} size="sm" disabled={!hasActiveFilters()}>
                    Clear filters
                </Button>
            </PopoverContent>
        </Popover>
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
                <Button className="p-2 bg-background/50" variant="outline" role="combobox" aria-expanded={open}>
                    <div className="flex flex-wrap items-center gap-1 flex-1">
                        {activeGenres.length === 0 ? (
                            <span className="text-muted-foreground">No genres selected</span>
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
                                        <HoverCardContent className="w-auto p-2">
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
            <PopoverContent className="w-48 p-0 bg-component-secondary" align="start">
                <Command className="bg-transparent">
                    <CommandInput placeholder="Search genres..." />
                    <CommandList className="max-h-[23.4rem]">
                        <CommandEmpty>No genre found.</CommandEmpty>
                        <CommandGroup>
                            {availableGenres.map((genre) => (
                                <CommandItem key={genre} value={genre} onSelect={() => handleGenreToggle(genre)} className="cursor-pointer data-[selected=true]:bg-background">
                                    <CheckIcon className={cn("mr-2 h-4 w-4", activeGenres.includes(genre) ? "visible" : "invisible")} />
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

function FormatCheckbox({ format }: { format: MediaItem["format"] }) {
    const { activeFormats, addActiveFormat, removeActiveFormat } = useAnimeStore();

    const isChecked = activeFormats.has(format);

    const handleToggle = () => {
        if (isChecked) removeActiveFormat(format);
        else addActiveFormat(format);
    };

    return (
        <div className="flex items-center gap-1">
            <Checkbox id={format} className="cursor-pointer bg-background/50" checked={isChecked} onCheckedChange={handleToggle} />
            <Label htmlFor={format} className="text-sm cursor-pointer">
                {format === "TV" ? "TV" : format === "TV_SHORT" ? "TV Short" : format === "ONA" ? "ONA" : format === "OVA" ? "OVA" : format.charAt(0).toUpperCase() + format.slice(1).toLowerCase()}
            </Label>
        </div>
    );
}

function CustomListsCheckbox({ list }: { list: string }) {
    const { activeCustomLists, addActiveCustomList, removeActiveCustomList, mediaList } = useAnimeStore();

    const isChecked = activeCustomLists.has(list);

    const handleToggle = () => {
        if (isChecked) removeActiveCustomList(list);
        else addActiveCustomList(list);
    };

    const customListCount = mediaList.filter((anime) => anime.customLists?.includes(list)).length;

    return (
        <div className="flex items-center gap-1">
            <Checkbox id={list} className="cursor-pointer bg-background/50" checked={isChecked} onCheckedChange={handleToggle} />
            <Label htmlFor={list} className="text-sm cursor-pointer">
                {list} ({customListCount})
            </Label>
        </div>
    );
}
