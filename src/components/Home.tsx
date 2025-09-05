"use client";

import { Grid2X2, List, Rows4, Search, X } from "lucide-react";
import { MotionConfig, motion } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Aurora from "~/components/Aurora";
import BackToTop from "~/components/BackToTop";
import FiltersDropdown from "~/components/FiltersDropdown";
import Header from "~/components/Header";
import MediaList from "~/components/MediaList";
import SidePanel from "~/components/SidePanel";
import SortingDropdown from "~/components/SortingDropdown";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useAnimeStore, useSettingsStore } from "~/lib/store";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

export default function Home() {
    const { searchTerm, setSearchTerm } = useAnimeStore();
    const [colorStops, setColorStops] = useState<string[]>(["#2e1cff", "#ff3161", "#b032ff"]);
    const { viewMode, setViewMode } = useSettingsStore();

    useEffect(() => {
        setColorStops((prev) => [...prev].sort(() => Math.random() - 0.5));
    }, []);

    return (
        <MotionConfig reducedMotion="user">
            <motion.div className="fixed w-full h-3/4 sm:h-full -z-10 pointer-events-none brightness-[140%]" initial={{ opacity: 0, y: -250 }} animate={{ opacity: 0.8, y: 0, transition: { duration: 2 } }}>
                <Aurora colorStops={colorStops} blend={1} amplitude={0.75} speed={0.5} />
            </motion.div>
            <div className="max-w-[82rem] mx-auto p-4 space-y-4">
                <Header />
                <main className="flex flex-col-reverse md:flex-row gap-4">
                    <section className="flex-1 flex-col rounded-xl border p-4 sm:p-6 space-y-6 bg-component-primary">
                        <div className="flex sm:justify-between justify-center sm:flex-row flex-col items-center gap-2">
                            <div className="relative w-full sm:max-w-64 max-w-full">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                                <Input placeholder="Search..." className="pl-8 text-sm bg-background" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                {searchTerm && (
                                    <Button variant="ghost" size="sm" onClick={() => setSearchTerm("")} className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted">
                                        <X className="h-3 w-3" />
                                        <span className="sr-only">Clear search</span>
                                    </Button>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <ToggleGroup type="single" variant="outline" value={viewMode} onValueChange={(val) => val && setViewMode(val as "grid" | "list" | "compact")} className="w-32">
                                    <ToggleGroupItem value="grid">
                                        <Grid2X2 />
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="list">
                                        <List />
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="compact">
                                        <Rows4 />
                                    </ToggleGroupItem>
                                </ToggleGroup>
                                <FiltersDropdown />
                                <SortingDropdown />
                            </div>
                        </div>
                        <MediaList />
                    </section>
                    <aside className="w-full md:w-[19rem] lg:w-[22rem] flex flex-col gap-4 md:sticky md:top-4 md:self-start">
                        <SidePanel />
                    </aside>
                </main>
            </div>
            <div className="fixed bottom-6 right-6">
                <BackToTop />
            </div>
        </MotionConfig>
    );
}
