# PROJECT-WIDE ADAPTIVE AUTONOMOUS DEVELOPMENT SYSTEM

Migration installation for Gptgame
Adaptive Edition with Enforced Floor — Version 2.2

This protocol supersedes conflicting earlier project-wide autonomous-development instructions only within the conflicting scope. Non-conflicting product requirements, accepted decisions, evidence, tests, standing delivery authorization, and deployment state remain active.

This is an operating contract, not a product brief. The actual user requirements, verified repository and runtime behavior, connected GitHub state, and deployed surface are the source of product truth. Continuity is reconstructed from the durable files named in START_HERE.md; hidden or literal cross-chat memory must never be claimed.

The protocol has three layers:

1. Layer 1: the concise AGENTS.md loader.
2. Layer 2: START_HERE.md, AI_DEVELOPMENT/STATE.yaml, and the mandatory floor below.
3. Layer 3: the remaining adaptive rules in this file and inactive on-demand files under AI_DEVELOPMENT/MODULES/.

Do not load all Layer 3 material unless the active work requires it.

======================================================================
0. MANDATORY FLOOR (NON-DISCRETIONARY CORE)
======================================================================

This section defines a deliberately small set of obligations that are never subject to cost, value, effort, or sufficiency judgment.

Everything else in this instruction is adaptive. This section is not.

## 0.1 Precedence

No other part of this instruction may reduce, defer, compress, or waive a floor obligation.

The following may never be used as a reason to skip a floor obligation:

- adaptive rigor selection, including LIGHT;
- “the lowest sufficient level of process”;
- “only when its value exceeds its maintenance cost”;
- “do not mistake more process for better work”;
- “do not perform a procedure merely because it appears in this instruction”;
- efficiency, brevity, remaining context, remaining time, usage limits, or token cost;
- confidence that the change is obviously correct;
- the work being small, local, familiar, or easy.

Only the user’s explicit instruction can waive a floor obligation. Record a waiver, its scope, and its expiry.

## 0.2 Trigger form

Each floor item is written as a trigger and an obligation.

Do not decide whether the obligation is worthwhile. Determine only whether the trigger fired, using verified reality rather than preference.

If it is unclear whether a trigger fired, treat it as fired.

Uncertainty always resolves toward performing the obligation, never toward skipping it.

Self-report is the weakest acceptable state of this floor, never the target state. F9 exists because a run that skipped a floor item and reported it as satisfied is otherwise indistinguishable from a run that performed it.

----------------------------------------------------------------------
F1 — Continuity read
----------------------------------------------------------------------

### TRIGGER

A Work run is about to inspect, change, verify, or deliver anything in this project.

### OBLIGATION

Before the first substantive action, read START_HERE.md and the active portion of STATE.yaml, or the established project equivalent, and verify the parts relevant to the intended next action against actual project reality.

If those files do not exist, perform the minimum durable installation first.

### NOT SATISFIED BY

Conversation history; a summary written earlier in chat; recall from a previous run; assuming the recorded state is still accurate because nothing seemed to change.

----------------------------------------------------------------------
F2 — Continuity write
----------------------------------------------------------------------

### TRIGGER

A Work run materially changed the project, or is ending while an objective remains incomplete.

### OBLIGATION

Before the run ends, update the canonical state with:

- objective status;
- last verified checkpoint;
- modified but unverified artifacts;
- blockers;
- recovery information;
- remote or deployment state where relevant;
- and the exact next action.

Reserve capacity for this. When a run may end soon because of context pressure, usage limits, or interruption risk, performing F2 takes priority over starting additional implementation.

### NOT SATISFIED BY

Describing the state only in chat; deciding the change was “not meaningful” after files were actually edited; deferring on the assumption that a later run will record it.

----------------------------------------------------------------------
F3 — Execution verification
----------------------------------------------------------------------

### TRIGGER

A change was made to code, configuration, data, schema, assets, or build and release settings, and the environment permits running, building, loading, or otherwise exercising it.

### OBLIGATION

Actually execute the relevant path and inspect the real result before treating the change as complete.

### NOT SATISFIED BY

Successful generation; reading the source; type-level or logical plausibility; a build that was never run; a test that was written but not executed; user approval of a diff.

### IF EXECUTION IS UNAVAILABLE

Record the item as prepared_not_executed, keep it open, and state the confidence limitation. Do not upgrade it to complete in a later run without actually executing it.

----------------------------------------------------------------------
F4 — Status honesty
----------------------------------------------------------------------

### TRIGGER

Any status is recorded in durable state or stated to the user.

### OBLIGATION

Use only these statuses, and use them accurately:

complete_verified, complete_unverified, prepared_not_applied, prepared_not_executed, blocked, inconclusive, failed, rejected, rolled_back, superseded.

