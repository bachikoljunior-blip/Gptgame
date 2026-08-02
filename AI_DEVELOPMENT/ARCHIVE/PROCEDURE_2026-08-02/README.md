# Retired procedure documents — 2026-08-02

These are kept as the origin record for decisions made under them. They are **not** in
force and must not be re-adopted without a new instruction from the user.

| File | What it was | Why it is here |
|---|---|---|
| `PROTOCOL.md` | 438 lines: the nine-item mandatory floor, adaptive rigor tiers, lifecycles, planning, review, gates, completion | Replaced by seven end conditions in `AGENTS.md`. Its obligations were about method; what survives is what must be true at the end. |
| `START_HERE.md` | boot loader: reading order, compressed floor, resume procedure | There is no required reading order any more. |
| `MODULES/` | nine optional procedure modules, none ever activated | Never fired in the life of the project. |

**What changed in substance, not just in length.**

- Nothing blocks. The checks report; they do not stop a merge or a publish. A broken public
  page is cheap to fix, while work built on a false belief costs whole rounds — so the
  budget went to measuring, not to stopping.
- The measurements and the judgement now have **different authors**. `MEASURED.md` is
  written by `npm run measure` and sealed with a digest; `STATE.yaml` is written by whoever
  is working. Where they disagree, `MEASURED.md` wins. This replaces what branch protection
  was going to do, and needs no repository settings.
- The ten status words became three: `satisfied`, `not satisfied`, `not measured`.
- `verify-continuity.mjs` no longer checks the shape of the instructions. It used to require
  that this protocol's own section numbers and floor items were present, which made the
  procedure impossible to shorten without the gate failing.

**What did not change.** The prohibitions in `AGENTS.md` — no fabricated claims, no external
runtime assets, no secrets, no copying the reference works, no weakening a quality goal to
pass it, no unattended chaining — are the same ones this protocol carried.
