# ECHO//SEVEN — standing instructions

What the product is: `README.md`.
What "good" means, element by element: `AI_DEVELOPMENT/REFERENCE_BENCHMARKS.md`.

Those two are the goal. This file says what must be **true when you stop**. It
does not say how to get there.

## How you work is yours

There is no reading order, no iteration loop, no step sequence, no rigor tier and
no required ceremony in this repository. Pick your own method, change it whenever
a better one appears, and do not explain the method unless asked. Nothing here is
judged on process.

## What must be true when you stop

1. **The record matches reality.** Branch, commit, build, deployment and open
   work in `AI_DEVELOPMENT/STATE.yaml` are what a fresh check would find.
2. **Anything called done was actually run.** Not written, not read, not
   plausible — executed, with the result inspected.
3. **Anything called published was fetched back.** The bytes served to a visitor
   were retrieved and matched against the intended build. A green deploy is not
   this.
4. **Every quality goal reads `satisfied`, `not satisfied` or `not measured`.**
   Those three words, nothing else, and never a word stronger than the evidence.
   `not measured` is a normal, respectable answer. Guessing is not.
5. **No secrets anywhere** — files, records, logs, screenshots, commits.
6. **The next action is one readable line** in `STATE.yaml`, good enough for
   someone who was not here.
7. **What you could not do is written down as not done**, with the reason, in
   the same place. Silence reads as success and is the one failure that
   compounds.

## Two records, two authors

- **`AI_DEVELOPMENT/MEASURED.md` — the machine writes this.** Produced by
  `npm run measure`. Never edit it by hand; an edit is detected and fails the
  continuity check. It is the only place a measurement counts.
- **`AI_DEVELOPMENT/STATE.yaml` — you write this.** Objective, judgement, plan,
  blockers, the one-line next action.

**If the two disagree, `MEASURED.md` is right.** Read it before deciding
anything, including before believing your own previous run.

## Nothing is blocked

The checks run and report. They do not stop a merge and they do not stop a
publish. That is deliberate: a broken page is cheap to fix, while work built on
a false belief costs rounds. It also means the honesty of the record is the only
defence there is, which is why the machine writes its own half of it.

## The short list that does not change

- Never claim an action you did not complete and inspect.
- No credentials or personal data in anything committed.
- A quality goal may be made stricter at any time. It may be weakened only after
  it is shown to be unreachable as written — never to reach a pass.
- Do not enable unattended chaining. Nothing blocks, so nothing would catch it.

## Withdrawn by the user, 2026-08-02

Older documents in this repository — `README.md`,
`AI_DEVELOPMENT/REFERENCE_BENCHMARKS.md`, and everything under
`AI_DEVELOPMENT/ARCHIVE/` — still carry these two rules. They are **no longer in
force**, and finding them in an archived file is not grounds to reinstate them.

- **External runtime assets, CDNs, hosted services and network calls are
  allowed.** The zero-external-asset constraint is lifted. It remains an accurate
  description of the build as it stands, not a requirement on the next one.
- **The reference works are not limited to principles.** Their content may be
  used directly. Choices about third-party rights are the user's to make and are
  not a rule enforced here.

Everything above this line is the whole of the standing instruction.
