import Home from "~/components/Home";
import Landing from "~/components/Landing";
import { getServerSession } from "~/server/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = { title: "Aniwheel" };

export default async function Page() {
    const session = await getServerSession();

    return <main>{session ? <Home /> : <Landing />}</main>;
}
