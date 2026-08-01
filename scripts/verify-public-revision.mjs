import assert from "node:assert/strict";
import fs from "node:fs";

const url = process.argv[2] || process.env.PUBLIC_URL;
const expected = process.argv[3] || process.env.EXPECTED_REVISION;
const attempts = Math.max(1, Number(process.argv[4] || process.env.VERIFY_ATTEMPTS || 12));
assert.ok(url, "public URL is required");
assert.match(String(expected || ""), /^[0-9a-f]{40}$/i, "expected revision must be a 40-character commit SHA");

let lastError;
for (let attempt = 1; attempt <= attempts; attempt += 1) {
  try {
    const target = new URL(url);
    target.searchParams.set("revision_check", String(expected) + "-" + Date.now() + "-" + attempt);
    const response = await fetch(target, {
      cache: "no-store",
      headers: { "cache-control": "no-cache" },
    });
    assert.equal(response.status, 200, "public response was HTTP " + response.status);
    const html = await response.text();
    if (!html.includes("<title>ECHO//SEVEN</title>")) throw new Error("public title marker is missing");
    if (html.includes("__GIT_REVISION__")) throw new Error("public revision placeholder was not replaced");
    if (!html.includes('<meta name="git-revision" content="' + expected + '">')) {
      throw new Error("public revision mismatch: expected " + expected);
    }
    if (process.env.PUBLIC_OUTPUT_FILE) fs.writeFileSync(process.env.PUBLIC_OUTPUT_FILE, html);
    console.log("public revision verified: " + expected);
    process.exit(0);
  } catch (error) {
    lastError = error;
    if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

throw lastError;
