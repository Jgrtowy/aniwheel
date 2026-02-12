import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Clapperboard, Ellipsis, Music4, Popcorn, Star } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { usePreferredImageSize, usePreferredTitleLanguage, useToggleSelectedMedia } from "~/hooks/useShallowStore";
import type { MediaItem } from "~/lib/types";
import { cn, getImageUrlWithPreference, getTitleWithPreference } from "~/lib/utils";
import AnimeDetails from "./AnimeDetails";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

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

export default function AnimeCard(props: AnimeCardProps) {
    const { anime, isStatic, variant = "default", showDetails = true, className } = props;
    const checked = isStatic ? true : props.checked;

    const toggleSelectedMedia = useToggleSelectedMedia();
    const preferredTitleLanguage = usePreferredTitleLanguage();
    const preferredImageSize = usePreferredImageSize();

    const [detailsOpen, setDetailsOpen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [isModKeyDown, setIsModKeyDown] = useState(false);
    const [isButtonHovered, setIsButtonHovered] = useState(false);

    useEffect(() => {
        if (!isHovering) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.metaKey || e.ctrlKey) setIsModKeyDown(true);
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (!e.metaKey && !e.ctrlKey) setIsModKeyDown(false);
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [isHovering]);

    const title = getTitleWithPreference(anime, preferredTitleLanguage);
    const imageUrl = getImageUrlWithPreference(anime, undefined, preferredImageSize);

    const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
        const isModKey = (e as React.MouseEvent).metaKey || (e as React.MouseEvent).ctrlKey || isModKeyDown;
        if (isModKey) {
            setDetailsOpen(true);
        } else if (!isStatic) {
            toggleSelectedMedia(anime.id);
        }
    };

    const cardClasses = (() => {
        if (variant === "compact") return cn("relative flex flex-col justify-between p-0.5 rounded-lg transition-all overflow-hidden aspect-square", !isStatic && "cursor-pointer", checked ? "brightness-100 opacity-100" : "brightness-75 opacity-75", className);
        return cn(
            "relative flex flex-col justify-between p-1 sm:p-2 rounded-lg transition-all brightness-75 opacity-75 w-[calc(100%-2rem)] sm:w-full sm:scale-90 aspect-[4] sm:aspect-square",
            !isStatic && "cursor-pointer outline-none focus-visible:border-ring focus-visible:ring-ring/75 focus-visible:ring-[3px]",
            checked && "brightness-100 opacity-100 w-full sm:scale-100 aspect-[3.5]",
            className,
        );
    })();

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick(e);
        }
    };

    const cardProps = {
        className: cardClasses,
        onClick: handleClick,
        onMouseEnter: (e: React.MouseEvent) => {
            setIsHovering(true);
            if (e.metaKey || e.ctrlKey) setIsModKeyDown(true);
        },
        onMouseLeave: () => {
            setIsHovering(false);
            setIsModKeyDown(false);
        },
        ...(!isStatic && {
            role: "button",
            tabIndex: 0,
            onKeyDown: handleKeyDown,
        }),
    };

    return (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
            <div {...cardProps}>
                {!isStatic && <span className="sr-only">Select {title}</span>}
                {variant !== "compact" && (
                    <div className={cn("absolute inset-0 -z-20 rounded-[inherit] opacity-50 ease-out transition-all duration-700 scale-0 lg:block hidden", checked && "scale-100")}>
                        <div className="w-full h-full rounded-[inherit] blur-md opacity-90" style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }} aria-hidden="true" />
                    </div>
                )}
                <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
                    <Image className={cn("object-cover -z-10 ease-in-out duration-125 scale-130", checked && "scale-100")} src={imageUrl} alt={title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                </div>
                <div className="flex justify-between w-full z-10">
                    <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                        {showDetails && (
                            <Tooltip open={(isHovering && isModKeyDown) || isButtonHovered}>
                                <TooltipTrigger asChild>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="size-7 bg-component-primary p-0" onMouseEnter={() => setIsButtonHovered(true)} onMouseLeave={() => setIsButtonHovered(false)} onFocus={() => setIsButtonHovered(true)} onBlur={() => setIsButtonHovered(false)}>
                                            <Ellipsis className="size-3" />
                                            <span className="sr-only">Show details for {title}</span>
                                        </Button>
                                    </DialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Show details</TooltipContent>
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
            </div>
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="w-[min(100%-2rem,896px)] max-w-none! h-[min(100%-2rem,75vh)] max-h-none! p-0 overflow-hidden border-none bg-transparent shadow-none">
                <VisuallyHidden>
                    <DialogTitle>Anime details</DialogTitle>
                </VisuallyHidden>
                <AnimeDetails anime={anime} />
            </DialogContent>
        </Dialog>
    );
}
