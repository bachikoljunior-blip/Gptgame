# ECHO//SEVEN — Product History (Legacy Continuity Record)

> Active continuation authority moved to `AI_DEVELOPMENT/STATE.yaml` under Adaptive 2.2. This file remains a verified product-history and design-evidence reference; do not use its transient “next task” fields over newer canonical state.

Last updated: 2026-08-01 (Asia/Tokyo)
Session status: active; do not archive or finalize until the user explicitly ends the session.

## Project objective

Create the most compelling realistically achievable mobile-first game for the public GitHub repository bachikoljunior-blip/Gptgame, playable from its GitHub Pages URL. The game must be immediately understandable, replayable, polished, offline-capable after load, and dependable in mobile browsers. File layout is an implementation decision rather than a user constraint; the current single-file runtime is retained because it reduces deployment and loading failure modes.

## Current state

- Target repository resolved: bachikoljunior-blip/Gptgame (public, default branch main, initially empty, push/admin access available through the connected GitHub integration).
- Game direction selected: `ECHO//SEVEN`, a portrait 3D action roguelite built around seven 15-second time loops.
- Each loop records the current player's movement, aim direction, manual shots, and DASH events. Earlier recordings replay as allied echoes, turning route and firing plans into the primary strategy.
- Selected visual direction: midnight navy, icy white, acid-lime player/action highlights, coral danger indicators.
- Current source and release candidate is build `2026.08.01-k`, implemented in repository-root index.html.
- The arena is true perspective 3D: custom WebGL 2 and WebGL 1 shaders, depth-tested lit meshes, fog, glow passes, 3D actors/enemies/core/boss/projectiles, perimeter walls, and a player-anchored first-person camera. Canvas 2D remains a deterministic failure fallback and HUD/input layer.
- Implemented: dual-zone mobile movement/look controls, two-thumb FIRE/DASH drag aiming, viewport-normalized look sensitivity, responsive curved movement input, explicit FIRE and DASH actions, a high-contrast target-responsive crosshair, labeled YOU/CORE/time/ECHO HUD, three-phase title briefing, layered panel treatment, richer 3D light gates/lane markers/beacons, enriched Canvas fallback, exact 900-tick loops, aim-preserving echoes, five ordinary enemy types, seeded wave schedules, three upgrade drafts, final boss and interrupt mechanic, score/best results, settings, procedural audio, haptics, reduced motion, pause/resume, versioned save parsing, safe same-tab run restoration, adaptive effects, guarded debug checkpoints, WebGL context recovery, static VBO caching, dynamic buffer reuse, and combined framebuffer diagnostics.
- Build `2026.08.01-c` received an independent 10/10 re-audit across all seven axes with no reproducible Critical/High/Medium issue.
- GitHub Pages release URL: https://bachikoljunior-blip.github.io/Gptgame/. The latest successful main-branch Pages workflow is the canonical release artifact.
- A two-stage primary phone-browser gate is prepared on `agent/iphone-se3-automation`: Playwright WebKit at iPhone SE (3rd generation) portrait `375×667 / DPR 2`, followed on `main` by Appium/XCUITest driving Mobile Safari on the matching iOS Simulator. Pages deployment depends on both gates and preserves screenshots, video, trace, logs, and JSON reports. It has not been merged or executed on the target WebKit/iOS runners yet.

## Completed work

- Raised menu phase labels, phase descriptions, stat labels, result verdicts, diagnostic labels/values, and copy status to a 12 px minimum. Exact 320×568 review caught and repaired a resulting `REPEAT ×7` truncation by tightening only the mission-value tracking.
- Added dedicated procedural boss-charge cues: a rising charge warning, a brittle charge-break signature, and a low core-impact signature. Query-gated checkpoints and cue counters verify each real event route without requiring an AudioContext in the deterministic harness.
- Added an explicit record-to-replay handoff: each ordinary loop boundary names the sealed loop, newly armed echo, next loop, and active replay-path count so the time-loop cause and effect is visible without relying on the echo counter alone.
- Repaired a real-browser title-screen defect found after build `2026.08.01-f`: the 64px viewport-based title exceeded its 414px content box by 97px and created horizontal overlay scrolling. Build `2026.08.01-g` caps the title against the phone-width range, removes the conflicting small-height override, and keeps overlay scrolling vertical-only.

