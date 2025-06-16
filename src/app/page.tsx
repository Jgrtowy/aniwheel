import { SiReact } from "@icons-pack/react-simple-icons";
import { Github } from "lucide-react";
import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import Header from "~/components/Header";
import Landing from "~/components/Landing";
import PlannedList from "~/components/PlannedList";
import RepoLink from "~/components/RepoLink";

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
            <div className="absolute bottom-4 right-4 z-10">
                <RepoLink />
            </div>
        </main>
    );
}
