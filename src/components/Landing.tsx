"use client";
import React from "react";
import { useUnifiedSession } from "~/hooks/useUnifiedSession";
import { Button } from "./ui/button";

export default function Landing() {
    const { login } = useUnifiedSession();

    return (
        <>
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <h1 className="text-6xl">AniWheel</h1>
                <p className="text-3xl">Don't know what to watch next?</p>
                <p className="text-3xl">Login with your favorite anime tracker and spin the wheel!</p>
                <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-2">
                        <Button variant="outline" className="text-xl p-6" onClick={async () => login("anilist")}>
                            AniList
                        </Button>
                        <span className="text-sm text-gray-600">most features!</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Button variant="outline" className="text-xl p-6" onClick={async () => login("myanimelist")}>
                            MyAnimeList
                        </Button>
                        <span className="text-sm text-gray-600">less features!</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Button variant="outline" className="text-xl p-6" disabled>
                            Kitsu
                        </Button>
                        <span className="text-sm text-gray-600">stay tuned!</span>
                    </div>
                </div>
            </div>
        </>
    );
}
