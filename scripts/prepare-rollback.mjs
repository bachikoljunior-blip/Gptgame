import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { stampArtifactRevision, verifyArtifactRevision } from "./artifact-revision.mjs";

const root = process.cwd();
const statePath = path.resolve(process.argv[2] || "AI_DEVELOPMENT/STATE.yaml");
const output = path.resolve(process.argv[3] || "_rollback/index.html");
const state = fs.readFileSync(statePath, "utf8");
const sourceCommit = state.match(/last_known_good_revision_or_artifact: "([0-9a-f]{40})/i)?.[1];
assert.match(String(sourceCommit || ""), /^[0-9a-f]{40}$/i, "STATE.yaml must name a last-known-good product commit");

let source;
try {
  source = execFileSync("git", ["show", sourceCommit + ":index.html"], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
} catch {
  throw new Error("verified rollback source is unavailable in git: " + sourceCommit);
}

const stamped = stampArtifactRevision(source, { allowLegacy: true });
source = stamped.source;
const revision = verifyArtifactRevision(source);
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, source);
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, "revision=" + revision + "\n");
console.log("rollback artifact prepared: " + revision + " from " + sourceCommit);
