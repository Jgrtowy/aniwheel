"use client";

import { BadgePlus, ChevronLeft, ChevronRight, LoaderCircle, RotateCcw, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import useSWRInfinite from "swr/infinite";
import AnimeCard from "~/components/AnimeCard";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { usePreferredTitleLanguage } from "~/hooks/useShallowStore";
import { isAniListSession } from "~/lib/auth";
import type { MediaRecommendation } from "~/lib/types";
import { fetchMediaList, getTitleWithPreference } from "~/lib/utils";
import { useSession } from "~/providers/session-provider";
import { useAnimeStore } from "~/store/anime";
import { useSettingsStore } from "~/store/settings";

type RecommendationResponse = {
    data: MediaRecommendation[];
    pageInfo: { hasNextPage: boolean };
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 300 : -300, opacity: 0 }),
};

export default function RecommendationsDeck() {
    const { hideRecommendationsDeck, skippedMediaIds, addSkippedMediaId, removeSkippedMediaId, resetSkippedMediaIds } = useSettingsStore();
    const { fullMediaList, isMediaListLoaded } = useAnimeStore();
    const preferredTitleLanguage = usePreferredTitleLanguage();
    const session = useSession();

    const [viewIndex, setViewIndex] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [direction, setDirection] = useState(0);

    const { data, size, setSize, isLoading, isValidating } = useSWRInfinite<RecommendationResponse>(
        (pageIndex, previousPageData) => {
            if (session?.activeProvider !== "anilist") return null;
            if (previousPageData && !previousPageData.pageInfo.hasNextPage) return null;
            return `/api/recommendations?page=${pageIndex + 1}`;
        },
        fetcher,
        { revalidateOnFocus: false, revalidateOnReconnect: false, revalidateIfStale: false, revalidateFirstPage: false },
    );

    // Derived candidates
    const candidates = useMemo(() => {
        if (!data || !isMediaListLoaded) return [];
        const flat = data.flatMap((page) => page.data || []);
        const userFullMediaIds = new Set(fullMediaList.map((media) => media.id));
        // We filter out items already in user's list, but we KEEP skipped items to allow cycling back to them
        return flat.filter((rec) => !userFullMediaIds.has(rec.mediaRecommendation.id));
    }, [data, fullMediaList, isMediaListLoaded]);

    // Initial positioning logic
    useEffect(() => {
        if (!isMediaListLoaded || isLoading || isInitialized) return;

        // If we have no data yet but SWR is done loading first page, maybe no recs exist
        if (candidates.length === 0 && data?.[0]?.data?.length === 0) {
            setIsInitialized(true);
            return;
        }

        if (candidates.length > 0) {
            const firstUnskippedIndex = candidates.findIndex((rec) => !skippedMediaIds.includes(rec.mediaRecommendation.id));

            if (firstUnskippedIndex !== -1) setViewIndex(firstUnskippedIndex);
            else setViewIndex(candidates.length);

            setIsInitialized(true);
        }
    }, [isMediaListLoaded, isLoading, isInitialized, candidates, skippedMediaIds, data]);

    // Pagination
    useEffect(() => {
        if (isLoading || isValidating || !isInitialized) return;

        const isApproachingEnd = viewIndex >= candidates.length - 2;
        const lastPage = data?.[data.length - 1];
        const hasMore = lastPage?.pageInfo.hasNextPage;

        if (isApproachingEnd && hasMore) setSize(size + 1);
    }, [viewIndex, candidates.length, isLoading, isValidating, isInitialized, data, size, setSize]);

    // Provider Reset
    useEffect(() => {
        if (session?.activeProvider !== "anilist") {
            setViewIndex(0);
            setIsInitialized(false);
        }
    }, [session?.activeProvider]);

    const handleAddTitle = async () => {
        const currentRecommendation = candidates[viewIndex];
        if (!session || !currentRecommendation) return;
        setDirection(1);
        const id = currentRecommendation.mediaRecommendation.id;
        setIsActionLoading(true);

        try {
            const response = await fetch("/api/status", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ animeIds: id, status: "planning" }),
            });

            if (response.ok) {
                const result = await response.json();
                toast.success(`Successfully added ${result.success} title${result.success > 1 ? "s" : ""} to your Planning list!`);
                await fetchMediaList({ session, selectMedia: id });
            } else {
                const text = await response.text();
                toast.error("Failed to change status", { description: text });
            }
        } catch (error) {
            toast.error("Failed to change status", { description: error instanceof Error ? error.message : "Unknown error" });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleNext = () => {
        const currentRecommendation = candidates[viewIndex];
        if (currentRecommendation) addSkippedMediaId(currentRecommendation.mediaRecommendation.id);

        const nextIndex = viewIndex + 1;
        const nextRecommendation = candidates[nextIndex];
        if (nextRecommendation) removeSkippedMediaId(nextRecommendation.mediaRecommendation.id);

        setDirection(1);
        setViewIndex((prev) => prev + 1);
    };

    const handlePrev = () => {
        const prevIndex = Math.max(0, viewIndex - 1);
        const prevRecommendation = candidates[prevIndex];
        if (prevRecommendation) removeSkippedMediaId(prevRecommendation.mediaRecommendation.id);

        setDirection(-1);
        setViewIndex((prev) => Math.max(0, prev - 1));
    };

    const handleReset = () => {
        resetSkippedMediaIds();
        setViewIndex(0);
    };

    if (hideRecommendationsDeck || !isAniListSession(session)) return null;

    if ((isLoading && !data) || !isInitialized) return null;

    const currentRec = candidates[viewIndex];
    const isEnd = !currentRec && !data?.[data?.length - 1]?.pageInfo.hasNextPage;
    const isFetchingMore = !currentRec && isValidating;

    if (isEnd) {
        return (
            <Card className="w-full bg-component-primary overflow-hidden">
                <CardHeader className="text-center">
                    <CardTitle className="text-lg flex items-center justify-center gap-1">
                        <Sparkles className="size-4" />
                        All caught up!
                    </CardTitle>
                    <CardDescription>We ran out of things to recommend.</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-center w-full gap-4">
                    {viewIndex > 0 && (
                        <Button variant="outline" onClick={handlePrev}>
                            <ChevronLeft />
                            Go Back
                        </Button>
                    )}
                    <Button variant="outline" onClick={handleReset}>
                        <RotateCcw />
                        Reset Skipped Titles
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    if (!currentRec) {
        return (
            <Card className="w-full bg-component-primary overflow-hidden">
                <CardContent className="flex justify-center py-8">
                    <LoaderCircle className="animate-spin size-8 text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    const { media, mediaRecommendation } = currentRec;
    const sourceTitle = getTitleWithPreference(media, preferredTitleLanguage);

    return (
        <Card className="relative w-full bg-component-primary overflow-hidden">
            <CardHeader className="text-center">
                <CardTitle className="text-lg flex items-center justify-center gap-1">
                    <Sparkles className="size-4" />
                    Recommended for you
                </CardTitle>
                <CardDescription className="overflow-hidden flex flex-wrap items-center justify-center space-x-1 text-muted-foreground">
                    <span>Because you watched</span>
                    <span className="font-bold text-primary truncate" title={sourceTitle}>
                        {sourceTitle}
                    </span>
                </CardDescription>
            </CardHeader>

            <CardContent>
                <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                    <motion.div key={mediaRecommendation.id} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }} className="flex flex-col gap-6">
                        <AnimeCard isStatic={true} anime={mediaRecommendation} className="mx-auto w-full sm:max-w-[200px] shadow-md" />
                    </motion.div>
                </AnimatePresence>
            </CardContent>

            <CardFooter className="flex w-full gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={handlePrev} disabled={viewIndex === 0 || isActionLoading}>
                            <ChevronLeft className="size-4" />
                            <span className="sr-only">Previous recommendation</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Previous</p>
                    </TooltipContent>
                </Tooltip>

                <Button className="flex-1" onClick={handleAddTitle} disabled={isActionLoading}>
                    {isActionLoading ? <LoaderCircle className="animate-spin" /> : <BadgePlus />}
                    Add to List
                </Button>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={handleNext} disabled={isActionLoading || isFetchingMore}>
                            <ChevronRight className="size-4" />
                            <span className="sr-only">Next recommendation</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Next</p>
                    </TooltipContent>
                </Tooltip>
            </CardFooter>
        </Card>
    );
}
