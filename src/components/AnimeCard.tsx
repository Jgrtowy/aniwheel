import { Clapperboard, ExternalLink, Star } from "lucide-react";
import Image from "next/image";
import { memo } from "react";
import { Button } from "~/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { useAnimeStore, useSettingsStore } from "~/lib/store";
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

    const { toggleSelectedMedia } = useAnimeStore();
    const { showBackdropEffects } = useSettingsStore();
    const session = useSession();

    const bgClass = showBackdropEffects ? "backdrop-blur-2xl backdrop-brightness-75 bg-black/20" : "bg-background/75";

    const getCardClasses = () => {
        if (variant === "compact") return cn("relative flex flex-col justify-between p-0.5 rounded-lg transition-all overflow-hidden aspect-square", !isStatic && "cursor-pointer", checked ? "brightness-100 opacity-100" : "brightness-75 opacity-75", className);
        return cn(
            "relative flex flex-col justify-between p-1 sm:p-2 rounded-lg transition-all overflow-hidden brightness-75 opacity-75 mx-4 sm:mx-0 sm:scale-90 aspect-[4] sm:aspect-square",
            !isStatic && "cursor-pointer outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            checked && "brightness-100 opacity-100 mx-0 sm:scale-100 aspect-[3.5]",
            className,
        );
    };

    const CardElement = isStatic ? "div" : "button";
    const cardProps = isStatic ? {} : { onClick: () => toggleSelectedMedia(anime.id), type: "button" as const };

    return (
        <CardElement className={getCardClasses()} {...cardProps}>
            {!isStatic && <span className="sr-only">Select {getTitleWithPreference(anime)}</span>}
            <Image className={cn("absolute inset-0 object-cover -z-10 transition scale-125", checked && "scale-100")} src={getImageUrlWithPreference(anime)} alt={getTitleWithPreference(anime)} fill sizes="100%" priority />
            <div className="flex justify-between w-full">
                <div className="flex-shrink-0">
                    {anime.siteUrl && showDetails && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button asChild variant="secondary" className={cn("flex size-7 justify-center items-center aspect-square border rounded-md", bgClass)}>
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
                        <div className={cn("flex items-center gap-1 h-7 px-2 text-xs w-fit border rounded-md", bgClass)}>
                            <Star className="size-3" />
                            <p>{anime.averageScore}</p>
                            <span className="sr-only">Average score</span>
                        </div>
                    )}
                    {anime.episodes > 0 && showDetails && (
                        <div className={cn("flex items-center gap-1 h-7 px-2 text-xs w-fit border rounded-md", bgClass)}>
                            <Clapperboard className="size-3" />
                            <p>{anime.episodes !== 1 ? `${anime.episodes} eps` : "1 ep"}</p>
                            <span className="sr-only">Number of episodes</span>
                        </div>
                    )}
                </div>
            </div>
            <div className={cn("p-1 w-fit border rounded-md text-left", bgClass)}>
                <p className={cn("font-medium leading-tight line-clamp-1 sm:line-clamp-2 overflow-hidden w-fit", variant === "compact" ? "text-xs" : "text-xs sm:text-sm")}>{getTitleWithPreference(anime)}</p>
            </div>
        </CardElement>
    );
});

export default AnimeCard;
