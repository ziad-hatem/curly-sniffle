async function checkPages() {
  const baseUrl = "http://localhost:3000";

  console.log("Checking /login...");
  const login = await fetch(`${baseUrl}/login`);
  console.log("/login status:", login.status);

  console.log("Checking /api/auth/login...");
  // GET method might not be allowed (405) but shouldn't be 500/Compilation Error unless file is broken
  const apiLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    body: "{}",
  });
  console.log("/api/auth/login status:", apiLogin.status);
}

checkPages();
