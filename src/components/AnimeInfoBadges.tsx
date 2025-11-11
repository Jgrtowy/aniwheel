import { Building2, CalendarDays, Clapperboard, Clock, ExternalLink, Star, TvMinimalPlay } from "lucide-react";
import type { ReactElement } from "react";
import { Badge } from "~/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import type { MediaItem, UserProfile } from "~/lib/types";
import { cn, getPrettyDuration, getPrettyMediaFormat, getPrettyProviderName, getPrettyReleasingStatus, mediaDateToDate } from "~/lib/utils";

type BadgeType = "format" | "score" | "episodes" | "duration" | "status" | "airing" | "studios" | "siteLink";

interface AnimeDetailBadgesProps {
    anime: MediaItem;
    activeProvider?: UserProfile["provider"] | null;
    badges?: BadgeType[];
    className?: string;
    badgeClassName?: string;
    disableHoverableContent?: boolean;
}

type AiringDateInfo = { label: string; isRange: boolean };

const releasingStatusDescriptions: Record<NonNullable<MediaItem["releasingStatus"]>, string> = {
    FINISHED: "Has completed and is no longer being released",
    RELEASING: "Currently releasing",
    NOT_YET_RELEASED: "To be released at a later date",
    CANCELLED: "Ended before the work could be finished",
    HIATUS: "Is currently paused from releasing and will resume at a later date",
};

const getAiringDateInfo = (anime: MediaItem): AiringDateInfo | null => {
    const dateFormatter = new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" });

    const formatDate = (date: MediaItem["startDate"]) => {
        if (!date || !date.year) return null;

        if (date.month && date.day) {
            const parsedDate = mediaDateToDate(date);
            if (!parsedDate) return null;

            try {
                return dateFormatter.format(parsedDate);
            } catch (error) {
                return parsedDate.toISOString().slice(0, 10);
            }
        }

        if (date.month) {
            const parsedDate = mediaDateToDate({ ...date, day: 1 });
            if (!parsedDate) return null;

            try {
                return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short" }).format(parsedDate);
            } catch (error) {
                return `${date.year}-${String(date.month).padStart(2, "0")}`;
            }
        }

        return String(date.year);
    };

    const formattedStart = formatDate(anime.startDate);
    const formattedEnd = formatDate(anime.endDate);

    if (formattedStart && formattedEnd) {
        if (formattedStart === formattedEnd) return { label: formattedStart, isRange: false };

        return { label: `${formattedStart} - ${formattedEnd}`, isRange: true };
    }

    if (formattedStart) return { label: `From ${formattedStart}`, isRange: false };
    if (formattedEnd) return { label: `Until ${formattedEnd}`, isRange: false };

    return null;
};

