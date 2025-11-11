import { BadgePlus, Check, CheckCheck, Clapperboard, ExternalLink, LoaderCircle, Music4, Popcorn, Star, Trash2, X } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import AnimeCard from "~/components/AnimeCard";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "~/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import type { MediaItem } from "~/lib/types";
import { fetchMediaList, getImageUrlWithPreference, getPrettyProviderName, getTitleWithPreference } from "~/lib/utils";
import { useSession } from "~/providers/session-provider";
import { useAnimeStore } from "~/store/anime";
import { useUiStore } from "~/store/ui";

export default function AddToPlannedSheet() {
    const session = useSession();
    const { fullMediaList, setFullMediaList, addSelectedMedia } = useAnimeStore();
    const {
        addToPlannedSheet: { open, setOpen },
    } = useUiStore();

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

    const handleAddTitles = async () => {
        if (selectedTitles.length === 0 || !session) return;
        setIsAdding(true);

        try {
            const animeIds = selectedTitles.map((anime) => anime.id);

            const response = await fetch("/api/status", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ animeIds, status: "planning" }),
            });

            if (response.ok) {
                const result = await response.json();

                if (result.errors > 0) toast.error(`Added ${result.success} title${result.success > 1 ? "s" : ""}, but ${result.errors} failed.`);
                else toast.success(`Successfully added ${result.success} title${result.success > 1 ? "s" : ""} to your planning list!`);

                await fetchMediaList({ session, selectMedia: animeIds });

                setOpen(false);
                setSelectedTitles([]);
            } else {
                console.error("Failed to change status", response.statusText);
                toast.error("Failed to change status", { description: response.statusText });
            }
        } catch (error) {
            console.error("Failed to change status", error);
            toast.error("Failed to change status", { description: error instanceof Error ? error.message : "Unknown error" });
        } finally {
            setIsAdding(false);
        }
    };

    const isSelected = (anime: MediaItem) => selectedTitles.some((title) => title.id === anime.id);
    const isInMediaList = (anime: MediaItem) => fullMediaList.some((title) => title.id === anime.id);
    const isAdded = (anime: MediaItem) => isSelected(anime) || isInMediaList(anime);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="lg" className="w-full">
                    <BadgePlus className="size-5" />
                    Add new title
                </Button>
            </SheetTrigger>
            <SheetContent className="gap-2 p-4 flex flex-col h-full overflow-hidden bg-component-secondary w-full max-w-full sm:max-w-[445px] !inset-x-auto !right-0 sm:rounded-bl-2xl" showClose={false} side="top">
                <SheetHeader className="p-0 gap-4">
                    <SheetTitle className="text-lg font-bold">Add titles to your planning list</SheetTitle>
                    <div className="relative">
                        <Input placeholder="Enter anime title..." value={searchQuery} onChange={handleInputChange} />
                        {isSearching && <LoaderCircle className="absolute right-0 p-2 h-full w-auto top-1/2 -translate-y-1/2 text-muted-foreground animate-spin" />}
                    </div>
                </SheetHeader>

                <ScrollArea className="flex flex-col flex-1 min-h-0" type="auto">
                    <div className="flex flex-col gap-2 pr-3.5">
                        {searchResults.map((anime, index) => (
                            <motion.div key={anime.id} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.04 }}>
                                <Button variant="outline" className="h-18 p-2 gap-2 flex flex-row justify-between w-full disabled:cursor-not-allowed" onClick={() => handleTitleSelect(anime)} disabled={isAdded(anime)}>
                                    <Image className="rounded-sm h-full w-auto aspect-[2/3] object-cover" src={getImageUrlWithPreference(anime, "medium")} alt={getTitleWithPreference(anime)} width={64} height={96} />
                                    <div className="flex flex-col gap-0.5 justify-self-start w-full">
                                        <div className="font-bold flex justify-start w-75">
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
                                            {isSelected(anime) && (
                                                <p className="flex items-center gap-1 icon-text-container">
                                                    <Check className="size-3" />
                                                    <span>Selected</span>
                                                </p>
                                            )}
                                            {isInMediaList(anime) && (
                                                <p className="flex items-center gap-1 icon-text-container">
                                                    <CheckCheck className="size-3" />
                                                    <span>In your list</span>
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
                            </motion.div>
                        ))}
                    </div>
                </ScrollArea>

                <SheetFooter className="shrink-0 p-0 flex gap-4">
                    {selectedTitles.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <h4 className="font-bold text-lg">Selected titles:</h4>
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
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
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
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

// Do onions fly in Australia?
