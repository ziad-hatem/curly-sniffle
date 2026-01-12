// Mock fetch for cookie testing if necessary, but built-in fetch can roughly test redirects manually,
// or we can just try to hit the API login endpoint and see if we get the Set-Cookie header.
// To test middleware, we'd need to follow redirects.

async function verifyAuth() {
  const baseUrl = "http://localhost:3000";

  // 1. Try to access dashboard (should redirect to login)
  console.log("Accessing dashboard without cookie...");
  const dashRes = await fetch(baseUrl, { redirect: "manual" });

  if (
    dashRes.status === 307 ||
    dashRes.status === 302 ||
    dashRes.status === 308
  ) {
    console.log(
      "Redirected as expected. Location:",
      dashRes.headers.get("location")
    );
    if (dashRes.headers.get("location")?.includes("/login")) {
      console.log("Verified: Redirected to /login");
    } else {
      console.error("Failed: Redirected to wrong location");
    }
  } else {
    // 200 means not protected or already logged in (unlikely in script)
    // 404 means route not found
    console.error(
      `Failed: Dashboard returned ${dashRes.status} instead of redirect.`
    );
  }

  // 2. Try to login with wrong password
  console.log("Logging in with wrong password...");
  const wrongLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: "wrong" }),
  });

  if (wrongLogin.status === 401) {
    console.log("Verified: Wrong password rejected.");
  } else {
    console.error(
      "Failed: Wrong password accepted or other error:",
      wrongLogin.status
    );
  }

  // 3. Try to login with correct password
  console.log("Logging in with correct password...");
  // Using default "secret" set via command, or "admin123" if that failed.
  // Note: App might need restart to pick up .env changes if not loaded by Next.js dev server hot reload
  // (usually .env changes require restart, but next dev might handle it or not).
  // Let's try "secret".
  let loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: "secret" }),
  });

  if (loginRes.status === 200) {
    console.log("Verified: Login successful with 'secret'.");
    const cookie = loginRes.headers.get("set-cookie");
    console.log("Set-Cookie header:", cookie);
    if (!cookie?.includes("dashboard_access=true")) {
      console.error("Failed: Cookie not set correctly.");
    }
  } else {
    console.log("Failed with 'secret', trying fallback 'admin123'...");
    loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "admin123" }),
    });

    if (loginRes.status === 200) {
      console.log(
        "Verified: Login successful with 'admin123' (Env might not have reloaded)."
      );
      const cookie = loginRes.headers.get("set-cookie");
      console.log("Set-Cookie header:", cookie);
    } else {
      console.error("Failed: Login failed with both passwords.");
    }
  }
}

verifyAuth().catch(console.error);
