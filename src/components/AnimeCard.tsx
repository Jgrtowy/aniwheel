import { Clapperboard, ExternalLink, Music4, Popcorn, Star } from "lucide-react";
import Image from "next/image";
import { memo, useCallback, useMemo } from "react";
import { Button } from "~/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { usePreferredImageSize, usePreferredTitleLanguage, useToggleSelectedMedia } from "~/hooks/useShallowStore";
import type { MediaItem } from "~/lib/types";
import { cn, getImageUrlWithPreference, getPrettyProviderName, getTitleWithPreference } from "~/lib/utils";
import { useSession } from "~/providers/session-provider";

type AnimeCardProps =
    | {
          anime: MediaItem;
          checked: boolean;
          isStatic?: false;
          variant?: "default" | "compact";
          showDetails?: boolean;
          className?: string;
      }
    | {
          anime: MediaItem;
          isStatic: true;
          variant?: "default" | "compact";
          showDetails?: boolean;
          className?: string;
      };

const AnimeCard = memo(function AnimeCard(props: AnimeCardProps) {
    const { anime, isStatic, variant = "default", showDetails = true, className } = props;
    const checked = isStatic ? true : props.checked;

    const toggleSelectedMedia = useToggleSelectedMedia();
    const preferredTitleLanguage = usePreferredTitleLanguage();
    const preferredImageSize = usePreferredImageSize();
    const session = useSession();

    const title = useMemo(() => getTitleWithPreference(anime, preferredTitleLanguage), [anime, preferredTitleLanguage]);
    const imageUrl = useMemo(() => getImageUrlWithPreference(anime, undefined, preferredImageSize), [anime, preferredImageSize]);

    const handleClick = useCallback(() => {
        if (!isStatic) {
            toggleSelectedMedia(anime.id);
        }
    }, [isStatic, toggleSelectedMedia, anime.id]);

    const cardClasses = useMemo(() => {
        if (variant === "compact") return cn("relative flex flex-col justify-between p-0.5 rounded-lg transition-all overflow-hidden aspect-square", !isStatic && "cursor-pointer", checked ? "brightness-100 opacity-100" : "brightness-75 opacity-75", className);
        return cn(
            "relative flex flex-col justify-between p-1 sm:p-2 rounded-lg transition-all brightness-75 opacity-75 w-[calc(100%-2rem)] sm:w-full sm:scale-90 aspect-[4] sm:aspect-square",
            !isStatic && "cursor-pointer outline-none focus-visible:border-ring focus-visible:ring-ring/75 focus-visible:ring-[3px]",
            checked && "brightness-100 opacity-100 w-full sm:scale-100 aspect-[3.5]",
            className,
        );
    }, [variant, isStatic, checked, className]);

    const CardElement = isStatic ? "div" : "button";
    const cardProps = isStatic ? {} : { onClick: handleClick, type: "button" as const };

    return (
        <CardElement className={cardClasses} {...cardProps}>
            {!isStatic && <span className="sr-only">Select {title}</span>}
            {variant !== "compact" && (
                <div className={cn("absolute inset-0 -z-20 rounded-[inherit] opacity-50 ease-out transition-all duration-700 scale-0 lg:block hidden", checked && "scale-100")}>
                    <Image className="object-cover size-full blur-xl rounded-[inherit]" src={imageUrl} alt={title} fill sizes="100%" priority={false} />
                </div>
            )}
            <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
                <Image className={cn("object-cover -z-10 ease-in-out duration-125 scale-130", checked && "scale-100")} src={imageUrl} alt={title} fill sizes="100%" />
            </div>
            <div className="flex justify-between w-full z-10">
                <div className="flex-shrink-0">
                    {anime.siteUrl && showDetails && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button asChild variant="outline" className="size-7 bg-component-primary">
                                    <a href={anime.siteUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                        <ExternalLink className="size-3" />
                                        <span className="sr-only">View on {session?.activeProvider}</span>
                                    </a>
                                </Button>
                            </TooltipTrigger>
                            {session?.activeProvider && (
                                <TooltipContent>
                                    <p>View on {getPrettyProviderName(session?.activeProvider)}</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    )}
                </div>
                <div className={cn("flex gap-2 font-medium leading-tight whitespace-nowrap flex-shrink-0", variant === "compact" ? "text-xs flex-col-reverse items-end gap-0.5" : "sm:text-sm text-xs")}>
                    {anime.averageScore && showDetails && (
                        <div className="flex items-center gap-1 h-7 px-2 text-xs w-fit border rounded-md bg-component-primary">
                            <Star className="size-3" />
                            <p>{anime.averageScore}</p>
                            <span className="sr-only">Average score</span>
                        </div>
                    )}
                    {anime.episodes > 0 && showDetails && (
                        <div className="flex items-center gap-1 h-7 px-2 text-xs w-fit border rounded-md bg-component-primary">
                            {anime.format === "MOVIE" ? <Popcorn className="size-3" /> : anime.format === "MUSIC" ? <Music4 className="size-3" /> : <Clapperboard className="size-3" />}
                            {anime.format === "MOVIE" ? (
                                anime.episodes <= 1 ? (
                                    <span>Movie</span>
                                ) : (
                                    <span>
                                        {anime.episodes} ep{anime.episodes === 1 ? "" : "s"}
                                    </span>
                                )
                            ) : anime.format === "MUSIC" ? (
                                <span>Music</span>
                            ) : (
                                <span>
                                    {anime.episodes} ep{anime.episodes === 1 ? "" : "s"}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="p-1 w-fit border rounded-md text-left bg-component-primary">
                <p className={cn("font-medium leading-tight line-clamp-1 sm:line-clamp-2 w-fit", variant === "compact" ? "text-xs" : "text-xs sm:text-sm")}>{title}</p>
            </div>
        </CardElement>
    );
});

export default AnimeCard;
