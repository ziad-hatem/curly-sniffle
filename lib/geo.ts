export async function getGeoData(ip: string) {
  try {
    // Localhost check
    if (ip === "::1" || ip === "127.0.0.1") {
      return {
        country: "Local",
        city: "Local",
        region: "Local",
        isp: "Localhost",
        lat: 0,
        lon: 0,
        timezone: "UTC",
      };
    }

    const response = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await response.json();

    if (data.status === "fail") {
      console.error("GeoIP failed:", data.message);
      return null;
    }

    return {
      country: data.country,
      city: data.city,
      region: data.regionName,
      isp: data.isp,
      lat: data.lat,
      lon: data.lon,
      timezone: data.timezone,
    };
  } catch (error) {
    console.error("GeoIP error:", error);
    return null;
  }
}
