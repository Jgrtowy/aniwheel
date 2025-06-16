import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const malUserCookie = request.cookies.get("mal-user")?.value;

    if (!malUserCookie) {
        return NextResponse.json({ user: null });
    }

    try {
        const userData = JSON.parse(decodeURIComponent(malUserCookie));
        return NextResponse.json({ user: userData });
    } catch (error) {
        return NextResponse.json({ user: null });
    }
}
