"use client";
import React from "react";
import { useUnifiedSession } from "~/hooks/useUnifiedSession";
import { useAnimeStore } from "~/lib/store";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger } from "./ui/select";
import { Slider } from "./ui/slider";

export default function Filters() {
    const { animeList, fullAnimeList, checkedAnime, setAnimeList, setCheckedAnime, titleLanguage, setTitleLanguage } = useAnimeStore();
    const { activeProvider } = useUnifiedSession();
    const [scoreThreshold, setScoreThreshold] = React.useState(0);

    const handleSelectAll = () => {
        setCheckedAnime(new Set(animeList.map((anime) => anime.id)));
    };

    const handleDeselectAll = () => {
        setCheckedAnime(new Set());
    };

    const handleReleasedOnly = () => {
        const releasedAnime = animeList.filter((anime) => {
            if (!anime.startDate || !anime.startDate.year || !anime.startDate.month || !anime.startDate.day) return false;
            const startDate = new Date(anime.startDate.year, anime.startDate.month, anime.startDate.day);
            return startDate <= new Date();
        });
        setCheckedAnime(new Set(releasedAnime.map((anime) => anime.id)));
    };

    return (
        <>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex flex-col gap-2 flex-wrap w-full">
                    <div className="flex sm:items-center items-baseline sm:justify-between justify-baseline sm:flex-row flex-col flex-wrap gap-2 w-full">
                        <div className="flex sm:flex-row flex-col sm:items-center items-baseline gap-2 sm:w-auto w-full">
                            <Input
                                type="text"
                                placeholder="Search anime..."
                                className="w-full lg:w-64"
                                onChange={(e) => {
                                    const searchTerm = e.target.value.toLowerCase();
                                    setAnimeList(fullAnimeList.filter((anime) => anime.title.toLowerCase().includes(searchTerm) || anime.romajiTitle?.toLowerCase().includes(searchTerm) || anime.nativeTitle?.toLowerCase().includes(searchTerm)));
                                }}
                            />
                            <div className="flex items-center gap-2">
                                <Button onClick={handleSelectAll} variant="outline" size="sm" className="cursor-pointer">
                                    Select All
                                </Button>
                                <Button onClick={handleDeselectAll} variant="outline" size="sm" className="cursor-pointer">
                                    Deselect All
                                </Button>
                            </div>
                        </div>
                        <Badge variant="secondary" className="text-sm">
                            {checkedAnime.size} of {animeList.length} selected
                        </Badge>
                    </div>
                    {activeProvider === "anilist" && (
                        <div className="flex items-center flex-wrap gap-2">
                            <Select
                                defaultValue="english"
                                onValueChange={(value) => {
                                    setTitleLanguage(value as "english" | "romaji" | "native");
                                }}
                            >
                                <SelectTrigger className="w-36">
                                    <span className="text-sm">{titleLanguage.charAt(0).toUpperCase() + titleLanguage.slice(1)}</span>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="english">English</SelectItem>
                                        <SelectItem value="romaji">Romaji</SelectItem>
                                        <SelectItem value="native">Native</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleReleasedOnly} variant={"outline"} size="sm" className="cursor-pointer">
                                Aired Only
                            </Button>
                            <Label className="text-sm" htmlFor="score-slider">
                                Minimum Score: {scoreThreshold}%
                            </Label>
                            <Slider
                                defaultValue={[0]}
                                max={100}
                                min={0}
                                step={1}
                                id="score-slider"
                                className="w-48"
                                onValueChange={(value) => {
                                    const threshold = value[0];
                                    setScoreThreshold(threshold);
                                    setAnimeList(fullAnimeList.filter((anime) => (anime.averageScore || 0) >= threshold));
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
