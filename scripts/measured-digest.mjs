/**
 * measured-digest.mjs — the seal on the machine-written record.
 *
 * Its own module because the writer (`measure.mjs`) runs real checks at load, and the
 * reader (`verify-continuity.mjs`) must be able to validate the seal without running them.
 */

import { createHash } from 'node:crypto';

export const DIGEST_PREFIX = 'digest: ';

export const digestOf = (text) => createHash('sha256').update(text, 'utf8').digest('hex');

/**
 * @param {string} text Full contents of AI_DEVELOPMENT/MEASURED.md
 * @returns {{ok: boolean, reason?: string}}
 */
export function checkMeasuredSeal(text) {
  const index = text.lastIndexOf(`\n${DIGEST_PREFIX}`);
  if (index === -1) return { ok: false, reason: 'MEASURED.md has no digest line' };

  const body = text.slice(0, index + 1);
  const recorded = text.slice(index + 1 + DIGEST_PREFIX.length).trim();
  if (!/^[0-9a-f]{64}$/.test(recorded)) return { ok: false, reason: 'MEASURED.md digest is not a SHA-256 value' };

  const actual = digestOf(body);
  if (actual !== recorded) {
    return { ok: false, reason: 'MEASURED.md was edited by hand: its digest does not match its body' };
  }
  return { ok: true };
}
