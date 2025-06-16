"use client";
import { Shuffle } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import type { PlannedItem } from "~/app/api/[service]/planned/route";
import { SpinWheel } from "./SpinWheel";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger } from "./ui/select";

export default function PlannedList() {
    const [animeList, setAnimeList] = React.useState<PlannedItem[]>([]);
    const { data: session } = useSession();
    const [service, setService] = useState<string | null>(null);
    useEffect(() => {
        if (session?.provider) {
            setService(session.provider);
        }
    }, [session?.provider]);

    useEffect(() => {
        if (!session?.provider) return;
        const fetchPlannedList = async () => {
            const response = await fetch(`/api/${session?.provider}/planned`);
            const data = await response.json();
            setAnimeList(data);
        };

        fetchPlannedList();
        console.log(animeList);
    }, [session?.provider]);

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
        newAnime = await fetch(`/api/${session?.provider}/custom`, {
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
        setCustomTitle("");
        setFetchingCustom(false);
    };

    const handleReleasedOnly = () => {
        const releasedAnime = animeList.filter((anime) => {
            if (!anime.startDate) return false;
            const startDate = new Date(anime.startDate.year, anime.startDate.month - 1, anime.startDate.day);
            return startDate <= new Date();
        });
        setCheckedAnime(new Set(releasedAnime.map((anime) => anime.id)));
    };

    const checkedAnimeList = animeList.filter((anime) => checkedAnime.has(anime.id));

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between flex-wrap">
                                    <CardTitle className="flex items-center gap-2">
                                        Your Planned Anime List
                                        <Badge variant="secondary" className="text-sm">
                                            {checkedAnime.size} of {animeList.length} selected
                                        </Badge>
                                    </CardTitle>
                                    <div className="flex gap-2 items-center">
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
                                        <Button onClick={handleReleasedOnly} variant={"outline"} size="sm">
                                            Aired Only
                                        </Button>
                                        <Button onClick={handleSelectAll} variant="outline" size="sm">
                                            Select All
                                        </Button>
                                        <Button onClick={handleDeselectAll} variant="outline" size="sm">
                                            Deselect All
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {animeList.map((anime) => (
                                        <div
                                            key={anime.id}
                                            className={`rounded-lg p-3 transition-all aspect-square duration-200 bg-primary-foreground ${checkedAnime.has(anime.id) ? "brightness-100" : "brightness-75"}`}
                                            onClick={() => handleCheckChange(anime.id, !checkedAnime.has(anime.id))}
                                            style={{ cursor: "pointer", backgroundImage: anime.image ? `url(${anime.image})` : "none", backgroundSize: "cover", backgroundPosition: "center" }}
                                        >
                                            <div className="flex flex-col justify-end gap-3 h-full max-w-fit">
                                                <h3 className="font-medium text-sm leading-tight line-clamp-2 backdrop-blur-2xl backdrop-brightness-75 p-1 border rounded-lg">{titleLanguage === "english" ? anime.title : titleLanguage === "romaji" ? anime.romajiTitle : anime.nativeTitle}</h3>
                                            </div>
                                        </div>
                                    ))}
                                    {service === "anilist" ? (
                                        <div className="border rounded-lg p-3 flex flex-col gap-2 transition-all aspect-square duration-200 bg-primary-foreground hover:brightness-100">
                                            <p className="text-sm px-1">Something's missing? Add it here!</p>
                                            <Input type="text" placeholder="Title" className="w-full border rounded-lg" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddAnime()} />
                                            <Button onClick={handleAddAnime} className="mt-2" disabled={fetchingCustom}>
                                                {fetchingCustom ? "Adding..." : "Add"}
                                            </Button>
                                            <p className="text-xs text-muted-foreground">anime added here is NOT saved anywhere!</p>
                                        </div>
                                    ) : (
                                        <div className="border rounded-lg p-3 flex flex-col gap-2 transition-all aspect-square duration-200 bg-primary-foreground">
                                            <p className="text-sm px-1">Something's missing? Add it on MyAnimeList!</p>
                                            <p className="text-xs text-muted-foreground">Adding custom entries is not supported by this service! Log in with AniList to access this feature.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:w-80">
                        <Card className="sticky top-4">
                            <CardHeader>
                                <CardTitle>Spin the Wheel!</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center">
                                    <p className="text-sm mb-4">{checkedAnime.size} selected</p>
                                    <Button onClick={handleRoll} disabled={checkedAnime.size < 2} size="lg" className="w-full">
                                        <Shuffle className="w-5 h-5 mr-2" />
                                        Spin the Wheel!
                                    </Button>
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
