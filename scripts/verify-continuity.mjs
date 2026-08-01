#!/usr/bin/env node
/**
 * verify-continuity.mjs — this repository's state gate.
 *
 * The assertions used to be hand-written here, and the same ones were hand-written again in
 * `Q/tools/validate-protocol.mjs`, `game2/tools/validate-project-state.mjs` and
 * `survival/tools/check_operating_state.mjs` — four implementations of one job, two of them
 * roughly 70% the same file written independently. The shared implementations now live in
 * `.kit/lib/state/`; what stays here is this repository's own vocabulary: its Adaptive 2.2
 * floor items, its module shape, its ten statuses, its benchmark set.
 *
 * Nothing about the protocol this enforces has changed.
 *
 *   node scripts/verify-continuity.mjs             # validate
 *   node scripts/verify-continuity.mjs --selftest  # prove every check here can fail
 *
 * Two changes of substance beyond the swap, both deliberate:
 *
 * 1. It collects failures instead of throwing on the first one. `assert` stopped at the
 *    earliest problem, so a state with four defects reported one, was fixed, reported the
 *    next, and took four runs to clear.
 * 2. `--selftest`. A silently inert gate and a passing gate are indistinguishable from
 *    outside: both print nothing and exit 0. The control case is as load-bearing as the
 *    failing ones — a gate that fires on everything is as broken as one that never fires.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { requireFiles, requireNonEmpty, requireByteCeiling } from '../.kit/lib/state/files.mjs';
import { scanSecretValues } from '../.kit/lib/state/secrets.mjs';
import { reportGateSelfTests } from '../.kit/lib/state/selftest.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const argv = new Set(process.argv.slice(2));

/* ------------------------------------------------------- this repository's vocabulary */

const REQUIRED = [
  'START_HERE.md',
  'AGENTS.md',
  'AI_DEVELOPMENT/PROTOCOL.md',
  'AI_DEVELOPMENT/STATE.yaml',
  'AI_DEVELOPMENT/REFERENCE_BENCHMARKS.md',
  'AI_DEVELOPMENT/ARCHIVE/PRE_MIGRATION_2026-08-01.yaml',
];

/** A loader that stops fitting in one read stops being a loader. */
const CEILINGS = { 'START_HERE.md': 6500, 'AGENTS.md': 2400 };

const STATUSES = [
  'complete_verified', 'complete_unverified', 'prepared_not_applied', 'prepared_not_executed',
  'blocked', 'inconclusive', 'failed', 'rejected', 'rolled_back', 'superseded',
];

const PROTOCOL_SECTIONS = ['0.1', '0.2', '0.3', '0.4', '0.5', '0.6'];

const ENFORCEMENT_FIELDS = [
  'f2_state_update_check', 'f3_execution_check', 'f5_review_record_check',
  'f6_public_revision_check', 'revert_mechanism', 'last_observed_failing',
  'unenforced_items', 'unattended_allowed',
];

const BENCHMARK_TITLES = ['Lemnis Gate', 'SUPERHOT', 'Gunfire Reborn', 'Call of Duty: Mobile'];

