#!/usr/bin/env node
/**
 * Differential battery: the rebuilt continuity gate against the one on `origin/main`.
 *
 * Both are run as subprocesses in a mutated copy of the real tree. main's version has no CLI
 * guard — it does its work at module top level — so importing it to compare would run the
 * real gate against the real repository instead of the fabricated one.
 *
 * `origin/main`'s copy is read out of git at run time rather than vendored, so this cannot
 * quietly drift into comparing against a stale snapshot.
 *
 *   node scripts/equivalence-continuity.mjs [--base origin/main]
 *
 * Healthy state is included only as a control. Agreement on it proves nothing beyond "both
 * pass"; the verdict of this battery rests on the deliberate breakages.
 */
import { execFileSync } from 'node:child_process';
import { cpSync, readFileSync, writeFileSync, rmSync, mkdtempSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const REPO = dirname(dirname(fileURLToPath(import.meta.url)));
/**
 * The revision to compare against, pinned rather than tracking `origin/main`.
 *
 * `0aa981d` is the last commit before the kit integration landed. Once the integration
 * merged, `origin/main` became the *new* gate, so a floating base would compare this file
 * against itself and print a confident 33/33 that means nothing. Override with `--base` only
 * if you know what you are comparing.
 */
const argv = process.argv.slice(2);
const BASE = argv.includes('--base') ? argv[argv.indexOf('--base') + 1] : '0aa981d';

const STATE = 'AI_DEVELOPMENT/STATE.yaml';
const PROTOCOL = 'AI_DEVELOPMENT/PROTOCOL.md';
const BENCH = 'AI_DEVELOPMENT/REFERENCE_BENCHMARKS.md';
const AGENTS = 'AGENTS.md';
const START = 'START_HERE.md';

const drop = (text, needle) => text.split('\n').filter((l) => !l.includes(needle)).join('\n');

/** [name, file, transform(text) -> text]. A null file is the untouched control. */
const MUTATIONS = [
  ['control: untouched tree', null, null],

  // --- PROTOCOL.md ----------------------------------------------------------------------
  ['floor item F1 deleted', PROTOCOL, (t) => t.replace(/F1 —/, 'F1 -')],
  ['floor item F6 deleted', PROTOCOL, (t) => t.replace(/F6 —/, 'F6 -')],
  ['floor item F9 deleted', PROTOCOL, (t) => t.replace(/F9 —/, 'F9 -')],
  ['section 0.3 removed', PROTOCOL, (t) => t.replace(/0\.3/g, 'X.X')],
  ['section 0.6 removed', PROTOCOL, (t) => t.replace(/0\.6/g, 'X.X')],
  ['status complete_verified dropped', PROTOCOL, (t) => t.replace(/complete_verified/g, 'done')],
  ['status rolled_back dropped', PROTOCOL, (t) => t.replace(/rolled_back/g, 'undone')],
  ['status superseded dropped', PROTOCOL, (t) => t.replace(/superseded/g, 'replaced')],

  // --- STATE.yaml -----------------------------------------------------------------------
  ['enforcement f5 field removed', STATE, (t) => t.replace(/\bf5_review_record_check:/, 'f5_review_record_checkX:')],
  ['enforcement f2 field removed', STATE, (t) => t.replace(/\bf2_state_update_check:/, 'f2_state_update_checkX:')],
  ['unattended work re-enabled', STATE, (t) => t.replace('unattended_allowed: false', 'unattended_allowed: true')],
  ['a module activated silently', STATE, (t) => t.replace('modules_activated: []', 'modules_activated: [M4]')],
  ['exact_next_action emptied', STATE, (t) => t.replace(/exact_next_action: "[^"]+"/, 'exact_next_action: ""')],
  ['objective id changed (valid: main loosened this)', STATE,
    (t) => t.replace(/(objective:\s*\n\s+id: )"[^"]+"/, '$1"something-else-2026"')],
  ['objective id removed entirely', STATE, (t) => t.replace(/(objective:\s*\n\s+)id: "[^"]+"\n/, '$1')],
  ['reference_benchmark path lost', STATE, (t) => t.replace(/path: "AI_DEVELOPMENT\/REFERENCE_BENCHMARKS\.md"/, 'path: "nope.md"')],
  // Anchored inside the logical_session block on purpose. STATE.yaml has an earlier
  // `active: true` under a different key, and a bare replace hits that one — leaving
  // logical_session untouched and reporting agreement on a check never exercised.
  ['logical session no longer active', STATE,
    (t) => t.replace(/(^logical_session:\n(?:[ \t]+.*\n)*?[ \t]+active: )true$/m, '$1false'),
    'STRICTER: the old gate matched `active: true` anywhere after `logical_session:`, so any '
    + 'later prose field containing that literal satisfied it with the session inactive. The '
    + 'new gate is anchored to the block, so it fires where the old one passed.'],
  ['a GitHub token pasted into the state', STATE, (t) => `${t}\nleaked: "ghp_0123456789abcdefghijklmnopqrstuvwxyz"\n`],

  // --- REFERENCE_BENCHMARKS.md ----------------------------------------------------------
  ['benchmark title SUPERHOT dropped', BENCH, (t) => drop(t, 'SUPERHOT')],
  ['benchmark title Lemnis Gate dropped', BENCH, (t) => drop(t, 'Lemnis Gate')],
  ['benchmark title Gunfire Reborn dropped', BENCH, (t) => drop(t, 'Gunfire Reborn')],
  ['benchmark title Call of Duty: Mobile dropped', BENCH, (t) => drop(t, 'Call of Duty: Mobile')],
  ['benchmark exclusions section renamed', BENCH, (t) => t.replace(/Elements intentionally excluded/i, 'Notes')],
  ['benchmark loses prepared_not_executed', BENCH, (t) => t.replace(/prepared_not_executed/g, 'pending')],

  // --- boot documents -------------------------------------------------------------------
  ['AGENTS.md loses the START_HERE pointer', AGENTS, (t) => drop(t, 'START_HERE.md')],
  ['AGENTS.md loses the mandatory floor line', AGENTS, (t) => t.replace(/mandatory floor/, 'optional floor')],
  ['AGENTS.md loses the Section 0.3 pointer', AGENTS, (t) => t.replace(/Section 0\.3/, 'Section X')],
  ['AGENTS.md grown past its ceiling', AGENTS, (t) => t + 'x'.repeat(4000)],
  ['START_HERE.md loses compressed F7', START, (t) => t.replace(/\*\*F7 /, 'F7 ')],
  ['START_HERE.md loses its protocol version', START, (t) => t.replace(/Protocol:.*2\.2/s, 'Protocol: none')],
  ['START_HERE.md loses the STATE.yaml pointer', START, (t) => t.replace(/AI_DEVELOPMENT\/STATE\.yaml/g, 'nope.yaml')],
  ['START_HERE.md grown past its ceiling', START, (t) => t + 'x'.repeat(7000)],
];

const verdict = (dir, script) => {
  try {
    execFileSync('node', [script], { cwd: dir, stdio: 'pipe' });
    return 'pass';
  } catch (error) {
    return error.status === 1 ? 'fail' : `error(${error.status})`;
  }
};

const base = mkdtempSync(join(tmpdir(), 'gptgame-equiv-'));
cpSync(REPO, base, {
  recursive: true,
  filter: (src) => !/(\/\.git$|\/\.git\/|\/node_modules$|\/node_modules\/|\/_site$)/.test(src),
});

const oldSource = execFileSync('git', ['show', `${BASE}:scripts/verify-continuity.mjs`],
  { cwd: REPO, encoding: 'utf8' });
writeFileSync(join(base, 'scripts', 'verify-continuity-old.mjs'), oldSource);

// A base that resolves to the current file makes every comparison vacuous.
if (oldSource === readFileSync(join(REPO, 'scripts/verify-continuity.mjs'), 'utf8')) {
  throw new Error(`base ${BASE} holds the same gate as the working tree — there is nothing to compare`);
}

const FILES = [STATE, PROTOCOL, BENCH, AGENTS, START];
for (const f of FILES) {
  if (!existsSync(join(base, f))) throw new Error(`battery fixture missing: ${f}`);
}
const originals = Object.fromEntries(FILES.map((p) => [p, readFileSync(join(base, p), 'utf8')]));

let agree = 0;
let expectedDivergences = 0;
const rows = [];
for (const [name, file, transform, expectedDivergence] of MUTATIONS) {
  for (const [p, text] of Object.entries(originals)) writeFileSync(join(base, p), text);
  if (file) {
    const mutated = transform(originals[file]);
    if (mutated === originals[file]) throw new Error(`mutation "${name}" changed nothing — it would report a checked agreement it never exercised`);
    writeFileSync(join(base, file), mutated);
  }

  const oldVerdict = verdict(base, 'scripts/verify-continuity-old.mjs');
  const newVerdict = verdict(base, 'scripts/verify-continuity.mjs');
  const same = oldVerdict === newVerdict;
  if (same) agree++;

  // A divergence is only acceptable when it was declared in advance AND runs in the strict
  // direction: the new gate fires where the old one passed. The reverse — new passes where
  // old fired — is a lost check, and no annotation may excuse it.
  const strictDirection = oldVerdict === 'pass' && newVerdict === 'fail';
  const excused = !same && Boolean(expectedDivergence) && strictDirection;
  if (excused) expectedDivergences++;

  rows.push([same ? 'ok  ' : excused ? 'STRICT' : 'DIFF', name, oldVerdict, newVerdict, expectedDivergence]);
}

for (const [mark, name, o, n, note] of rows) {
  console.log(`${mark.padEnd(6)} ${name.padEnd(48)} old=${o.padEnd(6)} new=${n}`);
  if (mark !== 'ok  ' && note) console.log(`       ${note}`);
}
const unexplained = rows.filter((r) => r[0] === 'DIFF');
console.log(`\n${agree}/${MUTATIONS.length} mutations reach the same verdict in both gates (base ${BASE})`);
console.log(`${expectedDivergences} declared strictness gain(s); ${unexplained.length} unexplained divergence(s)`);
console.log(`${rows.filter((r) => r[2] === 'fail').length}/${MUTATIONS.length - 1} deliberate breakages fired in the old gate`);

rmSync(base, { recursive: true, force: true });
process.exit(unexplained.length === 0 ? 0 : 1);
