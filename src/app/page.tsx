import { redirect } from "next/navigation";
import Header from "~/components/Header";
import Landing from "~/components/Landing";
import MainContent from "~/components/MainContent";
import RepoLink from "~/components/RepoLink";
import { getSession } from "~/lib/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
    title: "AniWheel | Login",
};

export default async function Home() {
    const session = await getSession();

    if (session.isAuthenticated) {
        return redirect("/home");
    }

    return (
        <main className="flex flex-col justify-center items-center min-h-dvh min-w-screen m-0 p-0 overflow-x-hidden">
            {!session.isAuthenticated && (
                <div className="">
                    <Landing />
                    <RepoLink />
                </div>
            )}
        </main>
    );
}
