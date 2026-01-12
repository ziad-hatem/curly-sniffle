import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    const envPassword = process.env.DASHBOARD_PASSWORD || "admin123";

    if (password === envPassword) {
      const response = NextResponse.json({ success: true });

      // Set a simple cookie
      // In a real app, use a secure, signed JWT or session ID
      response.cookies.set("dashboard_access", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      });

      return response;
    } else {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
