"use client";
import { Shuffle, Star } from "lucide-react";
import React, { useEffect, useState } from "react";
import type { Recommendations } from "~/app/api/[service]/recommendations/route";
import { useUnifiedSession } from "~/hooks/useUnifiedSession";
import type { PlannedItem } from "~/lib/types";
import { SpinWheel } from "./SpinWheel";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger } from "./ui/select";
import { Separator } from "./ui/separator";
import { Slider } from "./ui/slider";

export default function PlannedList() {
    const [animeList, setAnimeList] = React.useState<PlannedItem[]>([]);
    const [fullAnimeList, setFullAnimeList] = React.useState<PlannedItem[]>([]);
    const { activeProvider } = useUnifiedSession();

    useEffect(() => {
        if (!activeProvider) return;
        const fetchPlannedList = async () => {
            const response = await fetch(`/api/${activeProvider}/planned`);
            const data = await response.json();
            setAnimeList(data);
            setFullAnimeList(data);
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
        setFullAnimeList((prev) => [...prev, newAnime]);
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

    const [scoreThreshold, setScoreThreshold] = useState(0);

    const checkedAnimeList = animeList.filter((anime) => checkedAnime.has(anime.id));

    const [recommendations, setRecommendations] = useState<Recommendations[]>([]);
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
            console.log("Recommendations:", recommendations);

            setRecommendations(recommendations);
        });
    }, [activeProvider]);

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col-reverse md:flex-row gap-6">
                    <div className="flex-1">
                        <Card>
                            <CardHeader>
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
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:lg-grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 w-full gap-4">
                                    {animeList.map((anime) => (
                                        <div
                                            key={anime.id}
                                            className={`rounded-lg p-3 transition-all sm:w-full sm:aspect-square duration-200 bg-primary-foreground ${checkedAnime.has(anime.id) ? "brightness-100 sm:scale-100 aspect-[4]" : "brightness-75 sm:scale-90 aspect-[6]"}`}
                                            onClick={() => handleCheckChange(anime.id, !checkedAnime.has(anime.id))}
                                            style={{ cursor: "pointer", backgroundImage: anime.image ? `url(${anime.image})` : "none", backgroundSize: "cover", backgroundPosition: "center" }}
                                        >
                                            <div className="flex lg:flex-col flex-row-reverse justify-between sm:items-baseline items-end gap-3 h-full">
                                                <div className="flex items-center justify-end gap-1 sm:max-h-full max-h-max">
                                                    {anime.averageScore && (
                                                        <div className="flex items-center leading-tight gap-1 text-xs backdrop-blur-2xl text-white backdrop-brightness-75 p-1 border rounded-lg">
                                                            <Star className="h-3 w-3" />
                                                            <h3 className="font-medium sm:text-sm text-xs">{anime.averageScore}</h3>
                                                        </div>
                                                    )}
                                                    {anime.episodes && <h3 className="font-medium max-w-fit sm:text-sm text-xs min-w-max leading-tight backdrop-blur-2xl text-white backdrop-brightness-75 p-1 border rounded-lg">{anime.episodes !== 1 ? `${anime.episodes} eps` : "1 ep"}</h3>}
                                                </div>
                                                <h3 className="font-medium w-fit max-w-full text-sm leading-tight sm:line-clamp-2 line-clamp-1 backdrop-blur-2xl text-white backdrop-brightness-75 p-1 border rounded-lg">
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

                    <div className="lg:w-80 flex flex-col gap-4">
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
                                    <>
                                        <h4 className="font-medium text-sm mb-2">Selected Anime:</h4>
                                        <ScrollArea className="mt-4 h-28">
                                            <div className="h-22 space-y-1">
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
                                    </>
                                ) : (
                                    <div className="h-24 text-center text-sm flex items-center">
                                        <p>No anime selected! Click on an anime to select it.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Recommendations</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm">
                                {recommendations?.map((rec) => (
                                    <div key={rec.id}>
                                        <span className="font-medium">{rec.media.title}</span>
                                        <span className="font-medium">{rec.mediaRecommendation.title}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            {showWheel && <SpinWheel items={checkedAnimeList} onClose={() => setShowWheel(false)} titleLanguage={titleLanguage} />}
        </div>
    );
}
