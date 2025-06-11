"use client";
import { signIn, useSession } from "next-auth/react";
import React from "react";
import { Button } from "./ui/button";

export default function Landing() {
    const { data: session } = useSession();
    return (
        <>
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <h1 className="text-6xl">AniWheel</h1>
                <p className="text-3xl">Don't know what to watch next? Login with your favorite anime tracker and spin the wheel!</p>
                <div className="flex gap-4">
                    <Button variant="outline" className="text-xl p-6" onClick={() => signIn("anilist")}>
                        AniList
                    </Button>
                    <Button variant="outline" className="text-xl p-6" onClick={() => signIn("myanimelist")}>
                        MyAnimeList
                    </Button>
                </div>
            </div>
        </>
    );
}
