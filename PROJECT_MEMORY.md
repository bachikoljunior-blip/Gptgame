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
- Current source and release candidate is build `2026.08.01-g`, implemented in repository-root index.html.
- The arena is true perspective 3D: custom WebGL 2 and WebGL 1 shaders, depth-tested lit meshes, fog, glow passes, 3D actors/enemies/core/boss/projectiles, perimeter walls, and a player-anchored first-person camera. Canvas 2D remains a deterministic failure fallback and HUD/input layer.
- Implemented: dual-zone mobile movement/look controls, two-thumb FIRE/DASH drag aiming, viewport-normalized look sensitivity, responsive curved movement input, explicit FIRE and DASH actions, a high-contrast target-responsive crosshair, labeled YOU/CORE/time/ECHO HUD, three-phase title briefing, layered panel treatment, richer 3D light gates/lane markers/beacons, enriched Canvas fallback, exact 900-tick loops, aim-preserving echoes, five ordinary enemy types, seeded wave schedules, three upgrade drafts, final boss and interrupt mechanic, score/best results, settings, procedural audio, haptics, reduced motion, pause/resume, versioned save parsing, safe same-tab run restoration, adaptive effects, guarded debug checkpoints, WebGL context recovery, static VBO caching, dynamic buffer reuse, and combined framebuffer diagnostics.
- Build `2026.08.01-c` received an independent 10/10 re-audit across all seven axes with no reproducible Critical/High/Medium issue.
- GitHub Pages release URL: https://bachikoljunior-blip.github.io/Gptgame/. The latest successful main-branch Pages workflow is the canonical release artifact.

## Completed work

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
- Repository .github/workflows/pages.yml: GitHub Pages deployment from main. It runs the full test gate, packages only the tested index.html, and deploys via official Pages actions.
- Repository tests/game-core.test.mjs: Node built-in test runner for source validity and guarded runtime checks.
- Repository package.json: dependency-free test command.
- Repository PROJECT_MEMORY.md: this continuous project record.
- Runtime layers inside the single HTML: input, fixed-step simulation, seeded RNG, entities, combat, loop recorder/replay, progression, UI state machine, WebGL scene renderer, Canvas HUD/fallback, audio/feedback, save/telemetry, and query-gated debug checkpoints.

## Dependencies

- Runtime game: browser platform APIs only; no external libraries or network assets.
- Deployment: GitHub Actions official Pages actions.
- Tests: Node built-in test runner only; no package dependencies.

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
- Production build, automated tests, interactive playtest, regression review, and performance checks pass.
- Target rendering: 60 FPS on capable phones; stable 30 FPS minimum under the defined entity/particle budgets; DPR is capped and visual effects degrade safely.

## Known bugs

- No confirmed release-blocking game bug remains.
- A physical iOS/Android device has not yet been exercised. Build `2026.08.01-c` has 375×667, DPR 2 real-Chromium evidence plus deterministic camera/control tests, but still needs a physical-device visual pass.

## Technical debt

- Exact balance still requires real-device playtest tuning after the first published build.
- The 6,300-tick golden suite currently uses a deterministic no-enemy route to isolate renderer/simulation equivalence; live-wave balance still needs physical-device playtesting.
- Run restoration is intentionally tab-scoped. It does not transfer a live run between tabs, browsers, or devices, and an abrupt process kill that emits no lifecycle event may fall back to the last loop-boundary checkpoint.
- FIRE and DASH occupy a lower-corner action rail. Their minimum targets are 88px and 64px, remain above the 44px touch baseline, accept aim drag to reduce finger changes, and still require a physical-device reachability check.

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

Run the full seven-loop flow on physical iPhone Safari and Android Chrome, then tune balance only from observed device evidence.

## Future tasks

1. Run the full seven-loop flow on iPhone Safari and Android Chrome, including simultaneous move+look+FIRE+DASH, rotation, backgrounding, sound, win, loss, and restart.
2. Record final-boss p95 frame time, peak entities, DPR, and post-run audio voice cleanup on a real phone.
3. Tune wave/boss balance and address any observed device-specific defects in a later iteration.
