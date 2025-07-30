"use client";
import { CheckCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import Recommendations from "~/components/Recommendations";
import { SpinWheelDialog } from "~/components/SpinWheelDialog";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { useUnifiedSession } from "~/hooks/useUnifiedSession";
import { useAnimeStore, useSettingsStore } from "~/lib/store";
import type { Recommendations as IRecommendations } from "~/lib/types";
import { getTitleWithPreference } from "~/lib/utils";

export default function SidePanel() {
    const { fullAnimeList, checkedAnime, setCheckedAnime, animeList } = useAnimeStore();
    const { showRecommendations, backdropEffects, titleLanguage } = useSettingsStore();
    const [recommendations, setRecommendations] = useState<IRecommendations[]>([]);
    const { activeProvider } = useUnifiedSession();

    const [hasFetched, setHasFetched] = useState(false);

    useEffect(() => {
        if (activeProvider !== "anilist" || hasFetched) return;
        const fetchRecommendations = async () => {
            const response = await fetch(`/api/${activeProvider}/recommendations`, { method: "GET", headers: { "Content-Type": "application/json" } });

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

    const handleSelectAll = () => setCheckedAnime(new Set(animeList.map((anime) => anime.id)));
    const handleDeselectAll = () => setCheckedAnime(new Set());

    const checkedAnimeList = fullAnimeList.filter((anime) => checkedAnime.has(anime.id));
    const effectClass = backdropEffects ? "backdrop-blur-2xl backdrop-brightness-75 bg-black/20" : "bg-primary-foreground";

    return (
        <div className="flex flex-col gap-4 md:max-w-sm w-full">
            <Card className={`w-full ${effectClass}`}>
                <CardContent className="flex flex-col items-center gap-2">
                    <div className="flex flex-col gap-2 w-full">
                        <div className="flex gap-2 min-h-[32px]">
                            <Button onClick={handleSelectAll} variant="outline" size="sm" className="cursor-pointer flex-1" disabled={animeList.length === 0 || checkedAnime.size === animeList.length}>
                                <CheckCheck className="size-4" />
                                Select All
                            </Button>
                            <Button onClick={handleDeselectAll} variant="outline" size="sm" className="cursor-pointer flex-1" disabled={animeList.length === 0 || checkedAnime.size === 0}>
                                <X className="size-4" />
                                Deselect All
                            </Button>
                        </div>
                        <SpinWheelDialog />
                    </div>
                    <Badge variant="secondary" className="text-sm">
                        {checkedAnime.size} of {animeList.length} selected
                    </Badge>

                    {checkedAnime.size !== 0 ? (
                        <div className="h-32 w-full">
                            <ScrollArea className="mt-4 h-30" type="auto">
                                <div className="space-y-1">
                                    {checkedAnimeList.map((anime, i) => (
                                        <div key={anime.id}>
                                            <span className="text-xs rounded hover:text-destructive transition-colors cursor-pointer" onClick={() => handleCheckChange(anime.id, !checkedAnime.has(anime.id))}>
                                                {getTitleWithPreference(anime, titleLanguage)}
                                            </span>
                                            {i !== checkedAnimeList.length - 1 && <Separator className="my-1" />}
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
