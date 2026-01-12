import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Link from "@/models/Link";
import { trackVisit } from "@/lib/tracking";

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

    // 2. Mark as used IMMEDIATELY to prevent double access
    // Using updateOne to minimize race conditions window
    await Link.updateOne({ _id: link._id }, { used: true });

    // 3. Collect Data (Blocking to ensure capture)
    // 3. Collect Data (Blocking to ensure capture)
    await trackVisit(request, link._id);

    // 4. Redirect
    return NextResponse.redirect(link.targetUrl);
  } catch (error) {
    console.error("Redirect Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
