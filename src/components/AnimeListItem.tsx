import Image from "next/image";
import { type CSSProperties, memo } from "react";
import { AnimeInfoBadges } from "~/components/AnimeInfoBadges";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { usePreferredImageSize, usePreferredTitleLanguage, useToggleSelectedMedia } from "~/hooks/useShallowStore";
import type { MediaItem } from "~/lib/types";
import { cn, getImageUrlWithPreference, getTitleWithPreference } from "~/lib/utils";
import { useSession } from "~/providers/session-provider";

interface AnimeListItemProps {
    anime: MediaItem;
    checked: boolean;
    showDetails?: boolean;
    className?: string;
}

const maskGradient = "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,var(--mask-opacity-65)) 65%, transparent 100%)";

const getImageMaskStyle = (checked: boolean): CSSProperties & { "--mask-opacity-65": string } => ({
    maskImage: maskGradient,
    WebkitMaskImage: maskGradient,
    transition: "mask-image 200ms ease, -webkit-mask-image 200ms ease, --mask-opacity-65 200ms ease",
    "--mask-opacity-65": checked ? "1" : "0",
});

const AnimeListItem = memo(function AnimeListItem({ anime, checked, showDetails = true, className }: AnimeListItemProps) {
    const toggleSelectedMedia = useToggleSelectedMedia();
    const preferredTitleLanguage = usePreferredTitleLanguage();
    const preferredImageSize = usePreferredImageSize();
    const session = useSession();

    const containerClasses = cn("relative w-full overflow-hidden rounded-lg border", className);
    const title = getTitleWithPreference(anime, preferredTitleLanguage);
    const imageUrl = getImageUrlWithPreference(anime, undefined, preferredImageSize);
    const imageMaskStyle = getImageMaskStyle(checked);
    const rawActiveProvider = session?.activeProvider;
    const activeProvider = rawActiveProvider === "anilist" || rawActiveProvider === "myanimelist" ? rawActiveProvider : undefined;

    return (
        <div className={containerClasses}>
            <div className="pointer-events-none absolute inset-y-0 left-0 max-w-full w-52">
                <Image className={cn("object-cover transition duration-200", !checked && "grayscale")} alt={title} src={imageUrl} fill sizes="100%" priority style={imageMaskStyle} />
            </div>
            <Label className="relative flex w-full cursor-pointer items-center gap-2 sm:gap-3 p-2 sm:p-3" htmlFor={`anime-checkbox-${anime.id}`}>
                <Checkbox className="size-7 transition-transform duration-200 hover:scale-115 sm:size-6 cursor-pointer data-[state=unchecked]:bg-background/50!" id={`anime-checkbox-${anime.id}`} checked={checked} onCheckedChange={() => toggleSelectedMedia(anime.id)} />
                <div className="flex flex-col gap-1">
                    <h2 className="w-fit leading-tight line-clamp-2 sm:line-clamp-1 text-lg sm:text-xl bg-component-primary border rounded-md px-2 py-0.5">{title}</h2>
                    <AnimeInfoBadges anime={anime} activeProvider={activeProvider} badges={["format", "score", "episodes", "duration", "status", "airing", "studios", "siteLink"]} className="flex flex-wrap gap-1" disableHoverableContent />
                </div>
            </Label>
        </div>
    );
});

export default AnimeListItem;
