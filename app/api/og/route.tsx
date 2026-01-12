import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title") || "Link Analytics";
    const sub = searchParams.get("sub") || "Real-time tracking";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#09090b",
            color: "white",
            fontFamily: "sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #3f3f46",
              borderRadius: "20px",
              padding: "40px 80px",
              backgroundColor: "#18181b",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
          >
            <h1
              style={{
                fontSize: 60,
                fontWeight: 900,
                background: "linear-gradient(to right, #22c55e, #10b981)",
                backgroundClip: "text",
                color: "transparent",
                margin: 0,
                paddingBottom: 20,
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: 30,
                color: "#a1a1aa",
                margin: 0,
              }}
            >
              {sub}
            </p>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
