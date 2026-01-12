async function testLogin() {
  const baseUrl = "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "secret" }),
    });

    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Body:", text); // This will dump the HTML error
  } catch (e) {
    console.error(e);
  }
}

testLogin();
