"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
	const { data: session } = useSession();

	return (
		<main className="flex flex-col items-center justify-center min-h-screen p-6">
			{!session ? (
				<div className="space-y-4">
					<button type="button" onClick={() => signIn("anilist")}>
						Sign in with AniList
					</button>
					<button type="button" onClick={() => signIn("myanimelist")}>
						Sign in with MyAnimeList
					</button>
				</div>
			) : (
				<div className="text-center space-y-2">
					<p>{session.user?.image}</p>
					<p>Welcome, {session.user?.name || "user"}!</p>
					<button type="button" onClick={() => signOut()}>
						Sign out
					</button>
				</div>
			)}
		</main>
	);
}
