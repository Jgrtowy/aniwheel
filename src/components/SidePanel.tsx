"use client";
import { Shuffle } from "lucide-react";
import { useEffect, useState } from "react";
import { useUnifiedSession } from "~/hooks/useUnifiedSession";
import { useAnimeStore, useSettingsStore } from "~/lib/store";
import type { Recommendations as IRecommendations } from "~/lib/types";
import Recommendations from "./Recommendations";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

export default function SidePanel() {
    const { fullAnimeList, checkedAnime, setCheckedAnime, titleLanguage, setShowWheel } = useAnimeStore();
    const { showRecommendations } = useSettingsStore();
    const [recommendations, setRecommendations] = useState<IRecommendations[]>([]);
    const { activeProvider } = useUnifiedSession();

    const [hasFetched, setHasFetched] = useState(false);

    useEffect(() => {
        if (activeProvider !== "anilist" || hasFetched) return;
        const fetchRecommendations = async () => {
            const response = await fetch(`/api/${activeProvider}/recommendations`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                console.error("Failed to fetch recommendations");
                return [];
            }

            const data = await response.json();
            return data || [];
        };
        fetchRecommendations().then((recommendations) => {
            setRecommendations(recommendations);
            setHasFetched(true);
        });
    }, [activeProvider, hasFetched]);

    const handleCheckChange = (animeId: number, checked: boolean) => {
        const newChecked = new Set(checkedAnime);
        if (checked) {
            newChecked.add(animeId);
        } else {
            newChecked.delete(animeId);
        }
        setCheckedAnime(newChecked);
    };

    const handleRoll = () => {
        const checkedAnimeList = fullAnimeList.filter((anime) => checkedAnime.has(anime.id));
        if (checkedAnimeList.length === 0) {
            return;
        }
        setShowWheel(true);
    };

    const checkedAnimeList = fullAnimeList.filter((anime) => checkedAnime.has(anime.id));
    return (
        <div className="flex flex-col gap-4 md:max-w-sm w-full">
            <Card className="sticky top-4">
                <CardContent className="space-y-4">
                    <div className="text-center">
                        <Button onClick={handleRoll} disabled={checkedAnime.size < 2} size="lg" className="w-full">
                            <Shuffle className="w-5 h-5 mr-2" />
                            Spin the wheel!
                        </Button>
                        <p className="text-sm my-2">{checkedAnime.size} selected</p>
                    </div>

                    {checkedAnime.size !== 0 ? (
                        <div className="h-32">
                            <h4 className="font-medium text-sm mb-2">Selected Anime:</h4>
                            <ScrollArea className="mt-4 h-28">
                                <div className="h-24 space-y-1">
                                    {checkedAnimeList.map((anime) => (
                                        <div key={anime.id}>
                                            <span className="text-xs rounded hover:text-red-500 transition-colors cursor-pointer" onClick={() => handleCheckChange(anime.id, !checkedAnime.has(anime.id))}>
                                                {titleLanguage === "english" ? anime.title : titleLanguage === "romaji" ? anime.romajiTitle : anime.nativeTitle}
                                            </span>
                                            <Separator className="my-1" />
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    ) : (
                        <div className="h-32 text-center text-sm flex items-center">
                            <p>No anime selected! Click on an anime to select it.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
            {showRecommendations && <Recommendations items={recommendations} />}
        </div>
    );
}
