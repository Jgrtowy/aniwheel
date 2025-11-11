import { CirclePlay, ExternalLink, LoaderCircle, Star, Tv } from "lucide-react";
import Image from "next/image";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import sanitizeHtml from "sanitize-html";
import { toast } from "sonner";
import { AnimeInfoBadges } from "~/components/AnimeInfoBadges";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { usePreferredTitleLanguage } from "~/hooks/useShallowStore";
import type { MediaItem } from "~/lib/types";
import { cn, fetchMediaList, getImageUrlWithPreference, getPrettyDuration, getPrettyMediaFormat, getPrettyProviderName, getTitleWithPreference } from "~/lib/utils";
import { useSession } from "~/providers/session-provider";
import { useAnimeStore } from "~/store/anime";

interface AnimeDetailsProps {
    anime: MediaItem;
    className?: string;
}

const sanitizeDescription = (html: string | null): string => {
    if (!html) return "";
    return sanitizeHtml(html, {
        allowedTags: ["br", "b", "i", "em", "strong", "a"],
        allowedAttributes: { a: ["href", "rel", "target"] },
        transformTags: {
            a: (_, attribs) => ({
                tagName: "a",
                attribs: { ...attribs, rel: "noopener noreferrer", target: "_blank" },
            }),
        },
    });
};

const AnimeDetails = memo(function AnimeDetails({ anime, className }: AnimeDetailsProps) {
    const session = useSession();

    const imageUrl = useMemo(() => getImageUrlWithPreference(anime, "extraLarge"), [anime]);
    const preferredTitleLanguage = usePreferredTitleLanguage();
    const title = useMemo(() => getTitleWithPreference(anime, preferredTitleLanguage), [anime, preferredTitleLanguage]);
    const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const sanitizedDescription = useMemo(() => sanitizeDescription(anime.description), [anime.description]);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const { temporaryWatching, addTemporaryWatching, removeSelectedMedia } = useAnimeStore();

    useEffect(() => {
        const scrollContainer = scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]");
        if (!scrollContainer) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
            const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 1;
            setIsScrolledToBottom(isAtBottom);
        };

        requestAnimationFrame(() => {
            handleScroll();
        });

        scrollContainer.addEventListener("scroll", handleScroll);
        return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }, [anime.description]);

    const handleStatusUpdate = async () => {
        if (!session) return;
        setIsUpdatingStatus(true);

        try {
            const response = await fetch("/api/status", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ animeIds: anime.id, status: "watching" }),
            });

            if (response.ok) {
                toast.success("Successfully set status to Watching!");
                await fetchMediaList({ session, selectMedia: anime.id }).then(() => {
                    addTemporaryWatching(anime);
                    removeSelectedMedia(anime.id);
                });
            } else {
                console.error("Failed to change status", response.statusText);
                toast.error("Failed to change status", { description: response.statusText });
            }
        } catch (error) {
            console.error("Failed to change status", error);
            toast.error("Failed to change status", { description: error instanceof Error ? error.message : "Unknown error" });
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    return (
        <div className={cn("inline-grid md:grid-cols-[3fr_4fr] md:grid-rows-1 grid-cols-1 grid-rows-[1fr_3fr] rounded-lg border bg-card overflow-hidden shadow-sm", className)}>
            <div className="relative w-full h-full">
                <Image src={imageUrl} alt={title} fill className="object-cover" priority />
            </div>
            <div className="flex flex-col p-4 md:p-6 gap-2 md:gap-3 overflow-hidden">
                <div className="flex flex-col gap-0.5 md:gap-1">
                    <h2 className="text-xl md:text-2xl font-bold leading-tight line-clamp-2">{title}</h2>
                    <p className="text-xs md:text-sm font-bold text-muted-foreground">
                        {getPrettyMediaFormat(anime.format)}
                        {anime.episodes > 1 ? <> &bull; {anime.episodes} episodes</> : anime.duration ? <> &bull; {getPrettyDuration(anime.duration)}</> : null}
                    </p>
                </div>
                <div className="flex-1 min-h-0 flex flex-col gap-2 md:gap-3">
                    {anime.description && (
                        <ScrollArea ref={scrollAreaRef} className="pr-2 relative overflow-hidden">
                            {/* biome-ignore lint/security/noDangerouslySetInnerHtml: it's sanitized trust me bro */}
                            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
                            <div className={cn("absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-card to-transparent pointer-events-none transition-opacity", isScrolledToBottom && "opacity-0")} />
                        </ScrollArea>
                    )}
                    <AnimeInfoBadges anime={anime} activeProvider={session?.activeProvider} badges={["score", "status", "airing", "studios"]} className="flex flex-wrap gap-2" badgeClassName="sm:text-sm gap-2 py-1" />
                </div>
                {anime.trailer && anime.trailer.site === "youtube" && (
                    <div className="relative w-full aspect-video rounded-md overflow-hidden border mt-auto">
                        <iframe src={`https://www.youtube.com/embed/${anime.trailer.id}`} title={`${title} Trailer`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 w-full h-full" />
                    </div>
                )}
                <div className="flex gap-2">
                    <Button onClick={handleStatusUpdate} disabled={isUpdatingStatus || temporaryWatching.has(anime.id)}>
                        {isUpdatingStatus ? <LoaderCircle className="animate-spin" /> : <CirclePlay />}
                        Set as Watching
                    </Button>
                    {session?.activeProvider && (
                        <Button asChild variant="outline">
                            <a href={anime.siteUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink />
                                {getPrettyProviderName(session.activeProvider)}
                            </a>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
});

export default AnimeDetails;
