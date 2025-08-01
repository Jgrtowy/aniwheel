import { redirect } from "next/navigation";
import Homepage from "~/components/Homepage";
import { getSession } from "~/lib/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
    const session = await getSession();

    if (!session.isAuthenticated) {
        return redirect("/");
    }

    return <main className="flex flex-col min-h-dvh m-0 p-0 min-w-screen">{session.isAuthenticated && <Homepage />}</main>;
}
