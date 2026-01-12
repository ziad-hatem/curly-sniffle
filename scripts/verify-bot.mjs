async function verifyBot() {
  const baseUrl = "http://localhost:3000";
  const botUA = "WhatsApp/2.21.12.21 A";
  const userUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

  // Login
  console.log("Logging in...");

  let loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: "secret" }),
  });

  if (loginRes.status !== 200) {
    console.log("First login failed, trying fallback...");
    try {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "admin123" }),
      });
      if (res.status === 200) loginRes = res;
    } catch (e) {
      console.error("Fallback login error:", e);
    }
  }

  if (loginRes.status !== 200) {
    console.error("Login completely failed. Status:", loginRes.status);
    const text = await loginRes.text();
    console.error("Response:", text);
    return;
  }

  const cookie = loginRes.headers.get("set-cookie");
  const cookieHeader = { Cookie: cookie };

  // 1. Create Link
  console.log("Creating link...");
  const createRes = await fetch(`${baseUrl}/api/links`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...cookieHeader },
    body: JSON.stringify({ url: "https://example.com" }),
  });
  const linkData = await createRes.json();
  const code = linkData.code;
  console.log(`Link created: ${code}`);

  // 2. Visit as Bot (View Page)
  console.log("Visiting as Bot...");
  const botRes = await fetch(`${baseUrl}/view/${code}`, {
    headers: { "User-Agent": botUA },
  });
  console.log("Bot Response Status:", botRes.status);

  // Check if used
  const checkRes1 = await fetch(`${baseUrl}/api/list`, {
    headers: cookieHeader,
  });
  const links1 = await checkRes1.json();
  const link1 = links1.find((l) => l.code === code);

  if (link1.used === false) {
    console.log("Verified: Link NOT marked used by Bot.");
  } else {
    console.error("Failed: BOT triggered 'used' status.");
  }

  // 3. Visit as User
  console.log("Visiting as User...");
  const userRes = await fetch(`${baseUrl}/view/${code}`, {
    headers: { "User-Agent": userUA },
  });
  console.log("User Response Status:", userRes.status);

  // Check if used
  const checkRes2 = await fetch(`${baseUrl}/api/list`, {
    headers: cookieHeader,
  });
  const links2 = await checkRes2.json();
  const link2 = links2.find((l) => l.code === code);

  if (link2.used === true) {
    console.log("Verified: Link marked used by User.");
  } else {
    console.error("Failed: User did NOT trigger 'used' status.");
  }
}

verifyBot().catch(console.error);
