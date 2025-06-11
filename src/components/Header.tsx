"use client";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

export default function Header() {
    const { data: session } = useSession();
    return (
        <>
            <header className="flex items-center justify-between p-4 text-white">
                <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={session?.user?.image ?? ""} alt="Profile Picture" />
                        <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <h1 className="text-2xl">{session?.user?.name && <>{`hello ${session.user.name}!`}</>}</h1>
                </div>

                <Button variant="outline" className="hover:cursor-pointer" onClick={() => signOut()}>
                    Sign Out
                </Button>
            </header>
        </>
    );
}
