"use client";

import { Grid2X2, Rows3 } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { useSettingsStore } from "~/store/settings";

export default function ViewToggle() {
    const { viewMode, setViewMode } = useSettingsStore();

    return (
        <ToggleGroup type="single" variant="outline" className="w-24" value={viewMode} onValueChange={(val) => val && setViewMode(val as "grid" | "list")}>
            <ToggleGroupItem value="grid" className="border dark:border-input cursor-pointer shadow-xs transition-none bg-background hover:bg-accent dark:bg-input/30 dark:hover:bg-input/50 data-[state=on]:bg-primary! data-[state=on]:text-primary-foreground!">
                <Grid2X2 />
                <span className="sr-only">Grid view</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="list" className="border dark:border-input cursor-pointer shadow-xs transition-none bg-background hover:bg-accent dark:bg-input/30 dark:hover:bg-input/50 data-[state=on]:bg-primary! data-[state=on]:text-primary-foreground!">
                <Rows3 />
                <span className="sr-only">List view</span>
            </ToggleGroupItem>
        </ToggleGroup>
    );
}
