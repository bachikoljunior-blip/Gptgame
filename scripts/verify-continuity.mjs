#!/usr/bin/env node
/**
 * verify-continuity.mjs — this repository's state gate.
 *
 * It used to check the *shape of the instructions*: that START_HERE.md named protocol 2.2,
 * that PROTOCOL.md still carried sections 0.1 through 0.6, that all nine floor items and all
 * ten status words were present in both. That made the procedure itself load-bearing — the
 * documents could not be shortened without the gate failing, which is a strange thing for a
 * gate to defend. What matters is not that a rule is written down. It is that the record of
 * what happened is true.
 *
 * So this now checks four things, and nothing about method:
 *
 *   1. the standing instructions still state the goals, and still fit in one read;
 *   2. the machine-written record has not been edited by hand;
 *   3. the human-written record can still be resumed from — objective, next action;
 *   4. nothing credential-shaped is sitting in a file a session reads.
 *
 *   node scripts/verify-continuity.mjs             # validate
 *   node scripts/verify-continuity.mjs --selftest  # prove every check here can fail
 *
 * `--selftest` stays, and stays first in CI. A silently inert gate and a passing gate are
 * indistinguishable from outside: both print nothing and exit 0. The control case is as
 * load-bearing as the failing ones — a gate that fires on everything is as broken as one
 * that never fires.
 *
 * Nothing here blocks a merge or a publish. It reports.
 */

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { requireFiles, requireNonEmpty, requireByteCeiling } from '../.kit/lib/state/files.mjs';
import { scanSecretValues } from '../.kit/lib/state/secrets.mjs';
import { reportGateSelfTests } from '../.kit/lib/state/selftest.mjs';
import { checkMeasuredSeal } from './measured-digest.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const argv = new Set(process.argv.slice(2));

/* ------------------------------------------------------- this repository's vocabulary */

const REQUIRED = [
  'AGENTS.md',
  'AI_DEVELOPMENT/STATE.yaml',
  'AI_DEVELOPMENT/MEASURED.md',
  'AI_DEVELOPMENT/REFERENCE_BENCHMARKS.md',
  'AI_DEVELOPMENT/ARCHIVE/PRE_MIGRATION_2026-08-01.yaml',
];

/** Standing instructions that stop fitting in one read stop being read. */
const CEILINGS = { 'AGENTS.md': 4500 };

/**
 * The seven end conditions from AGENTS.md, each reduced to the phrase that cannot be
 * dropped without losing the goal. Deliberately matched loosely: this gate defends that the
 * goals are stated, not the wording they are stated in.
 */
const GOALS = [
  [/record matches reality/i, 'the record must match reality'],
  [/actually run/i, 'done means actually run'],
  [/fetched back/i, 'published means fetched back'],
  [/`not measured`/, 'the three-word verdict vocabulary'],
  [/No secrets anywhere/i, 'no secrets'],
  [/next action is one readable line/i, 'a resumable next action'],
  [/written down as not done/i, 'what could not be done is recorded'],
];

const BENCHMARK_TITLES = ['Lemnis Gate', 'SUPERHOT', 'Gunfire Reborn', 'Call of Duty: Mobile'];

/* ------------------------------------------------------------------------- the checks */

/**
 * @param {object} [options]
 * @param {string} [options.root]
 * @param {(name: string) => string} [options.read] Injectable so the self-test can run the
 *   real checks against fabricated documents without writing to disk.
 * @returns {{failures: string[], objective: string|null, nextAction: string|null}}
 */