Prose must not upgrade the recorded status. If a message says a feature works, F3 evidence for that feature must already exist.

### NOT SATISFIED BY

“Implemented”, “done”, “fixed”, or “should now work” as a completion claim for work whose status is prepared_not_executed, inconclusive, or blocked.

----------------------------------------------------------------------
F5 — Falsification before objective completion
----------------------------------------------------------------------

### TRIGGER

An objective is about to be marked complete, or a STRICT operation is about to proceed.

### OBLIGATION

Perform at least a Level C deliberate falsification pass and record which independence level was actually used.

For STRICT work, use Level A or B when the environment supports it. When it does not, use the strongest available substitute and record the limitation.

Choosing the level is adaptive. Performing no pass, or leaving the level unrecorded, is not permitted.

### NOT SATISFIED BY

The implementation pass itself; a test written by the implementer with no attempt to break the result; calling a review independent when it was not.

----------------------------------------------------------------------
F6 — Real-surface verification of delivery
----------------------------------------------------------------------

### TRIGGER

A merge, release, deployment, or publication changed what a user actually receives.

### OBLIGATION

After the operation, verify through the real public or production surface that:

- the intended revision is the one actually being served;
- the primary user journey works;
- and no blocking runtime error occurs.

Record the verified revision identifier.

### NOT SATISFIED BY

A deployment job starting or reporting success; the URL loading; a previously verified revision; a local build of the same commit; a screenshot taken before deployment completed.

----------------------------------------------------------------------
F7 — Acceptance mapping at objective completion
----------------------------------------------------------------------

### TRIGGER

An objective is marked complete.

### OBLIGATION

For each agreed acceptance criterion, record whether it is satisfied and the specific evidence that shows it.

### NOT SATISFIED BY

A general statement that the work looks finished, or a summary of activity performed.

----------------------------------------------------------------------
F8 — Skip accounting
----------------------------------------------------------------------

### TRIGGER

A floor trigger plausibly applied and the run concluded it did not fire, or a floor obligation could not be performed.

### OBLIGATION

Record one line in durable state containing: which floor item, which trigger, why it did not fire or why it was impossible, the supporting evidence, and whether it must be revisited.

One line is enough. Do not expand this into a report.

----------------------------------------------------------------------
F9 — Deterministic enforcement
----------------------------------------------------------------------

### TRIGGER

The environment exposes a mechanism that can fail, block, or revert an operation independently of judgment and report — repository CI, a required status check, branch protection, a deployment job, a post-deploy check, or an equivalent — and the active objective involves repeated implementation or delivery.

### OBLIGATION

Install the smallest reliable mechanism for each of the following, and record which are actually active:

- F2 gate: a check that fails when a commit changing product files carries no corresponding update to the canonical state file.
- F3 gate: build, startup, or test execution as a required status check, so that unexecuted or failing work cannot merge.
- F5 gate: a required record of the independence level and review outcome, enforced by branch protection or a required check, so that a merge without it fails.
- F6 gate: a post-deploy check that fetches the real public surface, compares the served revision identifier with the intended one, and fails the delivery when they do not match. Where the product can be reverted safely, wire that failure to an automatic revert to the last verified revision.

To make the F6 gate possible, ensure the build embeds a revision identifier reachable from the public surface.

### NOT SATISFIED BY

A rule written in a document; an instruction added to a loader file; a promise to check; a job that only reports and never fails; a check that can be bypassed without the bypass being recorded.

### BOUNDED

Use the smallest mechanism that fails correctly. Do not build an elaborate pipeline or add gates beyond the four above. Stop as soon as each required gate exists and has been observed to fail at least once on a deliberately bad input. A gate never observed failing is recorded as prepared_not_executed, not active.

### IF ENFORCEMENT IS UNAVAILABLE

Do not assume it is unavailable; demonstrate the missing capability.

When genuinely unavailable:

1. record which floor items remain self-reported only;
2. state the limitation in the floor check line of every run;
3. treat affected work as complete_unverified wherever the missing gate was the only independent evidence;
4. treat installing enforcement as P3 work as soon as capability appears.

## 0.3 End-of-run floor check

Before ending any run that touched the project, evaluate every floor item and include one compact line in the final message, for example:

Floor: F1 ok | F2 ok | F3 executed (browser) | F4 ok | F5 C | F6 n/a | F7 n/a | F8 1 skip | F9 gates: F2,F3 active / F5,F6 absent

This diagnostic line is mandatory but is not proof and does not substitute for F9.

## 0.4 Unattended operation

Unattended operation means any chain of runs that continues without the user reading output between them: a scheduled workflow, self-restarting loop, routine, automation, or run triggered by another agent.

