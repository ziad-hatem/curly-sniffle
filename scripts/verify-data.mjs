async function verifyData() {
  const baseUrl = "http://localhost:3000";
  const customUA =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  // 1. Login
  console.log("Logging in...");
  let loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: "secret" }), // Try secret first
  });

  if (loginRes.status !== 200) {
    console.log("Login with 'secret' failed, trying 'admin123'...");
    loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "admin123" }),
    });
  }

  if (loginRes.status !== 200) {
    console.error("Failed to login.");
    return;
  }

  const cookie = loginRes.headers.get("set-cookie");
  console.log("Logged in. Cookie:", cookie);
  const cookieHeader = { Cookie: cookie };

  // 2. Create Link
  console.log("Creating link...");
  const createRes = await fetch(`${baseUrl}/api/links`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...cookieHeader },
    body: JSON.stringify({ url: "https://example.com" }),
  });
  const linkData = await createRes.json();
  const code = linkData.code;
  console.log(`Link created: ${code}`);

  // 3. Visit Link with Custom UA
  console.log("Visiting link with custom UA...");
  // We use the redirect link /t/[code] to trigger tracking logic
  await fetch(`${baseUrl}/t/${code}`, {
    headers: { "User-Agent": customUA },
    redirect: "manual",
  });

  // 4. Check Analytics
  console.log("Checking analytics...");
  const analyticsRes = await fetch(`${baseUrl}/api/analytics/${code}`, {
    headers: { ...cookieHeader },
  });
  const analytics = await analyticsRes.json();

  // Verify OS
  const osList = analytics.os;
  console.log("OS List:", JSON.stringify(osList));

  if (osList.some((o) => o.name.includes("Mac OS"))) {
    console.log("Verified: Mac OS detected.");
  } else {
    console.error("Failed: Mac OS NOT detected.");
  }

  // Verify Raw UA in recent visits
  const recent = analytics.recentVisits[0];
  console.log("Recent Visit UA:", recent.ua);

  if (recent.ua === customUA) {
    console.log("Verified: Raw UA captured correctly.");
  } else {
    console.error("Failed: Raw UA mismatch.");
  }
}

verifyData().catch(console.error);
