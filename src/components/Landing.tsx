"use client";

import { CircleArrowRight, LoaderCircle, LogIn } from "lucide-react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Aurora from "~/components/Aurora";
import KanjiAnimation from "~/components/KanjiAnimation";
import PlaceholderWheel from "~/components/PlaceholderWheel";
import RepoLink from "~/components/RepoLink";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import useMediaQuery from "~/hooks/useMediaQuery";
import { signIn } from "~/lib/auth";
import { useSettingsStore } from "~/lib/store";
import type { UserProfile } from "~/lib/types";
import { cn } from "~/lib/utils";

const TITLE_ANIMATION_DURATION = 0.5;

export default function Landing() {
    const { skipLandingAnimation } = useSettingsStore();
    const systemReducedMotion = useReducedMotion();

    const [isClient, setIsClient] = useState(false);
    const [reduceMotion, setReduceMotion] = useState(true); // Default to true to prevent hydration mismatch

    const isDesktop = useMediaQuery("(width >= 40rem)");

    const [kanjiPathAnimationComplete, setKanjiPathAnimationComplete] = useState(false);
    const [renderTitle, setRenderTitle] = useState(false);
    const [renderButtons, setRenderButtons] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState<string | null>(null);
    const [colorStops, setColorStops] = useState<string[]>(["#2e1cff", "#ff3161", "#b032ff"]);

    useEffect(() => {
        setColorStops((prev) => [...prev].sort(() => Math.random() - 0.5));
    }, []);

    // Set client state and motion preference after hydration
    useEffect(() => {
        setIsClient(true);
        setReduceMotion(systemReducedMotion || skipLandingAnimation);
    }, [systemReducedMotion, skipLandingAnimation]);

    const handleKanjiPathAnimationComplete = async () => {
        if (reduceMotion || !isClient) {
            setKanjiPathAnimationComplete(true);
            setRenderTitle(true);
            setRenderButtons(true);
            return;
        }

        setKanjiPathAnimationComplete(true);
        await new Promise((resolve) => setTimeout(resolve, 400));
        setRenderTitle(true);
        await new Promise((resolve) => setTimeout(resolve, TITLE_ANIMATION_DURATION * 1000 + 250));
        setRenderButtons(true);
    };

    const handleLogin = async (provider: UserProfile["provider"]) => {
        setIsLoggingIn(provider);
        try {
            signIn(provider);
        } catch (error) {
            console.error("Login failed:", error);
            toast.error("There was an error while logging you in.");
            setIsLoggingIn(null);
        }
    };

    return (
        <MotionConfig reducedMotion="user">
            <main className="flex items-center justify-center flex-col h-dvh p-4 gap-4 overflow-hidden">
                <Button variant="outline" size="icon" className="fixed top-4 right-4" asChild>
                    <RepoLink />
                </Button>

                <header>
                    <motion.div layout className="flex items-center justify-center gap-2 sm:gap-4">
                        <motion.div className="size-[75px] sm:size-[100px]" layout transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                            <Tooltip open={kanjiPathAnimationComplete ? undefined : false}>
                                <TooltipTrigger>
                                    <KanjiAnimation className={cn("shrink-0 transition size-full", kanjiPathAnimationComplete || reduceMotion ? "scale-100" : "scale-[300%]")} duration={0.175} delayBetween={0.01} strokeWidth={5} skipAnimation={reduceMotion} onAnimationComplete={handleKanjiPathAnimationComplete} />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>(うん) - luck/fate</p>
                                </TooltipContent>
                            </Tooltip>
                        </motion.div>
                        <AnimatePresence>
                            {renderTitle && (
                                <motion.h1 className="text-5xl sm:text-6xl font-bold" layout initial={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 1, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: TITLE_ANIMATION_DURATION }}>
                                    Aniwheel
                                </motion.h1>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </header>
                <AnimatePresence>
                    {renderButtons && (
                        <motion.section className="flex flex-col items-center gap-6" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: TITLE_ANIMATION_DURATION, delay: TITLE_ANIMATION_DURATION / 2 }}>
                            <div className="flex flex-col items-center gap-1 text-center">
                                <h2 className="text-xl sm:text-4xl font-semibold">Your Anime Wheel of Fortune</h2>
                                <p className="text-md sm:text-xl">
                                    Connect your list and let <span className="peer italic">fate</span> pick your next binge!
                                    <Image src="/Rider_of_black.webp" alt="Rider of Black from Fate/Apocrypha anime" width={150} height={150} className="fixed rotate-45 transition-[750ms] -bottom-72 -left-46 peer-hover:-bottom-23 peer-hover:-left-12 size-auto" />
                                </p>
                            </div>
                            <nav className="flex flex-col items-center sm:flex-row gap-4 sm:gap-6" aria-label="Sign in options">
                                <Button variant="outline" size="lg" className="text-xl w-60 py-6.5 sm:py-7 font-bold gap-3" onClick={async () => handleLogin("anilist")} disabled={!!isLoggingIn} aria-label="Sign in with AniList">
                                    {isLoggingIn === "anilist" ? <LoaderCircle className="animate-spin" /> : <LogIn />}
                                    AniList
                                </Button>
                                <Separator className="data-[orientation=horizontal]:w-5/6 data-[orientation=vertical]:h-2/3" orientation={isDesktop ? "vertical" : "horizontal"} />
                                <Button variant="outline" size="lg" className="text-xl w-60 py-6.5 sm:py-7 font-bold gap-3" onClick={async () => handleLogin("myanimelist")} disabled={!!isLoggingIn} aria-label="Sign in with MyAnimeList">
                                    {isLoggingIn === "myanimelist" ? <LoaderCircle className="animate-spin" /> : <LogIn />}
                                    MyAnimeList
                                </Button>
                            </nav>
                            <AnimatePresence>
                                {renderButtons && (
                                    <motion.div className="text-xs text-muted-foreground z-10" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: TITLE_ANIMATION_DURATION, delay: TITLE_ANIMATION_DURATION / 2 }}>
                                        By signing in, you agree to our{" "}
                                        <Link href="/privacy" className="underline">
                                            Privacy Policy
                                        </Link>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.section>
                    )}
                </AnimatePresence>
                {renderTitle && (
                    <motion.div layout className="fixed w-full h-1/3 top-0 sm:h-full -z-10 pointer-events-none brightness-[140%]" initial={{ opacity: 0, y: -250 }} animate={{ opacity: 0.8, y: 0 }} transition={{ duration: TITLE_ANIMATION_DURATION * 4 }}>
                        <Aurora colorStops={colorStops} blend={1} amplitude={0.75} speed={0.5} />
                    </motion.div>
                )}
                <AnimatePresence>
                    {renderButtons && (
                        <motion.button
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: TITLE_ANIMATION_DURATION, delay: TITLE_ANIMATION_DURATION / 2 }}
                            className="group fixed -rotate-45 bottom-0 right-0 translate-x-1/3 translate-y-1/3 z-10 hover:translate-x-1/4 hover:translate-y-1/4 focus:translate-x-1/4 focus:translate-y-1/4 transition-transform duration-300"
                            type="button"
                        >
                            <PlaceholderWheel className="size-48 sm:size-80 opacity-25 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </main>
        </MotionConfig>
    );
}
