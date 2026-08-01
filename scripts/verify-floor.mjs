import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const stateRelative = "AI_DEVELOPMENT/STATE.yaml";
const statePath = path.resolve(root, process.env.STATE_FILE || stateRelative);

const governedFiles = [
  "AGENTS.md",
  "START_HERE.md",
  "AI_DEVELOPMENT/REFERENCE_BENCHMARKS.md",
  "AI_DEVELOPMENT/PROTOCOL.md",
  "AI_DEVELOPMENT/F9_DEPLOY_PROBE",
  "index.html",
  "package.json",
];
const governedDirectories = [
  ".github/workflows",
  "AI_DEVELOPMENT/MODULES",
  "scripts",
  "tests",
];

function walk(relative) {
  const absolute = path.join(root, relative);
  if (!fs.existsSync(absolute)) return [];
  const stat = fs.statSync(absolute);
  if (stat.isFile()) return [relative.replaceAll("\\", "/")];
  return fs.readdirSync(absolute).sort().flatMap((entry) => walk(path.join(relative, entry)));
}

function governedManifestDigest() {
  const files = [...governedFiles, ...governedDirectories.flatMap(walk)]
    .filter((file) => fs.existsSync(path.join(root, file)))
    .sort();
  const hash = crypto.createHash("sha256");
  for (const file of files) {
    const contents = fs.readFileSync(path.join(root, file));
    hash.update(file);
    hash.update("\0");
    hash.update(crypto.createHash("sha256").update(contents).digest("hex"));
    hash.update("\n");
  }
  return hash.digest("hex");
}

if (process.argv.includes("--print-digest")) {
  console.log(governedManifestDigest());
  process.exit(0);
}

function git(args, fallback = "") {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch {
    return fallback;
  }
}

function splitFiles(value) {
  return String(value || "").split(/[\n,]/).map((file) => file.trim()).filter(Boolean);
}

function relevant(file) {
  return governedFiles.includes(file) || governedDirectories.some((directory) => file === directory || file.startsWith(directory + "/"));
}

function rangeBase() {
  let base = process.env.GATE_BASE_SHA || "";
  if (!base || /^0+$/.test(base)) base = git(["merge-base", "origin/main", "HEAD"]) || git(["rev-parse", "HEAD^"]);
  return base;
}

function changedFilesForRange(base) {
  if (process.env.FLOOR_RANGE_FILES !== undefined) return splitFiles(process.env.FLOOR_RANGE_FILES);
  if (process.env.FLOOR_CHANGED_FILES !== undefined) return splitFiles(process.env.FLOOR_CHANGED_FILES);
  return base ? splitFiles(git(["diff", "--name-only", base, "HEAD"])) : [];
}

function commitsForF2(base) {
  if (process.env.FLOOR_CHANGED_FILES !== undefined) {
    return [{ id: "synthetic-input", files: splitFiles(process.env.FLOOR_CHANGED_FILES) }];
  }
  const commits = base
    ? splitFiles(git(["rev-list", "--reverse", base + "..HEAD"]))
    : [git(["rev-parse", "HEAD"])].filter(Boolean);
  return commits.map((commit) => {
    const parent = git(["rev-parse", commit + "^"], "");
    const files = parent
      ? splitFiles(git(["diff", "--name-only", parent, commit]))
      : splitFiles(git(["diff-tree", "--root", "--no-commit-id", "--name-only", "-r", commit]));
    return { id: commit, files };
  });
}

assert.ok(fs.existsSync(statePath), "F2 failed: canonical state file is missing at " + statePath);
const state = fs.readFileSync(statePath, "utf8");
const base = rangeBase();
const commits = commitsForF2(base);
const rangeFiles = changedFilesForRange(base);
const governedCommits = commits.filter((commit) => commit.files.some(relevant));
const rangeTouchesGoverned = rangeFiles.some(relevant);

if (governedCommits.length) {
  for (const commit of governedCommits) {
    assert.ok(
      commit.files.includes(stateRelative),
      "F2 failed: governed commit " + commit.id + " changed without " + stateRelative,
    );
  }
  console.log("F2 gate passed: every governed commit includes canonical state");
} else {
  console.log("F2 gate not applicable: range has no governed commit");
}

if (rangeTouchesGoverned) {
  const level = process.env.FLOOR_TEST_INVALID_REVIEW === "1"
    ? "prepared_not_executed"
    : state.match(/independence_level_used: "([^"]+)"/)?.[1];
  const outcome = process.env.FLOOR_TEST_INVALID_REVIEW === "1"
    ? "prepared_not_executed"
    : state.match(/review_outcome: "([^"]+)"/)?.[1];
  const recordedDigest = process.env.FLOOR_TEST_INVALID_REVIEW === "1"
    ? "invalid"
    : state.match(/reviewed_changes_digest: "([^"]+)"/)?.[1];
  assert.ok(["A", "B", "C"].includes(level), "F5 failed: review independence must be A, B, or C, got " + level);
  assert.equal(outcome, "complete_verified", "F5 failed: review_outcome is " + outcome);
  assert.equal(recordedDigest, governedManifestDigest(), "F5 failed: review digest does not match the governed tree");
  console.log("F5 gate passed: Level " + level + " review matches governed tree");
} else {
  console.log("F5 gate not applicable: range does not change governed files");
}
