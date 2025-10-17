"use client";
import { CheckCheck, X } from "lucide-react";
import AddToPlannedSheet from "~/components/AddToPlannedSheet";
import Recommendations from "~/components/Recommendations";
import { SpinWheelDialog } from "~/components/SpinWheelDialog";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { getTitleWithPreference } from "~/lib/utils";
import { useAnimeStore } from "~/store/anime";

export default function SidePanel() {
    const { selectedMedia, fullMediaList, mediaList, selectAllMedia, deselectAllMedia, toggleSelectedMedia } = useAnimeStore();

    const selectedAnimeList = fullMediaList.filter((anime) => selectedMedia.has(anime.id));
    return (
        <div className="flex flex-col gap-4 md:max-w-sm w-full">
            <Card className="w-full bg-component-primary">
                <CardContent className="flex flex-col items-center gap-2">
                    <div className="flex flex-col gap-2 w-full">
                        <div className="flex gap-2">
                            <Button onClick={selectAllMedia} variant="outline" size="sm" className="flex-1" disabled={mediaList.length === 0 || selectedMedia.size === mediaList.length}>
                                <CheckCheck />
                                Select All
                            </Button>
                            <Button onClick={deselectAllMedia} variant="outline" size="sm" className="flex-1" disabled={mediaList.length === 0 || selectedMedia.size === 0}>
                                <X />
                                Deselect All
                            </Button>
                        </div>
                        <SpinWheelDialog />
                    </div>
                    <Badge variant="secondary" className="text-sm">
                        {selectedMedia.size} of {mediaList.length} selected
                    </Badge>

                    <div className="h-36 sm:h-44 my-2 w-full overflow-hidden">
                        {selectedMedia.size !== 0 ? (
                            <ScrollArea className="h-full" type="auto">
                                <div className="space-y-1">
                                    {selectedAnimeList.map((anime, i) => (
                                        <div key={anime.id}>
                                            <span className="text-xs rounded hover:line-through transition-colors cursor-pointer" onClick={() => toggleSelectedMedia(anime.id)}>
                                                {getTitleWithPreference(anime)}
                                            </span>
                                            {i !== selectedAnimeList.length - 1 && <Separator className="mt-1" />}
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        ) : (
                            <h2 className="flex flex-col justify-center h-full text-center">
                                <span className="text-xl font-bold">No titles selected!</span>
                                <span className="text-sm">Click one to select it</span>
                            </h2>
                        )}
                    </div>
                    <AddToPlannedSheet />
                </CardContent>
            </Card>
            <Recommendations />
        </div>
    );
}
