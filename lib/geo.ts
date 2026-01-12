export async function getGeoData(ip: string) {
  try {
    // If localhost, return mock data
    if (ip === "127.0.0.1" || ip === "::1") {
      return {
        country: "Localhost",
        city: "Local City",
        region: "Local Region",
        isp: "Local ISP",
        lat: 0,
        lon: 0,
        timezone: "UTC",
      };
    }

    const res = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await res.json();

    if (data.status === "fail") {
      return {};
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
    console.error("Geo Lookup Error:", error);
    return {};
  }
}
