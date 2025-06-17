import Header from "~/components/Header";
import Landing from "~/components/Landing";
import PlannedList from "~/components/PlannedList";
import RepoLink from "~/components/RepoLink";
import { getSession } from "~/lib/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
    const session = await getSession();

    return (
        <main className="flex flex-col min-h-dvh m-0 p-0 min-w-screen">
            {session.isAuthenticated ? (
                <>
                    <Header />
                    <PlannedList />
                </>
            ) : (
                <Landing />
            )}
            <div className="fixed bottom-4 right-4 z-10">
                <RepoLink />
            </div>
        </main>
    );
}
