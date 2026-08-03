# Measured

<!--
Written by `npm run measure`. Do not edit by hand: the digest at the end is checked,
and an edited file fails `node scripts/verify-continuity.mjs`.

This file is the authority for what was measured. AI_DEVELOPMENT/STATE.yaml is the
authority for judgement and plan. Where they disagree, this file is right.
-->

taken: 2026-08-03T07:28:18.633Z
branch: claude/repo-instructions-constraints-r0070m
commit: 9b7feb61fa71b82229abe8d9d8198fdf4bf2ef8f

| check | verdict | evidence |
|---|---|---|
| working tree clean            | `not satisfied` | 1 uncommitted path(s) |
| deterministic tests executed  | `satisfied` | # duration_ms 19071.017155 |
| vendored kit matches source   | `satisfied` | note: this is an integrity check, not a comparison against the kit — run --check from the kit for that. |
| local build identity computed | `satisfied` | 69f72f7b1c8ee9a6b6603687d10d838376384df0741abec70e51edcb9606a6f7 |
| served bytes match this build | `satisfied` | https://bachikoljunior-blip.github.io/Gptgame/ serves 69f72f7b1c8e… |

4 satisfied, 1 not satisfied, 0 not measured.
digest: 9605fab226916bc3d878f919cf6807ef09d23eacf496a86cd931889a11458527
