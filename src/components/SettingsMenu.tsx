import { Settings } from "lucide-react";
import React, { useEffect } from "react";
import { useUnifiedSession } from "~/hooks/useUnifiedSession";
import { useSettingsStore } from "~/lib/store";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Toggle } from "./ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

export default function SettingsMenu() {
    const { imageSize, setImageSize, showRecommendations, setShowRecommendations, backdropEffects: blurEffects, setBackdropEffects: setBlurEffects } = useSettingsStore();
    const { activeProvider } = useUnifiedSession();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="hover:cursor-pointer">
                    <Settings className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <div className="flex flex-col p-2 gap-2">
                    <Label className="text-xs">Image Size</Label>
                    <ToggleGroup
                        type="single"
                        variant="outline"
                        value={imageSize}
                        onValueChange={(val) => {
                            if (val) setImageSize(val as "medium" | "large" | "extraLarge");
                        }}
                        className="mt-1"
                        aria-label="Image Size"
                    >
                        <ToggleGroupItem value="medium">M</ToggleGroupItem>
                        <ToggleGroupItem value="large">L</ToggleGroupItem>
                        <ToggleGroupItem value="extraLarge" disabled={activeProvider === "myanimelist"}>
                            XL
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>
                <DropdownMenuSeparator className="my-1" />
                {activeProvider === "anilist" && (
                    <>
                        <div className="flex flex-col justify-between p-2 gap-2">
                            <Label className="text-xs">Show Recommendations</Label>
                            <span className="text-xs text-muted-foreground">Enables recommendations panel.</span>
                            <div className="flex items-center gap-2">
                                <Switch checked={showRecommendations} disabled={activeProvider !== "anilist"} onCheckedChange={activeProvider === "anilist" ? setShowRecommendations : void 0} />
                            </div>
                        </div>
                        <DropdownMenuSeparator className="my-1" />
                    </>
                )}
                <div className="flex flex-col p-2 gap-2">
                    <Label className="text-xs">Backdrop effects</Label>
                    <span className="text-xs text-muted-foreground">Enables additional effects on cards and backgrounds.</span>
                    <div className="flex items-center gap-2">
                        <Switch checked={blurEffects} onCheckedChange={setBlurEffects} />
                        <span className="text-xs text-muted-foreground">(May cause lag!)</span>
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
