import { ExternalLink, Globe, LoaderCircle, Play, Sparkles, Star, Tv, TvMinimalPlay, Youtube } from "lucide-react";
import Image from "next/image";
import { memo, use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import sanitizeHtml from "sanitize-html";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import type { MediaItem } from "~/lib/types";
import { cn, fetchMediaList, getAiringDateInfo, getImageUrlWithPreference, getPrettyDuration, getPrettyMediaFormat, getPrettyProviderName, getPrettyReleasingStatus, getReleasingStatusDescription, getTitleWithPreference } from "~/lib/utils";
import { useSession } from "~/providers/session-provider";
import { useAnimeStore } from "~/store/anime";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

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

const externalSiteLanguages: Record<string, string> = { Japanese: "JP", English: "EN", Spanish: "ES", French: "FR", German: "DE", Italian: "IT", Chinese: "ZH", Korean: "KR" };

const AnimeDetails = memo(function AnimeDetails({ anime, className }: { anime: MediaItem; className?: string }) {
    const session = useSession();

    const { temporaryWatching, addTemporaryWatching, removeSelectedMedia } = useAnimeStore();

    const descriptionRef = useRef<HTMLDivElement>(null);
    const [isDescriptionAtEnd, setIsDescriptionAtEnd] = useState(false);
    const genresRef = useRef<HTMLDivElement>(null);
    const [isGenresAtEnd, setIsGenresAtEnd] = useState(false);
    const linksRef = useRef<HTMLDivElement>(null);
    const [isLinksAtEnd, setIsLinksAtEnd] = useState(false);

    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const useScrollEndDetection = (ref: React.RefObject<HTMLDivElement | null>, setIsAtEnd: (value: boolean) => void, orientation: "horizontal" | "vertical", dependencies: unknown[]) => {
        const checkScroll = useCallback(() => {
            const scrollContainer = ref.current?.querySelector("[data-radix-scroll-area-viewport]");
            if (!scrollContainer) return;

            if (orientation === "horizontal") {
                const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
                setIsAtEnd(Math.abs(scrollWidth - clientWidth - scrollLeft) < 1);
            } else {
                const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
                setIsAtEnd(Math.abs(scrollHeight - clientHeight - scrollTop) < 1);
            }
        }, [ref, setIsAtEnd, orientation]);

        useEffect(() => {
            const scrollContainer = ref.current?.querySelector("[data-radix-scroll-area-viewport]");
            if (!scrollContainer) return;

            requestAnimationFrame(checkScroll);
            scrollContainer.addEventListener("scroll", checkScroll);
            return () => scrollContainer.removeEventListener("scroll", checkScroll);
        }, [checkScroll, ...dependencies]);
    };

    useScrollEndDetection(descriptionRef, setIsDescriptionAtEnd, "vertical", [anime.description]);
    useScrollEndDetection(genresRef, setIsGenresAtEnd, "horizontal", [anime.genres]);
    useScrollEndDetection(linksRef, setIsLinksAtEnd, "horizontal", [anime.externalLinks]);

    const trailerUrl = useMemo(() => {
        if (!anime.trailer) return null;
        if (anime.trailer.site === "youtube" && anime.trailer.id) return `https://www.youtube.com/watch?v=${anime.trailer.id}`;
        if (anime.trailer.site === "dailymotion" && anime.trailer.id) return `https://www.dailymotion.com/video/${anime.trailer.id}`;
        return null;
    }, [anime.trailer]);

    const externalLinks = useMemo(
        () =>
            anime.externalLinks?.sort((a, b) => {
                const typeOrder = { STREAMING: 0, INFO: 1, SOCIAL: 2 };
                return (typeOrder[a.type] ?? 3) - (typeOrder[b.type] ?? 3);
            }) ?? [],
        [anime.externalLinks],
    );

    const getParagraphDetails = useMemo(() => {
        const paragraphDetails = [];

        if (anime.startSeason?.season && anime.startSeason?.year) paragraphDetails.push(`${anime.startSeason.season.charAt(0) + anime.startSeason.season.toLowerCase().slice(1)} ${anime.startSeason.year}`);

        if (anime.episodes > 1) paragraphDetails.push(`${anime.episodes} episodes`);
        else if (anime.duration) paragraphDetails.push(getPrettyDuration(anime.duration));

        return paragraphDetails.join(" • ");
    }, [anime.episodes, anime.duration, anime.startSeason]);

    const airingDateInfo = useMemo(() => getAiringDateInfo(anime), [anime]);

    const sanitizedDescription = useMemo(() => sanitizeDescription(anime.description), [anime.description]);

    const mainStudios = useMemo(() => anime.studios.filter((studio) => studio.isMain), [anime.studios]);
    const producerStudios = useMemo(() => anime.studios.filter((studio) => !studio.isMain), [anime.studios]);

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
        <div className={cn("relative flex flex-col md:grid md:grid-cols-3 rounded-lg border bg-card shadow-sm p-3 md:p-4 gap-3 md:gap-4 overflow-hidden", className)}>
            <div className="absolute inset-0 md:hidden">
                <Image className="object-cover opacity-60" src={getImageUrlWithPreference(anime, "extraLarge")} alt={getTitleWithPreference(anime)} fill />
                <div className="absolute inset-0 bg-gradient-to-b from-card/50 via-card/95 to-card" />
            </div>

            <div className="relative md:col-span-2 flex flex-col gap-3 md:gap-4 min-h-0 overflow-hidden order-1 md:order-2 flex-1">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold leading-relaxed line-clamp-2">{getTitleWithPreference(anime)}</h2>
                    <p className="flex gap-2 items-center flex-wrap">
                        <Badge className="font-bold text-xs md:text-sm">{getPrettyMediaFormat(anime.format)}</Badge>
                        <span className="text-muted-foreground text-xs md:text-sm">{getParagraphDetails}</span>
                    </p>
                </div>
                <div className="flex gap-4 md:gap-6 flex-wrap">
                    {anime.averageScore && (
                        <Tooltip>
                            <TooltipTrigger>
                                <div className="flex items-center gap-1 font-mono">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 md:w-5 md:h-5 fill-primary stroke-primary" />
                                        <span className="text-base md:text-lg font-bold text-card-foreground">{anime.averageScore}</span>
                                    </div>
                                    <span className="text-muted-foreground text-xs md:text-sm">/10</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Weighted user average score</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                    <Tooltip>
                        <TooltipTrigger>
                            <div className="flex items-center gap-1.5 cursor-help">
                                <span className="relative flex size-2.5 md:size-3">
                                    {anime.releasingStatus === "RELEASING" && <span className="absolute size-full rounded-full bg-primary animate-ping" />}
                                    <span
                                        className={cn(
                                            "absolute size-full rounded-full",
                                            anime.releasingStatus === "FINISHED" && "bg-green-500",
                                            anime.releasingStatus === "RELEASING" && "bg-primary",
                                            anime.releasingStatus === "NOT_YET_RELEASED" && "bg-muted-foreground/50",
                                            (anime.releasingStatus === "CANCELLED" || anime.releasingStatus === "HIATUS") && "bg-destructive",
                                        )}
                                    />
                                </span>
                                <span className="text-xs md:text-sm font-medium">{getPrettyReleasingStatus(anime.releasingStatus)}</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{getReleasingStatusDescription(anime.releasingStatus)}</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
                <div className="flex flex-wrap gap-3 md:gap-4">
                    <Tooltip>
                        <TooltipTrigger>
                            <div className="flex flex-col items-start text-xs md:text-sm">
                                <span className="text-muted-foreground">Studios:</span>
                                <span className="line-clamp-2">{mainStudios.map((studio) => studio.name).join(", ")}</span>
                            </div>
                        </TooltipTrigger>
                        {producerStudios.length > 0 && (
                            <TooltipContent>
                                <p className="flex flex-col">
                                    <span className="text-muted-foreground text-sm">Producers:</span>
                                    {producerStudios.map(({ name }) => (
                                        <span key={name}>{name}</span>
                                    ))}
                                </p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                    <div className="flex gap-3 md:gap-4 text-xs md:text-sm">
                        {airingDateInfo?.label.from && (
                            <div className="flex flex-col">
                                <span className="text-muted-foreground">Start Date:</span>
                                <span>{airingDateInfo.label.from}</span>
                            </div>
                        )}
                        {airingDateInfo?.label.to && (
                            <div className="flex flex-col">
                                <span className="text-muted-foreground">End Date:</span>
                                <span>{airingDateInfo.label.to}</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex-1 min-h-0 flex flex-col gap-3">
                    {anime.description && (
                        <ScrollArea className="pr-2 relative overflow-hidden flex-1 min-h-0" ref={descriptionRef}>
                            {/* biome-ignore lint/security/noDangerouslySetInnerHtml: it's sanitized trust me bro */}
                            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
                            <div className={cn("absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-card to-transparent pointer-events-none transition-opacity", isDescriptionAtEnd && "opacity-0")} />
                        </ScrollArea>
                    )}
                    <ScrollArea className="relative" ref={genresRef}>
                        <div className="flex gap-2">
                            {anime.genres.map((genre) => (
                                <Badge key={genre} variant="secondary" className="font-medium text-xs md:text-sm whitespace-nowrap">
                                    {genre}
                                </Badge>
                            ))}
                        </div>
                        <div className={cn("absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none transition-opacity", isGenresAtEnd && "opacity-0")} />
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </div>
            </div>

            <div className="relative md:col-span-1 flex flex-col gap-3 md:gap-4 order-2 md:order-1 md:flex-1">
                <div className="relative w-full h-64 md:flex-1 hidden md:block">
                    <Image className="object-cover rounded-md shadow-sm" src={getImageUrlWithPreference(anime, "extraLarge")} alt={getTitleWithPreference(anime)} fill />
                </div>
                <div className="flex flex-col gap-3 md:gap-4">
                    <div className="flex flex-col gap-2 order-2 md:order-1">
                        <Button onClick={handleStatusUpdate} disabled={isUpdatingStatus || temporaryWatching.has(anime.id)} className="text-xs md:text-sm">
                            {isUpdatingStatus ? <LoaderCircle className="animate-spin w-4 h-4" /> : <Play className="w-4 h-4" />}
                            <span className="truncate">Set as Watching</span>
                        </Button>
                        {trailerUrl && (
                            <Button asChild variant="outline" className="text-xs md:text-sm">
                                <a href={trailerUrl} target="_blank" rel="noopener noreferrer">
                                    <Youtube className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">Watch trailer</span>
                                </a>
                            </Button>
                        )}
                        {session && (
                            <Button asChild variant="outline" className="text-xs md:text-sm">
                                <a href={anime.siteUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">View on {getPrettyProviderName(session?.activeProvider)}</span>
                                </a>
                            </Button>
                        )}
                    </div>
                    {externalLinks.length > 0 && (
                        <ScrollArea className="relative order-1 md:order-2" ref={linksRef}>
                            <div className="flex gap-2">
                                {externalLinks.map((link) => (
                                    <Tooltip key={link.url}>
                                        <TooltipTrigger asChild>
                                            <Button asChild size="icon" variant="secondary" style={{ backgroundColor: link.color ?? undefined }}>
                                                <a href={link.url} target="_blank" rel="noopener noreferrer">
                                                    {link.icon ? <Image src={link.icon} alt={link.site} width={16} height={16} /> : <Globe />}
                                                </a>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="space-x-1">
                                                <span className="font-medium text-sm">{link.site}</span>
                                                {link.language && <span className="text-muted-foreground text-xs">{externalSiteLanguages[link.language] ?? link.language}</span>}
                                                {link.notes && <span className="text-muted-foreground text-xs">({link.notes})</span>}
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                            <div className={cn("absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none transition-opacity", isLinksAtEnd && "opacity-0")} />
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                    )}
                </div>
            </div>
        </div>
    );
});

export default AnimeDetails;
