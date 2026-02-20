"use client";

import { formatForDisplay, useHotkey } from "@tanstack/react-hotkeys";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useDebounce } from "~/hooks/useDebounce";
import { useAnimeStore } from "~/store/anime";
import { Kbd, KbdGroup } from "./ui/kbd";

export default function SearchInput() {
    const { searchTerm, setSearchTerm } = useAnimeStore();
    const [value, setValue] = useState(searchTerm);
    const debouncedValue = useDebounce(value, 300);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync store change to local
    useEffect(() => {
        if (searchTerm !== debouncedValue) setValue(searchTerm);
    }, [searchTerm]);

    // Sync local debounced change to store
    useEffect(() => {
        if (debouncedValue !== searchTerm) setSearchTerm(debouncedValue);
    }, [debouncedValue, setSearchTerm, searchTerm]);

    useHotkey("Mod+/", () => {
        inputRef.current?.focus();
    });

    return (
        <div className="relative w-full sm:max-w-64 max-w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
            <Input placeholder="Search..." className="pl-8 text-sm bg-background" value={value} onChange={(e) => setValue(e.target.value)} ref={inputRef} />
            {value && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        setValue("");
                        setSearchTerm("");
                    }}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Clear search</span>
                </Button>
            )}
            {!value && (<>
                <KbdGroup className="absolute right-2 top-1/2 transform -translate-y-1/2 p-0">
                    <Kbd>{formatForDisplay("Mod+/", {platform: "windows"})}</Kbd>
                </KbdGroup>
            </>)
            }
        </div>
    );
}
