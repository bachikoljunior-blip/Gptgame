# Measured

<!--
Written by `npm run measure`. Do not edit by hand: the digest at the end is checked,
and an edited file fails `node scripts/verify-continuity.mjs`.

This file is the authority for what was measured. AI_DEVELOPMENT/STATE.yaml is the
authority for judgement and plan. Where they disagree, this file is right.
-->

taken: 2026-08-03T05:24:46.560Z
branch: claude/repo-instructions-constraints-r0070m
commit: 4c79826052dc6b680581bc23c2372af7fdeed7a9

| check | verdict | evidence |
|---|---|---|
| working tree clean            | `not satisfied` | 3 uncommitted path(s) |
| deterministic tests executed  | `satisfied` | # duration_ms 40920.81323 |
| vendored kit matches source   | `satisfied` | note: this is an integrity check, not a comparison against the kit — run --check from the kit for that. |
| local build identity computed | `satisfied` | 69f72f7b1c8ee9a6b6603687d10d838376384df0741abec70e51edcb9606a6f7 |
| served bytes match this build | `satisfied` | https://bachikoljunior-blip.github.io/Gptgame/ serves 69f72f7b1c8e… |

4 satisfied, 1 not satisfied, 0 not measured.
digest: 712307cb80655a1877a58f20ae17b57cc63e97db914c62040cc7cd0cf6c80c11
