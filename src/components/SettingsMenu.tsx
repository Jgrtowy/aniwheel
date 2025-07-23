import { Settings } from "lucide-react";
import React from "react";
import { Button } from "~/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { useUnifiedSession } from "~/hooks/useUnifiedSession";
import { useSettingsStore } from "~/lib/store";

export default function SettingsMenu() {
    const { imageSize, setImageSize, showRecommendations, setShowRecommendations, backdropEffects: blurEffects, setBackdropEffects: setBlurEffects, skipLandingAnimation, setSkipLandingAnimation, enableTickSounds, setEnableTickSounds } = useSettingsStore();
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
                <DropdownMenuSeparator className="my-1" />
                <div className="flex flex-col p-2 gap-2">
                    <Label className="text-xs">Enable Tick Sounds</Label>
                    <span className="text-xs text-muted-foreground">Plays sound when the wheel passes through segments.</span>
                    <div className="flex items-center gap-2">
                        <Switch checked={enableTickSounds} onCheckedChange={setEnableTickSounds} />
                    </div>
                </div>
                <DropdownMenuSeparator className="my-1" />
                <div className="flex flex-col p-2 gap-2">
                    <Label className="text-xs">Skip landing page animation</Label>
                    <span className="text-xs text-muted-foreground">Completely skips the long landing page animation.</span>
                    <div className="flex items-center gap-2">
                        <Switch checked={skipLandingAnimation} onCheckedChange={setSkipLandingAnimation} />
                        <span className="text-xs text-muted-foreground">(I'll be sad if you do 🥺)</span>
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
