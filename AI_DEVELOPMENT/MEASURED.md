# Measured

<!--
Written by `npm run measure`. Do not edit by hand: the digest at the end is checked,
and an edited file fails `node scripts/verify-continuity.mjs`.

This file is the authority for what was measured. AI_DEVELOPMENT/STATE.yaml is the
authority for judgement and plan. Where they disagree, this file is right.
-->

taken: 2026-08-03T06:04:54.581Z
branch: claude/repo-instructions-constraints-r0070m
commit: 084866d6f1728dcd93210a09032fc4478e938fcc

| check | verdict | evidence |
|---|---|---|
| working tree clean            | `not satisfied` | 4 uncommitted path(s) |
| deterministic tests executed  | `satisfied` | # duration_ms 18718.254883 |
| vendored kit matches source   | `satisfied` | note: this is an integrity check, not a comparison against the kit — run --check from the kit for that. |
| local build identity computed | `satisfied` | 69f72f7b1c8ee9a6b6603687d10d838376384df0741abec70e51edcb9606a6f7 |
| served bytes match this build | `satisfied` | https://bachikoljunior-blip.github.io/Gptgame/ serves 69f72f7b1c8e… |

4 satisfied, 1 not satisfied, 0 not measured.
digest: f8d96a96c9875210bf99170620b78f9589779477af49cf7a9d9826296e4ecf6c
