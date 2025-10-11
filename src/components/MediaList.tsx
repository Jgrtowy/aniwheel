"use client";

import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import AnimeCard from "~/components/AnimeCard";
import AnimeListItem from "~/components/AnimeListItem";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useCheckedMedia, useViewMode } from "~/hooks/useShallowStore";
import { useAnimeStore } from "~/lib/store";

export default function PlannedList() {
    const { mediaList, fullMediaList, setFullMediaList, setActiveGenres, clearFilters, setSearchTerm } = useAnimeStore();
    const checkedMedia = useCheckedMedia();
    const viewMode = useViewMode();
    const [isFetching, setIsFetching] = useState(true);

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
                        <Skeleton className="aspect-[4] sm:aspect-square scale-90 mx-4 sm:mx-0 bg-muted-foreground/50 dark:bg-muted-foreground/25" />
                    </motion.div>
                ))}
            {isFetching &&
                viewMode === "list" &&
                Array.from({ length: 12 }).map((_, index) => (
                    <motion.div key={`skeleton-${index}`} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.04 }}>
                        <div className="flex flex-row gap-2">
                            <Skeleton className="h-12 min-w-12 bg-muted-foreground/50 dark:bg-muted-foreground/25" />
                            <Skeleton className="h-12 w-full bg-muted-foreground/50 dark:bg-muted-foreground/25" />
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
                    <p className="text-lg">Why don't you add some titles?</p>
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
