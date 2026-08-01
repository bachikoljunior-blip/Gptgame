import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const required = [
  "START_HERE.md",
  "AGENTS.md",
  "AI_DEVELOPMENT/PROTOCOL.md",
  "AI_DEVELOPMENT/STATE.yaml",
  "AI_DEVELOPMENT/REFERENCE_BENCHMARKS.md",
  "AI_DEVELOPMENT/ARCHIVE/PRE_MIGRATION_2026-08-01.yaml",
];

for (const file of required) {
  assert.ok(fs.existsSync(path.join(root, file)), "missing continuity file: " + file);
}

const start = read("START_HERE.md");
const loader = read("AGENTS.md");
const protocol = read("AI_DEVELOPMENT/PROTOCOL.md");
const state = read("AI_DEVELOPMENT/STATE.yaml");
const benchmarks = read("AI_DEVELOPMENT/REFERENCE_BENCHMARKS.md");

assert.match(start, /Protocol:.*2\.2/s);
assert.match(start, /AI_DEVELOPMENT\/STATE\.yaml/);
assert.match(start, /verify.*reality/i);
assert.ok(start.length < 6500, "START_HERE.md is no longer concise: " + start.length + " bytes");

assert.match(loader, /read .START_HERE\.md./);
assert.match(loader, /mandatory floor/);
assert.match(loader, /Section 0\.3/);
assert.ok(loader.length < 2400, "AGENTS.md loader is no longer concise: " + loader.length + " bytes");

for (let item = 1; item <= 9; item += 1) {
  assert.match(protocol, new RegExp("F" + item + " —"), "protocol is missing F" + item);
  assert.match(start, new RegExp("\\*\\*F" + item + " "), "START_HERE is missing compressed F" + item);
}
for (const section of ["0.1", "0.2", "0.3", "0.4", "0.5", "0.6"]) {
  assert.match(protocol, new RegExp(section.replace(".", "\\.")), "protocol is missing Section " + section);
}
for (const status of [
  "complete_verified",
  "complete_unverified",
  "prepared_not_applied",
  "prepared_not_executed",
  "blocked",
  "inconclusive",
  "failed",
  "rejected",
  "rolled_back",
  "superseded",
]) {
  assert.match(protocol, new RegExp(status));
}

for (const field of [
  "f2_state_update_check",
  "f3_execution_check",
  "f5_review_record_check",
  "f6_public_revision_check",
  "revert_mechanism",
  "last_observed_failing",
  "unenforced_items",
  "unattended_allowed",
]) {
  assert.match(state, new RegExp("\\b" + field + ":"), "STATE.yaml is missing " + field);
}
assert.match(state, /objective:[\s\S]*?id: "visual-readability-richness-2026-08-01"/);
assert.match(state, /reference_benchmark:[\s\S]*?path: "AI_DEVELOPMENT\/REFERENCE_BENCHMARKS\.md"/);
for (const title of ["Lemnis Gate", "SUPERHOT", "Gunfire Reborn", "Call of Duty: Mobile"]) {
  assert.match(benchmarks, new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), "benchmark file is missing " + title);
}
assert.match(benchmarks, /prepared_not_executed/);
assert.match(benchmarks, /Elements intentionally excluded/i);
assert.match(state, /logical_session:[\s\S]*?active: true/);
assert.match(state, /exact_next_action: "[^"]+"/);
assert.match(state, /modules_activated: \[\]/);
assert.match(state, /unattended_allowed: false/);

const modulesDir = path.join(root, "AI_DEVELOPMENT/MODULES");
const modules = fs.readdirSync(modulesDir).filter((file) => file.endsWith(".md")).sort();
assert.equal(modules.length, 9, "expected 9 inactive module files, found " + modules.length);
for (const module of modules) {
  const moduleText = fs.readFileSync(path.join(modulesDir, module), "utf8");
  assert.equal((moduleText.match(/^# Trigger$/gm) || []).length, 1, module + " trigger shape");
  assert.equal((moduleText.match(/^# Content$/gm) || []).length, 1, module + " content shape");
  assert.equal((moduleText.match(/^# Stop condition$/gm) || []).length, 1, module + " stop shape");
}

const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bgh[pousr]_[A-Za-z0-9]{30,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{30,}\b/,
];
for (const file of [...required, ...modules.map((name) => "AI_DEVELOPMENT/MODULES/" + name)]) {
  const fileText = read(file);
  for (const pattern of secretPatterns) assert.doesNotMatch(fileText, pattern, "secret-like value in " + file);
}

const objective = state.match(/objective:\s*\n\s+id: "([^"]+)"[\s\S]*?\nexecution:/)?.[1];
const nextAction = state.match(/exact_next_action: "([^"]+)"/)?.[1];
assert.ok(objective && nextAction);
console.log("continuity ok: objective=" + objective);
console.log("resume: " + nextAction);