- Compared three independently generated visual directions.
- Selected the most legible and mobile-appropriate direction.
- Defined initial product gates: explain the core mechanic within 30 seconds; produce meaningful escalation within one run; remain readable without sound; prevent accidental browser gestures; and retain strategic variation between runs.
- Implemented the canonical game in one self-contained HTML file with no external runtime assets.
- Replaced the former flat arena renderer with a dependency-free WebGL renderer while preserving the deterministic simulation and Canvas fallback.
- Added Node-based static/runtime checks that execute the inline game in a controlled browser-API harness.
- Passed 46 automated tests covering self-containment and syntax, content-addressed artifact integrity and tamper rejection, visual hierarchy across menu/HUD/WebGL/Canvas, two-thumb move/FIRE/aim operation, viewport-normalized look sensitivity, short-drag movement response, manual-fire inactivity and cadence, recorded-aim replay, four-direction camera/crosshair/projectile alignment, core collision, production pointer-zone handling and fast-tap buffering, adaptive-quality input preservation, left-handed instructional copy, rule-version save migration, safe same-tab combat/late-run/upgrade restoration, malformed-checkpoint rejection, deliberate-run discard, fixed-step rules, WebGL 1/2 shader paths, finite 3D geometry, static/dynamic buffer reuse, render-failure fallback, context loss-resize-restoration, a Canvas/WebGL 6,300-tick golden trace, loop recording, echo creation, boss spawn/clutch/tie behavior, seeded determinism, telegraph accuracy, rotation pause, keyboard activation, mobile HUD layout, simultaneous move/FIRE/DASH, idle rendering, stress entities, framebuffer accounting, save sanitization, and upgrade validation.
- Fixed review findings: deterministic enemy sequencing on replay, boss telegraph/spawn alignment, loss priority on simultaneous core/boss destruction, removal of dead bosses before result rendering, DASHBURST split-child handling, unknown upgrade rejection, rotation pause, pause-menu keyboard behavior, HUD/control overlap, DASH contrast, phone-size HUD typography, and inactive-screen render throttling.
- Fixed 3D review findings: camera clipping at legal movement corners, per-frame static geometry uploads, per-frame TypedArray/GPU buffer allocation, uncaught WebGL render failures, context-loss resize loss, ineffective player-body invulnerability flicker, and incomplete dual-canvas/depth/MSAA resource accounting.
- Replaced follow-camera auto-fire play with first-person yaw aiming and input-gated firing. Echo tapes now store normalized facing components and only reproduce shots that the player actually fired.
- Fixed first-person audit findings: solid-core camera exclusion, a shared eye/crosshair/muzzle/projectile aim plane, exact east/west facing, input-preserving adaptive-quality resize, rule-version tutorial migration, mirrored left-handed copy/ARIA, and dead-state look-input disposal.
- Replaced the former diagnostic-only session checkpoint with a bounded, versioned gameplay checkpoint. Same-tab reload restores the exact player, enemies, projectiles, echo tapes, RNG state, upgrade offers, and diagnostics in an explicit paused state while releasing all touch/key actions. Malformed, incompatible, finished, or deliberately abandoned runs are discarded.
- Removed the three-finger dependency from ordinary mobile combat: FIRE and DASH now double as horizontal look surfaces while held, so one thumb can aim and fire while the other moves. Look sensitivity scales with viewport width, fast pointer samples are buffered without large jumps, and the floating movement pad reaches useful speed with a shorter drag.
- Published index.html, tests, package metadata, README, Pages workflow, and this project memory to main. Initial release workflow head: `29e0ab03a41c9f9f40115fdc2eb2accc2ebb8984`; workflow path-filter refinement: `57772a37dc700939b9aabfdd9f584886eee95202`.

## Rejected or retained alternatives

