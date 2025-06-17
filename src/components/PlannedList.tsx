"use client";
import { Shuffle } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useUnifiedSession } from "~/hooks/useUnifiedSession";
import type { PlannedItem } from "~/lib/types";
import { SpinWheel } from "./SpinWheel";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger } from "./ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function PlannedList() {
    const [animeList, setAnimeList] = React.useState<PlannedItem[]>([]);
    const { activeProvider } = useUnifiedSession();

    useEffect(() => {
        if (!activeProvider) return;
        const fetchPlannedList = async () => {
            const response = await fetch(`/api/${activeProvider}/planned`);
            const data = await response.json();
            setAnimeList(data);
        };

        fetchPlannedList();
        console.log(animeList);
    }, [activeProvider]);

    const [checkedAnime, setCheckedAnime] = useState<Set<number>>(new Set(animeList.map((anime) => anime.id)));
    const [showWheel, setShowWheel] = useState(false);
    const handleCheckChange = (animeId: number, checked: boolean) => {
        const newChecked = new Set(checkedAnime);
        if (checked) {
            newChecked.add(animeId);
        } else {
            newChecked.delete(animeId);
        }
        setCheckedAnime(newChecked);
    };

    const handleSelectAll = () => {
        setCheckedAnime(new Set(animeList.map((anime) => anime.id)));
    };

    const handleDeselectAll = () => {
        setCheckedAnime(new Set());
    };

    const handleRoll = () => {
        const checkedAnimeList = animeList.filter((anime) => checkedAnime.has(anime.id));
        if (checkedAnimeList.length === 0) {
            return;
        }
        setShowWheel(true);
    };

    const handleWheelResult = (result: string) => {
        // Just log the result or handle it as needed
        console.log("Selected anime:", result);
    };

    const [customTitle, setCustomTitle] = useState("");
    const [titleLanguage, setTitleLanguage] = useState("english");
    const [fetchingCustom, setFetchingCustom] = useState(false);

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
                image: "",
                romajiTitle: customTitle,
            };
        }
        setAnimeList((prev) => [...prev, newAnime]);
        setCheckedAnime((prev) => new Set(prev.add(newAnime.id)));
        setCustomTitle("");
        setFetchingCustom(false);
    };

    const handleReleasedOnly = () => {
        const releasedAnime = animeList.filter((anime) => {
            if (!anime.startDate || !anime.startDate.year || !anime.startDate.month || !anime.startDate.day) return false;
            const startDate = new Date(anime.startDate.year, anime.startDate.month, anime.startDate.day);
            return startDate <= new Date();
        });
        setCheckedAnime(new Set(releasedAnime.map((anime) => anime.id)));
    };

    const checkedAnimeList = animeList.filter((anime) => checkedAnime.has(anime.id));

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col-reverse lg:flex-row gap-6">
                    <div className="flex-1">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex gap-2 items-center flex-wrap">
                                        {activeProvider === "anilist" && (
                                            <Select
                                                defaultValue="english"
                                                onValueChange={(value) => {
                                                    setTitleLanguage(value);
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
                                        )}
                                        {activeProvider === "anilist" && (
                                            <Button onClick={handleReleasedOnly} variant={"outline"} size="sm" className="cursor-pointer">
                                                Aired Only
                                            </Button>
                                        )}

                                        <Button onClick={handleSelectAll} variant="outline" size="sm" className="cursor-pointer">
                                            Select All
                                        </Button>
                                        <Button onClick={handleDeselectAll} variant="outline" size="sm" className="cursor-pointer">
                                            Deselect All
                                        </Button>
                                    </div>
                                    <Badge variant="secondary" className="text-sm">
                                        {checkedAnime.size} of {animeList.length} selected
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 sm:w-full gap-4">
                                    {animeList.map((anime) => (
                                        <div
                                            key={anime.id}
                                            className={`rounded-lg p-3 transition-all sm:w-full sm:aspect-square duration-200 bg-primary-foreground ${checkedAnime.has(anime.id) ? "brightness-100 sm:scale-100 aspect-[4]" : "brightness-75 sm:scale-90 aspect-[8]"}`}
                                            onClick={() => handleCheckChange(anime.id, !checkedAnime.has(anime.id))}
                                            style={{ cursor: "pointer", backgroundImage: anime.image ? `url(${anime.image})` : "none", backgroundSize: "cover", backgroundPosition: "center" }}
                                        >
                                            <div className="flex flex-col justify-end gap-3 h-full max-w-fit">
                                                <h3 className="font-medium text-sm leading-tight line-clamp-2 backdrop-blur-2xl backdrop-brightness-75 p-1 border rounded-lg">{titleLanguage === "english" ? anime.title : titleLanguage === "romaji" ? anime.romajiTitle : anime.nativeTitle}</h3>
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
                                    <div className="xl:hidden border rounded-lg p-3 flex flex-col gap-2 transition-all lg:aspect-square duration-200 bg-primary-foreground">
                                        <p className="lg:text-md text-sm px-1">Something's missing? Add it here!</p>
                                        <Input type="text" placeholder="Title" className="w-full lg:text-md text-sm" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddAnime()} />
                                        <Button onClick={handleAddAnime} className="mt-2 lg:text-md text-sm" disabled={fetchingCustom}>
                                            {fetchingCustom ? "Adding..." : "Add"}
                                        </Button>
                                        <p className="lg:text-xs text-sm text-muted-foreground">anime added here is NOT saved anywhere!</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:w-80">
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
                                    <div className="mt-4">
                                        <h4 className="font-medium text-sm mb-2">Selected Anime:</h4>
                                        <div className="max-h-40 overflow-y-auto space-y-1">
                                            {checkedAnimeList.map((anime) => (
                                                <div key={anime.id} className="text-xs rounded py-1">
                                                    {titleLanguage === "english" ? anime.title : titleLanguage === "romaji" ? anime.romajiTitle : anime.nativeTitle}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-sm">
                                        <p>No anime selected! Click on an anime to select it.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {showWheel && <SpinWheel items={checkedAnimeList} onResult={handleWheelResult} onClose={() => setShowWheel(false)} titleLanguage={titleLanguage} />}
        </div>
    );
}
