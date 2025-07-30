"use client";

import { useEffect, useMemo, useState } from "react";
import { GenreCombobox } from "~/components/GenreCombobox";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Slider } from "~/components/ui/slider";
import { useUnifiedSession } from "~/hooks/useUnifiedSession";
import { useAnimeStore } from "~/lib/store";

export default function Filters() {
    const { fullAnimeList, checkedAnime, showAiredOnly, selectedGenres, setAnimeList, setCheckedAnime, setShowAiredOnly, setSelectedGenres } = useAnimeStore();
    const { activeProvider } = useUnifiedSession();
    const [scoreThreshold, setScoreThreshold] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");

    const availableGenres = useMemo(() => {
        const genreSet = new Set<string>();
        for (const anime of fullAnimeList) {
            if (anime.genres) {
                for (const genre of anime.genres) {
                    genreSet.add(genre);
                }
            }
        }
        return Array.from(genreSet).sort();
    }, [fullAnimeList]);

    useEffect(() => {
        let filteredAnime = fullAnimeList;

        if (searchTerm) filteredAnime = filteredAnime.filter((anime) => anime.title.toLowerCase().includes(searchTerm.toLowerCase()) || anime.romajiTitle?.toLowerCase().includes(searchTerm.toLowerCase()) || anime.nativeTitle?.toLowerCase().includes(searchTerm.toLowerCase()));

        if (selectedGenres.length > 0) {
            filteredAnime = filteredAnime.filter((anime) => {
                if (!anime.genres || anime.genres.length === 0) return false;
                return selectedGenres.every((selectedGenre) => anime.genres?.includes(selectedGenre) ?? false);
            });
        }

        if (showAiredOnly && activeProvider === "anilist") {
            const currentDate = Date.now();
            filteredAnime = filteredAnime.filter((anime) => {
                if (!anime.startDate || !anime.startDate.year || !anime.startDate.month || !anime.startDate.day) return false;
                const startDate = new Date(anime.startDate.year, anime.startDate.month - 1, anime.startDate.day).getTime();
                return startDate <= currentDate;
            });
        }

        if (scoreThreshold > 0) filteredAnime = filteredAnime.filter((anime) => (anime.averageScore || 0) >= scoreThreshold);

        setAnimeList(filteredAnime);

        if (checkedAnime.size > 0) {
            const filteredAnimeIds = new Set(filteredAnime.map((anime) => anime.id));
            const updatedCheckedAnime = new Set<number>();

            for (const animeId of checkedAnime) {
                if (filteredAnimeIds.has(animeId)) updatedCheckedAnime.add(animeId);
            }

            if (updatedCheckedAnime.size !== checkedAnime.size) setCheckedAnime(updatedCheckedAnime);
        }
    }, [fullAnimeList, searchTerm, selectedGenres, showAiredOnly, scoreThreshold, activeProvider, setAnimeList, checkedAnime, setCheckedAnime]);

    const clearAllFilters = () => {
        setSearchTerm("");
        setSelectedGenres([]);
        setShowAiredOnly(false);
        setScoreThreshold(0);
    };

    const hasActiveFilters = searchTerm !== "" || selectedGenres.length > 0 || showAiredOnly || scoreThreshold > 0;

    return (
        <div className="flex justify-between items-center px-6 md:pb-2 pb-0 gap-4 flex-col lg:flex-row">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 flex-col md:flex-row">
                    <Input type="text" placeholder="Search Anime..." className="w-full md:w-56 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    {activeProvider === "anilist" && <GenreCombobox availableGenres={availableGenres} />}
                </div>
                {activeProvider === "anilist" && (
                    <div className="flex items-center justify-between lg:justify-start gap-4">
                        <div className="flex flex-col justify-center items-center gap-1">
                            <Slider id="score-slider" className="w-36 lg:w-48" value={[scoreThreshold]} max={100} min={0} step={1} onValueChange={(value) => setScoreThreshold(value[0])} />
                            <Label htmlFor="score-slider" className="text-xs">
                                Minimum Score: {scoreThreshold}%
                            </Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox id="aired-only" checked={showAiredOnly} onCheckedChange={setShowAiredOnly} />
                            <Label htmlFor="aired-only" className="text-xs md:text-sm">
                                Aired Only
                            </Label>
                        </div>
                    </div>
                )}
            </div>
            {hasActiveFilters && (
                <Button variant="outline" onClick={clearAllFilters} size="sm">
                    Clear Filters
                </Button>
            )}
        </div>
    );
}