- Cyan/magenta neon: retained as a reference for kinetic combat feedback, rejected as the main system because glow and color density reduce small-screen readability.
- Amber instrument panel: retained as a reference for tactile time-loop transitions, rejected as the main system because the muted palette and ornamental framing consume too much portrait space.
- External raster assets and remote dependencies: rejected for the first implementation. Canvas primitives and procedural audio improve portability, loading reliability, and iteration speed.

## Design decisions and reasoning

- One self-contained HTML is the canonical game implementation. GitHub Pages serves it as root index.html.
- Portrait logical playfield targets approximately 480×800 and scales to the viewport. This supports phones while remaining playable on desktop.
- Primary touch control uses one drag zone for view-relative movement and the opposite drag zone for yaw aiming, plus independent FIRE and DASH buttons. Both action buttons also accept horizontal aim drag while held, keeping move+aim+fire practical with two thumbs. FIRE supports tap buffering and hold-to-repeat but never shoots without explicit input.
- Seven fixed-length loops give the title mechanical meaning and provide a readable run structure.
- Geometric 3D silhouettes distinguish roles independently of color; emissive color reinforces rather than replaces shape.
- Local-only save data stores settings, best results, aggregate run telemetry, and schema version. No network data collection.
- Seeded random generation will make runs varied while keeping failures reproducible.

## Architecture

- Repository index.html: canonical self-contained game (HTML, CSS, JavaScript, custom WebGL 1/2 renderer, Canvas HUD/fallback, procedural WebAudio).
- Repository .github/workflows/pages.yml: GitHub Pages deployment from main. It runs deterministic tests, the iPhone SE 3 WebKit gate, and the iPhone SE 3 iOS Simulator Mobile Safari gate before packaging only the tested index.html and deploying through official Pages actions.
- Repository tests/game-core.test.mjs: Node built-in test runner for source validity and guarded runtime checks.
- Repository tools/test-iphone-webkit.mjs and tools/test-ios-safari.mjs: target-size browser interaction, layout, reload, stress, screenshot, and error gates.
- Repository package.json: deterministic tests plus pinned Playwright screenshot-test dependencies.
- Repository PROJECT_MEMORY.md: this continuous project record.
- Runtime layers inside the single HTML: input, fixed-step simulation, seeded RNG, entities, combat, loop recorder/replay, progression, UI state machine, WebGL scene renderer, Canvas HUD/fallback, audio/feedback, save/telemetry, and query-gated debug checkpoints.

## Dependencies

- Runtime game: browser platform APIs only; no external libraries or network assets.
- Deployment: GitHub Actions official Pages actions, gated by WebKit and iOS Simulator Safari.
- Tests: Node built-in test runner plus pinned Playwright, pixelmatch, and pngjs development dependencies; the shipped HTML remains dependency-free.

## Acceptance criteria

- Opens and plays from a single local HTML file without a network connection.
- Primary loop, echo replay, upgrades, boss, win state, loss state, restart, pause, and local best result all function.
- Touch and pointer input do not scroll, zoom, select text, or remain stuck after interruption.
- First-person movement, look, FIRE, and DASH can be used concurrently with separate touches; left-handed mode mirrors the movement/look zones and action rail.
- Move+aim+FIRE can be performed with two thumbs, without requiring a third simultaneous touch.
- Keyboard fallback supports desktop testing.
- All important threats are distinguishable by shape and telegraph, not color alone.
- Tutorial can be completed without reading long instructions.
- A run contains seven loops and meaningful upgrade decisions, with a plausible total duration of 3–6 minutes including menus.
- Save parsing survives missing, old, or corrupt data.
- Game pauses on visibility loss and resumes only through an explicit player action.
- A same-tab reload restores a valid active run in an explicit paused state without retaining movement, look, FIRE, DASH, or key input.
- WebGL loss, restoration, resize during loss, and render allocation failure never stop the fixed-step game loop; Canvas fallback remains playable.
- Production build, deterministic tests, iPhone SE 3 WebKit interaction/visual checks, iOS Simulator Mobile Safari interaction checks, public revision verification, and applicable regression review pass before publication.
- Target rendering: 60 FPS on capable phones; stable 30 FPS minimum under the defined entity/particle budgets; DPR is capped and visual effects degrade safely.
- Automated runner frame gaps are comparative hang/regression evidence only and are never reported as physical-phone FPS.

