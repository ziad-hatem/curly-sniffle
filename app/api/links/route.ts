import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Link from "@/models/Link";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Generate unique code (loop to ensure uniqueness, though collision is rare with nanoid)
    let code = nanoid(6);
    let exists = await Link.findOne({ code });
    while (exists) {
      code = nanoid(6);
      exists = await Link.findOne({ code });
    }

    const link = await Link.create({
      code,
      targetUrl: url,
    });

    return NextResponse.json(link);
  } catch (error) {
    console.error("Create Link Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
