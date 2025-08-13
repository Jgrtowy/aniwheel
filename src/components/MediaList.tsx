"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import AnimeCard from "~/components/AnimeCard";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useAnimeStore } from "~/lib/store";

export default function PlannedList() {
    const { mediaList, checkedMedia, fullMediaList, setFullMediaList, setActiveGenres, clearFilters, setSearchTerm } = useAnimeStore();
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

    const handleResetFilters = () => {
        clearFilters();
        setSearchTerm("");
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full gap-4 max-h-fit">
            {isFetching &&
                Array.from({ length: 24 }).map((_, index) => (
                    <motion.div key={`skeleton-${index}`} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.04 }}>
                        <Skeleton className="aspect-[4] sm:aspect-square scale-90 mx-4 sm:mx-0 bg-muted-foreground/50 dark:bg-muted-foreground/25" />
                    </motion.div>
                ))}
            {!isFetching &&
                mediaList.map((anime, index) => (
                    <motion.div key={anime.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: index * 0.02, ease: "easeOut" }}>
                        <AnimeCard anime={anime} checked={checkedMedia.has(anime.id)} className="mx-auto" />
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
        </div>
    );
}