## Known bugs

- No confirmed release-blocking game bug remains.
- No confirmed release-blocking physical-device-only defect is known. Physical GPU speed, thermal throttling, memory-pressure reloads, hand reach, haptics, speakers, and audio latency remain unmeasured; the user replaced the routine physical-device gate with WebKit plus iOS Simulator Mobile Safari automation, so these facts remain explicit but non-blocking.

## Technical debt

- Exact balance and touch comfort may still benefit from optional physical-device playtest tuning; they are not routine publication gates.
- The 6,300-tick golden suite currently uses a deterministic no-enemy route to isolate renderer/simulation equivalence; live-wave balance remains a future playtest question rather than an automated performance claim.
- Run restoration is intentionally tab-scoped. It does not transfer a live run between tabs, browsers, or devices, and an abrupt process kill that emits no lifecycle event may fall back to the last loop-boundary checkpoint.
- FIRE and DASH occupy a lower-corner action rail. Their minimum targets are 88px and 64px, remain above the 44px touch baseline, accept aim drag to reduce finger changes, and are checked automatically for layout and trusted simulator touch; actual hand reach remains optional physical-only evidence.

## Successful patterns

- Select visual direction using direct mobile-legibility criteria instead of spectacle alone.
- Keep the standalone artifact and hosted experience on one canonical implementation.
- Use deterministic query-gated checkpoints for terminal-tick, boss, lifecycle, save, and stress-state regression tests.
- Separate enemy behavior sequencing from shared entity IDs so projectile counts cannot perturb seeded AI choices.

## Failed patterns

- Direct cloud-browser access to the local preview URL was refused by the browser environment. Do not retry that route; verify the deployed public URL instead.

## Discovered constraints

- Mobile browser audio requires a user gesture.
- Canvas must account for safe areas, dynamic viewport resizing, device pixel ratio, pointer cancellation, visibility changes, and reduced motion.
- Gameplay must remain usable without external files or services.

## Reusable utilities planned

- Seeded pseudo-random generator.
- Object pools for bullets and particles.
- Canvas scaling and safe-area mapper.
- Versioned, corruption-tolerant local save loader.
- Fixed-step simulation accumulator.
- Query-gated debug checkpoint API.

## Testing history

