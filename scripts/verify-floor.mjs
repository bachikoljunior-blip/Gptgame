import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

import { checkMeasuredSeal } from "./measured-digest.mjs";

const root = process.cwd();
const stateRelative = "AI_DEVELOPMENT/STATE.yaml";
const statePath = path.resolve(root, process.env.STATE_FILE || stateRelative);

const governedFiles = [
  "AGENTS.md",
  "AI_DEVELOPMENT/REFERENCE_BENCHMARKS.md",
  "AI_DEVELOPMENT/F9_DEPLOY_PROBE",
  "index.html",
  "package.json",
  "package-lock.json",
];
const governedDirectories = [
  ".github/workflows",
  "scripts",
  "tests",
  "tools",
];

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

// The second half used to demand a review record: an independence level of A, B or C, an
// outcome of complete_verified, and a digest of the governed tree. All three were about how
// the work was reviewed, and all three were written by the same party the record judges.
//
// What replaces them is the goal underneath: a change to the governed tree must come with a
// fresh, unedited measurement of that change — not a measurement of the state three commits
// ago, and not one improved afterwards by hand.
if (rangeTouchesGoverned) {
  const measuredRelative = "AI_DEVELOPMENT/MEASURED.md";
  const measuredPath = path.resolve(root, measuredRelative);

  assert.ok(
    rangeFiles.includes(measuredRelative),
    "measurement failed: governed files changed without " + measuredRelative
      + " — run `npm run measure` and commit the result",
  );
  assert.ok(fs.existsSync(measuredPath), "measurement failed: " + measuredRelative + " is missing");

  const seal = checkMeasuredSeal(fs.readFileSync(measuredPath, "utf8"));
  assert.ok(seal.ok, "measurement failed: " + seal.reason);

  console.log("measurement gate passed: this change set carries its own sealed measurement");
} else {
  console.log("measurement gate not applicable: range does not change governed files");
}
