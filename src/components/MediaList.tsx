"use client";

import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import AnimeCard from "~/components/AnimeCard";
import AnimeListItem from "~/components/AnimeListItem";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useCheckedMedia, useViewMode } from "~/hooks/useShallowStore";
import { useAnimeStore } from "~/lib/store";
import { useUiStore } from "~/lib/ui-store";

export default function PlannedList() {
    const { mediaList, fullMediaList, setFullMediaList, setActiveGenres, clearFilters, setSearchTerm } = useAnimeStore();
    const checkedMedia = useCheckedMedia();
    const viewMode = useViewMode();
    const { addToPlannedSheet } = useUiStore();
    const [isFetching, setIsFetching] = useState(true);

    const gridTitleWidths = useMemo(() => {
        const baseWidths = [45, 52, 60, 67, 74, 81, 88, 95];
        return Array.from({ length: 24 }, (_, index) => `${baseWidths[(index * 5 + 3) % baseWidths.length]}%`);
    }, []);
    const listTitleWidths = useMemo(() => Array.from({ length: 12 }, (_, index) => `${60 + ((index * 17) % 25)}%`), []);

    useEffect(() => {
        (async () => {
            try {
                const response = await fetch("/api/mediaList");
                if (!response.ok) throw new Error("Failed to fetch planned list");
                const data = await response.json();
                setFullMediaList(data);
            } catch (error) {
                console.error("Error fetching planned list:", error);
            } finally {
                setIsFetching(false);
            }
        })();
    }, [setFullMediaList, setActiveGenres]);

    const handleResetFilters = useCallback(() => {
        clearFilters();
        setSearchTerm("");
    }, [clearFilters, setSearchTerm]);

    const layoutClasses = useMemo(() => {
        if (viewMode === "grid") return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full gap-4 max-h-fit";
        return "flex flex-col w-full gap-2";
    }, [viewMode]);

    return (
        <motion.div className={layoutClasses} key={viewMode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            {isFetching &&
                viewMode === "grid" &&
                Array.from({ length: 24 }).map((_, index) => (
                    <motion.div key={`skeleton-${index}`} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.04 }}>
                        <div className="relative flex flex-col justify-between p-1 sm:p-2 rounded-lg overflow-hidden border w-[calc(100%-2rem)] sm:w-full sm:scale-90 aspect-[4] sm:aspect-square mx-auto">
                            <Skeleton className="absolute inset-0 h-full w-full bg-muted-foreground/30 dark:bg-muted-foreground/20" />
                            <div className="relative z-10 flex justify-between w-full">
                                <Skeleton className="size-7 rounded-md bg-muted-foreground/50 dark:bg-muted-foreground/25" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-7 w-14 rounded-md bg-muted-foreground/50 dark:bg-muted-foreground/25" />
                                    <Skeleton className="h-7 w-16 rounded-md bg-muted-foreground/50 dark:bg-muted-foreground/25" />
                                </div>
                            </div>
                            <div className="relative z-10 mt-auto w-full">
                                <Skeleton className="h-6 sm:h-7 rounded-md bg-muted-foreground/50 dark:bg-muted-foreground/25" style={{ width: gridTitleWidths[index] }} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            {isFetching &&
                viewMode === "list" &&
                Array.from({ length: 12 }).map((_, index) => (
                    <motion.div key={`skeleton-${index}`} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.04 }}>
                        <div className="relative w-full overflow-hidden rounded-lg border">
                            <div className="relative flex w-full items-center gap-2 sm:gap-3 p-2 sm:p-3">
                                <Skeleton className="size-7 sm:size-6 rounded-sm bg-muted-foreground/50 dark:bg-muted-foreground/25" />
                                <div className="flex w-full flex-col gap-1">
                                    <Skeleton className="h-8 bg-muted-foreground/50 dark:bg-muted-foreground/25 rounded-md" style={{ width: listTitleWidths[index] }} />
                                    <div className="flex flex-wrap gap-1">
                                        {Array.from({ length: 3 }).map((__, badgeIndex) => (
                                            <Skeleton key={`badge-${badgeIndex}`} className="h-5 w-20 rounded-md bg-muted-foreground/50 dark:bg-muted-foreground/25" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            {!isFetching &&
                mediaList.map((anime, index) => (
                    <motion.div className="space-y-2" key={`${viewMode}-${anime.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15, delay: Math.min(index * 0.01, 0.5) }} layout={false}>
                        {viewMode === "grid" ? <AnimeCard anime={anime} checked={checkedMedia.has(anime.id)} className="mx-auto" /> : <AnimeListItem anime={anime} checked={checkedMedia.has(anime.id)} />}
                    </motion.div>
                ))}
            {fullMediaList.length === 0 && !isFetching && (
                <motion.div className="col-span-full text-muted-foreground text-center space-y-0.5 my-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <p className="text-2xl font-bold">Your planned list is empty</p>
                    <p className="text-lg">
                        Why don't you{" "}
                        <Button variant="link" className="text-lg p-0" onClick={() => addToPlannedSheet.setOpen(true)}>
                            add some titles
                        </Button>
                        ?
                    </p>
                </motion.div>
            )}
            {mediaList.length === 0 && fullMediaList.length > 0 && !isFetching && (
                <motion.div className="col-span-full text-muted-foreground text-center my-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <p className="text-2xl font-bold">No titles match your search</p>
                    <Button variant="link" className="text-lg" onClick={handleResetFilters}>
                        Reset filters
                    </Button>
                </motion.div>
            )}
        </motion.div>
    );
}
