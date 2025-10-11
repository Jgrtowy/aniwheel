import { Building2, CalendarDays, Clapperboard, Clock, ExternalLink, Star, TvMinimalPlay } from "lucide-react";
import Image from "next/image";
import { type CSSProperties, type ReactElement, memo } from "react";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { usePreferredImageSize, usePreferredTitleLanguage, useToggleSelectedMedia } from "~/hooks/useShallowStore";
import type { MediaItem, UserProfile } from "~/lib/types";
import { cn, getImageUrlWithPreference, getPrettyMediaFormat, getPrettyProviderName, getPrettyReleasingStatus, getTitleWithPreference, mediaDateToDate } from "~/lib/utils";
import { useSession } from "~/providers/session-provider";

interface AnimeListItemProps {
    anime: MediaItem;
    checked: boolean;
    showDetails?: boolean;
    className?: string;
}

const releasingStatusDescriptions: Record<NonNullable<MediaItem["releasingStatus"]>, string> = {
    FINISHED: "Has completed and is no longer being released",
    RELEASING: "Currently releasing",
    NOT_YET_RELEASED: "To be released at a later date",
    CANCELLED: "Ended before the work could be finished",
    HIATUS: "Is currently paused from releasing and will resume at a later date",
};

type AiringDateInfo = { label: string; isRange: boolean };

const maskGradient = "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,var(--mask-opacity-65)) 65%, transparent 100%)";

const getImageMaskStyle = (checked: boolean): CSSProperties & { "--mask-opacity-65": string } => ({
    maskImage: maskGradient,
    WebkitMaskImage: maskGradient,
    transition: "mask-image 200ms ease, -webkit-mask-image 200ms ease, --mask-opacity-65 200ms ease",
    "--mask-opacity-65": checked ? "1" : "0",
});

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

interface DetailElementsArgs {
    anime: MediaItem;
    airingDateInfo: AiringDateInfo | null;
    activeProvider?: UserProfile["provider"] | null;
    showDetails: boolean;
}

