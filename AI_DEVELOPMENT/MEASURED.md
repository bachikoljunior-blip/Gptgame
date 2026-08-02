# Measured

<!--
Written by `npm run measure`. Do not edit by hand: the digest at the end is checked,
and an edited file fails `node scripts/verify-continuity.mjs`.

This file is the authority for what was measured. AI_DEVELOPMENT/STATE.yaml is the
authority for judgement and plan. Where they disagree, this file is right.
-->

taken: 2026-08-02T12:25:21.793Z
branch: claude/repo-instructions-constraints-r0070m
commit: 915691aa1526196aaccf3a755bd10e9b125f70c1

| check | verdict | evidence |
|---|---|---|
| working tree clean            | `not satisfied` | 1 uncommitted path(s) |
| deterministic tests executed  | `satisfied` | # duration_ms 18861.635548 |
| vendored kit matches source   | `satisfied` | note: this is an integrity check, not a comparison against the kit — run --check from the kit for that. |
| local build identity computed | `satisfied` | 69f72f7b1c8ee9a6b6603687d10d838376384df0741abec70e51edcb9606a6f7 |
| served bytes match this build | `satisfied` | https://bachikoljunior-blip.github.io/Gptgame/ serves 69f72f7b1c8e… |

4 satisfied, 1 not satisfied, 0 not measured.
digest: 2634adef67cd5b0ea9f884f8831b52f2d1590ef894ae2ca5856fa4e53aa54c26
