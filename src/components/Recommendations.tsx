import { BadgePlus, ChevronRight, ChevronsDown, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import AnimeCard from "~/components/AnimeCard";
import { Button } from "~/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import useMediaQuery from "~/hooks/useMediaQuery";
import { useAnimeStore, useSettingsStore } from "~/lib/store";
import type { MediaRecommendation } from "~/lib/types";
import { cn } from "~/lib/utils";
import { useSession } from "~/providers/session-provider";

const DESKTOP_DISPLAY_COUNT = 12;
const MOBILE_DISPLAY_COUNT = 4;

export default function Recommendations() {
    const { showMediaRecommendations, setShowMediaRecommendations } = useSettingsStore();
    const { fullMediaList, clearFilters, setFullMediaList, addSelectedMedia } = useAnimeStore();
    const session = useSession();

    const [filteredRecommendations, setFilteredRecommendations] = useState<MediaRecommendation[]>([]);
    const [fullRecommendations, setFullRecommendations] = useState<MediaRecommendation[]>([]);
    const [loadingIds, setLoadingIds] = useState<number[]>([]);

    const [displayCount, setDisplayCount] = useState(DESKTOP_DISPLAY_COUNT);
    const [mobileIsOpen, setMobileIsOpen] = useState(false);
    const isMobile = useMediaQuery("(max-width: 768px)");

    // Fetch recommendations "along" with planned list then filter when it's done, instead of waiting for planned media to be fetched before fetching recommendations -> s m a r t
    useEffect(() => {
        if (session?.activeProvider !== "anilist") return;
        (async () => {
            const response = await fetch("/api/recommendations");
            if (!response.ok) console.error("Failed to fetch media recommendations");
            const data: MediaRecommendation[] = await response.json();
            setFullRecommendations(data);
        })();
    }, [session?.activeProvider]);

    useEffect(() => {
        if (fullRecommendations.length === 0) return;

        const userFullMediaIds = new Set(fullMediaList.map((media) => media.id));
        const filteredRecommendations = fullRecommendations.filter((rec) => !userFullMediaIds.has(rec.mediaRecommendation.id));

        setFilteredRecommendations(filteredRecommendations);
        setDisplayCount(isMobile ? MOBILE_DISPLAY_COUNT : DESKTOP_DISPLAY_COUNT); // Reset display count when recommendations change
    }, [fullRecommendations, fullMediaList, isMobile]);

    const refreshPlannedList = async (animeId: number) => {
        if (!session?.activeProvider) return;

        try {
            const response = await fetch("/api/mediaList");
            if (response.ok) {
                const data = await response.json();
                clearFilters();
                setFullMediaList(data);
                addSelectedMedia(animeId);
            }
        } catch (error) {
            console.error("Failed to refresh planned list:", error);
        }
    };

    const handleAddTitle = async (id: number) => {
        setLoadingIds((prev) => [...prev, id]);

        try {
            const response = await fetch("/api/setPlanned", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ animeIds: id }),
            });

            if (response.ok) {
                const result = await response.json();

                toast.success(`Successfully added ${result.success} title${result.success > 1 ? "s" : ""} to your planning list!`);

                await refreshPlannedList(id);
            } else {
                console.error("Failed to add titles:", response.statusText);
                toast.error(`Failed to add titles: ${response.statusText}`);
            }
        } catch (error) {
            console.error("Error adding titles:", error);
            toast.error(`Error adding titles: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setLoadingIds((prev) => prev.filter((titleId) => titleId !== id));
        }
    };

    const shouldShowRecommendations = isMobile ? mobileIsOpen : showMediaRecommendations;

    const handleOpenChange = (open: boolean) => {
        if (isMobile) setMobileIsOpen(open);
        else setShowMediaRecommendations(open);
    };

    const displayedRecommendations = filteredRecommendations.slice(0, displayCount);
    const hasMoreRecommendations = filteredRecommendations.length > displayCount;

    const handleShowMore = () => {
        const increment = isMobile ? MOBILE_DISPLAY_COUNT : DESKTOP_DISPLAY_COUNT;
        setDisplayCount((prev) => Math.min(prev + increment, filteredRecommendations.length));
    };

    const isDisabled = !!session && session.activeProvider !== "anilist";

    return (
        <Collapsible open={shouldShowRecommendations && filteredRecommendations.length > 0} onOpenChange={handleOpenChange} disabled={isDisabled} className={`flex w-full flex-col text-card-foreground rounded-xl border shadow-sm overflow-hidden bg-component-primary ${isDisabled ? "cursor-not-allowed" : ""}`}>
            <CollapsibleTrigger asChild>
                <Button variant="ghost" className="peer flex items-center justify-center gap-6 py-8 rounded-xl rounded-b-none focus-visible:ring-0">
                    <h4 className="text-lg font-bold">Recommendations</h4>
                    <ChevronsDown className={cn("transition-transform duration-200 size-5", { "rotate-180": shouldShowRecommendations && filteredRecommendations.length > 0 })} />
                </Button>
            </CollapsibleTrigger>
            {isDisabled && <div className="px-4 pb-3 text-sm text-muted-foreground text-center">This feature is currently only available with the AniList provider</div>}
            <CollapsibleContent className="flex flex-col gap-4 px-4 pb-4 open overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down peer-hover:bg-accent peer-hover:text-accent-foreground dark:peer-hover:bg-accent/50">
                {displayedRecommendations.map((rec) => (
                    <div key={rec.id} className="grid grid-cols-5">
                        <AnimeCard isStatic={true} anime={rec.media} variant="compact" showDetails={false} className="col-span-2 rounded-md" isRecommendation={true} />
                        <div className="flex justify-center items-center px-2 col-span-1">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" className="flex flex-col gap-1.5 w-full h-fit" onClick={() => handleAddTitle(rec.mediaRecommendation.id)} disabled={loadingIds.includes(rec.mediaRecommendation.id)}>
                                        <ChevronRight className="size-5" />
                                        {loadingIds.includes(rec.mediaRecommendation.id) ? <LoaderCircle className="size-6 animate-spin" /> : <BadgePlus className="size-6" />}
                                        <ChevronRight className="size-5" />
                                        <span className="sr-only">Add to planning</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Add to planning</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <AnimeCard isStatic={true} anime={rec.mediaRecommendation} variant="compact" className="col-span-2 rounded-md" isRecommendation={true} />
                    </div>
                ))}
                {hasMoreRecommendations && (
                    <Button variant="outline" onClick={handleShowMore}>
                        Show More ({filteredRecommendations.length - displayCount} remaining)
                    </Button>
                )}
            </CollapsibleContent>
        </Collapsible>
    );
}
