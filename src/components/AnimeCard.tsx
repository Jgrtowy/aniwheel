import { Star } from "lucide-react";
import { memo } from "react";
import { useSettingsStore } from "~/lib/store";
import type { PlannedItem } from "~/lib/types";

const AnimeCard = memo(function AnimeCard({
    anime,
    checked,
    onCheck,
    imageSize,
    titleLanguage,
}: {
    anime: PlannedItem;
    checked: boolean;
    onCheck: (id: number, checked: boolean) => void;
    imageSize: "medium" | "large" | "extraLarge";
    titleLanguage: "english" | "romaji" | "native";
}) {
    const { backdropEffects: blurEffects } = useSettingsStore();
    const handleClick = () => onCheck(anime.id, !checked);
    const imageSizeMap: Record<"medium" | "large" | "extraLarge", "medium" | "large" | "extraLarge"> = {
        medium: "medium",
        large: "large",
        extraLarge: "extraLarge",
    };

    const imageUrl = anime.image?.[imageSizeMap[imageSize]] ? anime.image[imageSizeMap[imageSize]] : imageSizeMap[imageSize] === "medium" || imageSizeMap[imageSize] === "large" ? anime.imageMal?.[imageSizeMap[imageSize] as "medium" | "large"] : undefined;

    const backgroundImage = imageUrl ? `url(${imageUrl})` : "none";

    const effectClass = blurEffects ? "backdrop-blur-2xl backdrop-brightness-75 bg-black/20" : "bg-black/80";

    return (
        <div
            className={`rounded-lg p-3 transition-all sm:w-full sm:aspect-square duration-200 bg-primary-foreground ${checked ? "brightness-100 sm:scale-100 aspect-[4]" : "brightness-75 sm:scale-90 aspect-[6]"}`}
            onClick={handleClick}
            style={{ cursor: "pointer", backgroundImage, backgroundSize: "cover", backgroundPosition: "center" }}
        >
            <div className="flex lg:flex-col flex-row-reverse justify-between sm:items-baseline items-end gap-3 h-full">
                <div className="flex items-center justify-end gap-1 sm:max-h-full max-h-max">
                    {anime.averageScore && (
                        <div className={`flex items-center leading-tight gap-1 text-xs ${effectClass} text-white p-1 border rounded-lg`}>
                            <Star className="h-3 w-3" />
                            <h3 className="font-medium sm:text-sm text-xs">{anime.averageScore}</h3>
                        </div>
                    )}
                    {anime.episodes && <h3 className={`font-medium max-w-fit sm:text-sm text-xs min-w-max leading-tight ${effectClass} text-white p-1 border rounded-lg`}>{anime.episodes !== 1 ? `${anime.episodes} eps` : "1 ep"}</h3>}
                </div>
                <h3 className={`font-medium w-fit max-w-full text-sm leading-tight sm:line-clamp-2 line-clamp-1 ${effectClass} text-white p-1 border rounded-lg`}>{titleLanguage === "english" ? anime.title : titleLanguage === "romaji" ? anime.romajiTitle : anime.nativeTitle}</h3>
            </div>
        </div>
    );
});

export default AnimeCard;
