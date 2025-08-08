import { BadgePlus, Clapperboard, LoaderCircle, Star, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import AnimeCard from "~/components/AnimeCard";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "~/components/ui/sheet";
import { useAnimeStore } from "~/lib/store";
import type { MediaItem } from "~/lib/types";
import { getImageUrlWithPreference, getPrettyProviderName, getTitleWithPreference } from "~/lib/utils";
import { useSession } from "~/providers/session-provider";

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
        setSearchQuery("");
        setSearchResults([]);
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
            <SheetContent className="gap-0 flex flex-col h-full">
                <SheetHeader className="shrink-0">
                    <SheetTitle>Add a title to your planning list</SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-2 flex-1 min-h-0 w-full px-4">
                    <div className="relative shrink-0">
                        <Input placeholder="Enter anime title..." value={searchQuery} onChange={handleInputChange} />
                        {isSearching && <LoaderCircle className="absolute right-0 p-2 h-full w-auto top-1/2 -translate-y-1/2 text-muted-foreground animate-spin" />}
                    </div>
                    <ScrollArea className="flex-1 overflow-hidden relative" type="auto">
                        <div className="absolute bottom-0 w-full h-3 bg-gradient-to-t from-background to-transparent" />
                        <div className="flex flex-col gap-2">
                            {searchResults.map((anime) => (
                                <Button variant="outline" className="h-18 p-2 gap-2 flex justify-start disabled:cursor-not-allowed" onClick={() => handleTitleSelect(anime)} disabled={isAdded(anime)} key={anime.id}>
                                    <Image className="rounded-sm h-full w-auto aspect-[2/3] object-cover" src={getImageUrlWithPreference(anime, "medium")} alt={getTitleWithPreference(anime)} width={64} height={96} />
                                    <div className="flex flex-col gap-0.5">
                                        <h3 className="font-bold w-fit leading-tight line-clamp-1">{getTitleWithPreference(anime)}</h3>
                                        <div className="flex items-center gap-2 text-sm leading-tight text-muted-foreground">
                                            {anime.episodes > 0 && (
                                                <p className="flex items-center gap-1">
                                                    <Clapperboard className="size-3" />
                                                    <span className="translate-y-0.25">{anime.episodes !== 1 ? `${anime.episodes} eps` : "1 ep"}</span>
                                                </p>
                                            )}
                                            {anime.averageScore && (
                                                <p className="flex items-center gap-1">
                                                    <Star className="size-3" />
                                                    <span className="translate-y-0.25">{anime.averageScore}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                <SheetFooter className="shrink-0 pt-2">
                    {selectedTitles.length > 0 && (
                        <ScrollArea type="auto" className="relative">
                            <h4 className="mb-2 font-medium">
                                Selected titles: <span className="text-primary/50 text-xs">(click to remove)</span>
                            </h4>
                            <div className="absolute right-0 w-3 h-full bg-gradient-to-l from-background to-transparent z-10" />
                            <div className="flex w-max h-38 gap-2 pb-3">
                                {selectedTitles.map((anime) => (
                                    <div className="relative h-full aspect-square rounded-md overflow-hidden" key={anime.id}>
                                        <button className="absolute inset-0 transition bg-component-primary flex justify-center items-center cursor-pointer opacity-0 hover:opacity-100 focus-visible:opacity-100 z-10" type="button" onClick={() => handleTitleRemove(anime)}>
                                            <Trash2 className="size-8 stroke-destructive" />
                                            <span className="sr-only">Remove {getTitleWithPreference(anime)}</span>
                                        </button>
                                        <AnimeCard isStatic={true} anime={anime} variant="compact" />
                                    </div>
                                ))}
                            </div>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                    )}

                    <SheetDescription className="flex flex-col text-center">
                        <span className="text-destructive font-bold">WARNING!</span>
                        <span className="text-balance">
                            Titles added here <span className="font-bold">WILL</span> be set as "planning" on your {session?.activeProvider && getPrettyProviderName(session?.activeProvider)} profile.
                        </span>
                    </SheetDescription>
                    <Button variant="default" className="w-full" disabled={selectedTitles.length === 0 || isAdding} onClick={handleAddTitles}>
                        {selectedTitles.length > 0 ? (
                            <>
                                {isAdding ? <LoaderCircle className="animate-spin size-5" /> : <BadgePlus className="size-5" />}
                                Add {selectedTitles.length} title{selectedTitles.length > 1 ? "s" : ""}
                            </>
                        ) : (
                            <>
                                <BadgePlus className="size-5" />
                                Add titles
                            </>
                        )}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

// Do onions fly in Australia?
