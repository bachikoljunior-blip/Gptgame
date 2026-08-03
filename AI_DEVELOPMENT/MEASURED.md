# Measured

<!--
Written by `npm run measure`. Do not edit by hand: the digest at the end is checked,
and an edited file fails `node scripts/verify-continuity.mjs`.

This file is the authority for what was measured. AI_DEVELOPMENT/STATE.yaml is the
authority for judgement and plan. Where they disagree, this file is right.
-->

taken: 2026-08-03T05:21:41.207Z
branch: claude/repo-instructions-constraints-r0070m
commit: c86658ce86b0c15c9063df62d0bf9501ddc1363f

| check | verdict | evidence |
|---|---|---|
| working tree clean            | `not satisfied` | 2 uncommitted path(s) |
| deterministic tests executed  | `satisfied` | # duration_ms 51849.278601 |
| vendored kit matches source   | `satisfied` | note: this is an integrity check, not a comparison against the kit — run --check from the kit for that. |
| local build identity computed | `satisfied` | 69f72f7b1c8ee9a6b6603687d10d838376384df0741abec70e51edcb9606a6f7 |
| served bytes match this build | `satisfied` | https://bachikoljunior-blip.github.io/Gptgame/ serves 69f72f7b1c8e… |

4 satisfied, 1 not satisfied, 0 not measured.
digest: 07f9182d083a4083b4d9ded321674834a03b7bf5c1bdc63c58e1948e45e0ba5d
