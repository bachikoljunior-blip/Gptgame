import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const input = path.resolve(process.argv[2] || "index.html");
const output = path.resolve(process.argv[3] || "_site/index.html");
const revision = String(process.env.REVISION_ID || "");
assert.match(revision, /^[0-9a-f]{40}$/i, "REVISION_ID must be a 40-character commit SHA");

const source = fs.readFileSync(input, "utf8");
const placeholder = "__GIT_REVISION__";
assert.equal(source.split(placeholder).length - 1, 1, "source must contain exactly one revision placeholder");
const release = source.replace(placeholder, revision);
assert.match(release, new RegExp('<meta name="git-revision" content="' + revision + '">'));
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, release);
console.log("release prepared: " + revision);