export function AnimeInfoBadges({ anime, activeProvider, badges, className, badgeClassName, disableHoverableContent = false }: AnimeDetailBadgesProps) {
    const airingDateInfo = getAiringDateInfo(anime);
    const availableBadges: BadgeType[] = badges ?? ["format", "score", "episodes", "duration", "status", "airing", "studios", "siteLink"];
    const items: ReactElement[] = [];
    const badgeBaseClasses = cn(badgeClassName, "bg-component-primary tracking-tight");

    const badgeMap: Record<BadgeType, () => ReactElement | null> = {
        format: () => (
            <Badge variant="outline" className={badgeBaseClasses} key="format">
                <p>{getPrettyMediaFormat(anime.format)}</p>
                <span className="sr-only">Media format</span>
            </Badge>
        ),

        score: () => {
            if (!anime.averageScore) return null;
            return (
                <Tooltip key="score" disableHoverableContent={disableHoverableContent}>
                    <TooltipTrigger asChild>
                        <Badge variant="outline" className={badgeBaseClasses}>
                            <Star className="size-3" />
                            <p>{anime.averageScore}</p>
                            <span className="sr-only">Average score</span>
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="pointer-events-none">
                        <p>Weighted user average score</p>
                    </TooltipContent>
                </Tooltip>
            );
        },

        episodes: () => {
            if (anime.episodes <= 1) return null;
            return (
                <Tooltip key="episodes" disableHoverableContent={disableHoverableContent}>
                    <TooltipTrigger asChild>
                        <Badge variant="outline" className={badgeBaseClasses}>
                            <Clapperboard className="size-3" />
                            <p>
                                {anime.episodes} {anime.episodes === 1 ? "ep" : "eps"}
                            </p>
                            <span className="sr-only">Number of episodes</span>
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="pointer-events-none">
                        <p>Total number of episodes</p>
                    </TooltipContent>
                </Tooltip>
            );
        },

        duration: () => {
            if (!anime.duration || anime.duration <= 0) return null;
            return (
                <Tooltip key="duration" disableHoverableContent={disableHoverableContent}>
                    <TooltipTrigger asChild>
                        <Badge variant="outline" className={badgeBaseClasses}>
                            <Clock className="size-3" />
                            <p>{getPrettyDuration(anime.duration)}</p>
                            <span className="sr-only">Media duration</span>
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="pointer-events-none">
                        <p>{anime.format === "MOVIE" ? "Movie runtime" : "Approximate duration of one episode"}</p>
                    </TooltipContent>
                </Tooltip>
            );
        },

        status: () => {
            const statusDescription = anime.releasingStatus ? releasingStatusDescriptions[anime.releasingStatus] : undefined;
            return (
                <Tooltip key="status" disableHoverableContent={disableHoverableContent}>
                    <TooltipTrigger asChild>
                        <Badge variant="outline" className={badgeBaseClasses}>
                            <TvMinimalPlay className="size-3" />
                            <p>{getPrettyReleasingStatus(anime.releasingStatus)}</p>
                            <span className="sr-only">Releasing status</span>
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="pointer-events-none">
                        <p>{statusDescription ?? "Releasing status"}</p>
                    </TooltipContent>
                </Tooltip>
            );
        },

        airing: () => {
            if (!airingDateInfo) return null;
            return (
                <Tooltip key="airing" disableHoverableContent={disableHoverableContent}>
                    <TooltipTrigger asChild>
                        <Badge variant="outline" className={badgeBaseClasses}>
                            <CalendarDays className="size-3" />
                            <p>{airingDateInfo.label}</p>
                            <span className="sr-only">{airingDateInfo.isRange ? "Airing date range" : "Airing date"}</span>
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="pointer-events-none">
                        <p>{airingDateInfo.isRange ? "Airing date range" : "Airing date"}</p>
                    </TooltipContent>
                </Tooltip>
            );
        },

        studios: () => {
            if (anime.studios.length === 0) return null;
            const mainStudios = anime.studios.filter((studio) => studio.isMain);
            const producerStudios = anime.studios.filter((studio) => !studio.isMain);

            return (
                <Tooltip key="studios" disableHoverableContent={disableHoverableContent}>
                    <TooltipTrigger asChild>
                        <Badge variant="outline" className={badgeBaseClasses}>
                            <Building2 className="size-3" />
                            <p>{mainStudios.map((studio) => studio.name).join(", ")}</p>
                            <span className="sr-only">Studios</span>
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="flex flex-col gap-2 pointer-events-none">
                        <div className="mb-1">
                            <h6 className="font-bold text-sm">Studios:</h6>
                            {mainStudios.map((studio) => (
                                <p key={studio.name}>{studio.name}</p>
                            ))}
                        </div>
                        {producerStudios.length > 0 && (
                            <div className="mb-1">
                                <h6 className="font-bold text-sm">Producers:</h6>
                                {producerStudios.map((studio) => (
                                    <p key={studio.name}>{studio.name}</p>
                                ))}
                            </div>
                        )}
                    </TooltipContent>
                </Tooltip>
            );
        },

        siteLink: () => {
            if (!anime.siteUrl) return null;
            return (
                <Tooltip key="site-link" disableHoverableContent={disableHoverableContent}>
                    <TooltipTrigger asChild>
                        <Badge variant="outline" className="bg-component-primary" asChild>
                            <a href={anime.siteUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                <ExternalLink />
                                <span className="sr-only">{activeProvider ? `View on ${getPrettyProviderName(activeProvider)}` : "View on provider"}</span>
                            </a>
                        </Badge>
                    </TooltipTrigger>
                    {activeProvider && (
                        <TooltipContent className="pointer-events-none">
                            <p>View on {getPrettyProviderName(activeProvider)}</p>
                        </TooltipContent>
                    )}
                </Tooltip>
            );
        },
    };

    for (const badgeType of availableBadges) {
        const badgeElement = badgeMap[badgeType]?.();
        if (badgeElement) items.push(badgeElement);
    }

    return <div className={className}>{items}</div>;
}
