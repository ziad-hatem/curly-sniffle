import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Link from "@/models/Link";
import { trackVisit } from "@/lib/tracking";
import { isBot } from "@/lib/bot-detection";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    await dbConnect();

    // 1. Check existence and usage status
    const link = await Link.findOne({ code });

    if (!link) {
      return new NextResponse("Link Not Found", { status: 404 });
    }

    if (link.used) {
      return new NextResponse(
        `<html>
           <head><title>Link Expired</title></head>
           <body style="display:flex;justify-content:center;align-items:center;height:100vh;background:#fafafa;font-family:sans-serif;color:#333;">
             <div style="text-align:center;">
               <h1 style="font-size:3rem;margin-bottom:1rem;">link is expired</h1>
               <p style="font-size:1.2rem;color:#666;">This tracking link has already been accessed.</p>
             </div>
           </body>
         </html>`,
        {
          status: 410,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // 2. Check for Bots
    const userAgent = request.headers.get("user-agent");
    if (isBot(userAgent)) {
      // Allow bots to pass through (or not), but DO NOT mark as used
      // Usually bots just want to scrape metadata from the destination if it's a redirect,
      // OR if this route *is* the destination for them.
      // If we redirect them, they will go to destination.
      return NextResponse.redirect(link.targetUrl);
    }

    // 3. Mark as used IMMEDIATELY
    await Link.updateOne({ _id: link._id }, { used: true });

    // 4. Collect Data (Blocking)
    await trackVisit(request, link._id);

    // 4. Redirect
    return NextResponse.redirect(link.targetUrl);
  } catch (error) {
    console.error("Redirect Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
