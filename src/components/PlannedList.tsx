"use client";

import { useCallback, useEffect, useState } from "react";
import { useUnifiedSession } from "~/hooks/useUnifiedSession";
import { useAnimeStore, useSettingsStore } from "~/lib/store";
import type { PlannedItem } from "~/lib/types";
import AnimeCard from "./AnimeCard";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function PlannedList() {
    const { animeList, checkedAnime, setCheckedAnime, setAnimeList, setFullAnimeList, fullAnimeList, setSelectedGenres } = useAnimeStore();
    const { imageSize, titleLanguage } = useSettingsStore();
    const [fetchingCustom, setFetchingCustom] = useState(false);
    const [customTitle, setCustomTitle] = useState("");
    const { activeProvider } = useUnifiedSession();

    const handleCheckChange = useCallback(
        (animeId: number, checked: boolean) => {
            const newChecked = new Set(checkedAnime);
            if (checked) {
                newChecked.add(animeId);
            } else {
                newChecked.delete(animeId);
            }
            setCheckedAnime(newChecked);
        },
        [checkedAnime, setCheckedAnime],
    );

    const handleAddAnime = async () => {
        if (fetchingCustom) return;
        setFetchingCustom(true);
        if (!customTitle) return;
        let newAnime: PlannedItem;
        newAnime = await fetch(`/api/${activeProvider}/custom`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ title: customTitle }),
        }).then((res) => res.json());
        console.log(newAnime);

        if (!newAnime) {
            newAnime = {
                id: Date.now(),
                title: customTitle,
                image: null,
                romajiTitle: customTitle,
            };
        }
        setAnimeList([...animeList, newAnime]);
        setFullAnimeList([...fullAnimeList, newAnime]);
        setCheckedAnime(new Set([...checkedAnime, newAnime.id]));
        setCustomTitle("");
        setFetchingCustom(false);
    };

    useEffect(() => {
        if (!activeProvider) return;
        const fetchPlannedList = async () => {
            const response = await fetch(`/api/${activeProvider}/planned`);
            const data = await response.json();
            setAnimeList(data);
            setFullAnimeList(data);
            setSelectedGenres([]);
        };

        fetchPlannedList();
    }, [activeProvider, setAnimeList, setFullAnimeList, setSelectedGenres]);

    return (
        <div className="flex flex-col gap-4 max-h-fit px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:lg-grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 w-full gap-4 h-full">
                {animeList.map((anime) => (
                    <AnimeCard key={anime.id} anime={anime} checked={checkedAnime.has(anime.id)} onCheck={handleCheckChange} imageSize={imageSize} titleLanguage={titleLanguage} />
                ))}

                {activeProvider === "anilist" && (
                    <div className="border rounded-lg p-3 xl:flex hidden flex-col gap-2 transition-all lg:aspect-square duration-200 bg-primary-foreground">
                        <p className="text-sm px-1">Something's missing? Add it here!</p>
                        <Input type="text" placeholder="Title" className="w-full lg:text-md text-sm" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddAnime()} />
                        <Button onClick={handleAddAnime} className="mt-2 lg:text-md text-sm" disabled={fetchingCustom}>
                            {fetchingCustom ? "Adding..." : "Add"}
                        </Button>
                        <p className="text-xs text-muted-foreground">anime added here is NOT saved anywhere!</p>
                    </div>
                )}
            </div>
            {activeProvider === "anilist" && (
                <div className="xl:hidden border rounded-lg p-3 flex flex-col gap-2 transition-all xl:aspect-square aspect-auto duration-200 bg-primary-foreground">
                    <p className="lg:text-md text-sm px-1">Something's missing? Add it here!</p>
                    <Input type="text" placeholder="Title" className="w-full lg:text-md text-sm" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddAnime()} />
                    <Button onClick={handleAddAnime} className="mt-2 lg:text-md text-sm" disabled={fetchingCustom}>
                        {fetchingCustom ? "Adding..." : "Add"}
                    </Button>
                    <p className="lg:text-xs text-sm text-muted-foreground">anime added here is NOT saved anywhere!</p>
                </div>
            )}
        </div>
    );
}