const getDetailElements = ({ anime, airingDateInfo, activeProvider, showDetails }: DetailElementsArgs): ReactElement[] => {
    const badgeBaseClasses = "bg-component-primary tracking-tight";
    const items: ReactElement[] = [];

    items.push(
        <Badge variant="outline" className={badgeBaseClasses} key="format">
            <p>{getPrettyMediaFormat(anime.format)}</p>
            <span className="sr-only">Media format</span>
        </Badge>,
    );

    if (anime.averageScore) {
        items.push(
            <Tooltip key="score">
                <TooltipTrigger asChild>
                    <Badge variant="outline" className={badgeBaseClasses}>
                        <Star className="size-3" />
                        <p>{anime.averageScore}</p>
                        <span className="sr-only">Average score</span>
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Weighted user average score</p>
                </TooltipContent>
            </Tooltip>,
        );
    }

    if (anime.episodes > 1) {
        items.push(
            <Tooltip key="episodes">
                <TooltipTrigger asChild>
                    <Badge variant="outline" className={badgeBaseClasses}>
                        <Clapperboard className="size-3" />
                        <p>
                            {anime.episodes} {anime.episodes === 1 ? "ep" : "eps"}
                        </p>
                        <span className="sr-only">Number of episodes</span>
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Total number of episodes</p>
                </TooltipContent>
            </Tooltip>,
        );
    }

    if (anime.duration && anime.duration > 0) {
        items.push(
            <Tooltip key="duration">
                <TooltipTrigger asChild>
                    <Badge variant="outline" className={badgeBaseClasses}>
                        <Clock className="size-3" />
                        <p>{anime.duration} min</p>
                        <span className="sr-only">Media duration</span>
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{anime.format === "MOVIE" ? "Movie runtime" : "Approximate duration of one episode"}</p>
                </TooltipContent>
            </Tooltip>,
        );
    }

    const statusDescription = anime.releasingStatus ? releasingStatusDescriptions[anime.releasingStatus] : undefined;

    items.push(
        <Tooltip key="status">
            <TooltipTrigger asChild>
                <Badge variant="outline" className={badgeBaseClasses}>
                    <TvMinimalPlay className="size-3" />
                    <p>{getPrettyReleasingStatus(anime.releasingStatus)}</p>
                    <span className="sr-only">Releasing status</span>
                </Badge>
            </TooltipTrigger>
            <TooltipContent>
                <p>{statusDescription ?? "Releasing status"}</p>
            </TooltipContent>
        </Tooltip>,
    );

    if (airingDateInfo) {
        items.push(
            <Tooltip key="airing">
                <TooltipTrigger asChild>
                    <Badge variant="outline" className={badgeBaseClasses}>
                        <CalendarDays className="size-3" />
                        <p>{airingDateInfo.label}</p>
                        <span className="sr-only">{airingDateInfo.isRange ? "Airing date range" : "Airing date"}</span>
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{airingDateInfo.isRange ? "Airing date range" : "Airing date"}</p>
                </TooltipContent>
            </Tooltip>,
        );
    }

    if (anime.studios.length > 0) {
        const mainStudios = anime.studios.filter((studio) => studio.isMain);
        const producerStudios = anime.studios.filter((studio) => !studio.isMain);

        items.push(
            <Tooltip key="studios">
                <TooltipTrigger asChild>
                    <Badge variant="outline" className={badgeBaseClasses}>
                        <Building2 className="size-3" />
                        <p>{mainStudios.map((studio) => studio.name).join(", ")}</p>
                        <span className="sr-only">Studios</span>
                    </Badge>
                </TooltipTrigger>
                <TooltipContent className="flex flex-col gap-2">
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
            </Tooltip>,
        );
    }

    if (anime.siteUrl && showDetails) {
        items.push(
            <Tooltip key="site-link">
                <TooltipTrigger asChild>
                    <Badge variant="outline" className="bg-component-primary" asChild>
                        <a href={anime.siteUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                            <ExternalLink />
                            <span className="sr-only">{activeProvider ? `View on ${getPrettyProviderName(activeProvider)}` : "View on provider"}</span>
                        </a>
                    </Badge>
                </TooltipTrigger>
                {activeProvider && (
                    <TooltipContent>
                        <p>View on {getPrettyProviderName(activeProvider)}</p>
                    </TooltipContent>
                )}
            </Tooltip>,
        );
    }

    return items;
};

const AnimeListItem = memo(function AnimeListItem({ anime, checked, showDetails = true, className }: AnimeListItemProps) {
    const toggleSelectedMedia = useToggleSelectedMedia();
    const preferredTitleLanguage = usePreferredTitleLanguage();
    const preferredImageSize = usePreferredImageSize();
    const session = useSession();

    const containerClasses = cn("relative w-full overflow-hidden rounded-lg border", className);
    const title = getTitleWithPreference(anime, preferredTitleLanguage);
    const imageUrl = getImageUrlWithPreference(anime, undefined, preferredImageSize);
    const imageMaskStyle = getImageMaskStyle(checked);
    const airingDateInfo = getAiringDateInfo(anime);
    const rawActiveProvider = session?.activeProvider;
    const activeProvider = rawActiveProvider === "anilist" || rawActiveProvider === "myanimelist" ? rawActiveProvider : undefined;
    const detailElements = getDetailElements({ anime, airingDateInfo, activeProvider, showDetails });

    return (
        <div className={containerClasses}>
            <div className="pointer-events-none absolute inset-y-0 left-0 max-w-full w-52">
                <Image className={cn("object-cover transition duration-200", !checked && "grayscale")} alt={title} src={imageUrl} fill sizes="100%" priority style={imageMaskStyle} />
            </div>
            <Label className="relative flex w-full cursor-pointer items-center gap-2 sm:gap-3 p-2 sm:p-3" htmlFor={`anime-checkbox-${anime.id}`}>
                <Checkbox className="size-7 transition-transform duration-200 hover:scale-115 sm:size-6 cursor-pointer data-[state=unchecked]:bg-background/50!" id={`anime-checkbox-${anime.id}`} checked={checked} onCheckedChange={() => toggleSelectedMedia(anime.id)} />
                <div className="flex flex-col gap-1">
                    <h2 className="w-fit leading-tight line-clamp-2 sm:line-clamp-1 text-lg sm:text-xl bg-component-primary border rounded-md px-2 py-0.5">{title}</h2>
                    <div className="flex flex-wrap gap-1">{detailElements}</div>
                </div>
            </Label>
        </div>
    );
});

export default AnimeListItem;
