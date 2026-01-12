import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Link from "@/models/Link";
import Visit from "@/models/Visit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    await dbConnect();

    const link = await Link.findOne({ code });
    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    const visits = await Visit.find({ linkId: link._id }).sort({
      createdAt: -1,
    });

    // --- Aggregations ---

    // Total Clicks
    const totalClicks = visits.length;

    // Unique Visitors (simple IP-based approximation)
    const uniqueIPs = new Set(visits.map((v) => v.ip)).size;

    // Clicks per Day (for Chart)
    const clicksByDate: Record<string, number> = {};
    visits.forEach((v) => {
      const date = new Date(v.createdAt).toISOString().split("T")[0];
      clicksByDate[date] = (clicksByDate[date] || 0) + 1;
    });

    const chartData = Object.entries(clicksByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Country Distribution (for Map/List)
    const countries: Record<string, number> = {};
    visits.forEach((v) => {
      const country = v.geo?.country || "Unknown";
      countries[country] = (countries[country] || 0) + 1;
    });

    // Device/Browser/OS Breakdown
    const devices: Record<string, number> = {};
    const browsers: Record<string, number> = {};
    const os: Record<string, number> = {};
    const referrers: Record<string, number> = {};

    visits.forEach((v) => {
      const dev = v.ua?.device?.type || "Desktop"; // Parser usually returns undefined for desktop
      const br = v.ua?.browser?.name || "Unknown";
      const o = v.ua?.os?.name || "Unknown";
      const ref = v.referrer ? new URL(v.referrer).hostname : "Direct";

      devices[dev] = (devices[dev] || 0) + 1;
      browsers[br] = (browsers[br] || 0) + 1;
      os[o] = (os[o] || 0) + 1;
      referrers[ref] = (referrers[ref] || 0) + 1;
    });

    // Helper to format as array
    const toArray = (rec: Record<string, number>) =>
      Object.entries(rec)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    // Recent visits
    const recentVisits = visits.slice(0, 10).map((v) => ({
      ip: v.ip,
      country: v.geo?.country,
      city: v.geo?.city,
      lat: v.geo?.lat,
      lon: v.geo?.lon,
      time: v.createdAt,
      device: v.ua?.device?.type || "Desktop",
      os: v.ua?.os?.name
        ? `${v.ua.os.name} ${v.ua.os.version || ""}`.trim()
        : "Unknown",
      browser: v.ua?.browser?.name
        ? `${v.ua.browser.name} ${v.ua.browser.version || ""}`.trim()
        : "Unknown",
      ua: v.uaString || "N/A", // Expose raw UA
    }));

    return NextResponse.json({
      totalClicks,
      uniqueVisitors: uniqueIPs,
      chartData,
      locations: toArray(countries),
      devices: toArray(devices),
      browsers: toArray(browsers),
      os: toArray(os),
      referrers: toArray(referrers),
      recentVisits,
      targetUrl: link.targetUrl,
      createdAt: link.createdAt,
      used: link.used,
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
