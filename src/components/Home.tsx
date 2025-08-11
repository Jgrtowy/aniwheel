"use client";

import { Search, X } from "lucide-react";
import { MotionConfig, motion } from "motion/react";
import Aurora from "~/components/Aurora";
import BackToTop from "~/components/BackToTop";
import FiltersDropdown from "~/components/FiltersDropdown";
import Header from "~/components/Header";
import MediaList from "~/components/MediaList";
import SidePanel from "~/components/SidePanel";
import SortingDropdown from "~/components/SortingDropdown";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import useMediaQuery from "~/hooks/useMediaQuery";
import { useAnimeStore } from "~/lib/store";

export default function Home() {
    const { searchTerm, setSearchTerm } = useAnimeStore();

    const isDesktop = useMediaQuery("(width >= 40rem)");

    return (
        <MotionConfig reducedMotion="user">
            <motion.div className="fixed inset-0 h-1/2 sm:h-full -z-10 pointer-events-none" initial={{ opacity: 0, y: -250 }} animate={{ opacity: 0.8, y: 0, transition: { duration: 2.5 } }}>
                <Aurora colorStops={isDesktop ? ["#1100c8", "#b33796", "#a410ff"] : ["#1100c8", "#b33796"]} blend={0.75} amplitude={0.75} speed={0.5} />
            </motion.div>
            <div className="max-w-[82rem] mx-auto p-4 space-y-4">
                <Header />
                <main className="flex flex-col-reverse md:flex-row gap-4">
                    <section className="flex-1 flex-col rounded-xl border p-4 sm:p-6 space-y-6 bg-component-primary">
                        <div className="flex justify-between gap-2">
                            <div className="relative w-full max-w-64">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                                <Input placeholder="Search..." className="pl-8 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                {searchTerm && (
                                    <Button variant="ghost" size="sm" onClick={() => setSearchTerm("")} className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted">
                                        <X className="h-3 w-3" />
                                        <span className="sr-only">Clear search</span>
                                    </Button>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <FiltersDropdown />
                                <SortingDropdown />
                            </div>
                        </div>
                        <MediaList />
                    </section>
                    <aside className="lg:w-[22rem] flex flex-col gap-4 md:sticky top-4 md:self-start">
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
