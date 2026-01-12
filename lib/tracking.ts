import Visit from "@/models/Visit";
import { getGeoData } from "@/lib/geo";
import { UAParser } from "ua-parser-js";

export async function trackVisit(request: Request, linkId: string) {
  try {
    const headers = request.headers;
    const ip = headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const userAgent = headers.get("user-agent") || "";
    const referrer = headers.get("referer") || "";

    const geoData = await getGeoData(ip);
    const parser = new UAParser(userAgent);
    const uaResult = parser.getResult();

    await Visit.create({
      linkId: linkId,
      ip: ip,
      geo: geoData || {},
      ua: {
        browser: uaResult.browser,
        os: uaResult.os,
        device: uaResult.device,
        cpu: uaResult.cpu,
        engine: uaResult.engine,
      },
      uaString: userAgent,
      referrer,
    });
  } catch (err) {
    console.error("Tracking Error during mandatory capture:", err);
    // Logging but not throwing to avoid breaking the user flow if tracking fails
  }
}
