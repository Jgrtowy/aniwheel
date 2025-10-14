"use client";

import { ExternalLink, LogOut, ShieldHalf } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import KanjiAnimation from "~/components/KanjiAnimation";
import RepoLink from "~/components/RepoLink";
import SettingsMenu from "~/components/SettingsMenu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Separator } from "~/components/ui/separator";
import { isAniListSession, signOut } from "~/lib/auth";
import type { AniListProfile } from "~/lib/auth/providers/anilist";
import type { MediaItem } from "~/lib/types";
import { getPrettyProviderName } from "~/lib/utils";
import { useSession } from "~/providers/session-provider";
import { useAnimeStore } from "~/store/anime";

const aniListProfileColors: Record<NonNullable<AniListProfile["options"]["profileColor"]>, string> = {
    blue: "#3DB4F2",
    purple: "#C063FF",
    green: "#4CCA51",
    orange: "#EF881A",
    red: "#E13333",
    pink: "#FC9DD6",
    gray: "#677B94",
};

export default function Header() {
    const session = useSession();
    const reduceMotion = useReducedMotion() ?? false;
    const { fullMediaList } = useAnimeStore();

    const [showHeading, setShowHeading] = useState(false);

    useEffect(() => {
        if (typeof document === "undefined" || !session) return;

        const root = document.documentElement;
        const fallbackColor = getComputedStyle(root).getPropertyValue("--primary").trim();

        const profileColorKey = isAniListSession(session) ? session.user.anilist.profileColor : undefined;
        const profileColor = profileColorKey ? aniListProfileColors[profileColorKey] : undefined;

        root.style.setProperty("--anilist-profile-color", profileColor ?? fallbackColor);

        return () => {
            root.style.setProperty("--anilist-profile-color", fallbackColor);
        };
    }, [session]);

    type Status = Lowercase<NonNullable<MediaItem["status"]>>;
    const statusesCount = fullMediaList.reduce(
        (acc, media) => {
            if (!media.status) return acc;
            const status = media.status.toLowerCase() as Status;
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        },
        {} as Record<Status, number>,
    );
    const episodesCount = fullMediaList.reduce((acc, media) => acc + (media.format !== "MOVIE" ? (media.episodes ?? 0) : 0), 0);
    const movieCount = fullMediaList.reduce((acc, media) => acc + (media.format === "MOVIE" ? 1 : 0), 0);
    const totalMinutes = fullMediaList.reduce((acc, media) => acc + (media.duration ?? 0) * (media.episodes ?? 0), 0);
    const timeCount = totalMinutes > 0 ? (totalMinutes / 60 / 24).toFixed(2) : undefined;
    const watchStatsParts: string[] = [];
    if (episodesCount > 0) watchStatsParts.push(`${episodesCount} ep${episodesCount === 1 ? "" : "s"}`);
    if (movieCount > 0) watchStatsParts.push(`${movieCount} movie${movieCount === 1 ? "" : "s"}`);
    const watchStats = watchStatsParts.join(" and ");
    const watchStatsLine = [watchStats, timeCount ? `${timeCount} days of content` : undefined].filter(Boolean).join(" or ");

    return (
        <header className="flex items-center justify-between bg-component-primary p-4 rounded-xl border">
            <h1 className="flex items-center gap-2 font-bold text-xl sm:text-2xl">
                <KanjiAnimation className="shrink-0 size-9 sm:size-10" duration={0.125} delayBetween={0.01} strokeWidth={5} skipAnimation={reduceMotion} onAnimationComplete={() => setShowHeading(true)} />
                <AnimatePresence>
                    {showHeading && (
                        <motion.span initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
                            Aniwheel
                        </motion.span>
                    )}
                </AnimatePresence>
            </h1>
            <div className="flex items-center gap-2">
                <SettingsMenu />
                <Popover open={session ? undefined : false}>
                    <PopoverTrigger className="size-9 sm:size-10 rounded-full flex justify-center items-center cursor-pointer">
                        <Avatar className="box-border shadow-[0_0_0_2px_var(--background),0_0_0_4px_var(--anilist-profile-color)]">
                            <AvatarImage src={session?.user.image} alt={session?.user.name} />
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                    </PopoverTrigger>
                    <PopoverContent className="w-[360px] p-0 bg-component-secondary overflow-hidden" align="end">
                        <div className="flex flex-col gap-2 relative p-4">
                            <div className="flex flex-col items-start">
                                <a className="font-bold truncate flex items-center gap-1 hover:underline underline-offset-2" href={session?.user.url} target="_blank" rel="noopener noreferrer">
                                    {session?.user.name}
                                    <ExternalLink className="size-3" />
                                </a>
                                {session && (
                                    <div className="flex flex-col text-xs text-muted-foreground">
                                        <span>Signed in with {getPrettyProviderName(session?.activeProvider)}</span>
                                        <span>Member since {new Date(session.user.createdAt * 1000).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</span>
                                    </div>
                                )}
                            </div>
                            {session && (
                                <div>
                                    <h4 className="font-medium text-sm">Your stats:</h4>
                                    <p className="text-xs text-muted-foreground flex flex-col">
                                        {fullMediaList.length > 0 ? (
                                            <>
                                                <span>
                                                    {statusesCount.planning} planning &bull; {statusesCount.paused} paused &bull; {statusesCount.dropped} dropped
                                                </span>
                                                {watchStatsLine && <span>{watchStatsLine}</span>}
                                            </>
                                        ) : (
                                            <>
                                                <span className="italic">“There's nothing inside me. I'm empty.”</span>
                                                <span> - Lain Iwakura [Serial Experiments Lain]</span>
                                            </>
                                        )}
                                    </p>
                                </div>
                            )}
                            {isAniListSession(session) && session.user.anilist.bannerImage && <Image className="absolute object-cover -z-10 brightness-45 opacity-75" src={session.user.anilist.bannerImage} alt={`${session.user.name}'s banner`} fill sizes="100%" />}
                        </div>
                        <Separator />
                        <div className="grid p-2">
                            <Button variant="ghost" className="justify-start" asChild>
                                <RepoLink>View Repository</RepoLink>
                            </Button>
                            <Button variant="ghost" className="justify-start" asChild>
                                <Link href="/privacy">
                                    <ShieldHalf className="h-4 w-4" />
                                    Privacy Policy
                                </Link>
                            </Button>
                            <Button variant="ghost" className="justify-start text-destructive hover:text-destructive" onClick={() => signOut()}>
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </Button>
                        </div>
                        {isAniListSession(session) && session.user.anilist.moderatorRoles && (
                            <>
                                <Separator />
                                <div className="p-4">
                                    <p className="text-sm italic font-bold">Hey there moderator!</p>
                                    <p className="text-xs">Thank you for making AniList better for all of us. 💗</p>
                                </div>
                            </>
                        )}
                    </PopoverContent>
                </Popover>
            </div>
        </header>
    );
}
