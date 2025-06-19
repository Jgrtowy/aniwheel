"use client";

import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useUnifiedSession } from "~/hooks/useUnifiedSession";
import { useAnimeStore, useSettingsStore } from "~/lib/store";
import type { PlannedItem } from "~/lib/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function PlannedList() {
    const { animeList, checkedAnime, setCheckedAnime, titleLanguage, setAnimeList, setFullAnimeList, fullAnimeList } = useAnimeStore();
    const { imageSize, blurEffects } = useSettingsStore();
    const [fetchingCustom, setFetchingCustom] = useState(false);
    const [customTitle, setCustomTitle] = useState("");
    const { activeProvider } = useUnifiedSession();

    const handleCheckChange = (animeId: number, checked: boolean) => {
        const newChecked = new Set(checkedAnime);
        if (checked) {
            newChecked.add(animeId);
        } else {
            newChecked.delete(animeId);
        }
        setCheckedAnime(newChecked);
    };

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
        };

        fetchPlannedList();
    }, [activeProvider]);

    return (
        <div className="flex flex-col gap-4 max-h-fit">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:lg-grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 w-full gap-4 h-full">
                {animeList.map((anime) => (
                    <div
                        key={anime.id}
                        className={`rounded-lg p-3 transition-all sm:w-full sm:aspect-square duration-200 bg-primary-foreground ${checkedAnime.has(anime.id) ? "brightness-100 sm:scale-100 aspect-[4]" : "brightness-75 sm:scale-90 aspect-[6]"}`}
                        onClick={() => handleCheckChange(anime.id, !checkedAnime.has(anime.id))}
                        style={{ cursor: "pointer", backgroundImage: anime.image ? `url(${anime.image[imageSize]})` : anime.imageMal ? `url(${anime.imageMal})` : "none", backgroundSize: "cover", backgroundPosition: "center" }}
                    >
                        <div className="flex lg:flex-col flex-row-reverse justify-between sm:items-baseline items-end gap-3 h-full">
                            <div className="flex items-center justify-end gap-1 sm:max-h-full max-h-max">
                                {anime.averageScore && (
                                    <div className={`flex items-center leading-tight gap-1 text-xs ${blurEffects ? "backdrop-blur-2xl" : "bg-black"} text-white backdrop-brightness-75 p-1 border rounded-lg`}>
                                        <Star className="h-3 w-3" />
                                        <h3 className="font-medium sm:text-sm text-xs">{anime.averageScore}</h3>
                                    </div>
                                )}
                                {anime.episodes && <h3 className={`font-medium max-w-fit sm:text-sm text-xs min-w-max leading-tight ${blurEffects ? "backdrop-blur-2xl" : "bg-black"} text-white backdrop-brightness-75 p-1 border rounded-lg`}>{anime.episodes !== 1 ? `${anime.episodes} eps` : "1 ep"}</h3>}
                            </div>
                            <h3 className={`font-medium w-fit max-w-full text-sm leading-tight sm:line-clamp-2 line-clamp-1 ${blurEffects ? "backdrop-blur-2xl" : "bg-black"} text-white backdrop-brightness-75 p-1 border rounded-lg`}>
                                {titleLanguage === "english" ? anime.title : titleLanguage === "romaji" ? anime.romajiTitle : anime.nativeTitle}
                            </h3>
                        </div>
                    </div>
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