export function verifyContinuity({ root = ROOT, read } = {}) {
  const readFile = read || ((name) => {
    try { return readFileSync(join(root, name), 'utf8'); } catch { return ''; }
  });
  const failures = [];

  failures.push(...requireFiles(root, REQUIRED));
  failures.push(...requireNonEmpty(root, REQUIRED));
  failures.push(...requireByteCeiling(root, CEILINGS));

  const instructions = readFile('AGENTS.md');
  const measured = readFile('AI_DEVELOPMENT/MEASURED.md');
  const state = readFile('AI_DEVELOPMENT/STATE.yaml');
  const benchmarks = readFile('AI_DEVELOPMENT/REFERENCE_BENCHMARKS.md');

  const must = (text, pattern, message) => {
    if (!(pattern instanceof RegExp ? pattern.test(text) : text.includes(pattern))) failures.push(message);
  };

  /* 1 — the goals are still stated, and both records are still named */

  for (const [pattern, goal] of GOALS) {
    must(instructions, pattern, `AGENTS.md no longer states the goal: ${goal}`);
  }
  must(instructions, 'AI_DEVELOPMENT/MEASURED.md', 'AGENTS.md no longer names the machine-written record');
  must(instructions, 'AI_DEVELOPMENT/STATE.yaml', 'AGENTS.md no longer names the hand-written record');
  must(instructions, /MEASURED\.md` is right/, 'AGENTS.md no longer says which record wins a disagreement');

  /* 2 — the machine's half of the record was not rewritten by the party it judges */

  const seal = checkMeasuredSeal(measured);
  if (!seal.ok) failures.push(seal.reason);

  /* 3 — the hand-written half can still be resumed from */

  // Anchored to the objective block's own first key. The unanchored form matched any quoted
  // id anywhere later in the file, so deleting the objective id outright still satisfied it.
  must(state, /objective:\s*\n\s+id: "[^"]+"/, 'STATE.yaml has lost the active objective id');
  must(state, /exact_next_action: "[^"]+"/, 'STATE.yaml exact_next_action is empty');
  must(state, /reference_benchmark:[\s\S]*?path: "AI_DEVELOPMENT\/REFERENCE_BENCHMARKS\.md"/,
    'STATE.yaml has lost the reference benchmark path');
  // Anchored for the same reason, and this one was caught the hard way: the unanchored form
  // matched `active: true` anywhere after `logical_session:`, so writing that literal string
  // into a later prose field satisfied the check with the session marked inactive.
  must(state, /^logical_session:\n(?:[ \t]+.*\n)*?[ \t]+active: true$/m,
    'STATE.yaml no longer records an active logical session');
  must(state, 'unattended_allowed: false', 'unattended work must remain disabled');

  /* the product goal itself — kept, because it is a goal, not a procedure */

  for (const title of BENCHMARK_TITLES) {
    must(benchmarks, new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      `benchmark file is missing ${title}`);
  }
  must(benchmarks, /Elements intentionally excluded/i, 'benchmark file no longer records its exclusions');

  /* 4 — credential-shaped values in any document a session actually reads */

  for (const name of REQUIRED) failures.push(...scanSecretValues(readFile(name), name));

  const objective = state.match(/objective:\s*\n\s+id: "([^"]+)"/)?.[1] ?? null;
  const nextAction = state.match(/exact_next_action: "([^"]+)"/)?.[1] ?? null;
  if (!objective) failures.push('cannot read the active objective id out of STATE.yaml');
  if (!nextAction) failures.push('cannot read exact_next_action out of STATE.yaml');

  return { failures, objective, nextAction };
}

/* -------------------------------------------------------------------------- self-test */

export function selfTestCases({ root = ROOT } = {}) {
  const real = (name) => {
    try { return readFileSync(join(root, name), 'utf8'); } catch { return ''; }
  };
  const withEdit = (target, edit) => ({
    root,
    read: (name) => (name === target ? edit(real(name)) : real(name)),
  });
  const drop = (text, marker) => {
    if (!text.includes(marker)) throw new Error(`self-test fixture did not apply: ${marker}`);
    return text.split(marker).join('«removed»');
  };
  const run = (options) => verifyContinuity(options).failures;

  return [
    { name: 'control: this repository\'s own state passes', shouldFire: false, evaluate: () => run({ root }) },
    {
      name: 'a goal deleted from the standing instructions',
      evaluate: () => run(withEdit('AGENTS.md', (t) => drop(t, 'fetched back'))),
    },
    {
      name: 'the instructions losing the three-word verdict vocabulary',
      evaluate: () => run(withEdit('AGENTS.md', (t) => drop(t, '`not measured`'))),
    },
    {
      name: 'the instructions no longer saying which record wins',
      evaluate: () => run(withEdit('AGENTS.md', (t) => drop(t, 'MEASURED.md` is right'))),
    },
    {
      // The whole point of the machine writing its own half. An optimistic hand edit is the
      // exact failure this replaces the old blocking gates with.
      name: 'a verdict improved by hand in the machine-written record',
      evaluate: () => run(withEdit('AI_DEVELOPMENT/MEASURED.md',
        (t) => t.replace(/`not satisfied`|`not measured`/, '`satisfied`'))),
    },
    {
      name: 'the machine-written record stripped of its seal',
      evaluate: () => run(withEdit('AI_DEVELOPMENT/MEASURED.md',
        (t) => t.replace(/\ndigest: [0-9a-f]{64}\n$/, '\n'))),
    },
    {
      name: 'an empty exact_next_action leaves the next run nothing to resume from',
      evaluate: () => run(withEdit('AI_DEVELOPMENT/STATE.yaml',
        (t) => t.replace(/exact_next_action: "[^"]+"/, 'exact_next_action: ""'))),
    },
    {
      name: 'the objective losing its id entirely',
      evaluate: () => run(withEdit('AI_DEVELOPMENT/STATE.yaml',
        (t) => t.replace(/(objective:\s*\n\s+)id: "[^"]+"\n/, '$1'))),
    },
    {
      name: 'the logical session marked inactive',
      evaluate: () => run(withEdit('AI_DEVELOPMENT/STATE.yaml',
        (t) => t.replace(/(^logical_session:\n(?:[ \t]+.*\n)*?[ \t]+active: )true$/m, '$1false'))),
    },
    {
      name: 'unattended work silently re-enabled',
      evaluate: () => run(withEdit('AI_DEVELOPMENT/STATE.yaml',
        (t) => t.replace('unattended_allowed: false', 'unattended_allowed: true'))),
    },
    {
      name: 'a reference title dropped from the benchmark record',
      evaluate: () => run(withEdit('AI_DEVELOPMENT/REFERENCE_BENCHMARKS.md', (t) => drop(t, 'SUPERHOT'))),
    },
    {
      name: 'the benchmark record losing its exclusions',
      evaluate: () => run(withEdit('AI_DEVELOPMENT/REFERENCE_BENCHMARKS.md',
        (t) => t.replace(/Elements intentionally excluded/i, 'Notes'))),
    },
    {
      name: 'a credential-shaped value pasted into the state file',
      evaluate: () => run(withEdit('AI_DEVELOPMENT/STATE.yaml',
        (t) => `${t}\nleaked: ghp_0123456789abcdefghijklmnopqrstuvwxyz\n`)),
    },
    {
      name: 'the standing instructions grown past their ceiling',
      evaluate: () => requireByteCeiling(root, { 'AGENTS.md': 10 }),
    },
    {
      name: 'a required canonical file missing',
      evaluate: () => requireFiles(root, ['AI_DEVELOPMENT/NO_SUCH_FILE.yaml']),
    },
  ];
}

/* -------------------------------------------------------------------------------- cli */

if (import.meta.url === `file://${process.argv[1]}`) {
  if (argv.has('--selftest')) {
    const ok = await reportGateSelfTests(selfTestCases(), { label: 'verify-continuity' });
    process.exit(ok ? 0 : 1);
  }

  const { failures, objective, nextAction } = verifyContinuity();
  if (failures.length) {
    console.error(`FAIL ${failures.length} continuity problem(s):`);
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
  }
  console.log(`continuity ok: objective=${objective}`);
  console.log(`resume: ${nextAction}`);
}
