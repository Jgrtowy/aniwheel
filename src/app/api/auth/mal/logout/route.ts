import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const response = NextResponse.json({ success: true });

    response.cookies.delete("mal-user");

    return response;
}