- 2026-07-31: inline JavaScript syntax check passed (1 script, no parse errors).
- 2026-07-31: GAME_HTML=public/echo-seven.html node --test tests/game-core.test.mjs passed 7/7 tests in approximately 0.13 seconds.
- 2026-07-31: three independent reviews found 0 Critical issues and reported 13 High candidates including duplicates; after deduplication and verification, all confirmed release blockers were fixed.
- 2026-07-31: expanded regression gate passed 16/16 tests in approximately 0.31 seconds on Node 22-compatible APIs.
- 2026-07-31: source scan found no external URL, fetch/XHR/WebSocket/sendBeacon, Cookie access, TODO, or FIXME marker in the game HTML.
- 2026-08-01: regression gate passed 27/27 tests. The WebGL and Canvas paths produced the same seed-dependent deterministic trace over all 6,300 play ticks.
- 2026-08-01: real Chromium WebGL 2 initialized `OpenGL ES 3.0 Chromium` with GLSL ES 3.00, compiled and linked the production shaders, rendered the 8,699-triangle stress checkpoint, and returned `gl.getError() === 0` with no page/console errors.
- 2026-08-01: 375×667 DPR-2 touch emulation confirmed simultaneous drag+DASH through the production pointer handlers. All four legal player corners passed the shared production-camera projection test.
- 2026-08-01: first-person/manual-attack regression gate passed 31/31 tests. It proves no-input/no-shot behavior, buffered and held FIRE cadence, stored aim components, echo shot direction, production pointer-zone separation, player-anchored camera projection, and simultaneous move+FIRE+DASH metrics.
- 2026-08-01: build `2026.08.01-c` regression gate passed 36/36 tests after the strict audit. Added coverage proves core exclusion, one aim plane at near/mid/far distances, all four cardinal camera/projectile directions, adaptive-quality touch retention, rule-version tutorial migration, left-handed copy/ARIA mirroring, and dead-state look-input disposal.
- 2026-08-01: independent re-audit awarded build `2026.08.01-c` 10/10 on all seven axes with zero reproducible Critical/High/Medium issue. Real Chromium at 375×667/DPR 2 passed WebGL 2 and forced WebGL 1 shader compilation, 8,744-triangle stress rendering, simultaneous move+look+FIRE+DASH, solid-core clearance, real context loss/fallback/resize/restoration, `gl.getError() === 0`, and zero page/console errors.
- 2026-08-01: build `2026.08.01-d` regression gate passed 41/41 tests. Added coverage proves exact same-tab combat restoration with cleared input and a matching 90-tick continuation, bounded six-echo late-run restoration with retained diagnostic samples, stable restoration of the same three upgrade offers, malformed-checkpoint rejection, and deliberate checkpoint deletion on return to title. Full 6,300-tick Canvas/WebGL determinism and all prior renderer/input/save gates remained green.
- 2026-08-01: build `2026.08.01-e` regression gate passed 44/44 tests. Added coverage proves two-thumb movement plus FIRE-drag aiming, equivalent ten-percent swipe rotation at 320px and 480px widths, and useful movement response from a 15px thumb drag. Full 6,300-tick Canvas/WebGL determinism and all prior renderer/input/save/checkpoint gates remained green.
- 2026-08-01: build `2026.08.01-f` regression gate passed 45/45 tests. The visual pass adds a readable three-phase title briefing, labeled combat HUD, stronger crosshair, WebGL light gates/lane markers/beacons, and matching Canvas fallback structure. The stress scene remained within budget at 9,344 triangles; the 6,300-tick golden trace and all interaction/save gates stayed green.
- 2026-07-31: published Pages URL loaded `ECHO//SEVEN` build `2026.07.31-c` with no external src/href elements.
- 2026-07-31: public-page interaction passed title → first-run tutorial → countdown/play → DASH → pause → Enter on restart. DASH entered its 3-second cooldown, pause froze the state, and keyboard restart returned to LOOP 01 countdown.
- 2026-07-31: no warning/error entry originated from the GitHub Pages game origin during the live interaction. Browser-extension diagnostics were excluded as unrelated environment noise.

## Performance history

- Current first-person 3D candidate size is 217,050 bytes uncompressed and 50,792 bytes gzip-compressed.
- Node runtime-harness checks complete quickly, but this does not measure real Canvas/GPU performance.
- Runtime caps: 80 enemies, 96 allied projectiles, 64 hostile projectiles, 180 particles, and 12,000 stress-scene triangles; each Canvas backing store is capped to 1.5 million pixels.
- Adaptive quality reduces mesh/effect density and DPR after sustained slow-frame windows. Static arena geometry is cached per quality tier; dynamic CPU arrays and GPU capacity are reused.
- The device report now counts both Canvas backing stores and estimates color/depth/MSAA framebuffer memory. In touch-enabled headless Chromium the stress scene recorded render p95 9.6 ms, zero GL errors, and zero dropped-step windows; headless rAF cadence is not treated as physical-phone FPS evidence.

## Highest-impact next task

Run the prepared WebKit workflow, promote its first WebKit-generated visual baseline, then execute the iPhone SE 3 iOS Simulator Mobile Safari gate. Keep the branch unmerged until those target-runner reports are inspected.

## Future tasks

1. Promote the WebKit-generated `375×667 / DPR 2` baseline and make the fast gate green.
2. Inspect the iOS Simulator Safari video/report for simultaneous move+look+FIRE+DASH, pause/resume, reload restoration, stress state, layout, and runtime errors.
3. Tune wave/boss balance or physical-only behavior only if later optional device evidence identifies a concrete defect.

