import { getServerSession } from "next-auth";
import Header from "~/components/Header";
import Landing from "~/components/Landing";
import PlannedList from "~/components/PlannedList";

export default async function Home() {
    const session = await getServerSession();
    return (
        <main className="flex flex-col min-h-dvh m-0 p-0 min-w-screen">
            {session ? (
                <>
                    <Header />
                    <PlannedList />
                </>
            ) : (
                <Landing />
            )}
        </main>
    );
}
