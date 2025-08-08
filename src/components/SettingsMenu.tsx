import { Settings } from "lucide-react";
import React, { useEffect } from "react";
import { Button } from "~/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger } from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { useSettingsStore } from "~/lib/store";
import type { ImageSize, TitleLanguage } from "~/lib/types";
import { useSession } from "~/providers/session-provider";

export default function SettingsMenu() {
    const { preferredImageSize, setPreferredImageSize, preferredTitleLanguage, setPreferredTitleLanguage, skipLandingAnimation, setSkipLandingAnimation, enableTickSounds, setEnableTickSounds } = useSettingsStore();
    const session = useSession();

    useEffect(() => {
        if (session?.activeProvider === "myanimelist" && preferredImageSize === "extraLarge") setPreferredImageSize("large");
    }, [session?.activeProvider, preferredImageSize]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    <Settings className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background/50 backdrop-blur-sm">
                <div className="flex flex-col p-2 gap-2">
                    <Label className="text-xs">Image Size</Label>
                    <ToggleGroup type="single" variant="outline" value={preferredImageSize} onValueChange={(val) => val && setPreferredImageSize(val as ImageSize)} className="mt-1" aria-label="Image Size">
                        <ToggleGroupItem value="medium">M</ToggleGroupItem>
                        <ToggleGroupItem value="large">L</ToggleGroupItem>
                        {session?.activeProvider !== "myanimelist" && <ToggleGroupItem value="extraLarge">XL</ToggleGroupItem>}
                    </ToggleGroup>
                </div>
                <DropdownMenuSeparator className="my-1" />
                <div className="flex flex-col justify-between p-2 gap-2">
                    <Label className="text-xs">Title language</Label>
                    <span className="text-xs text-muted-foreground">Changes the title language displayed across the app.</span>
                    <div className="flex items-center gap-2">
                        <Select value={preferredTitleLanguage} onValueChange={(value) => setPreferredTitleLanguage(value as TitleLanguage)}>
                            <SelectTrigger className="w-28">
                                <span className="text-sm">{preferredTitleLanguage === "en" ? "English" : preferredTitleLanguage === "romaji" ? "Romaji" : "Japanese"}</span>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="romaji">Romaji</SelectItem>
                                    <SelectItem value="jp">Japanese</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
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
