import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Link from "@/models/Link";
import Visit from "@/models/Visit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();

    // Fetch all links sorted by newest
    const links = await Link.find().sort({ createdAt: -1 }).lean();

    // Get visit counts for each link
    // This could be optimized with aggregation, but loop is fine for MVP
    const linksWithStats = await Promise.all(
      links.map(async (link) => {
        const visits = await Visit.countDocuments({ linkId: link._id });
        return {
          ...link,
          visits,
        };
      })
    );

    return NextResponse.json(linksWithStats);
  } catch (error) {
    console.error("Get Links Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
