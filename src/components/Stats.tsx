import React from "react";
import { useAnimeStore } from "~/store/anime";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function Stats() {
    const { mediaList } = useAnimeStore();
    return (
        <div className="flex flex-row gap-2 text-muted-foreground text-sm">
            <Tooltip>
                <TooltipTrigger>{mediaList.reduce((acc, media) => acc + media.episodes, 0)} episodes</TooltipTrigger>
                <TooltipContent>
                    <span>Including {mediaList.reduce((acc, media) => acc + (media.format === "MOVIE" ? 1 : 0), 0)} movies</span>
                </TooltipContent>
            </Tooltip>
            &bull;
            <Tooltip>
                <TooltipTrigger>{mediaList.reduce((acc, media) => acc + media.duration * media.episodes, 0)} minutes</TooltipTrigger>
                <TooltipContent>
                    <span>
                        {(mediaList.reduce((acc, media) => acc + media.duration * media.episodes, 0) / 60).toFixed(2)} hours or {(mediaList.reduce((acc, media) => acc + media.duration * media.episodes, 0) / 60 / 24).toFixed(2)} days
                    </span>
                </TooltipContent>
            </Tooltip>
            &bull;
            <span>
                Top genres:{" "}
                {Array.from(
                    mediaList.reduce((acc, media) => {
                        for (const genre of media.genres) {
                            acc.set(genre, (acc.get(genre) || 0) + 1);
                        }
                        return acc;
                    }, new Map<string, number>()),
                )
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([genre]) => genre)
                    .join(", ") || "No genres"}
            </span>
            &bull;
            <span>Average score: {mediaList.length === 0 ? "N/A" : (mediaList.reduce((acc, media) => acc + (media.averageScore || 0), 0) / mediaList.filter((media) => media.averageScore !== null).length).toFixed(2)}</span>
        </div>
    );
}
