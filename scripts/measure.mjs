#!/usr/bin/env node
/**
 * measure.mjs — the machine's half of the record.
 *
 * Everything this repository knows about itself used to be written by whoever was working
 * on it. That is exactly the arrangement in which "the bamboo is in" and "the bamboo draws
 * nothing" look identical from outside: the sentence is written by the party who believes
 * it. So the measurements now have a different author from the judgement.
 *
 *   npm run measure    ->  rewrites AI_DEVELOPMENT/MEASURED.md
 *
 * The file ends with a digest of its own body. `verify-continuity.mjs` recomputes it, so a
 * hand edit — including an optimistic one — is a failure rather than a fact. Nothing here
 * blocks a merge or a publish. It only makes the record unable to lie about what happened.
 *
 * A check that cannot run is recorded as `not measured` with the reason. That is a normal
 * outcome and must never be smoothed into a pass.
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { computeArtifactRevision } from './artifact-revision.mjs';
import { DIGEST_PREFIX, digestOf } from './measured-digest.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = join(ROOT, 'AI_DEVELOPMENT/MEASURED.md');

/** Three words, the same three the standing instructions allow. */
const SATISFIED = 'satisfied';
const NOT_SATISFIED = 'not satisfied';
const NOT_MEASURED = 'not measured';

function run(command, args) {
  try {
    const stdout = execFileSync(command, args, {
      cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 15 * 60 * 1000,
    });
    return { ok: true, output: stdout.trim() };
  } catch (error) {
    const output = [error.stdout, error.stderr, error.message].filter(Boolean).join('\n').trim();
    return { ok: false, output };
  }
}

/** Last non-empty line, trimmed to one readable row of evidence. */
function lastLine(text, limit = 200) {
  const line = String(text).split('\n').map((l) => l.trim()).filter(Boolean).pop() || '';
  return line.length > limit ? `${line.slice(0, limit - 1)}…` : line;
}

const checks = [];
const record = (name, verdict, evidence) => checks.push({ name, verdict, evidence });

/* ------------------------------------------------------------------ where the tree is */

const git = (args) => run('git', args).output;
const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']) || 'unknown';
const head = git(['rev-parse', 'HEAD']) || 'unknown';
const dirty = git(['status', '--porcelain']);

record(
  'working tree clean',
  dirty ? NOT_SATISFIED : SATISFIED,
  dirty ? `${dirty.split('\n').length} uncommitted path(s)` : 'no uncommitted changes',
);

/* ------------------------------------------------------------------ does it actually run */

const tests = run('node', ['--test', 'tests/game-core.test.mjs']);
record(
  'deterministic tests executed',
  tests.ok ? SATISFIED : NOT_SATISFIED,
  lastLine(tests.output) || (tests.ok ? 'passed' : 'failed with no output'),
);

const kit = run('node', ['.kit/tools/bootstrap.mjs', '--target=.', '--check']);
record(
  'vendored kit matches source',
  kit.ok ? SATISFIED : NOT_SATISFIED,
  lastLine(kit.output) || (kit.ok ? 'no drift' : 'drifted'),
);

/* ---------------------------------------------------------------- what a visitor receives */

let expected = null;
try {
  expected = computeArtifactRevision(readFileSync(join(ROOT, 'index.html'), 'utf8'));
  record('local build identity computed', SATISFIED, expected);
} catch (error) {
  record('local build identity computed', NOT_SATISFIED, lastLine(error.message));
}

const publicUrl = process.env.PUBLIC_URL || 'https://bachikoljunior-blip.github.io/Gptgame/';
if (!expected) {
  record('served bytes match this build', NOT_MEASURED, 'no local build identity to compare against');
} else {
  const served = run('node', ['scripts/verify-public-revision.mjs', publicUrl, expected, '1']);
  record(
    'served bytes match this build',
    served.ok ? SATISFIED : NOT_MEASURED,
    served.ok ? `${publicUrl} serves ${expected.slice(0, 12)}…` : `not reached: ${lastLine(served.output, 160)}`,
  );
}

/* --------------------------------------------------------------------------- the record */

const stamp = new Date().toISOString();
const width = Math.max(...checks.map((c) => c.name.length));

const body = [
  '# Measured',
  '',
  '<!--',
  'Written by `npm run measure`. Do not edit by hand: the digest at the end is checked,',
  'and an edited file fails `node scripts/verify-continuity.mjs`.',
  '',
  'This file is the authority for what was measured. AI_DEVELOPMENT/STATE.yaml is the',
  'authority for judgement and plan. Where they disagree, this file is right.',
  '-->',
  '',
  `taken: ${stamp}`,
  `branch: ${branch}`,
  `commit: ${head}`,
  '',
  '| check | verdict | evidence |',
  '|---|---|---|',
  ...checks.map((c) => `| ${c.name.padEnd(width)} | \`${c.verdict}\` | ${c.evidence.replaceAll('|', '\\|')} |`),
  '',
  `${checks.filter((c) => c.verdict === SATISFIED).length} satisfied, `
  + `${checks.filter((c) => c.verdict === NOT_SATISFIED).length} not satisfied, `
  + `${checks.filter((c) => c.verdict === NOT_MEASURED).length} not measured.`,
  '',
].join('\n');

if (import.meta.url === `file://${process.argv[1]}`) {
  writeFileSync(OUTPUT, `${body}${DIGEST_PREFIX}${digestOf(body)}\n`);
  for (const check of checks) console.log(`${check.verdict.padEnd(13)} ${check.name} — ${check.evidence}`);
  console.log(`\nwritten: AI_DEVELOPMENT/MEASURED.md`);
}
