import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const statePath = path.resolve(process.argv[2] || "AI_DEVELOPMENT/STATE.yaml");
const output = path.resolve(process.argv[3] || "_rollback/index.html");
const state = fs.readFileSync(statePath, "utf8");
const revision = state.match(/verified_public_revision: "([0-9a-f]{40})/i)?.[1];
assert.match(String(revision || ""), /^[0-9a-f]{40}$/i, "STATE.yaml must name a verified public commit revision");

let source;
try {
  source = execFileSync("git", ["show", revision + ":index.html"], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
} catch {
  throw new Error("verified rollback source is unavailable in git: " + revision);
}

const placeholder = "__GIT_REVISION__";
if (source.includes(placeholder)) {
  assert.equal(source.split(placeholder).length - 1, 1, "rollback source has an invalid revision placeholder count");
  source = source.replace(placeholder, revision);
} else if (/<meta name="git-revision" content="[0-9a-f]{40}">/i.test(source)) {
  source = source.replace(/<meta name="git-revision" content="[0-9a-f]{40}">/i, '<meta name="git-revision" content="' + revision + '">');
} else {
  const marker = '  <meta name="color-scheme" content="dark">\n';
  assert.ok(source.includes(marker), "rollback source has no safe revision insertion marker");
  source = source.replace(marker, marker + '  <meta name="git-revision" content="' + revision + '">\n');
}

assert.ok(source.includes('<meta name="git-revision" content="' + revision + '">'));
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, source);
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, "revision=" + revision + "\n");
console.log("rollback artifact prepared: " + revision);
