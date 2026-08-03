# ECHO//SEVEN — standing instructions

What the product is: `README.md`.
What "good" means, element by element: `AI_DEVELOPMENT/REFERENCE_BENCHMARKS.md`.

Those two are the goal. This file says what must be **true when you stop**. It
does not say how to get there.

## Who decides

**The user's latest explicit instruction outranks everything here, including this
file and both goal files.** A stated concept replaces the recorded one; it
is not merged with it.

Then, in order: verified reality — what the repository, runtime and public surface
actually do; then the recorded goal; then what a previous run wrote down.
**A repeated assumption never becomes a fact.**

This is an operating agreement, not a product brief. **It never authorizes
inventing an objective, feature, technology or release target.** Do not invent
scope, rewrite working systems for preference, or overwrite unrelated work.

## How you work is yours

There is no reading order, no step sequence, no rigor tier and no required
ceremony in this repository. Pick your own method, change it whenever a better one
appears, and do not explain the method unless asked. Nothing here is judged on
process.

**One exception, set by the user.** After the blind comparison in
`AI_DEVELOPMENT/REFERENCE_BENCHMARKS.md`, an element that is not `satisfied` keeps
the work open. Nothing finishes while any element is unmet. **Getting from there
to satisfied is method, and method is yours.**

## One unit of work

**A unit starts on the user's instruction and ends when a blind comparison you
launched completes.** Everything in between is yours: what to repair, in what
order, and when to launch the comparison.

How many units — a number or continuously — is `work.units_requested` in
`STATE.yaml`. Nothing recorded means one.

## Real hardware is out; the phone gates stand in for it

Playwright WebKit and iOS Simulator Mobile Safari are the phone surface.

**What they measure is judged normally.** What they cannot measure but can be
reasoned from what they do — whether the workload fits a phone's budget, whether
the memory footprint fits, whether every control is reachable on a `375×667`
screen — **is reasoned, and the reasoning has to satisfy the criterion. It is
written as reasoning with the numbers it rests on, never as a measurement.**

**Nothing is ruled permanently out of reach.** Where nothing reaches something
yet, that reads `not measured` and carries what would reach it.

## What must be true when you stop

1. **Anything called done was actually run.** Not written, not read, not
   plausible — executed, with the result inspected.
2. **Anything called published was fetched back.** The bytes served to a visitor
   were retrieved and matched against the intended build. A green deploy is not
   this.
3. **Every quality goal reads `satisfied`, `not satisfied` or `not measured`.**
   Those three words, nothing else, and never a word stronger than the evidence.
   `not measured` is respectable, and not the end. Guessing is not.
4. **What you could not do is written down as not done**, with the reason.
   Silence reads as success and is the one failure that compounds.
5. **No credential, key, token, recovery detail or personal data** in any file,
   record, log, screenshot or commit. This repository is public.

## Two records, two authors

- **`AI_DEVELOPMENT/MEASURED.md` — the machine writes this.** Produced by
  `npm run measure`. Never edit it by hand; an edit is detected and fails the
  continuity check. It is the only place a measurement counts.
- **`AI_DEVELOPMENT/STATE.yaml` — you write this.** Objective, judgement, plan,
  blockers, the one-line next action.

**If the two disagree, `MEASURED.md` is right.** Read it before deciding
anything, including before believing your own previous run.

## Nothing is blocked

The checks run and report. They stop neither a merge nor a publish. That is
deliberate: a broken page is cheap to fix, while work built on a false belief
costs rounds. It also makes the record's honesty the only defence there is —
which is why the machine writes its own half of it.

## The short list that does not change

- **Never reproduce a reference work's content.** Its art, models, audio, text,
  levels, layout, icons, HUD or fiction may not be copied or near-copied into
  this product, and no reference is named in what ships.
- A quality goal may be made stricter at any time. It may be weakened only after
  it is shown to be unreachable as written — never to reach a pass.
- Do not enable unattended chaining. Nothing blocks, so nothing would catch it.

## Changed by the user, 2026-08-02

`README.md`, `AI_DEVELOPMENT/REFERENCE_BENCHMARKS.md` and everything under
`AI_DEVELOPMENT/ARCHIVE/` carry the earlier wording. Finding an older form there
is not grounds to reinstate it.

- **External runtime assets, CDNs, hosted services and network calls are
  allowed.** The zero-external-asset constraint is lifted. It remains an accurate
  description of the build as it stands, not a requirement on the next one.
- **A reference work is not only a source of principles.** It is also the bar
  this product is measured against and compared with, and criteria may be drawn
  from it as directly as the comparison needs. The no-copying rule above is
  unaffected: use a reference to judge this product, never to fill it.

Everything above this line is the whole of the standing instruction.