## Verified-round history moved out of STATE.yaml — 2026-08-02

The active record now carries only what the next run needs. These findings and migration
validations were verified when written and are preserved here verbatim.

### Round and review findings

~~~yaml
  review_findings:
    - "PR #28 Quality run 30699678924 passed. Initial target WebKit run 30699678903 reached the LOOP 02 gameplay capture at 375×667/DPR 2 with zero runtime/network errors; it rejected the missing baseline and Linux WebKit's maxTouchPoints=0 diagnostic. The Playwright profile itself hasTouch/isMobile, coarse pointer is true, and real tap() interactions succeeded, so the harness now evaluates that observable emulation contract without spoofing navigator state. The reviewed 750×1334 baseline SHA-256 is 00ee1ebe02a4897186c696864cbe0504ff8cdda7201b6319ad37f3bbb21e990a."
    - "Tooling-only change, no product change: the shared kit v0.2.0 was vendored into .kit/ with its nine skills, and scripts/verify-continuity.mjs was rewritten over .kit/lib/state/ primitives instead of carrying its own copy of assertions that existed in four repositories. REBUILT on this main rather than merged onto it, and re-measured here: the earlier 19/19 was taken against the pre-0aa981d main and is void. scripts/equivalence-continuity.mjs now runs 33 deliberate mutations of PROTOCOL.md, STATE.yaml, REFERENCE_BENCHMARKS.md, AGENTS.md and START_HERE.md through both gates as subprocesses (main's copy has no CLI guard and runs on import); 33/33 reach the same verdict and 31 of the 32 breakages fire, the one that does not being the objective-id change main deliberately made legal. --selftest reports 15/15 including a control that must not fire. index.html and the game itself were not touched; the suite is 51/51."
    - "Two defects found while rebuilding, both in assertions main added or kept, neither caused by the kit swap. 0aa981d loosened the objective-id assertion to /objective:[\\s\\S]*?id: \"[^\"]+\"/, which matches any quoted id later in the file — deleting the objective id outright still satisfied it. The same shape let a bare 'active: true' check pass against a different key's value. Both are now anchored to their own block; main's intent (do not pin the id to a value) is preserved."
    - "Checkpoint PR #26 Quality 30698167084 and checkpoint main Quality/Pages/legacy runs 30698192000/30698191992/30698191735 passed; the cache-busted public artifact remained 69f72f7b at 51/51."
    - "PR #25 runs 30697849726/30697849727 and main runs 30697884517/30697884506/30697884185 passed; independent public retrieval verified artifact 69f72f7b at 51/51. Public cloud Chrome returned build k/artifact 69f72f7b, computed mission index/description, stat label, verdict, diagnostic label/value, and copy status at exactly 12px, measured root 1363/1363 plus menu 560/560 without horizontal overflow, and moved SIGNAL START into the correct LIVE RECORDING countdown. Its background animation clock remained throttled, so the later playing/FIRE/DASH state was not claimed."
    - "Build k raises phase indices/descriptions, stat labels, result verdict, diagnostics labels/values, and copy status to 12px. Fourteen exact 320×568/375×667 captures cover collapsed menu/result, expanded diagnostics top, and scrolled action bottom across WebGL, Canvas, and reduced motion where applicable; metrics found no sub-12px visible text, document/shell horizontal overflow, undersized/overlapping buttons, page/renderer errors, or invariant failures. Initial review caught REPEAT ×7 truncation at 320px and the final 0.015em value tracking restores it."
    - "M4_INDEPENDENT_USER_SURFACE_TESTING was activated for the interactive Round 3 UI change. Exact target menu/result, expanded-diagnostics top, and scrolled action-bottom cases were exercised; its stop condition was met, so no module remains active at this checkpoint."
    - "Public cloud Chrome returned build-j artifact afad352f, moved from SIGNAL START to playing mode with FIRE and DASH visible, and logged no game-origin errors; only unrelated Chrome-extension errors were observed."
    - "PR #23 runs 30697163067/30697163083 and main runs 30697200815/30697200836/30697200464 passed; independent public retrieval verified artifact afad352f at 50/50. The three cue routes, distinct recipes, 10/14 general/critical voice limits, rollback applicability, and missing-routing negative all remain enforced."
    - "Build j routes boss charge start, successful break, and failed charge/core impact through bossCharge, bossBreak, and bossImpact respectively. Source/candidate passed 50/50; the public build-i rollback passed 49 applicable plus one build-j-only skip; a valid-hash build-j artifact with the three route calls removed failed only the new assertion. Procedural signatures use separate pitch contours and reserve voices 11–14 for critical cues, but physical audibility is not claimed."
    - "Prepared target-browser gates cover first-run taps, two-thumb move/FIRE, look, DASH, pause/resume, same-tab reload restoration, stress invariants, layout, screenshots, and runtime errors; the iOS gate uses W3C trusted touch actions rather than JavaScript event synthesis."
    - "The existing content-addressed Pages candidate, public revision check, and automatic restoration remain in place; deployment now depends on successful iOS Safari after successful deterministic and WebKit gates."
    - "PR #21 runs 30696277713/30696277719 and main runs 30696328392/30696328359/30696328033 passed; independent public retrieval verified artifact d9e7db13 at 49/49. Cloud Chrome returned the same artifact, started from SIGNAL START into playing mode, and logged no game-origin errors; its background clock was throttled and did not naturally advance the 15-second transition."
    - "Build i changes the loop boundary from a generic RECORDED card to a three-level handoff naming LOOP 01 RECORDED, ECHO 01 ARMED / NEXT LOOP 02, then ECHO REPLAY with the active path count. Source passes 49/49; exact 320×568/375×667 recorded/replay captures show no page, renderer, shell-overflow, control-overlap, undersized-button, narrow-text, or invariant failures. Visual review shortened the entrance from 520 ms to 260 ms and strengthened contrast; a valid-hash old-handoff artifact fails the new test."
    - "PR #19 runs 30695240153/30695240154 and main runs 30695280123/30695280118/30695279819 passed; independent public retrieval verified artifact 93298f8c at 48/48, and live public Chrome confirmed the repaired heading focus, top scroll position, and non-overflowing overlay."
    - "Exact 320×568 build-g reproduction showed tutorial autofocus landing at the scroll bottom and hiding TACTICAL BRIEF, the title, and step 1. Build h resets scrollTop before and after focus and requests preventScroll; repaired top and independently scrolled bottom captures verify the full reading path at 320×568 and 375×667."
    - "The build-h matrix contains 40 exact-size captures across WebGL, Canvas, and reduced motion with zero document/shell horizontal overflow, undersized buttons, button overlaps, page errors, renderer errors, or invariant failures; the targeted crosshair state was present at both sizes."
    - "A Level C negative probe mechanically restored the old focus behavior in an otherwise build-h artifact and the dedicated overlay reading-order test failed, while the repaired source and candidate passed 48/48."
    - "Official reference screenshots were applied only as criteria: ECHO keeps a much smaller touch-action set than the denser Call of Duty: Mobile/Gunfire Mobile HUDs and retains its own navy/coral/lime geometric separation rather than copying SUPERHOT; still frames cannot verify Lemnis Gate-derived echo causality."
    - "PR #17 runs 30693098586/30693098590 and main runs 30693147860/30693147854/30693147533 verified the monotonic rollback applicability repair; the main Pages path now executes current build g at 47/47 before publishing."
    - "Main Pages run 30692907767 passed continuity, floor, source 47/47, and rollback assembly, then failed its rollback execution: declared build g made verifyingPreVisualRollback true because the predicate was declaredBuildId !== build-f. The failing HUD assertion required the pre-f Canvas font even though g correctly contains the f-and-later HUD."
    - "The focused repair uses lexically ordered fixed-format build IDs for f-and-later and g-and-later applicability. Local source, rollback assembled from f44c273, and independently fetched public g each passed 47/47, directly falsifying the failed path."
    - "Post-delivery cloud Chrome found overlay client/scroll width 560/560 and displayed the complete title inside the panel. The h1 scroll box retained a 2 px decorative pseudo-element extent, but the visible title and overlay did not overflow; this did not falsify the acceptance criterion."
    - "Cloud Chrome measured the public build-f menu title at client/scroll width 414/511 px and its overlay at 560/584 px; the visible title crossed the panel edge. Build g caps title size at 50 px, scales it from 28 px at narrow widths, tightens spacing, removes the 36 px override, and prevents horizontal overlay scrolling."
    - "Level C width analysis projects positive title-content margins at 320, 375, 480, and the observed 560 px shell; the negative probe deliberately restored build-f CSS and the criterion rejected it. Exact 320×568/375×667 captures are now complete; 480-width and physical-phone review remain."
    - "Post-delivery reconciliation found that the state-only merge 4a61bbe still triggered GitHub's legacy Pages publisher and temporarily replaced the revision-stamped artifact with raw index.html; rerunning custom deployment job 91333277431 restored 045d253 and the public 45/45 result."
    - "Level C run-history comparison found that merely triggering the custom deploy on every main push was insufficient because the legacy publisher has sometimes completed after the custom workflow; the deploy now discovers and waits for that same-SHA legacy run before publishing."
    - "The content-addressed identifier complements PR #10 by making raw and tested deployments carry the same verifiable HTML identity; no comparison may rely only on workflow ordering."
    - "Combined execution found that treating every ROLLBACK_ARTIFACT as pre-visual weakened current build-f criteria and failed the HUD assertion; the retained build-aware rule applies all current criteria to build f and only skips the feature-specific visual check for older build e."
