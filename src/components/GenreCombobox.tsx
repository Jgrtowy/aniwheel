"use client";

import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "~/components/ui/command";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "~/components/ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { useAnimeStore } from "~/lib/store";
import { cn } from "~/lib/utils";

export function GenreCombobox({ availableGenres }: { availableGenres: string[] }) {
    const [open, setOpen] = useState(false);
    const { selectedGenres, addGenre, removeGenre } = useAnimeStore();

    const handleGenreToggle = (genre: string) => (selectedGenres.includes(genre) ? removeGenre(genre) : addGenre(genre));

    const handleRemoveGenre = (genre: string, event: React.MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();
        removeGenre(genre);
    };

    const visibleGenres = selectedGenres.slice(0, 2);
    const hiddenGenres = selectedGenres.slice(2);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {/* biome-ignore lint/a11y/useSemanticElements: <explanation> */}
                <Button className="cursor-pointer hover:!bg-background hover:!text-current dark:hover:!bg-input/30 dark:hover:!text-current w-full md:w-auto md:min-w-48" variant="outline" role="combobox" aria-expanded={open}>
                    <div className="flex flex-wrap items-center gap-1 flex-1">
                        {selectedGenres.length === 0 ? (
                            <span className="text-muted-foreground">Select Genres...</span>
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
                                    <CheckIcon className={cn("mr-2 h-4 w-4", selectedGenres.includes(genre) ? "opacity-100" : "opacity-0")} />
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