Under unattended operation the floor-check line reaches no reader, so self-report provides no protection.

Therefore:

- Do not start, enable, extend, or continue unattended chaining for delivery-capable work while the four F9 gates are not active, unless the user explicitly waives this and the waiver is recorded with scope and expiry.
- An unattended chain must have a judgment-independent stop mechanism: a bounded run count and a file or flag checked before each run.
- An unattended run that cannot satisfy F2 must halt the chain.
- Public release in an unattended chain requires the F6 gate and working automatic revert. Without both, prepare the release and stop for a user-read run.

## 0.5 Enforcement state

Record inside the canonical state floor block:

    floor:
      enforcement:
        f2_state_update_check:
        f3_execution_check:
        f5_review_record_check:
        f6_public_revision_check:
        revert_mechanism:
        last_observed_failing:
        unenforced_items:
        unattended_allowed:

Each field records the mechanism actually installed and verified, or the accurate reason it is absent. Never record a gate as active merely because it was written.

When an active gate and a report disagree, the gate governs. Inspect the mechanism, correct the record, and report the discrepancy as a serious defect.

## 0.6 Floor discipline

The floor is intentionally small.

Do not expand it or add new mandatory items, files, roles, schemas, dashboards, or reports in the name of the floor.

F9 is the sole exception and is bounded by its own clause.

Everything above the floor remains adaptive.

======================================================================
1. CORE NON-NEGOTIABLE RULES
======================================================================

- Resolve authority in the order defined in START_HERE.md. Verified reality overrides stale state; correct only the affected records and preserve uncertainty.
- Never claim an action or verification that did not actually complete and get inspected.
- Do not invent scope, rewrite working systems for preference, or overwrite unrelated user work.
- Never expose secrets, private data, credentials, or recovery information. Paid, destructive, ownership, visibility, and security-control changes require the authority defined in Section 14.
- Persist enough secret-free state for a later run to continue accurately. Progress is preferred over ceremony, but never over Section 0.
- No work continues outside an active run unless an actual authorized automation exists; then Section 0.4 applies.

======================================================================
2. ADAPTIVE RIGOR
======================================================================

- LIGHT: narrow, reversible, low-risk work. Inspect, change, execute the smallest meaningful check, update state.
- STANDARD: multi-file, integrated, persistent, or moderately uncertain user-visible work. Record bounded criteria, risks, recovery, integration checks, falsification, and checkpoint.
- STRICT: public release, protected merge, security/privacy, data migration, destructive change, critical recovery, or high-consequence uncertainty. Require explicit criteria, verified baseline and recovery, broader gates and evidence, appropriately independent review, exact delivery verification, F5, and F6.
- Choose the lowest sufficient level above the floor; escalate when consequences or uncertainty increase. Public merge and deployment in this repository are STRICT.

======================================================================
3. DISTINCT LIFECYCLES
======================================================================

Track project, logical session, objective, Work run, and iteration separately. A logical session ends only when the user explicitly says so. Objective completion never silently ends the logical session or project. Preserve verified results and exact continuation at every boundary.

======================================================================
4. CAPABILITY-AWARE OPERATION
======================================================================

Assume only capabilities verified in the current run. Recheck the specific GitHub, execution, browser, file, automation, or deployment capability when it becomes relevant or fails unexpectedly. A missing capability must be demonstrated before it is recorded under F8/F9.

If direct action is unavailable, complete unblocked work, prepare useful patches or handoffs, label them accurately, preserve the continuation point, and never present simulation as real execution.

======================================================================
5. DURABLE INSTALLATION AND SOURCE OF TRUTH
======================================================================

- Layer 1 is AGENTS.md. Layer 2 is START_HERE.md, STATE.yaml, and Section 0. Layer 3 is the rest of this protocol and module files.
- STATE.yaml is the sole canonical active-state authority. PROJECT_MEMORY.md is retained product history.
- Create optional requirements, work graph, capabilities, policy, ledger, schema, evidence, recipe, or archive files only when they materially improve reliability.
- The installation is idempotent: re-receiving the protocol must not reset valid state or duplicate authority.

======================================================================
6. BOOT, RESUME, AND RECONCILIATION
======================================================================

At each run start, perform F1, inspect the actual files/repository/runtime/remote/deployment state needed by the next action, reconcile material drift, and resume the exact recorded next action. Do not reread all archives or modules. Broaden the audit only for migration, corruption, unexplained change, major release, serious regression, or insufficient state.

======================================================================
7. REQUIREMENTS, PLANNING, AND NEXT WORK
======================================================================

Plan only to useful leaf depth. Preserve user requirements and recalculate only affected work when they change.

Priority: P0 safety/integrity → P1 blocking correctness → P2 critical-path requirement → P3 required foundation/enforcement → P4 quality → P5 exploration.

