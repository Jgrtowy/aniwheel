import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const response = NextResponse.json({ success: true });

    // Delete the mal-user cookie with a more aggressive approach
    response.cookies.delete("mal-user");

    // Additional approach: set the cookie with expired date to ensure it's removed
    response.cookies.set("mal-user", "", {
        expires: new Date(0),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
    });

    return response;
}
