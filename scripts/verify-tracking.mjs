async function verify() {
  const baseUrl = "http://localhost:3000";

  // 1. Create a link
  console.log("Creating link...");
  const createRes = await fetch(`${baseUrl}/api/links`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: "https://placehold.co/600x400.png" }),
  });

  if (!createRes.ok) {
    console.error(
      "Failed to create link:",
      createRes.status,
      await createRes.text()
    );
    return;
  }

  const linkData = await createRes.json();
  console.log("Link created:", linkData);
  const code = linkData.code;

  // 2. Access the view page
  console.log(`Accessing view page for code ${code}...`);
  const viewUrl = `${baseUrl}/view/${code}`;
  const viewRes = await fetch(viewUrl, { cache: "no-store" }); // Ensure client doesn't cache
  console.log("First access status:", viewRes.status);

  // 3. Access again
  console.log("Accessing view page again...");
  const viewRes2 = await fetch(viewUrl, { cache: "no-store" });
  const text2 = await viewRes2.text();
  console.log("Second access status:", viewRes2.status);

  // Check API list for status
  console.log("Checking API list for link status...");
  const listRes = await fetch(`${baseUrl}/api/list`, { cache: "no-store" });
  const links = await listRes.json();
  const linkDetails = links.find((l) => l.code === code);
  console.log(`Link status in DB: Used=${linkDetails.used}`);

  if (text2.includes("Link Expired")) {
    console.log("Verified: Link is expired on second access.");
  } else {
    console.error("Failed Verification: Link did not expire.");
  }

  // Check for OG tags in first valid response (we need to fetch it again or use previous if we saved text,
  // but let's just use a new link to be clean or check the first response text if we had it.
  // We didn't save first response text. Let's create a new link for OG check to avoid expiration issues interfering.)

  console.log("Creating another link for OG check...");
  const ogLinkRes = await fetch(`${baseUrl}/api/links`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: "https://example.com" }),
  });
  const ogLinkData = await ogLinkRes.json();
  const ogViewUrl = `${baseUrl}/view/${ogLinkData.code}`;

  console.log(`Checking OG tags on ${ogViewUrl}...`);
  const ogRes = await fetch(ogViewUrl);
  const ogText = await ogRes.text();

  if (
    ogText.includes('content="/Cat_November_2010-1a.jpg"') ||
    ogText.includes('content="http://localhost:3000/Cat_November_2010-1a.jpg"')
  ) {
    console.log("Verified: OG Image tag found.");
  } else {
    console.error("Failed Verification: OG Image tag NOT found.");
    console.log("Preview:", ogText.substring(0, 500));
  }
}

verify().catch(console.error);
