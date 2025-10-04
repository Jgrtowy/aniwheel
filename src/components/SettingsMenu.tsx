import { Laptop, Moon, Settings, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { useSettingsStore } from "~/lib/store";
import type { ImageSize } from "~/lib/types";
import { useSession } from "~/providers/session-provider";

export default function SettingsMenu() {
    const { preferredImageSize, setPreferredImageSize, preferredTitleLanguage, setPreferredTitleLanguage, skipLandingAnimation, setSkipLandingAnimation, enableTickSounds, setEnableTickSounds } = useSettingsStore();
    const { theme, setTheme } = useTheme();
    const session = useSession();

    useEffect(() => {
        if (session?.activeProvider === "myanimelist" && preferredImageSize === "extraLarge") setPreferredImageSize("large");
    }, [session?.activeProvider, preferredImageSize]);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="size-9 sm:size-10">
                    <Settings />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 py-4 px-0 space-y-4 bg-component-secondary">
                <h4 className="font-bold text-lg px-4">User Settings</h4>
                <Separator />
                <div className="grid gap-4">
                    <div className="flex flex-col gap-1 px-4">
                        <Label>Image Size</Label>
                        <span className="text-xs text-muted-foreground">May affect loading times.</span>
                        <ToggleGroup type="single" variant="outline" value={preferredImageSize} onValueChange={(val) => val && setPreferredImageSize(val as ImageSize)}>
                            <ToggleGroupItem value="medium">M</ToggleGroupItem>
                            <ToggleGroupItem value="large">L</ToggleGroupItem>
                            {session?.activeProvider !== "myanimelist" && <ToggleGroupItem value="extraLarge">XL</ToggleGroupItem>}
                        </ToggleGroup>
                    </div>

                    <Separator />
                    <div className="flex flex-col gap-1 px-4">
                        <Label>Theme</Label>
                        <span className="text-xs text-muted-foreground">Changes the appearance of the app.</span>
                        <Select value={theme} onValueChange={setTheme}>
                            <SelectTrigger className="w-34">
                                <SelectValue placeholder="Theme" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">
                                    <Sun />
                                    Light
                                </SelectItem>
                                <SelectItem value="dark">
                                    <Moon />
                                    Dark
                                </SelectItem>
                                <SelectItem value="system">
                                    <Laptop />
                                    System
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-1 px-4">
                        <Label>Title language</Label>
                        <span className="text-xs text-muted-foreground">Changes the language of anime titles.</span>
                        <Select value={preferredTitleLanguage} onValueChange={setPreferredTitleLanguage}>
                            <SelectTrigger className="w-34">{preferredTitleLanguage === "en" ? "English" : preferredTitleLanguage === "romaji" ? "Romaji" : "Japanese"}</SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English (Attack on Titan)</SelectItem>
                                <SelectItem value="romaji">Romaji (Shingeki no Kyojin)</SelectItem>
                                <SelectItem value="jp">Native (進撃の巨人)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-1 px-4">
                        <Label>Enable Tick Sounds</Label>
                        <span className="text-xs text-muted-foreground">Plays sounds when the wheel is spinning.</span>
                        <Switch className="mt-1" checked={enableTickSounds} onCheckedChange={setEnableTickSounds} />
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-1 px-4">
                        <Label>Disable landing animation</Label>
                        <span className="text-xs text-muted-foreground">Skip the long animation on the landing page.</span>
                        <Switch className="mt-1" checked={skipLandingAnimation} onCheckedChange={setSkipLandingAnimation} />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
