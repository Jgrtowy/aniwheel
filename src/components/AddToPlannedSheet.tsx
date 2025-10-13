import { BadgePlus, CheckCheck, Clapperboard, ExternalLink, LoaderCircle, Music4, Popcorn, Star, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import AnimeCard from "~/components/AnimeCard";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "~/components/ui/sheet";
import { useAnimeStore } from "~/lib/store";
import type { MediaItem } from "~/lib/types";
import { getImageUrlWithPreference, getPrettyProviderName, getTitleWithPreference } from "~/lib/utils";
import { useSession } from "~/providers/session-provider";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function AddToPlannedSheet() {
    const session = useSession();
    const { fullMediaList, setFullMediaList, addSelectedMedia, clearFilters } = useAnimeStore();

    const [open, setOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
    const [selectedTitles, setSelectedTitles] = useState<MediaItem[]>([]);

    const debouncedSearch = useCallback(
        async (query: string) => {
            if (!query.trim() || !session?.activeProvider) {
                setSearchResults([]);
                setIsSearching(false);
                return;
            }

            setIsSearching(true);

            try {
                const response = await fetch("/api/search", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query }),
                });

                if (response.ok) {
                    const results = await response.json();
                    setSearchResults(results);
                } else {
                    console.error("Search failed:", response.statusText);
                    setSearchResults([]);
                }
            } catch (error) {
                console.error("Search error:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        },
        [session?.activeProvider],
    );

    useEffect(() => {
        const timeoutId = setTimeout(() => debouncedSearch(searchQuery), 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, debouncedSearch]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value);

    const handleTitleSelect = (anime: MediaItem) => {
        if (isAdded(anime)) return;
        setSelectedTitles((prev) => [...prev, anime]);
    };

    const handleTitleRemove = (anime: MediaItem) => {
        setSelectedTitles((prev) => prev.filter((title) => title.id !== anime.id));
    };

    const refreshPlannedList = async (animeIds: number[]) => {
        if (!session?.activeProvider) return;

        try {
            const response = await fetch("/api/mediaList");
            if (response.ok) {
                const data = await response.json();
                clearFilters();
                setFullMediaList(data);
                addSelectedMedia(animeIds);
            }
        } catch (error) {
            console.error("Failed to refresh planned list:", error);
        }
    };

    const handleAddTitles = async () => {
        if (selectedTitles.length === 0 || !session?.activeProvider) return;
        setIsAdding(true);

        try {
            const animeIds = selectedTitles.map((anime) => anime.id);

            const response = await fetch("/api/setPlanned", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ animeIds }),
            });

            if (response.ok) {
                const result = await response.json();

                if (result.errors > 0) toast.error(`Added ${result.success} title${result.success > 1 ? "s" : ""}, but ${result.errors} failed.`);
                else toast.success(`Successfully added ${result.success} title${result.success > 1 ? "s" : ""} to your planning list!`);

                await refreshPlannedList(animeIds);

                setOpen(false);
                setSelectedTitles([]);
            } else {
                console.error("Failed to add titles:", response.statusText);
                toast.error(`Failed to add titles: ${response.statusText}`);
            }
        } catch (error) {
            console.error("Error adding titles:", error);
            toast.error(`Error adding titles: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setIsAdding(false);
        }
    };

    const isAdded = (anime: MediaItem) => selectedTitles.some((title) => title.id === anime.id) || fullMediaList.some((title) => title.id === anime.id);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="lg" className="w-full">
                    <BadgePlus className="size-5" />
                    Add new title
                </Button>
            </SheetTrigger>
            <SheetContent className="gap-0 flex flex-col h-full overflow-hidden bg-component-secondary w-full max-w-full sm:max-w-[445px] !inset-x-auto !right-0 sm:rounded-bl-2xl" showClose={false} side="top">
                <SheetHeader className="shrink-0 px-6 pt-6 pb-4">
                    <SheetTitle>Add a title to your planning list</SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-2 px-6 flex-1 min-h-0">
                    <div className="relative shrink-0">
                        <Input placeholder="Enter anime title..." value={searchQuery} onChange={handleInputChange} />
                        {isSearching && <LoaderCircle className="absolute right-0 p-2 h-full w-auto top-1/2 -translate-y-1/2 text-muted-foreground animate-spin" />}
                    </div>
                    <ScrollArea className="flex-1 min-h-0" type="auto">
                        <div className="flex flex-col gap-2 pr-4">
                            {searchResults.map((anime) => (
                                <Button variant="outline" className="h-18 p-2 gap-2 flex flex-row justify-between w-full disabled:cursor-not-allowed" onClick={() => handleTitleSelect(anime)} disabled={isAdded(anime)} key={anime.id}>
                                    <Image className="rounded-sm h-full w-auto aspect-[2/3] object-cover" src={getImageUrlWithPreference(anime, "medium")} alt={getTitleWithPreference(anime)} width={64} height={96} />
                                    <div className="flex flex-col gap-0.5 justify-self-start w-full">
                                        <div className="font-bold flex justify-start w-64">
                                            <span className="truncate">{getTitleWithPreference(anime)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm leading-tight text-muted-foreground">
                                            {anime.episodes > 0 && (
                                                <p className="flex items-center gap-1 icon-text-container">
                                                    {anime.format === "MOVIE" ? <Popcorn className="size-3" /> : anime.format === "MUSIC" ? <Music4 className="size-3" /> : <Clapperboard className="size-3" />}
                                                    {anime.format === "MOVIE" ? (
                                                        anime.episodes <= 1 ? (
                                                            <span>Movie</span>
                                                        ) : (
                                                            <span>
                                                                {anime.episodes} ep{anime.episodes === 1 ? "" : "s"}
                                                            </span>
                                                        )
                                                    ) : anime.format === "MUSIC" ? (
                                                        <span>Music</span>
                                                    ) : (
                                                        <span>
                                                            {anime.episodes} ep{anime.episodes === 1 ? "" : "s"}
                                                        </span>
                                                    )}
                                                </p>
                                            )}
                                            {anime.averageScore && (
                                                <p className="flex items-center gap-1 icon-text-container">
                                                    <Star className="size-3" />
                                                    <span>{anime.averageScore}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        {anime.siteUrl && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button asChild variant="secondary" className="flex size-7 justify-center items-center aspect-square border rounded-md">
                                                        <a href={anime.siteUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                                            <ExternalLink className="size-3" />
                                                            <span className="sr-only">View on {session?.activeProvider}</span>
                                                        </a>
                                                    </Button>
                                                </TooltipTrigger>
                                                {session?.activeProvider && (
                                                    <TooltipContent>
                                                        <p>View on {getPrettyProviderName(session?.activeProvider)}</p>
                                                    </TooltipContent>
                                                )}
                                            </Tooltip>
                                        )}
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                <SheetFooter className="shrink-0 pt-2">
                    {selectedTitles.length > 0 && (
                        <>
                            <h4 className="font-medium text-lg">Selected titles:</h4>
                            <ScrollArea type="auto">
                                <div className="flex w-max gap-2">
                                    {selectedTitles.map((anime) => (
                                        <div key={anime.id}>
                                            <AnimeCard className="h-32 rounded-b-none!" isStatic={true} anime={anime} variant="compact" />
                                            <Button className="w-full rounded-t-none" variant="destructive" size="sm" onClick={() => handleTitleRemove(anime)}>
                                                <Trash2 />
                                                <span className="sr-only">Remove {getTitleWithPreference(anime)}</span>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                        </>
                    )}

                    <Button size="lg" disabled={selectedTitles.length === 0 || isAdding} onClick={handleAddTitles}>
                        {selectedTitles.length > 0 ? (
                            <>
                                {isAdding ? <LoaderCircle className="animate-spin" /> : <CheckCheck />}
                                Set {selectedTitles.length} title{selectedTitles.length > 1 ? "s" : ""} as planning
                            </>
                        ) : (
                            <>
                                <CheckCheck />
                                Set as planning
                            </>
                        )}
                    </Button>
                    <SheetClose asChild>
                        <Button variant="outline" size="lg">
                            <X />
                            Close
                        </Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

// Do onions fly in Australia?
