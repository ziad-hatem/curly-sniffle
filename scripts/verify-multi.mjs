async function verifyMulti() {
  const baseUrl = "http://localhost:3000";
  const userUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

  // Login
  console.log("Logging in...");
  let loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: "secret" }),
  });

  if (loginRes.status !== 200) {
    await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "admin123" }),
    });
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

  // 2. Visit 1 (Redirect)
  console.log("Visit 1 (Redirect Route)...");
  await fetch(`${baseUrl}/t/${code}`, {
    headers: { "User-Agent": userUA },
    redirect: "manual",
  });

  // Check count
  let check = await fetch(`${baseUrl}/api/list`, { headers: cookieHeader });
  let links = await check.json();
  let link = links.find((l) => l.code === code);
  console.log(`Visit 1 used: ${link.used}`);
  if (link.used) console.error("FAILED: Link expired after 1 use!");

  // 3. Visit 2 (View Page)
  console.log("Visit 2 (View Page)...");
  await fetch(`${baseUrl}/view/${code}`, {
    headers: { "User-Agent": userUA },
  });

  check = await fetch(`${baseUrl}/api/list`, { headers: cookieHeader });
  links = await check.json();
  link = links.find((l) => l.code === code);
  console.log(`Visit 2 used: ${link.used}`);
  if (link.used) console.error("FAILED: Link expired after 2 uses!");

  // 4. Visit 3 (Redirect Route) - Should be last valid use
  console.log("Visit 3 (Redirect Route)...");
  await fetch(`${baseUrl}/t/${code}`, {
    headers: { "User-Agent": userUA },
    redirect: "manual",
  });

  check = await fetch(`${baseUrl}/api/list`, { headers: cookieHeader });
  links = await check.json();
  link = links.find((l) => l.code === code);
  console.log(`Visit 3 used: ${link.used} (Should be true now)`);
  if (!link.used) console.error("FAILED: Link NOT expired after 3 uses!");

  // 5. Visit 4 - Should be Gone
  console.log("Visit 4 (Should fail)...");
  const res4 = await fetch(`${baseUrl}/t/${code}`, {
    headers: { "User-Agent": userUA },
    redirect: "manual",
  });
  console.log(`Visit 4 status: ${res4.status}`);
  if (res4.status === 410) {
    console.log("Verified: Link is expired (410).");
  } else {
    console.log("Failed: Link still successful (status " + res4.status + ")");
  }
}

verifyMulti().catch(console.error);
