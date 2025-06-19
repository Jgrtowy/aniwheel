"use client";
import { ChevronRight, Clapperboard, ExternalLink, Plus, Star } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useUnifiedSession } from "~/hooks/useUnifiedSession";
import { useAnimeStore, useSettingsStore } from "~/lib/store";
import type { Recommendations as IRecommendations, PlannedItem } from "~/lib/types";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";

export default function Recommendations() {
    const { activeProvider } = useUnifiedSession();
    const { titleLanguage, setFullAnimeList, fullAnimeList, animeList, setAnimeList, checkedAnime, setCheckedAnime } = useAnimeStore();
    const { showRecommendations, imageSize, blurEffects } = useSettingsStore();
    const [recommendations, setRecommendations] = useState<IRecommendations[]>([]);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (activeProvider !== "anilist") return;

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
        });
    }, [activeProvider]);

    const handleAddToList = (anime: PlannedItem) => {
        if (animeList.some((a) => a.id === anime.id)) {
            console.warn("Anime already exists in the list");
            return;
        }
        setFullAnimeList([...fullAnimeList, anime]);
        setAnimeList([...animeList, anime]);
        setCheckedAnime(new Set([...checkedAnime, anime.id]));
    };

    return (
        <>
            {activeProvider === "anilist" && (
                <Card className={`w-full ${showRecommendations ? "block" : "hidden"}`}>
                    <CardHeader>
                        <CardTitle>Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm md:max-h-dvh max-h-48 overflow-y-scroll">
                        <ScrollArea className="h-full">
                            {recommendations
                                ?.filter((rec) => !animeList.some((a) => a.id === rec.mediaRecommendation.id))
                                .map((rec) => (
                                    <div key={rec.mediaRecommendation.id} className="flex justify-between">
                                        <div className="flex items-end mb-2 rounded-lg p-1 w-1/3 aspect-square" style={{ backgroundImage: rec.media.image ? `url(${rec.media.image[imageSize]})` : "none", backgroundSize: "cover", backgroundPosition: "center" }}>
                                            <h3 className={`font-medium w-fit max-w-full text-xs leading-tight sm:line-clamp-2 line-clamp-1 ${blurEffects ? "backdrop-blur-2xl" : "bg-black"} text-white backdrop-brightness-75 p-1 border rounded-lg`}>
                                                {titleLanguage === "english" ? rec.media.title : titleLanguage === "romaji" ? rec.media.romajiTitle : rec.media.nativeTitle}
                                            </h3>
                                        </div>
                                        <div className="flex flex-col w-1/3 justify-center items-center">
                                            <ChevronRight className="h-6 w-6" />
                                            <p className="text-xs">Rating: {rec.rating}</p>
                                            <div className="flex items-center gap-1">
                                                <Button variant="outline" size="icon" className="text-xs hover:underline" onClick={() => window.open(rec.mediaRecommendation.siteUrl, "_blank")}>
                                                    <ExternalLink />
                                                </Button>
                                                <Button variant="outline" size="icon" className="text-xs hover:underline" onClick={() => handleAddToList(rec.mediaRecommendation)}>
                                                    <Plus />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-between w-1/3 aspect-square mb-2 rounded-lg p-1" style={{ backgroundImage: rec.mediaRecommendation.image ? `url(${rec.mediaRecommendation.image[imageSize]})` : "none", backgroundSize: "cover", backgroundPosition: "center" }}>
                                            <div className="flex items-center justify-between gap-1 sm:max-h-full max-h-max">
                                                {rec.mediaRecommendation.averageScore && (
                                                    <div className={`flex items-center leading-tight gap-1 text-xs ${blurEffects ? "backdrop-blur-2xl" : "bg-black"} text-white backdrop-brightness-75 p-1 border rounded-lg`}>
                                                        <Star className="h-2 w-2" />
                                                        <h3 className="font-medium text-xs">{rec.mediaRecommendation.averageScore}</h3>
                                                    </div>
                                                )}
                                                {rec.mediaRecommendation.episodes && (
                                                    <div className={`flex items-center leading-tight gap-1 text-xs ${blurEffects ? "backdrop-blur-2xl" : "bg-black"} text-white backdrop-brightness-75 p-1 border rounded-lg`}>
                                                        <Clapperboard className="h-2 w-2" />
                                                        <h3 className="font-medium text-xs">{rec.mediaRecommendation.episodes}</h3>
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className={`font-medium w-fit max-w-full text-sm leading-tight sm:line-clamp-2 line-clamp-1 ${blurEffects ? "backdrop-blur-2xl" : "bg-black"} text-white backdrop-brightness-75 p-1 border rounded-lg`}>
                                                {titleLanguage === "english" ? rec.mediaRecommendation.title : titleLanguage === "romaji" ? rec.mediaRecommendation.romajiTitle : rec.mediaRecommendation.nativeTitle}
                                            </h3>
                                        </div>
                                    </div>
                                ))}
                        </ScrollArea>

                        {!recommendations && <p className="text-center text-sm text-gray-500">No recommendations available.</p>}
                    </CardContent>
                </Card>
            )}
        </>
    );
}
