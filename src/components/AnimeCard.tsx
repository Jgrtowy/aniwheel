import { Clapperboard, ExternalLink, Popcorn, Star } from "lucide-react";
import Image from "next/image";
import { memo, useCallback, useMemo } from "react";
import { Button } from "~/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { usePreferredImageSize, usePreferredTitleLanguage, useToggleSelectedMedia, useViewMode } from "~/hooks/useShallowStore";
import type { MediaItem } from "~/lib/types";
import { cn, getImageUrlWithPreference, getPrettyProviderName, getTitleWithPreference } from "~/lib/utils";
import { useSession } from "~/providers/session-provider";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

type AnimeCardProps =
    | {
          anime: MediaItem;
          checked: boolean;
          isStatic?: false;
          variant?: "default" | "compact";
          showDetails?: boolean;
          className?: string;
          isRecommendation?: boolean;
      }
    | {
          anime: MediaItem;
          isStatic: true;
          variant?: "default" | "compact";
          showDetails?: boolean;
          className?: string;
          isRecommendation?: boolean;
      };

const AnimeCard = memo(function AnimeCard(props: AnimeCardProps) {
    const { anime, isStatic, variant = "default", showDetails = true, className, isRecommendation = false } = props;
    const checked = isStatic ? true : props.checked;

    const toggleSelectedMedia = useToggleSelectedMedia();
    const viewMode = useViewMode();
    const preferredTitleLanguage = usePreferredTitleLanguage();
    const preferredImageSize = usePreferredImageSize();
    const session = useSession();

    // Memoize expensive computations
    const title = useMemo(() => getTitleWithPreference(anime, preferredTitleLanguage), [anime, preferredTitleLanguage]);
    const imageUrl = useMemo(() => getImageUrlWithPreference(anime, undefined, preferredImageSize), [anime, preferredImageSize]);

    const handleClick = useCallback(() => {
        if (!isStatic) {
            toggleSelectedMedia(anime.id);
        }
    }, [isStatic, toggleSelectedMedia, anime.id]);

    const cardClasses = useMemo(() => {
        if (variant === "compact") return cn("relative flex flex-col justify-between p-0.5 rounded-lg transition-all overflow-hidden aspect-square", !isStatic && "cursor-pointer", checked ? "brightness-100 opacity-100" : "brightness-75 opacity-75", className);
        if (viewMode === "list" && !isRecommendation) return cn("relative flex sm:flex-row gap-2 items-center rounded-2xl");
        if (viewMode === "compact" && !isRecommendation) return cn("relative flex flex-row gap-2 items-center");
        return cn(
            "relative flex flex-col justify-between p-1 sm:p-2 rounded-lg brightness-75 opacity-75 w-[calc(100%-2rem)] sm:w-full sm:scale-90 aspect-[4] sm:aspect-square",
            !isStatic && "cursor-pointer transition-all duration-125 outline-none focus-visible:border-ring focus-visible:ring-ring/75 focus-visible:ring-[3px]",
            checked && "brightness-100 opacity-100 w-full sm:scale-100 aspect-[3.5]",
            className,
        );
    }, [variant, viewMode, isRecommendation, isStatic, checked, className]);

    const CardElement = isStatic ? "div" : "button";
    const cardProps = isStatic ? {} : { onClick: handleClick, type: "button" as const };

    return (
        <>
            {(viewMode === "grid" || isRecommendation) && (
                <CardElement className={cardClasses} {...cardProps}>
                    {!isStatic && <span className="sr-only">Select {title}</span>}
                    <div className={cn("absolute inset-0 -z-20 rounded-lg transition-all ease-in-out duration-700 scale-75 brightness-50", checked && "scale-100 brightness-50")}>
                        <Image className={cn("object-cover w-full h-full blur-xl rounded-lg")} src={imageUrl} alt={title} fill sizes="100%" priority />
                    </div>
                    <Image className={cn("absolute inset-0 object-cover -z-10 transition-all ease-in-out duration-125 scale-100 rounded-lg", checked && "scale-100 rounded-lg")} src={imageUrl} alt={title} fill sizes="100%" />
                    <div className="flex justify-between w-full">
                        <div className="flex-shrink-0">
                            {anime.siteUrl && showDetails && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button asChild variant="secondary" className="flex size-7 justify-center items-center aspect-square border rounded-md bg-component-primary">
                                            <a href={anime.siteUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                                <ExternalLink className={variant === "compact" ? "size-3" : "size-3"} />
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
                        <div className={cn("flex gap-1 font-medium leading-tight whitespace-nowrap flex-shrink-0", variant === "compact" ? "text-xs flex-col-reverse items-end gap-0.5" : "sm:text-sm text-xs")}>
                            {anime.averageScore && showDetails && (
                                <div className="flex items-center gap-1 h-7 px-2 text-xs w-fit border rounded-md bg-component-primary">
                                    <Star className="size-3" />
                                    <p>{anime.averageScore}</p>
                                    <span className="sr-only">Average score</span>
                                </div>
                            )}
                            {anime.episodes > 0 && showDetails && (
                                <div className="flex items-center gap-1 h-7 px-2 text-xs w-fit border rounded-md bg-component-primary">
                                    {anime.format === "MOVIE" ? <Popcorn className="size-3" /> : <Clapperboard className="size-3" />}
                                    <p>{anime.episodes === 1 && anime.format === "MOVIE" && "Movie"}</p>
                                    <p>{anime.episodes !== 1 && (anime.episodes > 1 ? `${anime.episodes} eps` : "1 ep")}</p>
                                    <span className="sr-only">Number of episodes</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="p-1 w-fit border rounded-md text-left bg-component-primary">
                        <p className={cn("font-medium leading-tight line-clamp-1 sm:line-clamp-2 w-fit", variant === "compact" ? "text-xs" : "text-xs sm:text-sm")}>{title}</p>
                    </div>
                </CardElement>
            )}
            {viewMode !== "grid" && !isRecommendation && (
                <div className={cn(cardClasses)}>
                    <div className="flex items-center gap-2">
                        <Checkbox id={`anime-checkbox-${anime.id}`} checked={checked} onCheckedChange={() => toggleSelectedMedia(anime.id)} className="transition-all duration-200 scale-100 ease-in-out hover:scale-125 cursor-pointer sm:size-4 size-6" />
                    </div>

                    {/* <div className="absolute overflow-hidden w-full h-full rounded-2xl">
                        <Image className={cn("inset-0 object-cover ml-10 blur-xl")} src={getImageUrlWithPreference(anime)} alt={getTitleWithPreference(anime)} fill sizes="100%" priority />
                    </div> */}
                    <div className="flex sm:flex-row flex-col items-center  gap-2 w-full justify-between">
                        <div className="p-1 sm:w-fit w-full rounded-md text-left sm:max-w-2/3 flex flex-row items-center gap-4">
                            {viewMode === "list" && <Image className={cn("w-16 h-16 aspect-square object-cover rounded-lg")} src={imageUrl} alt={title} width={96} height={96} sizes="100%" />}
                            <Label htmlFor={`anime-checkbox-${anime.id}`} className={cn("font-medium leading-tight line-clamp-1 overflow-hidden w-fit cursor-pointer", variant === "compact" ? "text-md" : "text-md sm:text-xl")}>
                                {title}
                            </Label>
                        </div>
                        <div className="flex items-center gap-1">
                            {anime.averageScore && (
                                <div className="flex items-center gap-1 h-7 px-2 text-xs w-fit border rounded-md bg-component-primary">
                                    <Star className="size-3" />
                                    <p>{anime.averageScore}</p>
                                    <span className="sr-only">Average score</span>
                                </div>
                            )}
                            {anime.episodes > 0 && (
                                <div className="flex items-center gap-1 h-7 px-2 text-xs min-w-fit border rounded-md bg-component-primary">
                                    {anime.format === "MOVIE" ? <Popcorn className="size-3" /> : <Clapperboard className="size-3" />}
                                    <p>{anime.episodes === 1 && anime.format === "MOVIE" && "Movie"}</p>
                                    <p>{anime.episodes !== 1 && (anime.episodes > 1 ? `${anime.episodes} eps` : "1 ep")}</p>
                                    <span className="sr-only">Number of episodes</span>
                                </div>
                            )}
                            <div>
                                {anime.siteUrl && showDetails && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button asChild variant="secondary" className="flex size-7 justify-center items-center aspect-square border rounded-md bg-component-primary">
                                                <a href={anime.siteUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                                    <ExternalLink className={variant === "compact" ? "size-3" : "size-3"} />
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
                        </div>
                    </div>
                </div>
            )}
        </>
    );
});

export default AnimeCard;