const MODULES_DIR = 'AI_DEVELOPMENT/MODULES';
const MODULE_SECTIONS = ['# Trigger', '# Content', '# Stop condition'];

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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

  const start = readFile('START_HERE.md');
  const loader = readFile('AGENTS.md');
  const protocol = readFile('AI_DEVELOPMENT/PROTOCOL.md');
  const state = readFile('AI_DEVELOPMENT/STATE.yaml');
  const benchmarks = readFile('AI_DEVELOPMENT/REFERENCE_BENCHMARKS.md');

  const must = (text, pattern, message) => {
    if (!(pattern instanceof RegExp ? pattern.test(text) : text.includes(pattern))) failures.push(message);
  };

  must(start, /Protocol:.*2\.2/s, 'START_HERE.md does not name protocol 2.2');
  must(start, 'AI_DEVELOPMENT/STATE.yaml', 'START_HERE.md does not point at AI_DEVELOPMENT/STATE.yaml');
  must(start, /verify.*reality/i, 'START_HERE.md has lost its verify-against-reality instruction');

  must(loader, /read .START_HERE\.md./, 'AGENTS.md does not tell the reader to read START_HERE.md');
  must(loader, 'mandatory floor', 'AGENTS.md does not name the mandatory floor');
  must(loader, 'Section 0.3', 'AGENTS.md does not name Section 0.3');

  for (let item = 1; item <= 9; item += 1) {
    must(protocol, new RegExp(`F${item} —`), `protocol is missing F${item}`);
    must(start, new RegExp(`\\*\\*F${item} `), `START_HERE is missing compressed F${item}`);
  }
  for (const section of PROTOCOL_SECTIONS) {
    must(protocol, new RegExp(escape(section)), `protocol is missing Section ${section}`);
  }
  for (const status of STATUSES) {
    must(protocol, new RegExp(status), `protocol is missing status ${status}`);
  }

  for (const field of ENFORCEMENT_FIELDS) {
    must(state, new RegExp(`\\b${field}:`), `STATE.yaml is missing ${field}`);
  }
  must(state, /objective:[\s\S]*?id: "visual-readability-richness-2026-08-01"/, 'STATE.yaml has lost the active objective id');
  must(state, /reference_benchmark:[\s\S]*?path: "AI_DEVELOPMENT\/REFERENCE_BENCHMARKS\.md"/, 'STATE.yaml has lost the reference benchmark path');
  must(state, /logical_session:[\s\S]*?active: true/, 'STATE.yaml no longer records an active logical session');
  must(state, /exact_next_action: "[^"]+"/, 'STATE.yaml exact_next_action is empty');
  must(state, 'modules_activated: []', 'STATE.yaml must record no activated modules');
  must(state, 'unattended_allowed: false', 'unattended work must remain disabled');

  for (const title of BENCHMARK_TITLES) {
    must(benchmarks, new RegExp(escape(title)), `benchmark file is missing ${title}`);
  }
  must(benchmarks, /prepared_not_executed/, 'benchmark file no longer records what was not executed');
  must(benchmarks, /Elements intentionally excluded/i, 'benchmark file no longer records its exclusions');

  const modules = moduleFiles(root);
  if (modules.length !== 9) failures.push(`expected 9 inactive module files, found ${modules.length}`);
  for (const module of modules) {
    const text = readFile(`${MODULES_DIR}/${module}`);
    for (const section of MODULE_SECTIONS) {
      const count = (text.match(new RegExp(`^${section}$`, 'gm')) || []).length;
      if (count !== 1) failures.push(`${module} must have exactly one "${section}" section, found ${count}`);
    }
  }

  // Credential-shaped values in any document a session actually reads.
  for (const name of [...REQUIRED, ...modules.map((m) => `${MODULES_DIR}/${m}`)]) {
    failures.push(...scanSecretValues(readFile(name), name));
  }

  const objective = state.match(/objective:\s*\n\s+id: "([^"]+)"[\s\S]*?\nexecution:/)?.[1] ?? null;
  const nextAction = state.match(/exact_next_action: "([^"]+)"/)?.[1] ?? null;
  if (!objective) failures.push('cannot read the active objective id out of STATE.yaml');
  if (!nextAction) failures.push('cannot read exact_next_action out of STATE.yaml');

  return { failures, objective, nextAction };
}

function moduleFiles(root) {
  try {
    return readdirSync(join(root, MODULES_DIR)).filter((f) => f.endsWith('.md')).sort();
  } catch {
    return [];
  }
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
      name: 'a floor item deleted from PROTOCOL.md',
      evaluate: () => run(withEdit('AI_DEVELOPMENT/PROTOCOL.md', (t) => drop(t, 'F6 —'))),
    },
    {
      name: 'a status dropped from the protocol vocabulary',
      evaluate: () => run(withEdit('AI_DEVELOPMENT/PROTOCOL.md', (t) => drop(t, 'rolled_back'))),
    },
    {
      name: 'the enforcement block missing a field',
      evaluate: () => run(withEdit('AI_DEVELOPMENT/STATE.yaml', (t) => drop(t, 'f5_review_record_check:'))),
    },
    {
      name: 'unattended work silently re-enabled',
      evaluate: () => run(withEdit('AI_DEVELOPMENT/STATE.yaml',
        (t) => t.replace('unattended_allowed: false', 'unattended_allowed: true'))),
    },
    {
      name: 'a module activated without the record saying so',
      evaluate: () => run(withEdit('AI_DEVELOPMENT/STATE.yaml',
        (t) => t.replace('modules_activated: []', 'modules_activated: [M4]'))),
    },
    {
      name: 'an empty exact_next_action leaves the next run nothing to resume from',
      evaluate: () => run(withEdit('AI_DEVELOPMENT/STATE.yaml',
        (t) => t.replace(/exact_next_action: "[^"]+"/, 'exact_next_action: ""'))),
    },
    {
      name: 'the objective id changed without the benchmark record following',
      evaluate: () => run(withEdit('AI_DEVELOPMENT/STATE.yaml',
        (t) => t.replace('visual-readability-richness-2026-08-01', 'something-else'))),
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
      name: 'the loader losing its pointer to START_HERE.md',
      evaluate: () => run(withEdit('AGENTS.md', (t) => drop(t, 'START_HERE.md'))),
    },
    {
      name: 'START_HERE.md losing a compressed floor item',
      evaluate: () => run(withEdit('START_HERE.md', (t) => drop(t, '**F7 '))),
    },
    {
      name: 'a credential-shaped value pasted into the state file',
      evaluate: () => run(withEdit('AI_DEVELOPMENT/STATE.yaml',
        (t) => `${t}\nleaked: ghp_0123456789abcdefghijklmnopqrstuvwxyz\n`)),
    },
    {
      name: 'a boot document grown past its ceiling',
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
