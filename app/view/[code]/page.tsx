import { notFound } from "next/navigation";
import Image from "next/image";
import LinkModel from "@/models/Link";
import dbConnect from "@/lib/db";
import { headers } from "next/headers";
import { trackVisit } from "@/lib/tracking";
import { isBot } from "@/lib/bot-detection";

// Force dynamic to ensure we handle every request
export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    code: string;
  };
}

export async function generateMetadata() {
  return {
    title: "Image Previewer",
    openGraph: {
      images: ["/Cat_November_2010-1a.jpg"],
    },
  };
}

export default async function ImageViewPage({ params }: any) {
  // Await params if it's a promise (Next.js 15+ convention, covering bases)
  const { code } = await params;
  console.log(`[ViewPage] Processing request for code: ${code}`);

  await dbConnect();

  const link = await LinkModel.findOne({ code });

  if (!link) {
    console.log(`[ViewPage] Link not found: ${code}`);
    return notFound();
  }

  console.log(`[ViewPage] Link found. Used: ${link.used}`);

  if (link.used) {
    console.log(`[ViewPage] Link is expired.`);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 text-zinc-900 p-4">
        <h1 className="text-4xl font-bold mb-4">Link Expired</h1>
        <p className="text-zinc-600 text-lg">
          This secured image has already been viewed.
        </p>
      </div>
    );
  }

  // Track the visit
  // We need to construct a Request-like object or modify trackVisit to accept headers
  // But trackVisit expects a Request.
  // In a server component, we don't have the raw Request object directly like via an API route handler.
  // However, headers() gives us the headers.
  // We can overload trackVisit or change it to take headers/ip directly.
  // Let's modify trackVisit to optionally take headers if Request is not available,
  // OR just construct a mock Request for it, OR better: refactor trackVisit to be more flexible.

  // Actually, since we are in a Server Component, getting IP is tricky without the request object.
  // Standard Next.js way in App Directory is using `headers()`.

  const headersList = await headers();
  // Create a minimal Request object using the headers
  const mockRequest = {
    headers: headersList,
  } as unknown as Request;

  const userAgent = headersList.get("user-agent");
  const isCrawler = isBot(userAgent);

  if (isCrawler) {
    console.log(
      `[ViewPage] Bot detected (${userAgent}). Returning content without tracking.`
    );
    // Return content but DO NOT track or mark as used
  } else {
    // Track the visit
    console.log(`[ViewPage] Tracking visit...`);
    await trackVisit(mockRequest, link._id);

    // Mark as used
    console.log(`[ViewPage] Marking as used...`);
    const updateResult = await LinkModel.findByIdAndUpdate(
      link._id,
      { used: true },
      { new: true }
    );
    console.log(`[ViewPage] Update result:`, updateResult);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-0 overflow-hidden">
      <div className="relative w-full h-screen">
        {/* We use a regular img tag because the domain might not be in next.config.js images whitelist */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={"/Cat_November_2010-1a.jpg"}
          alt="Secure Content"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}