~~~

### 2.2 migration validation

~~~yaml
migration:
  source: "Legacy AGENTS.md delivery policy plus PROJECT_MEMORY.md product/continuity record"
  status: "complete_verified"
  pre_migration_checkpoint: "AI_DEVELOPMENT/ARCHIVE/PRE_MIGRATION_2026-08-01.yaml"
  legacy_authority_scope: "Legacy records remain evidence; conflicting operating mechanics are superseded by the validated Adaptive 2.2 loader now on main."
  modules_installed: "complete_verified: nine separate Layer 3 files pass shape and non-activation checks"
  modules_activated: []
  review_findings:
    - "Level C found that the deploy job lacked checkout/setup for its verifier; repaired and syntax/execution checked."
    - "Level C found that an unattended Pages failure had no automatic restoration; added a separate verified rollback artifact, failure-triggered redeploy, and post-rollback runtime check."
    - "Remote PR run 30685270293 falsified the rollback-source assumption under actions/checkout depth 1; repaired the test job to fetch full history before rollback assembly."
    - "Main run 30685438086 deliberately failed F6, automatically redeployed e7199d1, and passed both its restoration harness and an independent public 44/44 recheck."
    - "Later dynamic Pages run 30685827875 exposed that the commit-marker mechanism was not durable against the repository's second deployment path; content-addressed repair is in progress."
  validation:
    canonical_files: "complete_verified"
    loader_discovery: "complete_verified"
    fresh_run_resumption: "complete_verified"
    rollback_recovery: "complete_verified: legacy run 30685438086 and content-addressed run 30687824398"
    normal_delivery: "complete_verified: build-k product run 30697884506, checkpoint run 30698191992, independent public artifact 69f72f7b at 51/51, and live computed-type/start-to-countdown checks"
    product_regression: "complete_verified: build-k source/candidate/PR/main/public 51/51, build-j rollback 50 applicable + 1 not_applicable, valid-hash old-type negative rejected, and 14 exact target captures reviewed"
    non_conflicting_instructions_preserved: "complete_verified"
    modules_inactive: "complete_verified: M4 was activated for the Round 3 user-surface pass, reached its stop condition after the relevant exact-target cases were exercised, and returned inactive; all nine module files are currently inactive"
    accidental_publication_or_regression: "complete_verified: build k intentionally replaced build j after PR/main/public checks; only menu/result type sizing and mission-value tracking changed while the full gameplay suite passed"

~~~
