"use client";
import { signOut, useSession } from "next-auth/react";
import { useUnifiedSession } from "~/hooks/useUnifiedSession";
import { ModeToggle } from "./DarkModeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

export default function Header() {
    const { anilistUser, malUser, loading, error, loginWithAniList, loginWithMAL, logoutAniList, logoutMAL } = useUnifiedSession();
    return (
        <>
            <header className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={anilistUser?.image ?? malUser?.image ?? ""} alt="Profile Picture" />
                        <AvatarFallback>{anilistUser?.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <h1 className="text-2xl">{anilistUser?.name && <>{`hello ${anilistUser.name}!`}</>}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <ModeToggle />
                    <Button variant="outline" className="hover:cursor-pointer" onClick={() => signOut()}>
                        Sign Out
                    </Button>
                </div>
            </header>
        </>
    );
}
