import { redirect } from "next/navigation";
import Landing from "~/components/Landing";
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
        <main className="flex flex-col justify-center items-center min-h-dvh">
            <Landing />
            <RepoLink className="fixed top-4 right-4" />
        </main>
    );
}