Within a priority, choose the smallest independently verifiable work with the highest defensible user value, requirement contribution, risk reduction, and reversibility. Parallelize only genuinely independent write scopes with clear integration ownership.

======================================================================
8. ADAPTIVE EXECUTION CONTROLLER
======================================================================

For meaningful work: RECONCILE → SELECT → DEFINE → PREPARE → EXECUTE → VERIFY → REVIEW → REPAIR OR ROLLBACK → CHECKPOINT → DELIVER → CONTINUE.

Verification and checkpoint stages are never empty when their floor triggers fire. Preserve a meaningful checkpoint at verified feature, risk, release, failure, rollback, handoff, or interruption boundaries.

======================================================================
9. ACCEPTANCE, EVIDENCE, REVIEW, AND COMPLETION
======================================================================

Translate vague quality goals into observable behavior or explicit review standards where useful. Run only relevant quality gates, but execute all gates selected as mandatory.

Review independence levels:

- A: separate/source-blind reviewer of runnable result.
- B: fresh source-restricted context.
- C: same agent, separate deliberate falsification pass.
- D: prepared but not executed; never sufficient for F5.

Use actual user-surface interaction when available. An objective is complete only after acceptance evidence mapping, F5, applicable integration, no blocking findings, current durable state, and F6 for delivery.

======================================================================
10. CONDITIONAL MODULES
======================================================================

Module files are stored separately and inactive by default. Activate and load only when the actual trigger is satisfied and expected value exceeds cost. Storage during migration is not activation. Module optionality never reduces Section 0.

======================================================================
11. LOCAL-FIRST PRODUCT AND DEPENDENCIES
======================================================================

Do not add external AI APIs, paid inference, hosted agents, or third-party cloud dependencies without explicit authorization. Prefer existing browser capabilities, deterministic bundled code, compatible open source, and local algorithms. Verify source, license, compatibility, maintenance, security, runtime cost, and replacement risk for dependencies or assets.

======================================================================
12. CONTROLLED CHANGE, TESTING, AND RECOVERY
======================================================================

Prefer small reviewable changes and identify affected interfaces, invariants, failure behavior, compatibility, tests, and rollback before risky replacement. Use deterministic isolated tests where practical. Preserve useful failure evidence, restore a safe state, challenge repeated false assumptions, and choose a materially different strategy rather than blindly retrying.

======================================================================
13. QUESTIONS, EFFICIENCY, AND REPORTING
======================================================================

Ask only for a materially blocking, irreversible, paid, credentialed, private, legal, or unauthorized decision. Resolve routine reversible choices from requirements, conventions, verified facts, tests, and bounded experiments. Give concise progress updates and always perform F2 plus the Section 0.3 floor line when the run touched the project.

======================================================================
14. REMOTE DELIVERY AND PUBLICATION
======================================================================

Project policy:

- remote_delivery: standing_authorized
- public_release: authorized_when_required_by_active_objective
- routine_connected_credentials: authorized_without_secret_disclosure
- paid_actions: prohibited
- repository_visibility_change: prohibited
- destructive_external_actions: prohibited
- security_control_bypass: prohibited
- private_information_exposure: prohibited

Standing authorization covers task branches, commits, pushes, PRs, checks, permitted reviews, merges, established releases/deployments, publication, and public verification for this repository and its configured Pages target. It persists until explicitly changed, subject to actual permissions, platform protections, mandatory gates, and Section 0.4.

Before delivery inspect relevant remote revisions, concurrent changes, PRs, checks, protections, deployment mechanism, release contents, and recovery. Use the established branch/PR workflow, repair failing checks, perform F5, merge only passing task-scoped work, and perform F6. Do not stop at a local patch or open PR when authorized delivery is required and safe.

Never force-push protected history, bypass protection or checks, disable/narrow an F9 gate, falsify results, expose secrets, change visibility, purchase services, transfer ownership, delete repositories/data, disable security controls, or accept legal terms without the separate authorization required by the user.

======================================================================
15. MIGRATION AND RESUMPTION
======================================================================

The Version 2.2 migration preserves the exact pre-migration objective, verified product state, product history, tests, delivery authorization, and public deployment. The migration is complete only after canonical files, loader, inactive modules, floor enforcement state, negative gate observations, fresh-run resumption, rollback path, remote integration, and applicable public revision verification match reality.

After migration, resume the visual-readability-richness objective recorded in STATE.yaml without restarting or inventing product scope.

======================================================================
APPENDIX STORAGE
======================================================================

Appendix M content is stored one module per file under AI_DEVELOPMENT/MODULES/. Those files are Layer 3 and inactive unless STATE.yaml explicitly records activation.
